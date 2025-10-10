// SPPG Layout Component - Using New Modular System
// Bergizi-ID SaaS Platform - Enterprise Multi-tenant Layout

'use client'

import React from 'react'
import { BaseLayout } from '@/components/shared/layouts/BaseLayout'
import { LayoutUser } from '@/types/layout'
import { sppgLayoutConfig, demoSppgLayoutConfig } from '@/config/layouts/sppg-layout'
import { useSession } from 'next-auth/react'

interface SppgLayoutProps {
  children: React.ReactNode
}

export function SppgLayout({ children }: SppgLayoutProps) {
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
    sppgName: session.user.sppgName || null,
    sppgCode: session.user.sppgCode || null,
    isDemoAccount: session.user.isDemoAccount || false
  } : null

  // Use demo config for demo users
  const config = layoutUser?.isDemoAccount ? demoSppgLayoutConfig : sppgLayoutConfig

  return (
    <BaseLayout 
      user={layoutUser}
      config={config}
    >
      {children}
    </BaseLayout>
  )
}