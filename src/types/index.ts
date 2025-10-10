// Global Types Index - Following Pattern 2 Architecture
// Bergizi-ID SaaS Platform - Centralized Type Exports

// Theme types
export * from './theme'

// Auth types
export * from './auth'

// ============= Pattern 2 Architecture Note =============
// Domain-specific types are now located in their respective domain components:
// - Menu: src/components/sppg/menu/types/menuTypes.ts
// - Procurement: src/components/sppg/procurement/types/procurementTypes.ts  
// - Production: src/components/sppg/production/types/productionTypes.ts
// - HRD: src/components/sppg/hrd/types/hrdTypes.ts
// - Inventory: src/components/sppg/inventory/types/inventoryTypes.ts
// - Distribution: src/components/sppg/distribution/types/distributionTypes.ts
//
// This follows Pattern 2 (Component-Level Domain Architecture) where:
// ✅ Each domain is self-contained with its own types, hooks, utils
// ✅ No cross-domain dependencies
// ✅ Clear domain boundaries
// ❌ No centralized domain folders