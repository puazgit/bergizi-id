// HRD Training Page
// src/app/(sppg)/hrd/training/page.tsx

import { Metadata } from 'next'
import { TrainingManagement } from '@/components/sppg/hrd/components/TrainingManagement'

export const metadata: Metadata = {
  title: 'Manajemen Pelatihan - HRD | Bergizi ID',
  description: 'Kelola program pelatihan dan pengembangan karyawan'
}

export default function TrainingPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          Manajemen Pelatihan
        </h1>
        <p className="text-muted-foreground">
          Kelola program pelatihan dan pengembangan karyawan
        </p>
      </div>
      <TrainingManagement />
    </div>
  )
}