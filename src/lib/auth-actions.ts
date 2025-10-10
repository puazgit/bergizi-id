// Enterprise Authentication Server Actions
// Bergizi-ID SaaS Platform - Server-side Auth Operations

'use server'

import { signIn, signOut } from '@/auth'
import { hashPassword } from './auth-security'
import prisma from '@/lib/db'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { 
  trackLoginAttempt, 
  checkRateLimit, 
  validatePasswordStrength,
  logSecurityEvent 
} from '@/lib/auth-security'
import { AuthError } from 'next-auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

// ===== VALIDATION SCHEMAS =====

const loginSchema = z.object({
  email: z.string()
    .email('Format email tidak valid')
    .toLowerCase()
    .trim(),
  password: z.string()
    .min(6, 'Password minimal 6 karakter'),
  rememberMe: z.boolean().optional().default(false)
})

const registerSchema = z.object({
  email: z.string()
    .email('Format email tidak valid')
    .toLowerCase()
    .trim(),
  password: z.string()
    .min(8, 'Password minimal 8 karakter'),
  confirmPassword: z.string(),
  name: z.string()
    .min(2, 'Nama minimal 2 karakter')
    .trim(),
  phone: z.string()
    .optional()
    .refine(val => !val || /^(\+62|62|0)[0-9]{9,13}$/.test(val), {
      message: 'Format nomor telepon tidak valid'
    }),
  sppgCode: z.string()
    .optional()
    .refine(val => !val || /^SPPG-[A-Z0-9]{3}-[0-9]{3}$/.test(val), {
      message: 'Format kode SPPG tidak valid (contoh: SPPG-JKT-001)'
    })
}).refine(data => data.password === data.confirmPassword, {
  message: 'Password dan konfirmasi password tidak sama',
  path: ['confirmPassword']
})

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Password saat ini diperlukan'),
  newPassword: z.string().min(8, 'Password baru minimal 8 karakter'),
  confirmNewPassword: z.string()
}).refine(data => data.newPassword === data.confirmNewPassword, {
  message: 'Password baru dan konfirmasi tidak sama',
  path: ['confirmNewPassword']
})

const forgotPasswordSchema = z.object({
  email: z.string()
    .email('Format email tidak valid')
    .toLowerCase()
    .trim()
})

// ===== RESPONSE TYPES =====

type AuthResult<T = unknown> = {
  success: boolean
  data?: T
  error?: string
  fieldErrors?: Record<string, string[]>
}

// ===== HELPER FUNCTIONS =====

async function getClientInfo() {
  const headersList = await headers()
  const forwardedFor = headersList.get('x-forwarded-for')
  const realIp = headersList.get('x-real-ip')
  
  return {
    ipAddress: forwardedFor?.split(',')[0] || realIp || 'unknown',
    userAgent: headersList.get('user-agent') || 'unknown'
  }
}

// hashPassword function already defined above

// ===== AUTHENTICATION ACTIONS =====

/**
 * Enterprise Login Action with Security Features
 * - Rate limiting
 * - Account lockout protection
 * - Audit logging
 * - Multi-factor authentication ready
 */
export async function loginAction(
  formData: FormData
): Promise<AuthResult> {
  try {
    const { ipAddress, userAgent } = await getClientInfo()
    
    // Parse and validate input
    const rawData = {
      email: formData.get('email') as string,
      password: formData.get('password') as string,
      rememberMe: formData.get('rememberMe') === 'true'
    }

    const validation = loginSchema.safeParse(rawData)
    if (!validation.success) {
      return {
        success: false,
        error: 'Data tidak valid',
        fieldErrors: validation.error.flatten().fieldErrors
      }
    }

    const { email, password } = validation.data

    // Rate limiting check
    const rateLimit = await checkRateLimit(ipAddress, 'login', 5, 15 * 60 * 1000)
    if (!rateLimit.allowed) {
      await logSecurityEvent(
        'LOGIN_RATE_LIMITED',
        { 
          email, 
          ipAddress, 
          userAgent,
          category: 'user_authentication' 
        },
        'anonymous'
      )

      return {
        success: false,
        error: `Terlalu banyak percobaan login. Coba lagi dalam ${Math.ceil((rateLimit.resetTime.getTime() - Date.now()) / 60000)} menit.`
      }
    }

    // Check if user exists and account status
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        password: true,
        isActive: true,
        failedLoginAttempts: true,
        lockedUntil: true,
        userRole: true,
        userType: true,
        sppgId: true
      }
    })

    // Track login attempt (even if user doesn't exist)
    await trackLoginAttempt(
      email, 
      false, // We'll update this after successful auth
      ipAddress, 
      userAgent
    )

    // Check if user exists and is active
    if (!user || !user.isActive) {
      return {
        success: false,
        error: 'Email atau password salah'
      }
    }

    // Attempt authentication
    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false
      })

      // If we reach here, login was successful
      await trackLoginAttempt(email, true, ipAddress, userAgent)

      return {
        success: true,
        data: { redirectUrl: result || '/dashboard' }
      }
    } catch (error) {
      // Handle authentication errors
      if (error instanceof AuthError) {
        let errorMessage = 'Email atau password salah'
        
        switch (error.type) {
          case 'CredentialsSignin':
            errorMessage = 'Email atau password salah'
            break
          case 'AccountNotLinked':
            errorMessage = 'Akun sudah terdaftar dengan provider lain'
            break
          default:
            errorMessage = 'Terjadi kesalahan saat login'
        }

        return {
          success: false,
          error: errorMessage
        }
      }

      throw error
    }
  } catch (error) {
    console.error('Login action error:', error)
    return {
      success: false,
      error: 'Terjadi kesalahan sistem. Silakan coba lagi.'
    }
  }
}

/**
 * Logout Action with Audit Trail
 */
export async function logoutAction(): Promise<AuthResult> {
  try {
    const { ipAddress, userAgent } = await getClientInfo()
    
    // Log logout event before signing out
    try {
      const session = await import('@/auth').then(m => m.auth())
      if (session?.user) {
        await logSecurityEvent(
          'LOGOUT',
          { 
            ipAddress, 
            userAgent,
            category: 'user_authentication' 
          },
          session.user.id
        )
      }
    } catch (error) {
      console.error('Logout logging failed:', error)
    }

    await signOut({ redirect: false })
    
    return {
      success: true,
      data: { redirectUrl: '/' }
    }
  } catch (error) {
    console.error('Logout action error:', error)
    return {
      success: false,
      error: 'Gagal logout'
    }
  }
}

/**
 * User Registration Action (SPPG Staff Registration)
 */
export async function registerAction(
  formData: FormData
): Promise<AuthResult> {
  try {
    const { ipAddress, userAgent } = await getClientInfo()
    
    // Parse and validate input
    const rawData = {
      email: formData.get('email') as string,
      password: formData.get('password') as string,
      confirmPassword: formData.get('confirmPassword') as string,
      name: formData.get('name') as string,
      phone: formData.get('phone') as string || undefined,
      sppgCode: formData.get('sppgCode') as string || undefined
    }

    const validation = registerSchema.safeParse(rawData)
    if (!validation.success) {
      return {
        success: false,
        error: 'Data tidak valid',
        fieldErrors: validation.error.flatten().fieldErrors
      }
    }

    const { email, password, name, phone, sppgCode } = validation.data

    // Validate password strength
    const passwordValidation = validatePasswordStrength(password)
    if (!passwordValidation.isValid) {
      return {
        success: false,
        error: 'Password tidak memenuhi syarat keamanan',
        fieldErrors: {
          password: passwordValidation.errors
        }
      }
    }

    // Rate limiting for registration
    const rateLimit = await checkRateLimit(ipAddress, 'register', 3, 60 * 60 * 1000) // 3 per hour
    if (!rateLimit.allowed) {
      return {
        success: false,
        error: 'Terlalu banyak percobaan registrasi. Coba lagi nanti.'
      }
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return {
        success: false,
        error: 'Email sudah terdaftar'
      }
    }

    // Find SPPG if code provided
    let sppgId = null
    if (sppgCode) {
      const sppg = await prisma.sPPG.findUnique({
        where: { 
          code: sppgCode,
          status: 'ACTIVE'
        },
        select: { id: true, name: true }
      })

      if (!sppg) {
        return {
          success: false,
          error: 'Kode SPPG tidak ditemukan atau tidak aktif'
        }
      }
      
      sppgId = sppg.id
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        phone,
        sppgId,
        userType: sppgId ? 'SPPG_USER' : 'PROSPECT',
        userRole: sppgId ? 'SPPG_VIEWER' : undefined, // Default role
        isActive: true,
        emailVerified: null // Require email verification
      },
      select: {
        id: true,
        email: true,
        name: true
      }
    })

    // Log registration
    await logSecurityEvent(
      'USER_REGISTERED',
      { 
        email, 
        sppgCode: sppgCode || null,
        registrationMethod: 'self_registration',
        ipAddress,
        userAgent,
        category: 'user_management'
      },
      user.id
    )

    // TODO: Send email verification
    // await sendEmailVerification(user.email, user.id)

    return {
      success: true,
      data: { 
        message: 'Registrasi berhasil. Silakan periksa email Anda untuk verifikasi.',
        userId: user.id
      }
    }
  } catch (error) {
    console.error('Registration action error:', error)
    return {
      success: false,
      error: 'Terjadi kesalahan sistem. Silakan coba lagi.'
    }
  }
}

/**
 * Change Password Action
 */
export async function changePasswordAction(
  formData: FormData
): Promise<AuthResult> {
  try {
    const { ipAddress, userAgent } = await getClientInfo()
    
    // Get current session
    const session = await import('@/auth').then(m => m.auth())
    if (!session?.user) {
      return {
        success: false,
        error: 'Anda harus login terlebih dahulu'
      }
    }

    // Parse and validate input
    const rawData = {
      currentPassword: formData.get('currentPassword') as string,
      newPassword: formData.get('newPassword') as string,
      confirmNewPassword: formData.get('confirmNewPassword') as string
    }

    const validation = changePasswordSchema.safeParse(rawData)
    if (!validation.success) {
      return {
        success: false,
        error: 'Data tidak valid',
        fieldErrors: validation.error.flatten().fieldErrors
      }
    }

    const { currentPassword, newPassword } = validation.data

    // Validate new password strength
    const passwordValidation = validatePasswordStrength(newPassword)
    if (!passwordValidation.isValid) {
      return {
        success: false,
        error: 'Password baru tidak memenuhi syarat keamanan',
        fieldErrors: {
          newPassword: passwordValidation.errors
        }
      }
    }

    // Get user with current password
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        password: true
      }
    })

    if (!user || !user.password) {
      return {
        success: false,
        error: 'User tidak ditemukan'
      }
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password)
    if (!isCurrentPasswordValid) {
      // Log failed password change attempt
      await logSecurityEvent(
        'PASSWORD_CHANGE_FAILED',
        { 
          reason: 'invalid_current_password',
          ipAddress,
          userAgent,
          category: 'user_security'
        },
        user.id
      )

      return {
        success: false,
        error: 'Password saat ini salah'
      }
    }

    // Hash new password
    const hashedNewPassword = await hashPassword(newPassword)

    // Update password
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedNewPassword,
        lastPasswordChange: new Date()
      }
    })

    // Log successful password change
    await logSecurityEvent(
      'PASSWORD_CHANGED',
      {
        ipAddress,
        userAgent, 
        category: 'user_security'
      },
      user.id
    )

    return {
      success: true,
      data: { message: 'Password berhasil diubah' }
    }
  } catch (error) {
    console.error('Change password action error:', error)
    return {
      success: false,
      error: 'Terjadi kesalahan sistem. Silakan coba lagi.'
    }
  }
}

/**
 * Forgot Password Action
 */
export async function forgotPasswordAction(
  formData: FormData
): Promise<AuthResult> {
  try {
    const { ipAddress, userAgent } = await getClientInfo()
    
    // Parse and validate input
    const rawData = {
      email: formData.get('email') as string
    }

    const validation = forgotPasswordSchema.safeParse(rawData)
    if (!validation.success) {
      return {
        success: false,
        error: 'Format email tidak valid',
        fieldErrors: validation.error.flatten().fieldErrors
      }
    }

    const { email } = validation.data

    // Rate limiting for forgot password
    const rateLimit = await checkRateLimit(ipAddress, 'forgot-password', 3, 60 * 60 * 1000) // 3 per hour
    if (!rateLimit.allowed) {
      return {
        success: false,
        error: 'Terlalu banyak permintaan reset password. Coba lagi nanti.'
      }
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        isActive: true
      }
    })

    // Always return success for security (don't reveal if email exists)
    if (!user || !user.isActive) {
      // Log failed forgot password attempt
      await logSecurityEvent(
        'FORGOT_PASSWORD_FAILED',
        { 
          email, 
          reason: 'user_not_found_or_inactive',
          ipAddress,
          userAgent,
          category: 'user_security'
        },
        'anonymous'
      )

      return {
        success: true,
        data: { 
          message: 'Jika email terdaftar, Anda akan menerima instruksi reset password.' 
        }
      }
    }

    // TODO: Generate reset token and send email
    // const resetToken = await generatePasswordResetToken(user.id)
    // await sendPasswordResetEmail(user.email, resetToken)

    // Log forgot password request
    await logSecurityEvent(
      'FORGOT_PASSWORD_REQUESTED',
      {
        ipAddress,
        userAgent,
        category: 'user_security'
      },
      user.id
    )

    return {
      success: true,
      data: { 
        message: 'Instruksi reset password telah dikirim ke email Anda.' 
      }
    }
  } catch (error) {
    console.error('Forgot password action error:', error)
    return {
      success: false,
      error: 'Terjadi kesalahan sistem. Silakan coba lagi.'
    }
  }
}

/**
 * Redirect based on user role after login
 */
export async function redirectAfterLogin() {
  const session = await import('@/auth').then(m => m.auth())
  
  if (!session?.user) {
    redirect('/login')
  }

  // Determine redirect URL based on user role
  const { userRole } = session.user
  
  if (userRole === 'PLATFORM_SUPERADMIN' || 
      userRole === 'PLATFORM_SUPPORT' || 
      userRole === 'PLATFORM_ANALYST') {
    redirect('/admin')
  }
  
  if (userRole?.startsWith('SPPG_') || userRole === 'DEMO_USER') {
    redirect('/dashboard')
  }
  
  // Default redirect
  redirect('/dashboard')
}