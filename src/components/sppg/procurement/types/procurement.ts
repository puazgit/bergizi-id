// Procurement Component Types - Following Pattern 2
// Component-specific types for procurement domain
// src/components/sppg/procurement/types/procurement.ts

import type { InventoryCategory } from '@prisma/client'

// ============= Enums =============

export type PaymentStatus = 'PENDING' | 'PARTIAL' | 'PAID' | 'OVERDUE'
export type DeliveryStatus = 'PENDING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'
export type ProcurementStatus = 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'COMPLETED'

// ============= Core Procurement Types =============

export interface Procurement {
  id: string
  sppgId: string
  planId?: string
  
  // Procurement Details
  procurementCode: string
  procurementDate: Date
  expectedDelivery?: Date
  actualDelivery?: Date
  
  // Supplier Information
  supplierName: string
  supplierContact?: string
  supplierAddress?: string
  supplierEmail?: string
  supplierType?: string
  
  // Purchase Information
  purchaseMethod: string
  paymentTerms?: string
  
  // Financial
  subtotalAmount: number
  taxAmount: number
  discountAmount: number
  shippingCost: number
  totalAmount: number
  paidAmount: number
  paymentStatus: PaymentStatus
  paymentDue?: Date
  
  // Quality & Delivery
  deliveryStatus: DeliveryStatus
  qualityGrade?: string
  qualityNotes?: string
  
  // Documentation
  receiptNumber?: string
  receiptPhoto?: string
  deliveryPhoto?: string
  invoiceNumber?: string
  
  // Status & Workflow
  status: ProcurementStatus
  approvedBy?: string
  approvedAt?: Date
  notes?: string
  
  createdAt: Date
  updatedAt: Date
}

export interface ProcurementItem {
  id: string
  procurementId: string
  inventoryItemId: string
  
  // Quantity & Pricing
  quantity: number
  unit: string
  unitPrice: number
  totalPrice: number
  discountAmount?: number
  
  // Quality Control
  receivedQuantity?: number
  qualityGrade?: string
  expiryDate?: Date
  batchNumber?: string
  
  // Relations
  inventoryItem?: InventoryItem
}

export interface InventoryItem {
  id: string
  sppgId: string
  name: string
  category: InventoryCategory
  unit: string
  unitPrice: number
  stock: number
  minStock?: number
  maxStock?: number
  isActive: boolean
}

export interface ProcurementPlan {
  id: string
  sppgId: string
  planName: string
  planCode: string
  period: string
  startDate: Date
  endDate: Date
  totalBudget: number
  usedBudget: number
  status: 'DRAFT' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED'
  
  createdAt: Date
  updatedAt: Date
}

export interface ProcurementWithDetails extends Procurement {
  items: ProcurementItem[]
  plan?: ProcurementPlan
  sppg?: {
    id: string
    sppgName: string
    sppgCode: string
  }
}

// ============= Input Types =============

export interface CreateProcurementInput {
  planId?: string
  procurementDate: Date
  expectedDelivery?: Date
  
  // Supplier
  supplierName: string
  supplierContact?: string
  supplierAddress?: string
  supplierEmail?: string
  supplierType?: string
  
  // Purchase details
  purchaseMethod: string
  paymentTerms?: string
  
  // Items
  items: {
    inventoryItemId: string
    quantity: number
    unit: string
    unitPrice: number
    discountAmount?: number
  }[]
  
  // Financial
  taxAmount?: number
  discountAmount?: number
  shippingCost?: number
  
  // Additional info
  notes?: string
}

export interface UpdateProcurementInput {
  expectedDelivery?: Date
  actualDelivery?: Date
  
  // Supplier updates
  supplierName?: string
  supplierContact?: string
  supplierAddress?: string
  supplierEmail?: string
  
  // Financial updates
  taxAmount?: number
  discountAmount?: number
  shippingCost?: number
  paymentStatus?: PaymentStatus
  paidAmount?: number
  paymentDue?: Date
  
  // Delivery updates
  deliveryStatus?: DeliveryStatus
  qualityGrade?: string
  qualityNotes?: string
  
  // Documentation
  receiptNumber?: string
  receiptPhoto?: string
  deliveryPhoto?: string
  invoiceNumber?: string
  
  // Status
  status?: ProcurementStatus
  notes?: string
  
  // Items updates
  items?: {
    id?: string
    inventoryItemId: string
    quantity: number
    unit: string
    unitPrice: number
    receivedQuantity?: number
    qualityGrade?: string
    expiryDate?: Date
    batchNumber?: string
  }[]
}

// ============= Filter Types =============

export interface ProcurementFilters {
  planId?: string
  supplierName?: string
  status?: ProcurementStatus
  paymentStatus?: PaymentStatus
  deliveryStatus?: DeliveryStatus
  
  // Date ranges
  startDate?: Date
  endDate?: Date
  deliveryStartDate?: Date
  deliveryEndDate?: Date
  
  // Financial filters
  minAmount?: number
  maxAmount?: number
  
  // Search
  search?: string
  
  // Pagination
  page?: number
  limit?: number
  sortBy?: 'procurementDate' | 'totalAmount' | 'supplierName' | 'status'
  sortOrder?: 'asc' | 'desc'
}

export interface ProcurementListQuery extends ProcurementFilters {
  includeItems?: boolean
  includePlan?: boolean
  includeAnalytics?: boolean
}

// ============= Analytics Types =============

export interface ProcurementAnalytics {
  totalProcurements: number
  totalAmount: number
  avgProcurementValue: number
  
  // Status distribution
  statusDistribution: Record<ProcurementStatus, number>
  paymentStatusDistribution: Record<PaymentStatus, number>
  deliveryStatusDistribution: Record<DeliveryStatus, number>
  
  // Supplier metrics
  topSuppliers: {
    supplierName: string
    totalAmount: number
    procurementCount: number
    avgDeliveryTime: number
  }[]
  
  // Category analysis
  categorySpending: {
    category: InventoryCategory
    totalAmount: number
    percentage: number
  }[]
  
  // Time series data
  monthlySpending: {
    month: string
    amount: number
    count: number
  }[]
}

// ============= Component Props Types =============

export interface ProcurementCardProps {
  procurement: ProcurementWithDetails
  variant?: 'default' | 'compact' | 'detailed'
  showActions?: boolean
  onEdit?: (procurement: ProcurementWithDetails) => void
  onDelete?: (procurementId: string) => void
  onView?: (procurement: ProcurementWithDetails) => void
  onReceive?: (procurement: ProcurementWithDetails) => void
}

export interface ProcurementListProps {
  procurements: ProcurementWithDetails[]
  loading?: boolean
  filters?: ProcurementFilters
  onFiltersChange?: (filters: ProcurementFilters) => void
  onProcurementSelect?: (procurement: ProcurementWithDetails) => void
  selectable?: boolean
  selectedProcurements?: string[]
  onSelectionChange?: (selectedIds: string[]) => void
}

export interface ProcurementFormProps {
  initialData?: ProcurementWithDetails
  mode: 'create' | 'edit' | 'receive'
  onSubmit: (data: CreateProcurementInput | UpdateProcurementInput) => void
  onCancel?: () => void
  loading?: boolean
  availableItems?: InventoryItem[]
  plans?: ProcurementPlan[]
}

export interface ProcurementFiltersProps {
  filters: ProcurementFilters
  onFiltersChange: (filters: ProcurementFilters) => void
  onReset?: () => void
  plans?: ProcurementPlan[]
  suppliers?: string[]
}

// ============= State Types =============

export interface ProcurementFormState {
  data: Partial<CreateProcurementInput>
  errors: Record<string, string>
  isDirty: boolean
  isValid: boolean
  calculatedTotals: {
    subtotal: number
    tax: number
    discount: number
    shipping: number
    total: number
  }
}

export interface ProcurementListState {
  procurements: ProcurementWithDetails[]
  loading: boolean
  error: string | null
  filters: ProcurementFilters
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  selectedProcurements: string[]
  analytics?: ProcurementAnalytics
}

// ============= Event Types =============

export interface ProcurementFormEvents {
  onFieldChange: (field: string, value: unknown) => void
  onItemAdd: (item: Omit<ProcurementItem, 'id' | 'procurementId'>) => void
  onItemRemove: (itemIndex: number) => void
  onItemUpdate: (itemIndex: number, updates: Partial<ProcurementItem>) => void
  onSupplierSelect: (supplier: { name: string; contact?: string; address?: string }) => void
  onCalculateTotals: () => void
}

export interface ProcurementListEvents {
  onProcurementClick: (procurement: ProcurementWithDetails) => void
  onProcurementEdit: (procurement: ProcurementWithDetails) => void
  onProcurementDelete: (procurementId: string) => void
  onProcurementReceive: (procurement: ProcurementWithDetails) => void
  onStatusUpdate: (procurementId: string, status: ProcurementStatus) => void
  onBulkAction: (action: string, procurementIds: string[]) => void
}

// ============= Utility Types =============

export interface SupplierSuggestion {
  name: string
  contact?: string
  address?: string
  email?: string
  type?: string
  reliability?: number
  avgDeliveryTime?: number
  totalProcurements?: number
}

export interface ItemSuggestion {
  inventoryItem: InventoryItem
  suggestedQuantity?: number
  lastUnitPrice?: number
  avgConsumption?: number
  stockStatus?: 'low' | 'normal' | 'high'
}

export interface ProcurementValidation {
  isValid: boolean
  errors: string[]
  warnings: string[]
  budgetCheck?: {
    available: number
    required: number
    exceeded: boolean
  }
}

export { type InventoryCategory }