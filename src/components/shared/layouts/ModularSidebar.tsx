// Enterprise Sidebar Component - Modular & Reusable
// Bergizi-ID SaaS Platform - Multi-tenant Layout System

'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronDown, ChevronRight, ChevronLeft } from 'lucide-react'
import { SidebarProps, NavigationGroup, NavigationItem } from '@/types/layout'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { 
  ClientOnlyCollapsible, 
  ClientOnlyCollapsibleContent, 
  ClientOnlyCollapsibleTrigger 
} from './ClientOnlyCollapsible'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { hasPermission } from '@/lib/auth-permissions'
import { UserRole, PermissionType } from '@prisma/client'

export function Sidebar({ user, config, open = true, className }: SidebarProps) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(!open)
  const [expandedGroups, setExpandedGroups] = useState<string[]>(
    config.navigation.groups
      .filter(group => group.defaultExpanded)
      .map(group => group.id)
  )

  // Check if user has access to navigation item
  const hasAccess = (item: NavigationItem): boolean => {
    if (!user) return false

    // Check required roles
    if (item.requiredRoles && !item.requiredRoles.includes(user.userRole)) {
      return false
    }

    // Check required permissions
    if (item.requiredPermissions && user.userRole) {
      return item.requiredPermissions.some(permission => 
        hasPermission(user.userRole as UserRole, permission as PermissionType)
      )
    }

    return true
  }

  // Check if user has access to navigation group
  const hasGroupAccess = (group: NavigationGroup): boolean => {
    if (!user) return false

    // Check required roles for group
    if (group.requiredRoles && !group.requiredRoles.includes(user.userRole)) {
      return false
    }

    // Check if user has access to at least one item in the group
    return group.items.some(item => hasAccess(item))
  }

  // Toggle group expansion
  const toggleGroup = (groupId: string) => {
    setExpandedGroups(prev =>
      prev.includes(groupId)
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId]
    )
  }

  // Check if navigation item is active
  const isActiveItem = (item: NavigationItem): boolean => {
    if (item.href === pathname) return true
    if (item.children) {
      return item.children.some(child => isActiveItem(child))
    }
    return pathname.startsWith(item.href) && item.href !== '/'
  }

  return (
    <div className={cn(
      "flex flex-col border-r bg-background transition-all duration-200 ease-in-out",
      collapsed ? "w-16" : "w-64",
      className
    )}>
      {/* Brand Section */}
      <div className="flex h-16 items-center justify-between border-b px-4">
        {!collapsed && (
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
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(!collapsed)}
          className="h-8 w-8 p-0"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1">
        <nav className="p-2 space-y-1">
          {config.navigation.groups
            .filter(group => hasGroupAccess(group))
            .map((group) => (
              <div key={group.id}>
                {/* Group Header */}
                {!collapsed && group.name && (
                  <div className="px-3 py-2">
                    {group.collapsible ? (
                      <ClientOnlyCollapsible
                        open={expandedGroups.includes(group.id)}
                        onOpenChange={() => toggleGroup(group.id)}
                      >
                        <ClientOnlyCollapsibleTrigger 
                          className="flex w-full items-center justify-between text-xs font-semibold text-muted-foreground uppercase tracking-wide hover:text-foreground"
                          id={`sidebar-group-trigger-${group.id}`}
                        >
                          <span>{group.name}</span>
                          {expandedGroups.includes(group.id) ? (
                            <ChevronDown className="h-3 w-3" />
                          ) : (
                            <ChevronRight className="h-3 w-3" />
                          )}
                        </ClientOnlyCollapsibleTrigger>
                      </ClientOnlyCollapsible>
                    ) : (
                      <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        {group.name}
                      </div>
                    )}
                  </div>
                )}

                {/* Group Items */}
                <div className={cn(
                  "space-y-1",
                  collapsed && "flex flex-col items-center"
                )}>
                  {group.collapsible ? (
                    <ClientOnlyCollapsible
                      open={expandedGroups.includes(group.id)}
                      onOpenChange={() => toggleGroup(group.id)}
                    >
                      <ClientOnlyCollapsibleContent className="space-y-1">
                        {group.items
                          .filter(item => hasAccess(item))
                          .map((item) => (
                            <NavigationItemComponent
                              key={item.id}
                              item={item}
                              isActive={isActiveItem(item)}
                              collapsed={collapsed}
                            />
                          ))}
                      </ClientOnlyCollapsibleContent>
                    </ClientOnlyCollapsible>
                  ) : (
                    <>
                      {group.items
                        .filter(item => hasAccess(item))
                        .map((item) => (
                          <NavigationItemComponent
                            key={item.id}
                            item={item}
                            isActive={isActiveItem(item)}
                            collapsed={collapsed}
                          />
                        ))}
                    </>
                  )}
                </div>
              </div>
            ))}
        </nav>
      </ScrollArea>

      {/* Footer with Theme Toggle */}
      <div className="border-t p-4">
        <div className={cn(
          'flex items-center',
          collapsed ? 'justify-center' : 'justify-between'
        )}>
          {!collapsed && user && (
            <div className="flex items-center space-x-2">
              <div className="h-6 w-6 bg-primary rounded-full flex items-center justify-center">
                <span className="text-primary-foreground text-xs font-medium">
                  {user.name?.charAt(0) || user.email.charAt(0)}
                </span>
              </div>
              <div className="flex flex-col min-w-0">
                <div className="text-xs font-medium truncate">{user.name || user.email}</div>
                <div className="text-xs text-muted-foreground">v1.0.0</div>
              </div>
            </div>
          )}
          <ThemeToggle />
        </div>
      </div>
    </div>
  )
}

// Navigation Item Component with nested children support
interface NavigationItemComponentProps {
  item: NavigationItem
  isActive: boolean
  collapsed: boolean
}

function NavigationItemComponent({ item, isActive, collapsed }: NavigationItemComponentProps) {
  const Icon = item.icon
  const pathname = usePathname()
  const [isExpanded, setIsExpanded] = React.useState(
    item.children ? item.children.some(child => pathname === child.href || pathname.startsWith(child.href)) : false
  )

  // If item has children, render as collapsible menu
  if (item.children && item.children.length > 0 && !collapsed) {
    return (
      <div className="space-y-1">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <Icon className="h-4 w-4 mr-2" />
          <span className="flex-1">{item.name}</span>
          {item.badge && (
            <Badge variant="secondary" className="ml-2 h-5">
              {item.badge}
            </Badge>
          )}
          {isExpanded ? (
            <ChevronDown className="h-4 w-4 ml-2" />
          ) : (
            <ChevronRight className="h-4 w-4 ml-2" />
          )}
        </Button>
        
        {isExpanded && (
          <div className="ml-6 space-y-1">
            {item.children.map((child) => {
              const ChildIcon = child.icon
              const isChildActive = pathname === child.href || pathname.startsWith(child.href)
              
              return (
                <Button
                  key={child.id}
                  variant={isChildActive ? "default" : "ghost"}
                  size="sm"
                  className={cn(
                    "w-full justify-start",
                    isChildActive && "bg-primary text-primary-foreground"
                  )}
                  asChild
                >
                  <Link href={child.href}>
                    {ChildIcon && <ChildIcon className="h-4 w-4 mr-2" />}
                    <span className="flex-1">{child.name}</span>
                    {child.badge && (
                      <Badge variant="secondary" className="ml-auto h-5">
                        {child.badge}
                      </Badge>
                    )}
                  </Link>
                </Button>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  // Simple navigation item without children
  return (
    <Button
      variant={isActive ? "default" : "ghost"}
      size="sm"
      className={cn(
        "w-full justify-start",
        collapsed && "justify-center px-2",
        isActive && "bg-primary text-primary-foreground"
      )}
      asChild
    >
      <Link href={item.href}>
        <Icon className={cn("h-4 w-4", !collapsed && "mr-2")} />
        {!collapsed && (
          <>
            <span className="flex-1">{item.name}</span>
            {item.badge && (
              <Badge variant="secondary" className="ml-auto h-5">
                {item.badge}
              </Badge>
            )}
          </>
        )}
      </Link>
    </Button>
  )
}