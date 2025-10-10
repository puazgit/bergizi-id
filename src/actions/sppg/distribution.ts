'use server'

import { auth } from '@/auth'
import db from '@/lib/db'
import { ServiceResult } from '@/lib/service-result'
import { hasPermission, checkSppgAccess } from '@/lib/permissions'
import { revalidatePath } from 'next/cache'
import Redis from 'ioredis'
import { z } from 'zod'
import { DistributionStatus } from '@prisma/client'

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379')

// ============================================================================
// ENTERPRISE VALIDATION SCHEMAS
// ============================================================================

const createDistributionSchema = z.object({
  programId: z.string().cuid(),
  productionId: z.string().cuid().optional(),
  distributionDate: z.string().datetime(),
  distributionPoint: z.string().min(2).max(200),
  address: z.string().min(5).max(500),
  coordinates: z.string().optional(),
  plannedRecipients: z.number().min(1),
  plannedStartTime: z.string().datetime(),
  plannedEndTime: z.string().datetime(),
  distributorId: z.string().cuid(),
  driverId: z.string().cuid().optional(),
  volunteers: z.array(z.string().cuid()).optional(),
  distributionMethod: z.enum(['DIRECT', 'PICKUP', 'DELIVERY', 'MOBILE_UNIT']).optional(),
  vehicleType: z.string().optional(),
  vehiclePlate: z.string().optional(),
  transportCost: z.number().min(0).optional(),
  fuelCost: z.number().min(0).optional(),
  otherCosts: z.number().min(0).optional(),
  menuItems: z.record(z.string(), z.unknown()),
  totalPortions: z.number().min(1),
  portionSize: z.number().min(1),
  mealType: z.enum(['SARAPAN', 'MAKAN_SIANG', 'SNACK_PAGI', 'SNACK_SORE', 'MAKAN_MALAM'])
})

const updateDistributionStatusSchema = z.object({
  distributionId: z.string().cuid(),
  status: z.enum(['SCHEDULED', 'PREPARING', 'IN_TRANSIT', 'DISTRIBUTING', 'COMPLETED', 'CANCELLED']),
  actualRecipients: z.number().min(0).optional(),
  actualStartTime: z.string().datetime().optional(),
  actualEndTime: z.string().datetime().optional(),
  departureTime: z.string().datetime().optional(),
  arrivalTime: z.string().datetime().optional(),
  completionTime: z.string().datetime().optional(),
  departureTemp: z.number().optional(),
  arrivalTemp: z.number().optional(),
  servingTemp: z.number().optional(),
  foodQuality: z.enum(['EXCELLENT', 'GOOD', 'FAIR', 'POOR', 'REJECTED']).optional(),
  hygieneScore: z.number().min(0).max(100).optional(),
  packagingCondition: z.string().optional(),
  weatherCondition: z.string().optional(),
  temperature: z.number().optional(),
  humidity: z.number().optional(),
  notes: z.string().optional(),
  photos: z.array(z.string().url()).optional(),
  signature: z.string().optional()
})

// ============================================================================
// ENTERPRISE BUSINESS LOGIC FUNCTIONS
// ============================================================================

// ============================================================================
// HELPER FUNCTIONS  
// ============================================================================

// Enterprise utility functions for distribution analytics
export async function calculateDistributionEfficiency(distribution: { 
  actualEndTime?: Date | null
  plannedEndTime: Date
  actualRecipients?: number | null
  plannedRecipients: number
  transportCost?: number | null
  fuelCost?: number | null
  otherCosts?: number | null
}) {
  const isOnTime = distribution.actualEndTime && distribution.plannedEndTime
    ? new Date(distribution.actualEndTime) <= new Date(distribution.plannedEndTime)
    : false

  const recipientReachRate = distribution.plannedRecipients > 0
    ? ((distribution.actualRecipients || 0) / distribution.plannedRecipients) * 100
    : 0

  const totalCost = (distribution.transportCost || 0) + 
                   (distribution.fuelCost || 0) + 
                   (distribution.otherCosts || 0)

  const costPerRecipient = distribution.actualRecipients && distribution.actualRecipients > 0
    ? totalCost / distribution.actualRecipients
    : totalCost / Math.max(distribution.plannedRecipients, 1)

  return {
    isOnTime,
    recipientReachRate,
    costPerRecipient,
    totalCost,
    efficiency: {
      timeEfficiency: isOnTime ? 100 : 80,
      recipientEfficiency: recipientReachRate,
      costEfficiency: costPerRecipient > 0 ? Math.max(0, 100 - (costPerRecipient * 0.1)) : 100
    }
  }
}

export async function assessQualityCompliance(distribution: {
  departureTemp?: number | null
  arrivalTemp?: number | null  
  servingTemp?: number | null
  hygieneScore?: number | null
  packagingCondition?: string | null
  foodQuality?: string | null
}) {
  const temperatureCompliant = distribution.departureTemp && distribution.arrivalTemp && distribution.servingTemp
    ? distribution.departureTemp >= 60 && distribution.arrivalTemp >= 60 && distribution.servingTemp >= 60
    : false

  const hygieneCompliant = distribution.hygieneScore ? distribution.hygieneScore >= 80 : false
  
  const packagingIntact = distribution.packagingCondition === 'INTACT' || !distribution.packagingCondition

  const qualityGradeScore = distribution.foodQuality === 'EXCELLENT' ? 100 :
                           distribution.foodQuality === 'GOOD' ? 80 :
                           distribution.foodQuality === 'FAIR' ? 60 :
                           distribution.foodQuality === 'POOR' ? 40 : 0

  const overallQualityScore = (
    (temperatureCompliant ? 25 : 0) +
    (hygieneCompliant ? 25 : 0) +
    (packagingIntact ? 25 : 0) +
    (qualityGradeScore / 4)
  )

  return {
    temperatureCompliant,
    hygieneCompliant,
    packagingIntact,
    qualityGradeScore,
    overallQualityScore,
    qualityStatus: overallQualityScore >= 80 ? 'EXCELLENT' :
                   overallQualityScore >= 60 ? 'GOOD' :
                   overallQualityScore >= 40 ? 'FAIR' : 'POOR'
  }
}

async function broadcastDistributionUpdate(
  sppgId: string,
  type: 'created' | 'updated' | 'status_changed' | 'completed',
  distribution: { id: string; distributionCode: string; status: string },
  additionalData?: Record<string, unknown>
) {
  const message = {
    type: `distribution_${type}`,
    sppgId,
    distribution,
    timestamp: new Date().toISOString(),
    ...additionalData
  }

  await Promise.all([
    redis.publish(`sppg:${sppgId}:distribution`, JSON.stringify(message)),
    redis.publish(`sppg:${sppgId}:notifications`, JSON.stringify({
      type: 'distribution_notification',
      title: type === 'created' ? 'Distribusi Baru' :
             type === 'updated' ? 'Distribusi Diperbarui' :
             type === 'status_changed' ? 'Status Distribusi Berubah' :
             'Distribusi Selesai',
      message: `Distribusi ${distribution.distributionCode} ${
        type === 'created' ? 'telah dibuat' :
        type === 'updated' ? 'telah diperbarui' :
        type === 'status_changed' ? `status berubah menjadi ${distribution.status}` :
        'telah selesai dilaksanakan'
      }`,
      sppgId,
      timestamp: new Date().toISOString()
    }))
  ])
}

// ============================================================================
// ENTERPRISE SERVER ACTIONS
// ============================================================================

export async function createDistribution(input: z.infer<typeof createDistributionSchema>) {
  try {
    const session = await auth()
    if (!session?.user) {
      return ServiceResult.error('Unauthorized')
    }

    // Check SPPG access and permissions
    const sppg = await checkSppgAccess(session.user.sppgId)
    if (!sppg) {
      return ServiceResult.error('SPPG access denied')
    }

    if (!hasPermission(session.user.userRole, 'DISTRIBUTION_MANAGE')) {
      return ServiceResult.error('Insufficient permissions')
    }

    // Validate input
    const validated = createDistributionSchema.safeParse(input)
    if (!validated.success) {
      return ServiceResult.error('Validation failed')
    }

    const data = validated.data

    // Generate distribution code
    const today = new Date()
    const codePrefix = `DIST-${sppg.code}-${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}`
    
    const lastDistribution = await db.foodDistribution.findFirst({
      where: {
        sppgId: sppg.id,
        distributionCode: {
          startsWith: codePrefix
        }
      },
      orderBy: { distributionCode: 'desc' }
    })

    const sequence = lastDistribution 
      ? parseInt(lastDistribution.distributionCode.split('-').pop() || '0') + 1
      : 1

    const distributionCode = `${codePrefix}-${String(sequence).padStart(4, '0')}`

    // Create distribution
    const distribution = await db.foodDistribution.create({
      data: {
        sppgId: sppg.id,
        programId: data.programId,
        productionId: data.productionId,
        distributionCode,
        distributionDate: new Date(data.distributionDate),
        mealType: data.mealType,
        distributionPoint: data.distributionPoint,
        address: data.address,
        coordinates: data.coordinates,
        plannedRecipients: data.plannedRecipients,
        plannedStartTime: new Date(data.plannedStartTime),
        plannedEndTime: new Date(data.plannedEndTime),
        distributorId: data.distributorId,
        driverId: data.driverId,
        volunteers: data.volunteers || [],
        distributionMethod: data.distributionMethod,
        vehicleType: data.vehicleType,
        vehiclePlate: data.vehiclePlate,
        transportCost: data.transportCost,
        fuelCost: data.fuelCost,
        otherCosts: data.otherCosts,
        menuItems: JSON.parse(JSON.stringify(data.menuItems)),
        totalPortions: data.totalPortions,
        portionSize: data.portionSize,
        status: 'SCHEDULED'
      },
      include: {
        sppg: {
          select: {
            name: true,
            code: true
          }
        },
        program: {
          select: {
            name: true,
            targetGroup: true
          }
        }
      }
    })

    // Create audit log
    await db.auditLog.create({
      data: {
        sppgId: sppg.id,
        userId: session.user.id,
        action: 'CREATE',
        entityType: 'DISTRIBUTION',
        entityId: distribution.id,
        description: `Created distribution ${distributionCode} for ${data.distributionPoint}`,
        metadata: {
          distributionCode,
          distributionPoint: data.distributionPoint,
          plannedRecipients: data.plannedRecipients,
          totalPortions: data.totalPortions
        }
      }
    })

    // Broadcast update
    await broadcastDistributionUpdate(sppg.id, 'created', distribution, {
      distributionPoint: data.distributionPoint,
      plannedRecipients: data.plannedRecipients
    })

    revalidatePath('/distribution')

    return ServiceResult.success(distribution)

  } catch (error) {
    console.error('Create distribution error:', error)
    return ServiceResult.error('Failed to create distribution')
  }
}

export async function updateDistributionStatus(input: z.infer<typeof updateDistributionStatusSchema>) {
  try {
    const session = await auth()
    if (!session?.user) {
      return ServiceResult.error('Unauthorized')
    }

    const validated = updateDistributionStatusSchema.safeParse(input)
    if (!validated.success) {
      return ServiceResult.error('Validation failed')
    }

    const { distributionId, status, ...updateData } = validated.data

    // Get distribution with access check
    const distribution = await db.foodDistribution.findFirst({
      where: {
        id: distributionId,
        sppgId: session.user.sppgId!
      }
    })

    if (!distribution) {
      return ServiceResult.error('Distribution not found')
    }

    if (!hasPermission(session.user.userRole, 'DISTRIBUTION_MANAGE')) {
      return ServiceResult.error('Insufficient permissions')
    }

    const oldStatus = distribution.status

    // Update distribution
    const updatedDistribution = await db.foodDistribution.update({
      where: { id: distributionId },
      data: {
        status,
        actualRecipients: updateData.actualRecipients,
        actualStartTime: updateData.actualStartTime ? new Date(updateData.actualStartTime) : undefined,
        actualEndTime: updateData.actualEndTime ? new Date(updateData.actualEndTime) : undefined,
        departureTime: updateData.departureTime ? new Date(updateData.departureTime) : undefined,
        arrivalTime: updateData.arrivalTime ? new Date(updateData.arrivalTime) : undefined,
        completionTime: updateData.completionTime ? new Date(updateData.completionTime) : undefined,
        departureTemp: updateData.departureTemp,
        arrivalTemp: updateData.arrivalTemp,
        servingTemp: updateData.servingTemp,
        foodQuality: updateData.foodQuality,
        hygieneScore: updateData.hygieneScore,
        packagingCondition: updateData.packagingCondition,
        weatherCondition: updateData.weatherCondition,
        temperature: updateData.temperature,
        humidity: updateData.humidity,
        notes: updateData.notes,
        photos: updateData.photos || [],
        signature: updateData.signature
      },
      include: {
        sppg: {
          select: {
            name: true,
            code: true
          }
        },
        program: {
          select: {
            name: true,
            targetGroup: true
          }
        }
      }
    })

    // Create audit log
    await db.auditLog.create({
      data: {
        sppgId: distribution.sppgId,
        userId: session.user.id,
        action: 'UPDATE',
        entityType: 'DISTRIBUTION',
        entityId: distribution.id,
        description: `Updated distribution ${distribution.distributionCode} status from ${oldStatus} to ${status}`,
        metadata: {
          oldStatus,
          newStatus: status,
          actualRecipients: updateData.actualRecipients,
          notes: updateData.notes
        }
      }
    })

    // Broadcast update
    await broadcastDistributionUpdate(distribution.sppgId, 'status_changed', updatedDistribution, {
      oldStatus,
      newStatus: status,
      actualRecipients: updateData.actualRecipients
    })

    revalidatePath('/distribution')

    return ServiceResult.success(updatedDistribution)

  } catch (error) {
    console.error('Update distribution status error:', error)
    return ServiceResult.error('Failed to update distribution status')
  }
}

export async function getDistributions(
  filters: {
    status?: string
    distributionPoint?: string
    dateFrom?: string
    dateTo?: string
    page?: number
    limit?: number
  } = {}
) {
  try {
    const session = await auth()
    if (!session?.user?.sppgId) {
      return ServiceResult.error('Unauthorized')
    }

    const { status, distributionPoint, dateFrom, dateTo, page = 1, limit = 20 } = filters
    const skip = (page - 1) * limit

    const where = {
      sppgId: session.user.sppgId!,
      ...(status && { status: status as DistributionStatus }),
      ...(distributionPoint && {
        distributionPoint: {
          contains: distributionPoint,
          mode: 'insensitive' as const
        }
      }),
      ...(dateFrom || dateTo) && {
        distributionDate: {
          ...(dateFrom && { gte: new Date(dateFrom) }),
          ...(dateTo && { lte: new Date(dateTo) })
        }
      }
    }

    const [distributions, total] = await Promise.all([
      db.foodDistribution.findMany({
        where,
        include: {
          sppg: {
            select: {
              name: true,
              code: true
            }
          },
          program: {
            select: {
              name: true,
              targetGroup: true
            }
          }
        },
        orderBy: { distributionDate: 'desc' },
        skip,
        take: limit
      }),
      db.foodDistribution.count({ where })
    ])

    return ServiceResult.success({
      distributions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Get distributions error:', error)
    return ServiceResult.error('Failed to get distributions')
  }
}

export async function getDistributionAnalytics() {
  try {
    const session = await auth()
    if (!session?.user?.sppgId) {
      return ServiceResult.error('Unauthorized')
    }

    if (!hasPermission(session.user.userRole, 'ANALYTICS_VIEW')) {
      return ServiceResult.error('Insufficient permissions')
    }

    const sppgId = session.user.sppgId
    const oneMonthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

    // Get distributions from the last month
    const distributions = await db.foodDistribution.findMany({
      where: {
        sppgId,
        distributionDate: { gte: oneMonthAgo }
      },
      select: {
        id: true,
        status: true,
        actualRecipients: true,
        plannedRecipients: true,
        totalPortions: true,
        actualEndTime: true,
        plannedEndTime: true,
        foodQuality: true
      }
    })

    // Calculate analytics
    const totalDistributions = distributions.length
    const completedDistributions = distributions.filter((d) => d.status === 'COMPLETED').length
    const totalRecipients = distributions.reduce((sum: number, d) => sum + (d.actualRecipients || d.plannedRecipients), 0)
    const totalPortions = distributions.reduce((sum: number, d) => sum + d.totalPortions, 0)

    const onTimeDistributions = distributions.filter((d) => 
      d.actualEndTime && d.plannedEndTime && 
      new Date(d.actualEndTime) <= new Date(d.plannedEndTime)
    ).length

    const onTimeRate = totalDistributions > 0 ? (onTimeDistributions / totalDistributions) * 100 : 0

    // Status distribution
    const statusDistribution = distributions.reduce((acc: Record<string, number>, d) => {
      acc[d.status] = (acc[d.status] || 0) + 1
      return acc
    }, {})

    // Quality metrics
    const qualityDistributions = distributions.filter((d) => d.foodQuality)
    const averageQualityScore = qualityDistributions.length > 0
      ? qualityDistributions.reduce((sum: number, d) => {
          const quality = d.foodQuality!
          const score = quality === 'EXCELLENT' ? 100 :
                       quality === 'GOOD' ? 80 :
                       quality === 'FAIR' ? 60 :
                       quality === 'POOR' ? 40 : 0
          return sum + score
        }, 0) / qualityDistributions.length
      : 0

    const analytics = {
      totalDistributions,
      completedDistributions,
      totalRecipients,
      totalPortions,
      onTimeRate,
      statusDistribution,
      averageQualityScore,
      completionRate: totalDistributions > 0 ? (completedDistributions / totalDistributions) * 100 : 0
    }

    return ServiceResult.success(analytics)

  } catch (error) {
    console.error('Get distribution analytics error:', error)
    return ServiceResult.error('Failed to get distribution analytics')
  }
}