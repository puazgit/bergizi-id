// HRD Domain Types (Pattern 2 - Self-contained)
// src/components/sppg/hrd/types/index.ts

// Employee Types
export interface Employee {
  id: string
  sppgId: string
  userId?: string | null
  employeeId: string
  employeeCode?: string | null
  
  // Personal Information
  fullName: string
  nickname?: string | null
  nik?: string | null
  dateOfBirth: Date
  placeOfBirth?: string | null
  gender: Gender
  religion?: string | null
  maritalStatus: MaritalStatus
  bloodType?: string | null
  nationality: string
  
  // Contact Information
  phone?: string | null
  email?: string | null
  personalEmail?: string | null
  addressDetail: string
  villageId: string
  postalCode?: string | null
  
  // Emergency Contact
  emergencyContactName?: string | null
  emergencyContactPhone?: string | null
  emergencyContactRelation?: string | null
  
  // Employment Information
  departmentId: string
  positionId: string
  employmentType: EmploymentType
  employmentStatus: EmploymentStatus
  
  // Employment Dates
  joinDate: Date
  probationEndDate?: Date | null
  contractStartDate?: Date | null
  contractEndDate?: Date | null
  terminationDate?: Date | null
  terminationReason?: string | null
  
  // Reporting Structure
  directSupervisor?: string | null
  workLocation?: string | null
  workScheduleId?: string | null
  
  // Salary Information
  basicSalary?: number | null
  currency: string
  salaryGrade?: string | null
  
  // Tax & Banking
  taxId?: string | null
  bankAccount?: string | null
  bankName?: string | null
  bankBranch?: string | null
  
  // Profile
  photoUrl?: string | null
  biography?: string | null
  skills: string[]
  languages: string[]
  
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  
  // Relations
  department?: {
    name: string
    code: string
  }
  position?: {
    title: string
    level: string
  }
  supervisor?: {
    fullName: string
    employeeId: string
  }
}

export interface CreateEmployeeData {
  sppgId: string
  employeeId: string
  employeeCode?: string
  fullName: string
  nickname?: string
  nik?: string
  dateOfBirth: Date
  placeOfBirth?: string
  gender: Gender
  religion?: string
  maritalStatus: MaritalStatus
  bloodType?: string
  phone?: string
  email?: string
  personalEmail?: string
  addressDetail: string
  villageId: string
  postalCode?: string
  emergencyContactName?: string
  emergencyContactPhone?: string
  emergencyContactRelation?: string
  departmentId: string
  positionId: string
  employmentType: EmploymentType
  employmentStatus: EmploymentStatus
  joinDate: Date
  probationEndDate?: Date
  contractStartDate?: Date
  contractEndDate?: Date
  directSupervisor?: string
  workLocation?: string
  basicSalary?: number
  salaryGrade?: string
  taxId?: string
  bankAccount?: string
  bankName?: string
  bankBranch?: string
  photoUrl?: string
  biography?: string
  skills?: string[]
  languages?: string[]
}

// Attendance Types
export interface EmployeeAttendance {
  id: string
  employeeId: string
  attendanceDate: Date
  dayOfWeek: string
  clockIn?: Date | null
  clockOut?: Date | null
  breakStart?: Date | null
  breakEnd?: Date | null
  scheduledHours: number
  actualHours: number
  breakHours: number
  overtimeHours: number
  status: AttendanceStatus
  attendanceType: string
  clockInLocation?: string | null
  clockOutLocation?: string | null
  notes?: string | null
  approvedBy?: string | null
  createdAt: Date
  updatedAt: Date
  
  // Relations
  employee?: {
    fullName: string
    employeeId: string
    department: string
  }
}

export interface CreateAttendanceData {
  employeeId: string
  attendanceDate: Date
  dayOfWeek: string
  clockIn?: Date
  clockOut?: Date
  breakStart?: Date
  breakEnd?: Date
  scheduledHours: number
  status: AttendanceStatus
  attendanceType?: string
  clockInLocation?: string
  clockOutLocation?: string
  notes?: string
}

// Training Types
export interface Training {
  id: string
  sppgId: string
  trainingCode: string
  trainingName: string
  description?: string | null
  category: string
  provider: string
  providerName?: string | null
  trainerName?: string | null
  trainerContact?: string | null
  startDate: Date
  endDate: Date
  duration: number
  location?: string | null
  mode: string
  maxParticipants: number
  currentParticipants: number
  costPerParticipant?: number | null
  totalBudget?: number | null
  materials: string[]
  prerequisites: string[]
  objectives: string[]
  providesCertificate: boolean
  certificateName?: string | null
  validityPeriod?: number | null
  status: TrainingStatus
  createdAt: Date
  updatedAt: Date
  
  // Relations
  participants?: EmployeeTraining[]
}

export interface EmployeeTraining {
  id: string
  employeeId: string
  trainingId: string
  enrolledAt: Date
  enrolledBy?: string | null
  attended: boolean
  attendanceRate?: number | null
  preTestScore?: number | null
  postTestScore?: number | null
  finalScore?: number | null
  passed: boolean
  completedAt?: Date | null
  certificateUrl?: string | null
  certificateNumber?: string | null
  feedback?: string | null
  rating?: number | null
  createdAt: Date
  updatedAt: Date
  
  // Relations
  employee?: {
    fullName: string
    employeeId: string
    department: string
  }
  training?: {
    trainingName: string
    trainingCode: string
  }
}

// Performance Types
export interface PerformanceReview {
  id: string
  employeeId: string
  reviewType: ReviewType
  reviewPeriod: string
  reviewYear: number
  reviewPeriodStart: Date
  reviewPeriodEnd: Date
  reviewerId: string
  reviewerName: string
  goals: string[]
  achievements: string[]
  strengths: string[]
  areasForImprovement: string[]
  skillRatings: Record<string, number>
  overallScore: number
  performanceLevel: string
  feedback: string
  developmentPlan: string[] | null
  recommendedActions: string[] | null
  nextReviewDate: Date | null
  status: string
  createdAt: Date
  updatedAt: Date
  employee?: {
    fullName: string
    employeeId: string
    position: string
  }
}

// Enums (imported from Prisma)
export type Gender = 'MALE' | 'FEMALE'
export type MaritalStatus = 'SINGLE' | 'MARRIED' | 'DIVORCED' | 'WIDOWED'
export type EmploymentType = 'PERMANENT' | 'CONTRACT' | 'TEMPORARY' | 'INTERN' | 'FREELANCE'
export type EmploymentStatus = 'ACTIVE' | 'PROBATION' | 'SUSPENDED' | 'TERMINATED' | 'RESIGNED' | 'RETIRED'
export type AttendanceStatus = 
  | 'PRESENT'
  | 'LATE'
  | 'ABSENT'
  | 'HALF_DAY'
  | 'OVERTIME'
  | 'SICK_LEAVE'
  | 'ANNUAL_LEAVE'
export type TrainingStatus = 'PLANNED' | 'ONGOING' | 'COMPLETED' | 'CANCELLED' | 'POSTPONED'
export type ReviewType = 'PROBATION' | 'QUARTERLY' | 'ANNUAL' | 'SPECIAL' | 'EXIT'

// Extended Types with Relations
export interface EmployeeWithDetails extends Employee {
  // Override relations with more details
  department?: {
    id: string
    name: string
    code: string
    description?: string
  }
  position?: {
    id: string
    title: string
    level: string
    description?: string
  }
  supervisor?: {
    id: string
    fullName: string
    employeeId: string
  }
  user?: {
    id: string
    name: string
    email: string
  } | null
  attendances?: EmployeeAttendance[]
  trainings?: EmployeeTraining[]
  // Computed properties
  salary?: number
  age?: number
  workDuration?: number
}

// Filters Types
export interface EmployeeFilters {
  page?: number
  limit?: number
  sortBy?: keyof Employee
  sortOrder?: 'asc' | 'desc'
  search?: string
  departmentId?: string
  positionId?: string
  employmentType?: EmploymentType
  employmentStatus?: EmploymentStatus
  joinDateFrom?: Date
  joinDateTo?: Date
  salaryMin?: number
  salaryMax?: number
}

// Input Types
export interface EmployeeInput {
  employeeId: string
  employeeCode?: string
  fullName: string
  nickname?: string
  nik?: string
  dateOfBirth: Date
  placeOfBirth?: string
  gender: Gender
  religion?: string
  maritalStatus: MaritalStatus
  bloodType?: string
  nationality: string
  phone?: string
  email?: string
  personalEmail?: string
  addressDetail: string
  villageId: string
  postalCode?: string
  emergencyContactName?: string
  emergencyContactPhone?: string
  emergencyContactRelation?: string
  departmentId: string
  positionId: string
  employmentType: EmploymentType
  employmentStatus: EmploymentStatus
  joinDate: Date
  probationEndDate?: Date
  contractStartDate?: Date
  contractEndDate?: Date
  directSupervisor?: string
  workLocation?: string
  basicSalary?: number
  currency: string
  salaryGrade?: string
  taxId?: string
  bankAccount?: string
  bankName?: string
  bankBranch?: string
  photoUrl?: string
  biography?: string
  skills?: string[]
  languages?: string[]
}

// Create Employee Input (alias for compatibility)
export type CreateEmployeeInput = EmployeeInput
export type UpdateEmployeeInput = Partial<EmployeeInput> & { id: string }

export interface AttendanceInput {
  employeeId: string
  attendanceDate: Date
  clockIn?: Date
  clockOut?: Date
  breakStart?: Date
  breakEnd?: Date
  status: AttendanceStatus
  attendanceType?: string
  clockInLocation?: string
  clockOutLocation?: string
  notes?: string
}

export type CreateAttendanceInput = AttendanceInput

export interface TrainingInput {
  trainingCode: string
  trainingName: string
  description?: string
  category: string
  provider: string
  providerName?: string
  trainerName?: string
  trainerContact?: string
  startDate: Date
  endDate: Date
  duration: number
  location?: string
  mode: string
  maxParticipants: number
  costPerParticipant?: number
  totalBudget?: number
  materials?: string[]
  prerequisites?: string[]
  objectives?: string[]
  providesCertificate?: boolean
  certificateName?: string
  validityPeriod?: number
}

// Metrics and Dashboard Types
export interface HRDMetrics {
  totalEmployees: number
  activeEmployees: number
  probationEmployees: number
  contractEmployees: number
  permanentEmployees: number
  totalDepartments: number
  averageAge: number
  averageTenure: number
  turnoverRate: number
  attendanceRate: number
  trainingCompletionRate: number
  departmentDistribution: Array<{
    department: string
    count: number
    percentage: number
  }>
  employmentStatusDistribution: Array<{
    status: EmploymentStatus
    count: number
    percentage: number
  }>
}

export interface AttendanceSummary {
  employeeId: string
  employeeName: string
  department: string
  totalWorkdays: number
  daysPresent: number
  presentDays: number
  daysAbsent: number
  absentDays: number
  daysLate: number
  lateDays: number
  totalHours: number
  totalWorkingHours: number
  overtimeHours: number
  attendanceRate: number
}

// Frontend-specific types
export interface EmployeeFormData {
  fullName: string
  nickname?: string
  nik: string
  dateOfBirth: Date
  placeOfBirth?: string
  gender: 'MALE' | 'FEMALE'
  religion?: string
  maritalStatus: 'SINGLE' | 'MARRIED' | 'DIVORCED' | 'WIDOWED'
  bloodType?: string
  nationality: string
  phone?: string
  email?: string
  personalEmail?: string
  addressDetail: string
  postalCode?: string
  emergencyContactName?: string
  emergencyContactPhone?: string
  emergencyContactRelation?: string
  departmentId: string
  positionId: string
  employmentType: 'PERMANENT' | 'CONTRACT' | 'TEMPORARY' | 'INTERN' | 'FREELANCE'
  employmentStatus: 'ACTIVE' | 'PROBATION' | 'SUSPENDED' | 'TERMINATED' | 'RESIGNED' | 'RETIRED'
  joinDate: Date
  probationEndDate?: Date
  contractStartDate?: Date
  contractEndDate?: Date
  directSupervisor?: string
  workLocation?: string
  basicSalary?: number
  currency: string
  salaryGrade?: string
  taxId?: string
  bankAccount?: string
  bankName?: string
  bankBranch?: string
  biography?: string
  skills: string[]
  languages: string[]
}

export interface AttendanceFormData {
  employeeId: string
  attendanceDate: Date
  clockIn?: Date
  clockOut?: Date
  breakStart?: Date
  breakEnd?: Date
  status: AttendanceStatus
  notes?: string
}

export interface TrainingFormData {
  trainingCode: string
  trainingName: string
  description: string
  category: string
  provider: string
  startDate: Date
  endDate: Date
  duration: number
  location?: string
  mode: string
  maxParticipants: number
  costPerParticipant?: number
}

export interface PerformanceReviewFormData {
  employeeId: string
  reviewType: ReviewType
  reviewPeriod: string
  reviewYear: number
  dueDate: Date
  technicalSkills?: number
  communication?: number
  teamwork?: number
  leadership?: number
  problemSolving?: number
  timeManagement?: number
  qualityOfWork?: number
  productivity?: number
  innovation?: number
  customerService?: number
  overallRating?: string
  reviewerComments?: string
  developmentPlan?: string
}

export type CreatePerformanceReviewInput = PerformanceReviewFormData

// UI State Types
export interface EmployeeFilters {
  searchTerm?: string
  departmentFilter?: string
  statusFilter?: EmploymentStatus
  employmentTypeFilter?: EmploymentType
}

export interface AttendanceFilters {
  employeeId?: string
  startDate: Date
  endDate: Date
  status?: AttendanceStatus
}

export type EmployeeFiltersInput = EmployeeFilters
export type AttendanceFiltersInput = AttendanceFilters

export interface TrainingFilters {
  category?: string
  status?: TrainingStatus
  startDate?: Date
  endDate?: Date
}

export interface PerformanceFilters {
  employeeId?: string
  reviewType?: ReviewType
  year?: number
}

// API Response Types
export interface EmployeeListResponse {
  employees: Employee[]
  total: number
  page: number
  limit: number
  metrics?: HRDMetrics
}

export interface AttendanceResponse {
  attendanceRecords: EmployeeAttendance[]
  summary: AttendanceSummary
}

export interface PerformanceMetrics {
  averageScore: number
  completedReviews: number
  achievedGoals: number
  improvementRate: number
}