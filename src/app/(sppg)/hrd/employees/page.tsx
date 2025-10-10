// HRD Employees Page
// src/app/(sppg)/hrd/employees/page.tsx

import { Metadata } from 'next'
import { EmployeeList } from '@/components/sppg/hrd/components/EmployeeList'

export const metadata: Metadata = {
  title: 'Daftar Karyawan - HRD | Bergizi ID',
  description: 'Kelola data karyawan SPPG'
}

export default function EmployeesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          Daftar Karyawan
        </h1>
        <p className="text-muted-foreground">
          Kelola informasi dan data karyawan SPPG
        </p>
      </div>
      <EmployeeList />
    </div>
  )
}