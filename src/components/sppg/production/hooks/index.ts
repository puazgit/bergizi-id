// Production Hooks - Pattern 2 Component-Level Implementation
// Export barrel for all production hooks
// src/components/sppg/production/hooks/index.ts

// Main production hooks
export * from './useProductions'

// Quality control hooks  
export * from './useQualityControl'

// Real-time WebSocket hooks
export * from './useProductionWebSocket'

// Re-export commonly used types for convenience
export type {
  ProductionWithDetails,
  CreateProductionInput,
  UpdateProductionInput,
  ProductionFilters,
  ProductionStats,
  QualityCheckInput,
  QualityControlWithDetails,
  ServiceResult
} from '../types'
