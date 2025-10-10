// Procurement Orders Page - Following Enterprise Pattern
// Bergizi-ID SaaS Platform - SPPG Procurement Orders

import { Metadata } from 'next'
import { Card } from '@/components/ui/card'
import { PageHeader } from '@/components/ui/page-header'

export const metadata: Metadata = {
  title: 'Order Procurement - Bergizi ID',
  description: 'Manajemen order procurement SPPG'
}

export default function ProcurementOrdersPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <PageHeader
        title="Order Procurement"
        description="Kelola order dan pemesanan untuk program SPPG"
      />
      
      <div className="grid gap-6">
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Daftar Order</h2>
          <p className="text-muted-foreground">
            Fitur manajemen order procurement akan diimplementasikan sesuai dengan pattern copilot-instructions.
          </p>
        </Card>
      </div>
    </div>
  )
}