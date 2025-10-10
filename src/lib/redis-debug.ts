// Redis Debug Helper - Development Only
// src/lib/redis-debug.ts

import { redis } from '@/lib/redis'

export interface RedisDebugInfo {
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
}

/**
 * Get Redis connection and debug information
 */
export async function getRedisDebugInfo(sppgId?: string): Promise<RedisDebugInfo> {
  try {
    // Test Redis connection
    const pingResult = await redis.ping()
    const isConnected = String(pingResult) === 'PONG'

    // Get Redis server info (mock for now since ioredis might have different API)
    const redisInfo = {
      version: 'Redis Server',
      memory: 'Connected',
      clients: '1',
      uptime: Date.now().toString()
    }

    // Get active channels (simplified)
    const channels: string[] = []

    // Get SPPG-specific data if provided
    let sppgData = {
      sppgId: sppgId || 'N/A',
      activeConnections: 0,
      lastActivity: 'Never'
    }

    if (sppgId) {
      // Check for SPPG-specific channels
      const sppgChannels = channels.filter(channel => channel.includes(sppgId))
      
      // Get last activity from Redis (if stored)
      const lastActivity = await redis.get(`sppg:${sppgId}:last_activity`)
      
      sppgData = {
        sppgId,
        activeConnections: sppgChannels.length,
        lastActivity: lastActivity || 'Never'
      }
    }

    return {
      isConnected,
      redisInfo,
      channels,
      sppgData
    }

  } catch (error) {
    console.error('Redis debug error:', error)
    return {
      isConnected: false,
      redisInfo: {
        version: 'Error',
        memory: 'Error',
        clients: '0',
        uptime: '0'
      },
      channels: [],
      sppgData: {
        sppgId: sppgId || 'N/A',
        activeConnections: 0,
        lastActivity: 'Error'
      }
    }
  }
}

/**
 * Test Redis pub/sub functionality with detailed results
 */
export async function testRedisPubSub(sppgId: string): Promise<{
  success: boolean
  channelsTested: string[]
  results: Array<{
    channel: string
    published: boolean
    subscriberCount: number
    error?: string
  }>
}> {
  const channelsToTest = [
    `production:updates:${sppgId}`,
    `production:status:${sppgId}`,
    `notifications:${sppgId}`
  ]

  const results = []

  for (const channel of channelsToTest) {
    try {
      const testMessage = {
        type: 'test',
        timestamp: new Date().toISOString(),
        channel,
        sppgId,
        data: 'Redis pub/sub connectivity test'
      }

      // Publish test message
      const publishResult = await redis.publish(channel, JSON.stringify(testMessage))
      const subscriberCount = typeof publishResult === 'number' ? publishResult : 0
      
      console.log(`[Redis Test] Published to ${channel}, subscribers: ${subscriberCount}`)
      
      results.push({
        channel,
        published: true,
        subscriberCount
      })
    } catch (error) {
      console.error(`[Redis Test] Failed to publish to ${channel}:`, error)
      results.push({
        channel,
        published: false,
        subscriberCount: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }

  const success = results.every(r => r.published)
  
  return {
    success,
    channelsTested: channelsToTest,
    results
  }
}

/**
 * Get production-specific Redis data for debugging
 */
export async function getProductionRedisData(sppgId: string) {
  try {
    const keys = await redis.keys(`production:${sppgId}:*`)
    const data: Record<string, unknown> = {}

    for (const key of keys) {
      const value = await redis.get(key)
      try {
        data[key] = JSON.parse(value || '{}')
      } catch {
        data[key] = value
      }
    }

    return data
  } catch (error) {
    console.error('Error getting production Redis data:', error)
    return {}
  }
}