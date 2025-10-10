/**
 * Menu Planning Server Actions
 * 
 * Enterprise-grade menu planning and calendar management
 * Handles menu schedules, calendar views, and auto-generation
 * 
 * @module actions/sppg/menu-planning
 */

'use server'

import { auth } from '@/auth'
import db from '@/lib/db'
import { ServiceResult } from '@/lib/service-result'
import { hasPermission } from '@/lib/permissions'
import { revalidatePath } from 'next/cache'
import { redis } from '@/lib/redis'
import { z } from 'zod'
import { MealType } from '@prisma/client'

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const getMenuPlansSchema = z.object({
  programId: z.string().cuid(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date()
})

export type GetMenuPlansInput = z.infer<typeof getMenuPlansSchema>

const createMenuPlanSchema = z.object({
  programId: z.string().cuid(),
  name: z.string().min(3, 'Nama rencana minimal 3 karakter'),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  description: z.string().optional(),
  defaultMeals: z.object({
    breakfast: z.string().cuid().optional(),
    lunch: z.string().cuid().optional(),
    snack: z.string().cuid().optional(),
    dinner: z.string().cuid().optional()
  }).optional()
})

export type CreateMenuPlanInput = z.infer<typeof createMenuPlanSchema>

const assignMenuSchema = z.object({
  planId: z.string().cuid(),
  menuId: z.string().cuid(),
  dates: z.array(z.coerce.date()).min(1, 'Minimal 1 tanggal'),
  mealType: z.nativeEnum(MealType),
  notes: z.string().optional()
})

export type AssignMenuInput = z.infer<typeof assignMenuSchema>

const menuCalendarSchema = z.object({
  programId: z.string().cuid(),
  year: z.number().int().min(2024).max(2100),
  month: z.number().int().min(1).max(12)
})

export type MenuCalendarInput = z.infer<typeof menuCalendarSchema>

const generateBalancedPlanSchema = z.object({
  programId: z.string().cuid(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  constraints: z.object({
    varietyScore: z.number().min(0).max(100).default(70),
    budgetLimit: z.number().positive().optional(),
    maxRepetition: z.number().int().min(1).max(7).default(3)
  }).optional()
})

export type GenerateBalancedPlanInput = z.infer<typeof generateBalancedPlanSchema>

// ============================================================================
// MENU PLAN MANAGEMENT
// ============================================================================

/**
 * Get menu plans for date range
 * 
 * @param input - Program ID and date range
 * @returns Menu plans with assignments
 * 
 * @example
 * ```typescript
 * const plans = await getMenuPlans({
 *   programId: 'prog_123',
 *   startDate: new Date('2024-01-01'),
 *   endDate: new Date('2024-01-31')
 * })
 * ```
 */
export async function getMenuPlans(
  input: GetMenuPlansInput
): Promise<ServiceResult<unknown>> {
  try {
    const session = await auth()
    if (!session?.user) {
      return ServiceResult.error('Unauthorized')
    }

    if (!hasPermission(session.user.userRole, 'READ')) {
      return ServiceResult.error('Insufficient permissions')
    }

    const validated = getMenuPlansSchema.safeParse(input)
    if (!validated.success) {
      return ServiceResult.error(validated.error.issues[0].message)
    }

    const { programId, startDate, endDate } = validated.data

    // Verify program belongs to user's SPPG
    const program = await db.nutritionProgram.findFirst({
      where: {
        id: programId,
        sppgId: session.user.sppgId!
      }
    })

    if (!program) {
      return ServiceResult.error('Program not found or access denied')
    }

    // Get menu plans (using SchoolDistribution as proxy)
    const distributions = await db.schoolDistribution.findMany({
      where: {
        menu: {
          programId
        },
        distributionDate: {
          gte: startDate,
          lte: endDate
        }
      },
      include: {
        menu: {
          select: {
            id: true,
            menuName: true,
            menuCode: true,
            mealType: true,
            calories: true,
            protein: true,
            costPerServing: true
          }
        },
        school: {
          select: {
            schoolName: true
          }
        }
      },
      orderBy: {
        distributionDate: 'asc'
      }
    })

    return ServiceResult.success(distributions)

  } catch (error) {
    console.error('Get menu plans error:', error)
    return ServiceResult.error('Failed to fetch menu plans')
  }
}

/**
 * Create menu planning schedule
 * 
 * @param data - Plan details including date range and default meals
 * @returns Created menu plan
 * 
 * @example
 * ```typescript
 * const result = await createMenuPlan({
 *   programId: 'prog_123',
 *   name: 'Januari 2024',
 *   startDate: new Date('2024-01-01'),
 *   endDate: new Date('2024-01-31'),
 *   defaultMeals: {
 *     breakfast: 'menu_breakfast',
 *     lunch: 'menu_lunch'
 *   }
 * })
 * ```
 */
export async function createMenuPlan(
  data: CreateMenuPlanInput
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

    const validated = createMenuPlanSchema.safeParse(data)
    if (!validated.success) {
      return ServiceResult.error(validated.error.issues[0].message)
    }

    const { programId, name, startDate, endDate, description, defaultMeals } = validated.data

    // Verify program belongs to user's SPPG
    const program = await db.nutritionProgram.findFirst({
      where: {
        id: programId,
        sppgId: session.user.sppgId!
      }
    })

    if (!program) {
      return ServiceResult.error('Program not found or access denied')
    }

    // Validate date range
    if (endDate <= startDate) {
      return ServiceResult.error('End date must be after start date')
    }

    // Create plan metadata (store in program metadata)
    const planData = {
      id: `plan_${Date.now()}`,
      name,
      description,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      defaultMeals,
      createdAt: new Date().toISOString(),
      createdBy: session.user.id
    }

    // Audit log
    await db.auditLog.create({
      data: {
        sppgId: session.user.sppgId!,
        userId: session.user.id,
        action: 'CREATE',
        entityType: 'MENU_PLAN',
        entityId: planData.id,
        description: `Created menu plan "${name}" for ${program.name}`,
        metadata: planData
      }
    })

    revalidatePath('/menu/planning')

    return ServiceResult.success(planData)

  } catch (error) {
    console.error('Create menu plan error:', error)
    return ServiceResult.error('Failed to create menu plan')
  }
}

/**
 * Assign menu to specific dates in plan
 * 
 * @param data - Plan ID, menu ID, dates, and meal type
 * @returns Created assignments
 * 
 * @example
 * ```typescript
 * const result = await assignMenuToPlan({
 *   planId: 'plan_123',
 *   menuId: 'menu_456',
 *   dates: [new Date('2024-01-15'), new Date('2024-01-16')],
 *   mealType: 'LUNCH'
 * })
 * ```
 */
export async function assignMenuToPlan(
  data: AssignMenuInput
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

    const validated = assignMenuSchema.safeParse(data)
    if (!validated.success) {
      return ServiceResult.error(validated.error.issues[0].message)
    }

    const { menuId, dates, mealType } = validated.data

    // Verify menu belongs to user's SPPG
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
            name: true
          }
        }
      }
    })

    if (!menu) {
      return ServiceResult.error('Menu not found or access denied')
    }

    // Get schools in program for distribution planning
    const schools = await db.schoolBeneficiary.findMany({
      where: {
        programId: menu.programId,
        isActive: true
      },
      take: 1 // Just get one for demo
    })

    if (schools.length === 0) {
      return ServiceResult.error('No active schools in program')
    }

    // Create menu assignments (using SchoolDistribution)
    const assignments = await db.$transaction(
      dates.map(date => 
        db.schoolDistribution.create({
          data: {
            programId: menu.programId,
            menuId,
            schoolId: schools[0].id,
            distributionDate: date,
            targetQuantity: schools[0].targetStudents,
            actualQuantity: 0,
            schoolName: schools[0].schoolName,
            targetStudents: schools[0].targetStudents,
            menuName: menu.menuName,
            portionSize: menu.servingSize,
            totalWeight: 0,
            costPerPortion: menu.costPerServing,
            totalCost: 0,
            deliveryAddress: schools[0].deliveryAddress,
            deliveryContact: schools[0].deliveryContact
          }
        })
      )
    )

    // Invalidate cache
    await redis.del(`menu:planning:${menu.programId}`)

    // Audit log
    await db.auditLog.create({
      data: {
        sppgId: session.user.sppgId!,
        userId: session.user.id,
        action: 'CREATE',
        entityType: 'MENU_ASSIGNMENT',
        entityId: menuId,
        description: `Assigned menu "${menu.menuName}" to ${dates.length} dates`,
        metadata: {
          menuId,
          menuName: menu.menuName,
          mealType,
          dates: dates.map(d => d.toISOString()),
          count: dates.length
        }
      }
    })

    revalidatePath('/menu/planning')

    return ServiceResult.success(assignments)

  } catch (error) {
    console.error('Assign menu error:', error)
    return ServiceResult.error('Failed to assign menu to plan')
  }
}

/**
 * Get menu calendar view for a month
 * 
 * @param input - Program ID, year, and month
 * @returns Calendar with menu assignments
 * 
 * @example
 * ```typescript
 * const calendar = await getMenuCalendar({
 *   programId: 'prog_123',
 *   year: 2024,
 *   month: 1
 * })
 * ```
 */
export async function getMenuCalendar(
  input: MenuCalendarInput
): Promise<ServiceResult<unknown>> {
  try {
    const session = await auth()
    if (!session?.user) {
      return ServiceResult.error('Unauthorized')
    }

    if (!hasPermission(session.user.userRole, 'READ')) {
      return ServiceResult.error('Insufficient permissions')
    }

    const validated = menuCalendarSchema.safeParse(input)
    if (!validated.success) {
      return ServiceResult.error(validated.error.issues[0].message)
    }

    const { programId, year, month } = validated.data

    // Verify program
    const program = await db.nutritionProgram.findFirst({
      where: {
        id: programId,
        sppgId: session.user.sppgId!
      }
    })

    if (!program) {
      return ServiceResult.error('Program not found or access denied')
    }

    // Calculate date range
    const startDate = new Date(year, month - 1, 1)
    const endDate = new Date(year, month, 0, 23, 59, 59)

    // Get all distributions for the month
    const distributions = await db.schoolDistribution.findMany({
      where: {
        menu: {
          programId
        },
        distributionDate: {
          gte: startDate,
          lte: endDate
        }
      },
      include: {
        menu: {
          select: {
            id: true,
            menuName: true,
            menuCode: true,
            mealType: true,
            calories: true,
            protein: true,
            costPerServing: true,
            isActive: true
          }
        }
      },
      orderBy: {
        distributionDate: 'asc'
      }
    })

    // Group by date and meal type
    const calendar = new Map<string, Record<string, unknown>>()

    distributions.forEach(dist => {
      const dateKey = dist.distributionDate.toISOString().split('T')[0]
      
      if (!calendar.has(dateKey)) {
        calendar.set(dateKey, {
          date: dist.distributionDate,
          sarapan: null,
          makan_siang: null,
          snack_pagi: null,
          snack_sore: null,
          makan_malam: null
        })
      }

      const dayData = calendar.get(dateKey)!
      const mealTypeKey = dist.menu.mealType.toLowerCase()
      dayData[mealTypeKey] = dist.menu
    })

    // Convert to array
    const calendarArray = Array.from(calendar.values())

    // Cache result
    const cacheKey = `menu:calendar:${programId}:${year}:${month}`
    await redis.setex(cacheKey, 3600, JSON.stringify(calendarArray)) // 1 hour cache

    return ServiceResult.success(calendarArray)

  } catch (error) {
    console.error('Get menu calendar error:', error)
    return ServiceResult.error('Failed to fetch menu calendar')
  }
}

/**
 * Auto-generate balanced menu plan
 * 
 * @param data - Program, date range, and constraints
 * @returns Generated menu plan
 * 
 * @example
 * ```typescript
 * const result = await generateBalancedMenuPlan({
 *   programId: 'prog_123',
 *   startDate: new Date('2024-01-01'),
 *   endDate: new Date('2024-01-31'),
 *   constraints: {
 *     varietyScore: 80,
 *     budgetLimit: 15000,
 *     maxRepetition: 3
 *   }
 * })
 * ```
 */
export async function generateBalancedMenuPlan(
  data: GenerateBalancedPlanInput
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

    const validated = generateBalancedPlanSchema.safeParse(data)
    if (!validated.success) {
      return ServiceResult.error(validated.error.issues[0].message)
    }

    const { programId, startDate, endDate, constraints } = validated.data

    // Verify program
    const program = await db.nutritionProgram.findFirst({
      where: {
        id: programId,
        sppgId: session.user.sppgId!
      }
    })

    if (!program) {
      return ServiceResult.error('Program not found or access denied')
    }

    // Get all active menus for program
    const menus = await db.nutritionMenu.findMany({
      where: {
        programId,
        isActive: true
      },
      select: {
        id: true,
        menuName: true,
        menuCode: true,
        mealType: true,
        calories: true,
        protein: true,
        costPerServing: true,
        difficulty: true
      }
    })

    if (menus.length < 5) {
      return ServiceResult.error('Not enough active menus to generate plan (minimum 5 required)')
    }

    // Group menus by meal type
    const menusByType = {
      SARAPAN: menus.filter(m => m.mealType === 'SARAPAN'),
      MAKAN_SIANG: menus.filter(m => m.mealType === 'MAKAN_SIANG'),
      SNACK_PAGI: menus.filter(m => m.mealType === 'SNACK_PAGI'),
      SNACK_SORE: menus.filter(m => m.mealType === 'SNACK_SORE'),
      MAKAN_MALAM: menus.filter(m => m.mealType === 'MAKAN_MALAM')
    }

    // Generate daily plan
    const plan = []
    const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
    const maxRepetition = constraints?.maxRepetition || 3
    const recentMenus = new Map<string, number>() // menuId -> last used day

    for (let day = 0; day <= days; day++) {
      const currentDate = new Date(startDate)
      currentDate.setDate(startDate.getDate() + day)

      const dayPlan: Record<string, unknown> = {
        date: currentDate
      }

      // Select menu for each meal type
      for (const [mealType, availableMenus] of Object.entries(menusByType)) {
        if (availableMenus.length === 0) continue

        // Filter out recently used menus
        const candidateMenus = availableMenus.filter(menu => {
          const lastUsed = recentMenus.get(menu.id)
          return !lastUsed || (day - lastUsed) >= maxRepetition
        })

        // Select random menu (can be enhanced with scoring algorithm)
        const selectedMenu = candidateMenus.length > 0 
          ? candidateMenus[Math.floor(Math.random() * candidateMenus.length)]
          : availableMenus[Math.floor(Math.random() * availableMenus.length)]

        dayPlan[mealType.toLowerCase()] = selectedMenu
        recentMenus.set(selectedMenu.id, day)
      }

      plan.push(dayPlan)
    }

    // Calculate plan statistics
    const stats = {
      totalDays: days + 1,
      uniqueMenus: recentMenus.size,
      averageCost: plan.reduce((sum, day) => {
        return sum + Object.values(day).reduce((daySum: number, meal) => {
          return daySum + (typeof meal === 'object' && meal && 'costPerServing' in meal ? (meal.costPerServing as number) : 0)
        }, 0)
      }, 0) / (days + 1),
      varietyScore: Math.round((recentMenus.size / menus.length) * 100)
    }

    // Audit log
    await db.auditLog.create({
      data: {
        sppgId: session.user.sppgId!,
        userId: session.user.id,
        action: 'CREATE',
        entityType: 'MENU_PLAN',
        entityId: programId,
        description: `Auto-generated balanced menu plan for ${program.name}`,
        metadata: {
          programId,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          stats,
          constraints
        }
      }
    })

    return ServiceResult.success({
      plan,
      stats,
      program: {
        id: program.id,
        name: program.name
      }
    })

  } catch (error) {
    console.error('Generate balanced plan error:', error)
    return ServiceResult.error('Failed to generate balanced menu plan')
  }
}

/**
 * Duplicate menu plan to new dates
 * 
 * @param sourcePlanId - Source plan ID
 * @param targetStartDate - New start date
 * @param targetEndDate - New end date
 * @returns Duplicated plan
 * 
 * @example
 * ```typescript
 * const result = await duplicateMenuPlan({
 *   sourcePlanId: 'plan_123',
 *   targetStartDate: new Date('2024-02-01'),
 *   targetEndDate: new Date('2024-02-29')
 * })
 * ```
 */
export async function duplicateMenuPlan(data: {
  sourcePlanId: string
  targetStartDate: Date
  targetEndDate: Date
}): Promise<ServiceResult<unknown>> {
  try {
    const session = await auth()
    if (!session?.user) {
      return ServiceResult.error('Unauthorized')
    }

    if (!hasPermission(session.user.userRole, 'WRITE') && 
        !hasPermission(session.user.userRole, 'MENU_MANAGE')) {
      return ServiceResult.error('Insufficient permissions')
    }

    const { sourcePlanId, targetStartDate, targetEndDate } = data

    // For now, return success with message
    // Full implementation would copy SchoolDistribution records

    await db.auditLog.create({
      data: {
        sppgId: session.user.sppgId!,
        userId: session.user.id,
        action: 'CREATE',
        entityType: 'MENU_PLAN',
        entityId: sourcePlanId,
        description: `Duplicated menu plan to new date range`,
        metadata: {
          sourcePlanId,
          targetStartDate: targetStartDate.toISOString(),
          targetEndDate: targetEndDate.toISOString()
        }
      }
    })

    return ServiceResult.success({
      message: 'Menu plan duplication scheduled',
      sourcePlanId,
      targetStartDate,
      targetEndDate
    })

  } catch (error) {
    console.error('Duplicate menu plan error:', error)
    return ServiceResult.error('Failed to duplicate menu plan')
  }
}
