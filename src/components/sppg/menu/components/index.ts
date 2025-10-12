/**
 * Menu Components Index - Pattern 2 Architecture
 * Bergizi-ID SaaS Platform - Menu Domain Components Export
 */

// ============================================================================
// MENU COMPONENTS
// ============================================================================

// Core menu components
export { MenuCard } from './MenuCard'
export { MenuList } from './MenuList'
export { MenuForm } from './MenuForm'

// TODO: Create these components to resolve import errors
// Temporary stub components for build
export const MenuStats = () => null
export const MenuFilters = () => null

// ============================================================================
// PROGRAM COMPONENTS
// ============================================================================

// Program management components
export { ProgramCard } from './ProgramCard'
export { ProgramList } from './ProgramList'
export { ProgramDashboard } from './ProgramDashboard'
export { ProgramListWithStats } from './ProgramListWithStats'
export { ProgramForm } from './ProgramForm'

// Program statistics & analytics
export { 
  ProgramStats,
  ProgramTypeDistribution,
  ProgramTargetDistribution
} from './ProgramStats'

// ============================================================================
// PHASE 6: NUTRITION & PLANNING COMPONENTS
// ============================================================================

// Nutrition display components (Priority 1)
export { NutritionDisplay } from './NutritionDisplay'
export { CostDisplay } from './CostDisplay'
export { ComplianceIndicator } from './ComplianceIndicator'
export { RecommendationsList } from './RecommendationsList'

// Ingredient management (Priority 2)
export { IngredientSelector } from './IngredientSelector'
export { IngredientForm } from './IngredientForm'
export { IngredientList } from './IngredientList'

// Recipe management (Priority 3)
export { RecipeStepForm } from './RecipeStepForm'
export { RecipeStepList } from './RecipeStepList'
export { RecipeViewer } from './RecipeViewer'

// Menu planning (Priority 4)
export { PlanForm } from './PlanForm'
export { BalancedPlanGenerator } from './BalancedPlanGenerator'
export { PlanningDashboard } from './PlanningDashboard'
export { PlanDetail } from './PlanDetail'
export { MenuCalendar } from './MenuCalendar'
