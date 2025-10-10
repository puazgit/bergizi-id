// Enterprise-Grade Menu Server Actions - Advanced Features
// Bergizi-ID SaaS Platform - Menu Domain PHASE 1
// src/actions/sppg/menu-advanced.ts

'use server'

import { auth } from '@/auth'
import db from '@/lib/db'
import { ServiceResult } from '@/lib/service-result'
import { hasPermission } from '@/lib/permissions'
import { revalidatePath } from 'next/cache'
import { redis } from '@/lib/redis'
import { z } from 'zod'
import { MealType } from '@prisma/client'
import type { Prisma } from '@prisma/client'

// ============================================================================
// ENTERPRISE VALIDATION SCHEMAS
// ============================================================================

const menuFiltersSchema = z.object({
  programId: z.string().cuid().optional(),
  mealType: z.nativeEnum(MealType).optional(),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']).optional(),
  isActive: z.boolean().optional(),
  isHalal: z.boolean().optional(),
  isVegetarian: z.boolean().optional(),
  minCalories: z.number().min(0).optional(),
  maxCalories: z.number().min(0).optional(),
  minCost: z.number().min(0).optional(),
  maxCost: z.number().min(0).optional(),
  search: z.string().optional(),
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(20),
  sortBy: z.enum(['menuName', 'menuCode', 'calories', 'costPerServing', 'createdAt', 'updatedAt']).optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
})

export type MenuFilters = z.infer<typeof menuFiltersSchema>

const duplicateMenuSchema = z.object({
  menuId: z.string().cuid(),
  newMenuName: z.string().min(3).max(100),
  newMenuCode: z.string().min(2).max(20),
  includePricing: z.boolean().default(true),
  includeIngredients: z.boolean().default(true),
  includeRecipeSteps: z.boolean().default(true)
})

const bulkUpdateMenuStatusSchema = z.object({
  menuIds: z.array(z.string().cuid()).min(1).max(50),
  isActive: z.boolean()
})

const menuSearchSchema = z.object({
  query: z.string().min(2),
  filters: z.object({
    programId: z.string().cuid().optional(),
    mealType: z.nativeEnum(MealType).optional(),
    isActive: z.boolean().optional()
  }).optional(),
  limit: z.number().int().min(1).max(50).default(10)
})

export type MenuSearchInput = z.infer<typeof menuSearchSchema>

const menuPlanningSchema = z.object({
  programId: z.string().cuid(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  menus: z.array(z.object({
    menuId: z.string().cuid(),
    date: z.string().datetime(),
    mealType: z.nativeEnum(MealType),
    servings: z.number().int().min(1),
    notes: z.string().optional()
  })).min(1)
})

export type MenuPlanningInput = z.infer<typeof menuPlanningSchema>

// ============================================================================
// MENU ANALYTICS & STATISTICS
// ============================================================================

export async function getMenuStatistics() {
  try {
    const session = await auth()
    if (!session?.user?.sppgId) {
      return ServiceResult.error('Unauthorized')
    }

    if (!hasPermission(session.user.userRole, 'READ')) {
      return ServiceResult.error('Insufficient permissions')
    }

    // Check Redis cache first
    const cacheKey = `menu:stats:${session.user.sppgId}`
    const cached = await redis.get(cacheKey)
    if (cached) {
      console.log('📊 Menu stats from cache')
      return ServiceResult.success(JSON.parse(cached as string))
    }

    // Aggregate statistics
    const [
      totalMenus,
      activeMenus,
      menusByMealType,
      menusByDifficulty,
      avgNutrition,
      avgCost,
      topPerformingMenus,
      recentMenus
    ] = await Promise.all([
      // Total menus count
      db.nutritionMenu.count({
        where: {
          program: { sppgId: session.user.sppgId }
        }
      }),

      // Active menus count
      db.nutritionMenu.count({
        where: {
          program: { sppgId: session.user.sppgId },
          isActive: true
        }
      }),

      // Menus by meal type
      db.nutritionMenu.groupBy({
        by: ['mealType'],
        where: {
          program: { sppgId: session.user.sppgId }
        },
        _count: {
          id: true
        }
      }),

      // Menus by difficulty
      db.nutritionMenu.groupBy({
        by: ['difficulty'],
        where: {
          program: { sppgId: session.user.sppgId },
          difficulty: { not: null }
        },
        _count: {
          id: true
        }
      }),

      // Average nutrition values
      db.nutritionMenu.aggregate({
        where: {
          program: { sppgId: session.user.sppgId },
          isActive: true
        },
        _avg: {
          calories: true,
          protein: true,
          carbohydrates: true,
          fat: true,
          fiber: true
        }
      }),

      // Average cost
      db.nutritionMenu.aggregate({
        where: {
          program: { sppgId: session.user.sppgId },
          isActive: true
        },
        _avg: {
          costPerServing: true
        }
      }),

      // Top performing menus (most used in distributions)
      db.nutritionMenu.findMany({
        where: {
          program: { sppgId: session.user.sppgId },
          isActive: true
        },
        select: {
          id: true,
          menuName: true,
          menuCode: true,
          mealType: true,
          costPerServing: true,
          _count: {
            select: {
              productions: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 5
      }),

      // Recent menus
      db.nutritionMenu.findMany({
        where: {
          program: { sppgId: session.user.sppgId }
        },
        select: {
          id: true,
          menuName: true,
          menuCode: true,
          mealType: true,
          createdAt: true
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 5
      })
    ])

    const stats = {
      overview: {
        totalMenus,
        activeMenus,
        inactiveMenus: totalMenus - activeMenus,
        activePercentage: totalMenus > 0 ? Math.round((activeMenus / totalMenus) * 100) : 0
      },
      byMealType: menusByMealType.map(item => ({
        mealType: item.mealType,
        count: item._count.id,
        percentage: totalMenus > 0 ? Math.round((item._count.id / totalMenus) * 100) : 0
      })),
      byDifficulty: menusByDifficulty.map(item => ({
        difficulty: item.difficulty,
        count: item._count.id
      })),
      averages: {
        calories: Math.round(avgNutrition._avg.calories || 0),
        protein: Math.round((avgNutrition._avg.protein || 0) * 10) / 10,
        carbohydrates: Math.round((avgNutrition._avg.carbohydrates || 0) * 10) / 10,
        fat: Math.round((avgNutrition._avg.fat || 0) * 10) / 10,
        fiber: Math.round((avgNutrition._avg.fiber || 0) * 10) / 10,
        costPerServing: Math.round((avgCost._avg.costPerServing || 0) * 100) / 100
      },
      topPerforming: topPerformingMenus.map(menu => ({
        id: menu.id,
        name: menu.menuName,
        code: menu.menuCode,
        mealType: menu.mealType,
        cost: menu.costPerServing,
        usageCount: menu._count.productions
      })),
      recentMenus: recentMenus.map(menu => ({
        id: menu.id,
        name: menu.menuName,
        code: menu.menuCode,
        mealType: menu.mealType,
        createdAt: menu.createdAt
      }))
    }

    // Cache for 10 minutes
    await redis.setex(cacheKey, 600, JSON.stringify(stats))

    return ServiceResult.success(stats)

  } catch (error) {
    console.error('Get menu statistics error:', error)
    return ServiceResult.error('Failed to get menu statistics')
  }
}

// ============================================================================
// MENU SEARCH & FILTERING
// ============================================================================

export async function searchMenus(input: z.infer<typeof menuSearchSchema>) {
  try {
    const session = await auth()
    if (!session?.user?.sppgId) {
      return ServiceResult.error('Unauthorized')
    }

    if (!hasPermission(session.user.userRole, 'READ')) {
      return ServiceResult.error('Insufficient permissions')
    }

    const validated = menuSearchSchema.safeParse(input)
    if (!validated.success) {
      return ServiceResult.error('Invalid search parameters')
    }

    const { query, filters, limit } = validated.data

    // Build search conditions
    const searchConditions: Prisma.NutritionMenuWhereInput = {
      program: { sppgId: session.user.sppgId },
      OR: [
        { menuName: { contains: query, mode: 'insensitive' } },
        { menuCode: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } }
      ]
    }

    if (filters?.programId) {
      searchConditions.programId = filters.programId
    }

    if (filters?.mealType) {
      searchConditions.mealType = filters.mealType
    }

    if (filters?.isActive !== undefined) {
      searchConditions.isActive = filters.isActive
    }

    const menus = await db.nutritionMenu.findMany({
      where: searchConditions,
      select: {
        id: true,
        menuName: true,
        menuCode: true,
        mealType: true,
        difficulty: true,
        calories: true,
        protein: true,
        costPerServing: true,
        isActive: true,
        program: {
          select: {
            id: true,
            name: true,
            programType: true
          }
        }
      },
      take: limit,
      orderBy: {
        menuName: 'asc'
      }
    })

    return ServiceResult.success({
      results: menus,
      count: menus.length,
      query
    })

  } catch (error) {
    console.error('Search menus error:', error)
    return ServiceResult.error('Failed to search menus')
  }
}

// ============================================================================
// MENU DUPLICATION
// ============================================================================

export async function duplicateMenu(input: z.infer<typeof duplicateMenuSchema>) {
  try {
    const session = await auth()
    if (!session?.user?.sppgId) {
      return ServiceResult.error('Unauthorized')
    }

    if (!hasPermission(session.user.userRole, 'MENU_MANAGE')) {
      return ServiceResult.error('Insufficient permissions')
    }

    const validated = duplicateMenuSchema.safeParse(input)
    if (!validated.success) {
      return ServiceResult.error('Invalid duplication parameters')
    }

    const { menuId, newMenuName, newMenuCode, includePricing, includeIngredients, includeRecipeSteps } = validated.data

    // Get source menu with full details
    const sourceMenu = await db.nutritionMenu.findFirst({
      where: {
        id: menuId,
        program: { sppgId: session.user.sppgId }
      },
      include: {
        ingredients: true,
        recipeSteps: true,
        program: true
      }
    })

    if (!sourceMenu) {
      return ServiceResult.error('Source menu not found or access denied')
    }

    // Check if new menu code exists
    const existingMenu = await db.nutritionMenu.findFirst({
      where: {
        programId: sourceMenu.programId,
        menuCode: newMenuCode
      }
    })

    if (existingMenu) {
      return ServiceResult.error('Menu code already exists in this program')
    }

    // Duplicate menu in transaction
    const duplicatedMenu = await db.$transaction(async (tx) => {
      // Create duplicated menu
      const newMenu = await tx.nutritionMenu.create({
        data: {
          programId: sourceMenu.programId,
          menuName: newMenuName,
          menuCode: newMenuCode,
          description: sourceMenu.description ? `${sourceMenu.description} (Copy)` : null,
          mealType: sourceMenu.mealType,
          servingSize: sourceMenu.servingSize,
          calories: sourceMenu.calories,
          protein: sourceMenu.protein,
          carbohydrates: sourceMenu.carbohydrates,
          fat: sourceMenu.fat,
          fiber: sourceMenu.fiber,
          sodium: sourceMenu.sodium,
          sugar: sourceMenu.sugar,
          vitaminA: sourceMenu.vitaminA,
          vitaminC: sourceMenu.vitaminC,
          calcium: sourceMenu.calcium,
          iron: sourceMenu.iron,
          costPerServing: includePricing ? sourceMenu.costPerServing : 0,
          sellingPrice: includePricing ? sourceMenu.sellingPrice : null,
          cookingTime: sourceMenu.cookingTime,
          difficulty: sourceMenu.difficulty,
          cookingMethod: sourceMenu.cookingMethod,
          allergens: sourceMenu.allergens,
          isHalal: sourceMenu.isHalal,
          isVegetarian: sourceMenu.isVegetarian,
          isActive: false // Start as inactive
        }
      })

      // Duplicate ingredients if requested
      if (includeIngredients && sourceMenu.ingredients.length > 0) {
        await tx.menuIngredient.createMany({
          data: sourceMenu.ingredients.map(ingredient => ({
            menuId: newMenu.id,
            ingredientName: ingredient.ingredientName,
            quantity: ingredient.quantity,
            unit: ingredient.unit,
            costPerUnit: includePricing ? ingredient.costPerUnit : 0,
            totalCost: includePricing ? ingredient.totalCost : 0,
            caloriesContrib: ingredient.caloriesContrib,
            proteinContrib: ingredient.proteinContrib,
            carbsContrib: ingredient.carbsContrib,
            fatContrib: ingredient.fatContrib,
            preparationNotes: ingredient.preparationNotes,
            isOptional: ingredient.isOptional,
            inventoryItemId: ingredient.inventoryItemId
          }))
        })
      }

      // Duplicate recipe steps if requested
      if (includeRecipeSteps && sourceMenu.recipeSteps.length > 0) {
        await tx.recipeStep.createMany({
          data: sourceMenu.recipeSteps.map(step => ({
            menuId: newMenu.id,
            stepNumber: step.stepNumber,
            instruction: step.instruction,
            duration: step.duration,
            temperature: step.temperature,
            equipment: step.equipment,
            qualityCheck: step.qualityCheck
          }))
        })
      }

      return newMenu
    })

    // Create audit log
    await db.auditLog.create({
      data: {
        sppgId: session.user.sppgId!,
        userId: session.user.id,
        action: 'CREATE', // Using CREATE since DUPLICATE doesn't exist
        entityType: 'MENU',
        entityId: duplicatedMenu.id,
        description: `Duplicated menu from ${sourceMenu.menuName} to ${newMenuName}`,
        metadata: {
          sourceMenuId: menuId,
          sourceMenuName: sourceMenu.menuName,
          newMenuName,
          newMenuCode,
          includePricing,
          includeIngredients,
          includeRecipeSteps
        }
      }
    })

    // Invalidate cache
    await redis.del(`menu:stats:${session.user.sppgId}`)

    revalidatePath('/menu')

    return ServiceResult.success({
      menu: duplicatedMenu,
      message: `Menu duplicated successfully as "${newMenuName}"`
    })

  } catch (error) {
    console.error('Duplicate menu error:', error)
    return ServiceResult.error('Failed to duplicate menu')
  }
}

// ============================================================================
// BULK OPERATIONS
// ============================================================================

export async function bulkUpdateMenuStatus(input: z.infer<typeof bulkUpdateMenuStatusSchema>) {
  try {
    const session = await auth()
    if (!session?.user?.sppgId) {
      return ServiceResult.error('Unauthorized')
    }

    if (!hasPermission(session.user.userRole, 'MENU_MANAGE')) {
      return ServiceResult.error('Insufficient permissions')
    }

    const validated = bulkUpdateMenuStatusSchema.safeParse(input)
    if (!validated.success) {
      return ServiceResult.error('Invalid bulk update parameters')
    }

    const { menuIds, isActive } = validated.data

    // Verify all menus belong to user's SPPG
    const menus = await db.nutritionMenu.findMany({
      where: {
        id: { in: menuIds },
        program: { sppgId: session.user.sppgId }
      },
      select: {
        id: true,
        menuName: true
      }
    })

    if (menus.length !== menuIds.length) {
      return ServiceResult.error('Some menus not found or access denied')
    }

    // Bulk update
    const result = await db.nutritionMenu.updateMany({
      where: {
        id: { in: menuIds },
        program: { sppgId: session.user.sppgId }
      },
      data: {
        isActive,
        updatedAt: new Date()
      }
    })

    // Create audit log
    await db.auditLog.create({
      data: {
        sppgId: session.user.sppgId!,
        userId: session.user.id,
        action: 'UPDATE', // Using UPDATE since BULK_UPDATE doesn't exist
        entityType: 'MENU',
        entityId: menuIds[0], // First menu ID for reference
        description: `Bulk updated ${result.count} menus to ${isActive ? 'active' : 'inactive'}`,
        metadata: {
          menuIds,
          isActive,
          count: result.count
        }
      }
    })

    // Invalidate cache
    await redis.del(`menu:stats:${session.user.sppgId}`)

    revalidatePath('/menu')

    return ServiceResult.success({
      count: result.count,
      message: `Successfully updated ${result.count} menu(s)`
    })

  } catch (error) {
    console.error('Bulk update menu status error:', error)
    return ServiceResult.error('Failed to bulk update menu status')
  }
}

// ============================================================================
// MENU EXPORT & REPORTING
// ============================================================================

export async function exportMenus(filters?: { programId?: string; mealType?: MealType }) {
  try {
    const session = await auth()
    if (!session?.user?.sppgId) {
      return ServiceResult.error('Unauthorized')
    }

    if (!hasPermission(session.user.userRole, 'REPORTS_VIEW')) {
      return ServiceResult.error('Insufficient permissions')
    }

    const where: Prisma.NutritionMenuWhereInput = {
      program: { sppgId: session.user.sppgId }
    }

    if (filters?.programId) {
      where.programId = filters.programId
    }

    if (filters?.mealType) {
      where.mealType = filters.mealType
    }

    const menus = await db.nutritionMenu.findMany({
      where,
      include: {
        program: {
          select: {
            name: true,
            programType: true
          }
        },
        ingredients: {
          select: {
            ingredientName: true,
            quantity: true,
            unit: true,
            costPerUnit: true,
            totalCost: true
          }
        },
        _count: {
          select: {
            productions: true
          }
        }
      },
      orderBy: {
        menuName: 'asc'
      }
    })

    // Format for export (CSV-ready)
    const exportData = menus.map(menu => ({
      'Menu Code': menu.menuCode,
      'Menu Name': menu.menuName,
      'Program': menu.program.name,
      'Meal Type': menu.mealType,
      'Difficulty': menu.difficulty || '-',
      'Serving Size (g)': menu.servingSize,
      'Cooking Time (min)': menu.cookingTime || '-',
      'Calories': menu.calories,
      'Protein (g)': menu.protein,
      'Carbs (g)': menu.carbohydrates,
      'Fat (g)': menu.fat,
      'Fiber (g)': menu.fiber,
      'Cost per Serving': menu.costPerServing,
      'Ingredients Count': menu.ingredients.length,
      'Times Used': menu._count.productions,
      'Is Halal': menu.isHalal ? 'Yes' : 'No',
      'Is Vegetarian': menu.isVegetarian ? 'Yes' : 'No',
      'Is Active': menu.isActive ? 'Yes' : 'No',
      'Created At': menu.createdAt.toISOString()
    }))

    return ServiceResult.success({
      data: exportData,
      count: exportData.length
    })

  } catch (error) {
    console.error('Export menus error:', error)
    return ServiceResult.error('Failed to export menus')
  }
}

// ============================================================================
// MENU RECOMMENDATIONS
// ============================================================================

export async function getMenuRecommendations(programId: string) {
  try {
    const session = await auth()
    if (!session?.user?.sppgId) {
      return ServiceResult.error('Unauthorized')
    }

    if (!hasPermission(session.user.userRole, 'READ')) {
      return ServiceResult.error('Insufficient permissions')
    }

    // Get program with targets
    const program = await db.nutritionProgram.findFirst({
      where: {
        id: programId,
        sppgId: session.user.sppgId
      },
      select: {
        id: true,
        name: true,
        calorieTarget: true,
        proteinTarget: true,
        carbTarget: true,
        fatTarget: true,
        fiberTarget: true,
        budgetPerMeal: true,
        targetGroup: true
      }
    })

    if (!program) {
      return ServiceResult.error('Program not found or access denied')
    }

    // Find matching menus from other programs
    const recommendations = await db.nutritionMenu.findMany({
      where: {
        program: { sppgId: session.user.sppgId },
        programId: { not: programId },
        isActive: true,
        ...(program.calorieTarget && {
          calories: {
            gte: program.calorieTarget * 0.9,
            lte: program.calorieTarget * 1.1
          }
        }),
        ...(program.budgetPerMeal && {
          costPerServing: {
            lte: program.budgetPerMeal * 1.1
          }
        })
      },
      select: {
        id: true,
        menuName: true,
        menuCode: true,
        mealType: true,
        difficulty: true,
        calories: true,
        protein: true,
        carbohydrates: true,
        fat: true,
        fiber: true,
        costPerServing: true,
        program: {
          select: {
            name: true
          }
        }
      },
      take: 10,
      orderBy: {
        createdAt: 'desc'
      }
    })

    return ServiceResult.success({
      program,
      recommendations: recommendations.map(menu => ({
        ...menu,
        matchScore: calculateMenuMatchScore(menu, program)
      })).sort((a, b) => b.matchScore - a.matchScore)
    })

  } catch (error) {
    console.error('Get menu recommendations error:', error)
    return ServiceResult.error('Failed to get menu recommendations')
  }
}

// Helper function for match scoring
function calculateMenuMatchScore(
  menu: {
    calories: number
    protein: number
    costPerServing: number
  },
  program: { 
    calorieTarget?: number | null
    proteinTarget?: number | null
    budgetPerMeal?: number | null 
  }
): number {
  let score = 100

  if (program.calorieTarget) {
    const calorieDiff = Math.abs(menu.calories - program.calorieTarget) / program.calorieTarget
    score -= calorieDiff * 30
  }

  if (program.proteinTarget) {
    const proteinDiff = Math.abs(menu.protein - program.proteinTarget) / program.proteinTarget
    score -= proteinDiff * 20
  }

  if (program.budgetPerMeal) {
    const costDiff = Math.abs(menu.costPerServing - program.budgetPerMeal) / program.budgetPerMeal
    score -= costDiff * 25
  }

  return Math.max(0, Math.round(score))
}
