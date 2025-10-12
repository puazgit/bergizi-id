'use client'

import { type FC } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { 
  Users, 
  Calendar, 
  Target, 
  TrendingUp,
  ChefHat,
  DollarSign
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface ProgramDashboardProps {
  program: {
    id: string
    programName: string
    description: string | null
    status: string
    startDate: Date
    endDate: Date
    targetAge: string
    _count: {
      menus: number
      beneficiaries: number
    }
    stats: {
      totalBudget: number
      usedBudget: number
      completionRate: number
      averageCost: number
    }
  }
  className?: string
}

export const ProgramDashboard: FC<ProgramDashboardProps> = ({ 
  program, 
  className 
}) => {
  const budgetUsagePercentage = (program.stats.usedBudget / program.stats.totalBudget) * 100

  return (
    <div className={cn('space-y-6', className)}>
      {/* Program Header */}
      <Card className="border-primary/20 dark:border-primary/30">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="text-2xl font-bold text-foreground">
                {program.programName}
              </CardTitle>
              <CardDescription className="text-base">
                {program.description}
              </CardDescription>
            </div>
            <Badge 
              variant={program.status === 'ACTIVE' ? 'default' : 'secondary'}
              className="text-sm"
            >
              {program.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>
                {new Date(program.startDate).toLocaleDateString('id-ID')} - 
                {new Date(program.endDate).toLocaleDateString('id-ID')}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              <span>{program.targetAge}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Menu Count */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Menu</CardTitle>
            <ChefHat className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {program._count.menus}
            </div>
            <p className="text-xs text-muted-foreground">
              Menu tersedia
            </p>
          </CardContent>
        </Card>

        {/* Beneficiaries */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Penerima Manfaat</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {program._count.beneficiaries.toLocaleString('id-ID')}
            </div>
            <p className="text-xs text-muted-foreground">
              Total siswa
            </p>
          </CardContent>
        </Card>

        {/* Budget Usage */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Penggunaan Anggaran</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {budgetUsagePercentage.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Rp {program.stats.usedBudget.toLocaleString('id-ID')} / 
              Rp {program.stats.totalBudget.toLocaleString('id-ID')}
            </p>
            <Progress 
              value={budgetUsagePercentage} 
              className="mt-2 h-2"
            />
          </CardContent>
        </Card>

        {/* Completion Rate */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tingkat Penyelesaian</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {program.stats.completionRate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Program selesai
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Budget Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Rincian Anggaran</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Total Anggaran</span>
              <span className="font-semibold">
                Rp {program.stats.totalBudget.toLocaleString('id-ID')}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Anggaran Terpakai</span>
              <span className="font-semibold text-orange-600 dark:text-orange-400">
                Rp {program.stats.usedBudget.toLocaleString('id-ID')}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Sisa Anggaran</span>
              <span className="font-semibold text-green-600 dark:text-green-400">
                Rp {(program.stats.totalBudget - program.stats.usedBudget).toLocaleString('id-ID')}
              </span>
            </div>
            <div className="pt-2 border-t">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Rata-rata Biaya per Porsi</span>
                <span className="font-bold text-primary">
                  Rp {program.stats.averageCost.toLocaleString('id-ID')}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}