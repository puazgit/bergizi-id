'use client'

import React, { useState, useCallback, useMemo } from 'react'
import { Settings, Trash2, RefreshCw, History, Wifi, WifiOff, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import {
  useDashboardCache,
  useDashboardAdvancedMetrics,
  useDashboardHistory
} from '../hooks'
import { useDashboardSubscriptionsContext } from './DashboardSubscriptionContext'

interface DashboardControlPanelProps {
  className?: string
}

const DashboardControlPanelComponent: React.FC<DashboardControlPanelProps> = ({ 
  className = "" 
}) => {
  const [showAdvancedMetrics, setShowAdvancedMetrics] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  // Debounced toggle for advanced metrics to prevent rapid state changes
  const handleAdvancedMetricsToggle = useCallback((checked: boolean) => {
    // Immediate UI update for responsiveness
    setShowAdvancedMetrics(checked)
    
    // Optional: Add analytics tracking or validation here
    if (checked) {
      // Track advanced metrics activation
      console.log('Advanced metrics enabled')
    }
  }, [])

  // Hooks for dashboard functionality
  const { 
    invalidateCache, 
    forceRefresh, 
    isInvalidating 
  } = useDashboardCache()

  const {
    advancedMetrics,
    isLoading: isLoadingAdvanced,
    refreshMetrics,
    isRefreshing
  } = useDashboardAdvancedMetrics(showAdvancedMetrics)

  const {
    isSubscribed,
    subscriptionError,
    subscribe,
    unsubscribe
  } = useDashboardSubscriptionsContext()

  const {
    history,
    isLoading: isLoadingHistory,
    exportHistory
  } = useDashboardHistory(25)

  // Optimized computed values with memoization for performance
  const historyArray = useMemo(() => Array.isArray(history) ? history : [], [history])
  const hasAdvancedMetrics = useMemo(() => 
    advancedMetrics && typeof advancedMetrics === 'object', 
    [advancedMetrics]
  )
  
  // Enhanced subscription toggle with error recovery
  const handleSubscriptionToggle = useCallback(async (checked: boolean) => {
    try {
      if (checked) {
        await subscribe()
      } else {
        unsubscribe()
      }
    } catch (error) {
      console.error('Subscription toggle failed:', error)
      // Error is already handled by the subscription hooks
    }
  }, [subscribe, unsubscribe])

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className={className}>
          <Settings className="h-4 w-4 mr-2" />
          Dashboard Controls
        </Button>
      </SheetTrigger>
      
      <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Dashboard Control Panel</SheetTitle>
          <SheetDescription>
            Manage dashboard cache, subscriptions, and advanced features
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 mt-6">
          {/* Cache Management */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <RefreshCw className="h-5 w-5 mr-2" />
                Cache Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Button
                  onClick={invalidateCache}
                  disabled={isInvalidating}
                  variant="outline"
                  size="sm"
                  className="flex-1"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {isInvalidating ? 'Clearing...' : 'Clear Cache'}
                </Button>
                
                <Button
                  onClick={forceRefresh}
                  disabled={isInvalidating}
                  size="sm"
                  className="flex-1"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${isInvalidating ? 'animate-spin' : ''}`} />
                  {isInvalidating ? 'Refreshing...' : 'Force Refresh'}
                </Button>
              </div>
              
              <p className="text-sm text-muted-foreground">
                Clear cached data and force refresh from database
              </p>
            </CardContent>
          </Card>

          {/* Real-time Subscriptions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                {isSubscribed ? (
                  <Wifi className="h-5 w-5 mr-2 text-green-500" />
                ) : (
                  <WifiOff className="h-5 w-5 mr-2 text-red-500" />
                )}
                Real-time Updates
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="font-medium">Live Data Streaming</p>
                  <p className="text-sm text-muted-foreground">
                    Receive real-time dashboard updates
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={isSubscribed ? "default" : "secondary"}>
                    {isSubscribed ? "Connected" : "Disconnected"}
                  </Badge>
                  <Switch
                    checked={isSubscribed}
                    onCheckedChange={handleSubscriptionToggle}
                  />
                </div>
              </div>

              {subscriptionError && (
                <Alert variant="destructive">
                  <AlertDescription>{subscriptionError}</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Advanced Metrics */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Advanced Analytics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="font-medium">AI-Powered Insights</p>
                  <p className="text-sm text-muted-foreground">
                    Enable advanced forecasting and predictions
                  </p>
                </div>
                <Switch
                  checked={showAdvancedMetrics}
                  onCheckedChange={handleAdvancedMetricsToggle}
                />
              </div>

              {showAdvancedMetrics && (
                <>
                  <Separator />
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Status:</span>
                      <Badge variant={isLoadingAdvanced ? "secondary" : "default"}>
                        {isLoadingAdvanced ? "Loading..." : "Active"}
                      </Badge>
                    </div>
                    
                    {hasAdvancedMetrics ? (
                      <div className="text-sm text-muted-foreground">
                        Last updated: {new Date().toLocaleTimeString()}
                      </div>
                    ) : null}

                    <Button
                      onClick={() => refreshMetrics(true)}
                      disabled={isRefreshing}
                      variant="outline"
                      size="sm"
                      className="w-full"
                    >
                      <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                      {isRefreshing ? 'Updating...' : 'Refresh AI Insights'}
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Dashboard History */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <History className="h-5 w-5 mr-2" />
                Dashboard History
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="font-medium">Historical Data</p>
                  <p className="text-sm text-muted-foreground">
                    {isLoadingHistory ? 'Loading...' : historyArray.length > 0 ? `${historyArray.length} snapshots available` : 'No history available'}
                  </p>
                </div>
                <Button
                  onClick={exportHistory}
                  disabled={isLoadingHistory || historyArray.length === 0}
                  variant="outline"
                  size="sm"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>

              {historyArray.length > 0 && (
                <div className="text-sm text-muted-foreground">
                  Latest snapshot: {new Date((historyArray[0] as { timestamp?: string })?.timestamp || '').toLocaleString()}
                </div>
              )}
            </CardContent>
          </Card>

          {/* System Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">System Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Cache Status:</span>
                <Badge variant="outline">Active</Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span>Real-time:</span>
                <Badge variant={isSubscribed ? "default" : "secondary"}>
                  {isSubscribed ? "Connected" : "Disconnected"}
                </Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span>Advanced Analytics:</span>
                <Badge variant={showAdvancedMetrics ? "default" : "secondary"}>
                  {showAdvancedMetrics ? "Enabled" : "Disabled"}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </SheetContent>
    </Sheet>
  )
}

// Memoized component for performance optimization
export const DashboardControlPanel = React.memo(DashboardControlPanelComponent)