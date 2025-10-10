// Distribution Domain Schemas - Component-Level Implementation
// Consolidated validation schemas for distribution management
// src/components/sppg/distribution/utils/distributionSchemas.ts

import { z } from 'zod'
import { DistributionStatus } from '@prisma/client'

// ================================ BASE SCHEMAS ================================

// Common validation patterns
const objectIdSchema = z.string().cuid('ID harus berformat CUID yang valid')
const positiveNumberSchema = z.number().min(0, 'Nilai harus lebih besar atau sama dengan 0')

// Indonesian business context
const indonesianDateSchema = z.date().refine(
  (date) => date >= new Date('2020-01-01'),
  { message: 'Tanggal harus setelah 1 Januari 2020' }
)

// Location validation for Indonesia
const indonesianLocationSchema = z.object({
  lat: z.number()
    .min(-11, 'Latitude minimal -11° (Indonesia)')
    .max(6, 'Latitude maksimal 6° (Indonesia)'),
  lng: z.number() 
    .min(95, 'Longitude minimal 95° (Indonesia)')
    .max(141, 'Longitude maksimal 141° (Indonesia)'),
  accuracy: z.number().min(0).optional(),
  heading: z.number().min(0).max(360).optional()
})

// ================================ DISTRIBUTION SCHEMAS ================================

export const createDistributionSchema = z.object({
  // Core Distribution Data
  productionId: objectIdSchema,
  schoolId: objectIdSchema,
  
  // Quantity & Delivery Details
  quantity: z.number()
    .min(1, 'Jumlah distribusi minimal 1 porsi')
    .max(10000, 'Jumlah distribusi maksimal 10,000 porsi'),
    
  deliveryAddress: z.string()
    .min(10, 'Alamat pengiriman minimal 10 karakter')
    .max(500, 'Alamat pengiriman maksimal 500 karakter'),
    
  // Scheduling
  scheduledDeliveryTime: indonesianDateSchema,
  
  // Assignment (optional - can be auto-assigned)
  driverId: objectIdSchema.optional(),
  vehicleId: objectIdSchema.optional(),
  
  // Special Instructions
  specialInstructions: z.string()
    .max(1000, 'Instruksi khusus maksimal 1000 karakter')
    .optional(),
    
  // Contact Information
  contactPerson: z.string()
    .min(2, 'Nama kontak minimal 2 karakter')
    .max(100, 'Nama kontak maksimal 100 karakter')
    .optional(),
    
  contactPhone: z.string()
    .regex(/^(\+62|62|08)[0-9]{8,12}$/, 'Format nomor telepon Indonesia tidak valid')
    .optional()
})

export const updateDistributionStatusSchema = z.object({
  // Status Updates
  status: z.nativeEnum(DistributionStatus),
  
  // Location Tracking
  location: indonesianLocationSchema.optional(),
  
  // Delivery Confirmation
  deliveredQuantity: positiveNumberSchema.optional(),
  receivedBy: z.string()
    .min(2, 'Nama penerima minimal 2 karakter')
    .max(100, 'Nama penerima maksimal 100 karakter')
    .optional(),
  deliveredAt: z.date().optional(),
  
  // Quality & Temperature
  temperatureAtDelivery: z.number()
    .min(-10, 'Suhu minimal -10°C')
    .max(80, 'Suhu maksimal 80°C')
    .optional(),
  qualityScore: z.number()
    .min(1, 'Skor kualitas minimal 1')
    .max(5, 'Skor kualitas maksimal 5')
    .optional(),
    
  // Notes & Documentation
  deliveryNotes: z.string()
    .max(1000, 'Catatan pengiriman maksimal 1000 karakter')
    .optional(),
  deliveryPhotos: z.array(z.string().url('URL foto tidak valid'))
    .max(10, 'Maksimal 10 foto pengiriman')
    .optional()
}).refine(
  (data) => {
    // If status is DELIVERED, deliveredQuantity and receivedBy should be provided
    if (data.status === 'COMPLETED' && (!data.deliveredQuantity || !data.receivedBy)) {
      return false
    }
    return true
  },
  {
    message: 'Status COMPLETED memerlukan jumlah terkirim dan nama penerima',
    path: ['deliveredQuantity']
  }
)

// ================================ DELIVERY TRACKING SCHEMAS ================================

export const deliveryTrackingSchema = z.object({
  distributionId: objectIdSchema,
  location: indonesianLocationSchema,
  timestamp: z.date().default(() => new Date()),
  
  // Additional tracking data
  speed: z.number().min(0).max(200).optional(), // km/h
  batteryLevel: z.number().min(0).max(100).optional(), // %
  signalStrength: z.number().min(0).max(100).optional() // %
})

// ================================ ROUTE OPTIMIZATION SCHEMAS ================================

export const routeOptimizationSchema = z.object({
  schoolId: objectIdSchema,
  deliveryAddress: z.string().min(10, 'Alamat minimal 10 karakter'),
  
  // Delivery constraints
  timeWindow: z.object({
    earliest: z.date(),
    latest: z.date()
  }).optional(),
  
  // Vehicle preferences
  vehicleType: z.enum(['MOTORCYCLE', 'VAN', 'TRUCK']).optional(),
  maxDistance: z.number().min(1).max(200).optional(), // km
  
  // Route preferences
  avoidTolls: z.boolean().default(false),
  avoidHighways: z.boolean().default(false)
})

export const multipleDeliverySchema = z.object({
  deliveries: z.array(z.object({
    schoolId: objectIdSchema,
    address: z.string().min(10),
    quantity: z.number().min(1).max(1000),
    priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']).default('NORMAL'),
    timeWindow: z.object({
      earliest: z.date(),
      latest: z.date()
    }).optional()
  })).min(1, 'Minimal 1 pengiriman').max(20, 'Maksimal 20 pengiriman per rute'),
  
  // Vehicle constraints
  maxCapacity: z.number().min(1).optional(),
  maxDistance: z.number().min(1).max(500).optional(),
  maxDuration: z.number().min(1).max(480).optional(), // minutes
  
  // Optimization preferences
  optimizeFor: z.enum(['DISTANCE', 'TIME', 'FUEL']).default('TIME')
})

// ================================ DELIVERY METRICS SCHEMAS ================================

export const deliveryMetricsQuerySchema = z.object({
  timeRange: z.enum(['1d', '7d', '30d', '90d']).default('7d'),
  groupBy: z.enum(['hour', 'day', 'week']).optional(),
  includeRouteDetails: z.boolean().default(false),
  includeCostAnalysis: z.boolean().default(false)
})

// ================================ VEHICLE ASSIGNMENT SCHEMAS ================================

export const vehicleAssignmentSchema = z.object({
  // Vehicle requirements
  minCapacity: z.number().min(1),
  maxDistance: z.number().min(1).optional(),
  vehicleType: z.enum(['MOTORCYCLE', 'VAN', 'TRUCK']).optional(),
  
  // Driver requirements
  requiredLicense: z.enum(['A', 'B1', 'B2']).optional(),
  experienceLevel: z.enum(['BEGINNER', 'INTERMEDIATE', 'EXPERT']).optional(),
  
  // Route preferences
  preferredDriver: objectIdSchema.optional(),
  preferredVehicle: objectIdSchema.optional()
})

// ================================ LEGACY SUPPORT ================================

// Keep old schema for backward compatibility
// Update Distribution Schema
export const updateDistributionSchema = createDistributionSchema.partial().extend({
  id: objectIdSchema
})

// Create Distribution Point Schema  
export const createDistributionPointSchema = z.object({
  name: z.string().min(2, 'Nama titik distribusi minimal 2 karakter'),
  address: z.string().min(10, 'Alamat minimal 10 karakter'),
  location: indonesianLocationSchema,
  contactPerson: z.string().optional(),
  contactPhone: z.string().optional(),
  capacity: positiveNumberSchema.optional()
})

// Update Distribution Point Schema
export const updateDistributionPointSchema = createDistributionPointSchema.partial().extend({
  id: objectIdSchema
})

export const distributionSchema = createDistributionSchema

// ================================ TYPE EXPORTS ================================

export type CreateDistributionInput = z.infer<typeof createDistributionSchema>
export type UpdateDistributionInput = z.infer<typeof updateDistributionSchema>
export type CreateDistributionPointInput = z.infer<typeof createDistributionPointSchema>
export type UpdateDistributionPointInput = z.infer<typeof updateDistributionPointSchema>
export type UpdateDistributionStatusInput = z.infer<typeof updateDistributionStatusSchema>
export type DeliveryTrackingInput = z.infer<typeof deliveryTrackingSchema>
export type RouteOptimizationInput = z.infer<typeof routeOptimizationSchema>
export type MultipleDeliveryInput = z.infer<typeof multipleDeliverySchema>
export type DeliveryMetricsQueryInput = z.infer<typeof deliveryMetricsQuerySchema>
export type VehicleAssignmentInput = z.infer<typeof vehicleAssignmentSchema>
export type DistributionInput = z.infer<typeof distributionSchema> // Legacy support

// ================================ BUSINESS RULE VALIDATORS ================================

export const canUpdateDistributionStatus = (
  currentStatus: DistributionStatus,
  newStatus: DistributionStatus
): boolean => {
  const allowedTransitions: Record<DistributionStatus, DistributionStatus[]> = {
    SCHEDULED: ['PREPARING', 'CANCELLED'],
    PREPARING: ['IN_TRANSIT', 'CANCELLED'],
    IN_TRANSIT: ['DISTRIBUTING', 'CANCELLED'],
    DISTRIBUTING: ['COMPLETED', 'IN_TRANSIT'], // Can go back for rework
    COMPLETED: [], // Final state
    CANCELLED: ['SCHEDULED'] // Can reschedule
  }
  
  return allowedTransitions[currentStatus]?.includes(newStatus) ?? false
}

export const isDistributionEditable = (status: DistributionStatus): boolean => {
  return !['COMPLETED', 'CANCELLED'].includes(status)
}

export const getDistributionStatusColor = (status: DistributionStatus): string => {
  const colors: Record<DistributionStatus, string> = {
    SCHEDULED: 'blue',
    PREPARING: 'yellow',
    IN_TRANSIT: 'orange', 
    DISTRIBUTING: 'purple',
    COMPLETED: 'green',
    CANCELLED: 'gray'
  }
  return colors[status] || 'gray'
}

export const calculateDeliveryEfficiency = (
  scheduled: Date,
  actual: Date
): number => {
  const scheduledTime = scheduled.getTime()
  const actualTime = actual.getTime()
  
  if (actualTime <= scheduledTime) return 100 // On time or early
  
  const delay = actualTime - scheduledTime
  const maxAcceptableDelay = 30 * 60 * 1000 // 30 minutes in ms
  
  if (delay <= maxAcceptableDelay) {
    return 100 - ((delay / maxAcceptableDelay) * 30) // 70-100% for acceptable delay
  }
  
  return Math.max(0, 70 - ((delay - maxAcceptableDelay) / (60 * 60 * 1000)) * 10) // Decrease by 10% per hour
}

export const validateIndonesianAddress = (address: string): boolean => {
  // Basic Indonesian address validation
  const indonesianKeywords = [
    'jl', 'jalan', 'gang', 'gg', 'rt', 'rw', 'desa', 'kelurahan', 
    'kecamatan', 'kabupaten', 'kota', 'provinsi'
  ]
  
  const lowerAddress = address.toLowerCase()
  return indonesianKeywords.some(keyword => lowerAddress.includes(keyword))
}

export const formatDistributionCode = (year: number, sequence: number): string => {
  return `DIST-${year}-${sequence.toString().padStart(4, '0')}`
}

export const estimateDeliveryTime = (distance: number, trafficFactor: number = 1.2): number => {
  // Returns estimated time in minutes
  const baseSpeed = 30 // km/h average in Indonesian cities
  const timeHours = (distance / baseSpeed) * trafficFactor
  return Math.ceil(timeHours * 60)
}

// ================================ INDONESIAN LOCATION HELPERS ================================

export const isWithinIndonesia = (lat: number, lng: number): boolean => {
  return lat >= -11 && lat <= 6 && lng >= 95 && lng <= 141
}

export const getIndonesianTimezone = (lng: number): string => {
  // Simplified Indonesian timezone detection
  if (lng <= 105) return 'WIB' // Western Indonesia Time
  if (lng <= 120) return 'WITA' // Central Indonesia Time  
  return 'WIT' // Eastern Indonesia Time
}

export const validateIndonesianPhone = (phone: string): boolean => {
  // Indonesian phone number validation
  const pattern = /^(\+62|62|08)[0-9]{8,12}$/
  return pattern.test(phone)
}