/**
 * Global Status Indicator Component
 * Enterprise-Grade System Health Display
 * Bergizi-ID SaaS Platform - Phase 1 Implementation
 */

'use client'

import React, { useState, useEffect } from 'react'
import { 
  Wifi, 
  WifiOff, 
  Activity, 
  Database, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Loader2
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { WebSocketStatus, SystemHealthStatus } from '@/hooks/shared/useGlobalRealTime'

export interface GlobalStatusIndicatorProps {
  websocketStatus: WebSocketStatus
  systemHealth: SystemHealthStatus
  className?: string
  variant?: 'full' | 'compact' | 'minimal'
  showLabels?: boolean
  userRole?: string // Add user role for different display modes
  displayMode?: 'user-friendly' | 'technical' // Display mode selection
  isLoading?: boolean // Add loading state
  onStatusClick?: (type: 'websocket' | 'system' | 'redis') => void
}

interface StatusBadgeProps {
  status: 'CONNECTED' | 'CONNECTING' | 'DISCONNECTED' | 'ERROR' | 'HEALTHY' | 'WARNING' | 'CRITICAL' | 'SLOW' | 'RESPONSIVE' | 'TIMEOUT' | 'LOADING' | 'UNKNOWN'
  label: string
  icon: React.ReactNode
  tooltip?: string
  onClick?: () => void
  variant?: 'full' | 'compact' | 'minimal'
  className?: string
  isLoading?: boolean
}

function StatusBadge({ 
  status, 
  label, 
  icon, 
  tooltip, 
  onClick, 
  variant = 'full',
  className,
  isLoading = false
}: StatusBadgeProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONNECTED':
      case 'HEALTHY':
      case 'RESPONSIVE':
        return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800'
      case 'CONNECTING':
      case 'LOADING':
      case 'SLOW':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800'
      case 'WARNING':
        return 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800'
      case 'DISCONNECTED':
      case 'ERROR':
      case 'CRITICAL':
      case 'TIMEOUT':
        return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800'
      case 'UNKNOWN':
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800'
    }
  }

  const getStatusIcon = (status: string, icon: React.ReactNode, isLoading?: boolean) => {
    if (status === 'CONNECTING' || status === 'LOADING' || isLoading) {
      return <Loader2 className="h-3 w-3 animate-spin" />
    }
    return icon
  }

  const badgeContent = (
    <Badge
      className={cn(
        'flex items-center gap-1.5 px-2 py-1 font-medium border transition-all duration-200',
        getStatusColor(status),
        onClick && 'cursor-pointer hover:scale-105 hover:shadow-sm',
        variant === 'minimal' && 'px-1.5 py-0.5',
        className
      )}
      onClick={onClick}
    >
      {getStatusIcon(status, icon, isLoading)}
      {variant !== 'minimal' && (
        <span className={cn(
          'text-xs font-medium',
          variant === 'compact' && 'hidden sm:inline'
        )}>
          {label}
        </span>
      )}
    </Badge>
  )

  if (tooltip) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {badgeContent}
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-sm">{tooltip}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  return badgeContent
}

export function GlobalStatusIndicator({
  websocketStatus,
  systemHealth,
  className,
  variant = 'full',
  showLabels = true,
  userRole,
  displayMode,
  isLoading = false,
  onStatusClick
}: GlobalStatusIndicatorProps) {
  // Determine display mode based on user role
  const isAdmin = userRole?.startsWith('PLATFORM_') || userRole === 'SUPERADMIN'
  const shouldShowTechnical = displayMode === 'technical' || (displayMode === undefined && isAdmin)
  
  // Function to get user-friendly or technical tooltip
  const getTooltipContent = (type: 'websocket' | 'system' | 'redis') => {
    if (shouldShowTechnical) {
      // Technical tooltips for admins
      switch (type) {
        case 'websocket':
          return `WebSocket: ${websocketStatus.status}${
            websocketStatus.latency ? ` (${formatLatency(websocketStatus.latency)})` : ''
          }${
            websocketStatus.reconnectAttempts > 0 ? ` - ${websocketStatus.reconnectAttempts} reconnect attempts` : ''
          }${
            websocketStatus.status === 'UNAVAILABLE' ? ' - Server not available' : ''
          }`
        case 'system':
          return `System Health: ${systemHealth.overall}
Database: ${systemHealth.database}
APIs: ${systemHealth.apis}
Response Time: ${systemHealth.responseTime}ms
Uptime: ${formatUptime(systemHealth.uptime)}
Error Rate: ${systemHealth.errorRate.toFixed(2)}%`
        case 'redis':
          return `Redis Cache: ${systemHealth.redis}
Last Check: ${new Date(systemHealth.lastCheck).toLocaleTimeString()}`
      }
    } else {
      // User-friendly tooltips for end users
      switch (type) {
        case 'websocket':
          if (isLoading) {
            return 'Menginisialisasi koneksi real-time...'
          }
          return `Status Real-Time: ${
            websocketStatus.status === 'CONNECTED' ? 'Terhubung dengan baik - Data diperbarui secara otomatis' :
            websocketStatus.status === 'CONNECTING' ? 'Sedang menghubungkan ke server real-time...' :
            websocketStatus.status === 'DISCONNECTED' ? 'Koneksi terputus - Mencoba menghubungkan kembali' : 
            websocketStatus.status === 'ERROR' ? 'Ada masalah koneksi - Gunakan refresh manual' :
            websocketStatus.status === 'UNAVAILABLE' ? 'Fitur real-time tidak aktif dalam mode pengembangan' : 'Status tidak diketahui'
          }${
            websocketStatus.latency ? ` - Respon: ${formatLatency(websocketStatus.latency)}` : ''
          }${
            websocketStatus.reconnectAttempts > 0 ? ` - Mencoba koneksi ulang (${websocketStatus.reconnectAttempts})` : ''
          }`
        case 'system':
          if (isLoading) {
            return 'Memeriksa status sistem...'
          }
          return `Status Sistem: ${
            systemHealth.overall === 'HEALTHY' ? 'Berjalan dengan baik' :
            systemHealth.overall === 'WARNING' ? 'Ada yang perlu diperhatikan' :
            systemHealth.overall === 'CRITICAL' ? 'Ada masalah serius' : 'Sedang memeriksa...'
          }
${systemHealth.database === 'CONNECTED' ? '✅' : systemHealth.database === 'SLOW' ? '⚠️' : '❌'} Database: ${
            systemHealth.database === 'CONNECTED' ? 'Normal' :
            systemHealth.database === 'SLOW' ? 'Lambat' : 'Bermasalah'
          }
⚡ Respon: ${systemHealth.responseTime}ms
⏱️ Uptime: ${formatUptime(systemHealth.uptime)}
📊 Error Rate: ${systemHealth.errorRate.toFixed(2)}%`
        case 'redis':
          if (isLoading) {
            return 'Memeriksa performa sistem...'
          }
          return `Status Performa: ${
            systemHealth.redis === 'CONNECTED' ? 'Optimal' :
            systemHealth.redis === 'SLOW' ? 'Sedikit lambat' : 
            systemHealth.redis === 'DISCONNECTED' ? 'Tidak tersedia' : 'Sedang memeriksa...'
          }
🕒 Terakhir dicek: ${new Date(systemHealth.lastCheck).toLocaleTimeString()}
${systemHealth.redis === 'CONNECTED' ? '✅ Semua berjalan lancar' : 
  systemHealth.redis === 'SLOW' ? '⚠️ Performa sedikit menurun' : 
  '❌ Ada masalah dengan cache sistem'}`
      }
    }
  }
  const formatLatency = (latency?: number) => {
    if (!latency) return 'N/A'
    return `${latency}ms`
  }

  const formatUptime = (uptime: number) => {
    const hours = Math.floor(uptime / 3600)
    const minutes = Math.floor((uptime % 3600) / 60)
    return `${hours}h ${minutes}m`
  }

  return (
    <div className={cn(
      'flex items-center gap-2',
      variant === 'minimal' && 'gap-1',
      className
    )}>
      {/* Real-Time Connection Status */}
      <StatusBadge
        status={isLoading ? 'LOADING' : 
          websocketStatus.status === 'UNAVAILABLE' ? 'WARNING' : 
          websocketStatus.status}
        label={showLabels ? (shouldShowTechnical ? 'WebSocket' : 'Live') : ''}
        icon={websocketStatus.status === 'CONNECTED' ? 
          <Wifi className="h-3 w-3" /> : 
          websocketStatus.status === 'ERROR' ?
          <WifiOff className="h-3 w-3 text-red-500" /> :
          websocketStatus.status === 'UNAVAILABLE' ?
          <WifiOff className="h-3 w-3 text-yellow-500" /> :
          <WifiOff className="h-3 w-3" />
        }
        tooltip={getTooltipContent('websocket')}
        onClick={() => onStatusClick?.('websocket')}
        variant={variant}
        isLoading={isLoading}
      />

      {/* System Health Status */}
      <StatusBadge
        status={isLoading ? 'LOADING' : systemHealth.overall}
        label={showLabels ? (shouldShowTechnical ? 'System' : 'Sistem') : ''}
        icon={systemHealth.overall === 'HEALTHY' ? 
          <CheckCircle className="h-3 w-3" /> :
          systemHealth.overall === 'WARNING' ?
          <AlertTriangle className="h-3 w-3" /> :
          systemHealth.overall === 'CRITICAL' ?
          <Activity className="h-3 w-3 text-red-500" /> :
          <Activity className="h-3 w-3" />
        }
        tooltip={getTooltipContent('system')}
        onClick={() => onStatusClick?.('system')}
        variant={variant}
        isLoading={isLoading}
      />

      {/* Cache/Performance Status */}
      <StatusBadge
        status={isLoading ? 'LOADING' : systemHealth.redis}
        label={showLabels ? (shouldShowTechnical ? 'Redis' : 'Performa') : ''}
        icon={systemHealth.redis === 'CONNECTED' ? 
          <Database className="h-3 w-3" /> :
          systemHealth.redis === 'SLOW' ?
          <Database className="h-3 w-3 text-yellow-500" /> :
          <Database className="h-3 w-3 text-red-500" />
        }
        tooltip={getTooltipContent('redis')}
        onClick={() => onStatusClick?.('redis')}
        variant={variant}
        isLoading={isLoading}
      />

      {/* Last Update Indicator - Only in full variant */}
      {variant === 'full' && (
        <ClientTimeDisplay lastCheck={systemHealth.lastCheck} />
      )}
    </div>
  )
}

// Compact variant for mobile/small spaces
export function GlobalStatusIndicatorCompact(props: Omit<GlobalStatusIndicatorProps, 'variant'>) {
  return <GlobalStatusIndicator {...props} variant="compact" showLabels={false} />
}

// Minimal variant for very constrained spaces
export function GlobalStatusIndicatorMinimal(props: Omit<GlobalStatusIndicatorProps, 'variant'>) {
  return <GlobalStatusIndicator {...props} variant="minimal" showLabels={false} />
}

// Status Detail Modal Trigger Button
export function GlobalStatusTrigger({
  websocketStatus,
  systemHealth,
  onOpen,
  className
}: {
  websocketStatus: WebSocketStatus
  systemHealth: SystemHealthStatus
  onOpen: () => void
  className?: string
}) {
  const hasIssues = 
    websocketStatus.status !== 'CONNECTED' || 
    systemHealth.overall !== 'HEALTHY' ||
    systemHealth.redis !== 'CONNECTED'

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onOpen}
      className={cn(
        'flex items-center gap-2 px-3 py-2 h-auto',
        hasIssues && 'text-orange-600 hover:text-orange-700 dark:text-orange-400',
        className
      )}
    >
      <GlobalStatusIndicatorMinimal
        websocketStatus={websocketStatus}
        systemHealth={systemHealth}
      />
      <span className="text-xs font-medium hidden lg:inline">
        {hasIssues ? 'Issues Detected' : 'All Systems Operational'}
      </span>
    </Button>
  )
}

// Client-side time display component to prevent hydration mismatch
const ClientTimeDisplay: React.FC<{ lastCheck: string }> = ({ lastCheck }) => {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="flex items-center gap-1 text-xs text-muted-foreground ml-2">
        <Clock className="h-3 w-3" />
        <span className="hidden sm:inline">--:--:--</span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-1 text-xs text-muted-foreground ml-2">
      <Clock className="h-3 w-3" />
      <span className="hidden sm:inline">
        {new Date(lastCheck).toLocaleTimeString()}
      </span>
    </div>
  )
}