import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { SppgLayout } from '@/components/sppg/layouts/ModularSppgLayout'
import { SessionProvider } from 'next-auth/react'

export default async function SppgRootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  let session = await auth()

  // Mock session for development
  if (!session && process.env.NODE_ENV === 'development') {
    session = {
      user: {
        id: 'dev-user-1',
        name: 'Demo User',
        email: 'demo@bergizi.id',
        userRole: 'SPPG_ADMIN' as const,
        userType: 'SPPG_USER' as const,
        sppgId: 'demo-sppg-1',
        sppgName: 'Demo SPPG Jakarta',
        sppgCode: 'DEMO-001',
        isDemoAccount: true,
        image: null
      },
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    }
  }

  // Redirect if not authenticated
  if (!session) {
    redirect('/login')
  }

  // Check if user has SPPG access
  if (!session.user.sppgId || !session.user.userRole.startsWith('SPPG_')) {
    redirect('/access-denied')
  }

  return (
    <SessionProvider session={session}>
      <SppgLayout>
        {children}
      </SppgLayout>
    </SessionProvider>
  )
}