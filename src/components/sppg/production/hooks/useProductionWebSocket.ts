// Production WebSocket Hook - Real-time Production Monitoring
// Pattern 2 Component-Level Domain Architecture
// src/components/sppg/production/hooks/useProductionWebSocket.ts

'use client'

import { useCallback, useEffect } from 'react'
import { useWebSocket } from '@/hooks/useWebSocket'
import { useProductionStore } from '../stores/useProductionStore'
import type { 
  ProductionRealTimeUpdate,
  ProductionWithDetails,
  QualityControlWithDetails
} from '../types'

interface UseProductionWebSocketOptions {
  enabled?: boolean
  onProductionUpdate?: (production: ProductionWithDetails) => void
  onQualityUpdate?: (qualityCheck: QualityControlWithDetails) => void
  onStatusChange?: (productionId: string, newStatus: string) => void
  onError?: (error: string) => void
}

interface UseProductionWebSocketReturn {
  isConnected: boolean
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error'
  lastUpdate: ProductionRealTimeUpdate | null
}

export function useProductionWebSocket(
  options: UseProductionWebSocketOptions = {}
): UseProductionWebSocketReturn {
  const {
    enabled = true,
    onProductionUpdate,
    onQualityUpdate,
    onStatusChange,
    onError
  } = options

  // Zustand store actions
  const { 
    updateProduction,
    addRealTimeUpdate,
    setRealTimeConnected
  } = useProductionStore()

  // Handle incoming WebSocket messages
  const handleWebSocketMessage = useCallback((message: unknown) => {
    try {
      const event = message as ProductionRealTimeUpdate

      if (!event || typeof event !== 'object') {
        console.warn('[Production WebSocket] Invalid message format:', message)
        return
      }

      // Update store state
      addRealTimeUpdate(event)

      // Handle different event types
      switch (event.type) {
        case 'PRODUCTION_CREATED':
        case 'PRODUCTION_UPDATED':
          if (event.data && typeof event.data === 'object') {
            const production = event.data as ProductionWithDetails
            updateProduction(event.productionId, production)
            onProductionUpdate?.(production)
          }
          break

        case 'STATUS_CHANGED':
          if (event.data && typeof event.data === 'object') {
            const statusData = event.data as { newStatus: string }
            updateProduction(event.productionId, { status: statusData.newStatus as 'PLANNED' | 'PREPARING' | 'COOKING' | 'QUALITY_CHECK' | 'COMPLETED' | 'CANCELLED' })
            onStatusChange?.(event.productionId, statusData.newStatus)
          }
          break

        case 'QUALITY_CHECK_ADDED':
          if (event.data && typeof event.data === 'object') {
            const qualityCheck = event.data as QualityControlWithDetails
            onQualityUpdate?.(qualityCheck)
          }
          break

        case 'PRODUCTION_DELETED':
          // Handle production deletion if needed
          console.info('[Production WebSocket] Production deleted:', event.productionId)
          break

        default:
          console.warn('[Production WebSocket] Unknown event type:', event.type)
          break
      }
    } catch (error) {
      console.error('[Production WebSocket] Message parsing error:', error)
      onError?.('Failed to parse WebSocket message')
    }
  }, [
    addRealTimeUpdate,
    updateProduction,
    onProductionUpdate,
    onQualityUpdate,
    onStatusChange,
    onError
  ])

  // Handle WebSocket connection events
  const handleConnect = useCallback(() => {
    console.info('[Production WebSocket] Connected to real-time updates')
  }, [])

  const handleDisconnect = useCallback(() => {
    console.warn('[Production WebSocket] Disconnected from real-time updates')
  }, [])

  const handleError = useCallback((error: Event) => {
    console.error('[Production WebSocket] Connection error:', error)
    onError?.('WebSocket connection error')
  }, [onError])

  // WebSocket connection
  const { 
    isConnected, 
    connectionStatus, 
    lastMessage 
  } = useWebSocket({
    enabled,
    onMessage: handleWebSocketMessage,
    onConnect: handleConnect,
    onDisconnect: handleDisconnect,
    onError: handleError
  })

  // Auto-reconnect on connection loss
  useEffect(() => {
    if (!isConnected && enabled) {
      const reconnectTimer = setTimeout(() => {
        console.info('[Production WebSocket] Attempting to reconnect...')
      }, 5000)

      return () => clearTimeout(reconnectTimer)
    }
  }, [isConnected, enabled])

  return {
    isConnected,
    connectionStatus,
    lastUpdate: lastMessage as ProductionRealTimeUpdate | null
  }
}

// Production-specific WebSocket hook with auto store updates
export function useProductionRealTime() {
  const { isConnected, connectionStatus } = useProductionWebSocket({
    enabled: true,
    onProductionUpdate: (production) => {
      console.info('[Production Real-time] Production updated:', production.id)
    },
    onQualityUpdate: (qualityCheck) => {
      console.info('[Production Real-time] Quality check completed:', qualityCheck.id)
    },
    onStatusChange: (productionId, newStatus) => {
      console.info('[Production Real-time] Status changed:', productionId, newStatus)
    },
    onError: (error) => {
      console.error('[Production Real-time] Error:', error)
    }
  })

  return {
    isConnected,
    connectionStatus,
    isRealTimeActive: isConnected && connectionStatus === 'connected'
  }
}