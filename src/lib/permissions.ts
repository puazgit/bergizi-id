// RBAC Permission System - Following Enterprise Pattern
// Bergizi-ID SaaS Platform - Multi-tenant Access Control

import { UserRole, PermissionType } from '@prisma/client'

const rolePermissions: Record<UserRole, PermissionType[]> = {
  // Platform Level - SUPERADMIN has all permissions (checked separately)
  PLATFORM_SUPERADMIN: [],
  PLATFORM_SUPPORT: ['READ', 'REPORTS_VIEW'],
  PLATFORM_ANALYST: ['READ', 'ANALYTICS_VIEW'],

  // SPPG Management
  SPPG_KEPALA: [
    'READ', 'WRITE', 'DELETE', 'APPROVE', 'ANALYTICS_VIEW',
    'MENU_MANAGE', 'PROCUREMENT_MANAGE', 
    'PRODUCTION_MANAGE', 'DISTRIBUTION_MANAGE',
    'FINANCIAL_MANAGE', 'HR_MANAGE'
  ],
  SPPG_ADMIN: [
    'READ', 'WRITE', 'ANALYTICS_VIEW', 'MENU_MANAGE', 
    'PROCUREMENT_MANAGE', 'USER_MANAGE'
  ],

  // SPPG Operational
  SPPG_AHLI_GIZI: [
    'READ', 'WRITE', 'ANALYTICS_VIEW', 'MENU_MANAGE', 
    'QUALITY_MANAGE'
  ],
  SPPG_AKUNTAN: [
    'READ', 'WRITE', 'ANALYTICS_VIEW', 'FINANCIAL_MANAGE', 
    'PROCUREMENT_MANAGE'
  ],
  SPPG_PRODUKSI_MANAGER: [
    'READ', 'WRITE', 'ANALYTICS_VIEW', 'PRODUCTION_MANAGE', 
    'QUALITY_MANAGE'
  ],
  SPPG_DISTRIBUSI_MANAGER: [
    'READ', 'WRITE', 'ANALYTICS_VIEW', 'DISTRIBUTION_MANAGE'
  ],

  // SPPG Staff
  SPPG_STAFF_DAPUR: ['READ', 'ANALYTICS_VIEW', 'PRODUCTION_MANAGE'],
  SPPG_STAFF_DISTRIBUSI: ['READ', 'ANALYTICS_VIEW', 'DISTRIBUTION_MANAGE'],
  SPPG_STAFF_QC: ['READ', 'ANALYTICS_VIEW', 'QUALITY_MANAGE'],
  SPPG_STAFF_ADMIN: ['READ', 'WRITE', 'ANALYTICS_VIEW'],
  
  // SPPG Management (missing)
  SPPG_HRD_MANAGER: ['READ', 'WRITE', 'ANALYTICS_VIEW', 'HR_MANAGE'],
  
  // Limited
  SPPG_VIEWER: ['READ', 'ANALYTICS_VIEW'],
  DEMO_USER: ['READ', 'ANALYTICS_VIEW']
}

export function hasPermission(
  role: UserRole, 
  permission: PermissionType
): boolean {
  // SUPERADMIN has all permissions
  if (role === 'PLATFORM_SUPERADMIN') {
    return true
  }
  
  const permissions = rolePermissions[role] || []
  return permissions.includes(permission)
}

export function canManageMenu(role: UserRole): boolean {
  return hasPermission(role, 'MENU_MANAGE')
}

export function canManageProcurement(role: UserRole): boolean {
  return hasPermission(role, 'PROCUREMENT_MANAGE')
}

export async function checkSppgAccess(sppgId: string | null) {
  if (!sppgId) return null
  
  const prisma = (await import('./db')).default
  return await prisma.sPPG.findFirst({
    where: {
      id: sppgId,
      status: 'ACTIVE'
    }
  })
}