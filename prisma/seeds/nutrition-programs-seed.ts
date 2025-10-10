// NutritionProgram Seed Data
// Bergizi-ID SaaS Platform - Program Management

import { PrismaClient, MealType } from '@prisma/client'

export async function seedNutritionPrograms(prisma: PrismaClient) {
  console.log('  → Creating nutrition programs...')

  // Fetch existing SPPGs
  const sppgs = await prisma.sPPG.findMany({
    select: { id: true, name: true, code: true }
  })

  if (sppgs.length === 0) {
    console.log('  ⚠️  No SPPG found, skipping nutrition programs seeding')
    return
  }

  const programs = []

  for (const sppg of sppgs) {
    // Create basic nutrition programs for each SPPG
    const sppgPrograms = await Promise.all([
      // Program Gizi Balita
      prisma.nutritionProgram.upsert({
        where: { programCode: `BALITA-${sppg.code}` },
        update: {},
        create: {
          name: `Program Pemenuhan Gizi Balita - ${sppg.name}`,
          description: 'Program pemenuhan gizi untuk balita usia 2-5 tahun dengan focus pada stunting prevention',
          programCode: `BALITA-${sppg.code}`,
          programType: 'STUNTING_INTERVENTION',
          targetGroup: 'TODDLER',
          sppgId: sppg.id,
          
          // Nutrition Goals
          calorieTarget: 1125, // Per day for toddler
          proteinTarget: 25,   // gram per day
          carbTarget: 155,     // gram per day
          fatTarget: 44,       // gram per day
          fiberTarget: 16,     // gram per day
          
          // Schedule
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-12-31'),
          feedingDays: [1, 2, 3, 4, 5], // Monday to Friday
          mealsPerDay: 2, // Snack pagi + makan siang
          
          // Budget & Targets
          totalBudget: 50000000, // 50 juta per tahun
          budgetPerMeal: 15000,  // 15 ribu per porsi
          targetRecipients: 200,
          currentRecipients: 0,
          
          // Location
          implementationArea: 'Wilayah Kerja SPPG',
          partnerSchools: [],
          
          status: 'ACTIVE'
        }
      }),

      // Program Gizi Anak Sekolah  
      prisma.nutritionProgram.upsert({
        where: { programCode: `SEKOLAH-${sppg.code}` },
        update: {},
        create: {
          name: `Program Makanan Tambahan Anak Sekolah - ${sppg.name}`,
          description: 'Program pemberian makanan tambahan untuk anak sekolah dasar',
          programCode: `SEKOLAH-${sppg.code}`,
          programType: 'SUPPLEMENTARY_FEEDING',
          targetGroup: 'SCHOOL_CHILDREN',
          sppgId: sppg.id,
          
          // Nutrition Goals
          calorieTarget: 1800, // Per day for school children
          proteinTarget: 45,   // gram per day
          carbTarget: 250,     // gram per day
          fatTarget: 60,       // gram per day
          fiberTarget: 20,     // gram per day
          
          // Schedule
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-12-31'),
          feedingDays: [1, 2, 3, 4, 5], // Monday to Friday
          mealsPerDay: 1, // Makan siang di sekolah
          
          // Budget & Targets
          totalBudget: 100000000, // 100 juta per tahun
          budgetPerMeal: 12000,   // 12 ribu per porsi
          targetRecipients: 500,
          currentRecipients: 0,
          
          // Location
          implementationArea: 'Sekolah Dasar di Wilayah Kerja',
          partnerSchools: ['SDN 01', 'SDN 02', 'SDN 03'],
          
          status: 'ACTIVE'
        }
      }),

      // Program Ibu Hamil
      prisma.nutritionProgram.upsert({
        where: { programCode: `BUMIL-${sppg.code}` },
        update: {},
        create: {
          name: `Program Gizi Ibu Hamil - ${sppg.name}`,
          description: 'Program pemenuhan gizi untuk ibu hamil dan menyusui',
          programCode: `BUMIL-${sppg.code}`,
          programType: 'NUTRITIONAL_RECOVERY',
          targetGroup: 'PREGNANT_WOMAN',
          sppgId: sppg.id,
          
          // Nutrition Goals
          calorieTarget: 2200, // Per day for pregnant women
          proteinTarget: 75,   // gram per day
          carbTarget: 300,     // gram per day
          fatTarget: 75,       // gram per day
          fiberTarget: 25,     // gram per day
          
          // Schedule
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-12-31'),
          feedingDays: [1, 2, 3, 4, 5, 6, 7], // Daily
          mealsPerDay: 1, // Makanan tambahan
          
          // Budget & Targets
          totalBudget: 75000000, // 75 juta per tahun
          budgetPerMeal: 20000,  // 20 ribu per porsi
          targetRecipients: 150,
          currentRecipients: 0,
          
          // Location
          implementationArea: 'Posyandu & Puskesmas',
          partnerSchools: [],
          
          status: 'ACTIVE'
        }
      })
    ])

    programs.push(...sppgPrograms)

    // Create sample menus for each program
    console.log(`  → Creating sample menus for SPPG: ${sppg.name}`)
    
    const sampleMenus = [
      {
        name: 'Nasi Ayam Soto',
        code: 'NASI-AYAM-001',
        mealType: MealType.MAKAN_SIANG,
        description: 'Nasi dengan ayam soto, lauk sayuran',
        servingSize: 300,
        calories: 450,
        protein: 25,
        carbohydrates: 55,
        fat: 12,
        fiber: 5,
        costPerServing: 12000
      },
      {
        name: 'Nasi Gudeg',
        code: 'NASI-GUDEG-001', 
        mealType: MealType.MAKAN_SIANG,
        description: 'Nasi gudeg dengan telur dan tempe',
        servingSize: 280,
        calories: 420,
        protein: 22,
        carbohydrates: 52,
        fat: 14,
        fiber: 6,
        costPerServing: 11000
      },
      {
        name: 'Bubur Ayam',
        code: 'BUBUR-AYAM-001',
        mealType: MealType.SARAPAN,
        description: 'Bubur ayam dengan kerupuk dan acar',
        servingSize: 250,
        calories: 320,
        protein: 18,
        carbohydrates: 45,
        fat: 8,
        fiber: 3,
        costPerServing: 9000
      }
    ]

    for (const program of sppgPrograms) {
      for (const menuData of sampleMenus) {
        try {
          await prisma.nutritionMenu.create({
            data: {
              programId: program.id,
              menuName: menuData.name,
              menuCode: `${menuData.code}-${program.programCode}`,
              mealType: menuData.mealType,
              description: menuData.description,
              servingSize: menuData.servingSize,
              
              // Nutritional content
              calories: menuData.calories,
              protein: menuData.protein,
              carbohydrates: menuData.carbohydrates,
              fat: menuData.fat,
              fiber: menuData.fiber,
              
              // Cost
              costPerServing: menuData.costPerServing,
              
              // Recipe information
              cookingTime: 45,
              difficulty: 'MEDIUM',
              
              // Allergen information
              allergens: [],
              isHalal: true,
              isVegetarian: menuData.name.includes('Sayur'),
              
              // Status
              isActive: true
            }
          })
        } catch (error) {
          console.error(`  ✗ Error creating menu ${menuData.name} for program ${program.name}:`, error)
        }
      }
    }
  }

  console.log(`  ✓ Created ${programs.length} nutrition programs across ${sppgs.length} SPPGs`)
  console.log(`  ✓ Created sample menus for each program`)
  return programs
}