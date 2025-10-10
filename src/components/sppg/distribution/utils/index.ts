// Distribution Utils - Pattern 2 Compliant
// src/components/sppg/distribution/utils/index.ts

// Export all schemas and utilities
export * from './distributionSchemas'

// Additional utility functions
export const calculateDistributionEfficiency = (distributed: number, planned: number): number => {
  if (planned === 0) return 0
  return Math.min((distributed / planned) * 100, 100)
}

export const formatDistributionStatus = (status: string): string => {
  return status.replace('_', ' ').toLowerCase()
}

export const getDistributionStatusIcon = (status: string): string => {
  const icons: Record<string, string> = {
    SCHEDULED: '📅',
    PREPARING: '📦',
    IN_TRANSIT: '🚛',
    DISTRIBUTING: '🍽️',
    COMPLETED: '✅',
    CANCELLED: '❌'
  }
  return icons[status] || '❓'
}

export const isDistributionOverdue = (scheduledTime: Date, currentStatus: string): boolean => {
  if (['COMPLETED', 'CANCELLED'].includes(currentStatus)) {
    return false
  }
  
  const now = new Date()
  const scheduled = new Date(scheduledTime)
  
  // Distribution is overdue if it's past scheduled time + 1 hour buffer
  const overdueThreshold = new Date(scheduled.getTime() + (60 * 60 * 1000))
  return now > overdueThreshold
}

export const calculateDistanceMatrix = (points: Array<{lat: number, lng: number}>): number[][] => {
  const matrix: number[][] = []
  
  for (let i = 0; i < points.length; i++) {
    matrix[i] = []
    for (let j = 0; j < points.length; j++) {
      if (i === j) {
        matrix[i][j] = 0
      } else {
        matrix[i][j] = calculateDistance(points[i].lat, points[i].lng, points[j].lat, points[j].lng)
      }
    }
  }
  
  return matrix
}

function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371 // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * 
    Math.sin(dLng / 2) * Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}