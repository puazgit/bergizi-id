// Menu Domain Hooks - Pattern 2 Architecture
// Bergizi-ID SaaS Platform - SPPG Menu Management

'use client'

import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'

// Server Actions
import {
  getMenus,
  getMenuById,
  createMenu,
  updateMenu,
  deleteMenu,
  updateMenuIngredients,
  getMenuAnalytics
} from '@/actions/sppg/menu'

// Types - Import from server actions and domain types
import type {
  MenuFilters,
  CreateMenuInput,
  UpdateMenuInput
} from '@/actions/sppg/menu'

import type {
  MenuWithDetails,
  MenuListItem
} from '../types/menuTypes'

interface MenuStats {
  totalMenus: number
  activeMenus: number
  inactiveMenus: number
}

interface PaginatedMenusResult {
  menus: MenuListItem[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// Schemas
import { validateMenuFilters } from '../utils/menuSchemas'

// ============= Query Hooks =============

export function useMenus(filters?: MenuFilters) {
  const { data: session } = useSession()

  return useQuery({
    queryKey: ['menus', filters],
    queryFn: async (): Promise<PaginatedMenusResult> => {
      const validatedFilters = validateMenuFilters(filters || {})
      if (!validatedFilters.success) {
        throw new Error('Invalid filters')
      }

      const result = await getMenus(validatedFilters.data)
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch menus')
      }
      // Convert array to paginated result format
      const menus = result.data as MenuListItem[]
      return {
        menus,
        total: menus.length,
        page: 1,
        limit: menus.length,
        totalPages: 1
      } as PaginatedMenusResult
    },
    enabled: !!session?.user?.sppgId,
    staleTime: 30000, // 30 seconds
    refetchOnWindowFocus: false
  })
}

export function useMenu(id: string) {
  const { data: session } = useSession()

  return useQuery({
    queryKey: ['menu', id],
    queryFn: async (): Promise<MenuWithDetails> => {
      const result = await getMenuById(id)
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch menu')
      }
      return result.data as unknown as MenuWithDetails
    },
    enabled: !!id && !!session?.user?.sppgId,
    staleTime: 30000,
    refetchOnWindowFocus: false
  })
}

export function useMenuStats(programId?: string) {
  const { data: session } = useSession()

  return useQuery({
    queryKey: ['menu-stats', programId],
    queryFn: async (): Promise<MenuStats> => {
      const result = await getMenuAnalytics()
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch menu stats')
      }
      // Convert server data to MenuStats format
      const serverData = result.data as {
        total: number
        active: number
        halal: number
        vegetarian: number
        avgCalories: number
        avgCost: number
      }
      return {
        totalMenus: serverData.total || 0,
        activeMenus: serverData.active || 0,
        inactiveMenus: (serverData.total || 0) - (serverData.active || 0),
        menusByMealType: {}, // TODO: implement if needed
        avgCalories: serverData.avgCalories || 0,
        avgCost: serverData.avgCost || 0,
        avgProtein: 0 // TODO: implement if needed
      } as MenuStats
    },
    enabled: !!session?.user?.sppgId,
    staleTime: 60000, // 1 minute
    refetchOnWindowFocus: false
  })
}

// ============= Mutation Hooks =============

export function useCreateMenu() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: CreateMenuInput): Promise<MenuWithDetails> => {
      const result = await createMenu(input)
      if (!result.success) {
        throw new Error(result.error || 'Failed to create menu')
      }
      return result.data as MenuWithDetails
    },
    onSuccess: (data) => {
      // Invalidate and refetch menus
      queryClient.invalidateQueries({ queryKey: ['menus'] })
      queryClient.invalidateQueries({ queryKey: ['menu-stats'] })
      
      // Add to cache
      queryClient.setQueryData(['menu', data.id], data)
      
      toast.success('Menu berhasil dibuat')
    },
    onError: (error) => {
      toast.error(error.message || 'Gagal membuat menu')
    }
  })
}

export function useUpdateMenu() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: UpdateMenuInput }): Promise<MenuWithDetails> => {
      const result = await updateMenu(id, input)
      if (!result.success) {
        throw new Error(result.error || 'Failed to update menu')
      }
      return result.data as MenuWithDetails
    },
    onSuccess: (data) => {
      // Update cache
      queryClient.setQueryData(['menu', data.id], data)
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['menus'] })
      queryClient.invalidateQueries({ queryKey: ['menu-stats'] })
      
      toast.success('Menu berhasil diperbarui')
    },
    onError: (error) => {
      toast.error(error.message || 'Gagal memperbarui menu')
    }
  })
}

export function useDeleteMenu() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const result = await deleteMenu(id)
      if (!result.success) {
        throw new Error(result.error || 'Failed to delete menu')
      }
    },
    onSuccess: (_, id) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: ['menu', id] })
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['menus'] })
      queryClient.invalidateQueries({ queryKey: ['menu-stats'] })
      
      toast.success('Menu berhasil dihapus')
    },
    onError: (error) => {
      toast.error(error.message || 'Gagal menghapus menu')
    }
  })
}

export function useDuplicateMenu() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ 
      sourceId, 
      newName, 
      newCode, 
      copyIngredients = true 
    }: { 
      sourceId: string
      newName: string
      newCode: string
      copyIngredients?: boolean
    }): Promise<MenuWithDetails> => {
      // TODO: Implement duplicateMenu server action
      throw new Error('Duplicate menu feature not yet implemented')
      if (!result.success) {
        throw new Error(result.error || 'Failed to duplicate menu')
      }
      return result.data as MenuWithDetails
    },
    onSuccess: (data) => {
      // Add to cache
      queryClient.setQueryData(['menu', data.id], data)
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['menus'] })
      queryClient.invalidateQueries({ queryKey: ['menu-stats'] })
      
      toast.success('Menu berhasil diduplikasi')
    },
    onError: (error) => {
      toast.error(error.message || 'Gagal menduplikasi menu')
    }
  })
}

export function useBulkUpdateMenus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ 
      menuIds, 
      updates 
    }: { 
      menuIds: string[]
      updates: Partial<UpdateMenuInput>
    }): Promise<void> => {
      // TODO: Implement bulkUpdateMenus server action
      throw new Error('Bulk update feature not yet implemented')
    },
    onSuccess: (_, { menuIds }) => {
      // Remove affected menus from cache
      menuIds.forEach(id => {
        queryClient.removeQueries({ queryKey: ['menu', id] })
      })
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['menus'] })
      queryClient.invalidateQueries({ queryKey: ['menu-stats'] })
      
      toast.success(`${menuIds.length} menu berhasil diperbarui`)
    },
    onError: (error) => {
      toast.error(error.message || 'Gagal memperbarui menu')
    }
  })
}

export function useBulkDeleteMenus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ 
      menuIds, 
      force = false 
    }: { 
      menuIds: string[]
      force?: boolean
    }): Promise<void> => {
      // TODO: Implement bulkDeleteMenus server action
      throw new Error('Bulk delete feature not yet implemented')
    },
    onSuccess: (_, { menuIds }) => {
      // Remove from cache
      menuIds.forEach(id => {
        queryClient.removeQueries({ queryKey: ['menu', id] })
      })
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['menus'] })
      queryClient.invalidateQueries({ queryKey: ['menu-stats'] })
      
      toast.success(`${menuIds.length} menu berhasil dihapus`)
    },
    onError: (error) => {
      toast.error(error.message || 'Gagal menghapus menu')
    }
  })
}

// ============= Custom Hooks =============

export function useMenuOperations() {
  const createMenuMutation = useCreateMenu()
  const updateMenuMutation = useUpdateMenu()
  const deleteMenuMutation = useDeleteMenu()
  const duplicateMenuMutation = useDuplicateMenu()
  const bulkUpdateMutation = useBulkUpdateMenus()
  const bulkDeleteMutation = useBulkDeleteMenus()

  return {
    // Single operations
    createMenu: createMenuMutation.mutate,
    updateMenu: (id: string, input: UpdateMenuInput) => 
      updateMenuMutation.mutate({ id, input }),
    deleteMenu: deleteMenuMutation.mutate,
    duplicateMenu: duplicateMenuMutation.mutate,
    
    // Bulk operations
    bulkUpdateMenus: bulkUpdateMutation.mutate,
    bulkDeleteMenus: bulkDeleteMutation.mutate,
    
    // Loading states
    isCreating: createMenuMutation.isPending,
    isUpdating: updateMenuMutation.isPending,
    isDeleting: deleteMenuMutation.isPending,
    isDuplicating: duplicateMenuMutation.isPending,
    isBulkUpdating: bulkUpdateMutation.isPending,
    isBulkDeleting: bulkDeleteMutation.isPending,
    
    // Any loading
    isLoading: 
      createMenuMutation.isPending ||
      updateMenuMutation.isPending ||
      deleteMenuMutation.isPending ||
      duplicateMenuMutation.isPending ||
      bulkUpdateMutation.isPending ||
      bulkDeleteMutation.isPending
  }
}

// ============= Utility Hooks =============

export function useMenuFormState(initialMenu?: MenuWithDetails) {
  const createMenu = useCreateMenu()
  const updateMenu = useUpdateMenu()

  const handleSubmit = async (data: CreateMenuInput | UpdateMenuInput) => {
    if (initialMenu) {
      // Update existing menu
      await updateMenu.mutateAsync({ 
        id: initialMenu.id, 
        input: data as UpdateMenuInput 
      })
    } else {
      // Create new menu
      await createMenu.mutateAsync(data as CreateMenuInput)
    }
  }

  return {
    handleSubmit,
    isSubmitting: createMenu.isPending || updateMenu.isPending,
    error: createMenu.error || updateMenu.error
  }
}

export function useMenuFilters(initialFilters?: MenuFilters) {
  const [filters, setFilters] = useState<MenuFilters>(initialFilters || {})
  
  const updateFilters = (newFilters: Partial<MenuFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
  }
  
  const resetFilters = () => {
    setFilters({})
  }
  
  return {
    filters,
    updateFilters,
    resetFilters,
    setFilters
  }
}

// ============= All functions exported individually above =============
// No need for export statement since all functions are already exported individually