/**
 * Recipe Management Server Actions
 * 
 * Enterprise-grade recipe and cooking instructions management
 * Handles recipe steps, equipment, and cooking procedures
 * 
 * @module actions/sppg/menu-recipes
 */

'use server'

import { auth } from '@/auth'
import db from '@/lib/db'
import { ServiceResult } from '@/lib/service-result'
import { hasPermission } from '@/lib/permissions'
import { revalidatePath } from 'next/cache'
import { redis } from '@/lib/redis'
import { z } from 'zod'

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const createRecipeStepSchema = z.object({
  menuId: z.string().cuid(),
  stepNumber: z.number().int().min(1),
  instruction: z.string().min(10, 'Instruksi minimal 10 karakter'),
  duration: z.number().int().positive().optional(),
  temperature: z.number().optional(),
  equipment: z.array(z.string()).optional()
})

export type CreateRecipeStepInput = z.infer<typeof createRecipeStepSchema>

const updateRecipeStepSchema = z.object({
  stepId: z.string().cuid(),
  stepNumber: z.number().int().min(1).optional(),
  instruction: z.string().min(10).optional(),
  duration: z.number().int().positive().optional(),
  temperature: z.number().optional(),
  equipment: z.array(z.string()).optional()
})

export type UpdateRecipeStepInput = z.infer<typeof updateRecipeStepSchema>

const reorderStepsSchema = z.object({
  menuId: z.string().cuid(),
  steps: z.array(z.object({
    id: z.string().cuid(),
    newStepNumber: z.number().int().min(1)
  })).min(1)
})

export type ReorderStepsInput = z.infer<typeof reorderStepsSchema>

const bulkCreateStepsSchema = z.object({
  menuId: z.string().cuid(),
  steps: z.array(z.object({
    stepNumber: z.number().int().min(1),
    instruction: z.string().min(10),
    duration: z.number().int().positive().optional(),
    temperature: z.number().optional(),
    equipment: z.array(z.string()).optional()
  })).min(1, 'Minimal 1 step').max(20, 'Maksimal 20 steps sekaligus')
})

export type BulkCreateStepsInput = z.infer<typeof bulkCreateStepsSchema>

// ============================================================================
// RECIPE BROWSING
// ============================================================================

/**
 * Get recipe steps for menu
 * 
 * @param menuId - Menu ID
 * @returns Ordered recipe steps
 * 
 * @example
 * ```typescript
 * const recipe = await getRecipes('menu_123')
 * if (recipe.success) {
 *   recipe.data.forEach(step => {
 *     console.log(`${step.stepNumber}. ${step.instruction}`)
 *   })
 * }
 * ```
 */
export async function getRecipes(
  menuId: string
): Promise<ServiceResult<unknown>> {
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
      }
    })

    if (!menu) {
      return ServiceResult.error('Menu not found or access denied')
    }

    // Check cache first
    const cacheKey = `menu:recipe:${menuId}`
    const cached = await redis.get(cacheKey)
    if (cached) {
      return ServiceResult.success(JSON.parse(cached))
    }

    // Get recipe steps
    const steps = await db.recipeStep.findMany({
      where: { menuId },
      orderBy: { stepNumber: 'asc' }
    })

    // Cache for 30 minutes
    await redis.setex(cacheKey, 1800, JSON.stringify(steps))

    return ServiceResult.success(steps)

  } catch (error) {
    console.error('Get recipes error:', error)
    return ServiceResult.error('Failed to fetch recipes')
  }
}

/**
 * Get recipe with full menu context
 * 
 * @param menuId - Menu ID
 * @returns Menu with complete recipe
 * 
 * @example
 * ```typescript
 * const result = await getRecipeWithMenu('menu_123')
 * ```
 */
export async function getRecipeWithMenu(
  menuId: string
): Promise<ServiceResult<unknown>> {
  try {
    const session = await auth()
    if (!session?.user) {
      return ServiceResult.error('Unauthorized')
    }

    if (!hasPermission(session.user.userRole, 'READ')) {
      return ServiceResult.error('Insufficient permissions')
    }

    const menu = await db.nutritionMenu.findFirst({
      where: {
        id: menuId,
        program: {
          sppgId: session.user.sppgId!
        }
      },
      include: {
        recipeSteps: {
          orderBy: { stepNumber: 'asc' }
        },
        ingredients: {
          select: {
            ingredientName: true,
            quantity: true,
            unit: true
          }
        }
      }
    })

    if (!menu) {
      return ServiceResult.error('Menu not found or access denied')
    }

    return ServiceResult.success(menu)

  } catch (error) {
    console.error('Get recipe with menu error:', error)
    return ServiceResult.error('Failed to fetch recipe with menu')
  }
}

// ============================================================================
// RECIPE STEP MANAGEMENT
// ============================================================================

/**
 * Create recipe step
 * 
 * @param data - Recipe step details
 * @returns Created recipe step
 * 
 * @example
 * ```typescript
 * const result = await createRecipeStep({
 *   menuId: 'menu_123',
 *   stepNumber: 1,
 *   instruction: 'Panaskan minyak dalam wajan dengan api sedang',
 *   duration: 5,
 *   temperature: '150°C',
 *   equipment: ['Wajan', 'Spatula'],
 *   tips: 'Pastikan minyak benar-benar panas sebelum memasukkan bahan'
 * })
 * ```
 */
export async function createRecipeStep(
  data: CreateRecipeStepInput
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

    const validated = createRecipeStepSchema.safeParse(data)
    if (!validated.success) {
      return ServiceResult.error(validated.error.issues[0].message)
    }

    const { menuId, stepNumber, instruction, duration, temperature, equipment } = validated.data

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

    // Check if step number already exists
    const existingStep = await db.recipeStep.findFirst({
      where: {
        menuId,
        stepNumber
      }
    })

    if (existingStep) {
      return ServiceResult.error(`Step number ${stepNumber} already exists. Use update or choose different number.`)
    }

    // Create recipe step
    const step = await db.recipeStep.create({
      data: {
        menuId,
        stepNumber,
        instruction,
        duration: duration || null,
        temperature: temperature || null,
        equipment: equipment || []
      }
    })

    // Invalidate cache
    await redis.del(`menu:recipe:${menuId}`)
    await redis.del(`menu:${menuId}`)

    // Audit log
    await db.auditLog.create({
      data: {
        sppgId: session.user.sppgId!,
        userId: session.user.id,
        action: 'CREATE',
        entityType: 'RECIPE_STEP',
        entityId: step.id,
        description: `Added recipe step ${stepNumber} to menu "${menu.menuName}"`,
        metadata: {
          menuId,
          stepNumber,
          instruction: instruction.substring(0, 100)
        }
      }
    })

    revalidatePath('/menu')
    revalidatePath(`/menu/${menuId}`)

    return ServiceResult.success(step)

  } catch (error) {
    console.error('Create recipe step error:', error)
    return ServiceResult.error('Failed to create recipe step')
  }
}

/**
 * Update recipe step
 * 
 * @param data - Updated step data
 * @returns Updated recipe step
 * 
 * @example
 * ```typescript
 * const result = await updateRecipeStep({
 *   stepId: 'step_123',
 *   instruction: 'Panaskan minyak dalam wajan dengan api besar',
 *   duration: 3
 * })
 * ```
 */
export async function updateRecipeStep(
  data: UpdateRecipeStepInput
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

    const validated = updateRecipeStepSchema.safeParse(data)
    if (!validated.success) {
      return ServiceResult.error(validated.error.issues[0].message)
    }

    const { stepId, ...updateData } = validated.data

    // Verify step belongs to user's SPPG
    const existingStep = await db.recipeStep.findFirst({
      where: {
        id: stepId,
        menu: {
          program: {
            sppgId: session.user.sppgId!
          }
        }
      }
    })

    if (!existingStep) {
      return ServiceResult.error('Recipe step not found or access denied')
    }

    // If changing step number, check for conflicts
    if (updateData.stepNumber && updateData.stepNumber !== existingStep.stepNumber) {
      const conflict = await db.recipeStep.findFirst({
        where: {
          menuId: existingStep.menuId,
          stepNumber: updateData.stepNumber,
          id: { not: stepId }
        }
      })

      if (conflict) {
        return ServiceResult.error(`Step number ${updateData.stepNumber} already exists`)
      }
    }

    // Update step
    const updatedStep = await db.recipeStep.update({
      where: { id: stepId },
      data: {
        ...(updateData.stepNumber !== undefined && { stepNumber: updateData.stepNumber }),
        ...(updateData.instruction !== undefined && { instruction: updateData.instruction }),
        ...(updateData.duration !== undefined && { duration: updateData.duration }),
        ...(updateData.temperature !== undefined && { temperature: updateData.temperature }),
        ...(updateData.equipment !== undefined && { equipment: updateData.equipment })
      }
    })

    // Invalidate cache
    await redis.del(`menu:recipe:${existingStep.menuId}`)
    await redis.del(`menu:${existingStep.menuId}`)

    // Audit log
    await db.auditLog.create({
      data: {
        sppgId: session.user.sppgId!,
        userId: session.user.id,
        action: 'UPDATE',
        entityType: 'RECIPE_STEP',
        entityId: stepId,
        description: `Updated recipe step ${existingStep.stepNumber}`,
        metadata: {
          menuId: existingStep.menuId,
          stepNumber: existingStep.stepNumber,
          changes: updateData
        }
      }
    })

    revalidatePath('/menu')
    revalidatePath(`/menu/${existingStep.menuId}`)

    return ServiceResult.success(updatedStep)

  } catch (error) {
    console.error('Update recipe step error:', error)
    return ServiceResult.error('Failed to update recipe step')
  }
}

/**
 * Reorder recipe steps
 * 
 * @param data - Menu ID and new step ordering
 * @returns Updated steps
 * 
 * @example
 * ```typescript
 * const result = await reorderRecipeSteps({
 *   menuId: 'menu_123',
 *   steps: [
 *     { id: 'step_1', newStepNumber: 2 },
 *     { id: 'step_2', newStepNumber: 1 },
 *     { id: 'step_3', newStepNumber: 3 }
 *   ]
 * })
 * ```
 */
export async function reorderRecipeSteps(
  data: ReorderStepsInput
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

    const validated = reorderStepsSchema.safeParse(data)
    if (!validated.success) {
      return ServiceResult.error(validated.error.issues[0].message)
    }

    const { menuId, steps } = validated.data

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

    // Update all steps in transaction
    const updatedSteps = await db.$transaction(
      steps.map(step => 
        db.recipeStep.update({
          where: { id: step.id },
          data: { stepNumber: step.newStepNumber }
        })
      )
    )

    // Invalidate cache
    await redis.del(`menu:recipe:${menuId}`)
    await redis.del(`menu:${menuId}`)

    // Audit log
    await db.auditLog.create({
      data: {
        sppgId: session.user.sppgId!,
        userId: session.user.id,
        action: 'UPDATE',
        entityType: 'RECIPE_STEP',
        entityId: menuId,
        description: `Reordered ${steps.length} recipe steps for menu "${menu.menuName}"`,
        metadata: {
          menuId,
          reordering: steps
        }
      }
    })

    revalidatePath('/menu')
    revalidatePath(`/menu/${menuId}`)

    return ServiceResult.success(updatedSteps)

  } catch (error) {
    console.error('Reorder recipe steps error:', error)
    return ServiceResult.error('Failed to reorder recipe steps')
  }
}

/**
 * Delete recipe step
 * 
 * @param stepId - Recipe step ID
 * @returns Success result
 * 
 * @example
 * ```typescript
 * const result = await deleteRecipeStep('step_123')
 * ```
 */
export async function deleteRecipeStep(
  stepId: string
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

    // Verify step belongs to user's SPPG
    const step = await db.recipeStep.findFirst({
      where: {
        id: stepId,
        menu: {
          program: {
            sppgId: session.user.sppgId!
          }
        }
      },
      include: {
        menu: {
          select: {
            menuName: true
          }
        }
      }
    })

    if (!step) {
      return ServiceResult.error('Recipe step not found or access denied')
    }

    // Delete step
    await db.recipeStep.delete({
      where: { id: stepId }
    })

    // Invalidate cache
    await redis.del(`menu:recipe:${step.menuId}`)
    await redis.del(`menu:${step.menuId}`)

    // Audit log
    await db.auditLog.create({
      data: {
        sppgId: session.user.sppgId!,
        userId: session.user.id,
        action: 'DELETE',
        entityType: 'RECIPE_STEP',
        entityId: stepId,
        description: `Deleted recipe step ${step.stepNumber} from menu "${step.menu.menuName}"`,
        metadata: {
          menuId: step.menuId,
          stepNumber: step.stepNumber,
          instruction: step.instruction.substring(0, 100)
        }
      }
    })

    revalidatePath('/menu')
    revalidatePath(`/menu/${step.menuId}`)

    return ServiceResult.success(undefined)

  } catch (error) {
    console.error('Delete recipe step error:', error)
    return ServiceResult.error('Failed to delete recipe step')
  }
}

/**
 * Bulk create recipe steps
 * 
 * @param data - Menu ID and array of steps
 * @returns Created recipe steps
 * 
 * @example
 * ```typescript
 * const result = await bulkCreateRecipeSteps({
 *   menuId: 'menu_123',
 *   steps: [
 *     { stepNumber: 1, instruction: 'Cuci beras hingga bersih', duration: 5 },
 *     { stepNumber: 2, instruction: 'Masak dengan rice cooker', duration: 30 },
 *     { stepNumber: 3, instruction: 'Diamkan 10 menit sebelum disajikan', duration: 10 }
 *   ]
 * })
 * ```
 */
export async function bulkCreateRecipeSteps(
  data: BulkCreateStepsInput
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

    const validated = bulkCreateStepsSchema.safeParse(data)
    if (!validated.success) {
      return ServiceResult.error(validated.error.issues[0].message)
    }

    const { menuId, steps } = validated.data

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

    // Check for duplicate step numbers
    const stepNumbers = steps.map(s => s.stepNumber)
    const duplicates = stepNumbers.filter((num, idx) => stepNumbers.indexOf(num) !== idx)
    if (duplicates.length > 0) {
      return ServiceResult.error(`Duplicate step numbers found: ${duplicates.join(', ')}`)
    }

    // Check if any step numbers already exist
    const existing = await db.recipeStep.findMany({
      where: {
        menuId,
        stepNumber: {
          in: stepNumbers
        }
      }
    })

    if (existing.length > 0) {
      return ServiceResult.error(
        `Step numbers already exist: ${existing.map(s => s.stepNumber).join(', ')}`
      )
    }

    // Create all steps in transaction
    const createdSteps = await db.$transaction(
      steps.map(step => 
        db.recipeStep.create({
          data: {
            menuId,
            stepNumber: step.stepNumber,
            instruction: step.instruction,
            duration: step.duration || null,
            temperature: step.temperature || null,
            equipment: step.equipment || []
          }
        })
      )
    )

    // Invalidate cache
    await redis.del(`menu:recipe:${menuId}`)
    await redis.del(`menu:${menuId}`)

    // Audit log
    await db.auditLog.create({
      data: {
        sppgId: session.user.sppgId!,
        userId: session.user.id,
        action: 'CREATE',
        entityType: 'RECIPE_STEP',
        entityId: menuId,
        description: `Bulk created ${steps.length} recipe steps for menu "${menu.menuName}"`,
        metadata: {
          menuId,
          count: steps.length,
          stepNumbers: stepNumbers
        }
      }
    })

    revalidatePath('/menu')
    revalidatePath(`/menu/${menuId}`)

    return ServiceResult.success(createdSteps)

  } catch (error) {
    console.error('Bulk create recipe steps error:', error)
    return ServiceResult.error('Failed to bulk create recipe steps')
  }
}

/**
 * Delete all recipe steps for menu
 * 
 * @param menuId - Menu ID
 * @returns Success result with count
 * 
 * @example
 * ```typescript
 * const result = await deleteAllRecipeSteps('menu_123')
 * ```
 */
export async function deleteAllRecipeSteps(
  menuId: string
): Promise<ServiceResult<{ count: number }>> {
  try {
    const session = await auth()
    if (!session?.user) {
      return ServiceResult.error('Unauthorized')
    }

    if (!hasPermission(session.user.userRole, 'DELETE') && 
        !hasPermission(session.user.userRole, 'MENU_MANAGE')) {
      return ServiceResult.error('Insufficient permissions')
    }

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

    // Delete all steps
    const result = await db.recipeStep.deleteMany({
      where: { menuId }
    })

    // Invalidate cache
    await redis.del(`menu:recipe:${menuId}`)
    await redis.del(`menu:${menuId}`)

    // Audit log
    await db.auditLog.create({
      data: {
        sppgId: session.user.sppgId!,
        userId: session.user.id,
        action: 'DELETE',
        entityType: 'RECIPE_STEP',
        entityId: menuId,
        description: `Deleted all ${result.count} recipe steps from menu "${menu.menuName}"`,
        metadata: {
          menuId,
          count: result.count
        }
      }
    })

    revalidatePath('/menu')
    revalidatePath(`/menu/${menuId}`)

    return ServiceResult.success({ count: result.count })

  } catch (error) {
    console.error('Delete all recipe steps error:', error)
    return ServiceResult.error('Failed to delete all recipe steps')
  }
}
