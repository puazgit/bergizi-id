/**
 * Enterprise Nutrition Calculation Service
 * 
 * This service provides centralized nutrition calculation logic for the SPPG system.
 * It ensures single source of truth for all nutrition-related calculations.
 * 
 * @author Bergizi-ID Platform
 * @version 1.0.0
 */

import { type InventoryItem, type MenuIngredient } from '@prisma/client'

// Types for nutrition data structure
export interface NutritionData {
  calories: number
  protein: number
  carbohydrates: number
  fat: number
  fiber: number
  calcium?: number
  iron?: number
  vitaminA?: number
  vitaminC?: number
}

export interface IngredientWithInventory extends MenuIngredient {
  inventoryItem: InventoryItem | null
}

export interface NutritionCalculationResult extends NutritionData {
  totalCost: number
  costPerServing: number
  servingSize: number
}

/**
 * Enterprise-grade Nutrition Calculation Service
 * Handles all nutrition calculations with proper error handling and validation
 */
export class NutritionCalculationService {
  /**
   * Calculate nutrition data from a list of ingredients
   * 
   * @param ingredients - Array of ingredients with inventory data
   * @param servingSize - Target serving size in grams
   * @returns Calculated nutrition data
   */
  static calculateFromIngredients(
    ingredients: IngredientWithInventory[],
    servingSize: number = 100
  ): NutritionCalculationResult {
    try {
      // Validate inputs
      if (!Array.isArray(ingredients) || ingredients.length === 0) {
        throw new Error('Ingredients array is required and cannot be empty')
      }

      if (servingSize <= 0) {
        throw new Error('Serving size must be greater than 0')
      }

      // Calculate base nutrition from ingredients
      const baseNutrition = ingredients.reduce(
        (acc: NutritionData & { totalCost: number }, ingredient) => {
          const inventoryItem = ingredient.inventoryItem
          const quantity = ingredient.quantity || 0
          const ingredientCost = ingredient.totalCost || 0

          // Skip if no inventory item or no quantity
          if (!inventoryItem || quantity <= 0) {
            return {
              ...acc,
              totalCost: acc.totalCost + ingredientCost
            }
          }

          // Get nutrition data per 100g from inventory (direct fields)
          const nutritionPer100g = {
            calories: inventoryItem.calories || 0,
            protein: inventoryItem.protein || 0,
            carbohydrates: inventoryItem.carbohydrates || 0,
            fat: inventoryItem.fat || 0,
            fiber: inventoryItem.fiber || 0,
            calcium: 0, // Not in current schema
            iron: 0,    // Not in current schema
            vitaminA: 0, // Not in current schema
            vitaminC: 0  // Not in current schema
          }

          // Calculate multiplier for the quantity used
          const multiplier = quantity / 100

          return {
            calories: acc.calories + (nutritionPer100g.calories * multiplier),
            protein: acc.protein + (nutritionPer100g.protein * multiplier),
            carbohydrates: acc.carbohydrates + (nutritionPer100g.carbohydrates * multiplier),
            fat: acc.fat + (nutritionPer100g.fat * multiplier),
            fiber: acc.fiber + (nutritionPer100g.fiber * multiplier),
            calcium: (acc.calcium || 0) + (nutritionPer100g.calcium * multiplier),
            iron: (acc.iron || 0) + (nutritionPer100g.iron * multiplier),
            vitaminA: (acc.vitaminA || 0) + (nutritionPer100g.vitaminA * multiplier),
            vitaminC: (acc.vitaminC || 0) + (nutritionPer100g.vitaminC * multiplier),
            totalCost: acc.totalCost + ingredientCost
          }
        },
        {
          calories: 0,
          protein: 0,
          carbohydrates: 0,
          fat: 0,
          fiber: 0,
          calcium: 0,
          iron: 0,
          vitaminA: 0,
          vitaminC: 0,
          totalCost: 0
        }
      )

      // Calculate total ingredient weight
      const totalWeight = ingredients.reduce((sum, ing) => sum + (ing.quantity || 0), 0)
      
      // If no weight, return zeros
      if (totalWeight <= 0) {
        return {
          ...baseNutrition,
          costPerServing: 0,
          servingSize: servingSize
        }
      }

      // Scale nutrition data to the desired serving size
      const scalingFactor = servingSize / totalWeight
      
      const scaledNutrition: NutritionCalculationResult = {
        calories: Math.round((baseNutrition.calories * scalingFactor) * 100) / 100,
        protein: Math.round((baseNutrition.protein * scalingFactor) * 100) / 100,
        carbohydrates: Math.round((baseNutrition.carbohydrates * scalingFactor) * 100) / 100,
        fat: Math.round((baseNutrition.fat * scalingFactor) * 100) / 100,
        fiber: Math.round((baseNutrition.fiber * scalingFactor) * 100) / 100,
        calcium: Math.round(((baseNutrition.calcium || 0) * scalingFactor) * 100) / 100,
        iron: Math.round(((baseNutrition.iron || 0) * scalingFactor) * 100) / 100,
        vitaminA: Math.round(((baseNutrition.vitaminA || 0) * scalingFactor) * 100) / 100,
        vitaminC: Math.round(((baseNutrition.vitaminC || 0) * scalingFactor) * 100) / 100,
        totalCost: Math.round(baseNutrition.totalCost * 100) / 100,
        costPerServing: Math.round((baseNutrition.totalCost * scalingFactor) * 100) / 100,
        servingSize: servingSize
      }

      return scaledNutrition

    } catch (error) {
      console.error('Error calculating nutrition from ingredients:', error)
      
      // Return safe defaults on error
      return {
        calories: 0,
        protein: 0,
        carbohydrates: 0,
        fat: 0,
        fiber: 0,
        calcium: 0,
        iron: 0,
        vitaminA: 0,
        vitaminC: 0,
        totalCost: 0,
        costPerServing: 0,
        servingSize: servingSize
      }
    }
  }

  /**
   * Validate nutrition data against standards
   * 
   * @param nutrition - Nutrition data to validate
   * @param ageGroup - Target age group for validation
   * @returns Validation result with recommendations
   */
  static validateNutrition(
    nutrition: NutritionData,
    ageGroup: 'BALITA_2_5' | 'ANAK_6_12' | 'REMAJA_13_18' | 'DEWASA_19_59' = 'BALITA_2_5'
  ): {
    isValid: boolean
    recommendations: string[]
    warnings: string[]
  } {
    const recommendations: string[] = []
    const warnings: string[] = []

    // Basic nutrition standards (simplified for demo)
    const standards = {
      BALITA_2_5: {
        calories: { min: 1000, max: 1400 },
        protein: { min: 20, max: 35 },
        carbohydrates: { min: 130, max: 200 },
        fat: { min: 30, max: 50 }
      },
      ANAK_6_12: {
        calories: { min: 1400, max: 2000 },
        protein: { min: 25, max: 45 },
        carbohydrates: { min: 150, max: 250 },
        fat: { min: 35, max: 60 }
      },
      REMAJA_13_18: {
        calories: { min: 1800, max: 2500 },
        protein: { min: 40, max: 70 },
        carbohydrates: { min: 200, max: 300 },
        fat: { min: 50, max: 80 }
      },
      DEWASA_19_59: {
        calories: { min: 1800, max: 2500 },
        protein: { min: 50, max: 80 },
        carbohydrates: { min: 200, max: 350 },
        fat: { min: 50, max: 90 }
      }
    }

    const standard = standards[ageGroup]

    // Check calories
    if (nutrition.calories < standard.calories.min) {
      warnings.push(`Kalori terlalu rendah (${nutrition.calories} kal). Minimum: ${standard.calories.min} kal`)
    } else if (nutrition.calories > standard.calories.max) {
      warnings.push(`Kalori terlalu tinggi (${nutrition.calories} kal). Maksimum: ${standard.calories.max} kal`)
    } else {
      recommendations.push(`✓ Kalori sesuai standar (${nutrition.calories} kal)`)
    }

    // Check protein
    if (nutrition.protein < standard.protein.min) {
      warnings.push(`Protein terlalu rendah (${nutrition.protein}g). Minimum: ${standard.protein.min}g`)
    } else if (nutrition.protein > standard.protein.max) {
      warnings.push(`Protein terlalu tinggi (${nutrition.protein}g). Maksimum: ${standard.protein.max}g`)
    } else {
      recommendations.push(`✓ Protein sesuai standar (${nutrition.protein}g)`)
    }

    // Check carbohydrates
    if (nutrition.carbohydrates < standard.carbohydrates.min) {
      warnings.push(`Karbohidrat terlalu rendah (${nutrition.carbohydrates}g). Minimum: ${standard.carbohydrates.min}g`)
    } else if (nutrition.carbohydrates > standard.carbohydrates.max) {
      warnings.push(`Karbohidrat terlalu tinggi (${nutrition.carbohydrates}g). Maksimum: ${standard.carbohydrates.max}g`)
    } else {
      recommendations.push(`✓ Karbohidrat sesuai standar (${nutrition.carbohydrates}g)`)
    }

    // Check fat
    if (nutrition.fat < standard.fat.min) {
      warnings.push(`Lemak terlalu rendah (${nutrition.fat}g). Minimum: ${standard.fat.min}g`)
    } else if (nutrition.fat > standard.fat.max) {
      warnings.push(`Lemak terlalu tinggi (${nutrition.fat}g). Maksimum: ${standard.fat.max}g`)
    } else {
      recommendations.push(`✓ Lemak sesuai standar (${nutrition.fat}g)`)
    }

    const isValid = warnings.length === 0

    return {
      isValid,
      recommendations,
      warnings
    }
  }

  /**
   * Calculate nutrition density (nutrition per calorie)
   * Useful for comparing nutritional quality of different menus
   * 
   * @param nutrition - Nutrition data
   * @returns Nutrition density metrics
   */
  static calculateNutritionDensity(nutrition: NutritionData): {
    proteinDensity: number
    vitaminADensity: number
    vitaminCDensity: number
    calciumDensity: number
    ironDensity: number
    overallQuality: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR'
  } {
    if (nutrition.calories <= 0) {
      return {
        proteinDensity: 0,
        vitaminADensity: 0,
        vitaminCDensity: 0,
        calciumDensity: 0,
        ironDensity: 0,
        overallQuality: 'POOR'
      }
    }

    const proteinDensity = (nutrition.protein / nutrition.calories) * 1000 // protein per 1000 kcal
    const vitaminADensity = ((nutrition.vitaminA || 0) / nutrition.calories) * 1000
    const vitaminCDensity = ((nutrition.vitaminC || 0) / nutrition.calories) * 1000
    const calciumDensity = ((nutrition.calcium || 0) / nutrition.calories) * 1000
    const ironDensity = ((nutrition.iron || 0) / nutrition.calories) * 1000

    // Calculate overall quality score
    let qualityScore = 0
    if (proteinDensity >= 25) qualityScore++ // Good protein density
    if (vitaminADensity >= 200) qualityScore++ // Good vitamin A density
    if (vitaminCDensity >= 15) qualityScore++ // Good vitamin C density
    if (calciumDensity >= 300) qualityScore++ // Good calcium density
    if (ironDensity >= 3) qualityScore++ // Good iron density

    const overallQuality: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR' = 
      qualityScore >= 4 ? 'EXCELLENT' :
      qualityScore >= 3 ? 'GOOD' :
      qualityScore >= 2 ? 'FAIR' : 'POOR'

    return {
      proteinDensity: Math.round(proteinDensity * 100) / 100,
      vitaminADensity: Math.round(vitaminADensity * 100) / 100,
      vitaminCDensity: Math.round(vitaminCDensity * 100) / 100,
      calciumDensity: Math.round(calciumDensity * 100) / 100,
      ironDensity: Math.round(ironDensity * 100) / 100,
      overallQuality
    }
  }
}

/**
 * Export utility functions for quick access
 */
export const {
  calculateFromIngredients,
  validateNutrition,
  calculateNutritionDensity
} = NutritionCalculationService