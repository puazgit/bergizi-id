'use client'

// Menu List Component - Pattern 2 Architecture
// Bergizi-ID SaaS Platform - SPPG Menu Management

import { useState } from 'react'
import { Grid, List, Search, Wifi, WifiOff } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'

// Components
import { MenuCard } from './MenuCard'

// Hooks
import { useMenuWebSocket } from '../hooks/useMenuWebSocket'

// Types - Import from domain types for consistency
import type { MenuWithDetails, MenuListItem } from '../types/menuTypes'

interface MenuListProps {
  menus: (MenuWithDetails | MenuListItem)[]
  onEdit?: (menu: MenuWithDetails | MenuListItem) => void
  onDelete?: (menuId: string) => void
  onToggleStatus?: (menuId: string) => void
  showActions?: boolean
  isLoading?: boolean
}

interface MenuListViewProps {
  menus: (MenuWithDetails | MenuListItem)[]
  onEdit?: (menu: MenuWithDetails | MenuListItem) => void
  onDelete?: (menuId: string) => void
  onToggleStatus?: (menuId: string) => void
  showActions?: boolean
  showFilters?: boolean
  isLoading?: boolean
  viewMode?: 'grid' | 'list'
  searchTerm?: string
  onSearchChange?: (term: string) => void
  sortBy?: string
  onSortChange?: (sortBy: string) => void
}

export function MenuList({
  menus,
  isLoading = false,
  onEdit,
  onDelete,
  onToggleStatus,
  viewMode = 'grid',
  searchTerm = '',
  onSearchChange,
  sortBy = 'name',
  onSortChange,
  showFilters = true
}: MenuListViewProps) {
  const [localViewMode, setLocalViewMode] = useState<'grid' | 'list'>(viewMode)

  // Real-time WebSocket integration
  const { isConnected, connectionStatus } = useMenuWebSocket({
    enabled: true,
    showNotifications: true
  })

  if (isLoading) {
    return (
      <div className="space-y-4">
        {showFilters && (
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <Skeleton className="h-10 flex-1" />
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-10 w-24" />
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-6 w-3/4 mb-4" />
                <Skeleton className="h-4 w-1/2 mb-2" />
                <Skeleton className="h-4 w-full mb-4" />
                <div className="grid grid-cols-4 gap-4">
                  {Array.from({ length: 4 }).map((_, j) => (
                    <div key={j} className="text-center">
                      <Skeleton className="h-6 w-full mb-1" />
                      <Skeleton className="h-3 w-3/4 mx-auto" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (!menus || menus.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
          <List className="w-12 h-12 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Belum ada menu</h3>
        <p className="text-muted-foreground mb-4">
          Mulai dengan membuat menu makanan pertama Anda
        </p>
        <Button>
          Buat Menu Baru
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filters and Search */}
      {showFilters && (
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Cari menu..."
              value={searchTerm}
              onChange={(e) => onSearchChange?.(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Sort */}
          <Select value={sortBy} onValueChange={onSortChange}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Urutkan berdasarkan" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Nama Menu</SelectItem>
              <SelectItem value="calories">Kalori</SelectItem>
              <SelectItem value="cost">Biaya</SelectItem>
              <SelectItem value="protein">Protein</SelectItem>
              <SelectItem value="created">Tanggal Dibuat</SelectItem>
            </SelectContent>
          </Select>

          {/* Real-time Status Indicator */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg border bg-muted/50">
            {isConnected ? (
              <Wifi className="w-4 h-4 text-green-500" />
            ) : (
              <WifiOff className="w-4 h-4 text-red-500" />
            )}
            <span className="text-xs text-muted-foreground">
              {connectionStatus === 'connected' ? 'Real-time' : connectionStatus}
            </span>
          </div>

          {/* View Mode Toggle */}
          <div className="flex rounded-lg border">
            <Button
              variant={localViewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setLocalViewMode('grid')}
              className="rounded-r-none"
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant={localViewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setLocalViewMode('list')}
              className="rounded-l-none"
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Menu Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Menampilkan {menus.length} menu
        </p>
      </div>

      {/* Menu Grid/List */}
      <div
        className={
          localViewMode === 'grid'
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
            : 'space-y-4'
        }
      >
        {menus.map((menu) => (
          <MenuCard
            key={menu.id}
            menu={menu}
            onEdit={onEdit}
            onDelete={onDelete}
            onToggleStatus={onToggleStatus}
            variant={localViewMode === 'list' ? 'compact' : 'default'}
          />
        ))}
      </div>
    </div>
  )
}

// Menu Grid Component
export function MenuGrid({
  menus,
  isLoading,
  onEdit,
  onDelete,
  onToggleStatus
}: MenuListProps) {
  return (
    <MenuList
      menus={menus}
      isLoading={isLoading}
      onEdit={onEdit}
      onDelete={onDelete}
      onToggleStatus={onToggleStatus}
      viewMode="grid"
      showFilters={false}
    />
  )
}

// Menu List Compact Component
export function MenuListCompact({
  menus,
  isLoading,
  onEdit,
  onDelete,
  onToggleStatus
}: MenuListProps) {
  return (
    <MenuList
      menus={menus}
      isLoading={isLoading}
      onEdit={onEdit}
      onDelete={onDelete}
      onToggleStatus={onToggleStatus}
      viewMode="list"
      showFilters={false}
    />
  )
}
