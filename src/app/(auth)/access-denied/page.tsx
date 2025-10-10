import { Metadata } from 'next'
import Link from 'next/link'
import { AlertTriangle, Home, ArrowLeft } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export const metadata: Metadata = {
  title: 'Akses Ditolak - Bergizi-ID',
  description: 'Anda tidak memiliki akses untuk mengakses halaman ini.'
}

export default function AccessDeniedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background to-muted/20">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <AlertTriangle className="h-12 w-12 text-yellow-600" />
          </div>
          <CardTitle className="text-2xl font-bold">
            Akses Ditolak
          </CardTitle>
          <CardDescription>
            Anda tidak memiliki izin untuk mengakses halaman ini
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="text-center text-sm text-muted-foreground">
            <p>
              Halaman yang Anda coba akses memerlukan izin khusus atau 
              Anda belum terdaftar dalam organisasi SPPG yang valid.
            </p>
          </div>

          <div className="space-y-2">
            <Button asChild className="w-full">
              <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                Kembali ke Beranda
              </Link>
            </Button>
            
            <Button variant="outline" asChild className="w-full">
              <Link href="/login">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Login dengan Akun Lain
              </Link>
            </Button>
          </div>

          {/* Help Section */}
          <div className="mt-6 p-4 bg-muted/50 rounded-lg">
            <h4 className="text-sm font-semibold mb-2">Butuh bantuan?</h4>
            <p className="text-xs text-muted-foreground mb-2">
              Jika Anda yakin seharusnya memiliki akses, hubungi administrator SPPG Anda 
              atau tim support kami.
            </p>
            <Button variant="outline" size="sm" className="w-full" asChild>
              <Link href="mailto:support@bergizi-id.com">
                Hubungi Support
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}