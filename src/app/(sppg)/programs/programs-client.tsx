// Programs Page Client Component - Pattern 2 Architecture
// Bergizi-ID SaaS Platform - SPPG Program Management
// src/app/(sppg)/programs/programs-client.tsx

'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  ProgramDashboard,
  ProgramListWithStats,
  ProgramForm
} from '@/components/sppg/menu/components'
import { usePrograms } from '@/components/sppg/menu/hooks'
import { useRouter } from 'next/navigation'

export function ProgramsPageClient() {
  const router = useRouter()
  const { deleteProgram, isDeleting } = usePrograms()
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  const handleEdit = (programId: string) => {
    router.push(`/programs/${programId}/edit`)
  }

  const handleView = (programId: string) => {
    router.push(`/programs/${programId}`)
  }

  const handleDelete = (programId: string) => {
    setDeleteConfirmId(programId)
  }

  const confirmDelete = () => {
    if (deleteConfirmId) {
      deleteProgram(deleteConfirmId, {
        onSuccess: () => {
          setDeleteConfirmId(null)
        }
      })
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Program Nutrisi</h1>
          <p className="text-muted-foreground mt-1">
            Kelola program nutrisi dan distribusi makanan SPPG
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Buat Program Baru
        </Button>
      </div>

      {/* Statistics Dashboard */}
      <ProgramDashboard />

      {/* Programs List */}
      <ProgramListWithStats
        showStats={false}
        onEdit={handleEdit}
        onView={handleView}
        onDelete={handleDelete}
        variant="grid"
      />

      {/* Create Program Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Buat Program Baru</DialogTitle>
            <DialogDescription>
              Tambahkan program nutrisi baru untuk SPPG Anda
            </DialogDescription>
          </DialogHeader>
          <ProgramForm
            onSuccess={() => setShowCreateDialog(false)}
            onCancel={() => setShowCreateDialog(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteConfirmId} onOpenChange={(open) => !open && setDeleteConfirmId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus Program?</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus program ini? Tindakan ini tidak dapat dibatalkan.
              Semua menu, procurement plan, dan distribusi yang terkait juga akan dihapus.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 justify-end mt-4">
            <Button
              variant="outline"
              onClick={() => setDeleteConfirmId(null)}
              disabled={isDeleting}
            >
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? 'Menghapus...' : 'Hapus Program'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
