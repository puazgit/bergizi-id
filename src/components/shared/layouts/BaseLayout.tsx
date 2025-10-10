// Enterprise Layout Components - Base Components
// Bergizi-ID SaaS - Modular & Reusable Layout System

'use client'

import React, { useState } from 'react'
import { BaseLayoutProps } from '@/types/layout'
import { Header } from '@/components/shared/layouts/Header'
import { Sidebar } from '@/components/shared/layouts/ModularSidebar'
import { MobileNavigation } from '@/components/shared/layouts/MobileNavigation'
import { cn } from '@/lib/utils'

export function BaseLayout({ children, user, config, className }: BaseLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    config.layout.sidebarDefaultCollapsed || false
  )

  return (
    <div className={cn("min-h-screen bg-background", className)}>
      <div className="flex h-screen overflow-hidden">
        {/* Desktop Sidebar */}
        <Sidebar
          user={user}
          config={config}
          open={!sidebarCollapsed}
          onOpenChange={setSidebarCollapsed}
          className="hidden lg:flex"
        />

        {/* Mobile Navigation */}
        <MobileNavigation
          user={user}
          config={config}
          open={sidebarOpen}
          onOpenChange={setSidebarOpen}
        />

        {/* Main Content Area */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Header */}
          <Header
            user={user}
            config={config}
            sidebarOpen={sidebarCollapsed}
            onSidebarToggle={() => {
              // Desktop: toggle collapsed state
              // Mobile: toggle open state
              if (window.innerWidth >= 1024) {
                setSidebarCollapsed(!sidebarCollapsed)
              } else {
                setSidebarOpen(!sidebarOpen)
              }
            }}
          />

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto">
            <div 
              className={cn(
                "mx-auto px-4 py-6",
                config.layout.containerMaxWidth || "max-w-7xl"
              )}
            >
              {children}
            </div>
          </main>

          {/* Footer */}
          {config.footer?.show && (
            <footer className="border-t bg-background px-4 py-4">
              <div className={cn(
                "mx-auto flex items-center justify-between text-sm text-muted-foreground",
                config.layout.containerMaxWidth || "max-w-7xl"
              )}>
                <div>
                  {config.footer.copyright || `© ${new Date().getFullYear()} ${config.brand.name}`}
                </div>
                {config.footer.links && (
                  <div className="flex space-x-4">
                    {config.footer.links.map((link) => (
                      <a
                        key={link.href}
                        href={link.href}
                        className="hover:text-foreground transition-colors"
                      >
                        {link.name}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </footer>
          )}
        </div>
      </div>
    </div>
  )
}