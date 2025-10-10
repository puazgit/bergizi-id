// Inventory Store - Simple Pattern 2 Implementation
// Self-contained Inventory domain state management
// src/components/sppg/inventory/stores/useInventoryStore.ts

import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import type { 
  InventoryItemWithDetails, 
  InventoryFilters 
} from '../types'

interface InventoryStore {
  // Core inventory data
  items: InventoryItemWithDetails[]
  selectedItem: InventoryItemWithDetails | null
  
  // UI state
  loading: boolean
  error: string | null
  
  // Filtering
  filters: InventoryFilters
  
  // Actions
  setItems: (items: InventoryItemWithDetails[]) => void
  setSelectedItem: (item: InventoryItemWithDetails | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  updateFilters: (filters: Partial<InventoryFilters>) => void
  clearFilters: () => void
}

export const useInventoryStore = create<InventoryStore>()(
  devtools(
    persist(
      (set) => ({
        // Initial state
        items: [],
        selectedItem: null,
        loading: false,
        error: null,
        filters: {
          page: 1,
          limit: 25,
          sortBy: 'itemName',
          sortOrder: 'asc',
          globalSearch: '',
          categoryFilter: [],
          statusFilter: [],
          supplierFilter: [],
          stockLevelFilter: 'all',
          expiryDateRange: {}
        },
        
        // Actions
        setItems: (items) => set({ items }),
        setSelectedItem: (selectedItem) => set({ selectedItem }),
        setLoading: (loading) => set({ loading }),
        setError: (error) => set({ error }),
        updateFilters: (newFilters) => 
          set((state) => ({ 
            filters: { ...state.filters, ...newFilters } 
          })),
        clearFilters: () => 
          set({
            filters: {
              page: 1,
              limit: 25,
              sortBy: 'itemName',
              sortOrder: 'asc',
              globalSearch: '',
              categoryFilter: [],
              statusFilter: [],
              supplierFilter: [],
              stockLevelFilter: 'all',
              expiryDateRange: {}
            }
          })
      }),
      {
        name: 'InventoryStore',
        partialize: (state) => ({
          filters: state.filters
        })
      }
    ),
    { name: 'InventoryStore' }
  )
)

export default useInventoryStore