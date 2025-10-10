/**
 * Menu Recipe Hooks
 * 
 * React hooks for managing menu recipe steps
 * Uses TanStack Query for caching and optimistic updates
 * 
 * Follows Pattern 2: Component-Level Domain Architecture
 * 
 * @module components/sppg/menu/hooks
 */

'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type {
  CreateRecipeStepInput,
  UpdateRecipeStepInput
} from '../validators/menuValidation'
import { menuKeys } from './useMenu'

// ============================================================================
// QUERY KEY FACTORY
// ============================================================================

export const recipeKeys = {
  all: ['recipes'] as const,
  lists: () => [...recipeKeys.all, 'list'] as const,
  list: (menuId: string) => [...recipeKeys.lists(), menuId] as const,
  details: () => [...recipeKeys.all, 'detail'] as const,
  detail: (id: string) => [...recipeKeys.details(), id] as const
}

// ============================================================================
// QUERY HOOKS
// ============================================================================

/**
 * useRecipe - Fetch menu recipe steps
 * 
 * Features:
 * - Ordered by stepNumber
 * - Includes duration, temperature
 * - 5-minute cache
 * 
 * @example
 * ```tsx
 * const { data: steps, isLoading } = useRecipe('menu_abc123')
 * ```
 */
export function useRecipe(menuId: string | undefined) {
  return useQuery({
    queryKey: recipeKeys.list(menuId!),
    queryFn: async () => {
      if (!menuId) throw new Error('Menu ID is required')
      
      // This will call getRecipeSteps action
      throw new Error('Not implemented yet')
    },
    enabled: !!menuId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 2
  })
}

// ============================================================================
// MUTATION HOOKS
// ============================================================================

/**
 * useCreateRecipeStep - Add new recipe step
 * 
 * Features:
 * - Auto step numbering
 * - Duration validation
 * - Temperature validation
 * - Optimistic updates
 * - Cache invalidation
 * 
 * @example
 * ```tsx
 * const createStepMutation = useCreateRecipeStep()
 * 
 * const handleAddStep = async (data: CreateRecipeStepInput) => {
 *   await createStepMutation.mutateAsync(data)
 * }
 * ```
 */
export function useCreateRecipeStep() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (input: CreateRecipeStepInput) => {
      // This will call createRecipeStep action
      throw new Error('Not implemented yet')
    },
    onSuccess: (data, variables) => {
      // Invalidate recipe list
      queryClient.invalidateQueries({ 
        queryKey: recipeKeys.list(variables.menuId) 
      })
      
      toast.success('Langkah resep berhasil ditambahkan')
    },
    onError: (error: Error) => {
      toast.error('Gagal menambahkan langkah', {
        description: error.message
      })
    },
    retry: 1
  })
}

/**
 * useUpdateRecipeStep - Update recipe step
 * 
 * Features:
 * - Partial updates
 * - Instruction editing
 * - Duration/temperature updates
 * - Optimistic updates
 * - Rollback on error
 * 
 * @example
 * ```tsx
 * const updateStepMutation = useUpdateRecipeStep('menu_abc123')
 * 
 * const handleUpdate = async (data: UpdateRecipeStepInput) => {
 *   await updateStepMutation.mutateAsync(data)
 * }
 * ```
 */
export function useUpdateRecipeStep(menuId: string) {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (input: UpdateRecipeStepInput) => {
      // This will call updateRecipeStep action
      throw new Error('Not implemented yet')
    },
    onSuccess: () => {
      // Invalidate recipe list
      queryClient.invalidateQueries({ 
        queryKey: recipeKeys.list(menuId) 
      })
      
      toast.success('Langkah resep berhasil diperbarui')
    },
    onError: (error: Error) => {
      toast.error('Gagal memperbarui langkah', {
        description: error.message
      })
    },
    retry: 1
  })
}

/**
 * useDeleteRecipeStep - Delete recipe step
 * 
 * Features:
 * - Auto renumber remaining steps
 * - Optimistic updates
 * - Cache invalidation
 * 
 * @example
 * ```tsx
 * const deleteStepMutation = useDeleteRecipeStep('menu_abc123')
 * 
 * const handleDelete = async (stepId: string) => {
 *   if (confirm('Yakin ingin menghapus langkah ini?')) {
 *     await deleteStepMutation.mutateAsync(stepId)
 *   }
 * }
 * ```
 */
export function useDeleteRecipeStep(menuId: string) {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (stepId: string) => {
      // This will call deleteRecipeStep action
      throw new Error('Not implemented yet')
    },
    onSuccess: () => {
      // Invalidate recipe list
      queryClient.invalidateQueries({ 
        queryKey: recipeKeys.list(menuId) 
      })
      
      toast.success('Langkah resep berhasil dihapus')
    },
    onError: (error: Error) => {
      toast.error('Gagal menghapus langkah', {
        description: error.message
      })
    },
    retry: 1
  })
}

/**
 * useReorderRecipeSteps - Reorder recipe steps (drag & drop)
 * 
 * Features:
 * - Batch update step numbers
 * - Optimistic updates
 * - Instant UI feedback
 * - Rollback on error
 * 
 * @example
 * ```tsx
 * const reorderMutation = useReorderRecipeSteps('menu_abc123')
 * 
 * const handleReorder = async (newOrder: StepOrder[]) => {
 *   await reorderMutation.mutateAsync(newOrder)
 * }
 * ```
 */
export function useReorderRecipeSteps(menuId: string) {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (stepOrders: Array<{ id: string; stepNumber: number }>) => {
      // This will call reorderRecipeSteps action
      throw new Error('Not implemented yet')
    },
    onMutate: async (newOrder) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: recipeKeys.list(menuId) })
      
      // Snapshot previous value
      const previousSteps = queryClient.getQueryData(recipeKeys.list(menuId))
      
      // Optimistically update
      if (previousSteps) {
        // Update cache with new order
        // (implementation depends on data structure)
      }
      
      return { previousSteps }
    },
    onSuccess: () => {
      // Invalidate to refetch
      queryClient.invalidateQueries({ 
        queryKey: recipeKeys.list(menuId) 
      })
      
      toast.success('Urutan langkah berhasil diperbarui')
    },
    onError: (error: Error, _variables, context) => {
      // Rollback on error
      if (context?.previousSteps) {
        queryClient.setQueryData(
          recipeKeys.list(menuId),
          context.previousSteps
        )
      }
      
      toast.error('Gagal mengubah urutan', {
        description: error.message
      })
    },
    retry: 1
  })
}

/**
 * useBulkCreateRecipeSteps - Create multiple steps at once
 * 
 * Features:
 * - Batch insert (1-20 steps)
 * - Auto numbering
 * - Progress tracking
 * - Optimistic updates
 * 
 * @example
 * ```tsx
 * const bulkCreateMutation = useBulkCreateRecipeSteps()
 * 
 * const handleBulkCreate = async (steps: RecipeStep[]) => {
 *   await bulkCreateMutation.mutateAsync({
 *     menuId: 'menu_abc123',
 *     steps
 *   })
 * }
 * ```
 */
export function useBulkCreateRecipeSteps() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (input: {
      menuId: string
      steps: Array<{
        stepNumber: number
        instruction: string
        duration?: number
        temperature?: number
        notes?: string
      }>
    }) => {
      // This will call bulkCreateRecipeSteps action
      throw new Error('Not implemented yet')
    },
    onSuccess: (data, variables) => {
      // Invalidate recipe list
      queryClient.invalidateQueries({ 
        queryKey: recipeKeys.list(variables.menuId) 
      })
      
      toast.success(`${variables.steps.length} langkah resep berhasil ditambahkan`)
    },
    onError: (error: Error) => {
      toast.error('Gagal menambahkan langkah', {
        description: error.message
      })
    },
    retry: 1
  })
}

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type {
  CreateRecipeStepInput,
  UpdateRecipeStepInput
}
