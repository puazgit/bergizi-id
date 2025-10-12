// Global Error Page
// src/app/error.tsx

'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to error reporting service
    console.error('Application error:', error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/30 to-background">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="text-center">
          <div className="text-6xl font-bold text-destructive mb-4">⚠️</div>
          <CardTitle className="text-2xl">Terjadi Kesalahan</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">
            Maaf, terjadi kesalahan yang tidak terduga. Silakan coba lagi.
          </p>
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <Button onClick={reset}>
              Coba Lagi
            </Button>
            <Button variant="outline" onClick={() => window.location.href = '/'}>
              Kembali ke Beranda
            </Button>
          </div>
          {process.env.NODE_ENV === 'development' && (
            <details className="text-left mt-4">
              <summary className="cursor-pointer text-sm text-muted-foreground">
                Detail Error (Development)
              </summary>
              <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-auto">
                {error.message}
              </pre>
            </details>
          )}
        </CardContent>
      </Card>
    </div>
  )
}