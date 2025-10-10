// Procurement Plan Page - Following Enterprise Pattern
// Bergizi-ID SaaS Platform - SPPG Procurement Planning

import { Metadata } from 'next'
import { Card } from '@/components/ui/card'
import { PageHeader } from '@/components/ui/page-header'

export const metadata: Metadata = {
  title: 'Perencanaan Procurement - Bergizi ID',
  description: 'Manajemen perencanaan procurement SPPG'
}

export default function ProcurementPlanPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <PageHeader
        title="Perencanaan Procurement"
        description="Rencanakan kebutuhan procurement untuk program SPPG"
      />
      
      <div className="grid gap-6">
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Rencana Procurement</h2>
          <p className="text-muted-foreground">
            Fitur perencanaan procurement akan diimplementasikan sesuai dengan pattern copilot-instructions.
          </p>
        </Card>
      </div>
    </div>
  )
}