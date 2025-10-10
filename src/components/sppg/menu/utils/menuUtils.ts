// Menu Domain Utils - Pattern 2 Architecture
// Bergizi-ID SaaS Platform - SPPG Menu Management

import type { 
  MenuWithDetails, 
  NutritionInfo, 
  CostInfo, 
  MenuFilters, 
  MenuStats
} from '../types/menuTypes'
import type { MealType } from '@prisma/client'
import type { MenuIngredient, InventoryItem } from '@prisma/client'

// ============= Nutrition Calculation Utils =============

export function calculateNutrition(
  ingredients: Array<MenuIngredient & { inventoryItem: InventoryItem }>
): NutritionInfo {
  let totalCalories = 0
  let totalProtein = 0
  let totalCarbohydrates = 0
  let totalFat = 0
  let totalFiber = 0
  // TODO: Add micronutrients to schema
  // let totalCalcium = 0
  // let totalIron = 0
  // let totalVitaminA = 0
  // let totalVitaminC = 0

  for (const ingredient of ingredients) {
    const { inventoryItem, quantity } = ingredient
    const factor = quantity / 100 // Nutrition values are per 100g

    totalCalories += (inventoryItem.calories || 0) * factor
    totalProtein += (inventoryItem.protein || 0) * factor
    totalCarbohydrates += (inventoryItem.carbohydrates || 0) * factor
    totalFat += (inventoryItem.fat || 0) * factor
    totalFiber += (inventoryItem.fiber || 0) * factor
    // TODO: Add nutrition micronutrients to InventoryItem schema
    // totalCalcium += (inventoryItem.calcium || 0) * factor
    // totalIron += (inventoryItem.iron || 0) * factor
    // totalVitaminA += (inventoryItem.vitaminA || 0) * factor
    // totalVitaminC += (inventoryItem.vitaminC || 0) * factor
  }

  return {
    calories: Math.round(totalCalories),
    protein: Math.round(totalProtein * 10) / 10,
    carbohydrates: Math.round(totalCarbohydrates * 10) / 10,
    fat: Math.round(totalFat * 10) / 10,
    fiber: Math.round(totalFiber * 10) / 10,
    // TODO: Add micronutrients calculation when schema is updated
    calcium: 0,
    iron: 0,
    vitaminA: 0,
    vitaminC: 0
  }
}

// ============= Cost Calculation Utils =============

export function calculateCost(
  ingredients: Array<MenuIngredient & { inventoryItem: InventoryItem }>,
  servingSize: number = 1
): CostInfo {
  let totalCost = 0
  const costBreakdown: CostInfo['costBreakdown'] = []

  for (const ingredient of ingredients) {
    const { inventoryItem, quantity } = ingredient
    // TODO: Add unitCost to InventoryItem schema
    const unitCost = (inventoryItem as { unitCost?: number }).unitCost || 0
    const ingredientCost = (quantity / 1000) * unitCost // Convert to kg if needed

    totalCost += ingredientCost
    costBreakdown.push({
      ingredientName: inventoryItem.itemName,
      quantity,
      unitCost,
      totalCost: ingredientCost
    })
  }

  return {
    totalCost: Math.round(totalCost),
    costPerServing: Math.round(totalCost / servingSize),
    costBreakdown
  }
}

// ============= Menu Filtering Utils =============

export function filterMenus(menus: MenuWithDetails[], filters: MenuFilters): MenuWithDetails[] {
  return menus.filter(menu => {
    // Program filter
    if (filters.programId && menu.programId !== filters.programId) {
      return false
    }

    // Meal type filter
    if (filters.mealType && menu.mealType !== filters.mealType) {
      return false
    }

    // Active status filter
    if (filters.isActive !== undefined && menu.isActive !== filters.isActive) {
      return false
    }

    // Halal filter
    if (filters.isHalal !== undefined && menu.isHalal !== filters.isHalal) {
      return false
    }

    // Vegetarian filter
    if (filters.isVegetarian !== undefined && menu.isVegetarian !== filters.isVegetarian) {
      return false
    }

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      const matchName = menu.menuName.toLowerCase().includes(searchLower)
      const matchCode = menu.menuCode?.toLowerCase().includes(searchLower)
      const matchDescription = menu.description?.toLowerCase().includes(searchLower)
      
      if (!matchName && !matchCode && !matchDescription) {
        return false
      }
    }

    // Calories range filter
    if (filters.minCalories && menu.calories < filters.minCalories) {
      return false
    }
    if (filters.maxCalories && menu.calories > filters.maxCalories) {
      return false
    }

    // Cost range filter
    if (filters.minCost && menu.costPerServing < filters.minCost) {
      return false
    }
    if (filters.maxCost && menu.costPerServing > filters.maxCost) {
      return false
    }

    return true
  })
}

// ============= Menu Statistics Utils =============

export function calculateMenuStats(menus: MenuWithDetails[]): MenuStats {
  const activeMenus = menus.filter(menu => menu.isActive)
  const inactiveMenus = menus.filter(menu => !menu.isActive)

  // Group by meal type
  const menusByMealType = menus.reduce((acc, menu) => {
    acc[menu.mealType] = (acc[menu.mealType] || 0) + 1
    return acc
  }, {} as Record<MealType, number>)

  // Calculate averages
  const totalCalories = menus.reduce((sum, menu) => sum + menu.calories, 0)
  const totalCost = menus.reduce((sum, menu) => sum + menu.costPerServing, 0)
  const totalProtein = menus.reduce((sum, menu) => sum + menu.protein, 0)

  return {
    // Basic metrics
    totalMenus: menus.length,
    activeMenus: activeMenus.length,
    inactiveMenus: inactiveMenus.length,
    menusByMealType,
    
    // SPPG Nutrition compliance metrics
    avgCalories: menus.length > 0 ? Math.round(totalCalories / menus.length) : 0,
    avgProtein: menus.length > 0 ? Math.round((totalProtein / menus.length) * 10) / 10 : 0,
    avgCarbohydrates: menus.length > 0 ? Math.round((menus.reduce((sum, menu) => sum + (menu.carbohydrates || 0), 0) / menus.length) * 10) / 10 : 0,
    avgFat: menus.length > 0 ? Math.round((menus.reduce((sum, menu) => sum + (menu.fat || 0), 0) / menus.length) * 10) / 10 : 0,
    avgFiber: menus.length > 0 ? Math.round((menus.reduce((sum, menu) => sum + (menu.fiber || 0), 0) / menus.length) * 10) / 10 : 0,
    
    // SPPG Budget management metrics
    avgCostPerServing: menus.length > 0 ? Math.round(totalCost / menus.length) : 0,
    totalBudgetAllocation: menus.reduce((sum, menu) => sum + ((menu as any).budgetAllocation || 0), 0),
    costEfficiencyRatio: totalCalories > 0 ? Math.round((totalCost / totalCalories) * 100) / 100 : 0,
    
    // SPPG Operational metrics
    avgPreparationTime: menus.length > 0 ? Math.round(menus.reduce((sum, menu) => sum + ((menu as any).preparationTime || 0), 0) / menus.length) : 0,
    avgCookingTime: menus.length > 0 ? Math.round(menus.reduce((sum, menu) => sum + (menu.cookingTime || 0), 0) / menus.length) : 0,
    avgBatchSize: menus.length > 0 ? Math.round(menus.reduce((sum, menu) => sum + ((menu as any).batchSize || 50), 0) / menus.length) : 0,
    
    // SPPG Compliance metrics
    nutritionCompliantMenus: menus.filter(menu => (menu as any).nutritionStandardCompliance).length,
    halalMenus: menus.filter(menu => menu.isHalal).length,
    vegetarianMenus: menus.filter(menu => menu.isVegetarian).length,
    menusWithAllergens: menus.filter(menu => menu.allergens && menu.allergens.length > 0).length
  }
}

// ============= Menu Validation Utils =============

export function validateMenuInput(input: Partial<MenuWithDetails>): string[] {
  const errors: string[] = []

  if (!input.menuName || input.menuName.trim().length < 3) {
    errors.push('Nama menu minimal 3 karakter')
  }

  if (!input.menuCode || input.menuCode.trim().length < 2) {
    errors.push('Kode menu minimal 2 karakter')
  }

  if (!input.mealType) {
    errors.push('Jenis makanan harus dipilih')
  }

  if (!input.servingSize || input.servingSize < 1) {
    errors.push('Ukuran porsi harus lebih dari 0')
  }

  if (input.calories !== undefined && input.calories < 0) {
    errors.push('Kalori tidak boleh negatif')
  }

  if (input.protein !== undefined && input.protein < 0) {
    errors.push('Protein tidak boleh negatif')
  }

  if (input.costPerServing !== undefined && input.costPerServing < 0) {
    errors.push('Biaya per porsi tidak boleh negatif')
  }

  return errors
}

// ============= Menu Formatting Utils =============

export function formatMenuName(name: string): string {
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

export function formatMenuCode(name: string): string {
  return name
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .substring(0, 10)
}

export function formatMealType(mealType: MealType): string {
  const mealTypeLabels: Record<MealType, string> = {
    SARAPAN: 'Sarapan',
    MAKAN_SIANG: 'Makan Siang',
    SNACK_PAGI: 'Snack Pagi',
    SNACK_SORE: 'Snack Sore',
    MAKAN_MALAM: 'Makan Malam'
  }
  return mealTypeLabels[mealType] || mealType
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

export function formatNutrition(value: number, unit: string): string {
  return `${value.toFixed(1)} ${unit}`
}

// ============= Menu Export Utils =============

export function exportMenuToCSV(menus: MenuWithDetails[]): string {
  const headers = [
    'Nama Menu',
    'Kode Menu',
    'Program',
    'Jenis Makanan',
    'Ukuran Porsi (g)',
    'Kalori',
    'Protein (g)',
    'Karbohidrat (g)',
    'Lemak (g)',
    'Serat (g)',
    'Biaya per Porsi',
    'Halal',
    'Vegetarian',
    'Status',
    'Dibuat'
  ]

  const rows = menus.map(menu => [
    menu.menuName,
    menu.menuCode || '',
    menu.program.name,
    formatMealType(menu.mealType),
    menu.servingSize.toString(),
    menu.calories.toString(),
    menu.protein.toString(),
    menu.carbohydrates.toString(),
    menu.fat.toString(),
    menu.fiber.toString(),
    menu.costPerServing.toString(),
    menu.isHalal ? 'Ya' : 'Tidak',
    menu.isVegetarian ? 'Ya' : 'Tidak',
    menu.isActive ? 'Aktif' : 'Tidak Aktif',
    menu.createdAt.toLocaleDateString('id-ID')
  ])

  return [headers, ...rows]
    .map(row => row.map(cell => `"${cell}"`).join(','))
    .join('\n')
}

// ============= Menu Comparison Utils =============

export function compareMenuNutrition(menu1: MenuWithDetails, menu2: MenuWithDetails) {
  return {
    calories: menu1.calories - menu2.calories,
    protein: menu1.protein - menu2.protein,
    carbohydrates: menu1.carbohydrates - menu2.carbohydrates,
    fat: menu1.fat - menu2.fat,
    fiber: menu1.fiber - menu2.fiber,
    cost: menu1.costPerServing - menu2.costPerServing
  }
}

// ============= Menu Recommendation Utils =============

export function getMenuRecommendations(
  menu: MenuWithDetails,
  allMenus: MenuWithDetails[],
  criteria: {
    similarCalories?: boolean
    similarCost?: boolean
    sameMealType?: boolean
  } = {}
): MenuWithDetails[] {
  return allMenus
    .filter(m => m.id !== menu.id && m.isActive)
    .filter(m => {
      if (criteria.sameMealType && m.mealType !== menu.mealType) {
        return false
      }
      return true
    })
    .sort((a, b) => {
      let scoreA = 0
      let scoreB = 0

      if (criteria.similarCalories) {
        scoreA += Math.abs(a.calories - menu.calories)
        scoreB += Math.abs(b.calories - menu.calories)
      }

      if (criteria.similarCost) {
        scoreA += Math.abs(a.costPerServing - menu.costPerServing)
        scoreB += Math.abs(b.costPerServing - menu.costPerServing)
      }

      return scoreA - scoreB
    })
    .slice(0, 5)
}