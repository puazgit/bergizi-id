// Development SSE Mock Data Generator
// src/lib/sse-mock.ts

export interface MockDashboardData {
  type: 'DASHBOARD_UPDATE'
  channel: string
  data: {
    metrics?: {
      totalBeneficiaries: number
      activePrograms: number
      todayMeals: number
      monthlyBudget: number
    }
    alerts?: Array<{
      id: string
      type: 'warning' | 'info' | 'error'
      message: string
      timestamp: number
    }>
    activities?: Array<{
      id: string
      action: string
      user: string
      timestamp: number
    }>
  }
  timestamp: number
}

export class SSEMockGenerator {
  private intervalId: NodeJS.Timeout | null = null
  private callbacks: Array<(data: MockDashboardData) => void> = []

  start() {
    if (this.intervalId) return

    // Generate mock updates every 15 seconds
    this.intervalId = setInterval(() => {
      const mockData: MockDashboardData = {
        type: 'DASHBOARD_UPDATE',
        channel: 'dashboard-update',
        data: this.generateMockData(),
        timestamp: Date.now()
      }

      this.callbacks.forEach(callback => callback(mockData))
    }, 15000) // Every 15 seconds
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }
  }

  subscribe(callback: (data: MockDashboardData) => void) {
    this.callbacks.push(callback)
    return () => {
      const index = this.callbacks.indexOf(callback)
      if (index > -1) {
        this.callbacks.splice(index, 1)
      }
    }
  }

  private generateMockData() {
    return {
      metrics: {
        totalBeneficiaries: Math.floor(Math.random() * 1000) + 500,
        activePrograms: Math.floor(Math.random() * 10) + 5,
        todayMeals: Math.floor(Math.random() * 500) + 200,
        monthlyBudget: Math.floor(Math.random() * 50000000) + 100000000
      },
      activities: [
        {
          id: `activity-${Date.now()}`,
          action: this.getRandomActivity(),
          user: this.getRandomUser(),
          timestamp: Date.now()
        }
      ]
    }
  }

  private getRandomActivity(): string {
    const activities = [
      'Created new menu "Nasi Gudeg"',
      'Updated procurement plan',
      'Completed food production',
      'Distributed meals to school',
      'Added new beneficiary',
      'Updated inventory stock'
    ]
    return activities[Math.floor(Math.random() * activities.length)]
  }

  private getRandomUser(): string {
    const users = [
      'Admin SPPG',
      'Ahli Gizi',
      'Staff Produksi',
      'Staff Distribusi',
      'Manager SPPG'
    ]
    return users[Math.floor(Math.random() * users.length)]
  }
}

// Singleton instance
export const sseMarketingMockGenerator = new SSEMockGenerator()