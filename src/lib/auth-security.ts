// Auth Security Service  
// Security enhancements for authentication with Redis
// src/lib/auth-security.ts

// Cache TTL constants (Redis disabled for now)
const CACHE_TTL = {
  SHORT: 60 * 5,
  MEDIUM: 60 * 30,
  LONG: 60 * 60 * 2,
  DAY: 60 * 60 * 24,
  WEEK: 60 * 60 * 24 * 7,
} as const
import { hash, compare } from 'bcryptjs'
import { nanoid } from 'nanoid'
import { auth } from '@/auth'
import { cache } from 'react'
import prisma from '@/lib/db'

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

/**
 * Check if SPPG exists and is accessible
 */
export async function checkSppgAccess(sppgId: string | null) {
  if (!sppgId) return null

  try {
    const sppg = await prisma.sPPG.findFirst({
      where: {
        id: sppgId,
        status: 'ACTIVE' // Only active SPPG can be accessed
      },
      select: {
        id: true,
        name: true,
        code: true,
        status: true,
        isDemoAccount: true,
        demoExpiresAt: true,
        demoAllowedFeatures: true,
        demoMaxBeneficiaries: true
      }
    })

    // Additional demo account validation
    if (sppg?.isDemoAccount && sppg.demoExpiresAt) {
      if (new Date() > sppg.demoExpiresAt) {
        return null // Demo expired
      }
    }

    return sppg
  } catch (error) {
    console.error('SPPG access check failed:', error)
    return null
  }
}

/**
 * Cached session retrieval for performance
 */
export const getCurrentSession = cache(async () => {
  try {
    const session = await auth()
    return session
  } catch (error) {
    console.error('Session retrieval failed:', error)
    return null
  }
})

/**
 * Password hashing with enterprise-grade salt rounds
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12 // Enterprise-grade salt rounds
  return hash(password, saltRounds)
}

/**
 * Password verification
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return compare(password, hash)
}

/**
 * Track security attempts with Redis
 */
export async function trackSecurityAttempt(attempt: SecurityAttempt): Promise<void> {
  try {
    // TODO: Implement Redis caching for production
    console.log('Security attempt tracked:', attempt.identifier)
    // const redis = await getRedisClient()
    // const key = `security:attempt:${attempt.identifier}:${Date.now()}`
    // await redis.set(key, JSON.stringify(attempt), 'EX', CACHE_TTL.LONG)
    
    // TODO: Track attempt count with Redis
    // const countKey = `security:count:${attempt.identifier}`
    // const count = await redis.get(countKey)
    // const newCount = count ? parseInt(count) + 1 : 1
    
    // await redis.set(countKey, newCount.toString(), CACHE_TTL.LONG)
    
    // Auto-lock after 5 failed attempts (disabled for now)
    // if (!attempt.success && newCount >= 5) {
    //   await lockAccount(attempt.identifier, 'Too many failed attempts')
    // }
  } catch (error) {
    console.error('Failed to track security attempt:', error)
  }
}

/**
 * Lock account temporarily
 */
export async function lockAccount(identifier: string, reason: string): Promise<void> {
  try {
    const lockout: AccountLockout = {
      identifier,
      lockedAt: new Date(),
      unlockAt: new Date(Date.now() + CACHE_TTL.LONG * 1000), // 2 hour lockout
      attemptCount: 5,
      reason
    }
    
    // TODO: Store lockout in Redis
    // const key = `security:lockout:${identifier}`
    // await redis.set(key, JSON.stringify(lockout), CACHE_TTL.LONG)
    console.log('Account locked:', lockout.identifier, lockout.reason)
  } catch (error) {
    console.error('Failed to lock account:', error)
  }
}

/**
 * Check if account is locked
 */
export async function isAccountLocked(identifier: string): Promise<AccountLockout | null> {
  try {
    // TODO: Check lockout status in Redis
    // const key = `security:lockout:${identifier}`
    // const data = await redis.get(key)
    
    // if (data) {
    //   const lockout = JSON.parse(data) as AccountLockout
      
    //   // Check if lockout has expired
    //   if (new Date() > new Date(lockout.unlockAt)) {
    //     await redis.del(key)
    //     return null
    //   }
      
    //   return lockout
    // }
    
    console.log('Checking lockout for:', identifier)
    return null
  } catch (error) {
    console.error('Failed to check account lockout:', error)
    return null
  }
}

/**
 * Generate secure session token
 */
export function generateSecureToken(): string {
  return nanoid(32)
}

/**
 * Rate limiting for sensitive operations
 */
export async function checkRateLimit(
  identifier: string, 
  operation: string, 
  maxAttempts: number = 10,
  windowMs: number = CACHE_TTL.MEDIUM // 30 minutes
): Promise<{ allowed: boolean; remaining: number; resetTime: Date }> {
  try {
    // TODO: Implement rate limiting with Redis
    // const key = `ratelimit:${operation}:${identifier}`
    // const count = await redis.get(key)
    // const currentCount = count ? parseInt(count) : 0
    
    // if (currentCount >= maxAttempts) {
    //   return {
    //     allowed: false,
    //     remaining: 0,
    //     resetTime: new Date(Date.now() + windowMs * 1000)
    //   }
    // }
    
    // Increment counter
    // const newCount = currentCount + 1
    // await redis.set(key, newCount.toString(), windowMs)
    console.log('Rate limit check:', operation, identifier)
    
    return {
      allowed: true,
      remaining: maxAttempts, // Return max attempts since rate limiting is disabled
      resetTime: new Date(Date.now() + windowMs * 1000)
    }
  } catch (error) {
    console.error('Rate limit check failed:', error)
    // On error, allow the request but with warning
    return {
      allowed: true,
      remaining: 0,
      resetTime: new Date()
    }
  }
}

/**
 * Clean expired security records
 */
export async function cleanupSecurityRecords(): Promise<void> {
  try {
    // This would be run by a background job
    // Redis cleanup logic here - implement pattern scanning
    console.log('Security cleanup scheduled')
  } catch (error) {
    console.error('Security cleanup failed:', error)
  }
}

// Missing functions that are imported elsewhere
export async function trackLoginAttempt(
  email: string, 
  success: boolean, 
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  await trackSecurityAttempt({
    identifier: email,
    attemptType: 'login',
    timestamp: new Date(),
    success,
    ipAddress,
    userAgent
  })
}

export function validatePasswordStrength(password: string): {
  isValid: boolean
  errors: string[]
  score: number
} {
  const errors: string[] = []
  let score = 0

  if (password.length < 8) {
    errors.push('Password minimal 8 karakter')
  } else {
    score += 1
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password harus mengandung huruf kecil')
  } else {
    score += 1
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password harus mengandung huruf besar')
  } else {
    score += 1
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Password harus mengandung angka')
  } else {
    score += 1
  }

  if (!/[^a-zA-Z0-9]/.test(password)) {
    errors.push('Password harus mengandung karakter khusus')
  } else {
    score += 1
  }

  return {
    isValid: errors.length === 0,
    errors,
    score
  }
}

export async function logSecurityEvent(
  event: string,
  details: Record<string, unknown>,
  userId?: string,
  sppgId?: string
): Promise<void> {
  try {
    const logData = {
      event,
      details,
      userId,
      sppgId,
      timestamp: new Date().toISOString(),
      severity: 'info'
    }

    // TODO: Log to Redis with expiry
    // const key = `security:log:${Date.now()}:${nanoid()}`
    // const redisInstance = redis.getInstance()
    // await redisInstance.set(key, logData, CACHE_TTL.WEEK)
    
    // Also log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('🔒 Security Event:', logData)
    }
  } catch (error) {
    console.error('Failed to log security event:', error)
  }
}

// Alias for backward compatibility 
export async function getCurrentUser() {
  const session = await getCurrentSession()
  return session?.user || null
}