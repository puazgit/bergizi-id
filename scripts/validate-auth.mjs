#!/usr/bin/env node

// Auth.js Configuration Validator for Coolify
console.log('🔐 BERGIZI-ID AUTH.JS CONFIGURATION VALIDATOR')
console.log('=' .repeat(60))

// Check environment variables
const requiredEnvVars = [
  'NEXTAUTH_URL',
  'NEXTAUTH_SECRET', 
  'DATABASE_URL',
  'NODE_ENV'
]

console.log('\n📊 Environment Variables Check:')
console.log('-'.repeat(40))

let missingVars = []
let configIssues = []

requiredEnvVars.forEach(varName => {
  const value = process.env[varName]
  if (!value) {
    console.log(`❌ ${varName}: NOT SET`)
    missingVars.push(varName)
  } else {
    console.log(`✅ ${varName}: SET (${value.length} chars)`)
    
    // Validate specific values
    if (varName === 'NEXTAUTH_URL') {
      if (!value.startsWith('https://') && process.env.NODE_ENV === 'production') {
        configIssues.push('NEXTAUTH_URL must use HTTPS in production')
      }
      if (value.endsWith('/')) {
        configIssues.push('NEXTAUTH_URL should not end with slash')
      }
    }
    
    if (varName === 'NEXTAUTH_SECRET') {
      if (value.length < 32) {
        configIssues.push('NEXTAUTH_SECRET should be at least 32 characters')
      }
    }
    
    if (varName === 'DATABASE_URL') {
      if (!value.startsWith('postgresql://')) {
        configIssues.push('DATABASE_URL should start with postgresql://')
      }
    }
  }
})

// Generate secure secret if needed
async function generateSecureSecret() {
  try {
    const crypto = await import('crypto')
    return crypto.randomBytes(32).toString('base64')
  } catch {
    // Fallback if crypto is not available
    return Array.from({length: 32}, () => Math.random().toString(36)[2]).join('')
  }
}

// Test database connection
console.log('\n🗄️ Database Connection Test:')
console.log('-'.repeat(40))

try {
  const { PrismaClient } = await import('@prisma/client')
  const prisma = new PrismaClient()
  
  await prisma.$connect()
  console.log('✅ Database: Connected successfully')
  
  // Test basic query
  const userCount = await prisma.user.count()
  console.log(`✅ Database Query: ${userCount} users found`)
  
  await prisma.$disconnect()
} catch (error) {
  console.log('❌ Database: Connection failed')
  console.log(`   Error: ${error.message}`)
  configIssues.push('Database connection failed')
}

// Summary
console.log('\n🎯 VALIDATION SUMMARY')
console.log('=' .repeat(30))

if (missingVars.length === 0 && configIssues.length === 0) {
  console.log('✅ All configurations valid!')
} else {
  if (missingVars.length > 0) {
    console.log(`❌ Missing variables: ${missingVars.join(', ')}`)
  }
  if (configIssues.length > 0) {
    console.log('⚠️  Configuration issues:')
    configIssues.forEach(issue => console.log(`   - ${issue}`))
  }
}

// Generate corrected environment variables
if (missingVars.length > 0 || configIssues.length > 0) {
  console.log('\n🔧 RECOMMENDED ENVIRONMENT VARIABLES FOR COOLIFY:')
  console.log('=' .repeat(55))
  
  console.log('# Copy and paste these in Coolify Dashboard:')
  console.log('')
  console.log('NODE_ENV=production')
  console.log('NEXTAUTH_URL=https://bagizi.id')
  
  if (!process.env.NEXTAUTH_SECRET || process.env.NEXTAUTH_SECRET.length < 32) {
    const newSecret = await generateSecureSecret()
    console.log(`NEXTAUTH_SECRET=${newSecret}`)
  } else {
    console.log(`NEXTAUTH_SECRET=${process.env.NEXTAUTH_SECRET}`)
  }
  
  console.log('')
  console.log('# Database URL (replace with your actual Coolify database):')
  console.log('DATABASE_URL=postgresql://bergizi_user:secure_password@postgres:5432/bergizi_db')
  console.log('')
  console.log('# Optional (for better performance):')
  console.log('REDIS_URL=redis://redis:6379')
}

console.log('\n🚀 Next Steps:')
console.log('1. Set the above environment variables in Coolify')
console.log('2. Redeploy the application')  
console.log('3. Run this validator again to confirm')

export {}