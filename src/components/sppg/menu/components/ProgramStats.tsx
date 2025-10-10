// Program Statistics Component - Pattern 2 Architecture
// Bergizi-ID SaaS Platform - SPPG Program Management
// src/components/sppg/menu/components/ProgramStats.tsx

'use client'

import { type FC } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Users, 
  DollarSign, 
  Activity,
  Target,
  CheckCircle,
  Loader2
} from 'lucide-react'
import { useProgramStats } from '../hooks'
import { cn } from '@/lib/utils'

interface ProgramStatsProps {
  className?: string
}

export const ProgramStats: FC<ProgramStatsProps> = ({ className }) => {
  const { stats, isLoading } = useProgramStats()

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  if (!stats) {
    return null
  }

  return (
    <div className={cn('grid gap-4 md:grid-cols-2 lg:grid-cols-4', className)}>
      {/* Total Programs */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total Program
          </CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalPrograms}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {stats.activePrograms} aktif, {stats.completedPrograms} selesai
          </p>
        </CardContent>
      </Card>

      {/* Active Programs */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Program Aktif
          </CardTitle>
          <CheckCircle className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            {stats.activePrograms}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {stats.totalPrograms > 0 
              ? `${Math.round((stats.activePrograms / stats.totalPrograms) * 100)}% dari total`
              : 'Belum ada program'
            }
          </p>
        </CardContent>
      </Card>

      {/* Total Recipients */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total Penerima
          </CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalRecipients.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Rata-rata {Math.round(stats.averageRecipients).toLocaleString()} per program
          </p>
        </CardContent>
      </Card>

      {/* Total Budget */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total Anggaran
          </CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            Rp {(stats.totalBudget / 1000000).toFixed(1)}jt
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Utilisasi {stats.budgetUtilization.toFixed(1)}%
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

// Program Distribution by Type Component
export const ProgramTypeDistribution: FC<{ className?: string }> = ({ className }) => {
  const { stats, isLoading } = useProgramStats()

  if (isLoading || !stats) {
    return null
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-base">Distribusi Program per Tipe</CardTitle>
        <CardDescription>Jumlah program dan penerima berdasarkan tipe</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {stats.programsByType.map((item) => {
            const percentage = stats.totalPrograms > 0
              ? (item.count / stats.totalPrograms) * 100
              : 0

            return (
              <div key={item.type} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{getProgramTypeLabel(item.type)}</Badge>
                    <span className="text-muted-foreground">
                      {item.count} program • {item.recipients.toLocaleString()} penerima
                    </span>
                  </div>
                  <span className="font-medium">{percentage.toFixed(0)}%</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

// Program Distribution by Target Group Component
export const ProgramTargetDistribution: FC<{ className?: string }> = ({ className }) => {
  const { stats, isLoading } = useProgramStats()

  if (isLoading || !stats) {
    return null
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-base">Distribusi Program per Target</CardTitle>
        <CardDescription>Jumlah program dan penerima berdasarkan kelompok target</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {stats.programsByTarget.map((item) => {
            const percentage = stats.totalPrograms > 0
              ? (item.count / stats.totalPrograms) * 100
              : 0

            return (
              <div key={item.target} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-muted-foreground" />
                    <Badge variant="secondary">{getTargetGroupLabel(item.target)}</Badge>
                    <span className="text-muted-foreground">
                      {item.count} program • {item.recipients.toLocaleString()} penerima
                    </span>
                  </div>
                  <span className="font-medium">{percentage.toFixed(0)}%</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

// Comprehensive Program Dashboard
export const ProgramDashboard: FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={cn('space-y-6', className)}>
      {/* Main Stats */}
      <ProgramStats />

      {/* Distributions */}
      <div className="grid gap-6 md:grid-cols-2">
        <ProgramTypeDistribution />
        <ProgramTargetDistribution />
      </div>
    </div>
  )
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getProgramTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    PMT_PEMULIHAN: 'PMT Pemulihan',
    PMT_PENYULUHAN: 'PMT Penyuluhan',
    MAKAN_SIANG: 'Makan Siang',
    SARAPAN_SEHAT: 'Sarapan Sehat',
    SUSU_BUBUK: 'Susu Bubuk',
    SNACK_SEHAT: 'Snack Sehat'
  }
  return labels[type] || type
}

function getTargetGroupLabel(target: string): string {
  const labels: Record<string, string> = {
    BALITA_0_2: 'Balita 0-2 tahun',
    BALITA_2_5: 'Balita 2-5 tahun',
    ANAK_SD: 'Anak SD',
    ANAK_SMP: 'Anak SMP',
    REMAJA: 'Remaja',
    IBU_HAMIL: 'Ibu Hamil',
    IBU_MENYUSUI: 'Ibu Menyusui',
    LANSIA: 'Lansia'
  }
  return labels[target] || target
}
