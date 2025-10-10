'use client'

import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Edit, Trash2, Clock, Users, DollarSign } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

import { useMenu, useDeleteMenu } from '@/components/sppg/menu/hooks'

export default function MenuDetailPage() {
  const params = useParams()
  const router = useRouter()
  const menuId = params.id as string

  // Fetch menu data
  const { data: menu, isLoading, error } = useMenu(menuId)
  const { mutate: deleteMenu, isPending: isDeleting } = useDeleteMenu()

  // Handle actions
  const handleEdit = () => {
    router.push(`/menu/${menuId}/edit`)
  }

  const handleBack = () => {
    router.push('/menu')
  }

  const handleDelete = async () => {
    if (confirm(`Apakah Anda yakin ingin menghapus menu "${menu?.menuName}"?`)) {
      deleteMenu(menuId, {
        onSuccess: () => {
          toast.success('Menu berhasil dihapus')
          router.push('/menu')
        },
        onError: () => {
          toast.error('Gagal menghapus menu')
        }
      })
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="space-y-6">
          <div className="h-8 bg-muted animate-pulse rounded" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="h-64 bg-muted animate-pulse rounded" />
              <div className="h-48 bg-muted animate-pulse rounded" />
            </div>
            <div className="space-y-6">
              <div className="h-32 bg-muted animate-pulse rounded" />
              <div className="h-48 bg-muted animate-pulse rounded" />
            </div>
          </div>
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
            Kembali ke Daftar Menu
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={handleBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Kembali
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground">{menu.menuName}</h1>
              <p className="text-muted-foreground">{menu.menuCode}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleEdit}>
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDelete}
              disabled={isDeleting}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {isDeleting ? 'Menghapus...' : 'Hapus'}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informasi Menu</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Jenis Makanan</span>
                  <Badge variant="secondary">{menu.mealType}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Porsi</span>
                  <span>{menu.servingSize}g</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <Badge variant={menu.isActive ? "default" : "secondary"}>
                    {menu.isActive ? 'Aktif' : 'Tidak Aktif'}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">{menu.calories}</div>
                    <div className="text-sm text-muted-foreground">Kalori</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{menu.protein}g</div>
                    <div className="text-sm text-muted-foreground">Protein</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{menu.carbohydrates}g</div>
                    <div className="text-sm text-muted-foreground">Karbohidrat</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">{menu.fat}g</div>
                    <div className="text-sm text-muted-foreground">Lemak</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Ringkasan</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <DollarSign className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <div className="font-medium">Rp {menu.costPerServing?.toLocaleString() || 0}</div>
                    <div className="text-sm text-muted-foreground">Biaya per porsi</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <div className="font-medium">30 menit</div>
                    <div className="text-sm text-muted-foreground">Waktu persiapan</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <div className="font-medium">Sedang</div>
                    <div className="text-sm text-muted-foreground">Tingkat kesulitan</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {menu.program && (
              <Card>
                <CardHeader>
                  <CardTitle>Program</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="font-medium">{menu.program.name}</div>
                    <div className="text-sm text-muted-foreground">{menu.program.id}</div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Memuat data menu...</p>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto py-8">
        <Card className="p-6 text-center">
          <p className="text-destructive">Gagal memuat data menu</p>
          <Button variant="outline" onClick={handleBack} className="mt-4">
            Kembali ke Daftar Menu
          </Button>
        </Card>
      </div>
    )
  }

  // Temporary return for build - menu detail page under construction
  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-6">
        <Button
          onClick={handleBack}
          variant="ghost" 
          size="sm"
          className="text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Kembali
        </Button>
        
        <div className="flex gap-2">
          <Button onClick={handleEdit} variant="outline" size="sm">
            <Edit className="h-4 w-4 mr-2" />
            Edit Menu
          </Button>
          <Button onClick={handleDelete} variant="destructive" size="sm">
            <Trash2 className="h-4 w-4 mr-2" />
            Hapus
          </Button>
        </div>
      </div>

      <Card className="p-6">
        <h1 className="text-3xl font-bold mb-4">Menu Detail</h1>
        <p className="text-muted-foreground">
          Halaman detail menu sedang dalam pengembangan. 
          Fitur lengkap akan tersedia dalam versi mendatang.
        </p>
      </Card>
    </div>
  )
}