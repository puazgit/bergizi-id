// Procurement Hooks - Export barrel (Server Actions Pattern)
// src/components/sppg/procurement/hooks/index.ts

// Modern server actions hooks (preferred)
export * from './useProcurementServerActions'

// Legacy hooks (deprecated - uses direct DB access)
// Commented out due to naming conflicts - use server actions instead
// export * from './useProcurement'
// export * from './useProcurementService'  // DEPRECATED: Direct DB access