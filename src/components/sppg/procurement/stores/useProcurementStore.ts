// Procurement Store - Pattern 2 Implementation
// Self-contained Procurement domain state management
// src/components/sppg/procurement/stores/useProcurementStore.ts

import { create } from 'zustand'
import { devtools, persist, createJSONStorage } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import type { 
  ProcurementWithDetails, 
  ProcurementFilters, 
  CreateProcurementInput 
} from '../types'

// Procurement State Interface
export interface ProcurementState {
  // Core procurement data
  procurements: ProcurementWithDetails[]
  selectedProcurement: ProcurementWithDetails | null
  
  // UI state
  loading: boolean
  error: string | null
  syncStatus: 'idle' | 'syncing' | 'synced' | 'error'
  
  // Advanced filtering & search
  filters: ProcurementFilters & {
    globalSearch: string
    statusFilter: string[]
    supplierFilter: string[]
    dateRange: {
      startDate?: Date
      endDate?: Date
    }
    budgetRange: {
      minBudget?: number
      maxBudget?: number
    }
    priorityFilter: string[]
  }
  
  // Pagination
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
  
  // Selection & bulk operations
  selection: {
    selectedIds: string[]
    isAllSelected: boolean
    bulkOperation: 'approve' | 'reject' | 'delete' | null
  }
  
  // Offline capabilities
  offline: {
    isOnline: boolean
    queue: Array<{
      id: string
      action: 'create' | 'update' | 'delete'
      data: unknown
      timestamp: Date
    }>
    lastSync: Date | null
  }
  
  // Form state
  form: {
    isOpen: boolean
    mode: 'create' | 'edit'
    data: Partial<CreateProcurementInput>
    isDirty: boolean
    errors: Record<string, string>
  }
  
  // User preferences
  preferences: {
    defaultView: 'table' | 'card' | 'timeline'
    itemsPerPage: 10 | 25 | 50 | 100
    defaultSort: keyof ProcurementWithDetails
    autoRefresh: boolean
    showPreview: boolean
  }
}

// Procurement Actions Interface
export interface ProcurementActions {
  // Basic CRUD actions
  setProcurements: (procurements: ProcurementWithDetails[]) => void
  addProcurement: (procurement: ProcurementWithDetails) => void
  updateProcurement: (id: string, updates: Partial<ProcurementWithDetails>) => void
  removeProcurement: (id: string) => void
  setSelectedProcurement: (procurement: ProcurementWithDetails | null) => void
  
  // UI state actions
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setSyncStatus: (status: ProcurementState['syncStatus']) => void
  
  // Filter actions
  setFilters: (filters: Partial<ProcurementState['filters']>) => void
  setGlobalSearch: (search: string) => void
  setStatusFilter: (statuses: string[]) => void
  setSupplierFilter: (suppliers: string[]) => void
  setDateRange: (range: Partial<ProcurementState['filters']['dateRange']>) => void
  setBudgetRange: (range: Partial<ProcurementState['filters']['budgetRange']>) => void
  clearFilters: () => void
  
  // Pagination actions
  setPagination: (pagination: Partial<ProcurementState['pagination']>) => void
  setPage: (page: number) => void
  setLimit: (limit: number) => void
  nextPage: () => void
  prevPage: () => void
  
  // Selection actions
  toggleSelectItem: (id: string) => void
  selectAll: () => void
  clearSelection: () => void
  setBulkOperation: (operation: ProcurementState['selection']['bulkOperation']) => void
  
  // Offline actions
  setOnlineStatus: (isOnline: boolean) => void
  addToOfflineQueue: (action: 'create' | 'update' | 'delete', data: unknown) => void
  processOfflineQueue: () => void
  clearOfflineQueue: () => void
  
  // Form actions
  openForm: (mode: 'create' | 'edit', data?: Partial<CreateProcurementInput>) => void
  closeForm: () => void
  updateFormField: (field: string, value: unknown) => void
  setFormErrors: (errors: Record<string, string>) => void
  clearFormErrors: () => void
  resetForm: () => void
  
  // Preferences actions
  setPreferences: (preferences: Partial<ProcurementState['preferences']>) => void
  setDefaultView: (view: ProcurementState['preferences']['defaultView']) => void
  setItemsPerPage: (items: ProcurementState['preferences']['itemsPerPage']) => void
  
  // Sorting actions
  setSorting: (field: string, direction: 'asc' | 'desc') => void
  
  // Business logic actions
  approveProcurement: (id: string) => void
  rejectProcurement: (id: string, reason: string) => void
  bulkApproveProcurements: (ids: string[]) => void
  bulkRejectProcurements: (ids: string[], reason: string) => void
  
  // Analytics actions
  calculateTotalBudget: (ids?: string[]) => number
  getProcurementsBySupplier: (supplierId: string) => ProcurementWithDetails[]
  getProcurementsByStatus: (status: string) => ProcurementWithDetails[]
  
  // Reset actions
  reset: () => void
  resetToDefaults: () => void
}

// Combined Procurement Store Type
export type ProcurementStore = ProcurementState & ProcurementActions

const initialProcurementState: ProcurementState = {
  procurements: [],
  selectedProcurement: null,
  loading: false,
  error: null,
  syncStatus: 'idle',
  
  filters: {
    page: 1,
    limit: 25,
    sortBy: 'procurementDate',
    sortOrder: 'desc',
    globalSearch: '',
    statusFilter: [],
    supplierFilter: [],
    dateRange: {},
    budgetRange: {},
    priorityFilter: [],
  },
  
  pagination: {
    page: 1,
    limit: 25,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  },
  
  selection: {
    selectedIds: [],
    isAllSelected: false,
    bulkOperation: null,
  },
  
  offline: {
    isOnline: true,
    queue: [],
    lastSync: null,
  },
  
  form: {
    isOpen: false,
    mode: 'create',
    data: {},
    isDirty: false,
    errors: {},
  },
  
  preferences: {
    defaultView: 'table',
    itemsPerPage: 25,
    defaultSort: 'createdAt',
    autoRefresh: false,
    showPreview: true,
  },
}

// Procurement Store with advanced middleware
export const useProcurementStore: any = create<ProcurementStore>()(
  devtools(
    persist(
      immer<ProcurementStore>((set) => ({
        ...initialProcurementState,
        
        // Basic CRUD actions
        setProcurements: (procurements) =>
          set((state) => {
            state.procurements = procurements
          }),

        addProcurement: (procurement) =>
          set((state) => {
            state.procurements.unshift(procurement)
            state.pagination.total += 1
          }),

        updateProcurement: (id, updates) =>
          set((state) => {
            const index = state.procurements.findIndex(p => p.id === id)
            if (index !== -1) {
              state.procurements[index] = { ...state.procurements[index], ...updates }
            }
          }),

        removeProcurement: (id) =>
          set((state) => {
            state.procurements = state.procurements.filter(p => p.id !== id)
            state.pagination.total -= 1
            state.selection.selectedIds = state.selection.selectedIds.filter(selectedId => selectedId !== id)
          }),

        setSelectedProcurement: (procurement) =>
          set((state) => {
            state.selectedProcurement = procurement
          }),

        // UI state actions
        setLoading: (loading) =>
          set((state) => {
            state.loading = loading
          }),

        setError: (error) =>
          set((state) => {
            state.error = error
          }),

        setSyncStatus: (syncStatus) =>
          set((state) => {
            state.syncStatus = syncStatus
            if (syncStatus === 'synced') {
              state.offline.lastSync = new Date()
            }
          }),

        // Filter actions
        setFilters: (filters) =>
          set((state) => {
            state.filters = { ...state.filters, ...filters }
          }),

        setGlobalSearch: (search) =>
          set((state) => {
            state.filters.globalSearch = search
            state.filters.page = 1
          }),

        setStatusFilter: (statuses) =>
          set((state) => {
            state.filters.statusFilter = statuses
            state.filters.page = 1
          }),

        setSupplierFilter: (suppliers) =>
          set((state) => {
            state.filters.supplierFilter = suppliers
            state.filters.page = 1
          }),

        setDateRange: (range) =>
          set((state) => {
            state.filters.dateRange = { ...state.filters.dateRange, ...range }
            state.filters.page = 1
          }),

        setBudgetRange: (range) =>
          set((state) => {
            state.filters.budgetRange = { ...state.filters.budgetRange, ...range }
            state.filters.page = 1
          }),

        clearFilters: () =>
          set((state) => {
            state.filters = {
              ...initialProcurementState.filters,
              page: 1,
              limit: state.filters.limit,
            }
          }),

        // Pagination actions
        setPagination: (pagination) =>
          set((state) => {
            state.pagination = { ...state.pagination, ...pagination }
          }),

        setPage: (page) =>
          set((state) => {
            state.pagination.page = page
            state.filters.page = page
          }),

        setLimit: (limit) =>
          set((state) => {
            state.pagination.limit = limit
            state.filters.limit = limit
            state.preferences.itemsPerPage = limit as ProcurementState['preferences']['itemsPerPage']
            // Recalculate page if needed
            const maxPage = Math.ceil(state.pagination.total / limit)
            if (state.pagination.page > maxPage && maxPage > 0) {
              state.pagination.page = maxPage
              state.filters.page = maxPage
            }
          }),

        nextPage: () =>
          set((state) => {
            if (state.pagination.hasNext) {
              state.pagination.page += 1
              state.filters.page = state.pagination.page
            }
          }),

        prevPage: () =>
          set((state) => {
            if (state.pagination.hasPrev) {
              state.pagination.page -= 1
              state.filters.page = state.pagination.page
            }
          }),

        // Selection actions
        toggleSelectItem: (id) =>
          set((state) => {
            const isSelected = state.selection.selectedIds.includes(id)
            if (isSelected) {
              state.selection.selectedIds = state.selection.selectedIds.filter(selectedId => selectedId !== id)
            } else {
              state.selection.selectedIds.push(id)
            }
            state.selection.isAllSelected = state.selection.selectedIds.length === state.procurements.length
          }),

        selectAll: () =>
          set((state) => {
            if (state.selection.isAllSelected) {
              state.selection.selectedIds = []
              state.selection.isAllSelected = false
            } else {
              state.selection.selectedIds = state.procurements.map(p => p.id)
              state.selection.isAllSelected = true
            }
          }),

        clearSelection: () =>
          set((state) => {
            state.selection.selectedIds = []
            state.selection.isAllSelected = false
            state.selection.bulkOperation = null
          }),

        setBulkOperation: (operation) =>
          set((state) => {
            state.selection.bulkOperation = operation
          }),

        // Offline actions
        setOnlineStatus: (isOnline) =>
          set((state) => {
            state.offline.isOnline = isOnline
          }),

        addToOfflineQueue: (action, data) =>
          set((state) => {
            state.offline.queue.push({
              id: crypto.randomUUID(),
              action,
              data,
              timestamp: new Date(),
            })
          }),

        processOfflineQueue: () =>
          set((state) => {
            // Process queue logic would go here
            state.offline.queue = []
            state.offline.lastSync = new Date()
          }),

        clearOfflineQueue: () =>
          set((state) => {
            state.offline.queue = []
          }),

        // Form actions
        openForm: (mode, data = {}) =>
          set((state) => {
            state.form.isOpen = true
            state.form.mode = mode
            state.form.data = data
            state.form.isDirty = false
            state.form.errors = {}
          }),

        closeForm: () =>
          set((state) => {
            state.form.isOpen = false
            state.form.mode = 'create'
            state.form.data = {}
            state.form.isDirty = false
            state.form.errors = {}
          }),

        updateFormField: (field, value) =>
          set((state) => {
            ;(state.form.data as Record<string, unknown>)[field] = value
            state.form.isDirty = true
          }),

        setFormErrors: (errors) =>
          set((state) => {
            state.form.errors = errors
          }),

        clearFormErrors: () =>
          set((state) => {
            state.form.errors = {}
          }),

        resetForm: () =>
          set((state) => {
            state.form = {
              ...initialProcurementState.form,
              isOpen: state.form.isOpen,
              mode: state.form.mode,
            }
          }),

        // Preferences actions
        setPreferences: (preferences) =>
          set((state) => {
            state.preferences = { ...state.preferences, ...preferences }
          }),

        setDefaultView: (view) =>
          set((state) => {
            state.preferences.defaultView = view
          }),

        setItemsPerPage: (items) =>
          set((state) => {
            state.preferences.itemsPerPage = items
            state.pagination.limit = items
            state.filters.limit = items
          }),

        // Sorting actions
        setSorting: (field, direction) =>
          set((state) => {
            state.filters.sortBy = field as ProcurementFilters['sortBy']
            state.filters.sortOrder = direction
          }),

        // Business logic actions
        approveProcurement: (id) =>
          set((state) => {
            const procurement = state.procurements.find(p => p.id === id)
            if (procurement) {
              procurement.status = 'APPROVED'
              procurement.approvedAt = new Date()
            }
          }),

        rejectProcurement: (id, reason) =>
          set((state) => {
            const procurement = state.procurements.find(p => p.id === id)
            if (procurement) {
              procurement.status = 'REJECTED'
              // rejection reason would be stored in notes or separate field
            }
          }),

        bulkApproveProcurements: (ids) =>
          set((state) => {
            ids.forEach(id => {
              const procurement = state.procurements.find(p => p.id === id)
              if (procurement) {
                procurement.status = 'APPROVED'
                procurement.approvedAt = new Date()
              }
            })
            state.selection.selectedIds = []
            state.selection.isAllSelected = false
            state.selection.bulkOperation = null
          }),

        bulkRejectProcurements: (ids, reason) =>
          set((state) => {
            ids.forEach(id => {
              const procurement = state.procurements.find(p => p.id === id)
              if (procurement) {
                procurement.status = 'REJECTED'
                // procurement.rejectionReason = reason // Field not in schema
              }
            })
            state.selection.selectedIds = []
            state.selection.isAllSelected = false
            state.selection.bulkOperation = null
          }),

        // Analytics actions
        calculateTotalBudget: (ids): number => {
          const state = useProcurementStore.getState()
          const targetProcurements: any = ids
            ? state.procurements.filter((p: any) => ids.includes(p.id))
            : state.procurements
          return targetProcurements.reduce((total: number, p: any) => total + (p.totalBudget || 0), 0)
        },

        getProcurementsBySupplier: (supplierId) => {
          const state = useProcurementStore.getState()
          return state.procurements.filter((p: any) => p.supplierId === supplierId)
        },

        getProcurementsByStatus: (status) => {
          const state = useProcurementStore.getState()
          return state.procurements.filter((p: any) => p.status === status)
        },

        // Reset actions
        reset: () => set(initialProcurementState),

        resetToDefaults: () =>
          set((state) => {
            state.filters = initialProcurementState.filters
            state.pagination = initialProcurementState.pagination
            state.selection = initialProcurementState.selection
            state.preferences = initialProcurementState.preferences
          }),
      })),
      {
        name: 'bergizi-procurement-store',
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({
          preferences: state.preferences,
          filters: {
            sortBy: state.filters.sortBy,
            sortOrder: state.filters.sortOrder,
            limit: state.filters.limit,
          }
        }),
      }
    ),
    {
      name: 'ProcurementStore',
    }
  )
)

// Export store for usage in components
export default useProcurementStore