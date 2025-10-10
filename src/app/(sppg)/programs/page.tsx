// Program Management Page - Pattern 2 Architecture
// Bergizi-ID SaaS Platform - SPPG Program Management
// src/app/(sppg)/programs/page.tsx

import { Suspense } from 'react'
import { Metadata } from 'next'
import { ProgramsPageClient } from './programs-client'
import { Card, CardContent } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Program Nutrisi | Bergizi-ID',
  description: 'Kelola program nutrisi SPPG Anda'
}

function ProgramsPageSkeleton() {
  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    </div>
  )
}

export default function ProgramsPage() {
  return (
    <Suspense fallback={<ProgramsPageSkeleton />}>
      <ProgramsPageClient />
    </Suspense>
  )
}
