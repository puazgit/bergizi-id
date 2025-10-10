import { z } from 'zod'
import { EmploymentStatus, EmploymentType, AttendanceStatus, ReviewType } from '@prisma/client'

// Base schemas
export const phoneNumberSchema = z.string().regex(/^(\+62|62|0)(\d{3,4})-?(\d{3,4})-?(\d{2,6})$/, 'Format nomor telepon tidak valid')
export const emailSchema = z.string().email('Format email tidak valid')
export const objectIdSchema = z.string().cuid('ID tidak valid')
export const positiveNumberSchema = z.number().min(0, 'Nilai harus positif')

// Employee Schema
export const createEmployeeSchema = z.object({
  employeeId: z.string().min(3, 'Employee ID minimal 3 karakter'),
  fullName: z.string().min(2, 'Nama lengkap minimal 2 karakter'),
  nickname: z.string().optional(),
  email: emailSchema.optional(),
  phone: phoneNumberSchema.optional(),
  nik: z.string().min(16, 'NIK minimal 16 karakter').max(16, 'NIK maksimal 16 karakter').optional(),
  dateOfBirth: z.date(),
  gender: z.enum(['MALE', 'FEMALE']),
  addressDetail: z.string().min(10, 'Detail alamat minimal 10 karakter'),
  villageId: z.string().cuid('ID desa tidak valid'),
  departmentId: z.string().cuid('ID departemen tidak valid'),
  positionId: z.string().cuid('ID posisi tidak valid'),
  employmentStatus: z.nativeEnum(EmploymentStatus),
  employmentType: z.nativeEnum(EmploymentType),
  joinDate: z.date(),
  basicSalary: positiveNumberSchema,
  emergencyContactName: z.string().min(2, 'Kontak darurat minimal 2 karakter').optional(),
  emergencyContactPhone: phoneNumberSchema.optional()
})

export const updateEmployeeSchema = createEmployeeSchema.omit({
  dateOfBirth: true,
  gender: true,
  addressDetail: true,
  villageId: true
}).partial().extend({
  id: objectIdSchema
})

// Attendance Schema
export const createAttendanceSchema = z.object({
  employeeId: objectIdSchema,
  attendanceDate: z.date(),
  clockIn: z.date().optional(),
  clockOut: z.date().optional(),
  breakStart: z.date().optional(),
  breakEnd: z.date().optional(),
  status: z.nativeEnum(AttendanceStatus),
  attendanceType: z.string().optional(),
  clockInLocation: z.string().optional(),
  clockOutLocation: z.string().optional(),
  notes: z.string().optional()
})

export const updateAttendanceSchema = createAttendanceSchema.partial().extend({
  id: objectIdSchema
})

// Performance Review Schema
export const createPerformanceReviewSchema = z.object({
  employeeId: objectIdSchema,
  reviewType: z.nativeEnum(ReviewType),
  reviewPeriod: z.string().min(2, 'Periode review minimal 2 karakter'),
  reviewYear: z.number().min(2020).max(2030),
  dueDate: z.date(),
  technicalSkills: z.number().min(0).max(5).optional(),
  communication: z.number().min(0).max(5).optional(),
  teamwork: z.number().min(0).max(5).optional(),
  leadership: z.number().min(0).max(5).optional(),
  problemSolving: z.number().min(0).max(5).optional(),
  timeManagement: z.number().min(0).max(5).optional(),
  qualityOfWork: z.number().min(0).max(5).optional(),
  productivity: z.number().min(0).max(5).optional(),
  innovation: z.number().min(0).max(5).optional(),
  customerService: z.number().min(0).max(5).optional(),
  overallRating: z.string().optional(),
  reviewerComments: z.string().optional(),
  developmentPlan: z.string().optional()
})

export const updatePerformanceReviewSchema = createPerformanceReviewSchema.partial().extend({
  id: objectIdSchema
})

// Filter Schemas
export const employeeFiltersSchema = z.object({
  searchTerm: z.string().optional(),
  departmentFilter: z.string().optional(),
  statusFilter: z.nativeEnum(EmploymentStatus).optional(),
  employmentTypeFilter: z.nativeEnum(EmploymentType).optional()
})

export const attendanceFiltersSchema = z.object({
  employeeId: objectIdSchema.optional(),
  startDate: z.date(),
  endDate: z.date(),
  status: z.nativeEnum(AttendanceStatus).optional()
})

// Type exports
export type CreateEmployeeInput = z.infer<typeof createEmployeeSchema>
export type UpdateEmployeeInput = z.infer<typeof updateEmployeeSchema>
export type CreateAttendanceInput = z.infer<typeof createAttendanceSchema>
export type UpdateAttendanceInput = z.infer<typeof updateAttendanceSchema>
export type CreatePerformanceReviewInput = z.infer<typeof createPerformanceReviewSchema>
export type UpdatePerformanceReviewInput = z.infer<typeof updatePerformanceReviewSchema>
export type EmployeeFiltersInput = z.infer<typeof employeeFiltersSchema>
export type AttendanceFiltersInput = z.infer<typeof attendanceFiltersSchema>