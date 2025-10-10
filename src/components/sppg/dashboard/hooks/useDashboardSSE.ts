'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

interface SSEMessage {
  type: string
  data?: Record<string, unknown>
  channel?: string
  timestamp: number
  connectionId?: string
  message?: string
}

interface UseDashboardSSEOptions {
  autoReconnect?: boolean
  maxReconnectAttempts?: number
  reconnectInterval?: number
  enableDebouncing?: boolean
  debounceDelay?: number
  onMessage?: (message: SSEMessage) => void
  onConnect?: () => void
  onDisconnect?: () => void
  onError?: (error: string) => void
}

export function useDashboardSSE({
  autoReconnect = true,
  maxReconnectAttempts = 5,
  reconnectInterval = 5000,
  enableDebouncing = true,
  debounceDelay = 300,
  onMessage,
  onConnect,
  onDisconnect,
  onError
}: UseDashboardSSEOptions = {}) {
  const [isConnected, setIsConnected] = useState(false)
  const [isReconnecting, setIsReconnecting] = useState(false)
  const [connectionError, setConnectionError] = useState<string | null>(null)
  const [lastMessage, setLastMessage] = useState<SSEMessage | null>(null)
  const [connectionStats, setConnectionStats] = useState({
    messagesReceived: 0,
    reconnectAttempts: 0,
    lastConnected: null as Date | null,
    uptime: 0
  })

  const eventSourceRef = useRef<EventSource | null>(null)
  const reconnectAttemptsRef = useRef(0)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)
  const lastUpdateRef = useRef(0)
  const connectTimeRef = useRef<Date | null>(null)

  const queryClient = useQueryClient()

  // Debounced data refresh
  const refreshData = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['dashboard'] })
  }, [queryClient])

  const debouncedRefresh = useCallback(() => {
    if (!enableDebouncing) {
      refreshData()
      return
    }

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    debounceTimerRef.current = setTimeout(() => {
      const now = Date.now()
      if (now - lastUpdateRef.current > debounceDelay) {
        refreshData()
        lastUpdateRef.current = now
      }
    }, debounceDelay)
  }, [refreshData, enableDebouncing, debounceDelay])

  const connect = useCallback(() => {
    if (eventSourceRef.current?.readyState === EventSource.OPEN) return

    try {
      console.log('🔗 Connecting to SSE endpoint...')
      
      const eventSource = new EventSource('/api/sse/dashboard')
      eventSourceRef.current = eventSource

      eventSource.onopen = () => {
        console.log('✅ SSE connected successfully')
        setIsConnected(true)
        setIsReconnecting(false)
        setConnectionError(null)
        reconnectAttemptsRef.current = 0
        connectTimeRef.current = new Date()
        
        setConnectionStats(prev => ({
          ...prev,
          lastConnected: new Date(),
          reconnectAttempts: reconnectAttemptsRef.current
        }))

        onConnect?.()
      }

      eventSource.onmessage = (event) => {
        try {
          const message: SSEMessage = JSON.parse(event.data)
          console.log('📨 SSE message received:', message.type)
          
          setLastMessage(message)
          setConnectionStats(prev => ({
            ...prev,
            messagesReceived: prev.messagesReceived + 1
          }))

          switch (message.type) {
            case 'CONNECTED':
              console.log('🎉 SSE connection established')
              break

            case 'DASHBOARD_UPDATE':
              console.log('📊 Dashboard update received')
              debouncedRefresh()
              break

            case 'NOTIFICATION':
              if (message.data?.title && message.data?.message) {
                toast(message.data.title as string, {
                  description: message.data.message as string,
                  duration: 5000
                })
              }
              break

            case 'SYSTEM_ALERT':
              if (message.data?.message) {
                toast.error('System Alert', {
                  description: message.data.message as string,
                  duration: 10000
                })
              }
              break

            case 'HEARTBEAT':
              // Update uptime
              if (connectTimeRef.current) {
                const uptime = Date.now() - connectTimeRef.current.getTime()
                setConnectionStats(prev => ({ ...prev, uptime }))
              }
              break

            case 'ERROR':
              console.error('❌ SSE server error:', message.message)
              setConnectionError(message.message || 'Server error')
              onError?.(message.message || 'Server error')
              break
          }

          onMessage?.(message)

        } catch (error) {
          console.error('Failed to parse SSE message:', error)
        }
      }

      eventSource.onerror = (error) => {
        console.error('❌ SSE error:', error)
        setIsConnected(false)
        setConnectionError('SSE connection error')
        onError?.('SSE connection error')

        // Auto-reconnect logic
        if (autoReconnect && reconnectAttemptsRef.current < maxReconnectAttempts) {
          setIsReconnecting(true)
          reconnectAttemptsRef.current++
          
          setConnectionStats(prev => ({
            ...prev,
            reconnectAttempts: reconnectAttemptsRef.current
          }))

          const delay = reconnectInterval * Math.pow(2, reconnectAttemptsRef.current - 1)
          console.log(`🔄 Reconnecting in ${delay}ms (attempt ${reconnectAttemptsRef.current}/${maxReconnectAttempts})`)
          
          reconnectTimeoutRef.current = setTimeout(() => {
            connect()
          }, delay)
        } else {
          console.error('❌ Max reconnection attempts reached')
          setConnectionError('Max reconnection attempts reached')
          setIsReconnecting(false)
          onError?.('Max reconnection attempts reached')
        }
      }

    } catch (error) {
      console.error('Failed to create SSE connection:', error)
      setConnectionError('Failed to initialize SSE')
      onError?.('Failed to initialize SSE')
    }
  }, [autoReconnect, maxReconnectAttempts, reconnectInterval, debouncedRefresh, onConnect, onError, onMessage])

  const disconnect = useCallback(() => {
    console.log('🔌 Disconnecting SSE...')
    
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
      eventSourceRef.current = null
    }

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
      debounceTimerRef.current = null
    }

    setIsConnected(false)
    setIsReconnecting(false)
    setConnectionError(null)
    reconnectAttemptsRef.current = 0
    connectTimeRef.current = null

    onDisconnect?.()
  }, [onDisconnect])

  const reconnect = useCallback(() => {
    disconnect()
    setTimeout(connect, 1000)
  }, [disconnect, connect])

  // Auto-connect on mount
  useEffect(() => {
    connect()
    return disconnect
  }, [connect, disconnect])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect()
    }
  }, [disconnect])

  return {
    isConnected,
    isReconnecting,
    connectionError,
    lastMessage,
    connectionStats,
    connect,
    disconnect,
    reconnect
  }
}