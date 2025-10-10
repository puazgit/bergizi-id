// Program List Component - Pattern 2 Architecture
// Bergizi-ID SaaS Platform - SPPG Program Management
// src/components/sppg/menu/components/ProgramList.tsx

'use client'

import { type FC } from 'react'
import { ProgramCard } from './ProgramCard'
import { Card, CardContent } from '@/components/ui/card'
import { usePrograms } from '../hooks'
import { Loader2, AlertCircle, Package } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { cn } from '@/lib/utils'

interface ProgramListProps {
  onEdit?: (programId: string) => void
  onDelete?: (programId: string) => void
  onView?: (programId: string) => void
  variant?: 'grid' | 'list'
  className?: string
}

export const ProgramList: FC<ProgramListProps> = ({
  onEdit,
  onDelete,
  onView,
  variant = 'grid',
  className
}) => {
  const { programs, isLoading, error } = usePrograms()

  // Loading state
  if (isLoading) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <Loader2 className="h-12 w-12 animate-spin text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Memuat data program...</p>
        </CardContent>
      </Card>
    )
  }

  // Error state
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Gagal memuat program: {error instanceof Error ? error.message : 'Unknown error'}
        </AlertDescription>
      </Alert>
    )
  }

  // Empty state
  if (!programs || programs.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="rounded-full bg-muted p-6 mb-4">
            <Package className="h-12 w-12 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Belum Ada Program</h3>
          <p className="text-muted-foreground text-center max-w-md">
            Mulai dengan membuat program nutrisi pertama Anda untuk mengelola menu dan distribusi makanan.
          </p>
        </CardContent>
      </Card>
    )
  }

  // Render programs in grid or list layout
  return (
    <div
      className={cn(
        variant === 'grid' 
          ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
          : 'flex flex-col gap-4',
        className
      )}
    >
      {programs.map((program) => (
        <ProgramCard
          key={program.id}
          program={program}
          onEdit={onEdit ? () => onEdit(program.id) : undefined}
          onDelete={onDelete ? () => onDelete(program.id) : undefined}
          onView={onView ? () => onView(program.id) : undefined}
          variant={variant === 'list' ? 'compact' : 'default'}
        />
      ))}
    </div>
  )
}

// Program List with Stats variant
interface ProgramListWithStatsProps extends ProgramListProps {
  showStats?: boolean
}

export const ProgramListWithStats: FC<ProgramListWithStatsProps> = ({
  showStats = true,
  ...props
}) => {
  const { programs } = usePrograms()

  if (!showStats) {
    return <ProgramList {...props} />
  }

  const activeCount = programs?.filter(p => p.status === 'ACTIVE').length || 0
  const totalRecipients = programs?.reduce((sum, p) => sum + (p.currentRecipients || 0), 0) || 0

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{programs?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Total Program</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{activeCount}</div>
            <p className="text-xs text-muted-foreground">Program Aktif</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{totalRecipients.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Total Penerima</p>
          </CardContent>
        </Card>
      </div>

      {/* Program List */}
      <ProgramList {...props} />
    </div>
  )
}
