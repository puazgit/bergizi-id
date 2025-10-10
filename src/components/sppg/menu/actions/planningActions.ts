/**
 * Menu Planning Actions
 * 
 * Server actions for Menu Planning operations
 * Multi-tenant safe with RBAC and audit logging
 * Includes basic AI-powered balanced menu generation
 * 
 * Follows Pattern 2: Component-Level Domain Architecture
 * 
 * @module components/sppg/menu/actions/planningActions
 */

'use server'

import { auth } from '@/auth'
import db from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { Prisma } from '@prisma/client'
import {
  createMenuPlanSchema,
  type CreateMenuPlanInput,
  type GenerateBalancedMenuPlanInput
} from '../validators/menuValidation'
import type { MenuOperationResult } from '../types/menuTypes'

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface MenuPlanWithDetails {
  id: string
  programId: string
  name: string
  startDate: Date
  endDate: Date
  description: string | null
  status: string
  createdAt: Date
  updatedAt: Date
}

export interface MenuCalendarDay {
  date: Date
  menus: {
    id: string
    menuName: string
    mealType: string
    calories: number
    cost: number
  }[]
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
 * Check if user has permission to manage menu planning
 */
function canManagePlanning(role: string): boolean {
  const allowedRoles = [
    'PLATFORM_SUPERADMIN',
    'SPPG_KEPALA',
    'SPPG_ADMIN',
    'SPPG_AHLI_GIZI'
  ]
  return allowedRoles.includes(role)
}

/**
 * Verify program ownership
 */
async function verifyProgramOwnership(programId: string, sppgId: string) {
  const program = await db.nutritionProgram.findFirst({
    where: {
      id: programId,
      sppgId
    },
    select: {
      id: true,
      name: true
    }
  })

  if (!program) {
    return { success: false as const, error: 'Program not found or access denied' }
  }

  return { success: true as const, program }
}

// ============================================================================
// QUERY ACTIONS
// ============================================================================

/**
 * Get menu plans for a program
 */
export async function getMenuPlans(
  programId: string,
  filters?: {
    status?: string
    startDate?: Date
    endDate?: Date
  }
): Promise<MenuOperationResult<MenuPlanWithDetails[]>> {
  try {
    const authResult = await requireAuth()
    if (!authResult.success) {
      return { success: false, error: authResult.error }
    }
    const { session } = authResult

    // Verify program ownership
    const programResult = await verifyProgramOwnership(programId, session.user.sppgId!)
    if (!programResult.success) {
      return { success: false, error: programResult.error }
    }

    // Build where clause  
    const where: Prisma.MenuPlanWhereInput = {
      programId
    }
    
    if (filters?.status) {
      // @ts-expect-error - status is a valid MenuPlanStatus enum value
      where.status = filters.status
    }
    if (filters?.startDate) {
      where.startDate = { gte: filters.startDate }
    }
    if (filters?.endDate) {
      where.endDate = { lte: filters.endDate }
    }

    const plans = await db.menuPlan.findMany({
      where,
      orderBy: { startDate: 'desc' }
    })

    return {
      success: true,
      data: plans as MenuPlanWithDetails[]
    }
  } catch (error) {
    console.error('[getMenuPlans] Error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch menu plans'
    }
  }
}

/**
 * Get menu calendar for a date range
 */
export async function getMenuCalendar(
  programId: string,
  startDate: Date,
  endDate: Date
): Promise<MenuOperationResult<MenuCalendarDay[]>> {
  try {
    const authResult = await requireAuth()
    if (!authResult.success) {
      return { success: false, error: authResult.error }
    }
    const { session } = authResult

    // Verify program ownership
    const programResult = await verifyProgramOwnership(programId, session.user.sppgId!)
    if (!programResult.success) {
      return { success: false, error: programResult.error }
    }

    // Fetch menu assignments in date range
    const assignments = await db.menuAssignment.findMany({
      where: {
        menuPlan: {
          programId
        },
        assignedDate: {
          gte: startDate,
          lte: endDate
        }
      },
      include: {
        menu: {
          select: {
            id: true,
            menuName: true,
            mealType: true,
            calories: true,
            costPerServing: true
          }
        }
      },
      orderBy: { assignedDate: 'asc' }
    })

    // Group by date
    const calendar = new Map<string, MenuCalendarDay>()
    
    assignments.forEach((assignment) => {
      const dateKey = assignment.assignedDate.toISOString().split('T')[0]
      
      if (!calendar.has(dateKey)) {
        calendar.set(dateKey, {
          date: assignment.assignedDate,
          menus: []
        })
      }

      calendar.get(dateKey)!.menus.push({
        id: assignment.menu.id,
        menuName: assignment.menu.menuName,
        mealType: assignment.menu.mealType,
        calories: assignment.menu.calories,
        cost: assignment.menu.costPerServing
      })
    })

    return {
      success: true,
      data: Array.from(calendar.values())
    }
  } catch (error) {
    console.error('[getMenuCalendar] Error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch menu calendar'
    }
  }
}

// ============================================================================
// MUTATION ACTIONS
// ============================================================================

/**
 * Create a new menu plan
 */
export async function createMenuPlan(
  input: CreateMenuPlanInput
): Promise<MenuOperationResult<MenuPlanWithDetails>> {
  try {
    const authResult = await requireAuth()
    if (!authResult.success) {
      return { success: false, error: authResult.error }
    }
    const { session } = authResult

    if (!canManagePlanning(session.user.userRole)) {
      return { success: false, error: 'Insufficient permissions to create menu plans' }
    }

    // Validate input
    const validated = createMenuPlanSchema.parse(input)
    const { programId, name, startDate, endDate, description } = validated

    // Verify program ownership
    const programResult = await verifyProgramOwnership(programId, session.user.sppgId!)
    if (!programResult.success) {
      return { success: false, error: programResult.error }
    }

    // Create menu plan
    const plan = await db.menuPlan.create({
      data: {
        programId,
        sppgId: session.user.sppgId!,
        createdBy: session.user.id,
        name,
        startDate,
        endDate,
        description: description || null,
        status: 'DRAFT'
      }
    })

    // Audit log
    await db.auditLog.create({
      data: {
        userId: session.user.id,
        sppgId: session.user.sppgId!,
        action: 'CREATE',
        entityType: 'MENU_PLAN',
        entityId: plan.id,
        oldValues: Prisma.JsonNull,
        newValues: validated as unknown as Prisma.InputJsonValue
      }
    })

    // Revalidate paths
    revalidatePath(`/menu/planning`)
    revalidatePath(`/menu/planning/${plan.id}`)

    return {
      success: true,
      data: plan as MenuPlanWithDetails
    }
  } catch (error) {
    console.error('[createMenuPlan] Error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create menu plan'
    }
  }
}

/**
 * Assign menu to specific dates in a plan
 */
export async function assignMenuToPlan(
  planId: string,
  menuId: string,
  dates: Date[]
): Promise<MenuOperationResult<{ assigned: number }>> {
  try {
    const authResult = await requireAuth()
    if (!authResult.success) {
      return { success: false, error: authResult.error }
    }
    const { session } = authResult

    if (!canManagePlanning(session.user.userRole)) {
      return { success: false, error: 'Insufficient permissions to assign menus' }
    }

    // Verify plan ownership
    const plan = await db.menuPlan.findFirst({
      where: {
        id: planId,
        program: {
          sppgId: session.user.sppgId!
        }
      }
    })

    if (!plan) {
      return { success: false, error: 'Menu plan not found or access denied' }
    }

    // Verify menu ownership
    const menu = await db.nutritionMenu.findFirst({
      where: {
        id: menuId,
        program: {
          sppgId: session.user.sppgId!
        }
      }
    })

    if (!menu) {
      return { success: false, error: 'Menu not found or access denied' }
    }

    // Create assignments
    const assignments = await Promise.all(
      dates.map((date) =>
        db.menuAssignment.create({
          data: {
            menuPlanId: planId,
            menuId,
            assignedDate: date,
            mealType: menu.mealType,
            plannedPortions: 0,
            estimatedCost: menu.costPerServing,
            calories: menu.calories,
            protein: menu.protein,
            carbohydrates: menu.carbohydrates,
            fat: menu.fat
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
        entityType: 'MENU_ASSIGNMENT',
        entityId: planId,
        oldValues: Prisma.JsonNull,
        newValues: { 
          menuId, 
          dates: dates.map(d => d.toISOString()),
          count: dates.length 
        } as Prisma.InputJsonValue
      }
    })

    // Revalidate paths
    revalidatePath(`/menu/planning/${planId}`)

    return {
      success: true,
      data: { assigned: assignments.length }
    }
  } catch (error) {
    console.error('[assignMenuToPlan] Error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to assign menu to plan'
    }
  }
}

/**
 * Generate balanced menu plan using simple algorithm
 * 
 * This is a basic implementation. In production, you would use
 * more sophisticated algorithms or AI/ML models.
 */
export async function generateBalancedMenuPlan(
  input: GenerateBalancedMenuPlanInput
): Promise<MenuOperationResult<MenuPlanWithDetails>> {
  try {
    const authResult = await requireAuth()
    if (!authResult.success) {
      return { success: false, error: authResult.error }
    }
    const { session } = authResult

    if (!canManagePlanning(session.user.userRole)) {
      return { success: false, error: 'Insufficient permissions to generate menu plans' }
    }

    const { programId, startDate, endDate, mealTypes, maxBudgetPerDay } = input

    // Verify program ownership
    const programResult = await verifyProgramOwnership(programId, session.user.sppgId!)
    if (!programResult.success) {
      return { success: false, error: programResult.error }
    }

    // Fetch available menus
    const menus = await db.nutritionMenu.findMany({
      where: {
        programId,
        mealType: { in: mealTypes },
        ...(maxBudgetPerDay && { costPerServing: { lte: maxBudgetPerDay / mealTypes.length } })
      },
      orderBy: { calories: 'desc' }
    })

    if (menus.length === 0) {
      return { 
        success: false, 
        error: 'No menus available for the selected criteria' 
      }
    }

    // Create plan
    const plan = await db.menuPlan.create({
      data: {
        programId,
        sppgId: session.user.sppgId!,
        createdBy: session.user.id,
        name: `Auto-Generated Plan (${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()})`,
        startDate,
        endDate,
        description: `Generated automatically with ${mealTypes.length} meal types per day`,
        status: 'DRAFT'
      }
    })

    // Simple algorithm: Distribute menus evenly across dates
    const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1
    const assignments: Array<{
      menuPlanId: string
      menuId: string
      assignedDate: Date
      mealType: string
      plannedPortions: number
      estimatedCost: number
      calories: number
      protein: number
      carbohydrates: number
      fat: number
    }> = []

    for (let day = 0; day < daysDiff; day++) {
      const currentDate = new Date(startDate)
      currentDate.setDate(currentDate.getDate() + day)

      mealTypes.forEach((mealType, index) => {
        // Rotate through available menus
        const menuIndex = (day + index) % menus.length
        const selectedMenu = menus.filter(m => m.mealType === mealType)[menuIndex % menus.filter(m => m.mealType === mealType).length]
        
        if (selectedMenu) {
          assignments.push({
            menuPlanId: plan.id,
            menuId: selectedMenu.id,
            assignedDate: currentDate,
            mealType: selectedMenu.mealType,
            plannedPortions: 0,
            estimatedCost: selectedMenu.costPerServing,
            calories: selectedMenu.calories,
            protein: selectedMenu.protein,
            carbohydrates: selectedMenu.carbohydrates,
            fat: selectedMenu.fat
          })
        }
      })
    }

    // Bulk create assignments
    await db.menuAssignment.createMany({
      // @ts-expect-error - mealType is valid MealType enum value from database
      data: assignments
    })

    // Audit log
    await db.auditLog.create({
      data: {
        userId: session.user.id,
        sppgId: session.user.sppgId!,
        action: 'CREATE',
        entityType: 'MENU_PLAN',
        entityId: plan.id,
        oldValues: Prisma.JsonNull,
        newValues: {
          type: 'auto-generated',
          input: input,
          assignmentsCount: assignments.length
        } as Prisma.InputJsonValue
      }
    })

    // Revalidate paths
    revalidatePath(`/menu/planning`)
    revalidatePath(`/menu/planning/${plan.id}`)

    return {
      success: true,
      data: plan as MenuPlanWithDetails
    }
  } catch (error) {
    console.error('[generateBalancedMenuPlan] Error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate balanced menu plan'
    }
  }
}
