'use client'

import React, { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, Loader2, Mail, Lock, User, Phone, Building } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'

import { registerAction } from '@/lib/auth-actions'
import { validatePasswordStrength } from '@/lib/auth-security'
import { cn } from '@/lib/utils'

interface RegisterFormProps {
  className?: string
}

export function RegisterForm({ className }: RegisterFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState<string>('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    feedback: [] as string[]
  })

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const password = e.target.value
    if (password) {
      const strength = validatePasswordStrength(password)
      setPasswordStrength({
        score: strength.score,
        feedback: strength.errors
      })
    } else {
      setPasswordStrength({ score: 0, feedback: [] })
    }
  }



  const getPasswordStrengthText = () => {
    if (passwordStrength.score <= 1) return 'Sangat Lemah'
    if (passwordStrength.score <= 2) return 'Lemah'
    if (passwordStrength.score <= 3) return 'Sedang'
    if (passwordStrength.score <= 4) return 'Kuat'
    return 'Sangat Kuat'
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    // Clear previous errors
    setError('')
    setFieldErrors({})

    const formData = new FormData(e.currentTarget)
    
    startTransition(async () => {
      try {
        const result = await registerAction(formData)
        
        if (result.success) {
          toast.success('Registrasi berhasil! Periksa email Anda untuk verifikasi.')
          router.push('/login?message=registration-success')
        } else {
          if (result.fieldErrors) {
            setFieldErrors(result.fieldErrors)
          } else {
            setError(result.error || 'Registrasi gagal')
          }
        }
      } catch (error) {
        console.error('Registration error:', error)
        setError('Terjadi kesalahan yang tidak terduga')
      }
    })
  }

  return (
    <Card className={cn('w-full max-w-md mx-auto', className)}>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">
          Daftar Bergizi-ID
        </CardTitle>
        <CardDescription className="text-center">
          Buat akun baru untuk mengakses platform SPPG
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* General Error Alert */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Name Field */}
          <div className="space-y-2">
            <Label htmlFor="name">Nama Lengkap</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="Masukkan nama lengkap Anda"
                className={cn(
                  'pl-10',
                  fieldErrors.name && 'border-destructive focus-visible:ring-destructive'
                )}
                disabled={isPending}
                autoComplete="name"
                autoFocus
              />
            </div>
            {fieldErrors.name && (
              <p className="text-sm text-destructive">
                {fieldErrors.name[0]}
              </p>
            )}
          </div>

          {/* Email Field */}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="contoh@email.com"
                className={cn(
                  'pl-10',
                  fieldErrors.email && 'border-destructive focus-visible:ring-destructive'
                )}
                disabled={isPending}
                autoComplete="email"
              />
            </div>
            {fieldErrors.email && (
              <p className="text-sm text-destructive">
                {fieldErrors.email[0]}
              </p>
            )}
          </div>

          {/* Phone Field */}
          <div className="space-y-2">
            <Label htmlFor="phone">
              Nomor Telepon 
              <span className="text-muted-foreground text-xs ml-1">(opsional)</span>
            </Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                id="phone"
                name="phone"
                type="tel"
                placeholder="08123456789"
                className={cn(
                  'pl-10',
                  fieldErrors.phone && 'border-destructive focus-visible:ring-destructive'
                )}
                disabled={isPending}
                autoComplete="tel"
              />
            </div>
            {fieldErrors.phone && (
              <p className="text-sm text-destructive">
                {fieldErrors.phone[0]}
              </p>
            )}
          </div>

          {/* SPPG Code Field */}
          <div className="space-y-2">
            <Label htmlFor="sppgCode">
              Kode SPPG
              <span className="text-muted-foreground text-xs ml-1">(opsional)</span>
            </Label>
            <div className="relative">
              <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                id="sppgCode"
                name="sppgCode"
                type="text"
                placeholder="SPPG-JKT-001"
                className={cn(
                  'pl-10 uppercase',
                  fieldErrors.sppgCode && 'border-destructive focus-visible:ring-destructive'
                )}
                disabled={isPending}
                onChange={(e) => {
                  e.target.value = e.target.value.toUpperCase()
                }}
              />
            </div>
            {fieldErrors.sppgCode && (
              <p className="text-sm text-destructive">
                {fieldErrors.sppgCode[0]}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              Masukkan kode SPPG jika Anda sudah memiliki organisasi
            </p>
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Buat password yang kuat"
                className={cn(
                  'pl-10 pr-10',
                  fieldErrors.password && 'border-destructive focus-visible:ring-destructive'
                )}
                disabled={isPending}
                autoComplete="new-password"
                onChange={handlePasswordChange}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isPending}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
            
            {/* Password Strength Indicator */}
            {passwordStrength.score > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    Kekuatan Password:
                  </span>
                  <span className={cn(
                    'text-xs font-medium',
                    passwordStrength.score <= 2 && 'text-red-600',
                    passwordStrength.score === 3 && 'text-yellow-600',
                    passwordStrength.score >= 4 && 'text-green-600'
                  )}>
                    {getPasswordStrengthText()}
                  </span>
                </div>
                <Progress 
                  value={(passwordStrength.score / 5) * 100} 
                  className="h-1"
                />
                {passwordStrength.feedback.length > 0 && (
                  <ul className="text-xs text-muted-foreground space-y-1">
                    {passwordStrength.feedback.map((feedback, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-red-500 mr-1">•</span>
                        {feedback}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
            
            {fieldErrors.password && (
              <p className="text-sm text-destructive">
                {fieldErrors.password[0]}
              </p>
            )}
          </div>

          {/* Confirm Password Field */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Konfirmasi Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Ulangi password Anda"
                className={cn(
                  'pl-10 pr-10',
                  fieldErrors.confirmPassword && 'border-destructive focus-visible:ring-destructive'
                )}
                disabled={isPending}
                autoComplete="new-password"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={isPending}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
            {fieldErrors.confirmPassword && (
              <p className="text-sm text-destructive">
                {fieldErrors.confirmPassword[0]}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <Button 
            type="submit" 
            className="w-full" 
            size="lg" 
            disabled={isPending || passwordStrength.score < 3}
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Memproses...
              </>
            ) : (
              'Daftar Sekarang'
            )}
          </Button>

          {/* Terms Notice */}
          <p className="text-xs text-muted-foreground text-center">
            Dengan mendaftar, Anda menyetujui{' '}
            <Link href="/terms" className="text-primary hover:underline">
              Syarat & Ketentuan
            </Link>{' '}
            dan{' '}
            <Link href="/privacy" className="text-primary hover:underline">
              Kebijakan Privasi
            </Link>{' '}
            kami.
          </p>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                sudah punya akun?
              </span>
            </div>
          </div>

          {/* Login Link */}
          <div className="text-center">
            <Link 
              href="/login" 
              className="text-primary hover:underline font-medium"
            >
              Masuk ke akun Anda
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

export default RegisterForm