import { Metadata } from 'next'
import { Suspense } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

import RegisterForm from '@/components/auth/RegisterForm'
import { Loader2 } from 'lucide-react'
import { ThemeToggle } from '@/components/ui/theme-toggle'

export const metadata: Metadata = {
  title: 'Daftar - Bergizi-ID',
  description: 'Buat akun baru untuk mengakses platform SPPG Bergizi-ID.'
}

export default function RegisterPage() {
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
          {/* Register Form */}
          <Suspense fallback={
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          }>
            <RegisterForm />
          </Suspense>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-4 lg:p-6">
        <div className="text-center text-xs text-muted-foreground">
          <p>&copy; 2024 Bergizi-ID. All rights reserved.</p>
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