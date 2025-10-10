// Production Domain - Pattern 2 Component-Level Implementation
// Main export barrel for production domain
// src/components/sppg/production/index.ts

// ============= Components =============
export * from './components'

// ============= Hooks =============
export * from './hooks'

// ============= Types =============
export * from './types'

// ============= Utils =============
export * from './utils'

// ============= Store =============
export { useProductionStore, useProductionActions } from './stores/useProductionStore'

// ============= Re-export commonly used items =============
export type {
  ProductionWithDetails,
  CreateProductionInput,
  UpdateProductionInput,
  ProductionFilters,
  ProductionStats,
  QualityCheckInput,
  QualityControlWithDetails,
  ServiceResult
} from './types'

export {
  ProductionList,
  ProductionForm,
  ProductionStats as ProductionStatsComponent
} from './components'

export {
  useProductions,
  useProduction,
  useCreateProduction,
  useUpdateProduction,
  useDeleteProduction,
  useUpdateProductionStatus,
  useQualityChecks,
  useCreateQualityCheck
} from './hooks'

export {
  ProductionCache,
  ProductionUtils
} from './utils'