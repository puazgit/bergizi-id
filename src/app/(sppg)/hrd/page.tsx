// HRD Dashboard Page
// src/app/(sppg)/hrd/page.tsx

import { Metadata } from 'next'
import { HRDDashboard } from '@/components/sppg/hrd/components/HRDDashboard'

export const metadata: Metadata = {
  title: 'Dashboard HRD - Bergizi ID',
  description: 'Manajemen SDM dan karyawan SPPG'
}

export default function HRDPage() {
  return <HRDDashboard />
}