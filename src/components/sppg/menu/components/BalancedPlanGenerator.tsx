'use client'

import { type FC, useState, useEffect } from 'react'
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
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Loader2,
  Sparkles,
  CalendarIcon,
  DollarSign,
  AlertTriangle,
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

// ============================================================================
// Types & Interfaces
// ============================================================================

interface BalancedPlanGeneratorProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  planId: string
  onGenerate: (params: GenerateParams) => Promise<GenerateResult>
  isGenerating?: boolean
}

export interface GenerateParams {
  planId: string
  startDate: Date
  endDate: Date
  mealTypes: string[]
  budgetConstraint?: number | null
}

export interface GenerateResult {
  success: boolean
  assignmentsCreated: number
  message?: string
}

type MealType = {
  value: string
  label: string
  color: string
}

const MEAL_TYPES: MealType[] = [
  { value: 'BREAKFAST', label: 'Sarapan', color: 'bg-orange-500' },
  { value: 'LUNCH', label: 'Makan Siang', color: 'bg-green-500' },
  { value: 'DINNER', label: 'Makan Malam', color: 'bg-blue-500' },
  { value: 'SNACK_MORNING', label: 'Snack Pagi', color: 'bg-yellow-500' },
  { value: 'SNACK_AFTERNOON', label: 'Snack Sore', color: 'bg-purple-500' },
]

// ============================================================================
// Main Component
// ============================================================================

export const BalancedPlanGenerator: FC<BalancedPlanGeneratorProps> = ({
  open,
  onOpenChange,
  planId,
  onGenerate,
  isGenerating = false,
}) => {
  const [startDate, setStartDate] = useState<Date>()
  const [endDate, setEndDate] = useState<Date>()
  const [selectedMealTypes, setSelectedMealTypes] = useState<string[]>([
    'BREAKFAST',
    'LUNCH',
    'DINNER',
  ])
  const [budgetConstraint, setBudgetConstraint] = useState<number | null>(null)
  const [generationProgress, setGenerationProgress] = useState(0)
  const [generationStatus, setGenerationStatus] = useState<string>('')

  // Reset state when dialog opens
  useEffect(() => {
    if (open) {
      setStartDate(undefined)
      setEndDate(undefined)
      setSelectedMealTypes(['BREAKFAST', 'LUNCH', 'DINNER'])
      setBudgetConstraint(null)
      setGenerationProgress(0)
      setGenerationStatus('')
    }
  }, [open])

  // Simulate progress during generation
  useEffect(() => {
    if (isGenerating) {
      const stages = [
        { progress: 20, status: 'Menganalisis kebutuhan gizi...' },
        { progress: 40, status: 'Memilih menu yang seimbang...' },
        { progress: 60, status: 'Mengoptimalkan biaya...' },
        { progress: 80, status: 'Membuat jadwal menu...' },
        { progress: 100, status: 'Selesai!' },
      ]

      let currentStage = 0
      const interval = setInterval(() => {
        if (currentStage < stages.length) {
          setGenerationProgress(stages[currentStage].progress)
          setGenerationStatus(stages[currentStage].status)
          currentStage++
        } else {
          clearInterval(interval)
        }
      }, 800)

      return () => clearInterval(interval)
    } else {
      setGenerationProgress(0)
      setGenerationStatus('')
    }
  }, [isGenerating])

  // Handle meal type toggle
  const handleMealTypeToggle = (mealType: string) => {
    setSelectedMealTypes((prev) =>
      prev.includes(mealType)
        ? prev.filter((mt) => mt !== mealType)
        : [...prev, mealType]
    )
  }

  // Validate form
  const isValid =
    startDate &&
    endDate &&
    endDate >= startDate &&
    selectedMealTypes.length > 0

  // Handle generate
  const handleGenerate = async () => {
    if (!isValid || !startDate || !endDate) {
      toast.error('Mohon lengkapi semua field yang diperlukan')
      return
    }

    try {
      const result = await onGenerate({
        planId,
        startDate,
        endDate,
        mealTypes: selectedMealTypes,
        budgetConstraint,
      })

      if (result.success) {
        toast.success(
          `Berhasil! ${result.assignmentsCreated} penugasan menu dibuat`
        )
        onOpenChange(false)
      } else {
        toast.error(result.message || 'Gagal membuat rencana menu')
      }
    } catch (error) {
      toast.error('Terjadi kesalahan saat membuat rencana menu')
      console.error('Generation error:', error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Generator Menu Seimbang
          </DialogTitle>
          <DialogDescription>
            Buat rencana menu otomatis dengan AI yang mempertimbangkan keseimbangan
            gizi dan anggaran
          </DialogDescription>
        </DialogHeader>

        {!isGenerating ? (
          <div className="space-y-6 py-4">
            {/* Date Range Selection */}
            <div className="space-y-4">
              <Label>Rentang Tanggal</Label>
              <div className="grid grid-cols-2 gap-4">
                {/* Start Date */}
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">
                    Tanggal Mulai
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          'w-full justify-start text-left font-normal',
                          !startDate && 'text-muted-foreground'
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {startDate ? (
                          format(startDate, 'dd MMM yyyy', { locale: idLocale })
                        ) : (
                          <span>Pilih tanggal</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={setStartDate}
                        disabled={(date) =>
                          date < new Date(new Date().setHours(0, 0, 0, 0))
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* End Date */}
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">
                    Tanggal Selesai
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          'w-full justify-start text-left font-normal',
                          !endDate && 'text-muted-foreground'
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {endDate ? (
                          format(endDate, 'dd MMM yyyy', { locale: idLocale })
                        ) : (
                          <span>Pilih tanggal</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={endDate}
                        onSelect={setEndDate}
                        disabled={(date) =>
                          startDate
                            ? date < startDate
                            : date < new Date(new Date().setHours(0, 0, 0, 0))
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>

            {/* Meal Types Selection */}
            <div className="space-y-3">
              <Label>Tipe Waktu Makan</Label>
              <div className="space-y-2">
                {MEAL_TYPES.map((mealType) => (
                  <div
                    key={mealType.value}
                    className="flex items-center space-x-3"
                  >
                    <Checkbox
                      id={mealType.value}
                      checked={selectedMealTypes.includes(mealType.value)}
                      onCheckedChange={() =>
                        handleMealTypeToggle(mealType.value)
                      }
                    />
                    <label
                      htmlFor={mealType.value}
                      className="flex items-center gap-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      <div
                        className={cn(
                          'w-3 h-3 rounded-full',
                          mealType.color
                        )}
                      />
                      {mealType.label}
                    </label>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                Pilih minimal 1 tipe waktu makan
              </p>
            </div>

            {/* Budget Constraint */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Batasan Anggaran (Opsional)
              </Label>
              <Input
                type="number"
                step="1000"
                min="0"
                placeholder="Contoh: 50000000"
                value={budgetConstraint ?? ''}
                onChange={(e) =>
                  setBudgetConstraint(
                    e.target.value ? parseInt(e.target.value) : null
                  )
                }
              />
              <p className="text-xs text-muted-foreground">
                {budgetConstraint
                  ? `Anggaran: Rp ${budgetConstraint.toLocaleString('id-ID')}`
                  : 'Kosongkan untuk tanpa batasan anggaran'}
              </p>
            </div>

            {/* Info Alert */}
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-sm">
                Generator akan membuat rencana menu otomatis berdasarkan:
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Keseimbangan nutrisi harian</li>
                  <li>Variasi menu untuk mencegah kebosanan</li>
                  <li>Optimalisasi biaya sesuai anggaran</li>
                  <li>Ketersediaan bahan baku</li>
                </ul>
              </AlertDescription>
            </Alert>
          </div>
        ) : (
          /* Generation Progress */
          <div className="space-y-6 py-8">
            <div className="flex flex-col items-center justify-center space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <div className="text-center space-y-2 w-full max-w-md">
                <p className="font-medium">{generationStatus}</p>
                <Progress value={generationProgress} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  {generationProgress}% selesai
                </p>
              </div>
            </div>

            <Alert>
              <AlertDescription className="text-sm text-center">
                Mohon tunggu, proses ini mungkin memakan waktu beberapa detik...
              </AlertDescription>
            </Alert>
          </div>
        )}

        <DialogFooter>
          {!isGenerating ? (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Batal
              </Button>
              <Button
                onClick={handleGenerate}
                disabled={!isValid}
                className="gap-2"
              >
                <Sparkles className="h-4 w-4" />
                Generate Menu
              </Button>
            </>
          ) : (
            <Button disabled className="w-full">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sedang Generate...
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
