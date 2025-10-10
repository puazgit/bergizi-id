// Program Types - Pattern 2 Architecture
// Bergizi-ID SaaS Platform - SPPG Program Management

import { NutritionProgram, ProgramType, TargetGroup } from '@prisma/client'

// ============================================================================
// PROGRAM BASE TYPES
// ============================================================================

export type Program = NutritionProgram

export interface ProgramWithDetails extends NutritionProgram {
  _count?: {
    menus: number
    schools: number
    procurementPlans: number
    productions: number
    distributions: number
  }
  sppg?: {
    id: string
    sppgName: string
    sppgCode: string
  }
}

// ============================================================================
// PROGRAM FORM TYPES
// ============================================================================

export interface ProgramFormInput {
  name: string
  description?: string
  programCode?: string
  programType: ProgramType
  targetGroup: TargetGroup
  
  // Nutrition Goals
  calorieTarget?: number
  proteinTarget?: number
  carbTarget?: number
  fatTarget?: number
  fiberTarget?: number
  
  // Schedule
  startDate: Date | string
  endDate?: Date | string | null
  feedingDays: number[]
  mealsPerDay: number
  
  // Budget & Targets
  totalBudget?: number
  budgetPerMeal?: number
  targetRecipients: number
  
  // Location
  implementationArea: string
  partnerSchools: string[]
  
  // Status
  status?: string
}

export interface ProgramUpdate {
  name?: string
  description?: string
  programType?: ProgramType
  targetGroup?: TargetGroup
  
  // Nutrition Goals
  calorieTarget?: number
  proteinTarget?: number
  carbTarget?: number
  fatTarget?: number
  fiberTarget?: number
  
  // Schedule
  startDate?: Date | string
  endDate?: Date | string | null
  feedingDays?: number[]
  mealsPerDay?: number
  
  // Budget & Targets
  totalBudget?: number
  budgetPerMeal?: number
  targetRecipients?: number
  currentRecipients?: number
  
  // Location
  implementationArea?: string
  partnerSchools?: string[]
  
  // Status
  status?: string
}

// ============================================================================
// PROGRAM FILTERS & SORTING
// ============================================================================

export interface ProgramFilters {
  search?: string
  programType?: ProgramType
  targetGroup?: TargetGroup
  status?: string
  startDateFrom?: Date
  startDateTo?: Date
  hasActiveBudget?: boolean
}

export type ProgramSortField = 
  | 'name' 
  | 'startDate' 
  | 'endDate'
  | 'targetRecipients'
  | 'currentRecipients'
  | 'totalBudget'
  | 'createdAt'

export interface ProgramSortOptions {
  field: ProgramSortField
  order: 'asc' | 'desc'
}

// ============================================================================
// PROGRAM STATISTICS
// ============================================================================

export interface ProgramStats {
  totalPrograms: number
  activePrograms: number
  completedPrograms: number
  totalRecipients: number
  totalBudget: number
  budgetUtilization: number
  averageRecipients: number
  programsByType: {
    type: ProgramType
    count: number
    recipients: number
  }[]
  programsByTarget: {
    target: TargetGroup
    count: number
    recipients: number
  }[]
}

// ============================================================================
// PROGRAM OPTIONS (FOR DROPDOWNS)
// ============================================================================

export interface ProgramOption {
  value: string
  label: string
  description?: string
  programType?: ProgramType
  targetGroup?: TargetGroup
  isActive?: boolean
}

// ============================================================================
// PAGINATED RESULTS
// ============================================================================

export interface PaginatedProgramsResult {
  programs: ProgramWithDetails[]
  total: number
  page: number
  pageSize: number
  totalPages: number
  hasMore: boolean
}

// ============================================================================
// PROGRAM VALIDATION ERRORS
// ============================================================================

export interface ProgramFormErrors {
  name?: string
  description?: string
  programCode?: string
  programType?: string
  targetGroup?: string
  startDate?: string
  endDate?: string
  feedingDays?: string
  mealsPerDay?: string
  totalBudget?: string
  budgetPerMeal?: string
  targetRecipients?: string
  implementationArea?: string
  partnerSchools?: string
}

// ============================================================================
// COMPONENT PROPS TYPES
// ============================================================================

export interface ProgramListProps {
  programs?: ProgramWithDetails[]
  isLoading?: boolean
  onEdit?: (program: ProgramWithDetails) => void
  onDelete?: (programId: string) => void
  onView?: (program: ProgramWithDetails) => void
}

export interface ProgramCardProps {
  program: ProgramWithDetails
  onEdit?: () => void
  onDelete?: () => void
  onView?: () => void
  variant?: 'default' | 'compact' | 'detailed'
}

export interface ProgramFormProps {
  initialData?: ProgramWithDetails
  onSubmit: (data: ProgramFormInput) => Promise<void>
  onCancel?: () => void
  isLoading?: boolean
  errors?: ProgramFormErrors
}

export interface ProgramFiltersProps {
  filters: ProgramFilters
  onFiltersChange: (filters: ProgramFilters) => void
  onReset?: () => void
}

export interface ProgramStatsProps {
  stats?: ProgramStats
  isLoading?: boolean
}

// ============================================================================
// PROGRAM MONITORING TYPES
// ============================================================================

export interface ProgramProgress {
  programId: string
  programName: string
  completionPercentage: number
  recipientsReached: number
  recipientsTarget: number
  budgetUsed: number
  budgetTotal: number
  daysElapsed: number
  daysTotal: number
  mealsServed: number
  mealsTarget: number
  status: 'ON_TRACK' | 'AT_RISK' | 'DELAYED' | 'COMPLETED'
}

export interface ProgramPerformance {
  programId: string
  nutritionCompliance: number // Percentage
  budgetEfficiency: number // Percentage
  distributionAccuracy: number // Percentage
  beneficiarySatisfaction: number // Percentage
  overallScore: number // Percentage
  alerts: {
    type: 'WARNING' | 'CRITICAL' | 'INFO'
    message: string
    date: Date
  }[]
}
