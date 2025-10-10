/**
 * Live Notification Center Component
 * Enterprise-Grade Real-Time Notification System
 * Bergizi-ID SaaS Platform - Phase 1 Implementation
 */

'use client'

import React, { useState } from 'react'
import {
  Bell,
  BellDot,
  CheckCircle,
  AlertTriangle,
  AlertCircle,
  Info,
  X,
  Check,
  CheckCheck,
  Filter,
  Settings,
  Clock
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { GlobalNotification } from '@/hooks/shared/useGlobalRealTime'

export interface LiveNotificationCenterProps {
  notifications: GlobalNotification[]
  unreadCount: number
  criticalAlerts: number
  onMarkRead: (id: string) => void
  onMarkAllRead: () => void
  onDismiss: (id: string) => void
  onSettingsClick?: () => void
  className?: string
  maxDisplayCount?: number
}

interface NotificationItemProps {
  notification: GlobalNotification
  onMarkRead: (id: string) => void
  onDismiss: (id: string) => void
}

function NotificationIcon({ type, severity }: { type: string; severity: string }) {
  const getIcon = () => {
    switch (type) {
      case 'SUCCESS':
        return <CheckCircle className="h-4 w-4" />
      case 'WARNING':
        return <AlertTriangle className="h-4 w-4" />
      case 'ERROR':
        return <AlertCircle className="h-4 w-4" />
      case 'INFO':
      default:
        return <Info className="h-4 w-4" />
    }
  }

  const getColorClass = () => {
    if (severity === 'CRITICAL') {
      return 'text-red-500 bg-red-100 dark:bg-red-900/20'
    }
    
    switch (type) {
      case 'SUCCESS':
        return 'text-green-500 bg-green-100 dark:bg-green-900/20'
      case 'WARNING':
        return 'text-yellow-500 bg-yellow-100 dark:bg-yellow-900/20'
      case 'ERROR':
        return 'text-red-500 bg-red-100 dark:bg-red-900/20'
      case 'INFO':
      default:
        return 'text-blue-500 bg-blue-100 dark:bg-blue-900/20'
    }
  }

  return (
    <div className={cn('flex items-center justify-center w-8 h-8 rounded-full', getColorClass())}>
      {getIcon()}
    </div>
  )
}

function NotificationItem({ notification, onMarkRead, onDismiss }: NotificationItemProps) {
  const formatTimeAgo = (timestamp: string) => {
    const now = new Date()
    const time = new Date(timestamp)
    const diffInMs = now.getTime() - time.getTime()
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
    const diffInHours = Math.floor(diffInMinutes / 60)
    const diffInDays = Math.floor(diffInHours / 24)

    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInHours < 24) return `${diffInHours}h ago`
    if (diffInDays < 7) return `${diffInDays}d ago`
    return time.toLocaleDateString()
  }

  const getPriorityBorder = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return 'border-l-4 border-l-red-500'
      case 'HIGH':
        return 'border-l-4 border-l-orange-500'
      case 'MEDIUM':
        return 'border-l-4 border-l-yellow-500'
      case 'LOW':
      default:
        return 'border-l-4 border-l-blue-500'
    }
  }

  return (
    <div className={cn(
      'flex items-start gap-3 p-4 hover:bg-muted/50 transition-colors',
      !notification.read && 'bg-blue-50/50 dark:bg-blue-950/20',
      getPriorityBorder(notification.severity)
    )}>
      <NotificationIcon type={notification.type} severity={notification.severity} />
      
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h4 className={cn(
              'text-sm font-medium text-foreground line-clamp-1',
              !notification.read && 'font-semibold'
            )}>
              {notification.title}
            </h4>
            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
              {notification.message}
            </p>
            
            <div className="flex items-center gap-2 mt-2">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                {formatTimeAgo(notification.timestamp)}
              </div>
              
              {notification.domain && (
                <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                  {notification.domain}
                </Badge>
              )}
              
              {notification.severity === 'CRITICAL' && (
                <Badge variant="destructive" className="text-xs px-1.5 py-0.5">
                  Critical
                </Badge>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-1 ml-2">
            {!notification.read && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onMarkRead(notification.id)}
                      className="h-6 w-6 p-0 hover:bg-blue-100 dark:hover:bg-blue-900/20"
                    >
                      <Check className="h-3 w-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Mark as read</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDismiss(notification.id)}
                    className="h-6 w-6 p-0 hover:bg-red-100 dark:hover:bg-red-900/20"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Dismiss</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </div>
    </div>
  )
}

export function LiveNotificationCenter({
  notifications,
  unreadCount,
  criticalAlerts,
  onMarkRead,
  onMarkAllRead,
  onDismiss,
  onSettingsClick,
  className,
  maxDisplayCount = 10
}: LiveNotificationCenterProps) {
  const [filterType, setFilterType] = useState<'all' | 'unread' | 'critical'>('all')

  const filteredNotifications = notifications.filter(notification => {
    switch (filterType) {
      case 'unread':
        return !notification.read
      case 'critical':
        return notification.severity === 'CRITICAL'
      case 'all':
      default:
        return true
    }
  }).slice(0, maxDisplayCount)

  const hasNotifications = notifications.length > 0
  const hasUnread = unreadCount > 0
  const hasCritical = criticalAlerts > 0

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className={cn('relative', className)}
        >
          {hasUnread || hasCritical ? (
            <BellDot className="h-4 w-4" />
          ) : (
            <Bell className="h-4 w-4" />
          )}
          
          {/* Notification Badge */}
          {(hasUnread || hasCritical) && (
            <Badge 
              className={cn(
                'absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs',
                hasCritical 
                  ? 'bg-red-500 text-white animate-pulse' 
                  : 'bg-blue-500 text-white'
              )}
            >
              {hasCritical ? criticalAlerts : hasUnread ? unreadCount : 0}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-96 p-0">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-foreground">Notifications</h3>
            {hasUnread && (
              <Badge variant="secondary" className="text-xs">
                {unreadCount} new
              </Badge>
            )}
            {hasCritical && (
              <Badge variant="destructive" className="text-xs animate-pulse">
                {criticalAlerts} critical
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-1">
            {/* Filter Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                  <Filter className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setFilterType('all')}>
                  <div className="flex items-center gap-2">
                    All Notifications
                    {filterType === 'all' && <Check className="h-3 w-3" />}
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterType('unread')}>
                  <div className="flex items-center gap-2">
                    Unread Only
                    {filterType === 'unread' && <Check className="h-3 w-3" />}
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterType('critical')}>
                  <div className="flex items-center gap-2">
                    Critical Only
                    {filterType === 'critical' && <Check className="h-3 w-3" />}
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Settings */}
            {onSettingsClick && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={onSettingsClick}
                      className="h-7 w-7 p-0"
                    >
                      <Settings className="h-3 w-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Notification settings</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        </div>

        {/* Actions */}
        {hasNotifications && (
          <div className="flex items-center justify-between p-3 bg-muted/30 border-b">
            <span className="text-xs text-muted-foreground">
              {filteredNotifications.length} of {notifications.length} notifications
            </span>
            
            <div className="flex items-center gap-2">
              {hasUnread && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onMarkAllRead}
                  className="h-7 text-xs px-2 hover:bg-blue-100 dark:hover:bg-blue-900/20"
                >
                  <CheckCheck className="h-3 w-3 mr-1" />
                  Mark all read
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Notifications List */}
        <ScrollArea className="max-h-96">
          {filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <Bell className="h-8 w-8 text-muted-foreground mb-3" />
              <h4 className="font-medium text-foreground mb-1">
                {filterType === 'all' ? 'No notifications' : 
                 filterType === 'unread' ? 'No unread notifications' :
                 'No critical notifications'}
              </h4>
              <p className="text-sm text-muted-foreground">
                {filterType === 'all' ? 'You\'re all caught up!' : 
                 'Try changing the filter to see more notifications.'}
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {filteredNotifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkRead={onMarkRead}
                  onDismiss={onDismiss}
                />
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        {notifications.length > maxDisplayCount && (
          <div className="p-3 border-t bg-muted/30 text-center">
            <Button variant="ghost" size="sm" className="text-xs">
              View all {notifications.length} notifications
            </Button>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// Simplified version for mobile/constrained spaces
export function LiveNotificationCenterCompact(props: LiveNotificationCenterProps) {
  return (
    <LiveNotificationCenter 
      {...props} 
      className={cn('lg:hidden', props.className)}
      maxDisplayCount={5}
    />
  )
}