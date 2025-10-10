import { NextRequest, NextResponse } from 'next/server'
import { WebSocketServer, WebSocket } from 'ws'
import { IncomingMessage } from 'http'
import Redis from 'ioredis'

// Enterprise WebSocket configuration
const WSS_PORT = process.env.WSS_PORT ? parseInt(process.env.WSS_PORT) : 3001

interface WebSocketClient {
  ws: WebSocket
  sppgId: string
  userId: string
  subscriptions: Set<string>
  lastPing: number
}

class DashboardWebSocketServer {
  private wss: WebSocketServer | null = null
  private clients = new Map<string, WebSocketClient>()
  private subscriber: Redis | null = null
  private pingInterval: NodeJS.Timeout | null = null

  async initialize() {
    try {
      // Create WebSocket server
      this.wss = new WebSocketServer({
        port: WSS_PORT,
        verifyClient: async () => {
          // Verify authentication in real implementation
          return true
        }
      })

      // Redis subscriber for broadcasting
      this.subscriber = new Redis(process.env.REDIS_URL || 'redis://localhost:6379')
      
      // Subscribe to dashboard channels
      await this.subscriber.psubscribe('dashboard-update-*', 'notification-*', 'system-alert')
      
      this.subscriber.on('pmessage', (pattern, channel, message) => {
        this.handleRedisMessage(pattern, channel, message)
      })

      // WebSocket connection handling
      this.wss.on('connection', (ws, req) => {
        this.handleConnection(ws, req)
      })

      // Health check ping every 30 seconds
      this.pingInterval = setInterval(() => {
        this.pingClients()
      }, 30000)

      console.log(`✅ Dashboard WebSocket server running on port ${WSS_PORT}`)

    } catch (error) {
      console.error('❌ Failed to initialize WebSocket server:', error)
    }
  }

  private handleConnection(ws: WebSocket, req: IncomingMessage) {
    const url = new URL(req.url || '', `http://${req.headers.host}`)
    const sppgId = url.searchParams.get('sppgId')
    const clientId = `${sppgId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    if (!sppgId) {
      ws.close(1008, 'Missing sppgId parameter')
      return
    }

    // Store client
    const client: WebSocketClient = {
      ws,
      sppgId,
      userId: 'anonymous', // Would get from auth
      subscriptions: new Set(),
      lastPing: Date.now()
    }

    this.clients.set(clientId, client)

    console.log(`🔌 WebSocket client connected: ${clientId} (SPPG: ${sppgId})`)

    // Handle messages
    ws.on('message', (data: Buffer) => {
      this.handleClientMessage(clientId, data)
    })

    // Handle disconnection
    ws.on('close', (code: number, reason: Buffer) => {
      console.log(`🔌 WebSocket client disconnected: ${clientId} (${code}: ${reason})`)
      this.clients.delete(clientId)
    })

    // Handle errors
    ws.on('error', (error: Error) => {
      console.error(`❌ WebSocket client error: ${clientId}`, error)
      this.clients.delete(clientId)
    })

    // Send welcome message
    this.sendToClient(clientId, {
      type: 'CONNECTED',
      message: 'WebSocket connection established',
      clientId,
      timestamp: new Date().toISOString()
    })
  }

  private handleClientMessage(clientId: string, data: Buffer) {
    try {
      const message = JSON.parse(data.toString())
      const client = this.clients.get(clientId)

      if (!client) return

      switch (message.type) {
        case 'SUBSCRIBE':
          if (Array.isArray(message.channels)) {
            message.channels.forEach((channel: string) => {
              client.subscriptions.add(channel)
            })
          }
          console.log(`📡 Client ${clientId} subscribed to channels:`, Array.from(client.subscriptions))
          break

        case 'UNSUBSCRIBE':
          if (Array.isArray(message.channels)) {
            message.channels.forEach((channel: string) => {
              client.subscriptions.delete(channel)
            })
          }
          break

        case 'PING':
          client.lastPing = Date.now()
          this.sendToClient(clientId, { type: 'PONG', timestamp: new Date().toISOString() })
          break

        default:
          console.warn(`Unknown message type from client ${clientId}:`, message.type)
      }
    } catch (error) {
      console.error(`Error handling message from client ${clientId}:`, error)
    }
  }

  private handleRedisMessage(pattern: string, channel: string, message: string) {
    try {
      const data = JSON.parse(message)
      
      // Extract sppgId from channel
      const sppgId = channel.split('-').pop()
      
      if (!sppgId) return

      // Broadcast to relevant clients
      this.clients.forEach((client, clientId) => {
        if (client.sppgId === sppgId || data.type === 'SYSTEM_ALERT') {
          // Check if client is subscribed to this type of message
          const messageType = data.type?.toLowerCase() || channel.split('-')[0]
          
          if (client.subscriptions.has(messageType) || 
              client.subscriptions.has('dashboard-update') ||
              data.type === 'SYSTEM_ALERT') {
            this.sendToClient(clientId, data)
          }
        }
      })

      console.log(`📨 Broadcasted message to ${this.clients.size} clients:`, data.type)

    } catch (error) {
      console.error('Error handling Redis message:', error)
    }
  }

  private sendToClient(clientId: string, data: Record<string, unknown>) {
    const client = this.clients.get(clientId)
    
    if (client && client.ws.readyState === 1) { // WebSocket.OPEN
      try {
        client.ws.send(JSON.stringify(data))
      } catch (error) {
        console.error(`Error sending message to client ${clientId}:`, error)
        this.clients.delete(clientId)
      }
    }
  }

  private pingClients() {
    const now = Date.now()
    
    this.clients.forEach((client, clientId) => {
      // Remove stale clients (no ping for 2 minutes)
      if (now - client.lastPing > 120000) {
        console.log(`🧹 Removing stale client: ${clientId}`)
        client.ws.close(1000, 'Ping timeout')
        this.clients.delete(clientId)
        return
      }

      // Send ping to active clients
      if (client.ws.readyState === 1) {
        this.sendToClient(clientId, { 
          type: 'PING', 
          timestamp: new Date().toISOString() 
        })
      }
    })
  }

  getStats() {
    return {
      totalClients: this.clients.size,
      clientsBySppg: Array.from(this.clients.values()).reduce((acc, client) => {
        acc[client.sppgId] = (acc[client.sppgId] || 0) + 1
        return acc
      }, {} as Record<string, number>)
    }
  }

  async shutdown() {
    console.log('🔄 Shutting down WebSocket server...')
    
    if (this.pingInterval) {
      clearInterval(this.pingInterval)
    }
    
    // Close all client connections
    this.clients.forEach((client) => {
      client.ws.close(1000, 'Server shutdown')
    })
    
    // Close WebSocket server
    if (this.wss) {
      this.wss.close()
    }
    
    // Close Redis connections
    if (this.subscriber) {
      await this.subscriber.quit()
    }
  }
}

// Global WebSocket server instance
let wsServer: DashboardWebSocketServer | null = null

// Initialize WebSocket server on first request
export async function GET(request: NextRequest) {
  try {
    // In production, this would be handled by a separate WebSocket server
    // For development, we'll provide connection info
    
    if (!wsServer) {
      wsServer = new DashboardWebSocketServer()
      await wsServer.initialize()
    }

    const stats = wsServer.getStats()

    return NextResponse.json({
      success: true,
      message: 'WebSocket server is running',
      wsUrl: process.env.NODE_ENV === 'production' 
        ? `wss://${request.headers.get('host')}/ws`
        : `ws://localhost:${WSS_PORT}`,
      stats
    })

  } catch (error) {
    console.error('WebSocket server error:', error)
    return NextResponse.json(
      { success: false, error: 'WebSocket server initialization failed' },
      { status: 500 }
    )
  }
}

// Health check endpoint
export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json()

    if (action === 'stats' && wsServer) {
      return NextResponse.json({
        success: true,
        stats: wsServer.getStats()
      })
    }

    if (action === 'shutdown' && wsServer) {
      await wsServer.shutdown()
      wsServer = null
      return NextResponse.json({
        success: true,
        message: 'WebSocket server shutdown completed'
      })
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    )

  } catch {
    return NextResponse.json(
      { success: false, error: 'Request processing failed' },
      { status: 500 }
    )
  }
}

// Cleanup on process termination
if (typeof process !== 'undefined') {
  process.on('SIGTERM', async () => {
    if (wsServer) {
      await wsServer.shutdown()
    }
  })

  process.on('SIGINT', async () => {
    if (wsServer) {
      await wsServer.shutdown()
    }
    process.exit(0)
  })
}