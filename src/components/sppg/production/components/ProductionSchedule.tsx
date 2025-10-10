// Production Schedule Component - Real-time Production Scheduling with Server Actions
// Pattern 2 Component-Level Implementation
// src/components/sppg/production/components/ProductionSchedule.tsx

'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'
import { 
  Calendar,
  Clock,
  ChefHat,
  Users,
  AlertCircle,
  CheckCircle2,
  PlayCircle,
  Pause
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { updateProductionStatus, deleteProduction } from '@/actions/sppg/production'
import { ProductionStatus } from '@prisma/client'

interface ProductionWithDetails {
  id: string
  status: string
  scheduledDate: Date
  scheduledStartTime: Date
  scheduledEndTime: Date
  totalQuantity: number
  actualQuantity?: number
  assignedChef: string
  notes?: string
  menu: {
    menuName: string
    menuCode: string
    mealType: string
    servingSize: number
  }
  program: {
    name: string
  }
}

interface ProductionScheduleProps {
  showRealTimeIndicator?: boolean
  productions?: ProductionWithDetails[]
}

export function ProductionSchedule({ 
  showRealTimeIndicator = true,
  productions = []
}: ProductionScheduleProps) {
  const [selectedView, setSelectedView] = useState<'today' | 'week' | 'month'>('today')
  const [updatingProductions, setUpdatingProductions] = useState<Set<string>>(new Set())

  const handleStatusUpdate = async (productionId: string, newStatus: string) => {
    // Add to updating set
    setUpdatingProductions(prev => new Set(prev.add(productionId)))
    
    try {
      const result = await updateProductionStatus(productionId, newStatus as ProductionStatus)
      
      if (result.success) {
        toast.success('Status produksi berhasil diperbarui')
        // WebSocket will handle real-time update automatically
      } else {
        toast.error(result.error || 'Gagal memperbarui status produksi')
      }
    } catch (error) {
      console.error('Error updating production status:', error)
      toast.error('Gagal memperbarui status produksi')
    } finally {
      // Remove from updating set
      setUpdatingProductions(prev => {
        const newSet = new Set(prev)
        newSet.delete(productionId)
        return newSet
      })
    }
  }

  const handleDeleteProduction = async (productionId: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus produksi ini?')) {
      return
    }

    try {
      const result = await deleteProduction(productionId)
      
      if (result.success) {
        toast.success('Produksi berhasil dihapus')
        // WebSocket will handle real-time update automatically
      } else {
        toast.error(result.error || 'Gagal menghapus produksi')
      }
    } catch (error) {
      console.error('Error deleting production:', error)
      toast.error('Gagal menghapus produksi')
    }
  }

  // Filter productions based on selected view
  const filteredProductions = (() => {
    const today = new Date()
    
    switch (selectedView) {
      case 'today':
        return productions.filter((p: ProductionWithDetails) => {
          const prodDate = new Date(p.scheduledDate)
          return prodDate.toDateString() === today.toDateString()
        })
      case 'week':
        const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()))
        const endOfWeek = new Date(startOfWeek.getTime() + 7 * 24 * 60 * 60 * 1000)
        return productions.filter((p: ProductionWithDetails) => {
          const prodDate = new Date(p.scheduledDate)
          return prodDate >= startOfWeek && prodDate < endOfWeek
        })
      case 'month':
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0)
        return productions.filter((p: ProductionWithDetails) => {
          const prodDate = new Date(p.scheduledDate)
          return prodDate >= startOfMonth && prodDate <= endOfMonth
        })
      default:
        return productions
    }
  })()

  // Group productions by time slots
  const timeSlots = [
    { label: 'Pagi (06:00-10:00)', start: 6, end: 10 },
    { label: 'Siang (10:00-14:00)', start: 10, end: 14 },
    { label: 'Sore (14:00-18:00)', start: 14, end: 18 },
    { label: 'Malam (18:00-22:00)', start: 18, end: 22 }
  ]

  const getProductionsForTimeSlot = (start: number, end: number) => {
    return filteredProductions.filter((p: ProductionWithDetails) => {
      const startTime = new Date(p.scheduledStartTime)
      const hour = startTime.getHours()
      return hour >= start && hour < end
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SCHEDULED': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300'
      case 'PREPARING': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300'
      case 'IN_PROGRESS': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300'
      case 'QUALITY_CHECK': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300'
      case 'COMPLETED': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
      case 'CANCELLED': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SCHEDULED': return Calendar
      case 'PREPARING': return Clock
      case 'IN_PROGRESS': return ChefHat
      case 'QUALITY_CHECK': return AlertCircle
      case 'COMPLETED': return CheckCircle2
      default: return PlayCircle
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-xl font-semibold">Jadwal Produksi</CardTitle>
            {showRealTimeIndicator && (
              <Badge variant="outline" className="text-xs bg-green-50 text-green-700 dark:bg-green-900/20">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse" />
                Live Data
              </Badge>
            )}
          </div>
          <Tabs value={selectedView} onValueChange={(value: string) => setSelectedView(value as 'today' | 'week' | 'month')}>
            <TabsList>
              <TabsTrigger value="today">Hari Ini</TabsTrigger>
              <TabsTrigger value="week">Minggu Ini</TabsTrigger>
              <TabsTrigger value="month">Bulan Ini</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={selectedView} onValueChange={(value: string) => setSelectedView(value as 'today' | 'week' | 'month')}>
          <TabsContent value="today" className="space-y-4">
            {timeSlots.map((slot) => {
              const slotProductions = getProductionsForTimeSlot(slot.start, slot.end)
              
              if (slotProductions.length === 0) return null

              return (
                <div key={slot.label} className="space-y-3">
                  <h3 className="font-medium text-muted-foreground">{slot.label}</h3>
                  <div className="grid gap-3">
                    {slotProductions.map((production: ProductionWithDetails) => {
                      const StatusIcon = getStatusIcon(production.status)
                      
                      return (
                        <Card key={production.id} className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className="font-medium">{production.menu.menuName}</h4>
                                <Badge className={getStatusColor(production.status)}>
                                  <StatusIcon className="h-3 w-3 mr-1" />
                                  {production.status}
                                </Badge>
                              </div>
                              
                              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                                <div className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  <span>
                                    {format(new Date(production.scheduledStartTime), 'HH:mm', { locale: id })} -
                                    {format(new Date(production.scheduledEndTime), 'HH:mm', { locale: id })}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Users className="h-3 w-3" />
                                  <span>{production.totalQuantity} porsi</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <ChefHat className="h-3 w-3" />
                                  <span>{production.assignedChef}</span>
                                </div>
                              </div>

                              <div className="flex gap-2">
                                {production.status === 'SCHEDULED' && (
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => handleStatusUpdate(production.id, 'PREPARING')}
                                    disabled={updatingProductions.has(production.id)}
                                  >
                                    <PlayCircle className="h-3 w-3 mr-1" />
                                    Mulai Persiapan
                                  </Button>
                                )}
                                {production.status === 'PREPARING' && (
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => handleStatusUpdate(production.id, 'IN_PROGRESS')}
                                    disabled={updatingProductions.has(production.id)}
                                  >
                                    <ChefHat className="h-3 w-3 mr-1" />
                                    Mulai Memasak
                                  </Button>
                                )}
                                {production.status === 'IN_PROGRESS' && (
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => handleStatusUpdate(production.id, 'QUALITY_CHECK')}
                                    disabled={updatingProductions.has(production.id)}
                                  >
                                    <AlertCircle className="h-3 w-3 mr-1" />
                                    Cek Kualitas
                                  </Button>
                                )}
                                {production.status === 'QUALITY_CHECK' && (
                                  <Button 
                                    size="sm" 
                                    onClick={() => handleStatusUpdate(production.id, 'COMPLETED')}
                                    disabled={updatingProductions.has(production.id)}
                                  >
                                    <CheckCircle2 className="h-3 w-3 mr-1" />
                                    Selesai
                                  </Button>
                                )}
                                {production.status === 'SCHEDULED' && (
                                  <Button 
                                    size="sm" 
                                    variant="ghost"
                                    onClick={() => handleDeleteProduction(production.id)}
                                    disabled={updatingProductions.has(production.id)}
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                                  >
                                    <Pause className="h-3 w-3 mr-1" />
                                    Hapus
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        </Card>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </TabsContent>
          
          <TabsContent value="week" className="space-y-4">
            <div className="text-center text-muted-foreground py-8">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Tampilan mingguan akan segera tersedia</p>
            </div>
          </TabsContent>
          
          <TabsContent value="month" className="space-y-4">
            <div className="text-center text-muted-foreground py-8">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Tampilan bulanan akan segera tersedia</p>
            </div>
          </TabsContent>
        </Tabs>

        {filteredProductions.length === 0 && (
          <div className="text-center text-muted-foreground py-8">
            <ChefHat className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Tidak ada produksi terjadwal untuk periode ini</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}