'use client'

import { type FC, useState, useMemo } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Plus,
  Edit,
  Trash2,
  AlertTriangle,
  Package,
  DollarSign,
  Zap,
} from 'lucide-react'
import { IngredientForm, type IngredientFormData } from './IngredientForm'

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

interface IngredientListProps {
  ingredients: MenuIngredient[]
  inventoryItems: InventoryItem[]
  onAdd: (data: IngredientFormData) => Promise<void>
  onUpdate: (id: string, data: IngredientFormData) => Promise<void>
  onDelete: (id: string) => Promise<void>
  isLoading?: boolean
  isSubmitting?: boolean
  showActions?: boolean
  showCostSummary?: boolean
  showNutritionSummary?: boolean
}

interface NutritionSummary {
  totalCalories: number
  totalProtein: number
  totalCarbohydrates: number
  totalFat: number
  totalFiber: number
}

interface CostSummary {
  totalCost: number
  averageCostPerIngredient: number
  itemCount: number
}

// ============================================================================
// Helper Functions
// ============================================================================

function formatPrice(price: number): string {
  return `Rp ${price.toLocaleString('id-ID')}`
}

function calculateNutritionPerQuantity(
  quantity: number,
  nutritionPer100g: number | null
): number {
  if (!nutritionPer100g) return 0
  return (quantity / 100) * nutritionPer100g
}

function calculateNutritionSummary(
  ingredients: MenuIngredient[]
): NutritionSummary {
  return ingredients.reduce(
    (acc, ingredient) => {
      const { quantity, inventoryItem } = ingredient
      return {
        totalCalories:
          acc.totalCalories +
          calculateNutritionPerQuantity(quantity, inventoryItem.calories),
        totalProtein:
          acc.totalProtein +
          calculateNutritionPerQuantity(quantity, inventoryItem.protein),
        totalCarbohydrates:
          acc.totalCarbohydrates +
          calculateNutritionPerQuantity(quantity, inventoryItem.carbohydrates),
        totalFat:
          acc.totalFat +
          calculateNutritionPerQuantity(quantity, inventoryItem.fat),
        totalFiber:
          acc.totalFiber +
          calculateNutritionPerQuantity(quantity, inventoryItem.fiber),
      }
    },
    {
      totalCalories: 0,
      totalProtein: 0,
      totalCarbohydrates: 0,
      totalFat: 0,
      totalFiber: 0,
    }
  )
}

function calculateCostSummary(ingredients: MenuIngredient[]): CostSummary {
  const totalCost = ingredients.reduce(
    (sum, ingredient) => sum + ingredient.cost,
    0
  )
  return {
    totalCost,
    averageCostPerIngredient:
      ingredients.length > 0 ? totalCost / ingredients.length : 0,
    itemCount: ingredients.length,
  }
}

function getStockStatus(
  currentStock: number,
  minimumStock: number
): {
  label: string
  variant: 'default' | 'secondary' | 'destructive' | 'outline'
} {
  if (currentStock === 0) {
    return { label: 'Habis', variant: 'destructive' }
  }
  if (currentStock <= minimumStock * 0.5) {
    return { label: 'Rendah', variant: 'outline' }
  }
  return { label: 'Tersedia', variant: 'secondary' }
}

// ============================================================================
// Loading Skeleton
// ============================================================================

function IngredientListSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-32" />
      </div>
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <TableHead key={i}>
                  <Skeleton className="h-4 w-20" />
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {[1, 2, 3].map((i) => (
              <TableRow key={i}>
                {[1, 2, 3, 4, 5, 6].map((j) => (
                  <TableCell key={j}>
                    <Skeleton className="h-4 w-full" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

// ============================================================================
// Main Component
// ============================================================================

export const IngredientList: FC<IngredientListProps> = ({
  ingredients,
  inventoryItems,
  onAdd,
  onUpdate,
  onDelete,
  isLoading = false,
  isSubmitting = false,
  showActions = true,
  showCostSummary = true,
  showNutritionSummary = true,
}) => {
  const [formOpen, setFormOpen] = useState(false)
  const [editingIngredient, setEditingIngredient] =
    useState<MenuIngredient | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [ingredientToDelete, setIngredientToDelete] =
    useState<MenuIngredient | null>(null)

  // Calculate summaries
  const nutritionSummary = useMemo(
    () => calculateNutritionSummary(ingredients),
    [ingredients]
  )
  const costSummary = useMemo(
    () => calculateCostSummary(ingredients),
    [ingredients]
  )

  // Get existing ingredient IDs for filtering in form
  const existingIngredientIds = useMemo(
    () => ingredients.map((i) => i.inventoryItemId),
    [ingredients]
  )

  // Handle add new ingredient
  const handleAdd = () => {
    setEditingIngredient(null)
    setFormOpen(true)
  }

  // Handle edit ingredient
  const handleEdit = (ingredient: MenuIngredient) => {
    setEditingIngredient(ingredient)
    setFormOpen(true)
  }

  // Handle delete ingredient
  const handleDeleteClick = (ingredient: MenuIngredient) => {
    setIngredientToDelete(ingredient)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (ingredientToDelete) {
      await onDelete(ingredientToDelete.id)
      setDeleteDialogOpen(false)
      setIngredientToDelete(null)
    }
  }

  // Handle form submission
  const handleFormSubmit = async (data: IngredientFormData) => {
    if (editingIngredient) {
      await onUpdate(editingIngredient.id, data)
    } else {
      await onAdd(data)
    }
  }

  // Loading state
  if (isLoading) {
    return <IngredientListSkeleton />
  }

  // Empty state
  if (ingredients.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Package className="h-16 w-16 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Belum ada bahan</h3>
          <p className="text-sm text-muted-foreground text-center mb-6 max-w-sm">
            Tambahkan bahan baku dari inventori untuk mulai menghitung nilai gizi
            dan biaya menu
          </p>
          <Button onClick={handleAdd}>
            <Plus className="mr-2 h-4 w-4" />
            Tambah Bahan Pertama
          </Button>

          {/* Form Dialog */}
          <IngredientForm
            open={formOpen}
            onOpenChange={setFormOpen}
            inventoryItems={inventoryItems}
            existingIngredient={editingIngredient}
            existingIngredientIds={existingIngredientIds}
            onSubmit={handleFormSubmit}
            isSubmitting={isSubmitting}
          />
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Add Button */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Daftar Bahan</h3>
          <p className="text-sm text-muted-foreground">
            {ingredients.length} bahan ditambahkan
          </p>
        </div>
        {showActions && (
          <Button onClick={handleAdd} size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Tambah Bahan
          </Button>
        )}
      </div>

      {/* Ingredients Table */}
      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama Bahan</TableHead>
              <TableHead>Kategori</TableHead>
              <TableHead className="text-right">Jumlah</TableHead>
              <TableHead className="text-right">Biaya</TableHead>
              <TableHead>Status Stok</TableHead>
              {showActions && <TableHead className="text-right">Aksi</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {ingredients.map((ingredient) => {
              const { inventoryItem } = ingredient
              const stockStatus = getStockStatus(
                inventoryItem.currentStock,
                inventoryItem.minimumStock
              )
              const isLowStock =
                inventoryItem.currentStock > 0 &&
                inventoryItem.currentStock <= inventoryItem.minimumStock * 0.5

              return (
                <TableRow key={ingredient.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{inventoryItem.itemName}</p>
                      <p className="text-xs text-muted-foreground">
                        {inventoryItem.itemCode}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{inventoryItem.category}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="font-medium">
                      {ingredient.quantity} {ingredient.unit}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="font-medium">
                      {formatPrice(ingredient.cost)}
                    </span>
                    <p className="text-xs text-muted-foreground">
                      {formatPrice(ingredient.cost / ingredient.quantity)}/
                      {ingredient.unit}
                    </p>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Badge variant={stockStatus.variant}>
                        {stockStatus.label}
                      </Badge>
                      {isLowStock && (
                        <AlertTriangle className="h-4 w-4 text-yellow-500" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {inventoryItem.currentStock} {inventoryItem.unit}
                    </p>
                  </TableCell>
                  {showActions && (
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(ingredient)}
                          disabled={isSubmitting}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteClick(ingredient)}
                          disabled={isSubmitting}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      {/* Cost Summary */}
      {showCostSummary && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center">
              <DollarSign className="mr-2 h-4 w-4" />
              Ringkasan Biaya
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Total Biaya</p>
                <p className="text-xl font-bold">
                  {formatPrice(costSummary.totalCost)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">
                  Rata-rata per Bahan
                </p>
                <p className="text-xl font-bold">
                  {formatPrice(costSummary.averageCostPerIngredient)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Jumlah Bahan</p>
                <p className="text-xl font-bold">{costSummary.itemCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Nutrition Summary */}
      {showNutritionSummary && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center">
              <Zap className="mr-2 h-4 w-4" />
              Ringkasan Gizi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-5 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Kalori</p>
                <p className="text-lg font-semibold">
                  {nutritionSummary.totalCalories.toFixed(0)}
                  <span className="text-xs text-muted-foreground ml-1">kal</span>
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Protein</p>
                <p className="text-lg font-semibold">
                  {nutritionSummary.totalProtein.toFixed(1)}
                  <span className="text-xs text-muted-foreground ml-1">g</span>
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Karbohidrat</p>
                <p className="text-lg font-semibold">
                  {nutritionSummary.totalCarbohydrates.toFixed(1)}
                  <span className="text-xs text-muted-foreground ml-1">g</span>
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Lemak</p>
                <p className="text-lg font-semibold">
                  {nutritionSummary.totalFat.toFixed(1)}
                  <span className="text-xs text-muted-foreground ml-1">g</span>
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Serat</p>
                <p className="text-lg font-semibold">
                  {nutritionSummary.totalFiber.toFixed(1)}
                  <span className="text-xs text-muted-foreground ml-1">g</span>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Low Stock Alert */}
      {ingredients.some(
        (i) =>
          i.inventoryItem.currentStock > 0 &&
          i.inventoryItem.currentStock <= i.inventoryItem.minimumStock * 0.5
      ) && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Beberapa bahan memiliki stok rendah. Pertimbangkan untuk melakukan
            pengadaan agar produksi tidak terganggu.
          </AlertDescription>
        </Alert>
      )}

      {/* Form Dialog */}
      <IngredientForm
        open={formOpen}
        onOpenChange={setFormOpen}
        inventoryItems={inventoryItems}
        existingIngredient={editingIngredient}
        existingIngredientIds={existingIngredientIds}
        onSubmit={handleFormSubmit}
        isSubmitting={isSubmitting}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Bahan?</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus bahan &ldquo;
              {ingredientToDelete?.inventoryItem.itemName}&rdquo; dari menu ini?
              <br />
              <br />
              Tindakan ini akan mempengaruhi perhitungan nilai gizi dan biaya
              menu.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
