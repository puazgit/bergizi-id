import { InventoryList, InventoryStats, InventoryFilters } from '@/components/sppg/inventory/components'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, DownloadCloud, Package, AlertTriangle } from 'lucide-react'
import Link from 'next/link'

export default function InventoryPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inventori</h1>
          <p className="text-muted-foreground">
            Kelola stok bahan makanan dan monitoring ketersediaan
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Stok Menipis
          </Button>
          <Button variant="outline" size="sm">
            <DownloadCloud className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button asChild>
            <Link href="/inventory/create">
              <Plus className="h-4 w-4 mr-2" />
              Tambah Item
            </Link>
          </Button>
        </div>
      </div>

      {/* Inventory Statistics */}
      <InventoryStats />

      {/* Inventory List Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <Input 
              placeholder="Cari item inventori..." 
              className="max-w-md"
            />
          </div>
          <InventoryFilters />
        </div>
        
        <InventoryList />
      </div>
    </div>
  )
}