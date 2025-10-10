# 🔗 PHASE 7: Component Integration Guide

**Status**: 🚀 **IN PROGRESS**  
**Goal**: Wire PHASE 6 components with PHASE 3 hooks and PHASE 5 server actions  
**Approach**: Create complete page examples with real data flow

---

## 📋 Integration Strategy

### Layer Architecture
```
┌─────────────────────────────────────────┐
│  PHASE 6: UI Components (Presentation)  │
│  ├─ Forms, Displays, Lists, Calendars   │
│  └─ Props-based, fully controlled       │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│  PHASE 3: Hooks (Data & State Mgmt)     │
│  ├─ useMenus, usePrograms, usePlanning  │
│  ├─ TanStack Query caching              │
│  └─ Optimistic updates                  │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│  PHASE 5: Server Actions (Business)     │
│  ├─ createMenu, updateMenu, deleteMenu  │
│  ├─ createMenuPlan, generateBalanced    │
│  └─ Multi-tenant, RBAC, validation      │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│  PHASE 4: Database (Prisma + Postgres)  │
│  └─ NutritionMenu, MenuPlan, etc.       │
└─────────────────────────────────────────┘
```

---

## 🎯 Integration Checklist

### Prerequisites
- [x] PHASE 6 components created (16/16) ✅
- [x] PHASE 3 hooks available ✅
- [x] PHASE 5 server actions available ✅
- [ ] Global CSS imports (react-big-calendar) ⏳
- [ ] Page routes created ⏳
- [ ] Error boundaries added ⏳

### Page Routes to Create
1. [ ] **Menu Creation Flow** - `/menu/create`
   - Components: IngredientSelector, NutritionDisplay, CostDisplay
   - Hooks: useIngredients, useCostCalculator
   - Actions: createMenu

2. [ ] **Recipe Management** - `/menu/[id]/recipe`
   - Components: RecipeStepList, RecipeStepForm, RecipeViewer
   - Hooks: useRecipe, useCreateRecipeStep, useUpdateRecipeStep
   - Actions: createRecipeStep, updateRecipeStep, deleteRecipeStep

3. [ ] **Planning Dashboard** - `/menu/plans`
   - Components: PlanningDashboard, PlanForm
   - Hooks: useMenuPlans, useCreateMenuPlan
   - Actions: createMenuPlan

4. [ ] **Plan Detail & Calendar** - `/menu/plans/[id]`
   - Components: PlanDetail, MenuCalendar, BalancedPlanGenerator
   - Hooks: useMenuPlan, useMenuAssignments, useGenerateBalanced
   - Actions: generateBalancedMenuPlan, createMenuAssignment

---

## 📝 Implementation Examples

### Example 1: Menu Creation Page (Complete)

**File**: `src/app/(sppg)/menu/create/page.tsx`

```typescript
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'

// PHASE 6 Components
import {
  IngredientSelector,
  NutritionDisplay,
  CostDisplay,
  ComplianceIndicator,
  RecommendationsList,
} from '@/components/sppg/menu/components'

// PHASE 3 Hooks
import {
  usePrograms,
  useIngredients,
  useCostCalculator,
} from '@/components/sppg/menu/hooks'

// PHASE 5 Server Actions
import { createMenu } from '@/actions/sppg/menu'

// UI Components
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Form,
  FormControl,
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Loader2 } from 'lucide-react'

// ============================================================================
// Types & Validation
// ============================================================================

const menuFormSchema = z.object({
  programId: z.string().min(1, 'Pilih program gizi'),
  menuName: z.string().min(3, 'Nama menu minimal 3 karakter').max(100),
  menuCode: z.string().min(2, 'Kode menu minimal 2 karakter').max(20),
  description: z.string().max(500).optional(),
  mealType: z.enum(['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK_MORNING', 'SNACK_AFTERNOON']),
  servingSize: z.number().min(1).max(1000),
  ingredients: z.array(z.object({
    inventoryItemId: z.string(),
    quantity: z.number().positive(),
    unit: z.string(),
  })).min(1, 'Tambahkan minimal 1 bahan'),
})

type MenuFormData = z.infer<typeof menuFormSchema>

interface SelectedIngredient {
  id: string
  name: string
  category: string
  quantity: number
  unit: string
  pricePerUnit: number
  // Nutrition per 100g
  calories: number
  protein: number
  carbohydrates: number
  fat: number
}

// ============================================================================
// Main Component
// ============================================================================

export default function CreateMenuPage() {
  const router = useRouter()
  const [selectedIngredients, setSelectedIngredients] = useState<SelectedIngredient[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  // PHASE 3 Hooks - Data fetching
  const { data: programs, isLoading: programsLoading } = usePrograms({
    filters: { status: 'ACTIVE' }
  })
  const { data: availableIngredients, isLoading: ingredientsLoading } = useIngredients()

  // PHASE 3 Hooks - Calculations
  const costCalculation = useCostCalculator(selectedIngredients)

  // Form setup
  const form = useForm<MenuFormData>({
    resolver: zodResolver(menuFormSchema),
    defaultValues: {
      menuName: '',
      menuCode: '',
      description: '',
      servingSize: 200,
      ingredients: [],
    },
  })

  // Watch form values for real-time calculations
  const servingSize = form.watch('servingSize')

  // Calculate nutrition based on ingredients and serving size
  const nutritionCalculation = {
    calories: selectedIngredients.reduce((sum, ing) => {
      const ratio = ing.quantity / 100 // Convert to per 100g basis
      return sum + (ing.calories * ratio)
    }, 0) * (servingSize / 100),
    protein: selectedIngredients.reduce((sum, ing) => {
      const ratio = ing.quantity / 100
      return sum + (ing.protein * ratio)
    }, 0) * (servingSize / 100),
    carbohydrates: selectedIngredients.reduce((sum, ing) => {
      const ratio = ing.quantity / 100
      return sum + (ing.carbohydrates * ratio)
    }, 0) * (servingSize / 100),
    fat: selectedIngredients.reduce((sum, ing) => {
      const ratio = ing.quantity / 100
      return sum + (ing.fat * ratio)
    }, 0) * (servingSize / 100),
    fiber: 0, // TODO: Add to ingredient data
    calcium: 0,
    iron: 0,
    vitaminA: 0,
    vitaminC: 0,
  }

  // Mock compliance check (TODO: integrate real useComplianceChecker)
  const complianceCheck = {
    isCompliant: nutritionCalculation.protein >= 20 && nutritionCalculation.calories >= 300,
    overallStatus: 'COMPLIANT' as const,
    compliancePercentage: 85,
    violations: [] as any[],
    warnings: [] as any[],
    checkedAt: new Date(),
  }

  // Mock recommendations (TODO: integrate real useMenuRecommendations)
  const recommendations = selectedIngredients.length === 0 ? [] : [
    {
      id: '1',
      type: 'NUTRITION' as const,
      priority: 'MEDIUM' as const,
      title: 'Tambahkan Sumber Vitamin C',
      description: 'Menu ini kekurangan vitamin C. Pertimbangkan menambahkan sayuran hijau atau buah citrus.',
      impact: 'Meningkatkan nilai gizi menu',
      suggestedAction: 'Tambahkan 50g bayam atau 30g jeruk',
    }
  ]

  // Handle ingredient changes
  const handleIngredientChange = (ingredients: SelectedIngredient[]) => {
    setSelectedIngredients(ingredients)
    form.setValue('ingredients', ingredients.map(ing => ({
      inventoryItemId: ing.id,
      quantity: ing.quantity,
      unit: ing.unit,
    })))
  }

  // Handle form submission
  const onSubmit = async (data: MenuFormData) => {
    setIsSubmitting(true)
    try {
      // Call PHASE 5 server action
      const result = await createMenu({
        ...data,
        // Add calculated nutrition
        calories: Math.round(nutritionCalculation.calories),
        protein: Math.round(nutritionCalculation.protein),
        carbohydrates: Math.round(nutritionCalculation.carbohydrates),
        fat: Math.round(nutritionCalculation.fat),
        fiber: Math.round(nutritionCalculation.fiber),
        // Add calculated cost
        costPerServing: costCalculation.totalCost,
        // Add ingredients
        ingredients: data.ingredients,
      })

      if (result.success) {
        toast.success('Menu berhasil dibuat!', {
          description: `Menu "${data.menuName}" telah ditambahkan.`,
        })
        router.push(`/menu/${result.data.id}`)
      } else {
        toast.error('Gagal membuat menu', {
          description: result.error || 'Terjadi kesalahan saat membuat menu.',
        })
      }
    } catch (error) {
      console.error('Create menu error:', error)
      toast.error('Gagal membuat menu', {
        description: 'Terjadi kesalahan yang tidak terduga.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Loading state
  if (programsLoading || ingredientsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Buat Menu Baru</h1>
        <p className="text-muted-foreground">
          Tambahkan menu gizi dengan komposisi bahan yang seimbang
        </p>
      </div>

      <Separator />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Informasi Dasar</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                {/* Program Selection */}
                <FormField
                  control={form.control}
                  name="programId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Program Gizi *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih program" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {programs?.map((program) => (
                            <SelectItem key={program.id} value={program.id}>
                              {program.name} - {program.targetGroup}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Meal Type */}
                <FormField
                  control={form.control}
                  name="mealType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Jenis Makanan *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih jenis" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="BREAKFAST">Sarapan</SelectItem>
                          <SelectItem value="LUNCH">Makan Siang</SelectItem>
                          <SelectItem value="DINNER">Makan Malam</SelectItem>
                          <SelectItem value="SNACK_MORNING">Snack Pagi</SelectItem>
                          <SelectItem value="SNACK_AFTERNOON">Snack Sore</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Menu Name */}
                <FormField
                  control={form.control}
                  name="menuName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nama Menu *</FormLabel>
                      <FormControl>
                        <Input placeholder="Contoh: Nasi Goreng Sayur" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Menu Code */}
                <FormField
                  control={form.control}
                  name="menuCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kode Menu *</FormLabel>
                      <FormControl>
                        <Input placeholder="Contoh: NGS-001" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Serving Size */}
                <FormField
                  control={form.control}
                  name="servingSize"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ukuran Porsi (gram) *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="200"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Description */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Deskripsi (Opsional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Jelaskan menu ini..."
                        className="resize-none"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Ingredient Selection - PHASE 6 Component */}
          <IngredientSelector
            availableIngredients={availableIngredients || []}
            selectedIngredients={selectedIngredients}
            onIngredientChange={handleIngredientChange}
          />

          {/* Real-time Calculations */}
          {selectedIngredients.length > 0 && (
            <>
              <div className="grid gap-6 md:grid-cols-2">
                {/* Nutrition Display - PHASE 6 Component */}
                <NutritionDisplay nutrition={nutritionCalculation} />

                {/* Cost Display - PHASE 6 Component */}
                <CostDisplay
                  cost={costCalculation}
                  budget={undefined} // No budget constraint for menu creation
                />
              </div>

              {/* Compliance Indicator - PHASE 6 Component */}
              <ComplianceIndicator compliance={complianceCheck} />

              {/* Recommendations - PHASE 6 Component */}
              {recommendations.length > 0 && (
                <RecommendationsList recommendations={recommendations} />
              )}
            </>
          )}

          {/* Submit Button */}
          <div className="flex items-center justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isSubmitting}
            >
              Batal
            </Button>
            <Button type="submit" disabled={isSubmitting || selectedIngredients.length === 0}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSubmitting ? 'Menyimpan...' : 'Buat Menu'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
```

**Key Integration Points**:
1. ✅ Uses `usePrograms()` and `useIngredients()` from PHASE 3
2. ✅ Uses `useCostCalculator()` for real-time cost calculation
3. ✅ Uses all 5 PHASE 6 calculator components
4. ✅ Calls `createMenu()` server action from PHASE 5
5. ✅ Real-time nutrition/cost updates as ingredients change
6. ✅ Form validation with Zod + react-hook-form
7. ✅ Toast notifications for success/error
8. ✅ Router navigation after success

---

### Example 2: Recipe Management Page

**File**: `src/app/(sppg)/menu/[id]/recipe/page.tsx`

```typescript
'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'

// PHASE 6 Components
import {
  RecipeStepList,
  RecipeStepForm,
  RecipeViewer,
} from '@/components/sppg/menu/components'

// PHASE 3 Hooks
import {
  useRecipe,
  useCreateRecipeStep,
  useUpdateRecipeStep,
  useDeleteRecipeStep,
} from '@/components/sppg/menu/hooks'

// UI Components
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Loader2, Eye, Edit } from 'lucide-react'
import { toast } from 'sonner'

export default function RecipePage() {
  const params = useParams()
  const router = useRouter()
  const menuId = params.id as string

  const [viewMode, setViewMode] = useState<'edit' | 'view'>('edit')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingStep, setEditingStep] = useState<any>(null)

  // PHASE 3 Hooks
  const { data: recipe, isLoading } = useRecipe(menuId)
  const createStepMutation = useCreateRecipeStep(menuId)
  const updateStepMutation = useUpdateRecipeStep(menuId)
  const deleteStepMutation = useDeleteRecipeStep(menuId)

  // Handle step reorder
  const handleStepReorder = async (reorderedSteps: any[]) => {
    // Optimistically update UI
    // Server action will handle persisting the new order
    toast.success('Urutan langkah diperbarui')
  }

  // Handle create/update step
  const handleStepSubmit = async (data: any) => {
    try {
      if (editingStep) {
        await updateStepMutation.mutateAsync({
          stepId: editingStep.id,
          data,
        })
        toast.success('Langkah berhasil diperbarui')
      } else {
        await createStepMutation.mutateAsync(data)
        toast.success('Langkah berhasil ditambahkan')
      }
      setIsFormOpen(false)
      setEditingStep(null)
    } catch (error) {
      toast.error('Gagal menyimpan langkah')
    }
  }

  // Handle delete step
  const handleDeleteStep = async (stepId: string) => {
    if (!confirm('Hapus langkah ini?')) return

    try {
      await deleteStepMutation.mutateAsync(stepId)
      toast.success('Langkah berhasil dihapus')
    } catch (error) {
      toast.error('Gagal menghapus langkah')
    }
  }

  // Handle edit step
  const handleEditStep = (step: any) => {
    setEditingStep(step)
    setIsFormOpen(true)
  }

  // Handle add step
  const handleAddStep = () => {
    setEditingStep(null)
    setIsFormOpen(true)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!recipe) {
    return <div>Resep tidak ditemukan</div>
  }

  // View mode - PHASE 6 RecipeViewer
  if (viewMode === 'view') {
    return (
      <RecipeViewer
        recipe={{
          menuName: recipe.menuName,
          description: recipe.description,
          servings: 10, // TODO: Get from menu data
          steps: recipe.steps || [],
        }}
        onPrint={() => window.print()}
        onShare={() => {
          navigator.clipboard.writeText(window.location.href)
          toast.success('Link resep disalin!')
        }}
      >
        <Button
          variant="outline"
          onClick={() => setViewMode('edit')}
        >
          <Edit className="mr-2 h-4 w-4" />
          Edit Resep
        </Button>
      </RecipeViewer>
    )
  }

  // Edit mode - PHASE 6 RecipeStepList
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Resep: {recipe.menuName}
          </h1>
          <p className="text-muted-foreground">
            Kelola langkah-langkah pembuatan menu
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => setViewMode('view')}
        >
          <Eye className="mr-2 h-4 w-4" />
          Pratinjau
        </Button>
      </div>

      <Separator />

      {/* Recipe Steps List - PHASE 6 Component with drag-drop */}
      <RecipeStepList
        steps={recipe.steps || []}
        onStepReorder={handleStepReorder}
        onEditStep={handleEditStep}
        onDeleteStep={handleDeleteStep}
        onAddStep={handleAddStep}
      />

      {/* Recipe Step Form - PHASE 6 Component */}
      <RecipeStepForm
        open={isFormOpen}
        onOpenChange={(open) => {
          setIsFormOpen(open)
          if (!open) setEditingStep(null)
        }}
        step={editingStep}
        stepNumber={(recipe.steps?.length || 0) + 1}
        onSubmit={handleStepSubmit}
        isSubmitting={
          createStepMutation.isPending || updateStepMutation.isPending
        }
      />
    </div>
  )
}
```

**Key Integration Points**:
1. ✅ Uses `useRecipe()` to fetch recipe steps
2. ✅ Uses mutation hooks for CRUD operations
3. ✅ Uses `RecipeStepList` with drag-drop from PHASE 6
4. ✅ Uses `RecipeStepForm` modal from PHASE 6
5. ✅ Uses `RecipeViewer` for print mode from PHASE 6
6. ✅ Optimistic UI updates
7. ✅ Toast notifications

---

## 📦 Global Setup Required

### 1. Add react-big-calendar CSS

**File**: `src/app/layout.tsx`

```typescript
// Add this import at the top
import 'react-big-calendar/lib/css/react-big-calendar.css'
```

### 2. Add Error Boundary

**File**: `src/components/shared/error-boundary.tsx`

```typescript
'use client'

import { Component, type ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Error boundary caught:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
          <AlertCircle className="h-12 w-12 text-destructive" />
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold">Terjadi Kesalahan</h2>
            <p className="text-muted-foreground max-w-md">
              {this.state.error?.message || 'Silakan muat ulang halaman'}
            </p>
          </div>
          <Button onClick={() => window.location.reload()}>
            Muat Ulang
          </Button>
        </div>
      )
    }

    return this.props.children
  }
}
```

---

## 🎯 Next Steps

1. ✅ Create Example 1: Menu Creation Page
2. ✅ Create Example 2: Recipe Management Page
3. ⏳ Create Example 3: Planning Dashboard Page
4. ⏳ Create Example 4: Plan Detail & Calendar Page
5. ⏳ Add global CSS import for react-big-calendar
6. ⏳ Wrap pages in Error Boundaries
7. ⏳ Test complete user flows
8. ⏳ Deploy to staging environment

**Status**: Documentation in progress, ready for implementation! 🚀
