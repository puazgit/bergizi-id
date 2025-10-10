/**
 * Connection Health Monitoring Hook
 * Enterprise-grade connection monitoring with retry logic
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'

interface ConnectionHealth {
  isOnline: boolean
  latency: number | null
  lastCheck: string | null
  status: 'healthy' | 'degraded' | 'offline'
}

export const useConnectionHealth = () => {
  const [health, setHealth] = useState<ConnectionHealth>({
    isOnline: navigator?.onLine ?? true,
    latency: null,
    lastCheck: null,
    status: 'healthy'
  })

  const checkConnection = useCallback(async () => {
    const startTime = Date.now()
    
    try {
      // Use a lightweight endpoint for health checking
      const response = await fetch('/api/system/ping', {
        method: 'HEAD',
        cache: 'no-cache',
        signal: AbortSignal.timeout(5000) // 5 second timeout
      })
      
      const latency = Date.now() - startTime
      const isHealthy = response.ok && latency < 1000 // Less than 1 second
      
      setHealth({
        isOnline: true,
        latency,
        lastCheck: new Date().toISOString(),
        status: isHealthy ? 'healthy' : 'degraded'
      })
    } catch (error) {
      console.warn('Connection health check failed:', error)
      setHealth({
        isOnline: false,
        latency: null,
        lastCheck: new Date().toISOString(),
        status: 'offline'
      })
    }
  }, [])

  // Monitor online/offline events
  useEffect(() => {
    const handleOnline = () => {
      setHealth(prev => ({ ...prev, isOnline: true }))
      checkConnection()
      toast.success('Connection restored')
    }

    const handleOffline = () => {
      setHealth(prev => ({ ...prev, isOnline: false, status: 'offline' }))
      toast.warning('Connection lost')
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Initial check
    checkConnection()

    // Periodic health checks
    const interval = setInterval(checkConnection, 30000) // Every 30 seconds

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      clearInterval(interval)
    }
  }, [checkConnection])

  return {
    ...health,
    checkConnection
  }
}