#!/usr/bin/env node

// List Users Script - Bergizi-ID
// Quick way to view users in the database

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function listUsers() {
  try {
    console.log('🔍 BERGIZI-ID USER LIST')
    console.log('=' .repeat(60))
    
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        userRole: true,
        userType: true,
        sppgId: true,
        isActive: true,
        lastLogin: true,
        createdAt: true,
        sppg: {
          select: {
            name: true,
            code: true,
            status: true,
            isDemoAccount: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    if (users.length === 0) {
      console.log('❌ No users found in database')
      return
    }

    console.log(`📊 Total Users: ${users.length}\n`)

    // Group users by role
    const usersByRole = users.reduce((acc, user) => {
      const role = user.userRole || 'NO_ROLE'
      if (!acc[role]) acc[role] = []
      acc[role].push(user)
      return acc
    }, {} as Record<string, typeof users>)

    // Display users by role
    for (const [role, roleUsers] of Object.entries(usersByRole)) {
      console.log(`\n🏷️  ${role} (${roleUsers.length} users)`)
      console.log('-'.repeat(50))
      
      roleUsers.forEach((user, index) => {
        const status = user.isActive ? '🟢 Active' : '🔴 Inactive'
        const sppgInfo = user.sppg 
          ? `${user.sppg.name} (${user.sppg.code})${user.sppg.isDemoAccount ? ' [DEMO]' : ''}`
          : 'No SPPG'
        
        const lastLogin = user.lastLogin 
          ? new Date(user.lastLogin).toLocaleString()
          : 'Never'
          
        console.log(`   ${index + 1}. ${user.name} (${user.email})`)
        console.log(`      ID: ${user.id}`)
        console.log(`      Status: ${status}`)
        console.log(`      SPPG: ${sppgInfo}`)
        console.log(`      Last Login: ${lastLogin}`)
        console.log(`      Created: ${new Date(user.createdAt).toLocaleString()}`)
        console.log('')
      })
    }

    // Summary statistics
    console.log('\n📈 STATISTICS')
    console.log('=' .repeat(30))
    
    const activeUsers = users.filter(u => u.isActive).length
    const inactiveUsers = users.filter(u => !u.isActive).length
    const sppgUsers = users.filter(u => u.sppgId).length
    const platformUsers = users.filter(u => !u.sppgId).length
    const demoUsers = users.filter(u => u.sppg?.isDemoAccount).length
    
    console.log(`✅ Active Users: ${activeUsers}`)
    console.log(`❌ Inactive Users: ${inactiveUsers}`)
    console.log(`🏢 SPPG Users: ${sppgUsers}`)
    console.log(`⚙️  Platform Users: ${platformUsers}`)
    console.log(`🎭 Demo Users: ${demoUsers}`)

    // Recent activity
    const recentlyActive = users.filter(u => 
      u.lastLogin && new Date(u.lastLogin) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    ).length
    
    console.log(`🔥 Active in last 7 days: ${recentlyActive}`)

  } catch (error) {
    console.error('❌ Error listing users:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the script
listUsers()
  .then(() => {
    console.log('\n✅ User list completed!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Script failed:', error)
    process.exit(1)
  })