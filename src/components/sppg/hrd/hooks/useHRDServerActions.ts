// HRD Server Actions Hooks - Stub Implementation
// Pattern 2 compliant - Component-level hooks for HRD domain
// src/components/sppg/hrd/hooks/useHRDServerActions.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

// Types
import type {
  Employee,
  CreateEmployeeInput,
  EmployeeFilters,
  AttendanceFilters,
  AttendanceInput,
  PerformanceReview,
  CreatePerformanceReviewInput
} from '../types'

// Define missing types for stub
type AttendanceRecord = {
  id: string
  employeeId: string
  date: Date
  clockIn?: Date | null
  clockOut?: Date | null
}

// Stub server actions - will be replaced with actual implementations
const stubServerActions = {
  getEmployees: async (filters?: EmployeeFilters) => {
    console.log('Stub: getEmployees called with filters:', filters)
    return { success: true, data: [] as Employee[] }
  },
  
  createEmployee: async (input: CreateEmployeeInput) => {
    console.log('Stub: createEmployee called with input:', input)
    return { success: true, data: { id: 'emp-1', ...input } as Employee }
  },

  getAttendanceRecords: async (filters?: AttendanceFilters) => {
    console.log('Stub: getAttendanceRecords called with filters:', filters)
    return { success: true, data: [] as AttendanceRecord[] }
  },

  getHrdStats: async () => {
    console.log('Stub: getHrdStats called')
    return {
      success: true,
      data: {
        totalEmployees: 0,
        activeEmployees: 0,
        attendanceRate: 0,
        avgPerformanceRating: 0
      }
    }
  }
}

// Hook implementations using stubs
export function useEmployees(filters?: EmployeeFilters) {
  return useQuery({
    queryKey: ['employees', filters],
    queryFn: () => stubServerActions.getEmployees(filters)
  })
}

export function useEmployee(id: string) {
  return useQuery({
    queryKey: ['employee', id],
    queryFn: () => stubServerActions.getEmployees({}),
    enabled: !!id
  })
}

export function useEmployeeStats() {
  return useQuery({
    queryKey: ['employee-stats'],
    queryFn: () => stubServerActions.getHrdStats()
  })
}

export function useAttendances(filters?: AttendanceFilters) {
  return useQuery({
    queryKey: ['attendances', filters],
    queryFn: () => stubServerActions.getAttendanceRecords(filters)
  })
}

export function usePerformanceReviews(employeeId?: string) {
  return useQuery({
    queryKey: ['performance-reviews', employeeId],
    queryFn: () => ({ success: true, data: [] as PerformanceReview[] }),
    enabled: !!employeeId
  })
}

export function useCreateEmployee() {
  const queryClient = useQueryClient()
  const router = useRouter()

  return useMutation({
    mutationFn: stubServerActions.createEmployee,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] })
      toast.success('Karyawan berhasil ditambahkan')
      router.push('/hrd/employees')
    },
    onError: () => {
      toast.error('Gagal menambahkan karyawan')
    }
  })
}

export function useUpdateEmployee(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: Partial<CreateEmployeeInput>) => {
      console.log('Stub: updateEmployee called for id:', id, 'with input:', input)
      return { success: true, data: { id, ...input } }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] })
      queryClient.invalidateQueries({ queryKey: ['employee', id] })
      toast.success('Data karyawan berhasil diperbarui')
    },
    onError: () => {
      toast.error('Gagal memperbarui data karyawan')
    }
  })
}

export function useDeleteEmployee() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      console.log('Stub: deleteEmployee called for id:', id)
      return { success: true }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] })
      toast.success('Karyawan berhasil dihapus')
    },
    onError: () => {
      toast.error('Gagal menghapus karyawan')
    }
  })
}

export function useCreateAttendance() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: AttendanceInput) => {
      console.log('Stub: createAttendance called with input:', input)
      return { success: true, data: input }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendances'] })
      toast.success('Kehadiran berhasil dicatat')
    },
    onError: () => {
      toast.error('Gagal mencatat kehadiran')
    }
  })
}

export function useUpdateAttendance() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: Partial<AttendanceInput> }) => {
      console.log('Stub: updateAttendance called for id:', id, 'with input:', input)
      return { success: true, data: { id, ...input } }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendances'] })
      toast.success('Data kehadiran berhasil diperbarui')
    },
    onError: () => {
      toast.error('Gagal memperbarui data kehadiran')
    }
  })
}

export function useCreatePerformanceReview() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: CreatePerformanceReviewInput) => {
      console.log('Stub: createPerformanceReview called with input:', input)
      return { success: true, data: input }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['performance-reviews'] })
      toast.success('Penilaian kinerja berhasil dibuat')
    },
    onError: () => {
      toast.error('Gagal membuat penilaian kinerja')
    }
  })
}

export function useUpdatePerformanceReview() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: Partial<CreatePerformanceReviewInput> }) => {
      console.log('Stub: updatePerformanceReview called for id:', id, 'with input:', input)
      return { success: true, data: { id, ...input } }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['performance-reviews'] })
      toast.success('Penilaian kinerja berhasil diperbarui')
    },
    onError: () => {
      toast.error('Gagal memperbarui penilaian kinerja')
    }
  })
}

export function useDeletePerformanceReview() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      console.log('Stub: deletePerformanceReview called for id:', id)
      return { success: true }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['performance-reviews'] })
      toast.success('Penilaian kinerja berhasil dihapus')
    },
    onError: () => {
      toast.error('Gagal menghapus penilaian kinerja')
    }
  })
}