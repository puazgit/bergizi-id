// Production List Component - Pattern 2 Component-Level Implementation
// src/components/sppg/production/components/ProductionList.tsx

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'
import { 
  Calendar,
  Clock,
  Users,
  ChefHat,
  MoreHorizontal,
  Play,
  CheckCircle,
  XCircle,
  Eye
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import type { ProductionWithDetails } from '../types'
import { useUpdateProductionStatus, useDeleteProduction, useProductionRealTime } from '../hooks'

interface ProductionListProps {
  productions: ProductionWithDetails[]
  loading?: boolean
  onStatusUpdate?: (id: string, status: string) => void
}

const statusConfig = {
  PLANNED: {
    label: 'Direncanakan',
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
    icon: Calendar
  },
  PREPARING: {
    label: 'Persiapan',
    color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300',
    icon: Clock
  },
  COOKING: {
    label: 'Memasak',
    color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300',
    icon: ChefHat
  },
  QUALITY_CHECK: {
    label: 'Pemeriksaan',
    color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300',
    icon: Eye
  },
  COMPLETED: {
    label: 'Selesai',
    color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
    icon: CheckCircle
  },
  CANCELLED: {
    label: 'Dibatalkan',
    color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300',
    icon: XCircle
  }
} as const

export function ProductionList({ productions, loading = false, onStatusUpdate }: ProductionListProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null)
  
  const updateStatusMutation = useUpdateProductionStatus()
  const deleteMutation = useDeleteProduction()
  
  // Real-time WebSocket connection
  const { isRealTimeActive, connectionStatus } = useProductionRealTime()

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    try {
      await updateStatusMutation.mutateAsync({ id, status: newStatus })
      onStatusUpdate?.(id, newStatus)
      toast.success('Status produksi berhasil diperbarui')
    } catch {
      toast.error('Gagal memperbarui status produksi')
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    
    try {
      await deleteMutation.mutateAsync(deleteId)
      setDeleteId(null)
      toast.success('Produksi berhasil dihapus')
    } catch {
      toast.error('Gagal menghapus produksi')
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-muted rounded w-1/3"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-3 bg-muted rounded"></div>
                <div className="h-3 bg-muted rounded w-3/4"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (productions.length === 0) {
    return (
      <Card className="text-center py-12">
        <CardContent>
          <ChefHat className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Belum ada produksi
          </h3>
          <p className="text-muted-foreground mb-6">
            Mulai buat jadwal produksi makanan untuk program gizi Anda
          </p>
          <Button asChild>
            <Link href="/production/create">
              <ChefHat className="mr-2 h-4 w-4" />
              Buat Produksi
            </Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      {/* Real-time Connection Status */}
      {isRealTimeActive && (
        <div className="flex items-center gap-2 px-3 py-2 text-sm bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-lg border border-green-200 dark:border-green-800">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          Real-time monitoring aktif
        </div>
      )}
      
      <div className="space-y-4">
        {productions.map((production) => {
          const statusInfo = statusConfig[production.status]
          const StatusIcon = statusInfo.icon

          return (
            <Card key={production.id} className={cn(
              'transition-all duration-200 hover:shadow-lg',
              'dark:hover:shadow-xl dark:hover:shadow-primary/5'
            )}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg font-semibold text-foreground">
                      {production.menu.menuName}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {production.program.name} • ID: {production.id.slice(0, 8)}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge className={cn('px-2 py-1', statusInfo.color)}>
                      <StatusIcon className="mr-1 h-3 w-3" />
                      {statusInfo.label}
                    </Badge>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/production/${production.id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            Lihat Detail
                          </Link>
                        </DropdownMenuItem>
                        
                        {production.status === 'PLANNED' && (
                          <DropdownMenuItem 
                            onClick={() => handleStatusUpdate(production.id, 'PREPARING')}
                          >
                            <Play className="mr-2 h-4 w-4" />
                            Mulai Persiapan
                          </DropdownMenuItem>
                        )}
                        
                        {production.status === 'PREPARING' && (
                          <DropdownMenuItem 
                            onClick={() => handleStatusUpdate(production.id, 'COOKING')}
                          >
                            <ChefHat className="mr-2 h-4 w-4" />
                            Mulai Memasak
                          </DropdownMenuItem>
                        )}
                        
                        {production.status === 'COOKING' && (
                          <DropdownMenuItem 
                            onClick={() => handleStatusUpdate(production.id, 'QUALITY_CHECK')}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            Cek Kualitas
                          </DropdownMenuItem>
                        )}
                        
                        {production.status === 'QUALITY_CHECK' && (
                          <DropdownMenuItem 
                            onClick={() => handleStatusUpdate(production.id, 'COMPLETED')}
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Tandai Selesai
                          </DropdownMenuItem>
                        )}
                        
                        {['PLANNED', 'PREPARING'].includes(production.status) && (
                          <DropdownMenuItem 
                            onClick={() => setDeleteId(production.id)}
                            className="text-destructive focus:text-destructive"
                          >
                            <XCircle className="mr-2 h-4 w-4" />
                            Hapus
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="space-y-1">
                    <span className="text-muted-foreground">Tanggal Produksi</span>
                    <p className="font-medium text-foreground">
                      {format(new Date(production.productionDate), 'dd MMM yyyy', { locale: id })}
                    </p>
                  </div>
                  
                  <div className="space-y-1">
                    <span className="text-muted-foreground">Target Porsi</span>
                    <p className="font-medium text-foreground flex items-center">
                      <Users className="mr-1 h-3 w-3" />
                      {production.plannedPortions.toLocaleString()}
                    </p>
                  </div>
                  
                  <div className="space-y-1">
                    <span className="text-muted-foreground">Waktu Mulai</span>
                    <p className="font-medium text-foreground">
                      {format(new Date(production.plannedStartTime), 'HH:mm')}
                    </p>
                  </div>
                  
                  <div className="space-y-1">
                    <span className="text-muted-foreground">Estimasi Biaya</span>
                    <p className="font-medium text-foreground">
                      Rp {production.estimatedCost.toLocaleString()}
                    </p>
                  </div>
                </div>

                {production.notes && (
                  <div className="mt-4 p-3 rounded-lg bg-muted/30 dark:bg-muted/10">
                    <p className="text-sm text-muted-foreground">
                      <strong>Catatan:</strong> {production.notes}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Produksi</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus produksi ini? Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Menghapus...' : 'Hapus'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}