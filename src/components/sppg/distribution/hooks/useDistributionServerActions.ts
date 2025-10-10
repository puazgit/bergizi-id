// Distribution Server Actions Hooks  
// Enterprise React Query Hooks for Distribution Management

'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

// Import server actions
import {
  getDistributions,
  getDistributionById,
  createDistribution,
  updateDistribution,
  startDistribution,
  completeDistribution,
  getDistributionStats,
  getDistributionPoints,
  createDistributionPoint
} from '@/actions/sppg/distribution'

// Import types
import type {
  CreateDistributionInput,
  DistributionFiltersInput
} from '@/components/sppg/distribution/types'
import type {
  UpdateDistributionInput,
  CreateDistributionPointInput,
  UpdateDistributionPointInput
} from '@/components/sppg/distribution/utils/distributionSchemas'

// ============= Distribution Query Hooks =============

export function useDistributions(filters?: DistributionFiltersInput) {
  return useQuery({
    queryKey: ['distributions', filters],
    queryFn: () => getDistributions(filters),
    select: (data) => {
      if (!data.success) {
        throw new Error(data.error)
      }
      return data.data
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 10,   // 10 minutes
  })
}

export function useDistribution(id: string | null) {
  return useQuery({
    queryKey: ['distribution', id],
    queryFn: () => {
      if (!id) throw new Error('Distribution ID is required')
      return getDistributionById(id)
    },
    select: (data) => {
      if (!data.success) {
        throw new Error(data.error)
      }
      return data.data
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 15,   // 15 minutes
  })
}

export function useDistributionStats() {
  return useQuery({
    queryKey: ['distribution-stats'],
    queryFn: getDistributionStats,
    select: (data) => {
      if (!data.success) {
        throw new Error(data.error)
      }
      return data.data
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 15,   // 15 minutes
  })
}

// ============= Distribution Point Query Hooks =============

export function useDistributionPoints() {
  return useQuery({
    queryKey: ['distribution-points'],
    queryFn: () => getDistributionPoints(),
    select: (data) => {
      if (!data.success) {
        throw new Error(data.error)
      }
      return data.data
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 15,   // 15 minutes
  })
}

// ============= Distribution Mutation Hooks =============

export function useCreateDistribution() {
  const queryClient = useQueryClient()
  const router = useRouter()

  return useMutation({
    mutationFn: (input: CreateDistributionInput) => createDistribution(input),
    onSuccess: (data) => {
      if (data.success) {
        toast.success('Distribusi berhasil dibuat')
        
        // Invalidate and refetch queries
        queryClient.invalidateQueries({ queryKey: ['distributions'] })
        queryClient.invalidateQueries({ queryKey: ['distribution-stats'] })
        
        // Redirect to distribution detail
        if (data.data?.id) {
          router.push(`/distribution/${data.data.id}`)
        }
      } else {
        toast.error(data.error || 'Gagal membuat distribusi')
      }
    },
    onError: (error) => {
      console.error('Create distribution error:', error)
      toast.error('Terjadi kesalahan saat membuat distribusi')
    }
  })
}

export function useUpdateDistribution() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateDistributionInput }) => 
      updateDistribution(id, input),
    onMutate: async ({ id, input }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['distribution', id] })
      
      // Snapshot previous value
      const previousData = queryClient.getQueryData(['distribution', id])
      
      // Optimistically update
      queryClient.setQueryData(['distribution', id], (old: any) => {
        if (old && old.success && old.data) {
          return {
            ...old,
            data: { ...old.data, ...input }
          }
        }
        return old
      })
      
      return { previousData }
    },
    onSuccess: (data) => {
      if (data.success) {
        toast.success('Distribusi berhasil diperbarui')
        
        // Invalidate related queries
        queryClient.invalidateQueries({ queryKey: ['distributions'] })
        queryClient.invalidateQueries({ queryKey: ['distribution-stats'] })
      } else {
        toast.error(data.error || 'Gagal memperbarui distribusi')
      }
    },
    onError: (error, variables, context) => {
      console.error('Update distribution error:', error)
      
      // Rollback optimistic update
      if (context?.previousData) {
        queryClient.setQueryData(['distribution', variables.id], context.previousData)
      }
      
      toast.error('Terjadi kesalahan saat memperbarui distribusi')
    },
    onSettled: (data, error, variables) => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: ['distribution', variables.id] })
    }
  })
}

export function useDeleteDistribution() {
  const queryClient = useQueryClient()
  const router = useRouter()

  return useMutation({
    mutationFn: () => Promise.resolve({ success: false, error: 'Delete function not implemented' }),
    onMutate: async () => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['distributions'] })
      
      // Snapshot previous value
      const previousData = queryClient.getQueryData(['distributions'])
      
      // Optimistically remove from list
      queryClient.setQueryData(['distributions'], (old: unknown) => {
        if (old && typeof old === 'object' && 'success' in old && 'data' in old) {
          const data = old.data as { distributions: Array<{ id: string }> }
          return {
            ...old,
            data: {
              ...data,
              distributions: data.distributions
            }
          }
        }
        return old
      })
      
      return { previousData }
    },
    onSuccess: (data) => {
      if (data.success) {
        toast.success('Distribusi berhasil dihapus')
        
        // Navigate away if on detail page
        router.push('/distribution')
        
        // Invalidate related queries
        queryClient.invalidateQueries({ queryKey: ['distribution-stats'] })
      } else {
        toast.error(data.error || 'Gagal menghapus distribusi')
      }
    },
    onError: (error, variables, context) => {
      console.error('Delete distribution error:', error)
      
      // Rollback optimistic update
      if (context?.previousData) {
        queryClient.setQueryData(['distributions'], context.previousData)
      }
      
      toast.error('Terjadi kesalahan saat menghapus distribusi')
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: ['distributions'] })
    }
  })
}

// ============= Distribution Point Mutation Hooks =============

export function useCreateDistributionPoint() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateDistributionPointInput) => createDistributionPoint(input),
    onSuccess: (data) => {
      if (data.success) {
        toast.success('Titik distribusi berhasil dibuat')
        
        // Invalidate and refetch queries
        queryClient.invalidateQueries({ queryKey: ['distribution-points'] })
      } else {
        toast.error(data.error || 'Gagal membuat titik distribusi')
      }
    },
    onError: (error) => {
      console.error('Create distribution point error:', error)
      toast.error('Terjadi kesalahan saat membuat titik distribusi')
    }
  })
}

export function useUpdateDistributionPoint() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => 
      Promise.resolve({ success: false, error: 'Update distribution point function not implemented' }),
    onSuccess: (data) => {
      if (data.success) {
        toast.success('Titik distribusi berhasil diperbarui')
        
        // Invalidate related queries
        queryClient.invalidateQueries({ queryKey: ['distribution-points'] })
      } else {
        toast.error(data.error || 'Gagal memperbarui titik distribusi')
      }
    },
    onError: (error) => {
      console.error('Update distribution point error:', error)
      toast.error('Terjadi kesalahan saat memperbarui titik distribusi')
    }
  })
}

export function useDeleteDistributionPoint() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => Promise.resolve({ success: false, error: 'Delete distribution point function not implemented' }),
    onSuccess: (data) => {
      if (data.success) {
        toast.success('Titik distribusi berhasil dihapus')
        
        // Invalidate related queries
        queryClient.invalidateQueries({ queryKey: ['distribution-points'] })
      } else {
        toast.error(data.error || 'Gagal menghapus titik distribusi')
      }
    },
    onError: (error) => {
      console.error('Delete distribution point error:', error)
      toast.error('Terjadi kesalahan saat menghapus titik distribusi')
    }
  })
}

// ============= Compound Hooks =============

export function useDistributionOperations() {
  const createDistribution = useCreateDistribution()
  const updateDistribution = useUpdateDistribution()  
  const deleteDistribution = useDeleteDistribution()

  const createPoint = useCreateDistributionPoint()
  const updatePoint = useUpdateDistributionPoint()
  const deletePoint = useDeleteDistributionPoint()

  return {
    distribution: {
      create: createDistribution.mutate,
      update: updateDistribution.mutate,
      delete: deleteDistribution.mutate,
      isCreating: createDistribution.isPending,
      isUpdating: updateDistribution.isPending,
      isDeleting: deleteDistribution.isPending
    },
    point: {
      create: createPoint.mutate,
      update: updatePoint.mutate,
      delete: deletePoint.mutate,
      isCreating: createPoint.isPending,
      isUpdating: updatePoint.isPending,
      isDeleting: deletePoint.isPending
    },
    isLoading: 
      createDistribution.isPending || 
      updateDistribution.isPending || 
      deleteDistribution.isPending ||
      createPoint.isPending ||
      updatePoint.isPending ||
      deletePoint.isPending
  }
}

// ============= Utility Hooks =============

export function useDistributionFilters() {
  // This can be extended to handle URL search params or local storage
  // for persistent filter state
  return {
    // Placeholder for filter management logic
    resetFilters: () => {
      // Reset to default filters
    },
    updateFilters: (filters: Partial<DistributionFiltersInput>) => {
      // Update filters and trigger refetch
      console.log('Updating filters:', filters)
    }
  }
}