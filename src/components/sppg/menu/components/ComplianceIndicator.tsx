/**
 * ComplianceIndicator Component
 * 
 * Displays nutrition compliance status with color-coded badges
 * Shows LOW/ADEQUATE/EXCESSIVE status for nutrition values
 * Supports dark mode and different sizes
 * 
 * @module components/sppg/menu/components/ComplianceIndicator
 */

'use client'

import { type FC } from 'react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { CheckCircle2, TrendingUp, TrendingDown } from 'lucide-react'

type ComplianceStatus = 'LOW' | 'ADEQUATE' | 'EXCESSIVE'

interface ComplianceIndicatorProps {
  status: ComplianceStatus
  percentage: number
  label?: string
  showIcon?: boolean
  showPercentage?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
  tooltip?: string
}

/**
 * Get status configuration (color, icon, text)
 */
const getStatusConfig = (status: ComplianceStatus) => {
  const configs = {
    LOW: {
      label: 'Kurang',
      color: 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800',
      icon: TrendingDown,
      iconColor: 'text-red-600 dark:text-red-400',
    },
    ADEQUATE: {
      label: 'Sesuai',
      color: 'bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800',
      icon: CheckCircle2,
      iconColor: 'text-green-600 dark:text-green-400',
    },
    EXCESSIVE: {
      label: 'Berlebih',
      color: 'bg-yellow-100 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800',
      icon: TrendingUp,
      iconColor: 'text-yellow-600 dark:text-yellow-400',
    },
  }
  return configs[status]
}

/**
 * Get size-specific classes
 */
const getSizeClasses = (size: 'sm' | 'md' | 'lg') => {
  const classes = {
    sm: {
      badge: 'text-xs px-2 py-0.5',
      icon: 'h-3 w-3',
    },
    md: {
      badge: 'text-sm px-3 py-1',
      icon: 'h-4 w-4',
    },
    lg: {
      badge: 'text-base px-4 py-1.5',
      icon: 'h-5 w-5',
    },
  }
  return classes[size]
}

export const ComplianceIndicator: FC<ComplianceIndicatorProps> = ({
  status,
  percentage,
  label,
  showIcon = true,
  showPercentage = true,
  size = 'md',
  className,
  tooltip,
}) => {
  const config = getStatusConfig(status)
  const sizeClasses = getSizeClasses(size)
  const Icon = config.icon

  const badgeContent = (
    <Badge
      variant="outline"
      className={cn(
        'font-semibold border inline-flex items-center gap-1.5',
        config.color,
        sizeClasses.badge,
        className
      )}
    >
      {showIcon && <Icon className={cn(sizeClasses.icon, config.iconColor)} />}
      {label || config.label}
      {showPercentage && (
        <span className="font-normal opacity-90">
          ({percentage.toFixed(0)}%)
        </span>
      )}
    </Badge>
  )

  if (tooltip) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="cursor-help">{badgeContent}</span>
          </TooltipTrigger>
          <TooltipContent>
            <p>{tooltip}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  return badgeContent
}

ComplianceIndicator.displayName = 'ComplianceIndicator'

/**
 * ComplianceBar - Visual progress bar for compliance
 */
interface ComplianceBarProps {
  percentage: number
  status: ComplianceStatus
  label?: string
  showLabel?: boolean
  className?: string
}

export const ComplianceBar: FC<ComplianceBarProps> = ({
  percentage,
  status,
  label,
  showLabel = true,
  className,
}) => {
  return (
    <div className={cn('space-y-1', className)}>
      {showLabel && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">{label}</span>
          <span className={cn('font-semibold', {
            'text-red-600 dark:text-red-400': status === 'LOW',
            'text-green-600 dark:text-green-400': status === 'ADEQUATE',
            'text-yellow-600 dark:text-yellow-400': status === 'EXCESSIVE',
          })}>
            {percentage.toFixed(0)}%
          </span>
        </div>
      )}
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted dark:bg-muted/50">
        <div
          className={cn('h-full transition-all duration-300', {
            'bg-red-500 dark:bg-red-600': status === 'LOW',
            'bg-green-500 dark:bg-green-600': status === 'ADEQUATE',
            'bg-yellow-500 dark:bg-yellow-600': status === 'EXCESSIVE',
          })}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
    </div>
  )
}

ComplianceBar.displayName = 'ComplianceBar'

/**
 * ComplianceGrid - Display multiple compliance indicators in grid
 */
interface ComplianceGridProps {
  items: Array<{
    label: string
    status: ComplianceStatus
    percentage: number
    tooltip?: string
  }>
  columns?: 2 | 3 | 4
  className?: string
}

export const ComplianceGrid: FC<ComplianceGridProps> = ({
  items,
  columns = 3,
  className,
}) => {
  return (
    <div
      className={cn(
        'grid gap-3',
        {
          'grid-cols-2': columns === 2,
          'grid-cols-3': columns === 3,
          'grid-cols-4': columns === 4,
        },
        className
      )}
    >
      {items.map((item, index) => (
        <div key={index} className="flex flex-col gap-2">
          <ComplianceBar
            percentage={item.percentage}
            status={item.status}
            label={item.label}
          />
          <ComplianceIndicator
            status={item.status}
            percentage={item.percentage}
            size="sm"
            tooltip={item.tooltip}
            className="self-start"
          />
        </div>
      ))}
    </div>
  )
}

ComplianceGrid.displayName = 'ComplianceGrid'
