// Analytics Store - Following Enterprise Zustand Pattern
// Bergizi-ID SaaS Platform - Platform Analytics State

import { create } from 'zustand'
import { devtools, subscribeWithSelector } from 'zustand/middleware'

interface AnalyticsData {
  totalSppgs: number
  activeSppgs: number
  totalUsers: number
  totalRevenue: number
  monthlyGrowth: number
}

interface AnalyticsStore {
  // State
  analytics: AnalyticsData | null
  isLoading: boolean
  
  // Actions
  setAnalytics: (data: AnalyticsData) => void
  setLoading: (loading: boolean) => void
  
  // Computed
  getGrowthPercentage: () => number
  getRevenueFormatted: () => string
}

export const useAnalyticsStore = create<AnalyticsStore>()(
  devtools(
    subscribeWithSelector((set, get) => ({
      // Initial State
      analytics: null,
      isLoading: false,
      
      // Actions
      setAnalytics: (data) => set({ analytics: data }),
      setLoading: (loading) => set({ isLoading: loading }),
      
      // Computed
      getGrowthPercentage: () => {
        const { analytics } = get()
        return analytics?.monthlyGrowth || 0
      },
      
      getRevenueFormatted: () => {
        const { analytics } = get()
        if (!analytics) return 'Rp 0'
        
        return new Intl.NumberFormat('id-ID', {
          style: 'currency',
          currency: 'IDR',
          minimumFractionDigits: 0
        }).format(analytics.totalRevenue)
      }
    })),
    { name: 'analytics-store' }
  )
)