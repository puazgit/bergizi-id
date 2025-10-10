// Authentication Test Seed Data
// Bergizi-ID SaaS Platform - Development & Testing

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

export async function seedAuthUsers(prisma: PrismaClient) {
  console.log('  → Creating authentication test users...')

  // Hash password for all test users
  const hashedPassword = await bcrypt.hash('password123', 12)

  // Get demo SPPG for testing
  const demoSppg = await prisma.sPPG.findFirst({
    where: {
      isDemoAccount: true
    }
  })

  // Get production SPPG for testing
  const productionSppg = await prisma.sPPG.findFirst({
    where: {
      isDemoAccount: false
    }
  })

  const authUsers = [
    // ===== PLATFORM LEVEL USERS =====
    {
      email: 'superadmin@bergizi.id',
      password: hashedPassword,
      name: 'Super Administrator',
      userType: 'SUPERADMIN' as const,
      userRole: 'PLATFORM_SUPERADMIN' as const,
      sppgId: null,
      isActive: true,
      emailVerified: new Date()
    },
    {
      email: 'support@bergizi.id',
      password: hashedPassword,
      name: 'Platform Support',
      userType: 'SUPERADMIN' as const,
      userRole: 'PLATFORM_SUPPORT' as const,
      sppgId: null,
      isActive: true,
      emailVerified: new Date()
    },
    {
      email: 'analyst@bergizi.id',
      password: hashedPassword,
      name: 'Platform Analyst',
      userType: 'SUPERADMIN' as const,
      userRole: 'PLATFORM_ANALYST' as const,
      sppgId: null,
      isActive: true,
      emailVerified: new Date()
    },

    // ===== PRODUCTION SPPG USERS =====
    ...(productionSppg ? [
      {
        email: 'kepala@sppg-purwakarta.com',
        password: hashedPassword,
        name: 'Dr. Siti Nurhaliza',
        userType: 'SPPG_ADMIN' as const,
        userRole: 'SPPG_KEPALA' as const,
        sppgId: productionSppg.id,
        isActive: true,
        emailVerified: new Date(),
        jobTitle: 'Kepala SPPG',
        department: 'Management'
      },
      {
        email: 'admin@sppg-purwakarta.com',
        password: hashedPassword,
        name: 'Budi Santoso',
        userType: 'SPPG_ADMIN' as const,
        userRole: 'SPPG_ADMIN' as const,
        sppgId: productionSppg.id,
        isActive: true,
        emailVerified: new Date(),
        jobTitle: 'Administrator SPPG',
        department: 'Administration'
      },
      {
        email: 'ahligizi@sppg-purwakarta.com',
        password: hashedPassword,
        name: 'Dr. Maya Sari',
        userType: 'SPPG_USER' as const,
        userRole: 'SPPG_AHLI_GIZI' as const,
        sppgId: productionSppg.id,
        isActive: true,
        emailVerified: new Date(),
        jobTitle: 'Ahli Gizi',
        department: 'Nutrition'
      },
      {
        email: 'akuntan@sppg-purwakarta.com',
        password: hashedPassword,
        name: 'Andi Wijaya',
        userType: 'SPPG_USER' as const,
        userRole: 'SPPG_AKUNTAN' as const,
        sppgId: productionSppg.id,
        isActive: true,
        emailVerified: new Date(),
        jobTitle: 'Akuntan',
        department: 'Finance'
      },
      {
        email: 'produksi@sppg-purwakarta.com',
        password: hashedPassword,
        name: 'Rina Kartika',
        userType: 'SPPG_USER' as const,
        userRole: 'SPPG_PRODUKSI_MANAGER' as const,
        sppgId: productionSppg.id,
        isActive: true,
        emailVerified: new Date(),
        jobTitle: 'Manager Produksi',
        department: 'Production'
      },
      {
        email: 'distribusi@sppg-purwakarta.com',
        password: hashedPassword,
        name: 'Joko Susilo',
        userType: 'SPPG_USER' as const,
        userRole: 'SPPG_DISTRIBUSI_MANAGER' as const,
        sppgId: productionSppg.id,
        isActive: true,
        emailVerified: new Date(),
        jobTitle: 'Manager Distribusi',
        department: 'Distribution'
      },
      {
        email: 'hrd@sppg-purwakarta.com',
        password: hashedPassword,
        name: 'Sri Mulyani',
        userType: 'SPPG_USER' as const,
        userRole: 'SPPG_HRD_MANAGER' as const,
        sppgId: productionSppg.id,
        isActive: true,
        emailVerified: new Date(),
        jobTitle: 'Manager HRD',
        department: 'Human Resources'
      },
      {
        email: 'dapur@sppg-purwakarta.com',
        password: hashedPassword,
        name: 'Wati Suryani',
        userType: 'SPPG_USER' as const,
        userRole: 'SPPG_STAFF_DAPUR' as const,
        sppgId: productionSppg.id,
        isActive: true,
        emailVerified: new Date(),
        jobTitle: 'Staff Dapur',
        department: 'Kitchen'
      },
      {
        email: 'qc@sppg-purwakarta.com',
        password: hashedPassword,
        name: 'Ahmad Fauzi',
        userType: 'SPPG_USER' as const,
        userRole: 'SPPG_STAFF_QC' as const,
        sppgId: productionSppg.id,
        isActive: true,
        emailVerified: new Date(),
        jobTitle: 'Staff Quality Control',
        department: 'Quality Assurance'
      },
      {
        email: 'viewer@sppg-purwakarta.com',
        password: hashedPassword,
        name: 'Lisa Permata',
        userType: 'SPPG_USER' as const,
        userRole: 'SPPG_VIEWER' as const,
        sppgId: productionSppg.id,
        isActive: true,
        emailVerified: new Date(),
        jobTitle: 'Staff Administrasi',
        department: 'Administration'
      }
    ] : []),

    // ===== DEMO SPPG USERS =====
    ...(demoSppg ? [
      {
        email: 'demo@example.com',
        password: hashedPassword,
        name: 'Demo User',
        userType: 'DEMO_REQUEST' as const,
        userRole: 'DEMO_USER' as const,
        sppgId: demoSppg.id,
        isActive: true,
        emailVerified: new Date(),
        jobTitle: 'Demo Account',
        department: 'Demo',
        demoStatus: 'IN_PROGRESS' as const,
        demoStartedAt: new Date(),
        demoExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
      },
      {
        email: 'demo.admin@demo.com',
        password: hashedPassword,
        name: 'Demo Admin',
        userType: 'DEMO_REQUEST' as const,
        userRole: 'SPPG_ADMIN' as const,
        sppgId: demoSppg.id,
        isActive: true,
        emailVerified: new Date(),
        jobTitle: 'Demo Administrator',
        department: 'Demo',
        demoStatus: 'IN_PROGRESS' as const,
        demoStartedAt: new Date(),
        demoExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
      }
    ] : [])
  ]

  // Create users with upsert to avoid duplicates
  const createdUsers = await Promise.all(
    authUsers.map(async (userData) => {
      return prisma.user.upsert({
        where: { email: userData.email },
        update: {
          password: userData.password,
          isActive: userData.isActive
        },
        create: userData
      })
    })
  )

  console.log(`  ✓ Created ${createdUsers.length} authentication test users`)
  console.log('  ✓ Test credentials:')
  console.log('    - Platform Admin: superadmin@bergizi.id / password123')
  console.log('    - SPPG Kepala: kepala@sppg-purwakarta.com / password123')
  console.log('    - SPPG Admin: admin@sppg-purwakarta.com / password123')
  console.log('    - Demo User: demo@example.com / password123')

  return createdUsers
}