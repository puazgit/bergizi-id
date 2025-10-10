'use client'

import { type FC, useState, useEffect, useMemo } from 'react'
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
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Plus, Save, AlertTriangle, Info } from 'lucide-react'
import { IngredientSelector } from './IngredientSelector'
import { toast } from 'sonner'

// ============================================================================
// Types & Interfaces
// ============================================================================

interface InventoryItem {
  id: string
  itemName: string
  itemCode: string
  category: string
  unit: string
  currentStock: number
  minimumStock: number
  lastPrice: number | null
  averagePrice: number | null
  calories: number | null
  protein: number | null
  carbohydrates: number | null
  fat: number | null
  fiber: number | null
}

interface MenuIngredient {
  id: string
  inventoryItemId: string
  quantity: number
  unit: string
  cost: number
  inventoryItem: InventoryItem
}

interface IngredientFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  inventoryItems: InventoryItem[]
  existingIngredient?: MenuIngredient | null
  existingIngredientIds?: string[]
  onSubmit: (data: IngredientFormData) => Promise<void>
  isSubmitting?: boolean
}

export interface IngredientFormData {
  inventoryItemId: string
  quantity: number
  unit: string
  notes?: string
}

// ============================================================================
// Validation Schema
// ============================================================================

const ingredientFormSchema = z.object({
  inventoryItemId: z.string().min(1, 'Pilih bahan baku'),
  quantity: z
    .number()
    .positive('Jumlah harus lebih dari 0')
    .max(10000, 'Jumlah terlalu besar'),
  unit: z.string().min(1, 'Unit diperlukan'),
  notes: z.string().optional(),
})

type IngredientFormValues = z.infer<typeof ingredientFormSchema>

// ============================================================================
// Helper Functions
// ============================================================================

function formatPrice(price: number | null): string {
  if (price === null) return 'N/A'
  return `Rp ${price.toLocaleString('id-ID')}`
}

function calculateIngredientCost(
  quantity: number,
  pricePerUnit: number | null
): number {
  if (!pricePerUnit) return 0
  return quantity * pricePerUnit
}

function calculateNutritionPerQuantity(
  quantity: number,
  nutritionPer100g: number | null
): number {
  if (!nutritionPer100g) return 0
  // Assuming quantity is in grams, nutrition is per 100g
  return (quantity / 100) * nutritionPer100g
}

// ============================================================================
// Main Component
// ============================================================================

export const IngredientForm: FC<IngredientFormProps> = ({
  open,
  onOpenChange,
  inventoryItems,
  existingIngredient,
  existingIngredientIds = [],
  onSubmit,
  isSubmitting = false,
}) => {
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null)

  const isEditMode = !!existingIngredient

  // Initialize form with react-hook-form + Zod
  const form = useForm<IngredientFormValues>({
    resolver: zodResolver(ingredientFormSchema),
    defaultValues: {
      inventoryItemId: existingIngredient?.inventoryItemId || '',
      quantity: existingIngredient?.quantity || 0,
      unit: existingIngredient?.unit || '',
      notes: '',
    },
  })

  // Watch quantity for real-time calculations
  const watchedQuantity = form.watch('quantity')
  const watchedInventoryItemId = form.watch('inventoryItemId')

  // Update selected item when inventory item changes
  useEffect(() => {
    if (watchedInventoryItemId) {
      const item = inventoryItems.find((i) => i.id === watchedInventoryItemId)
      setSelectedItem(item || null)

      // Auto-fill unit from inventory item
      if (item && !isEditMode) {
        form.setValue('unit', item.unit)
      }
    } else {
      setSelectedItem(null)
    }
  }, [watchedInventoryItemId, inventoryItems, form, isEditMode])

  // Reset form when dialog closes or opens
  useEffect(() => {
    if (open) {
      if (existingIngredient) {
        // Edit mode: load existing data
        form.reset({
          inventoryItemId: existingIngredient.inventoryItemId,
          quantity: existingIngredient.quantity,
          unit: existingIngredient.unit,
          notes: '',
        })
        const item = inventoryItems.find(
          (i) => i.id === existingIngredient.inventoryItemId
        )
        setSelectedItem(item || null)
      } else {
        // Create mode: reset form
        form.reset({
          inventoryItemId: '',
          quantity: 0,
          unit: '',
          notes: '',
        })
        setSelectedItem(null)
      }
    }
  }, [open, existingIngredient, inventoryItems, form])

  // Filter out already-added ingredients (except in edit mode)
  const availableItems = useMemo(() => {
    if (isEditMode) {
      return inventoryItems
    }
    return inventoryItems.filter(
      (item) => !existingIngredientIds.includes(item.id)
    )
  }, [inventoryItems, existingIngredientIds, isEditMode])

  // Real-time cost calculation
  const estimatedCost = useMemo(() => {
    if (!selectedItem || !watchedQuantity) return 0
    const price = selectedItem.averagePrice || selectedItem.lastPrice
    return calculateIngredientCost(watchedQuantity, price)
  }, [selectedItem, watchedQuantity])

  // Real-time nutrition calculation
  const estimatedNutrition = useMemo(() => {
    if (!selectedItem || !watchedQuantity) {
      return {
        calories: 0,
        protein: 0,
        carbohydrates: 0,
        fat: 0,
        fiber: 0,
      }
    }

    return {
      calories: calculateNutritionPerQuantity(
        watchedQuantity,
        selectedItem.calories
      ),
      protein: calculateNutritionPerQuantity(
        watchedQuantity,
        selectedItem.protein
      ),
      carbohydrates: calculateNutritionPerQuantity(
        watchedQuantity,
        selectedItem.carbohydrates
      ),
      fat: calculateNutritionPerQuantity(watchedQuantity, selectedItem.fat),
      fiber: calculateNutritionPerQuantity(watchedQuantity, selectedItem.fiber),
    }
  }, [selectedItem, watchedQuantity])

  // Check if selected item has low stock
  const hasLowStock = useMemo(() => {
    if (!selectedItem) return false
    return (
      selectedItem.currentStock > 0 &&
      selectedItem.currentStock <= selectedItem.minimumStock * 0.5
    )
  }, [selectedItem])

  // Check if quantity exceeds available stock
  const exceedsStock = useMemo(() => {
    if (!selectedItem || !watchedQuantity) return false
    return watchedQuantity > selectedItem.currentStock
  }, [selectedItem, watchedQuantity])

  // Handle form submission
  const handleSubmit = async (values: IngredientFormValues) => {
    try {
      await onSubmit(values)
      toast.success(
        isEditMode
          ? 'Bahan berhasil diperbarui'
          : 'Bahan berhasil ditambahkan'
      )
      onOpenChange(false)
    } catch (error) {
      toast.error(
        isEditMode ? 'Gagal memperbarui bahan' : 'Gagal menambahkan bahan'
      )
      console.error('Form submission error:', error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? 'Edit Bahan' : 'Tambah Bahan'}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? 'Perbarui informasi bahan untuk menu ini'
              : 'Tambahkan bahan baku dari inventori ke menu ini'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            {/* Inventory Item Selection */}
            <FormField
              control={form.control}
              name="inventoryItemId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bahan Baku</FormLabel>
                  <FormControl>
                    <IngredientSelector
                      items={availableItems}
                      selectedId={field.value}
                      onSelect={(item) => {
                        field.onChange(item?.id || '')
                      }}
                      placeholder="Pilih bahan baku..."
                      disabled={isEditMode || isSubmitting}
                      showStockStatus
                      showPrice
                    />
                  </FormControl>
                  <FormDescription>
                    Pilih bahan baku dari inventori yang tersedia
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Selected Item Info */}
            {selectedItem && (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{selectedItem.itemName}</p>
                    <p className="text-sm text-muted-foreground">
                      Kode: {selectedItem.itemCode} • Kategori:{' '}
                      {selectedItem.category}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm">
                      Stok: {selectedItem.currentStock} {selectedItem.unit}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Harga:{' '}
                      {formatPrice(
                        selectedItem.averagePrice || selectedItem.lastPrice
                      )}
                      /{selectedItem.unit}
                    </p>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* Low Stock Warning */}
            {hasLowStock && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Stok bahan ini rendah. Pertimbangkan untuk melakukan
                  pengadaan.
                </AlertDescription>
              </Alert>
            )}

            {/* Quantity Input */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Jumlah</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0"
                        disabled={isSubmitting || !selectedItem}
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseFloat(e.target.value) || 0)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Satuan</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="kg, gram, liter"
                        disabled={isSubmitting || !selectedItem}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Stock Exceeded Warning */}
            {exceedsStock && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Jumlah melebihi stok yang tersedia (
                  {selectedItem?.currentStock} {selectedItem?.unit})
                </AlertDescription>
              </Alert>
            )}

            {/* Real-time Cost Preview */}
            {selectedItem && watchedQuantity > 0 && (
              <>
                <Separator />
                <div className="space-y-4">
                  <h4 className="text-sm font-medium">Estimasi</h4>

                  {/* Cost Estimate */}
                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Estimasi Biaya
                      </p>
                      <p className="text-2xl font-bold">
                        {formatPrice(estimatedCost)}
                      </p>
                    </div>
                    <Badge variant="secondary">
                      {formatPrice(estimatedCost / (watchedQuantity || 1))}/
                      {form.watch('unit')}
                    </Badge>
                  </div>

                  {/* Nutrition Estimate */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Kalori</p>
                      <p className="text-lg font-semibold">
                        {estimatedNutrition.calories.toFixed(1)} kal
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Protein</p>
                      <p className="text-lg font-semibold">
                        {estimatedNutrition.protein.toFixed(1)}g
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Karbohidrat</p>
                      <p className="text-lg font-semibold">
                        {estimatedNutrition.carbohydrates.toFixed(1)}g
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Batal
              </Button>
              <Button type="submit" disabled={isSubmitting || exceedsStock}>
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
