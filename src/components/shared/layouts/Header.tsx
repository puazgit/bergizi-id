// Enterprise Header Component - Modular & Reusable
// Bergizi-ID SaaS Platform - Multi-tenant Layout System
// Phase 1: Enhanced with Global Status & Real-Time Monitoring

'use client'

import React from 'react'
import Link from 'next/link'
import { Menu, X, Search } from 'lucide-react'
import { HeaderProps } from '@/types/layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { UserMenu } from '@/components/auth/UserMenu'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { cn } from '@/lib/utils'

// Phase 1: Global Status Components & Hooks
import { useGlobalRealTime } from '@/hooks/shared/useGlobalRealTime'
import {
  GlobalStatusIndicator,
  GlobalStatusIndicatorCompact,
  LiveNotificationCenter,
  LiveNotificationCenterCompact
} from './components'

export function Header({ 
  user, 
  config, 
  sidebarOpen = false,
  onSidebarToggle,
  className 
}: HeaderProps) {
  // Phase 1: Global Real-Time Status Hook
  const {
    websocketStatus,
    systemHealth,
    notifications,
    unreadCount,
    criticalAlerts,
    isLoading,
    markNotificationRead,
    markAllNotificationsRead,
    dismissNotification,
    forceRefresh
  } = useGlobalRealTime()

  // Phase 1: Handler functions for status monitoring
  const handleStatusClick = async (type: 'websocket' | 'system' | 'redis') => {
    console.log(`📊 Status clicked: ${type}`, {
      websocketStatus: websocketStatus.status,
      systemHealth: systemHealth.overall,
      type
    })
    
    // Force refresh system health when status is clicked
    if (type === 'system') {
      await forceRefresh()
    }
    
    // TODO: Implement status detail modal
  }

  return (
    <header className={cn(
      "flex h-16 items-center justify-between border-b bg-background px-4 lg:px-6",
      className
    )}>
      {/* Left Section */}
      <div className="flex items-center space-x-4">
        {/* Sidebar Toggle - Mobile & Desktop */}
        {onSidebarToggle && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onSidebarToggle}
            className="p-2"
            aria-label="Toggle sidebar"
          >
            {sidebarOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        )}

        {/* Brand - Mobile Only */}
        <div className="lg:hidden">
          <Link 
            href={config.brand.homeUrl}
            className="flex items-center space-x-2"
          >
            {config.brand.logo ? (
              <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">
                  {config.brand.name.charAt(0)}
                </span>
              </div>
            ) : (
              <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">
                  {config.brand.name.charAt(0)}
                </span>
              </div>
            )}
            <div className="flex flex-col">
              <span className="font-semibold text-sm">{config.brand.name}</span>
              {config.brand.subtitle && (
                <span className="text-xs text-muted-foreground">
                  {config.brand.subtitle}
                </span>
              )}
            </div>
          </Link>
        </div>

        {/* Phase 1: Global Status Indicator - Desktop */}
        {user && (
          <div className="hidden lg:flex">
            <GlobalStatusIndicator
              websocketStatus={websocketStatus}
              systemHealth={systemHealth}
              onStatusClick={handleStatusClick}
              variant="full"
              userRole={user.userRole}
              isLoading={isLoading}
              // Remove displayMode - let component auto-detect based on userRole
            />
          </div>
        )}

        {/* Search - Desktop Only */}
        {config.navigation.showSearch && (
          <div className="hidden lg:flex w-96">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari menu, laporan, atau pengaturan..."
                className="pl-10"
              />
            </div>
          </div>
        )}
      </div>

      {/* Right Section */}
      <div className="flex items-center space-x-2">
        {/* Search - Mobile */}
        {config.navigation.showSearch && (
          <Button variant="ghost" size="sm" className="lg:hidden">
            <Search className="h-4 w-4" />
          </Button>
        )}

        {/* Phase 1: Global Status Indicator - Mobile */}
        {user && (
          <div className="lg:hidden">
            <GlobalStatusIndicatorCompact
              websocketStatus={websocketStatus}
              systemHealth={systemHealth}
              onStatusClick={handleStatusClick}
              userRole={user.userRole}
              isLoading={isLoading}
              // Remove displayMode - let component auto-detect based on userRole
            />
          </div>
        )}

        {/* Phase 1: Live Notification Center - Replaces old notifications */}
        {config.navigation.showNotifications && user && (
          <>
            {/* Desktop Notification Center */}
            <div className="hidden lg:block">
              <LiveNotificationCenter
                notifications={notifications}
                unreadCount={unreadCount}
                criticalAlerts={criticalAlerts}
                onMarkRead={markNotificationRead}
                onMarkAllRead={markAllNotificationsRead}
                onDismiss={dismissNotification}
                onSettingsClick={() => console.log('Notification settings')}
              />
            </div>
            
            {/* Mobile Notification Center */}
            <div className="lg:hidden">
              <LiveNotificationCenterCompact
                notifications={notifications}
                unreadCount={unreadCount}
                criticalAlerts={criticalAlerts}
                onMarkRead={markNotificationRead}
                onMarkAllRead={markAllNotificationsRead}
                onDismiss={dismissNotification}
              />
            </div>
          </>
        )}

        {/* Theme Toggle */}
        {config.theme.showThemeToggle && <ThemeToggle />}

        {/* User Menu */}
        {config.navigation.showUserMenu && user && <UserMenu />}

        {/* Login Button - Guest */}
        {config.navigation.showUserMenu && !user && (
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/login">Masuk</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/register">Daftar</Link>
            </Button>
          </div>
        )}
      </div>
    </header>
  )
}