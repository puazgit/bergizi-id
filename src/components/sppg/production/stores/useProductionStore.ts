// Production Store - Pattern 2 Component-Level Implementation
// Zustand store for production state management with Redis integration
// src/components/sppg/production/stores/useProductionStore.ts

import { create } from 'zustand'
import { devtools, persist, createJSONStorage } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import type { 
  ProductionWithDetails, 
  ProductionStats,
  ProductionFilters,
  ProductionRealTimeUpdate
} from '../types'
import { ProductionCache } from '../utils'

// ============= Production Store State =============

export interface ProductionState {
  // Core production data
  productions: ProductionWithDetails[]
  selectedProduction: ProductionWithDetails | null
  stats: ProductionStats | null
  
  // UI state
  loading: boolean
  creating: boolean
  updating: boolean
  error: string | null
  
  // Filters & Search
  filters: ProductionFilters
  searchTerm: string
  
  // Pagination
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
  
  // Real-time updates
  realTimeConnected: boolean
  realTimeUpdates: ProductionRealTimeUpdate[]
  
  // Cache management
  cacheKey: string | null
  lastSyncTime: Date | null
}

// ============= Production Store Actions =============

export interface ProductionActions {
  // Data actions
  setProductions: (productions: ProductionWithDetails[]) => void
  addProduction: (production: ProductionWithDetails) => void
  updateProduction: (id: string, updates: Partial<ProductionWithDetails>) => void
  removeProduction: (id: string) => void
  setSelectedProduction: (production: ProductionWithDetails | null) => void
  
  // Stats actions
  setStats: (stats: ProductionStats) => void
  updateStats: (updates: Partial<ProductionStats>) => void
  
  // UI actions
  setLoading: (loading: boolean) => void
  setCreating: (creating: boolean) => void
  setUpdating: (updating: boolean) => void
  setError: (error: string | null) => void
  clearError: () => void
  
  // Filter actions
  setFilters: (filters: ProductionFilters) => void
  updateFilters: (updates: Partial<ProductionFilters>) => void
  clearFilters: () => void
  setSearchTerm: (term: string) => void
  
  // Pagination actions
  setPagination: (pagination: Partial<ProductionState['pagination']>) => void
  setPage: (page: number) => void
  setPageSize: (pageSize: number) => void
  
  // Real-time actions
  setRealTimeConnected: (connected: boolean) => void
  addRealTimeUpdate: (update: ProductionRealTimeUpdate) => void
  clearRealTimeUpdates: () => void
  
  // Cache actions
  invalidateCache: (sppgId: string) => Promise<void>
  setCacheKey: (key: string) => void
  updateLastSyncTime: () => void
  
  // Bulk actions
  reset: () => void
}

// ============= Production Store Implementation =============

export type ProductionStore = ProductionState & ProductionActions

const initialState: ProductionState = {
  // Core data
  productions: [],
  selectedProduction: null,
  stats: null,
  
  // UI state
  loading: false,
  creating: false,
  updating: false,
  error: null,
  
  // Filters & Search
  filters: {},
  searchTerm: '',
  
  // Pagination
  pagination: {
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0
  },
  
  // Real-time
  realTimeConnected: false,
  realTimeUpdates: [],
  
  // Cache
  cacheKey: null,
  lastSyncTime: null
}

export const useProductionStore = create<ProductionStore>()(
  devtools(
    persist(
      immer((set) => ({
        ...initialState,
        
        // ============= Data Actions =============
        
        setProductions: (productions) => {
          set((state) => {
            state.productions = productions
            state.error = null
            state.lastSyncTime = new Date()
          })
        },
        
        addProduction: (production) => {
          set((state) => {
            state.productions.unshift(production)
            if (state.stats) {
              state.stats.total += 1
            }
          })
        },
        
        updateProduction: (id, updates) => {
          set((state) => {
            const index = state.productions.findIndex(p => p.id === id)
            if (index !== -1) {
              state.productions[index] = { ...state.productions[index], ...updates }
            }
            
            if (state.selectedProduction?.id === id) {
              state.selectedProduction = { ...state.selectedProduction, ...updates }
            }
          })
        },
        
        removeProduction: (id) => {
          set((state) => {
            state.productions = state.productions.filter(p => p.id !== id)
            if (state.selectedProduction?.id === id) {
              state.selectedProduction = null
            }
            if (state.stats) {
              state.stats.total = Math.max(0, state.stats.total - 1)
            }
          })
        },
        
        setSelectedProduction: (production) => {
          set((state) => {
            state.selectedProduction = production
          })
        },
        
        // ============= Stats Actions =============
        
        setStats: (stats) => {
          set((state) => {
            state.stats = stats
          })
        },
        
        updateStats: (updates) => {
          set((state) => {
            if (state.stats) {
              state.stats = { ...state.stats, ...updates }
            }
          })
        },
        
        // ============= UI Actions =============
        
        setLoading: (loading) => {
          set((state) => {
            state.loading = loading
          })
        },
        
        setCreating: (creating) => {
          set((state) => {
            state.creating = creating
          })
        },
        
        setUpdating: (updating) => {
          set((state) => {
            state.updating = updating
          })
        },
        
        setError: (error) => {
          set((state) => {
            state.error = error
          })
        },
        
        clearError: () => {
          set((state) => {
            state.error = null
          })
        },
        
        // ============= Filter Actions =============
        
        setFilters: (filters) => {
          set((state) => {
            state.filters = filters
            state.pagination.page = 1 // Reset to first page
          })
        },
        
        updateFilters: (updates) => {
          set((state) => {
            state.filters = { ...state.filters, ...updates }
            state.pagination.page = 1 // Reset to first page
          })
        },
        
        clearFilters: () => {
          set((state) => {
            state.filters = {}
            state.searchTerm = ''
            state.pagination.page = 1
          })
        },
        
        setSearchTerm: (term) => {
          set((state) => {
            state.searchTerm = term
            state.pagination.page = 1 // Reset to first page
          })
        },
        
        // ============= Pagination Actions =============
        
        setPagination: (pagination) => {
          set((state) => {
            state.pagination = { ...state.pagination, ...pagination }
          })
        },
        
        setPage: (page) => {
          set((state) => {
            state.pagination.page = page
          })
        },
        
        setPageSize: (pageSize) => {
          set((state) => {
            state.pagination.pageSize = pageSize
            state.pagination.page = 1 // Reset to first page
          })
        },
        
        // ============= Real-time Actions =============
        
        setRealTimeConnected: (connected) => {
          set((state) => {
            state.realTimeConnected = connected
          })
        },
        
        addRealTimeUpdate: (update) => {
          set((state) => {
            state.realTimeUpdates.unshift(update)
            // Keep only last 50 updates
            if (state.realTimeUpdates.length > 50) {
              state.realTimeUpdates = state.realTimeUpdates.slice(0, 50)
            }
          })
        },
        
        clearRealTimeUpdates: () => {
          set((state) => {
            state.realTimeUpdates = []
          })
        },
        
        // ============= Cache Actions =============
        
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        invalidateCache: async (_sppgId: string) => {
          try {
            // TODO: Clear cache keys when ProductionCache has delete method
            set((state) => {
              state.cacheKey = null
              state.lastSyncTime = null
            })
          } catch (error) {
            console.error('Failed to invalidate cache:', error)
          }
        },
        
        setCacheKey: (key) => {
          set((state) => {
            state.cacheKey = key
          })
        },
        
        updateLastSyncTime: () => {
          set((state) => {
            state.lastSyncTime = new Date()
          })
        },
        
        // ============= Bulk Actions =============
        
        reset: () => {
          set(() => ({ ...initialState }))
        }
      })),
      {
        name: 'production-store',
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({
          // Only persist non-sensitive data
          filters: state.filters,
          searchTerm: state.searchTerm,
          pagination: state.pagination
        })
      }
    ),
    {
      name: 'ProductionStore'
    }
  )
)

// ============= Actions Hook =============

export const useProductionActions = () => {
  const store = useProductionStore()
  
  return {
    // Data actions
    setProductions: store.setProductions,
    addProduction: store.addProduction,
    updateProduction: store.updateProduction,
    removeProduction: store.removeProduction,
    setSelectedProduction: store.setSelectedProduction,
    
    // Stats actions
    setStats: store.setStats,
    updateStats: store.updateStats,
    
    // UI actions
    setLoading: store.setLoading,
    setCreating: store.setCreating,
    setUpdating: store.setUpdating,
    setError: store.setError,
    clearError: store.clearError,
    
    // Filter actions
    setFilters: store.setFilters,
    updateFilters: store.updateFilters,
    clearFilters: store.clearFilters,
    setSearchTerm: store.setSearchTerm,
    
    // Pagination actions
    setPagination: store.setPagination,
    setPage: store.setPage,
    setPageSize: store.setPageSize,
    
    // Real-time actions
    setRealTimeConnected: store.setRealTimeConnected,
    addRealTimeUpdate: store.addRealTimeUpdate,
    clearRealTimeUpdates: store.clearRealTimeUpdates,
    
    // Cache actions
    invalidateCache: store.invalidateCache,
    setCacheKey: store.setCacheKey,
    updateLastSyncTime: store.updateLastSyncTime,
    
    // Bulk actions
    reset: store.reset
  }
}