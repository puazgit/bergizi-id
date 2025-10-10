'use client'

import React, { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Mail, Loader2, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'

import { forgotPasswordAction } from '@/lib/auth-actions'
import { cn } from '@/lib/utils'

interface ForgotPasswordFormProps {
  className?: string
}

export function ForgotPasswordForm({ className }: ForgotPasswordFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string>('')
  const [success, setSuccess] = useState<string>('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    // Clear previous messages
    setError('')
    setSuccess('')
    setFieldErrors({})

    const formData = new FormData(e.currentTarget)
    
    startTransition(async () => {
      try {
        const result = await forgotPasswordAction(formData)
        
        if (result.success) {
          const message = (result.data as { message?: string })?.message || 'Email reset password telah dikirim.'
          setSuccess(message)
          toast.success(message)
        } else {
          if (result.fieldErrors) {
            setFieldErrors(result.fieldErrors)
          } else {
            setError(result.error || 'Permintaan reset password gagal')
          }
        }
      } catch (error) {
        console.error('Forgot password error:', error)
        setError('Terjadi kesalahan yang tidak terduga')
      }
    })
  }

  // If success, show success state
  if (success) {
    return (
      <Card className={cn('w-full max-w-md mx-auto', className)}>
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
          <CardTitle className="text-2xl font-bold">
            Email Terkirim
          </CardTitle>
          <CardDescription>
            Instruksi reset password telah dikirim
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <Alert>
            <AlertDescription>
              {success}
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <p className="text-sm text-muted-foreground text-center">
              Periksa kotak masuk email Anda dan ikuti instruksi untuk mereset password. 
              Jika tidak menemukan email, periksa folder spam atau junk.
            </p>

            <div className="space-y-2">
              <Button 
                onClick={() => router.push('/login')} 
                className="w-full"
                size="lg"
              >
                Kembali ke Login
              </Button>
              
              <Button 
                variant="outline"
                onClick={() => {
                  setSuccess('')
                  setError('')
                }} 
                className="w-full"
                size="lg"
              >
                Kirim Ulang Email
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn('w-full max-w-md mx-auto', className)}>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">
          Lupa Password
        </CardTitle>
        <CardDescription className="text-center">
          Masukkan email Anda untuk menerima link reset password
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
                Mengirim...
              </>
            ) : (
              'Kirim Link Reset'
            )}
          </Button>

          {/* Info */}
          <div className="text-center text-sm text-muted-foreground">
            <p>
              Kami akan mengirim link reset password ke email Anda.
            </p>
          </div>

          {/* Back to Login */}
          <div className="text-center">
            <Link 
              href="/login" 
              className="inline-flex items-center text-sm text-primary hover:underline"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Kembali ke Login
            </Link>
          </div>
        </form>

        {/* Additional Help */}
        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <h4 className="text-sm font-semibold mb-2">Butuh bantuan?</h4>
          <p className="text-xs text-muted-foreground mb-2">
            Jika Anda masih mengalami kesulitan, silakan hubungi tim support kami.
          </p>
          <div className="space-y-2">
            <Button variant="outline" size="sm" className="w-full" asChild>
              <Link href="mailto:support@bergizi-id.com">
                Hubungi Support
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default ForgotPasswordForm