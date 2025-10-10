// Inventory Domain Validation Schemas - Component-Level Implementation
// Consolidated from src/domains/inventory/validators/inventorySchema.ts  
// src/components/sppg/inventory/utils/inventorySchemas.ts

import { z } from 'zod'
import { InventoryCategory, MovementType } from '@prisma/client'

// ================================ CORE INVENTORY SCHEMAS ================================

export const createInventoryItemSchema = z.object({
  // Basic Information
  itemCode: z
    .string()
    .min(3, 'Kode item minimal 3 karakter')
    .max(20, 'Kode item maksimal 20 karakter')
    .regex(/^[A-Z0-9-]+$/, 'Kode item hanya boleh huruf besar, angka, dan tanda minus'),
  
  itemName: z
    .string()
    .min(3, 'Nama item minimal 3 karakter')
    .max(100, 'Nama item maksimal 100 karakter'),
  
  category: z.nativeEnum(InventoryCategory, {
    message: 'Kategori tidak valid'
  }),
  
  description: z
    .string()
    .max(500, 'Deskripsi maksimal 500 karakter')
    .optional(),

  // Stock Management
  currentStock: z
    .number()
    .min(0, 'Stok saat ini tidak boleh negatif')
    .max(999999, 'Stok saat ini terlalu besar'),
  
  minStock: z
    .number()
    .min(0, 'Stok minimal tidak boleh negatif')
    .max(99999, 'Stok minimal terlalu besar'),
  
  maxStock: z
    .number()
    .min(1, 'Stok maksimal harus lebih dari 0')
    .max(999999, 'Stok maksimal terlalu besar'),

  // Pricing
  unitPrice: z
    .number()
    .min(0, 'Harga jual tidak boleh negatif')
    .max(99999999, 'Harga jual terlalu besar'),
  
  unitCost: z
    .number()
    .min(0, 'Harga beli tidak boleh negatif')
    .max(99999999, 'Harga beli terlalu besar'),

  // Physical Properties
  unit: z
    .string()
    .min(1, 'Satuan tidak boleh kosong')
    .max(10, 'Satuan maksimal 10 karakter')
    // Common Indonesian units
    .refine(
      (unit) => ['kg', 'gram', 'liter', 'ml', 'pcs', 'box', 'pack', 'sak'].includes(unit.toLowerCase()),
      'Satuan tidak valid. Gunakan: kg, gram, liter, ml, pcs, box, pack, sak'
    ),
  
  weight: z
    .number()
    .min(0, 'Berat tidak boleh negatif')
    .max(99999, 'Berat terlalu besar')
    .optional(),
  
  volume: z
    .number()
    .min(0, 'Volume tidak boleh negatif')
    .max(99999, 'Volume terlalu besar')
    .optional(),

  // Storage Information
  storageLocation: z
    .string()
    .min(1, 'Lokasi penyimpanan wajib diisi')
    .max(100, 'Lokasi penyimpanan maksimal 100 karakter'),
  
  storageTemperature: z
    .number()
    .min(-50, 'Suhu penyimpanan terlalu rendah')
    .max(100, 'Suhu penyimpanan terlalu tinggi')
    .optional(),
  
  storageHumidity: z
    .number()
    .min(0, 'Kelembaban tidak boleh negatif')
    .max(100, 'Kelembaban maksimal 100%')
    .optional(),

  // Product Information
  expiryDate: z
    .date()
    .min(new Date(), 'Tanggal kadaluarsa harus di masa depan')
    .optional(),
  
  batchNumber: z
    .string()
    .max(50, 'Nomor batch maksimal 50 karakter')
    .optional(),
  
  manufacturingDate: z
    .date()
    .max(new Date(), 'Tanggal produksi tidak boleh di masa depan')
    .optional(),

  // Supplier Information
  supplierId: z
    .string()
    .cuid('ID supplier tidak valid')
    .optional(),

  // Nutrition Information (for food items)
  calories: z
    .number()
    .min(0, 'Kalori tidak boleh negatif')
    .max(9999, 'Kalori per 100g terlalu tinggi')
    .optional(),
  
  protein: z
    .number()
    .min(0, 'Protein tidak boleh negatif')
    .max(100, 'Protein per 100g maksimal 100g')
    .optional(),
  
  carbohydrates: z
    .number()
    .min(0, 'Karbohidrat tidak boleh negatif')
    .max(100, 'Karbohidrat per 100g maksimal 100g')
    .optional(),
  
  fat: z
    .number()
    .min(0, 'Lemak tidak boleh negatif')
    .max(100, 'Lemak per 100g maksimal 100g')
    .optional(),
  
  fiber: z
    .number()
    .min(0, 'Serat tidak boleh negatif')
    .max(100, 'Serat per 100g maksimal 100g')
    .optional()
}).refine((data) => data.minStock <= data.maxStock, {
  message: 'Stok minimal harus lebih kecil atau sama dengan stok maksimal',
  path: ['maxStock']
}).refine((data) => data.unitCost <= data.unitPrice, {
  message: 'Harga beli tidak boleh lebih tinggi dari harga jual',
  path: ['unitPrice']
}).refine((data) => {
  // If both dates exist, manufacturing should be before expiry
  if (data.manufacturingDate && data.expiryDate) {
    return data.manufacturingDate < data.expiryDate
  }
  return true
}, {
  message: 'Tanggal produksi harus lebih awal dari tanggal kadaluarsa',
  path: ['expiryDate']
})

export const updateInventoryItemSchema = createInventoryItemSchema
  .partial()
  .omit({ itemCode: true }) // Item code cannot be changed after creation
  .extend({
    id: z.string().cuid('ID item tidak valid')
  })

// ================================ STOCK MANAGEMENT SCHEMAS ================================

export const updateStockSchema = z.object({
  type: z.nativeEnum(MovementType, {
    message: 'Tipe pergerakan tidak valid'
  }),
  
  quantity: z
    .number()
    .min(0.01, 'Jumlah harus lebih dari 0')
    .max(99999, 'Jumlah terlalu besar'),
  
  reason: z
    .string()
    .min(3, 'Alasan minimal 3 karakter')
    .max(200, 'Alasan maksimal 200 karakter'),
  
  notes: z
    .string()
    .max(500, 'Catatan maksimal 500 karakter')
    .optional(),
  
  referenceId: z
    .string()
    .cuid('ID referensi tidak valid')
    .optional(),
  
  referenceType: z
    .string()
    .max(50, 'Tipe referensi maksimal 50 karakter')
    .optional()
})

export const stockMovementSchema = z.object({
  inventoryItemId: z
    .string()
    .cuid('ID item inventory tidak valid'),
  
  type: z.nativeEnum(MovementType, {
    message: 'Tipe pergerakan tidak valid'
  }),
  
  quantity: z
    .number()
    .min(0.01, 'Jumlah harus lebih dari 0')
    .max(99999, 'Jumlah terlalu besar'),
  
  reason: z
    .string()
    .min(3, 'Alasan minimal 3 karakter')
    .max(200, 'Alasan maksimal 200 karakter'),
  
  notes: z
    .string()
    .max(500, 'Catatan maksimal 500 karakter')
    .optional(),
  
  referenceId: z
    .string()
    .cuid('ID referensi tidak valid')
    .optional(),
  
  referenceType: z
    .enum(['PROCUREMENT', 'PRODUCTION', 'DISTRIBUTION', 'ADJUSTMENT', 'WASTE'], {
      message: 'Tipe referensi tidak valid'
    })
    .optional()
})

// ================================ FILTERING & SEARCH SCHEMAS ================================

export const inventoryFiltersSchema = z.object({
  // Category filtering
  category: z
    .union([
      z.nativeEnum(InventoryCategory),
      z.array(z.nativeEnum(InventoryCategory))
    ])
    .optional(),
  
  // Stock status filtering
  status: z
    .union([
      z.enum(['AVAILABLE', 'LOW_STOCK', 'OUT_OF_STOCK', 'OVERSTOCK', 'EXPIRED']),
      z.array(z.enum(['AVAILABLE', 'LOW_STOCK', 'OUT_OF_STOCK', 'OVERSTOCK', 'EXPIRED']))
    ])
    .optional(),
  
  // Supplier filtering
  supplierId: z
    .string()
    .cuid('ID supplier tidak valid')
    .optional(),
  
  // Location filtering
  location: z
    .string()
    .max(100, 'Lokasi maksimal 100 karakter')
    .optional(),
  
  // Expiry filtering (in days)
  expiryWithin: z
    .number()
    .min(1, 'Hari kadaluarsa minimal 1')
    .max(365, 'Hari kadaluarsa maksimal 365')
    .optional(),
  
  // Low stock filter
  lowStock: z
    .boolean()
    .optional(),
  
  // Search term
  search: z
    .string()
    .max(100, 'Kata kunci pencarian maksimal 100 karakter')
    .optional()
}).strict()

export const paginationSchema = z.object({
  page: z
    .number()
    .int('Halaman harus berupa bilangan bulat')
    .min(1, 'Halaman minimal 1')
    .max(1000, 'Halaman maksimal 1000')
    .optional()
    .default(1),
  
  limit: z
    .number()
    .int('Limit harus berupa bilangan bulat')
    .min(5, 'Limit minimal 5')
    .max(100, 'Limit maksimal 100')
    .optional()
    .default(20),
  
  sortBy: z
    .enum([
      'itemName', 'itemCode', 'category', 'currentStock', 
      'stockValue', 'unitPrice', 'expiryDate', 'createdAt', 'updatedAt'
    ])
    .optional()
    .default('itemName'),
  
  sortOrder: z
    .enum(['asc', 'desc'])
    .optional()
    .default('asc')
}).strict()

// ================================ BULK OPERATIONS SCHEMAS ================================

export const bulkUpdateStockSchema = z.object({
  items: z
    .array(
      z.object({
        itemId: z.string().cuid('ID item tidak valid'),
        type: z.nativeEnum(MovementType),
        quantity: z.number().min(0.01, 'Jumlah harus lebih dari 0'),
        reason: z.string().min(3, 'Alasan minimal 3 karakter')
      })
    )
    .min(1, 'Minimal ada 1 item untuk update')
    .max(50, 'Maksimal 50 item per batch'),
  
  referenceId: z
    .string()
    .cuid('ID referensi tidak valid')
    .optional(),
  
  referenceType: z
    .enum(['PROCUREMENT', 'PRODUCTION', 'DISTRIBUTION', 'ADJUSTMENT'])
    .optional()
})

export const bulkCreateInventorySchema = z.object({
  items: z
    .array(createInventoryItemSchema)
    .min(1, 'Minimal ada 1 item untuk dibuat')
    .max(20, 'Maksimal 20 item per batch')
})

// ================================ IMPORT/EXPORT SCHEMAS ================================

export const importInventorySchema = z.object({
  fileData: z
    .array(
      z.object({
        itemCode: z.string().min(1, 'Kode item wajib diisi'),
        itemName: z.string().min(1, 'Nama item wajib diisi'),
        category: z.string().min(1, 'Kategori wajib diisi'),
        currentStock: z.union([z.string(), z.number()]).transform((val) => 
          typeof val === 'string' ? parseFloat(val) : val
        ),
        minStock: z.union([z.string(), z.number()]).transform((val) => 
          typeof val === 'string' ? parseFloat(val) : val
        ),
        maxStock: z.union([z.string(), z.number()]).transform((val) => 
          typeof val === 'string' ? parseFloat(val) : val
        ),
        unitPrice: z.union([z.string(), z.number()]).transform((val) => 
          typeof val === 'string' ? parseFloat(val) : val
        ),
        unitCost: z.union([z.string(), z.number()]).transform((val) => 
          typeof val === 'string' ? parseFloat(val) : val
        ),
        unit: z.string().min(1, 'Satuan wajib diisi'),
        description: z.string().optional(),
        storageLocation: z.string().optional()
      })
    )
    .min(1, 'File tidak boleh kosong')
    .max(100, 'Maksimal 100 item per import'),
  
  skipDuplicates: z
    .boolean()
    .optional()
    .default(true),
  
  updateExisting: z
    .boolean()
    .optional()
    .default(false)
})

// ================================ REPORTING SCHEMAS ================================

export const inventoryReportSchema = z.object({
  reportType: z.enum([
    'STOCK_STATUS', 
    'LOW_STOCK', 
    'EXPIRY_ALERT', 
    'MOVEMENT_HISTORY',
    'VALUATION',
    'TURNOVER_ANALYSIS'
  ]),
  
  dateRange: z.object({
    startDate: z.date().max(new Date(), 'Tanggal mulai tidak boleh di masa depan'),
    endDate: z.date().max(new Date(), 'Tanggal akhir tidak boleh di masa depan')
  }).refine((data) => data.startDate <= data.endDate, {
    message: 'Tanggal mulai harus lebih awal atau sama dengan tanggal akhir',
    path: ['endDate']
  }),
  
  filters: inventoryFiltersSchema.optional(),
  
  includeInactive: z
    .boolean()
    .optional()
    .default(false),
  
  format: z
    .enum(['PDF', 'EXCEL', 'CSV'])
    .optional()
    .default('PDF')
})

// ================================ SETTINGS SCHEMAS ================================

export const inventorySettingsSchema = z.object({
  // Automatic reorder settings
  autoReorder: z
    .boolean()
    .optional()
    .default(false),
  
  reorderBuffer: z
    .number()
    .min(0, 'Buffer reorder tidak boleh negatif')
    .max(5, 'Buffer reorder maksimal 5x')
    .optional()
    .default(1.2), // 120% of min stock
  
  // Expiry alert settings
  expiryAlertDays: z
    .array(z.number().min(1).max(365))
    .min(1, 'Minimal ada 1 setting alert')
    .max(5, 'Maksimal 5 setting alert')
    .optional()
    .default([3, 7, 14]), // Alert at 3, 7, and 14 days
  
  // Low stock alert settings
  lowStockAlert: z
    .boolean()
    .optional()
    .default(true),
  
  // Valuation method
  valuationMethod: z
    .enum(['FIFO', 'LIFO', 'AVERAGE'])
    .optional()
    .default('FIFO'),
  
  // Default units for categories
  defaultUnits: z
    .record(
      z.nativeEnum(InventoryCategory),
      z.string().max(10)
    )
    .optional(),
  
  // Storage temperature ranges by category
  temperatureRanges: z
    .record(
      z.nativeEnum(InventoryCategory),
      z.object({
        min: z.number(),
        max: z.number()
      })
    )
    .optional()
})

// ================================ TYPE EXPORTS ================================

// Input types
export type CreateInventoryItemInput = z.infer<typeof createInventoryItemSchema>
export type UpdateInventoryItemInput = z.infer<typeof updateInventoryItemSchema>
export type UpdateStockInput = z.infer<typeof updateStockSchema>
export type StockMovementInput = z.infer<typeof stockMovementSchema>

// Filter types
export type InventoryFiltersInput = z.infer<typeof inventoryFiltersSchema>
export type PaginationInput = z.infer<typeof paginationSchema>

// Bulk operation types
export type BulkUpdateStockInput = z.infer<typeof bulkUpdateStockSchema>
export type BulkCreateInventoryInput = z.infer<typeof bulkCreateInventorySchema>

// Import/Export types
export type ImportInventoryInput = z.infer<typeof importInventorySchema>

// Reporting types
export type InventoryReportInput = z.infer<typeof inventoryReportSchema>

// Settings types
export type InventorySettingsInput = z.infer<typeof inventorySettingsSchema>

// Legacy compatibility
export const inventoryItemSchema = createInventoryItemSchema
export type InventoryItemInput = CreateInventoryItemInput

// ================================ VALIDATION HELPERS ================================

/**
 * Validate Indonesian postal codes for storage locations
 */
export function validateIndonesianPostalCode(code: string): boolean {
  return /^[1-9]\d{4}$/.test(code)
}

/**
 * Validate Indonesian phone numbers for supplier contacts
 */
export function validateIndonesianPhone(phone: string): boolean {
  return /^(\+62|62|0)[2-9]\d{7,11}$/.test(phone)
}

/**
 * Validate Indonesian business tax numbers (NPWP) for suppliers
 */
export function validateNPWP(npwp: string): boolean {
  return /^\d{2}\.\d{3}\.\d{3}\.\d{1}-\d{3}\.\d{3}$/.test(npwp)
}

/**
 * Validate item codes for Indonesian SPPG standards
 */
export function validateSppgItemCode(code: string): boolean {
  // Format: [Category][Year][Sequence]
  // Example: PROT24001 (Protein, 2024, sequence 001)
  return /^[A-Z]{3,4}\d{2}\d{3,4}$/.test(code)
}

/**
 * Get suggested expiry alert days based on item category
 */
export function getExpiryAlertDays(category: InventoryCategory): number[] {
  const categoryAlerts: Record<InventoryCategory, number[]> = {
    PROTEIN: [1, 3, 7], // Meat and protein products need immediate attention
    KARBOHIDRAT: [7, 14, 30], // Carbs generally stable
    SAYURAN: [1, 3], // Fresh vegetables expire quickly
    BUAH: [2, 5], // Fruits vary but generally short shelf life
    SUSU_OLAHAN: [2, 5, 7], // Dairy products need close monitoring
    MINYAK_LEMAK: [30, 60, 90], // Oils last longer
    BUMBU_REMPAH: [30, 90, 180], // Spices and seasonings stable
    LAINNYA: [7, 14, 30] // Default for other categories
  }
  
  return categoryAlerts[category] || [7, 14, 30]
}

/**
 * Get minimum stock calculation based on category and consumption
 */
export function calculateMinimumStock(
  category: InventoryCategory,
  averageDailyConsumption: number,
  leadTimeDays: number = 7
): number {
  // Safety factor varies by category
  const safetyFactors: Record<InventoryCategory, number> = {
    PROTEIN: 2.0, // Higher safety for perishables
    KARBOHIDRAT: 1.2, // Stable, lower safety factor
    SAYURAN: 2.5, // Very perishable, higher safety
    BUAH: 2.0,
    SUSU_OLAHAN: 2.0,
    MINYAK_LEMAK: 1.2,
    BUMBU_REMPAH: 1.1, // Very stable
    LAINNYA: 1.5
  }
  
  const safetyFactor = safetyFactors[category] || 1.5
  return Math.ceil(averageDailyConsumption * leadTimeDays * safetyFactor)
}