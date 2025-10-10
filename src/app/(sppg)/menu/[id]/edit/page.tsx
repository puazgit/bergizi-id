'use client'

import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

import { MenuForm } from '@/components/sppg/menu/components'
import { useMenu, useUpdateMenu } from '@/components/sppg/menu/hooks'
import type { CreateMenuInput, MenuWithDetails } from '@/components/sppg/menu/types/menuTypes'

export default function EditMenuPage() {
  const params = useParams()
  const router = useRouter()
  const menuId = params.id as string

  // Fetch menu data
  const { data: menu, isLoading, error } = useMenu(menuId)
  const { mutate: updateMenu, isPending } = useUpdateMenu()

  const handleBack = () => {
    router.push(`/menu/${menuId}`)
  }

  const handleSubmit = (data: CreateMenuInput) => {
    updateMenu({ id: menuId, input: data }, {
      onSuccess: () => {
        toast.success('Menu berhasil diperbarui')
        router.push(`/menu/${menuId}`)
      },
      onError: (error: Error) => {
        toast.error(error.message || 'Gagal memperbarui menu')
      }
    })
  }

  const handleCancel = () => {
    if (confirm('Batalkan perubahan? Data yang sudah diubah akan hilang.')) {
      router.push(`/menu/${menuId}`)
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="space-y-6">
          <div className="h-8 bg-muted animate-pulse rounded" />
          <div className="h-96 bg-muted animate-pulse rounded" />
        </div>
      </div>
    )
  }

  if (error || !menu) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-muted-foreground">Menu tidak ditemukan</h1>
          <Button onClick={handleBack} className="mt-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={handleBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Edit Menu</h1>
            <p className="text-muted-foreground mt-1">
              Edit menu: {menu.menuName}
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="bg-card rounded-lg border p-6">
          <MenuForm 
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            initialData={menu as Partial<MenuWithDetails>}
            isLoading={isPending}
          />
        </div>
      </div>
    </div>
  )
}