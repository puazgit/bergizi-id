'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { 
  Package, 
  AlertTriangle, 
  TrendingDown, 
  DollarSign,
  Clock,
  CheckCircle
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export function InventoryStats() {
  const stats = {
    totalItems: 142,
    lowStockItems: 8,
    expiringItems: 5,
    totalValue: 85000000,
    monthlyTurnover: 12.5,
    categories: [
      { name: 'Beras & Gandum', count: 25, value: 35000000 },
      { name: 'Protein', count: 38, value: 28000000 },
      { name: 'Sayuran', count: 42, value: 12000000 },
      { name: 'Bumbu', count: 37, value: 10000000 }
    ]
  }

  const lowStockPercentage = (stats.lowStockItems / stats.totalItems) * 100
  const healthyStockPercentage = 100 - lowStockPercentage

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Item</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalItems}</div>
          <p className="text-xs text-muted-foreground mb-2">
            Item dalam inventori
          </p>
          <div className="flex gap-1">
            {stats.categories.map((cat, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {cat.name}: {cat.count}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Stok Menipis</CardTitle>
          <AlertTriangle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${
            stats.lowStockItems > 10 ? 'text-red-600 dark:text-red-400' :
            stats.lowStockItems > 5 ? 'text-orange-600 dark:text-orange-400' :
            'text-green-600 dark:text-green-400'
          }`}>
            {stats.lowStockItems}
          </div>
          <p className="text-xs text-muted-foreground mb-2">
            Item perlu restock
          </p>
          <Progress value={lowStockPercentage} className="h-2" />
          <div className="flex items-center gap-1 text-xs mt-1">
            {stats.lowStockItems <= 5 ? (
              <CheckCircle className="h-3 w-3 text-green-500" />
            ) : (
              <AlertTriangle className="h-3 w-3 text-orange-500" />
            )}
            <span className={stats.lowStockItems <= 5 ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400'}>
              {healthyStockPercentage.toFixed(1)}% stok sehat
            </span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Segera Kadaluarsa</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${
            stats.expiringItems > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'
          }`}>
            {stats.expiringItems}
          </div>
          <p className="text-xs text-muted-foreground mb-2">
            Item dalam 7 hari
          </p>
          <div className="flex items-center gap-1 text-xs">
            {stats.expiringItems > 0 ? (
              <>
                <TrendingDown className="h-3 w-3 text-red-500" />
                <span className="text-red-600 dark:text-red-400">Perlu perhatian</span>
              </>
            ) : (
              <>
                <CheckCircle className="h-3 w-3 text-green-500" />
                <span className="text-green-600 dark:text-green-400">Semua aman</span>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Nilai Inventori</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            Rp {(stats.totalValue / 1000000).toFixed(1)}M
          </div>
          <p className="text-xs text-muted-foreground mb-2">
            Total nilai stok
          </p>
          <div className="text-xs text-muted-foreground">
            Turnover: {stats.monthlyTurnover}x/bulan
          </div>
          <Progress value={(stats.monthlyTurnover / 20) * 100} className="h-1 mt-1" />
        </CardContent>
      </Card>
    </div>
  )
}