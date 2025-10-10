// Procurement Module Export - Pattern 2 Compliant
// src/components/sppg/procurement/index.ts

// Export components
export { ProcurementCard } from './components/ProcurementCard'
export { ProcurementForm } from './components/ProcurementForm'
export { ProcurementList } from './components/ProcurementList'

// Export hooks
export { 
  useProcurementList,
  useCreateProcurement,
  useUpdateProcurement,
  useDeleteProcurement
} from './hooks/useProcurement'

export {
  useProcurements,
  useProcurementOperations
} from './hooks/useProcurementServerActions'

// Export stores
export { useProcurementStore } from './stores/useProcurementStore'

// Export types from server actions to avoid duplication
export type {
  CreateProcurementInput,
  UpdateProcurementInput,
  ProcurementFilters
} from '@/actions/sppg/procurement'
