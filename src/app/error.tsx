// Global Error Page
// src/app/error.tsx

'use client'

import { useEffect } from 'react'

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
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)' }}>
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg border p-6">
        <div className="text-center">
          <div className="text-6xl font-bold text-red-500 mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Terjadi Kesalahan</h1>
          <p className="text-gray-600 mb-6">
            Maaf, terjadi kesalahan yang tidak terduga. Silakan coba lagi.
          </p>
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <button 
              onClick={reset}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Coba Lagi
            </button>
            <button 
              onClick={() => window.location.href = '/'}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              Kembali ke Beranda
            </button>
          </div>
          {process.env.NODE_ENV === 'development' && (
            <details className="text-left mt-4 p-3 bg-gray-100 rounded">
              <summary className="cursor-pointer text-sm text-gray-600 font-medium">
                Detail Error (Development)
              </summary>
              <pre className="mt-2 text-xs text-gray-800 overflow-auto whitespace-pre-wrap">
                {error.message}
                {error.stack && '\n\nStack trace:\n' + error.stack}
              </pre>
            </details>
          )}
        </div>
      </div>
    </div>
  )
}