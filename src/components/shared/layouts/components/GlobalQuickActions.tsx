/**
 * Global Quick Actions Component
 * Enterprise-Grade System Control Panel
 * Bergizi-ID SaaS Platform - Phase 1 Implementation
 */

'use client'

import React, { useState } from 'react'
import {
  Settings,
  Radio,
  AlertTriangle,
  Shield,
  Activity,
  BarChart3,
  RefreshCw,
  Power,
  Users,
  Database,
  Globe,
  MessageSquare,
  Zap
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { LayoutUser } from '@/types/layout'

export interface GlobalQuickActionsProps {
  user: LayoutUser
  className?: string
  onBroadcastMessage?: () => void
  onEmergencyControl?: () => void
  onSystemSettings?: () => void
  onUserManagement?: () => void
  onSystemAnalytics?: () => void
  onMaintenanceMode?: () => void
}

interface QuickAction {
  id: string
  label: string
  icon: React.ReactNode
  description: string
  requiredRoles: string[]
  variant?: 'default' | 'warning' | 'destructive'
  badge?: string | number
  onClick: () => void
}

// Permission checking helper
function hasPermission(userRole: string, requiredRoles: string[]): boolean {
  // Platform superadmin has all permissions
  if (userRole === 'PLATFORM_SUPERADMIN') return true
  
  // Check if user role matches any required role
  return requiredRoles.includes(userRole)
}

export function GlobalQuickActions({
  user,
  className,
  onBroadcastMessage,
  onEmergencyControl,
  onSystemSettings,
  onUserManagement,
  onSystemAnalytics,
  onMaintenanceMode
}: GlobalQuickActionsProps) {
  const [emergencyDialogOpen, setEmergencyDialogOpen] = useState(false)
  const [maintenanceDialogOpen, setMaintenanceDialogOpen] = useState(false)

  // Define quick actions based on user permissions
  const quickActions: QuickAction[] = [
    {
      id: 'broadcast',
      label: 'Broadcast Message',
      icon: <Radio className="h-4 w-4" />,
      description: 'Send system-wide message to all users',
      requiredRoles: ['PLATFORM_SUPERADMIN', 'PLATFORM_SUPPORT', 'SPPG_KEPALA'],
      onClick: () => onBroadcastMessage?.()
    },
    {
      id: 'emergency',
      label: 'Emergency Controls',
      icon: <AlertTriangle className="h-4 w-4" />,
      description: 'Access emergency system controls',
      requiredRoles: ['PLATFORM_SUPERADMIN', 'PLATFORM_SUPPORT'],
      variant: 'warning' as const,
      onClick: () => setEmergencyDialogOpen(true)
    },
    {
      id: 'users',
      label: 'User Management',
      icon: <Users className="h-4 w-4" />,
      description: 'Manage users and permissions',
      requiredRoles: ['PLATFORM_SUPERADMIN', 'SPPG_KEPALA', 'SPPG_ADMIN'],
      onClick: () => onUserManagement?.()
    },
    {
      id: 'analytics',
      label: 'System Analytics',
      icon: <BarChart3 className="h-4 w-4" />,
      description: 'View platform analytics and insights',
      requiredRoles: ['PLATFORM_SUPERADMIN', 'PLATFORM_ANALYST', 'SPPG_KEPALA'],
      onClick: () => onSystemAnalytics?.()
    },
    {
      id: 'maintenance',
      label: 'Maintenance Mode',
      icon: <Shield className="h-4 w-4" />,
      description: 'Enable/disable maintenance mode',
      requiredRoles: ['PLATFORM_SUPERADMIN'],
      variant: 'destructive' as const,
      onClick: () => setMaintenanceDialogOpen(true)
    },
    {
      id: 'settings',
      label: 'System Settings',
      icon: <Settings className="h-4 w-4" />,
      description: 'Configure system settings',
      requiredRoles: ['PLATFORM_SUPERADMIN', 'PLATFORM_SUPPORT', 'SPPG_KEPALA'],
      onClick: () => onSystemSettings?.()
    }
  ]

  // Filter actions based on user permissions
  const availableActions = quickActions.filter(action => 
    hasPermission(user.userRole, action.requiredRoles)
  )

  // Get action variant styles
  const getActionStyles = (variant?: string, hasAccess?: boolean) => {
    if (!hasAccess) {
      return 'text-muted-foreground cursor-not-allowed'
    }
    
    switch (variant) {
      case 'warning':
        return 'text-orange-600 hover:text-orange-700 hover:bg-orange-50 dark:text-orange-400 dark:hover:bg-orange-950/20'
      case 'destructive':
        return 'text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/20'
      default:
        return 'text-foreground hover:bg-accent hover:text-accent-foreground'
    }
  }

  // Quick action buttons for header
  const criticalActions = availableActions.filter(action => 
    ['emergency', 'broadcast'].includes(action.id)
  )

  if (availableActions.length === 0) {
    return null
  }

  return (
    <>
      <div className={cn('flex items-center gap-1', className)}>
        {/* Critical Actions - Always visible */}
        {criticalActions.map((action) => (
          <TooltipProvider key={action.id}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={action.onClick}
                  className={cn(
                    'h-8 w-8 p-0',
                    getActionStyles(action.variant, true)
                  )}
                >
                  {action.icon}
                  {action.badge && (
                    <Badge className="absolute -top-1 -right-1 h-4 w-4 rounded-full p-0 flex items-center justify-center text-xs">
                      {action.badge}
                    </Badge>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-sm font-medium">{action.label}</p>
                <p className="text-xs text-muted-foreground">{action.description}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}

        {/* Dropdown for other actions */}
        {availableActions.length > criticalActions.length && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Zap className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            
            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuLabel className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Quick Actions
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              <DropdownMenuGroup>
                {availableActions.map((action) => (
                  <DropdownMenuItem
                    key={action.id}
                    onClick={action.onClick}
                    className={cn(
                      'flex items-center gap-3 py-2',
                      getActionStyles(action.variant, true)
                    )}
                  >
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-muted">
                      {action.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{action.label}</span>
                        {action.badge && (
                          <Badge variant="secondary" className="text-xs">
                            {action.badge}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {action.description}
                      </p>
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>

              <DropdownMenuSeparator />
              
              {/* User context info */}
              <div className="px-2 py-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Globe className="h-3 w-3" />
                  <span>Role: {user.userRole}</span>
                </div>
                {user.sppgName && (
                  <div className="flex items-center gap-2 mt-1">
                    <Database className="h-3 w-3" />
                    <span className="line-clamp-1">{user.sppgName}</span>
                  </div>
                )}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Emergency Control Dialog */}
      <Dialog open={emergencyDialogOpen} onOpenChange={setEmergencyDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-orange-600">
              <AlertTriangle className="h-5 w-5" />
              Emergency Controls
            </DialogTitle>
            <DialogDescription>
              Access emergency system controls. Use with caution.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-3 py-4">
            <Button
              variant="outline"
              className="justify-start gap-3 h-12"
              onClick={() => {
                onEmergencyControl?.()
                setEmergencyDialogOpen(false)
              }}
            >
              <Power className="h-4 w-4 text-red-500" />
              <div className="text-left">
                <div className="font-medium">System Shutdown</div>
                <div className="text-xs text-muted-foreground">Graceful system shutdown</div>
              </div>
            </Button>
            
            <Button
              variant="outline"
              className="justify-start gap-3 h-12"
              onClick={() => {
                // Handle force refresh
                window.location.reload()
                setEmergencyDialogOpen(false)
              }}
            >
              <RefreshCw className="h-4 w-4 text-blue-500" />
              <div className="text-left">
                <div className="font-medium">Force Refresh</div>
                <div className="text-xs text-muted-foreground">Reload all system components</div>
              </div>
            </Button>
            
            <Button
              variant="outline"
              className="justify-start gap-3 h-12"
              onClick={() => {
                onBroadcastMessage?.()
                setEmergencyDialogOpen(false)
              }}
            >
              <MessageSquare className="h-4 w-4 text-orange-500" />
              <div className="text-left">
                <div className="font-medium">Emergency Broadcast</div>
                <div className="text-xs text-muted-foreground">Send urgent message to all users</div>
              </div>
            </Button>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setEmergencyDialogOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Maintenance Mode Dialog */}
      <Dialog open={maintenanceDialogOpen} onOpenChange={setMaintenanceDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Shield className="h-5 w-5" />
              Maintenance Mode
            </DialogTitle>
            <DialogDescription>
              Enable maintenance mode to prevent user access during system updates.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                <div>
                  <h4 className="font-medium text-yellow-800 dark:text-yellow-200">
                    System Impact Warning
                  </h4>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                    This will block all user access except platform administrators.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setMaintenanceDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={() => {
                onMaintenanceMode?.()
                setMaintenanceDialogOpen(false)
              }}
            >
              Enable Maintenance Mode
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

// Compact variant for mobile/constrained spaces
export function GlobalQuickActionsCompact(props: GlobalQuickActionsProps) {
  const { user } = props
  
  // Only show most critical actions in compact mode
  const criticalActions = ['emergency', 'broadcast']
  
  return (
    <div className="flex items-center gap-1">
      {criticalActions.map((actionId) => {
        const hasAccess = hasPermission(user.userRole, 
          actionId === 'emergency' 
            ? ['PLATFORM_SUPERADMIN', 'PLATFORM_SUPPORT']
            : ['PLATFORM_SUPERADMIN', 'PLATFORM_SUPPORT', 'SPPG_KEPALA']
        )
        
        if (!hasAccess) return null
        
        return (
          <Button
            key={actionId}
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={actionId === 'emergency' ? props.onEmergencyControl : props.onBroadcastMessage}
          >
            {actionId === 'emergency' ? 
              <AlertTriangle className="h-4 w-4 text-orange-500" /> :
              <Radio className="h-4 w-4" />
            }
          </Button>
        )
      })}
    </div>
  )
}