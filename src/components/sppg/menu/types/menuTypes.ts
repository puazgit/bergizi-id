// Menu Domain Types - Pattern 2 Architecture
// Bergizi-ID SaaS Platform - SPPG Program Pemerintah
// Enterprise-grade TypeScript types with full validation

import type { 
  NutritionMenu, 
  NutritionProgram, 
  MenuIngredient,
  InventoryItem,
  MealType,
  User
} from '@prisma/client'

// ============= Base Types =============

export interface MenuWithDetails extends NutritionMenu {
  program: Pick<NutritionProgram, 'id' | 'name' | 'programCode'>
  ingredients?: Array<MenuIngredient & {
    inventoryItem: InventoryItem
  }>
  createdBy?: Pick<User, 'id' | 'name' | 'email'>
  updatedBy?: Pick<User, 'id' | 'name' | 'email'>
  
  // SPPG Extended Fields (optional karena mungkin belum ada di database)
  budgetAllocation?: number
  preparationTime?: number
  batchSize?: number
  recipeInstructions?: string
  nutritionStandardCompliance?: boolean
  recommendedAgeGroup?: string[]
}

// Menu with calculated nutrition data (from MenuNutritionCalculation)
export interface MenuWithNutrition extends MenuWithDetails {
  calculatedNutrition?: {
    calories: number
    protein: number
    carbohydrates: number
    fat: number
    fiber: number
    calcium?: number
    iron?: number
    vitaminA?: number
    vitaminC?: number
    totalCost: number
    costPerServing: number
  }
}

// Type for menu list (simplified)
export interface MenuListItem extends NutritionMenu {
  program: Pick<NutritionProgram, 'id' | 'name' | 'programCode'>
  
  // SPPG Extended Fields (optional)
  budgetAllocation?: number
  preparationTime?: number
  batchSize?: number
  nutritionStandardCompliance?: boolean
}

// ============= Input Types =============

export interface CreateMenuInput {
  programId: string
  menuName: string
  menuCode: string
  description?: string
  mealType: MealType
  servingSize: number
  isHalal?: boolean
  isVegetarian?: boolean
  isActive?: boolean
  
  // Nutrition values removed - now calculated via MenuNutritionCalculation
  // This ensures single source of truth for nutrition data
  
  // SPPG Cost Management (budget tracking, not commercial)
  costPerServing?: number
  budgetAllocation?: number // Alokasi anggaran per porsi
  
  // SPPG Recipe & Operational Planning
  preparationTime?: number // Waktu persiapan (menit)
  cookingTime?: number     // Waktu memasak (menit)
  batchSize?: number       // Ukuran batch untuk produksi massal
  recipeInstructions?: string // Instruksi resep
  
  // SPPG Safety & Compliance
  allergens?: string[]     // Informasi alergen untuk keamanan
  nutritionStandardCompliance?: boolean // Memenuhi standar gizi pemerintah
  recommendedAgeGroup?: string[] // Grup usia yang direkomendasikan
  
  // Ingredients
  ingredients?: Array<{
    inventoryItemId: string
    quantity: number
    unit: string
  }>
}

export interface UpdateMenuInput {
  menuName?: string
  menuCode?: string
  description?: string
  mealType?: MealType
  servingSize?: number
  isHalal?: boolean
  isVegetarian?: boolean
  isActive?: boolean
  
  // Nutrition values removed - now calculated via MenuNutritionCalculation
  
  // SPPG Cost Management
  costPerServing?: number
  budgetAllocation?: number
  
  // SPPG Operational
  preparationTime?: number
  cookingTime?: number
  batchSize?: number
  recipeInstructions?: string
  
  // SPPG Safety & Compliance
  allergens?: string[]
  nutritionStandardCompliance?: boolean
  recommendedAgeGroup?: string[]
  
  // Ingredients
  ingredients?: Array<{
    inventoryItemId: string
    quantity: number
    unit: string
  }>
}

// Ingredient with full inventory details
export interface MenuIngredientWithInventory {
  id: string
  menuId: string
  ingredientName: string
  quantity: number
  unit: string
  inventoryItemId: string | null
  costPerUnit: number
  totalCost: number
  caloriesContrib: number
  proteinContrib: number
  carbsContrib: number
  fatContrib: number
  notes: string | null
  isOptional: boolean
  substitutes: string[]
  inventoryItem: {
    id: string
    itemName: string
    itemCode: string | null
    unit: string
    lastPrice: number | null
    averagePrice: number | null
    category: string
    currentStock: number
    calories: number | null
    protein: number | null
    carbohydrates: number | null
    fat: number | null
    fiber: number | null
  } | null
}

export interface MenuFilters {
  programId?: string
  mealType?: MealType
  isActive?: boolean
  isHalal?: boolean
  isVegetarian?: boolean
  search?: string
  
  // SPPG Nutrition-based filters
  minCalories?: number
  maxCalories?: number
  minProtein?: number
  maxProtein?: number
  
  // SPPG Budget-based filters (not commercial pricing)
  minCost?: number
  maxCost?: number
  maxBudgetAllocation?: number
  
  // SPPG Compliance filters
  nutritionStandardCompliance?: boolean
  recommendedAgeGroup?: string
  hasAllergens?: boolean
  
  // SPPG Operational filters
  maxPreparationTime?: number
  maxCookingTime?: number
  minBatchSize?: number
  
  // Pagination and sorting
  sortBy?: 'menuName' | 'calories' | 'protein' | 'costPerServing' | 'createdAt' | 'updatedAt'
  sortOrder?: 'asc' | 'desc'
  page?: number
  limit?: number
}

// ============= Response Types =============

export interface MenuStats {
  // Basic metrics
  totalMenus: number
  activeMenus: number
  inactiveMenus: number
  menusByMealType: Record<MealType, number>
  
  // SPPG Nutrition compliance metrics
  avgCalories: number
  avgProtein: number
  avgCarbohydrates: number
  avgFat: number
  avgFiber: number
  
  // SPPG Budget management metrics
  avgCostPerServing: number
  totalBudgetAllocation: number
  costEfficiencyRatio: number
  
  // SPPG Operational metrics
  avgPreparationTime: number
  avgCookingTime: number
  avgBatchSize: number
  
  // SPPG Compliance metrics
  nutritionCompliantMenus: number
  halalMenus: number
  vegetarianMenus: number
  menusWithAllergens: number
}

export interface PaginatedMenusResult {
  menus: MenuWithDetails[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// ============= Operation Result Types =============

export interface MenuOperationResult<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// ============= Nutrition Calculation Types =============

export interface NutritionInfo {
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

export interface CostInfo {
  totalCost: number
  costPerServing: number
  costBreakdown: Array<{
    ingredientName: string
    quantity: number
    unitCost: number
    totalCost: number
  }>
}

// ============= Menu Planning Types =============

export interface MenuPlanningInput {
  programId: string
  startDate: Date
  endDate: Date
  mealTypes: MealType[]
  targetCalories?: number
  targetProtein?: number
  maxCostPerServing?: number
  dietaryRestrictions?: {
    isHalal?: boolean
    isVegetarian?: boolean
    allergens?: string[]
  }
}

export interface MenuPlan {
  id: string
  date: Date
  meals: Array<{
    mealType: MealType
    menu: MenuWithDetails
    quantity: number
    recipients: number
  }>
  totalCalories: number
  totalProtein: number
  totalCost: number
}

// ============= Utility Types =============

export type MenuSortField = 'menuName' | 'createdAt' | 'calories' | 'costPerServing' | 'protein'
export type SortOrder = 'asc' | 'desc'

export interface MenuSortOptions {
  field: MenuSortField
  order: SortOrder
}

// ============= Form Types =============

export interface MenuFormData extends Omit<CreateMenuInput, 'programId'> {
  programId?: string
}

export interface MenuFormErrors {
  menuName?: string
  menuCode?: string
  mealType?: string
  servingSize?: string
  ingredients?: string
  general?: string
}

// ============= Component Props Types =============

export interface MenuListProps {
  menus: MenuWithDetails[]
  isLoading?: boolean
  onEdit?: (menu: MenuWithDetails) => void
  onDelete?: (menuId: string) => void
  onToggleStatus?: (menuId: string) => void
}

export interface MenuCardProps {
  menu: MenuWithDetails
  onEdit?: (menu: MenuWithDetails) => void
  onDelete?: (menuId: string) => void
  onToggleStatus?: (menuId: string) => void
  showActions?: boolean
  variant?: 'default' | 'compact' | 'detailed'
}

export interface MenuFormProps {
  menu?: MenuWithDetails
  onSubmit: (data: CreateMenuInput | UpdateMenuInput) => void
  onCancel?: () => void
  isLoading?: boolean
  programId?: string
}

export interface MenuFiltersProps {
  filters: MenuFilters
  onFiltersChange: (filters: MenuFilters) => void
  programs: Pick<NutritionProgram, 'id' | 'name'>[]
}

export interface MenuStatsProps {
  stats: MenuStats
  isLoading?: boolean
}