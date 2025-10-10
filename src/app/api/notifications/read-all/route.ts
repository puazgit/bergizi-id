/**
 * Notifications API - Mark All as Read
 * Enterprise-Grade Notification Management
 * Bergizi-ID SaaS Platform - Phase 1 Implementation
 */

import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { redis } from '@/lib/redis'

/**
 * PATCH /api/notifications/read-all
 * Mark all notifications as read for the current user
 */
export async function PATCH() {
  try {
    // Check authentication
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Set a flag indicating all notifications are read
    const cacheKey = `notifications:all-read:${session.user.id}`
    
    await redis.setex(cacheKey, 86400, new Date().toISOString()) // 24 hours

    console.log(`📨 All notifications marked as read for user ${session.user.id}`)

    // Broadcast all notifications read update
    await redis.publish(`user:${session.user.id}:notifications`, JSON.stringify({
      type: 'ALL_NOTIFICATIONS_READ',
      payload: {
        userId: session.user.id,
        timestamp: new Date().toISOString()
      }
    }))

    return NextResponse.json({
      success: true,
      message: 'All notifications marked as read'
    })

  } catch (error) {
    console.error('🚨 Mark all notifications as read error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}