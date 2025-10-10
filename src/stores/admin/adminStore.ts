// Admin Store - Following Enterprise Zustand Pattern
// Bergizi-ID SaaS Platform - Platform Administration State

import { create } from 'zustand'
import { devtools, subscribeWithSelector } from 'zustand/middleware'

interface Sppg {
  id: string
  sppgName: string
  sppgCode: string
  status: string
  subscriptionPlan: string
  subscriptionStatus: string
}

interface AdminStore {
  // State
  sppgs: Sppg[]
  selectedSppg: Sppg | null
  isLoading: boolean
  
  // Actions
  setSppgs: (sppgs: Sppg[]) => void
  setSelectedSppg: (sppg: Sppg | null) => void
  setLoading: (loading: boolean) => void
  
  // Computed
  getActiveSppgs: () => Sppg[]
  getTotalSppgs: () => number
}

export const useAdminStore = create<AdminStore>()(
  devtools(
    subscribeWithSelector((set, get) => ({
      // Initial State
      sppgs: [],
      selectedSppg: null,
      isLoading: false,
      
      // Actions
      setSppgs: (sppgs) => set({ sppgs }),
      setSelectedSppg: (sppg) => set({ selectedSppg: sppg }),
      setLoading: (loading) => set({ isLoading: loading }),
      
      // Computed
      getActiveSppgs: () => {
        const { sppgs } = get()
        return sppgs.filter(sppg => sppg.status === 'ACTIVE')
      },
      
      getTotalSppgs: () => {
        const { sppgs } = get()
        return sppgs.length
      }
    })),
    { name: 'admin-store' }
  )
)