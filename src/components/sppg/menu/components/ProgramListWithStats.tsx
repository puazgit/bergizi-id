'use client'

import { type FC } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { 
  Users, 
  Calendar, 
  ChefHat,
  TrendingUp,
  Eye,
  Edit,
  MoreHorizontal
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import Link from 'next/link'

interface ProgramWithStats {
  id: string
  programName: string
  description: string | null
  status: string
  startDate: Date
  endDate: Date
  targetAge: string
  _count: {
    menus: number
    beneficiaries: number
  }
  stats: {
    totalBudget: number
    usedBudget: number
    completionRate: number
    averageCost: number
  }
}

interface ProgramListWithStatsProps {
  programs: ProgramWithStats[]
  isLoading?: boolean
  onEdit?: (programId: string) => void
  onDelete?: (programId: string) => void
  className?: string
}

export const ProgramListWithStats: FC<ProgramListWithStatsProps> = ({
  programs,
  isLoading = false,
  onEdit,
  onDelete,
  className
}) => {
  if (isLoading) {
    return (
      <div className={cn('space-y-4', className)}>
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-muted rounded w-1/3"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, j) => (
                  <div key={j} className="h-16 bg-muted rounded"></div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (programs.length === 0) {
    return (
      <Card className={cn('text-center py-12', className)}>
        <CardContent>
          <ChefHat className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Belum Ada Program Gizi
          </h3>
          <p className="text-muted-foreground mb-4">
            Buat program gizi pertama untuk memulai perencanaan menu.
          </p>
          <Button asChild>
            <Link href="/programs/create">
              Buat Program Baru
            </Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={cn('space-y-6', className)}>
      {programs.map((program) => {
        const budgetUsagePercentage = (program.stats.usedBudget / program.stats.totalBudget) * 100
        const isActive = program.status === 'ACTIVE'
        const isPending = program.status === 'PENDING'
        const isCompleted = program.status === 'COMPLETED'

        return (
          <Card key={program.id} className="hover:shadow-lg transition-all duration-200">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <CardTitle className="text-xl font-bold text-foreground">
                      {program.programName}
                    </CardTitle>
                    <Badge 
                      variant={
                        isActive ? 'default' : 
                        isPending ? 'secondary' : 
                        isCompleted ? 'outline' : 'destructive'
                      }
                      className="text-xs"
                    >
                      {program.status}
                    </Badge>
                  </div>
                  <CardDescription className="text-sm">
                    {program.description}
                  </CardDescription>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>
                        {new Date(program.startDate).toLocaleDateString('id-ID')} - 
                        {new Date(program.endDate).toLocaleDateString('id-ID')}
                      </span>
                    </div>
                    <span>•</span>
                    <span>{program.targetAge}</span>
                  </div>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/programs/${program.id}`}>
                        <Eye className="mr-2 h-4 w-4" />
                        Lihat Detail
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onEdit?.(program.id)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Program
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>

            <CardContent className="pt-0">
              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="text-center p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <ChefHat className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Menu</span>
                  </div>
                  <div className="text-lg font-bold text-foreground">
                    {program._count.menus}
                  </div>
                </div>

                <div className="text-center p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Users className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Siswa</span>
                  </div>
                  <div className="text-lg font-bold text-foreground">
                    {program._count.beneficiaries.toLocaleString('id-ID')}
                  </div>
                </div>

                <div className="text-center p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <TrendingUp className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Progress</span>
                  </div>
                  <div className="text-lg font-bold text-foreground">
                    {program.stats.completionRate.toFixed(0)}%
                  </div>
                </div>

                <div className="text-center p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <span className="text-xs text-muted-foreground">Rata-rata</span>
                  </div>
                  <div className="text-lg font-bold text-foreground">
                    Rp {Math.round(program.stats.averageCost).toLocaleString('id-ID')}
                  </div>
                </div>
              </div>

              {/* Budget Progress */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Penggunaan Anggaran</span>
                  <span className="font-medium">
                    {budgetUsagePercentage.toFixed(1)}%
                  </span>
                </div>
                <Progress 
                  value={budgetUsagePercentage} 
                  className="h-2"
                />
                <div className="flex justify-between items-center text-xs text-muted-foreground">
                  <span>
                    Rp {program.stats.usedBudget.toLocaleString('id-ID')}
                  </span>
                  <span>
                    Rp {program.stats.totalBudget.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 mt-4 pt-4 border-t">
                <Button asChild variant="default" size="sm" className="flex-1">
                  <Link href={`/programs/${program.id}`}>
                    <Eye className="mr-2 h-4 w-4" />
                    Lihat Detail
                  </Link>
                </Button>
                <Button 
                  asChild 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                >
                  <Link href={`/programs/${program.id}/menus`}>
                    <ChefHat className="mr-2 h-4 w-4" />
                    Kelola Menu
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}