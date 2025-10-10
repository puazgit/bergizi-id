'use client'

import { type FC, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
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
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Loader2, Plus, Save, Clock, Thermometer } from 'lucide-react'
import { toast } from 'sonner'

// ============================================================================
// Types & Interfaces
// ============================================================================

interface RecipeStep {
  id: string
  stepNumber: number
  instruction: string
  duration?: number | null
  temperature?: number | null
  notes?: string | null
}

interface RecipeStepFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  existingStep?: RecipeStep | null
  stepNumber?: number
  onSubmit: (data: RecipeStepFormData) => Promise<void>
  isSubmitting?: boolean
}

export interface RecipeStepFormData {
  instruction: string
  duration?: number | null
  temperature?: number | null
  notes?: string
}

// ============================================================================
// Validation Schema
// ============================================================================

const recipeStepFormSchema = z.object({
  instruction: z
    .string()
    .min(10, 'Instruksi minimal 10 karakter')
    .max(1000, 'Instruksi maksimal 1000 karakter'),
  duration: z
    .number()
    .int('Durasi harus bilangan bulat')
    .min(0, 'Durasi tidak boleh negatif')
    .max(1440, 'Durasi maksimal 1440 menit (24 jam)')
    .optional()
    .nullable(),
  temperature: z
    .number()
    .int('Suhu harus bilangan bulat')
    .min(0, 'Suhu tidak boleh negatif')
    .max(300, 'Suhu maksimal 300°C')
    .optional()
    .nullable(),
  notes: z.string().max(500, 'Catatan maksimal 500 karakter').optional(),
})

type RecipeStepFormValues = z.infer<typeof recipeStepFormSchema>

// ============================================================================
// Helper Functions
// ============================================================================

function formatDuration(minutes: number | null | undefined): string {
  if (!minutes) return '-'
  
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  
  if (hours > 0 && mins > 0) {
    return `${hours} jam ${mins} menit`
  } else if (hours > 0) {
    return `${hours} jam`
  } else {
    return `${mins} menit`
  }
}

// ============================================================================
// Main Component
// ============================================================================

export const RecipeStepForm: FC<RecipeStepFormProps> = ({
  open,
  onOpenChange,
  existingStep,
  stepNumber,
  onSubmit,
  isSubmitting = false,
}) => {
  const isEditMode = !!existingStep

  // Initialize form with react-hook-form + Zod
  const form = useForm<RecipeStepFormValues>({
    resolver: zodResolver(recipeStepFormSchema),
    defaultValues: {
      instruction: existingStep?.instruction || '',
      duration: existingStep?.duration || null,
      temperature: existingStep?.temperature || null,
      notes: existingStep?.notes || '',
    },
  })

  // Reset form when dialog opens/closes or existing step changes
  useEffect(() => {
    if (open) {
      if (existingStep) {
        form.reset({
          instruction: existingStep.instruction,
          duration: existingStep.duration,
          temperature: existingStep.temperature,
          notes: existingStep.notes || '',
        })
      } else {
        form.reset({
          instruction: '',
          duration: null,
          temperature: null,
          notes: '',
        })
      }
    }
  }, [open, existingStep, form])

  // Handle form submission
  const handleSubmit = async (values: RecipeStepFormValues) => {
    try {
      // Convert empty strings to null for optional fields
      const data: RecipeStepFormData = {
        instruction: values.instruction,
        duration: values.duration || null,
        temperature: values.temperature || null,
        notes: values.notes || undefined,
      }

      await onSubmit(data)
      toast.success(
        isEditMode ? 'Langkah berhasil diperbarui' : 'Langkah berhasil ditambahkan'
      )
      onOpenChange(false)
    } catch (error) {
      toast.error(
        isEditMode ? 'Gagal memperbarui langkah' : 'Gagal menambahkan langkah'
      )
      console.error('Form submission error:', error)
    }
  }

  // Watch duration and temperature for preview
  const watchedDuration = form.watch('duration')
  const watchedTemperature = form.watch('temperature')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? 'Edit Langkah' : `Tambah Langkah ${stepNumber || ''}`}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? 'Perbarui instruksi dan detail langkah resep'
              : 'Tambahkan langkah baru ke resep menu ini'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            {/* Instruction Field */}
            <FormField
              control={form.control}
              name="instruction"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Instruksi <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Contoh: Panaskan minyak dalam wajan dengan api sedang. Tumis bawang putih hingga harum..."
                      disabled={isSubmitting}
                      className="min-h-[120px] resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Jelaskan langkah dengan detail dan jelas (10-1000 karakter)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Duration and Temperature Fields */}
            <div className="grid grid-cols-2 gap-4">
              {/* Duration Field */}
              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Durasi (menit)
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="1"
                        min="0"
                        max="1440"
                        placeholder="30"
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
                      {watchedDuration ? formatDuration(watchedDuration) : 'Opsional'}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Temperature Field */}
              <FormField
                control={form.control}
                name="temperature"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Thermometer className="h-4 w-4" />
                      Suhu (°C)
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="1"
                        min="0"
                        max="300"
                        placeholder="180"
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
                      {watchedTemperature ? `${watchedTemperature}°C` : 'Opsional'}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Notes Field */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Catatan</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Catatan tambahan, tips, atau peringatan untuk langkah ini..."
                      disabled={isSubmitting}
                      className="min-h-[80px] resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Opsional - Tips atau peringatan khusus (maks. 500 karakter)
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
                    Menyimpan...
                  </>
                ) : (
                  <>
                    {isEditMode ? (
                      <Save className="mr-2 h-4 w-4" />
                    ) : (
                      <Plus className="mr-2 h-4 w-4" />
                    )}
                    {isEditMode ? 'Perbarui' : 'Tambahkan'}
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
