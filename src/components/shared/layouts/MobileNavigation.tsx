// Enterprise Mobile Navigation Component - Modular & Responsive
// Bergizi-ID SaaS Platform - Multi-tenant Layout System

'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { X, ChevronDown, ChevronRight } from 'lucide-react'
import { MobileNavigationProps, NavigationGroup, NavigationItem } from '@/types/layout'
import { UserRole, PermissionType } from '@prisma/client'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  ClientOnlyCollapsible, 
  ClientOnlyCollapsibleContent, 
  ClientOnlyCollapsibleTrigger 
} from './ClientOnlyCollapsible'
import { cn } from '@/lib/utils'
import { hasPermission } from '@/lib/auth-permissions'

export function MobileNavigation({ 
  user, 
  config, 
  open, 
  onOpenChange, 
  className 
}: MobileNavigationProps) {
  const pathname = usePathname()
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

  // Close navigation on link click
  const handleLinkClick = () => {
    onOpenChange?.(false)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent 
        side="left" 
        className={cn("w-80 p-0", className)}
      >
        <SheetHeader className="border-b p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {config.brand.logo ? (
                <div className="h-10 w-10 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-primary-foreground font-bold">
                    {config.brand.name.charAt(0)}
                  </span>
                </div>
              ) : (
                <div className="h-10 w-10 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-primary-foreground font-bold">
                    {config.brand.name.charAt(0)}
                  </span>
                </div>
              )}
              <div className="flex flex-col">
                <SheetTitle className="text-left font-semibold">
                  {config.brand.name}
                </SheetTitle>
                {config.brand.subtitle && (
                  <span className="text-sm text-muted-foreground">
                    {config.brand.subtitle}
                  </span>
                )}
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange?.(false)}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </SheetHeader>

        <ScrollArea className="flex-1 px-6">
          <nav className="py-6 space-y-6">
            {config.navigation.groups
              .filter(group => hasGroupAccess(group))
              .map((group) => (
                <div key={group.id}>
                  {/* Group Header */}
                  {group.name && (
                    <div className="mb-3">
                      {group.collapsible ? (
                        <ClientOnlyCollapsible
                          open={expandedGroups.includes(group.id)}
                          onOpenChange={() => toggleGroup(group.id)}
                        >
                          <ClientOnlyCollapsibleTrigger 
                            className="flex w-full items-center justify-between text-sm font-semibold text-muted-foreground uppercase tracking-wide hover:text-foreground"
                            id={`mobile-group-trigger-${group.id}`}
                          >
                            <span>{group.name}</span>
                            {expandedGroups.includes(group.id) ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                          </ClientOnlyCollapsibleTrigger>
                        </ClientOnlyCollapsible>
                      ) : (
                        <div className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                          {group.name}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Group Items */}
                  <div className="space-y-1">
                    {group.collapsible ? (
                      <ClientOnlyCollapsible
                        open={expandedGroups.includes(group.id)}
                        onOpenChange={() => toggleGroup(group.id)}
                      >
                        <ClientOnlyCollapsibleContent className="space-y-1">
                          {group.items
                            .filter(item => hasAccess(item))
                            .map((item) => (
                              <MobileNavigationItem
                                key={item.id}
                                item={item}
                                isActive={isActiveItem(item)}
                                onLinkClick={handleLinkClick}
                              />
                            ))}
                        </ClientOnlyCollapsibleContent>
                      </ClientOnlyCollapsible>
                    ) : (
                      <>
                        {group.items
                          .filter(item => hasAccess(item))
                          .map((item) => (
                            <MobileNavigationItem
                              key={item.id}
                              item={item}
                              isActive={isActiveItem(item)}
                              onLinkClick={handleLinkClick}
                            />
                          ))}
                      </>
                    )}
                  </div>
                </div>
              ))}
          </nav>
        </ScrollArea>

        {/* User Info - Bottom */}
        {user && (
          <div className="border-t p-6">
            <div className="flex items-center space-x-3">
              <div className="h-12 w-12 bg-primary rounded-full flex items-center justify-center">
                <span className="text-primary-foreground font-medium">
                  {user.name?.charAt(0) || user.email.charAt(0)}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm truncate">{user.name || user.email}</div>
                <div className="text-xs text-muted-foreground truncate">
                  {user.sppgName || 'Platform User'}
                </div>
                <Badge variant="secondary" className="mt-1 text-xs">
                  {user.userRole.replace('SPPG_', '').replace('_', ' ')}
                </Badge>
              </div>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}

// Mobile Navigation Item Component
interface MobileNavigationItemProps {
  item: NavigationItem
  isActive: boolean
  onLinkClick: () => void
}

function MobileNavigationItem({ item, isActive, onLinkClick }: MobileNavigationItemProps) {
  const Icon = item.icon

  return (
    <Button
      variant={isActive ? "default" : "ghost"}
      size="sm"
      className={cn(
        "w-full justify-start h-12",
        isActive && "bg-primary text-primary-foreground"
      )}
      asChild
    >
      <Link href={item.href} onClick={onLinkClick}>
        <Icon className="h-5 w-5 mr-3" />
        <span className="flex-1 text-left">{item.name}</span>
        {item.badge && (
          <Badge variant="secondary" className="ml-auto h-5">
            {item.badge}
          </Badge>
        )}
      </Link>
    </Button>
  )
}