'use client'

import React, { useState, useTransition } from 'react'
import { Eye, EyeOff, Loader2, Lock, Shield } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'

import { changePasswordAction } from '@/lib/auth-actions'
import { validatePasswordStrength } from '@/lib/auth-security'
import { cn } from '@/lib/utils'

interface ChangePasswordFormProps {
  className?: string
  onSuccess?: () => void
}

export function ChangePasswordForm({ className, onSuccess }: ChangePasswordFormProps) {
  const [isPending, startTransition] = useTransition()
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState<string>('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    feedback: [] as string[]
  })

  const handleNewPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
        const result = await changePasswordAction(formData)
        
        if (result.success) {
          toast.success('Password berhasil diubah!')
          // Clear form
          e.currentTarget.reset()
          setPasswordStrength({ score: 0, feedback: [] })
          onSuccess?.()
        } else {
          if (result.fieldErrors) {
            setFieldErrors(result.fieldErrors)
          } else {
            setError(result.error || 'Gagal mengubah password')
          }
        }
      } catch (error) {
        console.error('Change password error:', error)
        setError('Terjadi kesalahan yang tidak terduga')
      }
    })
  }

  return (
    <Card className={cn('w-full max-w-md mx-auto', className)}>
      <CardHeader className="space-y-1">
        <div className="flex items-center justify-center mb-2">
          <Shield className="h-8 w-8 text-primary" />
        </div>
        <CardTitle className="text-2xl font-bold text-center">
          Ubah Password
        </CardTitle>
        <CardDescription className="text-center">
          Perbarui password Anda untuk keamanan akun
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

          {/* Current Password Field */}
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Password Saat Ini</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                id="currentPassword"
                name="currentPassword"
                type={showCurrentPassword ? 'text' : 'password'}
                placeholder="Masukkan password saat ini"
                className={cn(
                  'pl-10 pr-10',
                  fieldErrors.currentPassword && 'border-destructive focus-visible:ring-destructive'
                )}
                disabled={isPending}
                autoComplete="current-password"
                autoFocus
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                disabled={isPending}
              >
                {showCurrentPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
            {fieldErrors.currentPassword && (
              <p className="text-sm text-destructive">
                {fieldErrors.currentPassword[0]}
              </p>
            )}
          </div>

          {/* New Password Field */}
          <div className="space-y-2">
            <Label htmlFor="newPassword">Password Baru</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                id="newPassword"
                name="newPassword"
                type={showNewPassword ? 'text' : 'password'}
                placeholder="Buat password baru yang kuat"
                className={cn(
                  'pl-10 pr-10',
                  fieldErrors.newPassword && 'border-destructive focus-visible:ring-destructive'
                )}
                disabled={isPending}
                autoComplete="new-password"
                onChange={handleNewPasswordChange}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowNewPassword(!showNewPassword)}
                disabled={isPending}
              >
                {showNewPassword ? (
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
            
            {fieldErrors.newPassword && (
              <p className="text-sm text-destructive">
                {fieldErrors.newPassword[0]}
              </p>
            )}
          </div>

          {/* Confirm New Password Field */}
          <div className="space-y-2">
            <Label htmlFor="confirmNewPassword">Konfirmasi Password Baru</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                id="confirmNewPassword"
                name="confirmNewPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Ulangi password baru Anda"
                className={cn(
                  'pl-10 pr-10',
                  fieldErrors.confirmNewPassword && 'border-destructive focus-visible:ring-destructive'
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
            {fieldErrors.confirmNewPassword && (
              <p className="text-sm text-destructive">
                {fieldErrors.confirmNewPassword[0]}
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
              'Ubah Password'
            )}
          </Button>

          {/* Security Tips */}
          <div className="mt-6 p-4 bg-muted/50 rounded-lg">
            <h4 className="text-sm font-semibold mb-2">Tips Keamanan</h4>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Gunakan kombinasi huruf besar, huruf kecil, angka, dan simbol</li>
              <li>• Minimal 8 karakter, disarankan 12+ karakter</li>
              <li>• Jangan gunakan informasi pribadi (nama, tanggal lahir)</li>
              <li>• Ubah password secara berkala (3-6 bulan)</li>
              <li>• Gunakan password yang unik untuk setiap akun</li>
            </ul>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

export default ChangePasswordForm