export function formatCost(cost: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR'
  }).format(cost)
}

// Menu Utils Export - Pattern 2 Architecture
// Bergizi-ID SaaS Platform - SPPG Menu Management

export {
  // Calculation utils
  calculateNutrition,
  calculateCost,
  
  // Filtering utils
  filterMenus,
  calculateMenuStats,
  
  // Validation utils
  validateMenuInput,
  
  // Formatting utils
  formatMenuName,
  formatMenuCode,
  formatMealType,
  formatCurrency,
  formatNutrition,
  
  // Export utils
  exportMenuToCSV,
  
  // Comparison utils
  compareMenuNutrition,
  getMenuRecommendations
} from './menuUtils'

export {
  // Schemas
  createMenuSchema,
  updateMenuSchema,
  menuFiltersSchema,
  menuIdSchema,
  bulkMenuIdsSchema,
  menuPlanningSchema,
  bulkUpdateMenuSchema,
  bulkDeleteMenuSchema,
  menuImportSchema,
  menuExportSchema,
  menuAnalyticsSchema,
  menuComparisonSchema,
  duplicateMenuSchema,
  menuOperationResultSchema,
  
  // Types from schemas
  type CreateMenuInput,
  type UpdateMenuInput,
  type MenuFilters,
  type MenuPlanningInput,
  type BulkUpdateMenuInput,
  type BulkDeleteMenuInput,
  type MenuImportInput,
  type MenuExportInput,
  type MenuAnalyticsInput,
  type MenuComparisonInput,
  type DuplicateMenuInput,
  type MenuOperationResult,
  
  // Validation functions
  validateCreateMenu,
  validateUpdateMenu,
  validateMenuFilters,
  validateMenuId,
  validateMenuPlanning,
  
  // Transform functions
  transformMenuForCreate,
  transformMenuForUpdate
} from './menuSchemas'
