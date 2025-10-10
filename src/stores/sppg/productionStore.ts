// Production Store - Zustand state management
// SPPG Production domain state management
// src/stores/sppg/productionStore.ts

import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

interface Production {
  id: string
  programId: string
  menuId: string
  scheduledDate: Date
  plannedQuantity: number
  actualQuantity?: number
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
  notes?: string
  createdAt: Date
  updatedAt: Date
}

interface ProductionState {
  // Production data
  productions: Production[]
  selectedProduction: Production | null
  
  // UI state
  loading: boolean
  error: string | null
  
  // Filters
  filters: {
    startDate?: Date
    endDate?: Date
    status?: Production['status']
    menuId?: string
    page: number
    limit: number
  }
  
  // Actions
  setProductions: (productions: Production[]) => void
  setSelectedProduction: (production: Production | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setFilters: (filters: Partial<ProductionState['filters']>) => void
  
  // Production operations
  addProduction: (production: Production) => void
  updateProduction: (id: string, updates: Partial<Production>) => void
  removeProduction: (id: string) => void
  
  // Reset
  reset: () => void
}

const initialFilters = {
  page: 1,
  limit: 10,
}

export const useProductionStore = create<ProductionState>()(
  devtools(
    (set) => ({
      productions: [],
      selectedProduction: null,
      loading: false,
      error: null,
      filters: initialFilters,
      
      setProductions: (productions) => set({ productions }),
      setSelectedProduction: (selectedProduction) => set({ selectedProduction }),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
      setFilters: (filters) => 
        set((state) => ({ 
          filters: { ...state.filters, ...filters } 
        })),
      
      addProduction: (production) =>
        set((state) => ({
          productions: [production, ...state.productions],
        })),
      
      updateProduction: (id, updates) =>
        set((state) => ({
          productions: state.productions.map(production => 
            production.id === id ? { ...production, ...updates } : production
          ),
          selectedProduction: state.selectedProduction?.id === id 
            ? { ...state.selectedProduction, ...updates }
            : state.selectedProduction,
        })),
      
      removeProduction: (id) =>
        set((state) => ({
          productions: state.productions.filter(production => production.id !== id),
          selectedProduction: state.selectedProduction?.id === id ? null : state.selectedProduction,
        })),
      
      reset: () => set({
        productions: [],
        selectedProduction: null,
        loading: false,
        error: null,
        filters: initialFilters,
      }),
    }),
    {
      name: 'production-store',
    }
  )
)