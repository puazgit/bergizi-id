'use server'

import { auth } from '@/auth'
import db from '@/lib/db'
import { ServiceResult } from '@/lib/service-result'
import { hasPermission, checkSppgAccess } from '@/lib/permissions'
import { revalidatePath } from 'next/cache'
import { redis } from '@/lib/redis' // Use enterprise Redis client
import { z } from 'zod'
import { MealType } from '@prisma/client'
import { NutritionCalculationService, type IngredientWithInventory } from '@/services/sppg/nutrition-calculation.service'

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

// ============================================================================
// NUTRITION REDUNDANCY FIXED - Nutrition data will be calculated automatically
// from ingredients and stored in MenuNutritionCalculation only
// ============================================================================
const createMenuSchema = z.object({
  programId: z.string().cuid(),
  menuName: z.string().min(3).max(100),
  menuCode: z.string().min(2).max(20),
  description: z.string().optional(),
  mealType: z.nativeEnum(MealType),
  servingSize: z.number().int().min(50).max(1000),
  // Nutrition fields removed - will be calculated from ingredients
  costPerServing: z.number().min(0),
  sellingPrice: z.number().min(0).optional(),
  cookingTime: z.number().int().min(5).max(300).optional(),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']).optional(),
  cookingMethod: z.enum(['STEAM', 'BOIL', 'FRY', 'BAKE', 'GRILL', 'SAUTE']).optional(),
  allergens: z.array(z.string()).default([]),
  isHalal: z.boolean().default(true),
  isVegetarian: z.boolean().default(false),
  ingredients: z.array(z.object({
    ingredientName: z.string().min(2),
    quantity: z.number().min(0.1),
    unit: z.string().min(1),
    costPerUnit: z.number().min(0),
    totalCost: z.number().min(0),
    // Nutrition contribution fields removed - will be calculated automatically
    preparationNotes: z.string().optional(),
    isOptional: z.boolean().default(false),
    inventoryItemId: z.string().optional()
  })).min(1),
  recipeSteps: z.array(z.object({
    stepNumber: z.number().int().min(1),
    instruction: z.string().min(10),
    duration: z.number().int().min(1).optional(),
    temperature: z.number().min(0).optional(),
    equipment: z.string().optional(),
    tips: z.string().optional()
  })).default([])
})

const updateMenuSchema = z.object({
  menuId: z.string().cuid(),
  menuName: z.string().min(3).max(100).optional(),
  description: z.string().optional(),
  servingSize: z.number().int().min(50).max(1000).optional(),
  // Nutrition fields removed - will be calculated from ingredients automatically
  iron: z.number().min(0).optional(),
  costPerServing: z.number().min(0).optional(),
  sellingPrice: z.number().min(0).optional(),
  cookingTime: z.number().int().min(5).max(300).optional(),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']).optional(),
  cookingMethod: z.enum(['STEAM', 'BOIL', 'FRY', 'BAKE', 'GRILL', 'SAUTE']).optional(),
  allergens: z.array(z.string()).optional(),
  isHalal: z.boolean().optional(),
  isVegetarian: z.boolean().optional(),
  isActive: z.boolean().optional()
})

const updateMenuIngredientsSchema = z.object({
  menuId: z.string().cuid(),
  ingredients: z.array(z.object({
    id: z.string().cuid().optional(),
    ingredientName: z.string().min(2),
    quantity: z.number().min(0.1),
    unit: z.string().min(1),
    costPerUnit: z.number().min(0),
    totalCost: z.number().min(0),
    // Nutrition contribution fields removed - will be calculated automatically
    preparationNotes: z.string().optional(),
    isOptional: z.boolean().default(false),
    inventoryItemId: z.string().optional()
  })).min(1)
})

// ============================================================================
// HELPER FUNCTIONS  
// ============================================================================

// Enterprise nutrition analysis utilities
export async function calculateNutritionCompliance(menu: {
  calories: number
  protein: number
  carbohydrates: number
  fat: number
  fiber: number
}, programTarget: {
  calorieTarget?: number | null
  proteinTarget?: number | null
  carbTarget?: number | null
  fatTarget?: number | null
  fiberTarget?: number | null
}) {
  const compliance = {
    calories: programTarget.calorieTarget ? 
      Math.max(0, 100 - Math.abs((menu.calories - programTarget.calorieTarget) / programTarget.calorieTarget * 100)) : 100,
    protein: programTarget.proteinTarget ? 
      Math.max(0, 100 - Math.abs((menu.protein - programTarget.proteinTarget) / programTarget.proteinTarget * 100)) : 100,
    carbohydrates: programTarget.carbTarget ? 
      Math.max(0, 100 - Math.abs((menu.carbohydrates - programTarget.carbTarget) / programTarget.carbTarget * 100)) : 100,
    fat: programTarget.fatTarget ? 
      Math.max(0, 100 - Math.abs((menu.fat - programTarget.fatTarget) / programTarget.fatTarget * 100)) : 100,
    fiber: programTarget.fiberTarget ? 
      Math.max(0, 100 - Math.abs((menu.fiber - programTarget.fiberTarget) / programTarget.fiberTarget * 100)) : 100
  }

  const overallCompliance = (compliance.calories + compliance.protein + compliance.carbohydrates + compliance.fat + compliance.fiber) / 5

  return {
    compliance,
    overallCompliance,
    complianceGrade: overallCompliance >= 90 ? 'A' :
                     overallCompliance >= 80 ? 'B' :
                     overallCompliance >= 70 ? 'C' :
                     overallCompliance >= 60 ? 'D' : 'F'
  }
}

export async function calculateCostEfficiency(actualCost: number, budgetPerMeal?: number | null) {
  if (!budgetPerMeal) {
    return {
      efficiency: 100,
      variance: 0,
      status: 'WITHIN_BUDGET' as const,
      grade: 'A' as const
    }
  }

  const variance = ((actualCost - budgetPerMeal) / budgetPerMeal) * 100
  const efficiency = Math.max(0, 100 - Math.abs(variance))

  return {
    efficiency,
    variance,
    status: variance <= 10 ? 'WITHIN_BUDGET' :
            variance <= 25 ? 'SLIGHTLY_OVER' :
            'SIGNIFICANTLY_OVER' as const,
    grade: efficiency >= 90 ? 'A' :
           efficiency >= 80 ? 'B' :
           efficiency >= 70 ? 'C' :
           efficiency >= 60 ? 'D' : 'F' as const
  }
}

export async function assessMenuComplexity(
  ingredientsCount: number,
  cookingTime?: number | null,
  difficulty?: string | null
) {
  let complexityScore = 0

  // Ingredients complexity
  if (ingredientsCount <= 5) complexityScore += 20
  else if (ingredientsCount <= 10) complexityScore += 15
  else complexityScore += 10

  // Time complexity
  if (cookingTime) {
    if (cookingTime <= 30) complexityScore += 20
    else if (cookingTime <= 60) complexityScore += 15
    else if (cookingTime <= 120) complexityScore += 10
    else complexityScore += 5
  } else {
    complexityScore += 15 // Default for unknown time
  }

  // Difficulty complexity
  switch (difficulty) {
    case 'EASY': complexityScore += 20; break
    case 'MEDIUM': complexityScore += 15; break
    case 'HARD': complexityScore += 10; break
    default: complexityScore += 15; break
  }

  const complexityLevel = complexityScore >= 50 ? 'LOW' :
                         complexityScore >= 35 ? 'MEDIUM' :
                         'HIGH'

  return {
    complexityScore,
    complexityLevel,
    ingredientsComplexity: ingredientsCount,
    timeComplexity: cookingTime || 0,
    difficultyComplexity: difficulty || 'UNKNOWN'
  }
}

// ============================================================================
// REDIS INTEGRATION - ENTERPRISE BROADCASTING & CACHING
// ============================================================================

async function invalidateMenuCache(sppgId: string) {
  try {
    // Pattern-based cache key deletion for menu-related data
    const cacheKeys = await redis.keys(`menu:*:${sppgId}*`)
    if (cacheKeys.length > 0) {
      await redis.del(...cacheKeys)
      console.log(`🗑️ Invalidated ${cacheKeys.length} menu cache keys for SPPG: ${sppgId}`)
    }
  } catch (error) {
    console.error('❌ Cache invalidation failed:', error)
  }
}

async function broadcastMenuUpdate(
  sppgId: string,
  type: 'created' | 'updated' | 'deleted' | 'ingredients_updated' | 'status_toggled',
  menu: { id: string; menuName: string; menuCode: string },
  additionalData?: Record<string, unknown>
) {
  try {
    // Create standardized message for SSE
    const message = {
      type: `MENU_${type.toUpperCase()}` as 'MENU_CREATED' | 'MENU_UPDATED' | 'MENU_DELETED' | 'MENU_INGREDIENTS_UPDATED' | 'MENU_STATUS_TOGGLED',
      data: {
        id: menu.id,
        menuName: menu.menuName,
        menuCode: menu.menuCode,
        ...additionalData
      },
      sppgId,
      timestamp: Date.now()
    }

    // Broadcast to menu-specific channel (used by SSE endpoint)
    await redis.publish(`menu:${sppgId}`, JSON.stringify(message))

    // Invalidate cache after successful broadcast
    await invalidateMenuCache(sppgId)

    console.log(`📡 Menu broadcast sent: ${type} for ${menu.menuName} (SPPG: ${sppgId})`)
  } catch (error) {
    console.error('❌ Menu broadcast failed:', error)
    // Don't throw error to prevent action failure
  }
}

// ============================================================================
// ENTERPRISE SERVER ACTIONS
// ============================================================================

export async function createMenu(input: z.infer<typeof createMenuSchema>) {
  try {
    const session = await auth()
    if (!session?.user) {
      return ServiceResult.error('Unauthorized')
    }

    // Check SPPG access and permissions
    const sppg = await checkSppgAccess(session.user.sppgId)
    if (!sppg) {
      return ServiceResult.error('SPPG access denied')
    }

    if (!hasPermission(session.user.userRole, 'MENU_MANAGE')) {
      return ServiceResult.error('Insufficient permissions')
    }

    // Validate input
    const validated = createMenuSchema.safeParse(input)
    if (!validated.success) {
      return ServiceResult.error(validated.error.issues[0].message)
    }

    const data = validated.data

    // Create menu in transaction
    const menu = await db.$transaction(async (tx) => {
      // Create the menu first
      const newMenu = await tx.nutritionMenu.create({
        data: {
          programId: data.programId,
          menuName: data.menuName,
          menuCode: data.menuCode,
          description: data.description,
          mealType: data.mealType,
          servingSize: data.servingSize,
          // Nutrition fields removed - calculated automatically
          costPerServing: data.costPerServing,
          sellingPrice: data.sellingPrice,
          cookingTime: data.cookingTime,
          difficulty: data.difficulty,
          cookingMethod: data.cookingMethod,
          allergens: data.allergens,
          isHalal: data.isHalal,
          isVegetarian: data.isVegetarian
          // isActive defaults to true
        }
      })

      // Create ingredients
      if (data.ingredients.length > 0) {
        await tx.menuIngredient.createMany({
          data: data.ingredients.map(ingredient => ({
            menuId: newMenu.id,
            ingredientName: ingredient.ingredientName,
            quantity: ingredient.quantity,
            unit: ingredient.unit,
            costPerUnit: ingredient.costPerUnit,
            totalCost: ingredient.totalCost,
            // Nutrition contribution fields removed - calculated automatically
            preparationNotes: ingredient.preparationNotes,
            isOptional: ingredient.isOptional,
            inventoryItemId: ingredient.inventoryItemId
          }))
        })
      }

      // Create recipe steps
      if (data.recipeSteps.length > 0) {
        await tx.recipeStep.createMany({
          data: data.recipeSteps.map(step => ({
            menuId: newMenu.id,
            stepNumber: step.stepNumber,
            instruction: step.instruction,
            duration: step.duration,
            temperature: step.temperature,
            equipment: step.equipment ? [step.equipment] : [],
            qualityCheck: step.tips || null
          }))
        })
      }

      return newMenu
    })

    // Get the created menu with full details for analytics
    const fullMenu = await db.nutritionMenu.findUnique({
      where: { id: menu.id },
      include: {
        program: {
          select: {
            name: true,
            calorieTarget: true,
            proteinTarget: true,
            carbTarget: true,
            fatTarget: true,
            fiberTarget: true,
            budgetPerMeal: true
          }
        },
        ingredients: {
          include: {
            inventoryItem: true
          }
        },
        _count: {
          select: {
            ingredients: true
          }
        }
      }
    })

    if (!fullMenu) {
      throw new Error('Failed to retrieve created menu')
    }

    // Calculate nutrition from ingredients first
    const calculatedNutrition = NutritionCalculationService.calculateFromIngredients(
      fullMenu.ingredients as IngredientWithInventory[],
      fullMenu.servingSize
    )

    // Calculate analytics using calculated nutrition
    const nutritionCompliance = await calculateNutritionCompliance(calculatedNutrition, fullMenu.program)
    const costEfficiency = await calculateCostEfficiency(fullMenu.costPerServing, fullMenu.program.budgetPerMeal)
    const complexity = await assessMenuComplexity(fullMenu._count.ingredients, fullMenu.cookingTime, fullMenu.difficulty)

    // Create audit log
    await db.auditLog.create({
      data: {
        sppgId: sppg.id,
        userId: session.user.id,
        action: 'CREATE',
        entityType: 'MENU',
        entityId: menu.id,
        description: `Created menu ${data.menuName} (${data.menuCode}) for program ${fullMenu.program.name}`,
        metadata: {
          menuCode: data.menuCode,
          menuName: data.menuName,
          mealType: data.mealType,
          servingSize: data.servingSize,
          costPerServing: data.costPerServing,
          ingredientsCount: data.ingredients.length,
          complianceGrade: nutritionCompliance.complianceGrade,
          costEfficiencyGrade: costEfficiency.grade
        }
      }
    })

    // Broadcast update
    await broadcastMenuUpdate(sppg.id, 'created', menu, {
      programName: fullMenu.program.name,
      mealType: data.mealType,
      costPerServing: data.costPerServing,
      nutritionCompliance: nutritionCompliance.overallCompliance,
      costEfficiency: costEfficiency.efficiency
    })

    revalidatePath('/menu')

    return ServiceResult.success({
      menu: fullMenu,
      analytics: {
        nutritionCompliance,
        costEfficiency,
        complexity
      }
    })

  } catch (error) {
    console.error('Create menu error:', error)
    return ServiceResult.error('Failed to create menu')
  }
}

export async function updateMenu(input: z.infer<typeof updateMenuSchema>) {
  try {
    const session = await auth()
    if (!session?.user) {
      return ServiceResult.error('Unauthorized')
    }

    const validated = updateMenuSchema.safeParse(input)
    if (!validated.success) {
      return ServiceResult.error('Validation failed')
    }

    const { menuId, ...updateData } = validated.data

    // Get menu with access check
    const existingMenu = await db.nutritionMenu.findFirst({
      where: {
        id: menuId,
        program: {
          sppgId: session.user.sppgId!
        }
      },
      include: {
        program: {
          select: {
            id: true,
            name: true,
            sppgId: true
          }
        }
      }
    })

    if (!existingMenu) {
      return ServiceResult.error('Menu not found')
    }

    if (!hasPermission(session.user.userRole, 'MENU_MANAGE')) {
      return ServiceResult.error('Insufficient permissions')
    }

    // Update menu
    const updatedMenu = await db.nutritionMenu.update({
      where: { id: menuId },
      data: updateData,
      include: {
        program: {
          select: {
            name: true,
            calorieTarget: true,
            proteinTarget: true,
            carbTarget: true,
            fatTarget: true,
            fiberTarget: true,
            budgetPerMeal: true
          }
        },
        ingredients: {
          include: {
            inventoryItem: true
          }
        },
        _count: {
          select: {
            ingredients: true,
            recipeSteps: true
          }
        }
      }
    })

    // Calculate nutrition from ingredients first
    const calculatedNutrition = NutritionCalculationService.calculateFromIngredients(
      updatedMenu.ingredients as IngredientWithInventory[],
      updatedMenu.servingSize
    )

    // Calculate updated analytics
    const nutritionCompliance = await calculateNutritionCompliance(calculatedNutrition, updatedMenu.program)
    const costEfficiency = await calculateCostEfficiency(updatedMenu.costPerServing, updatedMenu.program.budgetPerMeal)
    const complexity = await assessMenuComplexity(
      updatedMenu._count.ingredients,
      updatedMenu.cookingTime,
      updatedMenu.difficulty
    )

    // Create audit log
    await db.auditLog.create({
      data: {
        sppgId: existingMenu.program.sppgId,
        userId: session.user.id,
        action: 'UPDATE',
        entityType: 'MENU',
        entityId: menuId,
        description: `Updated menu ${updatedMenu.menuName} (${updatedMenu.menuCode})`,
        metadata: {
          menuCode: updatedMenu.menuCode,
          menuName: updatedMenu.menuName,
          changes: updateData,
          complianceGrade: nutritionCompliance.complianceGrade,
          costEfficiencyGrade: costEfficiency.grade
        }
      }
    })

    // Broadcast update
    await broadcastMenuUpdate(existingMenu.program.sppgId, 'updated', updatedMenu, {
      programName: updatedMenu.program.name,
      changes: Object.keys(updateData),
      nutritionCompliance: nutritionCompliance.overallCompliance,
      costEfficiency: costEfficiency.efficiency
    })

    revalidatePath('/menu')

    return ServiceResult.success({
      menu: updatedMenu,
      analytics: {
        nutritionCompliance,
        costEfficiency,
        complexity
      }
    })

  } catch (error) {
    console.error('Update menu error:', error)
    return ServiceResult.error('Failed to update menu')
  }
}

export async function updateMenuIngredients(input: z.infer<typeof updateMenuIngredientsSchema>) {
  try {
    const session = await auth()
    if (!session?.user) {
      return ServiceResult.error('Unauthorized')
    }

    const validated = updateMenuIngredientsSchema.safeParse(input)
    if (!validated.success) {
      return ServiceResult.error('Validation failed')
    }

    const { menuId, ingredients } = validated.data

    // Get menu with access check
    const menu = await db.nutritionMenu.findFirst({
      where: {
        id: menuId,
        program: {
          sppgId: session.user.sppgId!
        }
      },
      include: {
        program: {
          select: {
            name: true,
            sppgId: true
          }
        }
      }
    })

    if (!menu) {
      return ServiceResult.error('Menu not found')
    }

    if (!hasPermission(session.user.userRole, 'MENU_MANAGE')) {
      return ServiceResult.error('Insufficient permissions')
    }

    // Update ingredients in transaction
    const result = await db.$transaction(async (tx) => {
      // Delete existing ingredients
      await tx.menuIngredient.deleteMany({
        where: { menuId }
      })

      // Create new ingredients
      const newIngredients = await tx.menuIngredient.createMany({
        data: ingredients.map(ingredient => ({
          menuId,
          ingredientName: ingredient.ingredientName,
          quantity: ingredient.quantity,
          unit: ingredient.unit,
          costPerUnit: ingredient.costPerUnit,
          totalCost: ingredient.totalCost,
          // Nutrition contribution fields removed - calculated automatically
          preparationNotes: ingredient.preparationNotes,
          isOptional: ingredient.isOptional,
          inventoryItemId: ingredient.inventoryItemId
        }))
      })

      // Update menu cost based on ingredients
      const totalCost = ingredients.reduce((sum, ing) => sum + ing.totalCost, 0)
      const updatedMenu = await tx.nutritionMenu.update({
        where: { id: menuId },
        data: { costPerServing: totalCost },
        include: {
          ingredients: true
        }
      })

      return { updatedMenu, newIngredients }
    })

    // Create audit log
    await db.auditLog.create({
      data: {
        sppgId: menu.program.sppgId,
        userId: session.user.id,
        action: 'UPDATE',
        entityType: 'MENU_INGREDIENTS',
        entityId: menuId,
        description: `Updated ingredients for menu ${menu.menuName} (${menu.menuCode})`,
        metadata: {
          menuCode: menu.menuCode,
          ingredientsCount: ingredients.length,
          totalCost: result.updatedMenu.costPerServing,
          ingredientNames: ingredients.map(i => i.ingredientName)
        }
      }
    })

    // Broadcast update
    await broadcastMenuUpdate(menu.program.sppgId, 'ingredients_updated', menu, {
      programName: menu.program.name,
      ingredientsCount: ingredients.length,
      newCostPerServing: result.updatedMenu.costPerServing
    })

    revalidatePath('/menu')

    return ServiceResult.success(result.updatedMenu)

  } catch (error) {
    console.error('Update menu ingredients error:', error)
    return ServiceResult.error('Failed to update menu ingredients')
  }
}

export async function getMenus(
  filters: {
    programId?: string
    mealType?: MealType
    isActive?: boolean
    search?: string
    page?: number
    limit?: number
  } = {}
) {
  try {
    const session = await auth()
    if (!session?.user?.sppgId) {
      return ServiceResult.error('Unauthorized')
    }

    if (!hasPermission(session.user.userRole, 'READ')) {
      return ServiceResult.error('Insufficient permissions')
    }

    const { programId, mealType, isActive, search, page = 1, limit = 20 } = filters
    const skip = (page - 1) * limit

    // Create cache key based on filters
    const cacheKey = `menu:list:${session.user.sppgId}:${JSON.stringify({
      programId, mealType, isActive, search, page, limit
    })}`

    // Try to get from cache first
    try {
      const cached = await redis.get(cacheKey)
      if (cached) {
        console.log(`📦 Menu cache hit for SPPG: ${session.user.sppgId}`)
        return ServiceResult.success(JSON.parse(cached))
      }
    } catch (cacheError) {
      console.log('⚠️ Cache read failed, proceeding with database query:', cacheError)
    }

    console.log(`🔍 Menu cache miss, querying database for SPPG: ${session.user.sppgId}`)

    const where = {
      program: {
        sppgId: session.user.sppgId!
      },
      ...(programId && { programId }),
      ...(mealType && { mealType }),
      ...(typeof isActive === 'boolean' && { isActive }),
      ...(search && {
        OR: [
          { menuName: { contains: search, mode: 'insensitive' as const } },
          { menuCode: { contains: search, mode: 'insensitive' as const } },
          { description: { contains: search, mode: 'insensitive' as const } }
        ]
      })
    }

    const [menus, total] = await Promise.all([
      db.nutritionMenu.findMany({
        where,
        include: {
          program: {
            select: {
              id: true,
              name: true,
              calorieTarget: true,
              proteinTarget: true,
              carbTarget: true,
              fatTarget: true,
              fiberTarget: true,
              budgetPerMeal: true
            }
          },
          ingredients: {
            select: {
              id: true,
              ingredientName: true,
              quantity: true,
              unit: true,
              totalCost: true,
              inventoryItemId: true,
              // Nutrition contribution fields removed - calculated from inventory
              inventoryItem: {
                select: {
                  id: true,
                  itemName: true,
                  calories: true,
                  protein: true,
                  carbohydrates: true,
                  fat: true,
                  fiber: true
                }
              }
            }
          },
          _count: {
            select: {
              ingredients: true,
              recipeSteps: true,
              productions: true
            }
          }
        },
        orderBy: [
          { isActive: 'desc' },
          { updatedAt: 'desc' }
        ],
        skip,
        take: limit
      }),
      db.nutritionMenu.count({ where })
    ])

    // Calculate analytics for each menu
    const menusWithAnalytics = await Promise.all(
      menus.map(async (menu) => {
        // Calculate nutrition from ingredients
        const calculatedNutrition = NutritionCalculationService.calculateFromIngredients(
          menu.ingredients as IngredientWithInventory[],
          menu.servingSize
        )
        
        const nutritionCompliance = await calculateNutritionCompliance(calculatedNutrition, menu.program)
        const costEfficiency = await calculateCostEfficiency(menu.costPerServing, menu.program.budgetPerMeal)
        const complexity = await assessMenuComplexity(
          menu._count.ingredients,
          menu.cookingTime,
          menu.difficulty
        )

        return {
          ...menu,
          analytics: {
            nutritionCompliance,
            costEfficiency,
            complexity,
            totalIngredients: menu._count.ingredients,
            totalRecipeSteps: menu._count.recipeSteps,
            totalProductions: menu._count.productions
          }
        }
      })
    )

    const result = {
      menus: menusWithAnalytics,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    }

    // Cache the result for 5 minutes (300 seconds)
    try {
      await redis.setex(cacheKey, 300, JSON.stringify(result))
      console.log(`💾 Menu data cached for SPPG: ${session.user.sppgId}`)
    } catch (cacheError) {
      console.log('⚠️ Cache write failed:', cacheError)
    }

    return ServiceResult.success(result)

  } catch (error) {
    console.error('Get menus error:', error)
    return ServiceResult.error('Failed to get menus')
  }
}

export async function getMenuById(menuId: string) {
  try {
    const session = await auth()
    if (!session?.user?.sppgId) {
      return ServiceResult.error('Unauthorized')
    }

    if (!hasPermission(session.user.userRole, 'READ')) {
      return ServiceResult.error('Insufficient permissions')
    }

    // Create cache key for single menu
    const cacheKey = `menu:detail:${menuId}:${session.user.sppgId}`

    // Try to get from cache first
    try {
      const cached = await redis.get(cacheKey)
      if (cached) {
        console.log(`📦 Menu detail cache hit for: ${menuId}`)
        return ServiceResult.success(JSON.parse(cached))
      }
    } catch (cacheError) {
      console.log('⚠️ Menu detail cache read failed:', cacheError)
    }

    console.log(`🔍 Menu detail cache miss, querying database for: ${menuId}`)

    const menu = await db.nutritionMenu.findFirst({
      where: {
        id: menuId,
        program: {
          sppgId: session.user.sppgId!
        }
      },
      include: {
        program: {
          select: {
            id: true,
            name: true,
            description: true,
            targetGroup: true,
            calorieTarget: true,
            proteinTarget: true,
            carbTarget: true,
            fatTarget: true,
            fiberTarget: true,
            budgetPerMeal: true
          }
        },
        ingredients: {
          include: {
            inventoryItem: {
              select: {
                id: true,
                itemName: true,
                category: true,
                unit: true,
                currentStock: true,
                averagePrice: true,
                calories: true,
                protein: true,
                carbohydrates: true,
                fat: true,
                fiber: true
              }
            }
          }
        },
        recipeSteps: {
          orderBy: { stepNumber: 'asc' }
        },
        productions: {
          select: {
            id: true,
            plannedPortions: true,
            actualPortions: true,
            actualCost: true,
            tasteRating: true,
            productionDate: true,
            status: true
          },
          orderBy: { productionDate: 'desc' },
          take: 10
        },
        nutritionCalc: true,
        costCalc: true,
        _count: {
          select: {
            ingredients: true,
            recipeSteps: true,
            productions: true
          }
        }
      }
    })

    if (!menu) {
      return ServiceResult.error('Menu not found')
    }

    // Calculate nutrition from ingredients first
    const calculatedNutrition = NutritionCalculationService.calculateFromIngredients(
      menu.ingredients as IngredientWithInventory[],
      menu.servingSize
    )

    // Calculate comprehensive analytics
    const nutritionCompliance = await calculateNutritionCompliance(calculatedNutrition, menu.program)
    const costEfficiency = await calculateCostEfficiency(menu.costPerServing, menu.program.budgetPerMeal)
    const complexity = await assessMenuComplexity(
      menu._count.ingredients,
      menu.cookingTime,
      menu.difficulty
    )

    // Calculate production statistics
    const productionStats = {
      totalProductions: menu._count.productions,
      averageQuality: menu.productions.length > 0
        ? menu.productions.reduce((sum: number, p: { tasteRating?: number | null }) => sum + (p.tasteRating || 0), 0) / menu.productions.length
        : 0,
      averageCost: menu.productions.length > 0
        ? menu.productions.reduce((sum: number, p: { actualCost?: number | null }) => sum + (p.actualCost || 0), 0) / menu.productions.length
        : 0,
      lastProduction: menu.productions[0]?.productionDate || null
    }

    const result = {
      menu,
      analytics: {
        nutritionCompliance,
        costEfficiency,
        complexity,
        productionStats
      }
    }

    // Cache the result for 10 minutes (600 seconds)
    try {
      await redis.setex(cacheKey, 600, JSON.stringify(result))
      console.log(`💾 Menu detail cached for: ${menuId}`)
    } catch (cacheError) {
      console.log('⚠️ Menu detail cache write failed:', cacheError)
    }

    return ServiceResult.success(result)

  } catch (error) {
    console.error('Get menu by ID error:', error)
    return ServiceResult.error('Failed to get menu')
  }
}

export async function deleteMenu(menuId: string) {
  try {
    const session = await auth()
    if (!session?.user) {
      return ServiceResult.error('Unauthorized')
    }

    // Get menu with access check
    const menu = await db.nutritionMenu.findFirst({
      where: {
        id: menuId,
        program: {
          sppgId: session.user.sppgId!
        }
      },
      include: {
        program: {
          select: {
            name: true,
            sppgId: true
          }
        },
        _count: {
          select: {
            productions: true
          }
        }
      }
    })

    if (!menu) {
      return ServiceResult.error('Menu not found')
    }

    if (!hasPermission(session.user.userRole, 'DELETE')) {
      return ServiceResult.error('Insufficient permissions')
    }

    // Check if menu has productions
    if (menu._count.productions > 0) {
      return ServiceResult.error('Cannot delete menu that has production records')
    }

    // Delete menu and related data
    await db.$transaction(async (tx) => {
      await tx.menuIngredient.deleteMany({
        where: { menuId }
      })

      await tx.recipeStep.deleteMany({
        where: { menuId }
      })

      await tx.nutritionMenu.delete({
        where: { id: menuId }
      })
    })

    // Create audit log
    await db.auditLog.create({
      data: {
        sppgId: menu.program.sppgId,
        userId: session.user.id,
        action: 'DELETE',
        entityType: 'MENU',
        entityId: menuId,
        description: `Deleted menu ${menu.menuName} (${menu.menuCode})`,
        metadata: {
          menuCode: menu.menuCode,
          menuName: menu.menuName,
          programName: menu.program.name
        }
      }
    })

    // Broadcast update
    await broadcastMenuUpdate(menu.program.sppgId, 'deleted', menu, {
      programName: menu.program.name
    })

    revalidatePath('/menu')

    return ServiceResult.success({ message: 'Menu deleted successfully' })

  } catch (error) {
    console.error('Delete menu error:', error)
    return ServiceResult.error('Failed to delete menu')
  }
}

export async function getMenuAnalytics() {
  try {
    const session = await auth()
    if (!session?.user?.sppgId) {
      return ServiceResult.error('Unauthorized')
    }

    if (!hasPermission(session.user.userRole, 'ANALYTICS_VIEW')) {
      return ServiceResult.error('Insufficient permissions')
    }

    const sppgId = session.user.sppgId!

    // Get all menus with analytics data
    const menus = await db.nutritionMenu.findMany({
      where: {
        program: {
          sppgId
        }
      },
      include: {
        program: {
          select: {
            budgetPerMeal: true,
            calorieTarget: true,
            proteinTarget: true
          }
        },
        ingredients: {
          include: {
            inventoryItem: true
          }
        },
        _count: {
          select: {
            ingredients: true,
            productions: true
          }
        }
      }
    })

    // Calculate overall analytics
    const totalMenus = menus.length
    const activeMenus = menus.filter(m => m.isActive).length
    const averageCostPerServing = menus.length > 0
      ? menus.reduce((sum, m) => sum + m.costPerServing, 0) / menus.length
      : 0

    // Meal type distribution
    const mealTypeDistribution = menus.reduce((acc: Record<string, number>, menu) => {
      acc[menu.mealType] = (acc[menu.mealType] || 0) + 1
      return acc
    }, {})

    // Average nutrition values - calculated from ingredients
    const nutritionValues = menus.map(menu => 
      NutritionCalculationService.calculateFromIngredients(
        menu.ingredients as IngredientWithInventory[],
        menu.servingSize
      )
    )
    
    const avgNutrition = {
      calories: nutritionValues.length > 0 ? nutritionValues.reduce((sum, n) => sum + n.calories, 0) / nutritionValues.length : 0,
      protein: nutritionValues.length > 0 ? nutritionValues.reduce((sum, n) => sum + n.protein, 0) / nutritionValues.length : 0,
      carbohydrates: nutritionValues.length > 0 ? nutritionValues.reduce((sum, n) => sum + n.carbohydrates, 0) / nutritionValues.length : 0,
      fat: nutritionValues.length > 0 ? nutritionValues.reduce((sum, n) => sum + n.fat, 0) / nutritionValues.length : 0,
      fiber: nutritionValues.length > 0 ? nutritionValues.reduce((sum, n) => sum + n.fiber, 0) / nutritionValues.length : 0
    }

    // Cost efficiency analysis
    const costEfficient = menus.filter(m => 
      m.program.budgetPerMeal ? m.costPerServing <= m.program.budgetPerMeal : true
    ).length
    const costEfficiencyRate = totalMenus > 0 ? (costEfficient / totalMenus) * 100 : 0

    // Popular ingredients analysis
    const ingredientUsage = await db.menuIngredient.groupBy({
      by: ['ingredientName'],
      where: {
        menu: {
          program: {
            sppgId
          }
        }
      },
      _count: {
        ingredientName: true
      },
      orderBy: {
        _count: {
          ingredientName: 'desc'
        }
      },
      take: 10
    })

    const analytics = {
      totalMenus,
      activeMenus,
      averageCostPerServing,
      mealTypeDistribution,
      avgNutrition,
      costEfficiencyRate,
      popularIngredients: ingredientUsage.map(item => ({
        name: item.ingredientName,
        usageCount: item._count.ingredientName
      }))
    }

    return ServiceResult.success(analytics)

  } catch (error) {
    console.error('Get menu analytics error:', error)
    return ServiceResult.error('Failed to get menu analytics')
  }
}

// ============================================================================
// ADDITIONAL PHASE 1 FUNCTIONS - PROGRAM MANAGEMENT & MENU STATUS
// ============================================================================

export async function toggleMenuStatus(menuId: string, isActive: boolean) {
  try {
    const session = await auth()
    if (!session?.user) {
      return ServiceResult.error('Unauthorized')
    }

    if (!hasPermission(session.user.userRole, 'WRITE')) {
      return ServiceResult.error('Insufficient permissions')
    }

    // Get menu with access check
    const menu = await db.nutritionMenu.findFirst({
      where: {
        id: menuId,
        program: {
          sppgId: session.user.sppgId!
        }
      },
      include: {
        program: {
          select: {
            sppgId: true
          }
        }
      }
    })

    if (!menu) {
      return ServiceResult.error('Menu not found')
    }

    // Update menu status
    const updatedMenu = await db.nutritionMenu.update({
      where: { id: menuId },
      data: { 
        isActive,
        updatedAt: new Date()
      },
      include: {
        program: {
          select: {
            id: true,
            name: true,
            sppgId: true
          }
        }
      }
    })

    // Broadcast status update
    await broadcastMenuUpdate(menu.program.sppgId, 'status_toggled', {
      id: updatedMenu.id,
      menuName: updatedMenu.menuName,
      menuCode: updatedMenu.menuCode
    }, {
      isActive: updatedMenu.isActive,
      updatedBy: session.user.name
    })

    revalidatePath('/menu')

    return ServiceResult.success(updatedMenu)

  } catch (error) {
    console.error('Toggle menu status error:', error)
    return ServiceResult.error('Failed to toggle menu status')
  }
}

export async function getPrograms() {
  try {
    console.log('[getPrograms] Starting...')
    
    const session = await auth()
    console.log('[getPrograms] Session:', {
      hasSession: !!session,
      hasUser: !!session?.user,
      sppgId: session?.user?.sppgId,
      userRole: session?.user?.userRole
    })
    
    if (!session?.user?.sppgId) {
      console.error('[getPrograms] Unauthorized: No sppgId')
      return ServiceResult.error('Unauthorized: No SPPG ID found')
    }

    if (!hasPermission(session.user.userRole, 'READ')) {
      console.error('[getPrograms] Insufficient permissions:', session.user.userRole)
      return ServiceResult.error('Insufficient permissions')
    }

    console.log('[getPrograms] Fetching programs for sppgId:', session.user.sppgId)
    
    const programs = await db.nutritionProgram.findMany({
      where: {
        sppgId: session.user.sppgId!
      },
      include: {
        _count: {
          select: {
            menus: true,
            schools: true // Changed from beneficiaries to schools
          }
        }
      },
      orderBy: [
        { status: 'asc' }, // Changed from isActive to status (ACTIVE first alphabetically)
        { name: 'asc' }
      ]
    })

    console.log('[getPrograms] Found programs:', programs.length)
    return ServiceResult.success(programs)

  } catch (error) {
    console.error('[getPrograms] Error:', error)
    return ServiceResult.error(`Failed to get programs: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

const createProgramSchema = z.object({
  name: z.string().min(3).max(100),
  description: z.string().optional(),
  programCode: z.string().min(3).max(20).optional(), // Will generate if not provided
  programType: z.enum(['NUTRITIONAL_RECOVERY', 'NUTRITIONAL_EDUCATION', 'SUPPLEMENTARY_FEEDING', 'EMERGENCY_NUTRITION', 'STUNTING_INTERVENTION']).default('SUPPLEMENTARY_FEEDING'),
  targetGroup: z.enum(['TODDLER', 'PREGNANT_WOMAN', 'BREASTFEEDING_MOTHER', 'TEENAGE_GIRL', 'ELDERLY', 'SCHOOL_CHILDREN']).default('SCHOOL_CHILDREN'),
  calorieTarget: z.number().min(0).max(5000).optional(),
  proteinTarget: z.number().min(0).max(200).optional(),
  carbTarget: z.number().min(0).max(500).optional(),
  fatTarget: z.number().min(0).max(200).optional(),
  fiberTarget: z.number().min(0).max(50).optional(),
  budgetPerMeal: z.number().min(0).optional(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime().optional()
})

export async function createProgram(input: z.infer<typeof createProgramSchema>) {
  try {
    const session = await auth()
    if (!session?.user?.sppgId) {
      return ServiceResult.error('Unauthorized')
    }

    if (!hasPermission(session.user.userRole, 'WRITE')) {
      return ServiceResult.error('Insufficient permissions')
    }

    const sppg = await checkSppgAccess(session.user.sppgId)
    if (!sppg) {
      return ServiceResult.error('SPPG not found or access denied')
    }

    // Validate input
    const validated = createProgramSchema.safeParse(input)
    if (!validated.success) {
      return ServiceResult.error(validated.error.issues[0].message)
    }

    // Generate programCode if not provided
    const programCode = validated.data.programCode || 
      `PROG-${Date.now().toString().slice(-6)}`

    const program = await db.nutritionProgram.create({
      data: {
        ...validated.data,
        sppgId: sppg.id,
        programCode,
        startDate: validated.data.startDate,
        ...(validated.data.endDate && { endDate: validated.data.endDate }),
        // Default values for required fields
        feedingDays: [1, 2, 3, 4, 5], // Monday to Friday
        targetRecipients: 100, // Default target
        implementationArea: 'LOCAL' // Default area
      }
    })

    revalidatePath('/menu')

    return ServiceResult.success(program)

  } catch (error) {
    console.error('Create program error:', error)
    return ServiceResult.error('Failed to create program')
  }
}

const updateProgramSchema = z.object({
  programId: z.string().cuid(),
  name: z.string().min(3).max(100).optional(),
  description: z.string().optional(),
  calorieTarget: z.number().min(0).max(5000).optional(),
  proteinTarget: z.number().min(0).max(200).optional(),
  carbTarget: z.number().min(0).max(500).optional(),
  fatTarget: z.number().min(0).max(200).optional(),
  fiberTarget: z.number().min(0).max(50).optional(),
  budgetPerMeal: z.number().min(0).optional(),
  isActive: z.boolean().optional()
})

export async function updateProgram(input: z.infer<typeof updateProgramSchema>) {
  try {
    const session = await auth()
    if (!session?.user?.sppgId) {
      return ServiceResult.error('Unauthorized')
    }

    if (!hasPermission(session.user.userRole, 'WRITE')) {
      return ServiceResult.error('Insufficient permissions')
    }

    // Validate input
    const validated = updateProgramSchema.safeParse(input)
    if (!validated.success) {
      return ServiceResult.error(validated.error.issues[0].message)
    }

    // Check program exists and belongs to SPPG
    const existingProgram = await db.nutritionProgram.findFirst({
      where: {
        id: validated.data.programId,
        sppgId: session.user.sppgId!
      }
    })

    if (!existingProgram) {
      return ServiceResult.error('Program not found')
    }

    const { programId, ...updateData } = validated.data

    const updatedProgram = await db.nutritionProgram.update({
      where: { id: programId },
      data: {
        ...updateData,
        updatedAt: new Date()
      }
    })

    revalidatePath('/menu')

    return ServiceResult.success(updatedProgram)

  } catch (error) {
    console.error('Update program error:', error)
    return ServiceResult.error('Failed to update program')
  }
}

export async function deleteProgram(programId: string) {
  try {
    const session = await auth()
    if (!session?.user?.sppgId) {
      return ServiceResult.error('Unauthorized')
    }

    if (!hasPermission(session.user.userRole, 'DELETE')) {
      return ServiceResult.error('Insufficient permissions')
    }

    // Check program exists and belongs to SPPG
    const program = await db.nutritionProgram.findFirst({
      where: {
        id: programId,
        sppgId: session.user.sppgId!
      },
      include: {
        _count: {
          select: {
            menus: true
          }
        }
      }
    })

    if (!program) {
      return ServiceResult.error('Program not found')
    }

    // Check if program has menus
    if (program._count.menus > 0) {
      return ServiceResult.error('Cannot delete program with existing menus')
    }

    await db.nutritionProgram.delete({
      where: { id: programId }
    })

    revalidatePath('/menu')

    return ServiceResult.success({ message: 'Program deleted successfully' })

  } catch (error) {
    console.error('Delete program error:', error)
    return ServiceResult.error('Failed to delete program')
  }
}