// Inventory Utils - Pattern 2 Export Barrel  
// Consolidated validation schemas and utility functions
// src/components/sppg/inventory/utils/index.ts

// ================================ SCHEMA EXPORTS ================================
// Consolidated validation schemas from domain
export {
  // Core inventory schemas
  createInventoryItemSchema,
  updateInventoryItemSchema,
  
  // Stock management schemas
  updateStockSchema,
  stockMovementSchema,
  
  // Filtering & pagination schemas
  inventoryFiltersSchema,
  paginationSchema,
  
  // Bulk operations schemas
  bulkUpdateStockSchema,
  bulkCreateInventorySchema,
  
  // Import/Export schemas
  importInventorySchema,
  
  // Reporting schemas
  inventoryReportSchema,
  
  // Settings schemas
  inventorySettingsSchema,
  
  // Type exports
  type CreateInventoryItemInput,
  type UpdateInventoryItemInput,
  type UpdateStockInput,
  type StockMovementInput,
  type InventoryFiltersInput,
  type PaginationInput,
  type BulkUpdateStockInput,
  type BulkCreateInventoryInput,
  type ImportInventoryInput,
  type InventoryReportInput,
  type InventorySettingsInput,
  
  // Legacy compatibility
  inventoryItemSchema,
  type InventoryItemInput,
  
  // Validation helpers
  validateIndonesianPostalCode,
  validateIndonesianPhone,
  validateNPWP,
  validateSppgItemCode,
  getExpiryAlertDays,
  calculateMinimumStock
} from './inventorySchemas'

// ================================ UTILITY FUNCTIONS ================================

/**
 * Calculate total inventory value from items array
 */
export const calculateInventoryValue = (items: Array<{ unitPrice: number; currentStock: number }>) => {
  return items.reduce((total, item) => total + (item.unitPrice * item.currentStock), 0)
}

/**
 * Determine stock status based on current, min, and max levels
 */
export const getStockStatus = (current: number, min?: number, max?: number): 'low' | 'high' | 'normal' | 'out' => {
  if (current <= 0) return 'out'
  if (min && current <= min) return 'low'
  if (max && current >= max) return 'high'
  return 'normal'
}

/**
 * Calculate stock percentage for progress indicators
 */
export const calculateStockPercentage = (current: number, max: number): number => {
  if (max <= 0) return 0
  return Math.min(Math.max((current / max) * 100, 0), 100)
}

/**
 * Format stock quantity with appropriate units
 */
export const formatStockQuantity = (quantity: number, unit: string): string => {
  if (quantity === 0) return `0 ${unit}`
  
  // Handle decimal formatting for different units
  const isDecimalUnit = ['kg', 'liter', 'ml'].includes(unit.toLowerCase())
  
  if (isDecimalUnit && quantity < 1) {
    return `${quantity.toFixed(2)} ${unit}`
  } else if (isDecimalUnit && quantity % 1 !== 0) {
    return `${quantity.toFixed(1)} ${unit}`
  } else {
    return `${Math.floor(quantity)} ${unit}`
  }
}

/**
 * Calculate days until expiry with proper handling
 */
export const calculateDaysUntilExpiry = (expiryDate: Date | string): number => {
  const expiry = new Date(expiryDate)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  expiry.setHours(0, 0, 0, 0)
  
  const timeDiff = expiry.getTime() - today.getTime()
  return Math.ceil(timeDiff / (1000 * 60 * 60 * 24))
}

/**
 * Get expiry status color for UI indicators
 */
export const getExpiryStatusColor = (daysUntilExpiry: number): 'red' | 'orange' | 'yellow' | 'green' => {
  if (daysUntilExpiry < 0) return 'red' // Expired
  if (daysUntilExpiry <= 3) return 'red' // Critical
  if (daysUntilExpiry <= 7) return 'orange' // Warning
  if (daysUntilExpiry <= 14) return 'yellow' // Caution
  return 'green' // Safe
}

/**
 * Format currency for Indonesian Rupiah
 */
export const formatRupiah = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

/**
 * Generate item code suggestion based on category and sequence
 */
export const generateItemCode = (category: string, year: number, sequence: number): string => {
  const categoryPrefix = category.substring(0, 4).toUpperCase()
  const yearSuffix = year.toString().slice(-2)
  const sequenceString = sequence.toString().padStart(3, '0')
  
  return `${categoryPrefix}${yearSuffix}${sequenceString}`
}

/**
 * Validate stock movement is possible
 */
export const validateStockMovement = (
  currentStock: number,
  movementType: 'IN' | 'OUT' | 'ADJUSTMENT',
  quantity: number
): { valid: boolean; message?: string } => {
  if (quantity <= 0) {
    return { valid: false, message: 'Jumlah harus lebih dari 0' }
  }
  
  if (movementType === 'OUT' && quantity > currentStock) {
    return { valid: false, message: 'Stok tidak mencukupi untuk pengeluaran ini' }
  }
  
  if (movementType === 'ADJUSTMENT' && quantity < 0) {
    return { valid: false, message: 'Adjustment tidak boleh negatif' }
  }
  
  return { valid: true }
}

/**
 * Calculate optimal reorder quantity based on consumption patterns
 */
export const calculateReorderQuantity = (
  minStock: number,
  maxStock: number,
  averageDailyConsumption: number,
  leadTimeDays: number = 7
): number => {
  // Economic Order Quantity simplified for SPPG context
  const safetyStock = averageDailyConsumption * leadTimeDays * 1.2 // 20% buffer
  const reorderQuantity = maxStock - minStock + safetyStock
  
  return Math.ceil(Math.max(reorderQuantity, minStock * 2))
}