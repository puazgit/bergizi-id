// Auth Store - Following Enterprise Zustand Pattern
// Bergizi-ID SaaS Platform - Authentication State Management

import { create } from 'zustand'
import { devtools, subscribeWithSelector } from 'zustand/middleware'

interface User {
  id: string
  email: string
  name: string
  userRole: string
  sppgId: string | null
  userType: string
}

interface AuthStore {
  // State
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  
  // Actions
  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
  logout: () => void
  
  // Computed
  isSppgUser: () => boolean
  isAdminUser: () => boolean
  canAccessRoute: (route: string) => boolean
}

export const useAuthStore = create<AuthStore>()(
  devtools(
    subscribeWithSelector((set, get) => ({
      // Initial State
      user: null,
      isLoading: false,
      isAuthenticated: false,
      
      // Actions
      setUser: (user) => set({ 
        user, 
        isAuthenticated: !!user 
      }),
      
      setLoading: (loading) => set({ isLoading: loading }),
      
      logout: () => set({ 
        user: null, 
        isAuthenticated: false 
      }),
      
      // Computed
      isSppgUser: () => {
        const { user } = get()
        return user?.userRole?.startsWith('SPPG_') || false
      },
      
      isAdminUser: () => {
        const { user } = get()
        return user?.userRole?.startsWith('PLATFORM_') || false
      },
      
      canAccessRoute: (route) => {
        const { user } = get()
        if (!user) return false
        
        const isAdmin = user.userRole?.startsWith('PLATFORM_')
        const isSppg = user.userRole?.startsWith('SPPG_')
        
        if (route.startsWith('/admin')) return isAdmin
        if (route.startsWith('/dashboard') || route.startsWith('/menu') || route.startsWith('/procurement')) {
          return isSppg && !!user.sppgId
        }
        
        return true
      }
    })),
    { name: 'auth-store' }
  )
)