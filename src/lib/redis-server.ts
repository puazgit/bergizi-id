// Server-only Redis Client
// This file should only be imported in server-side code
// src/lib/redis-server.ts

// Conditional import to avoid client-side bundling
let redisClient: unknown = null

export async function getRedisClient() {
  if (typeof window !== 'undefined') {
    throw new Error('Redis client can only be used on server-side')
  }
  
  if (!redisClient) {
    const { redis } = await import('@/lib/redis')
    redisClient = redis
  }
  
  return redisClient
}

export const CACHE_TTL = {
  SHORT: 60 * 5,        // 5 minutes
  MEDIUM: 60 * 30,      // 30 minutes  
  LONG: 60 * 60 * 2,    // 2 hours
  DAY: 60 * 60 * 24,    // 24 hours
  WEEK: 60 * 60 * 24 * 7, // 7 days
} as const