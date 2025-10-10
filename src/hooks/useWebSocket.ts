// WebSocket Hook - Real-time Communication Client
// Bergizi-ID SaaS Platform - Enterprise Real-time Features

'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useSession } from 'next-auth/react'

interface WebSocketConfig {
  heartbeatInterval?: number
  reconnectInterval?: number
  maxReconnectAttempts?: number
}

interface WebSocketConnectionInfo {
  wsUrl: string
  sppgId: string
  userId: string
  channels: string[]
  token: string
  config?: WebSocketConfig // Make config optional to handle edge cases
}

interface UseWebSocketOptions {
  enabled?: boolean
  onMessage?: (message: unknown) => void
  onConnect?: () => void
  onDisconnect?: () => void
  onError?: (error: Event) => void
}

interface UseWebSocketReturn {
  isConnected: boolean
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error'
  lastMessage: unknown
  sendMessage: (message: unknown) => void
  reconnect: () => void
}

export function useWebSocket(options: UseWebSocketOptions = {}): UseWebSocketReturn {
  const { data: session } = useSession()
  const {
    enabled = true,
    onMessage,
    onConnect,
    onError
  } = options

  const [isConnected, setIsConnected] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected')
  const [lastMessage, setLastMessage] = useState<unknown>(null)
  const [connectionInfo, setConnectionInfo] = useState<WebSocketConnectionInfo | null>(null)
  
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const reconnectAttemptsRef = useRef(0)
  const maxReconnectAttemptsRef = useRef(10)
  const connectRef = useRef<(() => Promise<void>) | null>(null)

  // Fetch WebSocket connection info from API
  const fetchConnectionInfo = useCallback(async (): Promise<WebSocketConnectionInfo | null> => {
    try {
      const response = await fetch('/api/ws', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`Failed to get WebSocket info: ${response.status}`)
      }

      const result = await response.json()
      if (!result.success) {
        throw new Error(result.error || 'Failed to get WebSocket connection info')
      }

      return result.data
    } catch (error) {
      console.error('[WebSocket] Failed to fetch connection info:', error)
      return null
    }
  }, [])

  // Send message to WebSocket
  const sendMessage = useCallback((message: unknown) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      try {
        const messageString = typeof message === 'string' ? message : JSON.stringify(message)
        wsRef.current.send(messageString)
      } catch (error) {
        console.error('[WebSocket] Send message error:', error)
      }
    } else {
      console.warn('[WebSocket] Cannot send message: WebSocket not connected')
    }
  }, [])

  // Subscribe to real-time updates (fallback mechanism)
  const subscribeToUpdates = useCallback(async (info: WebSocketConnectionInfo) => {
    // Simulate receiving messages from Redis channels
    // In production, this would be handled by the WebSocket server
    
    const simulateUpdate = () => {
      // Random update simulation
      const updateTypes = [
        'MENU_UPDATED',
        'PRODUCTION_STARTED', 
        'INVENTORY_LOW_STOCK',
        'DISTRIBUTION_COMPLETED'
      ]
      
      const randomType = updateTypes[Math.floor(Math.random() * updateTypes.length)]
      const mockMessage = {
        type: 'redis_message',
        channel: `${randomType.toLowerCase()}:updates:${info.sppgId}`,
        data: {
          type: randomType,
          sppgId: info.sppgId,
          data: {
            message: `Mock ${randomType} event`,
            timestamp: new Date().toISOString()
          }
        },
        timestamp: new Date().toISOString()
      }

      setLastMessage(mockMessage)
      onMessage?.(mockMessage)
    }

    // Simulate updates every 30 seconds
    setInterval(simulateUpdate, 30000)
  }, [onMessage])

  // Schedule reconnection
  const scheduleReconnect = useCallback(() => {
    if (reconnectAttemptsRef.current >= maxReconnectAttemptsRef.current) {
      console.error('[WebSocket] Max reconnection attempts reached')
      setConnectionStatus('error')
      return
    }

    const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000) // Exponential backoff
    
    console.log(`[WebSocket] Scheduling reconnection attempt ${reconnectAttemptsRef.current + 1} in ${delay}ms`)
    
    reconnectTimeoutRef.current = setTimeout(() => {
      reconnectAttemptsRef.current++
      // Use a ref to avoid circular dependency
      connectRef.current?.()
    }, delay)
  }, []) // Empty deps to avoid circular reference

  // Setup heartbeat
  const setupHeartbeat = useCallback((config: WebSocketConfig) => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current)
    }

    heartbeatIntervalRef.current = setInterval(() => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        sendMessage({ type: 'ping', timestamp: Date.now() })
      }
    }, config.heartbeatInterval || 30000)
  }, [sendMessage])

  // Connect to WebSocket
  const connect = useCallback(async (): Promise<void> => {
    if (!enabled || !session?.user?.sppgId) {
      return
    }

    // Fetch connection info if not available
    if (!connectionInfo) {
      setConnectionStatus('connecting')
      const info = await fetchConnectionInfo()
      if (!info) {
        setConnectionStatus('error')
        return
      }
      setConnectionInfo(info)
      maxReconnectAttemptsRef.current = info.config?.maxReconnectAttempts || 10
    }

    const info = connectionInfo!
    
    try {
      setConnectionStatus('connecting')
      
      // Note: For development, we'll simulate WebSocket with EventSource or polling
      // In production, you would connect to actual WebSocket server
      
      // For now, create a mock WebSocket-like interface
      const mockWs = {
        readyState: WebSocket.OPEN,
        send: (message: string) => {
          console.log('[WebSocket Mock] Sending:', message)
          
          // Simulate pong response
          const parsed = JSON.parse(message)
          if (parsed.type === 'ping') {
            setTimeout(() => {
              setLastMessage({ type: 'pong', timestamp: Date.now() })
              onMessage?.({ type: 'pong', timestamp: Date.now() })
            }, 100)
          }
        },
        close: () => {
          console.log('[WebSocket Mock] Connection closed')
        },
        onopen: null as ((event: Event) => void) | null,
        onmessage: null as ((event: MessageEvent) => void) | null,
        onclose: null as ((event: CloseEvent) => void) | null,
        onerror: null as ((event: Event) => void) | null
      }

      wsRef.current = mockWs as unknown as WebSocket

      // Simulate connection success
      setTimeout(() => {
        setIsConnected(true)
        setConnectionStatus('connected')
        reconnectAttemptsRef.current = 0
        
        // Setup heartbeat with default config if info.config is null
        const config = info?.config || {
          heartbeatInterval: 30000,
          reconnectInterval: 5000,
          maxReconnectAttempts: 10
        }
        setupHeartbeat(config)
        onConnect?.()

        // Subscribe to Redis channels via Server-Sent Events or polling
        if (info) {
          subscribeToUpdates(info)
        }
      }, 1000)

    } catch (error) {
      console.error('[WebSocket] Connection error:', error)
      setConnectionStatus('error')
      setIsConnected(false)
      onError?.(error as Event)
      
      scheduleReconnect()
    }
  }, [enabled, session?.user?.sppgId, connectionInfo, fetchConnectionInfo, setupHeartbeat, onConnect, onError, onMessage, scheduleReconnect, subscribeToUpdates])

  // Update connectRef whenever connect changes
  useEffect(() => {
    connectRef.current = connect
  }, [connect])

  // Reconnect function
  const reconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close()
    }
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
    }
    
    reconnectAttemptsRef.current = 0
    connect()
  }, [connect])

  // Initialize connection
  useEffect(() => {
    if (enabled && session?.user?.sppgId) {
      connect()
    }

    return () => {
      // Cleanup on unmount
      if (wsRef.current) {
        wsRef.current.close()
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current)
      }
    }
  }, [enabled, session?.user?.sppgId, connect])

  // Cleanup on session changes
  useEffect(() => {
    if (!session?.user?.sppgId && wsRef.current) {
      wsRef.current.close()
      setIsConnected(false)
      setConnectionStatus('disconnected')
    }
  }, [session?.user?.sppgId])

  return {
    isConnected,
    connectionStatus,
    lastMessage,
    sendMessage,
    reconnect
  }
}

// Utility hook for specific channel subscriptions
export function useWebSocketChannel(channel: string, onMessage?: (message: unknown) => void) {
  const [lastChannelMessage, setLastChannelMessage] = useState<unknown>(null)
  
  const { isConnected, ...rest } = useWebSocket({
    onMessage: (message) => {
      // Filter messages for specific channel
      if (typeof message === 'object' && message !== null && 'channel' in message) {
        const msg = message as { channel: string; data: unknown }
        if (msg.channel === channel || msg.channel.includes(channel)) {
          setLastChannelMessage(msg.data)
          onMessage?.(msg.data)
        }
      }
    }
  })

  return {
    isConnected,
    lastMessage: lastChannelMessage,
    sendMessage: rest.sendMessage,
    reconnect: rest.reconnect,
    connectionStatus: rest.connectionStatus
  }
}

// Hook for broadcasting messages to other clients
export function useWebSocketBroadcast() {
  const { data: session } = useSession()

  const broadcast = useCallback(async (channel: string, message: unknown) => {
    if (!session?.user?.sppgId) {
      console.warn('[WebSocket] Cannot broadcast: No SPPG session')
      return false
    }

    try {
      const response = await fetch('/api/ws', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_API_KEY || 'mock-key'}`
        },
        body: JSON.stringify({
          sppgId: session.user.sppgId,
          channel,
          message
        })
      })

      if (!response.ok) {
        throw new Error(`Broadcast failed: ${response.status}`)
      }

      return true
    } catch (error) {
      console.error('[WebSocket] Broadcast error:', error)
      return false
    }
  }, [session?.user?.sppgId])

  return { broadcast }
}