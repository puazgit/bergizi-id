#!/usr/bin/env tsx

/**
 * Script to test getDashboardHistory server action directly
 */

import { getDashboardHistory } from '../src/actions/sppg/dashboard'

async function testDashboardHistory() {
  console.log('🧪 Testing getDashboardHistory server action...')
  
  try {
    // Test with different limits
    const limits = [5, 10, 25]
    
    for (const limit of limits) {
      console.log(`\n📊 Testing with limit: ${limit}`)
      
      const result = await getDashboardHistory(limit)
      
      if (result.success) {
        console.log('✅ Success!')
        console.log(`📈 Data structure:`, {
          hasHistory: !!result.data?.history,
          historyLength: result.data?.history?.length || 0,
          total: result.data?.total || 0,
          dataKeys: Object.keys(result.data || {})
        })
        
        if (result.data?.history?.length > 0) {
          console.log('📝 First history item:')
          const firstItem = result.data.history[0]
          console.log({
            timestamp: firstItem.timestamp,
            title: firstItem.title,
            user: firstItem.user,
            changeType: firstItem.changeType
          })
        }
      } else {
        console.log('❌ Error:', result.error)
      }
    }
    
  } catch (error) {
    console.error('💥 Exception:', error)
  }
}

testDashboardHistory()