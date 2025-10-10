// Menu Domain Schemas - Pattern 2 Architecture
// Bergizi-ID SaaS Platform - SPPG Program Pemerintah

import { z } from 'zod'

// ============= Zod Enums =============

export const MealTypeSchema = z.enum([
  'SARAPAN',
  'MAKAN_SIANG', 
  'SNACK_PAGI',
  'SNACK_SORE',
  'MAKAN_MALAM'
])

// ============= Input Schemas =============

export const createMenuSchema = z.object({
  programId: z.string().cuid('ID program tidak valid'),
  menuName: z.string()
    .min(3, 'Nama menu minimal 3 karakter')
    .max(100, 'Nama menu maksimal 100 karakter')
    .trim(),
  menuCode: z.string()
    .min(2, 'Kode menu minimal 2 karakter')
    .max(20, 'Kode menu maksimal 20 karakter')
    .regex(/^[A-Z0-9_-]+$/, 'Kode menu hanya boleh huruf besar, angka, underscore, dan dash')
    .trim(),
  description: z.string()
    .max(500, 'Deskripsi maksimal 500 karakter')
    .trim()
    .optional(),
  mealType: MealTypeSchema,
  servingSize: z.number()
    .min(1, 'Ukuran porsi minimal 1 gram')
    .max(2000, 'Ukuran porsi maksimal 2000 gram')
    .int('Ukuran porsi harus bilangan bulat'),
  isHalal: z.boolean().default(true),
  isVegetarian: z.boolean().default(false),
  isActive: z.boolean().default(true),
  // Nutrition values (optional)
  calories: z.number()
    .min(0, 'Kalori tidak boleh negatif')
    .max(5000, 'Kalori maksimal 5000')
    .optional(),
  protein: z.number()
    .min(0, 'Protein tidak boleh negatif')
    .max(500, 'Protein maksimal 500 gram')
    .optional(),
  carbohydrates: z.number()
    .min(0, 'Karbohidrat tidak boleh negatif')
    .max(1000, 'Karbohidrat maksimal 1000 gram')
    .optional(),
  fat: z.number()
    .min(0, 'Lemak tidak boleh negatif')
    .max(500, 'Lemak maksimal 500 gram')
    .optional(),
  fiber: z.number()
    .min(0, 'Serat tidak boleh negatif')
    .max(200, 'Serat maksimal 200 gram')
    .optional(),
  sodium: z.number()
    .min(0, 'Sodium tidak boleh negatif')
    .max(10000, 'Sodium maksimal 10000 mg')
    .optional(),
  sugar: z.number()
    .min(0, 'Gula tidak boleh negatif')
    .max(200, 'Gula maksimal 200 gram')
    .optional(),
  vitaminA: z.number()
    .min(0, 'Vitamin A tidak boleh negatif')
    .max(5000, 'Vitamin A maksimal 5000 mcg')
    .optional(),
  vitaminC: z.number()
    .min(0, 'Vitamin C tidak boleh negatif')
    .max(2000, 'Vitamin C maksimal 2000 mg')
    .optional(),
  calcium: z.number()
    .min(0, 'Kalsium tidak boleh negatif')
    .max(5000, 'Kalsium maksimal 5000 mg')
    .optional(),
  iron: z.number()
    .min(0, 'Zat besi tidak boleh negatif')
    .max(100, 'Zat besi maksimal 100 mg')
    .optional(),
  
  // SPPG Cost Management (budget tracking, bukan commercial)
  costPerServing: z.number()
    .min(0, 'Biaya per porsi tidak boleh negatif')
    .max(1000000, 'Biaya per porsi maksimal Rp 1.000.000')
    .optional(),
  budgetAllocation: z.number()
    .min(0, 'Alokasi anggaran tidak boleh negatif')
    .max(2000000, 'Alokasi anggaran maksimal Rp 2.000.000')
    .optional(),
  
  // SPPG Recipe & Operational Planning
  preparationTime: z.number()
    .min(0, 'Waktu persiapan tidak boleh negatif')
    .max(300, 'Waktu persiapan maksimal 300 menit')
    .int('Waktu persiapan harus bilangan bulat')
    .optional(),
  cookingTime: z.number()
    .min(0, 'Waktu memasak tidak boleh negatif')
    .max(600, 'Waktu memasak maksimal 600 menit')
    .int('Waktu memasak harus bilangan bulat')
    .optional(),
  batchSize: z.number()
    .min(1, 'Ukuran batch minimal 1 porsi')
    .max(10000, 'Ukuran batch maksimal 10000 porsi')
    .int('Ukuran batch harus bilangan bulat')
    .optional(),
  recipeInstructions: z.string()
    .max(2000, 'Instruksi resep maksimal 2000 karakter')
    .trim()
    .optional(),
  
  // SPPG Safety & Compliance
  allergens: z.array(z.string().max(50, 'Nama alergen maksimal 50 karakter'))
    .max(20, 'Maksimal 20 jenis alergen')
    .optional(),
  nutritionStandardCompliance: z.boolean()
    .default(false)
    .optional(),
  recommendedAgeGroup: z.array(z.string().max(50, 'Grup usia maksimal 50 karakter'))
    .max(10, 'Maksimal 10 grup usia')
    .optional(),
  
  // Ingredients
  ingredients: z.array(z.object({
    inventoryItemId: z.string().cuid('ID bahan tidak valid'),
    quantity: z.number()
      .min(0.1, 'Jumlah bahan minimal 0.1')
      .max(10000, 'Jumlah bahan maksimal 10000'),
    unit: z.string()
      .min(1, 'Unit harus diisi')
      .max(20, 'Unit maksimal 20 karakter')
  })).optional()
})

export const updateMenuSchema = createMenuSchema.partial().omit({ programId: true })

export const menuFiltersSchema = z.object({
  programId: z.string().cuid().optional(),
  mealType: MealTypeSchema.optional(),
  isActive: z.boolean().optional(),
  isHalal: z.boolean().optional(),
  isVegetarian: z.boolean().optional(),
  search: z.string().max(100).trim().optional(),
  
  // SPPG Nutrition-based filters
  minCalories: z.number().min(0).optional(),
  maxCalories: z.number().min(0).optional(),
  minProtein: z.number().min(0).optional(),
  maxProtein: z.number().min(0).optional(),
  
  // SPPG Budget-based filters (bukan commercial pricing)
  minCost: z.number().min(0).optional(),
  maxCost: z.number().min(0).optional(),
  maxBudgetAllocation: z.number().min(0).optional(),
  
  // SPPG Compliance filters
  nutritionStandardCompliance: z.boolean().optional(),
  recommendedAgeGroup: z.string().max(50).optional(),
  hasAllergens: z.boolean().optional(),
  
  // SPPG Operational filters
  maxPreparationTime: z.number().min(0).max(300).optional(),
  maxCookingTime: z.number().min(0).max(600).optional(),
  minBatchSize: z.number().min(1).optional(),
  
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(10)
})

// ============= ID Validation Schemas =============

export const menuIdSchema = z.string().cuid('ID menu tidak valid')

export const bulkMenuIdsSchema = z.array(
  z.string().cuid('ID menu tidak valid')
).min(1, 'Minimal 1 menu harus dipilih')

// ============= Menu Planning Schemas =============

export const menuPlanningSchema = z.object({
  programId: z.string().cuid('ID program tidak valid'),
  startDate: z.date(),
  endDate: z.date(),
  mealTypes: z.array(MealTypeSchema).min(1, 'Minimal 1 jenis makanan harus dipilih'),
  targetCalories: z.number().min(0).optional(),
  targetProtein: z.number().min(0).optional(),
  maxCostPerServing: z.number().min(0).optional(),
  dietaryRestrictions: z.object({
    isHalal: z.boolean().optional(),
    isVegetarian: z.boolean().optional(),
    allergens: z.array(z.string()).optional()
  }).optional()
}).refine(
  (data) => data.endDate >= data.startDate,
  {
    message: 'Tanggal selesai harus setelah tanggal mulai',
    path: ['endDate']
  }
)

// ============= Bulk Operations Schemas =============

export const bulkUpdateMenuSchema = z.object({
  menuIds: bulkMenuIdsSchema,
  updates: z.object({
    isActive: z.boolean().optional(),
    isHalal: z.boolean().optional(),
    isVegetarian: z.boolean().optional(),
    mealType: MealTypeSchema.optional()
  }).refine(
    (data) => Object.keys(data).length > 0,
    { message: 'Minimal 1 field untuk update harus diisi' }
  )
})

export const bulkDeleteMenuSchema = z.object({
  menuIds: bulkMenuIdsSchema,
  force: z.boolean().default(false)
})

// ============= Menu Import/Export Schemas =============

export const menuImportSchema = z.object({
  programId: z.string().cuid('ID program tidak valid'),
  menus: z.array(createMenuSchema.omit({ programId: true }))
    .min(1, 'Minimal 1 menu untuk diimport')
    .max(100, 'Maksimal 100 menu per import'),
  overwriteExisting: z.boolean().default(false)
})

export const menuExportSchema = z.object({
  programId: z.string().cuid().optional(),
  format: z.enum(['csv', 'excel', 'json']).default('csv'),
  includeIngredients: z.boolean().default(false),
  filters: menuFiltersSchema.omit({ page: true, limit: true }).optional()
})

// ============= Menu Analytics Schemas =============

export const menuAnalyticsSchema = z.object({
  programId: z.string().cuid().optional(),
  dateRange: z.object({
    startDate: z.date(),
    endDate: z.date()
  }).refine(
    (data) => data.endDate >= data.startDate,
    { message: 'Tanggal selesai harus setelah tanggal mulai' }
  ).optional(),
  groupBy: z.enum(['mealType', 'program', 'month', 'week']).default('mealType'),
  metrics: z.array(z.enum([
    'totalMenus',
    'avgCalories', 
    'avgProtein',
    'avgCost',
    'popularity'
  ])).default(['totalMenus'])
})

// ============= Menu Comparison Schemas =============

export const menuComparisonSchema = z.object({
  menuIds: z.array(z.string().cuid())
    .min(2, 'Minimal 2 menu untuk dibandingkan')
    .max(5, 'Maksimal 5 menu untuk dibandingkan'),
  compareFields: z.array(z.enum([
    'calories',
    'protein', 
    'carbohydrates',
    'fat',
    'fiber',
    'cost',
    'ingredients'
  ])).default(['calories', 'protein', 'cost'])
})

// ============= Menu Duplicate Schemas =============

export const duplicateMenuSchema = z.object({
  sourceMenuId: z.string().cuid('ID menu sumber tidak valid'),
  newMenuName: z.string()
    .min(3, 'Nama menu baru minimal 3 karakter')
    .max(100, 'Nama menu baru maksimal 100 karakter'),
  newMenuCode: z.string()
    .min(2, 'Kode menu baru minimal 2 karakter')
    .max(20, 'Kode menu baru maksimal 20 karakter')
    .regex(/^[A-Z0-9_-]+$/, 'Kode menu hanya boleh huruf besar, angka, underscore, dan dash'),
  copyIngredients: z.boolean().default(true),
  targetProgramId: z.string().cuid().optional()
})

// ============= Server Action Response Schemas =============

export const menuOperationResultSchema = z.object({
  success: z.boolean(),
  data: z.unknown().optional(),
  error: z.string().optional(),
  message: z.string().optional()
})

// ============= Type Exports =============

export type CreateMenuInput = z.infer<typeof createMenuSchema>
export type UpdateMenuInput = z.infer<typeof updateMenuSchema>
export type MenuFilters = z.infer<typeof menuFiltersSchema>
export type MenuPlanningInput = z.infer<typeof menuPlanningSchema>
export type BulkUpdateMenuInput = z.infer<typeof bulkUpdateMenuSchema>
export type BulkDeleteMenuInput = z.infer<typeof bulkDeleteMenuSchema>
export type MenuImportInput = z.infer<typeof menuImportSchema>
export type MenuExportInput = z.infer<typeof menuExportSchema>
export type MenuAnalyticsInput = z.infer<typeof menuAnalyticsSchema>
export type MenuComparisonInput = z.infer<typeof menuComparisonSchema>
export type DuplicateMenuInput = z.infer<typeof duplicateMenuSchema>
export type MenuOperationResult = z.infer<typeof menuOperationResultSchema>

// ============= Validation Functions =============

export function validateCreateMenu(data: unknown) {
  return createMenuSchema.safeParse(data)
}

export function validateUpdateMenu(data: unknown) {
  return updateMenuSchema.safeParse(data)
}

export function validateMenuFilters(data: unknown) {
  return menuFiltersSchema.safeParse(data)
}

export function validateMenuId(id: unknown) {
  return menuIdSchema.safeParse(id)
}

export function validateMenuPlanning(data: unknown) {
  return menuPlanningSchema.safeParse(data)
}

// ============= Schema Transformation Functions =============

export function transformMenuForCreate(data: CreateMenuInput) {
  return {
    ...data,
    menuName: data.menuName.trim(),
    menuCode: data.menuCode.toUpperCase().trim(),
    description: data.description?.trim() || null,
    // Set defaults for nutrition if not provided
    calories: data.calories || 0,
    protein: data.protein || 0,
    carbohydrates: data.carbohydrates || 0,
    fat: data.fat || 0,
    fiber: data.fiber || 0,
    costPerServing: data.costPerServing || 0
  }
}

export function transformMenuForUpdate(data: UpdateMenuInput) {
  const result: Record<string, unknown> = {}
  
  if (data.menuName !== undefined) {
    result.menuName = data.menuName.trim()
  }
  if (data.menuCode !== undefined) {
    result.menuCode = data.menuCode.toUpperCase().trim()
  }
  if (data.description !== undefined) {
    result.description = data.description?.trim() || null
  }
  
  // Copy other fields as-is
  const otherFields = [
    'mealType', 'servingSize', 'isHalal', 'isVegetarian', 'isActive',
    'calories', 'protein', 'carbohydrates', 'fat', 'fiber', 'costPerServing'
  ]
  
  for (const field of otherFields) {
    if (data[field as keyof UpdateMenuInput] !== undefined) {
      result[field] = data[field as keyof UpdateMenuInput]
    }
  }
  
  return result
}