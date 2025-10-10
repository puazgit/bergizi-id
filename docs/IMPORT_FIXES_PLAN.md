# Import Fixes and File Creation Plan

## Status: In Progress
**Date**: October 7, 2024

---

## ✅ Completed

### 1. Type Files Created/Updated
- ✅ `/src/types/domains/menu.ts` - Updated with complete Prisma schema types
- ✅ `/src/types/domains/procurement.ts` - Updated with complete Prisma schema types

### 2. Fixed Imports
- ✅ `/src/actions/sppg/procurement.ts` - Fixed types import path
- ✅ `/src/app/(sppg)/menu/page.tsx` - Fixed import paths (but components/hooks don't exist yet)

---

## 🔄 In Progress

### Step 2b: Fix Remaining Menu Page Imports

#### Files with Import Errors:

1. **`/src/app/(sppg)/menu/create/page.tsx`**
   - Need to fix: `@/domains/menu/components` → TBD
   - Need to fix: `@/domains/menu/hooks` → TBD
   - Need to fix: `@/domains/menu/validators` → Already exists ✅

2. **`/src/app/(sppg)/menu/[id]/page.tsx`**
   - Need to fix: `@/domains/menu/hooks` → TBD
   - Need to fix: `@/domains/menu/utils` → Need to create

3. **`/src/app/(sppg)/menu/[id]/edit/page.tsx`**
   - Need to fix: `@/domains/menu/components` → TBD
   - Need to fix: `@/domains/menu/hooks` → TBD
   - Need to fix: `@/domains/menu/validators` → Already exists ✅

4. **`/src/app/(sppg)/menu/analytics/page.tsx`**
   - Need to fix: `@/domains/menu/utils` → Need to create

---

## 📋 Files That Need to Be Created

### Priority 1: Menu Utilities
**File**: `/src/components/sppg/menu/utils/menuUtils.ts`
**Exports Needed**:
```typescript
- formatNutritionValue()
- formatCost()
- getMealTypeLabel()
- getMealTypeColor()
- calculateNutritionScore()
- isNutritionBalanced()
```

### Priority 2: Menu Components
**Path**: `/src/components/sppg/menu/components/`

Components needed:
1. `MenuList.tsx` - List of menus with filters
2. `MenuForm.tsx` - Create/Edit menu form
3. `MenuCard.tsx` - Menu card display
4. `index.ts` - Export barrel

### Priority 3: Menu Hooks
**Decision Point**: Where should menu hooks live?

**Option A**: `/src/hooks/sppg/useMenu.ts` (Cross-domain shared hooks)
**Option B**: `/src/components/sppg/menu/hooks/useMenu.ts` (Component-specific hooks)

**Recommendation**: Option A for now (based on copilot-instructions.md line 726+)

**File**: `/src/hooks/sppg/useMenu.ts`
**Exports Needed**:
```typescript
- useMenuList() - Fetch list of menus
- useMenu() - Fetch single menu
- useMenuActions() - CRUD actions
  - create()
  - update()
  - delete()
  - toggleStatus()
```

### Priority 4: Procurement Components
**Path**: `/src/components/sppg/procurement/components/`

Missing/Need to fix:
1. `ProcurementCard.tsx` - Update types import
2. `ProcurementList.tsx` - Update types import

### Priority 5: Procurement Hooks
**File**: `/src/hooks/sppg/useProcurement.ts`
Already exists at `/src/components/sppg/procurement/hooks/useProcurement.ts`

**Decision**: Should we move it or keep it there?
- Current location suggests component-specific hooks pattern
- Need to align with menu hooks decision

---

## 🎯 Architecture Decision Required

### Question: Where should domain-specific hooks live?

**Pattern 1: Cross-domain in /hooks/sppg/**
```
src/
├── hooks/
│   └── sppg/
│       ├── useMenu.ts
│       ├── useProcurement.ts
│       └── useDistribution.ts
```
**Pros**: 
- Centralized hook management
- Easy to find all SPPG hooks
- Follows copilot-instructions.md "Struktur Folder" section

**Cons**:
- Hooks separated from their components
- Less modular

**Pattern 2: Component-specific in /components/sppg/{domain}/hooks/**
```
src/
├── components/
│   └── sppg/
│       ├── menu/
│       │   ├── components/
│       │   ├── hooks/useMenu.ts
│       │   ├── types/
│       │   └── utils/
│       └── procurement/
│           ├── components/
│           ├── hooks/useProcurement.ts
│           ├── types/
│           └── utils/
```
**Pros**:
- More modular and cohesive
- Hooks close to components that use them
- Follows "Modular Architecture Patterns" section

**Cons**:
- Hooks scattered across multiple folders
- Harder to find all hooks at a glance

### Current State:
- Procurement already has hooks in `/components/sppg/procurement/hooks/`
- Menu imports expect hooks in `/hooks/sppg/`

### Recommendation:
**Use Pattern 1** for consistency with copilot-instructions.md "Struktur Folder" (lines 726-760)
- Move procurement hooks to `/hooks/sppg/useProcurement.ts`
- Create menu hooks in `/hooks/sppg/useMenu.ts`

---

## 📝 Next Steps

### Step 2b: Create Menu Utilities
- [ ] Create `/src/components/sppg/menu/utils/menuUtils.ts`
- [ ] Export formatting functions
- [ ] Update imports in menu pages

### Step 2c: Create Menu Components
- [ ] Create `MenuList.tsx`
- [ ] Create `MenuForm.tsx`
- [ ] Create `MenuCard.tsx`
- [ ] Create `index.ts` barrel export

### Step 2d: Create/Move Menu Hooks
- [ ] Create `/src/hooks/sppg/useMenu.ts`
- [ ] Implement CRUD operations
- [ ] Move procurement hooks if needed

### Step 2e: Fix All Menu Page Imports
- [ ] Update all menu page imports
- [ ] Test compilation
- [ ] Verify no errors

### Step 2f: Fix Procurement Imports
- [ ] Update ProcurementCard.tsx
- [ ] Update ProcurementList.tsx
- [ ] Update stores if needed

### Step 2g: Update CLEANUP_SUMMARY.md
- [ ] Document all changes
- [ ] Update status to complete

---

## 🔍 Import Pattern Reference

| Old Pattern | New Pattern | Status |
|-------------|-------------|--------|
| `@/domains/menu/types` | `@/types/domains/menu` | ✅ Fixed |
| `@/domains/procurement/types` | `@/types/domains/procurement` | ✅ Fixed |
| `@/domains/menu/components` | `@/components/sppg/menu/components` | ⏳ Creating |
| `@/domains/menu/hooks` | `@/hooks/sppg/useMenu` | ⏳ Creating |
| `@/domains/menu/utils` | `@/components/sppg/menu/utils` | ⏳ Creating |
| `@/domains/menu/validators` | `@/domains/menu/validators` | ✅ Already correct |

---

**Last Updated**: Step 2a completed
**Next Action**: Create menu utilities (Step 2b)
