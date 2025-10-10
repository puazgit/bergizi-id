'use client'

import { useState, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { FeedbackType, FeedbackStatus, FeedbackPriority, BeneficiaryType } from '@prisma/client'
import { useAuthStore } from '@/stores/auth/authStore'
import {
  createBeneficiaryFeedback,
  getBeneficiaryFeedback,
  respondToFeedback,
  updateFeedbackStatus,
  getFeedbackAnalytics
} from '@/actions/sppg/feedback'

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

export interface CreateFeedbackData {
  programId?: string
  beneficiaryName: string
  beneficiaryType: BeneficiaryType
  school?: string
  grade?: string
  age?: number
  feedbackType: FeedbackType
  subject: string
  message: string
  rating?: number
  tags: string[]
  menuId?: string
  distributionId?: string
  photos: string[]
  anonymous: boolean
  responseRequired: boolean
}

interface RespondToFeedbackData {
  feedbackId: string
  response: string
  actionTaken?: string
}

interface UpdateFeedbackStatusData {
  feedbackId: string
  status: FeedbackStatus
  priority?: FeedbackPriority
}

// ================================ MAIN FEEDBACK HOOK ================================

export const useFeedback = (filters?: FeedbackFilters) => {
  const queryClient = useQueryClient()

  // Get feedback data
  const {
    data: feedbackData,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['feedback', filters],
    queryFn: () => getBeneficiaryFeedback(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false
  })

  const feedback = feedbackData?.success ? feedbackData.data : []

  // Create feedback mutation
  const createMutation = useMutation({
    mutationFn: createBeneficiaryFeedback,
    onSuccess: (result) => {
      if (result.success) {
        toast.success(result.message || 'Feedback berhasil dikirim')
        queryClient.invalidateQueries({ queryKey: ['feedback'] })
        queryClient.invalidateQueries({ queryKey: ['feedback-analytics'] })
      } else {
        toast.error(result.error || 'Gagal mengirim feedback')
      }
    },
    onError: () => {
      toast.error('Gagal mengirim feedback')
    }
  })

  // Respond to feedback mutation
  const respondMutation = useMutation({
    mutationFn: respondToFeedback,
    onSuccess: (result) => {
      if (result.success) {
        toast.success(result.message || 'Respon berhasil dikirim')
        queryClient.invalidateQueries({ queryKey: ['feedback'] })
        queryClient.invalidateQueries({ queryKey: ['feedback-analytics'] })
      } else {
        toast.error(result.error || 'Gagal mengirim respon')
      }
    },
    onError: () => {
      toast.error('Gagal mengirim respon')
    }
  })

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: updateFeedbackStatus,
    onSuccess: (result) => {
      if (result.success) {
        toast.success('Status feedback berhasil diupdate')
        queryClient.invalidateQueries({ queryKey: ['feedback'] })
        queryClient.invalidateQueries({ queryKey: ['feedback-analytics'] })
      } else {
        toast.error(result.error || 'Gagal mengupdate status')
      }
    },
    onError: () => {
      toast.error('Gagal mengupdate status')
    }
  })

  const createFeedback = useCallback((data: CreateFeedbackData) => {
    createMutation.mutate(data)
  }, [createMutation])

  const respondToFeedbackAction = useCallback((data: RespondToFeedbackData) => {
    respondMutation.mutate(data)
  }, [respondMutation])

  const updateStatus = useCallback((data: UpdateFeedbackStatusData) => {
    updateStatusMutation.mutate(data)
  }, [updateStatusMutation])

  return {
    // Data
    feedback,
    isLoading,
    error: error?.message || feedbackData?.error,

    // Actions
    createFeedback,
    respondToFeedback: respondToFeedbackAction,
    updateStatus,
    refetch,

    // Loading states
    isCreating: createMutation.isPending,
    isResponding: respondMutation.isPending,
    isUpdatingStatus: updateStatusMutation.isPending
  }
}

// ================================ FEEDBACK ANALYTICS HOOK ================================

export const useFeedbackAnalytics = (dateRange?: { start: string; end: string }) => {
  const {
    data: analyticsData,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['feedback-analytics', dateRange],
    queryFn: () => getFeedbackAnalytics(dateRange),
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false
  })

  const analytics = analyticsData?.success ? analyticsData.data : null

  return {
    analytics,
    isLoading,
    error: error?.message || analyticsData?.error,
    refetch
  }
}

// ================================ FEEDBACK FILTERS HOOK ================================

export const useFeedbackFilters = () => {
  const [filters, setFilters] = useState<FeedbackFilters>({})

  const updateFilter = useCallback((key: keyof FeedbackFilters, value: FeedbackFilters[typeof key]) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }))
  }, [])

  const clearFilters = useCallback(() => {
    setFilters({})
  }, [])

  const setDateRange = useCallback((start: string, end: string) => {
    setFilters(prev => ({
      ...prev,
      dateRange: { start, end }
    }))
  }, [])

  const toggleStatus = useCallback((status: FeedbackStatus) => {
    setFilters(prev => {
      const currentStatuses = prev.status || []
      const newStatuses = currentStatuses.includes(status)
        ? currentStatuses.filter(s => s !== status)
        : [...currentStatuses, status]
      
      return {
        ...prev,
        status: newStatuses.length > 0 ? newStatuses : undefined
      }
    })
  }, [])

  const toggleFeedbackType = useCallback((type: FeedbackType) => {
    setFilters(prev => {
      const currentTypes = prev.feedbackType || []
      const newTypes = currentTypes.includes(type)
        ? currentTypes.filter(t => t !== type)
        : [...currentTypes, type]
      
      return {
        ...prev,
        feedbackType: newTypes.length > 0 ? newTypes : undefined
      }
    })
  }, [])

  const togglePriority = useCallback((priority: FeedbackPriority) => {
    setFilters(prev => {
      const currentPriorities = prev.priority || []
      const newPriorities = currentPriorities.includes(priority)
        ? currentPriorities.filter(p => p !== priority)
        : [...currentPriorities, priority]
      
      return {
        ...prev,
        priority: newPriorities.length > 0 ? newPriorities : undefined
      }
    })
  }, [])

  const hasActiveFilters = Object.keys(filters).length > 0

  return {
    filters,
    updateFilter,
    clearFilters,
    setDateRange,
    toggleStatus,
    toggleFeedbackType,
    togglePriority,
    hasActiveFilters
  }
}

// ================================ FEEDBACK FORM HOOK ================================

export const useFeedbackForm = () => {
  const [formData, setFormData] = useState<Partial<CreateFeedbackData>>({
    anonymous: false,
    responseRequired: false,
    tags: [],
    photos: []
  })

  const updateField = useCallback((field: keyof CreateFeedbackData, value: CreateFeedbackData[typeof field]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }, [])

  const addTag = useCallback((tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: [...(prev.tags || []), tag]
    }))
  }, [])

  const removeTag = useCallback((tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: (prev.tags || []).filter(tag => tag !== tagToRemove)
    }))
  }, [])

  const addPhoto = useCallback((photoUrl: string) => {
    setFormData(prev => ({
      ...prev,
      photos: [...(prev.photos || []), photoUrl]
    }))
  }, [])

  const removePhoto = useCallback((photoToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      photos: (prev.photos || []).filter(photo => photo !== photoToRemove)
    }))
  }, [])

  const resetForm = useCallback(() => {
    setFormData({
      anonymous: false,
      responseRequired: false,
      tags: [],
      photos: []
    })
  }, [])

  const isValid = formData.beneficiaryName && 
                  formData.beneficiaryType && 
                  formData.feedbackType && 
                  formData.subject && 
                  formData.message

  return {
    formData,
    updateField,
    addTag,
    removeTag,
    addPhoto,
    removePhoto,
    resetForm,
    isValid
  }
}

// ================================ FEEDBACK RESPONSE HOOK ================================

export const useFeedbackResponse = () => {
  const [responseData, setResponseData] = useState({
    response: '',
    actionTaken: ''
  })

  const updateResponse = useCallback((field: 'response' | 'actionTaken', value: string) => {
    setResponseData(prev => ({
      ...prev,
      [field]: value
    }))
  }, [])

  const resetResponse = useCallback(() => {
    setResponseData({
      response: '',
      actionTaken: ''
    })
  }, [])

  const isValidResponse = responseData.response.length >= 10

  return {
    responseData,
    updateResponse,
    resetResponse,
    isValidResponse
  }
}

// ================================ FEEDBACK DASHBOARD INTEGRATION ================================

export const useFeedbackDashboardMetrics = () => {
  const { analytics, isLoading, error } = useFeedbackAnalytics()

  // Transform analytics data for dashboard display
  const dashboardMetrics = analytics ? {
    totalFeedback: analytics.totalFeedback,
    averageRating: analytics.averageRating,
    satisfactionScore: (analytics.averageRating / 5) * 100, // Convert to percentage
    responseRate: analytics.responseMetrics.responseRate,
    resolutionRate: analytics.responseMetrics.resolutionRate,
    pendingFeedback: analytics.feedbackByStatus.PENDING || 0,
    criticalIssues: analytics.feedbackByPriority.CRITICAL || 0,
    topIssueCategory: analytics.topIssues[0]?.category || 'N/A',
    sentiment: {
      positive: analytics.feedbackByType.COMPLIMENT || 0,
      negative: (analytics.feedbackByType.COMPLAINT || 0) + (analytics.feedbackByType.QUALITY_ISSUE || 0),
      neutral: analytics.totalFeedback - ((analytics.feedbackByType.COMPLIMENT || 0) + (analytics.feedbackByType.COMPLAINT || 0) + (analytics.feedbackByType.QUALITY_ISSUE || 0))
    }
  } : null

  return {
    metrics: dashboardMetrics,
    isLoading,
    error,
    rawAnalytics: analytics
  }
}