// Production Seed Data - Week of October 8, 2025
// Bergizi-ID SaaS Platform - Production Management

import { PrismaClient, ProductionStatus } from '@prisma/client'

/**
 * Seed production data for current week (October 8-14, 2025)
 * Following enterprise-grade production scheduling patterns
 */
export async function seedProduction(prisma: PrismaClient) {
  console.log('  → Creating production schedules for week of October 8, 2025...')

  try {
    // Get existing SPPG data
    const sppgs = await prisma.sPPG.findMany({
      include: {
        nutritionPrograms: {
          include: {
            menus: true
          }
        },
        users: true
      }
    })

    if (sppgs.length === 0) {
      console.log('  ⚠ No SPPG data found. Please run SPPG seed first.')
      return
    }

    // Current week dates (October 8-14, 2025)
    const currentWeek = [
      new Date('2025-10-08T00:00:00.000Z'), // Tuesday
      new Date('2025-10-09T00:00:00.000Z'), // Wednesday  
      new Date('2025-10-10T00:00:00.000Z'), // Thursday
      new Date('2025-10-11T00:00:00.000Z'), // Friday
      new Date('2025-10-12T00:00:00.000Z'), // Saturday
      new Date('2025-10-13T00:00:00.000Z'), // Sunday
      new Date('2025-10-14T00:00:00.000Z'), // Monday
    ]

    // Production time slots for different meal types
    const mealTimeSlots = {
      'SARAPAN': { start: '05:00', end: '07:00' },
      'MAKAN_SIANG': { start: '09:00', end: '11:00' },
      'MAKAN_MALAM': { start: '15:00', end: '17:00' },
      'SNACK_PAGI': { start: '07:30', end: '09:00' },
      'SNACK_SORE': { start: '13:00', end: '14:30' }
    }

    let productionCount = 0
    let batchCounter = 1

    for (const sppg of sppgs) {
      // Skip if no programs or menus
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (!sppg.nutritionPrograms.length || !sppg.nutritionPrograms.some((p: any) => p.menus.length > 0)) {
        console.log(`  ⚠ SPPG ${sppg.name} has no programs or menus. Skipping.`)
        continue
      }

      // Get kitchen staff (head cook and assistants)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const kitchenStaff = sppg.users.filter((u: any) => 
        u.userRole === 'SPPG_STAFF_DAPUR' || 
        u.userRole === 'SPPG_PRODUKSI_MANAGER' ||
        u.userRole === 'SPPG_ADMIN'
      )

      if (kitchenStaff.length === 0) {
        console.log(`  ⚠ SPPG ${sppg.name} has no kitchen staff. Skipping.`)
        continue
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const headCook = kitchenStaff.find((u: any) => u.userRole === 'SPPG_PRODUKSI_MANAGER') || kitchenStaff[0]
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const assistants = kitchenStaff.filter((u: any) => u.id !== headCook.id).slice(0, 2)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const supervisor = sppg.users.find((u: any) => u.userRole === 'SPPG_ADMIN' || u.userRole === 'SPPG_KEPALA')

      // Create productions for each day of the week
      for (let dayIndex = 0; dayIndex < currentWeek.length; dayIndex++) {
        const productionDate = currentWeek[dayIndex]
        const isWeekend = dayIndex >= 5 // Saturday & Sunday
        const isToday = dayIndex === 0 // Tuesday (today)
        const isPast = dayIndex < 0 // No past days in this case
        // const isFuture = dayIndex > 2 // Future days

        // Get active programs for this SPPG
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const activePrograms = sppg.nutritionPrograms.filter((p: any) => p.menus.length > 0)

        for (const program of activePrograms) {
          // Create 2-3 productions per day (breakfast, lunch, dinner)
          const menusToSchedule = program.menus.slice(0, 3) // Take first 3 menus

          for (let menuIndex = 0; menuIndex < menusToSchedule.length; menuIndex++) {
            const menu = menusToSchedule[menuIndex]
            const mealTypes = Object.keys(mealTimeSlots)
            const mealType = mealTypes[menuIndex % mealTypes.length]
            const timeSlot = mealTimeSlots[mealType as keyof typeof mealTimeSlots]

            // Calculate portions based on program beneficiaries
            const basePortion = 50 + (Math.floor(Math.random() * 100)) // 50-150 portions
            const plannedPortions = basePortion * (isWeekend ? 0.7 : 1) // Reduced on weekends

            // Determine production status based on date
            let status: ProductionStatus
            let actualPortions: number | null = null
            let actualStartTime: Date | null = null
            let actualEndTime: Date | null = null
            let actualCost: number | null = null
            let qualityPassed: boolean | null = null

            if (isPast) {
              status = 'COMPLETED'
              actualPortions = Math.floor(plannedPortions * (0.95 + Math.random() * 0.1)) // 95-105% of planned
              actualStartTime = new Date(`${productionDate.toISOString().split('T')[0]}T${timeSlot.start}:00.000Z`)
              actualEndTime = new Date(actualStartTime.getTime() + 2 * 60 * 60 * 1000) // 2 hours later
              actualCost = menu.costPerServing * actualPortions * (0.98 + Math.random() * 0.04) // 98-102% of estimated
              qualityPassed = Math.random() > 0.05 // 95% pass rate
            } else if (isToday) {
              const hour = parseInt(timeSlot.start.split(':')[0])
              const currentHour = new Date().getUTCHours() + 7 // WIB timezone
              
              if (currentHour > hour + 2) {
                status = 'COMPLETED'
                actualPortions = Math.floor(plannedPortions * (0.95 + Math.random() * 0.1))
                actualStartTime = new Date(`${productionDate.toISOString().split('T')[0]}T${timeSlot.start}:00.000Z`)
                actualEndTime = new Date(actualStartTime.getTime() + 2 * 60 * 60 * 1000)
                actualCost = menu.costPerServing * actualPortions * (0.98 + Math.random() * 0.04)
                qualityPassed = Math.random() > 0.05
              } else if (currentHour > hour - 1) {
                status = Math.random() > 0.3 ? 'COOKING' : 'PREPARING'
                actualStartTime = new Date(`${productionDate.toISOString().split('T')[0]}T${timeSlot.start}:00.000Z`)
              } else {
                status = 'PLANNED'
              }
            } else {
              status = 'PLANNED'
            }

            // Calculate estimated cost
            const estimatedCost = menu.costPerServing * plannedPortions

            // Quality metrics
            const hygieneScore = 80 + Math.floor(Math.random() * 20) // 80-100
            const tasteRating = 3 + Math.floor(Math.random() * 3) // 3-5
            const appearanceRating = 3 + Math.floor(Math.random() * 3) // 3-5
            const textureRating = 3 + Math.floor(Math.random() * 3) // 3-5

            // Waste amount (realistic range)
            const wasteAmount = status === 'COMPLETED' ? 
              (actualPortions || plannedPortions) * 0.05 * (0.5 + Math.random()) : null // 2.5-7.5% waste

            try {
              await prisma.foodProduction.create({
                data: {
                  sppgId: sppg.id,
                  programId: program.id,
                  menuId: menu.id,
                  
                  // Production Planning
                  productionDate,
                  batchNumber: `BATCH-${String(batchCounter).padStart(6, '0')}`,
                  plannedPortions: Math.floor(plannedPortions),
                  actualPortions,

                  // Staff Assignment
                  headCook: headCook.id,
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  assistantCooks: assistants.map((a: any) => a.id),
                  supervisorId: supervisor?.id,

                  // Production Schedule
                  plannedStartTime: new Date(`${productionDate.toISOString().split('T')[0]}T${timeSlot.start}:00.000Z`),
                  plannedEndTime: new Date(`${productionDate.toISOString().split('T')[0]}T${timeSlot.end}:00.000Z`),
                  actualStartTime,
                  actualEndTime,

                  // Cost Tracking
                  estimatedCost,
                  actualCost,
                  costPerPortion: actualCost ? actualCost / (actualPortions || plannedPortions) : null,

                  // Quality Parameters
                  targetTemperature: 75.0, // Standard safe temperature
                  actualTemperature: status === 'COMPLETED' ? 74.0 + Math.random() * 4 : null, // 74-78°C
                  hygieneScore: status === 'COMPLETED' ? hygieneScore : null,
                  tasteRating: status === 'COMPLETED' ? tasteRating : null,
                  appearanceRating: status === 'COMPLETED' ? appearanceRating : null,
                  textureRating: status === 'COMPLETED' ? textureRating : null,

                  // Production Status
                  status,

                  // Quality Control
                  qualityPassed,
                  rejectionReason: qualityPassed === false ? 'Temperature tidak sesuai standar' : null,

                  // Waste Management
                  wasteAmount,
                  wasteNotes: wasteAmount ? 'Sisa sayuran tidak terpakai' : null,

                  // Documentation
                  notes: `Produksi ${mealType.toLowerCase().replace('_', ' ')} untuk ${menu.menuName}`,
                  photos: status === 'COMPLETED' ? [
                    `https://images.bergizi.id/production/${batchCounter}/final.jpg`,
                    `https://images.bergizi.id/production/${batchCounter}/process.jpg`
                  ] : []
                }
              })

              productionCount++
              batchCounter++

              // Quality control will be created separately if needed

            } catch (error) {
              console.error(`  ✗ Error creating production for ${sppg.name} - ${menu.menuName}:`, error)
            }
          }
        }
      }
    }

    console.log(`  ✓ Created ${productionCount} production schedules`)
    console.log(`  ✓ Generated ${batchCounter - 1} batch numbers`)
    
    // Summary statistics
    const statusCounts = await prisma.foodProduction.groupBy({
      by: ['status'],
      _count: {
        status: true
      }
    })

    console.log('  📊 Production Status Summary:')
    statusCounts.forEach(stat => {
      console.log(`    - ${stat.status}: ${stat._count.status} productions`)
    })

  } catch (error) {
    console.error('  ✗ Error seeding production data:', error)
    throw error
  }
}

// Helper functions removed to eliminate unused function warnings