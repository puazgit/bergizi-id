// Program Card Component - Pattern 2 Architecture
// Bergizi-ID SaaS Platform - SPPG Program Management
// src/components/sppg/menu/components/ProgramCard.tsx

'use client'

import { type FC } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Calendar, 
  Users, 
  DollarSign, 
  Target,
  Edit,
  Trash2,
  Eye,
  MapPin,
  TrendingUp
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'
import { type ProgramWithDetails } from '../types'

interface ProgramCardProps {
  program: ProgramWithDetails
  onEdit?: () => void
  onDelete?: () => void
  onView?: () => void
  variant?: 'default' | 'compact' | 'detailed'
  className?: string
}

export const ProgramCard: FC<ProgramCardProps> = ({
  program,
  onEdit,
  onDelete,
  onView,
  variant = 'default',
  className
}) => {
  // Calculate progress percentage
  const progressPercentage = program.targetRecipients > 0
    ? Math.round((program.currentRecipients / program.targetRecipients) * 100)
    : 0

  // Status badge variant
  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'default'
      case 'PAUSED':
        return 'secondary'
      case 'COMPLETED':
        return 'outline'
      case 'CANCELLED':
        return 'destructive'
      default:
        return 'secondary'
    }
  }

  // Status label
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'Aktif'
      case 'PAUSED':
        return 'Dijeda'
      case 'COMPLETED':
        return 'Selesai'
      case 'CANCELLED':
        return 'Dibatalkan'
      default:
        return status
    }
  }

  // Compact variant for list view
  if (variant === 'compact') {
    return (
      <Card className={cn('hover:shadow-md transition-shadow', className)}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-lg truncate">
                  {program.name}
                </h3>
                <Badge variant={getStatusVariant(program.status)}>
                  {getStatusLabel(program.status)}
                </Badge>
              </div>
              
              <p className="text-sm text-muted-foreground mb-2 line-clamp-1">
                {program.description || 'Tidak ada deskripsi'}
              </p>

              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  <span>{program.currentRecipients}/{program.targetRecipients}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>{format(new Date(program.startDate), 'dd MMM yyyy', { locale: id })}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-1">
              {onView && (
                <Button variant="ghost" size="sm" onClick={onView}>
                  <Eye className="h-4 w-4" />
                </Button>
              )}
              {onEdit && (
                <Button variant="ghost" size="sm" onClick={onEdit}>
                  <Edit className="h-4 w-4" />
                </Button>
              )}
              {onDelete && (
                <Button variant="ghost" size="sm" onClick={onDelete}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Default variant for grid view
  return (
    <Card className={cn(
      'hover:shadow-lg transition-all duration-200',
      'dark:hover:shadow-xl dark:hover:shadow-primary/5',
      className
    )}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="line-clamp-1">{program.name}</CardTitle>
            <CardDescription className="line-clamp-2 mt-1">
              {program.description || 'Tidak ada deskripsi'}
            </CardDescription>
          </div>
          <Badge variant={getStatusVariant(program.status)} className="ml-2">
            {getStatusLabel(program.status)}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Program Info */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-start gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground">Mulai</p>
              <p className="font-medium truncate">
                {format(new Date(program.startDate), 'dd MMM yyyy', { locale: id })}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <Target className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground">Target</p>
              <p className="font-medium">
                {program.targetRecipients.toLocaleString()} orang
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <Users className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground">Terlayani</p>
              <p className="font-medium">
                {program.currentRecipients.toLocaleString()} orang
              </p>
            </div>
          </div>

          {program.totalBudget && (
            <div className="flex items-start gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">Anggaran</p>
                <p className="font-medium truncate">
                  Rp {(program.totalBudget / 1000000).toFixed(1)}jt
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Progress Penerima</span>
            <span className="font-medium">{progressPercentage}%</span>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <div 
              className={cn(
                "h-full rounded-full transition-all duration-500",
                progressPercentage >= 100 
                  ? "bg-green-500" 
                  : progressPercentage >= 75 
                    ? "bg-blue-500"
                    : progressPercentage >= 50
                      ? "bg-yellow-500"
                      : "bg-orange-500"
              )}
              style={{ width: `${Math.min(progressPercentage, 100)}%` }}
            />
          </div>
        </div>

        {/* Location */}
        <div className="flex items-start gap-2 text-sm">
          <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground">Lokasi Implementasi</p>
            <p className="font-medium line-clamp-1">{program.implementationArea}</p>
          </div>
        </div>

        {/* Stats if available */}
        {program._count && (
          <div className="flex items-center gap-3 pt-3 border-t text-xs">
            <div className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-muted-foreground" />
              <span className="text-muted-foreground">
                {program._count.menus} Menu
              </span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-muted-foreground">
                {program._count.schools} Sekolah
              </span>
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex gap-2 pt-4">
        {onView && (
          <Button 
            variant="outline" 
            className="flex-1" 
            size="sm"
            onClick={onView}
          >
            <Eye className="h-4 w-4 mr-2" />
            Lihat Detail
          </Button>
        )}
        {onEdit && (
          <Button 
            variant="outline" 
            size="sm"
            onClick={onEdit}
          >
            <Edit className="h-4 w-4" />
          </Button>
        )}
        {onDelete && (
          <Button 
            variant="outline" 
            size="sm"
            onClick={onDelete}
            className="border-destructive/30 text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
