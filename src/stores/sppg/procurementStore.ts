// Procurement Store - Following Enterprise Zustand Pattern
// Bergizi-ID SaaS Platform - SPPG Procurement State Management

import { create } from 'zustand'
import { devtools, subscribeWithSelector } from 'zustand/middleware'
import type { ProcurementWithDetails } from '@/components/sppg/procurement/types/procurementTypes'

interface ProcurementFilters {
  paymentStatus?: string
  deliveryStatus?: string
  search?: string
  dateRange?: {
    from?: Date
    to?: Date
  }
}

interface ProcurementStore {
  // State
  procurements: ProcurementWithDetails[]
  selectedProcurement: ProcurementWithDetails | null
  filters: ProcurementFilters
  isLoading: boolean
  
  // Actions
  setProcurements: (procurements: ProcurementWithDetails[]) => void
  setSelectedProcurement: (procurement: ProcurementWithDetails | null) => void
  setFilters: (filters: Partial<ProcurementFilters>) => void
  setLoading: (loading: boolean) => void
  clearFilters: () => void
  
  // Computed
  getFilteredProcurements: () => ProcurementWithDetails[]
  getTotalValue: () => number
  getStats: () => {
    total: number
    pending: number
    completed: number
    totalValue: number
  }
}

export const useProcurementStore = create<ProcurementStore>()(
  devtools(
    subscribeWithSelector((set, get) => ({
      // Initial State
      procurements: [],
      selectedProcurement: null,
      filters: {},
      isLoading: false,
      
      // Actions
      setProcurements: (procurements) => set({ procurements }),
      
      setSelectedProcurement: (procurement) => set({ selectedProcurement: procurement }),
      
      setFilters: (newFilters) => set((state) => ({ 
        filters: { ...state.filters, ...newFilters } 
      })),
      
      setLoading: (loading) => set({ isLoading: loading }),
      
      clearFilters: () => set({ filters: {} }),
      
      // Computed
      getFilteredProcurements: () => {
        const { procurements, filters } = get()
        
        return procurements.filter(procurement => {
          // Payment status filter
          if (filters.paymentStatus && filters.paymentStatus !== 'all') {
            if (procurement.paymentStatus !== filters.paymentStatus) {
              return false
            }
          }
          
          // Delivery status filter
          if (filters.deliveryStatus && filters.deliveryStatus !== 'all') {
            if (procurement.deliveryStatus !== filters.deliveryStatus) {
              return false
            }
          }
          
          // Search filter
          if (filters.search) {
            const searchTerm = filters.search.toLowerCase()
            if (!procurement.supplierName.toLowerCase().includes(searchTerm)) {
              return false
            }
          }
          
          return true
        })
      },
      
      getTotalValue: () => {
        const { procurements } = get()
        return procurements.reduce((sum, p) => sum + p.totalAmount, 0)
      },
      
      getStats: () => {
        const { procurements } = get()
        
        return {
          total: procurements.length,
          pending: procurements.filter(p => 
            p.paymentStatus !== 'PAID' || p.deliveryStatus !== 'DELIVERED'
          ).length,
          completed: procurements.filter(p => 
            p.paymentStatus === 'PAID' && p.deliveryStatus === 'DELIVERED'
          ).length,
          totalValue: procurements.reduce((sum, p) => sum + p.totalAmount, 0)
        }
      }
    })),
    { name: 'procurement-store' }
  )
)