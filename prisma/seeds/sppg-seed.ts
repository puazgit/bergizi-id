// SPPG Seed Data
// Bergizi-ID SaaS Platform - Tenant Creation

import { PrismaClient } from '@prisma/client'

export async function seedSppg(prisma: PrismaClient) {
  console.log('  → Creating minimal province data...')

  // Create minimal province, regency, district, village for SPPG requirements
  const province = await prisma.province.upsert({
    where: { provinceCode: '32' },
    update: {},
    create: {
      provinceCode: '32',
      provinceName: 'Jawa Barat',
      region: 'JAWA',
      timezone: 'WIB',
      capital: 'Bandung',
      createdBy: 'system',
      updatedBy: 'system'
    }
  })

  const regency = await prisma.regency.upsert({
    where: { 
      provinceId_regencyCode: {
        provinceId: province.id,
        regencyCode: '3214'
      }
    },
    update: {},
    create: {
      regencyCode: '3214',
      regencyName: 'Purwakarta',
      provinceId: province.id,
      regencyType: 'REGENCY',
      createdBy: 'system',
      updatedBy: 'system'
    }
  })

  const district = await prisma.district.upsert({
    where: {
      regencyId_districtCode: {
        regencyId: regency.id,
        districtCode: '321401'
      }
    },
    update: {},
    create: {
      districtCode: '321401',
      districtName: 'Purwakarta',
      regencyId: regency.id,
      createdBy: 'system',
      updatedBy: 'system'
    }
  })

  const village = await prisma.village.upsert({
    where: {
      districtId_villageCode: {
        districtId: district.id,
        villageCode: '32140101'
      }
    },
    update: {},
    create: {
      villageCode: '32140101',
      villageName: 'Purwakarta Kulon',
      districtId: district.id,
      villageType: 'URBAN_VILLAGE',
      createdBy: 'system',
      updatedBy: 'system'
    }
  })

  console.log('  → Creating SPPG entities (tenants)...')

  const sppgs = await Promise.all([
    // Production SPPG - Purwakarta
    prisma.sPPG.upsert({
      where: { code: 'SPPG-PWK-001' },
      update: {},
      create: {
        code: 'SPPG-PWK-001',
        name: 'SPPG Purwakarta',
        description: 'SPPG Kabupaten Purwakarta - Jawa Barat',
        addressDetail: 'Jl. Gandanegara No. 25, Purwakarta, Jawa Barat 41115',
        provinceId: province.id,
        regencyId: regency.id,
        districtId: district.id,
        villageId: village.id,
        postalCode: '41115',
        coordinates: '-6.5564,107.4406',
        phone: '0264-200123',
        email: 'info@sppg-purwakarta.com',
        picName: 'Dr. Siti Nurhaliza',
        picPosition: 'Kepala SPPG',
        picPhone: '0264-200124',
        picEmail: 'kepala@sppg-purwakarta.com',
        organizationType: 'PEMERINTAH',
        targetRecipients: 10000,
        maxRadius: 25.0,
        maxTravelTime: 60,
        operationStartDate: new Date('2024-01-01'),
        status: 'ACTIVE',
        isDemoAccount: false
      }
    }),

    // Demo SPPG - using same geographic data for simplicity
    prisma.sPPG.upsert({
      where: { code: 'DEMO-SPPG-001' },
      update: {},
      create: {
        code: 'DEMO-SPPG-001',
        name: 'Demo SPPG',
        description: 'Demo account untuk testing dan trial',
        addressDetail: 'Jl. Demo No. 123, Purwakarta (Demo)',
        provinceId: province.id,
        regencyId: regency.id,
        districtId: district.id,
        villageId: village.id,
        postalCode: '41115',
        coordinates: '-6.1934,106.8226',
        phone: '021-00000000',
        email: 'demo@sppg.id',
        picName: 'Demo User',
        picPosition: 'Demo Manager',
        picPhone: '021-00000001',
        picEmail: 'manager@demo.sppg.id',
        organizationType: 'KOMUNITAS',
        targetRecipients: 100,
        maxRadius: 10.0,
        maxTravelTime: 30,
        operationStartDate: new Date('2024-01-15'),
        status: 'ACTIVE',
        isDemoAccount: true,
        demoExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        demoMaxBeneficiaries: 100,
        demoAllowedFeatures: [
          'MENU_MANAGEMENT',
          'PROCUREMENT',
          'BASIC_REPORTING'
        ]
      }
    })
  ])

  console.log(`  ✓ Created ${sppgs.length} SPPG entities`)
  console.log('    - Production SPPG: SPPG Purwakarta (SPPG-PWK-001)')
  console.log('    - Demo SPPG: Demo SPPG (DEMO-SPPG-001)')

  return sppgs
}