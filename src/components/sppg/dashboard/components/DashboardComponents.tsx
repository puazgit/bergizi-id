/**
 * SPPG Dashboard Components - Enterprise Grade
 * Pattern 2 Architecture - Domain-specific components
 */

'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Users, 
  DollarSign, 
  Activity, 
  CheckCircle,
  Clock,
  BarChart3,
  PieChart,
  LineChart,
  RefreshCw,
  Calendar,
  Filter,
  Download
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  DashboardCardProps,
  DashboardChartProps,
  TrendData,
  DashboardMetrics
} from '../types'
import { formatNumber } from '../utils'

// Dashboard Card Component
export const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  value,
  subtitle,
  trend,
  icon: Icon,
  className,
  onClick
}) => {
  const getTrendIcon = (trendData?: TrendData) => {
    if (!trendData) return null
    
    switch (trendData.trend) {
      case 'UP':
        return <TrendingUp className="h-4 w-4 text-green-500" />
      case 'DOWN':
        return <TrendingDown className="h-4 w-4 text-red-500" />
      default:
        return <Minus className="h-4 w-4 text-gray-500" />
    }
  }

  const getTrendColor = (trendData?: TrendData) => {
    if (!trendData) return 'text-muted-foreground'
    
    switch (trendData.trend) {
      case 'UP':
        return 'text-green-600 dark:text-green-400'
      case 'DOWN':
        return 'text-red-600 dark:text-red-400'
      default:
        return 'text-muted-foreground'
    }
  }

  return (
    <Card 
      className={cn(
        'transition-all duration-200 hover:shadow-lg dark:hover:shadow-xl',
        onClick && 'cursor-pointer hover:scale-105',
        className
      )}
      onClick={onClick}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-foreground">
          {typeof value === 'number' ? formatNumber(value) : value}
        </div>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-1">
            {subtitle}
          </p>
        )}
        {trend && (
          <div className={cn("flex items-center text-xs mt-2", getTrendColor(trend))}>
            {getTrendIcon(trend)}
            <span className="ml-1">
              {trend.changePercentage > 0 ? '+' : ''}{trend.changePercentage.toFixed(1)}%
            </span>
            <span className="ml-1 text-muted-foreground">from last period</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Dashboard Chart Component
export const DashboardChart: React.FC<DashboardChartProps> = ({
  title,
  data,  
  type,
  height = 300,
  className,
  showLegend = true,
  colors = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444']
}) => {
  const getChartIcon = () => {
    switch (type) {
      case 'line':
        return <LineChart className="h-4 w-4" />
      case 'bar':
        return <BarChart3 className="h-4 w-4" />
      case 'pie':
      case 'donut':
        return <PieChart className="h-4 w-4" />
      default:
        return <Activity className="h-4 w-4" />
    }
  }

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          {getChartIcon()}
          {title}
        </CardTitle>
        {showLegend && (
          <div className="flex items-center gap-2">
            {colors.slice(0, 3).map((color, index) => (
              <div key={index} className="flex items-center gap-1">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: color }}
                />
                <span className="text-xs text-muted-foreground">
                  Series {index + 1}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div 
          className="flex items-center justify-center bg-muted/30 rounded-lg"
          style={{ height }}
        >
          <div className="text-center">
            <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground">
              Chart visualization coming soon
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {data.length} data points • {type} chart
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Dashboard Metrics Summary Component
export const DashboardMetricsSummary: React.FC<{ metrics: DashboardMetrics }> = ({ 
  metrics 
}) => {
  const summaryCards = [
    {
      title: 'Total Beneficiaries',
      value: metrics.totalBeneficiaries,
      icon: Users,
      trend: {
        current: metrics.totalBeneficiaries,
        previous: Math.round(metrics.totalBeneficiaries * 0.95),
        change: Math.round(metrics.totalBeneficiaries * 0.05),
        changePercentage: metrics.beneficiaryGrowthRate,
        trend: metrics.beneficiaryGrowthRate >= 0 ? 'UP' as const : 'DOWN' as const
      }
    },
    {
      title: 'Budget Utilization',
      value: `${metrics.budgetUtilization.toFixed(1)}%`,
      icon: DollarSign,
      trend: {
        current: metrics.budgetUtilization,
        previous: Math.round(metrics.budgetUtilization * 0.98),
        change: Math.round(metrics.budgetUtilization * 0.02),
        changePercentage: 2,
        trend: 'UP' as const
      }
    },
    {
      title: 'Operational Efficiency',
      value: `${metrics.productionEfficiency.toFixed(1)}%`,
      icon: Activity,
      trend: {
        current: metrics.productionEfficiency,
        previous: Math.round(metrics.productionEfficiency * 0.96),
        change: Math.round(metrics.productionEfficiency * 0.04),
        changePercentage: 4,
        trend: 'UP' as const
      }
    },
    {
      title: 'Quality Score',
      value: `${metrics.qualityScore.toFixed(1)}%`,
      icon: CheckCircle,
      trend: {
        current: metrics.qualityScore,
        previous: Math.round(metrics.qualityScore * 0.97),
        change: Math.round(metrics.qualityScore * 0.03),
        changePercentage: 3,
        trend: 'UP' as const
      }
    }
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {summaryCards.map((card, index) => (
        <DashboardCard
          key={index}
          title={card.title}
          value={card.value}
          icon={card.icon}
          trend={card.trend}
        />
      ))}
    </div>
  )
}

// Dashboard Header Component  
export const DashboardHeader: React.FC<{
  title: string
  subtitle?: string
  actions?: React.ReactNode
  isLoading?: boolean
  lastUpdate?: string | null
  onRefresh?: () => void
  onPeriodChange?: () => void
  onFilterChange?: () => void
  onExport?: () => void
}> = ({ title, subtitle, actions, isLoading, lastUpdate, onRefresh, onPeriodChange, onFilterChange, onExport }) => {
  return (
    <div className="space-y-6 pb-8 border-b border-border mb-8">
      {/* Title Section - Full Width, Separated */}
      <div className="space-y-4">
        <h1 className="text-3xl font-bold tracking-tight text-foreground lg:text-4xl">
          {title}
        </h1>
        {subtitle && (
          <p className="text-muted-foreground text-base lg:text-lg max-w-4xl leading-relaxed">
            {subtitle}
          </p>
        )}
        {lastUpdate && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            Last updated: {new Date(lastUpdate).toLocaleTimeString()}
          </div>
        )}
      </div>

      {/* Actions Section - Completely Separate Row */}
      <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        {/* Main action buttons - shown on desktop */}
        <div className="hidden md:flex items-center gap-2">
          {onRefresh && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={isLoading}
              className="gap-2"
            >
              <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
              Refresh
            </Button>
          )}
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2"
            onClick={onPeriodChange}
          >
            <Calendar className="h-4 w-4" />
            Period
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2"
            onClick={onFilterChange}
          >
            <Filter className="h-4 w-4" />
            Filters
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2"
            onClick={onExport}
          >
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>

        {/* Mobile actions - compact layout */}
        <div className="flex md:hidden items-center gap-2 w-full">
          {onRefresh && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={isLoading}
              className="gap-2 flex-1"
            >
              <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
              Refresh
            </Button>
          )}
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2"
            onClick={onFilterChange}
          >
            <Filter className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2"
            onClick={onExport}
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>

        {/* Custom actions */}
        {actions && (
          <div className="flex items-center gap-2 flex-wrap">
            {actions}
          </div>
        )}
      </div>
    </div>
  )
}