'use client'

import { type FC } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Plus,
  Calendar,
  TrendingUp,
  DollarSign,
  CheckCircle2,
  Clock,
  AlertCircle,
} from 'lucide-react'

// ============================================================================
// Types & Interfaces
// ============================================================================

interface MenuPlan {
  id: string
  planName: string
  startDate: Date
  endDate: Date
  status: 'DRAFT' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED'
  assignmentsCount: number
  budgetUsed?: number | null
  budgetConstraint?: number | null
}

interface PlanMetrics {
  totalPlans: number
  activePlans: number
  completedPlans: number
  totalAssignments: number
  averageNutritionScore?: number
  totalBudgetUsed?: number
}

interface PlanningDashboardProps {
  plans: MenuPlan[]
  metrics: PlanMetrics
  isLoading?: boolean
  onCreatePlan: () => void
  onViewCalendar: () => void
}

// ============================================================================
// Helper Functions
// ============================================================================

function formatPrice(price: number | null | undefined): string {
  if (!price) return 'Rp 0'
  return `Rp ${price.toLocaleString('id-ID')}`
}

function getStatusConfig(status: MenuPlan['status']): {
  label: string
  variant: 'default' | 'secondary' | 'destructive' | 'outline'
  color: string
} {
  switch (status) {
    case 'ACTIVE':
      return { label: 'Aktif', variant: 'default', color: 'text-green-600' }
    case 'DRAFT':
      return { label: 'Draft', variant: 'secondary', color: 'text-gray-600' }
    case 'COMPLETED':
      return { label: 'Selesai', variant: 'outline', color: 'text-blue-600' }
    case 'CANCELLED':
      return { label: 'Dibatalkan', variant: 'destructive', color: 'text-red-600' }
  }
}

// ============================================================================
// Loading Skeleton
// ============================================================================

function PlanningDashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-64" />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Plans List */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

// ============================================================================
// Main Component
// ============================================================================

export const PlanningDashboard: FC<PlanningDashboardProps> = ({
  plans,
  metrics,
  isLoading = false,
  onCreatePlan,
  onViewCalendar,
}) => {
  // Loading state
  if (isLoading) {
    return <PlanningDashboardSkeleton />
  }

  // Get recent plans (last 5)
  const recentPlans = plans.slice(0, 5)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Perencanaan Menu</h2>
          <p className="text-muted-foreground">
            Kelola rencana menu dan jadwal distribusi
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={onViewCalendar}>
            <Calendar className="mr-2 h-4 w-4" />
            Lihat Kalender
          </Button>
          <Button onClick={onCreatePlan}>
            <Plus className="mr-2 h-4 w-4" />
            Buat Rencana
          </Button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Plans */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Rencana</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalPlans}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.activePlans} aktif
            </p>
          </CardContent>
        </Card>

        {/* Total Assignments */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Penugasan Menu
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalAssignments}</div>
            <p className="text-xs text-muted-foreground">
              Menu yang dijadwalkan
            </p>
          </CardContent>
        </Card>

        {/* Nutrition Score */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Skor Gizi</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.averageNutritionScore
                ? `${metrics.averageNutritionScore.toFixed(1)}%`
                : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              Rata-rata keseimbangan
            </p>
          </CardContent>
        </Card>

        {/* Budget Used */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Anggaran</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatPrice(metrics.totalBudgetUsed)}
            </div>
            <p className="text-xs text-muted-foreground">Total terpakai</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Plans */}
      <Card>
        <CardHeader>
          <CardTitle>Rencana Terbaru</CardTitle>
        </CardHeader>
        <CardContent>
          {recentPlans.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Calendar className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                Belum ada rencana menu
              </h3>
              <p className="text-sm text-muted-foreground mb-6 max-w-sm">
                Buat rencana menu pertama untuk mulai menjadwalkan distribusi
                makanan
              </p>
              <Button onClick={onCreatePlan}>
                <Plus className="mr-2 h-4 w-4" />
                Buat Rencana Pertama
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {recentPlans.map((plan) => {
                const statusConfig = getStatusConfig(plan.status)
                const budgetPercentage = plan.budgetConstraint
                  ? ((plan.budgetUsed || 0) / plan.budgetConstraint) * 100
                  : 0

                return (
                  <Link
                    key={plan.id}
                    href={`/menu/plans/${plan.id}`}
                    className="block"
                  >
                    <div className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold truncate">
                            {plan.planName}
                          </h4>
                          <Badge variant={statusConfig.variant}>
                            {statusConfig.label}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>
                              {new Date(plan.startDate).toLocaleDateString(
                                'id-ID',
                                { day: 'numeric', month: 'short' }
                              )}{' '}
                              -{' '}
                              {new Date(plan.endDate).toLocaleDateString(
                                'id-ID',
                                { day: 'numeric', month: 'short', year: 'numeric' }
                              )}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            <span>{plan.assignmentsCount} menu</span>
                          </div>
                          {plan.budgetConstraint && (
                            <div className="flex items-center gap-1">
                              <DollarSign className="h-3 w-3" />
                              <span>
                                {budgetPercentage.toFixed(0)}% terpakai
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      {plan.status === 'ACTIVE' && (
                        <Badge variant="secondary" className="ml-4">
                          <Clock className="mr-1 h-3 w-3" />
                          Berjalan
                        </Badge>
                      )}
                      {plan.status === 'DRAFT' && (
                        <Badge variant="outline" className="ml-4">
                          <AlertCircle className="mr-1 h-3 w-3" />
                          Perlu Dilengkapi
                        </Badge>
                      )}
                    </div>
                  </Link>
                )
              })}

              {/* View All Link */}
              {plans.length > 5 && (
                <Link href="/menu/plans">
                  <Button variant="ghost" className="w-full">
                    Lihat Semua Rencana ({plans.length})
                  </Button>
                </Link>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={onCreatePlan}>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="rounded-full bg-primary/10 p-3">
              <Plus className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">Buat Rencana Baru</h3>
              <p className="text-sm text-muted-foreground">
                Mulai rencana menu untuk periode baru
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={onViewCalendar}>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="rounded-full bg-blue-500/10 p-3">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold">Lihat Kalender</h3>
              <p className="text-sm text-muted-foreground">
                Kelola jadwal menu harian
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
