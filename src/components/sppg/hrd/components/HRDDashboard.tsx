// HRD Dashboard Component
// src/components/sppg/hrd/components/HRDDashboard.tsx

'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Users, 
  UserCheck, 
  Clock, 
  Award,
  TrendingUp,
  Calendar,
  BarChart3,
  Settings
} from 'lucide-react'
import { useEmployees } from '../hooks/useEmployees'
import { EmployeeList } from './EmployeeList'
import { AttendanceTracker } from './AttendanceTracker'
import { PerformanceReview } from './PerformanceReview'
import { TrainingManagement } from './TrainingManagement'

export function HRDDashboard() {
  const [activeTab, setActiveTab] = useState('overview')
  const { metrics: metricsData } = useEmployees()

  const metrics = metricsData || {
    totalEmployees: 0,
    activeEmployees: 0,
    attendanceRate: 0,
    turnoverRate: 0
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Dashboard HRD
          </h1>
          <p className="text-muted-foreground">
            Kelola SDM dan karyawan SPPG Anda
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Settings className="w-4 h-4 mr-2" />
            Pengaturan
          </Button>
          <Button>
            <Users className="w-4 h-4 mr-2" />
            Tambah Karyawan
          </Button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Karyawan
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {metrics.totalEmployees}
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+2</span> dari bulan lalu
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Karyawan Aktif
            </CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {metrics.activeEmployees}
            </div>
            <p className="text-xs text-muted-foreground">
              <Badge variant="secondary" className="text-xs">
                {((metrics.activeEmployees / metrics.totalEmployees) * 100).toFixed(1)}%
              </Badge> dari total
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tingkat Kehadiran
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {metrics.attendanceRate}%
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+1.2%</span> dari bulan lalu
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Turnover Rate
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {metrics.turnoverRate}%
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="text-red-600">+0.3%</span> dari bulan lalu
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full lg:w-auto grid-cols-2 lg:grid-cols-5">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            <span className="hidden sm:inline">Overview</span>
          </TabsTrigger>
          <TabsTrigger value="employees" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span className="hidden sm:inline">Karyawan</span>
          </TabsTrigger>
          <TabsTrigger value="attendance" className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span className="hidden sm:inline">Kehadiran</span>
          </TabsTrigger>
          <TabsTrigger value="training" className="flex items-center gap-2">
            <Award className="w-4 h-4" />
            <span className="hidden sm:inline">Pelatihan</span>
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span className="hidden sm:inline">Evaluasi</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Aksi Cepat</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <Users className="w-4 h-4 mr-2" />
                  Tambah Karyawan Baru
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Clock className="w-4 h-4 mr-2" />
                  Input Kehadiran Manual
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Award className="w-4 h-4 mr-2" />
                  Buat Pelatihan Baru
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Calendar className="w-4 h-4 mr-2" />
                  Jadwalkan Evaluasi
                </Button>
              </CardContent>
            </Card>

            {/* Recent Activities */}
            <Card>
              <CardHeader>
                <CardTitle>Aktivitas Terbaru</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Badge variant="outline" className="w-2 h-2 p-0 bg-green-500" />
                  <div className="flex-1 text-sm">
                    <p className="font-medium">Karyawan baru bergabung</p>
                    <p className="text-muted-foreground">Ahmad Kusuma - Bagian Produksi</p>
                  </div>
                  <span className="text-xs text-muted-foreground">2 jam lalu</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Badge variant="outline" className="w-2 h-2 p-0 bg-blue-500" />
                  <div className="flex-1 text-sm">
                    <p className="font-medium">Pelatihan selesai</p>
                    <p className="text-muted-foreground">Hygiene dan Sanitasi - 15 peserta</p>
                  </div>
                  <span className="text-xs text-muted-foreground">1 hari lalu</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Badge variant="outline" className="w-2 h-2 p-0 bg-yellow-500" />
                  <div className="flex-1 text-sm">
                    <p className="font-medium">Evaluasi pending</p>
                    <p className="text-muted-foreground">5 karyawan perlu evaluasi</p>
                  </div>
                  <span className="text-xs text-muted-foreground">3 hari lalu</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="employees">
          <EmployeeList />
        </TabsContent>

        <TabsContent value="attendance">
          <AttendanceTracker />
        </TabsContent>

        <TabsContent value="training">
          <TrainingManagement />
        </TabsContent>

        <TabsContent value="performance">
          <PerformanceReview />
        </TabsContent>
      </Tabs>
    </div>
  )
}