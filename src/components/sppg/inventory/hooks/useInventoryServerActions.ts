// Inventory Hooks - Migrated to Server Actions Pattern
// Bergizi-ID SaaS Platform - SPPG Inventory Management
// Updated to use Server Actions instead of direct Prisma calls

'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'

// Import Server Actions
import {
  getInventoryItems,
  getInventoryItemById,
  createInventoryItem,
  updateInventoryItem,
  addStockMovement,
  deleteInventoryItem,
  getInventoryStats
} from '@/actions/sppg/inventory'

// Import types
import type {
  InventoryItemWithDetails,
  CreateInventoryItemInput,
  UpdateInventoryItemInput,
  StockMovementInput,
  InventoryFiltersInput,
  InventoryStats,
  PaginatedInventoryResult
} from '../types'

// Real-time WebSocket integration
import { useWebSocket } from '@/hooks/useWebSocket'

// ================================ INVENTORY HOOKS ================================

/**
 * Get inventory items with filters and pagination
 */
export function useInventoryItems(filters?: InventoryFiltersInput) {
  return useQuery({
    queryKey: ['inventory-items', filters],
    queryFn: async (): Promise<PaginatedInventoryResult> => {
      const result = await getInventoryItems(filters)
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch inventory items')
      }
      return result.data!
    },
    enabled: true,
    staleTime: 30000, // 30 seconds
    refetchOnWindowFocus: false
  })
}

/**
 * Get single inventory item by ID
 */
export function useInventoryItem(id: string) {
  return useQuery({
    queryKey: ['inventory-item', id],
    queryFn: async (): Promise<InventoryItemWithDetails> => {
      const result = await getInventoryItemById(id)
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch inventory item')
      }
      return result.data!
    },
    enabled: !!id,
    staleTime: 30000,
    refetchOnWindowFocus: false
  })
}

/**
 * Create new inventory item
 */
export function useCreateInventoryItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: CreateInventoryItemInput) => {
      const result = await createInventoryItem(input)
      if (!result.success) {
        throw new Error(result.error || 'Failed to create inventory item')
      }
      return result.data!
    },
    onSuccess: (data) => {
      // Invalidate and refetch inventory
      queryClient.invalidateQueries({ queryKey: ['inventory-items'] })
      queryClient.invalidateQueries({ queryKey: ['inventory-stats'] })
      
      // Show success message
      toast.success(`Inventory item ${data.itemName} created successfully`)
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create inventory item')
    }
  })
}

/**
 * Update inventory item
 */
export function useUpdateInventoryItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: UpdateInventoryItemInput }) => {
      const result = await updateInventoryItem(id, input)
      if (!result.success) {
        throw new Error(result.error || 'Failed to update inventory item')
      }
      return result.data!
    },
    onSuccess: (data) => {
      // Update cache
      queryClient.setQueryData(['inventory-item', data.id], data)
      queryClient.invalidateQueries({ queryKey: ['inventory-items'] })
      queryClient.invalidateQueries({ queryKey: ['inventory-stats'] })
      
      toast.success(`Inventory item ${data.itemName} updated successfully`)
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update inventory item')
    }
  })
}

/**
 * Add stock movement (in/out/adjustment)
 */
export function useAddStockMovement() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: StockMovementInput) => {
      const result = await addStockMovement(input)
      if (!result.success) {
        throw new Error(result.error || 'Failed to add stock movement')
      }
      return result.data!
    },
    onSuccess: (data) => {
      // Invalidate inventory item to refetch updated stock
      queryClient.invalidateQueries({ queryKey: ['inventory-item', data.inventoryId] })
      queryClient.invalidateQueries({ queryKey: ['inventory-items'] })
      queryClient.invalidateQueries({ queryKey: ['inventory-stats'] })
      
      toast.success('Stock movement recorded successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to record stock movement')
    }
  })
}

/**
 * Delete inventory item
 */
export function useDeleteInventoryItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await deleteInventoryItem(id)
      if (!result.success) {
        throw new Error(result.error || 'Failed to delete inventory item')
      }
      return result
    },
    onSuccess: () => {
      // Invalidate inventory list
      queryClient.invalidateQueries({ queryKey: ['inventory-items'] })
      queryClient.invalidateQueries({ queryKey: ['inventory-stats'] })
      
      toast.success('Inventory item deleted successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete inventory item')
    }
  })
}

/**
 * Get inventory statistics
 */
export function useInventoryStats() {
  return useQuery({
    queryKey: ['inventory-stats'],
    queryFn: async (): Promise<InventoryStats> => {
      const result = await getInventoryStats()
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch inventory statistics')
      }
      return result.data!
    },
    staleTime: 60000, // 1 minute
    refetchOnWindowFocus: false
  })
}

// ================================ REAL-TIME INVENTORY HOOKS ================================

/**
 * Real-time inventory updates using WebSocket
 */
export function useRealtimeInventory(itemId?: string) {
  const { data: session } = useSession()
  const queryClient = useQueryClient()
  const [isConnected, setIsConnected] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)

  // WebSocket connection
  const { isConnected: wsConnected, lastMessage } = useWebSocket({
    enabled: !!session?.user?.sppgId
  })

  useEffect(() => {
    setIsConnected(wsConnected)
  }, [wsConnected])

  // Handle real-time messages
  useEffect(() => {
    if (!lastMessage) return

    try {
      const message = typeof lastMessage === 'string' ? JSON.parse(lastMessage) : lastMessage

      // Handle inventory-related updates
      if (message.type === 'redis_message' && message.channel?.includes('inventory:updates')) {
        const eventData = message.data

        switch (eventData.type) {
          case 'INVENTORY_ITEM_CREATED':
          case 'INVENTORY_ITEM_UPDATED':
            // Invalidate inventory list
            queryClient.invalidateQueries({ queryKey: ['inventory-items'] })
            queryClient.invalidateQueries({ queryKey: ['inventory-stats'] })

            // If this is the specific item we're watching, update it
            if (itemId && eventData.data.item?.id === itemId) {
              queryClient.setQueryData(['inventory-item', itemId], eventData.data.item)
            }
            break

          case 'INVENTORY_ITEM_DELETED':
            // Remove from cache and invalidate list
            if (itemId && eventData.data.itemId === itemId) {
              queryClient.removeQueries({ queryKey: ['inventory-item', itemId] })
            }
            queryClient.invalidateQueries({ queryKey: ['inventory-items'] })
            queryClient.invalidateQueries({ queryKey: ['inventory-stats'] })
            break

          case 'STOCK_MOVEMENT_ADDED':
            // Invalidate inventory item to refetch updated stock
            if (itemId && eventData.data.movement?.inventoryItemId === itemId) {
              queryClient.invalidateQueries({ queryKey: ['inventory-item', itemId] })
            }
            queryClient.invalidateQueries({ queryKey: ['inventory-items'] })
            queryClient.invalidateQueries({ queryKey: ['inventory-stats'] })
            break
        }

        setLastUpdate(new Date())

        // Show toast notification for updates
        if (eventData.data.message && eventData.sppgId === session?.user?.sppgId) {
          toast.info(eventData.data.message, {
            description: 'Real-time update received'
          })
        }
      }
    } catch (error) {
      console.error('[Inventory] WebSocket message parsing error:', error)
    }
  }, [lastMessage, itemId, queryClient, session?.user?.sppgId])

  return {
    isConnected,
    lastUpdate
  }
}

// ================================ UTILITY HOOKS ================================

/**
 * Inventory operations hook - combines common operations
 */
export function useInventoryOperations() {
  const createItem = useCreateInventoryItem()
  const updateItem = useUpdateInventoryItem()
  const addMovement = useAddStockMovement()
  const deleteItem = useDeleteInventoryItem()

  const isLoading = 
    createItem.isPending ||
    updateItem.isPending ||
    addMovement.isPending ||
    deleteItem.isPending

  return {
    // Operations
    createItem: createItem.mutate,
    updateItem: (id: string, input: UpdateInventoryItemInput) => 
      updateItem.mutate({ id, input }),
    addMovement: addMovement.mutate,
    deleteItem: deleteItem.mutate,

    // Status
    isLoading,
    isCreating: createItem.isPending,
    isUpdating: updateItem.isPending,
    isAddingMovement: addMovement.isPending,
    isDeleting: deleteItem.isPending,

    // Errors
    createError: createItem.error,
    updateError: updateItem.error,
    movementError: addMovement.error,
    deleteError: deleteItem.error
  }
}

/**
 * Inventory filters hook
 */
export function useInventoryFilters() {
  const [filters, setFilters] = useState<InventoryFiltersInput>({
    page: 1,
    limit: 50
  })

  const updateFilters = useCallback((newFilters: Partial<InventoryFiltersInput>) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
      // Reset page when filters change (except when changing page itself)
      page: newFilters.page !== undefined ? newFilters.page : 1
    }))
  }, [])

  const resetFilters = useCallback(() => {
    setFilters({
      page: 1,
      limit: 50
    })
  }, [])

  return {
    filters,
    updateFilters,
    resetFilters
  }
}

/**
 * Stock management utilities
 */
export function useStockManagement() {
  const addMovement = useAddStockMovement()

  const stockIn = useCallback((inventoryItemId: string, quantity: number, notes?: string) => {
    addMovement.mutate({
      inventoryItemId,
      type: 'IN',
      quantity,
      reason: notes || 'Stock added',
      notes
    })
  }, [addMovement])

  const stockOut = useCallback((inventoryItemId: string, quantity: number, notes?: string) => {
    addMovement.mutate({
      inventoryItemId,
      type: 'OUT',
      quantity,
      reason: notes || 'Stock removed',
      notes
    })
  }, [addMovement])

  const stockAdjustment = useCallback((inventoryItemId: string, newQuantity: number, notes?: string) => {
    addMovement.mutate({
      inventoryItemId,
      type: 'ADJUSTMENT',
      quantity: newQuantity,
      reason: notes || 'Stock adjustment',
      notes
    })
  }, [addMovement])

  const procurementReceived = useCallback((inventoryItemId: string, quantity: number, notes?: string) => {
    addMovement.mutate({
      inventoryItemId,
      type: 'IN',
      quantity,
      reason: 'Procurement received',
      notes: notes || 'Procurement received'
    })
  }, [addMovement])

  const productionUsage = useCallback((inventoryItemId: string, quantity: number, notes?: string) => {
    addMovement.mutate({
      inventoryItemId,
      type: 'OUT',
      quantity,
      reason: 'Used in production',
      notes: notes || 'Used in production'
    })
  }, [addMovement])

  return {
    stockIn,
    stockOut,
    stockAdjustment,
    procurementReceived,
    productionUsage,
    isProcessing: addMovement.isPending,
    error: addMovement.error
  }
}

/**
 * Low stock monitoring hook
 */
export function useLowStockMonitoring() {
  const { data: inventoryItems } = useInventoryItems({
    lowStock: true,
    limit: 100
  })

  const lowStockItems = inventoryItems?.items.filter(item => 
    item.currentStock <= item.minStock && item.currentStock > 0
  ) || []

  const outOfStockItems = inventoryItems?.items.filter(item => 
    item.currentStock === 0
  ) || []

  return {
    lowStockItems,
    outOfStockItems,
    lowStockCount: lowStockItems.length,
    outOfStockCount: outOfStockItems.length,
    hasLowStock: lowStockItems.length > 0,
    hasOutOfStock: outOfStockItems.length > 0
  }
}