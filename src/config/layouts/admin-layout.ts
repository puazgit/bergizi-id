// Platform Admin Layout Configuration - Enterprise Multi-tenant System
// Bergizi-ID SaaS Platform - Admin Dashboard Layout

import { LayoutConfig } from '@/types/layout'
import {
  LayoutDashboard,
  Building2,
  Users,
  CreditCard,
  BarChart3,
  Settings,
  Shield,
  FileText,
  Bell,
  Globe,
  Database,
  Monitor,
  UserCheck,
  Zap,
  HelpCircle
} from 'lucide-react'

export const adminLayoutConfig: LayoutConfig = {
  // Brand Configuration
  brand: {
    name: 'Bergizi-ID',
    subtitle: 'Platform Admin',
    homeUrl: '/admin'
  },

  // Navigation Configuration
  navigation: {
    showSearch: true,
    showNotifications: true,
    showUserMenu: true,
    groups: [
      {
        id: 'main',
        name: '', // No header for main items
        defaultExpanded: true,
        collapsible: false,
        items: [
          {
            id: 'dashboard',
            name: 'Dashboard',
            href: '/admin',
            icon: LayoutDashboard,
            requiredRoles: ['PLATFORM_SUPERADMIN', 'PLATFORM_SUPPORT', 'PLATFORM_ANALYST'],
            requiredPermissions: ['READ']
          }
        ]
      },
      {
        id: 'tenant-management',
        name: 'Manajemen SPPG',
        defaultExpanded: true,
        collapsible: true,
        items: [
          {
            id: 'sppg-list',
            name: 'Daftar SPPG',
            href: '/admin/sppg',
            icon: Building2,
            requiredRoles: ['PLATFORM_SUPERADMIN', 'PLATFORM_SUPPORT'],
            requiredPermissions: ['READ']
          },
          {
            id: 'sppg-onboarding',
            name: 'Onboarding SPPG',
            href: '/admin/sppg/onboarding',
            icon: UserCheck,
            requiredRoles: ['PLATFORM_SUPERADMIN', 'PLATFORM_SUPPORT'],
            requiredPermissions: ['WRITE']
          },
          {
            id: 'demo-requests',
            name: 'Demo Requests',
            href: '/admin/demo-requests',
            icon: HelpCircle,
            requiredRoles: ['PLATFORM_SUPERADMIN', 'PLATFORM_SUPPORT'],
            requiredPermissions: ['READ'],
            badge: '12'
          }
        ]
      },
      {
        id: 'user-management',
        name: 'Manajemen Pengguna',
        defaultExpanded: false,
        collapsible: true,
        requiredRoles: ['PLATFORM_SUPERADMIN'],
        items: [
          {
            id: 'platform-users',
            name: 'Platform Users',
            href: '/admin/users',
            icon: Users,
            requiredRoles: ['PLATFORM_SUPERADMIN'],
            requiredPermissions: ['USER_MANAGE']
          },
          {
            id: 'role-management',
            name: 'Role Management',
            href: '/admin/roles',
            icon: Shield,
            requiredRoles: ['PLATFORM_SUPERADMIN'],
            requiredPermissions: ['ROLE_ASSIGN']
          }
        ]
      },
      {
        id: 'business-management',
        name: 'Bisnis & Keuangan',
        defaultExpanded: false,
        collapsible: true,
        items: [
          {
            id: 'subscriptions',
            name: 'Subscriptions',
            href: '/admin/subscriptions',
            icon: CreditCard,
            requiredRoles: ['PLATFORM_SUPERADMIN', 'PLATFORM_SUPPORT'],
            requiredPermissions: ['READ']
          },
          {
            id: 'billing',
            name: 'Billing & Invoices',
            href: '/admin/billing',
            icon: FileText,
            requiredRoles: ['PLATFORM_SUPERADMIN'],
            requiredPermissions: ['FINANCIAL_MANAGE']
          },
          {
            id: 'revenue-analytics',
            name: 'Revenue Analytics',
            href: '/admin/revenue',
            icon: BarChart3,
            requiredRoles: ['PLATFORM_SUPERADMIN'],
            requiredPermissions: ['ANALYTICS_ADVANCED']
          }
        ]
      },
      {
        id: 'platform-analytics',
        name: 'Platform Analytics',
        defaultExpanded: false,
        collapsible: true,
        items: [
          {
            id: 'usage-analytics',
            name: 'Usage Analytics',
            href: '/admin/analytics/usage',
            icon: BarChart3,
            requiredRoles: ['PLATFORM_SUPERADMIN', 'PLATFORM_ANALYST'],
            requiredPermissions: ['ANALYTICS_VIEW']
          },
          {
            id: 'performance-metrics',
            name: 'Performance Metrics',
            href: '/admin/analytics/performance',
            icon: Zap,
            requiredRoles: ['PLATFORM_SUPERADMIN', 'PLATFORM_ANALYST'],
            requiredPermissions: ['ANALYTICS_VIEW']
          },
          {
            id: 'system-health',
            name: 'System Health',
            href: '/admin/analytics/health',
            icon: Monitor,
            requiredRoles: ['PLATFORM_SUPERADMIN'],
            requiredPermissions: ['SYSTEM_CONFIG']
          }
        ]
      },
      {
        id: 'system-management',
        name: 'Sistem Platform',
        defaultExpanded: false,
        collapsible: true,
        requiredRoles: ['PLATFORM_SUPERADMIN'],
        items: [
          {
            id: 'platform-settings',
            name: 'Platform Settings',
            href: '/admin/platform-settings',
            icon: Settings,
            requiredRoles: ['PLATFORM_SUPERADMIN'],
            requiredPermissions: ['SYSTEM_CONFIG']
          },
          {
            id: 'database-management',
            name: 'Database Management',
            href: '/admin/database',
            icon: Database,
            requiredRoles: ['PLATFORM_SUPERADMIN'],
            requiredPermissions: ['SYSTEM_CONFIG']
          },
          {
            id: 'api-management',
            name: 'API Management',
            href: '/admin/api',
            icon: Globe,
            requiredRoles: ['PLATFORM_SUPERADMIN'],
            requiredPermissions: ['SYSTEM_CONFIG']
          },
          {
            id: 'system-notifications',
            name: 'System Notifications',
            href: '/admin/notifications',
            icon: Bell,
            requiredRoles: ['PLATFORM_SUPERADMIN'],
            requiredPermissions: ['SYSTEM_CONFIG'],
            badge: 'Live'
          }
        ]
      },
      {
        id: 'compliance-audit',
        name: 'Compliance & Audit',
        defaultExpanded: false,
        collapsible: true,
        requiredRoles: ['PLATFORM_SUPERADMIN'],
        items: [
          {
            id: 'audit-logs',
            name: 'Audit Logs',
            href: '/admin/audit',
            icon: FileText,
            requiredRoles: ['PLATFORM_SUPERADMIN'],
            requiredPermissions: ['AUDIT_LOG_VIEW']
          },
          {
            id: 'security-monitoring',
            name: 'Security Monitoring',
            href: '/admin/security',
            icon: Shield,
            requiredRoles: ['PLATFORM_SUPERADMIN'],
            requiredPermissions: ['AUDIT_LOG_VIEW']
          },
          {
            id: 'compliance-reports',
            name: 'Compliance Reports',
            href: '/admin/compliance',
            icon: FileText,
            requiredRoles: ['PLATFORM_SUPERADMIN'],
            requiredPermissions: ['REPORTS_GENERATE']
          }
        ]
      }
    ]
  },

  // Layout Configuration
  layout: {
    sidebarCollapsible: true,
    sidebarDefaultCollapsed: false,
    showBreadcrumbs: true,
    showPageHeader: true,
    containerMaxWidth: '1600px' // Wider for admin dashboards
  },

  // Theme Configuration
  theme: {
    showThemeToggle: true,
    defaultTheme: 'system'
  },

  // Footer Configuration
  footer: {
    show: true,
    links: [
      {
        name: 'Platform Documentation',
        href: '/admin/docs'
      },
      {
        name: 'System Status',
        href: '/admin/status'
      },
      {
        name: 'Emergency Support',
        href: '/admin/emergency'
      }
    ],
    copyright: '© 2024 Bergizi-ID Platform. Enterprise SaaS Solution.'
  }
}