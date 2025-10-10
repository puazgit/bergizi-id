// Theme Types - Following Enterprise Pattern
// Bergizi-ID SaaS Platform - Theme Type Definitions

export type Theme = 'dark' | 'light' | 'system'

export interface ThemeConfig {
  colors: {
    light: Record<string, string>
    dark: Record<string, string>
  }
}

export interface ThemeProviderProps {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
  attribute?: string
  value?: Record<string, string>
}