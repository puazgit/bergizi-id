/**
 * SPPG Dashboard Utils - Enterprise Grade
 * Pattern 2 Architecture - Domain-specific utilities
 * Data Processing & Calculations
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import { 
  DashboardData, 
  DashboardMetrics, 
  DashboardCharts,
  ChartDataPoint,

} from '../types'

// Transform ExecutiveDashboardMetrics to DashboardData
export const transformDashboardData = (rawData: any): DashboardData => {
  return {
    metrics: transformMetrics(rawData.executiveSummary),
    charts: transformCharts(rawData),
    alerts: rawData.realTime?.alerts || [],
    notifications: rawData.realTime?.notifications || [],
    trends: transformTrends(rawData),
    kpis: transformKPIs(rawData)
  }
}

// Transform executive summary to metrics
const transformMetrics = (executiveSummary: any): DashboardMetrics => {
  return {
    // Executive Summary
    totalBeneficiaries: executiveSummary.totalBeneficiaries,
    activeBeneficiaries: Math.round(executiveSummary.totalBeneficiaries * 0.95), // Mock active
    beneficiaryGrowthRate: executiveSummary.monthlyGrowthRate,
    totalPrograms: executiveSummary.totalPrograms,
    activePrograms: Math.round(executiveSummary.totalPrograms * 0.9), // Mock active

    // Operational Performance
    menuCompliance: executiveSummary.systemUptime, // Use system uptime as proxy
    productionEfficiency: executiveSummary.operationalEfficiency,
    distributionCoverage: executiveSummary.operationalEfficiency * 0.9, // Mock coverage
    inventoryTurnover: executiveSummary.operationalEfficiency * 1.2, // Mock turnover
    
    // Financial KPIs
    totalBudget: executiveSummary.totalBeneficiaries * executiveSummary.costPerBeneficiary * 12, // Annual budget
    budgetUtilization: executiveSummary.budgetUtilization,
    costPerBeneficiary: executiveSummary.costPerBeneficiary,
    savingsGenerated: executiveSummary.totalBeneficiaries * executiveSummary.costPerBeneficiary * 0.1, // Mock savings
    
    // Quality Metrics
    nutritionCompliance: executiveSummary.systemUptime * 0.95, // Mock nutrition compliance
    qualityScore: executiveSummary.customerSatisfaction,
    wastagePercentage: (100 - executiveSummary.operationalEfficiency) * 0.3, // Mock wastage
    customerSatisfaction: executiveSummary.customerSatisfaction,
    
    // Predictive Analytics
    demandForecast: [100, 105, 110, 108, 115, 120], // Mock forecast
    budgetProjection: [90, 92, 95, 93, 98, 100], // Mock projection
    riskScore: Math.round((100 - executiveSummary.systemUptime) * 2), // Risk based on system health
    alertsCount: 0 // Will be set from alerts array
  }
}

// Transform raw data to chart format
const transformCharts = (rawData: any): DashboardCharts => {
  const now = new Date()
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(now)
    date.setDate(date.getDate() - (6 - i))
    return date.toISOString().split('T')[0]
  })

  return {
    beneficiaryTrend: last7Days.map((date, index) => ({
      label: date,
      value: rawData.executiveSummary.totalBeneficiaries + (index * 50),
      date,
      category: 'beneficiaries'
    })),
    
    budgetUtilization: last7Days.map((date, index) => ({
      label: date,
      value: rawData.executiveSummary.budgetUtilization + (index * 2),
      date,
      category: 'budget'
    })),
    
    nutritionCompliance: last7Days.map((date, index) => ({
      label: date,
      value: rawData.executiveSummary.systemUptime + (index * 1),
      date,
      category: 'nutrition'
    })),
    
    productionVolume: rawData.operations?.production?.dailyProductionTrend?.map((item: any) => ({
      label: item.date,
      value: item.actualQuantity,
      date: item.date,
      category: 'production'
    })) || [],
    
    distributionCoverage: rawData.operations?.distribution?.weeklyDistributionTrend?.map((item: any) => ({
      label: item.week,
      value: item.coverage,
      date: item.week,
      category: 'distribution'
    })) || [],
    
    qualityMetrics: last7Days.map((date) => ({
      label: date,
      value: rawData.executiveSummary.customerSatisfaction + (Math.random() * 5 - 2.5),
      date,
      category: 'quality'
    }))
  }
}

// Transform data to trends
const transformTrends = (rawData: any): any => {
  const executiveSummary = rawData.executiveSummary
  
  return {
    beneficiaryGrowth: {
      current: executiveSummary.totalBeneficiaries,
      previous: Math.round(executiveSummary.totalBeneficiaries * 0.95),
      change: Math.round(executiveSummary.totalBeneficiaries * 0.05),
      changePercentage: executiveSummary.monthlyGrowthRate,
      trend: executiveSummary.monthlyGrowthRate >= 0 ? 'UP' : 'DOWN'
    },
    
    budgetEfficiency: {
      current: executiveSummary.budgetUtilization,
      previous: Math.round(executiveSummary.budgetUtilization * 0.98),
      change: Math.round(executiveSummary.budgetUtilization * 0.02),
      changePercentage: 2,
      trend: 'UP'
    },
    
    nutritionQuality: {
      current: executiveSummary.systemUptime,
      previous: Math.round(executiveSummary.systemUptime * 0.97),
      change: Math.round(executiveSummary.systemUptime * 0.03),
      changePercentage: 3,
      trend: 'UP'
    },
    
    operationalPerformance: {
      current: executiveSummary.operationalEfficiency,
      previous: Math.round(executiveSummary.operationalEfficiency * 0.96),
      change: Math.round(executiveSummary.operationalEfficiency * 0.04),
      changePercentage: 4,
      trend: 'UP'
    }
  }
}

// Transform data to KPIs
const transformKPIs = (rawData: any): any[] => {
  const executiveSummary = rawData.executiveSummary
  
  return [
    {
      id: 'beneficiaries',
      name: 'Total Beneficiaries',
      value: executiveSummary.totalBeneficiaries,
      target: executiveSummary.totalBeneficiaries * 1.1,
      unit: 'people',
      category: 'OPERATIONAL',
      trend: {
        current: executiveSummary.totalBeneficiaries,
        previous: Math.round(executiveSummary.totalBeneficiaries * 0.95),
        change: Math.round(executiveSummary.totalBeneficiaries * 0.05),
        changePercentage: executiveSummary.monthlyGrowthRate,
        trend: executiveSummary.monthlyGrowthRate >= 0 ? 'UP' : 'DOWN'
      },
      status: getKPIStatus(executiveSummary.totalBeneficiaries, executiveSummary.totalBeneficiaries * 1.1),
      description: 'Total number of program beneficiaries'
    },
    
    {
      id: 'budget_utilization',
      name: 'Budget Utilization',
      value: executiveSummary.budgetUtilization,
      target: 95,
      unit: '%',
      category: 'FINANCIAL',
      trend: {
        current: executiveSummary.budgetUtilization,
        previous: Math.round(executiveSummary.budgetUtilization * 0.98),
        change: Math.round(executiveSummary.budgetUtilization * 0.02),
        changePercentage: 2,
        trend: 'UP'
      },
      status: getKPIStatus(executiveSummary.budgetUtilization, 95),
      description: 'Percentage of allocated budget utilized'
    },
    
    {
      id: 'operational_efficiency',
      name: 'Operational Efficiency',
      value: executiveSummary.operationalEfficiency,
      target: 90,
      unit: '%',
      category: 'OPERATIONAL',
      trend: {
        current: executiveSummary.operationalEfficiency,
        previous: Math.round(executiveSummary.operationalEfficiency * 0.96),
        change: Math.round(executiveSummary.operationalEfficiency * 0.04),
        changePercentage: 4,
        trend: 'UP'
      },
      status: getKPIStatus(executiveSummary.operationalEfficiency, 90),
      description: 'Overall operational efficiency score'
    },
    
    {
      id: 'customer_satisfaction',
      name: 'Customer Satisfaction',
      value: executiveSummary.customerSatisfaction,
      target: 85,
      unit: '%',
      category: 'QUALITY',
      trend: {
        current: executiveSummary.customerSatisfaction,
        previous: Math.round(executiveSummary.customerSatisfaction * 0.97),
        change: Math.round(executiveSummary.customerSatisfaction * 0.03),
        changePercentage: 3,
        trend: 'UP'
      },
      status: getKPIStatus(executiveSummary.customerSatisfaction, 85),
      description: 'Customer satisfaction rating'
    }
  ]
}

// Determine KPI status based on current vs target
const getKPIStatus = (current: number, target: number): 'EXCELLENT' | 'GOOD' | 'WARNING' | 'CRITICAL' => {
  const percentage = (current / target) * 100
  
  if (percentage >= 100) return 'EXCELLENT'
  if (percentage >= 90) return 'GOOD'
  if (percentage >= 75) return 'WARNING'
  return 'CRITICAL'
}

// Format numbers for display
export const formatNumber = (value: number, type: 'currency' | 'percentage' | 'number' = 'number'): string => {
  switch (type) {
    case 'currency':
      return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR'
      }).format(value)
    
    case 'percentage':
      return new Intl.NumberFormat('id-ID', {
        style: 'percent',
        minimumFractionDigits: 1,
        maximumFractionDigits: 1
      }).format(value / 100)
    
    default:
      return new Intl.NumberFormat('id-ID').format(value)
  }
}

// Calculate trend direction
export const calculateTrend = (current: number, previous: number): 'UP' | 'DOWN' | 'STABLE' => {
  const difference = current - previous
  const threshold = Math.abs(previous * 0.01) // 1% threshold
  
  if (Math.abs(difference) <= threshold) return 'STABLE'
  return difference > 0 ? 'UP' : 'DOWN'
}

// Generate time series data
export const generateTimeSeriesData = (
  baseValue: number,
  days: number = 30,
  volatility: number = 0.1
): ChartDataPoint[] => {
  const data: ChartDataPoint[] = []
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)
  
  for (let i = 0; i < days; i++) {
    const date = new Date(startDate)
    date.setDate(date.getDate() + i)
    
    const variation = (Math.random() - 0.5) * 2 * volatility
    const value = Math.round(baseValue * (1 + variation))
    
    data.push({
      label: date.toISOString().split('T')[0],
      value,
      date: date.toISOString().split('T')[0]
    })
  }
  
  return data
}

// Color schemes for charts
export const chartColors = {
  primary: ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444'],
  success: ['#10B981', '#34D399', '#6EE7B7', '#A7F3D0', '#D1FAE5'],
  warning: ['#F59E0B', '#FBBF24', '#FCD34D', '#FDE68A', '#FEF3C7'],
  danger: ['#EF4444', '#F87171', '#FCA5A5', '#FECACA', '#FEE2E2'],
  info: ['#3B82F6', '#60A5FA', '#93C5FD', '#BFDBFE', '#DBEAFE']
}

// Export internal utilities
export { getKPIStatus }