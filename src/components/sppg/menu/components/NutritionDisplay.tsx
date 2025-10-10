/**
 * NutritionDisplay Component
 * 
 * Displays nutrition information in a facts label format with visual indicators
 * Shows calories, protein, carbs, fat, and fiber with color-coded bars
 * Supports dark mode and compact/full view modes
 * 
 * @module components/sppg/menu/components/NutritionDisplay
 */

'use client'

import { type FC } from 'react'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Info } from 'lucide-react'

interface NutritionData {
  calories: number
  protein: number
  carbohydrates: number
  fat: number
  fiber: number
}

interface NutritionDisplayProps {
  nutrition: NutritionData
  servingSize?: number
  className?: string
  variant?: 'full' | 'compact'
  showProgress?: boolean
}

/**
 * Simple progress bar with custom colors
 */
const NutritionProgress: FC<{ value: number; color: string }> = ({ value, color }) => (
  <div className="h-2 w-full overflow-hidden rounded-full bg-muted dark:bg-muted/50">
    <div
      className={cn('h-full transition-all duration-300', color)}
      style={{ width: `${Math.min(value, 100)}%` }}
    />
  </div>
)

/**
 * Calculate percentage for progress bar (max 100%)
 */
const getProgressPercentage = (value: number, max: number): number => {
  return Math.min((value / max) * 100, 100)
}

/**
 * Get color class based on nutrient type
 */
const getNutrientColor = (nutrient: keyof NutritionData): string => {
  const colors = {
    calories: 'bg-blue-500 dark:bg-blue-600',
    protein: 'bg-red-500 dark:bg-red-600',
    carbohydrates: 'bg-yellow-500 dark:bg-yellow-600',
    fat: 'bg-orange-500 dark:bg-orange-600',
    fiber: 'bg-green-500 dark:bg-green-600',
  }
  return colors[nutrient]
}

export const NutritionDisplay: FC<NutritionDisplayProps> = ({
  nutrition,
  servingSize,
  className,
  variant = 'full',
  showProgress = true,
}) => {
  // Reference daily values for progress bars
  const dailyValues = {
    calories: 2000,
    protein: 50,
    carbohydrates: 300,
    fat: 70,
    fiber: 25,
  }

  if (variant === 'compact') {
    return (
      <div className={cn('flex flex-wrap gap-3', className)}>
        <div className="flex items-center gap-2 rounded-lg bg-blue-50 dark:bg-blue-950 px-3 py-2">
          <span className="text-xs font-medium text-blue-700 dark:text-blue-300">
            Kalori
          </span>
          <span className="text-sm font-bold text-blue-900 dark:text-blue-100">
            {nutrition.calories}
          </span>
        </div>

        <div className="flex items-center gap-2 rounded-lg bg-red-50 dark:bg-red-950 px-3 py-2">
          <span className="text-xs font-medium text-red-700 dark:text-red-300">
            Protein
          </span>
          <span className="text-sm font-bold text-red-900 dark:text-red-100">
            {nutrition.protein}g
          </span>
        </div>

        <div className="flex items-center gap-2 rounded-lg bg-yellow-50 dark:bg-yellow-950 px-3 py-2">
          <span className="text-xs font-medium text-yellow-700 dark:text-yellow-300">
            Karbo
          </span>
          <span className="text-sm font-bold text-yellow-900 dark:text-yellow-100">
            {nutrition.carbohydrates}g
          </span>
        </div>

        <div className="flex items-center gap-2 rounded-lg bg-orange-50 dark:bg-orange-950 px-3 py-2">
          <span className="text-xs font-medium text-orange-700 dark:text-orange-300">
            Lemak
          </span>
          <span className="text-sm font-bold text-orange-900 dark:text-orange-100">
            {nutrition.fat}g
          </span>
        </div>

        <div className="flex items-center gap-2 rounded-lg bg-green-50 dark:bg-green-950 px-3 py-2">
          <span className="text-xs font-medium text-green-700 dark:text-green-300">
            Serat
          </span>
          <span className="text-sm font-bold text-green-900 dark:text-green-100">
            {nutrition.fiber}g
          </span>
        </div>
      </div>
    )
  }

  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader className="border-b border-border dark:border-border/50 bg-muted/30 dark:bg-muted/10 pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">
            Informasi Nutrisi
          </CardTitle>
          {servingSize && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground cursor-help">
                    <Info className="h-3 w-3" />
                    <span>Per {servingSize}g</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Nilai nutrisi per porsi {servingSize} gram</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pt-4">
        {/* Calories */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-blue-500 dark:bg-blue-600" />
              <span className="text-sm font-medium text-foreground">Kalori</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-bold text-foreground">
                {nutrition.calories}
              </span>
              <span className="text-xs text-muted-foreground">kal</span>
            </div>
          </div>
          {showProgress && (
            <div className="space-y-1">
              <NutritionProgress
                value={getProgressPercentage(nutrition.calories, dailyValues.calories)}
                color={getNutrientColor('calories')}
              />
              <p className="text-xs text-muted-foreground">
                {getProgressPercentage(nutrition.calories, dailyValues.calories).toFixed(0)}% dari
                kebutuhan harian (2000 kal)
              </p>
            </div>
          )}
        </div>

        {/* Protein */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-red-500 dark:bg-red-600" />
              <span className="text-sm font-medium text-foreground">Protein</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-bold text-foreground">
                {nutrition.protein}
              </span>
              <span className="text-xs text-muted-foreground">g</span>
            </div>
          </div>
          {showProgress && (
            <div className="space-y-1">
              <NutritionProgress
                value={getProgressPercentage(nutrition.protein, dailyValues.protein)}
                color={getNutrientColor('protein')}
              />
              <p className="text-xs text-muted-foreground">
                {getProgressPercentage(nutrition.protein, dailyValues.protein).toFixed(0)}% dari
                kebutuhan harian (50g)
              </p>
            </div>
          )}
        </div>

        {/* Carbohydrates */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-yellow-500 dark:bg-yellow-600" />
              <span className="text-sm font-medium text-foreground">Karbohidrat</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-bold text-foreground">
                {nutrition.carbohydrates}
              </span>
              <span className="text-xs text-muted-foreground">g</span>
            </div>
          </div>
          {showProgress && (
            <div className="space-y-1">
              <NutritionProgress
                value={getProgressPercentage(nutrition.carbohydrates, dailyValues.carbohydrates)}
                color={getNutrientColor('carbohydrates')}
              />
              <p className="text-xs text-muted-foreground">
                {getProgressPercentage(nutrition.carbohydrates, dailyValues.carbohydrates).toFixed(0)}% dari
                kebutuhan harian (300g)
              </p>
            </div>
          )}
        </div>

        {/* Fat */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-orange-500 dark:bg-orange-600" />
              <span className="text-sm font-medium text-foreground">Lemak</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-bold text-foreground">
                {nutrition.fat}
              </span>
              <span className="text-xs text-muted-foreground">g</span>
            </div>
          </div>
          {showProgress && (
            <div className="space-y-1">
              <NutritionProgress
                value={getProgressPercentage(nutrition.fat, dailyValues.fat)}
                color={getNutrientColor('fat')}
              />
              <p className="text-xs text-muted-foreground">
                {getProgressPercentage(nutrition.fat, dailyValues.fat).toFixed(0)}% dari
                kebutuhan harian (70g)
              </p>
            </div>
          )}
        </div>

        {/* Fiber */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-green-500 dark:bg-green-600" />
              <span className="text-sm font-medium text-foreground">Serat</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-bold text-foreground">
                {nutrition.fiber}
              </span>
              <span className="text-xs text-muted-foreground">g</span>
            </div>
          </div>
          {showProgress && (
            <div className="space-y-1">
              <NutritionProgress
                value={getProgressPercentage(nutrition.fiber, dailyValues.fiber)}
                color={getNutrientColor('fiber')}
              />
              <p className="text-xs text-muted-foreground">
                {getProgressPercentage(nutrition.fiber, dailyValues.fiber).toFixed(0)}% dari
                kebutuhan harian (25g)
              </p>
            </div>
          )}
        </div>

        {/* Footer note */}
        <div className="pt-2 border-t border-border dark:border-border/50">
          <p className="text-xs text-muted-foreground">
            * Kebutuhan harian berdasarkan diet 2000 kalori
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

NutritionDisplay.displayName = 'NutritionDisplay'
