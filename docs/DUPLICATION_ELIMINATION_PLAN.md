# 🚨 DUPLICATION ELIMINATION IMPLEMENTATION

## 📋 Executive Summary
Implementing **Option A: Pure Pattern 2 Component-Level** to eliminate massive architectural duplication between `src/domains/` and `src/components/sppg/`.

## 🎯 Implementation Strategy

### Phase 1: Business Logic Migration (Services → Hooks) 
**Timeline**: Immediate
**Impact**: Critical

#### 1.1 Menu Domain Migration
```bash
# Move business logic
src/domains/menu/services/ → src/components/sppg/menu/hooks/
src/domains/menu/repositories/ → src/components/sppg/menu/hooks/
src/domains/menu/types/ → src/components/sppg/menu/types/

# Already done:
src/domains/menu/validators/ → src/components/sppg/menu/utils/ ✅
```

#### 1.2 Procurement Domain Migration  
```bash
src/domains/procurement/services/ → src/components/sppg/procurement/hooks/
src/domains/procurement/repositories/ → src/components/sppg/procurement/hooks/
src/domains/procurement/types/ → src/components/sppg/procurement/types/
src/domains/procurement/validators/ → src/components/sppg/procurement/utils/ ✅
```

#### 1.3 Production Domain Migration
```bash
src/domains/production/services/ → src/components/sppg/production/hooks/
src/domains/production/repositories/ → src/components/sppg/production/hooks/
src/domains/production/types/ → src/components/sppg/production/types/
src/domains/production/validators/ → src/components/sppg/production/utils/ ✅
```

#### 1.4 Distribution Domain Migration
```bash
src/domains/distribution/services/ → src/components/sppg/distribution/hooks/
src/domains/distribution/repositories/ → src/components/sppg/distribution/hooks/
src/domains/distribution/types/ → src/components/sppg/distribution/types/
src/domains/distribution/validators/ → src/components/sppg/distribution/utils/ ✅
```

#### 1.5 Inventory Domain Migration
```bash
src/domains/inventory/services/ → src/components/sppg/inventory/hooks/
src/domains/inventory/repositories/ → src/components/sppg/inventory/hooks/
src/domains/inventory/types/ → src/components/sppg/inventory/types/
src/domains/inventory/validators/ → src/components/sppg/inventory/utils/ ✅
```

#### 1.6 HRD Domain Migration
```bash
src/domains/hrd/services/ → src/components/sppg/hrd/hooks/
src/domains/hrd/repositories/ → src/components/sppg/hrd/hooks/
src/domains/hrd/types/ → src/components/sppg/hrd/types/
src/domains/hrd/validators/ → src/components/sppg/hrd/utils/ ✅
```

### Phase 2: Import Updates & Cleanup
**Timeline**: Immediate following Phase 1
**Impact**: High

#### 2.1 Update all imports from domains to components
- Update all `from '@/domains/...'` imports to `from '@/components/sppg/...'`
- Update server actions in `src/actions/sppg/`
- Update Zustand stores in `src/stores/sppg/`
- Update page components in `src/app/(sppg)/`

#### 2.2 Remove SPPG domains folder
- Delete entire `src/domains/` folder for SPPG domains
- Keep only platform-level domains if any exist

### Phase 3: Verification & Testing
**Timeline**: Immediate following Phase 2
**Impact**: Critical

#### 3.1 Functionality Testing
- Test all SPPG domain functionality
- Verify all imports resolve correctly
- Ensure no broken references

#### 3.2 Architecture Validation
- Confirm single source of truth
- Verify Pattern 2 compliance
- Document final architecture

## 🚀 EXECUTION PLAN

### Starting with Menu Domain (Most Critical)
The Menu domain has the most complex business logic and should be migrated first as a template for others.

### Critical Files to Migrate:
1. **Services** → **Hooks**
   - `menuService.ts` → `useMenuService.ts`
   - `nutritionCalculator.ts` → `useNutritionCalculator.ts`
   - `costCalculator.ts` → `useCostCalculator.ts`

2. **Repositories** → **Hooks** 
   - `menuRepository.ts` → `useMenuRepository.ts`
   - Database access patterns → Custom hooks with React Query

3. **Types** → **Types**
   - Domain types → Component types
   - Interface consolidation

## 🎯 SUCCESS CRITERIA

- ✅ Single source of truth for all business logic
- ✅ No import conflicts between domains and components  
- ✅ Full Pattern 2 compliance
- ✅ All functionality preserved
- ✅ Consistent architecture across all SPPG domains

## 🚨 RISK MITIGATION

### High-Risk Operations:
1. **Business Logic Migration**: Must preserve all functionality
2. **Import Updates**: Must update all references simultaneously
3. **Database Queries**: Repository patterns → React Query hooks

### Mitigation Strategy:
1. **Incremental Migration**: One domain at a time
2. **Backup Strategy**: Git commits between each domain
3. **Testing Strategy**: Verify each domain before proceeding

---

## 🏁 NEXT ACTION

**START IMPLEMENTATION**: Begin with Menu domain business logic migration to establish template for other domains.

**Command**: Execute Phase 1.1 - Menu Domain Migration immediately.