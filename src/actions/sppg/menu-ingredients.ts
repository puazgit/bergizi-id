/**
 * Menu Ingredient Management Server Actions
 * 
 * Enterprise-grade ingredient management for menu planning
 * Handles ingredient browsing, searching, adding to menus, and nutrition calculation
 * 
 * @module actions/sppg/menu-ingredients
 */

'use server'

import { auth } from '@/auth'
import db from '@/lib/db'
import { ServiceResult } from '@/lib/service-result'
import { hasPermission } from '@/lib/permissions'
import { revalidatePath } from 'next/cache'
import { redis } from '@/lib/redis'
import { z } from 'zod'
import type { Prisma, InventoryCategory } from '@prisma/client'
import { NutritionCalculationService, type IngredientWithInventory } from '@/services/sppg/nutrition-calculation.service'

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const addIngredientSchema = z.object({
  menuId: z.string().cuid(),
  inventoryItemId: z.string().cuid().optional(),
  ingredientName: z.string().min(2, 'Nama bahan minimal 2 karakter'),
  quantity: z.number().positive('Jumlah harus positif'),
  unit: z.string().min(1, 'Satuan harus diisi'),
  costPerUnit: z.number().nonnegative('Biaya tidak boleh negatif').optional(),
  notes: z.string().optional()
})

export type AddIngredientInput = z.infer<typeof addIngredientSchema>

const updateIngredientSchema = z.object({
  ingredientId: z.string().cuid(),
  quantity: z.number().positive('Jumlah harus positif').optional(),
  unit: z.string().min(1).optional(),
  costPerUnit: z.number().nonnegative().optional(),
  notes: z.string().optional()
})

export type UpdateIngredientInput = z.infer<typeof updateIngredientSchema>

const bulkAddIngredientsSchema = z.object({
  menuId: z.string().cuid(),
  ingredients: z.array(z.object({
    inventoryItemId: z.string().cuid().optional(),
    ingredientName: z.string().min(2),
    quantity: z.number().positive(),
    unit: z.string().min(1),
    costPerUnit: z.number().nonnegative().optional(),
    notes: z.string().optional()
  })).min(1, 'Minimal 1 bahan').max(50, 'Maksimal 50 bahan sekaligus')
})

export type BulkAddIngredientsInput = z.infer<typeof bulkAddIngredientsSchema>

const ingredientSearchSchema = z.object({
  query: z.string().min(1),
  category: z.string().optional(),
  isAvailable: z.boolean().optional(),
  limit: z.number().int().min(1).max(100).default(20)
})

export type IngredientSearchInput = z.infer<typeof ingredientSearchSchema>

// ============================================================================
// INGREDIENT BROWSING & SEARCH
// ============================================================================

/**
 * Get available ingredients from inventory
 * 
 * @param filters - Optional filters for category, availability, search term
 * @returns List of inventory items
 * 
 * @example
 * ```typescript
 * const ingredients = await getIngredients({
 *   category: 'Protein',
 *   isAvailable: true,
 *   searchTerm: 'ayam'
 * })
 * ```
 */
export async function getIngredients(filters?: {
  category?: string
  isAvailable?: boolean
  searchTerm?: string
  limit?: number
}): Promise<ServiceResult<unknown>> {
  try {
    const session = await auth()
    if (!session?.user) {
      return ServiceResult.error('Unauthorized')
    }

    if (!hasPermission(session.user.userRole, 'READ')) {
      return ServiceResult.error('Insufficient permissions')
    }

    const where: Prisma.InventoryItemWhereInput = {
      sppgId: session.user.sppgId!,
      ...(filters?.category && {
        category: filters.category as InventoryCategory
      }),
      ...(filters?.isAvailable && {
        currentStock: {
          gt: 0
        }
      }),
      ...(filters?.searchTerm && {
        OR: [
          { itemName: { contains: filters.searchTerm, mode: 'insensitive' } },
          { itemCode: { contains: filters.searchTerm, mode: 'insensitive' } }
        ]
      })
    }

    const ingredients = await db.inventoryItem.findMany({
      where,
      select: {
        id: true,
        itemName: true,
        itemCode: true,
        category: true,
        unit: true,
        lastPrice: true,
        averagePrice: true,
        currentStock: true,
        isActive: true
      },
      orderBy: {
        itemName: 'asc'
      },
      take: filters?.limit || 50
    })

    return ServiceResult.success(ingredients)

  } catch (error) {
    console.error('Get ingredients error:', error)
    return ServiceResult.error('Failed to fetch ingredients')
  }
}

/**
 * Search ingredients with autocomplete support
 * 
 * @param input - Search query and filters
 * @returns Matching ingredients
 * 
 * @example
 * ```typescript
 * const results = await searchIngredients({
 *   query: 'tela',
 *   category: 'Karbohidrat',
 *   limit: 10
 * })
 * ```
 */
export async function searchIngredients(
  input: IngredientSearchInput
): Promise<ServiceResult<unknown>> {
  try {
    const session = await auth()
    if (!session?.user) {
      return ServiceResult.error('Unauthorized')
    }

    if (!hasPermission(session.user.userRole, 'READ')) {
      return ServiceResult.error('Insufficient permissions')
    }

    const validated = ingredientSearchSchema.safeParse(input)
    if (!validated.success) {
      return ServiceResult.error(validated.error.issues[0].message)
    }

    const { query, category, isAvailable, limit } = validated.data

    const where: Prisma.InventoryItemWhereInput = {
      sppgId: session.user.sppgId!,
      isActive: true,
      OR: [
        { itemName: { contains: query, mode: 'insensitive' } },
        { itemCode: { contains: query, mode: 'insensitive' } }
      ],
      ...(category && { category: category as InventoryCategory }),
      ...(isAvailable && {
        currentStock: {
          gt: 0
        }
      })
    }

    const results = await db.inventoryItem.findMany({
      where,
      select: {
        id: true,
        itemName: true,
        itemCode: true,
        category: true,
        unit: true,
        lastPrice: true,
        averagePrice: true,
        currentStock: true
      },
      orderBy: [
        {
          itemName: 'asc'
        }
      ],
      take: limit
    })

    return ServiceResult.success(results)

  } catch (error) {
    console.error('Search ingredients error:', error)
    return ServiceResult.error('Failed to search ingredients')
  }
}

// ============================================================================
// INGREDIENT MANAGEMENT
// ============================================================================

/**
 * Add ingredient to menu
 * 
 * @param data - Ingredient details
 * @returns Created menu ingredient
 * 
 * @example
 * ```typescript
 * const result = await addIngredientToMenu({
 *   menuId: 'menu_123',
 *   inventoryItemId: 'inv_456',
 *   ingredientName: 'Ayam Fillet',
 *   quantity: 200,
 *   unit: 'gram',
 *   costPerUnit: 50
 * })
 * ```
 */
export async function addIngredientToMenu(
  data: AddIngredientInput
): Promise<ServiceResult<unknown>> {
  try {
    const session = await auth()
    if (!session?.user) {
      return ServiceResult.error('Unauthorized')
    }

    if (!hasPermission(session.user.userRole, 'WRITE') && 
        !hasPermission(session.user.userRole, 'MENU_MANAGE')) {
      return ServiceResult.error('Insufficient permissions')
    }

    const validated = addIngredientSchema.safeParse(data)
    if (!validated.success) {
      return ServiceResult.error(validated.error.issues[0].message)
    }

    const { menuId, inventoryItemId, ingredientName, quantity, unit, costPerUnit } = validated.data

    // Verify menu belongs to user's SPPG
    const menu = await db.nutritionMenu.findFirst({
      where: {
        id: menuId,
        program: {
          sppgId: session.user.sppgId!
        }
      }
    })

    if (!menu) {
      return ServiceResult.error('Menu not found or access denied')
    }

    // Get inventory item details if provided
    let inventoryItem = null
    if (inventoryItemId) {
      inventoryItem = await db.inventoryItem.findFirst({
        where: {
          id: inventoryItemId,
          sppgId: session.user.sppgId!
        }
      })

      if (!inventoryItem) {
        return ServiceResult.error('Inventory item not found')
      }
    }

    // Calculate costs
    const finalCostPerUnit = costPerUnit || inventoryItem?.lastPrice || inventoryItem?.averagePrice || 0
    const totalCost = quantity * finalCostPerUnit

    // Create menu ingredient
    const ingredient = await db.menuIngredient.create({
      data: {
        menuId,
        inventoryItemId: inventoryItemId || null,
        ingredientName,
        quantity,
        unit,
        costPerUnit: finalCostPerUnit,
        totalCost,
        // Nutrition contributions removed - will be calculated automatically
      },
      include: {
        inventoryItem: {
          select: {
            itemName: true,
            category: true,
            currentStock: true
          }
        }
      }
    })

    // Invalidate menu cache
    await redis.del(`menu:${menuId}`)
    await redis.del(`menu:stats:${session.user.sppgId}`)

    // Create audit log
    await db.auditLog.create({
      data: {
        sppgId: session.user.sppgId!,
        userId: session.user.id,
        action: 'CREATE',
        entityType: 'MENU_INGREDIENT',
        entityId: ingredient.id,
        description: `Added ingredient "${ingredientName}" to menu`,
        metadata: {
          menuId,
          ingredientName,
          quantity,
          unit,
          totalCost
        }
      }
    })

    revalidatePath('/menu')
    revalidatePath(`/menu/${menuId}`)

    return ServiceResult.success(ingredient)

  } catch (error) {
    console.error('Add ingredient error:', error)
    return ServiceResult.error('Failed to add ingredient to menu')
  }
}

/**
 * Update ingredient quantity and details
 * 
 * @param data - Updated ingredient data
 * @returns Updated menu ingredient
 * 
 * @example
 * ```typescript
 * const result = await updateIngredientQuantity({
 *   ingredientId: 'ing_123',
 *   quantity: 250,
 *   costPerUnit: 55
 * })
 * ```
 */
export async function updateIngredient(
  data: UpdateIngredientInput
): Promise<ServiceResult<unknown>> {
  try {
    const session = await auth()
    if (!session?.user) {
      return ServiceResult.error('Unauthorized')
    }

    if (!hasPermission(session.user.userRole, 'WRITE') && 
        !hasPermission(session.user.userRole, 'MENU_MANAGE')) {
      return ServiceResult.error('Insufficient permissions')
    }

    const validated = updateIngredientSchema.safeParse(data)
    if (!validated.success) {
      return ServiceResult.error(validated.error.issues[0].message)
    }

    const { ingredientId, quantity, unit, costPerUnit } = validated.data

    // Verify ingredient belongs to user's SPPG
    const existingIngredient = await db.menuIngredient.findFirst({
      where: {
        id: ingredientId,
        menu: {
          program: {
            sppgId: session.user.sppgId!
          }
        }
      }
    })

    if (!existingIngredient) {
      return ServiceResult.error('Ingredient not found or access denied')
    }

    // Calculate new total cost if quantity or cost per unit changed
    const finalQuantity = quantity !== undefined ? quantity : existingIngredient.quantity
    const finalCostPerUnit = costPerUnit !== undefined ? costPerUnit : existingIngredient.costPerUnit
    const totalCost = finalQuantity * finalCostPerUnit

    // Update ingredient
    const updatedIngredient = await db.menuIngredient.update({
      where: { id: ingredientId },
      data: {
        ...(quantity !== undefined && { quantity }),
        ...(unit !== undefined && { unit }),
        ...(costPerUnit !== undefined && { costPerUnit }),
        totalCost
      },
      include: {
        inventoryItem: {
          select: {
            itemName: true,
            category: true
          }
        }
      }
    })

    // Invalidate cache
    await redis.del(`menu:${existingIngredient.menuId}`)
    await redis.del(`menu:stats:${session.user.sppgId}`)

    // Audit log
    await db.auditLog.create({
      data: {
        sppgId: session.user.sppgId!,
        userId: session.user.id,
        action: 'UPDATE',
        entityType: 'MENU_INGREDIENT',
        entityId: ingredientId,
        description: `Updated ingredient "${existingIngredient.ingredientName}"`,
        metadata: {
          menuId: existingIngredient.menuId,
          changes: { quantity, unit, costPerUnit }
        }
      }
    })

    revalidatePath('/menu')
    revalidatePath(`/menu/${existingIngredient.menuId}`)

    return ServiceResult.success(updatedIngredient)

  } catch (error) {
    console.error('Update ingredient error:', error)
    return ServiceResult.error('Failed to update ingredient')
  }
}

/**
 * Remove ingredient from menu
 * 
 * @param ingredientId - Menu ingredient ID
 * @returns Success result
 * 
 * @example
 * ```typescript
 * const result = await removeIngredientFromMenu('ing_123')
 * ```
 */
export async function removeIngredientFromMenu(
  ingredientId: string
): Promise<ServiceResult<void>> {
  try {
    const session = await auth()
    if (!session?.user) {
      return ServiceResult.error('Unauthorized')
    }

    if (!hasPermission(session.user.userRole, 'DELETE') && 
        !hasPermission(session.user.userRole, 'MENU_MANAGE')) {
      return ServiceResult.error('Insufficient permissions')
    }

    // Verify ingredient belongs to user's SPPG
    const ingredient = await db.menuIngredient.findFirst({
      where: {
        id: ingredientId,
        menu: {
          program: {
            sppgId: session.user.sppgId!
          }
        }
      }
    })

    if (!ingredient) {
      return ServiceResult.error('Ingredient not found or access denied')
    }

    // Delete ingredient
    await db.menuIngredient.delete({
      where: { id: ingredientId }
    })

    // Invalidate cache
    await redis.del(`menu:${ingredient.menuId}`)
    await redis.del(`menu:stats:${session.user.sppgId}`)

    // Audit log
    await db.auditLog.create({
      data: {
        sppgId: session.user.sppgId!,
        userId: session.user.id,
        action: 'DELETE',
        entityType: 'MENU_INGREDIENT',
        entityId: ingredientId,
        description: `Removed ingredient "${ingredient.ingredientName}" from menu`,
        metadata: {
          menuId: ingredient.menuId,
          ingredientName: ingredient.ingredientName
        }
      }
    })

    revalidatePath('/menu')
    revalidatePath(`/menu/${ingredient.menuId}`)

    return ServiceResult.success(undefined)

  } catch (error) {
    console.error('Remove ingredient error:', error)
    return ServiceResult.error('Failed to remove ingredient')
  }
}

/**
 * Bulk add ingredients to menu
 * 
 * @param data - Menu ID and array of ingredients
 * @returns Created ingredients
 * 
 * @example
 * ```typescript
 * const result = await bulkAddIngredients({
 *   menuId: 'menu_123',
 *   ingredients: [
 *     { ingredientName: 'Beras', quantity: 100, unit: 'gram', costPerUnit: 15 },
 *     { ingredientName: 'Ayam', quantity: 200, unit: 'gram', costPerUnit: 50 }
 *   ]
 * })
 * ```
 */
export async function bulkAddIngredients(
  data: BulkAddIngredientsInput
): Promise<ServiceResult<unknown>> {
  try {
    const session = await auth()
    if (!session?.user) {
      return ServiceResult.error('Unauthorized')
    }

    if (!hasPermission(session.user.userRole, 'WRITE') && 
        !hasPermission(session.user.userRole, 'MENU_MANAGE')) {
      return ServiceResult.error('Insufficient permissions')
    }

    const validated = bulkAddIngredientsSchema.safeParse(data)
    if (!validated.success) {
      return ServiceResult.error(validated.error.issues[0].message)
    }

    const { menuId, ingredients } = validated.data

    // Verify menu belongs to user's SPPG
    const menu = await db.nutritionMenu.findFirst({
      where: {
        id: menuId,
        program: {
          sppgId: session.user.sppgId!
        }
      }
    })

    if (!menu) {
      return ServiceResult.error('Menu not found or access denied')
    }

    // Create all ingredients in transaction
    const createdIngredients = await db.$transaction(
      ingredients.map(ing => {
        const totalCost = ing.quantity * (ing.costPerUnit || 0)
        return db.menuIngredient.create({
          data: {
            menuId,
            inventoryItemId: ing.inventoryItemId || null,
            ingredientName: ing.ingredientName,
            quantity: ing.quantity,
            unit: ing.unit,
            costPerUnit: ing.costPerUnit || 0,
            totalCost,
            // Nutrition contributions removed - will be calculated automatically
          }
        })
      })
    )

    // Invalidate cache
    await redis.del(`menu:${menuId}`)
    await redis.del(`menu:stats:${session.user.sppgId}`)

    // Audit log
    await db.auditLog.create({
      data: {
        sppgId: session.user.sppgId!,
        userId: session.user.id,
        action: 'CREATE',
        entityType: 'MENU_INGREDIENT',
        entityId: menuId,
        description: `Bulk added ${ingredients.length} ingredients to menu`,
        metadata: {
          menuId,
          count: ingredients.length,
          ingredientNames: ingredients.map(i => i.ingredientName)
        }
      }
    })

    revalidatePath('/menu')
    revalidatePath(`/menu/${menuId}`)

    return ServiceResult.success(createdIngredients)

  } catch (error) {
    console.error('Bulk add ingredients error:', error)
    return ServiceResult.error('Failed to bulk add ingredients')
  }
}

/**
 * Calculate menu nutrition from ingredients
 * 
 * @param menuId - Menu ID
 * @returns Calculated nutrition totals
 * 
 * @example
 * ```typescript
 * const result = await calculateMenuNutrition('menu_123')
 * if (result.success) {
 *   console.log(`Total Calories: ${result.data.calories}`)
 *   console.log(`Total Protein: ${result.data.protein}g`)
 * }
 * ```
 */
export async function calculateMenuNutrition(
  menuId: string
): Promise<ServiceResult<{
  calories: number
  protein: number
  carbohydrates: number
  fat: number
  fiber: number
  totalCost: number
}>> {
  try {
    const session = await auth()
    if (!session?.user) {
      return ServiceResult.error('Unauthorized')
    }

    if (!hasPermission(session.user.userRole, 'READ')) {
      return ServiceResult.error('Insufficient permissions')
    }

    // Verify menu belongs to user's SPPG
    const menu = await db.nutritionMenu.findFirst({
      where: {
        id: menuId,
        program: {
          sppgId: session.user.sppgId!
        }
      },
      include: {
        ingredients: {
          include: {
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
        }
      }
    })

    if (!menu) {
      return ServiceResult.error('Menu not found or access denied')
    }

    // Calculate nutrition using the centralized service
    const nutrition = NutritionCalculationService.calculateFromIngredients(
      menu.ingredients as IngredientWithInventory[],
      menu.servingSize
    )

    return ServiceResult.success(nutrition)

  } catch (error) {
    console.error('Calculate nutrition error:', error)
    return ServiceResult.error('Failed to calculate nutrition')
  }
}
