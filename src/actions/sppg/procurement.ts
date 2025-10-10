'use server'

import { auth } from '@/auth'
import db from '@/lib/db'
import { ServiceResult } from '@/lib/service-result'
import { checkSppgAccess, hasPermission } from '@/lib/permissions'
import { revalidatePath } from 'next/cache'
import { Redis } from 'ioredis'
import { z } from 'zod'
import { ProcurementStatus, InventoryCategory, MovementType } from '@prisma/client'

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379')

// ============================================================================
// ENTERPRISE VALIDATION SCHEMAS
// ============================================================================

const createProcurementSchema = z.object({
  planId: z.string().cuid().optional(),
  expectedDelivery: z.string().datetime().optional(),
  supplierName: z.string().min(2).max(100),
  supplierContact: z.string().optional(),
  supplierAddress: z.string().optional(),
  supplierEmail: z.string().email().optional(),
  supplierType: z.enum(['LOCAL', 'REGIONAL', 'NATIONAL', 'INTERNATIONAL', 'COOPERATIVE', 'INDIVIDUAL']).optional(),
  purchaseMethod: z.enum(['DIRECT', 'TENDER', 'CONTRACT', 'EMERGENCY', 'BULK']),
  paymentTerms: z.string().optional(),
  subtotalAmount: z.number().min(0),
  taxAmount: z.number().min(0).default(0),
  discountAmount: z.number().min(0).default(0),
  shippingCost: z.number().min(0).default(0),
  paymentDue: z.string().datetime().optional(),
  qualityNotes: z.string().optional(),
  deliveryMethod: z.string().optional(),
  transportCost: z.number().min(0).optional(),
  packagingType: z.string().optional(),
  items: z.array(z.object({
    inventoryItemId: z.string().cuid(),
    itemName: z.string().optional(),
    category: z.nativeEnum(InventoryCategory).optional(),
    unit: z.string().optional(),
    quantity: z.number().min(0.01),
    unitPrice: z.number().min(0),
    totalPrice: z.number().min(0)
  })).min(1)
})

const updateProcurementStatusSchema = z.object({
  procurementId: z.string().cuid(),
  status: z.nativeEnum(ProcurementStatus),
  notes: z.string().optional(),
  actualDelivery: z.string().datetime().optional(),
  qualityGrade: z.enum(['EXCELLENT', 'GOOD', 'FAIR', 'POOR', 'REJECTED']).optional(),
  inspectedBy: z.string().cuid().optional(),
  rejectionReason: z.string().optional()
})

// ============================================================================
// ENTERPRISE BUSINESS LOGIC FUNCTIONS
// ============================================================================

async function calculateProcurementTotals(items: Array<{ quantity: number; unitPrice: number }>) {
  const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0)
  const taxRate = 0.11 // 11% PPN
  const taxAmount = subtotal * taxRate
  const total = subtotal + taxAmount
  
  return {
    subtotal,
    taxAmount,
    total
  }
}

async function assessSupplierRisk(supplierName: string, sppgId: string): Promise<number> {
  const pastOrders = await db.procurement.findMany({
    where: {
      supplierName,
      sppgId,
      createdAt: {
        gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) // Last year
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  if (pastOrders.length === 0) return 75 // New supplier, medium-high risk

  const onTimeDeliveries = pastOrders.filter(order => 
    order.actualDelivery && order.expectedDelivery &&
    order.actualDelivery <= order.expectedDelivery
  ).length

  const qualityIssues = pastOrders.filter(order => 
    order.qualityGrade === 'POOR' || order.qualityGrade === 'REJECTED'
  ).length

  const paymentIssues = pastOrders.filter(order => 
    order.paymentStatus === 'OVERDUE'
  ).length

  const onTimeRate = pastOrders.length > 0 ? onTimeDeliveries / pastOrders.length : 0
  const qualityRate = pastOrders.length > 0 ? (pastOrders.length - qualityIssues) / pastOrders.length : 0
  const paymentRate = pastOrders.length > 0 ? (pastOrders.length - paymentIssues) / pastOrders.length : 0

  // Calculate risk score (0-100, lower is better)
  const riskScore = 100 - ((onTimeRate * 40) + (qualityRate * 40) + (paymentRate * 20))
  
  return Math.max(0, Math.min(100, riskScore))
}

async function broadcastProcurementUpdate(
  sppgId: string, 
  type: 'created' | 'updated' | 'status_changed' | 'received',
  procurement: { id: string; procurementCode: string; status: string },
  additionalData?: Record<string, unknown>
) {
  const message = {
    type: `procurement_${type}`,
    sppgId,
    procurement,
    timestamp: new Date().toISOString(),
    ...additionalData
  }

  await Promise.all([
    redis.publish(`sppg:${sppgId}:procurement`, JSON.stringify(message)),
    redis.publish(`sppg:${sppgId}:notifications`, JSON.stringify({
      type: 'procurement_notification',
      title: type === 'created' ? 'Procurement Baru' : 
             type === 'updated' ? 'Procurement Diperbarui' :
             type === 'status_changed' ? 'Status Procurement Berubah' :
             'Procurement Diterima',
      message: `Procurement ${procurement.procurementCode} ${
        type === 'created' ? 'telah dibuat' :
        type === 'updated' ? 'telah diperbarui' :
        type === 'status_changed' ? `status berubah menjadi ${procurement.status}` :
        'telah diterima'
      }`,
      sppgId,
      timestamp: new Date().toISOString()
    }))
  ])
}

// ============================================================================
// ENTERPRISE SERVER ACTIONS
// ============================================================================

export async function createProcurement(input: z.infer<typeof createProcurementSchema>) {
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

    if (!hasPermission(session.user.userRole, 'PROCUREMENT_MANAGE')) {
      return ServiceResult.error('Insufficient permissions')
    }

    // Validate input
    const validated = createProcurementSchema.safeParse(input)
    if (!validated.success) {
      return ServiceResult.error('Validation failed')
    }

    const data = validated.data

    // Calculate totals
    const { subtotal, taxAmount, total } = await calculateProcurementTotals(data.items)

    // Generate procurement code
    const today = new Date()
    const codePrefix = `PRC-${sppg.code}-${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}`
    
    const lastProcurement = await db.procurement.findFirst({
      where: {
        sppgId: sppg.id,
        procurementCode: {
          startsWith: codePrefix
        }
      },
      orderBy: { procurementCode: 'desc' }
    })

    const sequence = lastProcurement 
      ? parseInt(lastProcurement.procurementCode.split('-').pop() || '0') + 1
      : 1

    const procurementCode = `${codePrefix}-${String(sequence).padStart(4, '0')}`

    // Assess supplier risk
    const riskScore = await assessSupplierRisk(data.supplierName, sppg.id)

    // Create procurement with items in transaction
    const procurement = await db.$transaction(async (tx) => {
      const newProcurement = await tx.procurement.create({
        data: {
          sppgId: sppg.id,
          planId: data.planId,
          procurementCode,
          expectedDelivery: data.expectedDelivery ? new Date(data.expectedDelivery) : undefined,
          supplierName: data.supplierName,
          supplierContact: data.supplierContact,
          supplierAddress: data.supplierAddress,
          supplierEmail: data.supplierEmail,
          supplierType: data.supplierType,
          purchaseMethod: data.purchaseMethod,
          paymentTerms: data.paymentTerms,
          subtotalAmount: subtotal,
          taxAmount,
          discountAmount: data.discountAmount,
          shippingCost: data.shippingCost,
          totalAmount: total,
          paymentDue: data.paymentDue ? new Date(data.paymentDue) : undefined,
          qualityNotes: data.qualityNotes,
          deliveryMethod: data.deliveryMethod,
          transportCost: data.transportCost,
          packagingType: data.packagingType,
          status: 'DRAFT'
        }
      })

      // Create procurement items
      for (const item of data.items) {
        await tx.procurementItem.create({
          data: {
            procurementId: newProcurement.id,
            inventoryItemId: item.inventoryItemId,
            itemName: item.itemName || 'Unknown Item',
            category: item.category || 'PROTEIN',
            orderedQuantity: item.quantity,
            unit: item.unit || 'kg',
            pricePerUnit: item.unitPrice,
            totalPrice: item.totalPrice,
            finalPrice: item.totalPrice
          }
        })
      }

      return newProcurement
    })

    // Create audit log
    await db.auditLog.create({
      data: {
        sppgId: sppg.id,
        userId: session.user.id,
        action: 'CREATE',
        entityType: 'PROCUREMENT',
        entityId: procurement.id,
        description: `Created procurement ${procurementCode} for supplier ${data.supplierName}`,
        metadata: {
          procurementCode,
          supplierName: data.supplierName,
          totalAmount: total,
          riskScore
        }
      }
    })

    // Broadcast update
    await broadcastProcurementUpdate(sppg.id, 'created', procurement, {
      riskScore,
      itemCount: data.items.length
    })

    revalidatePath('/procurement')

    return ServiceResult.success(procurement)

  } catch (error) {
    console.error('Create procurement error:', error)
    return ServiceResult.error('Failed to create procurement')
  }
}

export async function updateProcurementStatus(input: z.infer<typeof updateProcurementStatusSchema>) {
  try {
    const session = await auth()
    if (!session?.user) {
      return ServiceResult.error('Unauthorized')
    }

    const validated = updateProcurementStatusSchema.safeParse(input)
    if (!validated.success) {
      return ServiceResult.error('Validation failed')
    }

    const { procurementId, status, notes, actualDelivery, qualityGrade, inspectedBy, rejectionReason } = validated.data

    // Get procurement with access check
    const procurement = await db.procurement.findFirst({
      where: {
        id: procurementId,
        sppgId: session.user.sppgId!
      }
    })

    if (!procurement) {
      return ServiceResult.error('Procurement not found')
    }

    if (!hasPermission(session.user.userRole, 'PROCUREMENT_MANAGE')) {
      return ServiceResult.error('Insufficient permissions')
    }

    const oldStatus = procurement.status

    // Update procurement
    const updatedProcurement = await db.procurement.update({
      where: { id: procurementId },
      data: {
        status,
        actualDelivery: actualDelivery ? new Date(actualDelivery) : undefined,
        qualityGrade,
        inspectedBy,
        rejectionReason,
        inspectedAt: inspectedBy ? new Date() : undefined,
        acceptanceStatus: status === 'FULLY_RECEIVED' ? 'ACCEPTED' :
                         status === 'CANCELLED' ? 'REJECTED' :
                         undefined
      }
    })

    // If status changed to FULLY_RECEIVED, update inventory
    if (status === 'FULLY_RECEIVED' && oldStatus !== 'FULLY_RECEIVED') {
      const procurementItems = await db.procurementItem.findMany({
        where: { procurementId }
      })

      await db.$transaction(async (tx) => {
        for (const item of procurementItems) {
          if (item.inventoryItemId) {
            // Update inventory stock
            await tx.inventoryItem.update({
              where: { id: item.inventoryItemId },
              data: {
                currentStock: {
                  increment: item.orderedQuantity
                }
              }
            })

            // Get current stock for movement tracking
            const currentItem = await tx.inventoryItem.findUnique({
              where: { id: item.inventoryItemId }
            })
            
            const stockBefore = currentItem?.currentStock || 0

            // Create stock movement
            await tx.stockMovement.create({
              data: {
                inventoryId: item.inventoryItemId,
                movementType: MovementType.IN,
                quantity: item.orderedQuantity,
                unit: item.unit,
                stockBefore,
                stockAfter: stockBefore + item.orderedQuantity,
                unitCost: item.pricePerUnit,
                totalCost: item.totalPrice,
                notes: `Procurement received: ${procurement.procurementCode}`,
                referenceType: 'PROCUREMENT',
                referenceId: procurement.id,
                movedBy: session.user.id,
                movedAt: actualDelivery ? new Date(actualDelivery) : new Date()
              }
            })
          }
        }
      })
    }

    // Create audit log
    await db.auditLog.create({
      data: {
        sppgId: procurement.sppgId,
        userId: session.user.id,
        action: 'UPDATE',
        entityType: 'PROCUREMENT',
        entityId: procurement.id,
        description: `Updated procurement ${procurement.procurementCode} status from ${oldStatus} to ${status}`,
        metadata: {
          oldStatus,
          newStatus: status,
          notes,
          actualDelivery: actualDelivery,
          qualityGrade,
          rejectionReason
        }
      }
    })

    // Broadcast update
    await broadcastProcurementUpdate(procurement.sppgId, 'status_changed', updatedProcurement, {
      oldStatus,
      newStatus: status,
      inventoryUpdated: status === 'FULLY_RECEIVED'
    })

    revalidatePath('/procurement')

    return ServiceResult.success(updatedProcurement)

  } catch (error) {
    console.error('Update procurement status error:', error)
    return ServiceResult.error('Failed to update procurement status')
  }
}

export async function getProcurements(
  filters: {
    status?: ProcurementStatus
    supplierName?: string
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

    const { status, supplierName, dateFrom, dateTo, page = 1, limit = 20 } = filters
    const skip = (page - 1) * limit

    const where = {
      sppgId: session.user.sppgId,
      ...(status && { status }),
      ...(supplierName && { 
        supplierName: {
          contains: supplierName,
          mode: 'insensitive' as const
        }
      }),
      ...(dateFrom || dateTo) && {
        procurementDate: {
          ...(dateFrom && { gte: new Date(dateFrom) }),
          ...(dateTo && { lte: new Date(dateTo) })
        }
      }
    }

    const [procurements, total] = await Promise.all([
      db.procurement.findMany({
        where,
        include: {
          sppg: {
            select: {
              name: true,
              code: true
            }
          },
          items: {
            include: {
              inventoryItem: {
                select: {
                  itemName: true,
                  itemCode: true,
                  unit: true
                }
              }
            }
          }
        },
        orderBy: { procurementDate: 'desc' },
        skip,
        take: limit
      }),
      db.procurement.count({ where })
    ])

    return ServiceResult.success({
      procurements,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Get procurements error:', error)
    return ServiceResult.error('Failed to get procurements')
  }
}

export async function getProcurementAnalytics() {
  try {
    const session = await auth()
    if (!session?.user?.sppgId) {
      return ServiceResult.error('Unauthorized')
    }

    if (!hasPermission(session.user.userRole, 'ANALYTICS_VIEW')) {
      return ServiceResult.error('Insufficient permissions')
    }

    const sppgId = session.user.sppgId
    const oneYearAgo = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)

    // Get all procurements from the last year
    const procurements = await db.procurement.findMany({
      where: {
        sppgId,
        createdAt: { gte: oneYearAgo }
      },
      include: {
        items: {
          include: {
            inventoryItem: true
          }
        }
      }
    })

    // Calculate basic metrics
    const totalProcurements = procurements.length
    const totalValue = procurements.reduce((sum: number, p) => sum + p.totalAmount, 0)
    const averageOrderValue = totalProcurements > 0 ? totalValue / totalProcurements : 0

    // Top suppliers analysis
    const supplierStats = new Map<string, {
      totalOrders: number
      totalValue: number
      qualityGrades: (string | null)[]
    }>()

    procurements.forEach(p => {
      const existing = supplierStats.get(p.supplierName) || {
        totalOrders: 0,
        totalValue: 0,
        qualityGrades: []
      }
      
      existing.totalOrders += 1
      existing.totalValue += p.totalAmount
      if (p.qualityGrade) {
        existing.qualityGrades.push(p.qualityGrade)
      }
      
      supplierStats.set(p.supplierName, existing)
    })

    const topSuppliers = Array.from(supplierStats.entries())
      .map(([supplierName, stats]) => ({
        supplierName,
        totalOrders: stats.totalOrders,
        totalValue: stats.totalValue,
        averageQuality: stats.qualityGrades.length > 0
          ? stats.qualityGrades.reduce((sum, grade) => {
              const gradeValue = grade === 'EXCELLENT' ? 5 : 
                               grade === 'GOOD' ? 4 : 
                               grade === 'FAIR' ? 3 : 
                               grade === 'POOR' ? 2 : 1
              return sum + gradeValue
            }, 0) / stats.qualityGrades.length
          : 0
      }))
      .sort((a, b) => b.totalValue - a.totalValue)
      .slice(0, 10)

    // Status distribution
    const statusDistribution = procurements.reduce((acc: Record<string, number>, p) => {
      acc[p.status] = (acc[p.status] || 0) + 1
      return acc
    }, {})

    const analytics = {
      totalProcurements,
      totalValue,
      averageOrderValue,
      topSuppliers,
      statusDistribution,
      supplierPerformance: await Promise.all(
        Array.from(supplierStats.keys()).slice(0, 10).map(async supplierName => {
          const riskScore = await assessSupplierRisk(supplierName, sppgId)
          return {
            supplierName,
            riskScore
          }
        })
      )
    }

    return ServiceResult.success(analytics)

  } catch (error) {
    console.error('Get procurement analytics error:', error)
    return ServiceResult.error('Failed to get procurement analytics')
  }
}