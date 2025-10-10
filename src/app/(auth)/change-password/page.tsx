import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

import ChangePasswordForm from '@/components/auth/ChangePasswordForm'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { getCurrentSession } from '@/lib/auth-security'

export const metadata: Metadata = {
  title: 'Ubah Password - Bergizi-ID',
  description: 'Ubah password akun Bergizi-ID Anda untuk keamanan yang lebih baik.'
}

export default async function ChangePasswordPage() {
  const session = await getCurrentSession()
  const user = session?.user
  
  if (!user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background to-muted/20">
      {/* Header */}
      <header className="flex items-center justify-between p-4 lg:p-6">
        <Link 
          href="/settings"
          className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Kembali ke Pengaturan
        </Link>
        <ThemeToggle />
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <ChangePasswordForm />
        </div>
      </main>

      {/* Footer */}
      <footer className="p-4 lg:p-6">
        <div className="text-center text-xs text-muted-foreground">
          <p>&copy; 2024 Bergizi-ID. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}