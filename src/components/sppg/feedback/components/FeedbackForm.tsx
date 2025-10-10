'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'

import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { FeedbackType, BeneficiaryType } from '@prisma/client'
import { useFeedback, useFeedbackForm, CreateFeedbackData } from '../hooks'
import { getFeedbackTypeInfo, getBeneficiaryTypeInfo } from '../utils'
import { validateCreateFeedback, FEEDBACK_CONSTANTS } from '../types'
import { Star, Upload, X, Plus, Info, Send, ArrowLeft, ArrowRight } from 'lucide-react'
import Image from 'next/image'

// ================================ MAIN COMPONENT ================================

export function FeedbackForm() {
  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 4
  
  const { createFeedback, isCreating } = useFeedback()
  const {
    formData,
    updateField,
    addTag,
    removeTag,
    addPhoto,
    removePhoto,
    resetForm,
    isValid
  } = useFeedbackForm()

  const progress = (currentStep / totalSteps) * 100

  const handleSubmit = () => {
    if (!isValid) {
      toast.error('Mohon lengkapi semua field yang wajib diisi')
      return
    }

    const validation = validateCreateFeedback(formData)
    if (!validation.success) {
      const firstError = validation.error.issues[0]
      toast.error(firstError.message)
      return
    }

    createFeedback(validation.data)
    resetForm()
    setCurrentStep(1)
  }

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const canProceedToStep2 = formData.beneficiaryName && formData.beneficiaryType
  const canProceedToStep3 = canProceedToStep2 && formData.feedbackType && formData.subject && formData.message
  const canProceedToStep4 = canProceedToStep3

  return (
    <Card className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Formulir Feedback
        </h2>
        <p className="text-muted-foreground">
          Berikan feedback Anda untuk membantu kami meningkatkan layanan
        </p>
        
        {/* Progress */}
        <div className="mt-6">
          <div className="flex justify-between text-sm text-muted-foreground mb-2">
            <span>Langkah {currentStep} dari {totalSteps}</span>
            <span>{Math.round(progress)}% selesai</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      {/* Step Content */}
      <div className="min-h-[400px]">
        {currentStep === 1 && (
          <BeneficiaryInfoStep 
            formData={formData} 
            updateField={updateField} 
          />
        )}
        
        {currentStep === 2 && (
          <FeedbackContentStep 
            formData={formData} 
            updateField={updateField} 
          />
        )}
        
        {currentStep === 3 && (
          <AdditionalInfoStep 
            formData={formData} 
            updateField={updateField}
            addTag={addTag}
            removeTag={removeTag}
            addPhoto={addPhoto}
            removePhoto={removePhoto}
          />
        )}
        
        {currentStep === 4 && (
          <ReviewStep 
            formData={formData} 
            updateField={updateField}
          />
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center mt-8 pt-6 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={prevStep}
          disabled={currentStep === 1}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Sebelumnya
        </Button>

        <div className="flex gap-2">
          {[1, 2, 3, 4].map((step) => (
            <div
              key={step}
              className={`w-2 h-2 rounded-full ${
                step <= currentStep 
                  ? 'bg-primary' 
                  : 'bg-muted'
              }`}
            />
          ))}
        </div>

        {currentStep < totalSteps ? (
          <Button
            type="button"
            onClick={nextStep}
            disabled={
              (currentStep === 1 && !canProceedToStep2) ||
              (currentStep === 2 && !canProceedToStep3) ||
              (currentStep === 3 && !canProceedToStep4)
            }
            className="flex items-center gap-2"
          >
            Selanjutnya
            <ArrowRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={!isValid || isCreating}
            className="flex items-center gap-2"
          >
            {isCreating ? (
              <>
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                Mengirim...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Kirim Feedback
              </>
            )}
          </Button>
        )}
      </div>
    </Card>
  )
}

// ================================ STEP COMPONENTS ================================

interface StepProps {
  formData: Partial<CreateFeedbackData>
  updateField: (field: keyof CreateFeedbackData, value: CreateFeedbackData[keyof CreateFeedbackData]) => void
}

function BeneficiaryInfoStep({ formData, updateField }: StepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Info className="h-5 w-5 text-primary" />
          Informasi Penerima Manfaat
        </h3>
        <p className="text-sm text-muted-foreground mb-6">
          Mohon isi informasi Anda atau penerima manfaat yang memberikan feedback
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="beneficiaryName">
            Nama Lengkap <span className="text-red-500">*</span>
          </Label>
          <Input
            id="beneficiaryName"
            placeholder="Masukkan nama lengkap"
            value={formData.beneficiaryName || ''}
            onChange={(e) => updateField('beneficiaryName', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="beneficiaryType">
            Jenis Penerima Manfaat <span className="text-red-500">*</span>
          </Label>
          <Select 
            value={formData.beneficiaryType || ''} 
            onValueChange={(value) => updateField('beneficiaryType', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Pilih jenis penerima manfaat" />
            </SelectTrigger>
            <SelectContent>
              {Object.values(BeneficiaryType).map((type) => {
                const info = getBeneficiaryTypeInfo(type)
                return (
                  <SelectItem key={type} value={type}>
                    <div className="flex items-center gap-2">
                      <span>{info.icon}</span>
                      <span>{info.label}</span>
                    </div>
                  </SelectItem>
                )
              })}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="school">Nama Sekolah/Institusi</Label>
          <Input
            id="school"
            placeholder="Masukkan nama sekolah atau institusi"
            value={formData.school || ''}
            onChange={(e) => updateField('school', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="grade">Kelas/Tingkat</Label>
          <Input
            id="grade"
            placeholder="Contoh: Kelas 5, SMA, dll"
            value={formData.grade || ''}
            onChange={(e) => updateField('grade', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="age">Usia</Label>
          <Input
            id="age"
            type="number"
            placeholder="Masukkan usia"
            min="1"
            max="100"
            value={formData.age || ''}
            onChange={(e) => updateField('age', parseInt(e.target.value) || undefined)}
          />
        </div>
      </div>
    </div>
  )
}

function FeedbackContentStep({ formData, updateField }: StepProps) {
  const [rating, setRating] = useState(formData.rating || 0)

  const handleRatingChange = (newRating: number) => {
    setRating(newRating)
    updateField('rating', newRating)
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Send className="h-5 w-5 text-primary" />
          Isi Feedback
        </h3>
        <p className="text-sm text-muted-foreground mb-6">
          Berikan feedback Anda dengan jelas dan detail
        </p>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="feedbackType">
            Jenis Feedback <span className="text-red-500">*</span>
          </Label>
          <Select 
            value={formData.feedbackType || ''} 
            onValueChange={(value) => updateField('feedbackType', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Pilih jenis feedback" />
            </SelectTrigger>
            <SelectContent>
              {Object.values(FeedbackType).map((type) => {
                const info = getFeedbackTypeInfo(type)
                return (
                  <SelectItem key={type} value={type}>
                    <div className="flex items-center gap-2">
                      <span>{info.icon}</span>
                      <span>{info.label}</span>
                    </div>
                  </SelectItem>
                )
              })}
            </SelectContent>
          </Select>
          {formData.feedbackType && (
            <p className="text-xs text-muted-foreground mt-1">
              {getFeedbackTypeInfo(formData.feedbackType as FeedbackType).description}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="subject">
            Subjek <span className="text-red-500">*</span>
          </Label>
          <Input
            id="subject"
            placeholder="Ringkasan singkat feedback Anda"
            value={formData.subject || ''}
            onChange={(e) => updateField('subject', e.target.value)}
            maxLength={FEEDBACK_CONSTANTS.MAX_SUBJECT_LENGTH}
          />
          <p className="text-xs text-muted-foreground">
            {(formData.subject || '').length}/{FEEDBACK_CONSTANTS.MAX_SUBJECT_LENGTH} karakter
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="message">
            Pesan <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="message"
            placeholder="Jelaskan feedback Anda secara detail..."
            rows={6}
            value={formData.message || ''}
            onChange={(e) => updateField('message', e.target.value)}
            maxLength={FEEDBACK_CONSTANTS.MAX_MESSAGE_LENGTH}
          />
          <p className="text-xs text-muted-foreground">
            {(formData.message || '').length}/{FEEDBACK_CONSTANTS.MAX_MESSAGE_LENGTH} karakter
          </p>
        </div>

        <div className="space-y-2">
          <Label>Rating (Opsional)</Label>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => handleRatingChange(star)}
                className="p-1 hover:scale-110 transition-transform"
              >
                <Star
                  className={`h-6 w-6 ${
                    star <= rating
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              </button>
            ))}
            {rating > 0 && (
              <span className="text-sm text-muted-foreground ml-2">
                {rating}/5 bintang
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

interface AdditionalInfoStepProps {
  formData: Partial<CreateFeedbackData>
  updateField: (field: keyof CreateFeedbackData, value: CreateFeedbackData[keyof CreateFeedbackData]) => void
  addTag: (tag: string) => void
  removeTag: (tag: string) => void
  addPhoto: (url: string) => void
  removePhoto: (url: string) => void
}

function AdditionalInfoStep({ 
  formData, 
  updateField, 
  addTag, 
  removeTag, 
  addPhoto, 
  removePhoto 
}: AdditionalInfoStepProps) {
  const [newTag, setNewTag] = useState('')
  const [photoUrl, setPhotoUrl] = useState('')

  const handleAddTag = () => {
    if (newTag.trim() && (formData.tags || []).length < FEEDBACK_CONSTANTS.MAX_TAGS) {
      addTag(newTag.trim().toLowerCase())
      setNewTag('')
    }
  }

  const handleAddPhoto = () => {
    if (photoUrl.trim() && (formData.photos || []).length < FEEDBACK_CONSTANTS.MAX_PHOTOS) {
      addPhoto(photoUrl.trim())
      setPhotoUrl('')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Plus className="h-5 w-5 text-primary" />
          Informasi Tambahan
        </h3>
        <p className="text-sm text-muted-foreground mb-6">
          Tambahkan tag dan foto untuk melengkapi feedback Anda
        </p>
      </div>

      <div className="space-y-6">
        <div className="space-y-3">
          <Label>Tag</Label>
          <div className="flex gap-2">
            <Input
              placeholder="Tambah tag (contoh: rasa, porsi)"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
              maxLength={FEEDBACK_CONSTANTS.MAX_TAG_LENGTH}
            />
            <Button
              type="button"
              variant="outline"
              onClick={handleAddTag}
              disabled={(formData.tags || []).length >= FEEDBACK_CONSTANTS.MAX_TAGS}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          {formData.tags && formData.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag: string, index: number) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
          
          <p className="text-xs text-muted-foreground">
            {(formData.tags || []).length}/{FEEDBACK_CONSTANTS.MAX_TAGS} tag
          </p>
        </div>

        <div className="space-y-3">
          <Label>Foto Pendukung</Label>
          <div className="flex gap-2">
            <Input
              placeholder="URL foto"
              value={photoUrl}
              onChange={(e) => setPhotoUrl(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddPhoto()}
            />
            <Button
              type="button"
              variant="outline"
              onClick={handleAddPhoto}
              disabled={(formData.photos || []).length >= FEEDBACK_CONSTANTS.MAX_PHOTOS}
            >
              <Upload className="h-4 w-4" />
            </Button>
          </div>
          
          {formData.photos && formData.photos.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {formData.photos.map((photo: string, index: number) => (
                <div key={index} className="relative group">
                  <Image
                    src={photo}
                    alt={`Foto ${index + 1}`}
                    width={96}
                    height={96}
                    className="w-full h-24 object-cover rounded border"
                  />
                  <button
                    type="button"
                    onClick={() => removePhoto(photo)}
                    className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
          
          <p className="text-xs text-muted-foreground">
            {(formData.photos || []).length}/{FEEDBACK_CONSTANTS.MAX_PHOTOS} foto
          </p>
        </div>

        <Separator />

        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="anonymous"
              checked={formData.anonymous || false}
              onCheckedChange={(checked) => updateField('anonymous', checked)}
            />
            <Label htmlFor="anonymous" className="text-sm">
              Kirim sebagai anonim
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="responseRequired"
              checked={formData.responseRequired || false}
              onCheckedChange={(checked) => updateField('responseRequired', checked)}
            />
            <Label htmlFor="responseRequired" className="text-sm">
              Memerlukan tanggapan
            </Label>
          </div>
        </div>
      </div>
    </div>
  )
}

function ReviewStep({ formData }: StepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Info className="h-5 w-5 text-primary" />
          Review Feedback
        </h3>
        <p className="text-sm text-muted-foreground mb-6">
          Periksa kembali feedback Anda sebelum mengirim
        </p>
      </div>

      <div className="space-y-4">
        <Card className="p-4">
          <h4 className="font-medium mb-3">Informasi Penerima Manfaat</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Nama:</span>
              <p className="font-medium">{formData.beneficiaryName || '-'}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Jenis:</span>
              <p className="font-medium">
                {formData.beneficiaryType ? getBeneficiaryTypeInfo(formData.beneficiaryType as BeneficiaryType).label : '-'}
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">Sekolah:</span>
              <p className="font-medium">{formData.school || '-'}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Kelas:</span>
              <p className="font-medium">{formData.grade || '-'}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <h4 className="font-medium mb-3">Isi Feedback</h4>
          <div className="space-y-3 text-sm">
            <div>
              <span className="text-muted-foreground">Jenis:</span>
              <p className="font-medium">
                {formData.feedbackType ? getFeedbackTypeInfo(formData.feedbackType as FeedbackType).label : '-'}
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">Subjek:</span>
              <p className="font-medium">{formData.subject || '-'}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Pesan:</span>
              <p className="font-medium whitespace-pre-wrap">{formData.message || '-'}</p>
            </div>
            {formData.rating && (
              <div>
                <span className="text-muted-foreground">Rating:</span>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-4 w-4 ${
                        star <= (formData.rating || 0)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                  <span className="ml-2">{formData.rating}/5</span>
                </div>
              </div>
            )}
          </div>
        </Card>

        {((formData.tags && formData.tags.length > 0) || 
          (formData.photos && formData.photos.length > 0) || 
          formData.anonymous || 
          formData.responseRequired) && (
          <Card className="p-4">
            <h4 className="font-medium mb-3">Informasi Tambahan</h4>
            <div className="space-y-3 text-sm">
              {formData.tags && formData.tags.length > 0 && (
                <div>
                  <span className="text-muted-foreground">Tag:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {formData.tags.map((tag: string, index: number) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {formData.photos && formData.photos.length > 0 && (
                <div>
                  <span className="text-muted-foreground">Foto:</span>
                  <p className="font-medium">{formData.photos.length} foto terlampir</p>
                </div>
              )}
              
              <div className="flex gap-4">
                {formData.anonymous && (
                  <span className="text-xs bg-secondary px-2 py-1 rounded">
                    📝 Anonim
                  </span>
                )}
                {formData.responseRequired && (
                  <span className="text-xs bg-secondary px-2 py-1 rounded">
                    💬 Perlu Tanggapan
                  </span>
                )}
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}