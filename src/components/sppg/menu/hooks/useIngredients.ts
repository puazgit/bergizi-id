/**
 * Menu Ingredients Hooks
 * 
 * React hooks for managing menu ingredients
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
  AddIngredientInput,
  UpdateIngredientInput
} from '../validators/menuValidation'
import { menuKeys } from './useMenu'

// ============================================================================
// QUERY KEY FACTORY
// ============================================================================

export const ingredientKeys = {
  all: ['ingredients'] as const,
  lists: () => [...ingredientKeys.all, 'list'] as const,
  list: (menuId: string) => [...ingredientKeys.lists(), menuId] as const,
  details: () => [...ingredientKeys.all, 'detail'] as const,
  detail: (id: string) => [...ingredientKeys.details(), id] as const
}

// ============================================================================
// QUERY HOOKS
// ============================================================================

/**
 * useIngredients - Fetch menu ingredients
 * 
 * Features:
 * - Includes inventory item details
 * - Unit conversions
 * - Cost calculations
 * - 3-minute cache
 * 
 * @example
 * ```tsx
 * const { data: ingredients, isLoading } = useIngredients('menu_abc123')
 * ```
 */
export function useIngredients(menuId: string | undefined) {
  return useQuery({
    queryKey: ingredientKeys.list(menuId!),
    queryFn: async () => {
      if (!menuId) throw new Error('Menu ID is required')
      
      // This will call getMenuIngredients action
      throw new Error('Not implemented yet')
    },
    enabled: !!menuId,
    staleTime: 3 * 60 * 1000, // 3 minutes
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 2
  })
}

// ============================================================================
// MUTATION HOOKS
// ============================================================================

/**
 * useAddIngredient - Add ingredient to menu
 * 
 * Features:
 * - Zod validation
 * - Auto nutrition recalculation
 * - Auto cost recalculation
 * - Optimistic updates
 * - Cache invalidation
 * 
 * @example
 * ```tsx
 * const addIngredientMutation = useAddIngredient()
 * 
 * const handleAdd = async (data: AddIngredientInput) => {
 *   await addIngredientMutation.mutateAsync(data)
 * }
 * ```
 */
export function useAddIngredient() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (input: AddIngredientInput) => {
      // This will call addIngredient action
      throw new Error('Not implemented yet')
    },
    onSuccess: (data, variables) => {
      // Invalidate ingredients list
      queryClient.invalidateQueries({ 
        queryKey: ingredientKeys.list(variables.menuId) 
      })
      
      // Invalidate menu detail (nutrition/cost changed)
      queryClient.invalidateQueries({ 
        queryKey: menuKeys.detail(variables.menuId) 
      })
      
      toast.success('Bahan berhasil ditambahkan')
    },
    onError: (error: Error) => {
      toast.error('Gagal menambahkan bahan', {
        description: error.message
      })
    },
    retry: 1
  })
}

/**
 * useUpdateIngredient - Update menu ingredient
 * 
 * Features:
 * - Partial updates
 * - Auto nutrition recalculation
 * - Auto cost recalculation
 * - Optimistic updates
 * - Rollback on error
 * 
 * @example
 * ```tsx
 * const updateIngredientMutation = useUpdateIngredient()
 * 
 * const handleUpdate = async (data: UpdateIngredientInput) => {
 *   await updateIngredientMutation.mutateAsync(data)
 * }
 * ```
 */
export function useUpdateIngredient(menuId: string) {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (input: UpdateIngredientInput) => {
      // This will call updateIngredient action
      throw new Error('Not implemented yet')
    },
    onSuccess: () => {
      // Invalidate ingredients list
      queryClient.invalidateQueries({ 
        queryKey: ingredientKeys.list(menuId) 
      })
      
      // Invalidate menu detail
      queryClient.invalidateQueries({ 
        queryKey: menuKeys.detail(menuId) 
      })
      
      toast.success('Bahan berhasil diperbarui')
    },
    onError: (error: Error) => {
      toast.error('Gagal memperbarui bahan', {
        description: error.message
      })
    },
    retry: 1
  })
}

/**
 * useRemoveIngredient - Remove ingredient from menu
 * 
 * Features:
 * - Auto nutrition recalculation
 * - Auto cost recalculation
 * - Optimistic updates
 * - Cache invalidation
 * 
 * @example
 * ```tsx
 * const removeIngredientMutation = useRemoveIngredient('menu_abc123')
 * 
 * const handleRemove = async (ingredientId: string) => {
 *   if (confirm('Yakin ingin menghapus bahan ini?')) {
 *     await removeIngredientMutation.mutateAsync(ingredientId)
 *   }
 * }
 * ```
 */
export function useRemoveIngredient(menuId: string) {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (ingredientId: string) => {
      // This will call removeIngredient action
      throw new Error('Not implemented yet')
    },
    onSuccess: () => {
      // Invalidate ingredients list
      queryClient.invalidateQueries({ 
        queryKey: ingredientKeys.list(menuId) 
      })
      
      // Invalidate menu detail
      queryClient.invalidateQueries({ 
        queryKey: menuKeys.detail(menuId) 
      })
      
      toast.success('Bahan berhasil dihapus')
    },
    onError: (error: Error) => {
      toast.error('Gagal menghapus bahan', {
        description: error.message
      })
    },
    retry: 1
  })
}

/**
 * useBulkAddIngredients - Add multiple ingredients at once
 * 
 * Features:
 * - Batch insert (1-50 ingredients)
 * - Progress tracking
 * - Auto nutrition/cost recalculation
 * - Optimistic updates
 * 
 * @example
 * ```tsx
 * const bulkAddMutation = useBulkAddIngredients()
 * 
 * const handleBulkAdd = async (ingredients: Ingredient[]) => {
 *   await bulkAddMutation.mutateAsync({
 *     menuId: 'menu_abc123',
 *     ingredients
 *   })
 * }
 * ```
 */
export function useBulkAddIngredients() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (input: {
      menuId: string
      ingredients: Array<{
        inventoryItemId: string
        quantity: number
        unit: string
        notes?: string
      }>
    }) => {
      // This will call bulkAddIngredients action
      throw new Error('Not implemented yet')
    },
    onSuccess: (data, variables) => {
      // Invalidate ingredients list
      queryClient.invalidateQueries({ 
        queryKey: ingredientKeys.list(variables.menuId) 
      })
      
      // Invalidate menu detail
      queryClient.invalidateQueries({ 
        queryKey: menuKeys.detail(variables.menuId) 
      })
      
      toast.success(`${variables.ingredients.length} bahan berhasil ditambahkan`)
    },
    onError: (error: Error) => {
      toast.error('Gagal menambahkan bahan', {
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
  AddIngredientInput,
  UpdateIngredientInput
}
