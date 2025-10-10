'use client'

import { useState } from 'react'
import { Plus, DownloadCloud } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import { MenuCard } from '@/components/sppg/menu/components'
import { useMenus } from '@/components/sppg/menu/hooks'
import type { MenuListItem } from '@/components/sppg/menu/types/menuTypes'

export default function MenuPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [mealTypeFilter, setMealTypeFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  // Use menu hooks
  const { data: menusData, isLoading, error } = useMenus({
    search: searchTerm,
    mealType: mealTypeFilter !== 'all' ? mealTypeFilter : undefined,
    isActive: statusFilter !== 'all' ? statusFilter === 'active' : undefined,
    page: 1,
    limit: 20
  })

  const menus = menusData?.menus || []

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Menu Gizi</h1>
          <p className="text-muted-foreground">
            Kelola menu bergizi untuk program makanan sekolah
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <DownloadCloud className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button asChild>
            <Link href="/menu/create">
              <Plus className="h-4 w-4 mr-2" />
              Tambah Menu
            </Link>
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="flex-1 max-w-sm">
          <Input 
            placeholder="Cari menu..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={mealTypeFilter} onValueChange={setMealTypeFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Jenis Makanan" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Jenis</SelectItem>
            <SelectItem value="SARAPAN">Sarapan</SelectItem>
            <SelectItem value="MAKAN_SIANG">Makan Siang</SelectItem>
            <SelectItem value="SNACK_PAGI">Snack Pagi</SelectItem>
            <SelectItem value="SNACK_SORE">Snack Sore</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua</SelectItem>
            <SelectItem value="active">Aktif</SelectItem>
            <SelectItem value="inactive">Tidak Aktif</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Menu List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Gagal memuat data menu</p>
          </div>
        ) : menus.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Belum ada menu yang dibuat</p>
            <Button asChild className="mt-4">
              <Link href="/menu/create">
                <Plus className="h-4 w-4 mr-2" />
                Buat Menu Pertama
              </Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {menus.map((menu: MenuListItem) => (
              <MenuCard key={menu.id} menu={menu} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
