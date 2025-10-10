// SPPG Layout Configuration - Enterprise Multi-tenant System
// Bergizi-ID SaaS Platform - SPPG Dashboard Layout

import { LayoutConfig } from '@/types/layout'
import {
  LayoutDashboard,
  UtensilsCrossed,
  Package,
  Factory,
  Truck,
  Users,
  Settings,
  FileText,
  Warehouse,
  Calculator,
  Calendar,
  TrendingUp,
  Shield,
  Bell,
  MessageSquare,
  Plus,
  List,
  Target,
  ClipboardList,
  ShoppingCart,
  UserPlus,
  Award,
  BookOpen,
  Clock,
  Activity
} from 'lucide-react'

export const sppgLayoutConfig: LayoutConfig = {
  // Brand Configuration
  brand: {
    name: 'Bergizi-ID',
    subtitle: 'SPPG Dashboard',
    homeUrl: '/dashboard'
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
            href: '/dashboard',
            icon: LayoutDashboard,
            requiredRoles: [
              'SPPG_KEPALA', 'SPPG_ADMIN', 'SPPG_AHLI_GIZI', 'SPPG_AKUNTAN',
              'SPPG_PRODUKSI_MANAGER', 'SPPG_DISTRIBUSI_MANAGER', 'SPPG_HRD_MANAGER',
              'SPPG_STAFF_DAPUR', 'SPPG_STAFF_DISTRIBUSI', 'SPPG_STAFF_ADMIN', 'SPPG_STAFF_QC',
              'SPPG_VIEWER', 'DEMO_USER'
            ],
            requiredPermissions: ['READ']
          }
        ]
      },
      {
        id: 'operational',
        name: 'Operasional',
        defaultExpanded: true,
        collapsible: true,
        items: [
          {
            id: 'programs',
            name: 'Program Nutrisi',
            href: '/programs',
            icon: Target,
            requiredRoles: [
              'SPPG_KEPALA', 'SPPG_ADMIN', 'SPPG_AHLI_GIZI'
            ],
            requiredPermissions: ['MENU_MANAGE']
          },
          {
            id: 'menu',
            name: 'Menu & Gizi',
            href: '/menu',
            icon: UtensilsCrossed,
            requiredRoles: [
              'SPPG_KEPALA', 'SPPG_ADMIN', 'SPPG_AHLI_GIZI'
            ],
            requiredPermissions: ['MENU_MANAGE'],
            children: [
              {
                id: 'menu-list',
                name: 'Daftar Menu',
                href: '/menu',
                icon: List,
                requiredRoles: [
                  'SPPG_KEPALA', 'SPPG_ADMIN', 'SPPG_AHLI_GIZI'
                ],
                requiredPermissions: ['MENU_MANAGE']
              },
              {
                id: 'menu-create',
                name: 'Buat Menu Baru',
                href: '/menu/create',
                icon: Plus,
                requiredRoles: [
                  'SPPG_KEPALA', 'SPPG_ADMIN', 'SPPG_AHLI_GIZI'
                ],
                requiredPermissions: ['MENU_MANAGE'],
                description: 'PHASE 7 - Ready for Integration'
              },
              {
                id: 'menu-plans',
                name: 'Perencanaan Menu',
                href: '/menu/plans',
                icon: Calendar,
                requiredRoles: [
                  'SPPG_KEPALA', 'SPPG_ADMIN', 'SPPG_AHLI_GIZI'
                ],
                requiredPermissions: ['MENU_MANAGE'],
                badge: 'New',
                description: 'PHASE 7 - Fully Integrated'
              }
            ]
          },
          {
            id: 'procurement',
            name: 'Procurement',
            href: '/procurement',
            icon: Package,
            requiredRoles: [
              'SPPG_KEPALA', 'SPPG_ADMIN', 'SPPG_AKUNTAN', 'SPPG_STAFF_ADMIN'
            ],
            requiredPermissions: ['PROCUREMENT_MANAGE'],
            children: [
              {
                id: 'procurement-dashboard',
                name: 'Dashboard',
                href: '/procurement',
                icon: LayoutDashboard,
                requiredRoles: [
                  'SPPG_KEPALA', 'SPPG_ADMIN', 'SPPG_AKUNTAN', 'SPPG_STAFF_ADMIN'
                ],
                requiredPermissions: ['PROCUREMENT_MANAGE']
              },
              {
                id: 'procurement-plan',
                name: 'Rencana Procurement',
                href: '/procurement/plan',
                icon: ClipboardList,
                requiredRoles: [
                  'SPPG_KEPALA', 'SPPG_ADMIN', 'SPPG_AKUNTAN'
                ],
                requiredPermissions: ['PROCUREMENT_MANAGE']
              },
              {
                id: 'procurement-orders',
                name: 'Pesanan',
                href: '/procurement/orders',
                icon: ShoppingCart,
                requiredRoles: [
                  'SPPG_KEPALA', 'SPPG_ADMIN', 'SPPG_AKUNTAN', 'SPPG_STAFF_ADMIN'
                ],
                requiredPermissions: ['PROCUREMENT_MANAGE']
              }
            ]
          },
          {
            id: 'production',
            name: 'Produksi',
            href: '/production',
            icon: Factory,
            requiredRoles: [
              'SPPG_KEPALA', 'SPPG_ADMIN', 'SPPG_PRODUKSI_MANAGER', 'SPPG_STAFF_DAPUR', 'SPPG_STAFF_QC'
            ],
            requiredPermissions: ['PRODUCTION_MANAGE'],
            children: [
              {
                id: 'production-dashboard',
                name: 'Dashboard Produksi',
                href: '/production',
                icon: LayoutDashboard,
                requiredRoles: [
                  'SPPG_KEPALA', 'SPPG_ADMIN', 'SPPG_PRODUKSI_MANAGER', 'SPPG_STAFF_DAPUR'
                ],
                requiredPermissions: ['PRODUCTION_MANAGE']
              },
              {
                id: 'production-monitor',
                name: 'Monitor Produksi',
                href: '/production/monitor',
                icon: Activity,
                requiredRoles: [
                  'SPPG_KEPALA', 'SPPG_ADMIN', 'SPPG_PRODUKSI_MANAGER', 'SPPG_STAFF_QC'
                ],
                requiredPermissions: ['PRODUCTION_MANAGE']
              }
            ]
          },
          {
            id: 'distribution',
            name: 'Distribusi',
            href: '/distribution',
            icon: Truck,
            requiredRoles: [
              'SPPG_KEPALA', 'SPPG_ADMIN', 'SPPG_DISTRIBUSI_MANAGER', 'SPPG_STAFF_DISTRIBUSI'
            ],
            requiredPermissions: ['DISTRIBUTION_MANAGE']
          }
        ]
      },
      {
        id: 'management',
        name: 'Manajemen',
        defaultExpanded: false,
        collapsible: true,
        requiredRoles: [
          'SPPG_KEPALA', 'SPPG_ADMIN', 'SPPG_HRD_MANAGER'
        ],
        items: [
          {
            id: 'inventory',
            name: 'Inventory',
            href: '/inventory',
            icon: Warehouse,
            requiredRoles: [
              'SPPG_KEPALA', 'SPPG_ADMIN', 'SPPG_AKUNTAN'
            ],
            requiredPermissions: ['READ']
          },
          {
            id: 'hrd',
            name: 'HRD',
            href: '/hrd',
            icon: Users,
            requiredRoles: [
              'SPPG_KEPALA', 'SPPG_ADMIN', 'SPPG_HRD_MANAGER'
            ],
            requiredPermissions: ['HR_MANAGE'],
            children: [
              {
                id: 'hrd-dashboard',
                name: 'Dashboard HRD',
                href: '/hrd',
                icon: LayoutDashboard,
                requiredRoles: [
                  'SPPG_KEPALA', 'SPPG_ADMIN', 'SPPG_HRD_MANAGER'
                ],
                requiredPermissions: ['HR_MANAGE']
              },
              {
                id: 'hrd-employees',
                name: 'Karyawan',
                href: '/hrd/employees',
                icon: UserPlus,
                requiredRoles: [
                  'SPPG_KEPALA', 'SPPG_ADMIN', 'SPPG_HRD_MANAGER'
                ],
                requiredPermissions: ['HR_MANAGE']
              },
              {
                id: 'hrd-attendance',
                name: 'Kehadiran',
                href: '/hrd/attendance',
                icon: Clock,
                requiredRoles: [
                  'SPPG_KEPALA', 'SPPG_ADMIN', 'SPPG_HRD_MANAGER'
                ],
                requiredPermissions: ['HR_MANAGE']
              },
              {
                id: 'hrd-performance',
                name: 'Performa',
                href: '/hrd/performance',
                icon: Award,
                requiredRoles: [
                  'SPPG_KEPALA', 'SPPG_ADMIN', 'SPPG_HRD_MANAGER'
                ],
                requiredPermissions: ['HR_MANAGE']
              },
              {
                id: 'hrd-training',
                name: 'Pelatihan',
                href: '/hrd/training',
                icon: BookOpen,
                requiredRoles: [
                  'SPPG_KEPALA', 'SPPG_ADMIN', 'SPPG_HRD_MANAGER'
                ],
                requiredPermissions: ['HR_MANAGE']
              }
            ]
          },
          {
            id: 'financial',
            name: 'Keuangan',
            href: '/financial',
            icon: Calculator,
            requiredRoles: [
              'SPPG_KEPALA', 'SPPG_ADMIN', 'SPPG_AKUNTAN'
            ],
            requiredPermissions: ['FINANCIAL_MANAGE']
          }
        ]
      },
      {
        id: 'reporting',
        name: 'Laporan & Analisis',
        defaultExpanded: false,
        collapsible: true,
        items: [
          {
            id: 'reports',
            name: 'Laporan',
            href: '/reports',
            icon: FileText,
            requiredRoles: [
              'SPPG_KEPALA', 'SPPG_ADMIN', 'SPPG_AHLI_GIZI', 'SPPG_AKUNTAN',
              'SPPG_PRODUKSI_MANAGER', 'SPPG_DISTRIBUSI_MANAGER', 'SPPG_HRD_MANAGER',
              'SPPG_VIEWER'
            ],
            requiredPermissions: ['REPORTS_VIEW']
          },
          {
            id: 'analytics',
            name: 'Analytics',
            href: '/analytics',
            icon: TrendingUp,
            requiredRoles: [
              'SPPG_KEPALA', 'SPPG_ADMIN', 'SPPG_AHLI_GIZI', 'SPPG_AKUNTAN'
            ],
            requiredPermissions: ['ANALYTICS_VIEW']
          },
          {
            id: 'planning',
            name: 'Perencanaan',
            href: '/planning',
            icon: Calendar,
            requiredRoles: [
              'SPPG_KEPALA', 'SPPG_ADMIN', 'SPPG_AHLI_GIZI'
            ],
            requiredPermissions: ['MENU_MANAGE']
          }
        ]
      },
      {
        id: 'system',
        name: 'Sistem',
        defaultExpanded: false,
        collapsible: true,
        items: [
          {
            id: 'notifications',
            name: 'Notifikasi',
            href: '/notifications',
            icon: Bell,
            requiredRoles: [
              'SPPG_KEPALA', 'SPPG_ADMIN', 'SPPG_AHLI_GIZI', 'SPPG_AKUNTAN',
              'SPPG_PRODUKSI_MANAGER', 'SPPG_DISTRIBUSI_MANAGER', 'SPPG_HRD_MANAGER',
              'SPPG_STAFF_DAPUR', 'SPPG_STAFF_DISTRIBUSI', 'SPPG_STAFF_ADMIN', 'SPPG_STAFF_QC',
              'SPPG_VIEWER', 'DEMO_USER'
            ],
            requiredPermissions: ['READ'],
            badge: '3'
          },
          {
            id: 'feedback',
            name: 'Feedback',
            href: '/feedback',
            icon: MessageSquare,
            requiredRoles: [
              'SPPG_KEPALA', 'SPPG_ADMIN', 'SPPG_AHLI_GIZI', 'SPPG_AKUNTAN',
              'SPPG_PRODUKSI_MANAGER', 'SPPG_DISTRIBUSI_MANAGER', 'SPPG_HRD_MANAGER',
              'SPPG_STAFF_DAPUR', 'SPPG_STAFF_DISTRIBUSI', 'SPPG_STAFF_ADMIN', 'SPPG_STAFF_QC',
              'SPPG_VIEWER', 'DEMO_USER'
            ],
            requiredPermissions: ['READ'],
            badge: 'New'
          },
          {
            id: 'audit',
            name: 'Audit Log',
            href: '/audit',
            icon: Shield,
            requiredRoles: [
              'SPPG_KEPALA', 'SPPG_ADMIN'
            ],
            requiredPermissions: ['AUDIT_LOG_VIEW']
          },
          {
            id: 'settings',
            name: 'Pengaturan',
            href: '/settings',
            icon: Settings,
            requiredRoles: [
              'SPPG_KEPALA', 'SPPG_ADMIN'
            ],
            requiredPermissions: ['SETTINGS_MANAGE']
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
    containerMaxWidth: '1400px'
  },

  // Theme Configuration
  theme: {
    showThemeToggle: true,
    defaultTheme: 'system'
  },

  // Footer Configuration (if needed)
  footer: {
    show: true,
    links: [
      {
        name: 'Bantuan',
        href: '/help'
      },
      {
        name: 'Kontak Support',
        href: '/support'
      }
    ],
    copyright: '© 2024 Bergizi-ID. All rights reserved.'
  }
}

// Demo mode configuration with limited features
export const demoSppgLayoutConfig: LayoutConfig = {
  ...sppgLayoutConfig,
  brand: {
    ...sppgLayoutConfig.brand,
    subtitle: 'DEMO Dashboard'
  },
  navigation: {
    showSearch: true,
    showNotifications: false, // Limited for demo
    showUserMenu: true,
    groups: sppgLayoutConfig.navigation.groups.map(group => ({
      ...group,
      items: group.items.filter(item => 
        // Only show basic features in demo mode
        ['dashboard', 'menu', 'procurement', 'reports', 'feedback'].includes(item.id)
      )
    })).filter(group => 
      // Remove groups that have no items after filtering
      group.items.length > 0
    )
  }
}