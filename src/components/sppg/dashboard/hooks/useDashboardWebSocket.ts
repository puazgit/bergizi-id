'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

interface WebSocketMessage {
  type: 'DASHBOARD_UPDATE' | 'NOTIFICATION' | 'SYSTEM_ALERT'
  sppgId: string
  timestamp: string
  data?: Record<string, unknown>
  id?: string
  title?: string
  message?: string
  severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
}

interface WebSocketHookOptions {
  autoReconnect?: boolean
  maxReconnectAttempts?: number
  reconnectInterval?: number
  enableDebouncing?: boolean
  debounceDelay?: number
}

export function useDashboardWebSocket(
  sppgId: string | undefined,
  options: WebSocketHookOptions = {}
) {
  const {
    autoReconnect = true,
    maxReconnectAttempts = 5,
    reconnectInterval = 3000,
    enableDebouncing = true,
    debounceDelay = 1000
  } = options

  const wsRef = useRef<WebSocket | null>(null)
  const reconnectAttemptsRef = useRef(0)
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)
  const lastUpdateRef = useRef<number>(0)
  
  const [isConnected, setIsConnected] = useState(false)
  const [isReconnecting, setIsReconnecting] = useState(false)
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null)
  const [connectionError, setConnectionError] = useState<string | null>(null)
  
  const queryClient = useQueryClient()
  
  const refreshData = useCallback(() => {
    // Invalidate dashboard queries to trigger fresh data fetch
    queryClient.invalidateQueries({ queryKey: ['dashboard', sppgId] })
    queryClient.invalidateQueries({ queryKey: ['dashboard-executive', sppgId] })
    queryClient.invalidateQueries({ queryKey: ['dashboard-operations', sppgId] })
    queryClient.invalidateQueries({ queryKey: ['dashboard-financial', sppgId] })
    queryClient.invalidateQueries({ queryKey: ['dashboard-quality', sppgId] })
  }, [queryClient, sppgId])

  const clearDebounceTimer = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
      debounceTimerRef.current = null
    }
  }, [])

  const debouncedRefresh = useCallback(() => {
    if (!enableDebouncing) {
      refreshData()
      return
    }

    clearDebounceTimer()
    
    debounceTimerRef.current = setTimeout(() => {
      const now = Date.now()
      if (now - lastUpdateRef.current > debounceDelay) {
        refreshData()
        lastUpdateRef.current = now
      }
    }, debounceDelay)
  }, [refreshData, enableDebouncing, debounceDelay, clearDebounceTimer])

  const connect = useCallback(() => {
    if (!sppgId || wsRef.current?.readyState === WebSocket.OPEN) return

    try {
      const wsUrl = process.env.NODE_ENV === 'production' 
        ? `wss://${window.location.host}/api/ws/dashboard`
        : `ws://localhost:3000/api/ws/dashboard`
      
      console.log(`Connecting to WebSocket: ${wsUrl}`)
      
      wsRef.current = new WebSocket(`${wsUrl}?sppgId=${sppgId}`)

      wsRef.current.onopen = () => {
        console.log('✅ WebSocket connected successfully')
        setIsConnected(true)
        setIsReconnecting(false)
        setConnectionError(null)
        reconnectAttemptsRef.current = 0

        // Send initial subscription
        wsRef.current?.send(JSON.stringify({
          type: 'SUBSCRIBE',
          sppgId,
          channels: ['dashboard-update', 'notification', 'system-alert']
        }))
      }

      wsRef.current.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data)
          console.log('📨 WebSocket message received:', message.type)
          
          setLastMessage(message)

          switch (message.type) {
            case 'DASHBOARD_UPDATE':
              // Debounced dashboard refresh to prevent loops
              debouncedRefresh()
              break

            case 'NOTIFICATION':
              // Show real-time notifications
              if (message.title && message.message) {
                const toastType = message.severity === 'HIGH' || message.severity === 'CRITICAL' 
                  ? 'error' 
                  : message.severity === 'MEDIUM' 
                    ? 'warning' 
                    : 'info'
                
                toast[toastType](message.title, {
                  description: message.message,
                  duration: message.severity === 'CRITICAL' ? 10000 : 5000
                })
              }
              break

            case 'SYSTEM_ALERT':
              // Handle system-wide alerts
              toast.error('System Alert', {
                description: message.message || 'System alert received',
                duration: 10000
              })
              break
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error)
        }
      }

      wsRef.current.onclose = (event) => {
        console.log('🔌 WebSocket connection closed:', event.code, event.reason)
        setIsConnected(false)
        
        if (autoReconnect && reconnectAttemptsRef.current < maxReconnectAttempts) {
          setIsReconnecting(true)
          reconnectAttemptsRef.current++
          
          setTimeout(() => {
            console.log(`🔄 Attempting to reconnect (${reconnectAttemptsRef.current}/${maxReconnectAttempts})`)
            connect()
          }, reconnectInterval)
        } else if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
          setConnectionError('Max reconnection attempts reached')
          setIsReconnecting(false)
        }
      }

      wsRef.current.onerror = (error) => {
        console.error('❌ WebSocket error:', error)
        setConnectionError('WebSocket connection error')
      }

    } catch (error) {
      console.error('Failed to create WebSocket connection:', error)
      setConnectionError('Failed to initialize WebSocket')
    }
  }, [sppgId, autoReconnect, maxReconnectAttempts, reconnectInterval, debouncedRefresh])

  const disconnect = useCallback(() => {
    clearDebounceTimer()
    
    if (wsRef.current) {
      wsRef.current.close(1000, 'Client requested disconnect')
      wsRef.current = null
    }
    
    setIsConnected(false)
    setIsReconnecting(false)
    reconnectAttemptsRef.current = 0
  }, [clearDebounceTimer])

  const sendMessage = useCallback((message: Record<string, unknown>) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message))
      console.log('📤 WebSocket message sent:', message)
    } else {
      console.warn('WebSocket not connected, message not sent:', message)
    }
  }, [])

  // Initialize connection
  useEffect(() => {
    if (sppgId) {
      connect()
    }

    return () => {
      disconnect()
    }
  }, [sppgId, connect, disconnect])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearDebounceTimer()
    }
  }, [clearDebounceTimer])

  return {
    isConnected,
    isReconnecting,
    lastMessage,
    connectionError,
    sendMessage,
    connect,
    disconnect,
    // Real-time metrics
    stats: {
      reconnectAttempts: reconnectAttemptsRef.current,
      maxReconnectAttempts,
      lastUpdate: lastUpdateRef.current
    }
  }
}