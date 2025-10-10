// Export enterprise dashboard components (Pattern 2)
export { 
  DashboardCard, 
  DashboardChart, 
  DashboardMetricsSummary, 
  DashboardHeader 
} from './DashboardComponents'

// Export chart components (Pattern 2)
export {
  BeneficiaryGrowthChart,
  BudgetUtilizationChart,
  DashboardCharts
} from './ChartComponents'

// Main dashboard client component (Pattern 2)
export { default as DashboardClient, EnterpriseDashboardClient } from './DashboardClient'

// Enterprise UI controls and advanced features (NEW)
export { DashboardControlPanel } from './DashboardControlPanel'
export { AdvancedMetricsDisplay } from './AdvancedMetricsDisplay'
// RealtimeStatus removed - infrastructure status handled at global level
export { EnterpriseDashboardHistoryViewer } from './EnterpriseDashboardHistoryViewer'
export { DashboardSubscriptionProvider, useDashboardSubscriptionsContext } from './DashboardSubscriptionContext'

// AI Forecasting component (NEW)
export { AIForecastingDisplay } from './AIForecastingDisplay'