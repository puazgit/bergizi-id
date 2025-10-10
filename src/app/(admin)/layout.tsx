import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { AdminLayout } from '@/components/admin/layouts/AdminLayout'
import { SessionProvider } from 'next-auth/react'

export default async function AdminRootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  // Redirect if not authenticated
  if (!session) {
    redirect('/login')
  }

  // Check if user has admin access
  const isAdmin = 
    session.user.userRole === 'PLATFORM_SUPERADMIN' ||
    session.user.userRole === 'PLATFORM_SUPPORT' ||
    session.user.userRole === 'PLATFORM_ANALYST'
  
  if (!isAdmin) {
    redirect('/access-denied')
  }

  return (
    <SessionProvider session={session}>
      <AdminLayout>
        {children}
      </AdminLayout>
    </SessionProvider>
  )
}