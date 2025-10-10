// Procurement Server Actions Hooks
// Enterprise React Query Hooks for Procurement Management

'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

// Import server actions
import {
  getProcurements,
  getProcurementById,
  createProcurement,
  updateProcurement,
  deleteProcurement,
  getProcurementStats
} from '@/actions/sppg/procurement'

// Import types
import type {
  CreateProcurementInput,
  UpdateProcurementInput,
  ProcurementFilters
} from '@/actions/sppg/procurement'

// ============= Query Hooks =============

export function useProcurements(filters?: ProcurementFilters) {
  return useQuery({
    queryKey: ['procurements', filters],
    queryFn: () => getProcurements(filters),
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

export function useProcurement(id: string | null) {
  return useQuery({
    queryKey: ['procurement', id],
    queryFn: () => {
      if (!id) throw new Error('Procurement ID is required')
      return getProcurementById(id)
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

export function useProcurementStats() {
  return useQuery({
    queryKey: ['procurement-stats'],
    queryFn: getProcurementStats,
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

// ============= Mutation Hooks =============

export function useCreateProcurement() {
  const queryClient = useQueryClient()
  const router = useRouter()

  return useMutation({
    mutationFn: (input: CreateProcurementInput) => createProcurement(input),
    onSuccess: (data) => {
      if (data.success) {
        toast.success('Procurement berhasil dibuat')
        
        // Invalidate and refetch queries
        queryClient.invalidateQueries({ queryKey: ['procurements'] })
        queryClient.invalidateQueries({ queryKey: ['procurement-stats'] })
        
        // Redirect to procurement detail
        if (data.data?.id) {
          router.push(`/procurement/${data.data.id}`)
        }
      } else {
        toast.error(data.error || 'Gagal membuat procurement')
      }
    },
    onError: (error) => {
      console.error('Create procurement error:', error)
      toast.error('Terjadi kesalahan saat membuat procurement')
    }
  })
}

export function useUpdateProcurement() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateProcurementInput }) => 
      updateProcurement(id, input),
    onMutate: async ({ id, input }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['procurement', id] })
      
      // Snapshot previous value
      const previousData = queryClient.getQueryData(['procurement', id])
      
      // Optimistically update
      queryClient.setQueryData(['procurement', id], (old: any) => {
        if (old && typeof old === 'object' && 'success' in old && old.data) {
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
        toast.success('Procurement berhasil diperbarui')
        
        // Invalidate related queries
        queryClient.invalidateQueries({ queryKey: ['procurements'] })
        queryClient.invalidateQueries({ queryKey: ['procurement-stats'] })
      } else {
        toast.error(data.error || 'Gagal memperbarui procurement')
      }
    },
    onError: (error, variables, context) => {
      console.error('Update procurement error:', error)
      
      // Rollback optimistic update
      if (context?.previousData) {
        queryClient.setQueryData(['procurement', variables.id], context.previousData)
      }
      
      toast.error('Terjadi kesalahan saat memperbarui procurement')
    },
    onSettled: (data, error, variables) => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: ['procurement', variables.id] })
    }
  })
}

export function useDeleteProcurement() {
  const queryClient = useQueryClient()
  const router = useRouter()

  return useMutation({
    mutationFn: (id: string) => deleteProcurement(id),
    onMutate: async (id) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['procurements'] })
      
      // Snapshot previous value
      const previousData = queryClient.getQueryData(['procurements'])
      
      // Optimistically remove from list
      queryClient.setQueryData(['procurements'], (old: unknown) => {
        if (old && typeof old === 'object' && 'success' in old && 'data' in old) {
          const data = old.data as { procurements: Array<{ id: string }> }
          return {
            ...old,
            data: {
              ...data,
              procurements: data.procurements.filter((p) => p.id !== id)
            }
          }
        }
        return old
      })
      
      return { previousData }
    },
    onSuccess: (data) => {
      if (data.success) {
        toast.success('Procurement berhasil dihapus')
        
        // Navigate away if on detail page
        router.push('/procurement')
        
        // Invalidate related queries
        queryClient.invalidateQueries({ queryKey: ['procurement-stats'] })
      } else {
        toast.error(data.error || 'Gagal menghapus procurement')
      }
    },
    onError: (error, variables, context) => {
      console.error('Delete procurement error:', error)
      
      // Rollback optimistic update
      if (context?.previousData) {
        queryClient.setQueryData(['procurements'], context.previousData)
      }
      
      toast.error('Terjadi kesalahan saat menghapus procurement')
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: ['procurements'] })
    }
  })
}

// ============= Compound Hooks =============

export function useProcurementOperations() {
  const createMutation = useCreateProcurement()
  const updateMutation = useUpdateProcurement()
  const deleteMutation = useDeleteProcurement()

  return {
    create: createMutation.mutate,
    update: updateMutation.mutate,
    delete: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isLoading: createMutation.isPending || updateMutation.isPending || deleteMutation.isPending
  }
}

// ============= Utility Hooks =============

export function useProcurementFilters() {
  // This can be extended to handle URL search params or local storage
  // for persistent filter state
  return {
    // Placeholder for filter management logic
    resetFilters: () => {
      // Reset to default filters
    },
    updateFilters: (filters: Partial<ProcurementFilters>) => {
      // Update filters and trigger refetch
      console.log('Updating filters:', filters)
    }
  }
}