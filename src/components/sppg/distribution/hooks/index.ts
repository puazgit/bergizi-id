// Distribution Hooks - Export barrel
// src/components/sppg/distribution/hooks/index.ts

// Export server action hooks (modern approach)
export {
  useDistributions,
  useDistribution,
  useCreateDistribution,
  useUpdateDistribution,
  useDeleteDistribution,
  useDistributionPoints,
  useCreateDistributionPoint,
  useUpdateDistributionPoint,
  useDeleteDistributionPoint,
  useDistributionStats
} from './useDistributionServerActions'

// Export types from types file and schemas
export type {
  CreateDistributionInput,
  DistributionFiltersInput
} from '../types'

export type {
  UpdateDistributionInput,
  CreateDistributionPointInput,
  UpdateDistributionPointInput
} from '../utils/distributionSchemas'