/**
 * SPPG Dashboard Client - Enterprise Grade
 * Pattern 2 Architecture - Client-side dashboard implementation
 * Real-time WebSocket + Redis Integration
 */

'use client'

import React, { useState, useRef, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { createComponentLogger } from '@/lib/logger'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { 
  Activity,
  AlertCircle,
  CheckCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  Calendar,
  Filter,
  X,
  Users,
  DollarSign,
  Target,
  Zap,
  BarChart3
} from 'lucide-react'

// Import server actions
import { getExecutiveDashboard } from '@/actions/sppg/dashboard'

// Import dashboard domain components (Pattern 2)
import {
  DashboardCard,
  DashboardHeader,
  formatNumber,
  type DashboardView
} from '@/components/sppg/dashboard'

// Debug component

import { DashboardHistoryProvider } from '../providers/DashboardHistoryProvider'
import { EnterpriseDashboardHistoryViewer } from './EnterpriseDashboardHistoryViewer'

// Import chart components
import {
  BeneficiaryGrowthChart,
  BudgetUtilizationChart
} from './ChartComponents'

// Import new enterprise UI components
import {
  DashboardControlPanel,
  AdvancedMetricsDisplay,
  AIForecastingDisplay
} from './'
import { DashboardSubscriptionProvider } from './DashboardSubscriptionContext'

// Import WebSocket hook
import { useDashboardSSE } from '../hooks/useDashboardSSE'

// Import AI Forecasting hook
import { useAIForecasting, useDashboardHistory } from '../hooks'

interface EnterpriseDashboardClientProps {
  sppgId: string
  userName: string
  userRole: string
  isDemoAccount: boolean
}

// Enterprise Dashboard Client Component
export const EnterpriseDashboardClient: React.FC<EnterpriseDashboardClientProps> = ({
  userName,
  userRole,
  isDemoAccount
}) => {
  const dashboardLogger = createComponentLogger('EnterpriseDashboardClient')
  
  if (process.env.NODE_ENV === 'development') {
    dashboardLogger.debug('Dashboard client rendered', {
      userName,
      userRole,
      isDemoAccount
    })
  }
  
  const [activeView, setActiveView] = useState<DashboardView>('executive')
  const [showSettings, setShowSettings] = useState(false)
  
  // New state for dashboard controls
  const [showPeriodSelector, setShowPeriodSelector] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d' | 'custom'>('30d')
  const [customDateRange, setCustomDateRange] = useState<{ start: string; end: string }>({
    start: '',
    end: ''
  })
  const [activeFilters, setActiveFilters] = useState<{
    department: string[]
    status: string[]
    type: string[]
  }>({
    department: [],
    status: [],
    type: []
  })
  const [isExporting, setIsExporting] = useState(false)

  // Enterprise-grade refetch reference for WebSocket integration
  const refetchRef = useRef<(() => void) | null>(null)
  
  // Dashboard history hook
  const debugHistory = useDashboardHistory(25)
  
  if (process.env.NODE_ENV === 'development') {
    dashboardLogger.debug('Dashboard history hook state', {
      hasHistory: !!debugHistory.history,
      isLoading: debugHistory.isLoading,
      hasError: !!debugHistory.error,
      historyCount: debugHistory.history?.history?.length || 0
    })
  }
  
  // Dashboard data management with TanStack Query (enterprise-grade)
  const queryResult = useQuery({
    queryKey: ['dashboard', 'executive', selectedPeriod, customDateRange], // Include period in queryKey
    queryFn: async () => {
      // Calculate date range based on selected period
      const endDate = new Date()
      let startDate = new Date(endDate)
      
      if (selectedPeriod === 'custom' && customDateRange.start && customDateRange.end) {
        startDate = new Date(customDateRange.start)
        endDate.setTime(new Date(customDateRange.end).getTime())
      } else {
        // Calculate based on selected period
        const daysMap = { '7d': 7, '30d': 30, '90d': 90 }
        const days = daysMap[selectedPeriod as keyof typeof daysMap] || 30
        startDate.setDate(startDate.getDate() - days)
      }
      
      const result = await getExecutiveDashboard({
        dateRange: {
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0]
        },
        granularity: 'DAILY',
        includeInactive: false,
        includeForecasts: true
      })
      if (!result.success) {
        dashboardLogger.error('Dashboard server action failed', undefined, {
          errorMessage: result.error
        })
        throw new Error(result.error)
      }
      return result.data
    },
    staleTime: 10 * 60 * 1000, // 10 minutes - longer cache
    gcTime: 15 * 60 * 1000, // 15 minutes garbage collection
    refetchInterval: false, // Disable automatic refetch
    refetchOnWindowFocus: false, // Disable refetch on window focus
    refetchOnMount: true, // Only refetch on mount
    refetchOnReconnect: false, // Disable refetch on reconnect
  })

  // AI Forecasting data
  const { forecastData, isLoading: forecastLoading, error: forecastError } = useAIForecasting({
    enabled: activeView === 'analytics', // Only load when analytics tab is active
    refetchInterval: 15 * 60 * 1000 // 15 minutes
  })

  // Destructure query result
  const { data, isLoading: loading, error, refetch } = queryResult

  // Enterprise WebSocket connection with real-time updates  
  const {
    lastMessage
  } = useDashboardSSE({
    autoReconnect: true,
    maxReconnectAttempts: 5,
    reconnectInterval: 3000,
    enableDebouncing: true,
    debounceDelay: 2000 // 2 second debounce to prevent loops
  })

  // Last update tracking
  const lastUpdate = lastMessage?.timestamp ? new Date(lastMessage.timestamp).toISOString() : new Date().toISOString()

  // Dashboard history for activity logging
  const { saveActivity } = useDashboardHistory(25)

  // Update refetch reference for WebSocket integration
  useEffect(() => {
    refetchRef.current = refetch
  }, [refetch])

  // Log dashboard access on mount
  useEffect(() => {
    saveActivity({
      title: 'Dashboard Accessed',
      description: `User ${userName} (${userRole}) accessed dashboard`,
      changeType: 'view',
      data: {
        userRole,
        isDemoAccount,
        activeView,
        timestamp: new Date().toISOString()
      }
    })
  }, [saveActivity, userName, userRole, isDemoAccount, activeView])

  // Log view changes
  const handleViewChange = (newView: DashboardView) => {
    setActiveView(newView)
    saveActivity({
      title: 'Dashboard View Changed',
      description: `Switched to ${newView} view`,
      changeType: 'view',
      data: {
        fromView: activeView,
        toView: newView,
        timestamp: new Date().toISOString()
      }
    })
  }

  // Removed visibility change handler to prevent automatic refetching loops





  // Error state
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Dashboard Error</AlertTitle>
        <AlertDescription>
          {error?.message || 'An error occurred while loading dashboard data'}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => refetch()}
            className="ml-2"
          >
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  // Loading state
  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Activity className="h-12 w-12 animate-spin text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <DashboardSubscriptionProvider>
      <div className="min-h-screen">
        <div className="space-y-6">
        {/* Dashboard Header */}
      <DashboardHeader
        title={`${isDemoAccount ? 'Demo ' : ''}Dashboard SPPG`}
        subtitle={`Selamat datang kembali, ${userName}. Monitor operasional SPPG Anda secara real-time.`}
        isLoading={loading}
        lastUpdate={lastUpdate}
        onRefresh={async () => {
          dashboardLogger.info('Manual dashboard refresh requested')
          toast.loading('Refreshing dashboard data...', { id: 'refresh' })
          try {
            await refetch()
            toast.success('Dashboard data refreshed successfully', { id: 'refresh' })
          } catch (error) {
            dashboardLogger.error('Manual dashboard refresh failed', error as Error)
            toast.error('Failed to refresh dashboard data', { id: 'refresh' })
          }
        }}
        onPeriodChange={() => {
          setShowPeriodSelector(!showPeriodSelector)
          toast.info('Period selector opened - Choose your preferred date range')
        }}
        onFilterChange={() => {
          setShowFilters(!showFilters)
          toast.info('Advanced filters panel opened - Customize your dashboard view')
        }}
        onExport={async () => {
          if (isExporting) return
          
          setIsExporting(true)
          toast.loading('Preparing dashboard export...', { id: 'export' })
          
          try {
            // Simulate export preparation
            await new Promise(resolve => setTimeout(resolve, 2000))
            
            // Create export data based on current dashboard state
            const exportData = {
              timestamp: new Date().toISOString(),
              period: selectedPeriod,
              filters: activeFilters,
              view: activeView,
              data: data // Current dashboard data
            }
            
            // Create downloadable file
            const blob = new Blob([JSON.stringify(exportData, null, 2)], {
              type: 'application/json'
            })
            const url = URL.createObjectURL(blob)
            
            // Download file
            const link = document.createElement('a')
            link.href = url
            link.download = `dashboard-export-${new Date().toISOString().split('T')[0]}.json`
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            URL.revokeObjectURL(url)
            
            toast.success('Dashboard data exported successfully', { id: 'export' })
          } catch (error) {
            dashboardLogger.error('Export failed', error as Error)
            toast.error('Failed to export dashboard data', { id: 'export' })
          } finally {
            setIsExporting(false)
          }
        }}
        actions={
          <div className="flex flex-wrap items-center gap-2 max-w-full">
            {isDemoAccount && (
              <Badge variant="secondary" className="gap-1 text-xs whitespace-nowrap">
                <Clock className="h-3 w-3" />
                Demo Mode
              </Badge>
            )}
            <div className="flex items-center gap-2">
              {/* Real-time status moved to global header - no infrastructure duplication */}
            </div>
            <div className="flex items-center gap-2">
              <DashboardControlPanel />
              <DashboardHistoryProvider 
                limit={25}
                enableRealtime={true}
                cacheTTL={30000}
              >
                <EnterpriseDashboardHistoryViewer 
                  showConnectionStatus={true}
                  enableAdvancedFilters={true}
                  enableExport={true}
                />
              </DashboardHistoryProvider>
            </div>
          </div>
        }
      />

      {/* Period Selector Panel */}
      {showPeriodSelector && (
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-lg">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-500" />
                Select Time Period
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowPeriodSelector(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { value: '7d', label: 'Last 7 Days' },
                { value: '30d', label: 'Last 30 Days' },
                { value: '90d', label: 'Last 90 Days' },
                { value: 'custom', label: 'Custom Range' }
              ].map((period) => (
                <Button
                  key={period.value}
                  variant={selectedPeriod === period.value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setSelectedPeriod(period.value as '7d' | '30d' | '90d' | 'custom')
                    if (period.value !== 'custom') {
                      toast.success(`Period set to ${period.label}`)
                    }
                  }}
                  className="w-full"
                >
                  {period.label}
                </Button>
              ))}
            </div>
            
            {selectedPeriod === 'custom' && (
              <div className="grid grid-cols-2 gap-3 mt-4 p-4 bg-muted/50 rounded-lg">
                <div>
                  <label className="text-sm font-medium">Start Date</label>
                  <input
                    type="date"
                    value={customDateRange.start}
                    onChange={(e) => setCustomDateRange(prev => ({ ...prev, start: e.target.value }))}
                    className="w-full mt-1 p-2 border rounded text-sm"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">End Date</label>
                  <input
                    type="date"
                    value={customDateRange.end}
                    onChange={(e) => setCustomDateRange(prev => ({ ...prev, end: e.target.value }))}
                    className="w-full mt-1 p-2 border rounded text-sm"
                  />
                </div>
              </div>
            )}
            
            <div className="flex justify-end gap-2 pt-2 border-t">
              <Button variant="outline" size="sm" onClick={() => setShowPeriodSelector(false)}>
                Cancel
              </Button>
              <Button size="sm" onClick={() => {
                toast.success('Period filter applied successfully')
                setShowPeriodSelector(false)
                // Trigger data refetch with new period
                refetch()
              }}>
                Apply Filter
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Advanced Filters Panel */}
      {showFilters && (
        <Card className="border-l-4 border-l-green-500">
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-lg">
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-green-500" />
                Advanced Filters
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowFilters(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
              {/* Department Filter */}
              <div className="space-y-3">
                <h4 className="font-medium text-sm">Department</h4>
                <div className="space-y-2">
                  {['Procurement', 'Production', 'Distribution', 'Quality Control'].map((dept) => (
                    <label key={dept} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={activeFilters.department.includes(dept)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setActiveFilters(prev => ({
                              ...prev,
                              department: [...prev.department, dept]
                            }))
                          } else {
                            setActiveFilters(prev => ({
                              ...prev,
                              department: prev.department.filter(d => d !== dept)
                            }))
                          }
                        }}
                        className="rounded"
                      />
                      {dept}
                    </label>
                  ))}
                </div>
              </div>

              {/* Status Filter */}
              <div className="space-y-3">
                <h4 className="font-medium text-sm">Status</h4>
                <div className="space-y-2">
                  {['Active', 'Pending', 'Completed', 'On Hold'].map((status) => (
                    <label key={status} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={activeFilters.status.includes(status)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setActiveFilters(prev => ({
                              ...prev,
                              status: [...prev.status, status]
                            }))
                          } else {
                            setActiveFilters(prev => ({
                              ...prev,
                              status: prev.status.filter(s => s !== status)
                            }))
                          }
                        }}
                        className="rounded"
                      />
                      {status}
                    </label>
                  ))}
                </div>
              </div>

              {/* Type Filter */}
              <div className="space-y-3">
                <h4 className="font-medium text-sm">Type</h4>
                <div className="space-y-2">
                  {['Budget', 'Operations', 'Quality', 'Reports'].map((type) => (
                    <label key={type} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={activeFilters.type.includes(type)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setActiveFilters(prev => ({
                              ...prev,
                              type: [...prev.type, type]
                            }))
                          } else {
                            setActiveFilters(prev => ({
                              ...prev,
                              type: prev.type.filter(t => t !== type)
                            }))
                          }
                        }}
                        className="rounded"
                      />
                      {type}
                    </label>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Filter Summary */}
            <div className="bg-muted/50 p-3 rounded-lg">
              <div className="text-sm font-medium mb-2">Active Filters:</div>
              <div className="flex flex-wrap gap-2">
                {[...activeFilters.department, ...activeFilters.status, ...activeFilters.type].map((filter, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {filter}
                  </Badge>
                ))}
                {[...activeFilters.department, ...activeFilters.status, ...activeFilters.type].length === 0 && (
                  <span className="text-xs text-muted-foreground">No filters applied</span>
                )}
              </div>
            </div>
            
            <div className="flex justify-end gap-2 pt-2 border-t">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  setActiveFilters({ department: [], status: [], type: [] })
                  toast.info('All filters cleared')
                }}
              >
                Clear All
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowFilters(false)}>
                Cancel
              </Button>
              <Button size="sm" onClick={() => {
                const totalFilters = activeFilters.department.length + activeFilters.status.length + activeFilters.type.length
                toast.success(`${totalFilters} filters applied successfully`)
                setShowFilters(false)
                // Trigger data refetch with new filters
                refetch()
              }}>
                Apply Filters
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Connection status is handled at global level - no domain duplication */}

      {/* Demo Account Notice */}
      {isDemoAccount && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Demo Account</AlertTitle>
          <AlertDescription>
            Anda menggunakan akun demo. Data yang ditampilkan adalah data contoh.
            Untuk menggunakan fitur lengkap, silakan hubungi tim sales kami.
          </AlertDescription>
        </Alert>
      )}

      {/* Error State */}
      {error && (
        <Alert className="border-red-200 dark:border-red-800">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Dashboard Error</AlertTitle>
          <AlertDescription className="mt-2">
            Failed to load dashboard data. Please try refreshing the page.
            <div className="mt-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={async () => {
                  dashboardLogger.info('Retrying dashboard data fetch')
                  try {
                    if (refetch && typeof refetch === 'function') {
                      await (refetch as () => Promise<unknown>)()
                    } else {
                      window.location.reload()
                    }
                  } catch (error) {
                    dashboardLogger.error('Dashboard refetch failed, reloading page', error as Error)
                    window.location.reload()
                  }
                }}
                className="gap-2"
              >
                <Activity className="h-4 w-4" />
                Retry
              </Button>
            </div>
            {process.env.NODE_ENV === 'development' && (
              <details className="mt-3">
                <summary className="text-sm cursor-pointer">Error Details</summary>
                <pre className="text-xs mt-2 p-2 bg-muted rounded">
                  {String(error)}
                </pre>
              </details>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Loading State */}
      {loading && !data && (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-8 bg-muted rounded w-1/2 mb-2"></div>
                  <div className="h-3 bg-muted rounded w-2/3"></div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {[1, 2].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-muted rounded w-1/3"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-64 bg-muted rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Settings Panel */}
      {showSettings && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Dashboard Settings</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSettings(false)}
                className="h-6 w-6 p-0"
              >
                ×
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <label className="text-sm font-medium">Refresh Interval</label>
                <select className="w-full p-2 border rounded text-sm">
                  <option value="manual">Manual Only</option>
                  <option value="30">30 seconds</option>
                  <option value="60">1 minute</option>
                  <option value="300">5 minutes</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Default View</label>
                <select 
                  className="w-full p-2 border rounded text-sm"
                  value={activeView}
                  onChange={(e) => handleViewChange(e.target.value as DashboardView)}
                >
                  <option value="executive">Executive</option>
                  <option value="operational">Operations</option>
                  <option value="financial">Financial</option>
                  <option value="quality">Quality</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Notifications</label>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="alerts" defaultChecked />
                  <label htmlFor="alerts" className="text-sm">Enable alerts</label>
                </div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t">
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Cache: 10 minutes • Last updated: {lastUpdate ? new Date(lastUpdate).toLocaleTimeString() : 'Never'}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // Clear cache and force refresh
                    localStorage.removeItem('dashboard-cache')
                    refetch()
                    toast.success('Cache cleared and data refreshed')
                  }}
                  className="gap-1"
                >
                  <Activity className="h-3 w-3" />
                  Clear Cache
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dashboard Content */}
      {data && !loading && (
        <Tabs value={activeView} onValueChange={(value) => handleViewChange(value as DashboardView)}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="executive" className="gap-2">
              <Target className="h-4 w-4" />
              Executive
            </TabsTrigger>
            <TabsTrigger value="operational" className="gap-2">
              <Activity className="h-4 w-4" />
              Operations
            </TabsTrigger>
            <TabsTrigger value="financial" className="gap-2">
              <DollarSign className="h-4 w-4" />
              Financial
            </TabsTrigger>
            <TabsTrigger value="quality" className="gap-2">
              <CheckCircle className="h-4 w-4" />
              Quality
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-2">
              <Zap className="h-4 w-4" />
              AI Analytics
            </TabsTrigger>
          </TabsList>

          {/* Executive View */}
          <TabsContent value="executive" className="space-y-6">
            {/* Key Metrics Summary */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <DashboardCard
                title="Total Beneficiaries"
                value={data.executiveSummary.totalBeneficiaries.toLocaleString()}
                icon={Users}
              />
              <DashboardCard
                title="Active Programs"
                value={data.executiveSummary.totalPrograms.toString()}
                icon={Target}
              />
              <DashboardCard
                title="Budget Utilization"
                value={`${data.executiveSummary.budgetUtilization.toFixed(1)}%`}
                icon={DollarSign}
              />
              <DashboardCard
                title="Customer Satisfaction"
                value={`${data.executiveSummary.customerSatisfaction.toFixed(1)}%`}
                icon={CheckCircle}
              />
            </div>

            {/* Charts Grid - Enterprise Visualizations */}
            <div className="grid gap-6 md:grid-cols-2">
              {loading && !data ? (
                <>
                  <Card className="animate-pulse">
                    <CardHeader>
                      <div className="h-6 bg-muted rounded w-1/3"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="h-80 bg-muted rounded"></div>
                    </CardContent>
                  </Card>
                  <Card className="animate-pulse">
                    <CardHeader>
                      <div className="h-6 bg-muted rounded w-1/3"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="h-80 bg-muted rounded"></div>
                    </CardContent>
                  </Card>
                </>
              ) : (
                <>
                  <BeneficiaryGrowthChart 
                    data={data.charts.beneficiaryGrowthTrend} 
                  />
                  <BudgetUtilizationChart 
                    data={data.charts.budgetUtilizationTrend} 
                  />
                </>
              )}
            </div>

            {/* Performance Overview */}
            <div className="grid gap-6 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-500" />
                    Performance Score
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">
                    {data.executiveSummary.operationalEfficiency.toFixed(1)}%
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Overall operational efficiency
                  </p>
                  <div className="mt-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Progress</span>
                      <span>{data.executiveSummary.operationalEfficiency.toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${data.executiveSummary.operationalEfficiency}%` }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-blue-500" />
                    Active Programs
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600">
                    {data.executiveSummary.totalPrograms}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Active nutrition programs
                  </p>
                  <div className="flex items-center gap-2 mt-4 text-sm">
                    <Badge variant="secondary" className="text-xs">
                      100% Active
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-yellow-500" />
                    System Health
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-yellow-600">
                    {data.executiveSummary.systemUptime.toFixed(0)}%
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Overall system health score
                  </p>
                  <div className="flex items-center gap-2 mt-4">
                    <Badge 
                      variant={data.executiveSummary.systemUptime > 95 ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {data.executiveSummary.systemUptime > 95 ? "Excellent" : "Good"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Operational View */}
          <TabsContent value="operational" className="space-y-6">
            {/* Key Operational Metrics */}
            <div className="grid gap-4 md:grid-cols-4">
              <DashboardCard
                title="Procurement Orders"
                value={data.operations.procurement.totalOrders.toString()}
                subtitle={`${data.operations.procurement.orderFulfillmentRate.toFixed(1)}% fulfillment rate`}
                icon={CheckCircle}
              />
              <DashboardCard
                title="Production Batches"
                value={data.operations.production.totalBatches.toString()}
                subtitle={`${data.operations.production.productionEfficiency.toFixed(1)}% efficiency`}
                icon={Target}
              />
              <DashboardCard
                title="Distribution Coverage"
                value={data.operations.distribution.totalDistributions.toString()}
                subtitle={`${data.operations.distribution.onTimeDeliveryRate.toFixed(1)}% on-time`}
                icon={Activity}
              />
              <DashboardCard
                title="Inventory Items"
                value={data.operations.inventory.totalItems.toString()}
                subtitle={`${data.operations.inventory.stockAccuracy.toFixed(1)}% accuracy`}
                icon={AlertCircle}
              />
            </div>

            {/* Operational Performance Cards */}
            <div className="grid gap-6 md:grid-cols-3">
              {/* Procurement Performance */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-blue-500" />
                    Procurement Performance
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Order Fulfillment</span>
                      <span className="font-medium">{data.operations.procurement.orderFulfillmentRate.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${data.operations.procurement.orderFulfillmentRate}%` }}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Quality Compliance</span>
                      <span className="font-medium">{data.operations.procurement.qualityComplianceRate.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${data.operations.procurement.qualityComplianceRate}%` }}
                      />
                    </div>
                  </div>
                  <div className="pt-2 border-t">
                    <div className="text-xs text-muted-foreground">
                      Avg Lead Time: {data.operations.procurement.averageLeadTime} days
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Emergency Orders: {data.operations.procurement.emergencyOrderRate.toFixed(1)}%
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Production Performance */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-green-500" />
                    Production Performance
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Production Efficiency</span>
                      <span className="font-medium">{data.operations.production.productionEfficiency.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${data.operations.production.productionEfficiency}%` }}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Quality Score</span>
                      <span className="font-medium">{data.operations.production.qualityScore.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-yellow-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${data.operations.production.qualityScore}%` }}
                      />
                    </div>
                  </div>
                  <div className="pt-2 border-t">
                    <div className="text-xs text-muted-foreground">
                      Batch Success: {data.operations.production.batchSuccessRate.toFixed(1)}%
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Waste Reduction: {data.operations.production.wasteReductionRate.toFixed(1)}%
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Distribution Performance */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-purple-500" />
                    Distribution Performance
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>On-Time Delivery</span>
                      <span className="font-medium">{data.operations.distribution.onTimeDeliveryRate.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-purple-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${data.operations.distribution.onTimeDeliveryRate}%` }}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Coverage Efficiency</span>
                      <span className="font-medium">{data.operations.distribution.coverageEfficiency.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-indigo-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${data.operations.distribution.coverageEfficiency}%` }}
                      />
                    </div>
                  </div>
                  <div className="pt-2 border-t">
                    <div className="text-xs text-muted-foreground">
                      Beneficiary Satisfaction: {data.operations.distribution.beneficiarySatisfaction.toFixed(1)}%
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Geographic Coverage: {data.operations.distribution.geographicCoverage.toFixed(1)}%
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Inventory Status & Alerts */}
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-orange-500" />
                    Inventory Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {data.operations.inventory.stockAccuracy.toFixed(1)}%
                        </div>
                        <div className="text-xs text-muted-foreground">Stock Accuracy</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {data.operations.inventory.inventoryTurnover.toFixed(1)}x
                        </div>
                        <div className="text-xs text-muted-foreground">Inventory Turnover</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-red-600">
                          {data.operations.inventory.stockoutRate.toFixed(1)}%
                        </div>
                        <div className="text-xs text-muted-foreground">Stockout Rate</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-yellow-600">
                          {data.operations.inventory.excessInventoryRate.toFixed(1)}%
                        </div>
                        <div className="text-xs text-muted-foreground">Excess Inventory</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-red-500" />
                    Critical Alerts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {data.operations.inventory.criticalAlerts.slice(0, 4).map((alert, index) => (
                      <div key={index} className="flex items-center justify-between p-2 rounded border">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${
                            alert.severity === 'CRITICAL' ? 'bg-red-500' :
                            alert.severity === 'HIGH' ? 'bg-orange-500' : 'bg-yellow-500'
                          }`} />
                          <div>
                            <div className="text-sm font-medium">{alert.itemName}</div>
                            <div className="text-xs text-muted-foreground">{alert.alertType}</div>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {alert.severity}
                        </Badge>
                      </div>
                    ))}
                    {data.operations.inventory.criticalAlerts.length === 0 && (
                      <div className="text-center py-4 text-muted-foreground text-sm">
                        No critical alerts at this time
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Financial View */}
          <TabsContent value="financial" className="space-y-6">
            {/* Financial KPIs */}
            <div className="grid gap-4 md:grid-cols-4">
              <DashboardCard
                title="Total Budget"
                value={formatNumber(data.financial.budgetPerformance.totalBudget, 'currency')}
                subtitle="Annual allocation"
                icon={DollarSign}
              />
              <DashboardCard
                title="Budget Used"
                value={formatNumber(data.financial.budgetPerformance.budgetUsed, 'currency')}
                subtitle={`${((data.financial.budgetPerformance.budgetUsed / data.financial.budgetPerformance.totalBudget) * 100).toFixed(1)}% utilized`}
                icon={TrendingUp}
              />
              <DashboardCard
                title="Cost per Beneficiary"
                value={formatNumber(data.financial.roi.costPerBeneficiary, 'currency')}
                subtitle="Monthly average"
                icon={Users}
              />
              <DashboardCard
                title="Overall ROI"
                value={`${data.financial.roi.overallROI.toFixed(1)}%`}
                subtitle="Return on investment"
                icon={CheckCircle}
              />
            </div>

            {/* Budget Performance Details */}
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-green-500" />
                    Budget Performance
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Budget Utilization</span>
                      <span className="font-medium">
                        {((data.financial.budgetPerformance.budgetUsed / data.financial.budgetPerformance.totalBudget) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-3">
                      <div 
                        className="bg-green-500 h-3 rounded-full transition-all duration-500"
                        style={{ 
                          width: `${Math.min(((data.financial.budgetPerformance.budgetUsed / data.financial.budgetPerformance.totalBudget) * 100), 100)}%` 
                        }}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-3 pt-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Total Budget</span>
                      <span className="font-medium">
                        {formatNumber(data.financial.budgetPerformance.totalBudget, 'currency')}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Budget Used</span>
                      <span className="font-medium text-green-600">
                        {formatNumber(data.financial.budgetPerformance.budgetUsed, 'currency')}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Forecasted Spend</span>
                      <span className="font-medium text-blue-600">
                        {formatNumber(data.financial.budgetPerformance.forecastedSpend, 'currency')}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t">
                      <span className="text-sm text-muted-foreground">Variance</span>
                      <span className={`font-medium ${
                        data.financial.budgetPerformance.variancePercentage >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {data.financial.budgetPerformance.variancePercentage >= 0 ? '+' : ''}
                        {data.financial.budgetPerformance.variancePercentage.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-blue-500" />
                    Return on Investment
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">
                      {data.financial.roi.overallROI.toFixed(1)}%
                    </div>
                    <div className="text-sm text-muted-foreground">Overall ROI</div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Cost per Beneficiary</span>
                      <span className="font-medium">
                        {formatNumber(data.financial.roi.costPerBeneficiary, 'currency')}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Nutritional Value per Cost</span>
                      <span className="font-medium text-green-600">
                        {data.financial.roi.nutritionalValuePerCost.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Social Impact Score</span>
                      <span className="font-medium text-purple-600">
                        {data.financial.roi.socialImpactScore.toFixed(1)}
                      </span>
                    </div>
                    <div className="pt-2 border-t">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Liquidity Ratio</span>
                        <span className="font-medium">
                          {data.financial.cashFlow.liquidityRatio.toFixed(2)}x
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Budget Utilization Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-blue-500" />
                  Budget Utilization Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <BudgetUtilizationChart 
                  data={data.charts.budgetUtilizationTrend} 
                />
              </CardContent>
            </Card>

            {/* Cost Center Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Cost Center Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(data.financial.budgetPerformance.costCenterBreakdown).map(([center, performance]) => (
                    <div key={center} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium capitalize">
                          {center.replace('_', ' ')}
                        </span>
                        <div className="text-sm text-muted-foreground">
                          {formatNumber(performance.spent, 'currency')} / {formatNumber(performance.allocated, 'currency')}
                        </div>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-500 ${
                            performance.efficiency >= 90 ? 'bg-green-500' :
                            performance.efficiency >= 75 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${Math.min((performance.spent / performance.allocated) * 100, 100)}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Efficiency: {performance.efficiency.toFixed(1)}%</span>
                        <span>Variance: {performance.variance >= 0 ? '+' : ''}{performance.variance.toFixed(1)}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Quality View */}
          <TabsContent value="quality" className="space-y-6">
            {/* Quality KPIs */}
            <div className="grid gap-4 md:grid-cols-4">
              <DashboardCard
                title="Production Quality"
                value={`${data.operations.production.qualityScore.toFixed(1)}%`}
                subtitle="Food quality score"
                icon={CheckCircle}
              />
              <DashboardCard
                title="Employee Engagement"
                value={`${data.operations.hrd.employeeEngagement.toFixed(1)}%`}
                subtitle="Staff satisfaction"
                icon={Users}
              />
              <DashboardCard
                title="Training ROI"
                value={`${data.operations.hrd.trainingROI.toFixed(1)}%`}
                subtitle="Training effectiveness"
                icon={Target}
              />
              <DashboardCard
                title="Attendance Rate"
                value={`${data.operations.hrd.attendanceRate.toFixed(1)}%`}
                subtitle="Staff attendance"
                icon={Activity}
              />
            </div>

            {/* HRD Performance Section */}
            <div className="grid gap-6 md:grid-cols-2">
              {/* Employee Performance Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-blue-500" />
                    HRD Performance Overview
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {data.operations.hrd.totalEmployees}
                      </div>
                      <div className="text-xs text-muted-foreground">Total Employees</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {data.operations.hrd.retentionRate.toFixed(1)}%
                      </div>
                      <div className="text-xs text-muted-foreground">Retention Rate</div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Employee Engagement</span>
                        <span className="font-medium">{data.operations.hrd.employeeEngagement.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${data.operations.hrd.employeeEngagement}%` }}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Productivity Index</span>
                        <span className="font-medium">{data.operations.hrd.productivityIndex.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${data.operations.hrd.productivityIndex}%` }}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Skills Development Rate</span>
                        <span className="font-medium">{data.operations.hrd.skillsDevelopmentRate.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-purple-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${data.operations.hrd.skillsDevelopmentRate}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Department Analytics */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-green-500" />
                    Department Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(data.operations.hrd.departmentAnalytics).map(([dept, analytics]) => (
                      <div key={dept} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium capitalize">
                            {dept.replace('_', ' ')} ({analytics.headcount} staff)
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {analytics.productivity.toFixed(0)}% productive
                          </Badge>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-xs">
                          <div className="text-center">
                            <div className="font-medium text-blue-600">
                              {analytics.satisfaction.toFixed(0)}%
                            </div>
                            <div className="text-muted-foreground">Satisfaction</div>
                          </div>
                          <div className="text-center">
                            <div className="font-medium text-green-600">
                              {analytics.productivity.toFixed(0)}%
                            </div>
                            <div className="text-muted-foreground">Productivity</div>
                          </div>
                          <div className="text-center">
                            <div className="font-medium text-red-600">
                              {analytics.turnover.toFixed(1)}%
                            </div>
                            <div className="text-muted-foreground">Turnover</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Performance Distribution & Upcoming Actions */}
            <div className="grid gap-6 md:grid-cols-2">
              {/* Performance Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-purple-500" />
                    Performance Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(data.operations.hrd.performanceDistribution).map(([level, count]) => (
                      <div key={level} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant={
                              level === 'EXCELLENT' ? 'default' :
                              level === 'GOOD' ? 'secondary' :
                              level === 'SATISFACTORY' ? 'outline' : 'destructive'
                            }
                            className="text-xs"
                          >
                            {level.toLowerCase()}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {count} employees
                          </span>
                        </div>
                        <div className="text-sm font-medium">
                          {((count / data.operations.hrd.totalEmployees) * 100).toFixed(1)}%
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Upcoming HR Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-orange-500" />
                    Upcoming HR Actions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {data.operations.hrd.upcomingActions.map((action, index) => (
                      <div key={index} className="flex items-center justify-between p-2 rounded border">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${
                            action.priority === 'HIGH' ? 'bg-red-500' :
                            action.priority === 'MEDIUM' ? 'bg-yellow-500' : 'bg-green-500'
                          }`} />
                          <div>
                            <div className="text-sm font-medium">
                              {action.type.replace('_', ' ')} ({action.count})
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Due: {action.deadline}
                            </div>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {action.priority}
                        </Badge>
                      </div>
                    ))}
                    {data.operations.hrd.upcomingActions.length === 0 && (
                      <div className="text-center py-4 text-muted-foreground text-sm">
                        No upcoming actions scheduled
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quality Control & Compliance */}
            <div className="grid gap-6 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-red-500" />
                    Quality Control
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">
                      {data.operations.production.qualityScore.toFixed(1)}%
                    </div>
                    <div className="text-sm text-muted-foreground">Overall Quality Score</div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Nutrition Compliance</span>
                      <span className="font-medium">{data.operations.production.nutritionComplianceRate.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Equipment Utilization</span>
                      <span className="font-medium">{data.operations.production.equipmentUtilizationRate.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Waste Reduction</span>
                      <span className="font-medium">{data.operations.production.wasteReductionRate.toFixed(1)}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-blue-500" />
                    Procurement Quality
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">
                      {data.operations.procurement.qualityComplianceRate.toFixed(1)}%
                    </div>
                    <div className="text-sm text-muted-foreground">Supplier Quality</div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Supplier Performance</span>
                      <span className="font-medium">{data.operations.procurement.supplierPerformanceIndex.toFixed(1)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Cost Optimization</span>
                      <span className="font-medium">{data.operations.procurement.costOptimizationRate.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Lead Time Avg</span>
                      <span className="font-medium">{data.operations.procurement.averageLeadTime} days</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-yellow-500" />
                    System Health
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-yellow-600">
                      {data.executiveSummary.systemUptime.toFixed(1)}%
                    </div>
                    <div className="text-sm text-muted-foreground">System Uptime</div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Customer Satisfaction</span>
                      <span className="font-medium">{data.executiveSummary.customerSatisfaction.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Operational Efficiency</span>
                      <span className="font-medium">{data.executiveSummary.operationalEfficiency.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Distribution Coverage</span>
                      <span className="font-medium">{data.operations.distribution.geographicCoverage.toFixed(1)}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* AI Analytics View */}
          <TabsContent value="analytics" className="space-y-6">
            <AdvancedMetricsDisplay enabled />
            <AIForecastingDisplay 
              data={forecastData || null} 
              isLoading={forecastLoading}
              error={forecastError?.message || null}
              className="mt-6"
            />
          </TabsContent>
        </Tabs>
      )}

      {/* Real-time System Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-500" />
              System Alerts & Notifications
            </div>
            <Badge variant="outline" className="text-xs">
              {data?.operations?.inventory?.criticalAlerts?.length || 0} active
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {/* Critical Inventory Alerts */}
            {data?.operations?.inventory?.criticalAlerts?.slice(0, 3).map((alert, index) => (
              <div key={index} className="flex items-start gap-3 p-3 rounded-lg border border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950">
                <div className={`w-2 h-2 rounded-full mt-2 ${
                  alert.severity === 'CRITICAL' ? 'bg-red-500' :
                  alert.severity === 'HIGH' ? 'bg-orange-500' : 'bg-yellow-500'
                }`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-orange-800 dark:text-orange-200">
                      {alert.alertType.replace('_', ' ')} Alert
                    </h4>
                    <span className="text-xs text-orange-600 dark:text-orange-400">
                      {alert.daysRemaining && `${alert.daysRemaining} days`}
                    </span>
                  </div>
                  <p className="text-sm text-orange-700 dark:text-orange-300 mt-1">
                    {alert.itemName} - {alert.recommendedAction}
                  </p>
                </div>
                <Badge variant="outline" className="text-xs border-orange-300">
                  {alert.severity}
                </Badge>
              </div>
            )) || []}

            {/* HRD Action Alerts */}
            {data?.operations?.hrd?.upcomingActions?.slice(0, 2).map((action, index) => (
              <div key={`hrd-${index}`} className="flex items-start gap-3 p-3 rounded-lg border border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
                <Users className="h-4 w-4 text-blue-500 mt-1" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                      HR Action Required
                    </h4>
                    <span className="text-xs text-blue-600 dark:text-blue-400">
                      Due: {action.deadline}
                    </span>
                  </div>
                  <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                    {action.count} employees require {action.type.replace('_', ' ').toLowerCase()}
                  </p>
                </div>
                <Badge variant="outline" className="text-xs border-blue-300">
                  {action.priority}
                </Badge>
              </div>
            )) || []}

            {/* System Performance Alert */}
            {data?.executiveSummary?.operationalEfficiency && data.executiveSummary.operationalEfficiency < 85 && (
              <div className="flex items-start gap-3 p-3 rounded-lg border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
                <TrendingDown className="h-4 w-4 text-red-500 mt-1" />
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-red-800 dark:text-red-200">
                    Performance Alert
                  </h4>
                  <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                    Operational efficiency is below target at {data.executiveSummary.operationalEfficiency.toFixed(1)}%. Review operational processes.
                  </p>
                </div>
                <Badge variant="outline" className="text-xs border-red-300">
                  ACTION NEEDED
                </Badge>
              </div>
            )}

            {/* Budget Alert */}
            {data?.executiveSummary?.budgetUtilization && data.executiveSummary.budgetUtilization > 90 && (
              <div className="flex items-start gap-3 p-3 rounded-lg border border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950">
                <DollarSign className="h-4 w-4 text-yellow-500 mt-1" />
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                    Budget Warning
                  </h4>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                    Budget utilization at {data.executiveSummary.budgetUtilization.toFixed(1)}%. Monitor spending closely.
                  </p>
                </div>
                <Badge variant="outline" className="text-xs border-yellow-300">
                  WARNING
                </Badge>
              </div>
            )}

            {/* No Alerts State */}
            {(!data?.operations?.inventory?.criticalAlerts?.length && 
              !data?.operations?.hrd?.upcomingActions?.length &&
              (!data?.executiveSummary?.operationalEfficiency || data.executiveSummary.operationalEfficiency >= 85) &&
              (!data?.executiveSummary?.budgetUtilization || data.executiveSummary.budgetUtilization <= 90)) && (
              <div className="text-center py-6">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  All systems operating normally
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  No critical alerts at this time
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
        <div className="text-center text-sm text-muted-foreground py-4 border-t">
          <p>
            Bergizi-ID Enterprise Dashboard • 
            Last updated: {lastUpdate?.toLocaleString() || 'Never'} •
            User: {userName} ({userRole})
          </p>
        </div>
        </div>
      </div>
    </DashboardSubscriptionProvider>
  )
}

export default EnterpriseDashboardClient