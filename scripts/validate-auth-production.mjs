#!/usr/bin/env node

/**
 * PRODUCTION AUTH VALIDATION SCRIPT
 * Tests Auth.js configuration in Coolify environment
 */

import { PrismaClient } from '@prisma/client'
import crypto from 'crypto'

const prisma = new PrismaClient()

console.log('🔐 BERGIZI-ID AUTH CONFIGURATION VALIDATOR')
console.log('==========================================\n')

// Environment Variable Validation
console.log('📋 Environment Variables Check:')

const requiredVars = [
  'NEXTAUTH_URL',
  'NEXTAUTH_SECRET', 
  'DATABASE_URL'
]

const optionalVars = [
  'REDIS_URL',
  'NODE_ENV'
]

let hasErrors = false

// Check required variables
requiredVars.forEach(varName => {
  const value = process.env[varName]
  if (!value) {
    console.log(`❌ ${varName}: MISSING (REQUIRED)`)
    hasErrors = true
  } else {
    console.log(`✅ ${varName}: SET`)
    
    // Validate specific formats
    if (varName === 'NEXTAUTH_URL') {
      if (!value.startsWith('https://')) {
        console.log(`⚠️  Warning: ${varName} should start with https:// for production`)
      }
      if (value.endsWith('/')) {
        console.log(`⚠️  Warning: ${varName} should not end with trailing slash`)
      }
    }
    
    if (varName === 'NEXTAUTH_SECRET') {
      if (value.length < 32) {
        console.log(`⚠️  Warning: ${varName} should be at least 32 characters`)
        hasErrors = true
      }
    }
    
    if (varName === 'DATABASE_URL') {
      if (!value.startsWith('postgresql://')) {
        console.log(`⚠️  Warning: ${varName} should be a PostgreSQL connection string`)
      }
    }
  }
})

// Check optional variables
optionalVars.forEach(varName => {
  const value = process.env[varName]
  console.log(`${value ? '✅' : '⚪'} ${varName}: ${value ? 'SET' : 'NOT SET (OPTIONAL)'}`)
})

console.log('\n🔗 Database Connection Test:')

try {
  await prisma.$connect()
  console.log('✅ Database connection: SUCCESS')
  
  // Test user query
  const userCount = await prisma.user.count()
  console.log(`✅ User count: ${userCount} users in database`)
  
  if (userCount === 0) {
    console.log('⚠️  Warning: No users found. Run seeding script.')
  } else {
    // Get first admin user
    const adminUser = await prisma.user.findFirst({
      where: {
        userRole: 'SPPG_ADMIN'
      },
      select: {
        id: true,
        email: true,
        name: true,
        userRole: true
      }
    })
    
    if (adminUser) {
      console.log('✅ Admin user found:', adminUser.email)
    } else {
      console.log('⚠️  Warning: No admin users found.')
    }
  }
  
} catch (error) {
  console.log('❌ Database connection: FAILED')
  console.log('Error:', error.message)
  hasErrors = true
} finally {
  await prisma.$disconnect()
}

console.log('\n🔐 Security Checks:')

// Check secret strength
const secret = process.env.NEXTAUTH_SECRET
if (secret) {
  const entropy = secret.length * Math.log2(64) // Assuming base64
  console.log(`✅ Secret entropy: ${Math.round(entropy)} bits ${entropy >= 256 ? '(STRONG)' : '(WEAK)'}`)
} else {
  console.log('❌ Secret: NOT SET')
}

// Check production settings
const nodeEnv = process.env.NODE_ENV
console.log(`${nodeEnv === 'production' ? '✅' : '⚠️ '} Environment: ${nodeEnv || 'NOT SET'}`)

console.log('\n🎯 Recommendations:')

if (hasErrors) {
  console.log('❌ CRITICAL ISSUES FOUND - Auth will not work properly')
  console.log('\n🔧 Fix Steps:')
  
  if (!process.env.NEXTAUTH_SECRET) {
    console.log('1. Generate secret: openssl rand -base64 32')
    console.log('2. Set NEXTAUTH_SECRET in Coolify environment variables')
  }
  
  if (!process.env.NEXTAUTH_URL) {
    console.log('3. Set NEXTAUTH_URL=https://bagizi.id (no trailing slash)')
  }
  
  if (!process.env.DATABASE_URL) {
    console.log('4. Get database URL from Coolify PostgreSQL service')
  }
  
  console.log('5. Redeploy application after setting variables')
  
} else {
  console.log('✅ Configuration looks good!')
  console.log('✅ Auth.js should work properly')
  
  console.log('\n🚀 Next Steps:')
  console.log('1. Test login at https://bagizi.id/login')
  console.log('2. Check application logs for any runtime errors')
  console.log('3. Verify HTTPS is working properly')
}

console.log('\n📚 Documentation:')
console.log('- Setup Guide: COOLIFY_AUTH_SETUP.md')
console.log('- Deployment Guide: COOLIFY_DEPLOYMENT.md')
console.log('- Seeding Guide: scripts/seed-coolify.mjs')

process.exit(hasErrors ? 1 : 0)