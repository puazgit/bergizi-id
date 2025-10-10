'use client'

import { useState } from 'react'
import { usePerformanceReviews } from '../hooks/usePerformanceReviews'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { TrendingUp, Star, Target, Award, Plus, Eye } from 'lucide-react'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'
import Link from 'next/link'
import type { PerformanceReview as PerformanceReviewType } from '../types'

interface PerformanceReviewProps {
  employeeId?: string
}

export function PerformanceReview({ employeeId }: PerformanceReviewProps) {
  const [selectedReview, setSelectedReview] = useState<PerformanceReviewType | null>(null)
  
  const {
    performanceReviews,
    performanceMetrics,
    isLoading
  } = usePerformanceReviews({ employeeId })

  const getPerformanceLevelBadge = (level: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      OUTSTANDING: 'default',
      EXCEEDS: 'default',
      MEETS: 'secondary',
      BELOW: 'destructive',
      UNSATISFACTORY: 'destructive'
    }
    return variants[level] || 'outline'
  }

  const getPerformanceLevelColor = (level: string) => {
    switch (level) {
      case 'OUTSTANDING':
        return 'text-green-600'
      case 'EXCEEDS':
        return 'text-blue-600'
      case 'MEETS':
        return 'text-yellow-600'
      case 'BELOW':
        return 'text-orange-600'
      case 'UNSATISFACTORY':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  const renderSkillRating = (rating: number) => {
    return (
      <div className="flex items-center space-x-2">
        <Progress value={rating * 20} className="flex-1 h-2" />
        <span className="text-sm font-medium">{rating.toFixed(1)}</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {employeeId ? 'Evaluasi Kinerja Karyawan' : 'Manajemen Kinerja'}
          </h1>
          <p className="text-muted-foreground mt-1">
            Pantau dan kelola evaluasi kinerja karyawan
          </p>
        </div>
        <Button asChild>
          <Link href={employeeId ? `/hrd/performance/${employeeId}/create` : '/hrd/performance/create'}>
            <Plus className="w-4 h-4 mr-2" />
            Buat Evaluasi
          </Link>
        </Button>
      </div>

      {/* Performance Metrics */}
      {performanceMetrics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Rata-rata Skor</p>
                  <p className="text-2xl font-bold text-foreground">
                    {performanceMetrics.averageScore.toFixed(1)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Star className="w-5 h-5 text-yellow-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Evaluasi Selesai</p>
                  <p className="text-2xl font-bold text-foreground">{performanceMetrics.completedReviews}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Target className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Target Tercapai</p>
                  <p className="text-2xl font-bold text-foreground">{performanceMetrics.achievedGoals}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Award className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Peningkatan</p>
                  <p className="text-2xl font-bold text-foreground">+{performanceMetrics.improvementRate}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Performance Reviews Table */}
      <Card>
        <CardHeader>
          <CardTitle>Riwayat Evaluasi Kinerja</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Periode</TableHead>
                  <TableHead>Jenis Evaluasi</TableHead>
                  <TableHead>Skor Keseluruhan</TableHead>
                  <TableHead>Level Kinerja</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {performanceReviews?.map((review) => (
                  <TableRow key={review.id}>
                    <TableCell className="font-medium">
                      {review.reviewPeriod}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {review.reviewType.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Progress value={review.overallScore * 20} className="w-16 h-2" />
                        <span className="font-medium">{review.overallScore.toFixed(1)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={getPerformanceLevelBadge(review.performanceLevel)}
                        className={getPerformanceLevelColor(review.performanceLevel)}
                      >
                        {review.performanceLevel}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={review.status === 'COMPLETED' ? 'default' : 'secondary'}>
                        {review.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(review.reviewPeriodEnd, 'dd MMM yyyy', { locale: id })}
                    </TableCell>
                    <TableCell className="text-right">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => setSelectedReview(review)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl">
                          <DialogHeader>
                            <DialogTitle>
                              Detail Evaluasi Kinerja - {selectedReview?.reviewPeriod}
                            </DialogTitle>
                          </DialogHeader>
                          {selectedReview && (
                            <div className="space-y-6">
                              {/* Overall Score */}
                              <Card>
                                <CardContent className="p-4">
                                  <div className="text-center space-y-2">
                                    <h3 className="text-lg font-semibold">Skor Keseluruhan</h3>
                                    <div className="text-4xl font-bold text-primary">
                                      {selectedReview.overallScore.toFixed(1)}/5.0
                                    </div>
                                    <Badge 
                                      variant={getPerformanceLevelBadge(selectedReview.performanceLevel)}
                                      className="text-sm"
                                    >
                                      {selectedReview.performanceLevel}
                                    </Badge>
                                  </div>
                                </CardContent>
                              </Card>

                              {/* Skill Ratings */}
                              <Card>
                                <CardHeader>
                                  <CardTitle>Penilaian Kompetensi</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                  {Object.entries(selectedReview.skillRatings).map(([skill, rating]) => (
                                    <div key={skill}>
                                      <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm font-medium capitalize">
                                          {skill.replace(/([A-Z])/g, ' $1').trim()}
                                        </span>
                                        <span className="text-sm font-bold">{rating}/5</span>
                                      </div>
                                      {renderSkillRating(rating)}
                                    </div>
                                  ))}
                                </CardContent>
                              </Card>

                              {/* Goals & Achievements */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Card>
                                  <CardHeader>
                                    <CardTitle>Pencapaian</CardTitle>
                                  </CardHeader>
                                  <CardContent>
                                    <ul className="space-y-2">
                                      {selectedReview.achievements.map((achievement, index) => (
                                        <li key={index} className="flex items-start space-x-2">
                                          <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                                          <span className="text-sm">{achievement}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </CardContent>
                                </Card>

                                <Card>
                                  <CardHeader>
                                    <CardTitle>Area Pengembangan</CardTitle>
                                  </CardHeader>
                                  <CardContent>
                                    <ul className="space-y-2">
                                      {selectedReview.areasForImprovement.map((area, index) => (
                                        <li key={index} className="flex items-start space-x-2">
                                          <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                                          <span className="text-sm">{area}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </CardContent>
                                </Card>
                              </div>

                              {/* Feedback */}
                              {selectedReview.feedback && (
                                <Card>
                                  <CardHeader>
                                    <CardTitle>Feedback</CardTitle>
                                  </CardHeader>
                                  <CardContent>
                                    <p className="text-sm leading-relaxed">{selectedReview.feedback}</p>
                                  </CardContent>
                                </Card>
                              )}
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          
          {performanceReviews?.length === 0 && !isLoading && (
            <div className="text-center py-8 text-muted-foreground">
              Belum ada evaluasi kinerja
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}