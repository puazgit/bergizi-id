import { FeedbackType, FeedbackStatus, FeedbackPriority, BeneficiaryType } from '@prisma/client'
import { clsx, type ClassValue } from 'clsx'

// ================================ UTILITY TYPES ================================

export interface FeedbackStatusInfo {
  label: string
  color: string
  bgColor: string
  description: string
  icon: string
}

export interface FeedbackTypeInfo {
  label: string
  color: string
  bgColor: string
  description: string
  icon: string
}

export interface FeedbackPriorityInfo {
  label: string
  color: string
  bgColor: string
  description: string
  icon: string
  weight: number
}

export interface BeneficiaryTypeInfo {
  label: string
  color: string
  bgColor: string
  description: string
  icon: string
}

// ================================ STATUS UTILITIES ================================

export const getFeedbackStatusInfo = (status: FeedbackStatus): FeedbackStatusInfo => {
  const statusMap: Record<FeedbackStatus, FeedbackStatusInfo> = {
    PENDING: {
      label: 'Menunggu Review',
      color: 'text-yellow-700 dark:text-yellow-400',
      bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
      description: 'Feedback baru yang belum ditinjau',
      icon: '⏳'
    },
    IN_REVIEW: {
      label: 'Sedang Ditinjau',
      color: 'text-blue-700 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      description: 'Feedback sedang ditinjau oleh staff',
      icon: '🔄'
    },
    RESPONDED: {
      label: 'Sudah Direspon',
      color: 'text-purple-700 dark:text-purple-400',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      description: 'Feedback telah direspon',
      icon: '💬'
    },
    RESOLVED: {
      label: 'Sudah Diselesaikan',
      color: 'text-green-700 dark:text-green-400',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      description: 'Feedback telah diselesaikan',
      icon: '✅'
    },
    CLOSED: {
      label: 'Ditutup',
      color: 'text-gray-700 dark:text-gray-400',
      bgColor: 'bg-gray-50 dark:bg-gray-900/20',
      description: 'Feedback ditutup',
      icon: '🔒'
    },
    ESCALATED: {
      label: 'Dieskalasi',
      color: 'text-red-700 dark:text-red-400',
      bgColor: 'bg-red-50 dark:bg-red-900/20',
      description: 'Feedback dieskalasi ke level lebih tinggi',
      icon: '⚡'
    }
  }

  return statusMap[status]
}

export const getFeedbackTypeInfo = (type: FeedbackType): FeedbackTypeInfo => {
  const typeMap: Record<FeedbackType, FeedbackTypeInfo> = {
    COMPLAINT: {
      label: 'Keluhan',
      color: 'text-red-700 dark:text-red-400',
      bgColor: 'bg-red-50 dark:bg-red-900/20',
      description: 'Keluhan tentang layanan atau produk',
      icon: '😠'
    },
    SUGGESTION: {
      label: 'Saran',
      color: 'text-purple-700 dark:text-purple-400',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      description: 'Saran untuk perbaikan layanan',
      icon: '💡'
    },
    COMPLIMENT: {
      label: 'Pujian',
      color: 'text-green-700 dark:text-green-400',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      description: 'Pujian untuk layanan yang baik',
      icon: '😊'
    },
    INQUIRY: {
      label: 'Pertanyaan',
      color: 'text-blue-700 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      description: 'Pertanyaan tentang layanan',
      icon: '❓'
    },
    QUALITY_ISSUE: {
      label: 'Masalah Kualitas',
      color: 'text-orange-700 dark:text-orange-400',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
      description: 'Masalah terkait kualitas makanan',
      icon: '⚠️'
    },
    SERVICE_ISSUE: {
      label: 'Masalah Layanan',
      color: 'text-pink-700 dark:text-pink-400',
      bgColor: 'bg-pink-50 dark:bg-pink-900/20',
      description: 'Masalah terkait pelayanan',
      icon: '🛠️'
    },
    PORTION_ISSUE: {
      label: 'Masalah Porsi',
      color: 'text-amber-700 dark:text-amber-400',
      bgColor: 'bg-amber-50 dark:bg-amber-900/20',
      description: 'Masalah terkait porsi makanan',
      icon: '🍽️'
    },
    NUTRITION_CONCERN: {
      label: 'Kekhawatiran Gizi',
      color: 'text-emerald-700 dark:text-emerald-400',
      bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
      description: 'Kekhawatiran terkait aspek gizi',
      icon: '🥗'
    }
  }

  return typeMap[type]
}

export const getFeedbackPriorityInfo = (priority: FeedbackPriority): FeedbackPriorityInfo => {
  const priorityMap: Record<FeedbackPriority, FeedbackPriorityInfo> = {
    LOW: {
      label: 'Rendah',
      color: 'text-gray-700 dark:text-gray-400',
      bgColor: 'bg-gray-50 dark:bg-gray-900/20',
      description: 'Prioritas rendah, dapat ditangani nanti',
      icon: '⬇️',
      weight: 1
    },
    MEDIUM: {
      label: 'Sedang',
      color: 'text-yellow-700 dark:text-yellow-400',
      bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
      description: 'Prioritas sedang, perlu perhatian',
      icon: '➡️',
      weight: 2
    },
    HIGH: {
      label: 'Tinggi',
      color: 'text-orange-700 dark:text-orange-400',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
      description: 'Prioritas tinggi, segera ditangani',
      icon: '⬆️',
      weight: 3
    },
    CRITICAL: {
      label: 'Kritis',
      color: 'text-red-700 dark:text-red-400',
      bgColor: 'bg-red-50 dark:bg-red-900/20',
      description: 'Prioritas kritis, harus segera ditangani',
      icon: '🚨',
      weight: 4
    }
  }

  return priorityMap[priority]
}

export const getBeneficiaryTypeInfo = (type: BeneficiaryType): BeneficiaryTypeInfo => {
  const typeMap: Record<BeneficiaryType, BeneficiaryTypeInfo> = {
    CHILD: {
      label: 'Anak',
      color: 'text-blue-700 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      description: 'Anak penerima program gizi',
      icon: '👶'
    },
    PREGNANT_MOTHER: {
      label: 'Ibu Hamil',
      color: 'text-pink-700 dark:text-pink-400',
      bgColor: 'bg-pink-50 dark:bg-pink-900/20',
      description: 'Ibu hamil penerima program gizi',
      icon: '🤰'
    },
    LACTATING_MOTHER: {
      label: 'Ibu Menyusui',
      color: 'text-purple-700 dark:text-purple-400',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      description: 'Ibu menyusui penerima program gizi',
      icon: '🤱'
    },
    ELDERLY: {
      label: 'Lansia',
      color: 'text-amber-700 dark:text-amber-400',
      bgColor: 'bg-amber-50 dark:bg-amber-900/20',
      description: 'Lansia penerima program gizi',
      icon: '�'
    },
    DISABILITY: {
      label: 'Disabilitas',
      color: 'text-indigo-700 dark:text-indigo-400',
      bgColor: 'bg-indigo-50 dark:bg-indigo-900/20',
      description: 'Penyandang disabilitas penerima program gizi',
      icon: '♿'
    }
  }

  return typeMap[type]
}

// ================================ RATING UTILITIES ================================

export const getRatingInfo = (rating: number | null) => {
  if (!rating) return null

  const ratingMap = {
    1: {
      label: 'Sangat Buruk',
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      stars: '⭐',
      emoji: '😠'
    },
    2: {
      label: 'Buruk',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      stars: '⭐⭐',
      emoji: '😞'
    },
    3: {
      label: 'Cukup',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      stars: '⭐⭐⭐',
      emoji: '😐'
    },
    4: {
      label: 'Baik',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      stars: '⭐⭐⭐⭐',
      emoji: '😊'
    },
    5: {
      label: 'Sangat Baik',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      stars: '⭐⭐⭐⭐⭐',
      emoji: '🤩'
    }
  }

  return ratingMap[rating as keyof typeof ratingMap] || null
}

export const getAverageRatingInfo = (averageRating: number) => {
  const roundedRating = Math.round(averageRating)
  const info = getRatingInfo(roundedRating)
  
  return {
    ...info,
    average: averageRating.toFixed(1),
    rounded: roundedRating
  }
}

// ================================ TIME UTILITIES ================================

export const formatTimeAgo = (date: Date): string => {
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) {
    return 'Baru saja'
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60)
    return `${minutes} menit yang lalu`
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600)
    return `${hours} jam yang lalu`
  } else if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400)
    return `${days} hari yang lalu`
  } else if (diffInSeconds < 2592000) {
    const weeks = Math.floor(diffInSeconds / 604800)
    return `${weeks} minggu yang lalu`
  } else if (diffInSeconds < 31536000) {
    const months = Math.floor(diffInSeconds / 2592000)
    return `${months} bulan yang lalu`
  } else {
    const years = Math.floor(diffInSeconds / 31536000)
    return `${years} tahun yang lalu`
  }
}

export const formatResponseTime = (responseTimeInHours: number): string => {
  if (responseTimeInHours < 1) {
    const minutes = Math.floor(responseTimeInHours * 60)
    return `${minutes} menit`
  } else if (responseTimeInHours < 24) {
    return `${Math.floor(responseTimeInHours)} jam`
  } else {
    const days = Math.floor(responseTimeInHours / 24)
    return `${days} hari`
  }
}

// ================================ SORTING UTILITIES ================================

export const compareFeedbackByPriority = (a: { priority: FeedbackPriority }, b: { priority: FeedbackPriority }) => {
  const aWeight = getFeedbackPriorityInfo(a.priority).weight
  const bWeight = getFeedbackPriorityInfo(b.priority).weight
  return bWeight - aWeight // Higher priority first
}

export const compareFeedbackByDate = (a: { createdAt: Date }, b: { createdAt: Date }) => {
  return b.createdAt.getTime() - a.createdAt.getTime() // Newer first
}

export const compareFeedbackByRating = (
  a: { rating: number | null }, 
  b: { rating: number | null }
) => {
  if (a.rating === null && b.rating === null) return 0
  if (a.rating === null) return 1
  if (b.rating === null) return -1
  return a.rating - b.rating // Lower rating first (complaints first)
}

// ================================ FILTER UTILITIES ================================

export const filterFeedbackByStatus = <T extends { status: FeedbackStatus }>(
  feedback: T[], 
  statuses: FeedbackStatus[]
) => {
  if (statuses.length === 0) return feedback
  return feedback.filter(item => statuses.includes(item.status))
}

export const filterFeedbackByType = <T extends { feedbackType: FeedbackType }>(
  feedback: T[], 
  types: FeedbackType[]
) => {
  if (types.length === 0) return feedback
  return feedback.filter(item => types.includes(item.feedbackType))
}

export const filterFeedbackByPriority = <T extends { priority: FeedbackPriority }>(
  feedback: T[], 
  priorities: FeedbackPriority[]
) => {
  if (priorities.length === 0) return feedback
  return feedback.filter(item => priorities.includes(item.priority))
}

export const filterFeedbackByRating = <T extends { rating: number | null }>(
  feedback: T[], 
  ratings: number[]
) => {
  if (ratings.length === 0) return feedback
  return feedback.filter(item => item.rating !== null && ratings.includes(item.rating))
}

export const filterFeedbackBySearch = <T extends { 
  subject: string
  message: string
  beneficiaryName: string
  school?: string | null
}>(
  feedback: T[], 
  searchTerm: string
) => {
  if (!searchTerm.trim()) return feedback
  
  const lowercaseSearch = searchTerm.toLowerCase()
  return feedback.filter(item => 
    item.subject.toLowerCase().includes(lowercaseSearch) ||
    item.message.toLowerCase().includes(lowercaseSearch) ||
    item.beneficiaryName.toLowerCase().includes(lowercaseSearch) ||
    (item.school && item.school.toLowerCase().includes(lowercaseSearch))
  )
}

export const filterFeedbackByDateRange = <T extends { createdAt: Date }>(
  feedback: T[], 
  startDate: string, 
  endDate: string
) => {
  const start = new Date(startDate)
  const end = new Date(endDate)
  end.setHours(23, 59, 59, 999) // Include the entire end date
  
  return feedback.filter(item => 
    item.createdAt >= start && item.createdAt <= end
  )
}

// ================================ VALIDATION UTILITIES ================================

export const isValidRating = (rating: number): boolean => {
  return rating >= 1 && rating <= 5 && Number.isInteger(rating)
}

export const isValidTag = (tag: string): boolean => {
  return /^[a-zA-Z0-9_-]+$/.test(tag) && tag.length >= 2 && tag.length <= 50
}

export const isValidPhotoUrl = (url: string): boolean => {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

// ================================ STATS UTILITIES ================================

export const calculateSatisfactionScore = (ratings: (number | null)[]): number => {
  const validRatings = ratings.filter((rating): rating is number => rating !== null)
  if (validRatings.length === 0) return 0
  
  const average = validRatings.reduce((sum, rating) => sum + rating, 0) / validRatings.length
  return (average / 5) * 100 // Convert to percentage
}

export const calculateResponseRate = (
  totalFeedback: number, 
  totalResponses: number
): number => {
  if (totalFeedback === 0) return 0
  return (totalResponses / totalFeedback) * 100
}

export const calculateResolutionRate = (
  totalFeedback: number, 
  resolvedFeedback: number
): number => {
  if (totalFeedback === 0) return 0
  return (resolvedFeedback / totalFeedback) * 100
}

export const getTopIssues = <T extends { feedbackType: FeedbackType }>(
  feedback: T[], 
  limit: number = 5
) => {
  const issueCount = feedback.reduce((acc, item) => {
    const type = item.feedbackType
    acc[type] = (acc[type] || 0) + 1
    return acc
  }, {} as Record<FeedbackType, number>)

  return Object.entries(issueCount)
    .map(([type, count]) => ({
      category: getFeedbackTypeInfo(type as FeedbackType).label,
      type: type as FeedbackType,
      count,
      percentage: (count / feedback.length) * 100
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)
}

// ================================ CLASSIFICATION UTILITIES ================================

export const classifyFeedbackPriority = (
  feedbackType: FeedbackType, 
  rating: number | null,
  hasPhotos: boolean,
  responseRequired: boolean
): FeedbackPriority => {
  // Critical cases
  if (feedbackType === 'QUALITY_ISSUE' && hasPhotos) return 'CRITICAL'
  if (rating !== null && rating <= 2 && responseRequired) return 'CRITICAL'
  
  // High priority cases
  if (feedbackType === 'COMPLAINT' && rating !== null && rating <= 2) return 'HIGH'
  if (feedbackType === 'QUALITY_ISSUE') return 'HIGH'
  if (feedbackType === 'SERVICE_ISSUE' && responseRequired) return 'HIGH'
  
  // Medium priority cases
  if (feedbackType === 'COMPLAINT') return 'MEDIUM'
  if (feedbackType === 'SERVICE_ISSUE') return 'MEDIUM'
  if (feedbackType === 'SUGGESTION' && responseRequired) return 'MEDIUM'
  
  // Low priority (default)
  return 'LOW'
}

export const generateFeedbackTags = (
  feedbackType: FeedbackType,
  message: string,
  rating: number | null
): string[] => {
  const tags: string[] = []
  
  // Type-based tags
  switch (feedbackType) {
    case 'QUALITY_ISSUE':
      tags.push('kualitas', 'makanan')
      break
    case 'SERVICE_ISSUE':
      tags.push('layanan', 'pelayanan')
      break
    case 'COMPLAINT':
      tags.push('keluhan')
      break
    case 'SUGGESTION':
      tags.push('saran', 'perbaikan')
      break
    case 'COMPLIMENT':
      tags.push('pujian', 'positif')
      break
    case 'INQUIRY':
      tags.push('pertanyaan', 'informasi')
      break
    case 'PORTION_ISSUE':
      tags.push('porsi', 'jumlah')
      break
    case 'NUTRITION_CONCERN':
      tags.push('gizi', 'nutrisi')
      break
  }
  
  // Rating-based tags
  if (rating !== null) {
    if (rating <= 2) tags.push('rating-rendah')
    else if (rating >= 4) tags.push('rating-tinggi')
  }
  
  // Message-based tags (simple keyword detection)
  const messageLower = message.toLowerCase()
  if (messageLower.includes('rasa')) tags.push('rasa')
  if (messageLower.includes('porsi')) tags.push('porsi')
  if (messageLower.includes('higenis') || messageLower.includes('bersih')) tags.push('higienitas')
  if (messageLower.includes('terlambat') || messageLower.includes('lambat')) tags.push('keterlambatan')
  if (messageLower.includes('dingin') || messageLower.includes('panas')) tags.push('suhu')
  
  return [...new Set(tags)] // Remove duplicates
}

// ================================ CSS UTILITIES ================================

export const cn = (...inputs: ClassValue[]) => {
  return clsx(inputs)
}

export const getFeedbackStatusBadgeClass = (status: FeedbackStatus) => {
  const info = getFeedbackStatusInfo(status)
  return cn(
    'inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full',
    info.color,
    info.bgColor
  )
}

export const getFeedbackTypeBadgeClass = (type: FeedbackType) => {
  const info = getFeedbackTypeInfo(type)
  return cn(
    'inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full',
    info.color,
    info.bgColor
  )
}

export const getFeedbackPriorityBadgeClass = (priority: FeedbackPriority) => {
  const info = getFeedbackPriorityInfo(priority)
  return cn(
    'inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full',
    info.color,
    info.bgColor
  )
}

export const getBeneficiaryTypeBadgeClass = (type: BeneficiaryType) => {
  const info = getBeneficiaryTypeInfo(type)
  return cn(
    'inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full',
    info.color,
    info.bgColor
  )
}