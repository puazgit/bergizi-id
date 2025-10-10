#!/usr/bin/env tsx

/**
 * Script to check dashboard history data in Redis
 */

import { createClient } from 'redis'

async function checkDashboardHistory() {
  console.log('🔍 Checking dashboard history in Redis...')
  
  // Create Redis client
  const client = createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379'
  })
  
  try {
    await client.connect()
    console.log('✅ Redis client connected')
    
    // Get all keys that match dashboard:history pattern
    const keys = await client.keys('dashboard:history:*')
    console.log(`📋 Found ${keys.length} dashboard history keys:`)
    
    for (const key of keys) {
      console.log(`\n🔑 Key: ${key}`)
      
      // Get list length
      const length = await client.lLen(key)
      console.log(`📊 Length: ${length} items`)
      
      if (length > 0) {
        // Get first few items
        const items = await client.lRange(key, 0, 2) // Get first 3 items
        console.log('📝 Latest items:')
        
        items.forEach((item: string, idx: number) => {
          try {
            const parsed = JSON.parse(item)
            console.log(`  ${idx + 1}. ${parsed.title} - ${new Date(parsed.timestamp).toLocaleString('id-ID')}`)
            console.log(`     User: ${parsed.user} | Type: ${parsed.changeType}`)
          } catch {
            console.log(`  ${idx + 1}. Invalid JSON: ${item.substring(0, 50)}...`)
          }
        })
      }
    }
    
    if (keys.length === 0) {
      console.log('⚠️  No dashboard history found in Redis')
      console.log('🔧 This means history is not being saved yet')
    }
    
  } catch (error) {
    console.error('❌ Error checking dashboard history:', error)
  } finally {
    await client.quit()
  }
}

checkDashboardHistory()