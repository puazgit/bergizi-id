// Production Hooks - Pattern 2 Component-Level Implementation
// Server Actions integration with React Query and Zustand store
// src/components/sppg/production/hooks/useProductions.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'
import type { 
  CreateProductionInput, 
  UpdateProductionInput, 
  ProductionFilters,
  ServiceResult,
  ProductionWithDetails,
  ProductionStats
} from '../types'
import { useProductionActions } from '../stores/useProductionStore'
import { ProductionCache } from '../utils'

// ============= Query Hooks =============

export function useProductions(filters?: ProductionFilters) {
  const { data: session } = useSession()
  const { setProductions, setStats, setLoading } = useProductionActions()
  
  return useQuery({
    queryKey: ['productions', session?.user?.sppgId, filters],
    queryFn: async () => {
      if (!session?.user?.sppgId) throw new Error('No SPPG ID')
      
      setLoading(true)
      
      try {
        const params = new URLSearchParams()
        if (filters) {
          Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
              params.append(key, String(value))
            }
          })
        }
        
        const response = await fetch(`/api/sppg/productions?${params}`)
        if (!response.ok) throw new Error('Failed to fetch productions')
        
        const result = await response.json()
        
        // Update store
        setProductions(result.productions || [])
        if (result.stats) setStats(result.stats)
        
        return result
      } finally {
        setLoading(false)
      }
    },
    enabled: !!session?.user?.sppgId,
    staleTime: ProductionCache.TTL.LIST * 1000,
    gcTime: ProductionCache.TTL.LIST * 2 * 1000
  })
}

export function useProduction(id: string) {
  const { data: session } = useSession()
  const { setSelectedProduction } = useProductionActions()
  
  return useQuery({
    queryKey: ['production', id, session?.user?.sppgId],
    queryFn: async () => {
      if (!session?.user?.sppgId || !id) throw new Error('Missing required data')
      
      const response = await fetch(`/api/sppg/productions/${id}`)
      if (!response.ok) throw new Error('Failed to fetch production')
      
      const result = await response.json()
      
      // Update store
      if (result.data) {
        setSelectedProduction(result.data)
      }
      
      return result
    },
    enabled: !!session?.user?.sppgId && !!id,
    staleTime: ProductionCache.TTL.DETAIL * 1000,
    gcTime: ProductionCache.TTL.DETAIL * 2 * 1000
  })
}

export function useProductionStats() {
  const { data: session } = useSession()
  const { setStats } = useProductionActions()
  
  return useQuery({
    queryKey: ['production-stats', session?.user?.sppgId],
    queryFn: async (): Promise<ServiceResult<ProductionStats>> => {
      if (!session?.user?.sppgId) throw new Error('No SPPG ID')
      
      const response = await fetch('/api/sppg/productions/stats')
      if (!response.ok) throw new Error('Failed to fetch production stats')
      
      const result = await response.json()
      
      // Update store
      if (result.data) {
        setStats(result.data)
      }
      
      return result
    },
    enabled: !!session?.user?.sppgId,
    staleTime: ProductionCache.TTL.STATS * 1000,
    gcTime: ProductionCache.TTL.STATS * 2 * 1000
  })
}

// ============= Mutation Hooks =============

export function useCreateProduction() {
  const queryClient = useQueryClient()
  const { data: session } = useSession()
  const { addProduction, setCreating, invalidateCache } = useProductionActions()
  
  return useMutation({
    mutationFn: async (data: CreateProductionInput): Promise<ServiceResult<ProductionWithDetails>> => {
      setCreating(true)
      
      try {
        const response = await fetch('/api/sppg/productions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        })
        
        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || 'Failed to create production')
        }
        
        return response.json()
      } finally {
        setCreating(false)
      }
    },
    onSuccess: (result) => {
      if (result.success && result.data) {
        // Update store
        addProduction(result.data)
        
        // Invalidate queries
        queryClient.invalidateQueries({ 
          queryKey: ['productions', session?.user?.sppgId] 
        })
        queryClient.invalidateQueries({ 
          queryKey: ['production-stats', session?.user?.sppgId] 
        })
        
        // Invalidate cache
        if (session?.user?.sppgId) {
          invalidateCache(session.user.sppgId)
        }
        
        toast.success('Production created successfully')
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create production')
    }
  })
}

export function useUpdateProduction(id: string) {
  const queryClient = useQueryClient()
  const { data: session } = useSession()
  const { updateProduction, setUpdating, invalidateCache } = useProductionActions()
  
  return useMutation({
    mutationFn: async (data: UpdateProductionInput): Promise<ServiceResult<ProductionWithDetails>> => {
      setUpdating(true)
      
      try {
        const response = await fetch(`/api/sppg/productions/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        })
        
        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || 'Failed to update production')
        }
        
        return response.json()
      } finally {
        setUpdating(false)
      }
    },
    onSuccess: (result) => {
      if (result.success && result.data) {
        // Update store
        updateProduction(id, result.data)
        
        // Invalidate queries
        queryClient.invalidateQueries({ 
          queryKey: ['production', id, session?.user?.sppgId] 
        })
        queryClient.invalidateQueries({ 
          queryKey: ['productions', session?.user?.sppgId] 
        })
        queryClient.invalidateQueries({ 
          queryKey: ['production-stats', session?.user?.sppgId] 
        })
        
        // Invalidate cache
        if (session?.user?.sppgId) {
          invalidateCache(session.user.sppgId)
        }
        
        toast.success('Production updated successfully')
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update production')
    }
  })
}

export function useDeleteProduction() {
  const queryClient = useQueryClient()
  const { data: session } = useSession()
  const { removeProduction, invalidateCache } = useProductionActions()
  
  return useMutation({
    mutationFn: async (id: string): Promise<ServiceResult<void>> => {
      const response = await fetch(`/api/sppg/productions/${id}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete production')
      }
      
      return response.json()
    },
    onSuccess: (result, id) => {
      if (result.success) {
        // Update store
        removeProduction(id)
        
        // Invalidate queries
        queryClient.invalidateQueries({ 
          queryKey: ['productions', session?.user?.sppgId] 
        })
        queryClient.invalidateQueries({ 
          queryKey: ['production-stats', session?.user?.sppgId] 
        })
        
        // Invalidate cache
        if (session?.user?.sppgId) {
          invalidateCache(session.user.sppgId)
        }
        
        toast.success('Production deleted successfully')
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete production')
    }
  })
}

export function useUpdateProductionStatus() {
  const queryClient = useQueryClient()
  const { data: session } = useSession()
  const { updateProduction, invalidateCache } = useProductionActions()
  
  return useMutation({
    mutationFn: async ({ id, status }: { 
      id: string
      status: string 
    }): Promise<ServiceResult<ProductionWithDetails>> => {
      const response = await fetch(`/api/sppg/productions/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update production status')
      }
      
      return response.json()
    },
    onSuccess: (result, variables) => {
      if (result.success && result.data) {
        // Update store
        updateProduction(variables.id, result.data)
        
        // Invalidate queries
        queryClient.invalidateQueries({ 
          queryKey: ['production', variables.id, session?.user?.sppgId] 
        })
        queryClient.invalidateQueries({ 
          queryKey: ['productions', session?.user?.sppgId] 
        })
        queryClient.invalidateQueries({ 
          queryKey: ['production-stats', session?.user?.sppgId] 
        })
        
        // Invalidate cache
        if (session?.user?.sppgId) {
          invalidateCache(session.user.sppgId)
        }
        
        toast.success('Production status updated successfully')
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update production status')
    }
  })
}