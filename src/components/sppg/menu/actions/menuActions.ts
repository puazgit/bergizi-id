/**
 * Menu CRUD Actions
 * 
 * Server actions for Menu Management CRUD operations
 * Multi-tenant safe with RBAC and audit logging
 * 
 * Follows Pattern 2: Component-Level Domain Architecture
 * 
 * @module components/sppg/menu/actions
 */

'use server'

import { auth } from '@/auth'
import db from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { Prisma } from '@prisma/client'
import {
  createMenuSchema,
  updateMenuSchema,
  menuFiltersSchema,
  type CreateMenuInput,
  type UpdateMenuInput,
  type MenuFilters
} from '../validators/menuValidation'
import type {
  MenuWithDetails,
  MenuStats,
  PaginatedMenusResult,
  MenuOperationResult
} from '../types/menuTypes'

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Check authentication and get user session
 */
async function requireAuth() {
  const session = await auth()
  
  if (!session?.user) {
    return { success: false as const, error: 'Unauthorized - Please login' }
  }
  
  if (!session.user.sppgId) {
    return { success: false as const, error: 'No SPPG association found' }
  }
  
  return { success: true as const, session }
}

/**
 * Check if user has menu management permission
 */
function canManageMenu(userRole: string): boolean {
  const allowedRoles = [
    'SPPG_KEPALA',
    'SPPG_ADMIN',
    'SPPG_AHLI_GIZI',
    'PLATFORM_SUPERADMIN'
  ]
  
  return allowedRoles.includes(userRole)
}

/**
 * Build menu query filters (multi-tenant safe)
 */
function buildMenuFilters(
  filters: MenuFilters | undefined,
  sppgId: string
): Prisma.NutritionMenuWhereInput {
  const where: Prisma.NutritionMenuWhereInput = {
    program: {
      sppgId // CRITICAL: Always filter by SPPG!
    }
  }
  
  if (!filters) return where
  
  // Program filter
  if (filters.programId) {
    where.programId = filters.programId
  }
  
  // Meal type filter
  if (filters.mealType) {
    where.mealType = filters.mealType
  }
  
  // Active status filter
  if (filters.isActive !== undefined) {
    where.isActive = filters.isActive
  }
  
  // Nutrition filters
  if (filters.minCalories !== undefined || filters.maxCalories !== undefined) {
    where.calories = {
      ...(filters.minCalories !== undefined && { gte: filters.minCalories }),
      ...(filters.maxCalories !== undefined && { lte: filters.maxCalories })
    }
  }
  
  if (filters.minProtein !== undefined || filters.maxProtein !== undefined) {
    where.protein = {
      ...(filters.minProtein !== undefined && { gte: filters.minProtein }),
      ...(filters.maxProtein !== undefined && { lte: filters.maxProtein })
    }
  }
  
  // Cost filter
  if (filters.minCost !== undefined || filters.maxCost !== undefined) {
    where.costPerServing = {
      ...(filters.minCost !== undefined && { gte: filters.minCost }),
      ...(filters.maxCost !== undefined && { lte: filters.maxCost })
    }
  }
  
  // Search filter (name or code)
  if (filters.search) {
    where.OR = [
      { menuName: { contains: filters.search, mode: 'insensitive' } },
      { menuCode: { contains: filters.search, mode: 'insensitive' } }
    ]
  }
  
  return where
}

/**
 * Build order by clause
 */
function buildOrderBy(
  sortBy: string = 'createdAt',
  sortOrder: 'asc' | 'desc' = 'desc'
): Prisma.NutritionMenuOrderByWithRelationInput {
  return {
    [sortBy]: sortOrder
  }
}

// ============================================================================
// QUERY ACTIONS
// ============================================================================

/**
 * Get menus list with pagination and filters
 * 
 * @example
 * ```ts
 * const result = await getMenus({
 *   programId: 'abc123',
 *   mealType: 'SARAPAN',
 *   isActive: true,
 *   page: 1,
 *   limit: 20
 * })
 * ```
 */
export async function getMenus(
  filters?: MenuFilters
): Promise<MenuOperationResult<PaginatedMenusResult>> {
  try {
    // 1. Authentication check
    const authResult = await requireAuth()
    if (!authResult.success) {
      return { success: false, error: authResult.error }
    }
    const { session } = authResult
    
    // 2. Validate filters
    const validatedFilters = filters 
      ? menuFiltersSchema.parse(filters)
      : undefined
    
    // 3. Build query
    const where = buildMenuFilters(validatedFilters, session.user.sppgId!)
    const orderBy = buildOrderBy(
      validatedFilters?.sortBy,
      validatedFilters?.sortOrder
    )
    
    // 4. Pagination
    const page = validatedFilters?.page || 1
    const limit = validatedFilters?.limit || 20
    const skip = (page - 1) * limit
    
    // 5. Execute queries (parallel)
    const [menus, total] = await Promise.all([
      db.nutritionMenu.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        select: {
          id: true,
          menuCode: true,
          menuName: true,
          mealType: true,
          servingSize: true,
          calories: true,
          protein: true,
          carbohydrates: true,
          fat: true,
          costPerServing: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
          program: {
            select: {
              id: true,
              name: true,
              sppgId: true
            }
          },
          _count: {
            select: {
              ingredients: true,
              recipeSteps: true
            }
          }
        }
      }),
      db.nutritionMenu.count({ where })
    ])
    
    // 6. Transform to MenuListItem
    const items = menus.map((menu) => ({
      id: menu.id,
      menuCode: menu.menuCode,
      menuName: menu.menuName,
      mealType: menu.mealType,
      servingSize: menu.servingSize,
      calories: menu.calories,
      protein: menu.protein,
      carbohydrates: menu.carbohydrates,
      fat: menu.fat,
      costPerServing: menu.costPerServing,
      isActive: menu.isActive,
      program: menu.program,
      ingredientCount: menu._count.ingredients,
      recipeStepCount: menu._count.recipeSteps,
      createdAt: menu.createdAt,
      updatedAt: menu.updatedAt
    }))
    
    // 7. Calculate pagination
    const totalPages = Math.ceil(total / limit)
    
    return {
      success: true,
      data: {
        menus: items as unknown as MenuWithDetails[],
        total,
        page,
        limit,
        totalPages
      }
    }
  } catch (error) {
    console.error('[getMenus] Error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch menus'
    }
  }
}

/**
 * Get single menu with full details
 * 
 * @example
 * ```ts
 * const result = await getMenu('menu_abc123')
 * ```
 */
export async function getMenu(
  id: string
): Promise<MenuOperationResult<MenuWithDetails>> {
  try {
    // 1. Authentication check
    const authResult = await requireAuth()
    if (!authResult.success) {
      return { success: false, error: authResult.error }
    }
    const { session } = authResult
    
    // 2. Fetch menu with full relations
    const menu = await db.nutritionMenu.findUnique({
      where: { id },
      include: {
        program: {
          select: {
            id: true,
            name: true,
            programCode: true,
            sppgId: true,
            targetGroup: true
          }
        },
        ingredients: {
          include: {
            inventoryItem: {
              select: {
                id: true,
                itemName: true,
                itemCode: true,
                unit: true,
                lastPrice: true,
                averagePrice: true,
                category: true
              }
            }
          },
          orderBy: {
            ingredientName: 'asc'
          }
        },
        recipeSteps: {
          orderBy: {
            stepNumber: 'asc'
          }
        }
      }
    })
    
    // 3. Check if menu exists
    if (!menu) {
      return { success: false, error: 'Menu not found' }
    }
    
    // 4. Multi-tenant check - CRITICAL!
    if (menu.program.sppgId !== session.user.sppgId) {
      return { success: false, error: 'Access denied - Menu belongs to different SPPG' }
    }
    
    // 5. Return menu with details
    return {
      success: true,
      data: menu as unknown as MenuWithDetails
    }
  } catch (error) {
    console.error('[getMenu] Error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch menu'
    }
  }
}

/**
 * Get menu statistics
 * 
 * @example
 * ```ts
 * const result = await getMenuStats('program_abc123')
 * ```
 */
export async function getMenuStats(
  programId?: string
): Promise<MenuOperationResult<MenuStats>> {
  try {
    // 1. Authentication check
    const authResult = await requireAuth()
    if (!authResult.success) {
      return { success: false, error: authResult.error }
    }
    const { session } = authResult
    
    // 2. Build base where clause (multi-tenant safe)
    const where: Prisma.NutritionMenuWhereInput = {
      program: {
        sppgId: session.user.sppgId! // CRITICAL!
      }
    }
    
    if (programId) {
      where.programId = programId
    }
    
    // 3. Execute aggregations (parallel)
    const [
      total,
      active,
      inactive,
      nutritionAgg,
      costAgg,
      byMealType
    ] = await Promise.all([
      // Total count
      db.nutritionMenu.count({ where }),
      
      // Active count
      db.nutritionMenu.count({
        where: { ...where, isActive: true }
      }),
      
      // Inactive count
      db.nutritionMenu.count({
        where: { ...where, isActive: false }
      }),
      
      // Nutrition aggregations
      db.nutritionMenu.aggregate({
        where,
        _avg: {
          calories: true,
          protein: true,
          carbohydrates: true,
          fat: true,
          fiber: true
        },
        _min: {
          calories: true,
          protein: true
        },
        _max: {
          calories: true,
          protein: true
        }
      }),
      
      // Cost aggregations
      db.nutritionMenu.aggregate({
        where,
        _avg: {
          costPerServing: true
        },
        _min: {
          costPerServing: true
        },
        _max: {
          costPerServing: true
        }
      }),
      
      // Count by meal type
      db.nutritionMenu.groupBy({
        by: ['mealType'],
        where,
        _count: {
          id: true
        }
      })
    ])
    
    // 4. Build stats object
    const stats: MenuStats = {
      totalMenus: total,
      activeMenus: active,
      inactiveMenus: inactive,
      avgCalories: nutritionAgg._avg.calories || 0,
      avgProtein: nutritionAgg._avg.protein || 0,
      avgCarbohydrates: nutritionAgg._avg.carbohydrates || 0,
      avgFat: nutritionAgg._avg.fat || 0,
      avgFiber: nutritionAgg._avg.fiber || 0,
      avgCostPerServing: costAgg._avg.costPerServing || 0,
      totalBudgetAllocation: 0, // TODO: Calculate from actual budget
      costEfficiencyRatio: 0, // TODO: Calculate efficiency ratio
      avgPreparationTime: 0, // TODO: Calculate from recipe steps
      avgCookingTime: 0, // TODO: Calculate from recipe cooking time
      avgBatchSize: 0, // TODO: Calculate from production batches
      nutritionCompliantMenus: 0, // TODO: Calculate compliance
      halalMenus: 0, // TODO: Count halal-certified menus
      vegetarianMenus: 0, // TODO: Count vegetarian menus
      menusWithAllergens: 0, // TODO: Count menus with allergen warnings
      menusByMealType: byMealType.reduce((acc: Record<string, number>, item: { mealType: string; _count: { id: number } }) => {
        acc[item.mealType] = item._count.id
        return acc
      }, {})
    }
    
    return {
      success: true,
      data: stats
    }
  } catch (error) {
    console.error('[getMenuStats] Error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch menu stats'
    }
  }
}

// ============================================================================
// MUTATION ACTIONS
// ============================================================================

/**
 * Create new menu
 * 
 * @example
 * ```ts
 * const result = await createMenu({
 *   programId: 'abc123',
 *   menuCode: 'MENU-JKT-SR0001',
 *   menuName: 'Nasi Goreng Sayuran',
 *   mealType: 'SARAPAN',
 *   servingSize: 250,
 *   calories: 450,
 *   protein: 15,
 *   carbohydrates: 60,
 *   fat: 12,
 *   costPerServing: 8500
 * })
 * ```
 */
export async function createMenu(
  input: CreateMenuInput
): Promise<MenuOperationResult<MenuWithDetails>> {
  try {
    // 1. Authentication check
    const authResult = await requireAuth()
    if (!authResult.success) {
      return { success: false, error: authResult.error }
    }
    const { session } = authResult
    
    // 2. Permission check
    if (!canManageMenu(session.user.userRole)) {
      return { success: false, error: 'Insufficient permissions to create menu' }
    }
    
    // 3. Validate input
    const validated = createMenuSchema.parse(input)
    
    // 4. Verify program exists and belongs to user's SPPG
    const program = await db.nutritionProgram.findUnique({
      where: { id: validated.programId },
      select: { id: true, sppgId: true }
    })
    
    if (!program) {
      return { success: false, error: 'Program not found' }
    }
    
    if (program.sppgId !== session.user.sppgId) {
      return { success: false, error: 'Access denied - Program belongs to different SPPG' }
    }
    
    // 5. Check for duplicate menu code
    const existingMenu = await db.nutritionMenu.findFirst({
      where: {
        menuCode: validated.menuCode,
        program: {
          sppgId: session.user.sppgId!
        }
      }
    })
    
    if (existingMenu) {
      return { success: false, error: `Menu code ${validated.menuCode} already exists` }
    }
    
    // 6. Create menu
    const menu = await db.nutritionMenu.create({
      data: {
        programId: validated.programId,
        menuCode: validated.menuCode,
        menuName: validated.menuName,
        description: validated.description,
        mealType: validated.mealType,
        servingSize: validated.servingSize,
        
        // Nutrition
        calories: validated.calories,
        protein: validated.protein,
        carbohydrates: validated.carbohydrates,
        fat: validated.fat,
        fiber: validated.fiber ?? 0,
        calcium: validated.calcium ?? 0,
        iron: validated.iron ?? 0,
        vitaminA: validated.vitaminA ?? 0,
        vitaminC: validated.vitaminC ?? 0,
        sodium: validated.sodium ?? 0,
        sugar: validated.sugar ?? 0,
        
        // Cost
        costPerServing: validated.costPerServing,
        
        // Status
        isActive: validated.isActive ?? true
      },
      include: {
        program: {
          select: {
            id: true,
            name: true,
            programCode: true,
            sppgId: true,
            targetGroup: true
          }
        },
        ingredients: {
          include: {
            inventoryItem: true
          }
        },
        recipeSteps: {
          orderBy: { stepNumber: 'asc' }
        }
      }
    })
    
    // 7. Create audit log
    await db.auditLog.create({
      data: {
        userId: session.user.id,
        sppgId: session.user.sppgId!,
        action: 'CREATE',
        entityType: 'MENU',
        entityId: menu.id,
        oldValues: Prisma.JsonNull,
        newValues: validated
      }
    })
    
    // 8. Revalidate paths
    revalidatePath('/menu')
    revalidatePath(`/menu/${menu.id}`)
    
    return {
      success: true,
      data: menu as unknown as MenuWithDetails
    }
  } catch (error) {
    console.error('[createMenu] Error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create menu'
    }
  }
}

/**
 * Update existing menu
 * 
 * @example
 * ```ts
 * const result = await updateMenu({
 *   id: 'menu_abc123',
 *   menuName: 'Nasi Goreng Sayuran Special',
 *   calories: 480
 * })
 * ```
 */
export async function updateMenu(
  input: UpdateMenuInput
): Promise<MenuOperationResult<MenuWithDetails>> {
  try {
    // 1. Authentication check
    const authResult = await requireAuth()
    if (!authResult.success) {
      return { success: false, error: authResult.error }
    }
    const { session } = authResult
    
    // 2. Permission check
    if (!canManageMenu(session.user.userRole)) {
      return { success: false, error: 'Insufficient permissions to update menu' }
    }
    
    // 3. Validate input
    const validated = updateMenuSchema.parse(input)
    
    // 4. Fetch existing menu for multi-tenant check
    const existingMenu = await db.nutritionMenu.findUnique({
      where: { id: validated.id },
      include: {
        program: {
          select: { sppgId: true }
        }
      }
    })
    
    if (!existingMenu) {
      return { success: false, error: 'Menu not found' }
    }
    
    // 5. Multi-tenant check - CRITICAL!
    if (existingMenu.program.sppgId !== session.user.sppgId) {
      return { success: false, error: 'Access denied - Menu belongs to different SPPG' }
    }
    
    // 6. If updating menu code, check for duplicates
    if (validated.menuCode && validated.menuCode !== existingMenu.menuCode) {
      const duplicate = await db.nutritionMenu.findFirst({
        where: {
          menuCode: validated.menuCode,
          program: {
            sppgId: session.user.sppgId!
          },
          id: {
            not: validated.id
          }
        }
      })
      
      if (duplicate) {
        return { success: false, error: `Menu code ${validated.menuCode} already exists` }
      }
    }
    
    // 7. Update menu
    const { id, ...updateData } = validated
    const updatedMenu = await db.nutritionMenu.update({
      where: { id },
      data: updateData,
      include: {
        program: {
          select: {
            id: true,
            name: true,
            programCode: true,
            sppgId: true,
            targetGroup: true
          }
        },
        ingredients: {
          include: {
            inventoryItem: true
          }
        },
        recipeSteps: {
          orderBy: { stepNumber: 'asc' }
        }
      }
    })
    
    // 8. Create audit log
    await db.auditLog.create({
      data: {
        userId: session.user.id,
        sppgId: session.user.sppgId!,
        action: 'UPDATE',
        entityType: 'MENU',
        entityId: id,
        oldValues: existingMenu,
        newValues: updateData
      }
    })
    
    // 9. Revalidate paths
    revalidatePath('/menu')
    revalidatePath(`/menu/${id}`)
    
    return {
      success: true,
      data: updatedMenu as unknown as MenuWithDetails
    }
  } catch (error) {
    console.error('[updateMenu] Error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update menu'
    }
  }
}

/**
 * Delete menu (soft delete)
 * 
 * @example
 * ```ts
 * const result = await deleteMenu('menu_abc123')
 * ```
 */
export async function deleteMenu(
  id: string
): Promise<MenuOperationResult<MenuWithDetails>> {
  try {
    // 1. Authentication check
    const authResult = await requireAuth()
    if (!authResult.success) {
      return { success: false, error: authResult.error }
    }
    const { session } = authResult
    
    // 2. Permission check
    if (!canManageMenu(session.user.userRole)) {
      return { success: false, error: 'Insufficient permissions to delete menu' }
    }
    
    // 3. Fetch menu for multi-tenant check
    const menu = await db.nutritionMenu.findUnique({
      where: { id },
      include: {
        program: {
          select: { sppgId: true }
        }
      }
    })
    
    if (!menu) {
      return { success: false, error: 'Menu not found' }
    }
    
    // 4. Multi-tenant check - CRITICAL!
    if (menu.program.sppgId !== session.user.sppgId) {
      return { success: false, error: 'Access denied - Menu belongs to different SPPG' }
    }
    
    // 5. Check if menu is used in production
    const productionCount = await db.foodProduction.count({
      where: { menuId: id }
    })
    
    if (productionCount > 0) {
      return {
        success: false,
        error: `Cannot delete menu - it has been used in ${productionCount} production(s). Consider deactivating instead.`
      }
    }
    
    // 6. Soft delete (set isActive = false)
    const deletedMenu = await db.nutritionMenu.update({
      where: { id },
      data: { isActive: false },
      include: {
        program: {
          select: {
            id: true,
            name: true,
            programCode: true,
            sppgId: true,
            targetGroup: true
          }
        },
        ingredients: {
          include: {
            inventoryItem: true
          }
        },
        recipeSteps: {
          orderBy: { stepNumber: 'asc' }
        }
      }
    })
    
    // 7. Create audit log
    await db.auditLog.create({
      data: {
        userId: session.user.id,
        sppgId: session.user.sppgId!,
        action: 'DELETE',
        entityType: 'MENU',
        entityId: id,
        oldValues: menu,
        newValues: Prisma.JsonNull
      }
    })
    
    // 8. Revalidate paths
    revalidatePath('/menu')
    revalidatePath(`/menu/${id}`)
    
    return {
      success: true,
      data: deletedMenu as unknown as MenuWithDetails
    }
  } catch (error) {
    console.error('[deleteMenu] Error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete menu'
    }
  }
}
