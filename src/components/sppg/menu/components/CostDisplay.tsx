/**
 * CostDisplay Component
 * 
 * Displays cost information with breakdown
 * Shows total cost, per-serving cost, and budget comparison
 * Supports dark mode and compact view
 * 
 * @module components/sppg/menu/components/CostDisplay
 */

'use client'

import { type FC } from 'react'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DollarSign, TrendingUp, TrendingDown } from 'lucide-react'

interface CostData {
  totalCost: number
  costPerServing: number
  costPerPortion?: number
}

interface CostDisplayProps {
  cost: CostData
  budget?: number
  className?: string
  variant?: 'full' | 'compact'
  currency?: string
}

/**
 * Format currency value
 */
const formatCurrency = (value: number, currency: string = 'Rp'): string => {
  return `${currency} ${value.toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`
}

/**
 * Calculate budget status
 */
const getBudgetStatus = (cost: number, budget: number) => {
  const percentage = (cost / budget) * 100
  
  if (percentage <= 80) {
    return { status: 'under', label: 'Under Budget', color: 'text-green-600 dark:text-green-400', icon: TrendingDown }
  } else if (percentage <= 100) {
    return { status: 'on-track', label: 'On Budget', color: 'text-blue-600 dark:text-blue-400', icon: DollarSign }
  } else {
    return { status: 'over', label: 'Over Budget', color: 'text-red-600 dark:text-red-400', icon: TrendingUp }
  }
}

export const CostDisplay: FC<CostDisplayProps> = ({
  cost,
  budget,
  className,
  variant = 'full',
  currency = 'Rp',
}) => {
  const budgetInfo = budget ? getBudgetStatus(cost.costPerServing, budget) : null
  const BudgetIcon = budgetInfo?.icon

  if (variant === 'compact') {
    return (
      <div className={cn('flex flex-wrap items-center gap-4', className)}>
        <div className="flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-muted-foreground" />
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">Total</span>
            <span className="text-sm font-bold text-foreground">
              {formatCurrency(cost.totalCost, currency)}
            </span>
          </div>
        </div>

        <div className="flex flex-col">
          <span className="text-xs text-muted-foreground">Per Porsi</span>
          <span className="text-sm font-bold text-foreground">
            {formatCurrency(cost.costPerServing, currency)}
          </span>
        </div>

        {budget && budgetInfo && (
          <div className={cn('flex items-center gap-1 text-sm font-medium', budgetInfo.color)}>
            {BudgetIcon && <BudgetIcon className="h-4 w-4" />}
            <span>{budgetInfo.label}</span>
          </div>
        )}
      </div>
    )
  }

  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader className="border-b border-border dark:border-border/50 bg-muted/30 dark:bg-muted/10 pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">Biaya Menu</CardTitle>
          <DollarSign className="h-5 w-5 text-muted-foreground" />
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pt-4">
        {/* Total Cost */}
        <div className="flex items-center justify-between rounded-lg bg-blue-50 dark:bg-blue-950 p-4">
          <div>
            <p className="text-sm text-blue-700 dark:text-blue-300">Total Biaya</p>
            <p className="mt-1 text-2xl font-bold text-blue-900 dark:text-blue-100">
              {formatCurrency(cost.totalCost, currency)}
            </p>
          </div>
        </div>

        {/* Cost Per Serving */}
        <div className="flex items-center justify-between rounded-lg border border-border dark:border-border/50 p-4">
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">Biaya Per Porsi</p>
            <p className="mt-1 text-xl font-bold text-foreground">
              {formatCurrency(cost.costPerServing, currency)}
            </p>
          </div>
        </div>

        {/* Cost Per Portion (if available) */}
        {cost.costPerPortion !== undefined && cost.costPerPortion !== cost.costPerServing && (
          <div className="flex items-center justify-between rounded-lg border border-border dark:border-border/50 p-4">
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Biaya Per Sajian</p>
              <p className="mt-1 text-xl font-bold text-foreground">
                {formatCurrency(cost.costPerPortion, currency)}
              </p>
            </div>
          </div>
        )}

        {/* Budget Comparison */}
        {budget && budgetInfo && (
          <div className="space-y-2 pt-2 border-t border-border dark:border-border/50">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Budget</span>
              <span className="text-sm font-medium text-foreground">
                {formatCurrency(budget, currency)}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Selisih</span>
              <span className={cn('text-sm font-bold', budgetInfo.color)}>
                {budget - cost.costPerServing >= 0 ? '+' : ''}
                {formatCurrency(budget - cost.costPerServing, currency)}
              </span>
            </div>

            <div className={cn('flex items-center gap-2 rounded-lg p-3', {
              'bg-green-50 dark:bg-green-950': budgetInfo.status === 'under',
              'bg-blue-50 dark:bg-blue-950': budgetInfo.status === 'on-track',
              'bg-red-50 dark:bg-red-950': budgetInfo.status === 'over',
            })}>
              {BudgetIcon && <BudgetIcon className={cn('h-5 w-5', budgetInfo.color)} />}
              <div className="flex-1">
                <p className={cn('text-sm font-semibold', budgetInfo.color)}>
                  {budgetInfo.label}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {((cost.costPerServing / budget) * 100).toFixed(1)}% dari budget
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

CostDisplay.displayName = 'CostDisplay'
