'use server'

import { auth } from '@/auth'
import db from '@/lib/db'
import { ServiceResult } from '@/lib/service-result'
import { hasPermission, checkSppgAccess } from '@/lib/permissions'
import { revalidatePath } from 'next/cache'
import Redis from 'ioredis'
import { z } from 'zod'
import { 
  UserType, 
  UserRole, 
  Gender, 
  MaritalStatus, 
  EmploymentType, 
  EmploymentStatus, 
  AttendanceStatus, 
  ReviewType 
} from '@prisma/client'
import bcrypt from 'bcryptjs'

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379')

// ============================================================================
// ENTERPRISE VALIDATION SCHEMAS
// ============================================================================

const createEmployeeSchema = z.object({
  // User Account
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8),
  phone: z.string().optional(),
  userRole: z.nativeEnum(UserRole),
  
  // Employee Profile
  employeeCode: z.string().optional(),
  fullName: z.string().min(2).max(100),
  nickname: z.string().optional(),
  nik: z.string().optional(),
  dateOfBirth: z.string(),
  placeOfBirth: z.string().optional(),
  gender: z.nativeEnum(Gender),
  religion: z.string().optional(),
  maritalStatus: z.nativeEnum(MaritalStatus).default(MaritalStatus.SINGLE),
  bloodType: z.string().optional(),
  nationality: z.string().default('Indonesian'),
  
  // Contact & Address
  personalEmail: z.string().email().optional(),
  addressDetail: z.string().min(10),
  villageId: z.string().cuid(),
  postalCode: z.string().optional(),
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
  emergencyContactRelation: z.string().optional(),
  
  // Employment
  departmentId: z.string().cuid(),
  positionId: z.string().cuid(),
  employmentType: z.nativeEnum(EmploymentType).default(EmploymentType.PERMANENT),
  employmentStatus: z.nativeEnum(EmploymentStatus).default(EmploymentStatus.PROBATION),
  joinDate: z.string(),
  contractStartDate: z.string().optional(),
  contractEndDate: z.string().optional(),
  directSupervisor: z.string().optional(),
  workLocation: z.string().optional(),
  workScheduleId: z.string().cuid().optional(),
  
  // Compensation
  basicSalary: z.number().min(0).optional(),
  currency: z.string().default('IDR'),
  salaryGrade: z.string().optional(),
  
  // Banking & Tax
  taxId: z.string().optional(),
  bankAccount: z.string().optional(),
  bankName: z.string().optional(),
  bankBranch: z.string().optional(),
  
  // Profile
  photoUrl: z.string().url().optional(),
  biography: z.string().optional(),
  skills: z.array(z.string()).default([]),
  languages: z.array(z.string()).default(['Indonesian'])
})

const updateEmployeeSchema = z.object({
  employeeId: z.string().cuid(),
  fullName: z.string().min(2).max(100).optional(),
  nickname: z.string().optional(),
  phone: z.string().optional(),
  personalEmail: z.string().email().optional(),
  addressDetail: z.string().min(10).optional(),
  postalCode: z.string().optional(),
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
  emergencyContactRelation: z.string().optional(),
  departmentId: z.string().cuid().optional(),
  positionId: z.string().cuid().optional(),
  employmentType: z.nativeEnum(EmploymentType).optional(),
  employmentStatus: z.nativeEnum(EmploymentStatus).optional(),
  contractStartDate: z.string().optional(),
  contractEndDate: z.string().optional(),
  directSupervisor: z.string().optional(),
  workLocation: z.string().optional(),
  workScheduleId: z.string().cuid().optional(),
  basicSalary: z.number().min(0).optional(),
  salaryGrade: z.string().optional(),
  taxId: z.string().optional(),
  bankAccount: z.string().optional(),
  bankName: z.string().optional(),
  bankBranch: z.string().optional(),
  photoUrl: z.string().url().optional(),
  biography: z.string().optional(),
  skills: z.array(z.string()).optional(),
  languages: z.array(z.string()).optional(),
  isActive: z.boolean().optional()
})

const createAttendanceSchema = z.object({
  employeeId: z.string().cuid(),
  attendanceDate: z.string(),
  dayOfWeek: z.enum(['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']),
  clockIn: z.string().optional(),
  clockOut: z.string().optional(),
  breakStart: z.string().optional(),
  breakEnd: z.string().optional(),
  scheduledHours: z.number().min(0).max(24).default(8),
  actualHours: z.number().min(0).max(24).default(0),
  breakHours: z.number().min(0).max(8).default(1),
  overtimeHours: z.number().min(0).max(12).default(0),
  status: z.nativeEnum(AttendanceStatus).default(AttendanceStatus.PRESENT),
  attendanceType: z.enum(['REGULAR', 'OVERTIME', 'HOLIDAY']).default('REGULAR'),
  clockInLocation: z.string().optional(),
  clockOutLocation: z.string().optional(),
  clockInMethod: z.enum(['MANUAL', 'FINGERPRINT', 'FACE_RECOGNITION', 'MOBILE']).optional(),
  lateMinutes: z.number().int().min(0).default(0),
  earlyLeaveMinutes: z.number().int().min(0).default(0),
  notes: z.string().optional(),
  adminNotes: z.string().optional()
})

const createPerformanceReviewSchema = z.object({
  employeeId: z.string().cuid(),
  reviewerId: z.string().cuid(),
  reviewPeriod: z.string(),
  reviewType: z.nativeEnum(ReviewType),
  reviewYear: z.number().int().min(2020).max(2030),
  dueDate: z.string(),
  technicalSkills: z.number().min(1).max(5).optional(),
  communication: z.number().min(1).max(5).optional(),
  teamwork: z.number().min(1).max(5).optional(),
  leadership: z.number().min(1).max(5).optional(),
  problemSolving: z.number().min(1).max(5).optional(),
  timeManagement: z.number().min(1).max(5).optional(),
  qualityOfWork: z.number().min(1).max(5).optional(),
  productivity: z.number().min(1).max(5).optional(),
  innovation: z.number().min(1).max(5).optional(),
  customerService: z.number().min(1).max(5).optional(),
  previousGoals: z.array(z.string()).default([]),
  achievedGoals: z.array(z.string()).default([]),
  missedGoals: z.array(z.string()).default([]),
  newGoals: z.array(z.string()).default([]),
  strengths: z.array(z.string()).default([]),
  areasImprovement: z.array(z.string()).default([]),
  trainingNeeds: z.array(z.string()).default([]),
  careerDevelopment: z.array(z.string()).default([]),
  reviewerComments: z.string().optional(),
  employeeComments: z.string().optional(),
  selfAssessment: z.string().optional(),
  developmentPlan: z.string().optional(),
  followUpRequired: z.boolean().default(false),
  followUpDate: z.string().optional(),
  followUpNotes: z.string().optional()
})

// ============================================================================
// ENTERPRISE HELPER FUNCTIONS  
// ============================================================================

export async function calculateEmployeeMetrics(employeeId: string, periodDays: number = 90) {
  const endDate = new Date()
  const startDate = new Date(endDate.getTime() - (periodDays * 24 * 60 * 60 * 1000))

  // Get attendance data
  const attendances = await db.employeeAttendance.findMany({
    where: {
      employeeId,
      attendanceDate: {
        gte: startDate,
        lte: endDate
      }
    },
    orderBy: { attendanceDate: 'desc' }
  })

  // Calculate attendance metrics
  const totalDays = attendances.length
  const presentDays = attendances.filter(a => 
    a.status === AttendanceStatus.PRESENT || a.status === AttendanceStatus.LATE
  ).length
  
  const attendanceRate = totalDays > 0 ? (presentDays / totalDays) * 100 : 0
  
  const totalLateMinutes = attendances.reduce((sum, a) => sum + a.lateMinutes, 0)
  const avgLateMinutes = totalDays > 0 ? totalLateMinutes / totalDays : 0
  
  const totalOvertimeHours = attendances.reduce((sum, a) => sum + a.overtimeHours, 0)
  const avgOvertimeHours = totalDays > 0 ? totalOvertimeHours / totalDays : 0

  // Get performance reviews
  const recentReviews = await db.performanceReview.findMany({
    where: {
      employeeId,
      completedAt: {
        gte: startDate,
        lte: endDate
      }
    },
    orderBy: { completedAt: 'desc' },
    take: 3
  })

  const avgPerformanceScore = recentReviews.length > 0
    ? recentReviews.reduce((sum, review) => sum + (review.overallScore || 0), 0) / recentReviews.length
    : 0

  return {
    attendanceMetrics: {
      totalDays,
      presentDays,
      attendanceRate,
      avgLateMinutes,
      totalOvertimeHours,
      avgOvertimeHours,
      punctualityScore: Math.max(0, 100 - (avgLateMinutes / 10)) // Reduce score by 10 per minute late
    },
    performanceMetrics: {
      totalReviews: recentReviews.length,
      avgPerformanceScore,
      latestReview: recentReviews[0]?.completedAt || null,
      performanceGrade: avgPerformanceScore >= 4.5 ? 'OUTSTANDING' :
                       avgPerformanceScore >= 4.0 ? 'EXCEEDS' :
                       avgPerformanceScore >= 3.0 ? 'MEETS' :
                       avgPerformanceScore >= 2.0 ? 'BELOW' : 'UNSATISFACTORY'
    }
  }
}

export async function calculateDepartmentAnalytics(sppgId: string, departmentId: string) {
  const employees = await db.employee.findMany({
    where: {
      sppgId,
      departmentId,
      isActive: true
    },
    include: {
      attendances: {
        where: {
          attendanceDate: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
          }
        }
      },
      performanceReviews: {
        where: {
          completedAt: {
            gte: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000) // Last 6 months
          }
        }
      }
    }
  })

  const totalEmployees = employees.length
  
  // Attendance analytics
  const allAttendances = employees.flatMap(emp => emp.attendances)
  const avgAttendanceRate = allAttendances.length > 0
    ? (allAttendances.filter(a => a.status === AttendanceStatus.PRESENT || a.status === AttendanceStatus.LATE).length / allAttendances.length) * 100
    : 0

  // Performance analytics
  const allReviews = employees.flatMap(emp => emp.performanceReviews)
  const avgPerformanceScore = allReviews.length > 0
    ? allReviews.reduce((sum, review) => sum + (review.overallScore || 0), 0) / allReviews.length
    : 0

  // Employment status distribution
  const statusDistribution = employees.reduce((acc, emp) => {
    acc[emp.employmentStatus] = (acc[emp.employmentStatus] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  // Salary analytics
  const salaries = employees.filter(emp => emp.basicSalary).map(emp => emp.basicSalary!)
  const avgSalary = salaries.length > 0 ? salaries.reduce((sum, sal) => sum + sal, 0) / salaries.length : 0

  return {
    totalEmployees,
    avgAttendanceRate,
    avgPerformanceScore,
    statusDistribution,
    avgSalary,
    totalAttendanceRecords: allAttendances.length,
    totalPerformanceReviews: allReviews.length
  }
}

async function broadcastHRUpdate(
  sppgId: string,
  type: 'employee_created' | 'employee_updated' | 'attendance_recorded' | 'review_completed',
  data: { id: string; name: string; message: string },
  additionalData?: Record<string, unknown>
) {
  const message = {
    type: `hr_${type}`,
    sppgId,
    data,
    timestamp: new Date().toISOString(),
    ...additionalData
  }

  await Promise.all([
    redis.publish(`sppg:${sppgId}:hr`, JSON.stringify(message)),
    redis.publish(`sppg:${sppgId}:notifications`, JSON.stringify({
      type: 'hr_notification',
      title: type === 'employee_created' ? 'Karyawan Baru' :
             type === 'employee_updated' ? 'Data Karyawan Diperbarui' :
             type === 'attendance_recorded' ? 'Absensi Tercatat' :
             'Review Kinerja Selesai',
      message: data.message,
      sppgId,
      timestamp: new Date().toISOString()
    }))
  ])
}

// ============================================================================
// ENTERPRISE HRD SERVER ACTIONS
// ============================================================================

export async function createEmployee(input: z.infer<typeof createEmployeeSchema>) {
  try {
    const session = await auth()
    if (!session?.user) {
      return ServiceResult.error('Unauthorized')
    }

    // Check SPPG access and permissions
    const sppg = await checkSppgAccess(session.user.sppgId)
    if (!sppg) {
      return ServiceResult.error('SPPG access denied')
    }

    if (!hasPermission(session.user.userRole, 'HR_MANAGE')) {
      return ServiceResult.error('Insufficient permissions')
    }

    // Validate input
    const validated = createEmployeeSchema.safeParse(input)
    if (!validated.success) {
      return ServiceResult.error('Validation failed')
    }

    const data = validated.data

    // Check for duplicate email
    const existingUser = await db.user.findFirst({
      where: { email: data.email }
    })

    if (existingUser) {
      return ServiceResult.error('Email already exists')
    }

    // Check for duplicate NIK if provided
    if (data.nik) {
      const existingNik = await db.employee.findFirst({
        where: { nik: data.nik }
      })

      if (existingNik) {
        return ServiceResult.error('NIK already exists')
      }
    }

    // Verify department and position exist
    const [department, position, village] = await Promise.all([
      db.department.findFirst({ where: { id: data.departmentId, sppgId: sppg.id } }),
      db.position.findFirst({ where: { id: data.positionId, sppgId: sppg.id } }),
      db.village.findFirst({ where: { id: data.villageId } })
    ])

    if (!department) return ServiceResult.error('Department not found')
    if (!position) return ServiceResult.error('Position not found')
    if (!village) return ServiceResult.error('Village not found')

    // Verify work schedule if provided
    if (data.workScheduleId) {
      const workSchedule = await db.workSchedule.findFirst({
        where: { id: data.workScheduleId, sppgId: sppg.id }
      })
      if (!workSchedule) return ServiceResult.error('Work schedule not found')
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 12)

    // Generate employee ID
    const currentYear = new Date().getFullYear()
    const employeeCount = await db.employee.count({ where: { sppgId: sppg.id } })
    const employeeId = `${sppg.code}-${currentYear}-${String(employeeCount + 1).padStart(4, '0')}`

    // Calculate probation end date
    const joinDate = new Date(data.joinDate)
    const probationEndDate = new Date(joinDate)
    probationEndDate.setMonth(probationEndDate.getMonth() + 3) // 3 months probation

    // Create employee in transaction
    const result = await db.$transaction(async (tx) => {
      // Create user account
      const user = await tx.user.create({
        data: {
          name: data.name,
          email: data.email,
          password: hashedPassword,
          phone: data.phone,
          sppgId: sppg.id,
          userType: UserType.SPPG_USER,
          userRole: data.userRole,
          isActive: true
        }
      })

      // Create employee profile
      const employee = await tx.employee.create({
        data: {
          sppgId: sppg.id,
          userId: user.id,
          employeeId,
          employeeCode: data.employeeCode,
          fullName: data.fullName,
          nickname: data.nickname,
          nik: data.nik,
          dateOfBirth: new Date(data.dateOfBirth),
          placeOfBirth: data.placeOfBirth,
          gender: data.gender,
          religion: data.religion,
          maritalStatus: data.maritalStatus,
          bloodType: data.bloodType,
          nationality: data.nationality,
          phone: data.phone,
          email: data.email,
          personalEmail: data.personalEmail,
          addressDetail: data.addressDetail,
          villageId: data.villageId,
          postalCode: data.postalCode,
          emergencyContactName: data.emergencyContactName,
          emergencyContactPhone: data.emergencyContactPhone,
          emergencyContactRelation: data.emergencyContactRelation,
          departmentId: data.departmentId,
          positionId: data.positionId,
          employmentType: data.employmentType,
          employmentStatus: data.employmentStatus,
          joinDate,
          probationEndDate,
          contractStartDate: data.contractStartDate ? new Date(data.contractStartDate) : null,
          contractEndDate: data.contractEndDate ? new Date(data.contractEndDate) : null,
          directSupervisor: data.directSupervisor,
          workLocation: data.workLocation,
          workScheduleId: data.workScheduleId,
          basicSalary: data.basicSalary,
          currency: data.currency,
          salaryGrade: data.salaryGrade,
          taxId: data.taxId,
          bankAccount: data.bankAccount,
          bankName: data.bankName,
          bankBranch: data.bankBranch,
          photoUrl: data.photoUrl,
          biography: data.biography,
          skills: data.skills,
          languages: data.languages,
          isActive: true
        },
        include: {
          department: {
            select: { departmentName: true }
          },
          position: {
            select: { positionName: true }
          },
          village: {
            select: { villageName: true }
          }
        }
      })

      return { user, employee }
    })

    // Calculate initial metrics
    const metrics = await calculateEmployeeMetrics(result.employee.id)

    // Create audit log
    await db.auditLog.create({
      data: {
        sppgId: sppg.id,
        userId: session.user.id,
        action: 'CREATE',
        entityType: 'EMPLOYEE',
        entityId: result.employee.id,
        description: `Created employee ${data.fullName} (${employeeId}) in ${department.departmentName} as ${position.positionName}`,
        metadata: {
          employeeId,
          fullName: data.fullName,
          departmentName: department.departmentName,
          positionTitle: position.positionName,
          employmentType: data.employmentType,
          employmentStatus: data.employmentStatus,
          basicSalary: data.basicSalary
        }
      }
    })

    // Broadcast update
    await broadcastHRUpdate(sppg.id, 'employee_created', {
      id: result.employee.id,
      name: data.fullName,
      message: `Karyawan baru ${data.fullName} telah ditambahkan ke ${department.departmentName} sebagai ${position.positionName}`
    }, {
      employeeId,
      departmentName: department.departmentName,
      positionTitle: position.positionName,
      employmentType: data.employmentType
    })

    revalidatePath('/hrd')

    return ServiceResult.success({
      employee: result.employee,
      user: result.user,
      metrics
    })

  } catch (error) {
    console.error('Create employee error:', error)
    return ServiceResult.error('Failed to create employee')
  }
}

export async function updateEmployee(input: z.infer<typeof updateEmployeeSchema>) {
  try {
    const session = await auth()
    if (!session?.user) {
      return ServiceResult.error('Unauthorized')
    }

    const validated = updateEmployeeSchema.safeParse(input)
    if (!validated.success) {
      return ServiceResult.error('Validation failed')
    }

    const { employeeId, ...updateData } = validated.data

    // Get employee with access check
    const existingEmployee = await db.employee.findFirst({
      where: {
        id: employeeId,
        sppgId: session.user.sppgId!
      },
      include: {
        user: true,
        department: { select: { departmentName: true } },
        position: { select: { positionName: true } }
      }
    })

    if (!existingEmployee) {
      return ServiceResult.error('Employee not found')
    }

    if (!hasPermission(session.user.userRole, 'HR_MANAGE')) {
      return ServiceResult.error('Insufficient permissions')
    }

    // Verify department and position if updating
    if (updateData.departmentId || updateData.positionId) {
      const verifications = []
      
      if (updateData.departmentId) {
        verifications.push(
          db.department.findFirst({ 
            where: { id: updateData.departmentId, sppgId: session.user.sppgId! } 
          })
        )
      }
      
      if (updateData.positionId) {
        verifications.push(
          db.position.findFirst({ 
            where: { id: updateData.positionId, sppgId: session.user.sppgId! } 
          })
        )
      }

      const results = await Promise.all(verifications)
      if (results.some(result => !result)) {
        return ServiceResult.error('Department or position not found')
      }
    }

    // Update employee in transaction
    const updatedEmployee = await db.$transaction(async (tx) => {
      // Update user if email/phone changed
      if (updateData.fullName && existingEmployee.user) {
        await tx.user.update({
          where: { id: existingEmployee.user.id },
          data: {
            name: updateData.fullName,
            phone: updateData.phone
          }
        })
      }

      // Update employee profile
      const updated = await tx.employee.update({
        where: { id: employeeId },
        data: {
          fullName: updateData.fullName,
          nickname: updateData.nickname,
          phone: updateData.phone,
          personalEmail: updateData.personalEmail,
          addressDetail: updateData.addressDetail,
          postalCode: updateData.postalCode,
          emergencyContactName: updateData.emergencyContactName,
          emergencyContactPhone: updateData.emergencyContactPhone,
          emergencyContactRelation: updateData.emergencyContactRelation,
          departmentId: updateData.departmentId,
          positionId: updateData.positionId,
          employmentType: updateData.employmentType,
          employmentStatus: updateData.employmentStatus,
          contractStartDate: updateData.contractStartDate ? new Date(updateData.contractStartDate) : undefined,
          contractEndDate: updateData.contractEndDate ? new Date(updateData.contractEndDate) : undefined,
          directSupervisor: updateData.directSupervisor,
          workLocation: updateData.workLocation,
          workScheduleId: updateData.workScheduleId,
          basicSalary: updateData.basicSalary,
          salaryGrade: updateData.salaryGrade,
          taxId: updateData.taxId,
          bankAccount: updateData.bankAccount,
          bankName: updateData.bankName,
          bankBranch: updateData.bankBranch,
          photoUrl: updateData.photoUrl,
          biography: updateData.biography,
          skills: updateData.skills,
          languages: updateData.languages,
          isActive: updateData.isActive
        },
        include: {
          department: { select: { departmentName: true } },
          position: { select: { positionName: true } },
          user: true
        }
      })

      return updated
    })

    // Calculate updated metrics
    const metrics = await calculateEmployeeMetrics(employeeId)

    // Create audit log
    await db.auditLog.create({
      data: {
        sppgId: session.user.sppgId!,
        userId: session.user.id,
        action: 'UPDATE',
        entityType: 'EMPLOYEE',
        entityId: employeeId,
        description: `Updated employee ${updatedEmployee.fullName} (${updatedEmployee.employeeId})`,
        metadata: {
          employeeId: updatedEmployee.employeeId,
          fullName: updatedEmployee.fullName,
          changes: Object.keys(updateData),
          departmentName: updatedEmployee.department.departmentName,
          positionTitle: updatedEmployee.position.positionName
        }
      }
    })

    // Broadcast update
    await broadcastHRUpdate(session.user.sppgId!, 'employee_updated', {
      id: employeeId,
      name: updatedEmployee.fullName,
      message: `Data karyawan ${updatedEmployee.fullName} telah diperbarui`
    }, {
      employeeId: updatedEmployee.employeeId,
      changes: Object.keys(updateData)
    })

    revalidatePath('/hrd')

    return ServiceResult.success({
      employee: updatedEmployee,
      metrics
    })

  } catch (error) {
    console.error('Update employee error:', error)
    return ServiceResult.error('Failed to update employee')
  }
}

export async function recordAttendance(input: z.infer<typeof createAttendanceSchema>) {
  try {
    const session = await auth()
    if (!session?.user) {
      return ServiceResult.error('Unauthorized')
    }

    // Check SPPG access and permissions
    const sppg = await checkSppgAccess(session.user.sppgId)
    if (!sppg) {
      return ServiceResult.error('SPPG access denied')
    }

    if (!hasPermission(session.user.userRole, 'HR_MANAGE')) {
      return ServiceResult.error('Insufficient permissions')
    }

    // Validate input
    const validated = createAttendanceSchema.safeParse(input)
    if (!validated.success) {
      return ServiceResult.error('Validation failed')
    }

    const data = validated.data

    // Verify employee exists and belongs to SPPG
    const employee = await db.employee.findFirst({
      where: {
        id: data.employeeId,
        sppgId: sppg.id,
        isActive: true
      },
      include: {
        department: { select: { departmentName: true } },
        position: { select: { positionName: true } }
      }
    })

    if (!employee) {
      return ServiceResult.error('Employee not found')
    }

    // Check for existing attendance record
    const attendanceDate = new Date(data.attendanceDate)
    const existingRecord = await db.employeeAttendance.findFirst({
      where: {
        employeeId: data.employeeId,
        attendanceDate: attendanceDate
      }
    })

    if (existingRecord) {
      return ServiceResult.error('Attendance already recorded for this date')
    }

    // Calculate actual hours if clock in/out provided
    let actualHours = data.actualHours
    if (data.clockIn && data.clockOut && actualHours === 0) {
      const clockInTime = new Date(`${data.attendanceDate}T${data.clockIn}`)
      const clockOutTime = new Date(`${data.attendanceDate}T${data.clockOut}`)
      const workMinutes = (clockOutTime.getTime() - clockInTime.getTime()) / (1000 * 60)
      actualHours = Math.max(0, (workMinutes - (data.breakHours * 60)) / 60)
    }

    // Calculate overtime
    let overtimeHours = data.overtimeHours
    if (actualHours > data.scheduledHours) {
      overtimeHours = Math.max(0, actualHours - data.scheduledHours)
    }

    // Create attendance record
    const attendance = await db.employeeAttendance.create({
      data: {
        employeeId: data.employeeId,
        attendanceDate,
        dayOfWeek: data.dayOfWeek,
        clockIn: data.clockIn ? new Date(`${data.attendanceDate}T${data.clockIn}`) : null,
        clockOut: data.clockOut ? new Date(`${data.attendanceDate}T${data.clockOut}`) : null,
        breakStart: data.breakStart ? new Date(`${data.attendanceDate}T${data.breakStart}`) : null,
        breakEnd: data.breakEnd ? new Date(`${data.attendanceDate}T${data.breakEnd}`) : null,
        scheduledHours: data.scheduledHours,
        actualHours,
        breakHours: data.breakHours,
        overtimeHours,
        status: data.status,
        attendanceType: data.attendanceType,
        clockInLocation: data.clockInLocation,
        clockOutLocation: data.clockOutLocation,
        clockInMethod: data.clockInMethod,
        lateMinutes: data.lateMinutes,
        earlyLeaveMinutes: data.earlyLeaveMinutes,
        isApproved: true, // Auto-approve for now
        approvedBy: session.user.id,
        approvedAt: new Date(),
        notes: data.notes,
        adminNotes: data.adminNotes
      }
    })

    // Update employee metrics
    const metrics = await calculateEmployeeMetrics(data.employeeId)

    // Create audit log
    await db.auditLog.create({
      data: {
        sppgId: sppg.id,
        userId: session.user.id,
        action: 'CREATE',
        entityType: 'ATTENDANCE',
        entityId: attendance.id,
        description: `Recorded attendance for ${employee.fullName} on ${data.attendanceDate}`,
        metadata: {
          employeeId: employee.employeeId,
          employeeName: employee.fullName,
          attendanceDate: data.attendanceDate,
          status: data.status,
          actualHours,
          overtimeHours,
          lateMinutes: data.lateMinutes
        }
      }
    })

    // Broadcast update
    await broadcastHRUpdate(sppg.id, 'attendance_recorded', {
      id: attendance.id,
      name: employee.fullName,
      message: `Absensi ${employee.fullName} pada ${data.attendanceDate} telah dicatat (${data.status})`
    }, {
      employeeId: employee.employeeId,
      status: data.status,
      actualHours,
      overtimeHours
    })

    revalidatePath('/hrd')

    return ServiceResult.success({
      attendance,
      metrics
    })

  } catch (error) {
    console.error('Record attendance error:', error)
    return ServiceResult.error('Failed to record attendance')
  }
}

export async function createPerformanceReview(input: z.infer<typeof createPerformanceReviewSchema>) {
  try {
    const session = await auth()
    if (!session?.user) {
      return ServiceResult.error('Unauthorized')
    }

    // Check SPPG access and permissions
    const sppg = await checkSppgAccess(session.user.sppgId)
    if (!sppg) {
      return ServiceResult.error('SPPG access denied')
    }

    if (!hasPermission(session.user.userRole, 'HR_MANAGE')) {
      return ServiceResult.error('Insufficient permissions')
    }

    // Validate input
    const validated = createPerformanceReviewSchema.safeParse(input)
    if (!validated.success) {
      return ServiceResult.error('Validation failed')
    }

    const data = validated.data

    // Verify employee and reviewer exist
    const [employee, reviewer] = await Promise.all([
      db.employee.findFirst({
        where: {
          id: data.employeeId,
          sppgId: sppg.id,
          isActive: true
        },
        include: {
          department: { select: { departmentName: true } },
          position: { select: { positionName: true } }
        }
      }),
      db.employee.findFirst({
        where: {
          id: data.reviewerId,
          sppgId: sppg.id,
          isActive: true
        }
      })
    ])

    if (!employee) return ServiceResult.error('Employee not found')
    if (!reviewer) return ServiceResult.error('Reviewer not found')

    // Calculate overall score
    const scores = [
      data.technicalSkills, data.communication, data.teamwork,
      data.leadership, data.problemSolving, data.timeManagement,
      data.qualityOfWork, data.productivity, data.innovation,
      data.customerService
    ].filter(score => score !== undefined) as number[]

    const overallScore = scores.length > 0 
      ? scores.reduce((sum, score) => sum + score, 0) / scores.length 
      : 0

    const overallRating = overallScore >= 4.5 ? 'OUTSTANDING' :
                         overallScore >= 4.0 ? 'EXCEEDS' :
                         overallScore >= 3.0 ? 'MEETS' :
                         overallScore >= 2.0 ? 'BELOW' : 'UNSATISFACTORY'

    // Create performance review
    const review = await db.performanceReview.create({
      data: {
        employeeId: data.employeeId,
        reviewerId: data.reviewerId,
        reviewPeriod: data.reviewPeriod,
        reviewType: data.reviewType,
        reviewYear: data.reviewYear,
        dueDate: new Date(data.dueDate),
        technicalSkills: data.technicalSkills,
        communication: data.communication,
        teamwork: data.teamwork,
        leadership: data.leadership,
        problemSolving: data.problemSolving,
        timeManagement: data.timeManagement,
        qualityOfWork: data.qualityOfWork,
        productivity: data.productivity,
        innovation: data.innovation,
        customerService: data.customerService,
        overallScore,
        overallRating,
        previousGoals: data.previousGoals,
        achievedGoals: data.achievedGoals,
        missedGoals: data.missedGoals,
        newGoals: data.newGoals,
        strengths: data.strengths,
        areasImprovement: data.areasImprovement,
        trainingNeeds: data.trainingNeeds,
        careerDevelopment: data.careerDevelopment,
        reviewerComments: data.reviewerComments,
        employeeComments: data.employeeComments,
        selfAssessment: data.selfAssessment,
        developmentPlan: data.developmentPlan,
        status: 'COMPLETED',
        isReviewerSigned: true,
        followUpRequired: data.followUpRequired,
        followUpDate: data.followUpDate ? new Date(data.followUpDate) : null,
        followUpNotes: data.followUpNotes,
        completedAt: new Date()
      }
    })

    // Update employee metrics
    const metrics = await calculateEmployeeMetrics(data.employeeId)

    // Create audit log
    await db.auditLog.create({
      data: {
        sppgId: sppg.id,
        userId: session.user.id,
        action: 'CREATE',
        entityType: 'PERFORMANCE_REVIEW',
        entityId: review.id,
        description: `Created performance review for ${employee.fullName} - Period: ${data.reviewPeriod} - Rating: ${overallRating}`,
        metadata: {
          employeeId: employee.employeeId,
          employeeName: employee.fullName,
          reviewerId: reviewer.employeeId,
          reviewerName: reviewer.fullName,
          reviewPeriod: data.reviewPeriod,
          reviewType: data.reviewType,
          overallScore,
          overallRating,
          totalGoals: data.newGoals.length
        }
      }
    })

    // Broadcast update
    await broadcastHRUpdate(sppg.id, 'review_completed', {
      id: review.id,
      name: employee.fullName,
      message: `Review kinerja ${employee.fullName} periode ${data.reviewPeriod} telah selesai dengan rating ${overallRating}`
    }, {
      employeeId: employee.employeeId,
      reviewPeriod: data.reviewPeriod,
      overallScore,
      overallRating
    })

    revalidatePath('/hrd')

    return ServiceResult.success({
      review,
      metrics
    })

  } catch (error) {
    console.error('Create performance review error:', error)
    return ServiceResult.error('Failed to create performance review')
  }
}

export async function getEmployees(
  filters: {
    departmentId?: string
    positionId?: string
    employmentType?: EmploymentType
    employmentStatus?: EmploymentStatus
    isActive?: boolean
    search?: string
    page?: number
    limit?: number
  } = {}
) {
  try {
    const session = await auth()
    if (!session?.user?.sppgId) {
      return ServiceResult.error('Unauthorized')
    }

    if (!hasPermission(session.user.userRole, 'READ')) {
      return ServiceResult.error('Insufficient permissions')
    }

    const { departmentId, positionId, employmentType, employmentStatus, isActive, search, page = 1, limit = 20 } = filters
    const skip = (page - 1) * limit

    const where = {
      sppgId: session.user.sppgId!,
      ...(departmentId && { departmentId }),
      ...(positionId && { positionId }),
      ...(employmentType && { employmentType }),
      ...(employmentStatus && { employmentStatus }),
      ...(typeof isActive === 'boolean' && { isActive }),
      ...(search && {
        OR: [
          { fullName: { contains: search, mode: 'insensitive' as const } },
          { employeeId: { contains: search, mode: 'insensitive' as const } },
          { email: { contains: search, mode: 'insensitive' as const } },
          { phone: { contains: search, mode: 'insensitive' as const } }
        ]
      })
    }

    const [employees, total] = await Promise.all([
      db.employee.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              userRole: true,
              lastLogin: true
            }
          },
          department: {
            select: {
              id: true,
              departmentName: true
            }
          },
          position: {
            select: {
              id: true,
              positionName: true
            }
          },
          village: {
            select: {
              villageName: true
            }
          },
          workSchedule: {
            select: {
              scheduleName: true,
              hoursPerWeek: true
            }
          },
          _count: {
            select: {
              attendances: true,
              performanceReviews: true
            }
          }
        },
        orderBy: [
          { isActive: 'desc' },
          { fullName: 'asc' }
        ],
        skip,
        take: limit
      }),
      db.employee.count({ where })
    ])

    // Calculate metrics for each employee
    const employeesWithMetrics = await Promise.all(
      employees.map(async (employee) => {
        const metrics = await calculateEmployeeMetrics(employee.id)
        
        return {
          ...employee,
          metrics
        }
      })
    )

    return ServiceResult.success({
      employees: employeesWithMetrics,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Get employees error:', error)
    return ServiceResult.error('Failed to get employees')
  }
}

export async function getHRAnalytics() {
  try {
    const session = await auth()
    if (!session?.user?.sppgId) {
      return ServiceResult.error('Unauthorized')
    }

    if (!hasPermission(session.user.userRole, 'ANALYTICS_VIEW')) {
      return ServiceResult.error('Insufficient permissions')
    }

    const sppgId = session.user.sppgId!

    // Get all employees
    const employees = await db.employee.findMany({
      where: { sppgId },
      include: {
        department: { select: { id: true, departmentName: true } },
        position: { select: { positionName: true } }
      }
    })

    const totalEmployees = employees.length
    const activeEmployees = employees.filter(e => e.isActive).length

    // Department distribution
    const departmentDistribution = employees.reduce((acc, emp) => {
      const deptName = emp.department.departmentName
      acc[deptName] = (acc[deptName] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Employment type distribution
    const employmentTypeDistribution = employees.reduce((acc, emp) => {
      acc[emp.employmentType] = (acc[emp.employmentType] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Employment status distribution
    const employmentStatusDistribution = employees.reduce((acc, emp) => {
      acc[emp.employmentStatus] = (acc[emp.employmentStatus] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Salary statistics
    const salaries = employees.filter(e => e.basicSalary).map(e => e.basicSalary!)
    const avgSalary = salaries.length > 0 
      ? salaries.reduce((sum, sal) => sum + sal, 0) / salaries.length 
      : 0

    // Recent attendance statistics (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    const recentAttendances = await db.employeeAttendance.findMany({
      where: {
        employee: { sppgId },
        attendanceDate: { gte: thirtyDaysAgo }
      }
    })

    const attendanceRate = recentAttendances.length > 0
      ? (recentAttendances.filter(a => a.status === AttendanceStatus.PRESENT || a.status === AttendanceStatus.LATE).length / recentAttendances.length) * 100
      : 0

    // Recent performance reviews (last 6 months)
    const sixMonthsAgo = new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000)
    const recentReviews = await db.performanceReview.findMany({
      where: {
        employee: { sppgId },
        completedAt: { gte: sixMonthsAgo }
      }
    })

    const avgPerformanceScore = recentReviews.length > 0
      ? recentReviews.reduce((sum, review) => sum + (review.overallScore || 0), 0) / recentReviews.length
      : 0

    // Department analytics
    const departmentAnalytics = await Promise.all(
      Object.keys(departmentDistribution).map(async (deptName) => {
        const dept = await db.department.findFirst({
          where: { departmentName: deptName, sppgId }
        })
        if (!dept) return null

        const analytics = await calculateDepartmentAnalytics(sppgId, dept.id)
        return {
          departmentName: deptName,
          ...analytics
        }
      })
    )

    const analytics = {
      overview: {
        totalEmployees,
        activeEmployees,
        avgSalary: Math.round(avgSalary),
        attendanceRate: Math.round(attendanceRate),
        avgPerformanceScore: Math.round(avgPerformanceScore * 100) / 100
      },
      distributions: {
        departments: departmentDistribution,
        employmentTypes: employmentTypeDistribution,
        employmentStatuses: employmentStatusDistribution
      },
      recentActivity: {
        totalAttendanceRecords: recentAttendances.length,
        totalPerformanceReviews: recentReviews.length
      },
      departmentAnalytics: departmentAnalytics.filter(Boolean)
    }

    return ServiceResult.success(analytics)

  } catch (error) {
    console.error('Get HR analytics error:', error)
    return ServiceResult.error('Failed to get HR analytics')
  }
}