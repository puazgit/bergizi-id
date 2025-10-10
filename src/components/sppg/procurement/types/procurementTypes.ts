/**
 * Procurement Domain Types - Pattern 2 Architecture
 * Bergizi-ID SaaS Platform - SPPG Procurement Management
 */

import type { 
  Procurement, 
  ProcurementItem,
  InventoryItem,
  User
} from '@prisma/client'

// ============= Base Types =============

export interface ProcurementWithDetails extends Procurement {
  items: Array<ProcurementItem & {
    inventoryItem: InventoryItem
  }>
  createdBy?: Pick<User, 'id' | 'name' | 'email'>
  approvedBy?: Pick<User, 'id' | 'name' | 'email'>
}

// ============= Input Types =============

export interface CreateProcurementInput {
  procurementCode: string
  requestDate: Date
  expectedDeliveryDate: Date
  notes?: string
  items: Array<{
    inventoryItemId: string
    quantity: number
    unitCost: number
  }>
}

export interface UpdateProcurementInput {
  requestDate?: Date
  expectedDeliveryDate?: Date
  notes?: string
  items?: Array<{
    id?: string
    inventoryItemId: string
    quantity: number
    unitCost: number
  }>
}

// ============= Component Props Types =============

export interface ProcurementListProps {
  procurements: ProcurementWithDetails[]
  isLoading?: boolean
  onEdit?: (procurement: ProcurementWithDetails) => void
  onDelete?: (procurementId: string) => void
  onApprove?: (procurementId: string) => void
}

export interface ProcurementCardProps {
  procurement: ProcurementWithDetails
  onEdit?: (procurement: ProcurementWithDetails) => void
  onDelete?: (procurementId: string) => void
  onApprove?: (procurementId: string) => void
  showActions?: boolean
  variant?: 'default' | 'compact' | 'detailed'
}

export interface ProcurementFormProps {
  procurement?: ProcurementWithDetails
  onSubmit: (data: CreateProcurementInput | UpdateProcurementInput) => void
  onCancel?: () => void
  isLoading?: boolean
}

// ============= Filter & Search Types =============

export interface ProcurementFilters {
  status?: string[]
  dateRange?: {
    startDate?: Date
    endDate?: Date
  }
  amountRange?: {
    min?: number
    max?: number
  }
  search?: string
}

// ============= Stats Types =============

export interface ProcurementStats {
  totalProcurements: number
  totalAmount: number
  pendingApprovals: number
  averageOrderValue: number
  topSuppliers: Array<{
    supplierId: string
    supplierName: string
    totalOrders: number
    totalAmount: number
  }>
}