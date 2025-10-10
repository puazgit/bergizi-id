// Auth Validation Schemas
// Cross-domain authentication and authorization schemas
// src/schemas/auth.ts

import { z } from 'zod'
import { UserRole, UserType } from '@prisma/client'

// ============= Authentication Schemas =============

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email wajib diisi')
    .email('Format email tidak valid')
    .max(255, 'Email terlalu panjang'),
  password: z
    .string()
    .min(1, 'Password wajib diisi')
    .min(8, 'Password minimal 8 karakter')
    .max(100, 'Password terlalu panjang'),
  remember: z.boolean().optional(),
})

export const registerSchema = z.object({
  name: z
    .string()
    .min(1, 'Nama wajib diisi')
    .min(2, 'Nama minimal 2 karakter')
    .max(100, 'Nama terlalu panjang'),
  email: z
    .string()
    .min(1, 'Email wajib diisi')
    .email('Format email tidak valid')
    .max(255, 'Email terlalu panjang'),
  password: z
    .string()
    .min(1, 'Password wajib diisi')
    .min(8, 'Password minimal 8 karakter')
    .max(100, 'Password terlalu panjang')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      'Password harus mengandung huruf besar, huruf kecil, angka, dan simbol'
    ),
  confirmPassword: z
    .string()
    .min(1, 'Konfirmasi password wajib diisi'),
  userType: z.nativeEnum(UserType).optional(),
  sppgId: z.string().cuid().optional(),
  acceptTerms: z
    .boolean()
    .refine(val => val === true, 'Anda harus menyetujui syarat dan ketentuan'),
})
.refine(data => data.password === data.confirmPassword, {
  message: 'Konfirmasi password tidak cocok',
  path: ['confirmPassword'],
})

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'Email wajib diisi')
    .email('Format email tidak valid')
    .max(255, 'Email terlalu panjang'),
})

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token tidak valid'),
  password: z
    .string()
    .min(1, 'Password wajib diisi')
    .min(8, 'Password minimal 8 karakter')
    .max(100, 'Password terlalu panjang')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      'Password harus mengandung huruf besar, huruf kecil, angka, dan simbol'
    ),
  confirmPassword: z
    .string()
    .min(1, 'Konfirmasi password wajib diisi'),
})
.refine(data => data.password === data.confirmPassword, {
  message: 'Konfirmasi password tidak cocok',
  path: ['confirmPassword'],
})

export const changePasswordSchema = z.object({
  currentPassword: z
    .string()
    .min(1, 'Password saat ini wajib diisi'),
  newPassword: z
    .string()
    .min(1, 'Password baru wajib diisi')
    .min(8, 'Password minimal 8 karakter')
    .max(100, 'Password terlalu panjang')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      'Password harus mengandung huruf besar, huruf kecil, angka, dan simbol'
    ),
  confirmPassword: z
    .string()
    .min(1, 'Konfirmasi password wajib diisi'),
})
.refine(data => data.newPassword === data.confirmPassword, {
  message: 'Konfirmasi password tidak cocok',
  path: ['confirmPassword'],
})
.refine(data => data.currentPassword !== data.newPassword, {
  message: 'Password baru harus berbeda dari password saat ini',
  path: ['newPassword'],
})

// ============= User Management Schemas =============

export const userProfileSchema = z.object({
  name: z
    .string()
    .min(1, 'Nama wajib diisi')
    .min(2, 'Nama minimal 2 karakter')
    .max(100, 'Nama terlalu panjang'),
  email: z
    .string()
    .min(1, 'Email wajib diisi')
    .email('Format email tidak valid')
    .max(255, 'Email terlalu panjang'),
  phone: z
    .string()
    .min(10, 'Nomor telepon minimal 10 digit')
    .max(15, 'Nomor telepon maksimal 15 digit')
    .regex(/^[0-9+\-\s()]+$/, 'Format nomor telepon tidak valid')
    .optional(),
  avatar: z.string().url('Format URL avatar tidak valid').optional(),
})

export const createUserSchema = z.object({
  name: z
    .string()
    .min(1, 'Nama wajib diisi')
    .min(2, 'Nama minimal 2 karakter')
    .max(100, 'Nama terlalu panjang'),
  email: z
    .string()
    .min(1, 'Email wajib diisi')
    .email('Format email tidak valid')
    .max(255, 'Email terlalu panjang'),
  password: z
    .string()
    .min(1, 'Password wajib diisi')
    .min(8, 'Password minimal 8 karakter')
    .max(100, 'Password terlalu panjang'),
  userRole: z.nativeEnum(UserRole),
  userType: z.nativeEnum(UserType),
  sppgId: z.string().cuid().optional(),
  phone: z.string().optional(),
  isActive: z.boolean().default(true),
})

export const updateUserSchema = z.object({
  name: z
    .string()
    .min(2, 'Nama minimal 2 karakter')
    .max(100, 'Nama terlalu panjang')
    .optional(),
  email: z
    .string()
    .email('Format email tidak valid')
    .max(255, 'Email terlalu panjang')
    .optional(),
  userRole: z.nativeEnum(UserRole).optional(),
  phone: z.string().optional(),
  isActive: z.boolean().optional(),
})

// ============= SPPG User Management =============

export const inviteUserSchema = z.object({
  email: z
    .string()
    .min(1, 'Email wajib diisi')
    .email('Format email tidak valid')
    .max(255, 'Email terlalu panjang'),
  name: z
    .string()
    .min(1, 'Nama wajib diisi')
    .min(2, 'Nama minimal 2 karakter')
    .max(100, 'Nama terlalu panjang'),
  userRole: z.nativeEnum(UserRole),
  message: z
    .string()
    .max(500, 'Pesan terlalu panjang')
    .optional(),
})

export const acceptInviteSchema = z.object({
  token: z.string().min(1, 'Token tidak valid'),
  password: z
    .string()
    .min(1, 'Password wajib diisi')
    .min(8, 'Password minimal 8 karakter')
    .max(100, 'Password terlalu panjang')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      'Password harus mengandung huruf besar, huruf kecil, angka, dan simbol'
    ),
  confirmPassword: z
    .string()
    .min(1, 'Konfirmasi password wajib diisi'),
})
.refine(data => data.password === data.confirmPassword, {
  message: 'Konfirmasi password tidak cocok',
  path: ['confirmPassword'],
})

// ============= Demo Request Schema =============

export const demoRequestSchema = z.object({
  // Personal Information
  name: z
    .string()
    .min(1, 'Nama wajib diisi')
    .min(2, 'Nama minimal 2 karakter')
    .max(100, 'Nama terlalu panjang'),
  email: z
    .string()
    .min(1, 'Email wajib diisi')
    .email('Format email tidak valid')
    .max(255, 'Email terlalu panjang'),
  phone: z
    .string()
    .min(10, 'Nomor telepon minimal 10 digit')
    .max(15, 'Nomor telepon maksimal 15 digit')
    .regex(/^[0-9+\-\s()]+$/, 'Format nomor telepon tidak valid'),
  
  // Organization Information
  organizationName: z
    .string()
    .min(1, 'Nama organisasi wajib diisi')
    .min(2, 'Nama organisasi minimal 2 karakter')
    .max(200, 'Nama organisasi terlalu panjang'),
  organizationType: z.enum([
    'SPPG',
    'SEKOLAH',
    'YAYASAN',
    'PEMERINTAH',
    'LAINNYA'
  ]).refine(val => val, {
    message: 'Pilih jenis organisasi'
  }),
  position: z
    .string()
    .min(1, 'Jabatan wajib diisi')
    .max(100, 'Jabatan terlalu panjang'),
  
  // Location
  city: z
    .string()
    .min(1, 'Kota wajib diisi')
    .max(100, 'Nama kota terlalu panjang'),
  province: z
    .string()
    .min(1, 'Provinsi wajib diisi')
    .max(100, 'Nama provinsi terlalu panjang'),
  
  // Requirements
  expectedBeneficiaries: z
    .number()
    .min(1, 'Jumlah penerima manfaat minimal 1')
    .max(100000, 'Jumlah penerima manfaat maksimal 100.000'),
  interestedFeatures: z
    .array(z.enum([
      'MENU_MANAGEMENT',
      'PROCUREMENT',
      'PRODUCTION',
      'DISTRIBUTION',
      'REPORTING',
      'ANALYTICS'
    ]))
    .min(1, 'Pilih minimal satu fitur yang diminati'),
  
  // Additional Information
  currentSolution: z
    .string()
    .max(500, 'Deskripsi terlalu panjang')
    .optional(),
  specificNeeds: z
    .string()
    .max(1000, 'Deskripsi kebutuhan terlalu panjang')
    .optional(),
  preferredDemoDate: z
    .string()
    .optional(),
  
  // Consent
  agreeToTerms: z
    .boolean()
    .refine(val => val === true, 'Anda harus menyetujui syarat dan ketentuan'),
  subscribeNewsletter: z.boolean().optional(),
})

// ============= Type Exports =============

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>
export type UserProfileInput = z.infer<typeof userProfileSchema>
export type CreateUserInput = z.infer<typeof createUserSchema>
export type UpdateUserInput = z.infer<typeof updateUserSchema>
export type InviteUserInput = z.infer<typeof inviteUserSchema>
export type AcceptInviteInput = z.infer<typeof acceptInviteSchema>
export type DemoRequestInput = z.infer<typeof demoRequestSchema>

// ============= Validation Helpers =============

export const validatePassword = (password: string): string[] => {
  const errors: string[] = []
  
  if (password.length < 8) {
    errors.push('Password minimal 8 karakter')
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password harus mengandung huruf kecil')
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password harus mengandung huruf besar')
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password harus mengandung angka')
  }
  
  if (!/[@$!%*?&]/.test(password)) {
    errors.push('Password harus mengandung simbol khusus')
  }
  
  return errors
}

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^[0-9+\-\s()]+$/
  return phoneRegex.test(phone) && phone.length >= 10 && phone.length <= 15
}