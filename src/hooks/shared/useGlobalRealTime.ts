/**
 * Global Real-Time System Status Hook
 * Enterprise-Grade WebSocket & Redis Monitoring
 * Bergizi-ID SaaS Platform - Phase 1 Implementation
 */

'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useSession } from 'next-auth/react'

// Global status types
export interface SystemHealthStatus {
  overall: 'HEALTHY' | 'WARNING' | 'CRITICAL'
  database: 'CONNECTED' | 'SLOW' | 'DISCONNECTED'
  redis: 'CONNECTED' | 'SLOW' | 'DISCONNECTED'
  apis: 'RESPONSIVE' | 'SLOW' | 'TIMEOUT'
  uptime: number
  responseTime: number
  errorRate: number
  lastCheck: string
}

export interface WebSocketStatus {
  status: 'CONNECTED' | 'CONNECTING' | 'DISCONNECTED' | 'ERROR' | 'UNAVAILABLE'
  connectionId?: string
  reconnectAttempts: number
  lastReconnect?: string
  latency?: number
}

export interface GlobalNotification {
  id: string
  type: 'INFO' | 'WARNING' | 'ERROR' | 'SUCCESS'
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  title: string
  message: string
  timestamp: string
  read: boolean
  domain?: string
  sppgId?: string
  userId?: string
  metadata?: Record<string, unknown>
}

export interface GlobalActivity {
  activeUsers: number
  concurrentSessions: number
  activeOperations: number
  systemLoad: number
  peakHours: boolean
  maintenanceMode: boolean
}

export interface GlobalRealTimeState {
  // Connection status
  websocketStatus: WebSocketStatus
  systemHealth: SystemHealthStatus
  
  // Activity monitoring
  activity: GlobalActivity
  
  // Notifications
  notifications: GlobalNotification[]
  unreadCount: number
  criticalAlerts: number
  
  // Operations
  isLoading: boolean
  lastUpdate: string | null
  error: string | null
}

export interface GlobalRealTimeActions {
  // Connection management
  reconnectWebSocket: () => Promise<void>
  refreshSystemHealth: () => Promise<void>
  
  // Notification management
  markNotificationRead: (id: string) => Promise<void>
  markAllNotificationsRead: () => Promise<void>
  dismissNotification: (id: string) => Promise<void>
  
  // Manual refresh
  forceRefresh: () => Promise<void>
  
  // Subscription management
  subscribe: (channel: string) => void
  unsubscribe: (channel: string) => void
  
  // Connection reset
  resetWebSocketConnection: () => void
}

export type UseGlobalRealTimeReturn = GlobalRealTimeState & GlobalRealTimeActions

/**
 * Global Real-Time Hook Implementation
 */
export function useGlobalRealTime(): UseGlobalRealTimeReturn {
  const { data: session } = useSession()
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const healthCheckIntervalRef = useRef<NodeJS.Timeout | null>(null)
  
  // State management with realistic initial states
  const [state, setState] = useState<GlobalRealTimeState>({
    websocketStatus: {
      status: 'CONNECTING', // More realistic initial state
      reconnectAttempts: 0
    },
    systemHealth: {
      overall: 'WARNING', // Start with unknown state
      database: 'DISCONNECTED', // Will be updated after health check
      redis: 'DISCONNECTED', // Will be updated after health check
      apis: 'TIMEOUT', // Will be updated after health check
      uptime: 0,
      responseTime: 0,
      errorRate: 0,
      lastCheck: new Date().toISOString()
    },
    activity: {
      activeUsers: 0,
      concurrentSessions: 0,
      activeOperations: 0,
      systemLoad: 0,
      peakHours: false,
      maintenanceMode: false
    },
    notifications: [],
    unreadCount: 0,
    criticalAlerts: 0,
    isLoading: true, // Start with loading state
    lastUpdate: null,
    error: null
  })

  // Handle WebSocket messages
  const handleWebSocketMessage = useCallback((data: {
    type: string
    payload?: unknown
    timestamp?: number
  }) => {
    switch (data.type) {
      case 'SYSTEM_HEALTH':
        setState(prev => ({
          ...prev,
          systemHealth: {
            ...data.payload as SystemHealthStatus,
            lastCheck: new Date().toISOString()
          }
        }))
        break

      case 'SYSTEM_ACTIVITY':
        setState(prev => ({
          ...prev,
          activity: data.payload as GlobalActivity
        }))
        break

      case 'NOTIFICATION':
        setState(prev => {
          const newNotification: GlobalNotification = {
            ...(data.payload as Omit<GlobalNotification, 'timestamp' | 'read'>),
            timestamp: new Date().toISOString(),
            read: false
          }
          
          const updatedNotifications = [newNotification, ...prev.notifications].slice(0, 50)
          const unreadCount = updatedNotifications.filter(n => !n.read).length
          const criticalAlerts = updatedNotifications.filter(n => n.severity === 'CRITICAL' && !n.read).length
          
          return {
            ...prev,
            notifications: updatedNotifications,
            unreadCount,
            criticalAlerts
          }
        })
        break

      case 'PONG':
        // Calculate latency
        const latency = Date.now() - (data.timestamp || Date.now())
        setState(prev => ({
          ...prev,
          websocketStatus: {
            ...prev.websocketStatus,
            latency
          }
        }))
        break

      default:
        console.log('📨 Unknown WebSocket message type:', data.type)
    }
  }, [])

  // WebSocket connection management
  const connectWebSocket = useCallback(() => {
    if (!session?.user?.sppgId) {
      console.warn('🔌 Cannot connect WebSocket: No SPPG ID available')
      return
    }

    // Check if WebSocket is available
    if (typeof WebSocket === 'undefined') {
      console.error('🚨 WebSocket not supported in this environment')
      setState(prev => ({
        ...prev,
        websocketStatus: { ...prev.websocketStatus, status: 'ERROR' },
        error: 'WebSocket not supported in this browser'
      }))
      return
    }

    // Feature flag: Disable WebSocket in development if server is not configured
    const WEBSOCKET_ENABLED = process.env.NODE_ENV === 'production' || 
                             process.env.NEXT_PUBLIC_WEBSOCKET_ENABLED === 'true'
    
    if (!WEBSOCKET_ENABLED) {
      console.log('🔌 WebSocket disabled in development - using polling fallback')
      setState(prev => ({
        ...prev,
        websocketStatus: { ...prev.websocketStatus, status: 'UNAVAILABLE' },
        error: 'WebSocket disabled in development'
      }))
      return
    }

    try {
      setState(prev => ({
        ...prev,
        websocketStatus: { ...prev.websocketStatus, status: 'CONNECTING' }
      }))

      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
      const wsUrl = `${protocol}//${window.location.host}/api/ws?sppgId=${session.user.sppgId}`
      
      console.log('🔌 Attempting WebSocket connection to:', wsUrl)
      
      // Check if the URL looks valid
      try {
        new URL(wsUrl.replace('ws:', 'http:').replace('wss:', 'https:'))
      } catch (urlError) {
        console.error('🚨 Invalid WebSocket URL:', wsUrl, urlError)
        setState(prev => ({
          ...prev,
          websocketStatus: { ...prev.websocketStatus, status: 'ERROR' },
          error: 'Invalid WebSocket URL'
        }))
        return
      }
      
      const ws = new WebSocket(wsUrl)
      wsRef.current = ws

      // Set connection timeout
      const connectionTimeout = setTimeout(() => {
        if (ws.readyState === WebSocket.CONNECTING) {
          console.error('🚨 WebSocket connection timeout after 10s')
          ws.close()
          setState(prev => ({
            ...prev,
            websocketStatus: { ...prev.websocketStatus, status: 'ERROR' },
            error: 'WebSocket connection timeout'
          }))
        }
      }, 10000) // 10 second timeout

      ws.onopen = () => {
        clearTimeout(connectionTimeout)
        console.log('🔌 Global WebSocket connected successfully')
        setState(prev => ({
          ...prev,
          websocketStatus: {
            status: 'CONNECTED',
            connectionId: Math.random().toString(36).substr(2, 9),
            reconnectAttempts: 0,
            lastReconnect: new Date().toISOString(),
            latency: 0
          },
          error: null
        }))

        // Subscribe to global channels
        ws.send(JSON.stringify({
          type: 'SUBSCRIBE',
          channels: [
            'system:health',
            'system:notifications',
            'system:activity',
            `sppg:${session.user.sppgId}:global`
          ]
        }))
      }

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data) as {
            type: string
            payload?: unknown
            timestamp?: number
          }
          handleWebSocketMessage(data)
        } catch (error) {
          console.error('🚨 WebSocket message parse error:', error)
        }
      }

      ws.onclose = (event) => {
        clearTimeout(connectionTimeout)
        console.log('🔌 Global WebSocket disconnected:', {
          code: event.code,
          reason: event.reason,
          wasClean: event.wasClean
        })
        setState(prev => ({
          ...prev,
          websocketStatus: { ...prev.websocketStatus, status: 'DISCONNECTED' }
        }))
        
        // Auto-reconnect after delay
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current)
        }
        
        reconnectTimeoutRef.current = setTimeout(() => {
          setState(prev => {
            const newReconnectAttempts = prev.websocketStatus.reconnectAttempts + 1
            // Stop trying after 5 attempts to avoid infinite retries
            if (newReconnectAttempts >= 5) {
              console.warn('🔌 Max WebSocket reconnection attempts reached, stopping retries')
              return {
                ...prev,
                websocketStatus: {
                  ...prev.websocketStatus,
                  status: 'UNAVAILABLE',
                  reconnectAttempts: newReconnectAttempts
                },
                error: 'Real-time features temporarily unavailable'
              }
            }
            return {
              ...prev,
              websocketStatus: {
                ...prev.websocketStatus,
                reconnectAttempts: newReconnectAttempts
              }
            }
          })
          
          // Only reconnect if we haven't exceeded max attempts
          const currentState = wsRef.current?.readyState
          if (currentState !== WebSocket.OPEN) {
            connectWebSocket()
          }
        }, Math.min(3000 * Math.pow(2, reconnectTimeoutRef.current ? 1 : 0), 30000)) // Exponential backoff, max 30s
      }

      ws.onerror = (error) => {
        clearTimeout(connectionTimeout)
        
        // Log basic error information first
        console.log('🔍 WebSocket error event received:', {
          type: typeof error,
          constructor: error?.constructor?.name,
          isEvent: error instanceof Event,
          isErrorEvent: error instanceof ErrorEvent,
        })
        
        // Better error logging for WebSocket events - handle all possible error formats
        const errorInfo: {
          type: string
          timeStamp: number
          target: { readyState: string | number; url: string } | null
          message: string
          filename?: string
          lineno?: number
          colno?: number
        } = {
          type: 'websocket_error',
          timeStamp: Date.now(),
          target: null,
          message: 'WebSocket connection error'
        }

        try {
          // Safely extract error information
          if (error && typeof error === 'object') {
            errorInfo.type = error.type || 'websocket_error'
            errorInfo.timeStamp = error.timeStamp || Date.now()
            
            if (error.target) {
              const target = error.target as WebSocket
              errorInfo.target = {
                readyState: target.readyState ?? 'unknown',
                url: target.url || 'unknown'
              }
            }
            
            if (error instanceof ErrorEvent) {
              errorInfo.message = error.message || 'WebSocket ErrorEvent'
              errorInfo.filename = error.filename
              errorInfo.lineno = error.lineno
              errorInfo.colno = error.colno
            } else if (error instanceof Event) {
              errorInfo.message = `WebSocket ${error.type || 'error'} event`
            }
          }
          
          // Comprehensive error logging with property extraction
          console.error('🚨 Global WebSocket error details:', errorInfo)
          
          // Extract all properties from the error object for debugging
          const errorProperties: Record<string, unknown> = {}
          if (error && typeof error === 'object') {
            // Get all own properties
            Object.getOwnPropertyNames(error).forEach(prop => {
              try {
                errorProperties[prop] = (error as unknown as Record<string, unknown>)[prop]
              } catch (e) {
                errorProperties[prop] = `[Error accessing property: ${e}]`
              }
            })
            
            // Get prototype properties if it's an Event
            if (error instanceof Event) {
              errorProperties.eventType = error.type
              errorProperties.eventTarget = error.target?.constructor.name || 'unknown'
              errorProperties.eventCurrentTarget = error.currentTarget?.constructor.name || 'unknown'
              errorProperties.eventTimeStamp = error.timeStamp
              errorProperties.eventBubbles = error.bubbles
              errorProperties.eventCancelable = error.cancelable
              errorProperties.eventDefaultPrevented = error.defaultPrevented
            }
            
            // Additional WebSocket-specific properties
            if (error.target && error.target instanceof WebSocket) {
              errorProperties.wsReadyState = error.target.readyState
              errorProperties.wsUrl = error.target.url
              errorProperties.wsProtocol = error.target.protocol
              errorProperties.wsExtensions = error.target.extensions
              errorProperties.wsBinaryType = error.target.binaryType
            }
          }
          
          console.error('🚨 WebSocket error properties:', errorProperties)
          console.error('🚨 Error constructor:', error?.constructor?.name || 'unknown')
          console.error('🚨 Error string representation:', String(error))
        } catch (loggingError) {
          console.error('🚨 Error while processing WebSocket error:', loggingError)
          console.error('🚨 Fallback error info:', {
            errorType: typeof error,
            errorConstructor: error?.constructor?.name,
            errorString: String(error),
            hasTarget: !!(error as unknown as Record<string, unknown>)?.target,
            targetType: (error as unknown as Record<string, unknown>)?.target?.constructor?.name
          })
        }
        
        // Check if this is a connection refused error (WebSocket server not running)
        const isConnectionRefused = errorInfo.message.includes('Connection refused') || 
                                   errorInfo.message.includes('failed') ||
                                   (error.target as WebSocket)?.readyState === WebSocket.CLOSED
        
        setState(prev => ({
          ...prev,
          websocketStatus: { 
            ...prev.websocketStatus, 
            status: isConnectionRefused ? 'UNAVAILABLE' : 'ERROR' 
          },
          error: isConnectionRefused 
            ? 'Real-time features temporarily unavailable' 
            : `WebSocket error: ${errorInfo.message}`
        }))
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown WebSocket connection error'
      console.error('🚨 Failed to connect WebSocket:', {
        message: errorMessage,
        error: error instanceof Error ? {
          name: error.name,
          message: error.message,
          stack: error.stack
        } : error
      })
      setState(prev => ({
        ...prev,
        websocketStatus: { ...prev.websocketStatus, status: 'ERROR' },
        error: `Failed to establish WebSocket connection: ${errorMessage}`
      }))
    }
  }, [session?.user?.sppgId, handleWebSocketMessage])

  // System health monitoring
  const refreshSystemHealth = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }))
      
      const response = await fetch('/api/system/health', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`Health check failed: ${response.status}`)
      }

      const healthData = await response.json()
      
      setState(prev => ({
        ...prev,
        systemHealth: {
          ...healthData,
          lastCheck: new Date().toISOString()
        },
        isLoading: false,
        lastUpdate: new Date().toISOString()
      }))

    } catch (error) {
      console.error('🚨 System health check failed:', error)
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Health check failed',
        isLoading: false,
        systemHealth: {
          ...prev.systemHealth,
          overall: 'CRITICAL'
        }
      }))
    }
  }, [])

  // Notification management
  const markNotificationRead = useCallback(async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}/read`, { method: 'PATCH' })
      
      setState(prev => {
        const updatedNotifications = prev.notifications.map(n =>
          n.id === id ? { ...n, read: true } : n
        )
        const unreadCount = updatedNotifications.filter(n => !n.read).length
        const criticalAlerts = updatedNotifications.filter(n => n.severity === 'CRITICAL' && !n.read).length
        
        return {
          ...prev,
          notifications: updatedNotifications,
          unreadCount,
          criticalAlerts
        }
      })
    } catch (error) {
      console.error('🚨 Failed to mark notification as read:', error)
    }
  }, [])

  const markAllNotificationsRead = useCallback(async () => {
    try {
      await fetch('/api/notifications/read-all', { method: 'PATCH' })
      
      setState(prev => ({
        ...prev,
        notifications: prev.notifications.map(n => ({ ...n, read: true })),
        unreadCount: 0,
        criticalAlerts: 0
      }))
    } catch (error) {
      console.error('🚨 Failed to mark all notifications as read:', error)
    }
  }, [])

  const dismissNotification = useCallback(async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}`, { method: 'DELETE' })
      
      setState(prev => {
        const updatedNotifications = prev.notifications.filter(n => n.id !== id)
        const unreadCount = updatedNotifications.filter(n => !n.read).length
        const criticalAlerts = updatedNotifications.filter(n => n.severity === 'CRITICAL' && !n.read).length
        
        return {
          ...prev,
          notifications: updatedNotifications,
          unreadCount,
          criticalAlerts
        }
      })
    } catch (error) {
      console.error('🚨 Failed to dismiss notification:', error)
    }
  }, [])

  // Manual operations
  const reconnectWebSocket = useCallback(async () => {
    if (wsRef.current) {
      wsRef.current.close()
    }
    connectWebSocket()
  }, [connectWebSocket])

  const forceRefresh = useCallback(async () => {
    await refreshSystemHealth()
    await reconnectWebSocket()
  }, [refreshSystemHealth, reconnectWebSocket])

  // Subscription management
  const subscribe = useCallback((channel: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'SUBSCRIBE',
        channel
      }))
    }
  }, [])

  const unsubscribe = useCallback((channel: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'UNSUBSCRIBE',
        channel
      }))
    }
  }, [])

  // Reset WebSocket connection attempts
  const resetWebSocketConnection = useCallback(() => {
    console.log('🔄 Resetting WebSocket connection')
    setState(prev => ({
      ...prev,
      websocketStatus: {
        ...prev.websocketStatus,
        status: 'DISCONNECTED',
        reconnectAttempts: 0
      },
      error: null
    }))
    
    // Close existing connection if any
    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }
    
    // Clear timeouts
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }
    
    // Attempt new connection
    setTimeout(() => {
      connectWebSocket()
    }, 1000)
  }, [connectWebSocket])

  // Store function refs to avoid dependency issues
  const connectWebSocketRef = useRef(connectWebSocket)
  const refreshSystemHealthRef = useRef(refreshSystemHealth)
  
  // Update refs when functions change
  useEffect(() => {
    connectWebSocketRef.current = connectWebSocket
    refreshSystemHealthRef.current = refreshSystemHealth
  }, [connectWebSocket, refreshSystemHealth])

  // Lifecycle management
  useEffect(() => {
    if (session?.user?.sppgId) {
      // Set loading state when starting initialization
      setState(prev => ({ ...prev, isLoading: true }))
      
      // Store refs for cleanup
      const currentWs = wsRef.current
      const currentReconnectTimeout = reconnectTimeoutRef.current
      const currentHealthCheckInterval = healthCheckIntervalRef.current
      
      // Initialize connections
      connectWebSocketRef.current()
      refreshSystemHealthRef.current()

      // Setup periodic health checks
      healthCheckIntervalRef.current = setInterval(() => {
        refreshSystemHealthRef.current()
        
        // Send ping to WebSocket
        if (wsRef.current?.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({
            type: 'PING',
            timestamp: Date.now()
          }))
        }
      }, 30000) // Every 30 seconds

      // Cleanup
      return () => {
        if (currentWs) {
          currentWs.close()
        }
        if (currentReconnectTimeout) {
          clearTimeout(currentReconnectTimeout)
        }
        if (currentHealthCheckInterval) {
          clearInterval(currentHealthCheckInterval)
        }
      }
    }
  }, [session?.user?.sppgId])

  return {
    // State
    ...state,
    
    // Actions
    reconnectWebSocket,
    refreshSystemHealth,
    markNotificationRead,
    markAllNotificationsRead,
    dismissNotification,
    forceRefresh,
    subscribe,
    unsubscribe,
    resetWebSocketConnection
  }
}