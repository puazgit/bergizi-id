// HRD Utils and Validators
// src/components/sppg/hrd/utils/index.ts

import { z } from 'zod'

// Employee Form Schema
export const employeeFormSchema = z.object({
  // Personal Information
  fullName: z.string().min(2, 'Nama lengkap minimal 2 karakter').max(100, 'Nama lengkap maksimal 100 karakter'),
  nickname: z.string().max(50, 'Nama panggilan maksimal 50 karakter').optional(),
  nik: z.string().length(16, 'NIK harus 16 digit').regex(/^[0-9]+$/, 'NIK harus berupa angka'),
  dateOfBirth: z.date().refine(date => {
    const age = new Date().getFullYear() - date.getFullYear()
    return age >= 17 && age <= 65
  }, 'Usia harus antara 17-65 tahun'),
  placeOfBirth: z.string().max(100, 'Tempat lahir maksimal 100 karakter').optional(),
  gender: z.enum(['MALE', 'FEMALE']).refine(val => !!val, {
    message: 'Jenis kelamin harus dipilih'
  }),
  religion: z.string().max(50, 'Agama maksimal 50 karakter').optional(),
  maritalStatus: z.enum(['SINGLE', 'MARRIED', 'DIVORCED', 'WIDOWED']).refine(val => !!val, {
    message: 'Status pernikahan harus dipilih'
  }),
  bloodType: z.string().max(5, 'Golongan darah maksimal 5 karakter').optional(),
  nationality: z.string().min(1, 'Kewarganegaraan wajib diisi').max(50, 'Kewarganegaraan maksimal 50 karakter'),

  // Contact Information
  phone: z.string().regex(/^[0-9+\-\s()]+$/, 'Format nomor telepon tidak valid').optional(),
  email: z.string().email('Format email tidak valid').optional(),
  personalEmail: z.string().email('Format email tidak valid').optional(),
  addressDetail: z.string().min(10, 'Alamat minimal 10 karakter').max(500, 'Alamat maksimal 500 karakter'),
  postalCode: z.string().regex(/^[0-9]{5}$/, 'Kode pos harus 5 digit').optional(),

  // Emergency Contact
  emergencyContactName: z.string().max(100, 'Nama kontak darurat maksimal 100 karakter').optional(),
  emergencyContactPhone: z.string().regex(/^[0-9+\-\s()]+$/, 'Format nomor telepon tidak valid').optional(),
  emergencyContactRelation: z.string().max(50, 'Hubungan maksimal 50 karakter').optional(),

  // Employment Information
  departmentId: z.string().min(1, 'Departemen wajib dipilih'),
  positionId: z.string().min(1, 'Posisi wajib dipilih'),
  employmentType: z.enum(['PERMANENT', 'CONTRACT', 'TEMPORARY', 'INTERN', 'FREELANCE']).refine(val => !!val, {
    message: 'Jenis kepegawaian harus dipilih'
  }),
  employmentStatus: z.enum(['ACTIVE', 'PROBATION', 'SUSPENDED', 'TERMINATED', 'RESIGNED', 'RETIRED']).refine(val => !!val, {
    message: 'Status kepegawaian harus dipilih'
  }),
  joinDate: z.date().refine(date => date <= new Date(), 'Tanggal bergabung tidak boleh di masa depan'),
  probationEndDate: z.date().optional(),
  contractStartDate: z.date().optional(),
  contractEndDate: z.date().optional(),
  directSupervisor: z.string().optional(),
  workLocation: z.string().max(200, 'Lokasi kerja maksimal 200 karakter').optional(),

  // Financial Information
  basicSalary: z.number().min(0, 'Gaji pokok tidak boleh negatif').optional(),
  currency: z.string().min(1, 'Mata uang wajib diisi'),
  salaryGrade: z.string().max(20, 'Grade gaji maksimal 20 karakter').optional(),
  taxId: z.string().max(50, 'NPWP maksimal 50 karakter').optional(),
  bankAccount: z.string().max(50, 'Nomor rekening maksimal 50 karakter').optional(),
  bankName: z.string().max(100, 'Nama bank maksimal 100 karakter').optional(),
  bankBranch: z.string().max(100, 'Cabang bank maksimal 100 karakter').optional(),

  // Additional Information
  biography: z.string().max(1000, 'Biografi maksimal 1000 karakter').optional(),
  skills: z.array(z.string()).default([]),
  languages: z.array(z.string()).optional().default([])
})

// Attendance Form Schema
export const attendanceFormSchema = z.object({
  employeeId: z.string().min(1, 'Karyawan wajib dipilih'),
  attendanceDate: z.date(),
  clockIn: z.date().optional(),
  clockOut: z.date().optional(),
  breakStart: z.date().optional(),
  breakEnd: z.date().optional(),
  status: z.enum(['PRESENT', 'LATE', 'ABSENT', 'HALF_DAY', 'OVERTIME', 'SICK_LEAVE', 'ANNUAL_LEAVE']).refine(val => !!val, {
    message: 'Status kehadiran harus dipilih'
  }),
  notes: z.string().max(500, 'Catatan maksimal 500 karakter').optional()
}).refine(data => {
  // Validate clock out is after clock in
  if (data.clockIn && data.clockOut) {
    return data.clockOut > data.clockIn
  }
  return true
}, {
  message: 'Waktu keluar harus setelah waktu masuk',
  path: ['clockOut']
})

// Training Form Schema
export const trainingFormSchema = z.object({
  trainingCode: z.string().min(1, 'Kode pelatihan wajib diisi').max(20, 'Kode pelatihan maksimal 20 karakter'),
  trainingName: z.string().min(3, 'Nama pelatihan minimal 3 karakter').max(200, 'Nama pelatihan maksimal 200 karakter'),
  description: z.string().min(10, 'Deskripsi minimal 10 karakter').max(1000, 'Deskripsi maksimal 1000 karakter'),
  category: z.string().min(1, 'Kategori wajib diisi').max(100, 'Kategori maksimal 100 karakter'),
  provider: z.string().min(1, 'Penyedia wajib diisi').max(200, 'Penyedia maksimal 200 karakter'),
  startDate: z.date(),
  endDate: z.date(),
  duration: z.number().min(1, 'Durasi minimal 1 jam').max(720, 'Durasi maksimal 720 jam'),
  location: z.string().max(200, 'Lokasi maksimal 200 karakter').optional(),
  mode: z.string().min(1, 'Mode pelatihan wajib diisi'),
  maxParticipants: z.number().min(1, 'Minimal 1 peserta').max(1000, 'Maksimal 1000 peserta'),
  costPerParticipant: z.number().min(0, 'Biaya tidak boleh negatif').optional()
}).refine(data => {
  return data.endDate >= data.startDate
}, {
  message: 'Tanggal selesai harus setelah atau sama dengan tanggal mulai',
  path: ['endDate']
})

// Performance Review Form Schema
export const performanceReviewFormSchema = z.object({
  employeeId: z.string().min(1, 'Karyawan wajib dipilih'),
  reviewType: z.enum(['ANNUAL', 'PROBATION', 'QUARTERLY']).refine(val => !!val, {
    message: 'Jenis evaluasi harus dipilih'
  }),
  reviewPeriod: z.string().min(1, 'Periode evaluasi wajib diisi'),
  reviewYear: z.number().min(2020, 'Tahun evaluasi tidak valid').max(2030, 'Tahun evaluasi tidak valid'),
  dueDate: z.date(),
  
  // Skill ratings (1-5 scale)
  technicalSkills: z.number().min(1, 'Skor minimal 1').max(5, 'Skor maksimal 5').optional(),
  communication: z.number().min(1, 'Skor minimal 1').max(5, 'Skor maksimal 5').optional(),
  teamwork: z.number().min(1, 'Skor minimal 1').max(5, 'Skor maksimal 5').optional(),
  leadership: z.number().min(1, 'Skor minimal 1').max(5, 'Skor maksimal 5').optional(),
  problemSolving: z.number().min(1, 'Skor minimal 1').max(5, 'Skor maksimal 5').optional(),
  timeManagement: z.number().min(1, 'Skor minimal 1').max(5, 'Skor maksimal 5').optional(),
  qualityOfWork: z.number().min(1, 'Skor minimal 1').max(5, 'Skor maksimal 5').optional(),
  productivity: z.number().min(1, 'Skor minimal 1').max(5, 'Skor maksimal 5').optional(),
  innovation: z.number().min(1, 'Skor minimal 1').max(5, 'Skor maksimal 5').optional(),
  customerService: z.number().min(1, 'Skor minimal 1').max(5, 'Skor maksimal 5').optional(),
  
  overallRating: z.enum(['OUTSTANDING', 'EXCEEDS', 'MEETS', 'BELOW', 'UNSATISFACTORY']).optional(),
  reviewerComments: z.string().max(2000, 'Komentar maksimal 2000 karakter').optional(),
  developmentPlan: z.string().max(1000, 'Rencana pengembangan maksimal 1000 karakter').optional()
})

// Export types
export type EmployeeFormData = z.infer<typeof employeeFormSchema>
export type AttendanceFormData = z.infer<typeof attendanceFormSchema>
export type TrainingFormData = z.infer<typeof trainingFormSchema>
export type PerformanceReviewFormData = z.infer<typeof performanceReviewFormSchema>

// Utility functions
export const formatEmployeeId = (id: string): string => {
  return id.toUpperCase().padStart(6, '0')
}

export const getEmploymentStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    ACTIVE: 'green',
    PROBATION: 'yellow',
    SUSPENDED: 'red',
    TERMINATED: 'gray',
    RESIGNED: 'gray',
    RETIRED: 'blue'
  }
  return colors[status] || 'gray'
}

export const getAttendanceStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    PRESENT: 'green',
    LATE: 'yellow',
    ABSENT: 'red',
    SICK_LEAVE: 'blue',
    ANNUAL_LEAVE: 'purple',
    HALF_DAY: 'orange',
    OVERTIME: 'indigo'
  }
  return colors[status] || 'gray'
}

export const calculateWorkingHours = (clockIn: Date | null, clockOut: Date | null): string => {
  if (!clockIn || !clockOut) return '0j 0m'
  
  const diff = clockOut.getTime() - clockIn.getTime()
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  
  return `${hours}j ${minutes}m`
}

export const calculateAttendanceRate = (presentDays: number, totalDays: number): number => {
  if (totalDays === 0) return 0
  return Math.round((presentDays / totalDays) * 100 * 100) / 100
}

// ===== DOMAIN VALIDATORS (MOVED FROM domains/hrd/validators) =====

export const employeeSchema = z.object({
  employeeId: z.string().min(3, 'Employee ID minimal 3 karakter').max(20, 'Employee ID maksimal 20 karakter'),
  employeeCode: z.string().optional(),
  fullName: z.string().min(2, 'Nama lengkap minimal 2 karakter').max(100, 'Nama lengkap maksimal 100 karakter'),
  nickname: z.string().max(50, 'Nama panggilan maksimal 50 karakter').optional(),
  nik: z.string().length(16, 'NIK harus 16 digit').regex(/^\d{16}$/, 'NIK harus berupa angka').optional(),
  dateOfBirth: z.date().max(new Date(), 'Tanggal lahir tidak boleh di masa depan'),
  placeOfBirth: z.string().max(100, 'Tempat lahir maksimal 100 karakter').optional(),
  gender: z.enum(['MALE', 'FEMALE']).refine((val) => ['MALE', 'FEMALE'].includes(val), {
    message: 'Jenis kelamin harus dipilih'
  }),
  religion: z.string().max(50, 'Agama maksimal 50 karakter').optional(),
  maritalStatus: z.enum(['SINGLE', 'MARRIED', 'DIVORCED', 'WIDOWED']).refine((val) => ['SINGLE', 'MARRIED', 'DIVORCED', 'WIDOWED'].includes(val), {
    message: 'Status pernikahan harus dipilih'
  }),
  bloodType: z.enum(['A', 'B', 'AB', 'O', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']).optional(),
  phone: z.string().min(10, 'Nomor telepon minimal 10 digit').max(15, 'Nomor telepon maksimal 15 digit').optional(),
  email: z.string().email('Format email tidak valid').optional(),
  personalEmail: z.string().email('Format email pribadi tidak valid').optional(),
  addressDetail: z.string().min(10, 'Alamat detail minimal 10 karakter').max(500, 'Alamat detail maksimal 500 karakter'),
  villageId: z.string().cuid('Village ID harus valid'),
  postalCode: z.string().length(5, 'Kode pos harus 5 digit').regex(/^\d{5}$/, 'Kode pos harus berupa angka').optional(),
  emergencyContactName: z.string().max(100, 'Nama kontak darurat maksimal 100 karakter').optional(),
  emergencyContactPhone: z.string().max(15, 'Telepon kontak darurat maksimal 15 digit').optional(),
  emergencyContactRelation: z.string().max(50, 'Hubungan kontak darurat maksimal 50 karakter').optional(),
  departmentId: z.string().cuid('Department ID harus valid'),
  positionId: z.string().cuid('Position ID harus valid'),
  employmentType: z.enum(['PERMANENT', 'CONTRACT', 'TEMPORARY', 'INTERN', 'FREELANCE']).refine((val) => ['PERMANENT', 'CONTRACT', 'TEMPORARY', 'INTERN', 'FREELANCE'].includes(val), {
    message: 'Tipe kepegawaian harus dipilih'
  }),
  employmentStatus: z.enum(['ACTIVE', 'PROBATION', 'SUSPENDED', 'TERMINATED', 'RESIGNED', 'RETIRED']).refine((val) => ['ACTIVE', 'PROBATION', 'SUSPENDED', 'TERMINATED', 'RESIGNED', 'RETIRED'].includes(val), {
    message: 'Status kepegawaian harus dipilih'
  }),
  joinDate: z.date().max(new Date(), 'Tanggal bergabung tidak boleh di masa depan'),
  probationEndDate: z.date().optional(),
  contractStartDate: z.date().optional(),
  contractEndDate: z.date().optional(),
  directSupervisor: z.string().cuid().optional(),
  workLocation: z.string().max(200, 'Lokasi kerja maksimal 200 karakter').optional(),
  basicSalary: z.number().min(0, 'Gaji pokok tidak boleh negatif').optional(),
  salaryGrade: z.string().max(10, 'Grade gaji maksimal 10 karakter').optional(),
  taxId: z.string().max(20, 'NPWP maksimal 20 karakter').optional(),
  bankAccount: z.string().max(30, 'Nomor rekening maksimal 30 karakter').optional(),
  bankName: z.string().max(100, 'Nama bank maksimal 100 karakter').optional(),
  bankBranch: z.string().max(100, 'Cabang bank maksimal 100 karakter').optional(),
  photoUrl: z.string().url('URL foto harus valid').optional(),
  biography: z.string().max(1000, 'Biografi maksimal 1000 karakter').optional(),
  skills: z.array(z.string()).optional(),
  languages: z.array(z.string()).optional()
}).refine(data => {
  if (data.contractStartDate && data.contractEndDate) {
    return data.contractEndDate > data.contractStartDate
  }
  return true
}, {
  message: 'Tanggal berakhir kontrak harus setelah tanggal mulai kontrak',
  path: ['contractEndDate']
}).refine(data => {
  if (data.probationEndDate && data.joinDate) {
    return data.probationEndDate > data.joinDate
  }
  return true
}, {
  message: 'Tanggal berakhir masa percobaan harus setelah tanggal bergabung',
  path: ['probationEndDate']
})

export const attendanceSchema = z.object({
  employeeId: z.string().cuid('Employee ID harus valid'),
  attendanceDate: z.date().max(new Date(), 'Tanggal kehadiran tidak boleh di masa depan'),
  clockIn: z.date().optional(),
  clockOut: z.date().optional(),
  breakStart: z.date().optional(),
  breakEnd: z.date().optional(),
  status: z.enum(['PRESENT', 'LATE', 'ABSENT', 'HALF_DAY', 'OVERTIME', 'SICK_LEAVE', 'ANNUAL_LEAVE']).refine((val) => ['PRESENT', 'LATE', 'ABSENT', 'HALF_DAY', 'OVERTIME', 'SICK_LEAVE', 'ANNUAL_LEAVE'].includes(val), {
    message: 'Status kehadiran harus dipilih'
  }),
  attendanceType: z.string().default('REGULAR'),
  clockInLocation: z.string().max(200, 'Lokasi clock in maksimal 200 karakter').optional(),
  clockOutLocation: z.string().max(200, 'Lokasi clock out maksimal 200 karakter').optional(),
  notes: z.string().max(500, 'Catatan maksimal 500 karakter').optional()
}).refine(data => {
  if (data.clockIn && data.clockOut) {
    return data.clockOut > data.clockIn
  }
  return true
}, {
  message: 'Waktu clock out harus setelah clock in',
  path: ['clockOut']
}).refine(data => {
  if (data.breakStart && data.breakEnd) {
    return data.breakEnd > data.breakStart
  }
  return true
}, {
  message: 'Waktu selesai istirahat harus setelah mulai istirahat',
  path: ['breakEnd']
})

export const trainingSchema = z.object({
  trainingCode: z.string().min(3, 'Kode training minimal 3 karakter').max(20, 'Kode training maksimal 20 karakter'),
  trainingName: z.string().min(5, 'Nama training minimal 5 karakter').max(200, 'Nama training maksimal 200 karakter'),
  description: z.string().max(1000, 'Deskripsi maksimal 1000 karakter').optional(),
  category: z.enum(['TECHNICAL', 'SOFT_SKILLS', 'SAFETY', 'COMPLIANCE', 'LEADERSHIP']).refine((val) => ['TECHNICAL', 'SOFT_SKILLS', 'SAFETY', 'COMPLIANCE', 'LEADERSHIP'].includes(val), {
    message: 'Kategori training harus dipilih'
  }),
  provider: z.enum(['INTERNAL', 'EXTERNAL', 'ONLINE']).refine((val) => ['INTERNAL', 'EXTERNAL', 'ONLINE'].includes(val), {
    message: 'Provider training harus dipilih'
  }),
  providerName: z.string().max(200, 'Nama provider maksimal 200 karakter').optional(),
  trainerName: z.string().max(100, 'Nama trainer maksimal 100 karakter').optional(),
  trainerContact: z.string().max(100, 'Kontak trainer maksimal 100 karakter').optional(),
  startDate: z.date().min(new Date(), 'Tanggal mulai tidak boleh di masa lalu'),
  endDate: z.date(),
  duration: z.number().min(1, 'Durasi minimal 1 jam').max(720, 'Durasi maksimal 720 jam (30 hari)'),
  location: z.string().max(200, 'Lokasi maksimal 200 karakter').optional(),
  mode: z.enum(['CLASSROOM', 'ONLINE', 'HYBRID', 'ON_THE_JOB']).refine((val) => ['CLASSROOM', 'ONLINE', 'HYBRID', 'ON_THE_JOB'].includes(val), {
    message: 'Mode training harus dipilih'
  }),
  maxParticipants: z.number().min(1, 'Maksimal peserta minimal 1').max(1000, 'Maksimal peserta maksimal 1000'),
  costPerParticipant: z.number().min(0, 'Biaya per peserta tidak boleh negatif').optional(),
  totalBudget: z.number().min(0, 'Total budget tidak boleh negatif').optional(),
  materials: z.array(z.string()).optional(),
  prerequisites: z.array(z.string()).optional(),
  objectives: z.array(z.string()).optional(),
  providesCertificate: z.boolean().default(false),
  certificateName: z.string().max(200, 'Nama sertifikat maksimal 200 karakter').optional(),
  validityPeriod: z.number().min(1, 'Periode validitas minimal 1 bulan').max(120, 'Periode validitas maksimal 120 bulan').optional()
}).refine(data => {
  return data.endDate > data.startDate
}, {
  message: 'Tanggal selesai harus setelah tanggal mulai',
  path: ['endDate']
})

export const performanceReviewSchema = z.object({
  employeeId: z.string().cuid('Employee ID harus valid'),
  reviewType: z.enum(['PROBATION', 'QUARTERLY', 'ANNUAL', 'SPECIAL', 'EXIT']).refine((val) => ['PROBATION', 'QUARTERLY', 'ANNUAL', 'SPECIAL', 'EXIT'].includes(val), {
    message: 'Tipe review harus dipilih'
  }),
  reviewPeriod: z.string().min(1, 'Periode review harus diisi'),
  reviewYear: z.number().min(2020, 'Tahun review minimal 2020').max(2030, 'Tahun review maksimal 2030'),
  reviewerId: z.string().cuid('Reviewer ID harus valid'),
  scheduledDate: z.date().min(new Date(), 'Tanggal jadwal tidak boleh di masa lalu'),
  dueDate: z.date(),
  goals: z.array(z.string()).min(1, 'Minimal harus ada 1 tujuan'),
  overallRating: z.number().min(1, 'Rating minimal 1').max(5, 'Rating maksimal 5').optional(),
  achievements: z.array(z.string()).optional(),
  areasForImprovement: z.array(z.string()).optional(),
  employeeComments: z.string().max(2000, 'Komentar karyawan maksimal 2000 karakter').optional(),
  reviewerComments: z.string().max(2000, 'Komentar reviewer maksimal 2000 karakter').optional(),
  actionItems: z.array(z.string()).optional()
}).refine(data => {
  return data.dueDate >= data.scheduledDate
}, {
  message: 'Tanggal deadline harus setelah atau sama dengan tanggal jadwal',
  path: ['dueDate']
})

// Export validator types for reuse
export type EmployeeInputValidation = z.infer<typeof employeeSchema>
export type AttendanceInputValidation = z.infer<typeof attendanceSchema>
export type TrainingInputValidation = z.infer<typeof trainingSchema>
export type PerformanceReviewInputValidation = z.infer<typeof performanceReviewSchema>
export type EmployeeFormDataSchema = z.infer<typeof employeeFormSchema>