'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Calendar, Clock, ChefHat } from 'lucide-react'

interface ProductionScheduleProps {
  showRealTimeIndicator?: boolean
}

export function ProductionSchedule({ 
  showRealTimeIndicator = true 
}: ProductionScheduleProps) {
  const [selectedView, setSelectedView] = useState<'today' | 'week' | 'month'>('today')

  // Mock data sesuai dengan seed yang sudah dibuat
  const mockProductions = [
    {
      id: '1',
      menuName: 'Nasi Ayam Soto',
      mealType: 'MAKAN_SIANG',
      programName: 'Program Gizi Balita',
      status: 'PLANNED',
      quantityPlanned: 150,
      productionTime: '11:00',
      batchNumber: 'PWK-20251008-001',
      assignedChef: 'Bu Sari'
    },
    {
      id: '2',
      menuName: 'Bubur Ayam',
      mealType: 'SARAPAN', 
      programName: 'Program Makanan Sekolah',
      status: 'COOKING',
      quantityPlanned: 200,
      productionTime: '07:00',
      batchNumber: 'PWK-20251008-002',
      assignedChef: 'Bu Lisa'
    },
    {
      id: '3',
      menuName: 'Nasi Gudeg',
      mealType: 'MAKAN_SIANG',
      programName: 'Program Gizi Ibu Hamil',
      status: 'COMPLETED',
      quantityPlanned: 100,
      productionTime: '11:30',
      batchNumber: 'PWK-20251008-003',
      assignedChef: 'Bu Nina'
    }
  ]

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Jadwal Produksi
            {showRealTimeIndicator && (
              <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-1"></div>
                Live
              </Badge>
            )}
          </CardTitle>
          
          <Tabs value={selectedView} onValueChange={(value) => setSelectedView(value as 'today' | 'week' | 'month')}>
            <TabsList>
              <TabsTrigger value="today">Hari Ini</TabsTrigger>
              <TabsTrigger value="week">Minggu Ini</TabsTrigger>
              <TabsTrigger value="month">Bulan Ini</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {mockProductions.map((production) => (
            <div key={production.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{production.menuName}</h3>
                  <Badge variant="outline" className="text-xs">
                    {production.mealType}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {production.programName}
                </p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {production.productionTime}
                  </span>
                  <span className="flex items-center gap-1">
                    <ChefHat className="h-3 w-3" />
                    {production.assignedChef}
                  </span>
                  <span>{production.quantityPlanned} porsi</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Batch: {production.batchNumber}
                </p>
              </div>
              
              <div className="flex flex-col items-end gap-2">
                <Badge variant={
                  production.status === 'COMPLETED' ? 'default' :
                  production.status === 'COOKING' ? 'secondary' :
                  production.status === 'PLANNED' ? 'outline' :
                  'secondary'
                }>
                  {production.status}
                </Badge>
                
                {production.status !== 'COMPLETED' && (
                  <Button size="sm" variant="outline">
                    Update Status
                  </Button>
                )}
              </div>
            </div>
          ))}
          
          <div className="text-center text-sm text-muted-foreground py-4">
            Menampilkan {mockProductions.length} dari 126 total jadwal produksi
          </div>
        </div>
      </CardContent>
    </Card>
  )
}