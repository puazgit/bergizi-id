'use client'

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { toast } from 'sonner'
import { subscribeToDashboardUpdates } from '@/actions/sppg/dashboard'

interface DashboardSubscriptionContextType {
  isSubscribed: boolean
  subscriptionError: string | null
  connectionStatus: 'connected' | 'disconnected' | 'error' | 'connecting'
  lastUpdate: string | null
  isConnecting: boolean
  retryCount: number
  subscribe: () => Promise<void>
  unsubscribe: () => void
  retryConnection: () => Promise<void>
}

const DashboardSubscriptionContext = createContext<DashboardSubscriptionContextType | null>(null)

interface DashboardSubscriptionProviderProps {
  children: React.ReactNode
}

export const DashboardSubscriptionProvider: React.FC<DashboardSubscriptionProviderProps> = ({ 
  children 
}) => {
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [subscriptionError, setSubscriptionError] = useState<string | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'error' | 'connecting'>('disconnected')
  const [lastUpdate, setLastUpdate] = useState<string | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [retryCount, setRetryCount] = useState(0)

  const subscribe = useCallback(async () => {
    if (isSubscribed || isConnecting) return // Prevent duplicate subscriptions

    const maxRetries = 3
    const retryDelays = [1000, 2000, 5000] // Exponential backoff

    try {
      setIsConnecting(true)
      setSubscriptionError(null)
      setConnectionStatus('connecting')
      
      await subscribeToDashboardUpdates()
      
      setIsSubscribed(true)
      setConnectionStatus('connected')
      setLastUpdate(new Date().toISOString())
      setRetryCount(0) // Reset retry count on successful connection
      toast.success('Connected to real-time dashboard updates')
    } catch (error) {
      console.error('Subscription failed:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown connection error'
      setSubscriptionError(`Failed to subscribe: ${errorMessage}`)
      setConnectionStatus('error')
      
      // Auto-retry with exponential backoff
      if (retryCount < maxRetries) {
        const delay = retryDelays[retryCount] || 5000
        toast.warning(`Connection failed. Retrying in ${delay/1000} seconds...`)
        
        setTimeout(() => {
          setRetryCount(prev => {
            const newCount = prev + 1
            // Recursive call for retry - this is intentional for exponential backoff
            if (newCount <= maxRetries) {
              subscribe()
            }
            return newCount
          })
        }, delay)
      } else {
        toast.error('Failed to connect to real-time updates. Please try again manually.')
      }
    } finally {
      setIsConnecting(false)
    }
  }, [isSubscribed, isConnecting, retryCount])

  const unsubscribe = useCallback(() => {
    if (!isSubscribed) return // Prevent duplicate unsubscriptions

    setIsSubscribed(false)
    setSubscriptionError(null)
    setConnectionStatus('disconnected')
    setLastUpdate(null)
    setIsConnecting(false)
    setRetryCount(0) // Reset retry count
    toast.info('Disconnected from real-time updates')
  }, [isSubscribed])

  const retryConnection = useCallback(async () => {
    setRetryCount(0) // Reset retry count for manual retry
    await subscribe()
  }, [subscribe])

  // Simulate periodic updates when connected
  useEffect(() => {
    if (!isSubscribed || connectionStatus !== 'connected') return

    const interval = setInterval(() => {
      setLastUpdate(new Date().toISOString())
    }, 30000) // Update every 30 seconds

    return () => clearInterval(interval)
  }, [isSubscribed, connectionStatus])

  const value: DashboardSubscriptionContextType = {
    isSubscribed,
    subscriptionError,
    connectionStatus,
    lastUpdate,
    isConnecting,
    retryCount,
    subscribe,
    unsubscribe,
    retryConnection
  }

  return (
    <DashboardSubscriptionContext.Provider value={value}>
      {children}
    </DashboardSubscriptionContext.Provider>
  )
}

export const useDashboardSubscriptionsContext = (): DashboardSubscriptionContextType => {
  const context = useContext(DashboardSubscriptionContext)
  if (!context) {
    throw new Error('useDashboardSubscriptionsContext must be used within DashboardSubscriptionProvider')
  }
  return context
}