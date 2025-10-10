/**
 * Enterprise Dashboard History Viewer
 * Advanced UI component with real-time updates, error recovery, and export capabilities
 */

'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { format, parseISO } from 'date-fns'
import { id } from 'date-fns/locale'
import { createComponentLogger } from '@/lib/logger'
import { 
  Clock, 
  Activity, 
  AlertCircle, 
  Download,
  RefreshCw,
  Wifi,
  WifiOff,
  Filter,
  Search,
  Calendar,
  Eye,
  FileText,
  Database
} from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { useDashboardHistoryEnterprise } from '../providers/DashboardHistoryProvider'

interface EnterpriseDashboardHistoryViewerProps {
  className?: string
  showConnectionStatus?: boolean
  enableAdvancedFilters?: boolean
  enableExport?: boolean
}

export const EnterpriseDashboardHistoryViewer: React.FC<EnterpriseDashboardHistoryViewerProps> = ({ 
  className = "",
  showConnectionStatus = true,
  enableAdvancedFilters = true,
  enableExport = true
}) => {
  // Enterprise state management
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [dateFilter, setDateFilter] = useState<string>('all')
  const [isExporting, setIsExporting] = useState(false)

  // Enterprise context
  const {
    history,
    total,
    isLoading,
    error,
    isHydrated,
    lastSync,
    connectionStatus,
    refetch,
    forceSync,
    exportHistory,
    retryConnection,
    clearError,
    subscribeToUpdates
  } = useDashboardHistoryEnterprise()

  const enterpriseLogger = createComponentLogger('EnterpriseDashboardHistoryViewer')
  
  if (process.env.NODE_ENV === 'development') {
    enterpriseLogger.debug('Enterprise history viewer rendering', {
      isHydrated,
      hasHistory: !!history,
      historyCount: history?.length || 0,
      connectionStatus,
      isLoading,
      hasError: !!error
    })
  }

  // Real-time subscription
  useEffect(() => {
    const unsubscribe = subscribeToUpdates((updatedHistory) => {
      if (process.env.NODE_ENV === 'development') {
        enterpriseLogger.debug('Real-time history update received', {
          historyCount: updatedHistory.length
        })
      }
    })

    return unsubscribe
  }, [subscribeToUpdates, enterpriseLogger])

  // Advanced filtering logic
  const filteredHistory = useMemo(() => {
    if (!history) return []

    return history.filter(item => {
      // Search filter
      if (searchTerm && !item.title.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false
      }

      // Type filter
      if (typeFilter !== 'all' && item.type !== typeFilter) {
        return false
      }

      // Date filter (simplified for demo)
      if (dateFilter !== 'all') {
        const itemDate = new Date(item.timestamp)
        const now = new Date()
        
        switch (dateFilter) {
          case 'today':
            return itemDate.toDateString() === now.toDateString()
          case 'week':
            return (now.getTime() - itemDate.getTime()) <= 7 * 24 * 60 * 60 * 1000
          case 'month':
            return (now.getTime() - itemDate.getTime()) <= 30 * 24 * 60 * 60 * 1000
          default:
            return true
        }
      }

      return true
    })
  }, [history, searchTerm, typeFilter, dateFilter])

  // Enterprise export handler
  const handleExport = async (format: 'json' | 'csv' | 'pdf') => {
    if (!enableExport) return

    setIsExporting(true)
    try {
      await exportHistory(format)
      enterpriseLogger.info('Dashboard history exported successfully', { format })
    } catch (error) {
      enterpriseLogger.error('Failed to export dashboard history', error as Error, { format })
    } finally {
      setIsExporting(false)
    }
  }

  // Connection status indicator
  const ConnectionStatusIndicator = () => {
    if (!showConnectionStatus) return null

    const statusConfig = {
      connected: { icon: Wifi, color: 'text-green-500', bg: 'bg-green-50', text: 'Connected' },
      disconnected: { icon: WifiOff, color: 'text-red-500', bg: 'bg-red-50', text: 'Disconnected' },
      reconnecting: { icon: RefreshCw, color: 'text-yellow-500', bg: 'bg-yellow-50', text: 'Reconnecting' }
    }

    const config = statusConfig[connectionStatus]
    const StatusIcon = config.icon

    return (
      <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs ${config.bg}`}>
        <StatusIcon className={`h-3 w-3 ${config.color} ${connectionStatus === 'reconnecting' ? 'animate-spin' : ''}`} />
        <span className={config.color}>{config.text}</span>
        {lastSync && (
          <span className="text-gray-500">
            • {format(lastSync, 'HH:mm:ss')}
          </span>
        )}
      </div>
    )
  }

  // Loading state for non-hydrated
  if (!isHydrated) {
    return (
      <Button variant="outline" size="sm" className={className} disabled>
        <Clock className="h-4 w-4 mr-2" />
        Loading...
      </Button>
    )
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className={className}>
          <Clock className="h-4 w-4 mr-2" />
          Dashboard History
          {total > 0 && (
            <Badge variant="secondary" className="ml-2">
              {total}
            </Badge>
          )}
        </Button>
      </SheetTrigger>

      <SheetContent className="w-full sm:max-w-4xl">
        <SheetHeader className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <SheetTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Enterprise Dashboard History
              </SheetTitle>
              <SheetDescription>
                Advanced history tracking with real-time updates and enterprise features
              </SheetDescription>
            </div>
            <ConnectionStatusIndicator />
          </div>

          {/* Enterprise Controls */}
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => forceSync()}
              disabled={connectionStatus === 'reconnecting'}
            >
              <Database className="h-4 w-4 mr-2" />
              Force Sync
            </Button>

            {enableExport && (
              <Select onValueChange={(format) => handleExport(format as 'json' | 'csv' | 'pdf')} disabled={isExporting}>
                <SelectTrigger className="w-32">
                  <Download className="h-4 w-4 mr-2" />
                  {isExporting ? 'Exporting...' : 'Export'}
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="json">JSON</SelectItem>
                  <SelectItem value="csv">CSV</SelectItem>
                  <SelectItem value="pdf">PDF</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Advanced Filters */}
          {enableAdvancedFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search history..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="create">Create</SelectItem>
                  <SelectItem value="update">Update</SelectItem>
                  <SelectItem value="delete">Delete</SelectItem>
                  <SelectItem value="view">View</SelectItem>
                  <SelectItem value="export">Export</SelectItem>
                </SelectContent>
              </Select>

              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger>
                  <Calendar className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by date" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </SheetHeader>

        <Separator className="my-4" />

        {/* Error Recovery */}
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>Failed to load history: {error.message}</span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={retryConnection}>
                  Retry
                </Button>
                <Button variant="outline" size="sm" onClick={clearError}>
                  Clear
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Enterprise Content */}
        <div className="space-y-4">
          {/* Metrics Summary */}
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-600">Total Records</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{total}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-600">Filtered</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{filteredHistory.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-600">Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm font-medium capitalize">{connectionStatus}</div>
              </CardContent>
            </Card>
          </div>

          {/* History List */}
          <ScrollArea className="h-96">
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-48" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredHistory.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No History Found</h3>
                <p className="text-gray-500">
                  {searchTerm || typeFilter !== 'all' || dateFilter !== 'all'
                    ? 'Try adjusting your filters'
                    : 'No dashboard activity recorded yet'
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredHistory.map((item, index) => (
                  <Card key={item.id || index} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100">
                          <Eye className="h-4 w-4 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{item.title}</h4>
                          {item.description && (
                            <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                          )}
                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                            <span>
                              {item.timestamp 
                                ? format(parseISO(item.timestamp), 'dd MMM yyyy, HH:mm', { locale: id })
                                : 'Unknown time'
                              }
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {item.type}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  )
}