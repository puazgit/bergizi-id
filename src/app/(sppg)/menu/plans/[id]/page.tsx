'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'

// PHASE 6 Components
import {
  PlanDetail,
  MenuCalendar,
  BalancedPlanGenerator,
} from '@/components/sppg/menu/components'

// PHASE 3 Hooks
// Note: These hooks are currently stub implementations
// Data fetching will be enabled when server actions are complete
// import {
//   useMenuPlanning,
//   useMenuCalendar,
//   useAssignMenu,
// } from '@/components/sppg/menu/hooks'

// PHASE 5 Server Actions
import {
  generateBalancedMenuPlan,
} from '@/actions/sppg/menu-planning'

// UI Components
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

// ============================================================================
// Types
// ============================================================================

interface GenerateParams {
  planId: string
  startDate: Date
  endDate: Date
  mealTypes: string[]
  budgetConstraint?: number | null
}

interface GenerateResult {
  success: boolean
  assignmentsCreated: number // Required by component
  message?: string
  error?: string
}

// ============================================================================
// Main Component
// ============================================================================

export default function PlanDetailPage() {
  const params = useParams()
  const router = useRouter()
  const planId = params.id as string

  const [activeTab, setActiveTab] = useState<'overview' | 'calendar'>('overview')
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)

  // TODO: Implement actual data fetching when hooks are ready
  // For now, use placeholder data
  const plan = null
  const planLoading = false

  // Calculate detailed metrics
  const detailedMetrics = {
    nutritionScore: 0, // TODO: Calculate from plan data
    varietyScore: 0,
    costEfficiency: 0,
    complianceRate: 0,
  }

  // Handle export PDF
  const handleExportPDF = async () => {
    toast.info('Export PDF', {
      description: 'Fitur export PDF sedang dalam pengembangan.',
    })
  }

  // Handle export Excel
  const handleExportExcel = async () => {
    toast.info('Export Excel', {
      description: 'Fitur export Excel sedang dalam pengembangan.',
    })
  }

  // Handle edit plan
  const handleEdit = () => {
    router.push(`/menu/plans/${planId}/edit`)
  }

  // Handle delete plan
  const handleDelete = async () => {
    if (!confirm('Hapus rencana menu ini? Tindakan tidak dapat dibatalkan.')) return

    toast.info('Hapus Rencana', {
      description: 'Fitur hapus rencana sedang dalam pengembangan.',
    })
  }

  // Handle AI generation
  const handleGenerate = async (params: GenerateParams): Promise<GenerateResult> => {
    setIsGenerating(true)
    try {
      // Note: Server action expects programId, but component passes planId
      // In real implementation, we'd get programId from the plan data
      // For now, we'll use planId as a placeholder
      const result = await generateBalancedMenuPlan({
        programId: params.planId, // TODO: Get programId from plan.programId
        startDate: params.startDate,
        endDate: params.endDate,
        constraints: params.budgetConstraint ? {
          varietyScore: 0.7,
          maxRepetition: 2,
          budgetLimit: params.budgetConstraint
        } : undefined
      })

      if (result.success && result.data) {
        // Type assertion for result.data
        const resultData = result.data as { assignmentsCreated: number }
        toast.success('Menu berhasil digenerate!', {
          description: `${resultData.assignmentsCreated} penugasan menu telah dibuat.`,
        })
        return {
          success: true,
          assignmentsCreated: resultData.assignmentsCreated || 0, // Ensure number
        }
      } else {
        toast.error('Gagal generate menu', {
          description: result.error || 'Terjadi kesalahan saat generate menu.',
        })
        return {
          success: false,
          assignmentsCreated: 0, // Required field
          error: result.error,
        }
      }
    } catch (error) {
      console.error('Generate menu error:', error)
      toast.error('Gagal generate menu', {
        description: 'Terjadi kesalahan yang tidak terduga.',
      })
      return {
        success: false,
        assignmentsCreated: 0, // Required field
        error: 'Unexpected error',
      }
    } finally {
      setIsGenerating(false)
      setIsGeneratorOpen(false)
    }
  }

  // Handle add assignment (from calendar date click)
  const handleAddAssignment = async (_date: Date) => {
    toast.info('Tambah Penugasan', {
      description: 'Fitur tambah penugasan manual sedang dalam pengembangan.',
    })
    // TODO: Open assignment form dialog
  }

  // Type for assignment object
  interface Assignment {
    menu: {
      id: string
    }
  }

  // Handle view assignment
  const handleViewAssignment = (assignment: Assignment) => {
    router.push(`/menu/${assignment.menu.id}`)
  }

  // Handle edit assignment
  const handleEditAssignment = (_assignment: Assignment) => {
    toast.info('Edit Penugasan', {
      description: 'Fitur edit penugasan sedang dalam pengembangan.',
    })
    // TODO: Open assignment edit dialog
  }

  // Handle delete assignment
  const handleDeleteAssignment = async (_assignmentId: string) => {
    toast.info('Hapus Penugasan', {
      description: 'Fitur hapus penugasan sedang dalam pengembangan.',
    })
    // TODO: Implement when server action available
  }

  // Handle generate plan button
  const handleGeneratePlan = () => {
    setIsGeneratorOpen(true)
  }

  // Loading state
  if (planLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  // Not found
  if (!plan) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <h2 className="text-2xl font-bold">Rencana tidak ditemukan</h2>
        <p className="text-muted-foreground">
          Rencana menu yang Anda cari tidak tersedia.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'overview' | 'calendar')}>
        <TabsList>
          <TabsTrigger value="overview">Ringkasan</TabsTrigger>
          <TabsTrigger value="calendar">Kalender</TabsTrigger>
        </TabsList>

        {/* Overview Tab - PHASE 6 PlanDetail Component */}
        <TabsContent value="overview" className="space-y-6">
          <PlanDetail
            plan={plan}
            metrics={detailedMetrics}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onExportPDF={handleExportPDF}
            onExportExcel={handleExportExcel}
            showActions={true}
          />
        </TabsContent>

        {/* Calendar Tab - PHASE 6 MenuCalendar Component */}
        <TabsContent value="calendar" className="space-y-6">
          <MenuCalendar
            assignments={[]} // TODO: Get from hook when implemented
            onAddAssignment={handleAddAssignment}
            onViewAssignment={handleViewAssignment}
            onEditAssignment={handleEditAssignment}
            onDeleteAssignment={handleDeleteAssignment}
            onGeneratePlan={handleGeneratePlan}
            isLoading={false} // TODO: Get from hook when implemented
          />
        </TabsContent>
      </Tabs>

      {/* PHASE 6 Component - Balanced Plan Generator Modal */}
      <BalancedPlanGenerator
        open={isGeneratorOpen}
        onOpenChange={setIsGeneratorOpen}
        planId={planId}
        onGenerate={handleGenerate}
        isGenerating={isGenerating}
      />
    </div>
  )
}
