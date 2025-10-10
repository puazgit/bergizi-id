import { DistributionStats, DistributionMap, DistributionList } from '@/components/sppg/distribution/components'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, DownloadCloud, MapPin, Truck } from 'lucide-react'
import Link from 'next/link'

export default function DistributionPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Distribusi</h1>
          <p className="text-muted-foreground">
            Kelola distribusi makanan ke sekolah penerima manfaat
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <MapPin className="h-4 w-4 mr-2" />
            Lihat Peta
          </Button>
          <Button variant="outline" size="sm">
            <DownloadCloud className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button asChild>
            <Link href="/distribution/create">
              <Plus className="h-4 w-4 mr-2" />
              Buat Distribusi
            </Link>
          </Button>
        </div>
      </div>

      {/* Distribution Statistics */}
      <DistributionStats />

      {/* Distribution Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <DistributionList />
        </div>
        <div className="lg:col-span-1">
          <DistributionMap />
        </div>
      </div>
    </div>
  )
}