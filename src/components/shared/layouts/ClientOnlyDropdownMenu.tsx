/**
 * Client-Only Dropdown Menu Components
 * Prevents hydration mismatch issues with Radix UI dropdown menus
 * Bergizi-ID SaaS Platform - Hydration Fix
 */

'use client'

import { useState, useEffect } from 'react'
import {
  DropdownMenu,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface ClientOnlyDropdownMenuProps {
  children: React.ReactNode
  onOpenChange?: (open: boolean) => void
}

export function ClientOnlyDropdownMenu({ 
  children, 
  onOpenChange
}: ClientOnlyDropdownMenuProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Return a placeholder during SSR to prevent hydration mismatch
  if (!mounted) {
    return (
      <div>
        {children}
      </div>
    )
  }

  return (
    <DropdownMenu onOpenChange={onOpenChange}>
      {children}
    </DropdownMenu>
  )
}

interface ClientOnlyDropdownMenuTriggerProps {
  children: React.ReactNode
  asChild?: boolean
  className?: string
  id?: string
}

export function ClientOnlyDropdownMenuTrigger({ 
  children, 
  asChild = false,
  className,
  id
}: ClientOnlyDropdownMenuTriggerProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className={className}>
        {children}
      </div>
    )
  }

  return (
    <DropdownMenuTrigger asChild={asChild} className={className} id={id}>
      {children}
    </DropdownMenuTrigger>
  )
}

// Re-export other dropdown menu components as they don't cause hydration issues
export {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'