/**
 * Client-Only Collapsible Component
 * Prevents hydration mismatch issues with Radix UI components
 * Bergizi-ID SaaS Platform - Hydration Fix
 */

'use client'

import { useState, useEffect } from 'react'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'

interface ClientOnlyCollapsibleProps {
  children: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
  className?: string
  id?: string
}

export function ClientOnlyCollapsible({ 
  children, 
  open = false, 
  onOpenChange,
  className,
  id
}: ClientOnlyCollapsibleProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Return a placeholder during SSR to prevent hydration mismatch
  if (!mounted) {
    return (
      <div className={className}>
        {children}
      </div>
    )
  }

  return (
    <Collapsible 
      open={open} 
      onOpenChange={onOpenChange}
      className={className}
      id={id}
    >
      {children}
    </Collapsible>
  )
}

interface ClientOnlyCollapsibleTriggerProps {
  children: React.ReactNode
  className?: string
  id?: string
}

export function ClientOnlyCollapsibleTrigger({ 
  children, 
  className,
  id
}: ClientOnlyCollapsibleTriggerProps) {
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
    <CollapsibleTrigger className={className} id={id}>
      {children}
    </CollapsibleTrigger>
  )
}

interface ClientOnlyCollapsibleContentProps {
  children: React.ReactNode
  className?: string
}

export function ClientOnlyCollapsibleContent({ 
  children, 
  className 
}: ClientOnlyCollapsibleContentProps) {
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
    <CollapsibleContent className={className}>
      {children}
    </CollapsibleContent>
  )
}