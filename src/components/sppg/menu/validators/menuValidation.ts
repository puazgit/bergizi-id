/**
 * Menu Validation Schemas
 * 
 * Enterprise-grade Zod validation schemas for Menu Management
 * Follows Pattern 2: Component-Level Domain Architecture
 * 
 * @module components/sppg/menu/validators
 */

import { z } from 'zod'
import { MealType } from '@prisma/client'

// ============================================================================
// COMMON VALIDATION RULES
// ============================================================================

/**
 * Common validation messages (Indonesian)
 */
const VALIDATION_MESSAGES = {
  required: 'Field ini wajib diisi',
  string: {
    min: (min: number) => `Minimal ${min} karakter`,
    max: (max: number) => `Maksimal ${max} karakter`,
    email: 'Format email tidak valid',
    url: 'Format URL tidak valid'
  },
  number: {
    min: (min: number) => `Minimal ${min}`,
    max: (max: number) => `Maksimal ${max}`,
    positive: 'Harus berupa angka positif',
    integer: 'Harus berupa bilangan bulat'
  },
  array: {
    min: (min: number) => `Minimal ${min} item`,
    max: (max: number) => `Maksimal ${max} item`
  },
  date: {
    future: 'Tanggal harus di masa depan',
    past: 'Tanggal harus di masa lalu',
    invalid: 'Format tanggal tidak valid'
  }
} as const

/**
 * Menu code validation (format: MENU-XXX-XXXX)
 */
const menuCodeRegex = /^MENU-[A-Z0-9]{3,10}-[0-9]{4,6}$/

/**
 * Nutrition value range (per serving)
 */
const NUTRITION_RANGES = {
  calories: { min: 50, max: 1000 },
  protein: { min: 0, max: 100 },
  carbohydrates: { min: 0, max: 200 },
  fat: { min: 0, max: 100 },
  fiber: { min: 0, max: 50 },
  calcium: { min: 0, max: 1000 },
  iron: { min: 0, max: 50 },
  vitaminA: { min: 0, max: 1000 },
  vitaminC: { min: 0, max: 200 },
  sodium: { min: 0, max: 3000 },
  sugar: { min: 0, max: 100 }
}

/**
 * Cost range (Indonesian Rupiah)
 */
const COST_RANGES = {
  costPerServing: { min: 1000, max: 100000 }
}

// ============================================================================
// BASE SCHEMAS
// ============================================================================

/**
 * Menu code schema
 */
export const menuCodeSchema = z
  .string()
  .min(10, VALIDATION_MESSAGES.string.min(10))
  .max(50, VALIDATION_MESSAGES.string.max(50))
  .regex(menuCodeRegex, 'Format kode menu: MENU-XXX-XXXX (contoh: MENU-JKT-001234)')

/**
 * Menu name schema
 */
export const menuNameSchema = z
  .string()
  .min(3, VALIDATION_MESSAGES.string.min(3))
  .max(200, VALIDATION_MESSAGES.string.max(200))
  .trim()

/**
 * Description schema
 */
export const descriptionSchema = z
  .string()
  .max(1000, VALIDATION_MESSAGES.string.max(1000))
  .trim()
  .optional()

/**
 * Meal type schema (Zod v4 compatible)
 */
export const mealTypeSchema = z.nativeEnum(MealType, {
  message: 'Jenis waktu makan tidak valid'
})

/**
 * Active status schema (replaces MenuStatus enum)
 */
export const isActiveSchema = z.boolean().default(true)

/**
 * Serving size schema (in grams)
 */
export const servingSizeSchema = z
  .number({ message: 'Ukuran porsi harus berupa angka' })
  .int(VALIDATION_MESSAGES.number.integer)
  .min(1, VALIDATION_MESSAGES.number.min(1))
  .max(1000, VALIDATION_MESSAGES.number.max(1000))

// ============================================================================
// NUTRITION SCHEMAS
// ============================================================================

/**
 * Calories schema
 */
export const caloriesSchema = z
  .number({ message: 'Kalori harus berupa angka' })
  .min(NUTRITION_RANGES.calories.min, `Minimal ${NUTRITION_RANGES.calories.min} kalori`)
  .max(NUTRITION_RANGES.calories.max, `Maksimal ${NUTRITION_RANGES.calories.max} kalori`)

/**
 * Protein schema (grams)
 */
export const proteinSchema = z
  .number({ message: 'Protein harus berupa angka' })
  .min(NUTRITION_RANGES.protein.min, `Minimal ${NUTRITION_RANGES.protein.min}g`)
  .max(NUTRITION_RANGES.protein.max, `Maksimal ${NUTRITION_RANGES.protein.max}g`)

/**
 * Carbohydrates schema (grams)
 */
export const carbohydratesSchema = z
  .number({ message: 'Karbohidrat harus berupa angka' })
  .min(NUTRITION_RANGES.carbohydrates.min, `Minimal ${NUTRITION_RANGES.carbohydrates.min}g`)
  .max(NUTRITION_RANGES.carbohydrates.max, `Maksimal ${NUTRITION_RANGES.carbohydrates.max}g`)

/**
 * Fat schema (grams)
 */
export const fatSchema = z
  .number({ message: 'Lemak harus berupa angka' })
  .min(NUTRITION_RANGES.fat.min, `Minimal ${NUTRITION_RANGES.fat.min}g`)
  .max(NUTRITION_RANGES.fat.max, `Maksimal ${NUTRITION_RANGES.fat.max}g`)

/**
 * Fiber schema (grams)
 */
export const fiberSchema = z
  .number({ message: 'Serat harus berupa angka' })
  .min(NUTRITION_RANGES.fiber.min, `Minimal ${NUTRITION_RANGES.fiber.min}g`)
  .max(NUTRITION_RANGES.fiber.max, `Maksimal ${NUTRITION_RANGES.fiber.max}g`)
  .optional()

/**
 * Calcium schema (mg)
 */
export const calciumSchema = z
  .number()
  .min(NUTRITION_RANGES.calcium.min)
  .max(NUTRITION_RANGES.calcium.max)
  .optional()

/**
 * Iron schema (mg)
 */
export const ironSchema = z
  .number()
  .min(NUTRITION_RANGES.iron.min)
  .max(NUTRITION_RANGES.iron.max)
  .optional()

/**
 * Vitamin A schema (mcg)
 */
export const vitaminASchema = z
  .number()
  .min(NUTRITION_RANGES.vitaminA.min)
  .max(NUTRITION_RANGES.vitaminA.max)
  .optional()

/**
 * Vitamin C schema (mg)
 */
export const vitaminCSchema = z
  .number()
  .min(NUTRITION_RANGES.vitaminC.min)
  .max(NUTRITION_RANGES.vitaminC.max)
  .optional()

/**
 * Sodium schema (mg)
 */
export const sodiumSchema = z
  .number()
  .min(NUTRITION_RANGES.sodium.min)
  .max(NUTRITION_RANGES.sodium.max)
  .optional()

/**
 * Sugar schema (grams)
 */
export const sugarSchema = z
  .number()
  .min(NUTRITION_RANGES.sugar.min)
  .max(NUTRITION_RANGES.sugar.max)
  .optional()

// ============================================================================
// COST SCHEMAS
// ============================================================================

/**
 * Cost per serving schema (Indonesian Rupiah)
 */
export const costPerServingSchema = z
  .number({ message: 'Biaya harus berupa angka' })
  .min(COST_RANGES.costPerServing.min, `Minimal Rp ${COST_RANGES.costPerServing.min.toLocaleString('id-ID')}`)
  .max(COST_RANGES.costPerServing.max, `Maksimal Rp ${COST_RANGES.costPerServing.max.toLocaleString('id-ID')}`)

// ============================================================================
// CRUD SCHEMAS
// ============================================================================

/**
 * Create menu schema
 */
export const createMenuSchema = z.object({
  programId: z.string().cuid('Program ID tidak valid'),
  menuCode: menuCodeSchema,
  menuName: menuNameSchema,
  description: descriptionSchema,
  mealType: mealTypeSchema,
  servingSize: servingSizeSchema,
  
  // Nutrition (required)
  calories: caloriesSchema,
  protein: proteinSchema,
  carbohydrates: carbohydratesSchema,
  fat: fatSchema,
  
  // Nutrition (optional)
  fiber: fiberSchema,
  calcium: calciumSchema,
  iron: ironSchema,
  vitaminA: vitaminASchema,
  vitaminC: vitaminCSchema,
  sodium: sodiumSchema,
  sugar: sugarSchema,
  
  // Cost
  costPerServing: costPerServingSchema,
  
  // Status
  isActive: isActiveSchema
}).strict()

/**
 * Update menu schema
 */
export const updateMenuSchema = z.object({
  id: z.string().cuid('Menu ID tidak valid'),
  menuCode: menuCodeSchema.optional(),
  menuName: menuNameSchema.optional(),
  description: descriptionSchema,
  mealType: mealTypeSchema.optional(),
  servingSize: servingSizeSchema.optional(),
  
  // Nutrition
  calories: caloriesSchema.optional(),
  protein: proteinSchema.optional(),
  carbohydrates: carbohydratesSchema.optional(),
  fat: fatSchema.optional(),
  fiber: fiberSchema,
  calcium: calciumSchema,
  iron: ironSchema,
  vitaminA: vitaminASchema,
  vitaminC: vitaminCSchema,
  sodium: sodiumSchema,
  sugar: sugarSchema,
  
  // Cost
  costPerServing: costPerServingSchema.optional(),
  
  // Status
  isActive: isActiveSchema.optional()
}).strict()

// ============================================================================
// INGREDIENT SCHEMAS
// ============================================================================

/**
 * Add ingredient schema
 */
export const addIngredientSchema = z.object({
  menuId: z.string().cuid('Menu ID tidak valid'),
  inventoryItemId: z.string().cuid('Inventory item ID tidak valid'),
  quantity: z.number().positive('Jumlah harus positif').max(10000),
  unit: z.string().min(1).max(50),
  notes: z.string().max(500).optional()
}).strict()

/**
 * Update ingredient schema
 */
export const updateIngredientSchema = z.object({
  id: z.string().cuid('Ingredient ID tidak valid'),
  quantity: z.number().positive('Jumlah harus positif').max(10000).optional(),
  unit: z.string().min(1).max(50).optional(),
  notes: z.string().max(500).optional()
}).strict()

/**
 * Bulk add ingredients schema
 */
export const bulkAddIngredientsSchema = z.object({
  menuId: z.string().cuid('Menu ID tidak valid'),
  ingredients: z.array(
    z.object({
      inventoryItemId: z.string().cuid('Inventory item ID tidak valid'),
      quantity: z.number().positive(),
      unit: z.string().min(1).max(50),
      notes: z.string().max(500).optional()
    })
  ).min(1, 'Minimal 1 bahan').max(50, 'Maksimal 50 bahan')
}).strict()

// ============================================================================
// RECIPE SCHEMAS
// ============================================================================

/**
 * Create recipe step schema
 */
export const createRecipeStepSchema = z.object({
  menuId: z.string().cuid('Menu ID tidak valid'),
  stepNumber: z.number().int().positive(),
  instruction: z.string().min(10, 'Instruksi minimal 10 karakter').max(1000),
  duration: z.number().int().positive('Durasi harus positif (menit)').max(1440).optional(),
  temperature: z.number().int().min(-20).max(300).optional(),
  notes: z.string().max(500).optional()
}).strict()

/**
 * Update recipe step schema
 */
export const updateRecipeStepSchema = z.object({
  id: z.string().cuid('Recipe step ID tidak valid'),
  stepNumber: z.number().int().positive().optional(),
  instruction: z.string().min(10).max(1000).optional(),
  duration: z.number().int().positive().max(1440).optional(),
  temperature: z.number().int().min(-20).max(300).optional(),
  notes: z.string().max(500).optional()
}).strict()

/**
 * Reorder recipe steps schema
 */
export const reorderRecipeStepsSchema = z.object({
  menuId: z.string().cuid('Menu ID tidak valid'),
  stepOrders: z.array(
    z.object({
      id: z.string().cuid(),
      stepNumber: z.number().int().positive()
    })
  ).min(1).max(100)
}).strict()

/**
 * Bulk create recipe steps schema
 */
export const bulkCreateRecipeStepsSchema = z.object({
  menuId: z.string().cuid('Menu ID tidak valid'),
  steps: z.array(
    z.object({
      stepNumber: z.number().int().positive(),
      instruction: z.string().min(10).max(1000),
      duration: z.number().int().positive().max(1440).optional(),
      temperature: z.number().int().min(-20).max(300).optional(),
      notes: z.string().max(500).optional()
    })
  ).min(1, 'Minimal 1 langkah').max(20, 'Maksimal 20 langkah')
}).strict()

// ============================================================================
// SEARCH & FILTER SCHEMAS
// ============================================================================

/**
 * Menu filters schema
 */
export const menuFiltersSchema = z.object({
  programId: z.string().cuid().optional(),
  mealType: mealTypeSchema.optional(),
  isActive: z.boolean().optional(),
  minCalories: z.number().min(0).optional(),
  maxCalories: z.number().max(2000).optional(),
  minProtein: z.number().min(0).optional(),
  maxProtein: z.number().max(200).optional(),
  minCost: z.number().min(0).optional(),
  maxCost: z.number().max(1000000).optional(),
  search: z.string().max(200).optional(),
  sortBy: z.enum([
    'menuName',
    'calories',
    'protein',
    'costPerServing',
    'createdAt',
    'updatedAt'
  ]).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20)
}).strict()

/**
 * Ingredient search schema
 */
export const ingredientSearchSchema = z.object({
  menuId: z.string().cuid('Menu ID tidak valid'),
  search: z.string().max(200),
  categoryId: z.string().cuid().optional(),
  isAvailable: z.boolean().optional()
}).strict()

/**
 * Ingredient filters schema
 */
export const ingredientFiltersSchema = z.object({
  menuId: z.string().cuid('Menu ID tidak valid'),
  categoryId: z.string().cuid().optional(),
  minQuantity: z.number().min(0).optional(),
  maxQuantity: z.number().max(100000).optional(),
  unit: z.string().max(50).optional()
}).strict()

// ============================================================================
// MENU PLANNING SCHEMAS
// ============================================================================

/**
 * Create menu plan schema (Zod v4 compatible)
 */
export const createMenuPlanSchema = z.object({
  programId: z.string().cuid('Program ID tidak valid'),
  name: z.string().min(3, 'Nama rencana minimal 3 karakter').max(200),
  startDate: z.date({ message: 'Tanggal mulai wajib diisi' }),
  endDate: z.date({ message: 'Tanggal selesai wajib diisi' }),
  description: z.string().max(1000).optional()
}).refine(
  (data) => data.endDate >= data.startDate,
  {
    message: 'Tanggal selesai harus setelah atau sama dengan tanggal mulai',
    path: ['endDate']
  }
)

/**
 * Assign menu to plan schema
 */
export const assignMenuSchema = z.object({
  menuId: z.string().cuid('Menu ID tidak valid'),
  dates: z.array(z.date()).min(1, 'Minimal 1 tanggal').max(365, 'Maksimal 365 tanggal'),
  mealType: mealTypeSchema
}).strict()

/**
 * Generate balanced menu plan schema (Zod v4 compatible)
 */
export const generateBalancedMenuPlanSchema = z.object({
  programId: z.string().cuid('Program ID tidak valid'),
  startDate: z.date({ message: 'Tanggal mulai wajib diisi' }),
  endDate: z.date({ message: 'Tanggal selesai wajib diisi' }),
  mealTypes: z.array(mealTypeSchema).min(1, 'Minimal 1 jenis waktu makan').max(5),
  maxBudgetPerDay: z.number().positive('Budget harus positif').max(10000000).optional(),
  minVarietyScore: z.number().min(0).max(100).default(70),
  maxRepetitionDays: z.number().int().min(1).max(30).default(3)
}).refine(
  (data) => data.endDate >= data.startDate,
  {
    message: 'Tanggal selesai harus setelah atau sama dengan tanggal mulai',
    path: ['endDate']
  }
).refine(
  (data) => {
    const daysDiff = Math.ceil((data.endDate.getTime() - data.startDate.getTime()) / (1000 * 60 * 60 * 24))
    return daysDiff <= 365
  },
  {
    message: 'Periode perencanaan maksimal 365 hari',
    path: ['endDate']
  }
)

/**
 * Get menu calendar schema
 */
export const getMenuCalendarSchema = z.object({
  programId: z.string().cuid('Program ID tidak valid'),
  startDate: z.date(),
  endDate: z.date(),
  mealType: mealTypeSchema.optional()
}).refine(
  (data) => data.endDate >= data.startDate,
  {
    message: 'Tanggal selesai harus setelah atau sama dengan tanggal mulai',
    path: ['endDate']
  }
)

/**
 * Duplicate menu plan schema (Zod v4 compatible)
 */
export const duplicateMenuPlanSchema = z.object({
  sourcePlanId: z.string().cuid('Plan ID tidak valid'),
  newName: z.string().min(3, 'Nama rencana minimal 3 karakter').max(200),
  newStartDate: z.date({ message: 'Tanggal mulai wajib diisi' }),
  newEndDate: z.date({ message: 'Tanggal selesai wajib diisi' }),
  adjustNutrition: z.boolean().default(false),
  adjustCost: z.boolean().default(false)
}).refine(
  (data) => data.newEndDate >= data.newStartDate,
  {
    message: 'Tanggal selesai harus setelah atau sama dengan tanggal mulai',
    path: ['newEndDate']
  }
)

// ============================================================================
// BULK OPERATION SCHEMAS
// ============================================================================

/**
 * Bulk update status schema
 */
export const bulkUpdateStatusSchema = z.object({
  menuIds: z.array(z.string().cuid()).min(1, 'Minimal 1 menu').max(50, 'Maksimal 50 menu'),
  isActive: isActiveSchema
}).strict()

/**
 * Bulk delete menus schema
 */
export const bulkDeleteMenusSchema = z.object({
  menuIds: z.array(z.string().cuid()).min(1, 'Minimal 1 menu').max(50, 'Maksimal 50 menu'),
  reason: z.string().max(500).optional()
}).strict()

// ============================================================================
// EXPORT SCHEMAS
// ============================================================================

/**
 * Export menus schema
 */
export const exportMenusSchema = z.object({
  programId: z.string().cuid('Program ID tidak valid').optional(),
  mealType: mealTypeSchema.optional(),
  isActive: z.boolean().optional(),
  format: z.enum(['CSV', 'EXCEL', 'PDF']).default('EXCEL'),
  includeIngredients: z.boolean().default(true),
  includeRecipe: z.boolean().default(true),
  includeNutrition: z.boolean().default(true),
  includeCost: z.boolean().default(true)
}).strict()

// ============================================================================
// ADVANCED OPERATION SCHEMAS
// ============================================================================

/**
 * Duplicate menu schema
 */
export const duplicateMenuSchema = z.object({
  sourceMenuId: z.string().cuid('Menu ID tidak valid'),
  newMenuCode: menuCodeSchema,
  newMenuName: menuNameSchema,
  copyIngredients: z.boolean().default(true),
  copyRecipe: z.boolean().default(true),
  adjustNutrition: z.boolean().default(false),
  adjustCost: z.boolean().default(false)
}).strict()

/**
 * Get menu recommendations schema
 */
export const getMenuRecommendationsSchema = z.object({
  programId: z.string().cuid('Program ID tidak valid'),
  targetCalories: z.number().min(0).max(2000).optional(),
  targetProtein: z.number().min(0).max(200).optional(),
  maxCost: z.number().min(0).max(1000000).optional(),
  mealType: mealTypeSchema.optional(),
  excludeMenuIds: z.array(z.string().cuid()).max(100).optional(),
  limit: z.number().int().positive().max(50).default(10)
}).strict()

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Validate menu data (helper function)
 */
export function validateMenuData(data: unknown) {
  return createMenuSchema.safeParse(data)
}

/**
 * Check if nutrition is balanced
 */
export function isNutritionBalanced(nutrition: {
  calories: number
  protein: number
  carbohydrates: number
  fat: number
}): boolean {
  // Calculate calories from macros
  const proteinCal = nutrition.protein * 4
  const carbCal = nutrition.carbohydrates * 4
  const fatCal = nutrition.fat * 9
  const totalCalFromMacros = proteinCal + carbCal + fatCal

  // Allow 10% tolerance
  const tolerance = 0.1
  const diff = Math.abs(totalCalFromMacros - nutrition.calories)
  const maxDiff = nutrition.calories * tolerance

  return diff <= maxDiff
}

/**
 * Generate menu code suggestion
 */
export function generateMenuCodeSuggestion(
  sppgCode: string,
  mealType: MealType,
  sequence: number
): string {
  const mealTypePrefix: Record<MealType, string> = {
    SARAPAN: 'SR',
    MAKAN_SIANG: 'MS',
    SNACK_PAGI: 'SP',
    SNACK_SORE: 'SS',
    MAKAN_MALAM: 'MM'
  }

  const prefix = mealTypePrefix[mealType] || 'XX'
  const paddedSequence = sequence.toString().padStart(4, '0')

  return `MENU-${sppgCode}-${prefix}${paddedSequence}`
}

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type CreateMenuInput = z.infer<typeof createMenuSchema>
export type UpdateMenuInput = z.infer<typeof updateMenuSchema>
export type AddIngredientInput = z.infer<typeof addIngredientSchema>
export type UpdateIngredientInput = z.infer<typeof updateIngredientSchema>
export type CreateRecipeStepInput = z.infer<typeof createRecipeStepSchema>
export type UpdateRecipeStepInput = z.infer<typeof updateRecipeStepSchema>
export type MenuFilters = z.infer<typeof menuFiltersSchema>
export type IngredientSearch = z.infer<typeof ingredientSearchSchema>
export type CreateMenuPlanInput = z.infer<typeof createMenuPlanSchema>
export type GenerateBalancedMenuPlanInput = z.infer<typeof generateBalancedMenuPlanSchema>
export type ExportMenusInput = z.infer<typeof exportMenusSchema>
export type DuplicateMenuInput = z.infer<typeof duplicateMenuSchema>
export type GetMenuRecommendationsInput = z.infer<typeof getMenuRecommendationsSchema>
