// Production Utils - Pattern 2 Component-Level Implementation
// Simple utilities for production domain
// src/components/sppg/production/utils/index.ts

// import type { ProductionWithDetails } from '../types'

// ============= Redis Cache Utilities =============

export class ProductionCache {
  // Cache key generators
  static keys = {
    list: (sppgId: string) => `productions:${sppgId}`,
    detail: (id: string) => `production:${id}`,
    stats: (sppgId: string) => `production-stats:${sppgId}`,
    qualityChecks: (productionId: string) => `quality-checks:${productionId}`,
    byMenu: (menuId: string) => `productions:menu:${menuId}`,
    byProgram: (programId: string) => `productions:program:${programId}`,
    byDate: (sppgId: string, date: string) => `productions:${sppgId}:${date}`
  }

  // Cache TTL (seconds)
  static TTL = {
    LIST: 300, // 5 minutes
    DETAIL: 600, // 10 minutes  
    STATS: 180, // 3 minutes
    QUALITY_CHECKS: 300 // 5 minutes
  }
}

// ============= Production Utilities =============

export const ProductionUtils = {
  // Format batch number
  formatBatchNumber: (date: Date, sequence: number): string => {
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '')
    return `BATCH-${dateStr}-${sequence.toString().padStart(3, '0')}`
  },

  // Calculate production efficiency
  calculateEfficiency: (actualPortions: number, plannedPortions: number): number => {
    if (!actualPortions || !plannedPortions) return 0
    return (actualPortions / plannedPortions) * 100
  },

  // Calculate cost per portion
  calculateCostPerPortion: (totalCost: number, portions: number): number => {
    return portions > 0 ? totalCost / portions : 0
  },

  // Get production status color
  getStatusColor: (status: string): string => {
    const colors = {
      PLANNED: 'blue',
      PREPARING: 'yellow', 
      COOKING: 'orange',
      QUALITY_CHECK: 'purple',
      COMPLETED: 'green',
      CANCELLED: 'red'
    }
    return colors[status as keyof typeof colors] || 'gray'
  },

  // Get quality score color
  getQualityColor: (score: number): string => {
    if (score >= 90) return 'green'
    if (score >= 75) return 'yellow'
    if (score >= 60) return 'orange'
    return 'red'
  },

  // Format production duration
  formatDuration: (startTime: Date, endTime: Date): string => {
    const diff = endTime.getTime() - startTime.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    return `${hours}h ${minutes}m`
  },

  // Validate production input
  validateProductionInput: (input: Record<string, unknown>): string[] => {
    const errors: string[] = []

    if (!input.programId) errors.push('Program ID is required')
    if (!input.menuId) errors.push('Menu ID is required')
    if (!input.productionDate) errors.push('Production date is required')
    
    const plannedPortions = input.plannedPortions as number
    if (!plannedPortions || plannedPortions <= 0) {
      errors.push('Planned portions must be greater than 0')
    }
    
    if (!input.headCook) errors.push('Head cook is required')
    
    const estimatedCost = input.estimatedCost as number
    if (!estimatedCost || estimatedCost <= 0) {
      errors.push('Estimated cost must be greater than 0')
    }

    return errors
  }
}

// ============= Constants =============

export const PRODUCTION_CONSTANTS = {
  STATUS: {
    PLANNED: 'PLANNED',
    PREPARING: 'PREPARING', 
    COOKING: 'COOKING',
    QUALITY_CHECK: 'QUALITY_CHECK',
    COMPLETED: 'COMPLETED',
    CANCELLED: 'CANCELLED'
  } as const,

  QUALITY_TYPES: {
    HYGIENE: 'HYGIENE',
    TEMPERATURE: 'TEMPERATURE',
    TASTE: 'TASTE',
    APPEARANCE: 'APPEARANCE',
    SAFETY: 'SAFETY'
  } as const
}