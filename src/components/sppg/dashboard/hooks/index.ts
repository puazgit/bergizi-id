/**
 * SPPG Dashboard Hooks - Enterprise Grade
 * Pattern 2 Architecture - Domain-specific hooks
 * Real-time WebSocket + Redis Integration
 */

'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'
import { createComponentLogger } from '@/lib/logger'
import {
  getExecutiveDashboard,
  refreshDashboardData,
  refreshDashboardMetrics,
  subscribeToDashboardUpdates,
  invalidateDashboardCache,
  getDashboardHistory,
  saveDashboardActivity
} from '@/actions/sppg/dashboard'
import {
  DashboardData,
  DashboardFilters,
  DashboardWebSocketEvent,
  UseDashboardReturn,
  UseDashboardRealTimeReturn,
  DashboardPeriod,
  DashboardConfig
} from '../types'
import { transformDashboardData } from '../utils'

// Default Dashboard Configuration
const DEFAULT_CONFIG: DashboardConfig = {
  refreshInterval: 30000, // 30 seconds
  realTimeEnabled: true,
  alertsEnabled: true,
  notificationsEnabled: true,
  autoRefresh: true,
  theme: 'system',
  defaultView: 'executive',
  defaultPeriod: '30d'
}

// Real-time WebSocket Hook
export const useDashboardRealTime = (): UseDashboardRealTimeReturn => {
  const [isConnected, setIsConnected] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<string | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<'CONNECTING' | 'CONNECTED' | 'DISCONNECTED' | 'ERROR'>('DISCONNECTED')
  const wsRef = useRef<WebSocket | null>(null)
  const subscribedEvents = useRef<Set<string>>(new Set())
  const queryClient = useQueryClient()

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return

    setConnectionStatus('CONNECTING')
    
    try {
      const wsUrl = process.env.NODE_ENV === 'production' 
        ? `wss://${window.location.host}/api/ws/dashboard`
        : `ws://localhost:3000/api/ws/dashboard`
      
      wsRef.current = new WebSocket(wsUrl)

      wsRef.current.onopen = () => {
        setIsConnected(true)
        setConnectionStatus('CONNECTED')
        const wsLogger = createComponentLogger('DashboardWebSocket')
        wsLogger.info('Dashboard WebSocket connected successfully')
        
        // Re-subscribe to events after reconnection
        subscribedEvents.current.forEach(eventType => {
          wsRef.current?.send(JSON.stringify({
            type: 'SUBSCRIBE',
            eventType
          }))
        })
      }

      wsRef.current.onmessage = (event) => {
        try {
          const data: DashboardWebSocketEvent = JSON.parse(event.data)
          setLastUpdate(data.timestamp)
          
          // Handle different event types
          switch (data.type) {
            case 'METRICS_UPDATE':
              // Invalidate dashboard queries to trigger refresh
              queryClient.invalidateQueries({ queryKey: ['dashboard'] })
              toast.success('Dashboard metrics updated')
              break
              
            case 'ALERT_CREATED':
              queryClient.invalidateQueries({ queryKey: ['dashboard', 'alerts'] })
              toast.warning(`New alert: ${(data.payload as { title?: string })?.title || 'Alert created'}`)
              break
              
            case 'NOTIFICATION_SENT':
              queryClient.invalidateQueries({ queryKey: ['dashboard', 'notifications'] })
              toast.info(`New notification: ${(data.payload as { title?: string })?.title || 'Notification sent'}`)
              break
              
            case 'KPI_UPDATED':
              queryClient.invalidateQueries({ queryKey: ['dashboard', 'kpis'] })
              break
              
            default:
              const wsLogger = createComponentLogger('DashboardWebSocket')
              wsLogger.warn('Unknown dashboard event type received', { 
                eventType: data.type,
                payload: data.payload 
              })
          }
        } catch (error) {
          const wsLogger = createComponentLogger('DashboardWebSocket')
          wsLogger.error('Failed to parse WebSocket message', error as Error, {
            rawMessage: event.data
          })
        }
      }

      wsRef.current.onclose = () => {
        setIsConnected(false)
        setConnectionStatus('DISCONNECTED')
        const wsLogger = createComponentLogger('DashboardWebSocket')
        wsLogger.info('Dashboard WebSocket disconnected, attempting reconnection')
        
        // Attempt to reconnect after 3 seconds
        setTimeout(connect, 3000)
      }

      wsRef.current.onerror = (error) => {
        setConnectionStatus('ERROR')
        const wsLogger = createComponentLogger('DashboardWebSocket')
        wsLogger.error('Dashboard WebSocket connection error', undefined, {
          eventType: error.type,
          errorEvent: error
        })
      }
    } catch (error) {
      setConnectionStatus('ERROR')
      const wsLogger = createComponentLogger('DashboardWebSocket')
      wsLogger.error('Failed to create WebSocket connection', error as Error)
    }
  }, [queryClient])

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }
    setIsConnected(false)
    setConnectionStatus('DISCONNECTED')
  }, [])

  const subscribe = useCallback((eventType: string) => {
    subscribedEvents.current.add(eventType)
    
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'SUBSCRIBE',
        eventType
      }))
    }
  }, [])

  const unsubscribe = useCallback((eventType: string) => {
    subscribedEvents.current.delete(eventType)
    
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'UNSUBSCRIBE',
        eventType
      }))
    }
  }, [])

  useEffect(() => {
    connect()
    return () => disconnect()
  }, [connect, disconnect])

  return {
    isConnected,
    lastUpdate,
    connectionStatus,
    subscribe,
    unsubscribe
  }
}

// Main Dashboard Data Hook
export const useDashboard = (initialFilters?: Partial<DashboardFilters>): UseDashboardReturn => {
  const [filters, setFilters] = useState<DashboardFilters>({
    dateRange: {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
      end: new Date().toISOString()
    },
    programs: undefined,
    regions: undefined,
    beneficiaryTypes: undefined,
    metrics: undefined,
    ...initialFilters
  })

  // Transform filters to match server action expectations
  const serverFilters = {
    dateRange: {
      startDate: filters.dateRange.start.split('T')[0],
      endDate: filters.dateRange.end.split('T')[0]
    },
    programs: filters.programs,
    granularity: 'DAILY' as const,
    includeInactive: false,
    includeForecasts: true
  }

  const queryKey = ['dashboard', 'executive', filters]

  const {
    data: rawData,
    isLoading: loading,
    error,
    refetch: queryRefetch
  } = useQuery({
    queryKey,
    queryFn: async () => {
      const result = await getExecutiveDashboard(serverFilters)
      if (!result.success) {
        throw new Error(result.error)
      }
      return result.data
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 30 * 1000, // 30 seconds
    refetchIntervalInBackground: true
  })

  // Transform data to match DashboardData interface
  const data: DashboardData | null = rawData ? transformDashboardData(rawData) : null

  const refetch = useCallback(async () => {
    await queryRefetch()
  }, [queryRefetch])

  const updateFilters = useCallback((newFilters: Partial<DashboardFilters>) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters
    }))
  }, [])

  return {
    data,
    loading,
    error: error?.message || null,
    refetch,
    updateFilters,
    filters
  }
}

// Dashboard Period Hook
export const useDashboardPeriod = (initialPeriod: DashboardPeriod = '30d') => {
  const [period, setPeriod] = useState<DashboardPeriod>(initialPeriod)

  const getDateRange = useCallback((selectedPeriod: DashboardPeriod) => {
    const end = new Date()
    let start: Date

    switch (selectedPeriod) {
      case '7d':
        start = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        break
      case '30d':
        start = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        break
      case '90d':
        start = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
        break
      case '1y':
        start = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)
        break
      default:
        start = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    }

    return { start, end }
  }, [])

  const dateRange = getDateRange(period)

  const changePeriod = useCallback((newPeriod: DashboardPeriod) => {
    setPeriod(newPeriod)
  }, [])

  return {
    period,
    dateRange,
    changePeriod,
    getDateRange
  }
}

// Dashboard Configuration Hook
export const useDashboardConfig = () => {
  const [config, setConfig] = useState<DashboardConfig>({
    refreshInterval: 30000, // 30 seconds
    realTimeEnabled: true,
    alertsEnabled: true,
    notificationsEnabled: true,
    autoRefresh: true,
    theme: 'system',
    defaultView: 'executive',
    defaultPeriod: '30d'
  })

  const updateConfig = useCallback((updates: Partial<DashboardConfig>) => {
    setConfig(prev => ({
      ...prev,
      ...updates
    }))
  }, [])

  // Save config to localStorage
  useEffect(() => {
    localStorage.setItem('dashboard-config', JSON.stringify(config))
  }, [config])

  // Load config from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('dashboard-config')
    if (saved) {
      try {
        const parsedConfig = JSON.parse(saved)
        setConfig(prev => ({
          ...prev,
          ...parsedConfig
        }))
      } catch (error) {
        const configLogger = createComponentLogger('DashboardConfig')
        configLogger.error('Failed to parse dashboard config from localStorage', error as Error)
      }
    }
  }, [])

  return {
    config,
    updateConfig,
    resetConfig: () => setConfig(DEFAULT_CONFIG),
    isDefaultConfig: JSON.stringify(config) === JSON.stringify(DEFAULT_CONFIG)
  }
}

// ============================================================================
// ENTERPRISE DASHBOARD CACHE MANAGEMENT HOOKS
// ============================================================================

/**
 * Hook for dashboard cache invalidation
 */
export const useDashboardCache = () => {
  const queryClient = useQueryClient()
  const { data: session } = useSession()
  const [isInvalidating, setIsInvalidating] = useState(false)

  const invalidateCache = useCallback(async () => {
    setIsInvalidating(true)
    try {
      // Validate session and sppgId
      if (!session?.user?.sppgId) {
        throw new Error('User session not found or invalid. Please refresh the page.')
      }
      
      // Invalidate local React Query cache
      await queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      
      // Invalidate server-side Redis cache with proper sppgId
      await invalidateDashboardCache(session.user.sppgId)
      
      toast.success('Dashboard cache cleared successfully')
    } catch (error) {
      const cacheLogger = createComponentLogger('DashboardCache')
      cacheLogger.error('Failed to invalidate dashboard cache', error as Error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      toast.error(`Failed to clear dashboard cache: ${errorMessage}`)
    } finally {
      setIsInvalidating(false)
    }
  }, [queryClient, session?.user?.sppgId])

  const forceRefresh = useCallback(async () => {
    setIsInvalidating(true)
    try {
      // Validate session and sppgId
      if (!session?.user?.sppgId) {
        throw new Error('User session not found or invalid. Please refresh the page.')
      }
      
      const result = await refreshDashboardData(session.user.sppgId)
      if (result.success) {
        await queryClient.invalidateQueries({ queryKey: ['dashboard'] })
        toast.success('Dashboard data refreshed successfully')
      } else {
        const errorMessage = result.error || 'Unknown error occurred'
        toast.error(`Failed to refresh dashboard data: ${errorMessage}`)
      }
    } catch (error) {
      const refreshLogger = createComponentLogger('DashboardRefresh')
      refreshLogger.error('Failed to force refresh dashboard data', error as Error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      toast.error(`Failed to refresh dashboard data: ${errorMessage}`)
    } finally {
      setIsInvalidating(false)
    }
  }, [queryClient, session?.user?.sppgId])

  return {
    invalidateCache,
    forceRefresh,
    isInvalidating
  }
}

/**
 * Hook for advanced dashboard metrics with AI forecasting
 */
export const useDashboardAdvancedMetrics = (enabled: boolean = false) => {
  const [isRefreshing, setIsRefreshing] = useState(false)
  
  const {
    data: advancedMetrics,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['dashboard', 'advanced-metrics'],
    queryFn: async () => {
      const result = await refreshDashboardMetrics(true)
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch advanced metrics')
      }
      return result.data
    },
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 10 * 60 * 1000, // 10 minutes
  })

  const refreshMetrics = useCallback(async (forceRefresh: boolean = false) => {
    setIsRefreshing(true)
    try {
      const result = await refreshDashboardMetrics(forceRefresh)
      if (result.success) {
        await refetch()
        toast.success('Advanced metrics updated successfully')
      } else {
        toast.error('Failed to update advanced metrics')
      }
    } catch (error) {
      const metricsLogger = createComponentLogger('DashboardMetrics')
      metricsLogger.error('Failed to refresh advanced metrics', error as Error)
      toast.error('Failed to update advanced metrics')
    } finally {
      setIsRefreshing(false)
    }
  }, [refetch])

  return {
    advancedMetrics,
    isLoading,
    error,
    isRefreshing,
    refreshMetrics,
    refetch
  }
}

/**
 * Hook for dashboard real-time subscriptions
 */
export const useDashboardSubscriptions = () => {
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [subscriptionError, setSubscriptionError] = useState<string | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'error' | 'connecting'>('disconnected')
  const [lastUpdate, setLastUpdate] = useState<string | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)

  const subscribe = useCallback(async () => {
    try {
      setIsConnecting(true)
      setSubscriptionError(null)
      setConnectionStatus('connecting')
      
      await subscribeToDashboardUpdates()
      
      setIsSubscribed(true)
      setConnectionStatus('connected')
      setLastUpdate(new Date().toISOString())
      toast.success('Subscribed to real-time dashboard updates')
    } catch (error) {
      const subscriptionLogger = createComponentLogger('DashboardSubscription')
      subscriptionLogger.error('Failed to subscribe to dashboard updates', error as Error)
      setSubscriptionError('Failed to subscribe to updates')
      setConnectionStatus('error')
      toast.error('Failed to subscribe to real-time updates')
    } finally {
      setIsConnecting(false)
    }
  }, [])

  const unsubscribe = useCallback(() => {
    setIsSubscribed(false)
    setSubscriptionError(null)
    setConnectionStatus('disconnected')
    setLastUpdate(null)
    setIsConnecting(false)
    toast.info('Unsubscribed from real-time updates')
  }, [])

  // Simulate periodic updates when connected
  useEffect(() => {
    if (!isSubscribed || connectionStatus !== 'connected') return

    const interval = setInterval(() => {
      setLastUpdate(new Date().toISOString())
    }, 30000) // Update every 30 seconds

    return () => clearInterval(interval)
  }, [isSubscribed, connectionStatus])

  // Auto-subscribe on mount if dashboard is active - DISABLED to prevent loops
  // Users can manually control subscriptions via UI
  // useEffect(() => {
  //   // Auto-subscription disabled to prevent infinite loops
  // }, [])

  return {
    isSubscribed,
    subscriptionError,
    connectionStatus,
    lastUpdate,
    isConnecting,
    subscribe,
    unsubscribe
  }
}

// Type for dashboard history response
interface DashboardHistoryResponse {
  history: Array<{
    timestamp: string
    title: string
    description?: string
    user: string
    userId: string
    changeType: 'create' | 'update' | 'delete' | 'view' | 'export'
    change: number
    data?: Record<string, unknown>
  }>
  total: number
}

/**
 * Hook for dashboard history tracking
 */
export function useDashboardHistory(limit: number = 25) {
  // Check if running on client-side
  const isClient = typeof window !== 'undefined'
  
  const {
    data: history,
    isLoading,
    error,
    refetch
  } = useQuery<DashboardHistoryResponse>({
    queryKey: ['dashboard', 'history', limit],
    queryFn: async () => {
      const historyLogger = createComponentLogger('useDashboardHistory')
      
      if (process.env.NODE_ENV === 'development') {
        historyLogger.debug('Fetching dashboard history', { limit })
      }
      
      const result = await getDashboardHistory(limit)
      
      if (!result.success) {
        historyLogger.error('Failed to fetch dashboard history', result.error, {
          limit,
          errorMessage: result.error
        })
        throw new Error(result.error || 'Failed to fetch dashboard history')
      }
      
      const data = result.data as DashboardHistoryResponse
      
      if (process.env.NODE_ENV === 'development') {
        historyLogger.debug('Dashboard history fetched successfully', {
          historyLength: data?.history?.length || 0,
          total: data?.total || 0,
          hasData: !!data
        })
      }
      
      return data
    },
    enabled: isClient, // Only enable on client-side
    staleTime: 0, // Force fresh data
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    retry: 1
  })

  // Monitor data changes with enterprise logging
  useEffect(() => {
    const historyLogger = createComponentLogger('useDashboardHistory')
    
    if (process.env.NODE_ENV === 'development') {
      historyLogger.debug('Dashboard history state changed', {
        hasHistory: !!history,
        isLoading,
        hasError: !!error,
        historyCount: history?.history?.length || 0,
        isClient
      })
    }
    
    if (error) {
      historyLogger.error('Dashboard history error', error, {
        errorMessage: error.message,
        isClient
      })
    }
  }, [history, isLoading, error, isClient])

  const exportHistory = useCallback(() => {
    if (!history?.history) return

    const dataStr = JSON.stringify(history.history, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    
    const link = document.createElement('a')
    link.href = url
    link.download = `dashboard-history-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    URL.revokeObjectURL(url)
    toast.success('Dashboard history exported successfully')
  }, [history])

  // Add function to save new activity
  const saveActivity = useCallback(async (activity: {
    title: string
    description?: string
    data?: Record<string, unknown>
    changeType?: 'create' | 'update' | 'delete' | 'view' | 'export'
    showToast?: boolean // Add optional flag to control toast display
  }) => {
    try {
      const result = await saveDashboardActivity(activity)
      if (result.success) {
        // Refresh history after saving
        refetch()
        
        // Only show toast for non-view activities or when explicitly requested
        if (activity.showToast || (activity.changeType && activity.changeType !== 'view')) {
          toast.success('Activity logged successfully')
        }
      }
    } catch (error) {
      const historyLogger = createComponentLogger('useDashboardHistory')
      historyLogger.error('Failed to save dashboard activity', error as Error, {
        activity: activity.title
      })
      toast.error('Failed to log activity')
    }
  }, [refetch])

  const returnValue = {
    history: isClient ? history : null,
    isLoading: isClient ? isLoading : true,
    error: isClient ? error : null,
    refetch,
    exportHistory,
    saveActivity
  }
  
  // Enterprise logging for hook return
  if (process.env.NODE_ENV === 'development') {
    const historyLogger = createComponentLogger('useDashboardHistory')
    historyLogger.debug('Dashboard history hook returning', {
      hasHistory: !!history,
      isLoading,
      hasError: !!error,
      historyCount: history?.history?.length || 0,
      isClient
    })
  }

  return returnValue
}

// Export AI Forecasting hook
export { useAIForecasting } from './useAIForecasting'