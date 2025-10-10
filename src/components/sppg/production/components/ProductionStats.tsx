// Production Stats Component - Pattern 2 Component-Level Implementation
// src/components/sppg/production/components/ProductionStats.tsx

'use client'

import { TrendingUp, TrendingDown, Activity, CheckCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import type { ProductionStats as ProductionStatsType } from '../types'

interface ProductionStatsProps {
  stats: ProductionStatsType | null
  loading?: boolean
}

export function ProductionStats({ stats, loading = false }: ProductionStatsProps) {
  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 bg-muted rounded w-20"></div>
              <div className="h-4 w-4 bg-muted rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded w-16 mb-2"></div>
              <div className="h-3 bg-muted rounded w-24"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!stats) {
    return (
      <Card className="col-span-full">
        <CardContent className="py-8 text-center">
          <Activity className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Statistik produksi tidak tersedia</p>
        </CardContent>
      </Card>
    )
  }

  // Calculate percentages and trends
  const completionRate = stats.total > 0 ? (stats.completed / stats.total) * 100 : 0
  const qualityRate = stats.qualityPassRate || 0
  const activeProductions = stats.preparing + stats.cooking + stats.qualityCheck
  const todayVsMonthly = stats.monthlyProductions > 0 ? (stats.todayProductions / stats.monthlyProductions) * 100 : 0

  const statCards = [
    {
      title: 'Total Produksi',
      value: stats.total.toLocaleString(),
      description: `${stats.todayProductions} hari ini`,
      icon: Activity,
      trend: todayVsMonthly > 3.2 ? 'up' : todayVsMonthly < 3.2 ? 'down' : 'neutral', // 3.2% = 1/31 days average
      color: 'blue'
    },
    {
      title: 'Sedang Aktif',
      value: activeProductions.toLocaleString(),
      description: `${stats.cooking} sedang memasak`,
      icon: TrendingUp,
      trend: activeProductions > 0 ? 'up' : 'neutral',
      color: 'orange'
    },
    {
      title: 'Tingkat Selesai',
      value: `${completionRate.toFixed(1)}%`,
      description: `${stats.completed} dari ${stats.total}`,
      icon: CheckCircle,
      trend: completionRate >= 80 ? 'up' : completionRate <= 60 ? 'down' : 'neutral',
      color: 'green'
    },
    {
      title: 'Kualitas',
      value: `${qualityRate.toFixed(1)}%`,
      description: 'Tingkat lolos QC',
      icon: CheckCircle,
      trend: qualityRate >= 90 ? 'up' : qualityRate <= 70 ? 'down' : 'neutral',
      color: 'purple'
    }
  ]

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />
      default:
        return <Activity className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'text-blue-600 dark:text-blue-400',
      orange: 'text-orange-600 dark:text-orange-400',
      green: 'text-green-600 dark:text-green-400',
      purple: 'text-purple-600 dark:text-purple-400'
    }
    return colors[color as keyof typeof colors] || 'text-muted-foreground'
  }

  return (
    <div className="space-y-6">
      {/* Main Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={index} className="transition-all duration-200 hover:shadow-lg dark:hover:shadow-xl dark:hover:shadow-primary/5">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <Icon className={cn('h-4 w-4', getColorClasses(stat.color))} />
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-foreground">
                      {stat.value}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {stat.description}
                    </p>
                  </div>
                  <div className="flex items-center">
                    {getTrendIcon(stat.trend)}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Detailed Breakdown */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Production Status Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-foreground">
              Status Produksi
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300">
                    Direncanakan
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {stats.planned}
                  </span>
                </div>
                <Progress 
                  value={stats.total > 0 ? (stats.planned / stats.total) * 100 : 0} 
                  className="w-20" 
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300">
                    Persiapan
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {stats.preparing}
                  </span>
                </div>
                <Progress 
                  value={stats.total > 0 ? (stats.preparing / stats.total) * 100 : 0} 
                  className="w-20" 
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300">
                    Memasak
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {stats.cooking}
                  </span>
                </div>
                <Progress 
                  value={stats.total > 0 ? (stats.cooking / stats.total) * 100 : 0} 
                  className="w-20" 
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300">
                    QC
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {stats.qualityCheck}
                  </span>
                </div>
                <Progress 
                  value={stats.total > 0 ? (stats.qualityCheck / stats.total) * 100 : 0} 
                  className="w-20" 
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">
                    Selesai
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {stats.completed}
                  </span>
                </div>
                <Progress 
                  value={stats.total > 0 ? (stats.completed / stats.total) * 100 : 0} 
                  className="w-20" 
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quality & Cost Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-foreground">
              Metrik Kualitas & Biaya
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Biaya per Porsi</span>
                <span className="font-semibold text-foreground">
                  Rp {stats.averageCostPerPortion.toLocaleString()}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Skor Kebersihan</span>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-foreground">
                    {stats.averageHygieneScore.toFixed(1)}/100
                  </span>
                  <Progress 
                    value={stats.averageHygieneScore} 
                    className="w-16" 
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Limbah</span>
                <span className="font-semibold text-foreground">
                  {stats.totalWasteKg.toFixed(1)} kg
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Produksi Bulan Ini</span>
                <span className="font-semibold text-foreground">
                  {stats.monthlyProductions}
                </span>
              </div>

              {stats.cancelled > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Dibatalkan</span>
                  <Badge variant="destructive" className="text-xs">
                    {stats.cancelled}
                  </Badge>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}