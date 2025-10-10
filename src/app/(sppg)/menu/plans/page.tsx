'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

// PHASE 6 Components
import {
  PlanningDashboard,
  PlanForm,
} from '@/components/sppg/menu/components'

// PHASE 3 Hooks
import {
  usePrograms,
} from '@/components/sppg/menu/hooks'

// PHASE 5 Server Actions
import { createMenuPlan } from '@/actions/sppg/menu-planning'

// UI Components
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

// Types
interface MenuPlan {
  id: string
  planName: string
  status: 'DRAFT' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED'
  startDate: Date
  endDate: Date
  assignmentsCount: number // Required by component
  budgetUsed?: number
}

interface PlanFormData {
  planName: string
  programId: string
  startDate: Date
  endDate: Date
  budgetConstraint?: number | null
  description?: string | null
}

// ============================================================================
// Main Component
// ============================================================================

export default function PlansPage() {
  const router = useRouter()
  const [isPlanFormOpen, setIsPlanFormOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Get active programs - usePrograms returns object not {data, isLoading}
  const { programs, isLoading: programsLoading } = usePrograms()

  // TODO: Implement actual data fetching when hooks are ready
  // For now, use placeholder data
  const plans: MenuPlan[] = []
  const plansLoading = false

  // Calculate metrics from plans
  const calculatedMetrics = {
    totalPlans: plans?.length || 0,
    activePlans: plans?.filter((p: MenuPlan) => p.status === 'ACTIVE').length || 0,
    completedPlans: plans?.filter((p: MenuPlan) => p.status === 'COMPLETED').length || 0,
    totalAssignments: plans?.reduce((sum: number, p: MenuPlan) => sum + (p.assignmentsCount || 0), 0) || 0,
    averageNutritionScore: 0, // TODO: Get from metrics
    totalBudgetUsed: plans?.reduce((sum: number, p: MenuPlan) => sum + (p.budgetUsed || 0), 0) || 0,
  }

  // Handle create plan
  const handleCreatePlan = () => {
    setIsPlanFormOpen(true)
  }

  // Handle view calendar
  const handleViewCalendar = () => {
    router.push('/menu/calendar')
  }

  // Handle plan form submission
  const handlePlanSubmit = async (data: PlanFormData) => {
    setIsSubmitting(true)
    try {
      // Call PHASE 5 server action
      const result = await createMenuPlan({
        name: data.planName, // Action expects 'name' not 'planName'
        programId: data.programId,
        startDate: data.startDate,
        endDate: data.endDate,
        description: data.description || undefined, // Convert null to undefined
      })

      if (result.success && result.data) {
        toast.success('Rencana menu berhasil dibuat!', {
          description: `Rencana "${data.planName}" telah ditambahkan.`,
        })
        setIsPlanFormOpen(false)
        // Navigate to plan detail - type assertion for unknown result.data
        const planData = result.data as { id: string }
        router.push(`/menu/plans/${planData.id}`)
      } else {
        toast.error('Gagal membuat rencana menu', {
          description: result.error || 'Terjadi kesalahan saat membuat rencana.',
        })
      }
    } catch (error) {
      console.error('Create plan error:', error)
      toast.error('Gagal membuat rencana menu', {
        description: 'Terjadi kesalahan yang tidak terduga.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Loading state
  if (plansLoading || programsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <>
      {/* PHASE 6 Component - Planning Dashboard */}
      <PlanningDashboard
        plans={plans || []}
        metrics={calculatedMetrics}
        isLoading={plansLoading}
        onCreatePlan={handleCreatePlan}
        onViewCalendar={handleViewCalendar}
      />

      {/* PHASE 6 Component - Plan Form Modal */}
      <PlanForm
        open={isPlanFormOpen}
        onOpenChange={setIsPlanFormOpen}
        programs={programs || []}
        onSubmit={handlePlanSubmit}
        isSubmitting={isSubmitting}
      />
    </>
  )
}
