import { NextRequest } from 'next/server'
import { auth } from '@/auth'
import Redis from 'ioredis'

interface SSEMessage {
  type: string
  data?: Record<string, unknown>
  channel?: string
  timestamp: number
  connectionId?: string
  message?: string
}

// SSE connection management
const connections = new Map<string, WritableStreamDefaultWriter>()

export async function GET(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.sppgId) {
    return new Response('Unauthorized', { status: 401 })
  }

  const sppgId = session.user.sppgId

  const stream = new ReadableStream({
    start(controller) {
      // Create connection ID
      const connectionId = `${sppgId}-${Date.now()}`
      
      // Setup SSE headers
      const encoder = new TextEncoder()
      
      const send = (data: SSEMessage) => {
        const message = `data: ${JSON.stringify(data)}\n\n`
        controller.enqueue(encoder.encode(message))
      }

      // Send initial connection message
      send({
        type: 'CONNECTED',
        timestamp: Date.now(),
        connectionId
      })

      // Setup Redis subscriber for real-time updates
      const setupRedisSubscriber = async () => {
        try {
          const subscriber = new Redis(process.env.REDIS_URL || 'redis://localhost:6379')
          
          // Subscribe to dashboard updates for this SPPG
          await subscriber.subscribe(`dashboard-update-${sppgId}`)
          await subscriber.subscribe(`notification-${sppgId}`)
          await subscriber.subscribe('system-alert')

          subscriber.on('message', (channel, message) => {
            try {
              const data = JSON.parse(message)
              send({
                type: 'DASHBOARD_UPDATE',
                channel,
                data,
                timestamp: Date.now()
              })
            } catch (error) {
              console.error('Error parsing Redis message:', error)
            }
          })

          // Cleanup on close
          const cleanup = () => {
            subscriber.disconnect()
            connections.delete(connectionId)
          }

          // Handle client disconnect
          request.signal.addEventListener('abort', cleanup)

          // Keep connection alive with heartbeat
          const heartbeat = setInterval(() => {
            send({
              type: 'HEARTBEAT',
              timestamp: Date.now()
            })
          }, 30000) // Every 30 seconds

          // Cleanup heartbeat on disconnect
          request.signal.addEventListener('abort', () => {
            clearInterval(heartbeat)
          })

        } catch (error) {
          console.error('Redis subscriber error:', error)
          send({
            type: 'ERROR',
            message: 'Failed to setup real-time updates',
            timestamp: Date.now()
          })
        }
      }

      setupRedisSubscriber()
    }
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control',
    },
  })
}