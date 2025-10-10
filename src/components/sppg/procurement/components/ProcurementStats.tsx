// ProcurementStats Component - Simple procurement dashboard stats
// Bergizi-ID SaaS Platform

'use client'

import { Card } from '@/components/ui/card'
import { 
  Package,
  DollarSign,
  Calendar,
  TrendingUp
} from 'lucide-react'

export function ProcurementStats() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
      <Card className="p-6">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-lg bg-primary/10">
            <Package className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Procurement</p>
            <p className="text-2xl font-bold">24</p>
            <p className="text-xs text-green-600 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              +12% dari bulan lalu
            </p>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/20">
            <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Nilai</p>
            <p className="text-2xl font-bold">Rp 450.000.000</p>
            <p className="text-xs text-green-600 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              +8% dari bulan lalu
            </p>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/20">
            <Calendar className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Bulan Ini</p>
            <p className="text-2xl font-bold">8</p>
            <p className="text-xs text-blue-600">
              3 pending, 5 completed
            </p>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-lg bg-orange-100 dark:bg-orange-900/20">
            <Package className="h-6 w-6 text-orange-600 dark:text-orange-400" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Rata-rata Nilai</p>
            <p className="text-2xl font-bold">Rp 18.750.000</p>
            <p className="text-xs text-muted-foreground">
              per procurement
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}