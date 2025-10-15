#!/usr/bin/env node

/**
 * QUICK PRODUCTION HEALTH CHECK
 * One-liner diagnostic for Coolify deployment
 */

const chalk = {
  green: (text) => `\x1b[32m${text}\x1b[0m`,
  red: (text) => `\x1b[31m${text}\x1b[0m`,
  yellow: (text) => `\x1b[33m${text}\x1b[0m`,
  blue: (text) => `\x1b[34m${text}\x1b[0m`,
  bold: (text) => `\x1b[1m${text}\x1b[0m`
}

console.log(chalk.bold('🚀 BERGIZI-ID PRODUCTION HEALTH CHECK'))
console.log('=====================================\n')

// Quick checks
const checks = [
  {
    name: 'NEXTAUTH_URL',
    check: () => !!process.env.NEXTAUTH_URL,
    value: () => process.env.NEXTAUTH_URL || 'NOT SET',
    critical: true
  },
  {
    name: 'NEXTAUTH_SECRET',
    check: () => !!process.env.NEXTAUTH_SECRET && process.env.NEXTAUTH_SECRET.length >= 32,
    value: () => process.env.NEXTAUTH_SECRET ? `SET (${process.env.NEXTAUTH_SECRET.length} chars)` : 'NOT SET',
    critical: true
  },
  {
    name: 'DATABASE_URL',
    check: () => !!process.env.DATABASE_URL,
    value: () => process.env.DATABASE_URL ? 'SET' : 'NOT SET',
    critical: true
  },
  {
    name: 'NODE_ENV',
    check: () => process.env.NODE_ENV === 'production',
    value: () => process.env.NODE_ENV || 'NOT SET',
    critical: false
  }
]

let criticalFails = 0

checks.forEach(({ name, check, value, critical }) => {
  const passed = check()
  const status = passed ? chalk.green('✅') : chalk.red('❌')
  const priority = critical ? '[CRITICAL]' : '[OPTIONAL]'
  
  console.log(`${status} ${priority} ${name}: ${value()}`)
  
  if (!passed && critical) {
    criticalFails++
  }
})

console.log(`\n${chalk.bold('OVERALL STATUS:')}`)

if (criticalFails === 0) {
  console.log(chalk.green('🎉 ALL CRITICAL CHECKS PASSED!'))
  console.log(chalk.blue('💡 Ready for testing at https://bagizi.id/login'))
} else {
  console.log(chalk.red(`❌ ${criticalFails} CRITICAL ISSUE(S) FOUND`))
  console.log(chalk.yellow('🔧 Run: node scripts/debug-auth.mjs for detailed fixes'))
}

console.log(`\n${chalk.bold('QUICK FIXES:')}`)
if (!process.env.NEXTAUTH_URL) {
  console.log(chalk.yellow('1. Set NEXTAUTH_URL=https://bagizi.id in Coolify'))
}
if (!process.env.NEXTAUTH_SECRET || process.env.NEXTAUTH_SECRET.length < 32) {
  console.log(chalk.yellow('2. Generate: openssl rand -base64 32'))
  console.log(chalk.yellow('   Set as NEXTAUTH_SECRET in Coolify'))
}
if (!process.env.DATABASE_URL) {
  console.log(chalk.yellow('3. Copy PostgreSQL URL from Coolify services'))
}

console.log(`\n${chalk.bold('NEXT STEPS:')}`)
console.log('• Fix environment variables in Coolify dashboard')
console.log('• Redeploy application')
console.log('• Run: node scripts/validate-auth-production.mjs')
console.log('• Test: https://bagizi.id/login')

process.exit(criticalFails > 0 ? 1 : 0)