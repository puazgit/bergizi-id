/**
 * Beneficiary Seed - Real Growth Pattern Data
 * Generates realistic beneficiary data with growth trends for dashboard charts
 */

import { PrismaClient, SPPG, NutritionProgram, BeneficiaryType } from '@prisma/client'

export async function seedBeneficiaries(
  prisma: PrismaClient, 
  sppgs: SPPG[], 
  programs: NutritionProgram[]
) {
  console.log('  → Creating school beneficiaries with realistic growth patterns...')

  // Get some village data for beneficiaries
  const villages = await prisma.village.findMany({
    take: 20,
    where: { isActive: true }
  })

  if (villages.length === 0) {
    console.log('  ⚠ No villages found, skipping beneficiary seed')
    return 0
  }

  const beneficiaries = []
  const currentDate = new Date()

  // Create beneficiaries for each SPPG with realistic growth patterns
  for (const sppg of sppgs) {
    const sppgPrograms = programs.filter(p => p.sppgId === sppg.id)
    if (sppgPrograms.length === 0) continue

    // Base beneficiary count per SPPG (realistic Indonesian SPPG capacity)
    const baseBeneficiaryCount = sppg.isDemoAccount ? 50 : 800 + Math.floor(Math.random() * 400) // 800-1200 per SPPG

    // Generate historical beneficiaries (12 months back) with growth trend
    for (let monthsBack = 11; monthsBack >= 0; monthsBack--) {
      const monthDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - monthsBack, 1)
      
      // Calculate monthly growth pattern (realistic 2-5% monthly growth)
      const growthRate = 1 + (0.02 + Math.random() * 0.03) // 2-5% growth per month
      const monthMultiplier = Math.pow(growthRate, 11 - monthsBack)
      const monthlyBeneficiaryCount = Math.floor(baseBeneficiaryCount * monthMultiplier * (0.9 + Math.random() * 0.2)) // ±10% variation

      // Distribute beneficiaries across programs for this month
      for (let i = 0; i < monthlyBeneficiaryCount; i++) {
        const program = sppgPrograms[Math.floor(Math.random() * sppgPrograms.length)]
        const village = villages[Math.floor(Math.random() * villages.length)]
        
        const totalStudents = 25 + Math.floor(Math.random() * 175) // 25-200 students per school
        const targetStudents = Math.floor(totalStudents * (0.6 + Math.random() * 0.4)) // 60-100% of total
        const activeStudents = Math.floor(targetStudents * (0.8 + Math.random() * 0.2)) // 80-100% of target
        
        // Generate realistic beneficiary data according to schema
        const beneficiaryData = {
          programId: program.id,
          schoolName: generateSchoolName(sppg.name),
          schoolCode: generateSchoolCode(),
          schoolType: generateSchoolType(),
          schoolStatus: Math.random() > 0.7 ? 'SWASTA' : 'NEGERI',
          principalName: generatePersonName(),
          contactPhone: generatePhoneNumber(),
          contactEmail: generateEmail(),
          schoolAddress: generateSchoolAddress(),
          villageId: village.id,
          postalCode: village.postalCode || '12345',
          totalStudents,
          targetStudents,
          activeStudents,
          students4to6Years: totalStudents < 100 ? Math.floor(totalStudents * 0.1) : 0, // PAUD/TK
          students7to12Years: Math.floor(totalStudents * 0.7), // SD
          students13to15Years: Math.floor(totalStudents * 0.2), // SMP  
          students16to18Years: Math.floor(totalStudents * 0.1), // SMA
          feedingDays: [1, 2, 3, 4, 5], // Monday to Friday
          mealsPerDay: 1,
          feedingTime: '12:00',
          deliveryAddress: generateSchoolAddress(),
          deliveryContact: generatePersonName(),
          servingMethod: Math.random() > 0.5 ? 'CAFETERIA' : 'CLASSROOM',
          hasKitchen: Math.random() > 0.4,
          hasStorage: Math.random() > 0.3,
          hasCleanWater: Math.random() > 0.1,
          hasElectricity: Math.random() > 0.05,
          enrollmentDate: monthDate,
          isActive: monthsBack <= 3, // Keep recent ones active
          beneficiaryType: 'CHILD' as const,
          specialDietary: Math.random() > 0.8 ? [generateDietaryRestrictions()] : [],
          allergyAlerts: Math.random() > 0.9 ? [generateAllergyInfo()] : [],
          culturalReqs: Math.random() > 0.7 ? ['Halal'] : [],
          // Timestamps for growth tracking
          createdAt: new Date(monthDate.getTime() + Math.random() * 30 * 24 * 60 * 60 * 1000), // Random day in month
          updatedAt: new Date()
        }

        beneficiaries.push(beneficiaryData)
      }
    }
  }

  // Batch insert beneficiaries
  const batchSize = 100
  let createdCount = 0

  for (let i = 0; i < beneficiaries.length; i += batchSize) {
    const batch = beneficiaries.slice(i, i + batchSize)
    
    await prisma.schoolBeneficiary.createMany({
      data: batch,
      skipDuplicates: true
    })
    
    createdCount += batch.length
    console.log(`    ✓ Created ${createdCount}/${beneficiaries.length} beneficiaries...`)
  }

  console.log(`  ✓ Created ${createdCount} school beneficiaries with realistic growth patterns`)
  return createdCount
}

// Helper functions for realistic data generation
function generateSchoolCode(): string {
  // Generate realistic NPSN (Nomor Pokok Sekolah Nasional)
  return Math.floor(10000000 + Math.random() * 90000000).toString()
}

function generateSchoolType(): string {
  const types = ['SD', 'SMP', 'SMA', 'SMK', 'PAUD', 'TK']
  return types[Math.floor(Math.random() * types.length)]
}

function generateSchoolName(sppgName: string): string {
  const schoolTypes = ['SD Negeri', 'SD Swasta', 'MI', 'SD Islam', 'SD Katolik', 'SD Kristen']
  const schoolNumbers = Array.from({length: 50}, (_, i) => (i + 1).toString().padStart(2, '0'))
  
  const city = sppgName.split(' ')[1] || 'Jakarta'
  const type = schoolTypes[Math.floor(Math.random() * schoolTypes.length)]
  const number = schoolNumbers[Math.floor(Math.random() * schoolNumbers.length)]
  
  return `${type} ${number} ${city}`
}

function generateSchoolAddress(): string {
  const streets = [
    'Jl. Merdeka', 'Jl. Sudirman', 'Jl. Thamrin', 'Jl. Gatot Subroto', 
    'Jl. Ahmad Yani', 'Jl. Diponegoro', 'Jl. Veteran', 'Jl. Pahlawan',
    'Jl. Kartini', 'Jl. Dewi Sartika'
  ]
  const districts = [
    'Menteng', 'Gambir', 'Tanah Abang', 'Cempaka Putih', 'Johar Baru',
    'Kemayoran', 'Sawah Besar', 'Senen'
  ]
  
  const street = streets[Math.floor(Math.random() * streets.length)]
  const number = Math.floor(Math.random() * 200) + 1
  const district = districts[Math.floor(Math.random() * districts.length)]
  
  return `${street} No. ${number}, ${district}`
}

function generatePersonName(): string {
  const firstNames = [
    'Ahmad', 'Siti', 'Budi', 'Ani', 'Eko', 'Sri', 'Dedi', 'Rina',
    'Agus', 'Dewi', 'Hendra', 'Maya', 'Rudi', 'Sari', 'Bambang', 'Indira'
  ]
  const lastNames = [
    'Wijaya', 'Santoso', 'Pratama', 'Sari', 'Putra', 'Wati', 'Kusuma',
    'Handoko', 'Maharani', 'Setiawan', 'Rahayu', 'Permana'
  ]
  
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)]
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)]
  
  return `${firstName} ${lastName}`
}

function generatePhoneNumber(): string {
  const prefixes = ['0811', '0812', '0813', '0821', '0822', '0823', '0851', '0852', '0853']
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)]
  const number = Math.floor(Math.random() * 90000000) + 10000000 // 8 digit number
  
  return `${prefix}-${number.toString().slice(0, 4)}-${number.toString().slice(4)}`
}

function generateEmail(): string {
  const domains = ['gmail.com', 'yahoo.co.id', 'hotmail.com', 'outlook.com']
  const domain = domains[Math.floor(Math.random() * domains.length)]
  const username = 'user' + Math.floor(Math.random() * 10000)
  
  return `${username}@${domain}`
}

function generateAllergyInfo(): string {
  const allergies = [
    'Alergi kacang-kacangan',
    'Alergi seafood',
    'Alergi telur',
    'Alergi susu',
    'Alergi gluten',
    'Alergi kedelai'
  ]
  
  return allergies[Math.floor(Math.random() * allergies.length)]
}

function generateDietaryRestrictions(): string {
  const restrictions = [
    'Vegetarian',
    'Halal only',
    'No pork products',
    'Low sodium',
    'Diabetic diet'
  ]
  
  return restrictions[Math.floor(Math.random() * restrictions.length)]
}