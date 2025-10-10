// Menu Hooks Export - Pattern 2 Architecture
// src/components/sppg/menu/hooks/index.ts

// ============================================================================
// CORE MENU HOOKS - Enterprise Query & Mutation Management
// ============================================================================

export {
  // Main menu hooks
  useMenus,
  useMenu,
  menuKeys,
  
  // Performance hooks
  useMenusPrefetch,
  useMenuCache
} from './useMenus'

// ============================================================================
// MENU CRUD MUTATIONS - Create, Update, Delete Operations
// ============================================================================

export {
  // Menu mutation hooks
  useCreateMenu,
  useUpdateMenu,
  useDeleteMenu,
  useBulkUpdateMenuStatus,
  useBulkDeleteMenus,
  useMenuStats
} from './useMenu'

// ============================================================================
// PROGRAM MANAGEMENT HOOKS
// ============================================================================

export {
  // Program hooks - Full CRUD with optimistic updates
  usePrograms,
  useProgram,
  useProgramOptions,
  useProgramStats,
  useProgramSearch,
  programKeys
} from './usePrograms'

// ============================================================================
// SPECIALIZED CALCULATION HOOKS - Business Logic
// ============================================================================

export {
  // Cost calculation hooks
  useCostCalculator,
} from './useCostCalculator'

// ============================================================================
// PLANNING & ASSIGNMENT HOOKS
// ============================================================================

export {
  // Planning hooks
  useMenuPlanning,
  useMenuCalendar,
  useCreateMenuPlan,
  useAssignMenu,
  useGenerateBalancedPlan,
  useNutritionCalculator,
  // useCostCalculator - Already exported from ./useCostCalculator above
  useMenuSearch,
  useExportMenus,
} from './usePlanning'

// ============================================================================
// INGREDIENT MANAGEMENT HOOKS
// ============================================================================

export {
  // Ingredient hooks
  useIngredients,
  useAddIngredient,
  useUpdateIngredient,
  useRemoveIngredient,
  useBulkAddIngredients,
} from './useIngredients'

// ============================================================================
// RECIPE MANAGEMENT HOOKS
// ============================================================================

export {
  // Recipe hooks
  useRecipe,
  useCreateRecipeStep,
  useUpdateRecipeStep,
  useDeleteRecipeStep,
  useReorderRecipeSteps,
} from './useRecipe'

// ============================================================================
// FORM & UI STATE HOOKS
// ============================================================================

// TODO: Create useMenuForm.ts file
// export {
//   // Form state management
//   useMenuForm,
//   useMenuFilters,
//   useMenuSearch
// } from './useMenuForm'