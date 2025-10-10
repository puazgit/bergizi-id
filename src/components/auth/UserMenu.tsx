'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import {
  LogOut,
  Settings,
  User,
  Shield,
  ChevronDown,
  Building2,
  Crown,
  BarChart3,
  Users
} from 'lucide-react'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { logoutAction } from '@/lib/auth-actions'

interface UserMenuProps {
  className?: string
}

export function UserMenu({ }: UserMenuProps) {
  const { data: session, status } = useSession()
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await logoutAction()
      await signOut({ redirect: false })
      router.push('/')
    } catch (error) {
      console.error('Logout error:', error)
      // Fallback to client-side signOut
      await signOut({ redirect: false })
      router.push('/')
    }
  }

  const getRoleDisplayName = (role: string) => {
    const roleMap: Record<string, string> = {
      'PLATFORM_SUPERADMIN': 'Super Admin',
      'PLATFORM_SUPPORT': 'Platform Support',
      'PLATFORM_ANALYST': 'Platform Analyst',
      'SPPG_KEPALA': 'Kepala SPPG',
      'SPPG_ADMIN': 'Admin SPPG',
      'SPPG_AHLI_GIZI': 'Ahli Gizi',
      'SPPG_AKUNTAN': 'Akuntan',
      'SPPG_PRODUKSI_MANAGER': 'Manager Produksi',
      'SPPG_DISTRIBUSI_MANAGER': 'Manager Distribusi',
      'SPPG_HRD_MANAGER': 'Manager HRD',
      'SPPG_STAFF_DAPUR': 'Staff Dapur',
      'SPPG_STAFF_DISTRIBUSI': 'Staff Distribusi',
      'SPPG_STAFF_ADMIN': 'Staff Admin',
      'SPPG_STAFF_QC': 'Staff QC',
      'SPPG_VIEWER': 'Viewer',
      'DEMO_USER': 'Demo User'
    }
    return roleMap[role] || role
  }

  const getRoleBadgeVariant = (role: string) => {
    if (role.startsWith('PLATFORM_')) return 'default'
    if (role === 'SPPG_KEPALA' || role === 'SPPG_ADMIN') return 'secondary'
    if (role.includes('MANAGER')) return 'outline'
    if (role === 'DEMO_USER') return 'destructive'
    return 'secondary'
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  if (status === 'loading') {
    return (
      <div className="flex items-center space-x-2">
        <div className="h-8 w-8 bg-muted animate-pulse rounded-full" />
        <div className="hidden md:block">
          <div className="h-4 w-24 bg-muted animate-pulse rounded" />
        </div>
      </div>
    )
  }

  if (!session?.user) {
    return (
      <div className="flex items-center space-x-2">
        <Button variant="ghost" size="sm" onClick={() => router.push('/login')}>
          Masuk
        </Button>
        <Button size="sm" onClick={() => router.push('/register')}>
          Daftar
        </Button>
      </div>
    )
  }

  const { user } = session

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center space-x-2 h-auto p-2">
          <Avatar className="h-8 w-8">
            <AvatarImage 
              src={user.image || undefined} 
              alt={user.name || 'User'} 
            />
            <AvatarFallback className="text-xs">
              {getInitials(user.name || user.email || 'U')}
            </AvatarFallback>
          </Avatar>
          <div className="hidden md:block text-left">
            <div className="text-sm font-medium">{user.name}</div>
            <div className="text-xs text-muted-foreground">
              {user.sppgName || 'Platform User'}
            </div>
          </div>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-64">
        {/* User Info */}
        <DropdownMenuLabel className="pb-2">
          <div className="flex flex-col space-y-1">
            <div className="font-medium">{user.name}</div>
            <div className="text-xs text-muted-foreground">{user.email}</div>
            <div className="flex items-center space-x-2 mt-2">
              <Badge variant={getRoleBadgeVariant(user.userRole)} className="text-xs">
                {getRoleDisplayName(user.userRole)}
              </Badge>
              {user.isDemoAccount && (
                <Badge variant="destructive" className="text-xs">
                  Demo
                </Badge>
              )}
            </div>
          </div>
        </DropdownMenuLabel>

        {/* SPPG Info */}
        {user.sppgName && (
          <>
            <DropdownMenuSeparator />
            <div className="px-2 py-1.5">
              <div className="flex items-center space-x-2 text-sm">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">SPPG:</span>
              </div>
              <div className="text-sm font-medium mt-1">{user.sppgName}</div>
              {user.sppgCode && (
                <div className="text-xs text-muted-foreground">{user.sppgCode}</div>
              )}
            </div>
          </>
        )}

        <DropdownMenuSeparator />

        {/* Menu Items */}
        <DropdownMenuItem onClick={() => router.push('/profile')}>
          <User className="mr-2 h-4 w-4" />
          <span>Profil Saya</span>
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => router.push('/settings')}>
          <Settings className="mr-2 h-4 w-4" />
          <span>Pengaturan</span>
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => router.push('/change-password')}>
          <Shield className="mr-2 h-4 w-4" />
          <span>Ubah Password</span>
        </DropdownMenuItem>

        {/* Quick Actions - Role-based */}
        {(user.userRole.startsWith('PLATFORM_') || user.userRole === 'SPPG_KEPALA') && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
              Quick Actions
            </DropdownMenuLabel>
            
            {/* Platform Admin Dashboard */}
            {user.userRole.startsWith('PLATFORM_') && (
              <DropdownMenuItem onClick={() => router.push('/admin')}>
                <Crown className="mr-2 h-4 w-4" />
                <span>Platform Admin</span>
              </DropdownMenuItem>
            )}

            {/* System Analytics */}
            {(user.userRole.startsWith('PLATFORM_') || user.userRole === 'SPPG_KEPALA') && (
              <DropdownMenuItem onClick={() => router.push('/reports')}>
                <BarChart3 className="mr-2 h-4 w-4" />
                <span>Analytics & Reports</span>
              </DropdownMenuItem>
            )}

            {/* User Management */}
            {(user.userRole.startsWith('PLATFORM_') || user.userRole === 'SPPG_KEPALA' || user.userRole === 'SPPG_ADMIN') && (
              <DropdownMenuItem onClick={() => router.push('/hrd')}>
                <Users className="mr-2 h-4 w-4" />
                <span>User Management</span>
              </DropdownMenuItem>
            )}
          </>
        )}

        <DropdownMenuSeparator />

        {/* Logout */}
        <DropdownMenuItem onClick={handleLogout} className="text-red-600">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Keluar</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}