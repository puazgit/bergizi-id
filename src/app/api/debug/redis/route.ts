// Redis Debug API Route
// src/app/api/debug/redis/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { getRedisDebugInfo, testRedisPubSub, getProductionRedisData } from '@/lib/redis-debug'

export async function GET(request: NextRequest) {
  try {
    // Only allow in development or for admin users
    if (process.env.NODE_ENV === 'production') {
      const session = await auth()
      if (!session?.user || session.user.userRole !== 'PLATFORM_SUPERADMIN') {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 })
      }
    }

    const { searchParams } = new URL(request.url)
    const sppgId = searchParams.get('sppgId')
    const testPubSub = searchParams.get('testPubSub') === 'true'

    // Get Redis debug info
    const debugInfo = await getRedisDebugInfo(sppgId || undefined)

    // Test pub/sub if requested
    let pubSubTest = null
    if (testPubSub && sppgId) {
      pubSubTest = await testRedisPubSub(sppgId)
    }

    // Get production-specific data if sppgId provided
    let productionData = {}
    if (sppgId) {
      productionData = await getProductionRedisData(sppgId)
    }

    return NextResponse.json({
      success: true,
      data: {
        ...debugInfo,
        pubSubTest,
        productionData,
        timestamp: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('[Redis Debug API] Error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to get Redis debug info',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    )
  }
}