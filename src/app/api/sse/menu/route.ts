import { NextRequest } from 'next/server'
import { auth } from '@/auth'
import { redis } from '@/lib/redis'

interface MenuSSEMessage {
  type: 'MENU_CREATED' | 'MENU_UPDATED' | 'MENU_DELETED' | 'MENU_STATUS_TOGGLED'
  data: Record<string, unknown>
  timestamp: number
  sppgId: string
}

export async function GET(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.sppgId) {
    return new Response('Unauthorized', { status: 401 })
  }

  const sppgId = session.user.sppgId
  const channel = `menu:${sppgId}`

  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder()
      
      // Send initial connection message
      const initialMessage = `data: ${JSON.stringify({
        type: 'CONNECTED',
        timestamp: Date.now(),
        channel
      })}\n\n`
      controller.enqueue(encoder.encode(initialMessage))

      // Subscribe to Redis channel for menu updates  
      const subscriber = redis.getSubscriber()
      subscriber.subscribe(channel)

      subscriber.on('message', (receivedChannel: string, message: string) => {
        if (receivedChannel === channel) {
          try {
            const data: MenuSSEMessage = JSON.parse(message)
            const sseMessage = `data: ${JSON.stringify(data)}\n\n`
            controller.enqueue(encoder.encode(sseMessage))
          } catch (error) {
            console.error('Menu SSE message parse error:', error)
          }
        }
      })

      // Handle client disconnect
      request.signal.addEventListener('abort', () => {
        subscriber.unsubscribe(channel)
        subscriber.disconnect()
        controller.close()
      })

      // Keep-alive ping every 30 seconds
      const keepAlive = setInterval(() => {
        const pingMessage = `data: ${JSON.stringify({
          type: 'PING',
          timestamp: Date.now()
        })}\n\n`
        controller.enqueue(encoder.encode(pingMessage))
      }, 30000)

      // Cleanup on close
      request.signal.addEventListener('abort', () => {
        clearInterval(keepAlive)
      })
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