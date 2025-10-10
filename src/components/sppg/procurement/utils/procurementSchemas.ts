// Procurement Validation Schemas - Pattern 2 Compliant
// Consolidated schemas from domain validators to component utils  
// src/components/sppg/procurement/utils/procurementSchemas.ts

import { z } from 'zod'
import { 
  InventoryCategory,
  // DeliveryStatus,
  // PaymentStatus,
  // ProcurementStatus,
  // SupplierType 
} from '@prisma/client'

// Temporary types for missing enums
type DeliveryStatus = string
type PaymentStatus = string  
type ProcurementStatus = string
type SupplierType = string

// ================================ SUPPLIER SCHEMAS ================================

export const supplierSchema = z.object({
  supplierName: z.string().min(2, 'Nama supplier minimal 2 karakter'),
  supplierContact: z.string().optional(),
  supplierAddress: z.string().optional(),
  supplierEmail: z.string().email('Format email tidak valid').optional().or(z.literal('')),
  supplierType: z.string().optional()
})

// ================================ PROCUREMENT ITEM SCHEMAS ================================

export const procurementItemSchema = z.object({
  inventoryItemId: z.string().cuid().optional(),
  itemName: z.string().min(1, 'Nama item wajib diisi'),
  itemCode: z.string().optional(),
  category: z.nativeEnum(InventoryCategory, {
    message: 'Kategori item tidak valid'
  }),
  brand: z.string().optional(),
  
  // Quantity & Units
  orderedQuantity: z.number().positive('Kuantitas harus lebih dari 0'),
  unit: z.string().min(1, 'Satuan wajib diisi'),
  
  // Pricing
  unitPrice: z.number().min(0, 'Harga satuan tidak boleh negatif'),
  
  // Notes
  notes: z.string().optional()
})

export const bulkProcurementItemsSchema = z.array(procurementItemSchema)
  .min(1, 'Minimal 1 item diperlukan')
  .max(100, 'Maksimal 100 item per pengadaan')

// ================================ PROCUREMENT SCHEMAS ================================

export const createProcurementSchema = z.object({
  // Optional plan reference
  planId: z.string().cuid().optional(),
  
  // Procurement details
  procurementDate: z.coerce.date({
    message: 'Tanggal pengadaan harus valid'
  }),
  expectedDeliveryDate: z.coerce.date({
    message: 'Tanggal pengiriman harus valid'
  }).optional(),
  
  // Supplier information - can be embedded or referenced
  supplierName: z.string().min(2, 'Nama supplier minimal 2 karakter'),
  supplierContact: z.string().optional(),
  supplierAddress: z.string().optional(),
  supplierEmail: z.string().email('Format email tidak valid').optional().or(z.literal('')),
  supplierType: z.string().optional(),
  
  // Items
  items: bulkProcurementItemsSchema.optional(),
  
  // Notes
  notes: z.string().max(1000, 'Catatan maksimal 1000 karakter').optional()
})

export const updateProcurementSchema = createProcurementSchema.partial().extend({
  // Status updates
  deliveryStatus: z.string().optional(),
  paymentStatus: z.string().optional(),
  status: z.string().optional(),
  
  // Actual delivery date
  actualDeliveryDate: z.coerce.date().optional(),
  
  // Payment tracking
  paidAmount: z.number().min(0, 'Jumlah bayar tidak boleh negatif').optional()
})

// ================================ PROCUREMENT PLAN SCHEMAS ================================

export const createProcurementPlanSchema = z.object({
  planName: z.string()
    .min(3, 'Nama rencana minimal 3 karakter')
    .max(100, 'Nama rencana maksimal 100 karakter'),
  
  description: z.string()
    .max(500, 'Deskripsi maksimal 500 karakter')
    .optional(),
  
  planDate: z.coerce.date({
    message: 'Tanggal rencana harus valid'
  }),
  
  targetMonth: z.coerce.date({
    message: 'Target bulan harus valid'
  }),
  
  totalBudget: z.number()
    .min(1000, 'Budget minimal Rp 1,000')
    .max(10000000000, 'Budget maksimal Rp 10 miliar')
})

export const updateProcurementPlanSchema = createProcurementPlanSchema.partial().extend({
  status: z.enum(['DRAFT', 'APPROVED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).optional(),
  usedBudget: z.number().min(0, 'Budget terpakai tidak boleh negatif').optional()
})

// ================================ FILTER SCHEMAS ================================

export const procurementFiltersSchema = z.object({
  deliveryStatus: z.string().optional(),
  paymentStatus: z.string().optional(),
  status: z.string().optional(),
  supplierName: z.string().max(100).optional(),
  supplierType: z.string().optional(),
  search: z.string().max(100).optional()
})

export const paginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(10),
  sortBy: z.string().default('procurementDate'),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
})

// ================================ TYPE EXPORTS ================================

export type CreateProcurementInput = z.infer<typeof createProcurementSchema>
export type UpdateProcurementInput = z.infer<typeof updateProcurementSchema>
export type CreateProcurementPlanInput = z.infer<typeof createProcurementPlanSchema>
export type UpdateProcurementPlanInput = z.infer<typeof updateProcurementPlanSchema>
export type ProcurementItemInput = z.infer<typeof procurementItemSchema>
export type BulkProcurementItemsInput = z.infer<typeof bulkProcurementItemsSchema>
export type ProcurementFilters = z.infer<typeof procurementFiltersSchema>
export type PaginationParams = z.infer<typeof paginationSchema>