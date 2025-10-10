'use client'

import { type FC, useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { format } from 'date-fns'
import { id as idLocale } from 'date-fns/locale'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Badge } from '@/components/ui/badge'
import { Loader2, Plus, CalendarIcon, DollarSign } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

// ============================================================================
// Types & Interfaces
// ============================================================================

interface NutritionProgram {
  id: string
  name: string
  targetGroup: string
  status: string
}

interface PlanFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  programs: NutritionProgram[]
  onSubmit: (data: PlanFormData) => Promise<void>
  isSubmitting?: boolean
}

export interface PlanFormData {
  planName: string
  programId: string
  startDate: Date
  endDate: Date
  budgetConstraint?: number | null
  description?: string
}

// ============================================================================
// Validation Schema
// ============================================================================

const planFormSchema = z.object({
  planName: z
    .string()
    .min(3, 'Nama rencana minimal 3 karakter')
    .max(100, 'Nama rencana maksimal 100 karakter'),
  programId: z.string().min(1, 'Pilih program gizi'),
  startDate: z.date(),
  endDate: z.date(),
  budgetConstraint: z
    .number()
    .positive('Anggaran harus lebih dari 0')
    .max(1000000000, 'Anggaran terlalu besar')
    .optional()
    .nullable(),
  description: z.string().max(500, 'Deskripsi maksimal 500 karakter').optional(),
}).refine(
  (data) => {
    return data.endDate >= data.startDate
  },
  {
    message: 'Tanggal selesai harus setelah tanggal mulai',
    path: ['endDate'],
  }
)

type PlanFormValues = z.infer<typeof planFormSchema>

// ============================================================================
// Helper Functions
// ============================================================================

function formatPrice(price: number | null): string {
  if (price === null) return 'Tidak dibatasi'
  return `Rp ${price.toLocaleString('id-ID')}`
}

function calculateDuration(startDate: Date, endDate: Date): number {
  const diffTime = Math.abs(endDate.getTime() - startDate.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays + 1 // Include start day
}

// ============================================================================
// Main Component
// ============================================================================

export const PlanForm: FC<PlanFormProps> = ({
  open,
  onOpenChange,
  programs,
  onSubmit,
  isSubmitting = false,
}) => {
  // Initialize form with react-hook-form + Zod
  const form = useForm<PlanFormValues>({
    resolver: zodResolver(planFormSchema),
    defaultValues: {
      planName: '',
      programId: '',
      startDate: undefined,
      endDate: undefined,
      budgetConstraint: null,
      description: '',
    },
  })

  // Watch dates for duration calculation
  const watchedStartDate = form.watch('startDate')
  const watchedEndDate = form.watch('endDate')
  const watchedBudget = form.watch('budgetConstraint')
  const watchedProgramId = form.watch('programId')

  // Calculate duration
  const duration = useMemo(() => {
    if (watchedStartDate && watchedEndDate) {
      return calculateDuration(watchedStartDate, watchedEndDate)
    }
    return 0
  }, [watchedStartDate, watchedEndDate])

  // Get selected program
  const selectedProgram = useMemo(() => {
    return programs.find((p) => p.id === watchedProgramId)
  }, [programs, watchedProgramId])

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      form.reset({
        planName: '',
        programId: '',
        startDate: undefined,
        endDate: undefined,
        budgetConstraint: null,
        description: '',
      })
    }
  }, [open, form])

  // Handle form submission
  const handleSubmit = async (values: PlanFormValues) => {
    try {
      const data: PlanFormData = {
        planName: values.planName,
        programId: values.programId,
        startDate: values.startDate,
        endDate: values.endDate,
        budgetConstraint: values.budgetConstraint || null,
        description: values.description || undefined,
      }

      await onSubmit(data)
      toast.success('Rencana menu berhasil dibuat')
      onOpenChange(false)
    } catch (error) {
      toast.error('Gagal membuat rencana menu')
      console.error('Form submission error:', error)
    }
  }

  // Filter active programs
  const activePrograms = useMemo(() => {
    return programs.filter((p) => p.status === 'ACTIVE')
  }, [programs])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Buat Rencana Menu</DialogTitle>
          <DialogDescription>
            Buat rencana menu untuk program gizi dengan rentang waktu tertentu
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            {/* Plan Name Field */}
            <FormField
              control={form.control}
              name="planName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Nama Rencana <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Contoh: Rencana Menu Februari 2025"
                      disabled={isSubmitting}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Nama yang mudah dikenali untuk rencana menu ini
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Program Selection */}
            <FormField
              control={form.control}
              name="programId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Program Gizi <span className="text-destructive">*</span>
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isSubmitting}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih program gizi" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {activePrograms.length === 0 ? (
                        <div className="p-2 text-sm text-muted-foreground">
                          Tidak ada program aktif
                        </div>
                      ) : (
                        activePrograms.map((program) => (
                          <SelectItem key={program.id} value={program.id}>
                            <div className="flex items-center gap-2">
                              <span>{program.name}</span>
                              <Badge variant="secondary" className="text-xs">
                                {program.targetGroup}
                              </Badge>
                            </div>
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Program gizi yang akan menggunakan rencana menu ini
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Selected Program Info */}
            {selectedProgram && (
              <div className="rounded-lg border bg-muted/50 p-4">
                <p className="text-sm font-medium mb-1">Program Terpilih:</p>
                <p className="text-sm text-muted-foreground">
                  {selectedProgram.name} • Target: {selectedProgram.targetGroup}
                </p>
              </div>
            )}

            {/* Date Range Fields */}
            <div className="grid grid-cols-2 gap-4">
              {/* Start Date */}
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>
                      Tanggal Mulai <span className="text-destructive">*</span>
                    </FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            disabled={isSubmitting}
                            className={cn(
                              'pl-3 text-left font-normal',
                              !field.value && 'text-muted-foreground'
                            )}
                          >
                            {field.value ? (
                              format(field.value, 'dd MMMM yyyy', {
                                locale: idLocale,
                              })
                            ) : (
                              <span>Pilih tanggal</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date < new Date(new Date().setHours(0, 0, 0, 0))
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* End Date */}
              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>
                      Tanggal Selesai <span className="text-destructive">*</span>
                    </FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            disabled={isSubmitting}
                            className={cn(
                              'pl-3 text-left font-normal',
                              !field.value && 'text-muted-foreground'
                            )}
                          >
                            {field.value ? (
                              format(field.value, 'dd MMMM yyyy', {
                                locale: idLocale,
                              })
                            ) : (
                              <span>Pilih tanggal</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            watchedStartDate
                              ? date < watchedStartDate
                              : date < new Date(new Date().setHours(0, 0, 0, 0))
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Duration Display */}
            {duration > 0 && (
              <div className="rounded-lg border bg-blue-50 dark:bg-blue-950/30 p-4">
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  Durasi Rencana: {duration} hari
                </p>
                <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                  {duration >= 7 && `≈ ${Math.floor(duration / 7)} minggu`}
                </p>
              </div>
            )}

            {/* Budget Constraint Field */}
            <FormField
              control={form.control}
              name="budgetConstraint"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Anggaran (Opsional)
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="1000"
                      min="0"
                      placeholder="Contoh: 50000000"
                      disabled={isSubmitting}
                      {...field}
                      value={field.value ?? ''}
                      onChange={(e) => {
                        const value = e.target.value
                        field.onChange(value === '' ? null : parseInt(value))
                      }}
                    />
                  </FormControl>
                  <FormDescription>
                    {watchedBudget
                      ? `Anggaran: ${formatPrice(watchedBudget)}`
                      : 'Batasan anggaran untuk rencana menu (opsional)'}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description Field */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Deskripsi (Opsional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Catatan atau deskripsi tambahan untuk rencana menu ini..."
                      disabled={isSubmitting}
                      className="min-h-[80px] resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Catatan tambahan tentang rencana menu (maks. 500 karakter)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Batal
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Membuat...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Buat Rencana
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
