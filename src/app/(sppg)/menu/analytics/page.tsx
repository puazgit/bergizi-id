'use client'

import { useState } from 'react'
import { ArrowLeft, Download, TrendingUp, TrendingDown, AlertTriangle, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
// import { useMenuAnalytics } from '@/hooks/sppg/useMenu' // TODO: Implement this hook
import { formatCost } from '@/components/sppg/menu/utils'
import { useRouter } from 'next/navigation'

export default function MenuAnalyticsPage() {
  const router = useRouter()
  const [period, setPeriod] = useState('last_30_days')
  const [mealType, setMealType] = useState('all')

  // Fetch analytics data (mock for now)
  const analytics = null
  const isLoading = false
  const error = null
  // const { data: analytics, isLoading, error } = useMenuAnalytics({
  //   period,
  //   mealType: mealType !== 'all' ? mealType : undefined
  // })

  const handleBack = () => {
    router.push('/menu')
  }

  const handleExport = () => {
    // In real app, would generate and download report
    console.log('Exporting analytics report...')
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/3" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded" />
            ))}
          </div>
          <div className="h-96 bg-muted rounded" />
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto py-8">
        <Card className="p-6 text-center">
          <p className="text-destructive">Gagal memuat data analytics</p>
          <Button variant="outline" onClick={handleBack} className="mt-4">
            Kembali ke Menu
          </Button>
        </Card>
      </div>
    )
  }

  const stats = analytics || {
    totalMenus: 0,
    activeMenus: 0,
    averageCost: 0,
    averageCalories: 0,
    topMenus: [],
    costTrend: [],
    nutritionBalance: { balanced: 0, unbalanced: 0 },
    mealTypeDistribution: {}
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
              <h1 className="text-3xl font-bold text-foreground">Analytics Menu</h1>
              <p className="text-muted-foreground mt-1">
                Analisis performa dan statistik menu SPPG
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Pilih periode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="last_7_days">7 Hari Terakhir</SelectItem>
                <SelectItem value="last_30_days">30 Hari Terakhir</SelectItem>
                <SelectItem value="last_90_days">90 Hari Terakhir</SelectItem>
                <SelectItem value="last_year">1 Tahun Terakhir</SelectItem>
              </SelectContent>
            </Select>

            <Select value={mealType} onValueChange={setMealType}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Jenis waktu makan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Waktu</SelectItem>
                <SelectItem value="SARAPAN">Sarapan</SelectItem>
                <SelectItem value="MAKAN_SIANG">Makan Siang</SelectItem>
                <SelectItem value="MAKAN_MALAM">Makan Malam</SelectItem>
                <SelectItem value="SNACK">Snack</SelectItem>
              </SelectContent>
            </Select>

            <Button onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Key Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Menu</p>
                <p className="text-2xl font-bold">{stats.totalMenus}</p>
              </div>
              <div className="text-primary">
                <CheckCircle className="w-8 h-8" />
              </div>
            </div>
            <div className="flex items-center mt-4 text-sm">
              <span className="text-green-600 flex items-center">
                <TrendingUp className="w-4 h-4 mr-1" />
                +12%
              </span>
              <span className="text-muted-foreground ml-2">dari bulan lalu</span>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Menu Aktif</p>
                <p className="text-2xl font-bold">{stats.activeMenus}</p>
              </div>
              <div className="text-green-600">
                <CheckCircle className="w-8 h-8" />
              </div>
            </div>
            <div className="flex items-center mt-4 text-sm">
              <span className="text-green-600 flex items-center">
                <TrendingUp className="w-4 h-4 mr-1" />
                +5%
              </span>
              <span className="text-muted-foreground ml-2">dari bulan lalu</span>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Rata-rata Biaya</p>
                <p className="text-2xl font-bold">{formatCost(stats.averageCost)}</p>
              </div>
              <div className="text-blue-600">
                <TrendingDown className="w-8 h-8" />
              </div>
            </div>
            <div className="flex items-center mt-4 text-sm">
              <span className="text-red-600 flex items-center">
                <TrendingDown className="w-4 h-4 mr-1" />
                -3%
              </span>
              <span className="text-muted-foreground ml-2">dari bulan lalu</span>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Rata-rata Kalori</p>
                <p className="text-2xl font-bold">{Math.round(stats.averageCalories)}</p>
              </div>
              <div className="text-orange-600">
                <AlertTriangle className="w-8 h-8" />
              </div>
            </div>
            <div className="flex items-center mt-4 text-sm">
              <span className="text-green-600 flex items-center">
                <TrendingUp className="w-4 h-4 mr-1" />
                +8%
              </span>
              <span className="text-muted-foreground ml-2">dari bulan lalu</span>
            </div>
          </Card>
        </div>

        {/* Analytics Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Ringkasan</TabsTrigger>
            <TabsTrigger value="performance">Performa</TabsTrigger>
            <TabsTrigger value="nutrition">Nutrisi</TabsTrigger>
            <TabsTrigger value="costs">Biaya</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top Performing Menus */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Menu Terpopuler</h3>
                <div className="space-y-4">
                  {stats.topMenus?.slice(0, 5).map((menu: { id: string; menuName: string; mealType: string; servedCount?: number }, index: number) => (
                    <div key={menu.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium">{menu.menuName}</p>
                          <p className="text-sm text-muted-foreground">{menu.mealType}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{menu.servedCount || 0}x</p>
                        <p className="text-sm text-muted-foreground">Disajikan</p>
                      </div>
                    </div>
                  )) || (
                    <p className="text-muted-foreground text-center py-8">
                      Belum ada data menu
                    </p>
                  )}
                </div>
              </Card>

              {/* Nutrition Balance */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Status Keseimbangan Nutrisi</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="font-medium">Menu Seimbang</span>
                    </div>
                    <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200">
                      {stats.nutritionBalance?.balanced || 0} menu
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="w-5 h-5 text-yellow-600" />
                      <span className="font-medium">Perlu Perbaikan</span>
                    </div>
                    <Badge variant="outline" className="bg-yellow-100 text-yellow-700 border-yellow-200">
                      {stats.nutritionBalance?.unbalanced || 0} menu
                    </Badge>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Distribusi Jenis Waktu Makan</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(stats.mealTypeDistribution || {}).map(([type, count]) => (
                  <div key={type} className="text-center p-4 bg-muted/50 rounded-lg">
                    <p className="text-2xl font-bold text-primary">{count as number}</p>
                    <p className="text-sm text-muted-foreground capitalize">
                      {type.replace('_', ' ').toLowerCase()}
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="nutrition" className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Analisis Nutrisi</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-6 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                  <p className="text-3xl font-bold text-blue-600">{Math.round(stats.averageCalories)}</p>
                  <p className="text-sm text-blue-700 mt-1">Rata-rata Kalori</p>
                </div>
                <div className="text-center p-6 bg-green-50 dark:bg-green-950/20 rounded-lg">
                  <p className="text-3xl font-bold text-green-600">
                    {((stats.nutritionBalance?.balanced || 0) / Math.max(stats.totalMenus, 1) * 100).toFixed(1)}%
                  </p>
                  <p className="text-sm text-green-700 mt-1">Menu Seimbang</p>
                </div>
                <div className="text-center p-6 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
                  <p className="text-3xl font-bold text-orange-600">25g</p>
                  <p className="text-sm text-orange-700 mt-1">Rata-rata Protein</p>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="costs" className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Analisis Biaya</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-6 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                  <p className="text-3xl font-bold text-blue-600">{formatCost(stats.averageCost)}</p>
                  <p className="text-sm text-blue-700 mt-1">Rata-rata Biaya</p>
                </div>
                <div className="text-center p-6 bg-green-50 dark:bg-green-950/20 rounded-lg">
                  <p className="text-3xl font-bold text-green-600">{formatCost(3500)}</p>
                  <p className="text-sm text-green-700 mt-1">Biaya Terendah</p>
                </div>
                <div className="text-center p-6 bg-red-50 dark:bg-red-950/20 rounded-lg">
                  <p className="text-3xl font-bold text-red-600">{formatCost(8500)}</p>
                  <p className="text-sm text-red-700 mt-1">Biaya Tertinggi</p>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}