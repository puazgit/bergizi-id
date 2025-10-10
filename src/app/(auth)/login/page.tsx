import { Metadata } from 'next'
import { Suspense } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

import LoginForm from '@/components/auth/LoginForm'
import { Loader2 } from 'lucide-react'
import { ThemeToggle } from '@/components/ui/theme-toggle'

export const metadata: Metadata = {
  title: 'Masuk - Bergizi-ID',
  description: 'Masuk ke akun Bergizi-ID Anda untuk mengakses platform SPPG.'
}

interface LoginPageProps {
  searchParams: Promise<{
    callbackUrl?: string
    message?: string
  }>
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { callbackUrl, message } = await searchParams

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background to-muted/20">
      {/* Header */}
      <header className="flex items-center justify-between p-4 lg:p-6">
        <Link 
          href="/"
          className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Kembali ke Beranda
        </Link>
        <ThemeToggle />
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Success Message */}
          {message === 'registration-success' && (
            <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <p className="text-sm text-green-800 dark:text-green-200 text-center">
                Registrasi berhasil! Silakan masuk dengan akun Anda.
              </p>
            </div>
          )}

          {/* Login Form */}
          <Suspense fallback={
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          }>
            <LoginForm redirectTo={callbackUrl} />
          </Suspense>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-4 lg:p-6">
        <div className="text-center text-xs text-muted-foreground">
          <p>&copy; 2025 Bergizi-ID. All rights reserved.</p>
          <div className="mt-2 space-x-4">
            <Link href="/terms" className="hover:underline">
              Syarat & Ketentuan
            </Link>
            <Link href="/privacy" className="hover:underline">
              Kebijakan Privasi
            </Link>
            <Link href="/contact" className="hover:underline">
              Hubungi Kami
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}