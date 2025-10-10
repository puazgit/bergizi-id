// Session Management Service
// Multi-tenant session management with Redis
// src/lib/services/session-service.ts

import { redis, REDIS_KEYS, CACHE_TTL } from '@/lib/redis'
import { nanoid } from 'nanoid'

// Session data interface
export interface SessionData {
  sessionId: string
  userId: string
  userRole: string
  sppgId: string | null
  userType: 'SPPG_USER' | 'PLATFORM_USER' | 'DEMO_USER'
  email: string
  name: string
  permissions: string[]
  createdAt: Date
  lastActivity: Date
  ipAddress?: string
  userAgent?: string
  expiresAt: Date
}

// Session creation input
export interface CreateSessionInput {
  userId: string
  userRole: string
  sppgId: string | null
  userType: 'SPPG_USER' | 'PLATFORM_USER' | 'DEMO_USER'
  email: string
  name: string
  permissions: string[]
  ipAddress?: string
  userAgent?: string
}

// Session activity data
export interface SessionActivity {
  sessionId: string
  userId: string
  action: string
  timestamp: Date
  ipAddress?: string
  metadata?: Record<string, unknown>
}

class SessionService {
  private static instance: SessionService

  private constructor() {}

  public static getInstance(): SessionService {
    if (!SessionService.instance) {
      SessionService.instance = new SessionService()
    }
    return SessionService.instance
  }

  // Create new session
  public async createSession(input: CreateSessionInput): Promise<SessionData | null> {
    try {
      const sessionId = nanoid(32)
      const now = new Date()
      const expiresAt = new Date(now.getTime() + (8 * 60 * 60 * 1000)) // 8 hours

      const sessionData: SessionData = {
        sessionId,
        userId: input.userId,
        userRole: input.userRole,
        sppgId: input.sppgId,
        userType: input.userType,
        email: input.email,
        name: input.name,
        permissions: input.permissions,
        createdAt: now,
        lastActivity: now,
        ipAddress: input.ipAddress,
        userAgent: input.userAgent,
        expiresAt,
      }

      // Store session data
      const sessionKey = REDIS_KEYS.SESSION(sessionId)
      const success = await redis.set(sessionKey, sessionData, CACHE_TTL.DAY)
      
      if (!success) {
        console.error('❌ Failed to create session in Redis')
        return null
      }

      // Add to user's active sessions
      const userSessionsKey = REDIS_KEYS.USER_SESSION(input.userId)
      await redis.sadd(userSessionsKey, sessionId)

      // Set TTL for user sessions set
      await redis.getClient().expire(userSessionsKey, CACHE_TTL.DAY)

      console.log(`✅ Session created: ${sessionId} for user ${input.userId}`)
      return sessionData

    } catch (error) {
      console.error('❌ Error creating session:', error)
      return null
    }
  }

  // Get session by ID
  public async getSession(sessionId: string): Promise<SessionData | null> {
    try {
      const sessionKey = REDIS_KEYS.SESSION(sessionId)
      const sessionData = await redis.get<SessionData>(sessionKey)

      if (!sessionData) {
        return null
      }

      // Check if session has expired
      const now = new Date()
      const expiresAt = new Date(sessionData.expiresAt)
      
      if (now > expiresAt) {
        // Session expired, clean it up
        await this.destroySession(sessionId)
        return null
      }

      // Update last activity
      sessionData.lastActivity = now
      await redis.set(sessionKey, sessionData, CACHE_TTL.DAY)

      return sessionData

    } catch (error) {
      console.error(`❌ Error getting session ${sessionId}:`, error)
      return null
    }
  }

  // Update session activity
  public async updateSessionActivity(
    sessionId: string,
    action: string,
    metadata?: Record<string, unknown>
  ): Promise<boolean> {
    try {
      const sessionData = await this.getSession(sessionId)
      if (!sessionData) return false

      // Update last activity
      sessionData.lastActivity = new Date()
      
      const sessionKey = REDIS_KEYS.SESSION(sessionId)
      await redis.set(sessionKey, sessionData, CACHE_TTL.DAY)

      // Log activity (optional - for audit trail)
      const activity: SessionActivity = {
        sessionId,
        userId: sessionData.userId,
        action,
        timestamp: new Date(),
        ipAddress: sessionData.ipAddress,
        metadata,
      }

      // Store activity in a list (keeping last 100 activities)
      const activityKey = `session:${sessionId}:activity`
      await redis.lpush(activityKey, JSON.stringify(activity))
      await redis.getClient().ltrim(activityKey, 0, 99) // Keep only last 100
      await redis.getClient().expire(activityKey, CACHE_TTL.WEEK)

      return true

    } catch (error) {
      console.error(`❌ Error updating session activity ${sessionId}:`, error)
      return false
    }
  }

  // Destroy session
  public async destroySession(sessionId: string): Promise<boolean> {
    try {
      // Get session data first to clean up user sessions
      const sessionData = await this.getSession(sessionId)
      
      // Remove session data
      const sessionKey = REDIS_KEYS.SESSION(sessionId)
      await redis.del(sessionKey)

      // Remove from user's active sessions
      if (sessionData) {
        const userSessionsKey = REDIS_KEYS.USER_SESSION(sessionData.userId)
        await redis.getClient().srem(userSessionsKey, sessionId)
      }

      // Clean up activity log
      const activityKey = `session:${sessionId}:activity`
      await redis.del(activityKey)

      console.log(`✅ Session destroyed: ${sessionId}`)
      return true

    } catch (error) {
      console.error(`❌ Error destroying session ${sessionId}:`, error)
      return false
    }
  }

  // Destroy all user sessions (useful for security incidents)
  public async destroyAllUserSessions(userId: string): Promise<boolean> {
    try {
      const userSessionsKey = REDIS_KEYS.USER_SESSION(userId)
      const sessionIds = await redis.smembers(userSessionsKey)

      // Destroy each session
      const destroyPromises = sessionIds.map(sessionId => this.destroySession(sessionId))
      await Promise.all(destroyPromises)

      // Clean up user sessions set
      await redis.del(userSessionsKey)

      console.log(`✅ All sessions destroyed for user: ${userId}`)
      return true

    } catch (error) {
      console.error(`❌ Error destroying all sessions for user ${userId}:`, error)
      return false
    }
  }

  // Get all active sessions for a user
  public async getUserSessions(userId: string): Promise<SessionData[]> {
    try {
      const userSessionsKey = REDIS_KEYS.USER_SESSION(userId)
      const sessionIds = await redis.smembers(userSessionsKey)

      if (sessionIds.length === 0) return []

      // Get all session data
      const sessionPromises = sessionIds.map(sessionId => this.getSession(sessionId))
      const sessions = await Promise.all(sessionPromises)

      // Filter out null sessions (expired or invalid)
      return sessions.filter((session): session is SessionData => session !== null)

    } catch (error) {
      console.error(`❌ Error getting user sessions for ${userId}:`, error)
      return []
    }
  }

  // Extend session (refresh expiration)
  public async extendSession(sessionId: string, extensionHours: number = 8): Promise<boolean> {
    try {
      const sessionData = await this.getSession(sessionId)
      if (!sessionData) return false

      // Extend expiration time
      const now = new Date()
      const newExpiresAt = new Date(now.getTime() + (extensionHours * 60 * 60 * 1000))
      
      sessionData.expiresAt = newExpiresAt
      sessionData.lastActivity = now

      const sessionKey = REDIS_KEYS.SESSION(sessionId)
      await redis.set(sessionKey, sessionData, CACHE_TTL.DAY)

      console.log(`✅ Session extended: ${sessionId}`)
      return true

    } catch (error) {
      console.error(`❌ Error extending session ${sessionId}:`, error)
      return false
    }
  }

  // Validate session and check permissions
  public async validateSession(
    sessionId: string, 
    requiredPermission?: string
  ): Promise<SessionData | null> {
    try {
      const sessionData = await this.getSession(sessionId)
      if (!sessionData) return null

      // Check permission if required
      if (requiredPermission && !sessionData.permissions.includes(requiredPermission)) {
        console.warn(`⚠️ Permission denied: ${requiredPermission} for session ${sessionId}`)
        return null
      }

      return sessionData

    } catch (error) {
      console.error(`❌ Error validating session ${sessionId}:`, error)
      return null
    }
  }

  // Get session activity log
  public async getSessionActivity(sessionId: string): Promise<SessionActivity[]> {
    try {
      const activityKey = `session:${sessionId}:activity`
      const activities = await redis.getClient().lrange(activityKey, 0, -1)
      
      return activities.map(activityStr => {
        try {
          return JSON.parse(activityStr) as SessionActivity
        } catch {
          return null
        }
      }).filter((activity): activity is SessionActivity => activity !== null)

    } catch (error) {
      console.error(`❌ Error getting session activity ${sessionId}:`, error)
      return []
    }
  }

  // Clean up expired sessions (maintenance task)
  public async cleanupExpiredSessions(): Promise<number> {
    try {
      let cleaned = 0
      const pattern = 'session:*'
      const keys = await redis.getClient().keys(pattern)

      for (const key of keys) {
        if (key.includes(':activity')) continue // Skip activity logs

        const sessionData = await redis.get<SessionData>(key)
        if (!sessionData) continue

        const now = new Date()
        const expiresAt = new Date(sessionData.expiresAt)

        if (now > expiresAt) {
          const sessionId = key.replace('session:', '')
          await this.destroySession(sessionId)
          cleaned++
        }
      }

      console.log(`🧹 Cleaned up ${cleaned} expired sessions`)
      return cleaned

    } catch (error) {
      console.error('❌ Error cleaning up expired sessions:', error)
      return 0
    }
  }

  // Session statistics
  public async getSessionStats(): Promise<{
    totalActiveSessions: number
    sessionsByUserType: Record<string, number>
    sessionsBySppg: Record<string, number>
  }> {
    try {
      const pattern = 'session:*'
      const keys = await redis.getClient().keys(pattern)
      const activeSessions = keys.filter(key => !key.includes(':activity'))

      const sessionsByUserType: Record<string, number> = {}
      const sessionsBySppg: Record<string, number> = {}

      for (const key of activeSessions) {
        const sessionData = await redis.get<SessionData>(key)
        if (!sessionData) continue

        // Count by user type
        sessionsByUserType[sessionData.userType] = 
          (sessionsByUserType[sessionData.userType] || 0) + 1

        // Count by SPPG (if applicable)
        if (sessionData.sppgId) {
          sessionsBySppg[sessionData.sppgId] = 
            (sessionsBySppg[sessionData.sppgId] || 0) + 1
        }
      }

      return {
        totalActiveSessions: activeSessions.length,
        sessionsByUserType,
        sessionsBySppg,
      }

    } catch (error) {
      console.error('❌ Error getting session stats:', error)
      return {
        totalActiveSessions: 0,
        sessionsByUserType: {},
        sessionsBySppg: {},
      }
    }
  }
}

// Export singleton instance
export const sessionService = SessionService.getInstance()

// Types are already exported at declaration