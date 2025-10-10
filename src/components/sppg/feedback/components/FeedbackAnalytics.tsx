'use client'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
// Separator import removed - not needed
import { Progress } from '@/components/ui/progress'
import { 
  MessageSquare, 
  Star, 
  Clock, 
  TrendingUp, 
  TrendingDown,
  AlertCircle,
  CheckCircle,
  BarChart3,
  PieChart,
  Activity,
  Target,
  Users
} from 'lucide-react'
// Analytics dashboard component imports
import { useFeedbackAnalytics } from '../hooks'
import { 
  getFeedbackStatusInfo,
  getFeedbackTypeInfo,
  getFeedbackPriorityInfo,
  formatResponseTime
} from '../utils'

// ================================ MAIN COMPONENT ================================

interface FeedbackAnalyticsProps {
  dateRange?: {
    start: string
    end: string
  }
}

export function FeedbackAnalytics({ dateRange }: FeedbackAnalyticsProps) {
  const { analytics, isLoading, error } = useFeedbackAnalytics(dateRange)


  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <Card key={i} className="p-6 animate-pulse">
            <div className="h-4 bg-muted rounded w-3/4 mb-4" />
            <div className="h-8 bg-muted rounded w-1/2 mb-2" />
            <div className="h-3 bg-muted rounded w-full" />
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <Card className="p-6 text-center">
        <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Gagal Memuat Analytics</h3>
        <p className="text-muted-foreground">{error}</p>
      </Card>
    )
  }

  if (!analytics) {
    return (
      <Card className="p-6 text-center">
        <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Belum Ada Data</h3>
        <p className="text-muted-foreground">
          Analytics akan muncul setelah ada feedback dari penerima manfaat
        </p>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Feedback"
          value={analytics.totalFeedback.toString()}
          icon={<MessageSquare className="h-5 w-5" />}
          color="blue"
          trend={getTrendFromData(analytics.satisfactionTrend, 'count')}
        />

        <MetricCard
          title="Rating Rata-rata"
          value={analytics.averageRating.toFixed(1)}
          icon={<Star className="h-5 w-5" />}
          color="yellow"
          subtitle="/5.0"
          trend={getTrendFromRating(analytics.averageRating)}
        />

        <MetricCard
          title="Tingkat Respons"
          value={`${analytics.responseMetrics.responseRate.toFixed(1)}%`}
          icon={<CheckCircle className="h-5 w-5" />}
          color="green"
          trend={getTrendFromPercentage(analytics.responseMetrics.responseRate)}
        />

        <MetricCard
          title="Waktu Respons Rata-rata"
          value={formatResponseTime(analytics.responseMetrics.averageResponseTime)}
          icon={<Clock className="h-5 w-5" />}
          color="purple"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <PieChart className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Distribusi Status</h3>
          </div>
          
          <div className="space-y-4">
            {Object.entries(analytics.feedbackByStatus).map(([status, count]) => {
              const info = getFeedbackStatusInfo(status as keyof typeof analytics.feedbackByStatus)
              const percentage = (Number(count) / analytics.totalFeedback) * 100
              
              return (
                <div key={status} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span>{info.icon}</span>
                      <span className="text-sm font-medium">{info.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        {Number(count)} ({percentage.toFixed(1)}%)
                      </span>
                    </div>
                  </div>
                  <Progress value={percentage} className="h-2" />
                </div>
              )
            })}
          </div>
        </Card>

        {/* Type Distribution */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Jenis Feedback</h3>
          </div>
          
          <div className="space-y-4">
            {Object.entries(analytics.feedbackByType)
              .sort(([,a], [,b]) => Number(b) - Number(a))
              .slice(0, 6)
              .map(([type, count]) => {
                const info = getFeedbackTypeInfo(type as keyof typeof analytics.feedbackByType)
                const percentage = (Number(count) / analytics.totalFeedback) * 100
                
                return (
                  <div key={type} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span>{info.icon}</span>
                        <span className="text-sm font-medium">{info.label}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                          {Number(count)} ({percentage.toFixed(1)}%)
                        </span>
                      </div>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </div>
                )
              })}
          </div>
        </Card>
      </div>

      {/* Priority & Rating Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Priority Distribution */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <AlertCircle className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Distribusi Prioritas</h3>
          </div>
          
          <div className="space-y-4">
            {Object.entries(analytics.feedbackByPriority)
              .sort(([,a], [,b]) => Number(b) - Number(a))
              .map(([priority, count]) => {
                const info = getFeedbackPriorityInfo(priority as keyof typeof analytics.feedbackByPriority)
                const percentage = (Number(count) / analytics.totalFeedback) * 100
                
                return (
                  <div key={priority} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span>{info.icon}</span>
                        <span className="text-sm font-medium">{info.label}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${
                            priority === 'CRITICAL' ? 'border-red-200 text-red-700' :
                            priority === 'HIGH' ? 'border-orange-200 text-orange-700' :
                            priority === 'MEDIUM' ? 'border-yellow-200 text-yellow-700' :
                            'border-gray-200 text-gray-700'
                          }`}
                        >
                          {Number(count)}
                        </Badge>
                      </div>
                    </div>
                    <Progress 
                      value={percentage} 
                      className={`h-2 ${
                        priority === 'CRITICAL' ? '[&>div]:bg-red-500' :
                        priority === 'HIGH' ? '[&>div]:bg-orange-500' :
                        priority === 'MEDIUM' ? '[&>div]:bg-yellow-500' :
                        '[&>div]:bg-gray-500'
                      }`}
                    />
                  </div>
                )
              })}
          </div>
        </Card>

        {/* Rating Distribution */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <Star className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Distribusi Rating</h3>
          </div>
          
          <div className="space-y-4">
            {[5, 4, 3, 2, 1].map((rating) => {
                // Mock distribution for now - could be calculated from actual data
                const count = Math.floor(Math.random() * analytics.totalFeedback * 0.3)
                const percentage = analytics.totalFeedback > 0 ? (count / analytics.totalFeedback) * 100 : 0
                const stars = Array(rating).fill('⭐').join('')
                
                return (
                  <div key={rating} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{stars}</span>
                        <span className="text-sm font-medium">{rating} bintang</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                          {Number(count)} ({percentage.toFixed(1)}%)
                        </span>
                      </div>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </div>
                )
              })}
          </div>
        </Card>
      </div>

      {/* Top Issues & Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Issues */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <Target className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Isu Teratas</h3>
          </div>
          
          <div className="space-y-4">
            {analytics.topIssues.slice(0, 5).map((issue, index) => (
              <div key={issue.category} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`
                    w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                    ${index === 0 ? 'bg-yellow-100 text-yellow-700' :
                      index === 1 ? 'bg-gray-100 text-gray-700' :
                      index === 2 ? 'bg-orange-100 text-orange-700' :
                      'bg-blue-100 text-blue-700'}
                  `}>
                    {index + 1}
                  </div>
                  <span className="text-sm font-medium">{issue.category}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {issue.count} kasus
                  </span>
                  <Badge variant="outline" className="text-xs">
                    {issue.percentage.toFixed(1)}%
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Beneficiary Insights - TODO: Implement in server action */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <Users className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Insights Penerima Manfaat</h3>
          </div>
          
          <div className="text-center py-8 text-muted-foreground">
            <p>Fitur insights penerima manfaat akan segera tersedia</p>
          </div>
        </Card>
      </div>

      {/* Response Metrics */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <Activity className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Metrik Respons</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary mb-1">
              {analytics.totalFeedback || 0}
            </div>
            <div className="text-sm text-muted-foreground">Total Respons</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 mb-1">
              {analytics?.responseMetrics.responseRate.toFixed(1)}%
            </div>
            <div className="text-sm text-muted-foreground">Tingkat Respons</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 mb-1">
              {analytics?.responseMetrics.resolutionRate.toFixed(1)}%
            </div>
            <div className="text-sm text-muted-foreground">Tingkat Resolusi</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600 mb-1">
              {formatResponseTime(analytics?.responseMetrics.averageResponseTime || 0)}
            </div>
            <div className="text-sm text-muted-foreground">Waktu Respons Rata-rata</div>
          </div>
        </div>
      </Card>
    </div>
  )
}

// ================================ METRIC CARD COMPONENT ================================

interface MetricCardProps {
  title: string
  value: string
  icon: React.ReactNode
  color: 'blue' | 'yellow' | 'green' | 'purple' | 'red'
  subtitle?: string
  trend?: {
    value: number
    isPositive: boolean
  }
}

function MetricCard({ title, value, icon, color, subtitle, trend }: MetricCardProps) {
  const colorClasses = {
    blue: 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
    yellow: 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400',
    green: 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400',
    purple: 'bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
    red: 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400'
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
            {icon}
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <div className="flex items-baseline gap-1">
              <p className="text-2xl font-bold text-foreground">{value}</p>
              {subtitle && (
                <span className="text-sm text-muted-foreground">{subtitle}</span>
              )}
            </div>
          </div>
        </div>
        
        {trend && (
          <div className={`flex items-center gap-1 text-sm ${
            trend.isPositive ? 'text-green-600' : 'text-red-600'
          }`}>
            {trend.isPositive ? (
              <TrendingUp className="h-4 w-4" />
            ) : (
              <TrendingDown className="h-4 w-4" />
            )}
            <span>{Math.abs(trend.value).toFixed(1)}%</span>
          </div>
        )}
      </div>
    </Card>
  )
}

// ================================ UTILITY FUNCTIONS ================================

function getTrendFromData(trendData: Array<{ count: number }>, field: 'count'): { value: number; isPositive: boolean } | undefined {
  if (trendData.length < 2) return undefined
  
  const recent = trendData[trendData.length - 1][field]
  const previous = trendData[trendData.length - 2][field]
  
  if (previous === 0) return undefined
  
  const change = ((recent - previous) / previous) * 100
  
  return {
    value: change,
    isPositive: change >= 0
  }
}

function getTrendFromRating(rating: number): { value: number; isPositive: boolean } {
  // Assume 3.5 as baseline for good rating
  const baseline = 3.5
  const change = ((rating - baseline) / baseline) * 100
  
  return {
    value: Math.abs(change),
    isPositive: rating >= baseline
  }
}

function getTrendFromPercentage(percentage: number): { value: number; isPositive: boolean } {
  // Assume 80% as baseline for good response rate
  const baseline = 80
  const change = ((percentage - baseline) / baseline) * 100
  
  return {
    value: Math.abs(change),
    isPositive: percentage >= baseline
  }
}