// Menu Domain Hooks - Pattern 2 Architecture
// src/components/sppg/menu/hooks/useMenus.ts

'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'
import { 
  getMenus, 
  getMenuById, 
  createMenu, 
  updateMenu, 
  deleteMenu,
  toggleMenuStatus 
} from '@/actions/sppg/menu'
import { type MenuFilters, type MenuFormInput, type MenuUpdate, type MenuListResponse, type MenuDetailResponse } from '../types'

// ============================================================================
// ENTERPRISE QUERY KEYS - Consistent caching strategy
// ============================================================================

export const menuKeys = {
  all: ['menus'] as const,
  lists: () => [...menuKeys.all, 'list'] as const,
  list: (sppgId: string, filters: MenuFilters) => 
    [...menuKeys.lists(), sppgId, filters] as const,
  details: () => [...menuKeys.all, 'detail'] as const,
  detail: (id: string, sppgId: string) => 
    [...menuKeys.details(), id, sppgId] as const,
  analytics: (sppgId: string) => 
    [...menuKeys.all, 'analytics', sppgId] as const,
}

// ============================================================================
// MAIN MENU HOOK - Enterprise-grade with caching
// ============================================================================

export const useMenus = (filters: MenuFilters = {}) => {
  const { data: session } = useSession()
  const queryClient = useQueryClient()

  // List menus with enterprise caching
  const {
    data,
    isLoading,
    error,
    refetch,
    isRefetching
  } = useQuery({
    queryKey: menuKeys.list(session?.user?.sppgId || '', filters),
    queryFn: async () => {
      const result = await getMenus(filters)
      if (!result.success) {
        throw new Error(result.error)
      }
      return result.data
    },
    enabled: !!session?.user?.sppgId,
    staleTime: 5 * 60 * 1000, // 5 minutes - enterprise caching
    gcTime: 10 * 60 * 1000, // 10 minutes garbage collection
    refetchOnWindowFocus: false,
    retry: (failureCount, error) => {
      // Enterprise retry logic
      if (failureCount < 3) {
        console.log(`🔄 Retrying menu fetch, attempt ${failureCount + 1}`)
        return true
      }
      console.error('❌ Menu fetch failed after 3 attempts:', error)
      return false
    }
  })

  // Create menu mutation with optimistic updates
  const createMenuMutation = useMutation({
    mutationFn: async (menuData: MenuFormInput) => {
      const result = await createMenu(menuData)
      if (!result.success) {
        throw new Error(result.error)
      }
      return result.data
    },
    onMutate: async (newMenu) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ 
        queryKey: menuKeys.lists() 
      })

      // Snapshot previous value for rollback
      const previousMenus = queryClient.getQueryData(
        menuKeys.list(session?.user?.sppgId || '', filters)
      )

      // Optimistically update cache
      queryClient.setQueryData(
        menuKeys.list(session?.user?.sppgId || '', filters),
        (old: unknown) => {
          if (!old || typeof old !== 'object') return old
          const oldData = old as { menus: unknown[]; pagination: { total: number; page: number; limit: number; totalPages: number } }
          const optimisticMenu = {
            id: `temp-${Date.now()}`,
            menuName: newMenu.menuName,
            menuCode: newMenu.menuCode,
            isActive: true,
            createdAt: new Date(),
            ...newMenu
          }
          return {
            ...oldData,
            menus: [optimisticMenu, ...oldData.menus],
            pagination: {
              ...oldData.pagination,
              total: oldData.pagination.total + 1
            }
          }
        }
      )

      return { previousMenus }
    },
    onError: (error: Error, newMenu, context) => {
      // Rollback on error
      if (context?.previousMenus) {
        queryClient.setQueryData(
          menuKeys.list(session?.user?.sppgId || '', filters),
          context.previousMenus
        )
      }
      toast.error(`Failed to create menu: ${error.message}`)
    },
    onSuccess: (newMenu) => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: menuKeys.lists() })
      toast.success(`Menu "${newMenu.menuName}" created successfully`)
    },
    onSettled: () => {
      // Always refetch after mutation
      queryClient.invalidateQueries({ queryKey: menuKeys.lists() })
    }
  })

  // Update menu mutation
  const updateMenuMutation = useMutation({
    mutationFn: async (menuData: MenuUpdate) => {
      const result = await updateMenu(menuData)
      if (!result.success) {
        throw new Error(result.error)
      }
      return result.data
    },
    onMutate: async (updatedMenu) => {
      await queryClient.cancelQueries({ 
        queryKey: menuKeys.detail(updatedMenu.menuId, session?.user?.sppgId || '') 
      })

      const previousMenu = queryClient.getQueryData(
        menuKeys.detail(updatedMenu.menuId, session?.user?.sppgId || '')
      )

      // Optimistically update detail cache
      queryClient.setQueryData(
        menuKeys.detail(updatedMenu.menuId, session?.user?.sppgId || ''),
        (old: unknown) => {
          if (!old || typeof old !== 'object') return old
          const oldData = old as { menu: Record<string, unknown>; analytics?: unknown }
          return {
            ...oldData,
            menu: {
              ...oldData.menu,
              ...updatedMenu,
              updatedAt: new Date()
            }
          }
        }
      )

      return { previousMenu }
    },
    onError: (error: Error, updatedMenu, context) => {
      if (context?.previousMenu) {
        queryClient.setQueryData(
          menuKeys.detail(updatedMenu.menuId, session?.user?.sppgId || ''),
          context.previousMenu
        )
      }
      toast.error(`Failed to update menu: ${error.message}`)
    },
    onSuccess: (updatedMenu) => {
      queryClient.invalidateQueries({ queryKey: menuKeys.lists() })
      queryClient.invalidateQueries({ 
        queryKey: menuKeys.detail(updatedMenu.id, session?.user?.sppgId || '') 
      })
      toast.success(`Menu "${updatedMenu.menuName}" updated successfully`)
    }
  })

  // Delete menu mutation
  const deleteMenuMutation = useMutation({
    mutationFn: async (menuId: string) => {
      const result = await deleteMenu(menuId)
      if (!result.success) {
        throw new Error(result.error)
      }
      return result.data
    },
    onMutate: async (menuId) => {
      await queryClient.cancelQueries({ queryKey: menuKeys.lists() })

      const previousMenus = queryClient.getQueryData(
        menuKeys.list(session?.user?.sppgId || '', filters)
      )

      // Optimistically remove from cache
      queryClient.setQueryData(
        menuKeys.list(session?.user?.sppgId || '', filters),
        (old: unknown) => {
          if (!old || typeof old !== 'object') return old
          const oldData = old as { menus: Array<{ id: string }>; pagination: { total: number; page: number; limit: number; totalPages: number } }
          return {
            ...oldData,
            menus: oldData.menus.filter((menu) => menu.id !== menuId),
            pagination: {
              ...oldData.pagination,
              total: Math.max(0, oldData.pagination.total - 1)
            }
          }
        }
      )

      return { previousMenus, menuId }
    },
    onError: (error: Error, menuId, context) => {
      if (context?.previousMenus) {
        queryClient.setQueryData(
          menuKeys.list(session?.user?.sppgId || '', filters),
          context.previousMenus
        )
      }
      toast.error(`Failed to delete menu: ${error.message}`)
    },
    onSuccess: (_, menuId) => {
      // Remove detail cache
      queryClient.removeQueries({ 
        queryKey: menuKeys.detail(menuId, session?.user?.sppgId || '') 
      })
      queryClient.invalidateQueries({ queryKey: menuKeys.lists() })
      toast.success('Menu deleted successfully')
    }
  })

  // Toggle status mutation
  const toggleStatusMutation = useMutation({
    mutationFn: async ({ menuId, isActive }: { menuId: string; isActive: boolean }) => {
      const result = await toggleMenuStatus(menuId, isActive)
      if (!result.success) {
        throw new Error(result.error)
      }
      return result.data
    },
    onSuccess: (updatedMenu) => {
      queryClient.invalidateQueries({ queryKey: menuKeys.lists() })
      queryClient.invalidateQueries({ 
        queryKey: menuKeys.detail(updatedMenu.id, session?.user?.sppgId || '') 
      })
      toast.success(`Menu ${updatedMenu.isActive ? 'activated' : 'deactivated'}`)
    },
    onError: (error: Error) => {
      toast.error(`Failed to toggle menu status: ${error.message}`)
    }
  })

  return {
    // Data
    menus: data?.menus || [],
    pagination: data?.pagination,
    isLoading,
    isRefetching,
    error,
    
    // Actions
    createMenu: createMenuMutation.mutate,
    updateMenu: updateMenuMutation.mutate,
    deleteMenu: deleteMenuMutation.mutate,
    toggleStatus: toggleStatusMutation.mutate,
    refetch,
    
    // States
    isCreating: createMenuMutation.isPending,
    isUpdating: updateMenuMutation.isPending,
    isDeleting: deleteMenuMutation.isPending,
    isToggling: toggleStatusMutation.isPending,
    
    // Enterprise helpers
    invalidateCache: () => {
      queryClient.invalidateQueries({ queryKey: menuKeys.lists() })
    },
    prefetchMenu: (menuId: string) => {
      return queryClient.prefetchQuery({
        queryKey: menuKeys.detail(menuId, session?.user?.sppgId || ''),
        queryFn: async () => {
          const result = await getMenuById(menuId)
          if (!result.success) throw new Error(result.error)
          return result.data
        }
      })
    }
  }
}

// ============================================================================
// SINGLE MENU HOOK - Enterprise detail fetching
// ============================================================================

export const useMenu = (menuId: string) => {
  const { data: session } = useSession()

  return useQuery({
    queryKey: menuKeys.detail(menuId, session?.user?.sppgId || ''),
    queryFn: async () => {
      const result = await getMenuById(menuId)
      if (!result.success) {
        throw new Error(result.error)
      }
      return result.data
    },
    enabled: !!menuId && !!session?.user?.sppgId,
    staleTime: 10 * 60 * 1000, // 10 minutes for detail view
    gcTime: 15 * 60 * 1000, // 15 minutes garbage collection
    retry: 2,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000)
  })
}

// ============================================================================
// ENTERPRISE PERFORMANCE HOOKS
// ============================================================================

export const useMenusPrefetch = () => {
  const { data: session } = useSession()
  const queryClient = useQueryClient()

  const prefetchMenus = (filters: MenuFilters = {}) => {
    return queryClient.prefetchQuery({
      queryKey: menuKeys.list(session?.user?.sppgId || '', filters),
      queryFn: async () => {
        const result = await getMenus(filters)
        if (!result.success) throw new Error(result.error)
        return result.data
      },
      staleTime: 5 * 60 * 1000
    })
  }

  const prefetchMenu = (menuId: string) => {
    return queryClient.prefetchQuery({
      queryKey: menuKeys.detail(menuId, session?.user?.sppgId || ''),
      queryFn: async () => {
        const result = await getMenuById(menuId)
        if (!result.success) throw new Error(result.error)
        return result.data
      },
      staleTime: 10 * 60 * 1000
    })
  }

  return {
    prefetchMenus,
    prefetchMenu
  }
}

// ============================================================================
// ENTERPRISE CACHE MANAGEMENT
// ============================================================================

export const useMenuCache = () => {
  const { data: session } = useSession()
  const queryClient = useQueryClient()

  const invalidateAllMenus = () => {
    queryClient.invalidateQueries({ queryKey: menuKeys.all })
  }

  const invalidateMenuLists = () => {
    queryClient.invalidateQueries({ queryKey: menuKeys.lists() })
  }

  const invalidateMenu = (menuId: string) => {
    queryClient.invalidateQueries({ 
      queryKey: menuKeys.detail(menuId, session?.user?.sppgId || '') 
    })
  }

  const removeMenu = (menuId: string) => {
    queryClient.removeQueries({ 
      queryKey: menuKeys.detail(menuId, session?.user?.sppgId || '') 
    })
  }

  const clearAllMenuCache = () => {
    queryClient.removeQueries({ queryKey: menuKeys.all })
  }

  return {
    invalidateAllMenus,
    invalidateMenuLists,
    invalidateMenu,
    removeMenu,
    clearAllMenuCache
  }
}