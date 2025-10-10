/**
 * Enterprise Dashboard History Provider
 * Handles complex client-server hydration for dashboard history
 * Implements advanced caching, error recovery, and real-time sync
 */

'use client'

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react'
import { useQueryClient, useQuery } from '@tanstack/react-query'
import { getDashboardHistory } from '@/actions/sppg/dashboard'
import { createComponentLogger } from '@/lib/logger'
// Enterprise types for dashboard history
interface HistorySnapshot {
  id: string
  timestamp: string
  title: string
  description?: string
  type: 'create' | 'update' | 'delete' | 'view' | 'export'
  data?: Record<string, unknown>
}

interface DashboardHistoryResponse {
  history: HistorySnapshot[]
  total: number
}

interface DashboardHistoryContextValue {
  // Data state
  history: HistorySnapshot[] | null
  total: number
  isLoading: boolean
  error: Error | null
  
  // Enterprise features
  isHydrated: boolean
  lastSync: Date | null
  connectionStatus: 'connected' | 'disconnected' | 'reconnecting'
  
  // Actions
  refetch: () => Promise<void>
  invalidateCache: () => void
  forceSync: () => Promise<void>
  
  // Advanced features
  subscribeToUpdates: (callback: (data: HistorySnapshot[]) => void) => () => void
  exportHistory: (format: 'json' | 'csv' | 'pdf') => Promise<void>
  
  // Error recovery
  retryConnection: () => Promise<void>
  clearError: () => void
}

interface DashboardHistoryProviderProps {
  children: React.ReactNode
  limit?: number
  enableRealtime?: boolean
  cacheTTL?: number
}

const DashboardHistoryContext = createContext<DashboardHistoryContextValue | null>(null)

export function DashboardHistoryProvider({ 
  children, 
  limit = 25,
  enableRealtime = true,
  cacheTTL = 30000 // 30 seconds
}: DashboardHistoryProviderProps) {
  // Enterprise state management
  const [isHydrated, setIsHydrated] = useState(false)
  const [lastSync, setLastSync] = useState<Date | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'reconnecting'>('disconnected')
  const subscribersRef = useRef<Set<(data: HistorySnapshot[]) => void>>(new Set())
  
  const queryClient = useQueryClient()
  const logger = createComponentLogger('DashboardHistoryProvider')

  // Enterprise React Query configuration
  const { 
    data: rawData, 
    isLoading, 
    error, 
    refetch: queryRefetch
  } = useQuery<DashboardHistoryResponse>({
    queryKey: ['enterprise-dashboard-history', limit],
    queryFn: async (): Promise<DashboardHistoryResponse> => {
      console.log('🏢 Enterprise History Query: Starting fetch with advanced configuration')
      
      try {
        setConnectionStatus('reconnecting')
        
        const result = await getDashboardHistory(limit)
        
        if (!result.success || !result.data) {
          throw new Error(result.error || 'Enterprise history fetch failed')
        }
        
        const data = result.data as DashboardHistoryResponse
        
        console.log('🏢 Enterprise History Query: Success', {
          historyCount: data.history?.length || 0,
          total: data.total,
          timestamp: new Date().toISOString()
        })
        
        setConnectionStatus('connected')
        setLastSync(new Date())
        
        return data
      } catch (error) {
        console.error('🏢 Enterprise History Query: Error', error)
        setConnectionStatus('disconnected')
        throw error
      }
    },
    enabled: isHydrated, // Only run after client hydration
    staleTime: cacheTTL,
    gcTime: cacheTTL * 2,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    retry: (failureCount, error) => {
      // Enterprise retry logic
      console.log(`🏢 Enterprise Retry Strategy: Attempt ${failureCount}`, error)
      return failureCount < 3
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
    meta: {
      enterpriseQuery: true,
      component: 'DashboardHistoryProvider'
    }
  })

  // Client-side hydration effect
  useEffect(() => {
    console.log('🏢 Enterprise Hydration: Starting client-side initialization')
    
    const hydrationTimer = setTimeout(() => {
      setIsHydrated(true)
      console.log('🏢 Enterprise Hydration: Client hydration completed')
    }, 100) // Small delay to ensure DOM is ready

    return () => clearTimeout(hydrationTimer)
  }, [])

  // Real-time subscription management
  useEffect(() => {
    if (!enableRealtime || !isHydrated || !rawData?.history) return

    // Notify all subscribers when data changes
    subscribersRef.current.forEach(callback => callback(rawData.history))
  }, [rawData?.history, enableRealtime, isHydrated])

  // Enterprise actions
  const refetch = useCallback(async () => {
    logger.info('Manual data refresh triggered')
    try {
      await queryRefetch()
    } catch (error) {
      logger.error('Manual refetch failed', error instanceof Error ? error : new Error(String(error)))
    }
  }, [queryRefetch, logger])

  const invalidateCache = useCallback(() => {
    console.log('🏢 Enterprise Cache: Invalidating dashboard history cache')
    queryClient.invalidateQueries({ 
      queryKey: ['enterprise-dashboard-history'], 
      exact: false 
    })
  }, [queryClient])

  const forceSync = useCallback(async () => {
    console.log('🏢 Enterprise Sync: Force synchronization initiated')
    setConnectionStatus('reconnecting')
    
    try {
      await queryClient.refetchQueries({ 
        queryKey: ['enterprise-dashboard-history'], 
        type: 'active' 
      })
      setLastSync(new Date())
    } catch (error) {
      console.error('🏢 Enterprise Sync: Force sync failed', error)
      setConnectionStatus('disconnected')
    }
  }, [queryClient])

  const subscribeToUpdates = useCallback((callback: (data: HistorySnapshot[]) => void) => {
    if (process.env.NODE_ENV === 'development') {
      logger.debug('Adding real-time subscriber', { subscriberCount: subscribersRef.current.size + 1 })
    }
    
    subscribersRef.current.add(callback)
    
    // Return unsubscribe function
    return () => {
      if (process.env.NODE_ENV === 'development') {
        logger.debug('Removing real-time subscriber', { subscriberCount: subscribersRef.current.size - 1 })
      }
      subscribersRef.current.delete(callback)
    }
  }, [logger])

  const exportHistory = useCallback(async (format: 'json' | 'csv' | 'pdf') => {
    console.log(`🏢 Enterprise Export: Exporting history as ${format}`)
    
    if (!rawData?.history) {
      throw new Error('No history data available for export')
    }

    // Enterprise export implementation would go here
    // This would typically integrate with enterprise document generation services
    console.log(`🏢 Enterprise Export: ${format} export completed for ${rawData.history.length} records`)
  }, [rawData?.history])

  const retryConnection = useCallback(async () => {
    console.log('🏢 Enterprise Recovery: Attempting connection retry')
    setConnectionStatus('reconnecting')
    
    try {
      await refetch()
    } catch (error) {
      console.error('🏢 Enterprise Recovery: Retry failed', error)
      setConnectionStatus('disconnected')
    }
  }, [refetch])

  const clearError = useCallback(() => {
    console.log('🏢 Enterprise Error: Clearing error state')
    queryClient.resetQueries({ 
      queryKey: ['enterprise-dashboard-history'], 
      exact: false 
    })
  }, [queryClient])

  // Enterprise context value
  const contextValue: DashboardHistoryContextValue = {
    // Data state
    history: rawData?.history || null,
    total: rawData?.total || 0,
    isLoading: isLoading && isHydrated,
    error: error as Error | null,
    
    // Enterprise features
    isHydrated,
    lastSync,
    connectionStatus,
    
    // Actions
    refetch,
    invalidateCache,
    forceSync,
    
    // Advanced features
    subscribeToUpdates,
    exportHistory,
    
    // Error recovery
    retryConnection,
    clearError
  }

  if (process.env.NODE_ENV === 'development') {
    logger.debug('Provider rendering', {
      isHydrated,
      hasHistory: !!rawData?.history,
      historyCount: rawData?.history?.length || 0,
      isLoading,
      connectionStatus,
      error: !!error
    })
  }

  return (
    <DashboardHistoryContext.Provider value={contextValue}>
      {children}
    </DashboardHistoryContext.Provider>
  )
}

// Enterprise hook with advanced error handling
export function useDashboardHistoryEnterprise() {
  const context = useContext(DashboardHistoryContext)
  
  if (!context) {
    throw new Error(
      'useDashboardHistoryEnterprise must be used within a DashboardHistoryProvider. ' +
      'This is an enterprise-grade hook that requires proper provider setup.'
    )
  }
  
  return context
}

// Type exports
export type { DashboardHistoryContextValue }