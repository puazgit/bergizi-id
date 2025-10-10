// Base Layout Interface for Enterprise Multi-Tenant Platform
// Bergizi-ID SaaS - Modular Layout System

import { ReactNode } from 'react'
import { LucideIcon } from 'lucide-react'

/**
 * Navigation Item Interface
 * Used for both sidebar and mobile navigation
 */
export interface NavigationItem {
  id: string
  name: string
  href: string
  icon: LucideIcon
  badge?: string | number
  description?: string
  requiredRoles?: string[]
  requiredPermissions?: string[]
  children?: NavigationItem[]
}

/**
 * Navigation Group Interface  
 * Used to group navigation items in sidebar
 */
export interface NavigationGroup {
  id: string
  name: string
  items: NavigationItem[]
  requiredRoles?: string[]
  collapsible?: boolean
  defaultExpanded?: boolean
}

/**
 * User Context for Layout
 */
export interface LayoutUser {
  id: string
  name: string | null
  email: string
  image?: string | null
  userRole: string
  userType: string
  sppgId?: string | null
  sppgName?: string | null
  sppgCode?: string | null
  isDemoAccount?: boolean
  jobTitle?: string | null
  department?: string | null
}

/**
 * Layout Configuration Interface
 */
export interface LayoutConfig {
  // Brand Configuration
  brand: {
    name: string
    logo?: string
    subtitle?: string
    homeUrl: string
  }
  
  // Navigation Configuration
  navigation: {
    groups: NavigationGroup[]
    showSearch?: boolean
    showNotifications?: boolean
    showUserMenu?: boolean
  }
  
  // Layout Options
  layout: {
    sidebarCollapsible?: boolean
    sidebarDefaultCollapsed?: boolean
    showBreadcrumbs?: boolean
    showPageHeader?: boolean
    containerMaxWidth?: string
  }
  
  // Theme Configuration
  theme: {
    showThemeToggle?: boolean
    defaultTheme?: 'light' | 'dark' | 'system'
  }
  
  // Footer Configuration
  footer?: {
    show?: boolean
    links?: Array<{ name: string; href: string }>
    copyright?: string
  }
}

/**
 * Base Layout Props Interface
 */
export interface BaseLayoutProps {
  children: ReactNode
  user?: LayoutUser | null
  config: LayoutConfig
  className?: string
}

/**
 * Header Props Interface
 */
export interface HeaderProps {
  user?: LayoutUser | null
  config: LayoutConfig
  sidebarOpen?: boolean
  onSidebarToggle?: () => void
  className?: string
}

/**
 * Sidebar Props Interface
 */
export interface SidebarProps {
  user?: LayoutUser | null
  config: LayoutConfig
  open?: boolean
  onOpenChange?: (open: boolean) => void
  className?: string
}

/**
 * Mobile Navigation Props Interface
 */
export interface MobileNavigationProps {
  user?: LayoutUser | null
  config: LayoutConfig
  open: boolean
  onOpenChange: (open: boolean) => void
  className?: string
}

/**
 * Page Header Props Interface
 */
export interface PageHeaderProps {
  title: string
  description?: string
  breadcrumbs?: Array<{ name: string; href?: string }>
  actions?: ReactNode
  className?: string
}