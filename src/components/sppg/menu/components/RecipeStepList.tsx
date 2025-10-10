'use client'

import { type FC, useState } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
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
  GripVertical,
  Plus,
  Edit,
  Trash2,
  Clock,
  Thermometer,
  ChevronDown,
  ChevronUp,
  Printer,
  Info,
} from 'lucide-react'
import { RecipeStepForm, type RecipeStepFormData } from './RecipeStepForm'
import { cn } from '@/lib/utils'

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

interface RecipeStepListProps {
  steps: RecipeStep[]
  onAdd: (data: RecipeStepFormData) => Promise<void>
  onUpdate: (id: string, data: RecipeStepFormData) => Promise<void>
  onDelete: (id: string) => Promise<void>
  onReorder: (steps: RecipeStep[]) => Promise<void>
  isLoading?: boolean
  isSubmitting?: boolean
  showActions?: boolean
  collapsible?: boolean
}

// ============================================================================
// Helper Functions
// ============================================================================

function formatDuration(minutes: number | null | undefined): string | null {
  if (!minutes) return null
  
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  
  if (hours > 0 && mins > 0) {
    return `${hours}j ${mins}m`
  } else if (hours > 0) {
    return `${hours} jam`
  } else {
    return `${mins} menit`
  }
}

// ============================================================================
// Sortable Step Item Component
// ============================================================================

interface SortableStepItemProps {
  step: RecipeStep
  isCollapsed: boolean
  onToggleCollapse: () => void
  onEdit: () => void
  onDelete: () => void
  showActions: boolean
}

function SortableStepItem({
  step,
  isCollapsed,
  onToggleCollapse,
  onEdit,
  onDelete,
  showActions,
}: SortableStepItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: step.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'group',
        isDragging && 'opacity-50'
      )}
    >
      <Card className={cn(
        'transition-all duration-200',
        isDragging && 'shadow-lg'
      )}>
        <CardContent className="p-4">
          {/* Header */}
          <div className="flex items-start gap-3">
            {/* Drag Handle */}
            <button
              className="mt-1 cursor-grab active:cursor-grabbing touch-none"
              {...attributes}
              {...listeners}
            >
              <GripVertical className="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors" />
            </button>

            {/* Step Number Badge */}
            <Badge variant="outline" className="mt-1 shrink-0">
              Langkah {step.stepNumber}
            </Badge>

            {/* Content */}
            <div className="flex-1 min-w-0">
              {/* Instruction (always visible) */}
              <p
                className={cn(
                  'text-sm leading-relaxed',
                  isCollapsed && 'line-clamp-2'
                )}
              >
                {step.instruction}
              </p>

              {/* Details (shown when expanded) */}
              {!isCollapsed && (
                <div className="mt-3 space-y-2">
                  {/* Duration and Temperature */}
                  {(step.duration || step.temperature) && (
                    <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                      {step.duration && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{formatDuration(step.duration)}</span>
                        </div>
                      )}
                      {step.temperature && (
                        <div className="flex items-center gap-1">
                          <Thermometer className="h-3 w-3" />
                          <span>{step.temperature}°C</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Notes */}
                  {step.notes && (
                    <div className="flex items-start gap-2 p-2 bg-muted/50 rounded-md">
                      <Info className="h-3 w-3 mt-0.5 text-muted-foreground shrink-0" />
                      <p className="text-xs text-muted-foreground">
                        {step.notes}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 shrink-0">
              {/* Collapse Toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggleCollapse}
                className="h-8 w-8 p-0"
              >
                {isCollapsed ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronUp className="h-4 w-4" />
                )}
              </Button>

              {/* Edit and Delete (shown when actions enabled) */}
              {showActions && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onEdit}
                    className="h-8 w-8 p-0"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onDelete}
                    className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// ============================================================================
// Loading Skeleton
// ============================================================================

function RecipeStepListSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-32" />
      </div>
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Skeleton className="h-5 w-5 mt-1" />
                <Skeleton className="h-6 w-20 mt-1" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
                <Skeleton className="h-8 w-8" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

// ============================================================================
// Main Component
// ============================================================================

export const RecipeStepList: FC<RecipeStepListProps> = ({
  steps,
  onAdd,
  onUpdate,
  onDelete,
  onReorder,
  isLoading = false,
  isSubmitting = false,
  showActions = true,
  collapsible = true,
}) => {
  const [formOpen, setFormOpen] = useState(false)
  const [editingStep, setEditingStep] = useState<RecipeStep | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [stepToDelete, setStepToDelete] = useState<RecipeStep | null>(null)
  const [collapsedSteps, setCollapsedSteps] = useState<Set<string>>(new Set())
  const [localSteps, setLocalSteps] = useState(steps)

  // Configure drag sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Update local steps when props change
  useState(() => {
    setLocalSteps(steps)
  })

  // Handle drag end
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = localSteps.findIndex((step) => step.id === active.id)
      const newIndex = localSteps.findIndex((step) => step.id === over.id)

      const reorderedSteps = arrayMove(localSteps, oldIndex, newIndex).map(
        (step, index) => ({
          ...step,
          stepNumber: index + 1,
        })
      )

      // Optimistic update
      setLocalSteps(reorderedSteps)

      // Call API
      try {
        await onReorder(reorderedSteps)
      } catch (error) {
        // Revert on error
        setLocalSteps(steps)
        console.error('Reorder error:', error)
      }
    }
  }

  // Handle collapse toggle
  const handleToggleCollapse = (stepId: string) => {
    setCollapsedSteps((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(stepId)) {
        newSet.delete(stepId)
      } else {
        newSet.add(stepId)
      }
      return newSet
    })
  }

  // Handle add new step
  const handleAdd = () => {
    setEditingStep(null)
    setFormOpen(true)
  }

  // Handle edit step
  const handleEdit = (step: RecipeStep) => {
    setEditingStep(step)
    setFormOpen(true)
  }

  // Handle delete click
  const handleDeleteClick = (step: RecipeStep) => {
    setStepToDelete(step)
    setDeleteDialogOpen(true)
  }

  // Handle delete confirm
  const handleDeleteConfirm = async () => {
    if (stepToDelete) {
      await onDelete(stepToDelete.id)
      setDeleteDialogOpen(false)
      setStepToDelete(null)
    }
  }

  // Handle form submission
  const handleFormSubmit = async (data: RecipeStepFormData) => {
    if (editingStep) {
      await onUpdate(editingStep.id, data)
    } else {
      await onAdd(data)
    }
  }

  // Handle print recipe
  const handlePrint = () => {
    window.print()
  }

  // Handle expand/collapse all
  const handleExpandAll = () => {
    setCollapsedSteps(new Set())
  }

  const handleCollapseAll = () => {
    setCollapsedSteps(new Set(localSteps.map((step) => step.id)))
  }

  // Loading state
  if (isLoading) {
    return <RecipeStepListSkeleton />
  }

  // Empty state
  if (localSteps.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="rounded-full bg-muted/50 p-6 mb-4">
            <GripVertical className="h-12 w-12 text-muted-foreground/50" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Belum ada langkah resep</h3>
          <p className="text-sm text-muted-foreground text-center mb-6 max-w-sm">
            Tambahkan langkah-langkah pembuatan menu untuk membantu tim produksi
          </p>
          <Button onClick={handleAdd}>
            <Plus className="mr-2 h-4 w-4" />
            Tambah Langkah Pertama
          </Button>

          {/* Form Dialog */}
          <RecipeStepForm
            open={formOpen}
            onOpenChange={setFormOpen}
            existingStep={editingStep}
            stepNumber={1}
            onSubmit={handleFormSubmit}
            isSubmitting={isSubmitting}
          />
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header with Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Langkah Resep</h3>
          <p className="text-sm text-muted-foreground">
            {localSteps.length} langkah • Seret untuk mengurutkan ulang
          </p>
        </div>
        <div className="flex items-center gap-2">
          {collapsible && localSteps.length > 1 && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExpandAll}
                disabled={isSubmitting}
              >
                Buka Semua
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCollapseAll}
                disabled={isSubmitting}
              >
                Tutup Semua
              </Button>
            </>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
            className="hidden sm:flex"
          >
            <Printer className="mr-2 h-4 w-4" />
            Cetak
          </Button>
          {showActions && (
            <Button onClick={handleAdd} size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Tambah Langkah
            </Button>
          )}
        </div>
      </div>

      {/* Sortable Steps List */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={localSteps.map((step) => step.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-3">
            {localSteps.map((step) => (
              <SortableStepItem
                key={step.id}
                step={step}
                isCollapsed={collapsible && collapsedSteps.has(step.id)}
                onToggleCollapse={() => handleToggleCollapse(step.id)}
                onEdit={() => handleEdit(step)}
                onDelete={() => handleDeleteClick(step)}
                showActions={showActions}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {/* Form Dialog */}
      <RecipeStepForm
        open={formOpen}
        onOpenChange={setFormOpen}
        existingStep={editingStep}
        stepNumber={localSteps.length + 1}
        onSubmit={handleFormSubmit}
        isSubmitting={isSubmitting}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Langkah?</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus Langkah {stepToDelete?.stepNumber}?
              <br />
              <br />
              Nomor langkah berikutnya akan diperbarui secara otomatis.
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
