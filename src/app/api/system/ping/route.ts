/**
 * System Ping Endpoint
 * Lightweight endpoint for connection health monitoring
 */

import { NextResponse } from 'next/server'

export async function HEAD() {
  return new NextResponse(null, { 
    status: 200,
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'X-Response-Time': Date.now().toString()
    }
  })
}

export async function GET() {
  return NextResponse.json(
    { 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      server: 'bergizi-id'
    },
    {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    }
  )
}