import { ProcurementStats, ProcurementList, ProcurementFilters } from '@/components/sppg/procurement/components'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, DownloadCloud, CalendarDays } from 'lucide-react'
import Link from 'next/link'

export default function ProcurementPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pengadaan</h1>
          <p className="text-muted-foreground">
            Kelola pengadaan bahan makanan dan inventori SPPG
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/procurement/plan">
              <CalendarDays className="h-4 w-4 mr-2" />
              Rencana Pengadaan
            </Link>
          </Button>
          <Button variant="outline" size="sm">
            <DownloadCloud className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button asChild>
            <Link href="/procurement/orders">
              <Plus className="h-4 w-4 mr-2" />
              Buat Pesanan
            </Link>
          </Button>
        </div>
      </div>

      {/* Procurement Statistics */}
      <ProcurementStats />

      {/* Procurement List Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <Input 
              placeholder="Cari pengadaan, supplier, atau item..." 
              className="max-w-md"
            />
          </div>
          <ProcurementFilters />
        </div>
        
        <ProcurementList procurements={[]} />
      </div>
    </div>
  )
}