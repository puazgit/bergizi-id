// Redis Debug Component for Development
// src/components/debug/RedisDebugPanel.tsx

'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { RefreshCw, Activity, Database, Zap } from 'lucide-react'

interface PubSubTestResult {
  success: boolean
  channelsTested: string[]
  results: Array<{
    channel: string
    published: boolean
    subscriberCount: number
    error?: string
  }>
}

interface RedisDebugInfo {
  isConnected: boolean
  redisInfo: {
    version: string
    memory: string
    clients: string
    uptime: string
  }
  channels: string[]
  sppgData: {
    sppgId: string
    activeConnections: number
    lastActivity: string
  }
  pubSubTest?: PubSubTestResult
  productionData?: Record<string, unknown>
  timestamp: string
}

export function RedisDebugPanel() {
  const { data: session } = useSession()
  const [debugInfo, setDebugInfo] = useState<RedisDebugInfo | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchDebugInfo = useCallback(async (testPubSub = false) => {
    if (!session?.user?.sppgId) return

    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        sppgId: session.user.sppgId,
        ...(testPubSub && { testPubSub: 'true' })
      })

      const response = await fetch(`/api/debug/redis?${params}`)
      const result = await response.json()

      if (result.success) {
        setDebugInfo(result.data)
      } else {
        setError(result.error || 'Failed to fetch Redis debug info')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error')
    } finally {
      setLoading(false)
    }
  }, [session?.user?.sppgId])

  // Auto-refresh every 10 seconds
  useEffect(() => {
    if (session?.user?.sppgId) {
      fetchDebugInfo()
      const interval = setInterval(() => fetchDebugInfo(), 10000)
      return () => clearInterval(interval)
    }
  }, [session?.user?.sppgId, fetchDebugInfo])

  if (!session?.user?.sppgId) {
    return (
      <Card className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950/20">
        <CardContent className="pt-6">
          <p className="text-yellow-800 dark:text-yellow-200">
            Redis Debug: No SPPG ID found in session
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-blue-900 dark:text-blue-100">
            <Database className="h-5 w-5" />
            Redis Debug Panel
            {debugInfo?.isConnected && (
              <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                <Activity className="h-3 w-3 mr-1" />
                Connected
              </Badge>
            )}
          </CardTitle>
          <div className="flex gap-2">
            <Button
              onClick={() => fetchDebugInfo(true)}
              disabled={loading}
              size="sm"
              variant="outline"
              className="border-blue-300 text-blue-700 hover:bg-blue-100"
            >
              <Zap className="h-4 w-4 mr-1" />
              Test Pub/Sub
            </Button>
            <Button
              onClick={() => fetchDebugInfo()}
              disabled={loading}
              size="sm"
              variant="outline"
              className="border-blue-300 text-blue-700 hover:bg-blue-100"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {error && (
          <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded dark:bg-red-950/20 dark:border-red-800 dark:text-red-200">
            <strong>Error:</strong> {error}
          </div>
        )}

        {debugInfo && (
          <>
            {/* Connection Status */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {debugInfo.isConnected ? '✓' : '✗'}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Connection</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {debugInfo.redisInfo.clients}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Clients</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {debugInfo.channels.length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Channels</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {debugInfo.sppgData.activeConnections}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">SPPG Connections</div>
              </div>
            </div>

            <Separator />

            {/* SPPG Info */}
            <div>
              <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">SPPG Info</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">SPPG ID:</span>
                  <span className="ml-2 font-mono bg-gray-100 px-2 py-1 rounded dark:bg-gray-800">
                    {debugInfo.sppgData.sppgId}
                  </span>
                </div>
                <div>
                  <span className="font-medium">Last Activity:</span>
                  <span className="ml-2">{debugInfo.sppgData.lastActivity}</span>
                </div>
              </div>
            </div>

            {/* Pub/Sub Test Result */}
            {debugInfo.pubSubTest && typeof debugInfo.pubSubTest === 'object' && 'success' in debugInfo.pubSubTest && (
              <>
                <Separator />
                <div>
                  <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Pub/Sub Test Results</h4>
                  
                  {/* Overall Status */}
                  <div className="mb-3">
                    <Badge 
                      variant={debugInfo.pubSubTest.success ? "default" : "destructive"}
                      className="text-sm"
                    >
                      {debugInfo.pubSubTest.success ? '✓ All Channels Working' : '✗ Some Channels Failed'}
                    </Badge>
                  </div>

                  {/* Detailed Results */}
                  {debugInfo.pubSubTest.results && (
                    <div className="space-y-2">
                      {debugInfo.pubSubTest.results.map((result, index: number) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded dark:bg-gray-800">
                          <div className="flex items-center space-x-2">
                            <Badge variant={result.published ? "secondary" : "destructive"} className="text-xs">
                              {result.published ? '✓' : '✗'}
                            </Badge>
                            <span className="text-sm font-mono">{result.channel}</span>
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">
                            {result.published ? `${result.subscriberCount} subscribers` : result.error}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Production Data */}
            {debugInfo.productionData && Object.keys(debugInfo.productionData).length > 0 && (
              <>
                <Separator />
                <div>
                  <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Production Data</h4>
                  <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded text-sm font-mono">
                    <pre className="whitespace-pre-wrap">
                      {JSON.stringify(debugInfo.productionData, null, 2)}
                    </pre>
                  </div>
                </div>
              </>
            )}

            {/* Channels */}
            {debugInfo.channels.length > 0 && (
              <>
                <Separator />
                <div>
                  <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Active Channels</h4>
                  <div className="flex flex-wrap gap-2">
                    {debugInfo.channels.map((channel, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {channel}
                      </Badge>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Timestamp */}
            <div className="text-xs text-gray-500 dark:text-gray-400 text-right">
              Last updated: {new Date(debugInfo.timestamp).toLocaleString()}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}