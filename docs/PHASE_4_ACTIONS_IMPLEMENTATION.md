# PHASE 4: Actions Implementation

**Status**: � IN PROGRESS (Core CRUD - 80% Complete)  
**Started**: 2025-01-09  
**Target**: Server actions untuk menghubungkan hooks ke database

---

## 📋 Current Status

### Core CRUD Actions (menuActions.ts) - 80% ✅
- [x] File created (865 lines)
- [x] `getMenus(filters)` - Multi-tenant query with pagination
- [x] `getMenu(id)` - Single menu with full relations  
- [x] `createMenu(input)` - Create with validation & audit
- [x] `updateMenu(input)` - Update with validation & audit
- [x] `deleteMenu(id)` - Soft delete with audit
- [x] `getMenuStats(programId)` - Dashboard statistics
- [ ] Fix remaining type errors (31 errors)

### Remaining Actions (NOT STARTED)
- [ ] Ingredient Actions (ingredientActions.ts)
- [ ] Recipe Actions (recipeActions.ts)
- [ ] Planning Actions (planningActions.ts)
- [ ] Calculator Actions (calculatorActions.ts)

---

## 📊 Progress Summary

| Component | Status | Lines | Errors | Progress |
|-----------|--------|-------|--------|----------|
| **menuActions.ts** | 🔧 In Progress | 865 | 31 | 80% |
| **ingredientActions.ts** | ⏳ Pending | 0 | - | 0% |
| **recipeActions.ts** | ⏳ Pending | 0 | - | 0% |
| **planningActions.ts** | ⏳ Pending | 0 | - | 0% |
| **calculatorActions.ts** | ⏳ Pending | 0 | - | 0% |

---

## 🔧 Current Issues (menuActions.ts)

### Type Errors (31 total)

**Category 1: Session Type Safety (11 errors)**
- `'session' is possibly 'undefined'` - Need proper type narrowing

**Category 2: Prisma Schema Mismatches (8 errors)**
- Menu-Ingredient relation fields incorrect
- AuditLog `changes` field not in schema
- FoodDistribution `menuId` field incorrect
- Program select missing `programCode`

**Category 3: Type Conversions (4 errors)**
- MenuWithDetails type mismatch
- Need proper type casting

**Category 4: Unused Variables (3 errors)**
- `MenuListItem` import
- `hasNext`, `hasPrev` variables

**Category 5: Optional Fields (5 errors)**
- `fiber` and other optional nutrition fields

---

## 🎯 Next Actions

### Immediate (Priority 1)
1. Fix session type narrowing
2. Check Prisma schema for correct field names
3. Fix AuditLog schema (remove or fix `changes`)
4. Fix type conversions

### Short Term (Priority 2)
1. Complete menuActions.ts (100%)
2. Start ingredientActions.ts
3. Start recipeActions.ts

### Medium Term (Priority 3)
1. Complete planning actions
2. Complete calculator actions
3. Integration testing

---

## 📝 Implementation Notes

### ✅ What's Working

1. **Multi-tenant Security**
   - All queries filter by `sppgId`
   - Access checks before mutations
   - Verification of resource ownership

2. **RBAC Implementation**
   - `canManageMenu()` permission check
   - Role-based access control
   - Admin override capability

3. **Validation**
   - Zod schema validation
   - Input sanitization
   - Error handling

4. **Architecture Patterns**
   - Query builder functions
   - Helper functions for auth
   - Consistent error handling
   - Path revalidation

### 🔧 Needs Fixing

1. **Type Safety**
   - Session types need narrowing
   - Prisma return types need proper casting
   - Optional fields handling

2. **Schema Alignment**
   - Need to verify all Prisma field names
   - AuditLog schema needs update
   - Relation fields need checking

3. **Error Handling**
   - Some edge cases not covered
   - Need better error messages

---

## 💡 Key Learnings

1. **Type Safety is Critical**
   - TypeScript strict mode reveals many issues
   - Need to check Prisma schema carefully
   - Type assertions should be minimized

2. **Prisma Gotchas**
   - Field names must match exactly
   - Relations need proper includes
   - Optional fields need null handling

3. **Multi-tenant is Complex**
   - Every query needs sppgId filter
   - Access checks are crucial
   - Testing is essential

---

## 🔥 Estimated Remaining Time

- Fix menuActions.ts errors: **30 minutes**
- Ingredient actions: **1 hour**
- Recipe actions: **1 hour**
- Planning actions: **1.5 hours**
- Calculator actions: **30 minutes**

**Total**: ~4.5 hours remaining

---

**Current Status**: Paused for error fixing. Will resume after fixing type issues and schema alignment.
