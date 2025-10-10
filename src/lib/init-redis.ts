// Redis Initialization
// Initialize Redis connection on app startup
// src/lib/init-redis.ts

import { redis } from '@/lib/redis'
import { sessionService, cacheService, authSecurityService } from '@/lib/services'

let isInitialized = false

export async function initializeRedis(): Promise<boolean> {
  if (isInitialized) {
    console.log('✅ Redis already initialized')
    return true
  }

  try {
    console.log('🚀 Initializing Redis connection...')
    
    // Test Redis connection
    await redis.connect()
    
    // Test ping
    const pong = await redis.ping()
    if (!pong) {
      throw new Error('Redis ping failed')
    }
    
    console.log('✅ Redis connection established')
    
    // Test basic operations
    await testRedisOperations()
    
    // Mark as initialized
    isInitialized = true
    
    console.log('🎉 Redis initialization complete!')
    return true
    
  } catch (error) {
    console.error('❌ Redis initialization failed:', error)
    return false
  }
}

// Test Redis operations
async function testRedisOperations(): Promise<void> {
  try {
    // Test basic key-value operations
    const testKey = 'test:init'
    const testValue = { message: 'Redis is working!', timestamp: new Date() }
    
    await redis.set(testKey, testValue, 60) // 1 minute TTL
    const retrieved = await redis.get(testKey)
    
    if (!retrieved) {
      throw new Error('Failed to retrieve test value')
    }
    
    await redis.del(testKey)
    console.log('✅ Basic Redis operations working')
    
    // Test services
    await testServices()
    
  } catch (error) {
    console.error('❌ Redis operations test failed:', error)
    throw error
  }
}

// Test Redis services
async function testServices(): Promise<void> {
  try {
    // Test cache service
    await cacheService.set('test-cache', { data: 'test' }, 'test-sppg')
    const cached = await cacheService.get('test-cache', 'test-sppg')
    if (!cached) throw new Error('Cache service test failed')
    await cacheService.invalidate('test-cache', 'test-sppg')
    
    // Test auth security service
    const lockout = await authSecurityService.isAccountLocked('test@example.com')
    if (lockout !== null) throw new Error('Auth security service test failed')
    
    // Test session service health (without creating actual session)
    const stats = await sessionService.getSessionStats()
    if (typeof stats.totalActiveSessions !== 'number') {
      throw new Error('Session service test failed')
    }
    
    console.log('✅ All Redis services working')
    
  } catch (error) {
    console.error('❌ Redis services test failed:', error)
    throw error
  }
}

// Graceful shutdown
export async function shutdownRedis(): Promise<void> {
  try {
    console.log('👋 Shutting down Redis connection...')
    await redis.disconnect()
    isInitialized = false
    console.log('✅ Redis disconnected gracefully')
  } catch (error) {
    console.error('❌ Error during Redis shutdown:', error)
  }
}

// Health check function
export async function checkRedisHealth(): Promise<{
  isConnected: boolean
  responseTime: number
  services: {
    cache: boolean
    session: boolean
    security: boolean
  }
}> {
  try {
    const start = Date.now()
    const isConnected = await redis.ping()
    const responseTime = Date.now() - start
    
    // Test services health
    const cacheHealth = await cacheService.healthCheck()
    const sessionStats = await sessionService.getSessionStats()
    const securityCheck = await authSecurityService.isAccountLocked('health-check')
    
    return {
      isConnected,
      responseTime,
      services: {
        cache: cacheHealth.isConnected,
        session: typeof sessionStats.totalActiveSessions === 'number',
        security: securityCheck === null, // Should return null for non-existent account
      },
    }
    
  } catch (error) {
    console.error('❌ Redis health check failed:', error)
    return {
      isConnected: false,
      responseTime: -1,
      services: {
        cache: false,
        session: false,
        security: false,
      },
    }
  }
}

// Auto-initialize Redis when module is imported (for development)
if (process.env.NODE_ENV === 'development') {
  initializeRedis().catch(error => {
    console.error('❌ Auto Redis initialization failed:', error)
  })
}

export { redis, sessionService, cacheService, authSecurityService }