'use server'

import { auth } from '@/auth'
import db from '@/lib/db'
import { ServiceResult } from '@/lib/service-result'
import { hasPermission, checkSppgAccess } from '@/lib/permissions'
import { revalidatePath } from 'next/cache'
import Redis from 'ioredis'
import { z } from 'zod'
import { InventoryCategory, MovementType } from '@prisma/client'

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379')

// ============================================================================
// ENTERPRISE VALIDATION SCHEMAS
// ============================================================================

const createInventoryItemSchema = z.object({
  itemName: z.string().min(2).max(200),
  itemCode: z.string().optional(),
  category: z.nativeEnum(InventoryCategory),
  brand: z.string().optional(),
  unit: z.string().min(1).max(20),
  currentStock: z.number().min(0),
  minStock: z.number().min(0),
  maxStock: z.number().min(0),
  reorderQuantity: z.number().min(0).optional(),
  lastPrice: z.number().min(0).optional(),
  averagePrice: z.number().min(0).optional(),
  preferredSupplier: z.string().optional(),
  supplierContact: z.string().optional(),
  leadTime: z.number().int().min(0).optional(),
  storageLocation: z.string().min(1),
  storageCondition: z.string().optional(),
  hasExpiry: z.boolean().default(false),
  shelfLife: z.number().int().min(0).optional(),
  nutritionPer100g: z.object({
    calories: z.number().min(0).optional(),
    protein: z.number().min(0).optional(),
    carbohydrates: z.number().min(0).optional(),
    fat: z.number().min(0).optional(),
    fiber: z.number().min(0).optional()
  }).optional(),
  isActive: z.boolean().default(true)
})

const updateInventoryItemSchema = z.object({
  itemId: z.string().cuid(),
  itemName: z.string().min(2).max(200).optional(),
  itemCode: z.string().optional(),
  category: z.nativeEnum(InventoryCategory).optional(),
  brand: z.string().optional(),
  unit: z.string().min(1).max(20).optional(),
  currentStock: z.number().min(0).optional(),
  minStock: z.number().min(0).optional(),
  maxStock: z.number().min(0).optional(),
  reorderQuantity: z.number().min(0).optional(),
  lastPrice: z.number().min(0).optional(),
  averagePrice: z.number().min(0).optional(),
  preferredSupplier: z.string().optional(),
  supplierContact: z.string().optional(),
  leadTime: z.number().int().min(0).optional(),
  storageLocation: z.string().min(1).optional(),
  storageCondition: z.string().optional(),
  hasExpiry: z.boolean().optional(),
  shelfLife: z.number().int().min(0).optional(),
  nutritionPer100g: z.object({
    calories: z.number().min(0).optional(),
    protein: z.number().min(0).optional(),
    carbohydrates: z.number().min(0).optional(),
    fat: z.number().min(0).optional(),
    fiber: z.number().min(0).optional()
  }).optional(),
  isActive: z.boolean().optional()
})

const stockMovementSchema = z.object({
  inventoryId: z.string().cuid(),
  movementType: z.nativeEnum(MovementType),
  quantity: z.number().min(0.01),
  unit: z.string().min(1),
  unitCost: z.number().min(0).optional(),
  totalCost: z.number().min(0).optional(),
  referenceType: z.string().optional(),
  referenceId: z.string().optional(),
  referenceNumber: z.string().optional(),
  batchNumber: z.string().optional(),
  expiryDate: z.string().optional(),
  notes: z.string().optional(),
  documentUrl: z.string().url().optional()
})

// Reserved for future bulk update functionality
// const bulkStockUpdateSchema = z.object({
//   updates: z.array(z.object({
//     itemId: z.string().cuid(),
//     newStock: z.number().min(0),
//     reason: z.string().min(5),
//     notes: z.string().optional()
//   })).min(1).max(100)
// })

// ============================================================================
// ENTERPRISE HELPER FUNCTIONS
// ============================================================================

export async function calculateInventoryMetrics(sppgId: string, periodDays: number = 90) {
  const endDate = new Date()
  const startDate = new Date(endDate.getTime() - (periodDays * 24 * 60 * 60 * 1000))

  // Get all inventory items with stock movements
  const inventoryItems = await db.inventoryItem.findMany({
    where: { sppgId, isActive: true },
    include: {
      stockMovements: {
        where: {
          movedAt: {
            gte: startDate,
            lte: endDate
          }
        }
      }
    }
  })

  const totalItems = inventoryItems.length
  const activeItems = inventoryItems.filter(item => item.currentStock > 0).length
  const lowStockItems = inventoryItems.filter(item => item.currentStock <= item.minStock).length
  const outOfStockItems = inventoryItems.filter(item => item.currentStock === 0).length

  // Calculate total inventory value
  const totalValue = inventoryItems.reduce((sum, item) => {
    return sum + (item.currentStock * (item.lastPrice || item.averagePrice || 0))
  }, 0)

  // Calculate stock movements
  const allMovements = inventoryItems.flatMap(item => item.stockMovements)
  const totalMovements = allMovements.length
  const incomingStock = allMovements
    .filter(movement => movement.movementType === MovementType.IN)
    .reduce((sum, movement) => sum + movement.quantity, 0)
  const outgoingStock = allMovements
    .filter(movement => movement.movementType === MovementType.OUT)
    .reduce((sum, movement) => sum + movement.quantity, 0)

  // Calculate turnover rate
  const avgInventoryValue = totalValue > 0 ? totalValue : 1
  const costOfGoodsUsed = allMovements
    .filter(movement => movement.movementType === MovementType.OUT)
    .reduce((sum, movement) => sum + (movement.totalCost || 0), 0)
  const turnoverRate = avgInventoryValue > 0 ? costOfGoodsUsed / avgInventoryValue : 0

  // Category distribution
  const categoryDistribution = inventoryItems.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return {
    overview: {
      totalItems,
      activeItems,
      lowStockItems,
      outOfStockItems,
      totalValue: Math.round(totalValue),
      turnoverRate: Math.round(turnoverRate * 100) / 100
    },
    movements: {
      totalMovements,
      incomingStock,
      outgoingStock,
      netChange: incomingStock - outgoingStock
    },
    categoryDistribution,
    alerts: {
      lowStock: lowStockItems,
      outOfStock: outOfStockItems
    }
  }
}

export async function calculateItemAnalytics(itemId: string, periodDays: number = 90) {
  const endDate = new Date()
  const startDate = new Date(endDate.getTime() - (periodDays * 24 * 60 * 60 * 1000))

  const item = await db.inventoryItem.findFirst({
    where: { id: itemId },
    include: {
      stockMovements: {
        where: {
          movedAt: {
            gte: startDate,
            lte: endDate
          }
        },
        orderBy: { movedAt: 'desc' }
      }
    }
  })

  if (!item) return null

  const movements = item.stockMovements
  const inMovements = movements.filter(m => m.movementType === MovementType.IN)
  const outMovements = movements.filter(m => m.movementType === MovementType.OUT)

  const totalIn = inMovements.reduce((sum, m) => sum + m.quantity, 0)
  const totalOut = outMovements.reduce((sum, m) => sum + m.quantity, 0)
  const avgDailyUsage = totalOut / periodDays
  const daysOfStock = avgDailyUsage > 0 ? item.currentStock / avgDailyUsage : 999

  // Calculate average price
  const priceMovements = movements.filter(m => m.unitCost && m.unitCost > 0)
  const avgPrice = priceMovements.length > 0
    ? priceMovements.reduce((sum, m) => sum + (m.unitCost || 0), 0) / priceMovements.length
    : item.lastPrice || item.averagePrice || 0

  // Stock status
  const stockStatus = item.currentStock === 0 ? 'OUT_OF_STOCK' :
                     item.currentStock <= item.minStock ? 'LOW_STOCK' :
                     item.currentStock >= item.maxStock ? 'OVERSTOCKED' : 'OPTIMAL'

  return {
    itemInfo: {
      id: item.id,
      name: item.itemName,
      category: item.category,
      currentStock: item.currentStock,
      minStock: item.minStock,
      maxStock: item.maxStock,
      unit: item.unit,
      lastPrice: item.lastPrice,
      averagePrice: item.averagePrice
    },
    analytics: {
      totalIn,
      totalOut,
      avgDailyUsage: Math.round(avgDailyUsage * 100) / 100,
      daysOfStock: Math.round(daysOfStock),
      avgPrice: Math.round(avgPrice),
      stockStatus,
      movementFrequency: movements.length
    },
    recommendations: {
      reorderSuggested: item.currentStock <= item.minStock,
      quantityToOrder: Math.max(0, item.maxStock - item.currentStock),
      urgencyLevel: stockStatus === 'OUT_OF_STOCK' ? 'CRITICAL' :
                   stockStatus === 'LOW_STOCK' ? 'HIGH' : 'LOW'
    }
  }
}

async function broadcastInventoryUpdate(
  sppgId: string,
  type: 'item_created' | 'item_updated' | 'stock_movement' | 'low_stock_alert',
  data: { id: string; name: string; message: string },
  additionalData?: Record<string, unknown>
) {
  const message = {
    type: `inventory_${type}`,
    sppgId,
    data,
    timestamp: new Date().toISOString(),
    ...additionalData
  }

  await Promise.all([
    redis.publish(`sppg:${sppgId}:inventory`, JSON.stringify(message)),
    redis.publish(`sppg:${sppgId}:notifications`, JSON.stringify({
      type: 'inventory_notification',
      title: type === 'item_created' ? 'Item Baru Ditambahkan' :
             type === 'item_updated' ? 'Item Diperbarui' :
             type === 'stock_movement' ? 'Pergerakan Stok' :
             'Peringatan Stok Rendah',
      message: data.message,
      sppgId,
      timestamp: new Date().toISOString()
    }))
  ])
}

// ============================================================================
// ENTERPRISE INVENTORY SERVER ACTIONS
// ============================================================================

export async function createInventoryItem(input: z.infer<typeof createInventoryItemSchema>) {
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
    const validated = createInventoryItemSchema.safeParse(input)
    if (!validated.success) {
      return ServiceResult.error('Validation failed')
    }

    const data = validated.data

    // Check for duplicate item code if provided
    if (data.itemCode) {
      const existingItem = await db.inventoryItem.findFirst({
        where: {
          sppgId: sppg.id,
          itemCode: data.itemCode
        }
      })

      if (existingItem) {
        return ServiceResult.error('Item code already exists')
      }
    }

    // Generate item code if not provided
    let itemCode = data.itemCode
    if (!itemCode) {
      const categoryPrefix = data.category.substring(0, 3).toUpperCase()
      const itemCount = await db.inventoryItem.count({
        where: { sppgId: sppg.id, category: data.category }
      })
      itemCode = `${categoryPrefix}-${String(itemCount + 1).padStart(4, '0')}`
    }

    // Create inventory item
    const inventoryItem = await db.inventoryItem.create({
      data: {
        sppgId: sppg.id,
        itemName: data.itemName,
        itemCode,
        category: data.category,
        brand: data.brand,
        unit: data.unit,
        currentStock: data.currentStock,
        minStock: data.minStock,
        maxStock: data.maxStock,
        reorderQuantity: data.reorderQuantity,
        lastPrice: data.lastPrice,
        averagePrice: data.averagePrice,
        preferredSupplier: data.preferredSupplier,
        supplierContact: data.supplierContact,
        leadTime: data.leadTime,
        storageLocation: data.storageLocation,
        storageCondition: data.storageCondition,
        hasExpiry: data.hasExpiry,
        shelfLife: data.shelfLife,
        calories: data.nutritionPer100g?.calories,
        protein: data.nutritionPer100g?.protein,
        carbohydrates: data.nutritionPer100g?.carbohydrates,
        fat: data.nutritionPer100g?.fat,
        fiber: data.nutritionPer100g?.fiber,
        isActive: data.isActive
      }
    })

    // Create initial stock movement if stock > 0
    if (data.currentStock > 0) {
      await db.stockMovement.create({
        data: {
          inventoryId: inventoryItem.id,
          movementType: MovementType.IN,
          quantity: data.currentStock,
          unit: data.unit,
          stockBefore: 0,
          stockAfter: data.currentStock,
          unitCost: data.lastPrice || data.averagePrice,
          totalCost: data.currentStock * (data.lastPrice || data.averagePrice || 0),
          notes: 'Initial stock entry',
          movedBy: session.user.id
        }
      })
    }

    // Calculate metrics
    const metrics = await calculateInventoryMetrics(sppg.id)

    // Create audit log
    await db.auditLog.create({
      data: {
        sppgId: sppg.id,
        userId: session.user.id,
        action: 'CREATE',
        entityType: 'INVENTORY_ITEM',
        entityId: inventoryItem.id,
        description: `Created inventory item ${data.itemName} (${itemCode}) with initial stock ${data.currentStock} ${data.unit}`,
        metadata: {
          itemCode,
          itemName: data.itemName,
          category: data.category,
          initialStock: data.currentStock,
          lastPrice: data.lastPrice,
          totalValue: data.currentStock * (data.lastPrice || 0)
        }
      }
    })

    // Broadcast update
    await broadcastInventoryUpdate(sppg.id, 'item_created', {
      id: inventoryItem.id,
      name: data.itemName,
      message: `Item inventory ${data.itemName} telah ditambahkan dengan stok awal ${data.currentStock} ${data.unit}`
    }, {
      itemCode,
      category: data.category,
      initialStock: data.currentStock
    })

    revalidatePath('/inventory')

    return ServiceResult.success({
      inventoryItem,
      metrics
    })

  } catch (error) {
    console.error('Create inventory item error:', error)
    return ServiceResult.error('Failed to create inventory item')
  }
}

export async function updateInventoryItem(input: z.infer<typeof updateInventoryItemSchema>) {
  try {
    const session = await auth()
    if (!session?.user) {
      return ServiceResult.error('Unauthorized')
    }

    const validated = updateInventoryItemSchema.safeParse(input)
    if (!validated.success) {
      return ServiceResult.error('Validation failed')
    }

    const { itemId, ...updateData } = validated.data

    // Get existing item with access check
    const existingItem = await db.inventoryItem.findFirst({
      where: {
        id: itemId,
        sppgId: session.user.sppgId!
      }
    })

    if (!existingItem) {
      return ServiceResult.error('Inventory item not found')
    }

    if (!hasPermission(session.user.userRole, 'PROCUREMENT_MANAGE')) {
      return ServiceResult.error('Insufficient permissions')
    }

    // Check for duplicate item code if updating
    if (updateData.itemCode && updateData.itemCode !== existingItem.itemCode) {
      const duplicateCode = await db.inventoryItem.findFirst({
        where: {
          sppgId: session.user.sppgId!,
          itemCode: updateData.itemCode,
          id: { not: itemId }
        }
      })

      if (duplicateCode) {
        return ServiceResult.error('Item code already exists')
      }
    }

    // Handle stock changes
    const stockChanged = updateData.currentStock !== undefined && updateData.currentStock !== existingItem.currentStock
    const stockDifference = stockChanged ? (updateData.currentStock! - existingItem.currentStock) : 0

    // Update inventory item in transaction
    const result = await db.$transaction(async (tx) => {
      // Update item
      const updatedItem = await tx.inventoryItem.update({
        where: { id: itemId },
        data: {
          itemName: updateData.itemName,
          itemCode: updateData.itemCode,
          category: updateData.category,
          brand: updateData.brand,
          unit: updateData.unit,
          currentStock: updateData.currentStock,
          minStock: updateData.minStock,
          maxStock: updateData.maxStock,
          reorderQuantity: updateData.reorderQuantity,
          lastPrice: updateData.lastPrice,
          averagePrice: updateData.averagePrice,
          preferredSupplier: updateData.preferredSupplier,
          supplierContact: updateData.supplierContact,
          leadTime: updateData.leadTime,
          storageLocation: updateData.storageLocation,
          storageCondition: updateData.storageCondition,
          hasExpiry: updateData.hasExpiry,
          shelfLife: updateData.shelfLife,
          calories: updateData.nutritionPer100g?.calories,
          protein: updateData.nutritionPer100g?.protein,
          carbohydrates: updateData.nutritionPer100g?.carbohydrates,
          fat: updateData.nutritionPer100g?.fat,
          fiber: updateData.nutritionPer100g?.fiber,
          isActive: updateData.isActive
        }
      })

      // Create stock movement if stock changed
      if (stockChanged && stockDifference !== 0) {
        const newStock = updateData.currentStock!
        await tx.stockMovement.create({
          data: {
            inventoryId: itemId,
            movementType: stockDifference > 0 ? MovementType.IN : MovementType.OUT,
            quantity: Math.abs(stockDifference),
            unit: updateData.unit || existingItem.unit,
            stockBefore: existingItem.currentStock,
            stockAfter: newStock,
            unitCost: updateData.lastPrice || existingItem.lastPrice,
            totalCost: Math.abs(stockDifference) * (updateData.lastPrice || existingItem.lastPrice || 0),
            notes: 'Stock adjustment via item update',
            referenceType: 'ADJUSTMENT',
            movedBy: session.user.id
          }
        })
      }

      return updatedItem
    })

    // Calculate updated metrics
    const metrics = await calculateInventoryMetrics(session.user.sppgId!)

    // Create audit log
    await db.auditLog.create({
      data: {
        sppgId: session.user.sppgId!,
        userId: session.user.id,
        action: 'UPDATE',
        entityType: 'INVENTORY_ITEM',
        entityId: itemId,
        description: `Updated inventory item ${result.itemName} (${result.itemCode})${stockChanged ? ` - Stock changed by ${stockDifference}` : ''}`,
        metadata: {
          itemCode: result.itemCode,
          itemName: result.itemName,
          changes: Object.keys(updateData),
          stockDifference,
          newStock: result.currentStock
        }
      }
    })

    // Broadcast update
    await broadcastInventoryUpdate(session.user.sppgId!, 'item_updated', {
      id: itemId,
      name: result.itemName,
      message: `Item inventory ${result.itemName} telah diperbarui${stockChanged ? ` (stok: ${result.currentStock})` : ''}`
    }, {
      itemCode: result.itemCode,
      stockChanged,
      stockDifference
    })

    // Check for low stock alert
    if (result.currentStock <= result.minStock) {
      await broadcastInventoryUpdate(session.user.sppgId!, 'low_stock_alert', {
        id: itemId,
        name: result.itemName,
        message: `Peringatan: Stok ${result.itemName} rendah (${result.currentStock} ${result.unit})`
      }, {
        currentStock: result.currentStock,
        minStock: result.minStock,
        urgency: result.currentStock === 0 ? 'CRITICAL' : 'HIGH'
      })
    }

    revalidatePath('/inventory')

    return ServiceResult.success({
      inventoryItem: result,
      metrics
    })

  } catch (error) {
    console.error('Update inventory item error:', error)
    return ServiceResult.error('Failed to update inventory item')
  }
}

export async function recordStockMovement(input: z.infer<typeof stockMovementSchema>) {
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
    const validated = stockMovementSchema.safeParse(input)
    if (!validated.success) {
      return ServiceResult.error('Validation failed')
    }

    const data = validated.data

    // Verify inventory item exists and belongs to SPPG
    const inventoryItem = await db.inventoryItem.findFirst({
      where: {
        id: data.inventoryId,
        sppgId: sppg.id
      }
    })

    if (!inventoryItem) {
      return ServiceResult.error('Inventory item not found')
    }

    // Check if OUT movement would result in negative stock
    if (data.movementType === MovementType.OUT && inventoryItem.currentStock < data.quantity) {
      return ServiceResult.error(`Insufficient stock. Available: ${inventoryItem.currentStock} ${inventoryItem.unit}`)
    }

    // Calculate new stock level
    const stockChange = data.movementType === MovementType.IN ? data.quantity : -data.quantity
    const newStock = inventoryItem.currentStock + stockChange

    if (newStock < 0) {
      return ServiceResult.error('Stock cannot be negative')
    }

    // Calculate total cost if not provided
    const totalCost = data.totalCost || (data.quantity * (data.unitCost || inventoryItem.lastPrice || inventoryItem.averagePrice || 0))

    // Create stock movement and update inventory in transaction
    const result = await db.$transaction(async (tx) => {
      // Create stock movement
      const movement = await tx.stockMovement.create({
        data: {
          inventoryId: data.inventoryId,
          movementType: data.movementType,
          quantity: data.quantity,
          unit: data.unit,
          stockBefore: inventoryItem.currentStock,
          stockAfter: newStock,
          unitCost: data.unitCost || inventoryItem.lastPrice || inventoryItem.averagePrice,
          totalCost,
          referenceType: data.referenceType,
          referenceId: data.referenceId,
          referenceNumber: data.referenceNumber,
          batchNumber: data.batchNumber,
          expiryDate: data.expiryDate ? new Date(data.expiryDate) : null,
          notes: data.notes,
          documentUrl: data.documentUrl,
          movedBy: session.user.id
        }
      })

      // Update inventory stock
      const updatedItem = await tx.inventoryItem.update({
        where: { id: data.inventoryId },
        data: {
          currentStock: newStock,
          // Update last price for IN movements
          ...(data.movementType === MovementType.IN && data.unitCost && {
            lastPrice: data.unitCost
          })
        }
      })

      return { movement, updatedItem }
    })

    // Calculate updated metrics
    const metrics = await calculateInventoryMetrics(sppg.id)

    // Create audit log
    await db.auditLog.create({
      data: {
        sppgId: sppg.id,
        userId: session.user.id,
        action: 'CREATE',
        entityType: 'STOCK_MOVEMENT',
        entityId: result.movement.id,
        description: `Stock ${data.movementType} - ${inventoryItem.itemName}: ${data.quantity} ${data.unit} (${inventoryItem.currentStock} → ${newStock})`,
        metadata: {
          inventoryItemId: data.inventoryId,
          itemName: inventoryItem.itemName,
          movementType: data.movementType,
          quantity: data.quantity,
          oldStock: inventoryItem.currentStock,
          newStock,
          totalCost,
          referenceType: data.referenceType
        }
      }
    })

    // Broadcast update
    await broadcastInventoryUpdate(sppg.id, 'stock_movement', {
      id: result.movement.id,
      name: inventoryItem.itemName,
      message: `Pergerakan stok ${inventoryItem.itemName}: ${data.movementType} ${data.quantity} ${data.unit}`
    }, {
      movementType: data.movementType,
      quantity: data.quantity,
      oldStock: inventoryItem.currentStock,
      newStock,
      totalCost
    })

    // Check for low stock alert
    if (newStock <= inventoryItem.minStock) {
      await broadcastInventoryUpdate(sppg.id, 'low_stock_alert', {
        id: data.inventoryId,
        name: inventoryItem.itemName,
        message: `Peringatan: Stok ${inventoryItem.itemName} rendah (${newStock} ${inventoryItem.unit})`
      }, {
        currentStock: newStock,
        minStock: inventoryItem.minStock,
        urgency: newStock === 0 ? 'CRITICAL' : 'HIGH'
      })
    }

    revalidatePath('/inventory')

    return ServiceResult.success({
      movement: result.movement,
      inventoryItem: result.updatedItem,
      metrics
    })

  } catch (error) {
    console.error('Record stock movement error:', error)
    return ServiceResult.error('Failed to record stock movement')
  }
}

export async function getInventoryItems(
  filters: {
    category?: InventoryCategory
    lowStock?: boolean
    outOfStock?: boolean
    search?: string
    page?: number
    limit?: number
  } = {}
) {
  try {
    const session = await auth()
    if (!session?.user?.sppgId) {
      return ServiceResult.error('Unauthorized')
    }

    if (!hasPermission(session.user.userRole, 'READ')) {
      return ServiceResult.error('Insufficient permissions')
    }

    const { category, lowStock, outOfStock, search, page = 1, limit = 20 } = filters
    const skip = (page - 1) * limit

    // Build where conditions
    const conditions = []
    
    conditions.push({ sppgId: session.user.sppgId! })
    conditions.push({ isActive: true })
    
    if (category) {
      conditions.push({ category })
    }
    
    if (outOfStock) {
      conditions.push({ currentStock: 0 })
    } else if (lowStock) {
      // This is a workaround since Prisma doesn't support field comparisons directly
      // We'll filter this after the query
    }
    
    if (search) {
      conditions.push({
        OR: [
          { itemName: { contains: search, mode: 'insensitive' as const } },
          { itemCode: { contains: search, mode: 'insensitive' as const } },
          { brand: { contains: search, mode: 'insensitive' as const } },
          { preferredSupplier: { contains: search, mode: 'insensitive' as const } }
        ]
      })
    }

    const where = { AND: conditions }

    const allItems = await db.inventoryItem.findMany({
      where,
      include: {
        stockMovements: {
          orderBy: { movedAt: 'desc' },
          take: 3
        }
      },
      orderBy: [
        { currentStock: 'asc' }, // Show low stock items first
        { itemName: 'asc' }
      ]
    })

    // Filter for low stock after query if needed
    let items = allItems
    if (lowStock && !outOfStock) {
      items = items.filter(item => item.currentStock <= item.minStock && item.currentStock > 0)
    }

    // Apply pagination to filtered results
    const paginatedItems = items.slice(skip, skip + limit)

    // Calculate analytics for each item
    const itemsWithAnalytics = await Promise.all(
      paginatedItems.map(async (item) => {
        const analytics = await calculateItemAnalytics(item.id)
        
        return {
          ...item,
          analytics
        }
      })
    )

    return ServiceResult.success({
      items: itemsWithAnalytics,
      pagination: {
        page,
        limit,
        total: items.length,
        totalPages: Math.ceil(items.length / limit)
      }
    })

  } catch (error) {
    console.error('Get inventory items error:', error)
    return ServiceResult.error('Failed to get inventory items')
  }
}

export async function getInventoryAnalytics() {
  try {
    const session = await auth()
    if (!session?.user?.sppgId) {
      return ServiceResult.error('Unauthorized')
    }

    if (!hasPermission(session.user.userRole, 'ANALYTICS_VIEW')) {
      return ServiceResult.error('Insufficient permissions')
    }

    const analytics = await calculateInventoryMetrics(session.user.sppgId!)

    return ServiceResult.success(analytics)

  } catch (error) {
    console.error('Get inventory analytics error:', error)
    return ServiceResult.error('Failed to get inventory analytics')
  }
}