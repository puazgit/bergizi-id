'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { 
  PerformanceReview, 
  PerformanceReviewFormData, 
  PerformanceFilters,
  PerformanceMetrics 
} from '../types'

// Mock API functions
const performanceApi = {
  async getPerformanceReviews(filters: PerformanceFilters): Promise<{
    reviews: PerformanceReview[]
    metrics: PerformanceMetrics
  }> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const mockReviews: PerformanceReview[] = [
      {
        id: 'perf-1',
        employeeId: 'EMP001',
        reviewType: 'ANNUAL',
        reviewPeriod: '2023-ANNUAL',
        reviewYear: 2023,
        reviewPeriodStart: new Date('2023-01-01'),
        reviewPeriodEnd: new Date('2023-12-31'),
        reviewerId: 'EMP002',
        reviewerName: 'Dr. Sarah Indrawati',
        goals: [
          'Meningkatkan kualitas menu sehat',
          'Menyelesaikan sertifikasi gizi lanjutan',
          'Memimpin proyek inovasi menu'
        ],
        achievements: [
          'Berhasil mengembangkan 15 menu sehat baru',
          'Menyelesaikan sertifikasi dengan nilai A',
          'Memimpin tim dalam proyek menu inovatif'
        ],
        strengths: [
          'Kemampuan analisis nutrisi yang excellent',
          'Komunikasi yang baik dengan tim',
          'Inisiatif dalam pengembangan produk'
        ],
        areasForImprovement: [
          'Manajemen waktu dalam proyek besar',
          'Presentasi di hadapan stakeholder'
        ],
        skillRatings: {
          technicalSkills: 4.5,
          communication: 4.0,
          teamwork: 4.2,
          leadership: 3.8,
          problemSolving: 4.3,
          timeManagement: 3.7,
          qualityOfWork: 4.4,
          productivity: 4.1,
          innovation: 4.6,
          customerService: 4.0
        },
        overallScore: 4.16,
        performanceLevel: 'EXCEEDS',
        feedback: 'Ahmad menunjukkan performa yang sangat baik sepanjang tahun. Kontribusinya dalam pengembangan menu sehat sangat signifikan. Perlu peningkatan dalam manajemen waktu dan presentasi.',
        developmentPlan: [
          'Mengikuti pelatihan manajemen proyek',
          'Workshop presentasi dan public speaking'
        ],
        recommendedActions: [
          'Promosi ke posisi Senior Nutritionist',
          'Menambah tanggung jawab dalam penelitian'
        ],
        nextReviewDate: new Date('2024-12-31'),
        status: 'COMPLETED',
        createdAt: new Date('2023-12-01'),
        updatedAt: new Date('2023-12-15'),
        employee: {
          fullName: 'Ahmad Surya Pratama',
          employeeId: 'EMP001',
          position: 'Ahli Gizi Senior'
        }
      },
      {
        id: 'perf-2',
        employeeId: 'EMP001',
        reviewType: 'QUARTERLY',
        reviewPeriod: '2024-Q1',
        reviewYear: 2024,
        reviewPeriodStart: new Date('2024-01-01'),
        reviewPeriodEnd: new Date('2024-03-31'),
        reviewerId: 'EMP002',
        reviewerName: 'Dr. Sarah Indrawati',
        goals: [
          'Implementasi menu sehat Q1',
          'Training tim junior',
          'Riset nutrisi anak'
        ],
        achievements: [
          'Berhasil mengimplementasi 5 menu baru',
          'Melatih 3 ahli gizi junior',
          'Menyelesaikan riset nutrisi balita'
        ],
        strengths: [
          'Konsistensi dalam kualitas kerja',
          'Kemampuan mentoring yang baik',
          'Dedikasi tinggi'
        ],
        areasForImprovement: [
          'Dokumentasi yang lebih sistematis',
          'Kolaborasi lintas departemen'
        ],
        skillRatings: {
          technicalSkills: 4.6,
          communication: 4.2,
          teamwork: 4.0,
          leadership: 4.0,
          problemSolving: 4.4,
          timeManagement: 4.0,
          qualityOfWork: 4.5,
          productivity: 4.3,
          innovation: 4.4,
          customerService: 4.1
        },
        overallScore: 4.25,
        performanceLevel: 'EXCEEDS',
        feedback: 'Performa Q1 sangat memuaskan. Ahmad menunjukkan peningkatan dalam kepemimpinan dan mentoring. Terus pertahankan kualitas kerja.',
        developmentPlan: [
          'Pelatihan dokumentasi sistem',
          'Workshop kolaborasi tim'
        ],
        recommendedActions: [
          'Tanggung jawab proyek lintas departemen',
          'Menjadi mentor resmi untuk junior staff'
        ],
        nextReviewDate: new Date('2024-06-30'),
        status: 'COMPLETED',
        createdAt: new Date('2024-03-15'),
        updatedAt: new Date('2024-03-30'),
        employee: {
          fullName: 'Ahmad Surya Pratama',
          employeeId: 'EMP001',
          position: 'Ahli Gizi Senior'
        }
      }
    ]

    const mockMetrics: PerformanceMetrics = {
      averageScore: 4.2,
      completedReviews: 2,
      achievedGoals: 85,
      improvementRate: 8.5
    }

    return {
      reviews: mockReviews,
      metrics: mockMetrics
    }
  },

  async createPerformanceReview(data: PerformanceReviewFormData): Promise<PerformanceReview> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1200))
    
    const overallScore = [
      data.technicalSkills || 0,
      data.communication || 0,
      data.teamwork || 0,
      data.leadership || 0,
      data.problemSolving || 0,
      data.timeManagement || 0,
      data.qualityOfWork || 0,
      data.productivity || 0,
      data.innovation || 0,
      data.customerService || 0
    ].filter(score => score > 0)
    
    const avgScore = overallScore.length > 0 
      ? overallScore.reduce((sum, score) => sum + score, 0) / overallScore.length
      : 0
    
    const newReview: PerformanceReview = {
      id: `perf-${Date.now()}`,
      employeeId: data.employeeId,
      reviewType: data.reviewType,
      reviewPeriod: data.reviewPeriod,
      reviewYear: data.reviewYear,
      reviewPeriodStart: new Date(data.reviewYear, 0, 1),
      reviewPeriodEnd: new Date(data.reviewYear, 11, 31),
      reviewerId: 'current-user-id',
      reviewerName: 'Current User',
      goals: [],
      achievements: [],
      strengths: [],
      areasForImprovement: [],
      skillRatings: {
        technicalSkills: data.technicalSkills || 0,
        communication: data.communication || 0,
        teamwork: data.teamwork || 0,
        leadership: data.leadership || 0,
        problemSolving: data.problemSolving || 0,
        timeManagement: data.timeManagement || 0,
        qualityOfWork: data.qualityOfWork || 0,
        productivity: data.productivity || 0,
        innovation: data.innovation || 0,
        customerService: data.customerService || 0
      },
      overallScore: avgScore,
      performanceLevel: data.overallRating || 'MEETS',
      feedback: data.reviewerComments || '',
      developmentPlan: data.developmentPlan ? [data.developmentPlan] : null,
      recommendedActions: null,
      nextReviewDate: data.dueDate,
      status: 'DRAFT',
      createdAt: new Date(),
      updatedAt: new Date(),
      employee: {
        fullName: 'Employee Name',
        employeeId: data.employeeId,
        position: 'Position'
      }
    }
    
    return newReview
  }
}

// Hooks
export function usePerformanceReviews(filters: PerformanceFilters = {}) {
  const {
    data: response,
    isLoading,
    error
  } = useQuery({
    queryKey: ['performance-reviews', filters],
    queryFn: () => performanceApi.getPerformanceReviews(filters)
  })

  return {
    performanceReviews: response?.reviews,
    performanceMetrics: response?.metrics,
    isLoading,
    error
  }
}

export function useCreatePerformanceReview() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: performanceApi.createPerformanceReview,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['performance-reviews'] })
      toast.success('Evaluasi kinerja berhasil dibuat')
    },
    onError: () => {
      toast.error('Gagal membuat evaluasi kinerja')
    }
  })
}