/**
 * RecommendationsList Component
 * 
 * Displays nutrition recommendations with priority indicators
 * Shows actionable suggestions for improving menu compliance
 * Supports dark mode and dismissible items
 * 
 * @module components/sppg/menu/components/RecommendationsList
 */

'use client'

import { type FC, useState } from 'react'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { X, Lightbulb, AlertTriangle, Info, CheckCircle2 } from 'lucide-react'

type RecommendationPriority = 'high' | 'medium' | 'low' | 'info'

interface Recommendation {
  id: string
  message: string
  priority: RecommendationPriority
  action?: string
  onAction?: () => void
}

interface RecommendationsListProps {
  recommendations: Recommendation[]
  title?: string
  dismissible?: boolean
  onDismiss?: (id: string) => void
  className?: string
  variant?: 'full' | 'compact'
}

/**
 * Get priority configuration
 */
const getPriorityConfig = (priority: RecommendationPriority) => {
  const configs = {
    high: {
      label: 'Penting',
      icon: AlertTriangle,
      color: 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800',
      iconColor: 'text-red-600 dark:text-red-400',
      badgeColor: 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300',
    },
    medium: {
      label: 'Sedang',
      icon: Lightbulb,
      color: 'bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800',
      iconColor: 'text-yellow-600 dark:text-yellow-400',
      badgeColor: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300',
    },
    low: {
      label: 'Rendah',
      icon: Info,
      color: 'bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800',
      iconColor: 'text-blue-600 dark:text-blue-400',
      badgeColor: 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300',
    },
    info: {
      label: 'Info',
      icon: CheckCircle2,
      color: 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800',
      iconColor: 'text-green-600 dark:text-green-400',
      badgeColor: 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300',
    },
  }
  return configs[priority]
}

export const RecommendationsList: FC<RecommendationsListProps> = ({
  recommendations,
  title = 'Rekomendasi',
  dismissible = true,
  onDismiss,
  className,
  variant = 'full',
}) => {
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set())

  const handleDismiss = (id: string) => {
    setDismissedIds((prev) => new Set(prev).add(id))
    onDismiss?.(id)
  }

  const visibleRecommendations = recommendations.filter((rec) => !dismissedIds.has(rec.id))

  if (visibleRecommendations.length === 0) {
    return null
  }

  if (variant === 'compact') {
    return (
      <div className={cn('space-y-2', className)}>
        {visibleRecommendations.map((rec) => {
          const config = getPriorityConfig(rec.priority)
          const Icon = config.icon

          return (
            <div
              key={rec.id}
              className={cn(
                'flex items-start gap-3 rounded-lg border p-3',
                config.color
              )}
            >
              <Icon className={cn('h-4 w-4 mt-0.5 flex-shrink-0', config.iconColor)} />
              <p className="text-sm text-foreground flex-1">{rec.message}</p>
              {dismissible && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 flex-shrink-0"
                  onClick={() => handleDismiss(rec.id)}
                >
                  <X className="h-3 w-3" />
                  <span className="sr-only">Dismiss</span>
                </Button>
              )}
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader className="border-b border-border dark:border-border/50 bg-muted/30 dark:bg-muted/10 pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
            {title}
          </CardTitle>
          <Badge variant="secondary" className="text-xs">
            {visibleRecommendations.length}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="divide-y divide-border dark:divide-border/50">
          {visibleRecommendations.map((rec) => {
            const config = getPriorityConfig(rec.priority)
            const Icon = config.icon

            return (
              <div
                key={rec.id}
                className={cn(
                  'p-4 transition-colors hover:bg-muted/30 dark:hover:bg-muted/10',
                  config.color
                )}
              >
                <div className="flex items-start gap-3">
                  <Icon className={cn('h-5 w-5 mt-0.5 flex-shrink-0', config.iconColor)} />
                  
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm text-foreground leading-relaxed">
                        {rec.message}
                      </p>
                      {dismissible && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 flex-shrink-0"
                          onClick={() => handleDismiss(rec.id)}
                        >
                          <X className="h-4 w-4" />
                          <span className="sr-only">Dismiss</span>
                        </Button>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={cn('text-xs', config.badgeColor)}>
                        {config.label}
                      </Badge>
                      
                      {rec.action && rec.onAction && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs"
                          onClick={rec.onAction}
                        >
                          {rec.action}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

RecommendationsList.displayName = 'RecommendationsList'
