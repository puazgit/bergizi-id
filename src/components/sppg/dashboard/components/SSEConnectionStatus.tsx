// SSE Connection Status Component
// src/components/sppg/dashboard/components/SSEConnectionStatus.tsx

'use client'

import { type FC } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip'
import { 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface SSEConnectionStatusProps {
  isConnected: boolean
  isReconnecting: boolean
  connectionError: string | null
  stats: {
    messagesReceived: number
    reconnectAttempts: number
    lastConnected: Date | null
    uptime: number
  }
  onReconnect: () => void
  onDisconnect: () => void
  className?: string
}

export const SSEConnectionStatus: FC<SSEConnectionStatusProps> = ({
  isConnected,
  isReconnecting,
  connectionError,
  stats,
  onReconnect,
  onDisconnect,
  className
}) => {
  const getStatusColor = () => {
    if (connectionError) return 'destructive'
    if (isReconnecting) return 'warning'
    if (isConnected) return 'success'
    return 'secondary'
  }

  const getStatusIcon = () => {
    if (connectionError) return <AlertCircle className="w-3 h-3" />
    if (isReconnecting) return <RefreshCw className="w-3 h-3 animate-spin" />
    if (isConnected) return <CheckCircle className="w-3 h-3" />
    return <WifiOff className="w-3 h-3" />
  }

  const getStatusText = () => {
    if (connectionError) return 'Connection Error'
    if (isReconnecting) return 'Reconnecting...'
    if (isConnected) return 'Real-time Connected'
    return 'Disconnected'
  }

  const getUptimeText = () => {
    if (!stats.uptime) return 'Not connected'
    
    const minutes = Math.floor(stats.uptime / 60000)
    const seconds = Math.floor((stats.uptime % 60000) / 1000)
    
    if (minutes > 0) {
      return `${minutes}m ${seconds}s`
    }
    return `${seconds}s`
  }

  return (
    <TooltipProvider>
      <div className={cn('flex items-center gap-2', className)}>
        <Badge 
          variant={getStatusColor() as 'destructive' | 'secondary' | 'outline'}
          className={cn(
            'flex items-center gap-1 text-xs',
            isConnected && 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800',
            isReconnecting && 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800'
          )}
        >
          {getStatusIcon()}
          {getStatusText()}
        </Badge>

        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />
              {getUptimeText()}
            </div>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="text-xs">
            <div className="space-y-1">
              <div>Messages: {stats.messagesReceived}</div>
              <div>Reconnects: {stats.reconnectAttempts}</div>
              {stats.lastConnected && (
                <div>Last: {stats.lastConnected.toLocaleTimeString()}</div>
              )}
              {connectionError && (
                <div className="text-destructive">Error: {connectionError}</div>
              )}
            </div>
          </TooltipContent>
        </Tooltip>

        <div className="flex gap-1">
          {!isConnected && !isReconnecting && (
            <Button
              size="sm"
              variant="outline"
              onClick={onReconnect}
              className="h-6 px-2 text-xs"
            >
              <Wifi className="w-3 h-3 mr-1" />
              Connect
            </Button>
          )}
          
          {isConnected && (
            <Button
              size="sm"
              variant="outline"
              onClick={onDisconnect}
              className="h-6 px-2 text-xs"
            >
              <WifiOff className="w-3 h-3 mr-1" />
              Disconnect
            </Button>
          )}
        </div>
      </div>
    </TooltipProvider>
  )
}