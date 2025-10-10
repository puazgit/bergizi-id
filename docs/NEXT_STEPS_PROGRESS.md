# Next Steps Progress - October 7, 2024

## 📊 Overall Progress: 60% Complete

---

## ✅ COMPLETED STEPS

### **Step 1: Create Missing Type Files** ✅
- ✅ `/src/types/domains/menu.ts` - Complete with all Prisma schema types
- ✅ `/src/types/domains/procurement.ts` - Complete with all Prisma schema types

### **Step 2a: Fix Core Import Paths** ✅
- ✅ Fixed `auth.ts`: `@/lib/prisma` → `@/lib/db`
- ✅ Fixed procurement actions: `/domains/procurement/types` → `/types/domains/procurement`

### **Step 2b: Create Menu Utilities** ✅
- ✅ Created `/src/components/sppg/menu/utils/menuUtils.ts`
  - formatNutritionValue()
  - formatCost()
  - getMealTypeLabel()
  - getMealTypeColor()
  - calculateNutritionScore()
  - isNutritionBalanced()
  - getNutritionBalanceStatus()
  - calculateTotalNutrition()
  - calculateCostPerServing()
  - calculateProfitMargin()
  - hasCompleteNutrition()
  - hasAllergenInfo()
  - formatCookingTime()
- ✅ Created barrel export `/src/components/sppg/menu/utils/index.ts`

### **Step 2c: Fix Menu Pages Utils Import** ✅
- ✅ Updated `/src/app/(sppg)/menu/[id]/page.tsx`
- ✅ Updated `/src/app/(sppg)/menu/analytics/page.tsx`

---

## 🔄 IN PROGRESS

### **Step 2d: Create Menu Hooks** (NEXT)

**Files to Create:**
1. `/src/hooks/sppg/useMenu.ts` - Main menu hooks

**Required Exports:**
```typescript
export function useMenuList() {
  // Fetch list of menus with filters
  // Returns: { data, isLoading, error }
}

export function useMenu(id: string) {
  // Fetch single menu by ID
  // Returns: { data, isLoading, error }
}

export function useMenuActions() {
  // CRUD operations
  // Returns: { create, update, delete, toggleStatus, isCreating, isUpdating, isDeleting, isTogglingStatus }
}
```

**Dependencies:**
- Server Actions: Need to implement in `/src/actions/sppg/menu.ts`
- TanStack Query for data fetching
- Zustand store (optional) for client state

---

## 📋 PENDING STEPS

### **Step 2e: Create Menu Components**
**Priority**: High
**Path**: `/src/components/sppg/menu/components/`

Files needed:
1. `MenuList.tsx` - Display list of menus with filters
2. `MenuForm.tsx` - Create/edit menu form
3. `MenuCard.tsx` - Individual menu card component
4. `index.ts` - Barrel export

### **Step 2f: Create Menu Server Actions**
**Priority**: High
**File**: `/src/actions/sppg/menu.ts`

Actions needed:
```typescript
export async function getMenus(filters?: MenuFilters) {}
export async function getMenu(id: string) {}
export async function createMenu(data: CreateMenuInput) {}
export async function updateMenu(id: string, data: UpdateMenuInput) {}
export async function deleteMenu(id: string) {}
export async function toggleMenuStatus(id: string) {}
```

### **Step 2g: Fix Procurement Component Imports**
**Files**:
- `/src/components/sppg/procurement/components/ProcurementCard.tsx`
- `/src/components/sppg/procurement/components/ProcurementList.tsx`
- `/src/stores/sppg/procurementStore.ts`

**Changes**: Update type imports from `/domains/procurement/types` → `/types/domains/procurement`

### **Step 2h: Move/Create Procurement Hooks**
**Decision**: Keep hooks in `/src/hooks/sppg/` for consistency

**Files**:
- Move `/src/components/sppg/procurement/hooks/useProcurement.ts` → `/src/hooks/sppg/useProcurement.ts`
- Update all imports

### **Step 2i: Fix All Remaining Import Errors**
- Update menu pages:
  - `/src/app/(sppg)/menu/page.tsx`
  - `/src/app/(sppg)/menu/create/page.tsx`
  - `/src/app/(sppg)/menu/[id]/edit/page.tsx`
- Run `npx tsc --noEmit` to verify
- Fix any remaining errors

### **Step 2j: Update Documentation**
- Update `CLEANUP_SUMMARY.md` with final status
- Update `IMPORT_FIXES_PLAN.md` with completed steps
- Create migration guide if needed

---

## 🎯 Critical Path

```
Step 2d (Hooks) 
   ↓
Step 2e (Components) 
   ↓
Step 2f (Server Actions)
   ↓
Step 2g-2h (Procurement fixes)
   ↓
Step 2i (Final import fixes)
   ↓
Step 2j (Documentation)
   ↓
✅ COMPLETE
```

---

## 📝 Architecture Decisions Made

### 1. **Hooks Location** ✅
**Decision**: Use `/src/hooks/sppg/` for all SPPG domain hooks
**Rationale**: 
- Aligns with copilot-instructions.md "Struktur Folder" (lines 726-760)
- Centralized management
- Easier discovery

### 2. **Utils Location** ✅
**Decision**: Keep utils in `/src/components/sppg/{domain}/utils/`
**Rationale**:
- Domain-specific utilities stay with components
- More modular and cohesive
- Follows component architecture pattern

### 3. **Types Location** ✅
**Decision**: All domain types in `/src/types/domains/`
**Rationale**:
- Shared across layers (components, hooks, actions)
- Single source of truth
- Follows copilot-instructions architecture

---

## 🔍 Files Created So Far

```
src/
├── types/
│   └── domains/
│       ├── menu.ts ✅ (Updated)
│       └── procurement.ts ✅ (Updated)
├── components/
│   └── sppg/
│       └── menu/
│           └── utils/
│               ├── menuUtils.ts ✅ (New)
│               └── index.ts ✅ (New)
└── hooks/
    └── sppg/
        └── (empty - to be created)
```

---

## ⚠️ Known Issues

### Import Errors Remaining:
1. Menu hooks don't exist yet (`useMenu`, `useMenuActions`)
2. Menu components don't exist yet (`MenuList`, `MenuForm`)
3. Procurement components need type import updates
4. Some server actions reference missing types

### Compilation Status:
- **TypeScript**: ❌ Errors present (hooks/components missing)
- **Expected after Step 2d**: 🟡 Partial (components still missing)
- **Expected after Step 2e**: ✅ Should compile

---

## 🚀 Ready to Execute

**Next Command to Run:**
```bash
# After creating hooks, test compilation
npx tsc --noEmit 2>&1 | grep -E "(error TS|Found [0-9]+ error)" | head -20
```

**Files to Create Next:**
1. `/src/hooks/sppg/useMenu.ts`
2. `/src/actions/sppg/menu.ts` (if doesn't exist)

---

**Last Updated**: Step 2c completed  
**Current Task**: Step 2d - Create Menu Hooks  
**Estimated Time to Complete**: 2-3 more steps (30-45 minutes)
