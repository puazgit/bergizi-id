// Menu Domain Export - Pattern 2 Architecture
// Bergizi-ID SaaS Platform - SPPG Menu Management

// Components
export {
  MenuCard,
  MenuForm,
  MenuList
  // TODO: Implement MenuGrid, MenuListCompact if needed
} from './components'

// Hooks
export {
  useMenus,
  useMenu,
  useMenuStats,
  useCreateMenu,
  useUpdateMenu,  
  useDeleteMenu,
  useDuplicateMenu,
  useBulkUpdateMenus,
  useBulkDeleteMenus,
  useMenuOperations,
  useMenuFormState,
  useMenuFilters
} from './hooks'

// Types
export type {
  MenuWithDetails,
  CreateMenuInput,
  UpdateMenuInput,
  MenuFilters,
  MenuStats,
  PaginatedMenusResult,
  NutritionInfo,
  CostInfo,
  MenuPlanningInput,
  MenuPlan,
  MenuListProps,
  MenuCardProps,
  MenuFormProps
} from './types'

// Utils & Schemas
export {
  calculateNutrition,
  calculateCost,
  filterMenus,
  calculateMenuStats,
  validateMenuInput,
  formatMealType,
  formatCurrency,
  formatNutrition,
  createMenuSchema,
  updateMenuSchema,
  menuFiltersSchema,
  validateCreateMenu,
  validateUpdateMenu,
  validateMenuFilters
} from './utils'