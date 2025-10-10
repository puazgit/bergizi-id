'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { 
  EmployeeAttendance, 
  AttendanceFormData, 
  AttendanceFilters, 
  AttendanceResponse,
  AttendanceSummary 
} from '../types'

// Mock API functions
const attendanceApi = {
  async getAttendance(filters: AttendanceFilters): Promise<AttendanceResponse> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800))
    
    const mockAttendance: EmployeeAttendance[] = [
      {
        id: 'att-1',
        employeeId: 'EMP001',
        attendanceDate: new Date('2023-10-01'),
        dayOfWeek: 'Sunday',
        clockIn: new Date('2023-10-01T08:00:00'),
        clockOut: new Date('2023-10-01T17:00:00'),
        breakStart: new Date('2023-10-01T12:00:00'),
        breakEnd: new Date('2023-10-01T13:00:00'),
        scheduledHours: 8,
        actualHours: 8,
        breakHours: 1,
        overtimeHours: 0,
        status: 'PRESENT',
        attendanceType: 'REGULAR',
        clockInLocation: 'Jakarta Office',
        clockOutLocation: 'Jakarta Office',
        notes: null,
        approvedBy: null,
        createdAt: new Date('2023-10-01T08:00:00'),
        updatedAt: new Date('2023-10-01T17:00:00'),
        employee: {
          fullName: 'Ahmad Surya Pratama',
          employeeId: 'EMP001',
          department: 'Gizi dan Pangan'
        }
      },
      {
        id: 'att-2',
        employeeId: 'EMP001',
        attendanceDate: new Date('2023-10-02'),
        dayOfWeek: 'Monday',
        clockIn: new Date('2023-10-02T08:15:00'),
        clockOut: new Date('2023-10-02T17:00:00'),
        breakStart: new Date('2023-10-02T12:00:00'),
        breakEnd: new Date('2023-10-02T13:00:00'),
        scheduledHours: 8,
        actualHours: 7.75,
        breakHours: 1,
        overtimeHours: 0,
        status: 'LATE',
        attendanceType: 'REGULAR',
        clockInLocation: 'Jakarta Office',
        clockOutLocation: 'Jakarta Office',
        notes: 'Terlambat karena macet',
        approvedBy: null,
        createdAt: new Date('2023-10-02T08:15:00'),
        updatedAt: new Date('2023-10-02T17:00:00'),
        employee: {
          fullName: 'Ahmad Surya Pratama',
          employeeId: 'EMP001',
          department: 'Gizi dan Pangan'
        }
      },
      {
        id: 'att-3',
        employeeId: 'EMP001',
        attendanceDate: new Date('2023-10-03'),
        dayOfWeek: 'Tuesday',
        clockIn: null,
        clockOut: null,
        breakStart: null,
        breakEnd: null,
        scheduledHours: 8,
        actualHours: 0,
        breakHours: 0,
        overtimeHours: 0,
        status: 'SICK_LEAVE',
        attendanceType: 'LEAVE',
        clockInLocation: null,
        clockOutLocation: null,
        notes: 'Sakit demam',
        approvedBy: 'EMP002',
        createdAt: new Date('2023-10-03T08:00:00'),
        updatedAt: new Date('2023-10-03T08:00:00'),
        employee: {
          fullName: 'Ahmad Surya Pratama',
          employeeId: 'EMP001',
          department: 'Gizi dan Pangan'
        }
      }
    ]

    const mockSummary: AttendanceSummary = {
      employeeId: filters.employeeId || 'EMP-001',
      employeeName: 'John Doe',
      department: 'IT',
      totalWorkdays: 22,
      daysPresent: 20,
      presentDays: 20, // duplicate for interface compatibility
      daysAbsent: 1,
      absentDays: 1, // duplicate for interface compatibility
      daysLate: 1,
      lateDays: 1, // duplicate for interface compatibility
      totalHours: 160,
      totalWorkingHours: 160, // duplicate for interface compatibility
      overtimeHours: 8,
      attendanceRate: 95.5
    }

    return {
      attendanceRecords: mockAttendance,
      summary: mockSummary
    }
  },

  async createAttendance(data: AttendanceFormData): Promise<EmployeeAttendance> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const newAttendance: EmployeeAttendance = {
      id: `att-${Date.now()}`,
      employeeId: data.employeeId,
      attendanceDate: data.attendanceDate,
      dayOfWeek: data.attendanceDate.toLocaleDateString('en-US', { weekday: 'long' }),
      clockIn: data.clockIn || null,
      clockOut: data.clockOut || null,
      breakStart: data.breakStart || null,
      breakEnd: data.breakEnd || null,
      scheduledHours: 8,
      actualHours: data.clockIn && data.clockOut 
        ? (data.clockOut.getTime() - data.clockIn.getTime()) / (1000 * 60 * 60)
        : 0,
      breakHours: 1,
      overtimeHours: 0,
      status: data.status,
      attendanceType: 'REGULAR',
      clockInLocation: null,
      clockOutLocation: null,
      notes: data.notes || null,
      approvedBy: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      employee: {
        fullName: 'Employee Name',
        employeeId: data.employeeId,
        department: 'Department'
      }
    }
    
    return newAttendance
  },

  async updateAttendance(id: string, data: Partial<AttendanceFormData>): Promise<EmployeeAttendance> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800))
    
    // Return mock updated attendance
    const response = await this.getAttendance({
      startDate: new Date(),
      endDate: new Date()
    })
    
    const attendance = response.attendanceRecords.find(att => att.id === id)
    if (!attendance) throw new Error('Attendance not found')
    
    return {
      ...attendance,
      ...data,
      updatedAt: new Date()
    } as EmployeeAttendance
  }
}

// Hooks
export function useAttendance(filters: AttendanceFilters) {
  const queryClient = useQueryClient()
  
  const {
    data: response,
    isLoading,
    error
  } = useQuery({
    queryKey: ['attendance', filters],
    queryFn: () => attendanceApi.getAttendance(filters)
  })

  const updateAttendance = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<AttendanceFormData> }) =>
      attendanceApi.updateAttendance(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] })
      toast.success('Data presensi berhasil diperbarui')
    },
    onError: () => {
      toast.error('Gagal memperbarui data presensi')
    }
  })

  return {
    attendanceRecords: response?.attendanceRecords,
    attendanceSummary: response?.summary,
    isLoading,
    error,
    updateAttendance: updateAttendance.mutate
  }
}

export function useCreateAttendance() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: attendanceApi.createAttendance,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] })
      toast.success('Data presensi berhasil ditambahkan')
    },
    onError: () => {
      toast.error('Gagal menambahkan data presensi')
    }
  })
}