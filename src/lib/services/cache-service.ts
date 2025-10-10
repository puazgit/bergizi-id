// Caching Service
// Multi-tenant data caching with Redis
// src/lib/services/cache-service.ts

import { redis, CACHE_TTL, generateCacheKey } from '@/lib/redis'

// Cache entry metadata
export interface CacheEntry<T = unknown> {
  data: T
  createdAt: Date
  expiresAt: Date
  version: number
  sppgId?: string
  tags: string[]
}

// Cache options
export interface CacheOptions {
  ttl?: number
  tags?: string[]
  version?: number
  compress?: boolean
}

// Cache statistics
export interface CacheStats {
  totalKeys: number
  hitRate: number
  missRate: number
  memoryUsage: string
  expiredKeys: number
}

class CacheService {
  private static instance: CacheService
  private hitCount = 0
  private missCount = 0

  private constructor() {}

  public static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService()
    }
    return CacheService.instance
  }

  // Generic cache set method
  public async set<T>(
    key: string,
    data: T,
    sppgId?: string,
    options: CacheOptions = {}
  ): Promise<boolean> {
    try {
      const {
        ttl = CACHE_TTL.MEDIUM,
        tags = [],
        version = 1,
      } = options

      const cacheEntry: CacheEntry<T> = {
        data,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + (ttl * 1000)),
        version,
        sppgId,
        tags,
      }

      // Generate namespaced key
      const cacheKey = sppgId 
        ? generateCacheKey('cache', sppgId, key)
        : `cache:global:${key}`

      const success = await redis.set(cacheKey, cacheEntry, ttl)

      if (success && tags.length > 0) {
        // Index by tags for invalidation
        for (const tag of tags) {
          const tagKey = sppgId 
            ? generateCacheKey('tag', sppgId, tag)
            : `tag:global:${tag}`
          await redis.sadd(tagKey, cacheKey)
          await redis.getClient().expire(tagKey, ttl + 3600) // Tag lives longer
        }
      }

      return success

    } catch (error) {
      console.error(`❌ Cache SET error for key ${key}:`, error)
      return false
    }
  }

  // Generic cache get method
  public async get<T>(key: string, sppgId?: string): Promise<T | null> {
    try {
      const cacheKey = sppgId 
        ? generateCacheKey('cache', sppgId, key)
        : `cache:global:${key}`

      const cacheEntry = await redis.get<CacheEntry<T>>(cacheKey)

      if (!cacheEntry) {
        this.missCount++
        return null
      }

      // Check if expired
      const now = new Date()
      const expiresAt = new Date(cacheEntry.expiresAt)
      
      if (now > expiresAt) {
        await redis.del(cacheKey)
        this.missCount++
        return null
      }

      this.hitCount++
      return cacheEntry.data

    } catch (error) {
      console.error(`❌ Cache GET error for key ${key}:`, error)
      this.missCount++
      return null
    }
  }

  // Domain-specific cache methods

  // Menu caching
  public async setMenus(sppgId: string, menus: unknown[], options: CacheOptions = {}): Promise<boolean> {
    return this.set('menus', menus, sppgId, {
      ttl: CACHE_TTL.MEDIUM,
      tags: ['menus', 'sppg-data'],
      ...options,
    })
  }

  public async getMenus<T>(sppgId: string): Promise<T | null> {
    return this.get<T>('menus', sppgId)
  }

  public async setMenu(sppgId: string, menuId: string, menu: unknown, options: CacheOptions = {}): Promise<boolean> {
    return this.set(`menu:${menuId}`, menu, sppgId, {
      ttl: CACHE_TTL.LONG,
      tags: ['menu', 'sppg-data'],
      ...options,
    })
  }

  public async getMenu<T>(sppgId: string, menuId: string): Promise<T | null> {
    return this.get<T>(`menu:${menuId}`, sppgId)
  }

  // Procurement caching
  public async setProcurements(sppgId: string, procurements: unknown[], options: CacheOptions = {}): Promise<boolean> {
    return this.set('procurements', procurements, sppgId, {
      ttl: CACHE_TTL.SHORT,
      tags: ['procurement', 'sppg-data'],
      ...options,
    })
  }

  public async getProcurements<T>(sppgId: string): Promise<T | null> {
    return this.get<T>('procurements', sppgId)
  }

  // Production caching
  public async setProductions(sppgId: string, productions: unknown[], options: CacheOptions = {}): Promise<boolean> {
    return this.set('productions', productions, sppgId, {
      ttl: CACHE_TTL.SHORT,
      tags: ['production', 'sppg-data'],
      ...options,
    })
  }

  public async getProductions<T>(sppgId: string): Promise<T | null> {
    return this.get<T>('productions', sppgId)
  }

  // Inventory caching
  public async setInventory(sppgId: string, inventory: unknown[], options: CacheOptions = {}): Promise<boolean> {
    return this.set('inventory', inventory, sppgId, {
      ttl: CACHE_TTL.SHORT,
      tags: ['inventory', 'sppg-data'],
      ...options,
    })
  }

  public async getInventory<T>(sppgId: string): Promise<T | null> {
    return this.get<T>('inventory', sppgId)
  }

  // Distribution caching
  public async setDistributions(sppgId: string, distributions: unknown[], options: CacheOptions = {}): Promise<boolean> {
    return this.set('distributions', distributions, sppgId, {
      ttl: CACHE_TTL.SHORT,
      tags: ['distribution', 'sppg-data'],
      ...options,
    })
  }

  public async getDistributions<T>(sppgId: string): Promise<T | null> {
    return this.get<T>('distributions', sppgId)
  }

  // HRD caching
  public async setEmployees(sppgId: string, employees: unknown[], options: CacheOptions = {}): Promise<boolean> {
    return this.set('employees', employees, sppgId, {
      ttl: CACHE_TTL.LONG,
      tags: ['hrd', 'employees', 'sppg-data'],
      ...options,
    })
  }

  public async getEmployees<T>(sppgId: string): Promise<T | null> {
    return this.get<T>('employees', sppgId)
  }

  // SPPG metadata caching
  public async setSppgData(sppgId: string, data: unknown, options: CacheOptions = {}): Promise<boolean> {
    return this.set('metadata', data, sppgId, {
      ttl: CACHE_TTL.DAY,
      tags: ['sppg', 'metadata'],
      ...options,
    })
  }

  public async getSppgData<T>(sppgId: string): Promise<T | null> {
    return this.get<T>('metadata', sppgId)
  }

  // Cache invalidation methods

  // Invalidate by key
  public async invalidate(key: string, sppgId?: string): Promise<boolean> {
    try {
      const cacheKey = sppgId 
        ? generateCacheKey('cache', sppgId, key)
        : `cache:global:${key}`

      return await redis.del(cacheKey)

    } catch (error) {
      console.error(`❌ Cache invalidation error for key ${key}:`, error)
      return false
    }
  }

  // Invalidate by tag
  public async invalidateByTag(tag: string, sppgId?: string): Promise<number> {
    try {
      const tagKey = sppgId 
        ? generateCacheKey('tag', sppgId, tag)
        : `tag:global:${tag}`

      const keys = await redis.smembers(tagKey)
      let invalidated = 0

      for (const key of keys) {
        const success = await redis.del(key)
        if (success) invalidated++
      }

      // Clean up tag index
      await redis.del(tagKey)

      console.log(`🧹 Invalidated ${invalidated} cache entries with tag: ${tag}`)
      return invalidated

    } catch (error) {
      console.error(`❌ Cache invalidation by tag error for ${tag}:`, error)
      return 0
    }
  }

  // Invalidate all SPPG cache
  public async invalidateSppgCache(sppgId: string): Promise<number> {
    try {
      const pattern = `cache:*:${sppgId}:*`
      const keys = await redis.getClient().keys(pattern)
      
      let invalidated = 0
      for (const key of keys) {
        const success = await redis.del(key)
        if (success) invalidated++
      }

      // Also clean up tag indexes
      const tagPattern = `tag:*:${sppgId}:*`
      const tagKeys = await redis.getClient().keys(tagPattern)
      
      for (const tagKey of tagKeys) {
        await redis.del(tagKey)
      }

      console.log(`🧹 Invalidated ${invalidated} cache entries for SPPG: ${sppgId}`)
      return invalidated

    } catch (error) {
      console.error(`❌ SPPG cache invalidation error for ${sppgId}:`, error)
      return 0
    }
  }

  // Cache warming methods

  // Warm up menu cache
  public async warmMenuCache(sppgId: string, menuLoader: () => Promise<unknown[]>): Promise<boolean> {
    try {
      const menus = await menuLoader()
      return await this.setMenus(sppgId, menus)
    } catch (error) {
      console.error(`❌ Menu cache warming error for SPPG ${sppgId}:`, error)
      return false
    }
  }

  // Warm up procurement cache
  public async warmProcurementCache(sppgId: string, procurementLoader: () => Promise<unknown[]>): Promise<boolean> {
    try {
      const procurements = await procurementLoader()
      return await this.setProcurements(sppgId, procurements)
    } catch (error) {
      console.error(`❌ Procurement cache warming error for SPPG ${sppgId}:`, error)
      return false
    }
  }

  // Cache statistics and monitoring

  // Get cache hit rate
  public getHitRate(): number {
    const total = this.hitCount + this.missCount
    return total > 0 ? (this.hitCount / total) * 100 : 0
  }

  // Get cache statistics
  public async getCacheStats(): Promise<CacheStats> {
    try {
      const info = await redis.getClient().info('memory')
      
      const cacheKeys = await redis.getClient().keys('cache:*')
      
      return {
        totalKeys: cacheKeys.length,
        hitRate: this.getHitRate(),
        missRate: 100 - this.getHitRate(),
        memoryUsage: this.extractMemoryUsage(info),
        expiredKeys: 0, // Would need to implement tracking
      }

    } catch (error) {
      console.error('❌ Error getting cache stats:', error)
      return {
        totalKeys: 0,
        hitRate: 0,
        missRate: 0,
        memoryUsage: '0B',
        expiredKeys: 0,
      }
    }
  }

  // Reset statistics
  public resetStats(): void {
    this.hitCount = 0
    this.missCount = 0
  }

  // Utility methods
  private extractMemoryUsage(info: string): string {
    const lines = info.split('\r\n')
    const usedMemoryLine = lines.find(line => line.startsWith('used_memory_human:'))
    return usedMemoryLine ? usedMemoryLine.split(':')[1] : '0B'
  }

  // Cache health check
  public async healthCheck(): Promise<{
    isConnected: boolean
    responseTime: number
    cacheSize: number
  }> {
    try {
      const start = Date.now()
      const pong = await redis.ping()
      const responseTime = Date.now() - start
      
      const keys = await redis.getClient().keys('cache:*')
      
      return {
        isConnected: pong,
        responseTime,
        cacheSize: keys.length,
      }

    } catch (error) {
      console.error('❌ Cache health check error:', error)
      return {
        isConnected: false,
        responseTime: -1,
        cacheSize: 0,
      }
    }
  }
}

// Export singleton instance
export const cacheService = CacheService.getInstance()

// Types are already exported at declaration