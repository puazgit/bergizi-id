// Production Components - Export barrel for Pattern 2 Component-Level Domain Architecture
// src/components/sppg/production/components/index.ts

// Main production components
export { ProductionList } from './ProductionList'
export { ProductionForm } from './ProductionForm'
export { ProductionStats } from './ProductionStats'
export { ProductionMonitoringDashboard } from './ProductionMonitoringDashboard'
export { ProductionSchedule } from './SimpleProductionSchedule2'
export { ProductionQueue } from './ProductionQueue'

// Re-export types for convenience
export type {
  ProductionWithDetails,
  CreateProductionInput,
  UpdateProductionInput,
  ProductionStats as ProductionStatsType
} from '../types'