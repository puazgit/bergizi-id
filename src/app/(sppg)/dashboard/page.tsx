/**
 * SPPG Dashboard Page - Enterprise Grade
 * Pattern 2 Architecture - Main dashboard page implementation
 * Real-time WebSocket + Redis Integration
 */

import { Suspense } from 'react'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { Activity } from 'lucide-react'
import { EnterpriseDashboardClient } from '@/components/sppg/dashboard/components/DashboardClient'

// Loading component
function DashboardLoading() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <Activity className="h-12 w-12 animate-spin text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">Loading enterprise dashboard...</p>
      </div>
    </div>
  )
}

// Server Component for Authentication & Initial Setup
export default async function DashboardPage() {
  const session = await auth()
  
  // Redirect if not authenticated
  if (!session?.user?.sppgId) {
    redirect('/login')
  }

  // Verify SPPG access
  if (!session.user.userRole?.startsWith('SPPG_')) {
    redirect('/access-denied')
  }

  // Enterprise-grade serialization-safe props
  const enterpriseProps = {
    sppgId: String(session.user.sppgId),
    userName: String(session.user.name || 'User'),
    userRole: String(session.user.userRole),
    isDemoAccount: Boolean(session.user.isDemoAccount)
  }

  return (
    <div className="container mx-auto p-4 lg:p-6 space-y-6">
      <Suspense fallback={<DashboardLoading />}>
        <EnterpriseDashboardClient {...enterpriseProps} />
      </Suspense>
    </div>
  )
}