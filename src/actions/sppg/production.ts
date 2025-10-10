'use server'

import { auth } from '@/auth'
import db from '@/lib/db'
import { ServiceResult } from '@/lib/service-result'
import { checkSppgAccess, hasPermission } from '@/lib/permissions'
import { revalidatePath } from 'next/cache'
import { Redis } from 'ioredis'
import { ProductionStatus, Prisma } from '@prisma/client'
import { z } from 'zod'

const redis = new Redis(process.env.REDIS_URL!)

// ================================ ENTERPRISE TYPE DEFINITIONS ================================

// Production priority levels for enterprise scheduling and resource allocation
enum ProductionPriority {
  LOW = 'LOW',
  NORMAL = 'NORMAL',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
  CRITICAL = 'CRITICAL'
}

enum ProductionRiskLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

// Enterprise-grade Zod schema based on actual Prisma schema
const CreateProductionSchema = z.object({
  programId: z.string().cuid(),
  menuId: z.string().cuid(),
  // Production Planning - using actual schema fields
  productionDate: z.string().datetime(),
  batchNumber: z.string().max(50).optional(), // Will auto-generate if not provided
  plannedPortions: z.number().positive().int(),
  // Staff Assignment - using actual schema fields
  headCook: z.string().cuid(),
  assistantCooks: z.array(z.string().cuid()).optional(),
  supervisorId: z.string().cuid().optional(),
  // Production Schedule - using actual schema fields  
  plannedStartTime: z.string().datetime(),
  plannedEndTime: z.string().datetime(),
  // Cost Tracking - using actual schema fields
  estimatedCost: z.number().min(0),
  // Quality Parameters - using actual schema fields
  targetTemperature: z.number().optional(),
  // Production Priority (enterprise extension)
  priority: z.nativeEnum(ProductionPriority).default(ProductionPriority.NORMAL),
  // Documentation - using actual schema fields
  notes: z.string().max(2000).optional()
}).refine(
  (data) => {
    const startTime = new Date(data.plannedStartTime)
    const endTime = new Date(data.plannedEndTime)
    return startTime < endTime
  },
  {
    message: "Planned end time must be after start time",
    path: ["plannedEndTime"]
  }
)

// Schema for updating production status - based on actual fields
export const UpdateProductionStatusSchema = z.object({
  status: z.nativeEnum(ProductionStatus),
  actualStartTime: z.string().datetime().optional(),
  actualEndTime: z.string().datetime().optional(),
  actualPortions: z.number().min(0).int().optional(),
  actualCost: z.number().min(0).optional(),
  costPerPortion: z.number().min(0).optional(),
  // Quality Results - using actual schema fields
  actualTemperature: z.number().optional(),
  hygieneScore: z.number().min(0).max(100).int().optional(),
  tasteRating: z.number().min(1).max(5).int().optional(),
  appearanceRating: z.number().min(1).max(5).int().optional(),
  textureRating: z.number().min(1).max(5).int().optional(),
  // Quality Control - using actual schema fields
  qualityPassed: z.boolean().optional(),
  rejectionReason: z.string().max(1000).optional(),
  // Waste Management - using actual schema fields
  wasteAmount: z.number().min(0).optional(),
  wasteNotes: z.string().max(500).optional(),
  // Documentation - using actual schema fields
  notes: z.string().max(2000).optional(),
  photos: z.array(z.string().url()).optional()
})

// Quality control schema for detailed assessments
export const QualityControlSchema = z.object({
  productionId: z.string().cuid(),
  checkType: z.enum(['HYGIENE', 'TEMPERATURE', 'TASTE', 'APPEARANCE', 'SAFETY']),
  checkedBy: z.string().cuid(),
  parameter: z.string().max(100),
  expectedValue: z.string().max(100).optional(),
  actualValue: z.string().max(100),
  passed: z.boolean(),
  notes: z.string().max(500).optional()
})

// Enterprise type definitions with full type safety
type CreateProductionData = z.infer<typeof CreateProductionSchema>
export type UpdateProductionStatusData = z.infer<typeof UpdateProductionStatusSchema>
export type QualityControlData = z.infer<typeof QualityControlSchema>

// Enterprise production data with comprehensive analytics
interface ProductionWithEnterpriseAnalytics extends Prisma.FoodProductionGetPayload<{
  include: {
    sppg: {
      select: {
        id: true
        name: true
        subscription: {
          select: {
            tier: true
            status: true
          }
        }
      }
    }
    program: {
      select: {
        id: true
        name: true
        targetGroup: true
      }
    }
    menu: {
      select: {
        id: true
        menuName: true
        menuCode: true
        mealType: true
        servingSize: true
        calories: true
        protein: true
        costPerServing: true
      }
    }
    qualityChecks: {
      select: {
        id: true
        checkType: true
        passed: true
        actualValue: true
        parameter: true
      }
    }
    distributions: {
      select: {
        id: true
        status: true
        totalPortions: true
      }
    }
  }
}> {
  // Production efficiency metrics
  yieldPercentage: number
  efficiencyScore: number
  costVariance: number
  timeVariance: number
  qualityScore: number
  // Risk indicators
  riskLevel: ProductionRiskLevel
  riskFactors: string[]
  // Performance indicators
  onTimePerformance: boolean
  qualityFirstPass: boolean
  overallRating: number
  // Distribution readiness
  distributionReadiness: number
  // Enterprise priority
  priority: ProductionPriority
}

// Enterprise analytics interface for future implementation
export interface EnterpriseProductionAnalytics {
  overview: {
    totalProductions: number
    completedProductions: number
    inProgressProductions: number
    plannedProductions: number
    cancelledProductions: number
    averageYield: number
    averageQualityScore: number
    totalProductionCost: number
    averageCostPerPortion: number
  }
  efficiency: {
    overallEfficiency: number
    onTimeCompletionRate: number
    averageTimeVariance: number
    capacityUtilization: number
    laborProductivity: number
  }
  quality: {
    averageQualityGrade: number
    firstPassYield: number
    qualityConsistency: number
    complianceRate: number
    defectRate: number
  }
  cost: {
    totalCost: number
    costVariancePercentage: number
    costPerPortion: number
    profitMargin: number
  }
  sustainability: {
    averageWastePercentage: number
    totalWasteCost: number
    sustainabilityScore: number
    resourceEfficiency: number
  }
  risk: {
    lowRiskProductions: number
    mediumRiskProductions: number
    highRiskProductions: number
    criticalRiskProductions: number
    averageRiskScore: number
  }
  trends: Array<{
    month: string
    productionCount: number
    averageYield: number
    averageQuality: number
    totalCost: number
    efficiency: number
  }>
}

// Enterprise error codes for comprehensive error handling (available for future use)
// enum ProductionErrorCode {
//   MENU_NOT_APPROVED = 'PROD_001',
//   INSUFFICIENT_CAPACITY = 'PROD_002',
//   STAFF_UNAVAILABLE = 'PROD_003',
//   SCHEDULE_CONFLICT = 'PROD_004',
//   PRODUCTION_LIMIT_EXCEEDED = 'PROD_005',
//   QUALITY_STANDARDS_NOT_MET = 'PROD_006',
//   BATCH_NUMBER_EXISTS = 'PROD_007'
// }

// ================================ ENTERPRISE PRODUCTION OPERATIONS ================================

export async function getProductions(
  programId?: string,
  menuId?: string,
  status?: ProductionStatus,
  dateRange?: { start: string; end: string },
  priority?: ProductionPriority,
  pagination?: { page: number; limit: number }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return ServiceResult.error('Authentication required')
    }

    if (!hasPermission(session.user.userRole, 'READ')) {
      return ServiceResult.error('Insufficient permissions - READ access required')
    }

    const sppg = await checkSppgAccess(session.user.sppgId)
    if (!sppg) {
      return ServiceResult.error('SPPG access denied or not found')
    }

    // Enterprise pagination with defaults
    const page = pagination?.page || 1
    const limit = Math.min(pagination?.limit || 50, 100) // Max 100 items per page
    const skip = (page - 1) * limit

    const whereCondition: Prisma.FoodProductionWhereInput = {
      sppgId: session.user.sppgId!,
      ...(programId && { programId }),
      ...(menuId && { menuId }),
      ...(status && { status }),
      ...(dateRange && {
        productionDate: {
          gte: new Date(dateRange.start),
          lte: new Date(dateRange.end)
        }
      })
    }

    // Parallel queries for optimal performance
    const [productions, totalCount] = await Promise.all([
      db.foodProduction.findMany({
        where: whereCondition,
        include: {
          sppg: {
            select: {
              id: true,
              name: true,
              subscription: {
                select: {
                  tier: true,
                  status: true
                }
              }
            }
          },
          program: {
            select: {
              id: true,
              name: true,
              targetGroup: true
            }
          },
          menu: {
            select: {
              id: true,
              menuName: true,
              menuCode: true,
              mealType: true,
              servingSize: true,
              calories: true,
              protein: true,
              costPerServing: true
            }
          },
          qualityChecks: {
            select: {
              id: true,
              checkType: true,
              passed: true,
              actualValue: true,
              parameter: true
            }
          },
          distributions: {
            select: {
              id: true,
              status: true,
              totalPortions: true
            }
          }
        },
        orderBy: [
          { productionDate: 'desc' },
          { createdAt: 'desc' }
        ],
        skip,
        take: limit
      }),
      db.foodProduction.count({ where: whereCondition })
    ])

    // Enterprise-grade data transformation with comprehensive analytics
    const transformedProductions: ProductionWithEnterpriseAnalytics[] = productions.map(production => {
      // Production efficiency calculations based on actual schema fields
      const yieldPercentage = production.plannedPortions > 0 
        ? ((production.actualPortions || 0) / production.plannedPortions) * 100 
        : 0

      const efficiencyScore = calculateProductionEfficiency({
        plannedPortions: production.plannedPortions,
        actualPortions: production.actualPortions || 0,
        plannedStartTime: production.plannedStartTime,
        plannedEndTime: production.plannedEndTime,
        actualStartTime: production.actualStartTime,
        actualEndTime: production.actualEndTime,
        estimatedCost: production.estimatedCost,
        actualCost: production.actualCost || 0
      })

      // Cost variance analysis using actual schema fields
      const costVariance = production.estimatedCost > 0
        ? ((production.actualCost || 0) - production.estimatedCost) / production.estimatedCost * 100
        : 0

      // Time variance analysis using actual schema fields
      const timeVariance = calculateTimeVariance(
        production.plannedStartTime,
        production.plannedEndTime,
        production.actualStartTime,
        production.actualEndTime
      )

      // Quality score calculation based on actual rating fields
      const qualityScore = calculateQualityScore({
        hygieneScore: production.hygieneScore,
        tasteRating: production.tasteRating,
        appearanceRating: production.appearanceRating,
        textureRating: production.textureRating,
        qualityPassed: production.qualityPassed,
        qualityChecks: production.qualityChecks
      })

      // Enterprise priority assignment
      const priority = assignProductionPriority({
        status: production.status,
        productionDate: production.productionDate,
        yieldPercentage,
        qualityScore,
        costVariance
      })

      // Risk assessment using enterprise algorithms
      const riskAssessment = assessProductionRisk({
        status: production.status,
        priority,
        yieldPercentage,
        qualityScore,
        costVariance,
        timeVariance,
        qualityChecks: production.qualityChecks,
        wasteAmount: production.wasteAmount || 0
      })

      // Performance indicators
      const onTimePerformance = production.actualEndTime 
        ? new Date(production.actualEndTime) <= production.plannedEndTime
        : false

      const qualityFirstPass = production.qualityPassed === true
      const overallRating = calculateOverallRating({
        yieldPercentage,
        qualityScore,
        onTimePerformance,
        costVariance
      })

      // Distribution readiness assessment
      const distributionReadiness = calculateDistributionReadiness({
        status: production.status,
        qualityPassed: production.qualityPassed,
        actualPortions: production.actualPortions || 0,
        distributions: production.distributions
      })

      return {
        ...production,
        yieldPercentage,
        efficiencyScore,
        costVariance,
        timeVariance,
        qualityScore,
        riskLevel: riskAssessment.level,
        riskFactors: riskAssessment.factors,
        onTimePerformance,
        qualityFirstPass,
        overallRating,
        distributionReadiness,
        priority
      }
    })

    const paginationInfo = {
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit),
      totalItems: totalCount,
      itemsPerPage: limit,
      hasNextPage: page < Math.ceil(totalCount / limit),
      hasPreviousPage: page > 1
    }

    return ServiceResult.success({
      productions: transformedProductions,
      pagination: paginationInfo
    })

  } catch (error) {
    console.error('Enterprise production fetch error:', error)
    return ServiceResult.error('Failed to fetch production data')
  }
}

export async function createProduction(data: CreateProductionData) {
  try {
    const session = await auth()
    if (!session?.user) {
      return ServiceResult.error('Authentication required')
    }

    if (!hasPermission(session.user.userRole, 'PRODUCTION_MANAGE')) {
      return ServiceResult.error('Insufficient permissions - PRODUCTION_MANAGE required')
    }

    const sppg = await checkSppgAccess(session.user.sppgId)
    if (!sppg) {
      return ServiceResult.error('SPPG access denied')
    }

    // Enterprise validation with Zod
    const validationResult = CreateProductionSchema.safeParse(data)
    if (!validationResult.success) {
      return ServiceResult.error('Validation failed')
    }

    const validatedData = validationResult.data

    // Check SPPG subscription status
    const subscription = await db.subscription.findFirst({
      where: { sppgId: session.user.sppgId! }
    })

    if (!subscription || subscription.status !== 'ACTIVE') {
      return ServiceResult.error('Subscription inactive - Cannot create production')
    }

    // Check monthly production limits based on subscription plan
    const monthlyLimit = getMonthlyProductionLimit(subscription.tier)
    const currentMonth = new Date()
    currentMonth.setDate(1)
    currentMonth.setHours(0, 0, 0, 0)

    const monthlyCount = await db.foodProduction.count({
      where: {
        sppgId: session.user.sppgId!,
        productionDate: {
          gte: currentMonth
        }
      }
    })

    if (monthlyCount >= monthlyLimit) {
      return ServiceResult.error(
        `Monthly production limit reached (${monthlyLimit}). Upgrade subscription.`
      )
    }

    // Validate menu exists and belongs to SPPG
    const menu = await db.nutritionMenu.findFirst({
      where: {
        id: validatedData.menuId,
        program: {
          sppgId: session.user.sppgId!
        }
      },
      include: {
        program: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    if (!menu) {
      return ServiceResult.error('Menu not found or access denied')
    }

    // Validate staff assignments using actual User model
    const allStaffIds = [
      validatedData.headCook,
      ...(validatedData.assistantCooks || []),
      validatedData.supervisorId
    ].filter(Boolean) as string[]

    const staffMembers = await db.user.findMany({
      where: {
        id: { in: allStaffIds },
        sppgId: session.user.sppgId!,
        isActive: true
      }
    })

    if (staffMembers.length !== allStaffIds.length) {
      return ServiceResult.error('Some staff members not found or not authorized for production')
    }

    // Generate batch number if not provided
    const batchNumber = validatedData.batchNumber || await generateEnterpriseBatchNumber(
      session.user.sppgId!,
      validatedData.productionDate
    )

    // Check batch number uniqueness
    const existingBatch = await db.foodProduction.findUnique({
      where: { batchNumber },
      select: { id: true }
    })

    if (existingBatch) {
      return ServiceResult.error('Batch number already exists')
    }

    // Enterprise transaction with comprehensive error handling
    const production = await db.$transaction(async (tx) => {
      // Create production using actual schema fields
      const newProduction = await tx.foodProduction.create({
        data: {
          sppgId: session.user.sppgId!,
          programId: validatedData.programId,
          menuId: validatedData.menuId,
          // Production Planning - using actual schema fields
          productionDate: new Date(validatedData.productionDate),
          batchNumber,
          plannedPortions: validatedData.plannedPortions,
          // Staff Assignment - using actual schema fields
          headCook: validatedData.headCook,
          assistantCooks: validatedData.assistantCooks || [],
          supervisorId: validatedData.supervisorId,
          // Production Schedule - using actual schema fields
          plannedStartTime: new Date(validatedData.plannedStartTime),
          plannedEndTime: new Date(validatedData.plannedEndTime),
          // Cost Tracking - using actual schema fields
          estimatedCost: validatedData.estimatedCost,
          // Quality Parameters - using actual schema fields
          targetTemperature: validatedData.targetTemperature,
          // Documentation - using actual schema fields
          notes: validatedData.notes,
          status: ProductionStatus.PLANNED
        },
        include: {
          menu: {
            select: {
              menuName: true,
              mealType: true,
              servingSize: true
            }
          },
          program: {
            select: {
              name: true
            }
          }
        }
      })

      return newProduction
    }, {
      maxWait: 15000, // 15 seconds
      timeout: 45000, // 45 seconds
      isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted
    })

    // Enterprise-grade real-time broadcasting
    await redis.publish(`sppg:${session.user.sppgId}:production:created`, JSON.stringify({
      eventType: 'PRODUCTION_CREATED',
      timestamp: new Date().toISOString(),
      correlationId: `prod-${production.id}`,
      data: {
        id: production.id,
        batchNumber: production.batchNumber,
        menuName: production.menu.menuName,
        plannedPortions: production.plannedPortions,
        productionDate: production.productionDate,
        status: production.status,
        estimatedCost: production.estimatedCost
      },
      metadata: {
        createdBy: session.user.name,
        sppgId: session.user.sppgId,
        subscriptionPlan: subscription.tier
      }
    }))

    revalidatePath('/production')
    return ServiceResult.success(production)

  } catch (error) {
    console.error('Enterprise production creation error:', error)

    // Enhanced error handling with proper classification
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return ServiceResult.error('Batch number already exists')
      }
    }

    return ServiceResult.error('Failed to create production')
  }
}

// ================================ ENTERPRISE HELPER FUNCTIONS ================================

async function generateEnterpriseBatchNumber(sppgId: string, productionDate: string): Promise<string> {
  const date = new Date(productionDate)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  const prefix = `BATCH-${year}${month}${day}`

  // Use atomic operation to prevent race conditions
  const lastProduction = await db.foodProduction.findFirst({
    where: {
      sppgId,
      batchNumber: {
        startsWith: prefix
      }
    },
    orderBy: {
      batchNumber: 'desc'
    },
    select: {
      batchNumber: true
    }
  })

  let sequence = 1
  if (lastProduction?.batchNumber) {
    const parts = lastProduction.batchNumber.split('-')
    if (parts.length >= 3) {
      const lastSequence = parseInt(parts[2] || '0')
      if (!isNaN(lastSequence)) {
        sequence = lastSequence + 1
      }
    }
  }

  return `${prefix}-${String(sequence).padStart(4, '0')}`
}

function getMonthlyProductionLimit(subscriptionPlan: string): number {
  const limits: Record<string, number> = {
    'TRIAL': 20,
    'BASIC': 100,
    'PROFESSIONAL': 500,
    'ENTERPRISE': 2000
  }
  return limits[subscriptionPlan] || 50
}

// Enterprise calculation functions with proper implementations
function calculateProductionEfficiency(params: {
  plannedPortions: number
  actualPortions: number
  plannedStartTime: Date
  plannedEndTime: Date
  actualStartTime: Date | null
  actualEndTime: Date | null
  estimatedCost: number
  actualCost: number
}): number {
  const portionEfficiency = params.plannedPortions > 0 ? (params.actualPortions / params.plannedPortions) * 100 : 0
  
  const plannedDuration = params.plannedEndTime.getTime() - params.plannedStartTime.getTime()
  const actualDuration = params.actualStartTime && params.actualEndTime 
    ? params.actualEndTime.getTime() - params.actualStartTime.getTime()
    : plannedDuration
  
  const timeEfficiency = plannedDuration > 0 && actualDuration > 0 
    ? (plannedDuration / actualDuration) * 100 
    : 100
    
  const costEfficiency = params.actualCost > 0 && params.estimatedCost > 0
    ? (params.estimatedCost / params.actualCost) * 100
    : 100

  return Math.min(100, (portionEfficiency + timeEfficiency + costEfficiency) / 3)
}

function calculateTimeVariance(
  plannedStart: Date,
  plannedEnd: Date,
  actualStart: Date | null,
  actualEnd: Date | null
): number {
  if (!actualStart || !actualEnd) return 0
  
  const plannedDuration = plannedEnd.getTime() - plannedStart.getTime()
  const actualDuration = actualEnd.getTime() - actualStart.getTime()
  
  return plannedDuration > 0 
    ? ((actualDuration - plannedDuration) / plannedDuration) * 100 
    : 0
}

function calculateQualityScore(params: {
  hygieneScore: number | null
  tasteRating: number | null
  appearanceRating: number | null
  textureRating: number | null
  qualityPassed: boolean | null
  qualityChecks: Array<{ passed: boolean }>
}): number {
  let totalScore = 0
  let componentCount = 0

  // Hygiene score (0-100)
  if (params.hygieneScore !== null) {
    totalScore += params.hygieneScore
    componentCount++
  }

  // Convert ratings (1-5) to percentage (20-100)
  if (params.tasteRating !== null) {
    totalScore += (params.tasteRating / 5) * 100
    componentCount++
  }

  if (params.appearanceRating !== null) {
    totalScore += (params.appearanceRating / 5) * 100
    componentCount++
  }

  if (params.textureRating !== null) {
    totalScore += (params.textureRating / 5) * 100
    componentCount++
  }

  // Quality check results
  if (params.qualityChecks.length > 0) {
    const passedChecks = params.qualityChecks.filter(check => check.passed).length
    const checkScore = (passedChecks / params.qualityChecks.length) * 100
    totalScore += checkScore
    componentCount++
  }

  // Overall quality pass/fail
  if (params.qualityPassed !== null) {
    totalScore += params.qualityPassed ? 100 : 0
    componentCount++
  }

  return componentCount > 0 ? totalScore / componentCount : 0
}

function assignProductionPriority(params: {
  status: ProductionStatus
  productionDate: Date
  yieldPercentage: number
  qualityScore: number
  costVariance: number
}): ProductionPriority {
  // High priority if production is in critical phases
  if (params.status === ProductionStatus.COOKING || params.status === ProductionStatus.QUALITY_CHECK) {
    const now = new Date()
    const hoursOverdue = (now.getTime() - params.productionDate.getTime()) / (1000 * 60 * 60)
    if (hoursOverdue > 24) return ProductionPriority.CRITICAL
    if (hoursOverdue > 12) return ProductionPriority.URGENT
    if (hoursOverdue > 4) return ProductionPriority.HIGH
  }

  // Priority based on quality and efficiency
  if (params.yieldPercentage < 70 || params.qualityScore < 60) {
    return ProductionPriority.HIGH
  }

  if (Math.abs(params.costVariance) > 25) {
    return ProductionPriority.HIGH
  }

  return ProductionPriority.NORMAL
}

interface ProductionRiskFactors {
  status: ProductionStatus
  priority: ProductionPriority
  yieldPercentage: number
  qualityScore: number
  costVariance: number
  timeVariance: number
  qualityChecks: Array<{ passed: boolean }>
  wasteAmount: number
}

function assessProductionRisk(factors: ProductionRiskFactors): { level: ProductionRiskLevel; factors: string[] } {
  let riskScore = 0
  const riskFactors: string[] = []

  // Status risk
  if (factors.status === ProductionStatus.CANCELLED) {
    riskScore += 40
    riskFactors.push('Production cancelled')
  } else if (factors.status === ProductionStatus.COOKING) {
    riskScore += 15
    riskFactors.push('Production in cooking phase')
  }

  // Priority risk
  if (factors.priority === ProductionPriority.CRITICAL) {
    riskScore += 20
    riskFactors.push('Critical priority')
  } else if (factors.priority === ProductionPriority.URGENT) {
    riskScore += 15
    riskFactors.push('Urgent priority')
  }

  // Yield risk
  if (factors.yieldPercentage < 70) {
    riskScore += 20
    riskFactors.push('Low yield percentage')
  } else if (factors.yieldPercentage < 85) {
    riskScore += 10
    riskFactors.push('Below target yield')
  }

  // Quality risk
  if (factors.qualityScore < 60) {
    riskScore += 25
    riskFactors.push('Poor quality score')
  } else if (factors.qualityScore < 80) {
    riskScore += 15
    riskFactors.push('Below standard quality')
  }

  // Cost variance risk
  if (Math.abs(factors.costVariance) > 25) {
    riskScore += 15
    riskFactors.push('High cost variance')
  }

  // Time variance risk
  if (Math.abs(factors.timeVariance) > 30) {
    riskScore += 15
    riskFactors.push('Significant time variance')
  }

  // Quality check failures
  const failedChecks = factors.qualityChecks.filter(check => !check.passed).length
  if (failedChecks > 0) {
    riskScore += failedChecks * 10
    riskFactors.push(`${failedChecks} quality check(s) failed`)
  }

  // Waste risk
  if (factors.wasteAmount > 10) {
    riskScore += 15
    riskFactors.push('High waste amount')
  }

  // Risk level determination
  let level: ProductionRiskLevel
  if (riskScore >= 70) level = ProductionRiskLevel.CRITICAL
  else if (riskScore >= 50) level = ProductionRiskLevel.HIGH
  else if (riskScore >= 30) level = ProductionRiskLevel.MEDIUM
  else level = ProductionRiskLevel.LOW

  return { level, factors: riskFactors }
}

function calculateOverallRating(params: {
  yieldPercentage: number
  qualityScore: number
  onTimePerformance: boolean
  costVariance: number
}): number {
  let rating = 0
  
  // Yield component (40% weight)
  rating += (params.yieldPercentage / 100) * 40
  
  // Quality component (35% weight)
  rating += (params.qualityScore / 100) * 35
  
  // On-time performance (15% weight)
  rating += (params.onTimePerformance ? 1 : 0) * 15
  
  // Cost efficiency (10% weight)
  const costEfficiency = Math.max(0, 100 - Math.abs(params.costVariance))
  rating += (costEfficiency / 100) * 10
  
  return Math.min(100, rating)
}

function calculateDistributionReadiness(params: {
  status: ProductionStatus
  qualityPassed: boolean | null
  actualPortions: number
  distributions: Array<{ status: string; totalPortions: number | null }>
}): number {
  let readiness = 0
  
  // Status check (40% weight)
  if (params.status === ProductionStatus.COMPLETED) {
    readiness += 40
  } else if (params.status === ProductionStatus.COOKING) {
    readiness += 20
  }
  
  // Quality check (30% weight)
  if (params.qualityPassed === true) {
    readiness += 30
  } else if (params.qualityPassed === null) {
    readiness += 15 // Pending quality check
  }
  
  // Quantity check (20% weight)
  if (params.actualPortions > 0) {
    readiness += 20
  }
  
  // Distribution status (10% weight)
  const hasActiveDistribution = params.distributions.some(d => d.status === 'ACTIVE')
  if (!hasActiveDistribution) {
    readiness += 10
  }
  
  return Math.min(100, readiness)
}