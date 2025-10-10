// Distribution Types - Export barrel  
// src/components/sppg/distribution/types/index.ts

export interface Distribution {
  id: string
  distributionDate: Date
  quantity: number
  beneficiaries: number
}

export interface CreateDistributionInput {
  distributionDate: Date
  quantity: number
  beneficiaries: number
  location: string
}

export interface DistributionFiltersInput {
  status?: string
  dateFrom?: Date
  dateTo?: Date
  schoolId?: string
  distributionPointId?: string
  search?: string
  sortBy?: keyof Distribution
  sortOrder?: 'asc' | 'desc'
  page?: number
  limit?: number
}