import { NextRequest } from 'next/server'
import { auth } from '@/auth'
import Redis from 'ioredis'
import { SSEMockGenerator } from '@/lib/sse-mock'

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
        let subscriber: Redis | null = null
        
        try {
          // Check if Redis is available
          const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379'
          subscriber = new Redis(redisUrl, {
            connectTimeout: 5000,
            lazyConnect: true,
            maxRetriesPerRequest: 2,
            enableOfflineQueue: false
          })

          // Test Redis connection
          await subscriber.connect()
          
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

          // Handle Redis connection errors
          subscriber.on('error', (error) => {
            console.warn('Redis connection error:', error.message)
            send({
              type: 'WARNING',
              message: 'Real-time updates temporarily unavailable',
              timestamp: Date.now()
            })
          })

          // Cleanup on close
          const cleanup = () => {
            if (subscriber) {
              subscriber.disconnect()
            }
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

          // Send success message
          send({
            type: 'INFO',
            message: 'Real-time updates connected',
            timestamp: Date.now()
          })

        } catch (error) {
          console.warn('Redis not available, running in fallback mode:', error)
          
          // Disconnect subscriber if it was created
          if (subscriber) {
            try {
              subscriber.disconnect()
            } catch (disconnectError) {
              console.warn('Error disconnecting Redis:', disconnectError)
            }
          }

          // Send fallback mode message (not an error)
          send({
            type: 'INFO',
            message: 'Running in development mode with simulated data',
            timestamp: Date.now()
          })

          // Setup mock data generator for development
          const mockGenerator = new SSEMockGenerator()
          
          const unsubscribeMock = mockGenerator.subscribe((mockData) => {
            send({
              type: 'DASHBOARD_UPDATE',
              channel: `dashboard-update-${sppgId}`,
              data: mockData.data,
              timestamp: Date.now()
            })
          })

          mockGenerator.start()

          // Keep connection alive with heartbeat
          const heartbeat = setInterval(() => {
            send({
              type: 'HEARTBEAT',
              timestamp: Date.now()
            })
          }, 30000)

          // Cleanup on disconnect
          request.signal.addEventListener('abort', () => {
            clearInterval(heartbeat)
            mockGenerator.stop()
            unsubscribeMock()
            connections.delete(connectionId)
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