'use client'

import { type FC } from 'react'
import { format } from 'date-fns'
import { id as idLocale } from 'date-fns/locale'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import {
  Calendar,
  Clock,
  DollarSign,
  TrendingUp,
  Award,
  Download,
  Edit,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Star,
} from 'lucide-react'

// ============================================================================
// Types & Interfaces
// ============================================================================

interface MenuPlan {
  id: string
  planName: string
  description?: string | null
  startDate: Date
  endDate: Date
  status: 'DRAFT' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED'
  budgetConstraint?: number | null
  budgetUsed?: number | null
  assignmentsCount: number
  createdAt: Date
  program: {
    name: string
    targetGroup: string
  }
}

interface PlanMetrics {
  nutritionScore: number
  varietyScore: number
  costEfficiency: number
  complianceRate: number
}

interface PlanDetailProps {
  plan: MenuPlan
  metrics: PlanMetrics
  onEdit?: () => void
  onDelete?: () => void
  onExportPDF?: () => void
  onExportExcel?: () => void
  showActions?: boolean
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
  icon: React.ReactNode
} {
  switch (status) {
    case 'ACTIVE':
      return {
        label: 'Aktif',
        variant: 'default',
        icon: <CheckCircle2 className="h-4 w-4" />,
      }
    case 'DRAFT':
      return {
        label: 'Draft',
        variant: 'secondary',
        icon: <Edit className="h-4 w-4" />,
      }
    case 'COMPLETED':
      return {
        label: 'Selesai',
        variant: 'outline',
        icon: <Award className="h-4 w-4" />,
      }
    case 'CANCELLED':
      return {
        label: 'Dibatalkan',
        variant: 'destructive',
        icon: <AlertCircle className="h-4 w-4" />,
      }
  }
}

function getScoreColor(score: number): string {
  if (score >= 80) return 'text-green-600 dark:text-green-400'
  if (score >= 60) return 'text-yellow-600 dark:text-yellow-400'
  return 'text-red-600 dark:text-red-400'
}

function getScoreLabel(score: number): string {
  if (score >= 90) return 'Sangat Baik'
  if (score >= 80) return 'Baik'
  if (score >= 70) return 'Cukup Baik'
  if (score >= 60) return 'Cukup'
  return 'Perlu Perbaikan'
}

function calculateDuration(startDate: Date, endDate: Date): number {
  const diffTime = Math.abs(endDate.getTime() - startDate.getTime())
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
}

// ============================================================================
// Main Component
// ============================================================================

export const PlanDetail: FC<PlanDetailProps> = ({
  plan,
  metrics,
  onEdit,
  onDelete,
  onExportPDF,
  onExportExcel,
  showActions = true,
}) => {
  const statusConfig = getStatusConfig(plan.status)
  const duration = calculateDuration(plan.startDate, plan.endDate)
  const budgetPercentage = plan.budgetConstraint
    ? ((plan.budgetUsed || 0) / plan.budgetConstraint) * 100
    : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">
              {plan.planName}
            </h1>
            <Badge variant={statusConfig.variant} className="gap-1">
              {statusConfig.icon}
              {statusConfig.label}
            </Badge>
          </div>
          {plan.description && (
            <p className="text-muted-foreground">{plan.description}</p>
          )}
        </div>

        {showActions && (
          <div className="flex items-center gap-2">
            {onExportPDF && (
              <Button variant="outline" size="sm" onClick={onExportPDF}>
                <Download className="mr-2 h-4 w-4" />
                PDF
              </Button>
            )}
            {onExportExcel && (
              <Button variant="outline" size="sm" onClick={onExportExcel}>
                <Download className="mr-2 h-4 w-4" />
                Excel
              </Button>
            )}
            {onEdit && plan.status === 'DRAFT' && (
              <Button variant="outline" size="sm" onClick={onEdit}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
            )}
            {onDelete && (
              <Button
                variant="outline"
                size="sm"
                onClick={onDelete}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Hapus
              </Button>
            )}
          </div>
        )}
      </div>

      <Separator />

      {/* Plan Information */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Informasi Rencana</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Program</span>
              <div className="text-right">
                <p className="font-medium">{plan.program.name}</p>
                <p className="text-xs text-muted-foreground">
                  {plan.program.targetGroup}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Periode
              </span>
              <div className="text-right">
                <p className="font-medium">
                  {format(plan.startDate, 'dd MMM yyyy', { locale: idLocale })}
                  {' - '}
                  {format(plan.endDate, 'dd MMM yyyy', { locale: idLocale })}
                </p>
                <p className="text-xs text-muted-foreground">
                  {duration} hari
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" />
                Penugasan
              </span>
              <span className="font-medium">{plan.assignmentsCount} menu</span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Dibuat
              </span>
              <span className="font-medium">
                {format(plan.createdAt, 'dd MMM yyyy', { locale: idLocale })}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Anggaran</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {plan.budgetConstraint ? (
              <>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Batasan</span>
                  <span className="font-medium">
                    {formatPrice(plan.budgetConstraint)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Terpakai</span>
                  <span className="font-medium">
                    {formatPrice(plan.budgetUsed)}
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Persentase</span>
                    <span className="font-medium">
                      {budgetPercentage.toFixed(1)}%
                    </span>
                  </div>
                  <Progress
                    value={budgetPercentage}
                    className={
                      budgetPercentage > 100
                        ? '[&>div]:bg-destructive'
                        : budgetPercentage > 90
                        ? '[&>div]:bg-yellow-500'
                        : ''
                    }
                  />
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Sisa</span>
                  <span
                    className={`font-medium ${
                      (plan.budgetConstraint - (plan.budgetUsed || 0)) < 0
                        ? 'text-destructive'
                        : 'text-green-600 dark:text-green-400'
                    }`}
                  >
                    {formatPrice(
                      plan.budgetConstraint - (plan.budgetUsed || 0)
                    )}
                  </span>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-4 text-center">
                <DollarSign className="h-8 w-8 text-muted-foreground/50 mb-2" />
                <p className="text-sm text-muted-foreground">
                  Tidak ada batasan anggaran
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* BI Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Metrik Kinerja
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {/* Nutrition Score */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Skor Gizi</span>
                <Star className="h-4 w-4 text-yellow-500" />
              </div>
              <div className={`text-3xl font-bold ${getScoreColor(metrics.nutritionScore)}`}>
                {metrics.nutritionScore.toFixed(0)}%
              </div>
              <Progress value={metrics.nutritionScore} />
              <p className="text-xs text-muted-foreground">
                {getScoreLabel(metrics.nutritionScore)}
              </p>
            </div>

            {/* Variety Score */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Variasi Menu
                </span>
                <Star className="h-4 w-4 text-purple-500" />
              </div>
              <div className={`text-3xl font-bold ${getScoreColor(metrics.varietyScore)}`}>
                {metrics.varietyScore.toFixed(0)}%
              </div>
              <Progress value={metrics.varietyScore} />
              <p className="text-xs text-muted-foreground">
                {getScoreLabel(metrics.varietyScore)}
              </p>
            </div>

            {/* Cost Efficiency */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Efisiensi Biaya
                </span>
                <DollarSign className="h-4 w-4 text-green-500" />
              </div>
              <div className={`text-3xl font-bold ${getScoreColor(metrics.costEfficiency)}`}>
                {metrics.costEfficiency.toFixed(0)}%
              </div>
              <Progress value={metrics.costEfficiency} />
              <p className="text-xs text-muted-foreground">
                {getScoreLabel(metrics.costEfficiency)}
              </p>
            </div>

            {/* Compliance Rate */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Kepatuhan
                </span>
                <CheckCircle2 className="h-4 w-4 text-blue-500" />
              </div>
              <div className={`text-3xl font-bold ${getScoreColor(metrics.complianceRate)}`}>
                {metrics.complianceRate.toFixed(0)}%
              </div>
              <Progress value={metrics.complianceRate} />
              <p className="text-xs text-muted-foreground">
                {getScoreLabel(metrics.complianceRate)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
