# 📡 Dashboard Real-time System Architecture

## 🎯 Overview

Card "Real-time Updates" dengan toggle "Live Data Streaming" di Dashboard Control Panel **BUKAN** untuk mengatur live streaming data global, melainkan untuk mengontrol **real-time subscription** dashboard SPPG tertentu.

## 🏗️ Architecture Flow

### 1. Domain-Specific Real-time Updates
```typescript
// Toggle ini mengatur subscription untuk SPPG tertentu
const channel = `dashboard-update-${sppgId}` // Spesifik per SPPG
```

### 2. Separation of Concerns

#### 🌐 Global Infrastructure Status (Header)
- **Location**: `src/components/shared/layouts/components/GlobalStatusIndicator.tsx`
- **Function**: Monitor WebSocket, Redis, Database connection
- **Scope**: Platform-wide infrastructure health
- **Channels**: `system:health`, global monitoring
- **User Control**: No manual toggle (always active)

#### 🏢 SPPG Business Real-time Updates (Dashboard)
- **Location**: Dashboard Control Panel toggle
- **Function**: Real-time business data updates for SPPG
- **Scope**: SPPG-specific dashboard metrics
- **Channels**: `dashboard-update-${sppgId}`
- **User Control**: Manual toggle by SPPG users

## 📊 Real-time Updates Content

### Business Data Updates
```typescript
// Data yang di-broadcast via real-time:
interface DashboardUpdate {
  type: 'DASHBOARD_UPDATE'
  sppgId: string
  timestamp: string
  
  // Business updates:
  beneficiaries?: BeneficiaryMetrics
  procurement?: ProcurementMetrics  
  production?: ProductionMetrics
  distribution?: DistributionMetrics
  budget?: BudgetMetrics
  quality?: QualityMetrics
}
```

### Update Triggers
```typescript
// Real-time updates dipicu oleh:
1. Manual refresh dashboard
2. Data calculation completion
3. New activity logged
4. Cache updates via Redis
5. Business metric changes
```

## 🔄 System Flow

### 1. User Toggles "Live Data Streaming"
```typescript
// DashboardControlPanel.tsx
<Switch
  checked={isSubscribed}
  onCheckedChange={(checked) => {
    if (checked) {
      subscribe()    // Subscribe to dashboard updates
    } else {
      unsubscribe()  // Unsubscribe from updates
    }
  }}
/>
```

### 2. Subscription Process
```typescript
// subscribeToDashboardUpdates()
1. Add user to Redis subscriber set: `dashboard:subscribers:${sppgId}`
2. Set expiry: 1 hour
3. Broadcast confirmation: CLIENT_CONNECTED
4. Return channels:
   - `sppg:${sppgId}:dashboard`
   - `sppg:${sppgId}:alerts`
   - `platform:system`
```

### 3. Real-time Broadcasting
```typescript
// broadcastDashboardUpdate()
1. Publish to Redis channel: `dashboard-update-${sppgId}`
2. WebSocket clients receive updates
3. SSE endpoint forwards to connected browsers
4. Dashboard UI updates automatically
```

## 🎛️ Control Panel Features

### Real-time Updates Card
```typescript
// Features:
✅ Connection status badge (Connected/Disconnected)
✅ Live Data Streaming toggle
✅ Auto-retry on connection failure
✅ Error handling & user feedback
✅ Manual subscription control
```

### Status Indicators
```typescript
// Connection States:
- 'connected': Green badge, Wifi icon
- 'disconnected': Red badge, WifiOff icon  
- 'connecting': Loading state
- 'error': Error state with retry option
```

## 📋 Implementation Details

### SSE Integration
```typescript
// src/app/api/sse/dashboard/route.ts
- Server-Sent Events endpoint
- Redis pub/sub integration
- Per-SPPG channel filtering
- Auto-cleanup on disconnect
```

### Redis Channels
```typescript
// Channel Structure:
WEBSOCKET_CHANNELS = {
  DASHBOARD_UPDATE: (sppgId) => `dashboard-update-${sppgId}`,
  NOTIFICATION: (sppgId) => `notification-${sppgId}`,
  SYSTEM_ALERT: () => 'system-alert'
}
```

### Subscription Management
```typescript
// Redis Keys:
`dashboard:subscribers:${sppgId}` // Active subscribers
`dashboard:cache:${sppgId}`       // Cached dashboard data
`dashboard:history:${sppgId}`     // Activity history
```

## 🔐 Security & Multi-tenancy

### Access Control
```typescript
// Security measures:
1. Session validation per request
2. SPPG-specific channel isolation
3. User ID verification
4. Automatic session expiry
5. Error sanitization
```

### Data Isolation
```typescript
// Each SPPG has isolated channels:
- No cross-tenant data leakage
- Separate Redis keys per SPPG
- User can only subscribe to own SPPG
- Admin access for platform monitoring
```

## 🎯 User Experience

### Toggle Behavior
```typescript
// When user enables "Live Data Streaming":
1. Toast: "Subscribed to real-time dashboard updates"
2. Badge changes to "Connected" (green)
3. Dashboard data updates automatically
4. Activity history updates in real-time
5. Charts and metrics refresh live

// When user disables:
1. Toast: "Unsubscribed from real-time updates"  
2. Badge changes to "Disconnected" (red)
3. Dashboard switches to static/cached data
4. Manual refresh required for updates
```

### Performance Impact
```typescript
// Optimization features:
- 30-second update intervals (not overwhelming)
- Efficient Redis pub/sub
- SSE instead of WebSocket polling
- Smart caching strategy
- Connection cleanup on page leave
```

## 📈 Monitoring & Analytics

### Connection Tracking
```typescript
// Metrics tracked:
- Active subscriber count per SPPG
- Connection duration
- Error rates
- Update frequency
- Data transfer volume
```

### Health Monitoring
```typescript
// System health checks:
- Redis connectivity
- WebSocket performance  
- SSE endpoint status
- Channel message rates
- Error logging & alerting
```

## 🚀 Future Enhancements

### Planned Features
```typescript
// Roadmap:
1. Push notifications integration
2. Mobile app real-time sync
3. Advanced filtering options
4. Custom update intervals
5. Webhook integrations
6. Real-time collaboration
```

---

## ✅ Summary

**Card "Real-time Updates" mengontrol:**
- ✅ Real-time business data streaming untuk SPPG tertentu
- ✅ Dashboard metrics auto-refresh
- ✅ Activity history live updates
- ✅ Chart and KPI real-time sync

**BUKAN untuk:**
- ❌ Global infrastructure monitoring (sudah di header)
- ❌ Platform-wide data streaming
- ❌ Cross-SPPG data access
- ❌ System health controls

**Kesimpulan**: Toggle ini adalah fitur **business real-time** yang memungkinkan dashboard SPPG mendapat update otomatis tanpa refresh manual, dengan scope terbatas pada data SPPG tersebut saja.