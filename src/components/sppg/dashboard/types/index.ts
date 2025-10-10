/**
 * SPPG Dashboard Types - Enterprise Grade
 * Pattern 2 Architecture - Domain-specific types
 * Real-time WebSocket + Redis Integration
 */

// Chart Data Structures
export interface ChartDataPoint {
  label: string
  value: number
  date: string
  category?: string
  metadata?: Record<string, unknown>
}

export interface DashboardCharts {
  beneficiaryTrend: ChartDataPoint[]
  budgetUtilization: ChartDataPoint[]
  nutritionCompliance: ChartDataPoint[]
  productionVolume: ChartDataPoint[]
  distributionCoverage: ChartDataPoint[]
  qualityMetrics: ChartDataPoint[]
}

// Alert System
export interface DashboardAlert {
  id: string
  type: 'CRITICAL' | 'WARNING' | 'INFO'
  category: 'BUDGET' | 'QUALITY' | 'COMPLIANCE' | 'OPERATIONAL' | 'SYSTEM'
  title: string
  message: string
  timestamp: string
  isRead: boolean
  actionRequired: boolean
  priority: 1 | 2 | 3 | 4 | 5
  relatedEntity?: {
    type: string
    id: string
    name: string
  }
}

// Notification System
export interface DashboardNotification {
  id: string
  type: 'SUCCESS' | 'INFO' | 'WARNING' | 'ERROR'
  title: string
  message: string
  timestamp: string
  isRead: boolean
  actions?: NotificationAction[]
}

export interface NotificationAction {
  label: string
  action: string
  variant: 'primary' | 'secondary' | 'danger'
}

// Trend Analysis
export interface TrendData {
  current: number
  previous: number
  change: number
  changePercentage: number
  trend: 'UP' | 'DOWN' | 'STABLE'
  forecast?: number[]
}

export interface DashboardTrends {
  beneficiaryGrowth: TrendData
  budgetEfficiency: TrendData
  nutritionQuality: TrendData
  operationalPerformance: TrendData
}

// KPI Definitions
export interface DashboardKPI {
  id: string
  name: string
  value: number
  target: number
  unit: string
  category: 'OPERATIONAL' | 'FINANCIAL' | 'QUALITY' | 'COMPLIANCE'
  trend: TrendData
  status: 'EXCELLENT' | 'GOOD' | 'WARNING' | 'CRITICAL'
  description: string
}

// Core Dashboard Metrics
export interface DashboardMetrics {
  // Executive Summary
  totalBeneficiaries: number
  activeBeneficiaries: number
  beneficiaryGrowthRate: number
  totalPrograms: number
  activePrograms: number

  // Operational Performance
  menuCompliance: number
  productionEfficiency: number
  distributionCoverage: number
  inventoryTurnover: number
  
  // Financial KPIs
  totalBudget: number
  budgetUtilization: number
  costPerBeneficiary: number
  savingsGenerated: number
  
  // Quality Metrics
  nutritionCompliance: number
  qualityScore: number
  wastagePercentage: number
  customerSatisfaction: number
  
  // Predictive Analytics
  demandForecast: number[]
  budgetProjection: number[]
  riskScore: number
  alertsCount: number
}

// Real-time Dashboard Data
export interface DashboardData {
  metrics: DashboardMetrics
  charts: DashboardCharts
  alerts: DashboardAlert[]
  notifications: DashboardNotification[]
  trends: DashboardTrends
  kpis: DashboardKPI[]
}

// Filters and Options
export interface DashboardFilters {
  dateRange: {
    start: string
    end: string
  }
  programs?: string[]
  regions?: string[]
  beneficiaryTypes?: string[]
  metrics?: string[]
}

// WebSocket Events
export interface DashboardWebSocketEvent {
  type: 'METRICS_UPDATE' | 'ALERT_CREATED' | 'NOTIFICATION_SENT' | 'KPI_UPDATED'
  payload: unknown
  timestamp: string
  sppgId: string
}

// Real-time Updates
export interface DashboardRealTimeUpdate {
  metrics?: Partial<DashboardMetrics>
  alerts?: DashboardAlert[]
  notifications?: DashboardNotification[]
  kpis?: DashboardKPI[]
  timestamp: string
}

// Component Props
export interface DashboardCardProps {
  title: string
  value: number | string
  subtitle?: string
  trend?: TrendData
  icon?: React.ComponentType<{ className?: string }>
  className?: string
  onClick?: () => void
}

export interface DashboardChartProps {
  title: string
  data: ChartDataPoint[]
  type: 'line' | 'bar' | 'pie' | 'area' | 'donut'
  height?: number
  className?: string
  showLegend?: boolean
  colors?: string[]
}

export interface DashboardTableProps {
  title: string
  data: unknown[]
  columns: TableColumn[]
  pagination?: boolean
  searchable?: boolean
  className?: string
}

export interface TableColumn {
  key: string
  label: string
  sortable?: boolean
  formatter?: (value: unknown) => string | React.ReactNode
  className?: string
}

// Hook Returns
export interface UseDashboardReturn {
  data: DashboardData | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  updateFilters: (filters: Partial<DashboardFilters>) => void
  filters: DashboardFilters
}

export interface UseDashboardRealTimeReturn {
  isConnected: boolean
  lastUpdate: string | null
  connectionStatus: 'CONNECTING' | 'CONNECTED' | 'DISCONNECTED' | 'ERROR'
  subscribe: (eventType: string) => void
  unsubscribe: (eventType: string) => void
}

// Utility Types
export type DashboardPeriod = '7d' | '30d' | '90d' | '1y' | 'custom'
export type DashboardView = 'executive' | 'operational' | 'financial' | 'quality' | 'analytics'
export type DashboardTheme = 'light' | 'dark' | 'system'

// Analytics Configuration
export interface DashboardConfig {
  refreshInterval: number
  realTimeEnabled: boolean
  alertsEnabled: boolean
  notificationsEnabled: boolean
  autoRefresh: boolean
  theme: DashboardTheme
  defaultView: DashboardView
  defaultPeriod: DashboardPeriod
}

// Dashboard Overview Data interface
export interface DashboardOverviewData {
  stats: DashboardStats
  chartData: DashboardCharts
  recentActivities: RecentActivity[]
}

// Dashboard Stats interface  
export interface DashboardStats {
  totalBeneficiaries: number
  activeBeneficiaries: number
  totalPrograms: number
  activePrograms: number
  monthlyBudget: number
  budgetUtilization: number
  productionEfficiency: number
  qualityScore: number
  trends: {
    beneficiaries: number
    budget: number
    production: number
    quality: number
  }
}

// Recent Activity interface
export interface RecentActivity {
  id: string
  type: 'menu' | 'procurement' | 'production' | 'distribution'
  title: string
  description: string
  timestamp: string
  status: 'success' | 'warning' | 'error' | 'info'
  user?: string
}

// Dashboard Session interface
export interface DashboardSession {
  userId: string
  userName: string
  userRole: string
  sppgId: string
  sppgName: string
}