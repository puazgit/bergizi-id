'use client'

import React, { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, Loader2, Mail, Lock } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription } from '@/components/ui/alert'

import { loginAction } from '@/lib/auth-actions'
import { cn } from '@/lib/utils'

interface LoginFormProps {
  className?: string
  redirectTo?: string
}

export function LoginForm({ className, redirectTo }: LoginFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string>('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    // Clear previous errors
    setError('')
    setFieldErrors({})

    const formData = new FormData(e.currentTarget)
    
    startTransition(async () => {
      try {
        const result = await loginAction(formData)
        
        if (result.success) {
          toast.success('Login berhasil! Mengalihkan...')
          
          // Redirect to specified URL or dashboard
          const redirectUrl = redirectTo || (result.data as { redirectUrl?: string })?.redirectUrl || '/dashboard'
          router.push(redirectUrl)
        } else {
          if (result.fieldErrors) {
            setFieldErrors(result.fieldErrors)
          } else {
            setError(result.error || 'Login gagal')
          }
        }
      } catch (error) {
        console.error('Login error:', error)
        setError('Terjadi kesalahan yang tidak terduga')
      }
    })
  }

  return (
    <Card className={cn('w-full max-w-md mx-auto', className)}>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">
          Masuk ke Bergizi-ID
        </CardTitle>
        <CardDescription className="text-center">
          Masukkan email dan password Anda untuk melanjutkan
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
                autoFocus
              />
            </div>
            {fieldErrors.email && (
              <p className="text-sm text-destructive">
                {fieldErrors.email[0]}
              </p>
            )}
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
                placeholder="Masukkan password Anda"
                className={cn(
                  'pl-10 pr-10',
                  fieldErrors.password && 'border-destructive focus-visible:ring-destructive'
                )}
                disabled={isPending}
                autoComplete="current-password"
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
            {fieldErrors.password && (
              <p className="text-sm text-destructive">
                {fieldErrors.password[0]}
              </p>
            )}
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="rememberMe" 
                name="rememberMe" 
                disabled={isPending}
              />
              <Label 
                htmlFor="rememberMe" 
                className="text-sm font-normal cursor-pointer"
              >
                Ingat saya
              </Label>
            </div>
            
            <Link 
              href="/forgot-password" 
              className="text-sm text-primary hover:underline"
            >
              Lupa password?
            </Link>
          </div>

          {/* Submit Button */}
          <Button 
            type="submit" 
            className="w-full" 
            size="lg" 
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Memproses...
              </>
            ) : (
              'Masuk'
            )}
          </Button>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                atau
              </span>
            </div>
          </div>

          {/* Register Link */}
          <div className="text-center">
            <span className="text-sm text-muted-foreground">
              Belum punya akun?{' '}
              <Link 
                href="/register" 
                className="text-primary hover:underline font-medium"
              >
                Daftar sekarang
              </Link>
            </span>
          </div>
        </form>

        {/* Demo Access Info */}
        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <h4 className="text-sm font-semibold mb-2">Akses Demo</h4>
          <p className="text-xs text-muted-foreground mb-2">
            Ingin mencoba fitur platform? 
          </p>
          <Link href="/demo-request">
            <Button variant="outline" size="sm" className="w-full">
              Minta Akses Demo
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}

export default LoginForm