'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  MapPin, 
  Navigation, 
  Truck,
  Maximize2,
  RefreshCw
} from 'lucide-react'

export function DistributionMap() {
  // Mock data untuk titik-titik distribusi
  const distributionPoints = [
    { id: '1', name: 'SD Negeri 01', status: 'delivered', lat: -6.1944, lng: 106.8229 },
    { id: '2', name: 'SD Negeri 02', status: 'on_route', lat: -6.1867, lng: 106.8283 },
    { id: '3', name: 'SD Negeri 03', status: 'scheduled', lat: -6.1789, lng: 106.8312 },
    { id: '4', name: 'TK Melati', status: 'delayed', lat: -6.1912, lng: 106.8185 }
  ]

  const activeVehicles = [
    { id: '1', plate: 'B 1234 CD', driver: 'Pak Andi', lat: -6.1944, lng: 106.8229 },
    { id: '2', plate: 'B 5678 EF', driver: 'Bu Sari', lat: -6.1850, lng: 106.8270 },
    { id: '3', plate: 'B 9012 GH', driver: 'Pak Budi', lat: -6.1823, lng: 106.8198 }
  ]

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Peta Distribusi
          </CardTitle>
          <div className="flex gap-1">
            <Button variant="outline" size="sm">
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm">
              <Maximize2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Map Placeholder */}
        <div className="relative w-full h-64 bg-muted rounded-lg mb-4 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20">
            {/* Map Grid Lines */}
            <div className="absolute inset-0">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={`h-${i}`} 
                  className="absolute w-full h-px bg-muted-foreground/10" 
                  style={{ top: `${i * 10}%` }}
                />
              ))}
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={`v-${i}`} 
                  className="absolute h-full w-px bg-muted-foreground/10" 
                  style={{ left: `${i * 10}%` }}
                />
              ))}
            </div>
            
            {/* Distribution Points */}
            {distributionPoints.map((point, index) => (
              <div
                key={point.id}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"
                style={{ 
                  left: `${20 + index * 20}%`, 
                  top: `${30 + (index % 2) * 30}%` 
                }}
              >
                <div className={`w-4 h-4 rounded-full border-2 border-white shadow-lg ${
                  point.status === 'delivered' ? 'bg-green-500' :
                  point.status === 'on_route' ? 'bg-blue-500' :
                  point.status === 'delayed' ? 'bg-red-500' :
                  'bg-gray-400'
                }`}>
                  <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                    <div className="text-xs bg-white dark:bg-gray-800 px-1 py-0.5 rounded shadow text-center">
                      {point.name}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Active Vehicles */}
            {activeVehicles.map((vehicle, index) => (
              <div
                key={vehicle.id}
                className="absolute transform -translate-x-1/2 -translate-y-1/2"
                style={{ 
                  left: `${25 + index * 15}%`, 
                  top: `${45 + (index % 2) * 20}%` 
                }}
              >
                <div className="w-5 h-5 bg-blue-600 rounded-full border-2 border-white shadow-lg flex items-center justify-center animate-pulse">
                  <Truck className="h-3 w-3 text-white" />
                </div>
              </div>
            ))}
          </div>
          
          {/* Map Controls */}
          <div className="absolute top-2 right-2 flex flex-col gap-1">
            <Button variant="secondary" size="sm">
              <Navigation className="h-3 w-3" />
            </Button>
          </div>
        </div>
        
        {/* Map Legend */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Status Distribusi:</h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span>Terkirim</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span>Dalam Perjalanan</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gray-400"></div>
              <span>Terjadwal</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span>Terlambat</span>
            </div>
          </div>
          
          <div className="pt-2 border-t">
            <h4 className="text-sm font-medium mb-2">Kendaraan Aktif:</h4>
            <div className="space-y-1">
              {activeVehicles.map((vehicle) => (
                <div key={vehicle.id} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Truck className="h-3 w-3 text-blue-600" />
                    <span>{vehicle.plate}</span>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {vehicle.driver}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}