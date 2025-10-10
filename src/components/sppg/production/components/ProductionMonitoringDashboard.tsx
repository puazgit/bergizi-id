// Production Monitoring Dashboard - Real-time Production Overview
// Pattern 2 Component-Level Implementation with WebSocket Integration
// src/components/sppg/production/components/ProductionMonitoringDashboard.tsx

'use client'

import { useEffect, useState } from 'react'
import { Wifi, WifiOff, Activity, Users, Clock, CheckCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { ProductionList } from './ProductionList'
import { ProductionStats } from './ProductionStats'
import { useProductions, useProductionRealTime } from '../hooks'
import type { ProductionWithDetails } from '../types'

interface ProductionMonitoringDashboardProps {
  initialProductions?: ProductionWithDetails[]
}

export function ProductionMonitoringDashboard({ 
  initialProductions = [] 
}: ProductionMonitoringDashboardProps) {
  const [recentUpdates, setRecentUpdates] = useState<string[]>([])
  
  // Fetch productions data
  const { 
    data: productionsData, 
    isLoading, 
    error,
    refetch 
  } = useProductions({
    status: ['PLANNED', 'PREPARING', 'COOKING', 'QUALITY_CHECK']
  })

  // Real-time WebSocket connection
  const { 
    isRealTimeActive, 
    connectionStatus 
  } = useProductionRealTime()

  const productions = productionsData?.productions || initialProductions

  // Handle real-time updates
  useEffect(() => {
    if (isRealTimeActive) {
      // Auto-refresh data when real-time is active
      const interval = setInterval(() => {
        refetch()
      }, 30000) // Refresh every 30 seconds as backup

      return () => clearInterval(interval)
    }
  }, [isRealTimeActive, refetch])

  // Connection status notifications
  useEffect(() => {
    if (connectionStatus === 'connected') {
      toast.success('Real-time monitoring terhubung')
      setRecentUpdates(prev => [...prev.slice(-4), `Connected at ${new Date().toLocaleTimeString()}`])
    } else if (connectionStatus === 'disconnected') {
      toast.warning('Real-time monitoring terputus')
    } else if (connectionStatus === 'error') {
      toast.error('Gagal menghubungkan real-time monitoring')
    }
  }, [connectionStatus])

  const activeProductions = productions.filter((p: ProductionWithDetails) => 
    ['PREPARING', 'COOKING', 'QUALITY_CHECK'].includes(p.status)
  )

  const todayProductions = productions.filter((p: ProductionWithDetails) => {
    const today = new Date().toDateString()
    return new Date(p.productionDate).toDateString() === today
  })

  const completionRate = todayProductions.length > 0 
    ? (todayProductions.filter((p: ProductionWithDetails) => p.status === 'COMPLETED').length / todayProductions.length) * 100
    : 0

  return (
    <div className="space-y-6">
      {/* Real-time Status Header */}
      <Card className={cn(
        'border-l-4 transition-colors',
        isRealTimeActive 
          ? 'border-l-green-500 bg-green-50/50 dark:bg-green-900/10' 
          : 'border-l-amber-500 bg-amber-50/50 dark:bg-amber-900/10'
      )}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              {isRealTimeActive ? (
                <Wifi className="h-5 w-5 text-green-600" />
              ) : (
                <WifiOff className="h-5 w-5 text-amber-600" />
              )}
              Production Monitoring Dashboard
              <Badge variant={isRealTimeActive ? 'default' : 'secondary'}>
                {isRealTimeActive ? 'Real-time Active' : 'Offline Mode'}
              </Badge>
            </CardTitle>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => refetch()}
              disabled={isLoading}
            >
              {isLoading ? 'Refreshing...' : 'Refresh Data'}
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Active Productions */}
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <Activity className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-xl font-semibold">{activeProductions.length}</p>
              </div>
            </div>

            {/* Today's Productions */}
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                <Clock className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Today</p>
                <p className="text-xl font-semibold">{todayProductions.length}</p>
              </div>
            </div>

            {/* Completion Rate */}
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Completion</p>
                <div className="flex items-center gap-2">
                  <Progress value={completionRate} className="flex-1 h-2" />
                  <span className="text-sm font-medium">{Math.round(completionRate)}%</span>
                </div>
              </div>
            </div>

            {/* Connection Status */}
            <div className="flex items-center gap-3">
              <div className={cn(
                'p-2 rounded-lg',
                isRealTimeActive 
                  ? 'bg-green-100 dark:bg-green-900/20' 
                  : 'bg-gray-100 dark:bg-gray-900/20'
              )}>
                <Users className={cn(
                  'h-4 w-4',
                  isRealTimeActive ? 'text-green-600' : 'text-gray-600'
                )} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <p className="text-sm font-medium capitalize">{connectionStatus}</p>
              </div>
            </div>
          </div>

          {/* Recent Updates */}
          {recentUpdates.length > 0 && (
            <div className="mt-4 pt-4 border-t">
              <p className="text-sm font-medium mb-2">Recent Updates:</p>
              <div className="space-y-1">
                {recentUpdates.slice(-3).map((update, index) => (
                  <p key={index} className="text-xs text-muted-foreground">
                    • {update}
                  </p>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stats Overview */}
      <ProductionStats stats={{
        total: productions.length,
        planned: productions.filter((p: ProductionWithDetails) => p.status === 'PLANNED').length,
        preparing: productions.filter((p: ProductionWithDetails) => p.status === 'PREPARING').length,
        cooking: productions.filter((p: ProductionWithDetails) => p.status === 'COOKING').length,
        qualityCheck: productions.filter((p: ProductionWithDetails) => p.status === 'QUALITY_CHECK').length,
        completed: productions.filter((p: ProductionWithDetails) => p.status === 'COMPLETED').length,
        cancelled: productions.filter((p: ProductionWithDetails) => p.status === 'CANCELLED').length,
        todayProductions: todayProductions.length,
        monthlyProductions: productions.length,
        averageCostPerPortion: productions.reduce((sum: number, p: ProductionWithDetails) => sum + (p.costPerPortion || 0), 0) / (productions.length || 1),
        qualityPassRate: 95,
        totalWasteKg: productions.reduce((sum: number, p: ProductionWithDetails) => sum + (p.wasteAmount || 0), 0),
        averageHygieneScore: productions.reduce((sum: number, p: ProductionWithDetails) => sum + (p.hygieneScore || 0), 0) / (productions.length || 1)
      }} />

      {/* Active Productions List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Active Productions
            {activeProductions.length > 0 && (
              <Badge variant="secondary">{activeProductions.length} active</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="text-center py-8">
              <p className="text-red-600 dark:text-red-400">
                Error loading productions: {error.message}
              </p>
              <Button 
                variant="outline" 
                className="mt-2" 
                onClick={() => refetch()}
              >
                Try Again
              </Button>
            </div>
          ) : (
            <ProductionList 
              productions={activeProductions}
              loading={isLoading}
              onStatusUpdate={(id, status) => {
                toast.success(`Production ${id} status updated to ${status}`)
                setRecentUpdates(prev => [
                  ...prev.slice(-4), 
                  `Production ${id} → ${status} at ${new Date().toLocaleTimeString()}`
                ])
              }}
            />
          )}
        </CardContent>
      </Card>

      {/* Today's Schedule */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Today&apos;s Production Schedule
            {todayProductions.length > 0 && (
              <Badge variant="secondary">{todayProductions.length} scheduled</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ProductionList 
            productions={todayProductions}
            loading={isLoading}
            onStatusUpdate={(id, status) => {
              toast.success(`Production ${id} status updated to ${status}`)
              setRecentUpdates(prev => [
                ...prev.slice(-4), 
                `Production ${id} → ${status} at ${new Date().toLocaleTimeString()}`
              ])
            }}
          />
        </CardContent>
      </Card>
    </div>
  )
}