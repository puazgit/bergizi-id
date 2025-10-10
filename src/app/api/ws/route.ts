// WebSocket Server API - Real-time Communication Hub
// Bergizi-ID SaaS Platform - Enterprise Real-time Features
// Note: Next.js WebSocket connection info endpoint

import { NextRequest, NextResponse } from 'next/server'
import { redis } from '@/lib/redis'
import { auth } from '@/auth'
import crypto from 'crypto'

// WebSocket configuration types

// Generate WebSocket authentication token
function generateWebSocketToken(userId: string, sppgId: string): string {
  const payload = {
    userId,
    sppgId,
    timestamp: Date.now(),
    expires: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
  }
  
  const token = Buffer.from(JSON.stringify(payload)).toString('base64')
  const signature = crypto
    .createHmac('sha256', process.env.NEXTAUTH_SECRET || 'default-secret')
    .update(token)
    .digest('hex')
  
  return `${token}.${signature}`
}

// Verify WebSocket token
export function verifyWebSocketToken(token: string): { userId: string; sppgId: string } | null {
  try {
    const [tokenData, signature] = token.split('.')
    
    // Verify signature
    const expectedSignature = crypto
      .createHmac('sha256', process.env.NEXTAUTH_SECRET || 'default-secret')
      .update(tokenData)
      .digest('hex')
    
    if (signature !== expectedSignature) {
      return null
    }
    
    // Parse payload
    const payload = JSON.parse(Buffer.from(tokenData, 'base64').toString())
    
    // Check expiration
    if (Date.now() > payload.expires) {
      return null
    }
    
    return {
      userId: payload.userId,
      sppgId: payload.sppgId
    }
  } catch {
    return null
  }
}

/**
 * GET /api/ws - WebSocket connection info endpoint
 * Returns WebSocket URL and authentication token for client-side connection
 */
export async function GET() {
  try {
    // Authenticate user from session
    const session = await auth()
    if (!session?.user?.sppgId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Return WebSocket connection info for client-side connection
    return NextResponse.json({
      success: true,
      data: {
        // WebSocket server URL (separate server or external service)
        wsUrl: process.env.WEBSOCKET_URL || 'ws://localhost:3001',
        sppgId: session.user.sppgId,
        userId: session.user.id,
        
        // Available channels for this SPPG
        channels: [
          `menu:updates:${session.user.sppgId}`,
          `production:updates:${session.user.sppgId}`,
          `inventory:updates:${session.user.sppgId}`,
          `distribution:updates:${session.user.sppgId}`,
          `hrd:updates:${session.user.sppgId}`,
          `procurement:updates:${session.user.sppgId}`
        ],
        
        // Authentication token for WebSocket connection
        token: generateWebSocketToken(session.user.id, session.user.sppgId),
        
        // Connection configuration
        config: {
          heartbeatInterval: 30000, // 30 seconds
          reconnectInterval: 5000,  // 5 seconds
          maxReconnectAttempts: 10
        }
      }
    })

  } catch (error) {
    console.error('[WebSocket API] Error:', error)
    return NextResponse.json({ error: 'WebSocket setup failed' }, { status: 500 })
  }
}

/**
 * POST /api/ws - Broadcast message to WebSocket clients
 * Used by Server Actions to broadcast real-time updates
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { sppgId, channel, message } = body

    // Validate input
    if (!sppgId || !channel || !message) {
      return NextResponse.json(
        { error: 'Missing required fields: sppgId, channel, message' },
        { status: 400 }
      )
    }

    // Authenticate request (in production, use API key or internal token)
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Broadcast message via Redis
    const event = {
      type: 'broadcast',
      channel,
      message,
      sppgId,
      timestamp: new Date().toISOString()
    }

    // Publish to Redis channel
    await redis.publish(channel, JSON.stringify(event))
    
    // Also publish to general channel for this SPPG
    await redis.publish(`updates:${sppgId}`, JSON.stringify(event))

    console.log(`[WebSocket API] Broadcasted message to channel: ${channel}`)

    return NextResponse.json({
      success: true,
      message: 'Message broadcasted successfully'
    })

  } catch (error) {
    console.error('[WebSocket API] Broadcast error:', error)
    return NextResponse.json({ error: 'Broadcast failed' }, { status: 500 })
  }
}

// Helper functions for Server Actions integration

/**
 * Broadcast real-time update to SPPG clients
 */
export async function broadcastToSppg(
  sppgId: string, 
  eventType: string, 
  data: unknown,
  channel?: string
) {
  try {
    const targetChannel = channel || `updates:${sppgId}`
    
    const event = {
      type: eventType,
      sppgId,
      data,
      timestamp: new Date().toISOString()
    }

    // Publish to Redis
    await redis.publish(targetChannel, JSON.stringify(event))
    
    console.log(`[WebSocket] Broadcasted ${eventType} to SPPG: ${sppgId}`)
    
    return true
  } catch (error) {
    console.error('[WebSocket] Broadcast error:', error)
    return false
  }
}

/**
 * Get WebSocket connection status for a SPPG
 */
export async function getSppgConnectionStatus(sppgId: string) {
  try {
    // In production, this would query Redis for active connections
    // For now, return mock data
    return {
      activeConnections: 0,
      lastActivity: new Date().toISOString(),
      channels: [
        `menu:updates:${sppgId}`,
        `production:updates:${sppgId}`,
        `inventory:updates:${sppgId}`,
        `distribution:updates:${sppgId}`,
        `hrd:updates:${sppgId}`,
        `procurement:updates:${sppgId}`
      ]
    }
  } catch (error) {
    console.error('[WebSocket] Status check error:', error)
    return null
  }
}