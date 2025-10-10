'use client'

// Menu Card Component - Pattern 2 Architecture
// Bergizi-ID SaaS Platform - SPPG Program Pemerintah

import { useState } from 'react'
import Link from 'next/link'
import { 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Copy, 
  Eye,
  Heart,
  Leaf,
  Clock,
  Users,
  DollarSign
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
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

// Types - Import from domain types for consistency
import type { MenuWithDetails, MenuListItem } from '../types/menuTypes'

interface MenuCardProps {
  menu: MenuWithDetails | MenuListItem
  onEdit?: (menu: MenuWithDetails | MenuListItem) => void
  onDelete?: (menuId: string) => void
  onToggleStatus?: (menuId: string) => void
  showActions?: boolean
  variant?: 'default' | 'compact' | 'detailed'
}

// Simple utils to avoid import issues
function formatMealType(mealType: string): string {
  const labels: Record<string, string> = {
    SARAPAN: 'Sarapan',
    MAKAN_SIANG: 'Makan Siang',
    SNACK_PAGI: 'Snack Pagi',
    SNACK_SORE: 'Snack Sore',
    MAKAN_MALAM: 'Makan Malam'
  }
  return labels[mealType] || mealType
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(amount)
}

function formatNutrition(value: number, unit: string): string {
  return `${value.toFixed(1)} ${unit}`
}

export function MenuCard({
  menu,
  onEdit,
  onDelete,
  onToggleStatus,
  showActions = true,
  variant = 'default'
}: MenuCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const handleEdit = () => {
    onEdit?.(menu)
  }

  const handleDelete = () => {
    setShowDeleteDialog(true)
  }

  const confirmDelete = () => {
    onDelete?.(menu.id)
    setShowDeleteDialog(false)
  }

  const handleToggleStatus = () => {
    onToggleStatus?.(menu.id)
  }

  const getMealTypeBadgeColor = (mealType: string) => {
    switch (mealType) {
      case 'SARAPAN': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
      case 'MAKAN_SIANG': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'SNACK_PAGI': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'SNACK_SORE': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'MAKAN_MALAM': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  if (variant === 'compact') {
    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-semibold text-sm truncate">{menu.menuName}</h3>
                {!menu.isActive && (
                  <Badge variant="secondary" className="text-xs">
                    Tidak Aktif
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{formatMealType(menu.mealType)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  <span>{menu.servingSize}g</span>
                </div>
                <div className="flex items-center gap-1">
                  <DollarSign className="w-3 h-3" />
                  <span>{formatCurrency(menu.costPerServing)}</span>
                </div>
              </div>
            </div>

            {showActions && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href={`/menu/${menu.id}`}>
                      <Eye className="mr-2 h-4 w-4" />
                      Lihat Detail
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleEdit}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={handleDelete}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Hapus
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={`hover:shadow-lg transition-all duration-200 ${!menu.isActive ? 'opacity-75' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold text-lg leading-tight">
                {menu.menuName}
              </h3>
              {menu.isHalal && (
                <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                  <Heart className="w-3 h-3 mr-1" />
                  Halal
                </Badge>
              )}
              {menu.isVegetarian && (
                <Badge variant="outline" className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200">
                  <Leaf className="w-3 h-3 mr-1" />
                  Vegetarian
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <Badge className={getMealTypeBadgeColor(menu.mealType)}>
                {formatMealType(menu.mealType)}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {menu.program.name}
              </span>
            </div>
            
            {menu.description && (
              <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                {menu.description}
              </p>
            )}
          </div>

          {showActions && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href={`/menu/${menu.id}`}>
                    <Eye className="mr-2 h-4 w-4" />
                    Lihat Detail
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleEdit}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Menu
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => {}}>
                  <Copy className="mr-2 h-4 w-4" />
                  Duplikasi
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleToggleStatus}>
                  {menu.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={handleDelete}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Hapus Menu
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardHeader>

      <CardContent className="py-3">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-lg font-semibold text-orange-600">
              {menu.calories}
            </div>
            <div className="text-xs text-muted-foreground">Kalori</div>
          </div>
          
          <div className="text-center">
            <div className="text-lg font-semibold text-blue-600">
              {formatNutrition(menu.protein, 'g')}
            </div>
            <div className="text-xs text-muted-foreground">Protein</div>
          </div>
          
          <div className="text-center">
            <div className="text-lg font-semibold text-green-600">
              {menu.servingSize}g
            </div>
            <div className="text-xs text-muted-foreground">Porsi</div>
          </div>
          
          <div className="text-center">
            <div className="text-lg font-semibold text-purple-600">
              {formatCurrency(menu.costPerServing)}
            </div>
            <div className="text-xs text-muted-foreground">Biaya SPPG</div>
          </div>
        </div>

        {variant === 'detailed' && 'ingredients' in menu && menu.ingredients && (
          <div className="mt-4 pt-4 border-t">
            <h4 className="text-sm font-medium mb-2">Bahan ({menu.ingredients.length})</h4>
            <div className="flex flex-wrap gap-1">
              {menu.ingredients.slice(0, 3).map((ingredient: { id: string; inventoryItem: { itemName: string } }) => (
                <Badge key={ingredient.id} variant="secondary" className="text-xs">
                  {ingredient.inventoryItem.itemName}
                </Badge>
              ))}
              {'ingredients' in menu && menu.ingredients && menu.ingredients.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{menu.ingredients.length - 3} lainnya
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-3">
        <div className="flex items-center justify-between w-full text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <span>Dibuat: {menu.createdAt.toLocaleDateString('id-ID')}</span>
          </div>
          <div className="flex items-center gap-1">
            <div className={`w-2 h-2 rounded-full ${menu.isActive ? 'bg-green-500' : 'bg-gray-400'}`} />
            <span>{menu.isActive ? 'Aktif' : 'Tidak Aktif'}</span>
          </div>
        </div>
      </CardFooter>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Menu</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus menu &quot;{menu.menuName}&quot;? 
              Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}
