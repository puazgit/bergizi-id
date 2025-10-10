/**
 * Menu CRUD Hooks
 * 
 * Enterprise-grade React hooks for Menu Management CRUD operations
 * Uses TanStack Query for caching, optimistic updates, and error handling
 * 
 * Follows Pattern 2: Component-Level Domain Architecture
 * 
 * @module components/sppg/menu/hooks
 */

'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { MenuFilters } from '../types/menuTypes'
import type { 
  CreateMenuInput,
  UpdateMenuInput,
  MenuFilters as MenuFiltersOutput
} from '../validators/menuValidation'
import {
  getMenus,
  getMenu,
  createMenu,
  updateMenu,
  deleteMenu,
  getMenuStats
} from '../actions/menuActions'

// Type for filter input - accepts the interface version with all optional fields
type MenuFiltersInput = Omit<MenuFilters, 'sortBy' | 'sortOrder' | 'page' | 'limit'> & {
  sortBy?: MenuFiltersOutput['sortBy']
  sortOrder?: MenuFiltersOutput['sortOrder']
  page?: number
  limit?: number
}

// ============================================================================
// QUERY KEY FACTORY
// ============================================================================

/**
 * Query key factory for menu queries
 * Provides type-safe, consistent query keys
 */
export const menuKeys = {
  all: ['menus'] as const,
  lists: () => [...menuKeys.all, 'list'] as const,
  list: (filters?: MenuFilters) => [...menuKeys.lists(), filters] as const,
  details: () => [...menuKeys.all, 'detail'] as const,
  detail: (id: string) => [...menuKeys.details(), id] as const,
  stats: () => [...menuKeys.all, 'stats'] as const,
  statsForProgram: (programId: string) => [...menuKeys.stats(), programId] as const
}

// ============================================================================
// QUERY HOOKS
// ============================================================================

/**
 * Hook for fetching list of menus with filters
 * 
 * @param filters - Optional filters for menu list
 * @returns Query result with array of menus
 * 
 * @example
 * ```tsx
 * const { data: menus, isLoading } = useMenus({
 *   programId: 'program-1',
 *   mealType: 'LUNCH',
 *   isActive: true
 * })
 * ```
 */
export function useMenus(filters?: MenuFiltersInput) {
  return useQuery({
    queryKey: menuKeys.list(filters),
    queryFn: async () => {
      // Type assertion is safe here - getMenus will validate and apply defaults via menuFiltersSchema
      const result = await getMenus(filters as MenuFiltersOutput)
      
      if (!result.success) {
        toast.error(result.error || 'Gagal memuat daftar menu')
        throw new Error(result.error)
      }
      
      return result.data!
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000 // 10 minutes
  })
}

/**
 * useMenu - Fetch single menu detail
 * 
 * Features:
 * - Includes full relations (ingredients, recipe, program)
 * - 5-minute cache
 * - Auto-refetch disabled
 * - Nutrition and cost calculations
 * 
 * @example
 * ```tsx
 * const { data: menu, isLoading, error } = useMenu('menu_abc123')
 * ```
 */
export function useMenu(id: string | undefined) {
  return useQuery({
    queryKey: menuKeys.detail(id!),
    queryFn: async () => {
      if (!id) throw new Error('Menu ID is required')
      
      const result = await getMenu(id)
      if (!result.success) {
        throw new Error(result.error || 'Gagal mengambil detail menu')
      }
      return result.data!
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 2
  })
}

/**
 * useMenuStats - Fetch menu statistics
 * 
 * Features:
 * - Total counts by status
 * - Nutrition averages
 * - Cost statistics
 * - 2-minute cache (more frequent updates)
 * 
 * @example
 * ```tsx
 * const { data: stats, isLoading } = useMenuStats('program_abc123')
 * ```
 */
export function useMenuStats(programId?: string) {
  return useQuery({
    queryKey: programId 
      ? menuKeys.statsForProgram(programId)
      : menuKeys.stats(),
    queryFn: async () => {
      const result = await getMenuStats(programId)
      if (!result.success) {
        throw new Error(result.error || 'Gagal mengambil statistik menu')
      }
      return result.data!
    },
    staleTime: 2 * 60 * 1000, // 2 minutes (fresher data for stats)
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 2
  })
}

// ============================================================================
// MUTATION HOOKS
// ============================================================================

/**
 * useCreateMenu - Create new menu
 * 
 * Features:
 * - Zod validation
 * - Optimistic updates (optional)
 * - Auto cache invalidation
 * - Success/error toast notifications
 * - Multi-tenant security (sppgId auto-added)
 * 
 * @example
 * ```tsx
 * const createMenuMutation = useCreateMenu()
 * 
 * const handleSubmit = async (data: CreateMenuInput) => {
 *   await createMenuMutation.mutateAsync(data)
 *   router.push('/menu')
 * }
 * ```
 */
export function useCreateMenu() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (input: CreateMenuInput) => {
      const result = await createMenu(input)
      if (!result.success) {
        throw new Error(result.error || 'Gagal membuat menu')
      }
      return result.data!
    },
    onSuccess: (newMenu) => {
      // Invalidate all menu lists to refetch
      queryClient.invalidateQueries({ queryKey: menuKeys.lists() })
      
      // Invalidate stats
      queryClient.invalidateQueries({ queryKey: menuKeys.stats() })
      
      // Optionally set the new menu in cache
      queryClient.setQueryData(menuKeys.detail(newMenu.id), newMenu)
      
      toast.success('Menu berhasil dibuat', {
        description: `${newMenu.menuName} telah ditambahkan`
      })
    },
    onError: (error: Error) => {
      toast.error('Gagal membuat menu', {
        description: error.message
      })
    },
    retry: 1
  })
}

/**
 * useUpdateMenu - Update existing menu
 * 
 * Features:
 * - Partial updates (only changed fields)
 * - Optimistic updates
 * - Auto cache invalidation
 * - Success/error toast notifications
 * - Rollback on error
 * 
 * @example
 * ```tsx
 * const updateMenuMutation = useUpdateMenu()
 * 
 * const handleUpdate = async (data: UpdateMenuInput) => {
 *   await updateMenuMutation.mutateAsync(data)
 * }
 * ```
 */
export function useUpdateMenu() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (input: UpdateMenuInput) => {
      const result = await updateMenu(input)
      if (!result.success) {
        throw new Error(result.error || 'Gagal memperbarui menu')
      }
      return result.data!
    },
    onMutate: async (input) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: menuKeys.detail(input.id) })
      
      // Snapshot previous value for rollback
      const previousMenu = queryClient.getQueryData(menuKeys.detail(input.id))
      
      // Optimistically update cache
      if (previousMenu) {
        queryClient.setQueryData(menuKeys.detail(input.id), {
          ...previousMenu,
          ...input
        })
      }
      
      return { previousMenu }
    },
    onSuccess: (updatedMenu) => {
      // Update detail cache
      queryClient.setQueryData(menuKeys.detail(updatedMenu.id), updatedMenu)
      
      // Invalidate lists to refetch
      queryClient.invalidateQueries({ queryKey: menuKeys.lists() })
      
      // Invalidate stats
      queryClient.invalidateQueries({ queryKey: menuKeys.stats() })
      
      toast.success('Menu berhasil diperbarui', {
        description: `${updatedMenu.menuName} telah diperbarui`
      })
    },
    onError: (error: Error, input, context) => {
      // Rollback on error
      if (context?.previousMenu) {
        queryClient.setQueryData(
          menuKeys.detail(input.id),
          context.previousMenu
        )
      }
      
      toast.error('Gagal memperbarui menu', {
        description: error.message
      })
    },
    onSettled: (data, error, input) => {
      // Always refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: menuKeys.detail(input.id) })
    },
    retry: 1
  })
}

/**
 * useDeleteMenu - Delete menu (soft delete)
 * 
 * Features:
 * - Soft delete (sets isActive = false)
 * - Audit logging
 * - Auto cache invalidation
 * - Success/error toast notifications
 * - Confirmation required (UI responsibility)
 * 
 * @example
 * ```tsx
 * const deleteMenuMutation = useDeleteMenu()
 * 
 * const handleDelete = async (menuId: string) => {
 *   if (confirm('Yakin ingin menghapus menu ini?')) {
 *     await deleteMenuMutation.mutateAsync(menuId)
 *   }
 * }
 * ```
 */
export function useDeleteMenu() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (menuId: string) => {
      const result = await deleteMenu(menuId)
      if (!result.success) {
        throw new Error(result.error || 'Gagal menghapus menu')
      }
      return result.data!
    },
    onSuccess: (deletedMenu) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: menuKeys.detail(deletedMenu.id) })
      
      // Invalidate lists to refetch
      queryClient.invalidateQueries({ queryKey: menuKeys.lists() })
      
      // Invalidate stats
      queryClient.invalidateQueries({ queryKey: menuKeys.stats() })
      
      toast.success('Menu berhasil dihapus', {
        description: `${deletedMenu.menuName} telah dihapus`
      })
    },
    onError: (error: Error) => {
      toast.error('Gagal menghapus menu', {
        description: error.message
      })
    },
    retry: 1
  })
}

// ============================================================================
// BULK OPERATION HOOKS
// ============================================================================

/**
 * useBulkUpdateMenuStatus - Update status for multiple menus
 * 
 * Features:
 * - Batch updates (max 50 menus)
 * - Progress tracking (optional)
 * - Auto cache invalidation
 * - Success/error toast notifications
 * 
 * @example
 * ```tsx
 * const bulkUpdateMutation = useBulkUpdateMenuStatus()
 * 
 * const handleBulkActivate = async (menuIds: string[]) => {
 *   await bulkUpdateMutation.mutateAsync({
 *     menuIds,
 *     isActive: true
 *   })
 * }
 * ```
 */
export function useBulkUpdateMenuStatus() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (input: { menuIds: string[]; isActive: boolean }) => {
      // This will be implemented in menuActions.ts
      throw new Error('Not implemented yet')
    },
    onSuccess: (data, variables) => {
      // Invalidate all affected queries
      queryClient.invalidateQueries({ queryKey: menuKeys.lists() })
      queryClient.invalidateQueries({ queryKey: menuKeys.stats() })
      
      // Remove individual caches
      variables.menuIds.forEach(id => {
        queryClient.removeQueries({ queryKey: menuKeys.detail(id) })
      })
      
      const action = variables.isActive ? 'diaktifkan' : 'dinonaktifkan'
      toast.success(`${variables.menuIds.length} menu berhasil ${action}`)
    },
    onError: (error: Error) => {
      toast.error('Gagal memperbarui status menu', {
        description: error.message
      })
    },
    retry: 1
  })
}

/**
 * useBulkDeleteMenus - Delete multiple menus
 * 
 * Features:
 * - Batch deletes (max 50 menus)
 * - Soft delete
 * - Progress tracking (optional)
 * - Auto cache invalidation
 * - Success/error toast notifications
 * 
 * @example
 * ```tsx
 * const bulkDeleteMutation = useBulkDeleteMenus()
 * 
 * const handleBulkDelete = async (menuIds: string[]) => {
 *   if (confirm(`Yakin ingin menghapus ${menuIds.length} menu?`)) {
 *     await bulkDeleteMutation.mutateAsync({ menuIds })
 *   }
 * }
 * ```
 */
export function useBulkDeleteMenus() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (input: { menuIds: string[]; reason?: string }) => {
      // This will be implemented in menuActions.ts
      throw new Error('Not implemented yet')
    },
    onSuccess: (data, variables) => {
      // Invalidate all affected queries
      queryClient.invalidateQueries({ queryKey: menuKeys.lists() })
      queryClient.invalidateQueries({ queryKey: menuKeys.stats() })
      
      // Remove individual caches
      variables.menuIds.forEach(id => {
        queryClient.removeQueries({ queryKey: menuKeys.detail(id) })
      })
      
      toast.success(`${variables.menuIds.length} menu berhasil dihapus`)
    },
    onError: (error: Error) => {
      toast.error('Gagal menghapus menu', {
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
  CreateMenuInput,
  UpdateMenuInput
}
