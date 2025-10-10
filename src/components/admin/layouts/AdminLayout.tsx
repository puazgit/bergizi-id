// Platform Admin Layout Component - Using New Modular System
// Bergizi-ID SaaS Platform - Enterprise Multi-tenant Layout

'use client'

import React from 'react'
import { BaseLayout } from '@/components/shared/layouts/BaseLayout'
import { LayoutUser } from '@/types/layout'
import { adminLayoutConfig } from '@/config/layouts/admin-layout'
import { useSession } from 'next-auth/react'

interface AdminLayoutProps {
  children: React.ReactNode
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const { data: session } = useSession()

  // Convert session user to LayoutUser format
  const layoutUser: LayoutUser | null = session?.user ? {
    id: session.user.id || '',
    name: session.user.name || null,
    email: session.user.email || '',
    image: session.user.image || null,
    userRole: session.user.userRole || '',
    userType: session.user.userType || '',
    sppgId: session.user.sppgId || null,
    sppgName: 'Platform Admin', // Override for admin users
    sppgCode: null,
    isDemoAccount: false
  } : null

  return (
    <BaseLayout 
      user={layoutUser}
      config={adminLayoutConfig}
    >
      {children}
    </BaseLayout>
  )
}