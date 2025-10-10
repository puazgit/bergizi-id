// Theme Hook - Following Enterprise Pattern
// Bergizi-ID SaaS Platform - Dark Mode Hook

'use client'

import { useTheme as useNextTheme } from 'next-themes'
import { useThemeStore } from '@/stores/theme/themeStore'

export function useTheme() {
  const { theme, setTheme } = useNextTheme()
  const { toggleTheme, isDarkMode, setIsDarkMode } = useThemeStore()
  
  return {
    theme,
    setTheme,
    toggleTheme,
    isDarkMode,
    setIsDarkMode
  }
}