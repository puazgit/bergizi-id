/**
 * Recipe Management Actions
 * 
 * Server actions for Recipe Step CRUD operations
 * Multi-tenant safe with RBAC and audit logging
 * Auto-renumbers steps after changes
 * 
 * Follows Pattern 2: Component-Level Domain Architecture
 * 
 * @module components/sppg/menu/actions/recipeActions
 */

'use server'

import { auth } from '@/auth'
import db from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { Prisma } from '@prisma/client'
import {
  createRecipeStepSchema,
  updateRecipeStepSchema,
  reorderRecipeStepsSchema,
  bulkCreateRecipeStepsSchema,
  type CreateRecipeStepInput,
  type UpdateRecipeStepInput
} from '../validators/menuValidation'
import type { MenuOperationResult } from '../types/menuTypes'

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface RecipeStepWithDetails {
  id: string
  menuId: string
  stepNumber: number
  title: string | null
  instruction: string
  duration: number | null
  temperature: number | null
  equipment: string[]
  qualityCheck: string | null
  imageUrl: string | null
  videoUrl: string | null
}

export interface ReorderStepInput {
  id: string
  stepNumber: number
}

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
 * Check if user has permission to manage recipes
 */
function canManageRecipes(role: string): boolean {
  const allowedRoles = [
    'PLATFORM_SUPERADMIN',
    'SPPG_KEPALA',
    'SPPG_ADMIN',
    'SPPG_AHLI_GIZI',
    'SPPG_PRODUKSI_MANAGER',
    'SPPG_STAFF_DAPUR'
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
      menuName: true
    }
  })

  if (!menu) {
    return { success: false as const, error: 'Menu not found or access denied' }
  }

  return { success: true as const, menu }
}

/**
 * Auto-renumber all steps for a menu
 */
async function renumberSteps(menuId: string) {
  const steps = await db.recipeStep.findMany({
    where: { menuId },
    orderBy: { stepNumber: 'asc' }
  })

  // Update step numbers sequentially
  await Promise.all(
    steps.map((step, index) => 
      db.recipeStep.update({
        where: { id: step.id },
        data: { stepNumber: index + 1 }
      })
    )
  )
}

// ============================================================================
// QUERY ACTIONS
// ============================================================================

/**
 * Get all recipe steps for a menu
 */
export async function getRecipeSteps(
  menuId: string
): Promise<MenuOperationResult<RecipeStepWithDetails[]>> {
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

    const steps = await db.recipeStep.findMany({
      where: { menuId },
      orderBy: { stepNumber: 'asc' }
    })

    return {
      success: true,
      data: steps as RecipeStepWithDetails[]
    }
  } catch (error) {
    console.error('[getRecipeSteps] Error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch recipe steps'
    }
  }
}

// ============================================================================
// MUTATION ACTIONS
// ============================================================================

/**
 * Create a new recipe step
 */
export async function createRecipeStep(
  input: CreateRecipeStepInput
): Promise<MenuOperationResult<RecipeStepWithDetails>> {
  try {
    const authResult = await requireAuth()
    if (!authResult.success) {
      return { success: false, error: authResult.error }
    }
    const { session } = authResult

    if (!canManageRecipes(session.user.userRole)) {
      return { success: false, error: 'Insufficient permissions to create recipe steps' }
    }

    // Validate input
    const validated = createRecipeStepSchema.parse(input)
    const { menuId, stepNumber, instruction, duration, temperature, notes } = validated

    // Verify menu ownership
    const menuResult = await verifyMenuOwnership(menuId, session.user.sppgId!)
    if (!menuResult.success) {
      return { success: false, error: menuResult.error }
    }

    // Check for duplicate step number
    const existing = await db.recipeStep.findUnique({
      where: {
        menuId_stepNumber: {
          menuId,
          stepNumber
        }
      }
    })

    if (existing) {
      return { 
        success: false, 
        error: `Step number ${stepNumber} already exists. Please use a different number.` 
      }
    }

    // Create recipe step
    const step = await db.recipeStep.create({
      data: {
        menuId,
        stepNumber,
        instruction,
        duration: duration || null,
        temperature: temperature ? parseFloat(temperature.toString()) : null,
        title: notes || null, // Using notes as title for now
        equipment: [],
        qualityCheck: null,
        imageUrl: null,
        videoUrl: null
      }
    })

    // Audit log
    await db.auditLog.create({
      data: {
        userId: session.user.id,
        sppgId: session.user.sppgId!,
        action: 'CREATE',
        entityType: 'RECIPE_STEP',
        entityId: step.id,
        oldValues: Prisma.JsonNull,
        newValues: validated as unknown as Prisma.InputJsonValue
      }
    })

    // Revalidate paths
    revalidatePath(`/menu/${menuId}`)
    revalidatePath(`/menu/${menuId}/recipe`)

    return {
      success: true,
      data: step as RecipeStepWithDetails
    }
  } catch (error) {
    console.error('[createRecipeStep] Error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create recipe step'
    }
  }
}

/**
 * Update a recipe step
 */
export async function updateRecipeStep(
  input: UpdateRecipeStepInput
): Promise<MenuOperationResult<RecipeStepWithDetails>> {
  try {
    const authResult = await requireAuth()
    if (!authResult.success) {
      return { success: false, error: authResult.error }
    }
    const { session } = authResult

    if (!canManageRecipes(session.user.userRole)) {
      return { success: false, error: 'Insufficient permissions to update recipe steps' }
    }

    // Validate input
    const validated = updateRecipeStepSchema.parse(input)
    const { id, stepNumber, instruction, duration, temperature, notes } = validated

    // Get existing step
    const existing = await db.recipeStep.findFirst({
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
      return { success: false, error: 'Recipe step not found' }
    }

    // Verify ownership
    if (existing.menu.program.sppgId !== session.user.sppgId) {
      return { success: false, error: 'Access denied - Recipe belongs to different SPPG' }
    }

    // Check if new step number conflicts with existing
    if (stepNumber && stepNumber !== existing.stepNumber) {
      const conflict = await db.recipeStep.findUnique({
        where: {
          menuId_stepNumber: {
            menuId: existing.menuId,
            stepNumber
          }
        }
      })

      if (conflict) {
        return { 
          success: false, 
          error: `Step number ${stepNumber} already exists. Delete or reorder steps first.` 
        }
      }
    }

    // Build update data
    const updateData: Prisma.RecipeStepUpdateInput = {}
    if (stepNumber !== undefined) updateData.stepNumber = stepNumber
    if (instruction !== undefined) updateData.instruction = instruction
    if (duration !== undefined) updateData.duration = duration
    if (temperature !== undefined) {
      updateData.temperature = temperature ? parseFloat(temperature.toString()) : null
    }
    if (notes !== undefined) updateData.title = notes

    // Update step
    const updated = await db.recipeStep.update({
      where: { id },
      data: updateData
    })

    // Audit log
    await db.auditLog.create({
      data: {
        userId: session.user.id,
        sppgId: session.user.sppgId!,
        action: 'UPDATE',
        entityType: 'RECIPE_STEP',
        entityId: id,
        oldValues: {
          stepNumber: existing.stepNumber,
          instruction: existing.instruction,
          duration: existing.duration,
          temperature: existing.temperature
        } as Prisma.InputJsonValue,
        newValues: validated as unknown as Prisma.InputJsonValue
      }
    })

    // Revalidate paths
    revalidatePath(`/menu/${existing.menuId}`)
    revalidatePath(`/menu/${existing.menuId}/recipe`)

    return {
      success: true,
      data: updated as RecipeStepWithDetails
    }
  } catch (error) {
    console.error('[updateRecipeStep] Error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update recipe step'
    }
  }
}

/**
 * Delete a recipe step
 */
export async function deleteRecipeStep(
  id: string
): Promise<MenuOperationResult<RecipeStepWithDetails>> {
  try {
    const authResult = await requireAuth()
    if (!authResult.success) {
      return { success: false, error: authResult.error }
    }
    const { session } = authResult

    if (!canManageRecipes(session.user.userRole)) {
      return { success: false, error: 'Insufficient permissions to delete recipe steps' }
    }

    // Get existing step
    const existing = await db.recipeStep.findFirst({
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
      return { success: false, error: 'Recipe step not found' }
    }

    // Verify ownership
    if (existing.menu.program.sppgId !== session.user.sppgId) {
      return { success: false, error: 'Access denied - Recipe belongs to different SPPG' }
    }

    // Delete step
    const deleted = await db.recipeStep.delete({
      where: { id }
    })

    // Renumber remaining steps
    await renumberSteps(existing.menuId)

    // Audit log
    await db.auditLog.create({
      data: {
        userId: session.user.id,
        sppgId: session.user.sppgId!,
        action: 'DELETE',
        entityType: 'RECIPE_STEP',
        entityId: id,
        oldValues: {
          menuId: existing.menuId,
          stepNumber: existing.stepNumber,
          instruction: existing.instruction
        } as Prisma.InputJsonValue,
        newValues: Prisma.JsonNull
      }
    })

    // Revalidate paths
    revalidatePath(`/menu/${existing.menuId}`)
    revalidatePath(`/menu/${existing.menuId}/recipe`)

    return {
      success: true,
      data: deleted as RecipeStepWithDetails
    }
  } catch (error) {
    console.error('[deleteRecipeStep] Error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete recipe step'
    }
  }
}

/**
 * Reorder recipe steps (drag and drop support)
 */
export async function reorderRecipeSteps(
  menuId: string,
  stepOrders: ReorderStepInput[]
): Promise<MenuOperationResult<RecipeStepWithDetails[]>> {
  try {
    const authResult = await requireAuth()
    if (!authResult.success) {
      return { success: false, error: authResult.error }
    }
    const { session } = authResult

    if (!canManageRecipes(session.user.userRole)) {
      return { success: false, error: 'Insufficient permissions to reorder recipe steps' }
    }

    // Validate input
    const validated = reorderRecipeStepsSchema.parse({ menuId, stepOrders })

    // Verify menu ownership
    const menuResult = await verifyMenuOwnership(menuId, session.user.sppgId!)
    if (!menuResult.success) {
      return { success: false, error: menuResult.error }
    }

    // Update all steps with new order
    await Promise.all(
      validated.stepOrders.map((order) =>
        db.recipeStep.update({
          where: { id: order.id },
          data: { stepNumber: order.stepNumber }
        })
      )
    )

    // Fetch updated steps
    const steps = await db.recipeStep.findMany({
      where: { menuId },
      orderBy: { stepNumber: 'asc' }
    })

    // Audit log
    await db.auditLog.create({
      data: {
        userId: session.user.id,
        sppgId: session.user.sppgId!,
        action: 'UPDATE',
        entityType: 'RECIPE_STEP',
        entityId: menuId,
        oldValues: Prisma.JsonNull,
        newValues: { stepOrders: validated.stepOrders } as Prisma.InputJsonValue
      }
    })

    // Revalidate paths
    revalidatePath(`/menu/${menuId}`)
    revalidatePath(`/menu/${menuId}/recipe`)

    return {
      success: true,
      data: steps as RecipeStepWithDetails[]
    }
  } catch (error) {
    console.error('[reorderRecipeSteps] Error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to reorder recipe steps'
    }
  }
}

/**
 * Create multiple recipe steps at once
 */
export async function bulkCreateRecipeSteps(
  menuId: string,
  steps: Omit<CreateRecipeStepInput, 'menuId'>[]
): Promise<MenuOperationResult<RecipeStepWithDetails[]>> {
  try {
    const authResult = await requireAuth()
    if (!authResult.success) {
      return { success: false, error: authResult.error }
    }
    const { session } = authResult

    if (!canManageRecipes(session.user.userRole)) {
      return { success: false, error: 'Insufficient permissions to create recipe steps' }
    }

    // Validate input
    const validated = bulkCreateRecipeStepsSchema.parse({ menuId, steps })

    // Verify menu ownership
    const menuResult = await verifyMenuOwnership(menuId, session.user.sppgId!)
    if (!menuResult.success) {
      return { success: false, error: menuResult.error }
    }

    // Check for duplicate step numbers
    const stepNumbers = validated.steps.map((s) => s.stepNumber)
    const duplicates = stepNumbers.filter((num, index) => stepNumbers.indexOf(num) !== index)
    if (duplicates.length > 0) {
      return { success: false, error: `Duplicate step numbers: ${duplicates.join(', ')}` }
    }

    // Check for existing step numbers
    const existing = await db.recipeStep.findMany({
      where: {
        menuId,
        stepNumber: { in: stepNumbers }
      },
      select: { stepNumber: true }
    })

    if (existing.length > 0) {
      const existingNumbers = existing.map((e) => e.stepNumber)
      return { 
        success: false, 
        error: `Step numbers already exist: ${existingNumbers.join(', ')}` 
      }
    }

    // Create all steps
    const created = await Promise.all(
      validated.steps.map((step) =>
        db.recipeStep.create({
          data: {
            menuId,
            stepNumber: step.stepNumber,
            instruction: step.instruction,
            duration: step.duration || null,
            temperature: step.temperature ? parseFloat(step.temperature.toString()) : null,
            title: step.notes || null,
            equipment: [],
            qualityCheck: null,
            imageUrl: null,
            videoUrl: null
          }
        })
      )
    )

    // Audit log
    await db.auditLog.create({
      data: {
        userId: session.user.id,
        sppgId: session.user.sppgId!,
        action: 'CREATE',
        entityType: 'RECIPE_STEP',
        entityId: menuId,
        oldValues: Prisma.JsonNull,
        newValues: { 
          bulkCreate: validated.steps, 
          count: validated.steps.length 
        } as Prisma.InputJsonValue
      }
    })

    // Revalidate paths
    revalidatePath(`/menu/${menuId}`)
    revalidatePath(`/menu/${menuId}/recipe`)

    return {
      success: true,
      data: created as RecipeStepWithDetails[]
    }
  } catch (error) {
    console.error('[bulkCreateRecipeSteps] Error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create recipe steps'
    }
  }
}
