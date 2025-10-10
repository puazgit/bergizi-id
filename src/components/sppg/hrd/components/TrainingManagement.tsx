// Training Management Component
// src/components/sppg/hrd/components/TrainingManagement.tsx

'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Plus, 
  Search, 
  Calendar,
  Users,
  Clock,
  MapPin,
  Award,
  Download
} from 'lucide-react'

// Utility function for date formatting
const formatDate = (date: Date): string => {
  return date.toLocaleDateString('id-ID', { 
    day: '2-digit', 
    month: 'short', 
    year: 'numeric' 
  })
}
import type { Training, TrainingStatus } from '../types'

export function TrainingManagement() {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<TrainingStatus | 'ALL'>('ALL')

  // Mock data - replace with real API call
  const trainings: Training[] = [
    {
      id: '1',
      sppgId: 'sppg-1',
      trainingCode: 'TRN-001',
      trainingName: 'Hygiene dan Sanitasi Makanan',
      description: 'Pelatihan dasar tentang kebersihan dan sanitasi dalam pengolahan makanan',
      category: 'Food Safety',
      provider: 'Internal',
      startDate: new Date('2024-01-15'),
      endDate: new Date('2024-01-16'),
      duration: 16,
      location: 'Ruang Training A',
      mode: 'Offline',
      maxParticipants: 20,
      currentParticipants: 15,
      costPerParticipant: 150000,
      materials: ['Modul Hygiene', 'Checklist Sanitasi'],
      prerequisites: ['Karyawan Baru', 'Staff Dapur'],
      objectives: ['Memahami prinsip hygiene', 'Menerapkan sanitasi yang benar'],
      providesCertificate: true,
      certificateName: 'Sertifikat Hygiene dan Sanitasi',
      status: 'COMPLETED',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '2',
      sppgId: 'sppg-1',
      trainingCode: 'TRN-002',
      trainingName: 'Manajemen Gizi dan Menu',
      description: 'Pelatihan untuk ahli gizi dalam merencanakan menu yang seimbang',
      category: 'Nutrition',
      provider: 'External',
      providerName: 'Institut Gizi Indonesia',
      startDate: new Date('2024-02-01'),
      endDate: new Date('2024-02-03'),
      duration: 24,
      location: 'Hotel Santika',
      mode: 'Offline',
      maxParticipants: 15,
      currentParticipants: 12,
      costPerParticipant: 500000,
      materials: ['Buku Panduan Gizi', 'Software Analisis Gizi'],
      prerequisites: ['Ahli Gizi', 'Minimal D3 Gizi'],
      objectives: ['Merencanakan menu seimbang', 'Analisis nilai gizi'],
      providesCertificate: true,
      certificateName: 'Sertifikat Manajemen Gizi',
      validityPeriod: 24,
      status: 'ONGOING',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]

  const getStatusColor = (status: TrainingStatus): string => {
    const colors = {
      PLANNED: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      ONGOING: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      COMPLETED: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      CANCELLED: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      POSTPONED: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
    }
    return colors[status]
  }

  const getStatusLabel = (status: TrainingStatus): string => {
    const labels = {
      PLANNED: 'Direncanakan',
      ONGOING: 'Berlangsung',
      COMPLETED: 'Selesai',
      CANCELLED: 'Dibatalkan',
      POSTPONED: 'Ditunda'
    }
    return labels[status]
  }

  const filteredTrainings = trainings.filter(training => {
    const matchesSearch = training.trainingName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         training.trainingCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         training.category.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'ALL' || training.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            Manajemen Pelatihan
          </h2>
          <p className="text-muted-foreground">
            Kelola program pelatihan dan pengembangan karyawan
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Buat Pelatihan
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total Pelatihan</p>
                <p className="text-2xl font-bold">{trainings.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-yellow-500" />
              <div>
                <p className="text-sm text-muted-foreground">Sedang Berlangsung</p>
                <p className="text-2xl font-bold">
                  {trainings.filter(t => t.status === 'ONGOING').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total Peserta</p>
                <p className="text-2xl font-bold">
                  {trainings.reduce((sum, t) => sum + t.currentParticipants, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Award className="w-4 h-4 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Selesai</p>
                <p className="text-2xl font-bold">
                  {trainings.filter(t => t.status === 'COMPLETED').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Cari pelatihan, kode, atau kategori..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={statusFilter === 'ALL' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('ALL')}
              >
                Semua
              </Button>
              <Button
                variant={statusFilter === 'PLANNED' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('PLANNED')}
              >
                Direncanakan
              </Button>
              <Button
                variant={statusFilter === 'ONGOING' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('ONGOING')}
              >
                Berlangsung
              </Button>
              <Button
                variant={statusFilter === 'COMPLETED' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('COMPLETED')}
              >
                Selesai
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Training List */}
      <div className="grid gap-4">
        {filteredTrainings.map((training) => (
          <Card key={training.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">
                        {training.trainingName}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {training.trainingCode} • {training.category}
                      </p>
                    </div>
                    <Badge className={getStatusColor(training.status)}>
                      {getStatusLabel(training.status)}
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {training.description}
                  </p>

                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span>{formatDate(training.startDate)} - {formatDate(training.endDate)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span>{training.duration} jam</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span>{training.location || training.mode}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <span>{training.currentParticipants}/{training.maxParticipants} peserta</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 lg:flex-col">
                  <Button variant="outline" size="sm">
                    Lihat Detail
                  </Button>
                  <Button variant="outline" size="sm">
                    Kelola Peserta
                  </Button>
                  {training.status === 'PLANNED' && (
                    <Button size="sm">
                      Mulai Pelatihan
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTrainings.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Award className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Tidak ada pelatihan
            </h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery || statusFilter !== 'ALL' 
                ? 'Tidak ditemukan pelatihan yang sesuai dengan filter'
                : 'Belum ada pelatihan yang dibuat'
              }
            </p>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Buat Pelatihan Pertama
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}