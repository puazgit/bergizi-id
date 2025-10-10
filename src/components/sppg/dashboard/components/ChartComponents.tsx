/**
 * Dashboard Chart Components - Enterprise Grade
 * Pattern 2 Architecture - Chart visualization components
 * Recharts Integration for Professional Data Visualization
 */

'use client'

import React from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, TrendingDown, DollarSign, Users } from 'lucide-react'

// Chart Data Types
interface BeneficiaryGrowthData {
  month: string
  beneficiaries: number
  growth: number
}

interface BudgetUtilizationData {
  month: string
  budget: number
  spent: number
  utilization: number
}

// Props Interfaces
interface BeneficiaryGrowthChartProps {
  data: BeneficiaryGrowthData[]
  className?: string
}

interface BudgetUtilizationChartProps {
  data: BudgetUtilizationData[]
  className?: string
}

// Custom Tooltip Components
const BeneficiaryTooltip = ({ active, payload, label }: {
  active?: boolean
  payload?: Array<{ payload: BeneficiaryGrowthData }>
  label?: string
}) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <div className="bg-white dark:bg-gray-800 p-3 border rounded-lg shadow-lg">
        <p className="font-semibold text-gray-900 dark:text-gray-100">{label}</p>
        <div className="space-y-1 mt-2">
          <p className="text-blue-600 dark:text-blue-400">
            <Users className="inline h-4 w-4 mr-1" />
            Beneficiaries: {data.beneficiaries.toLocaleString()}
          </p>
          <p className={`${data.growth >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            {data.growth >= 0 ? (
              <TrendingUp className="inline h-4 w-4 mr-1" />
            ) : (
              <TrendingDown className="inline h-4 w-4 mr-1" />
            )}
            Growth: {data.growth > 0 ? '+' : ''}{data.growth}%
          </p>
        </div>
      </div>
    )
  }
  return null
}

const BudgetTooltip = ({ active, payload, label }: {
  active?: boolean
  payload?: Array<{ payload: BudgetUtilizationData }>
  label?: string
}) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <div className="bg-white dark:bg-gray-800 p-3 border rounded-lg shadow-lg">
        <p className="font-semibold text-gray-900 dark:text-gray-100">{label}</p>
        <div className="space-y-1 mt-2">
          <p className="text-gray-600 dark:text-gray-300">
            <DollarSign className="inline h-4 w-4 mr-1" />
            Budget: Rp {(data.budget / 1000000).toFixed(0)}M
          </p>
          <p className="text-blue-600 dark:text-blue-400">
            <DollarSign className="inline h-4 w-4 mr-1" />
            Spent: Rp {(data.spent / 1000000).toFixed(0)}M
          </p>
          <p className={`${data.utilization <= 100 ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400'}`}>
            Utilization: {data.utilization}%
          </p>
        </div>
      </div>
    )
  }
  return null
}

// Beneficiary Growth Trend Chart
export const BeneficiaryGrowthChart: React.FC<BeneficiaryGrowthChartProps> = ({ 
  data, 
  className = "" 
}) => {
  const currentBeneficiaries = data[data.length - 1]?.beneficiaries || 0
  const previousBeneficiaries = data[data.length - 2]?.beneficiaries || 0
  const overallGrowth = previousBeneficiaries > 0 
    ? ((currentBeneficiaries - previousBeneficiaries) / previousBeneficiaries) * 100 
    : 0

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-500" />
            Beneficiary Growth Trend
          </span>
          <div className="flex items-center gap-1 text-sm">
            {overallGrowth >= 0 ? (
              <TrendingUp className="h-4 w-4 text-green-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-500" />
            )}
            <span className={overallGrowth >= 0 ? 'text-green-600' : 'text-red-600'}>
              {overallGrowth > 0 ? '+' : ''}{overallGrowth.toFixed(1)}%
            </span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="beneficiaryGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="month" 
                tick={{ fontSize: 12 }}
                className="text-muted-foreground"
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                className="text-muted-foreground"
                tickFormatter={(value) => value.toLocaleString()}
              />
              <Tooltip content={<BeneficiaryTooltip />} />
              <Area
                type="monotone"
                dataKey="beneficiaries"
                stroke="#3b82f6"
                strokeWidth={2}
                fill="url(#beneficiaryGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
          <div>
            Current Total: <span className="font-semibold text-foreground">
              {currentBeneficiaries.toLocaleString()} beneficiaries
            </span>
          </div>
          <div>
            12-month trend
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Budget Utilization Chart
export const BudgetUtilizationChart: React.FC<BudgetUtilizationChartProps> = ({ 
  data, 
  className = "" 
}) => {
  const averageUtilization = data.reduce((sum, item) => sum + item.utilization, 0) / data.length
  const currentUtilization = data[data.length - 1]?.utilization || 0

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-500" />
            Budget Utilization
          </span>
          <div className="flex items-center gap-1 text-sm">
            <span className="text-muted-foreground">Avg:</span>
            <span className={`font-semibold ${
              averageUtilization <= 100 ? 'text-green-600' : 'text-orange-600'
            }`}>
              {averageUtilization.toFixed(1)}%
            </span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="month" 
                tick={{ fontSize: 12 }}
                className="text-muted-foreground"
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                className="text-muted-foreground"
                tickFormatter={(value) => `${value}M`}
              />
              <Tooltip content={<BudgetTooltip />} />
              <Legend />
              <Bar 
                dataKey="budget" 
                fill="#e5e7eb" 
                name="Allocated Budget"
                radius={[2, 2, 0, 0]}
              />
              <Bar 
                dataKey="spent" 
                fill="#3b82f6" 
                name="Amount Spent"
                radius={[2, 2, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
          <div className="text-center">
            <div className="text-muted-foreground">Current Month</div>
            <div className={`font-semibold ${
              currentUtilization <= 100 ? 'text-green-600' : 'text-orange-600'
            }`}>
              {currentUtilization}%
            </div>
          </div>
          <div className="text-center">
            <div className="text-muted-foreground">Average</div>
            <div className={`font-semibold ${
              averageUtilization <= 100 ? 'text-green-600' : 'text-orange-600'
            }`}>
              {averageUtilization.toFixed(1)}%
            </div>
          </div>
          <div className="text-center">
            <div className="text-muted-foreground">Status</div>
            <div className={`font-semibold ${
              currentUtilization <= 100 ? 'text-green-600' : 'text-orange-600'
            }`}>
              {currentUtilization <= 100 ? 'On Track' : 'Over Budget'}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Combined Charts Export
export const DashboardCharts = {
  BeneficiaryGrowthChart,
  BudgetUtilizationChart
}