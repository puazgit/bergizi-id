import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { 
  User, 
  Mail, 
  Phone, 
  Building2, 
  Briefcase, 
  MapPin, 
  Calendar,
  Shield,
  Clock
} from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { getCurrentSession } from '@/lib/auth-security'
import db from '@/lib/db'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Profil Saya - Bergizi-ID',
  description: 'Lihat dan kelola informasi profil Anda.'
}

export default async function ProfilePage() {
  const session = await getCurrentSession()
  const sessionUser = session?.user
  
  if (!sessionUser) {
    redirect('/login')
  }

  // Fetch complete user data for profile display
  const user = await db.user.findUnique({
    where: { id: sessionUser.id },
    include: {
      sppg: {
        select: {
          name: true,
          code: true,
          isDemoAccount: true
        }
      }
    }
  })

  if (!user) {
    redirect('/login')
  }

  const getRoleDisplayName = (role: string) => {
    const roleMap: Record<string, string> = {
      'PLATFORM_SUPERADMIN': 'Super Admin',
      'PLATFORM_SUPPORT': 'Platform Support', 
      'PLATFORM_ANALYST': 'Platform Analyst',
      'SPPG_KEPALA': 'Kepala SPPG',
      'SPPG_ADMIN': 'Admin SPPG',
      'SPPG_AHLI_GIZI': 'Ahli Gizi',
      'SPPG_AKUNTAN': 'Akuntan',
      'SPPG_PRODUKSI_MANAGER': 'Manager Produksi',
      'SPPG_DISTRIBUSI_MANAGER': 'Manager Distribusi',
      'SPPG_HRD_MANAGER': 'Manager HRD',
      'SPPG_STAFF_DAPUR': 'Staff Dapur',
      'SPPG_STAFF_DISTRIBUSI': 'Staff Distribusi',
      'SPPG_STAFF_ADMIN': 'Staff Admin',
      'SPPG_STAFF_QC': 'Staff QC',
      'SPPG_VIEWER': 'Viewer',
      'DEMO_USER': 'Demo User'
    }
    return roleMap[role] || role
  }

  const getRoleBadgeVariant = (role: string) => {
    if (role.startsWith('PLATFORM_')) return 'default'
    if (role === 'SPPG_KEPALA' || role === 'SPPG_ADMIN') return 'secondary'
    if (role.includes('MANAGER')) return 'outline'
    if (role === 'DEMO_USER') return 'destructive'
    return 'secondary'
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Profil Saya</h1>
          <p className="text-muted-foreground">
            Kelola informasi profil dan pengaturan akun Anda
          </p>
        </div>
        <Button asChild>
          <Link href="/settings">
            Edit Profil
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>Informasi Personal</span>
            </CardTitle>
            <CardDescription>
              Detail informasi pribadi Anda
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-3">
              <User className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="text-sm font-medium">Nama Lengkap</div>
                <div className="text-sm text-muted-foreground">{user.name}</div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="text-sm font-medium">Email</div>
                <div className="text-sm text-muted-foreground">{user.email}</div>
              </div>
            </div>

            {user.phone && (
              <div className="flex items-center space-x-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-sm font-medium">Telepon</div>
                  <div className="text-sm text-muted-foreground">{user.phone}</div>
                </div>
              </div>
            )}

            {user.location && (
              <div className="flex items-center space-x-3">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-sm font-medium">Lokasi</div>
                  <div className="text-sm text-muted-foreground">{user.location}</div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Role & Organization */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <span>Role & Organisasi</span>
            </CardTitle>
            <CardDescription>
              Informasi peran dan organisasi Anda
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-3">
              <Shield className="h-4 w-4 text-muted-foreground" />
              <div className="flex-1">
                <div className="text-sm font-medium">Role</div>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge variant={getRoleBadgeVariant(user.userRole || 'SPPG_VIEWER')}>
                    {getRoleDisplayName(user.userRole || 'SPPG_VIEWER')}
                  </Badge>
                  {user.sppg?.isDemoAccount && (
                    <Badge variant="destructive">Demo</Badge>
                  )}
                </div>
              </div>
            </div>

            {user.sppg?.name && (
              <div className="flex items-center space-x-3">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-sm font-medium">SPPG</div>
                  <div className="text-sm text-muted-foreground">{user.sppg.name}</div>
                  {user.sppg.code && (
                    <div className="text-xs text-muted-foreground">{user.sppg.code}</div>
                  )}
                </div>
              </div>
            )}

            {user.jobTitle && (
              <div className="flex items-center space-x-3">
                <Briefcase className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-sm font-medium">Jabatan</div>
                  <div className="text-sm text-muted-foreground">{user.jobTitle}</div>
                </div>
              </div>
            )}

            {user.department && (
              <div className="flex items-center space-x-3">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-sm font-medium">Departemen</div>
                  <div className="text-sm text-muted-foreground">{user.department}</div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Account Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>Informasi Akun</span>
            </CardTitle>
            <CardDescription>
              Detail aktivitas dan status akun
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {user.lastLogin && (
              <div className="flex items-center space-x-3">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-sm font-medium">Login Terakhir</div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(user.lastLogin).toLocaleString('id-ID')}
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center space-x-3">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="text-sm font-medium">Member Sejak</div>
                <div className="text-sm text-muted-foreground">
                  {new Date(user.createdAt).toLocaleDateString('id-ID', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Shield className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="text-sm font-medium">Status Akun</div>
                <Badge variant={user.isActive ? 'default' : 'secondary'}>
                  {user.isActive ? 'Aktif' : 'Nonaktif'}
                </Badge>
              </div>
            </div>

            {user.emailVerified && (
              <div className="flex items-center space-x-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-sm font-medium">Email Terverifikasi</div>
                  <Badge variant="default">Verified</Badge>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Demo Account Info */}
        {user.sppg?.isDemoAccount && (
          <Card className="border-orange-200 dark:border-orange-800">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-orange-600">
                <Clock className="h-5 w-5" />
                <span>Demo Account</span>
              </CardTitle>
              <CardDescription>
                Informasi akun demo Anda
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {user.demoExpiresAt && (
                <div className="flex items-center space-x-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-sm font-medium">Demo Berakhir</div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(user.demoExpiresAt).toLocaleString('id-ID')}
                    </div>
                  </div>
                </div>
              )}
              
              <Separator />
              
              <div className="text-center">
                <Button asChild>
                  <Link href="/upgrade">
                    Upgrade ke Akun Penuh
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Aksi Cepat</CardTitle>
          <CardDescription>
            Pengaturan dan tindakan yang sering digunakan
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" asChild>
              <Link href="/change-password">
                Ubah Password
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/settings">
                Edit Profil
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/settings/notifications">
                Pengaturan Notifikasi
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/settings/privacy">
                Pengaturan Privasi
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}