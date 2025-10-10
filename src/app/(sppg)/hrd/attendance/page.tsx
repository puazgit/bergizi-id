// HRD Attendance Page
// src/app/(sppg)/hrd/attendance/page.tsx

import { Metadata } from 'next'
import { AttendanceTracker } from '@/components/sppg/hrd/components/AttendanceTracker'

export const metadata: Metadata = {
  title: 'Kehadiran Karyawan - HRD | Bergizi ID',
  description: 'Pantau dan kelola kehadiran karyawan SPPG'
}

export default function AttendancePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          Kehadiran Karyawan
        </h1>
        <p className="text-muted-foreground">
          Pantau dan kelola kehadiran karyawan harian
        </p>
      </div>
      <AttendanceTracker />
    </div>
  )
}