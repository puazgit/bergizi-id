// Cross-domain SPPG Procurement Hook - Following Enterprise Pattern
// Bergizi-ID SaaS Platform - Component-Level Hooks

'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { 
  getProcurements,
  createProcurement, 
  updateProcurement,
  deleteProcurement 
} from '@/actions/sppg/procurement'
import type { 
  CreateProcurementInput,
  UpdateProcurementInput,
  ProcurementFilters 
} from '@/actions/sppg/procurement'
// import type { ProcurementListQuery } from '../types/procurement'

/**
 * Hook for fetching procurement list
 */
export function useProcurementList(query?: ProcurementFilters) {
  return useQuery({
    queryKey: ['procurements', query],
    queryFn: () => getProcurements(query),
    staleTime: 5 * 60 * 1000, // 5 minutes,
  })
}

/**
 * Hook for creating procurement
 */
export function useCreateProcurement() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateProcurementInput) => createProcurement(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['procurements'] })
      toast.success('Procurement berhasil dibuat')
    },
    onError: (error: Error) => {
      toast.error(`Gagal membuat procurement: ${error.message}`)
    },
  })
}

/**
 * Hook for updating procurement
 */
export function useUpdateProcurement() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProcurementInput }) => 
      updateProcurement(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['procurements'] })
      toast.success('Procurement berhasil diperbarui')
    },
    onError: (error: Error) => {
      toast.error(`Gagal memperbarui procurement: ${error.message}`)
    },
  })
}

/**
 * Hook for deleting procurement
 */
export function useDeleteProcurement() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteProcurement(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['procurements'] })
      toast.success('Procurement berhasil dihapus')
    },
    onError: (error: Error) => {
      toast.error(`Gagal menghapus procurement: ${error.message}`)
    },
  })
}