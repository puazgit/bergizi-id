// Program Form Component - Pattern 2 Architecture
// Bergizi-ID SaaS Platform - SPPG Program Management
// src/components/sppg/menu/components/ProgramForm.tsx

'use client'

import { type FC, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Checkbox } from '@/components/ui/checkbox'
import { CalendarIcon, Loader2, Plus, X } from 'lucide-react'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { ProgramType, TargetGroup } from '@prisma/client'
import { type ProgramWithDetails } from '../types'
import { usePrograms } from '../hooks'

// ============================================================================
// VALIDATION SCHEMA
// ============================================================================

const programFormSchema = z.object({
  name: z.string().min(3, 'Nama program minimal 3 karakter').max(100),
  description: z.string().optional(),
  programType: z.nativeEnum(ProgramType),
  targetGroup: z.nativeEnum(TargetGroup),
  
  // Nutrition Goals
  calorieTarget: z.number().min(0).optional(),
  proteinTarget: z.number().min(0).optional(),
  carbTarget: z.number().min(0).optional(),
  fatTarget: z.number().min(0).optional(),
  fiberTarget: z.number().min(0).optional(),
  
  // Schedule
  startDate: z.date(),
  endDate: z.date().optional().nullable(),
  feedingDays: z.array(z.number()).min(1, 'Pilih minimal 1 hari'),
  mealsPerDay: z.number().int().min(1).max(5),
  
  // Budget & Targets
  totalBudget: z.number().min(0).optional(),
  budgetPerMeal: z.number().min(0).optional(),
  targetRecipients: z.number().int().min(1),
  
  // Location
  implementationArea: z.string().min(3),
  partnerSchools: z.array(z.string()).min(0)
})

type ProgramFormData = z.infer<typeof programFormSchema>

// ============================================================================
// COMPONENT
// ============================================================================

interface ProgramFormProps {
  initialData?: ProgramWithDetails
  onSuccess?: () => void
  onCancel?: () => void
}

export const ProgramForm: FC<ProgramFormProps> = ({
  initialData,
  onSuccess,
  onCancel
}) => {
  const { createProgram, updateProgram, isCreating, isUpdating } = usePrograms()
  const [partnerSchoolInput, setPartnerSchoolInput] = useState('')
  const [partnerSchools, setPartnerSchools] = useState<string[]>(
    initialData?.partnerSchools || []
  )

  const form = useForm<ProgramFormData>({
    resolver: zodResolver(programFormSchema),
    defaultValues: initialData ? {
      name: initialData.name,
      description: initialData.description || '',
      programType: initialData.programType,
      targetGroup: initialData.targetGroup,
      calorieTarget: initialData.calorieTarget || undefined,
      proteinTarget: initialData.proteinTarget || undefined,
      carbTarget: initialData.carbTarget || undefined,
      fatTarget: initialData.fatTarget || undefined,
      fiberTarget: initialData.fiberTarget || undefined,
      startDate: new Date(initialData.startDate),
      endDate: initialData.endDate ? new Date(initialData.endDate) : null,
      feedingDays: initialData.feedingDays,
      mealsPerDay: initialData.mealsPerDay,
      totalBudget: initialData.totalBudget || undefined,
      budgetPerMeal: initialData.budgetPerMeal || undefined,
      targetRecipients: initialData.targetRecipients,
      implementationArea: initialData.implementationArea,
      partnerSchools: initialData.partnerSchools
    } : {
      mealsPerDay: 1,
      feedingDays: [1, 2, 3, 4, 5], // Default: weekdays
      targetRecipients: 100,
      startDate: new Date(),
      partnerSchools: []
    }
  })

  const handleSubmit = async (data: ProgramFormData) => {
    // Convert Date objects to ISO strings for server action
    // Also convert null to undefined for endDate compatibility
    const formData = {
      ...data,
      startDate: data.startDate instanceof Date ? data.startDate.toISOString() : data.startDate,
      endDate: data.endDate instanceof Date 
        ? data.endDate.toISOString() 
        : data.endDate || undefined, // Convert null to undefined
      partnerSchools
    }

    if (initialData) {
      updateProgram({
        programId: initialData.id,
        data: formData
      }, {
        onSuccess: () => {
          onSuccess?.()
        }
      })
    } else {
      createProgram(formData, {
        onSuccess: () => {
          form.reset()
          setPartnerSchools([])
          onSuccess?.()
        }
      })
    }
  }

  const addPartnerSchool = () => {
    if (partnerSchoolInput.trim() && !partnerSchools.includes(partnerSchoolInput.trim())) {
      setPartnerSchools([...partnerSchools, partnerSchoolInput.trim()])
      setPartnerSchoolInput('')
    }
  }

  const removePartnerSchool = (school: string) => {
    setPartnerSchools(partnerSchools.filter(s => s !== school))
  }

  const isSubmitting = isCreating || isUpdating

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)}>
      <Card>
        <CardHeader>
          <CardTitle>
            {initialData ? 'Edit Program' : 'Buat Program Baru'}
          </CardTitle>
          <CardDescription>
            {initialData 
              ? 'Perbarui informasi program nutrisi' 
              : 'Tambahkan program nutrisi baru untuk SPPG Anda'
            }
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">Informasi Dasar</h3>
            
            <div className="space-y-2">
              <Label htmlFor="name">Nama Program *</Label>
              <Input
                id="name"
                {...form.register('name')}
                placeholder="Contoh: Program Makan Siang SD 2024"
                disabled={isSubmitting}
              />
              {form.formState.errors.name && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Deskripsi</Label>
              <Textarea
                id="description"
                {...form.register('description')}
                placeholder="Deskripsi program..."
                rows={3}
                disabled={isSubmitting}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="programType">Tipe Program *</Label>
                <Select
                  value={form.watch('programType')}
                  onValueChange={(value) => form.setValue('programType', value as ProgramType)}
                  disabled={isSubmitting}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih tipe" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PMT_PEMULIHAN">PMT Pemulihan</SelectItem>
                    <SelectItem value="PMT_PENYULUHAN">PMT Penyuluhan</SelectItem>
                    <SelectItem value="MAKAN_SIANG">Makan Siang</SelectItem>
                    <SelectItem value="SARAPAN_SEHAT">Sarapan Sehat</SelectItem>
                    <SelectItem value="SUSU_BUBUK">Susu Bubuk</SelectItem>
                    <SelectItem value="SNACK_SEHAT">Snack Sehat</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="targetGroup">Target Group *</Label>
                <Select
                  value={form.watch('targetGroup')}
                  onValueChange={(value) => form.setValue('targetGroup', value as TargetGroup)}
                  disabled={isSubmitting}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih target" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BALITA_0_2">Balita 0-2 tahun</SelectItem>
                    <SelectItem value="BALITA_2_5">Balita 2-5 tahun</SelectItem>
                    <SelectItem value="ANAK_SD">Anak SD</SelectItem>
                    <SelectItem value="ANAK_SMP">Anak SMP</SelectItem>
                    <SelectItem value="REMAJA">Remaja</SelectItem>
                    <SelectItem value="IBU_HAMIL">Ibu Hamil</SelectItem>
                    <SelectItem value="IBU_MENYUSUI">Ibu Menyusui</SelectItem>
                    <SelectItem value="LANSIA">Lansia</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Schedule */}
          <div className="space-y-4 pt-4 border-t">
            <h3 className="font-semibold text-sm">Jadwal Program</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tanggal Mulai *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !form.watch('startDate') && "text-muted-foreground"
                      )}
                      disabled={isSubmitting}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {form.watch('startDate') 
                        ? format(form.watch('startDate'), 'PPP', { locale: id })
                        : "Pilih tanggal"
                      }
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={form.watch('startDate')}
                      onSelect={(date) => date && form.setValue('startDate', date)}
                      locale={id}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="mealsPerDay">Porsi per Hari *</Label>
                <Input
                  id="mealsPerDay"
                  type="number"
                  min="1"
                  max="5"
                  {...form.register('mealsPerDay', { valueAsNumber: true })}
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Hari Pemberian Makan *</Label>
              <div className="flex gap-2 flex-wrap">
                {[
                  { label: 'Sen', value: 1 },
                  { label: 'Sel', value: 2 },
                  { label: 'Rab', value: 3 },
                  { label: 'Kam', value: 4 },
                  { label: 'Jum', value: 5 },
                  { label: 'Sab', value: 6 },
                  { label: 'Min', value: 0 }
                ].map((day) => {
                  const isChecked = form.watch('feedingDays')?.includes(day.value) || false
                  return (
                    <div key={day.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`day-${day.value}`}
                        checked={isChecked}
                        onCheckedChange={(checked) => {
                          const currentDays = form.watch('feedingDays') || []
                          const newDays = checked
                            ? [...currentDays, day.value]
                            : currentDays.filter(d => d !== day.value)
                          form.setValue('feedingDays', newDays)
                        }}
                        disabled={isSubmitting}
                      />
                      <Label htmlFor={`day-${day.value}`} className="text-sm font-normal cursor-pointer">
                        {day.label}
                      </Label>
                    </div>
                  )
                })}
              </div>
              {form.formState.errors.feedingDays && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.feedingDays.message}
                </p>
              )}
            </div>
          </div>

          {/* Budget & Targets */}
          <div className="space-y-4 pt-4 border-t">
            <h3 className="font-semibold text-sm">Anggaran & Target</h3>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="targetRecipients">Target Penerima *</Label>
                <Input
                  id="targetRecipients"
                  type="number"
                  min="1"
                  {...form.register('targetRecipients', { valueAsNumber: true })}
                  placeholder="100"
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="totalBudget">Total Anggaran</Label>
                <Input
                  id="totalBudget"
                  type="number"
                  min="0"
                  step="1000"
                  {...form.register('totalBudget', { valueAsNumber: true })}
                  placeholder="10000000"
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="budgetPerMeal">Anggaran per Porsi</Label>
                <Input
                  id="budgetPerMeal"
                  type="number"
                  min="0"
                  step="100"
                  {...form.register('budgetPerMeal', { valueAsNumber: true })}
                  placeholder="15000"
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="space-y-4 pt-4 border-t">
            <h3 className="font-semibold text-sm">Lokasi & Sekolah Mitra</h3>
            
            <div className="space-y-2">
              <Label htmlFor="implementationArea">Area Implementasi *</Label>
              <Input
                id="implementationArea"
                {...form.register('implementationArea')}
                placeholder="Contoh: Kecamatan Menteng, Jakarta Pusat"
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="partnerSchools">Sekolah Mitra</Label>
              <div className="flex gap-2">
                <Input
                  id="partnerSchools"
                  value={partnerSchoolInput}
                  onChange={(e) => setPartnerSchoolInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addPartnerSchool()
                    }
                  }}
                  placeholder="Nama sekolah..."
                  disabled={isSubmitting}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={addPartnerSchool}
                  disabled={isSubmitting || !partnerSchoolInput.trim()}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              {partnerSchools.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {partnerSchools.map((school) => (
                    <div
                      key={school}
                      className="flex items-center gap-1 bg-muted px-2 py-1 rounded-md text-sm"
                    >
                      <span>{school}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4 p-0"
                        onClick={() => removePartnerSchool(school)}
                        disabled={isSubmitting}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex gap-2">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Batal
            </Button>
          )}
          <Button type="submit" disabled={isSubmitting} className="ml-auto">
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {initialData ? 'Perbarui Program' : 'Buat Program'}
          </Button>
        </CardFooter>
      </Card>
    </form>
  )
}
