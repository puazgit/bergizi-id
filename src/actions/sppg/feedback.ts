'use server'

import { auth } from '@/auth'
import db from '@/lib/db'
import { FeedbackType, FeedbackStatus, FeedbackPriority, BeneficiaryType } from '@prisma/client'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'

// ================================ VALIDATION SCHEMAS ================================

const createFeedbackSchema = z.object({
  programId: z.string().optional(),
  beneficiaryName: z.string().min(2, 'Nama penerima minimal 2 karakter'),
  beneficiaryType: z.nativeEnum(BeneficiaryType),
  school: z.string().optional(),
  grade: z.string().optional(),
  age: z.number().int().min(1).max(100).optional(),
  feedbackType: z.nativeEnum(FeedbackType),
  subject: z.string().min(5, 'Subjek minimal 5 karakter'),
  message: z.string().min(10, 'Pesan minimal 10 karakter'),
  rating: z.number().int().min(1).max(5).optional(),
  tags: z.array(z.string()).default([]),
  menuId: z.string().optional(),
  distributionId: z.string().optional(),
  photos: z.array(z.string()).default([]),
  anonymous: z.boolean().default(false),
  responseRequired: z.boolean().default(false)
})

const respondToFeedbackSchema = z.object({
  feedbackId: z.string(),
  response: z.string().min(10, 'Respon minimal 10 karakter'),
  actionTaken: z.string().optional()
})

const updateFeedbackStatusSchema = z.object({
  feedbackId: z.string(),
  status: z.nativeEnum(FeedbackStatus),
  priority: z.nativeEnum(FeedbackPriority).optional()
})

// ================================ TYPES ================================

interface FeedbackFilters {
  status?: FeedbackStatus[]
  feedbackType?: FeedbackType[]
  priority?: FeedbackPriority[]
  rating?: number[]
  dateRange?: {
    start: string
    end: string
  }
  search?: string
  beneficiaryType?: BeneficiaryType[]
  responseRequired?: boolean
}

interface FeedbackAnalytics {
  totalFeedback: number
  averageRating: number
  feedbackByType: Record<FeedbackType, number>
  feedbackByStatus: Record<FeedbackStatus, number>
  feedbackByPriority: Record<FeedbackPriority, number>
  satisfactionTrend: Array<{
    date: string
    rating: number
    count: number
  }>
  topIssues: Array<{
    category: string
    count: number
    percentage: number
  }>
  responseMetrics: {
    responseRate: number
    averageResponseTime: number // hours
    resolutionRate: number
  }
}

// ================================ FEEDBACK MANAGEMENT ================================

export async function createBeneficiaryFeedback(data: z.infer<typeof createFeedbackSchema>) {
  try {
    console.log('=== createBeneficiaryFeedback Debug ===')
    console.log('Input data:', JSON.stringify(data, null, 2))
    
    const session = await auth()
    console.log('Session:', { userId: session?.user?.id, sppgId: session?.user?.sppgId })
    
    if (!session?.user?.sppgId) {
      console.log('❌ No SPPG ID in session')
      return { success: false, error: 'Unauthorized - SPPG access required' }
    }

    // Validate input
    const validated = createFeedbackSchema.safeParse(data)
    if (!validated.success) {
      console.log('❌ Validation failed:', validated.error.issues)
      return { 
        success: false, 
        error: validated.error.issues[0].message 
      }
    }
    
    console.log('✅ Validation passed')
    console.log('Validated data:', JSON.stringify(validated.data, null, 2))

    const feedbackData = validated.data

    // Auto-categorize feedback based on content and type
    const category = await categorizeFeedback(feedbackData.message, feedbackData.feedbackType)
    
    // Analyze sentiment
    const sentiment = await analyzeSentiment(feedbackData.message, feedbackData.rating)

    // Determine priority based on type and content
    const priority = determinePriority(feedbackData.feedbackType, feedbackData.rating, feedbackData.message)

    console.log('Creating feedback with category:', category, 'sentiment:', sentiment, 'priority:', priority)
    
    // Create feedback
    const feedback = await db.beneficiaryFeedback.create({
      data: {
        sppgId: session.user.sppgId,
        programId: feedbackData.programId,
        beneficiaryName: feedbackData.beneficiaryName,
        beneficiaryType: feedbackData.beneficiaryType,
        school: feedbackData.school,
        grade: feedbackData.grade,
        age: feedbackData.age,
        feedbackType: feedbackData.feedbackType,
        subject: feedbackData.subject,
        message: feedbackData.message,
        rating: feedbackData.rating,
        tags: feedbackData.tags,
        menuId: feedbackData.menuId,
        distributionId: feedbackData.distributionId,
        photos: feedbackData.photos,
        anonymous: feedbackData.anonymous,
        responseRequired: feedbackData.responseRequired,
        category,
        sentiment,
        priority,
        status: FeedbackStatus.PENDING
      },
      include: {
        program: {
          select: { name: true }
        },
        menu: {
          select: { menuName: true }
        }
      }
    })

    console.log('✅ Feedback created successfully:', feedback.id)

    // Update feedback summary
    await updateFeedbackSummary(session.user.sppgId)

    revalidatePath('/dashboard')
    revalidatePath('/feedback')

    return { 
      success: true, 
      data: feedback,
      message: 'Feedback berhasil dikirim'
    }
  } catch (error) {
    console.error('Create feedback error:', error)
    return { success: false, error: 'Gagal mengirim feedback' }
  }
}

export async function getBeneficiaryFeedback(filters?: FeedbackFilters) {
  try {
    console.log('=== getBeneficiaryFeedback Debug ===')
    const session = await auth()
    console.log('Session user:', {
      id: session?.user?.id,
      email: session?.user?.email,
      sppgId: session?.user?.sppgId
    })
    
    if (!session?.user?.sppgId) {
      console.log('❌ No SPPG ID in session')
      return { success: false, error: 'Unauthorized' }
    }

    // Build where clause
    const where: Record<string, unknown> = {
      sppgId: session.user.sppgId
    }
    
    console.log('Where clause:', where)

    if (filters?.status?.length) {
      where.status = { in: filters.status }
    }

    if (filters?.feedbackType?.length) {
      where.feedbackType = { in: filters.feedbackType }
    }

    if (filters?.priority?.length) {
      where.priority = { in: filters.priority }
    }

    if (filters?.rating?.length) {
      where.rating = { in: filters.rating }
    }

    if (filters?.beneficiaryType?.length) {
      where.beneficiaryType = { in: filters.beneficiaryType }
    }

    if (filters?.responseRequired !== undefined) {
      where.responseRequired = filters.responseRequired
    }

    if (filters?.dateRange) {
      where.createdAt = {
        gte: new Date(filters.dateRange.start),
        lte: new Date(filters.dateRange.end)
      }
    }

    if (filters?.search) {
      where.OR = [
        { subject: { contains: filters.search, mode: 'insensitive' } },
        { message: { contains: filters.search, mode: 'insensitive' } },
        { beneficiaryName: { contains: filters.search, mode: 'insensitive' } },
        { school: { contains: filters.search, mode: 'insensitive' } }
      ]
    }

    const feedback = await db.beneficiaryFeedback.findMany({
      where,
      include: {
        program: {
          select: { name: true }
        },
        menu: {
          select: { menuName: true }
        },
        distribution: {
          select: { 
            distributionDate: true,
            distributionPoint: true 
          }
        },
        beneficiary: {
          select: { 
            schoolName: true,
            schoolType: true 
          }
        }
      },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' }
      ]
    })

    console.log('✅ Found feedback records:', feedback.length)
    if (feedback.length > 0) {
      console.log('Sample feedback:', feedback.slice(0, 2).map(f => ({
        id: f.id,
        beneficiaryName: f.beneficiaryName,
        feedbackType: f.feedbackType,
        subject: f.subject,
        sppgId: f.sppgId
      })))
    }

    return { success: true, data: feedback }
  } catch (error) {
    console.error('Get feedback error:', error)
    return { success: false, error: 'Gagal mengambil data feedback' }
  }
}

export async function respondToFeedback(data: z.infer<typeof respondToFeedbackSchema>) {
  try {
    const session = await auth()
    if (!session?.user?.sppgId) {
      return { success: false, error: 'Unauthorized' }
    }

    const validated = respondToFeedbackSchema.safeParse(data)
    if (!validated.success) {
      return { success: false, error: validated.error.issues[0].message }
    }

    // Verify feedback belongs to SPPG
    const existingFeedback = await db.beneficiaryFeedback.findFirst({
      where: {
        id: validated.data.feedbackId,
        sppgId: session.user.sppgId
      }
    })

    if (!existingFeedback) {
      return { success: false, error: 'Feedback tidak ditemukan' }
    }

    // Update feedback with response
    const updatedFeedback = await db.beneficiaryFeedback.update({
      where: { id: validated.data.feedbackId },
      data: {
        response: validated.data.response,
        respondedAt: new Date(),
        respondedBy: session.user.id,
        actionTaken: validated.data.actionTaken,
        status: FeedbackStatus.RESPONDED
      },
      include: {
        program: { select: { name: true } },
        menu: { select: { menuName: true } }
      }
    })

    // Update summary
    await updateFeedbackSummary(session.user.sppgId)

    revalidatePath('/dashboard')
    revalidatePath('/feedback')

    return { 
      success: true, 
      data: updatedFeedback,
      message: 'Respon berhasil dikirim'
    }
  } catch (error) {
    console.error('Respond to feedback error:', error)
    return { success: false, error: 'Gagal mengirim respon' }
  }
}

export async function updateFeedbackStatus(data: z.infer<typeof updateFeedbackStatusSchema>) {
  try {
    const session = await auth()
    if (!session?.user?.sppgId) {
      return { success: false, error: 'Unauthorized' }
    }

    const validated = updateFeedbackStatusSchema.safeParse(data)
    if (!validated.success) {
      return { success: false, error: validated.error.issues[0].message }
    }

    // Verify feedback belongs to SPPG
    const existingFeedback = await db.beneficiaryFeedback.findFirst({
      where: {
        id: validated.data.feedbackId,
        sppgId: session.user.sppgId
      }
    })

    if (!existingFeedback) {
      return { success: false, error: 'Feedback tidak ditemukan' }
    }

    const updateData: Record<string, unknown> = {
      status: validated.data.status
    }

    if (validated.data.priority) {
      updateData.priority = validated.data.priority
    }

    if (validated.data.status === FeedbackStatus.RESOLVED) {
      updateData.resolved = true
      updateData.resolvedAt = new Date()
    }

    const updatedFeedback = await db.beneficiaryFeedback.update({
      where: { id: validated.data.feedbackId },
      data: updateData
    })

    // Update summary
    await updateFeedbackSummary(session.user.sppgId)

    revalidatePath('/dashboard')
    revalidatePath('/feedback')

    return { success: true, data: updatedFeedback }
  } catch (error) {
    console.error('Update feedback status error:', error)
    return { success: false, error: 'Gagal mengupdate status feedback' }
  }
}

export async function getFeedbackAnalytics(dateRange?: { start: string; end: string }): Promise<{ success: boolean; data?: FeedbackAnalytics; error?: string }> {
  try {
    const session = await auth()
    if (!session?.user?.sppgId) {
      return { success: false, error: 'Unauthorized' }
    }

    const where: Record<string, unknown> = {
      sppgId: session.user.sppgId
    }

    if (dateRange) {
      where.createdAt = {
        gte: new Date(dateRange.start),
        lte: new Date(dateRange.end)
      }
    }

    // Get all feedback for analytics
    const allFeedback = await db.beneficiaryFeedback.findMany({
      where,
      select: {
        id: true,
        feedbackType: true,
        status: true,
        priority: true,
        rating: true,
        createdAt: true,
        respondedAt: true,
        resolved: true,
        category: true,
        tags: true
      }
    })

    const totalFeedback = allFeedback.length
    const ratedFeedback = allFeedback.filter(f => f.rating !== null)
    const averageRating = ratedFeedback.length > 0 
      ? ratedFeedback.reduce((sum: number, f) => sum + (f.rating || 0), 0) / ratedFeedback.length 
      : 0

    // Feedback by type
    const feedbackByType = allFeedback.reduce((acc, feedback) => {
      acc[feedback.feedbackType] = (acc[feedback.feedbackType] || 0) + 1
      return acc
    }, {} as Record<FeedbackType, number>)

    // Feedback by status
    const feedbackByStatus = allFeedback.reduce((acc, feedback) => {
      acc[feedback.status] = (acc[feedback.status] || 0) + 1
      return acc
    }, {} as Record<FeedbackStatus, number>)

    // Feedback by priority
    const feedbackByPriority = allFeedback.reduce((acc, feedback) => {
      acc[feedback.priority] = (acc[feedback.priority] || 0) + 1
      return acc
    }, {} as Record<FeedbackPriority, number>)

    // Satisfaction trend (last 7 days)
    const satisfactionTrend = generateSatisfactionTrend(allFeedback)

    // Top issues
    const topIssues = generateTopIssues(allFeedback)

    // Response metrics
    const respondedFeedback = allFeedback.filter(f => f.respondedAt)
    const resolvedFeedback = allFeedback.filter(f => f.resolved)
    
    const responseRate = totalFeedback > 0 ? (respondedFeedback.length / totalFeedback) * 100 : 0
    const resolutionRate = totalFeedback > 0 ? (resolvedFeedback.length / totalFeedback) * 100 : 0
    
    const averageResponseTime = respondedFeedback.length > 0
      ? respondedFeedback.reduce((sum: number, f) => {
          const responseTime = f.respondedAt && f.createdAt 
            ? (f.respondedAt.getTime() - f.createdAt.getTime()) / (1000 * 60 * 60) // hours
            : 0
          return sum + responseTime
        }, 0) / respondedFeedback.length
      : 0

    const analytics: FeedbackAnalytics = {
      totalFeedback,
      averageRating,
      feedbackByType,
      feedbackByStatus,
      feedbackByPriority,
      satisfactionTrend,
      topIssues,
      responseMetrics: {
        responseRate,
        averageResponseTime,
        resolutionRate
      }
    }

    return { success: true, data: analytics }
  } catch (error) {
    console.error('Get feedback analytics error:', error)
    return { success: false, error: 'Gagal mengambil analytics feedback' }
  }
}

// ================================ HELPER FUNCTIONS ================================

async function categorizeFeedback(message: string, type: FeedbackType): Promise<string> {
  // Simple categorization based on keywords and type
  const messageLC = message.toLowerCase()
  
  if (messageLC.includes('rasa') || messageLC.includes('enak') || messageLC.includes('gurih')) {
    return 'taste'
  } else if (messageLC.includes('porsi') || messageLC.includes('sedikit') || messageLC.includes('banyak')) {
    return 'portion'
  } else if (messageLC.includes('gizi') || messageLC.includes('nutrisi') || messageLC.includes('sehat')) {
    return 'nutrition'
  } else if (messageLC.includes('layanan') || messageLC.includes('pelayanan') || messageLC.includes('staff')) {
    return 'service'
  } else if (messageLC.includes('kebersihan') || messageLC.includes('higienis') || messageLC.includes('kotor')) {
    return 'hygiene'
  } else if (messageLC.includes('waktu') || messageLC.includes('terlambat') || messageLC.includes('cepat')) {
    return 'timing'
  }

  // Fallback to feedback type
  switch (type) {
    case FeedbackType.QUALITY_ISSUE: return 'quality'
    case FeedbackType.SERVICE_ISSUE: return 'service'
    case FeedbackType.PORTION_ISSUE: return 'portion'
    case FeedbackType.NUTRITION_CONCERN: return 'nutrition'
    default: return 'general'
  }
}

async function analyzeSentiment(message: string, rating?: number): Promise<string> {
  // Simple sentiment analysis
  const messageLC = message.toLowerCase()
  
  // Positive indicators
  const positiveWords = ['bagus', 'enak', 'lezat', 'suka', 'senang', 'puas', 'terima kasih', 'mantap']
  const negativeWords = ['buruk', 'tidak enak', 'jelek', 'kecewa', 'marah', 'tidak suka', 'komplain']
  
  const positiveCount = positiveWords.filter(word => messageLC.includes(word)).length
  const negativeCount = negativeWords.filter(word => messageLC.includes(word)).length
  
  if (rating) {
    if (rating >= 4) return 'positive'
    if (rating <= 2) return 'negative'
    return 'neutral'
  }
  
  if (positiveCount > negativeCount) return 'positive'
  if (negativeCount > positiveCount) return 'negative'
  return 'neutral'
}

function determinePriority(type: FeedbackType, rating?: number, message?: string): FeedbackPriority {
  // Critical issues
  if (type === FeedbackType.QUALITY_ISSUE && rating && rating <= 1) {
    return FeedbackPriority.CRITICAL
  }
  
  const messageLC = message?.toLowerCase() || ''
  if (messageLC.includes('sakit') || messageLC.includes('keracunan') || messageLC.includes('alergi')) {
    return FeedbackPriority.CRITICAL
  }
  
  // High priority
  if (type === FeedbackType.COMPLAINT || (rating && rating <= 2)) {
    return FeedbackPriority.HIGH
  }
  
  // Low priority
  if (type === FeedbackType.COMPLIMENT || (rating && rating >= 4)) {
    return FeedbackPriority.LOW
  }
  
  return FeedbackPriority.MEDIUM
}

interface FeedbackData {
  createdAt: Date
  rating: number | null
  category: string | null
}

function generateSatisfactionTrend(feedback: FeedbackData[]): Array<{ date: string; rating: number; count: number }> {
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - i)
    return date.toISOString().split('T')[0]
  }).reverse()
  
  return last7Days.map(date => {
    const dayFeedback = feedback.filter(f => 
      f.createdAt.toISOString().split('T')[0] === date && f.rating
    )
    
    const avgRating = dayFeedback.length > 0
      ? dayFeedback.reduce((sum, f) => sum + (f.rating || 0), 0) / dayFeedback.length
      : 0
    
    return {
      date,
      rating: Number(avgRating.toFixed(1)),
      count: dayFeedback.length
    }
  })
}

function generateTopIssues(feedback: FeedbackData[]): Array<{ category: string; count: number; percentage: number }> {
  const categories = feedback.reduce((acc, f) => {
    if (f.category) {
      acc[f.category] = (acc[f.category] || 0) + 1
    }
    return acc
  }, {} as Record<string, number>)
  
  const total = Object.values(categories).reduce((sum: number, count: number) => sum + count, 0)
  
  return Object.entries(categories)
    .map(([category, count]) => ({
      category,
      count,
      percentage: total > 0 ? Number(((count / total) * 100).toFixed(1)) : 0
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)
}

async function updateFeedbackSummary(sppgId: string) {
  try {
    const today = new Date()
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000)

    // Get today's feedback
    const todayFeedback = await db.beneficiaryFeedback.findMany({
      where: {
        sppgId,
        createdAt: {
          gte: startOfDay,
          lt: endOfDay
        }
      }
    })

    // Calculate metrics
    const totalFeedback = todayFeedback.length
    const averageRating = totalFeedback > 0
      ? todayFeedback.filter(f => f.rating).reduce((sum, f) => sum + (f.rating || 0), 0) / todayFeedback.filter(f => f.rating).length
      : 0

    const positiveFeedback = todayFeedback.filter(f => f.sentiment === 'positive').length
    const negativeFeedback = todayFeedback.filter(f => f.sentiment === 'negative').length
    const neutralFeedback = todayFeedback.filter(f => f.sentiment === 'neutral').length

    const qualityFeedback = todayFeedback.filter(f => f.category === 'quality' || f.category === 'taste').length
    const serviceFeedback = todayFeedback.filter(f => f.category === 'service').length
    const nutritionFeedback = todayFeedback.filter(f => f.category === 'nutrition').length
    const portionFeedback = todayFeedback.filter(f => f.category === 'portion').length

    // Upsert daily summary
    await db.feedbackSummary.upsert({
      where: {
        sppgId_period_date: {
          sppgId,
          period: 'daily',
          date: startOfDay
        }
      },
      update: {
        totalFeedback,
        averageRating,
        positiveFeedback,
        negativeFeedback,
        neutralFeedback,
        qualityFeedback,
        serviceFeedback,
        nutritionFeedback,
        portionFeedback
      },
      create: {
        sppgId,
        period: 'daily',
        date: startOfDay,
        startDate: startOfDay,
        endDate: endOfDay,
        totalFeedback,
        averageRating,
        positiveFeedback,
        negativeFeedback,
        neutralFeedback,
        qualityFeedback,
        serviceFeedback,
        nutritionFeedback,
        portionFeedback
      }
    })
  } catch (error) {
    console.error('Update feedback summary error:', error)
  }
}