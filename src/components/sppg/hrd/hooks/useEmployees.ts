'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { 
  Employee, 
  EmployeeFormData, 
  EmployeeFilters, 
  EmployeeListResponse,
  HRDMetrics 
} from '../types'

// Mock API functions - Replace with actual API calls
const employeeApi = {
  async getEmployees(filters: EmployeeFilters): Promise<EmployeeListResponse> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const mockEmployees: Employee[] = [
      {
        id: '1',
        sppgId: 'sppg-1',
        userId: 'user-1',
        employeeId: 'EMP001',
        employeeCode: 'E001',
        fullName: 'Ahmad Surya Pratama',
        nickname: 'Ahmad',
        nik: '3201234567890123',
        dateOfBirth: new Date('1990-05-15'),
        placeOfBirth: 'Jakarta',
        gender: 'MALE' as const,
        religion: 'Islam',
        maritalStatus: 'MARRIED' as const,
        bloodType: 'O',
        nationality: 'Indonesian',
        phone: '081234567890',
        email: 'ahmad@sppg.id',
        personalEmail: 'ahmad.surya@gmail.com',
        addressDetail: 'Jl. Sudirman No. 123, Jakarta Selatan',
        villageId: 'village-1',
        postalCode: '12190',
        emergencyContactName: 'Siti Pratama',
        emergencyContactPhone: '081234567891',
        emergencyContactRelation: 'Istri',
        departmentId: 'dept-1',
        positionId: 'pos-1',
        employmentType: 'PERMANENT' as const,
        employmentStatus: 'ACTIVE' as const,
        joinDate: new Date('2020-03-01'),
        probationEndDate: null,
        contractStartDate: null,
        contractEndDate: null,
        terminationDate: null,
        terminationReason: null,
        directSupervisor: 'EMP002',
        workLocation: 'Jakarta Office',
        workScheduleId: 'schedule-1',
        basicSalary: 8000000,
        currency: 'IDR',
        salaryGrade: 'Grade 5',
        taxId: 'NPWP123456789',
        bankAccount: '1234567890',
        bankName: 'BCA',
        bankBranch: 'Jakarta Pusat',
        photoUrl: null,
        biography: 'Experienced nutritionist with 5+ years in public health',
        skills: ['Nutrition Analysis', 'Menu Planning', 'Food Safety'],
        languages: ['Indonesian', 'English'],
        isActive: true,
        createdAt: new Date('2020-03-01'),
        updatedAt: new Date('2023-10-01'),
        department: {
          name: 'Gizi dan Pangan',
          code: 'GP'
        },
        position: {
          title: 'Ahli Gizi Senior',
          level: 'SENIOR'
        }
      },
      {
        id: '2',
        sppgId: 'sppg-1',
        userId: 'user-2',
        employeeId: 'EMP002',
        employeeCode: 'E002',
        fullName: 'Dr. Sarah Indrawati',
        nickname: 'Sarah',
        nik: '3201234567890124',
        dateOfBirth: new Date('1985-08-22'),
        placeOfBirth: 'Bandung',
        gender: 'FEMALE' as const,
        religion: 'Islam',
        maritalStatus: 'SINGLE' as const,
        bloodType: 'A',
        nationality: 'Indonesian',
        phone: '081234567892',
        email: 'sarah@sppg.id',
        personalEmail: 'sarah.indrawati@gmail.com',
        addressDetail: 'Jl. Gatot Subroto No. 456, Jakarta Selatan',
        villageId: 'village-2',
        postalCode: '12950',
        emergencyContactName: 'Budi Indrawati',
        emergencyContactPhone: '081234567893',
        emergencyContactRelation: 'Saudara',
        departmentId: 'dept-1',
        positionId: 'pos-2',
        employmentType: 'PERMANENT' as const,
        employmentStatus: 'ACTIVE' as const,
        joinDate: new Date('2018-01-15'),
        probationEndDate: null,
        contractStartDate: null,
        contractEndDate: null,
        terminationDate: null,
        terminationReason: null,
        directSupervisor: null,
        workLocation: 'Jakarta Office',
        workScheduleId: 'schedule-1',
        basicSalary: 12000000,
        currency: 'IDR',
        salaryGrade: 'Grade 7',
        taxId: 'NPWP123456788',
        bankAccount: '1234567891',
        bankName: 'Mandiri',
        bankBranch: 'Jakarta Pusat',
        photoUrl: null,
        biography: 'Head of Nutrition Department with PhD in Public Health',
        skills: ['Leadership', 'Research', 'Policy Development', 'Nutrition Science'],
        languages: ['Indonesian', 'English', 'Dutch'],
        isActive: true,
        createdAt: new Date('2018-01-15'),
        updatedAt: new Date('2023-10-01'),
        department: {
          name: 'Gizi dan Pangan',
          code: 'GP'
        },
        position: {
          title: 'Kepala Departemen Gizi',
          level: 'MANAGER'
        }
      }
    ]

    const mockMetrics: HRDMetrics = {
      totalEmployees: mockEmployees.length,
      activeEmployees: mockEmployees.filter(e => e.employmentStatus === 'ACTIVE').length,
      probationEmployees: mockEmployees.filter(e => e.employmentStatus === 'PROBATION').length,
      contractEmployees: mockEmployees.filter(e => e.employmentType === 'CONTRACT').length,
      permanentEmployees: mockEmployees.filter(e => e.employmentType === 'PERMANENT').length,
      totalDepartments: 5,
      averageAge: 32,
      averageTenure: 3.5,
      attendanceRate: 95.5,
      turnoverRate: 2.1,
      trainingCompletionRate: 85.2,
      departmentDistribution: [
        { department: 'Dapur', count: 15, percentage: 60 },
        { department: 'Distribusi', count: 8, percentage: 32 },
        { department: 'Admin', count: 2, percentage: 8 }
      ],
      employmentStatusDistribution: [
        { status: 'ACTIVE', count: 23, percentage: 92 },
        { status: 'PROBATION', count: 2, percentage: 8 }
      ]
    }

    // Apply filters
    let filteredEmployees = mockEmployees
    if (filters.searchTerm) {
      filteredEmployees = filteredEmployees.filter(emp => 
        emp.fullName.toLowerCase().includes(filters.searchTerm!.toLowerCase()) ||
        emp.employeeId.toLowerCase().includes(filters.searchTerm!.toLowerCase()) ||
        emp.email?.toLowerCase().includes(filters.searchTerm!.toLowerCase())
      )
    }

    return {
      employees: filteredEmployees,
      total: filteredEmployees.length,
      page: 1,
      limit: 50,
      metrics: mockMetrics
    }
  },

  async getEmployee(id: string): Promise<Employee> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500))
    const employees = await this.getEmployees({})
    const employee = employees.employees.find(e => e.id === id)
    if (!employee) throw new Error('Employee not found')
    return employee
  },

  async createEmployee(data: EmployeeFormData): Promise<Employee> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const newEmployee: Employee = {
      id: `emp-${Date.now()}`,
      sppgId: 'sppg-1',
      userId: null,
      employeeId: `EMP${String(Date.now()).slice(-3)}`,
      employeeCode: `E${String(Date.now()).slice(-3)}`,
      fullName: data.fullName,
      nickname: data.nickname || null,
      nik: data.nik,
      dateOfBirth: data.dateOfBirth,
      placeOfBirth: data.placeOfBirth || null,
      gender: data.gender,
      religion: data.religion || null,
      maritalStatus: data.maritalStatus,
      bloodType: data.bloodType || null,
      nationality: data.nationality,
      phone: data.phone || null,
      email: data.email || null,
      personalEmail: data.personalEmail || null,
      addressDetail: data.addressDetail,
      villageId: 'village-1',
      postalCode: data.postalCode || null,
      emergencyContactName: data.emergencyContactName || null,
      emergencyContactPhone: data.emergencyContactPhone || null,
      emergencyContactRelation: data.emergencyContactRelation || null,
      departmentId: data.departmentId,
      positionId: data.positionId,
      employmentType: data.employmentType,
      employmentStatus: data.employmentStatus,
      joinDate: data.joinDate,
      probationEndDate: data.probationEndDate || null,
      contractStartDate: data.contractStartDate || null,
      contractEndDate: data.contractEndDate || null,
      terminationDate: null,
      terminationReason: null,
      directSupervisor: data.directSupervisor || null,
      workLocation: data.workLocation || null,
      workScheduleId: null,
      basicSalary: data.basicSalary || null,
      currency: data.currency,
      salaryGrade: data.salaryGrade || null,
      taxId: data.taxId || null,
      bankAccount: data.bankAccount || null,
      bankName: data.bankName || null,
      bankBranch: data.bankBranch || null,
      photoUrl: null,
      biography: data.biography || null,
      skills: data.skills,
      languages: data.languages,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      department: {
        name: 'Department Name',
        code: 'DEPT'
      },
      position: {
        title: 'Position Title',
        level: 'STAFF'
      }
    }
    
    return newEmployee
  },

  async updateEmployee(id: string, data: Partial<EmployeeFormData>): Promise<Employee> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    const employee = await this.getEmployee(id)
    
    return {
      ...employee,
      ...data,
      updatedAt: new Date()
    } as Employee
  },

  async deleteEmployee(id: string): Promise<void> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500))
    // In real implementation, make API call to delete employee with id
    console.log(`Deleting employee: ${id}`)
  }
}

// Hooks
export function useEmployees(filters: EmployeeFilters = {}) {
  const queryClient = useQueryClient()
  
  const {
    data: response,
    isLoading,
    error
  } = useQuery({
    queryKey: ['employees', filters],
    queryFn: () => employeeApi.getEmployees(filters)
  })

  const deleteEmployee = useMutation({
    mutationFn: employeeApi.deleteEmployee,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] })
      toast.success('Karyawan berhasil dihapus')
    },
    onError: () => {
      toast.error('Gagal menghapus karyawan')
    }
  })

  return {
    employees: response?.employees,
    total: response?.total,
    metrics: response?.metrics,
    isLoading,
    error,
    deleteEmployee: deleteEmployee.mutate
  }
}

export function useEmployee(id: string) {
  return useQuery({
    queryKey: ['employee', id],
    queryFn: () => employeeApi.getEmployee(id),
    enabled: !!id
  })
}

export function useCreateEmployee() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: employeeApi.createEmployee,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] })
      toast.success('Karyawan berhasil ditambahkan')
    },
    onError: () => {
      toast.error('Gagal menambahkan karyawan')
    }
  })
}

export function useUpdateEmployee() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ employeeId, data }: { employeeId: string; data: Partial<EmployeeFormData> }) =>
      employeeApi.updateEmployee(employeeId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] })
      queryClient.invalidateQueries({ queryKey: ['employee'] })
      toast.success('Data karyawan berhasil diperbarui')
    },
    onError: () => {
      toast.error('Gagal memperbarui data karyawan')
    }
  })
}