/**
 * Global Header Components - Phase 1 Implementation
 * Enterprise-Grade System Status & Control Components
 * Bergizi-ID SaaS Platform
 */

// Global Real-Time Hook
export { 
  useGlobalRealTime,
  type SystemHealthStatus,
  type WebSocketStatus,
  type GlobalNotification,
  type GlobalActivity,
  type GlobalRealTimeState,
  type GlobalRealTimeActions,
  type UseGlobalRealTimeReturn
} from '@/hooks/shared/useGlobalRealTime'

// Global Status Indicator
export {
  GlobalStatusIndicator,
  GlobalStatusIndicatorCompact,
  GlobalStatusIndicatorMinimal,
  GlobalStatusTrigger,
  type GlobalStatusIndicatorProps
} from './GlobalStatusIndicator'

// Live Notification Center
export {
  LiveNotificationCenter,
  LiveNotificationCenterCompact,
  type LiveNotificationCenterProps
} from './LiveNotificationCenter'

// Global Quick Actions
export {
  GlobalQuickActions,
  GlobalQuickActionsCompact,
  type GlobalQuickActionsProps
} from './GlobalQuickActions'