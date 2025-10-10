// Redis Test Script
// Test Redis connection and services  
// scripts/test-redis.ts

import { redis } from '../src/lib/redis'
import { initializeRedis, checkRedisHealth } from '../src/lib/init-redis'

async function testRedis() {
  try {
    console.log('🧪 Testing Redis connection...')
    
    // Initialize Redis
    const initialized = await initializeRedis()
    if (!initialized) {
      throw new Error('Failed to initialize Redis')
    }
    
    // Health check
    const health = await checkRedisHealth()
    console.log('📊 Redis Health Check:', health)
    
    // Basic operations test
    console.log('🔧 Testing basic operations...')
    
    await redis.set('test:key', { message: 'Hello Redis!', timestamp: new Date() }, 60)
    const value = await redis.get('test:key')
    console.log('✅ Retrieved value:', value)
    
    await redis.del('test:key')
    console.log('✅ Key deleted')
    
    // Test hash operations
    await redis.hset('test:hash', 'field1', { data: 'value1' })
    await redis.hset('test:hash', 'field2', { data: 'value2' })
    
    const hashValue = await redis.hget('test:hash', 'field1')
    console.log('✅ Hash field retrieved:', hashValue)
    
    const allHash = await redis.hgetall('test:hash')
    console.log('✅ Full hash retrieved:', allHash)
    
    // Test list operations  
    await redis.lpush('test:list', 'item1', 'item2', 'item3')
    const listItem = await redis.rpop('test:list')
    console.log('✅ List item popped:', listItem)
    
    // Test set operations
    await redis.sadd('test:set', 'member1', 'member2', 'member3')
    const setMembers = await redis.smembers('test:set')
    console.log('✅ Set members:', setMembers)
    
    // Cleanup
    await redis.del('test:hash')
    await redis.del('test:list') 
    await redis.del('test:set')
    
    console.log('🎉 All Redis tests passed!')
    
  } catch (error) {
    console.error('❌ Redis test failed:', error)
    process.exit(1)
  } finally {
    process.exit(0)
  }
}

// Run test
testRedis()