// Theme Store - Following Enterprise Zustand Pattern
// Bergizi-ID SaaS Platform - Dark Mode State Management

import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

type Theme = 'dark' | 'light' | 'system'

interface ThemeStore {
  theme: Theme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
  isDarkMode: boolean
  setIsDarkMode: (isDark: boolean) => void
}

export const useThemeStore = create<ThemeStore>()(
  devtools(
    persist(
      (set, get) => ({
        theme: 'system',
        isDarkMode: false,
        
        setTheme: (theme) => set({ theme }),
        
        toggleTheme: () => {
          const { theme } = get()
          const newTheme = theme === 'dark' ? 'light' : 'dark'
          set({ theme: newTheme })
        },
        
        setIsDarkMode: (isDark) => set({ isDarkMode: isDark })
      }),
      { name: 'theme-store' }
    ),
    { name: 'theme-store' }
  )
)