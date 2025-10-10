// Master Prisma Seed with Authentication
// Bergizi-ID SaaS Platform - Development Data Seeding

import { PrismaClient } from '@prisma/client'
import { seedSppg } from './seeds/sppg-seed'
import { seedAuthUsers } from './seeds/auth-seed'
import { seedNutritionPrograms } from './seeds/nutrition-programs-seed'
import { seedProduction } from './seeds/production-seed'
import { seedBeneficiaries } from './seeds/beneficiary-seed'
import { seedFeedback } from './seeds/feedback-seed'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  try {
    // 1. Create SPPG entities first (required for users)
    console.log('🏢 Seeding SPPG entities...')
    await seedSppg(prisma)

    // 2. Create Nutrition Programs (requires existing SPPG data)
    console.log('🍎 Seeding nutrition programs...')
    const programs = await seedNutritionPrograms(prisma)

    // 3. Seed authentication users (requires existing SPPG data)
    console.log('👤 Seeding authentication users...')
    await seedAuthUsers(prisma)

    // 4. Seed school beneficiaries with growth patterns (requires SPPG and programs)
    console.log('🏫 Seeding school beneficiaries with realistic growth patterns...')
    const sppgs = await prisma.sPPG.findMany()
    if (programs && programs.length > 0) {
      await seedBeneficiaries(prisma, sppgs, programs)
    } else {
      console.log('  ⚠ No programs found, skipping beneficiary seed')
    }

    // 5. Seed production data for current week (requires SPPG, programs, and users)
    console.log('🏭 Seeding production schedules for current week...')
    await seedProduction(prisma)

    // 6. Seed feedback data (requires SPPG, programs, and beneficiaries)
    console.log('💬 Seeding feedback data...')
    await seedFeedback(prisma)

    console.log('✅ Database seeding completed successfully!')
    console.log('')
    console.log('🔐 Authentication Test Accounts:')
    console.log('┌─────────────────────┬──────────────────────────────┬─────────────┐')
    console.log('│ Role                │ Email                        │ Password    │')
    console.log('├─────────────────────┼──────────────────────────────┼─────────────┤')
    console.log('│ Platform SuperAdmin │ superadmin@bergizi-id.com    │ password123 │')
    console.log('│ Platform Support    │ support@bergizi-id.com       │ password123 │')
    console.log('│ SPPG Kepala         │ kepala@sppg-jakarta.com      │ password123 │')
    console.log('│ SPPG Admin          │ admin@sppg-jakarta.com       │ password123 │')
    console.log('│ Ahli Gizi           │ ahligizi@sppg-jakarta.com    │ password123 │')
    console.log('│ Demo User           │ demo@bergizi-id.com          │ password123 │')
    console.log('└─────────────────────┴──────────────────────────────┴─────────────┘')
    console.log('')
    console.log('🚀 Ready to test authentication system!')

  } catch (error) {
    console.error('❌ Error during seeding:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()