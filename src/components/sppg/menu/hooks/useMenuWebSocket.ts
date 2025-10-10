// Menu WebSocket Hook - Real-time Menu Updates
// Bergizi-ID SaaS Platform - Menu Domain Real-time Integration

'use client'

import { useEffect, useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useWebSocket } from '@/hooks/useWebSocket'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'

interface MenuUpdateEvent {
  type: 'MENU_CREATED' | 'MENU_UPDATED' | 'MENU_DELETED' | 'MENU_STATUS_TOGGLED'
  sppgId: string
  data: {
    id: string
    menuName: string
    menuCode: string
    mealType?: string
    programId?: string
    programName?: string
    isActive?: boolean
  }
  timestamp: string
  source: string
}

interface UseMenuWebSocketOptions {
  enabled?: boolean
  showNotifications?: boolean
  onMenuCreated?: (data: MenuUpdateEvent['data']) => void
  onMenuUpdated?: (data: MenuUpdateEvent['data']) => void
  onMenuDeleted?: (data: MenuUpdateEvent['data']) => void
  onMenuStatusToggled?: (data: MenuUpdateEvent['data']) => void
}

export function useMenuWebSocket(options: UseMenuWebSocketOptions = {}) {
  const { data: session } = useSession()
  const queryClient = useQueryClient()
  
  const {
    enabled = true,
    showNotifications = true,
    onMenuCreated,
    onMenuUpdated,
    onMenuDeleted,
    onMenuStatusToggled
  } = options

  // Handle incoming WebSocket messages
  const handleMessage = useCallback((message: unknown) => {
    try {
      const event = message as MenuUpdateEvent
      
      // Only process menu domain events
      if (event.source !== 'menu-domain') return
      
      // Only process events for current SPPG
      if (event.sppgId !== session?.user?.sppgId) return

      console.log('[MenuWebSocket] Received event:', event.type, event.data)

      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['menus'] })
      queryClient.invalidateQueries({ queryKey: ['menu', event.data.id] })
      queryClient.invalidateQueries({ queryKey: ['menu-stats'] })

      // Handle specific event types
      switch (event.type) {
        case 'MENU_CREATED':
          onMenuCreated?.(event.data)
          if (showNotifications) {
            toast.success(`Menu "${event.data.menuName}" berhasil dibuat`, {
              description: `Kode: ${event.data.menuCode}`,
              duration: 4000
            })
          }
          break

        case 'MENU_UPDATED':
          onMenuUpdated?.(event.data)
          if (showNotifications) {
            toast.info(`Menu "${event.data.menuName}" telah diperbarui`, {
              description: `Kode: ${event.data.menuCode}`,
              duration: 4000
            })
          }
          break

        case 'MENU_DELETED':
          onMenuDeleted?.(event.data)
          if (showNotifications) {
            toast.error(`Menu "${event.data.menuName}" telah dihapus`, {
              description: `Kode: ${event.data.menuCode}`,
              duration: 4000
            })
          }
          break

        case 'MENU_STATUS_TOGGLED':
          onMenuStatusToggled?.(event.data)
          if (showNotifications) {
            const status = event.data.isActive ? 'diaktifkan' : 'dinonaktifkan'
            toast.info(`Menu "${event.data.menuName}" telah ${status}`, {
              description: `Status: ${event.data.isActive ? 'Aktif' : 'Nonaktif'}`,
              duration: 4000
            })
          }
          break

        default:
          console.warn('[MenuWebSocket] Unknown event type:', event.type)
      }
    } catch (error) {
      console.error('[MenuWebSocket] Message handling error:', error)
    }
  }, [session?.user?.sppgId, queryClient, showNotifications, onMenuCreated, onMenuUpdated, onMenuDeleted, onMenuStatusToggled])

  // WebSocket connection
  const { isConnected, connectionStatus, sendMessage } = useWebSocket({
    enabled: enabled && !!session?.user?.sppgId,
    onMessage: handleMessage,
    onConnect: () => {
      console.log('[MenuWebSocket] Connected to real-time updates')
    },
    onDisconnect: () => {
      console.log('[MenuWebSocket] Disconnected from real-time updates')
    },
    onError: (error) => {
      console.error('[MenuWebSocket] Connection error:', error)
    }
  })

  // Subscribe to menu updates when connected
  useEffect(() => {
    if (isConnected && session?.user?.sppgId) {
      // Subscribe to SPPG-specific menu updates
      sendMessage({
        type: 'subscribe',
        channel: `menu:updates:${session.user.sppgId}`
      })

      console.log(`[MenuWebSocket] Subscribed to menu updates for SPPG ${session.user.sppgId}`)
    }
  }, [isConnected, session?.user?.sppgId, sendMessage])

  return {
    isConnected,
    connectionStatus,
    sendMessage
  }
}

// Individual hooks for specific menu operations
export function useMenuCreatedWebSocket(callback?: (data: MenuUpdateEvent['data']) => void) {
  return useMenuWebSocket({
    onMenuCreated: callback,
    showNotifications: false // Let parent component handle notifications
  })
}

export function useMenuUpdatedWebSocket(callback?: (data: MenuUpdateEvent['data']) => void) {
  return useMenuWebSocket({
    onMenuUpdated: callback,
    showNotifications: false
  })
}

export function useMenuDeletedWebSocket(callback?: (data: MenuUpdateEvent['data']) => void) {
  return useMenuWebSocket({
    onMenuDeleted: callback,
    showNotifications: false
  })
}

export function useMenuStatusToggledWebSocket(callback?: (data: MenuUpdateEvent['data']) => void) {
  return useMenuWebSocket({
    onMenuStatusToggled: callback,
    showNotifications: false
  })
}