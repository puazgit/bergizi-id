/**
 * Nutrition & Cost Calculator Actions
 * 
 * Server actions for calculation utilities
 * Used by menu planning and nutrition analysis
 * 
 * Follows Pattern 2: Component-Level Domain Architecture
 * 
 * @module components/sppg/menu/actions/calculatorActions
 */

'use server'

import { auth } from '@/auth'
import db from '@/lib/db'
import type { MenuOperationResult } from '../types/menuTypes'
import { TargetGroup, AgeGroup, ActivityLevel, Gender } from '@prisma/client'

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface NutritionCalculation {
  calories: number
  protein: number
  carbohydrates: number
  fat: number
  fiber: number
}

export interface CostCalculation {
  totalCost: number
  costPerServing: number
  costPerPortion: number
}

export interface NutritionStandardResult {
  targetGroup: string
  ageGroup: string
  gender: string | null
  activityLevel: string
  calories: number
  protein: number
  carbohydrates: number
  fat: number
  fiber: number
  source: string | null
}

export interface ComplianceResult {
  compliant: boolean
  percentage: number
  calories: { actual: number; target: number; percentage: number; status: string }
  protein: { actual: number; target: number; percentage: number; status: string }
  carbohydrates: { actual: number; target: number; percentage: number; status: string }
  fat: { actual: number; target: number; percentage: number; status: string }
  fiber: { actual: number; target: number; percentage: number; status: string }
  recommendations: string[]
}

interface IngredientInput {
  inventoryItemId: string
  quantity: number // in grams
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
 * Calculate nutrient percentage compared to target
 */
function calculatePercentage(actual: number, target: number): number {
  if (target === 0) return 0
  return Math.round((actual / target) * 100)
}

/**
 * Determine compliance status
 */
function getStatus(percentage: number): string {
  if (percentage < 80) return 'LOW' // Kurang dari 80%
  if (percentage <= 120) return 'ADEQUATE' // 80-120% = ideal
  return 'EXCESSIVE' // > 120%
}

// ============================================================================
// CALCULATION ACTIONS
// ============================================================================

/**
 * Calculate total nutrition from ingredients
 * 
 * @param ingredients - Array of ingredient with quantity
 * @returns Aggregated nutrition values
 */
export async function calculateNutrition(
  ingredients: IngredientInput[]
): Promise<MenuOperationResult<NutritionCalculation>> {
  try {
    const authResult = await requireAuth()
    if (!authResult.success) {
      return { success: false, error: authResult.error }
    }
    const { session } = authResult

    // Fetch inventory items with nutrition data
    const inventoryIds = ingredients.map((ing) => ing.inventoryItemId)
    const inventoryItems = await db.inventoryItem.findMany({
      where: {
        id: { in: inventoryIds },
        sppgId: session.user.sppgId!
      },
      select: {
        id: true,
        calories: true,
        protein: true,
        carbohydrates: true,
        fat: true,
        fiber: true
      }
    })

    // Create lookup map
    const itemMap = new Map(inventoryItems.map((item) => [item.id, item]))

    // Calculate totals (nutrition per 100g * quantity/100)
    const totals: NutritionCalculation = {
      calories: 0,
      protein: 0,
      carbohydrates: 0,
      fat: 0,
      fiber: 0
    }

    ingredients.forEach((ing) => {
      const item = itemMap.get(ing.inventoryItemId)
      if (item) {
        const factor = ing.quantity / 100 // quantity in grams, nutrition per 100g
        totals.calories += (item.calories || 0) * factor
        totals.protein += (item.protein || 0) * factor
        totals.carbohydrates += (item.carbohydrates || 0) * factor
        totals.fat += (item.fat || 0) * factor
        totals.fiber += (item.fiber || 0) * factor
      }
    })

    // Round to 1 decimal place
    return {
      success: true,
      data: {
        calories: Math.round(totals.calories),
        protein: Math.round(totals.protein * 10) / 10,
        carbohydrates: Math.round(totals.carbohydrates * 10) / 10,
        fat: Math.round(totals.fat * 10) / 10,
        fiber: Math.round(totals.fiber * 10) / 10
      }
    }
  } catch (error) {
    console.error('[calculateNutrition] Error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to calculate nutrition'
    }
  }
}

/**
 * Calculate total cost from ingredients
 * 
 * @param ingredients - Array of ingredient with quantity
 * @param servingSize - Size of one serving in grams
 * @returns Total cost and per-serving cost
 */
export async function calculateCost(
  ingredients: IngredientInput[],
  servingSize: number
): Promise<MenuOperationResult<CostCalculation>> {
  try {
    const authResult = await requireAuth()
    if (!authResult.success) {
      return { success: false, error: authResult.error }
    }
    const { session } = authResult

    // Fetch inventory items with pricing
    const inventoryIds = ingredients.map((ing) => ing.inventoryItemId)
    const inventoryItems = await db.inventoryItem.findMany({
      where: {
        id: { in: inventoryIds },
        sppgId: session.user.sppgId!
      },
      select: {
        id: true,
        lastPrice: true,
        averagePrice: true
      }
    })

    // Create lookup map
    const itemMap = new Map(inventoryItems.map((item) => [item.id, item]))

    // Calculate total cost (price per kg * quantity in kg)
    let totalCost = 0

    ingredients.forEach((ing) => {
      const item = itemMap.get(ing.inventoryItemId)
      if (item) {
        const price = item.lastPrice || item.averagePrice || 0
        totalCost += (ing.quantity / 1000) * price // quantity in grams, price per kg
      }
    })

    // Calculate per serving and per portion
    const totalQuantity = ingredients.reduce((sum, ing) => sum + ing.quantity, 0)
    const portionCount = Math.floor(totalQuantity / servingSize)
    const costPerPortion = portionCount > 0 ? totalCost / portionCount : 0

    return {
      success: true,
      data: {
        totalCost: Math.round(totalCost * 100) / 100,
        costPerServing: Math.round((totalCost / totalQuantity) * servingSize * 100) / 100,
        costPerPortion: Math.round(costPerPortion * 100) / 100
      }
    }
  } catch (error) {
    console.error('[calculateCost] Error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to calculate cost'
    }
  }
}

/**
 * Get nutrition standards for specific target group
 * 
 * @param targetGroup - Target beneficiary group
 * @param ageGroup - Age group classification
 * @param gender - Gender (optional)
 * @param activityLevel - Activity level (default: MODERATE)
 * @returns Nutrition standard requirements
 */
export async function getNutritionStandards(
  targetGroup: TargetGroup,
  ageGroup: AgeGroup,
  gender?: Gender,
  activityLevel: ActivityLevel = 'MODERATE'
): Promise<MenuOperationResult<NutritionStandardResult>> {
  try {
    const authResult = await requireAuth()
    if (!authResult.success) {
      return { success: false, error: authResult.error }
    }

    const standard = await db.nutritionStandard.findFirst({
      where: {
        targetGroup,
        ageGroup,
        ...(gender && { gender }),
        activityLevel,
        isActive: true
      }
    })

    if (!standard) {
      return {
        success: false,
        error: 'Nutrition standard not found for the specified criteria'
      }
    }

    return {
      success: true,
      data: {
        targetGroup: standard.targetGroup,
        ageGroup: standard.ageGroup,
        gender: standard.gender,
        activityLevel: standard.activityLevel,
        calories: standard.calories,
        protein: standard.protein,
        carbohydrates: standard.carbohydrates,
        fat: standard.fat,
        fiber: standard.fiber,
        source: standard.source
      }
    }
  } catch (error) {
    console.error('[getNutritionStandards] Error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get nutrition standards'
    }
  }
}

/**
 * Compare actual nutrition values to standards
 * 
 * @param nutrition - Actual nutrition values
 * @param standards - Target nutrition standards
 * @returns Compliance analysis with recommendations
 */
export async function compareToStandards(
  nutrition: NutritionCalculation,
  standards: NutritionStandardResult
): Promise<MenuOperationResult<ComplianceResult>> {
  try {
    const authResult = await requireAuth()
    if (!authResult.success) {
      return { success: false, error: authResult.error }
    }

    // Calculate percentages
    const caloriesPercentage = calculatePercentage(nutrition.calories, standards.calories)
    const proteinPercentage = calculatePercentage(nutrition.protein, standards.protein)
    const carbsPercentage = calculatePercentage(nutrition.carbohydrates, standards.carbohydrates)
    const fatPercentage = calculatePercentage(nutrition.fat, standards.fat)
    const fiberPercentage = calculatePercentage(nutrition.fiber, standards.fiber)

    // Determine statuses
    const caloriesStatus = getStatus(caloriesPercentage)
    const proteinStatus = getStatus(proteinPercentage)
    const carbsStatus = getStatus(carbsPercentage)
    const fatStatus = getStatus(fatPercentage)
    const fiberStatus = getStatus(fiberPercentage)

    // Generate recommendations
    const recommendations: string[] = []

    if (caloriesStatus === 'LOW') {
      recommendations.push('Tambahkan bahan makanan berenergi tinggi untuk memenuhi kebutuhan kalori')
    } else if (caloriesStatus === 'EXCESSIVE') {
      recommendations.push('Kurangi porsi atau ganti dengan bahan rendah kalori')
    }

    if (proteinStatus === 'LOW') {
      recommendations.push('Tingkatkan sumber protein (daging, ikan, telur, atau kacang-kacangan)')
    } else if (proteinStatus === 'EXCESSIVE') {
      recommendations.push('Seimbangkan asupan protein dengan nutrisi lainnya')
    }

    if (carbsStatus === 'LOW') {
      recommendations.push('Tambahkan karbohidrat kompleks (nasi, roti, atau pasta)')
    }

    if (fatStatus === 'LOW') {
      recommendations.push('Tambahkan lemak sehat (minyak zaitun, alpukat, atau kacang)')
    } else if (fatStatus === 'EXCESSIVE') {
      recommendations.push('Kurangi penggunaan minyak dan lemak dalam masakan')
    }

    if (fiberStatus === 'LOW') {
      recommendations.push('Tingkatkan serat dengan menambah sayuran, buah, atau biji-bijian')
    }

    // Overall compliance (all nutrients should be 80-120%)
    const allCompliant =
      caloriesStatus === 'ADEQUATE' &&
      proteinStatus === 'ADEQUATE' &&
      carbsStatus === 'ADEQUATE' &&
      fatStatus === 'ADEQUATE' &&
      fiberStatus === 'ADEQUATE'

    // Calculate overall percentage (average of all percentages)
    const overallPercentage = Math.round(
      (caloriesPercentage + proteinPercentage + carbsPercentage + fatPercentage + fiberPercentage) / 5
    )

    return {
      success: true,
      data: {
        compliant: allCompliant,
        percentage: overallPercentage,
        calories: {
          actual: nutrition.calories,
          target: standards.calories,
          percentage: caloriesPercentage,
          status: caloriesStatus
        },
        protein: {
          actual: nutrition.protein,
          target: standards.protein,
          percentage: proteinPercentage,
          status: proteinStatus
        },
        carbohydrates: {
          actual: nutrition.carbohydrates,
          target: standards.carbohydrates,
          percentage: carbsPercentage,
          status: carbsStatus
        },
        fat: {
          actual: nutrition.fat,
          target: standards.fat,
          percentage: fatPercentage,
          status: fatStatus
        },
        fiber: {
          actual: nutrition.fiber,
          target: standards.fiber,
          percentage: fiberPercentage,
          status: fiberStatus
        },
        recommendations
      }
    }
  } catch (error) {
    console.error('[compareToStandards] Error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to compare to standards'
    }
  }
}
