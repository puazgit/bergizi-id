// HRD Performance Page
// src/app/(sppg)/hrd/performance/page.tsx

import { Metadata } from 'next'
import { PerformanceReview } from '@/components/sppg/hrd/components/PerformanceReview'

export const metadata: Metadata = {
  title: 'Evaluasi Kinerja - HRD | Bergizi ID',
  description: 'Kelola evaluasi dan penilaian kinerja karyawan'
}

export default function PerformancePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          Evaluasi Kinerja
        </h1>
        <p className="text-muted-foreground">
          Kelola evaluasi dan penilaian kinerja karyawan
        </p>
      </div>
      <PerformanceReview />
    </div>
  )
}