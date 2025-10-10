// Production Queue Component - Real-time Production Queue Management
// Pattern 2 Component-Level Implementation
// src/components/sppg/production/components/ProductionQueue.tsx

'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'
import { 
  ListOrdered,
  Clock,
  ChefHat,
  Users,
  AlertTriangle,
  ArrowUp,
  ArrowDown,
  MoreVertical,
  Play,
  Pause
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { useProductions, useUpdateProductionStatus, useProductionRealTime } from '../hooks'
import type { ProductionWithDetails } from '../types'

interface ProductionQueueProps {
  maxItems?: number
  showRealTimeIndicator?: boolean
}

export function ProductionQueue({ 
  maxItems = 10,
  showRealTimeIndicator = true 
}: ProductionQueueProps) {
  const [sortBy, setSortBy] = useState<'priority' | 'time' | 'status'>('time')

  // Fetch productions data - focus on active and planned
  const { data: productionsData, isLoading } = useProductions({
    status: ['PLANNED', 'PREPARING', 'COOKING', 'QUALITY_CHECK']
  })

  // Real-time connection
  const { isRealTimeActive } = useProductionRealTime()

  // Status update mutation
  const updateStatusMutation = useUpdateProductionStatus()

  const productions = productionsData?.productions || []

  // Sort and filter queue
  const getQueueItems = () => {
    let sorted = [...productions]

    switch (sortBy) {
      case 'priority':
        // Priority: COOKING > PREPARING > QUALITY_CHECK > PLANNED
        const priorityOrder = { 'COOKING': 1, 'PREPARING': 2, 'QUALITY_CHECK': 3, 'PLANNED': 4 }
        sorted = sorted.sort((a, b) => (priorityOrder[a.status as keyof typeof priorityOrder] || 5) - (priorityOrder[b.status as keyof typeof priorityOrder] || 5))
        break
      case 'time':
        sorted = sorted.sort((a, b) => new Date(a.plannedStartTime).getTime() - new Date(b.plannedStartTime).getTime())
        break
      case 'status':
        sorted = sorted.sort((a, b) => a.status.localeCompare(b.status))
        break
    }

    return sorted.slice(0, maxItems)
  }

  const queueItems = getQueueItems()

  const handleStatusUpdate = async (productionId: string, newStatus: string) => {
    try {
      await updateStatusMutation.mutateAsync({ id: productionId, status: newStatus })
      toast.success(`Status produksi berhasil diperbarui ke ${newStatus}`)
    } catch {
      toast.error('Gagal memperbarui status produksi')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PLANNED': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300'
      case 'PREPARING': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300'
      case 'COOKING': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300'
      case 'QUALITY_CHECK': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PLANNED': return Clock
      case 'PREPARING': return Users
      case 'COOKING': return ChefHat
      case 'QUALITY_CHECK': return AlertTriangle
      default: return ListOrdered
    }
  }

  const getPriorityLevel = (status: string) => {
    switch (status) {
      case 'COOKING': return { level: 'HIGH', color: 'text-red-600' }
      case 'PREPARING': return { level: 'MEDIUM', color: 'text-yellow-600' }
      case 'QUALITY_CHECK': return { level: 'MEDIUM', color: 'text-orange-600' }
      case 'PLANNED': return { level: 'LOW', color: 'text-blue-600' }
      default: return { level: 'LOW', color: 'text-gray-600' }
    }
  }

  const getNextAction = (status: string) => {
    switch (status) {
      case 'PLANNED': return { action: 'Mulai Persiapan', nextStatus: 'PREPARING', icon: Play }
      case 'PREPARING': return { action: 'Mulai Memasak', nextStatus: 'COOKING', icon: ChefHat }
      case 'COOKING': return { action: 'Cek Kualitas', nextStatus: 'QUALITY_CHECK', icon: AlertTriangle }
      case 'QUALITY_CHECK': return { action: 'Selesai', nextStatus: 'COMPLETED', icon: Play }
      default: return null
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ListOrdered className="h-5 w-5" />
            Production Queue
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="animate-pulse border rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="h-4 bg-muted rounded w-1/3"></div>
                  <div className="h-6 bg-muted rounded w-16"></div>
                </div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <ListOrdered className="h-5 w-5" />
            Production Queue
            {showRealTimeIndicator && isRealTimeActive && (
              <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-1"></div>
                Live
              </Badge>
            )}
          </CardTitle>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                Sort: {sortBy === 'priority' ? 'Priority' : sortBy === 'time' ? 'Time' : 'Status'}
                <ArrowDown className="h-3 w-3 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setSortBy('priority')}>
                <ArrowUp className="h-3 w-3 mr-2" />
                By Priority
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy('time')}>
                <Clock className="h-3 w-3 mr-2" />
                By Time
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy('status')}>
                <ListOrdered className="h-3 w-3 mr-2" />
                By Status
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent>
        {queueItems.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <ListOrdered className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Tidak ada produksi dalam antrian</p>
          </div>
        ) : (
          <div className="space-y-3">
            {queueItems.map((production: ProductionWithDetails, index: number) => {
              const StatusIcon = getStatusIcon(production.status)
              const priority = getPriorityLevel(production.status)
              const nextAction = getNextAction(production.status)
              const estimatedTime = new Date(production.plannedEndTime).getTime() - new Date(production.plannedStartTime).getTime()
              const estimatedHours = Math.round(estimatedTime / (1000 * 60 * 60 * 10)) / 10

              return (
                <div 
                  key={production.id} 
                  className={cn(
                    'border rounded-lg p-3 space-y-3 transition-all duration-200',
                    production.status === 'COOKING' && 'border-orange-200 bg-orange-50/50 dark:border-orange-800 dark:bg-orange-900/10',
                    production.status === 'PREPARING' && 'border-yellow-200 bg-yellow-50/50 dark:border-yellow-800 dark:bg-yellow-900/10'
                  )}
                >
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-muted text-xs font-medium">
                        {index + 1}
                      </div>
                      <StatusIcon className="h-4 w-4" />
                      <span className="font-medium">{production.menu.menuName}</span>
                      <Badge className={cn('text-xs', getStatusColor(production.status))}>
                        {production.status}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={priority.color}>
                        {priority.level}
                      </Badge>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => handleStatusUpdate(production.id, 'CANCELLED')}>
                            <Pause className="h-3 w-3 mr-2" />
                            Batalkan
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{format(new Date(production.plannedStartTime), 'HH:mm', { locale: id })}</span>
                      <span>({estimatedHours}h)</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      <span>{production.plannedPortions} porsi</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <ChefHat className="h-3 w-3" />
                      <span>{production.headCook}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span>Program: {production.program.name}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  {nextAction && (
                    <div className="flex items-center justify-between pt-2 border-t">
                      <span className="text-xs text-muted-foreground">
                        Next: {nextAction.action}
                      </span>
                      <Button 
                        size="sm" 
                        variant={production.status === 'COOKING' ? 'default' : 'outline'}
                        onClick={() => handleStatusUpdate(production.id, nextAction.nextStatus)}
                        disabled={updateStatusMutation.isPending}
                        className={cn(
                          production.status === 'COOKING' && 'bg-orange-600 hover:bg-orange-700'
                        )}
                      >
                        <nextAction.icon className="h-3 w-3 mr-1" />
                        {nextAction.action}
                      </Button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* Queue Stats */}
        {queueItems.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <div className="grid grid-cols-3 gap-4 text-center text-sm">
              <div>
                <div className="font-medium text-blue-600">
                  {queueItems.filter(p => p.status === 'PLANNED').length}
                </div>
                <div className="text-muted-foreground text-xs">Planned</div>
              </div>
              <div>
                <div className="font-medium text-orange-600">
                  {queueItems.filter(p => p.status === 'COOKING').length}
                </div>
                <div className="text-muted-foreground text-xs">Cooking</div>
              </div>
              <div>
                <div className="font-medium text-purple-600">
                  {queueItems.filter(p => p.status === 'QUALITY_CHECK').length}
                </div>
                <div className="text-muted-foreground text-xs">QC</div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}