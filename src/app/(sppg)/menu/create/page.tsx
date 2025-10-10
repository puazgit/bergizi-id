'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

import { MenuForm } from '@/components/sppg/menu/components'
import { useCreateMenu } from '@/components/sppg/menu/hooks'
import type { CreateMenuInput } from '@/components/sppg/menu/types/menuTypes'

export default function CreateMenuPage() {
  const router = useRouter()
  const { mutate: createMenu, isPending } = useCreateMenu()

  const handleBack = () => {
    router.push('/menu')
  }

  const handleSubmit = (data: CreateMenuInput) => {
    createMenu(data, {
      onSuccess: (menu: { id: string }) => {
        toast.success('Menu berhasil dibuat')
        router.push(`/menu/${menu.id}`)
      },
      onError: (error: Error) => {
        toast.error(error.message || 'Gagal membuat menu')
      }
    })
  }

  const handleCancel = () => {
    if (confirm('Batalkan pembuatan menu? Data yang sudah diisi akan hilang.')) {
      router.push('/menu')
    }
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
            <h1 className="text-3xl font-bold text-foreground">Buat Menu Baru</h1>
            <p className="text-muted-foreground mt-1">
              Buat menu gizi seimbang untuk program SPPG
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="bg-card rounded-lg border p-6">
          <MenuForm 
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isLoading={isPending}
          />
        </div>
      </div>
    </div>
  )
}