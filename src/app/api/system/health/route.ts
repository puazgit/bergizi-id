/**
 * System Health API Endpoint
 * Enterprise-Grade System Monitoring
 * Bergizi-ID SaaS Platform - Phase 1 Implementation
 */

import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { redis } from '@/lib/redis'
import prisma from '@/lib/db'

const db = prisma

interface SystemHealthResponse {
  overall: 'HEALTHY' | 'WARNING' | 'CRITICAL'
  database: 'CONNECTED' | 'SLOW' | 'DISCONNECTED'
  redis: 'CONNECTED' | 'SLOW' | 'DISCONNECTED'
  apis: 'RESPONSIVE' | 'SLOW' | 'TIMEOUT'
  uptime: number
  responseTime: number
  errorRate: number
  lastCheck: string
  details?: {
    database: {
      connectionCount: number
      queryTime: number
      status: string
    }
    redis: {
      memory: string
      connectedClients: number
      status: string
    }
    system: {
      memory: number
      cpu: number
      disk: number
    }
  }
}

// Cache system health for 10 seconds to prevent excessive checks
const HEALTH_CACHE_KEY = 'system:health:status'
const HEALTH_CACHE_TTL = 10

/**
 * Test database connection and performance
 */
async function testDatabase(): Promise<{
  status: 'CONNECTED' | 'SLOW' | 'DISCONNECTED'
  queryTime: number
  connectionCount: number
}> {
  try {
    const startTime = Date.now()
    
    // Test basic connectivity
    await db.$queryRaw`SELECT 1 as test`
    
    // Get connection info
    const connectionInfo = await db.$queryRaw`
      SELECT 
        count(*) as connection_count,
        current_database() as database_name
      FROM pg_stat_activity 
      WHERE state = 'active'
    ` as Array<{ connection_count: bigint; database_name: string }>
    
    const queryTime = Date.now() - startTime
    const connectionCount = Number(connectionInfo[0]?.connection_count || 0)
    
    let status: 'CONNECTED' | 'SLOW' | 'DISCONNECTED' = 'CONNECTED'
    if (queryTime > 1000) {
      status = 'SLOW'
    }
    
    return {
      status,
      queryTime,
      connectionCount
    }
  } catch (error) {
    console.error('Database health check failed:', error)
    return {
      status: 'DISCONNECTED',
      queryTime: 0,
      connectionCount: 0
    }
  }
}

/**
 * Test Redis connection and performance
 */
async function testRedis(): Promise<{
  status: 'CONNECTED' | 'SLOW' | 'DISCONNECTED'
  responseTime: number
  memory: string
  connectedClients: number
}> {
  try {
    const startTime = Date.now()
    
    // Test basic connectivity
    const pingResult = await redis.ping()
    const responseTime = Date.now() - startTime
    
    // Check if ping result is valid (could be 'PONG', 1, true, or 'OK')
    const stringResult = String(pingResult)
    const isValidPing = stringResult === 'PONG' || stringResult === '1' || stringResult === 'OK' || stringResult === 'true'
    if (!isValidPing) {
      throw new Error(`Redis ping failed: received ${pingResult}`)
    }
    
    // Get Redis info (simplified)
    let memory = 'N/A'
    let connectedClients = 0
    
    try {
      // Use a simple test to verify Redis functionality
      // Just set and get a simple test key
      await redis.set('health-check', '1')
      const testValue = await redis.get('health-check')
      connectedClients = testValue === '1' ? 1 : 0 // Simple connection indicator
      memory = 'Connected' // Simplified memory status
      // Clean up test key
      await redis.del('health-check')
    } catch (infoError) {
      // Redis operations might fail, continue with basic status
      console.warn('Redis extended commands not available:', infoError)
    }
    
    let status: 'CONNECTED' | 'SLOW' | 'DISCONNECTED' = 'CONNECTED'
    if (responseTime > 500) {
      status = 'SLOW'
    }
    
    return {
      status,
      responseTime,
      memory,
      connectedClients
    }
  } catch (error) {
    console.error('Redis health check failed:', error)
    return {
      status: 'DISCONNECTED',
      responseTime: 0,
      memory: 'N/A',
      connectedClients: 0
    }
  }
}

/**
 * Calculate system uptime (simplified)
 */
function calculateUptime(): number {
  // In a real implementation, this would track actual system start time
  // For now, return a reasonable uptime value
  return Math.floor(process.uptime())
}

/**
 * Calculate error rate (simplified)
 */
function calculateErrorRate(dbStatus: string, redisStatus: string): number {
  let errors = 0
  if (dbStatus === 'DISCONNECTED') errors += 50
  if (dbStatus === 'SLOW') errors += 10
  if (redisStatus === 'DISCONNECTED') errors += 30
  if (redisStatus === 'SLOW') errors += 5
  
  return Math.min(errors, 100) // Cap at 100%
}

/**
 * GET /api/system/health
 */
export async function GET() {
  try {
    // Check authentication
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Only allow platform admins and SPPG administrators to check system health
    const allowedRoles = [
      'PLATFORM_SUPERADMIN',
      'PLATFORM_SUPPORT', 
      'PLATFORM_ANALYST',
      'SPPG_KEPALA',
      'SPPG_ADMIN'
    ]
    
    if (!allowedRoles.includes(session.user.userRole)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    const startTime = Date.now()

    // Check cache first
    try {
      const cached = await redis.get(HEALTH_CACHE_KEY)
      if (cached && typeof cached === 'string') {
        const cachedData = JSON.parse(cached) as SystemHealthResponse
        // Only return cached data if it's fresh
        const cacheAge = Date.now() - new Date(cachedData.lastCheck).getTime()
        if (cacheAge < HEALTH_CACHE_TTL * 1000) {
          return NextResponse.json(cachedData)
        }
      }
    } catch (cacheError) {
      // Cache error shouldn't block health check
      console.warn('Health check cache error:', cacheError)
    }

    // Run health checks in parallel
    const [dbHealth, redisHealth] = await Promise.all([
      testDatabase(),
      testRedis()
    ])

    const totalResponseTime = Date.now() - startTime
    const uptime = calculateUptime()
    const errorRate = calculateErrorRate(dbHealth.status, redisHealth.status)

    // Determine overall system health
    let overall: 'HEALTHY' | 'WARNING' | 'CRITICAL' = 'HEALTHY'
    
    if (dbHealth.status === 'DISCONNECTED' || redisHealth.status === 'DISCONNECTED') {
      overall = 'CRITICAL'
    } else if (
      dbHealth.status === 'SLOW' || 
      redisHealth.status === 'SLOW' || 
      totalResponseTime > 2000 ||
      errorRate > 10
    ) {
      overall = 'WARNING'
    }

    // Determine API responsiveness
    let apis: 'RESPONSIVE' | 'SLOW' | 'TIMEOUT' = 'RESPONSIVE'
    if (totalResponseTime > 3000) {
      apis = 'TIMEOUT'
    } else if (totalResponseTime > 1000) {
      apis = 'SLOW'
    }

    const healthStatus: SystemHealthResponse = {
      overall,
      database: dbHealth.status,
      redis: redisHealth.status,
      apis,
      uptime,
      responseTime: totalResponseTime,
      errorRate,
      lastCheck: new Date().toISOString(),
      details: {
        database: {
          connectionCount: dbHealth.connectionCount,
          queryTime: dbHealth.queryTime,
          status: dbHealth.status
        },
        redis: {
          memory: redisHealth.memory,
          connectedClients: redisHealth.connectedClients,
          status: redisHealth.status
        },
        system: {
          memory: process.memoryUsage().heapUsed / 1024 / 1024, // MB
          cpu: 0, // Would need additional monitoring for real CPU usage
          disk: 0  // Would need additional monitoring for real disk usage
        }
      }
    }

    // Cache the result
    try {
      await redis.setex(
        HEALTH_CACHE_KEY,
        HEALTH_CACHE_TTL,
        JSON.stringify(healthStatus)
      )
    } catch (cacheError) {
      // Cache error shouldn't block response
      console.warn('Failed to cache health status:', cacheError)
    }

    // Log health check for monitoring
    console.log(`🏥 System Health Check: ${overall} (${totalResponseTime}ms)`, {
      database: dbHealth.status,
      redis: redisHealth.status,
      responseTime: totalResponseTime,
      errorRate,
      user: session.user.email
    })

    return NextResponse.json(healthStatus)

  } catch (error) {
    console.error('🚨 System health check error:', error)
    
    // Return critical status if health check fails
    const errorResponse: SystemHealthResponse = {
      overall: 'CRITICAL',
      database: 'DISCONNECTED',
      redis: 'DISCONNECTED', 
      apis: 'TIMEOUT',
      uptime: 0,
      responseTime: 0,
      errorRate: 100,
      lastCheck: new Date().toISOString()
    }

    return NextResponse.json(errorResponse, { status: 500 })
  }
}