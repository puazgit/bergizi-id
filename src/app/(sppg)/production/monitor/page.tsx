// Production Monitoring Dashboard Page
// Bergizi-ID SaaS Platform - Phase 9B Production Dashboard

import { Suspense } from 'react'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { hasPermission } from '@/lib/permissions'
import { ProductionMonitoringDashboard } from '@/components/sppg/production/components'
import { Card, CardContent } from '@/components/ui/card'

// ============= LOADING COMPONENT =============

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div className="h-8 bg-muted animate-pulse rounded w-64" />
        <div className="h-6 bg-muted animate-pulse rounded w-20" />
      </div>

      {/* Metrics Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
                <div className="h-8 bg-muted animate-pulse rounded w-1/2" />
                <div className="h-3 bg-muted animate-pulse rounded w-2/3" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Content Skeleton */}
      <div className="space-y-4">
        <div className="h-10 bg-muted animate-pulse rounded" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <div className="h-6 bg-muted animate-pulse rounded w-3/4" />
                  <div className="h-2 bg-muted animate-pulse rounded" />
                  <div className="flex justify-between">
                    <div className="h-4 bg-muted animate-pulse rounded w-1/4" />
                    <div className="h-4 bg-muted animate-pulse rounded w-1/4" />
                  </div>
                  <div className="flex gap-2">
                    <div className="h-8 bg-muted animate-pulse rounded flex-1" />
                    <div className="h-8 bg-muted animate-pulse rounded w-16" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

// ============= ERROR FALLBACK =============

// Error fallback component for production dashboard
// Currently not used but ready for error boundary implementation

// ============= MAIN PAGE COMPONENT =============

export default async function ProductionMonitoringPage() {
  // Authentication check
  const session = await auth()
  
  if (!session?.user) {
    redirect('/login')
  }

  // Permission check
  if (!hasPermission(session.user.userRole, 'PRODUCTION_MANAGE') && 
      !hasPermission(session.user.userRole, 'READ')) {
    redirect('/dashboard')
  }

  // SPPG check
  if (!session.user.sppgId) {
    redirect('/dashboard')
  }

  return (
    <div className="container mx-auto py-6">
      <Suspense fallback={<DashboardSkeleton />}>
        <ProductionMonitoringDashboard />
      </Suspense>
    </div>
  )
}