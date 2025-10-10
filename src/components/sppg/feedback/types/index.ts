import { z } from 'zod'
import { FeedbackType, FeedbackStatus, FeedbackPriority, BeneficiaryType } from '@prisma/client'

// ================================ ENUMS ================================

export const feedbackTypeEnum = z.nativeEnum(FeedbackType)
export const feedbackStatusEnum = z.nativeEnum(FeedbackStatus)
export const feedbackPriorityEnum = z.nativeEnum(FeedbackPriority)
export const beneficiaryTypeEnum = z.nativeEnum(BeneficiaryType)

// ================================ BASE SCHEMAS ================================

export const feedbackFiltersSchema = z.object({
  status: z.array(feedbackStatusEnum).optional(),
  feedbackType: z.array(feedbackTypeEnum).optional(),
  priority: z.array(feedbackPriorityEnum).optional(),
  rating: z.array(z.number().min(1).max(5)).optional(),
  dateRange: z.object({
    start: z.string().datetime(),
    end: z.string().datetime()
  }).optional(),
  search: z.string().optional(),
  beneficiaryType: z.array(beneficiaryTypeEnum).optional(),
  responseRequired: z.boolean().optional()
})

export const createFeedbackSchema = z.object({
  // Program/Menu associations
  programId: z.string().cuid().optional(),
  menuId: z.string().cuid().optional(),
  distributionId: z.string().cuid().optional(),
  
  // Beneficiary information
  beneficiaryName: z.string()
    .min(2, 'Nama minimal 2 karakter')
    .max(100, 'Nama maksimal 100 karakter')
    .regex(/^[a-zA-Z\s]+$/, 'Nama hanya boleh berisi huruf dan spasi'),
  
  beneficiaryType: beneficiaryTypeEnum,
  
  school: z.string()
    .min(3, 'Nama sekolah minimal 3 karakter')
    .max(100, 'Nama sekolah maksimal 100 karakter')
    .optional(),
  
  grade: z.string()
    .max(20, 'Kelas maksimal 20 karakter')
    .optional(),
  
  age: z.number()
    .min(1, 'Umur minimal 1 tahun')
    .max(100, 'Umur maksimal 100 tahun')
    .optional(),
  
  // Feedback content
  feedbackType: feedbackTypeEnum,
  
  subject: z.string()
    .min(5, 'Subjek minimal 5 karakter')
    .max(200, 'Subjek maksimal 200 karakter'),
  
  message: z.string()
    .min(10, 'Pesan minimal 10 karakter')
    .max(2000, 'Pesan maksimal 2000 karakter'),
  
  rating: z.number()
    .min(1, 'Rating minimal 1')
    .max(5, 'Rating maksimal 5')
    .optional(),
  
  tags: z.array(
    z.string()
      .min(2, 'Tag minimal 2 karakter')
      .max(50, 'Tag maksimal 50 karakter')
      .regex(/^[a-zA-Z0-9_-]+$/, 'Tag hanya boleh berisi huruf, angka, underscore, dan dash')
  ).max(10, 'Maksimal 10 tag'),
  
  // Media attachments
  photos: z.array(
    z.string().url('URL foto tidak valid')
  ).max(5, 'Maksimal 5 foto'),
  
  // Privacy settings
  anonymous: z.boolean().default(false),
  responseRequired: z.boolean().default(false)
})

export const respondToFeedbackSchema = z.object({
  feedbackId: z.string().cuid('ID feedback tidak valid'),
  
  response: z.string()
    .min(10, 'Respon minimal 10 karakter')
    .max(2000, 'Respon maksimal 2000 karakter'),
  
  actionTaken: z.string()
    .max(500, 'Tindakan yang diambil maksimal 500 karakter')
    .optional()
})

export const updateFeedbackStatusSchema = z.object({
  feedbackId: z.string().cuid('ID feedback tidak valid'),
  status: feedbackStatusEnum,
  priority: feedbackPriorityEnum.optional()
})

export const feedbackAnalyticsParamsSchema = z.object({
  start: z.string().datetime().optional(),
  end: z.string().datetime().optional()
})

// ================================ VALIDATION SCHEMAS ================================

export const beneficiaryFormSchema = z.object({
  name: z.string()
    .min(2, 'Nama minimal 2 karakter')
    .max(100, 'Nama maksimal 100 karakter'),
  
  type: beneficiaryTypeEnum,
  
  school: z.string()
    .min(3, 'Nama sekolah minimal 3 karakter')
    .max(100, 'Nama sekolah maksimal 100 karakter')
    .optional(),
  
  grade: z.string()
    .max(20, 'Kelas maksimal 20 karakter')
    .optional(),
  
  age: z.number()
    .min(1, 'Umur minimal 1 tahun')
    .max(100, 'Umur maksimal 100 tahun')
    .optional()
})

export const feedbackContentSchema = z.object({
  subject: z.string()
    .min(5, 'Subjek minimal 5 karakter')
    .max(200, 'Subjek maksimal 200 karakter'),
  
  message: z.string()
    .min(10, 'Pesan minimal 10 karakter')
    .max(2000, 'Pesan maksimal 2000 karakter'),
  
  feedbackType: feedbackTypeEnum,
  
  rating: z.number()
    .min(1, 'Rating minimal 1')
    .max(5, 'Rating maksimal 5')
    .optional(),
  
  programId: z.string().cuid().optional(),
  menuId: z.string().cuid().optional(),
  distributionId: z.string().cuid().optional()
})

export const feedbackMetadataSchema = z.object({
  tags: z.array(
    z.string()
      .min(2, 'Tag minimal 2 karakter')
      .max(50, 'Tag maksimal 50 karakter')
      .regex(/^[a-zA-Z0-9_-]+$/, 'Tag hanya boleh berisi huruf, angka, underscore, dan dash')
  ).max(10, 'Maksimal 10 tag'),
  
  photos: z.array(
    z.string().url('URL foto tidak valid')
  ).max(5, 'Maksimal 5 foto'),
  
  anonymous: z.boolean().default(false),
  responseRequired: z.boolean().default(false)
})

// ================================ RESPONSE SCHEMAS ================================

export const feedbackResponseSchema = z.object({
  id: z.string().cuid(),
  beneficiaryName: z.string(),
  beneficiaryType: beneficiaryTypeEnum,
  school: z.string().optional(),
  grade: z.string().optional(),
  age: z.number().optional(),
  feedbackType: feedbackTypeEnum,
  subject: z.string(),
  message: z.string(),
  rating: z.number().optional(),
  tags: z.array(z.string()),
  photos: z.array(z.string()),
  anonymous: z.boolean(),
  responseRequired: z.boolean(),
  status: feedbackStatusEnum,
  priority: feedbackPriorityEnum,
  staffResponse: z.string().optional(),
  actionTaken: z.string().optional(),
  respondedBy: z.string().optional(),
  respondedAt: z.date().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
  sppg: z.object({
    id: z.string().cuid(),
    sppgName: z.string()
  }),
  program: z.object({
    id: z.string().cuid(),
    name: z.string()
  }).optional(),
  menu: z.object({
    id: z.string().cuid(),
    menuName: z.string()
  }).optional(),
  distribution: z.object({
    id: z.string().cuid(),
    plannedDate: z.date()
  }).optional()
})

export const feedbackAnalyticsSchema = z.object({
  totalFeedback: z.number(),
  averageRating: z.number(),
  feedbackByStatus: z.record(z.string(), z.number()),
  feedbackByType: z.record(z.string(), z.number()),
  feedbackByPriority: z.record(z.string(), z.number()),
  responseMetrics: z.object({
    responseRate: z.number(),
    averageResponseTime: z.number(),
    resolutionRate: z.number()
  }),
  topIssues: z.array(z.object({
    category: z.string(),
    count: z.number(),
    percentage: z.number()
  })),
  satisfactionTrend: z.array(z.object({
    date: z.string(),
    rating: z.number(),
    count: z.number()
  }))
})

// ================================ TYPE EXPORTS ================================

export type FeedbackFilters = z.infer<typeof feedbackFiltersSchema>
export type CreateFeedbackData = z.infer<typeof createFeedbackSchema>
export type RespondToFeedbackData = z.infer<typeof respondToFeedbackSchema>
export type UpdateFeedbackStatusData = z.infer<typeof updateFeedbackStatusSchema>
export type FeedbackAnalyticsParams = z.infer<typeof feedbackAnalyticsParamsSchema>

export type BeneficiaryFormData = z.infer<typeof beneficiaryFormSchema>
export type FeedbackContentData = z.infer<typeof feedbackContentSchema>
export type FeedbackMetadataData = z.infer<typeof feedbackMetadataSchema>

export type FeedbackResponse = z.infer<typeof feedbackResponseSchema>
export type FeedbackAnalytics = z.infer<typeof feedbackAnalyticsSchema>

// ================================ DATABASE TYPES ================================

// Type for feedback data returned from database queries
export interface FeedbackData {
  id: string
  sppgId: string
  programId?: string | null
  menuId?: string | null
  distributionId?: string | null
  
  // Beneficiary information
  beneficiaryName: string
  beneficiaryType: BeneficiaryType
  school?: string | null
  grade?: string | null
  age?: number | null
  
  // Feedback content
  feedbackType: FeedbackType
  subject: string
  message: string
  rating?: number | null
  tags: string[]
  photos: string[]
  
  // Privacy and response settings
  anonymous: boolean
  responseRequired: boolean
  
  // Status and workflow
  status: FeedbackStatus
  priority: FeedbackPriority
  resolved: boolean
  
  // Staff response
  staffResponse?: string | null
  actionTaken?: string | null
  respondedAt?: Date | null
  respondedBy?: string | null
  resolvedAt?: Date | null
  
  // Timestamps
  createdAt: Date
  updatedAt: Date
}

// ================================ VALIDATION HELPERS ================================

export const validateCreateFeedback = (data: unknown) => {
  return createFeedbackSchema.safeParse(data)
}

export const validateRespondToFeedback = (data: unknown) => {
  return respondToFeedbackSchema.safeParse(data)
}

export const validateUpdateFeedbackStatus = (data: unknown) => {
  return updateFeedbackStatusSchema.safeParse(data)
}

export const validateFeedbackFilters = (data: unknown) => {
  return feedbackFiltersSchema.safeParse(data)
}

// ================================ FORM STEP VALIDATION ================================

export const validateBeneficiaryForm = (data: unknown) => {
  return beneficiaryFormSchema.safeParse(data)
}

export const validateFeedbackContent = (data: unknown) => {
  return feedbackContentSchema.safeParse(data)
}

export const validateFeedbackMetadata = (data: unknown) => {
  return feedbackMetadataSchema.safeParse(data)
}

// ================================ CONSTANTS ================================

export const FEEDBACK_CONSTANTS = {
  MAX_TAGS: 10,
  MAX_PHOTOS: 5,
  MIN_MESSAGE_LENGTH: 10,
  MAX_MESSAGE_LENGTH: 2000,
  MIN_SUBJECT_LENGTH: 5,
  MAX_SUBJECT_LENGTH: 200,
  MIN_RESPONSE_LENGTH: 10,
  MAX_RESPONSE_LENGTH: 2000,
  MAX_ACTION_TAKEN_LENGTH: 500,
  MIN_BENEFICIARY_NAME_LENGTH: 2,
  MAX_BENEFICIARY_NAME_LENGTH: 100,
  MIN_SCHOOL_NAME_LENGTH: 3,
  MAX_SCHOOL_NAME_LENGTH: 100,
  MAX_GRADE_LENGTH: 20,
  MIN_AGE: 1,
  MAX_AGE: 100,
  MIN_RATING: 1,
  MAX_RATING: 5,
  MIN_TAG_LENGTH: 2,
  MAX_TAG_LENGTH: 50
} as const

// ================================ ERROR MESSAGES ================================

export const FEEDBACK_ERROR_MESSAGES = {
  BENEFICIARY_NAME_REQUIRED: 'Nama penerima manfaat wajib diisi',
  BENEFICIARY_NAME_TOO_SHORT: `Nama minimal ${FEEDBACK_CONSTANTS.MIN_BENEFICIARY_NAME_LENGTH} karakter`,
  BENEFICIARY_NAME_TOO_LONG: `Nama maksimal ${FEEDBACK_CONSTANTS.MAX_BENEFICIARY_NAME_LENGTH} karakter`,
  BENEFICIARY_NAME_INVALID: 'Nama hanya boleh berisi huruf dan spasi',
  
  BENEFICIARY_TYPE_REQUIRED: 'Jenis penerima manfaat wajib dipilih',
  
  SCHOOL_TOO_SHORT: `Nama sekolah minimal ${FEEDBACK_CONSTANTS.MIN_SCHOOL_NAME_LENGTH} karakter`,
  SCHOOL_TOO_LONG: `Nama sekolah maksimal ${FEEDBACK_CONSTANTS.MAX_SCHOOL_NAME_LENGTH} karakter`,
  
  GRADE_TOO_LONG: `Kelas maksimal ${FEEDBACK_CONSTANTS.MAX_GRADE_LENGTH} karakter`,
  
  AGE_TOO_LOW: `Umur minimal ${FEEDBACK_CONSTANTS.MIN_AGE} tahun`,
  AGE_TOO_HIGH: `Umur maksimal ${FEEDBACK_CONSTANTS.MAX_AGE} tahun`,
  
  FEEDBACK_TYPE_REQUIRED: 'Jenis feedback wajib dipilih',
  
  SUBJECT_REQUIRED: 'Subjek wajib diisi',
  SUBJECT_TOO_SHORT: `Subjek minimal ${FEEDBACK_CONSTANTS.MIN_SUBJECT_LENGTH} karakter`,
  SUBJECT_TOO_LONG: `Subjek maksimal ${FEEDBACK_CONSTANTS.MAX_SUBJECT_LENGTH} karakter`,
  
  MESSAGE_REQUIRED: 'Pesan wajib diisi',
  MESSAGE_TOO_SHORT: `Pesan minimal ${FEEDBACK_CONSTANTS.MIN_MESSAGE_LENGTH} karakter`,
  MESSAGE_TOO_LONG: `Pesan maksimal ${FEEDBACK_CONSTANTS.MAX_MESSAGE_LENGTH} karakter`,
  
  RATING_TOO_LOW: `Rating minimal ${FEEDBACK_CONSTANTS.MIN_RATING}`,
  RATING_TOO_HIGH: `Rating maksimal ${FEEDBACK_CONSTANTS.MAX_RATING}`,
  
  TOO_MANY_TAGS: `Maksimal ${FEEDBACK_CONSTANTS.MAX_TAGS} tag`,
  TAG_TOO_SHORT: `Tag minimal ${FEEDBACK_CONSTANTS.MIN_TAG_LENGTH} karakter`,
  TAG_TOO_LONG: `Tag maksimal ${FEEDBACK_CONSTANTS.MAX_TAG_LENGTH} karakter`,
  TAG_INVALID: 'Tag hanya boleh berisi huruf, angka, underscore, dan dash',
  
  TOO_MANY_PHOTOS: `Maksimal ${FEEDBACK_CONSTANTS.MAX_PHOTOS} foto`,
  PHOTO_URL_INVALID: 'URL foto tidak valid',
  
  RESPONSE_REQUIRED: 'Respon wajib diisi',
  RESPONSE_TOO_SHORT: `Respon minimal ${FEEDBACK_CONSTANTS.MIN_RESPONSE_LENGTH} karakter`,
  RESPONSE_TOO_LONG: `Respon maksimal ${FEEDBACK_CONSTANTS.MAX_RESPONSE_LENGTH} karakter`,
  
  ACTION_TAKEN_TOO_LONG: `Tindakan yang diambil maksimal ${FEEDBACK_CONSTANTS.MAX_ACTION_TAKEN_LENGTH} karakter`,
  
  FEEDBACK_ID_INVALID: 'ID feedback tidak valid',
  
  STATUS_REQUIRED: 'Status wajib dipilih',
  
  DATE_INVALID: 'Format tanggal tidak valid'
} as const