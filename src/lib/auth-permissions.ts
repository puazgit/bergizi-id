// Enterprise-Grade RBAC Permission System
// Bergizi-ID SaaS Platform - Authentication & Authorization

import { UserRole, PermissionType } from '@prisma/client'

/**
 * Enterprise Role-Based Access Control (RBAC) System
 * Implements fine-grained permissions for multi-tenant SaaS platform
 */

// Permission Matrix: Role -> Allowed Permissions
const rolePermissions: Record<UserRole, PermissionType[]> = {
  // ===== PLATFORM LEVEL ROLES =====
  PLATFORM_SUPERADMIN: [
    'READ', 'WRITE', 'DELETE', 'APPROVE',
    'USER_MANAGE', 'ROLE_ASSIGN', 'SETTINGS_MANAGE',
    'MENU_MANAGE', 'PROCUREMENT_MANAGE', 'PRODUCTION_MANAGE', 
    'DISTRIBUTION_MANAGE', 'QUALITY_MANAGE', 'FINANCIAL_MANAGE', 'HR_MANAGE',
    'REPORTS_VIEW', 'REPORTS_GENERATE', 'ANALYTICS_VIEW', 'ANALYTICS_ADVANCED',
    'SYSTEM_CONFIG', 'DATA_EXPORT', 'DATA_IMPORT', 'AUDIT_LOG_VIEW'
  ],
  
  PLATFORM_SUPPORT: [
    'READ', 'WRITE', 'USER_MANAGE', 'REPORTS_VIEW', 'ANALYTICS_VIEW',
    'SYSTEM_CONFIG', 'AUDIT_LOG_VIEW'
  ],
  
  PLATFORM_ANALYST: [
    'READ', 'REPORTS_VIEW', 'REPORTS_GENERATE', 'ANALYTICS_VIEW', 
    'ANALYTICS_ADVANCED', 'DATA_EXPORT'
  ],

  // ===== SPPG MANAGEMENT LEVEL =====
  SPPG_KEPALA: [
    'READ', 'WRITE', 'DELETE', 'APPROVE',
    'USER_MANAGE', 'ROLE_ASSIGN', 'SETTINGS_MANAGE',
    'MENU_MANAGE', 'PROCUREMENT_MANAGE', 'PRODUCTION_MANAGE',
    'DISTRIBUTION_MANAGE', 'QUALITY_MANAGE', 'FINANCIAL_MANAGE', 'HR_MANAGE',
    'REPORTS_VIEW', 'REPORTS_GENERATE', 'ANALYTICS_VIEW', 'ANALYTICS_ADVANCED',
    'DATA_EXPORT', 'DATA_IMPORT'
  ],
  
  SPPG_ADMIN: [
    'READ', 'WRITE', 'DELETE', 'USER_MANAGE',
    'MENU_MANAGE', 'PROCUREMENT_MANAGE', 'PRODUCTION_MANAGE',
    'DISTRIBUTION_MANAGE', 'REPORTS_VIEW', 'REPORTS_GENERATE',
    'ANALYTICS_VIEW', 'DATA_EXPORT'
  ],

  // ===== SPPG OPERATIONAL LEVEL =====
  SPPG_AHLI_GIZI: [
    'READ', 'WRITE', 'APPROVE',
    'MENU_MANAGE', 'QUALITY_MANAGE', 'REPORTS_VIEW', 'ANALYTICS_VIEW'
  ],
  
  SPPG_AKUNTAN: [
    'READ', 'WRITE', 'APPROVE',
    'PROCUREMENT_MANAGE', 'FINANCIAL_MANAGE', 'REPORTS_VIEW', 'ANALYTICS_VIEW'
  ],
  
  SPPG_PRODUKSI_MANAGER: [
    'READ', 'WRITE', 'APPROVE',
    'PRODUCTION_MANAGE', 'QUALITY_MANAGE', 'REPORTS_VIEW'
  ],
  
  SPPG_DISTRIBUSI_MANAGER: [
    'READ', 'WRITE', 'APPROVE',
    'DISTRIBUTION_MANAGE', 'REPORTS_VIEW'
  ],
  
  SPPG_HRD_MANAGER: [
    'READ', 'WRITE', 'APPROVE',
    'HR_MANAGE', 'USER_MANAGE', 'REPORTS_VIEW'
  ],

  // ===== SPPG STAFF LEVEL =====
  SPPG_STAFF_DAPUR: [
    'READ', 'WRITE', 'PRODUCTION_MANAGE'
  ],
  
  SPPG_STAFF_DISTRIBUSI: [
    'READ', 'WRITE', 'DISTRIBUTION_MANAGE'
  ],
  
  SPPG_STAFF_ADMIN: [
    'READ', 'WRITE', 'PROCUREMENT_MANAGE'
  ],
  
  SPPG_STAFF_QC: [
    'READ', 'WRITE', 'QUALITY_MANAGE'
  ],

  // ===== LIMITED ACCESS =====
  SPPG_VIEWER: [
    'READ', 'REPORTS_VIEW'
  ],
  
  DEMO_USER: [
    'READ', 'WRITE' // Limited by demo constraints, not permissions
  ]
}

/**
 * Check if a role has specific permission
 */
export function hasPermission(
  role: UserRole, 
  permission: PermissionType
): boolean {
  const permissions = rolePermissions[role] || []
  return permissions.includes(permission)
}

/**
 * Get all permissions for a role
 */
export function getRolePermissions(role: UserRole): PermissionType[] {
  return rolePermissions[role] || []
}

/**
 * Check if role can manage users
 */
export function canManageUsers(role: UserRole): boolean {
  return hasPermission(role, 'USER_MANAGE')
}

/**
 * Check if role can manage menus
 */
export function canManageMenu(role: UserRole): boolean {
  return hasPermission(role, 'MENU_MANAGE')
}

/**
 * Check if role can manage procurement
 */
export function canManageProcurement(role: UserRole): boolean {
  return hasPermission(role, 'PROCUREMENT_MANAGE')
}

/**
 * Check if role can manage production
 */
export function canManageProduction(role: UserRole): boolean {
  return hasPermission(role, 'PRODUCTION_MANAGE')
}

/**
 * Check if role can manage distribution
 */
export function canManageDistribution(role: UserRole): boolean {
  return hasPermission(role, 'DISTRIBUTION_MANAGE')
}

/**
 * Check if role can manage financials
 */
export function canManageFinancials(role: UserRole): boolean {
  return hasPermission(role, 'FINANCIAL_MANAGE')
}

/**
 * Check if role can manage HR
 */
export function canManageHR(role: UserRole): boolean {
  return hasPermission(role, 'HR_MANAGE')
}

/**
 * Check if role can view reports
 */
export function canViewReports(role: UserRole): boolean {
  return hasPermission(role, 'REPORTS_VIEW')
}

/**
 * Check if role can view analytics
 */
export function canViewAnalytics(role: UserRole): boolean {
  return hasPermission(role, 'ANALYTICS_VIEW')
}

/**
 * Check if role is platform admin
 */
export function isPlatformAdmin(role: UserRole): boolean {
  return [
    'PLATFORM_SUPERADMIN',
    'PLATFORM_SUPPORT',
    'PLATFORM_ANALYST'
  ].includes(role)
}

/**
 * Check if role is SPPG management level
 */
export function isSppgManagement(role: UserRole): boolean {
  return [
    'SPPG_KEPALA',
    'SPPG_ADMIN'
  ].includes(role)
}

/**
 * Check if role is SPPG operational level
 */
export function isSppgOperational(role: UserRole): boolean {
  return [
    'SPPG_AHLI_GIZI',
    'SPPG_AKUNTAN',
    'SPPG_PRODUKSI_MANAGER',
    'SPPG_DISTRIBUSI_MANAGER',
    'SPPG_HRD_MANAGER'
  ].includes(role)
}

/**
 * Check if role is SPPG staff level
 */
export function isSppgStaff(role: UserRole): boolean {
  return [
    'SPPG_STAFF_DAPUR',
    'SPPG_STAFF_DISTRIBUSI',
    'SPPG_STAFF_ADMIN',
    'SPPG_STAFF_QC'
  ].includes(role)
}

/**
 * Check if role belongs to SPPG (tenant) users
 */
export function isSppgUser(role: UserRole): boolean {
  return role.startsWith('SPPG_') || role === 'DEMO_USER'
}

/**
 * Get role hierarchy level (higher number = more permissions)
 */
export function getRoleLevel(role: UserRole): number {
  const levelMap: Record<UserRole, number> = {
    // Platform Level
    'PLATFORM_SUPERADMIN': 100,
    'PLATFORM_SUPPORT': 90,
    'PLATFORM_ANALYST': 80,
    
    // SPPG Management
    'SPPG_KEPALA': 70,
    'SPPG_ADMIN': 60,
    
    // SPPG Operational
    'SPPG_AHLI_GIZI': 50,
    'SPPG_AKUNTAN': 50,
    'SPPG_PRODUKSI_MANAGER': 50,
    'SPPG_DISTRIBUSI_MANAGER': 50,
    'SPPG_HRD_MANAGER': 50,
    
    // SPPG Staff
    'SPPG_STAFF_DAPUR': 30,
    'SPPG_STAFF_DISTRIBUSI': 30,
    'SPPG_STAFF_ADMIN': 30,
    'SPPG_STAFF_QC': 30,
    
    // Limited
    'SPPG_VIEWER': 10,
    'DEMO_USER': 5
  }
  
  return levelMap[role] || 0
}

/**
 * Check if user role can manage target role
 */
export function canManageRole(userRole: UserRole, targetRole: UserRole): boolean {
  // Platform admins can manage all SPPG roles
  if (isPlatformAdmin(userRole)) {
    return !isPlatformAdmin(targetRole) || 
           getRoleLevel(userRole) > getRoleLevel(targetRole)
  }
  
  // SPPG roles can only manage lower-level SPPG roles within same tenant
  if (isSppgUser(userRole) && isSppgUser(targetRole)) {
    return getRoleLevel(userRole) > getRoleLevel(targetRole)
  }
  
  return false
}

/**
 * Get available roles that user can assign
 */
export function getAssignableRoles(userRole: UserRole): UserRole[] {
  const allRoles = Object.keys(rolePermissions) as UserRole[]
  
  return allRoles.filter(role => canManageRole(userRole, role))
}