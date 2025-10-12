// Custom 404 Not Found Page
// src/app/not-found.tsx

import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)' }}>
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg border p-6">
        <div className="text-center">
          <div className="text-6xl font-bold text-gray-500 mb-4">404</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Halaman Tidak Ditemukan</h1>
          <p className="text-gray-600 mb-6">
            Maaf, halaman yang Anda cari tidak dapat ditemukan.
          </p>
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <Link 
              href="/"
              className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Kembali ke Beranda
            </Link>
            <Link 
              href="/dashboard"
              className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              Ke Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}