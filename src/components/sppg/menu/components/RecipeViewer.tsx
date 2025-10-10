'use client'

import { type FC } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  Clock,
  Thermometer,
  ChefHat,
  Info,
  Printer,
  Share2,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// ============================================================================
// Types & Interfaces
// ============================================================================

interface RecipeStep {
  id: string
  stepNumber: number
  instruction: string
  duration?: number | null
  temperature?: number | null
  notes?: string | null
}

interface RecipeViewerProps {
  steps: RecipeStep[]
  menuName?: string
  servingSize?: number
  totalDuration?: number
  showHeader?: boolean
  showPrintButton?: boolean
  showShareButton?: boolean
  compact?: boolean
  className?: string
}

// ============================================================================
// Helper Functions
// ============================================================================

function formatDuration(minutes: number | null | undefined): string {
  if (!minutes) return '-'
  
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  
  if (hours > 0 && mins > 0) {
    return `${hours} jam ${mins} menit`
  } else if (hours > 0) {
    return `${hours} jam`
  } else {
    return `${mins} menit`
  }
}

function calculateTotalDuration(steps: RecipeStep[]): number {
  return steps.reduce((total, step) => total + (step.duration || 0), 0)
}

// ============================================================================
// Main Component
// ============================================================================

export const RecipeViewer: FC<RecipeViewerProps> = ({
  steps,
  menuName,
  servingSize,
  totalDuration: propTotalDuration,
  showHeader = true,
  showPrintButton = true,
  showShareButton = false,
  compact = false,
  className,
}) => {
  const totalDuration = propTotalDuration || calculateTotalDuration(steps)

  // Handle print
  const handlePrint = () => {
    window.print()
  }

  // Handle share (placeholder - can be extended)
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Resep: ${menuName || 'Menu'}`,
          text: `Resep dengan ${steps.length} langkah`,
          url: window.location.href,
        })
      } catch (error) {
        console.error('Share error:', error)
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href)
      alert('Link disalin ke clipboard!')
    }
  }

  // Empty state
  if (steps.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <ChefHat className="h-16 w-16 text-muted-foreground/50 mb-4" />
          <p className="text-sm text-muted-foreground">
            Belum ada langkah resep
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      {showHeader && (
        <div className="flex items-start justify-between">
          <div>
            {menuName && (
              <h2 className="text-2xl font-bold mb-2">{menuName}</h2>
            )}
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              {servingSize && (
                <div className="flex items-center gap-2">
                  <ChefHat className="h-4 w-4" />
                  <span>{servingSize} porsi</span>
                </div>
              )}
              {totalDuration > 0 && (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>{formatDuration(totalDuration)}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{steps.length} langkah</Badge>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {showShareButton && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleShare}
                className="hidden sm:flex"
              >
                <Share2 className="mr-2 h-4 w-4" />
                Bagikan
              </Button>
            )}
            {showPrintButton && (
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrint}
                className="hidden sm:flex print:hidden"
              >
                <Printer className="mr-2 h-4 w-4" />
                Cetak
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Steps */}
      <div className={cn('space-y-4', compact && 'space-y-2')}>
        {steps.map((step, index) => (
          <div key={step.id}>
            <Card>
              <CardHeader
                className={cn(
                  'pb-3',
                  compact && 'py-3'
                )}
              >
                <CardTitle
                  className={cn(
                    'text-base font-semibold flex items-center gap-2',
                    compact && 'text-sm'
                  )}
                >
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold">
                    {step.stepNumber}
                  </div>
                  Langkah {step.stepNumber}
                </CardTitle>
              </CardHeader>
              <CardContent className={cn('space-y-3', compact && 'space-y-2')}>
                {/* Instruction */}
                <p
                  className={cn(
                    'text-sm leading-relaxed',
                    compact && 'text-xs'
                  )}
                >
                  {step.instruction}
                </p>

                {/* Duration and Temperature */}
                {(step.duration || step.temperature) && (
                  <div
                    className={cn(
                      'flex flex-wrap gap-3 text-xs text-muted-foreground',
                      compact && 'gap-2'
                    )}
                  >
                    {step.duration && (
                      <div className="flex items-center gap-1 px-2 py-1 bg-muted/50 rounded">
                        <Clock className="h-3 w-3" />
                        <span>{formatDuration(step.duration)}</span>
                      </div>
                    )}
                    {step.temperature && (
                      <div className="flex items-center gap-1 px-2 py-1 bg-muted/50 rounded">
                        <Thermometer className="h-3 w-3" />
                        <span>{step.temperature}°C</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Notes */}
                {step.notes && (
                  <div
                    className={cn(
                      'flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-md border border-blue-200 dark:border-blue-900',
                      compact && 'p-2'
                    )}
                  >
                    <Info className="h-4 w-4 mt-0.5 text-blue-600 dark:text-blue-400 shrink-0" />
                    <div>
                      <p
                        className={cn(
                          'text-xs font-medium text-blue-900 dark:text-blue-100 mb-1',
                          compact && 'text-[10px]'
                        )}
                      >
                        Catatan:
                      </p>
                      <p
                        className={cn(
                          'text-xs text-blue-700 dark:text-blue-300',
                          compact && 'text-[10px]'
                        )}
                      >
                        {step.notes}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Separator between steps (except last) */}
            {!compact && index < steps.length - 1 && (
              <div className="flex items-center justify-center py-2">
                <Separator className="w-8" orientation="horizontal" />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Footer Summary */}
      {!compact && (
        <Card className="bg-muted/30">
          <CardContent className="flex items-center justify-between p-4">
            <div className="flex items-center gap-2">
              <ChefHat className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm font-medium">
                Total {steps.length} langkah
              </span>
            </div>
            {totalDuration > 0 && (
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm font-medium">
                  Waktu total: {formatDuration(totalDuration)}
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
