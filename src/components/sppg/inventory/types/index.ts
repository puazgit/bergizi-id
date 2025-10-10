// Inventory Types - Export barrel
// src/components/sppg/inventory/types/index.ts

export interface InventoryItem {
  id: string
  sppgId: string
  itemName: string
  itemCode?: string | null
  brand?: string | null
  category: string
  unit: string
  currentStock: number
  minStock: number
  maxStock: number
  reorderQuantity?: number | null
  lastPrice?: number | null
  averagePrice?: number | null
  preferredSupplier?: string | null
  supplierContact?: string | null
  leadTime?: number | null
  storageLocation: string
  storageCondition?: string | null
  hasExpiry: boolean
  shelfLife?: number | null
  calories?: number | null
  protein?: number | null
  carbohydrates?: number | null
  fat?: number | null
  fiber?: number | null
  isActive: boolean
}

export interface InventoryItemWithDetails extends InventoryItem {
  supplier?: {
    id: string
    name: string
  }
  location?: string
  expiryDate?: Date
  batchNumber?: string
  stockMovements?: {
    id: string
    referenceNumber: string | null
    approvedBy: string | null
    notes: string | null
    unit: string
    approvedAt: Date | null
    batchNumber: string | null
    movedAt: Date
  }[]
}

export interface InventoryFilters {
  page?: number
  limit?: number
  search?: string
  category?: string
  lowStock?: boolean
  sortBy?: keyof InventoryItem
  sortOrder?: 'asc' | 'desc'
  globalSearch?: string
  categoryFilter?: string[]
  statusFilter?: string[]
  supplierFilter?: string[]
  stockLevelFilter?: 'all' | 'high' | 'normal' | 'low'
  expiryDateRange?: {
    start?: Date
    end?: Date
  }
}

export interface CreateInventoryItemInput {
  name: string
  category: string
  unit: string
  unitPrice: number
  minStock?: number
  maxStock?: number
}

export interface UpdateInventoryItemInput {
  id: string
  name?: string
  category?: string
  unit?: string
  unitPrice?: number
  minStock?: number
  maxStock?: number
}

export interface StockMovementInput {
  inventoryItemId: string
  type: 'IN' | 'OUT' | 'ADJUSTMENT' | 'DAMAGED' | 'TRANSFER' | 'EXPIRED'
  quantity: number
  reason: string
  notes?: string
  referenceId?: string
  referenceType?: string
}

export interface InventoryFiltersInput {
  search?: string
  category?: string
  lowStock?: boolean
  sortBy?: keyof InventoryItem
  sortOrder?: 'asc' | 'desc'
  page?: number
  limit?: number
}

export interface InventoryStats {
  totalItems: number
  lowStockItems: number
  outOfStockItems: number
  activeItems: number
  inactiveItems: number
  totalStockValue: number
  stockHealthScore: number
}

export interface PaginatedInventoryResult {
  items: InventoryItemWithDetails[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}