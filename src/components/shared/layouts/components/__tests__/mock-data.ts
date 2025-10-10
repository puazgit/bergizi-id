/**
 * Mock Data untuk Testing Header UI Components
 * Membantu testing berbagai status conditions
 */

export const mockWebSocketStatus = {
  connected: {
    status: 'CONNECTED' as const,
    connectionId: 'ws-12345',
    reconnectAttempts: 0,
    latency: 45
  },
  connecting: {
    status: 'CONNECTING' as const,
    connectionId: undefined,
    reconnectAttempts: 1,
    latency: undefined
  },
  disconnected: {
    status: 'DISCONNECTED' as const,
    connectionId: undefined,
    reconnectAttempts: 3,
    latency: undefined
  },
  error: {
    status: 'ERROR' as const,
    connectionId: undefined,
    reconnectAttempts: 5,
    latency: undefined
  }
}

export const mockSystemHealth = {
  healthy: {
    overall: 'HEALTHY' as const,
    database: 'CONNECTED' as const,
    redis: 'CONNECTED' as const,
    apis: 'RESPONSIVE' as const,
    uptime: 86400, // 24 hours
    responseTime: 120,
    errorRate: 0.05,
    lastCheck: new Date().toISOString()
  },
  warning: {
    overall: 'WARNING' as const,
    database: 'SLOW' as const,
    redis: 'CONNECTED' as const,
    apis: 'SLOW' as const,
    uptime: 86400,
    responseTime: 850,
    errorRate: 2.1,
    lastCheck: new Date().toISOString()
  },
  critical: {
    overall: 'CRITICAL' as const,
    database: 'DISCONNECTED' as const,
    redis: 'DISCONNECTED' as const,
    apis: 'TIMEOUT' as const,
    uptime: 0,
    responseTime: 0,
    errorRate: 15.3,
    lastCheck: new Date().toISOString()
  },
  loading: {
    overall: 'WARNING' as const,
    database: 'DISCONNECTED' as const,
    redis: 'DISCONNECTED' as const,
    apis: 'TIMEOUT' as const,
    uptime: 0,
    responseTime: 0,
    errorRate: 0,
    lastCheck: new Date().toISOString()
  }
}

export const mockUsers = {
  sppgKepala: {
    id: '1',
    email: 'kepala@sppg.example.com',
    name: 'Dr. Ahmad Santoso',
    userRole: 'SPPG_KEPALA',
    sppgId: 'sppg-1',
    sppgName: 'SPPG Jakarta Pusat',
    sppgCode: 'SPPG-JKT-001',
    isDemoAccount: false
  },
  sppgStaff: {
    id: '2',
    email: 'staff@sppg.example.com',
    name: 'Siti Nurhaliza',
    userRole: 'SPPG_STAFF_DAPUR',
    sppgId: 'sppg-1',
    sppgName: 'SPPG Jakarta Pusat',
    sppgCode: 'SPPG-JKT-001',
    isDemoAccount: false
  },
  platformAdmin: {
    id: '3',
    email: 'admin@bergizi.id',
    name: 'Platform Administrator',
    userRole: 'PLATFORM_SUPERADMIN',
    sppgId: null,
    sppgName: null,
    sppgCode: null,
    isDemoAccount: false
  },
  demoUser: {
    id: '4',
    email: 'demo@demo.com',
    name: 'Demo User',
    userRole: 'DEMO_USER',
    sppgId: 'demo-sppg',
    sppgName: 'Demo SPPG',
    sppgCode: 'DEMO-001',
    isDemoAccount: true
  }
}

/**
 * Testing scenarios untuk different UI states
 */
export const testScenarios = {
  // Normal operation
  allGood: {
    websocketStatus: mockWebSocketStatus.connected,
    systemHealth: mockSystemHealth.healthy,
    isLoading: false
  },
  
  // Initial loading
  initializing: {
    websocketStatus: mockWebSocketStatus.connecting,
    systemHealth: mockSystemHealth.loading,
    isLoading: true
  },
  
  // Partial issues
  someIssues: {
    websocketStatus: mockWebSocketStatus.connected,
    systemHealth: mockSystemHealth.warning,
    isLoading: false
  },
  
  // System down
  systemDown: {
    websocketStatus: mockWebSocketStatus.error,
    systemHealth: mockSystemHealth.critical,
    isLoading: false
  },
  
  // Connection issues
  networkIssues: {
    websocketStatus: mockWebSocketStatus.disconnected,
    systemHealth: mockSystemHealth.warning,
    isLoading: false
  }
}

/**
 * Mock configuration untuk header
 */
export const mockHeaderConfig = {
  brand: {
    name: 'Bergizi-ID',
    subtitle: 'SaaS Platform',
    homeUrl: '/',
    logo: null
  },
  navigation: {
    showSearch: true,
    showNotifications: true,
    showUserMenu: true
  },
  theme: {
    showThemeToggle: true
  }
}

/**
 * Expected display text untuk different user roles dan scenarios
 */
export const expectedDisplayText = {
  sppgUser: {
    websocket: 'Live',
    system: 'Sistem', 
    redis: 'Performa'
  },
  platformAdmin: {
    websocket: 'WebSocket',
    system: 'System',
    redis: 'Redis'
  }
}

/**
 * Expected tooltip content untuk different states
 */
export const expectedTooltips = {
  loading: {
    websocket: 'Menginisialisasi koneksi real-time...',
    system: 'Memeriksa status sistem...',
    redis: 'Memeriksa performa sistem...'
  },
  healthy: {
    websocket: 'Status Real-Time: Terhubung dengan baik - Respon: 45ms',
    system: 'Status Sistem: Berjalan dengan baik\n✅ Database: Normal\n⚡ Respon: 120ms\n⏱️ Uptime: 24h 0m\n📊 Error Rate: 0.05%',
    redis: 'Status Performa: Optimal\n🕒 Terakhir dicek: [timestamp]\n✅ Semua berjalan lancar'
  },
  error: {
    websocket: 'Status Real-Time: Ada masalah koneksi - Mencoba koneksi ulang (5)',
    system: 'Status Sistem: Ada masalah serius\n❌ Database: Bermasalah\n⚡ Respon: 0ms\n⏱️ Uptime: 0h 0m\n📊 Error Rate: 15.30%',
    redis: 'Status Performa: Tidak tersedia\n🕒 Terakhir dicek: [timestamp]\n❌ Ada masalah dengan cache sistem'
  }
}