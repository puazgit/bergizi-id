// Quality Control Hooks - Pattern 2 Component-Level Implementation
// Server Actions integration for production quality management
// src/components/sppg/production/hooks/useQualityControl.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'
import type { 
  QualityCheckInput,
  QualityControlWithDetails,
  ServiceResult
} from '../types'
import { useProductionActions } from '../stores/useProductionStore'
import { ProductionCache } from '../utils'

// ============= Quality Control Query Hooks =============

export function useQualityChecks(productionId: string) {
  const { data: session } = useSession()
  
  return useQuery({
    queryKey: ['quality-checks', productionId, session?.user?.sppgId],
    queryFn: async (): Promise<ServiceResult<QualityControlWithDetails[]>> => {
      if (!session?.user?.sppgId || !productionId) {
        throw new Error('Missing required data')
      }
      
      const response = await fetch(`/api/sppg/productions/${productionId}/quality-checks`)
      if (!response.ok) throw new Error('Failed to fetch quality checks')
      
      return response.json()
    },
    enabled: !!session?.user?.sppgId && !!productionId,
    staleTime: ProductionCache.TTL.DETAIL * 1000,
    gcTime: ProductionCache.TTL.DETAIL * 2 * 1000
  })
}

export function useQualityCheck(checkId: string) {
  const { data: session } = useSession()
  
  return useQuery({
    queryKey: ['quality-check', checkId, session?.user?.sppgId],
    queryFn: async (): Promise<ServiceResult<QualityControlWithDetails>> => {
      if (!session?.user?.sppgId || !checkId) {
        throw new Error('Missing required data')
      }
      
      const response = await fetch(`/api/sppg/quality-checks/${checkId}`)
      if (!response.ok) throw new Error('Failed to fetch quality check')
      
      return response.json()
    },
    enabled: !!session?.user?.sppgId && !!checkId,
    staleTime: ProductionCache.TTL.DETAIL * 1000,
    gcTime: ProductionCache.TTL.DETAIL * 2 * 1000
  })
}

// ============= Quality Control Mutation Hooks =============

export function useCreateQualityCheck(productionId: string) {
  const queryClient = useQueryClient()
  const { data: session } = useSession()
  const { updateProduction, invalidateCache } = useProductionActions()
  
  return useMutation({
    mutationFn: async (data: QualityCheckInput): Promise<ServiceResult<QualityControlWithDetails>> => {
      const response = await fetch(`/api/sppg/productions/${productionId}/quality-checks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create quality check')
      }
      
      return response.json()
    },
    onSuccess: (result) => {
      if (result.success && result.data) {
        // Update related production status if needed
        if (result.data.passed === false) {
          updateProduction(productionId, { 
            status: 'CANCELLED'
          })
        }
        
        // Invalidate queries
        queryClient.invalidateQueries({ 
          queryKey: ['quality-checks', productionId, session?.user?.sppgId] 
        })
        queryClient.invalidateQueries({ 
          queryKey: ['production', productionId, session?.user?.sppgId] 
        })
        
        // Invalidate cache
        if (session?.user?.sppgId) {
          invalidateCache(session.user.sppgId)
        }
        
        toast.success('Quality check created successfully')
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create quality check')
    }
  })
}

export function useUpdateQualityCheck(checkId: string, productionId: string) {
  const queryClient = useQueryClient()
  const { data: session } = useSession()
  const { updateProduction, invalidateCache } = useProductionActions()
  
  return useMutation({
    mutationFn: async (data: Partial<QualityCheckInput>): Promise<ServiceResult<QualityControlWithDetails>> => {
      const response = await fetch(`/api/sppg/quality-checks/${checkId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update quality check')
      }
      
      return response.json()
    },
    onSuccess: (result) => {
      if (result.success && result.data) {
        // Update related production status if needed
        if (result.data.passed === false) {
          updateProduction(productionId, { 
            status: 'CANCELLED'
          })
        }
        
        // Invalidate queries
        queryClient.invalidateQueries({ 
          queryKey: ['quality-check', checkId, session?.user?.sppgId] 
        })
        queryClient.invalidateQueries({ 
          queryKey: ['quality-checks', productionId, session?.user?.sppgId] 
        })
        queryClient.invalidateQueries({ 
          queryKey: ['production', productionId, session?.user?.sppgId] 
        })
        
        // Invalidate cache
        if (session?.user?.sppgId) {
          invalidateCache(session.user.sppgId)
        }
        
        toast.success('Quality check updated successfully')
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update quality check')
    }
  })
}

export function useDeleteQualityCheck(checkId: string, productionId: string) {
  const queryClient = useQueryClient()
  const { data: session } = useSession()
  const { invalidateCache } = useProductionActions()
  
  return useMutation({
    mutationFn: async (): Promise<ServiceResult<void>> => {
      const response = await fetch(`/api/sppg/quality-checks/${checkId}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete quality check')
      }
      
      return response.json()
    },
    onSuccess: (result) => {
      if (result.success) {
        // Invalidate queries
        queryClient.invalidateQueries({ 
          queryKey: ['quality-checks', productionId, session?.user?.sppgId] 
        })
        queryClient.invalidateQueries({ 
          queryKey: ['production', productionId, session?.user?.sppgId] 
        })
        
        // Invalidate cache
        if (session?.user?.sppgId) {
          invalidateCache(session.user.sppgId)
        }
        
        toast.success('Quality check deleted successfully')
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete quality check')
    }
  })
}

// ============= Quality Standards Hooks =============

export function useQualityStandards() {
  const { data: session } = useSession()
  
  return useQuery({
    queryKey: ['quality-standards', session?.user?.sppgId],
    queryFn: async () => {
      if (!session?.user?.sppgId) throw new Error('No SPPG ID')
      
      const response = await fetch('/api/sppg/quality-standards')
      if (!response.ok) throw new Error('Failed to fetch quality standards')
      
      return response.json()
    },
    enabled: !!session?.user?.sppgId,
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000 // 1 hour
  })
}

// ============= Quality Reports Hooks =============

export function useQualityReport(filters?: {
  startDate?: string
  endDate?: string
  status?: string
}) {
  const { data: session } = useSession()
  
  return useQuery({
    queryKey: ['quality-report', session?.user?.sppgId, filters],
    queryFn: async () => {
      if (!session?.user?.sppgId) throw new Error('No SPPG ID')
      
      const params = new URLSearchParams()
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value) params.append(key, value)
        })
      }
      
      const response = await fetch(`/api/sppg/reports/quality?${params}`)
      if (!response.ok) throw new Error('Failed to fetch quality report')
      
      return response.json()
    },
    enabled: !!session?.user?.sppgId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000 // 15 minutes
  })
}