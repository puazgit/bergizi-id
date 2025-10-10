'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { 
  Search, 
  Filter, 
  Star, 
  MessageSquare, 
  Clock, 
  ChevronDown,
  ChevronUp,
  Eye,
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react'
import Image from 'next/image'
import { FeedbackType, FeedbackStatus, FeedbackPriority } from '@prisma/client'
import { useFeedback, useFeedbackFilters } from '../hooks'
import { FeedbackData } from '../types'
import { 
  getFeedbackStatusInfo, 
  getFeedbackTypeInfo, 
  getFeedbackPriorityInfo,
  getBeneficiaryTypeInfo,
  formatTimeAgo,
  getFeedbackStatusBadgeClass,
  getFeedbackTypeBadgeClass,
  getFeedbackPriorityBadgeClass
} from '../utils'

// ================================ MAIN COMPONENT ================================

export function FeedbackList() {
  const [selectedFeedback, setSelectedFeedback] = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  
  const {
    filters,
    updateFilter,
    clearFilters,
    toggleStatus,
    toggleFeedbackType,
    togglePriority,
    hasActiveFilters
  } = useFeedbackFilters()

  const { 
    feedback, 
    isLoading, 
    error, 
    updateStatus,
    isUpdatingStatus
  } = useFeedback(filters)

  const handleStatusChange = (feedbackId: string, status: FeedbackStatus) => {
    updateStatus({ feedbackId, status })
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="p-6 animate-pulse">
            <div className="h-4 bg-muted rounded w-3/4 mb-2" />
            <div className="h-3 bg-muted rounded w-1/2 mb-4" />
            <div className="h-3 bg-muted rounded w-full mb-2" />
            <div className="h-3 bg-muted rounded w-2/3" />
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <Card className="p-6 text-center">
        <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Gagal Memuat Feedback</h3>
        <p className="text-muted-foreground mb-4">{error}</p>
        <Button onClick={() => window.location.reload()}>
          Coba Lagi
        </Button>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            Feedback Management
          </h2>
          <p className="text-muted-foreground">
            Kelola dan tanggapi feedback dari penerima manfaat
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Filter
            {showFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
          
          {hasActiveFilters && (
            <Button
              variant="outline"
              onClick={clearFilters}
              className="text-destructive hover:text-destructive"
            >
              <XCircle className="h-4 w-4 mr-2" />
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <Card className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="space-y-2">
              <Label>Pencarian</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari feedback..."
                  value={filters.search || ''}
                  onChange={(e) => updateFilter('search', e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="space-y-2">
              <Label>Status</Label>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {Object.values(FeedbackStatus).map((status) => {
                  const info = getFeedbackStatusInfo(status)
                  return (
                    <div key={status} className="flex items-center space-x-2">
                      <Checkbox
                        id={`status-${status}`}
                        checked={filters.status?.includes(status) || false}
                        onCheckedChange={() => toggleStatus(status)}
                      />
                      <Label 
                        htmlFor={`status-${status}`}
                        className="text-sm flex items-center gap-2"
                      >
                        <span>{info.icon}</span>
                        {info.label}
                      </Label>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Type Filter */}
            <div className="space-y-2">
              <Label>Jenis Feedback</Label>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {Object.values(FeedbackType).map((type) => {
                  const info = getFeedbackTypeInfo(type)
                  return (
                    <div key={type} className="flex items-center space-x-2">
                      <Checkbox
                        id={`type-${type}`}
                        checked={filters.feedbackType?.includes(type) || false}
                        onCheckedChange={() => toggleFeedbackType(type)}
                      />
                      <Label 
                        htmlFor={`type-${type}`}
                        className="text-sm flex items-center gap-2"
                      >
                        <span>{info.icon}</span>
                        {info.label}
                      </Label>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Priority Filter */}
            <div className="space-y-2">
              <Label>Prioritas</Label>
              <div className="space-y-2">
                {Object.values(FeedbackPriority).map((priority) => {
                  const info = getFeedbackPriorityInfo(priority)
                  return (
                    <div key={priority} className="flex items-center space-x-2">
                      <Checkbox
                        id={`priority-${priority}`}
                        checked={filters.priority?.includes(priority) || false}
                        onCheckedChange={() => togglePriority(priority)}
                      />
                      <Label 
                        htmlFor={`priority-${priority}`}
                        className="text-sm flex items-center gap-2"
                      >
                        <span>{info.icon}</span>
                        {info.label}
                      </Label>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <MessageSquare className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Feedback</p>
              <p className="text-2xl font-bold">{feedback?.length || 0}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
              <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Menunggu</p>
              <p className="text-2xl font-bold">
                {feedback?.filter(f => f.status === 'PENDING').length || 0}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Selesai</p>
              <p className="text-2xl font-bold">
                {feedback?.filter(f => f.status === 'RESOLVED').length || 0}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Kritis</p>
              <p className="text-2xl font-bold">
                {feedback?.filter(f => f.priority === 'CRITICAL').length || 0}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Feedback List */}
      <div className="space-y-4">
        {feedback && feedback.length > 0 ? (
          feedback.map((item) => (
            <FeedbackCard
              key={item.id}
              feedback={item}
              isExpanded={selectedFeedback === item.id}
              onToggleExpand={() => 
                setSelectedFeedback(
                  selectedFeedback === item.id ? null : item.id
                )
              }
              onStatusChange={handleStatusChange}
              isUpdatingStatus={isUpdatingStatus}
            />
          ))
        ) : (
          <Card className="p-12 text-center">
            <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Belum Ada Feedback</h3>
            <p className="text-muted-foreground">
              {hasActiveFilters 
                ? 'Tidak ada feedback yang sesuai dengan filter yang dipilih'
                : 'Belum ada feedback dari penerima manfaat'
              }
            </p>
          </Card>
        )}
      </div>
    </div>
  )
}

// ================================ FEEDBACK CARD COMPONENT ================================

interface FeedbackCardProps {
  feedback: FeedbackData
  isExpanded: boolean
  onToggleExpand: () => void
  onStatusChange: (feedbackId: string, status: FeedbackStatus) => void
  isUpdatingStatus: boolean
}

function FeedbackCard({ 
  feedback, 
  isExpanded, 
  onToggleExpand, 
  onStatusChange,
  isUpdatingStatus 
}: FeedbackCardProps) {
  const statusInfo = getFeedbackStatusInfo(feedback.status)
  const typeInfo = getFeedbackTypeInfo(feedback.feedbackType)
  const priorityInfo = getFeedbackPriorityInfo(feedback.priority)
  const beneficiaryInfo = getBeneficiaryTypeInfo(feedback.beneficiaryType)

  return (
    <Card className="transition-all duration-200 hover:shadow-md">
      {/* Card Header */}
      <div className="p-4 cursor-pointer" onClick={onToggleExpand}>
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="text-xs">
                  {feedback.anonymous 
                    ? '?' 
                    : feedback.beneficiaryName.charAt(0).toUpperCase()
                  }
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-foreground truncate">
                    {feedback.anonymous ? 'Anonim' : feedback.beneficiaryName}
                  </h3>
                  <Badge variant="outline" className="text-xs">
                    {beneficiaryInfo.icon} {beneficiaryInfo.label}
                  </Badge>
                </div>
                
                <p className="text-sm text-muted-foreground truncate">
                  {feedback.subject}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <Badge className={getFeedbackStatusBadgeClass(feedback.status)}>
                {statusInfo.icon} {statusInfo.label}
              </Badge>
              
              <Badge className={getFeedbackTypeBadgeClass(feedback.feedbackType)}>
                {typeInfo.icon} {typeInfo.label}
              </Badge>
              
              <Badge className={getFeedbackPriorityBadgeClass(feedback.priority)}>
                {priorityInfo.icon} {priorityInfo.label}
              </Badge>

              {feedback.rating && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  {feedback.rating}/5
                </div>
              )}

              {feedback.responseRequired && (
                <Badge variant="outline" className="text-xs text-orange-600 dark:text-orange-400">
                  💬 Perlu Tanggapan
                </Badge>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 ml-4">
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {formatTimeAgo(new Date(feedback.createdAt))}
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="p-1 h-auto"
            >
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <>
          <Separator />
          <div className="p-4 space-y-4">
            {/* Message */}
            <div>
              <h4 className="font-medium mb-2">Pesan</h4>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {feedback.message}
              </p>
            </div>

            {/* Additional Info */}
            {(feedback.school || feedback.grade || feedback.age) && (
              <div>
                <h4 className="font-medium mb-2">Informasi Tambahan</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                  {feedback.school && (
                    <div>
                      <span className="text-muted-foreground">Sekolah:</span>
                      <p className="font-medium">{feedback.school}</p>
                    </div>
                  )}
                  {feedback.grade && (
                    <div>
                      <span className="text-muted-foreground">Kelas:</span>  
                      <p className="font-medium">{feedback.grade}</p>
                    </div>
                  )}
                  {feedback.age && (
                    <div>
                      <span className="text-muted-foreground">Usia:</span>
                      <p className="font-medium">{feedback.age} tahun</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tags */}
            {feedback.tags && feedback.tags.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Tag</h4>
                <div className="flex flex-wrap gap-1">
                  {feedback.tags.map((tag: string, index: number) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Photos */}
            {feedback.photos && feedback.photos.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Foto</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {feedback.photos.map((photo: string, index: number) => (
                    <div key={index} className="relative group">
                      <Image
                        src={photo}
                        alt={`Foto ${index + 1}`}
                        width={80}
                        height={80}
                        className="w-full h-20 object-cover rounded border"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded flex items-center justify-center">
                        <Eye className="h-4 w-4 text-white" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Response */}
            {feedback.staffResponse && (
              <div>
                <h4 className="font-medium mb-2">Tanggapan Staff</h4>
                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="text-sm text-muted-foreground mb-2">
                    {feedback.staffResponse}
                  </p>
                  {feedback.actionTaken && (
                    <div className="mt-2 pt-2 border-t border-border">
                      <span className="text-xs text-muted-foreground">Tindakan:</span>
                      <p className="text-xs text-muted-foreground">{feedback.actionTaken}</p>
                    </div>
                  )}
                  {feedback.respondedAt && (
                    <div className="mt-2 text-xs text-muted-foreground">
                      Direspon: {formatTimeAgo(new Date(feedback.respondedAt))}
                      {feedback.respondedBy && ` oleh ${feedback.respondedBy}`}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <Select
                value={feedback.status}
                onValueChange={(status: FeedbackStatus) => 
                  onStatusChange(feedback.id, status)
                }
                disabled={isUpdatingStatus}
              >
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(FeedbackStatus).map((status) => {
                    const info = getFeedbackStatusInfo(status)
                    return (
                      <SelectItem key={status} value={status}>
                        <div className="flex items-center gap-2">
                          <span>{info.icon}</span>
                          {info.label}
                        </div>
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>

              <Button variant="outline" size="sm">
                <MessageSquare className="h-4 w-4 mr-2" />
                Tanggapi
              </Button>
            </div>
          </div>
        </>
      )}
    </Card>
  )
}