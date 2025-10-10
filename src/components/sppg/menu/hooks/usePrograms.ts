// Program Management Hooks - Pattern 2 Architecture  
// src/components/sppg/menu/hooks/usePrograms.ts

'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'
import { 
  getPrograms, 
  createProgram, 
  updateProgram, 
  deleteProgram 
} from '@/actions/sppg/menu'
import { 
  type ProgramFormInput, 
  type ProgramUpdate,
  type ProgramWithDetails 
} from '../types'

// ============================================================================
// ENTERPRISE QUERY KEYS - Program Management
// ============================================================================

export const programKeys = {
  all: ['programs'] as const,
  lists: () => [...programKeys.all, 'list'] as const,
  list: (sppgId: string) => [...programKeys.lists(), sppgId] as const,
  detail: (programId: string) => [...programKeys.all, 'detail', programId] as const,
}

// ============================================================================
// PROGRAMS HOOK - Enterprise-grade with optimistic updates
// ============================================================================

export const usePrograms = () => {
  const { data: session } = useSession()
  const queryClient = useQueryClient()

  // List programs with enterprise caching
  const {
    data: programsData,
    isLoading,
    error,
    refetch
  } = useQuery<ProgramWithDetails[]>({
    queryKey: programKeys.list(session?.user?.sppgId || ''),
    queryFn: async () => {
      const result = await getPrograms()
      if (!result.success) {
        console.error('getPrograms failed:', result.error)
        toast.error('Gagal memuat program', {
          description: result.error || 'Terjadi kesalahan saat memuat data program'
        })
        throw new Error(result.error || 'Failed to get programs')
      }
      return (result.data || []) as ProgramWithDetails[]
    },
    enabled: !!session?.user?.sppgId,
    staleTime: 10 * 60 * 1000, // 10 minutes - programs change less frequently
    gcTime: 15 * 60 * 1000, // 15 minutes garbage collection
    refetchOnWindowFocus: false,
    retry: (failureCount, error) => {
      if (failureCount < 2) {
        console.log(`🔄 Retrying program fetch, attempt ${failureCount + 1}`)
        return true
      }
      console.error('❌ Program fetch failed after 2 attempts:', error)
      return false
    }
  })

  const programs = programsData || []

  // Create program mutation with optimistic update
  const createProgramMutation = useMutation({
    mutationFn: async (programData: Omit<ProgramFormInput, 'startDate' | 'endDate'> & { startDate?: string; endDate?: string }) => {
      const result = await createProgram(programData)
      if (!result.success) {
        throw new Error(result.error)
      }
      return result.data
    },
    onSuccess: (newProgram) => {
      queryClient.invalidateQueries({ queryKey: programKeys.lists() })
      if (newProgram && typeof newProgram === 'object' && 'name' in newProgram) {
        toast.success(`Program "${(newProgram as { name: string }).name}" berhasil dibuat`)
      } else {
        toast.success('Program berhasil dibuat')
      }
    },
    onError: (error: Error) => {
      toast.error(`Gagal membuat program: ${error.message}`)
    }
  })

  // Update program mutation with optimistic update
  const updateProgramMutation = useMutation({
    mutationFn: async ({ 
      programId, 
      data 
    }: { 
      programId: string
      data: ProgramUpdate 
    }) => {
      const result = await updateProgram({ programId, ...data })
      if (!result.success) {
        throw new Error(result.error)
      }
      return result.data
    },
    // Optimistic update
    onMutate: async ({ programId, data }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ 
        queryKey: programKeys.list(session?.user?.sppgId || '') 
      })

      // Snapshot previous value
      const previousPrograms = queryClient.getQueryData<ProgramWithDetails[]>(
        programKeys.list(session?.user?.sppgId || '')
      )

      // Optimistically update
      queryClient.setQueryData<ProgramWithDetails[]>(
        programKeys.list(session?.user?.sppgId || ''),
        (old) => {
          if (!old) return old
          return old.map((p) => 
            p.id === programId ? { ...p, ...data } as ProgramWithDetails : p
          )
        }
      )

      return { previousPrograms }
    },
    onSuccess: (updatedProgram) => {
      queryClient.invalidateQueries({ queryKey: programKeys.lists() })
      if (updatedProgram && typeof updatedProgram === 'object' && 'name' in updatedProgram) {
        toast.success(`Program "${(updatedProgram as { name: string }).name}" berhasil diperbarui`)
      } else {
        toast.success('Program berhasil diperbarui')
      }
    },
    onError: (error: Error, _variables, context) => {
      // Rollback on error
      if (context?.previousPrograms) {
        queryClient.setQueryData(
          programKeys.list(session?.user?.sppgId || ''),
          context.previousPrograms
        )
      }
      toast.error(`Gagal memperbarui program: ${error.message}`)
    }
  })

  // Delete program mutation with optimistic update
  const deleteProgramMutation = useMutation({
    mutationFn: async (programId: string) => {
      const result = await deleteProgram(programId)
      if (!result.success) {
        throw new Error(result.error)
      }
      return result.data
    },
    // Optimistic update
    onMutate: async (programId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ 
        queryKey: programKeys.list(session?.user?.sppgId || '') 
      })

      // Snapshot previous value
      const previousPrograms = queryClient.getQueryData<ProgramWithDetails[]>(
        programKeys.list(session?.user?.sppgId || '')
      )

      // Optimistically update
      queryClient.setQueryData<ProgramWithDetails[]>(
        programKeys.list(session?.user?.sppgId || ''),
        (old) => {
          if (!old) return old
          return old.filter((p) => p.id !== programId)
        }
      )

      return { previousPrograms }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: programKeys.lists() })
      toast.success('Program berhasil dihapus')
    },
    onError: (error: Error, _programId, context) => {
      // Rollback on error
      if (context?.previousPrograms) {
        queryClient.setQueryData(
          programKeys.list(session?.user?.sppgId || ''),
          context.previousPrograms
        )
      }
      toast.error(`Gagal menghapus program: ${error.message}`)
    }
  })

  return {
    // Data
    programs: programs || [],
    isLoading,
    error,

    // Actions
    createProgram: createProgramMutation.mutate,
    updateProgram: updateProgramMutation.mutate,
    deleteProgram: deleteProgramMutation.mutate,
    refetch,

    // States
    isCreating: createProgramMutation.isPending,
    isUpdating: updateProgramMutation.isPending,
    isDeleting: deleteProgramMutation.isPending,

    // Enterprise helpers
    invalidateCache: () => {
      queryClient.invalidateQueries({ queryKey: programKeys.lists() })
    },
    
    // Bulk operations helper
    bulkInvalidate: () => {
      queryClient.invalidateQueries({ queryKey: programKeys.all })
    }
  }
}

// ============================================================================
// PROGRAM OPTIONS HOOK - For dropdowns and selectors
// ============================================================================

export const useProgramOptions = () => {
  const { programs, isLoading } = usePrograms()

  const activePrograms = programs.filter(p => p.status === 'ACTIVE')
  
  const programOptions = activePrograms.map(program => ({
    value: program.id,
    label: program.name,
    description: program.description || undefined,
    programType: program.programType,
    targetGroup: program.targetGroup
  }))

  return {
    programOptions,
    activePrograms,
    isLoading,
    hasActivePrograms: activePrograms.length > 0
  }
}

// ============================================================================
// SINGLE PROGRAM HOOK - For program detail pages
// ============================================================================

export const useProgram = (programId: string | undefined) => {
  const { data: session } = useSession()
  const queryClient = useQueryClient()

  const {
    data: program,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: programKeys.detail(programId || ''),
    queryFn: async () => {
      if (!programId) {
        throw new Error('Program ID is required')
      }
      const result = await getPrograms()
      if (!result.success) {
        throw new Error(result.error)
      }
      const programs = (result.data || []) as ProgramWithDetails[]
      const foundProgram = programs.find((p: ProgramWithDetails) => p.id === programId)
      if (!foundProgram) {
        throw new Error('Program not found')
      }
      return foundProgram
    },
    enabled: !!programId && !!session?.user?.sppgId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1
  })

  return {
    program,
    isLoading,
    error,
    refetch,
    invalidateCache: () => {
      queryClient.invalidateQueries({ queryKey: programKeys.detail(programId || '') })
    }
  }
}

// ============================================================================
// PROGRAM STATISTICS HOOK - For dashboard and analytics
// ============================================================================

export const useProgramStats = () => {
  const { programs, isLoading } = usePrograms()

  if (programs.length === 0) {
    return {
      stats: null,
      isLoading
    }
  }

  // Calculate statistics
  const totalPrograms = programs.length
  const activePrograms = programs.filter(p => p.status === 'ACTIVE').length
  const completedPrograms = programs.filter(p => p.status === 'COMPLETED').length
  const totalRecipients = programs.reduce((sum, p) => sum + (p.currentRecipients || 0), 0)
  const totalBudget = programs.reduce((sum, p) => sum + (p.totalBudget || 0), 0)
  
  const budgetUtilization = totalBudget > 0 
    ? (programs.reduce((sum, p) => {
        // This would need actual spent amount from database
        const spent = (p.currentRecipients || 0) * (p.budgetPerMeal || 0)
        return sum + spent
      }, 0) / totalBudget) * 100
    : 0

  const averageRecipients = totalPrograms > 0 
    ? totalRecipients / totalPrograms 
    : 0

  // Group by program type
  const programsByType = programs.reduce((acc, program) => {
    const existing = acc.find(item => item.type === program.programType)
    if (existing) {
      existing.count += 1
      existing.recipients += program.currentRecipients || 0
    } else {
      acc.push({
        type: program.programType,
        count: 1,
        recipients: program.currentRecipients || 0
      })
    }
    return acc
  }, [] as Array<{ type: string; count: number; recipients: number }>)

  // Group by target group
  const programsByTarget = programs.reduce((acc, program) => {
    const existing = acc.find(item => item.target === program.targetGroup)
    if (existing) {
      existing.count += 1
      existing.recipients += program.currentRecipients || 0
    } else {
      acc.push({
        target: program.targetGroup,
        count: 1,
        recipients: program.currentRecipients || 0
      })
    }
    return acc
  }, [] as Array<{ target: string; count: number; recipients: number }>)

  return {
    stats: {
      totalPrograms,
      activePrograms,
      completedPrograms,
      totalRecipients,
      totalBudget,
      budgetUtilization: Math.round(budgetUtilization * 100) / 100,
      averageRecipients: Math.round(averageRecipients * 100) / 100,
      programsByType,
      programsByTarget
    },
    isLoading
  }
}

// ============================================================================
// PROGRAM SEARCH HOOK - For searchable program selection
// ============================================================================

export const useProgramSearch = (searchTerm: string = '') => {
  const { programs, isLoading } = usePrograms()

  const filteredPrograms = programs.filter(program => {
    if (!searchTerm) return true
    
    const search = searchTerm.toLowerCase()
    return (
      program.name.toLowerCase().includes(search) ||
      program.programCode.toLowerCase().includes(search) ||
      program.description?.toLowerCase().includes(search) ||
      program.implementationArea.toLowerCase().includes(search)
    )
  })

  return {
    programs: filteredPrograms,
    isLoading,
    hasResults: filteredPrograms.length > 0,
    resultCount: filteredPrograms.length
  }
}
