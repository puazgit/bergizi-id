/**
 * SPPG Dashboard Domain - Pattern 2 Architecture
 * Enterprise-Grade Dashboard with Real-time WebSocket + Redis Integration
 */

// Export all enterprise components
export { 
  DashboardCard, 
  DashboardChart, 
  DashboardMetricsSummary, 
  DashboardHeader,
  DashboardClient,
  EnterpriseDashboardClient
} from './components'

// Export all hooks
export { 
  useDashboard,
  useDashboardRealTime,
  useDashboardConfig,
  useDashboardPeriod
} from './hooks'

// Export utilities
export { 
  transformDashboardData,
  formatNumber,
  calculateTrend,
  generateTimeSeriesData,
  chartColors
} from './utils'

// Export all types
export type {
  DashboardMetrics,
  DashboardData,
  ChartDataPoint,
  DashboardAlert,
  DashboardNotification,
  DashboardTrends,
  TrendData,
  DashboardKPI,
  DashboardFilters,
  DashboardWebSocketEvent,
  DashboardRealTimeUpdate,
  DashboardCardProps,
  DashboardChartProps,
  DashboardTableProps,
  TableColumn,
  UseDashboardReturn,
  UseDashboardRealTimeReturn,
  DashboardPeriod,
  DashboardView,
  DashboardTheme,
  DashboardConfig
} from './types'

// No legacy exports needed - all handled by DashboardClient