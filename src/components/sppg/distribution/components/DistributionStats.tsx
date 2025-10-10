'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { 
  Truck, 
  MapPin, 
  Clock, 
  CheckCircle,
  TrendingUp,
  AlertCircle
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export function DistributionStats() {
  const stats = {
    todayDeliveries: 12,
    totalDeliveries: 18,
    onTimeDeliveries: 95.5,
    totalDistance: 245,
    vehiclesActive: 6,
    vehiclesTotal: 8,
    beneficiariesServed: 2850,
    averageDeliveryTime: 32
  }

  const deliveryPercentage = (stats.todayDeliveries / stats.totalDeliveries) * 100
  const vehicleUtilization = (stats.vehiclesActive / stats.vehiclesTotal) * 100

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pengiriman Hari Ini</CardTitle>
          <Truck className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.todayDeliveries}/{stats.totalDeliveries}</div>
          <p className="text-xs text-muted-foreground mb-2">
            Selesai dari total jadwal
          </p>
          <Progress value={deliveryPercentage} className="h-2" />
          <p className="text-xs mt-1 text-muted-foreground">
            {deliveryPercentage.toFixed(1)}% selesai
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Ketepatan Waktu</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {stats.onTimeDeliveries}%
          </div>
          <p className="text-xs text-muted-foreground mb-2">
            Pengiriman tepat waktu
          </p>
          <div className="flex items-center gap-1 text-xs">
            <CheckCircle className="h-3 w-3 text-green-500" />
            <span className="text-green-600 dark:text-green-400">Sangat Baik</span>
          </div>
          <p className="text-xs mt-1 text-muted-foreground">
            Rata-rata: {stats.averageDeliveryTime} menit
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Kendaraan Aktif</CardTitle>
          <MapPin className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.vehiclesActive}/{stats.vehiclesTotal}</div>
          <p className="text-xs text-muted-foreground mb-2">
            Kendaraan dalam operasi
          </p>
          <Progress value={vehicleUtilization} className="h-2" />
          <div className="flex items-center gap-1 text-xs mt-1">
            <TrendingUp className="h-3 w-3 text-blue-500" />
            <span className="text-blue-600 dark:text-blue-400">
              {vehicleUtilization.toFixed(0)}% utilisasi
            </span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Penerima Manfaat</CardTitle>
          <AlertCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.beneficiariesServed.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground mb-2">
            Anak terlayani hari ini
          </p>
          <div className="flex gap-1">
            <Badge variant="secondary" className="text-xs">
              Jarak: {stats.totalDistance} km
            </Badge>
          </div>
          <div className="flex items-center gap-1 text-xs mt-2">
            <CheckCircle className="h-3 w-3 text-green-500" />
            <span className="text-green-600 dark:text-green-400">100% terjangkau</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}