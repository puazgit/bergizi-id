// Redis Auth Security Service  
// Security enhancements for authentication with Redis
// src/lib/services/auth-security-service.ts

import { redis, CACHE_TTL } from '@/lib/redis'
import { hash, compare } from 'bcryptjs'
import { nanoid } from 'nanoid'

// Security attempt tracking
export interface SecurityAttempt {
  identifier: string // email or IP
  attemptType: 'login' | 'password_reset' | 'account_creation'
  timestamp: Date
  success: boolean
  ipAddress?: string
  userAgent?: string
}

// Account lockout info
export interface AccountLockout {
  identifier: string
  lockedAt: Date
  unlockAt: Date
  attemptCount: number
  reason: string
}

// Rate limit info
export interface RateLimit {
  identifier: string
  count: number
  windowStart: Date
  windowEnd: Date
}

// Password policy
export interface PasswordPolicy {
  minLength: number
  requireUppercase: boolean
  requireLowercase: boolean
  requireNumbers: boolean
  requireSpecialChars: boolean
  maxAge: number // days
  preventReuse: number // last N passwords
}

class AuthSecurityService {
  private static instance: AuthSecurityService
  
  // Security configuration
  private readonly config = {
    // Rate limiting
    maxLoginAttempts: 5,
    lockoutDuration: 30 * 60, // 30 minutes in seconds
    rateLimitWindow: 60 * 15, // 15 minutes in seconds
    maxRequestsPerWindow: 10,
    
    // Password policy
    passwordPolicy: {
      minLength: 12,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: true,
      maxAge: 90, // days
      preventReuse: 5,
    } as PasswordPolicy,
    
    // Session security
    sessionTimeout: 8 * 60 * 60, // 8 hours in seconds
    maxConcurrentSessions: 3,
  }

  private constructor() {}

  public static getInstance(): AuthSecurityService {
    if (!AuthSecurityService.instance) {
      AuthSecurityService.instance = new AuthSecurityService()
    }
    return AuthSecurityService.instance
  }

  // Login attempt tracking
  public async recordLoginAttempt(
    identifier: string,
    success: boolean,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    try {
      const attempt: SecurityAttempt = {
        identifier,
        attemptType: 'login',
        timestamp: new Date(),
        success,
        ipAddress,
        userAgent,
      }

      // Store attempt in Redis list
      const attemptsKey = `security:attempts:${identifier}`
      await redis.lpush(attemptsKey, JSON.stringify(attempt))
      
      // Keep only last 20 attempts
      await redis.getClient().ltrim(attemptsKey, 0, 19)
      await redis.getClient().expire(attemptsKey, CACHE_TTL.DAY)

      // If failed attempt, check for lockout
      if (!success) {
        await this.checkAndApplyLockout(identifier)
      }

    } catch (error) {
      console.error(`❌ Error recording login attempt for ${identifier}:`, error)
    }
  }

  // Check if account should be locked
  private async checkAndApplyLockout(identifier: string): Promise<void> {
    try {
      const recentAttempts = await this.getRecentFailedAttempts(identifier)
      
      if (recentAttempts >= this.config.maxLoginAttempts) {
        const lockout: AccountLockout = {
          identifier,
          lockedAt: new Date(),
          unlockAt: new Date(Date.now() + (this.config.lockoutDuration * 1000)),
          attemptCount: recentAttempts,
          reason: 'Too many failed login attempts',
        }

        const lockoutKey = `security:lockout:${identifier}`
        await redis.set(lockoutKey, lockout, this.config.lockoutDuration)

        console.warn(`🔒 Account locked: ${identifier} (${recentAttempts} failed attempts)`)
      }

    } catch (error) {
      console.error(`❌ Error checking lockout for ${identifier}:`, error)
    }
  }

  // Get recent failed attempts count
  private async getRecentFailedAttempts(identifier: string): Promise<number> {
    try {
      const attemptsKey = `security:attempts:${identifier}`
      const attempts = await redis.getClient().lrange(attemptsKey, 0, -1)
      
      const cutoff = new Date(Date.now() - (this.config.rateLimitWindow * 1000))
      let failedCount = 0

      for (const attemptStr of attempts) {
        try {
          const attempt: SecurityAttempt = JSON.parse(attemptStr)
          const attemptTime = new Date(attempt.timestamp)
          
          if (attemptTime > cutoff && !attempt.success) {
            failedCount++
          }
        } catch {
          // Skip invalid attempts
        }
      }

      return failedCount

    } catch (error) {
      console.error(`❌ Error getting recent failed attempts for ${identifier}:`, error)
      return 0
    }
  }

  // Check if account is locked
  public async isAccountLocked(identifier: string): Promise<AccountLockout | null> {
    try {
      const lockoutKey = `security:lockout:${identifier}`
      const lockout = await redis.get<AccountLockout>(lockoutKey)
      
      if (!lockout) return null

      // Check if lockout has expired
      const now = new Date()
      const unlockAt = new Date(lockout.unlockAt)
      
      if (now > unlockAt) {
        // Lockout expired, remove it
        await redis.del(lockoutKey)
        return null
      }

      return lockout

    } catch (error) {
      console.error(`❌ Error checking account lockout for ${identifier}:`, error)
      return null
    }
  }

  // Password security
  public async hashPassword(password: string): Promise<string> {
    try {
      return await hash(password, 12) // High cost for security
    } catch (error) {
      console.error('❌ Error hashing password:', error)
      throw new Error('Password hashing failed')
    }
  }

  public async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    try {
      return await compare(password, hashedPassword)
    } catch (error) {
      console.error('❌ Error verifying password:', error)
      return false
    }
  }

  // Password policy validation
  public validatePassword(password: string): {
    isValid: boolean
    errors: string[]
  } {
    const errors: string[] = []
    const policy = this.config.passwordPolicy

    if (password.length < policy.minLength) {
      errors.push(`Password must be at least ${policy.minLength} characters long`)
    }

    if (policy.requireUppercase && !/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter')
    }

    if (policy.requireLowercase && !/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter')
    }

    if (policy.requireNumbers && !/\d/.test(password)) {
      errors.push('Password must contain at least one number')
    }

    if (policy.requireSpecialChars && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push('Password must contain at least one special character')
    }

    return {
      isValid: errors.length === 0,
      errors,
    }
  }

  // Rate limiting for general requests
  public async checkRateLimit(identifier: string): Promise<{
    allowed: boolean
    remainingRequests: number
    resetTime: Date
  }> {
    try {
      const rateLimitKey = `security:ratelimit:${identifier}`
      const rateLimit = await redis.get<RateLimit>(rateLimitKey)
      
      const now = new Date()
      let windowStart: Date
      let count: number

      if (!rateLimit || now > new Date(rateLimit.windowEnd)) {
        // New window
        windowStart = now
        count = 1
      } else {
        // Existing window
        windowStart = new Date(rateLimit.windowStart)
        count = rateLimit.count + 1
      }

      const windowEnd = new Date(windowStart.getTime() + (this.config.rateLimitWindow * 1000))
      
      const newRateLimit: RateLimit = {
        identifier,
        count,
        windowStart,
        windowEnd,
      }

      // Store updated rate limit
      await redis.set(rateLimitKey, newRateLimit, this.config.rateLimitWindow)

      return {
        allowed: count <= this.config.maxRequestsPerWindow,
        remainingRequests: Math.max(0, this.config.maxRequestsPerWindow - count),
        resetTime: windowEnd,
      }

    } catch (error) {
      console.error(`❌ Error checking rate limit for ${identifier}:`, error)
      return {
        allowed: true,
        remainingRequests: this.config.maxRequestsPerWindow,
        resetTime: new Date(),
      }
    }
  }

  // Security audit log
  public async logSecurityEvent(
    userId: string,
    event: string,
    details: Record<string, unknown> = {},
    ipAddress?: string
  ): Promise<void> {
    try {
      const logEntry = {
        userId,
        event,
        details,
        ipAddress,
        timestamp: new Date(),
        id: nanoid(),
      }

      const auditKey = `security:audit:${userId}`
      await redis.lpush(auditKey, JSON.stringify(logEntry))
      
      // Keep last 100 entries
      await redis.getClient().ltrim(auditKey, 0, 99)
      await redis.getClient().expire(auditKey, CACHE_TTL.WEEK * 4) // 1 month

    } catch (error) {
      console.error(`❌ Error logging security event for user ${userId}:`, error)
    }
  }
}

// Export singleton instance
export const authSecurityService = AuthSecurityService.getInstance()