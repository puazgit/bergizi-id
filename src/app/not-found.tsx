// Custom 404 Not Found Page
// src/app/not-found.tsx

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/30 to-background">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="text-center">
          <div className="text-6xl font-bold text-muted-foreground mb-4">404</div>
          <CardTitle className="text-2xl">Halaman Tidak Ditemukan</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">
            Maaf, halaman yang Anda cari tidak dapat ditemukan.
          </p>
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <Button asChild>
              <Link href="/">
                Kembali ke Beranda
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/dashboard">
                Ke Dashboard
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}