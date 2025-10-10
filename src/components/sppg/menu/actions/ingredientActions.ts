/**
 * Ingredient Management Actions
 * 
 * Server actions for Menu Ingredient CRUD operations
 * Multi-tenant safe with RBAC and audit logging
 * Auto-triggers nutrition and cost recalculation
 * 
 * Follows Pattern 2: Component-Level Domain Architecture
 * 
 * @module components/sppg/menu/actions/ingredientActions
 */

'use server'

import { auth } from '@/auth'
import db from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { Prisma } from '@prisma/client'
import {
  addIngredientSchema,
  updateIngredientSchema,
  type AddIngredientInput,
  type UpdateIngredientInput
} from '../validators/menuValidation'
import type { 
  MenuOperationResult,
  MenuIngredientWithInventory
} from '../types/menuTypes'

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Require authentication and return session
 */
async function requireAuth() {
  const session = await auth()
  if (!session?.user) {
    return { success: false as const, error: 'Unauthorized - Please login' }
  }
  return { success: true as const, session }
}

/**
 * Check if user has permission to manage menu ingredients
 */
function canManageIngredients(role: string): boolean {
  const allowedRoles = [
    'PLATFORM_SUPERADMIN',
    'SPPG_KEPALA',
    'SPPG_ADMIN',
    'SPPG_AHLI_GIZI',
    'SPPG_PRODUKSI_MANAGER'
  ]
  return allowedRoles.includes(role)
}

/**
 * Verify menu ownership
 */
async function verifyMenuOwnership(menuId: string, sppgId: string) {
  const menu = await db.nutritionMenu.findFirst({
    where: {
      id: menuId,
      program: {
        sppgId
      }
    },
    select: {
      id: true,
      menuName: true,
      servingSize: true,
      program: {
        select: {
          sppgId: true
        }
      }
    }
  })

  if (!menu) {
    return { success: false as const, error: 'Menu not found or access denied' }
  }

  return { success: true as const, menu }
}

/**
 * Calculate nutrition totals from ingredients and update menu
 */
async function recalculateNutrition(menuId: string, servingSize: number) {
  const ingredients = await db.menuIngredient.findMany({
    where: { menuId },
    include: {
      inventoryItem: {
        select: {
          calories: true,
          protein: true,
          carbohydrates: true,
          fat: true,
          fiber: true
        }
      }
    }
  })

  const totals = {
    calories: 0,
    protein: 0,
    carbohydrates: 0,
    fat: 0,
    fiber: 0
  }

  ingredients.forEach((ing) => {
    if (ing.inventoryItem) {
      // Nutrition data is per 100g, calculate contribution
      const factor = ing.quantity / 100
      totals.calories += (ing.inventoryItem.calories || 0) * factor
      totals.protein += (ing.inventoryItem.protein || 0) * factor
      totals.carbohydrates += (ing.inventoryItem.carbohydrates || 0) * factor
      totals.fat += (ing.inventoryItem.fat || 0) * factor
      totals.fiber += (ing.inventoryItem.fiber || 0) * factor
    }
  })

  // Calculate per serving
  const perServing = {
    calories: Math.round((totals.calories * 100) / servingSize),
    protein: Math.round(((totals.protein * 100) / servingSize) * 10) / 10,
    carbohydrates: Math.round(((totals.carbohydrates * 100) / servingSize) * 10) / 10,
    fat: Math.round(((totals.fat * 100) / servingSize) * 10) / 10,
    fiber: Math.round(((totals.fiber * 100) / servingSize) * 10) / 10
  }

  // Update menu
  await db.nutritionMenu.update({
    where: { id: menuId },
    data: perServing
  })

  return perServing
}

/**
 * Calculate cost totals from ingredients and update menu
 */
async function recalculateCost(menuId: string, servingSize: number) {
  const ingredients = await db.menuIngredient.findMany({
    where: { menuId }
  })

  let totalCost = 0

  ingredients.forEach((ing) => {
    totalCost += ing.totalCost
  })

  const costPerServing = Math.round((totalCost / servingSize) * 100) / 100

  // Update menu
  await db.nutritionMenu.update({
    where: { id: menuId },
    data: { costPerServing }
  })

  return costPerServing
}

// ============================================================================
// QUERY ACTIONS
// ============================================================================

/**
 * Get all ingredients for a menu
 */
export async function getMenuIngredients(
  menuId: string
): Promise<MenuOperationResult<MenuIngredientWithInventory[]>> {
  try {
    const authResult = await requireAuth()
    if (!authResult.success) {
      return { success: false, error: authResult.error }
    }
    const { session } = authResult

    // Verify menu ownership
    const menuResult = await verifyMenuOwnership(menuId, session.user.sppgId!)
    if (!menuResult.success) {
      return { success: false, error: menuResult.error }
    }

    const ingredients = await db.menuIngredient.findMany({
      where: { menuId },
      include: {
        inventoryItem: {
          select: {
            id: true,
            itemName: true,
            itemCode: true,
            unit: true,
            lastPrice: true,
            averagePrice: true,
            category: true,
            currentStock: true,
            calories: true,
            protein: true,
            carbohydrates: true,
            fat: true,
            fiber: true
          }
        }
      },
      orderBy: {
        ingredientName: 'asc'
      }
    })

    return {
      success: true,
      data: ingredients as unknown as MenuIngredientWithInventory[]
    }
  } catch (error) {
    console.error('[getMenuIngredients] Error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch ingredients'
    }
  }
}

// ============================================================================
// MUTATION ACTIONS
// ============================================================================

/**
 * Add ingredient to menu
 * 
 * @param input - Contains menuId, inventoryItemId, quantity, unit, and optional notes
 */
export async function addIngredient(
  input: AddIngredientInput
): Promise<MenuOperationResult<MenuIngredientWithInventory>> {
  try {
    const authResult = await requireAuth()
    if (!authResult.success) {
      return { success: false, error: authResult.error }
    }
    const { session } = authResult

    if (!canManageIngredients(session.user.userRole)) {
      return { success: false, error: 'Insufficient permissions to add ingredients' }
    }

    // Validate input
    const validated = addIngredientSchema.parse(input)
    const { menuId, inventoryItemId, quantity, unit, notes } = validated

    // Verify menu ownership
    const menuResult = await verifyMenuOwnership(menuId, session.user.sppgId!)
    if (!menuResult.success) {
      return { success: false, error: menuResult.error }
    }

    // Verify inventory item exists and belongs to SPPG
    const inventoryItem = await db.inventoryItem.findFirst({
      where: {
        id: inventoryItemId,
        sppgId: session.user.sppgId!
      }
    })

    if (!inventoryItem) {
      return { success: false, error: 'Inventory item not found or access denied' }
    }

    // Check for duplicates
    const existing = await db.menuIngredient.findFirst({
      where: {
        menuId,
        inventoryItemId
      }
    })

    if (existing) {
      return { 
        success: false, 
        error: `Ingredient "${inventoryItem.itemName}" already exists in this menu` 
      }
    }

    // Calculate cost
    const costPerUnit = inventoryItem.lastPrice || inventoryItem.averagePrice || 0
    const totalCost = (quantity / 1000) * costPerUnit // quantity in grams, price per kg

    // Create ingredient
    const ingredient = await db.menuIngredient.create({
      data: {
        menuId,
        inventoryItemId,
        ingredientName: inventoryItem.itemName,
        quantity,
        unit,
        costPerUnit,
        totalCost,
        preparationNotes: notes || null,
        caloriesContrib: 0,
        proteinContrib: 0,
        carbsContrib: 0,
        fatContrib: 0
      },
      include: {
        inventoryItem: {
          select: {
            id: true,
            itemName: true,
            itemCode: true,
            unit: true,
            lastPrice: true,
            averagePrice: true,
            category: true,
            currentStock: true,
            calories: true,
            protein: true,
            carbohydrates: true,
            fat: true,
            fiber: true
          }
        }
      }
    })

    // Recalculate menu nutrition and cost
    await Promise.all([
      recalculateNutrition(menuId, menuResult.menu.servingSize),
      recalculateCost(menuId, menuResult.menu.servingSize)
    ])

    // Audit log
    await db.auditLog.create({
      data: {
        userId: session.user.id,
        sppgId: session.user.sppgId!,
        action: 'CREATE',
        entityType: 'MENU_INGREDIENT',
        entityId: ingredient.id,
        oldValues: Prisma.JsonNull,
        newValues: validated as unknown as Prisma.InputJsonValue
      }
    })

    // Revalidate paths
    revalidatePath(`/menu/${menuId}`)
    revalidatePath(`/menu/${menuId}/ingredients`)

    return {
      success: true,
      data: ingredient as unknown as MenuIngredientWithInventory
    }
  } catch (error) {
    console.error('[addIngredient] Error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to add ingredient'
    }
  }
}

/**
 * Update ingredient quantity/cost
 * 
 * @param input - Contains id, and optional quantity, unit, notes
 */
export async function updateIngredient(
  input: UpdateIngredientInput
): Promise<MenuOperationResult<MenuIngredientWithInventory>> {
  try {
    const authResult = await requireAuth()
    if (!authResult.success) {
      return { success: false, error: authResult.error }
    }
    const { session } = authResult

    if (!canManageIngredients(session.user.userRole)) {
      return { success: false, error: 'Insufficient permissions to update ingredients' }
    }

    // Validate input
    const validated = updateIngredientSchema.parse(input)
    const { id, quantity, unit, notes } = validated

    // Get existing ingredient
    const existing = await db.menuIngredient.findFirst({
      where: { id },
      include: {
        menu: {
          include: {
            program: {
              select: { sppgId: true }
            }
          }
        },
        inventoryItem: {
          select: {
            lastPrice: true,
            averagePrice: true
          }
        }
      }
    })

    if (!existing) {
      return { success: false, error: 'Ingredient not found' }
    }

    // Verify ownership
    if (existing.menu.program.sppgId !== session.user.sppgId) {
      return { success: false, error: 'Access denied - Ingredient belongs to different SPPG' }
    }

    // Calculate new cost if quantity changed
    let newCostPerUnit = existing.costPerUnit
    let newTotalCost = existing.totalCost

    if (quantity && quantity !== existing.quantity) {
      newCostPerUnit = existing.inventoryItem?.lastPrice || existing.inventoryItem?.averagePrice || 0
      newTotalCost = (quantity / 1000) * newCostPerUnit
    }

    // Build update data
    const updateData: Prisma.MenuIngredientUpdateInput = {}
    if (quantity !== undefined) {
      updateData.quantity = quantity
      updateData.costPerUnit = newCostPerUnit
      updateData.totalCost = newTotalCost
    }
    if (unit !== undefined) {
      updateData.unit = unit
    }
    if (notes !== undefined) {
      updateData.preparationNotes = notes
    }

    // Update ingredient
    const updated = await db.menuIngredient.update({
      where: { id },
      data: updateData,
      include: {
        inventoryItem: {
          select: {
            id: true,
            itemName: true,
            itemCode: true,
            unit: true,
            lastPrice: true,
            averagePrice: true,
            category: true,
            currentStock: true,
            calories: true,
            protein: true,
            carbohydrates: true,
            fat: true,
            fiber: true
          }
        }
      }
    })

    // Recalculate menu nutrition and cost
    await Promise.all([
      recalculateNutrition(existing.menuId, existing.menu.servingSize),
      recalculateCost(existing.menuId, existing.menu.servingSize)
    ])

    // Audit log
    await db.auditLog.create({
      data: {
        userId: session.user.id,
        sppgId: session.user.sppgId!,
        action: 'UPDATE',
        entityType: 'MENU_INGREDIENT',
        entityId: id,
        oldValues: {
          quantity: existing.quantity,
          unit: existing.unit,
          preparationNotes: existing.preparationNotes
        } as Prisma.InputJsonValue,
        newValues: validated as unknown as Prisma.InputJsonValue
      }
    })

    // Revalidate paths
    revalidatePath(`/menu/${existing.menuId}`)
    revalidatePath(`/menu/${existing.menuId}/ingredients`)

    return {
      success: true,
      data: updated as unknown as MenuIngredientWithInventory
    }
  } catch (error) {
    console.error('[updateIngredient] Error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update ingredient'
    }
  }
}

/**
 * Remove ingredient from menu
 * 
 * @param id - Ingredient ID to remove
 */
export async function removeIngredient(
  id: string
): Promise<MenuOperationResult<MenuIngredientWithInventory>> {
  try {
    const authResult = await requireAuth()
    if (!authResult.success) {
      return { success: false, error: authResult.error }
    }
    const { session } = authResult

    if (!canManageIngredients(session.user.userRole)) {
      return { success: false, error: 'Insufficient permissions to remove ingredients' }
    }

    // Get existing ingredient
    const existing = await db.menuIngredient.findFirst({
      where: { id },
      include: {
        menu: {
          include: {
            program: {
              select: { sppgId: true }
            }
          }
        }
      }
    })

    if (!existing) {
      return { success: false, error: 'Ingredient not found' }
    }

    // Verify ownership
    if (existing.menu.program.sppgId !== session.user.sppgId) {
      return { success: false, error: 'Access denied - Ingredient belongs to different SPPG' }
    }

    // Delete ingredient
    const deleted = await db.menuIngredient.delete({
      where: { id },
      include: {
        inventoryItem: {
          select: {
            id: true,
            itemName: true,
            itemCode: true,
            unit: true,
            lastPrice: true,
            averagePrice: true,
            category: true,
            currentStock: true,
            calories: true,
            protein: true,
            carbohydrates: true,
            fat: true,
            fiber: true
          }
        }
      }
    })

    // Recalculate menu nutrition and cost
    await Promise.all([
      recalculateNutrition(existing.menuId, existing.menu.servingSize),
      recalculateCost(existing.menuId, existing.menu.servingSize)
    ])

    // Audit log
    await db.auditLog.create({
      data: {
        userId: session.user.id,
        sppgId: session.user.sppgId!,
        action: 'DELETE',
        entityType: 'MENU_INGREDIENT',
        entityId: id,
        oldValues: {
          menuId: existing.menuId,
          ingredientName: existing.ingredientName,
          quantity: existing.quantity
        } as Prisma.InputJsonValue,
        newValues: Prisma.JsonNull
      }
    })

    // Revalidate paths
    revalidatePath(`/menu/${existing.menuId}`)
    revalidatePath(`/menu/${existing.menuId}/ingredients`)

    return {
      success: true,
      data: deleted as unknown as MenuIngredientWithInventory
    }
  } catch (error) {
    console.error('[removeIngredient] Error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to remove ingredient'
    }
  }
}
