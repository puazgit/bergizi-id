// Production Types - Pattern 2 Component-Level Implementation
// Aligned with Prisma Schema FoodProduction model
// src/components/sppg/production/types/index.ts

import type { 
  FoodProduction,
  NutritionMenu, 
  NutritionProgram,
  QualityControl,
  ProductionStatus,
  SPPG,
  User
} from '@prisma/client'

// ============= Base Types (sesuai Prisma Schema) =============

export interface ProductionWithDetails extends FoodProduction {
  sppg: SPPG
  program: NutritionProgram
  menu: NutritionMenu
  qualityChecks: QualityControlWithDetails[]
}

export interface QualityControlWithDetails extends QualityControl {
  production: FoodProduction
}

// ============= Input Types untuk Server Actions =============

export interface CreateProductionInput {
  programId: string
  menuId: string
  productionDate: string // ISO string
  plannedPortions: number
  headCook: string // User ID
  assistantCooks?: string[] // Array User IDs
  supervisorId?: string // User ID
  plannedStartTime: string // ISO string
  plannedEndTime: string // ISO string
  estimatedCost: number
  targetTemperature?: number
  notes?: string
}

export interface UpdateProductionInput {
  productionDate?: string
  plannedPortions?: number
  actualPortions?: number
  headCook?: string
  assistantCooks?: string[]
  supervisorId?: string
  plannedStartTime?: string
  plannedEndTime?: string
  actualStartTime?: string
  actualEndTime?: string
  estimatedCost?: number
  actualCost?: number
  costPerPortion?: number
  targetTemperature?: number
  actualTemperature?: number
  hygieneScore?: number // 1-100
  tasteRating?: number // 1-5
  appearanceRating?: number // 1-5
  textureRating?: number // 1-5
  status?: ProductionStatus
  qualityPassed?: boolean
  rejectionReason?: string
  wasteAmount?: number // kg
  wasteNotes?: string
  notes?: string
}

// ============= Quality Control Input Types =============

export interface QualityCheckInput {
  productionId: string
  checkType: string // "HYGIENE", "TEMPERATURE", "TASTE", "APPEARANCE", "SAFETY"
  checkedBy: string // User ID
  parameter: string
  expectedValue?: string
  actualValue: string
  passed: boolean
  score?: number // 1-100
  severity?: string // "LOW", "MEDIUM", "HIGH", "CRITICAL"
  notes?: string
  recommendations?: string
  actionRequired?: boolean
  actionTaken?: string
  actionBy?: string
  actionDate?: string
  followUpRequired?: boolean
  followUpDate?: string
}

// ============= Filter & Search Types =============

export interface ProductionFilters {
  status?: ProductionStatus[]
  menuId?: string
  programId?: string
  headCook?: string
  dateFrom?: string
  dateTo?: string
  search?: string
  page?: number
  limit?: number
}

export interface ProductionFiltersInput {
  status?: string
  menuId?: string
  programId?: string
  headCook?: string
  scheduledStartDate?: string
  scheduledEndDate?: string
  search?: string
  page?: number
  limit?: number
}

// ============= Response Types =============

export interface ProductionStats {
  total: number
  planned: number
  preparing: number
  cooking: number
  qualityCheck: number
  completed: number
  cancelled: number
  todayProductions: number
  monthlyProductions: number
  averageCostPerPortion: number
  qualityPassRate: number
  totalWasteKg: number
  averageHygieneScore: number
}

// ============= Real-time Types =============

export interface ProductionRealTimeUpdate {
  id: string
  type: 'PRODUCTION_CREATED' | 'PRODUCTION_UPDATED' | 'PRODUCTION_DELETED' | 'STATUS_CHANGED' | 'QUALITY_CHECK_ADDED'
  productionId: string
  data: unknown
  timestamp: Date
  userId: string
}

// ============= Cache Types =============

export interface ProductionCacheKeys {
  LIST: (sppgId: string, filters?: ProductionFilters) => string
  DETAIL: (id: string) => string
  STATS: (sppgId: string) => string
  QUALITY_CHECKS: (productionId: string) => string
}

// ============= Store Types =============

export interface ProductionStoreState {
  // Data
  productions: ProductionWithDetails[]
  selectedProduction: ProductionWithDetails | null
  stats: ProductionStats | null
  
  // UI State
  loading: boolean
  creating: boolean
  updating: boolean
  error: string | null
  
  // Filters
  filters: ProductionFilters
  searchTerm: string
  
  // Pagination
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
  
  // Real-time
  realTimeConnected: boolean
  realTimeUpdates: ProductionRealTimeUpdate[]
  
  // Cache
  cacheKey: string | null
  lastSyncTime: Date | null
}

// ============= Service Result Type =============

export interface ServiceResult<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// ============= Export all types =============

export type {
  FoodProduction,
  NutritionMenu,
  NutritionProgram,
  QualityControl,
  ProductionStatus,
  SPPG,
  User
} from '@prisma/client'