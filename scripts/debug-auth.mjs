#!/usr/bin/env node

/**
 * AUTH.JS DEBUG SCRIPT FOR COOLIFY PRODUCTION
 * Diagnoses Auth.js configuration issues in production environment
 */

import { auth } from '../src/auth.ts'

console.log('🚨 AUTH.JS PRODUCTION DEBUG TOOL')
console.log('================================\n')

console.log('🔍 Diagnosing Auth.js Configuration...\n')

// Test 1: Environment Variables
console.log('1️⃣ ENVIRONMENT VARIABLES:')
const criticalEnvs = {
  NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? '[HIDDEN]' : 'NOT SET',
  DATABASE_URL: process.env.DATABASE_URL ? '[HIDDEN]' : 'NOT SET',
  NODE_ENV: process.env.NODE_ENV
}

Object.entries(criticalEnvs).forEach(([key, value]) => {
  const status = value && value !== 'NOT SET' ? '✅' : '❌'
  console.log(`   ${status} ${key}: ${value}`)
})

// Test 2: URL Configuration
console.log('\n2️⃣ URL CONFIGURATION:')
const nextAuthUrl = process.env.NEXTAUTH_URL
if (nextAuthUrl) {
  console.log(`   ✅ NEXTAUTH_URL: ${nextAuthUrl}`)
  
  // Validate URL format
  try {
    const url = new URL(nextAuthUrl)
    console.log(`   ✅ Protocol: ${url.protocol}`)
    console.log(`   ✅ Host: ${url.host}`)
    
    if (url.pathname !== '/') {
      console.log(`   ⚠️  Warning: Path should be empty (found: ${url.pathname})`)
    }
    
    if (url.protocol !== 'https:') {
      console.log(`   ⚠️  Warning: Should use HTTPS in production`)
    }
    
  } catch (error) {
    console.log(`   ❌ Invalid URL format: ${error.message}`)
  }
} else {
  console.log('   ❌ NEXTAUTH_URL: NOT SET')
}

// Test 3: Secret Validation
console.log('\n3️⃣ SECRET VALIDATION:')
const secret = process.env.NEXTAUTH_SECRET
if (secret) {
  console.log(`   ✅ Secret length: ${secret.length} characters`)
  
  if (secret.length < 32) {
    console.log('   ❌ Secret too short (minimum 32 characters)')
  } else {
    console.log('   ✅ Secret length adequate')
  }
  
  // Check secret entropy
  const uniqueChars = new Set(secret).size
  console.log(`   ✅ Unique characters: ${uniqueChars}`)
  
  if (uniqueChars < 10) {
    console.log('   ⚠️  Warning: Low entropy (consider regenerating)')
  }
} else {
  console.log('   ❌ NEXTAUTH_SECRET: NOT SET')
}

// Test 4: Database Connection
console.log('\n4️⃣ DATABASE CONNECTION:')
try {
  const { PrismaClient } = await import('@prisma/client')
  const prisma = new PrismaClient()
  
  await prisma.$connect()
  console.log('   ✅ Database connection: SUCCESS')
  
  const userCount = await prisma.user.count()
  console.log(`   ✅ Total users: ${userCount}`)
  
  await prisma.$disconnect()
} catch (error) {
  console.log(`   ❌ Database error: ${error.message}`)
}

// Test 5: Auth Configuration Test
console.log('\n5️⃣ AUTH CONFIGURATION TEST:')
try {
  // This is a basic configuration test
  console.log('   ✅ Auth module imports successfully')
  
  // Test if we can access auth config
  if (typeof auth === 'function') {
    console.log('   ✅ Auth function is callable')
  } else {
    console.log('   ❌ Auth function not available')
  }
  
} catch (error) {
  console.log(`   ❌ Auth configuration error: ${error.message}`)
}

// Test 6: Runtime Environment
console.log('\n6️⃣ RUNTIME ENVIRONMENT:')
console.log(`   ✅ Node.js version: ${process.version}`)
console.log(`   ✅ Platform: ${process.platform}`)
console.log(`   ✅ Architecture: ${process.arch}`)

// Test 7: Common Issues Check
console.log('\n7️⃣ COMMON ISSUES CHECK:')

const commonIssues = [
  {
    check: !process.env.NEXTAUTH_URL,
    message: 'NEXTAUTH_URL not set - Auth.js cannot determine callback URLs'
  },
  {
    check: !process.env.NEXTAUTH_SECRET,
    message: 'NEXTAUTH_SECRET not set - Sessions cannot be encrypted'
  },
  {
    check: process.env.NEXTAUTH_URL?.endsWith('/'),
    message: 'NEXTAUTH_URL ends with "/" - Should not have trailing slash'
  },
  {
    check: process.env.NEXTAUTH_URL && !process.env.NEXTAUTH_URL.startsWith('https://'),
    message: 'NEXTAUTH_URL not using HTTPS - Required for production'
  },
  {
    check: process.env.NEXTAUTH_SECRET && process.env.NEXTAUTH_SECRET.length < 32,
    message: 'NEXTAUTH_SECRET too short - Minimum 32 characters required'
  }
]

const foundIssues = commonIssues.filter(issue => issue.check)

if (foundIssues.length === 0) {
  console.log('   ✅ No common configuration issues found')
} else {
  foundIssues.forEach(issue => {
    console.log(`   ❌ ${issue.message}`)
  })
}

// Final Recommendations
console.log('\n🎯 RECOMMENDATIONS:')

if (foundIssues.length > 0) {
  console.log('\n🚨 CRITICAL FIXES NEEDED:')
  console.log('1. Fix environment variables in Coolify dashboard')
  console.log('2. Redeploy application after fixing variables')
  console.log('3. Test login functionality')
  console.log('4. Check application logs for runtime errors')
  
  console.log('\n📋 EXACT STEPS:')
  console.log('1. Go to Coolify Dashboard > Applications > bergizi-id')
  console.log('2. Navigate to Environment Variables section')
  console.log('3. Add/Update these variables:')
  
  if (!process.env.NEXTAUTH_URL) {
    console.log('   NEXTAUTH_URL=https://bagizi.id')
  }
  
  if (!process.env.NEXTAUTH_SECRET || process.env.NEXTAUTH_SECRET.length < 32) {
    console.log('   NEXTAUTH_SECRET=[generate with: openssl rand -base64 32]')
  }
  
  console.log('4. Save and redeploy the application')
  
} else {
  console.log('✅ Configuration appears correct!')
  console.log('🔄 If you\'re still experiencing issues:')
  console.log('1. Check application logs for runtime errors')
  console.log('2. Test authentication flow manually')
  console.log('3. Verify database has user accounts')
  console.log('4. Check network connectivity from Coolify to database')
}

console.log('\n📚 HELPFUL COMMANDS:')
console.log('- Generate secret: openssl rand -base64 32')
console.log('- Test auth: node scripts/validate-auth-production.mjs')
console.log('- Seed database: node scripts/seed-coolify.mjs')
console.log('- List users: node scripts/list-users.mjs')

console.log('\n🆘 NEED HELP?')
console.log('- Check COOLIFY_AUTH_SETUP.md for step-by-step guide')
console.log('- Review application logs in Coolify dashboard')
console.log('- Verify database service is running in Coolify')