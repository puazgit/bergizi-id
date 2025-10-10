// Redis Client Configuration
// Enterprise-grade Redis setup with connection pooling and error handling
// src/lib/redis.ts

import { Redis } from 'ioredis'

// Redis configuration interface
interface RedisConfig {
  host: string
  port: number
  password?: string
  db: number
  maxRetriesPerRequest: number
  retryDelayOnFailover: number
  connectTimeout: number
  commandTimeout: number
  lazyConnect: boolean
}

// Environment-based Redis configuration
const redisConfig: RedisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  db: parseInt(process.env.REDIS_DB || '0'),
  maxRetriesPerRequest: 3,
  retryDelayOnFailover: 100,
  connectTimeout: 10000,
  commandTimeout: 5000,
  lazyConnect: true,
}

// Redis client instance with connection pooling
class RedisClient {
  private static instance: RedisClient
  private client: Redis
  private subscriber: Redis
  private publisher: Redis
  private isConnected: boolean = false

  private constructor() {
    // Main Redis client for general operations
    this.client = new Redis(redisConfig)
    
    // Dedicated subscriber for pub/sub operations
    this.subscriber = new Redis(redisConfig)
    
    // Dedicated publisher for pub/sub operations
    this.publisher = new Redis(redisConfig)

    this.setupEventListeners()
  }

  public static getInstance(): RedisClient {
    if (!RedisClient.instance) {
      RedisClient.instance = new RedisClient()
    }
    return RedisClient.instance
  }

  private setupEventListeners(): void {
    // Main client events
    this.client.on('connect', () => {
      console.log('✅ Redis client connected')
      this.isConnected = true
    })

    this.client.on('error', (error: Error) => {
      console.error('❌ Redis client error:', error)
      this.isConnected = false
    })

    this.client.on('close', () => {
      console.log('🔌 Redis client connection closed')
      this.isConnected = false
    })

    // Subscriber events
    this.subscriber.on('connect', () => {
      console.log('✅ Redis subscriber connected')
    })

    this.subscriber.on('error', (error: Error) => {
      console.error('❌ Redis subscriber error:', error)
    })

    // Publisher events
    this.publisher.on('connect', () => {
      console.log('✅ Redis publisher connected')
    })

    this.publisher.on('error', (error: Error) => {
      console.error('❌ Redis publisher error:', error)
    })
  }

  // Connection management
  public async connect(): Promise<void> {
    try {
      await Promise.all([
        this.client.connect(),
        this.subscriber.connect(),
        this.publisher.connect()
      ])
      this.isConnected = true
      console.log('🚀 All Redis connections established')
    } catch (error) {
      console.error('💥 Failed to connect to Redis:', error)
      throw error
    }
  }

  public async disconnect(): Promise<void> {
    try {
      await Promise.all([
        this.client.quit(),
        this.subscriber.quit(),
        this.publisher.quit()
      ])
      this.isConnected = false
      console.log('👋 All Redis connections closed')
    } catch (error) {
      console.error('❌ Error closing Redis connections:', error)
      throw error
    }
  }

  public getStatus(): boolean {
    return this.isConnected
  }

  // Basic Redis operations
  public getClient(): Redis {
    return this.client
  }

  public getSubscriber(): Redis {
    return this.subscriber
  }

  public getPublisher(): Redis {
    return this.publisher
  }

  // Key-Value operations with error handling
  public async set(
    key: string, 
    value: string | number | object, 
    ttl?: number
  ): Promise<boolean> {
    try {
      const serializedValue = typeof value === 'object' 
        ? JSON.stringify(value) 
        : String(value)
      
      if (ttl) {
        await this.client.setex(key, ttl, serializedValue)
      } else {
        await this.client.set(key, serializedValue)
      }
      return true
    } catch (error) {
      console.error(`❌ Redis SET error for key ${key}:`, error)
      return false
    }
  }

  public async get<T = string>(key: string): Promise<T | null> {
    try {
      const value = await this.client.get(key)
      if (!value) return null

      // Try to parse as JSON, fallback to string
      try {
        return JSON.parse(value) as T
      } catch {
        return value as T
      }
    } catch (error) {
      console.error(`❌ Redis GET error for key ${key}:`, error)
      return null
    }
  }

  public async del(...keys: string[]): Promise<boolean> {
    try {
      const result = await this.client.del(...keys)
      return result > 0
    } catch (error) {
      console.error(`❌ Redis DEL error for keys ${keys.join(', ')}:`, error)
      return false
    }
  }

  public async keys(pattern: string): Promise<string[]> {
    try {
      return await this.client.keys(pattern)
    } catch (error) {
      console.error(`❌ Redis KEYS error for pattern ${pattern}:`, error)
      return []
    }
  }

  public async setex(key: string, seconds: number, value: string | number | object): Promise<boolean> {
    try {
      const serializedValue = typeof value === 'object' 
        ? JSON.stringify(value) 
        : String(value)
      
      await this.client.setex(key, seconds, serializedValue)
      return true
    } catch (error) {
      console.error(`❌ Redis SETEX error for key ${key}:`, error)
      return false
    }
  }

  public async exists(key: string): Promise<boolean> {
    try {
      const result = await this.client.exists(key)
      return result === 1
    } catch (error) {
      console.error(`❌ Redis EXISTS error for key ${key}:`, error)
      return false
    }
  }

  // Hash operations for complex data structures
  public async hset(key: string, field: string, value: string | object): Promise<boolean> {
    try {
      const serializedValue = typeof value === 'object' 
        ? JSON.stringify(value) 
        : String(value)
      
      await this.client.hset(key, field, serializedValue)
      return true
    } catch (error) {
      console.error(`❌ Redis HSET error for key ${key}, field ${field}:`, error)
      return false
    }
  }

  public async hget<T = string>(key: string, field: string): Promise<T | null> {
    try {
      const value = await this.client.hget(key, field)
      if (!value) return null

      try {
        return JSON.parse(value) as T
      } catch {
        return value as T
      }
    } catch (error) {
      console.error(`❌ Redis HGET error for key ${key}, field ${field}:`, error)
      return null
    }
  }

  public async hgetall<T = Record<string, string>>(key: string): Promise<T | null> {
    try {
      const hash = await this.client.hgetall(key)
      if (Object.keys(hash).length === 0) return null

      // Parse JSON values
      const parsed: Record<string, unknown> = {}
      for (const [field, value] of Object.entries(hash)) {
        try {
          parsed[field] = JSON.parse(value as string)
        } catch {
          parsed[field] = value
        }
      }

      return parsed as T
    } catch (error) {
      console.error(`❌ Redis HGETALL error for key ${key}:`, error)
      return null
    }
  }

  // List operations for queues and logs
  public async lpush(key: string, ...values: string[]): Promise<number | null> {
    try {
      return await this.client.lpush(key, ...values)
    } catch (error) {
      console.error(`❌ Redis LPUSH error for key ${key}:`, error)
      return null
    }
  }

  public async rpop(key: string): Promise<string | null> {
    try {
      return await this.client.rpop(key)
    } catch (error) {
      console.error(`❌ Redis RPOP error for key ${key}:`, error)
      return null
    }
  }

  // Set operations for unique collections
  public async sadd(key: string, ...members: string[]): Promise<number | null> {
    try {
      return await this.client.sadd(key, ...members)
    } catch (error) {
      console.error(`❌ Redis SADD error for key ${key}:`, error)
      return null
    }
  }

  public async smembers(key: string): Promise<string[]> {
    try {
      return await this.client.smembers(key)
    } catch (error) {
      console.error(`❌ Redis SMEMBERS error for key ${key}:`, error)
      return []
    }
  }

  // Pub/Sub operations for real-time features
  public async publish(channel: string, message: string | object): Promise<boolean> {
    try {
      const serializedMessage = typeof message === 'object' 
        ? JSON.stringify(message) 
        : String(message)
      
      await this.publisher.publish(channel, serializedMessage)
      return true
    } catch (error) {
      console.error(`❌ Redis PUBLISH error for channel ${channel}:`, error)
      return false
    }
  }

  public async subscribe(
    channel: string, 
    callback: (message: string, channel: string) => void
  ): Promise<boolean> {
    try {
      await this.subscriber.subscribe(channel)
      this.subscriber.on('message', callback)
      return true
    } catch (error) {
      console.error(`❌ Redis SUBSCRIBE error for channel ${channel}:`, error)
      return false
    }
  }

  // Utility methods
  public async flushdb(): Promise<boolean> {
    try {
      await this.client.flushdb()
      return true
    } catch (error) {
      console.error('❌ Redis FLUSHDB error:', error)
      return false
    }
  }

  public async ping(): Promise<boolean> {
    try {
      const result = await this.client.ping()
      return result === 'PONG'
    } catch (error) {
      console.error('❌ Redis PING error:', error)
      return false
    }
  }
}

// Export singleton instance
export const redis = RedisClient.getInstance()

// Export types for type safety
export type { Redis }

// Helper function to generate cache keys with consistent naming
export const generateCacheKey = (
  namespace: string,
  sppgId: string,
  identifier: string,
  ...params: string[]
): string => {
  const parts = ['bergizi', namespace, sppgId, identifier, ...params].filter(Boolean)
  return parts.join(':')
}

// Cache TTL constants (in seconds)
export const CACHE_TTL = {
  SHORT: 60 * 5,        // 5 minutes
  MEDIUM: 60 * 30,      // 30 minutes  
  LONG: 60 * 60 * 2,    // 2 hours
  DAY: 60 * 60 * 24,    // 24 hours
  WEEK: 60 * 60 * 24 * 7, // 7 days
} as const

// Redis key patterns for different domains
export const REDIS_KEYS = {
  // Session management
  SESSION: (sessionId: string) => `session:${sessionId}`,
  USER_SESSION: (userId: string) => `user:${userId}:sessions`,
  
  // SPPG data caching
  SPPG: (sppgId: string) => `sppg:${sppgId}`,
  SPPG_USERS: (sppgId: string) => `sppg:${sppgId}:users`,
  
  // Domain-specific caching
  MENU: (sppgId: string, menuId?: string) => 
    menuId ? `menu:${sppgId}:${menuId}` : `menu:${sppgId}:list`,
  PROCUREMENT: (sppgId: string, procurementId?: string) =>
    procurementId ? `procurement:${sppgId}:${procurementId}` : `procurement:${sppgId}:list`,
  PRODUCTION: (sppgId: string, productionId?: string) =>
    productionId ? `production:${sppgId}:${productionId}` : `production:${sppgId}:list`,
  INVENTORY: (sppgId: string, itemId?: string) =>
    itemId ? `inventory:${sppgId}:${itemId}` : `inventory:${sppgId}:list`,
  DISTRIBUTION: (sppgId: string, distributionId?: string) =>
    distributionId ? `distribution:${sppgId}:${distributionId}` : `distribution:${sppgId}:list`,
  HRD: (sppgId: string, employeeId?: string) =>
    employeeId ? `hrd:${sppgId}:${employeeId}` : `hrd:${sppgId}:list`,
    
  // Real-time channels
  CHANNEL: {
    SPPG_UPDATES: (sppgId: string) => `updates:${sppgId}`,
    PRODUCTION_STATUS: (sppgId: string) => `production:${sppgId}:status`,
    DISTRIBUTION_TRACKING: (sppgId: string) => `distribution:${sppgId}:tracking`,
    INVENTORY_ALERTS: (sppgId: string) => `inventory:${sppgId}:alerts`,
  },
} as const