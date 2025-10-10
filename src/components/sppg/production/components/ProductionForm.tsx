// Production Form Component - Pattern 2 Component-Level Implementation
// src/components/sppg/production/components/ProductionForm.tsx

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { format } from 'date-fns'
import { CalendarIcon, Clock, Users, DollarSign } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import type { CreateProductionInput, UpdateProductionInput, ProductionWithDetails } from '../types'
import { useCreateProduction, useUpdateProduction } from '../hooks'

// Form validation schema
const productionSchema = z.object({
  programId: z.string().min(1, 'Program harus dipilih'),
  menuId: z.string().min(1, 'Menu harus dipilih'),
  productionDate: z.date(),
  plannedPortions: z.number().min(1, 'Porsi minimal 1'),
  headCook: z.string().min(1, 'Kepala koki harus dipilih'),
  assistantCooks: z.array(z.string()).optional(),
  supervisorId: z.string().optional(),
  plannedStartTime: z.string().min(1, 'Waktu mulai harus diisi'),
  plannedEndTime: z.string().min(1, 'Waktu selesai harus diisi'),
  estimatedCost: z.number().min(0, 'Biaya tidak boleh negatif'),
  targetTemperature: z.number().optional(),
  notes: z.string().optional(),
})

type ProductionFormData = z.infer<typeof productionSchema>

interface ProductionFormProps {
  production?: ProductionWithDetails
  programs: Array<{ id: string; name: string }>
  menus: Array<{ id: string; menuName: string; estimatedCost: number }>
  users: Array<{ id: string; name: string; userRole: string }>
  onSuccess?: () => void
  onCancel?: () => void
}

export function ProductionForm({ 
  production, 
  programs, 
  menus, 
  users,
  onSuccess,
  onCancel 
}: ProductionFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const createMutation = useCreateProduction()
  const updateMutation = useUpdateProduction(production?.id || '')

  const form = useForm<ProductionFormData>({
    resolver: zodResolver(productionSchema),
    defaultValues: {
      programId: production?.programId || '',
      menuId: production?.menuId || '',
      productionDate: production ? new Date(production.productionDate) : new Date(),
      plannedPortions: production?.plannedPortions || 100,
      headCook: production?.headCook || '',
      assistantCooks: production?.assistantCooks || [],
      supervisorId: production?.supervisorId || '',
      plannedStartTime: production?.plannedStartTime 
        ? format(new Date(production.plannedStartTime), 'HH:mm')
        : '06:00',
      plannedEndTime: production?.plannedEndTime 
        ? format(new Date(production.plannedEndTime), 'HH:mm')
        : '12:00',
      estimatedCost: production?.estimatedCost || 0,
      targetTemperature: production?.targetTemperature || undefined,
      notes: production?.notes || '',
    },
  })

  // Filter users by role
  const headCooks = users.filter(user => 
    user.userRole.includes('PRODUKSI') || user.userRole.includes('DAPUR')
  )
  const supervisors = users.filter(user => 
    user.userRole.includes('MANAGER') || user.userRole.includes('KEPALA')
  )

  // Auto-calculate estimated cost when menu changes
  const selectedMenuId = form.watch('menuId')
  const plannedPortions = form.watch('plannedPortions')

  useEffect(() => {
    if (selectedMenuId && plannedPortions) {
      const selectedMenu = menus.find(menu => menu.id === selectedMenuId)
      if (selectedMenu) {
        const estimatedCost = selectedMenu.estimatedCost * plannedPortions
        form.setValue('estimatedCost', estimatedCost)
      }
    }
  }, [selectedMenuId, plannedPortions, menus, form])

  const onSubmit = async (data: ProductionFormData) => {
    setIsSubmitting(true)
    
    try {
      // Convert form data to API format
      const productionData = {
        ...data,
        productionDate: data.productionDate.toISOString(),
        plannedStartTime: new Date(`${data.productionDate.toDateString()} ${data.plannedStartTime}`).toISOString(),
        plannedEndTime: new Date(`${data.productionDate.toDateString()} ${data.plannedEndTime}`).toISOString(),
      }

      if (production) {
        // Update existing production
        await updateMutation.mutateAsync(productionData as UpdateProductionInput)
        toast.success('Produksi berhasil diperbarui')
      } else {
        // Create new production
        await createMutation.mutateAsync(productionData as CreateProductionInput)
        toast.success('Produksi berhasil dibuat')
      }

      onSuccess?.()
      
      if (!onSuccess) {
        router.push('/production')
      }
    } catch (error) {
      toast.error(production ? 'Gagal memperbarui produksi' : 'Gagal membuat produksi')
      console.error('Production form error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    if (onCancel) {
      onCancel()
    } else {
      router.back()
    }
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-foreground">
          {production ? 'Edit Produksi' : 'Buat Produksi Baru'}
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Program & Menu Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="programId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Program Gizi</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih program gizi" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {programs.map((program) => (
                          <SelectItem key={program.id} value={program.id}>
                            {program.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="menuId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Menu</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih menu" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {menus.map((menu) => (
                          <SelectItem key={menu.id} value={menu.id}>
                            {menu.menuName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Production Date & Portions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="productionDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Tanggal Produksi</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              'w-full pl-3 text-left font-normal',
                              !field.value && 'text-muted-foreground'
                            )}
                          >
                            {field.value ? (
                              format(field.value, 'PPP')
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

              <FormField
                control={form.control}
                name="plannedPortions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target Porsi</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Users className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="number"
                          placeholder="100"
                          className="pl-10"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Time Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="plannedStartTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Waktu Mulai</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="time"
                          className="pl-10"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="plannedEndTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Waktu Selesai</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="time"
                          className="pl-10"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Staff Assignment */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="headCook"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kepala Koki</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih kepala koki" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {headCooks.map((cook) => (
                          <SelectItem key={cook.id} value={cook.id}>
                            {cook.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="supervisorId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Supervisor (Opsional)</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih supervisor" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {supervisors.map((supervisor) => (
                          <SelectItem key={supervisor.id} value={supervisor.id}>
                            {supervisor.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Cost & Temperature */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="estimatedCost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estimasi Biaya</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="number"
                          placeholder="0"
                          className="pl-10"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          readOnly
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="targetTemperature"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target Suhu (°C)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="75"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Catatan</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Catatan tambahan untuk produksi ini..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Form Actions */}
            <div className="flex gap-4 pt-6">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 md:flex-none"
              >
                {isSubmitting 
                  ? `${production ? 'Memperbarui' : 'Membuat'}...` 
                  : `${production ? 'Perbarui' : 'Buat'} Produksi`
                }
              </Button>
              
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isSubmitting}
              >
                Batal
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}