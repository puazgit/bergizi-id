# 📊 Schema Duplication Analysis Report

**Date:** October 10, 2025  
**Project:** Bergizi-ID Enterprise SaaS Platform  
**Analysis Scope:** All TypeScript schema definitions

---

## 🚨 CRITICAL FINDINGS

### **1. Authentication Schema Duplications (HIGH PRIORITY)**

#### **A. loginSchema - 3 Duplicates Found**

| Location | Validation Rules | Field Names | Issues |
|----------|------------------|-------------|---------|
| `src/schemas/auth.ts` | Comprehensive (min 8 chars) | `remember` | ✅ Most complete |
| `src/lib/auth-actions.ts` | Medium (min 6 chars) | `rememberMe` | ⚠️ Inconsistent field name |
| `src/auth.ts` | Minimal (min 6 chars) | None | ❌ Too basic for production |

**Impact:** Authentication inconsistencies across the application

#### **B. registerSchema - 2 Duplicates Found**

| Location | Password Policy | Additional Fields | Validation |
|----------|----------------|-------------------|------------|
| `src/schemas/auth.ts` | Complex regex + confirmPassword | `userType`, `sppgId`, `acceptTerms` | ✅ Enterprise-ready |
| `src/lib/auth-actions.ts` | Basic + confirmPassword | `phone`, `sppgCode` | ⚠️ Different field set |

**Impact:** Registration flow inconsistencies

#### **C. changePasswordSchema - 2 Duplicates Found**

| Location | Current Password Check | Validation Rules | Security Features |
|----------|----------------------|------------------|-------------------|
| `src/schemas/auth.ts` | ✅ Required | Complex regex + difference check | ✅ High security |
| `src/lib/auth-actions.ts` | ✅ Required | Basic validation | ⚠️ Lower security |

#### **D. forgotPasswordSchema - 2 Duplicates Found**

| Location | Email Validation | Transformations |
|----------|------------------|-----------------|
| `src/schemas/auth.ts` | Basic email format | None |
| `src/lib/auth-actions.ts` | Email + lowercase + trim | Data cleaning |

---

## 📋 COMPREHENSIVE SCHEMA INVENTORY

### **Central Schemas (`src/schemas/`)**
- ✅ `auth.ts` - 11 authentication schemas (EXPORT)
- ✅ `subscription.ts` - 1 subscription schema (EXPORT)

### **Domain-Specific Schemas (Pattern 2 Architecture)**

#### **Menu Domain (`src/actions/sppg/menu*.ts`)**
- `createMenuSchema` - Menu creation
- `updateMenuSchema` - Menu updates
- `updateMenuIngredientsSchema` - Ingredient management
- `createProgramSchema` - Nutrition program creation

#### **Menu Advanced (`src/actions/sppg/menu-advanced.ts`)**
- `menuFiltersSchema` - Search and filtering
- `duplicateMenuSchema` - Menu duplication
- `bulkUpdateMenuStatusSchema` - Batch operations
- `menuSearchSchema` - Advanced search
- `menuPlanningSchema` - Menu planning

#### **Menu Ingredients (`src/actions/sppg/menu-ingredients.ts`)**
- `addIngredientSchema` - Add ingredients to menu
- `updateIngredientSchema` - Update ingredient details
- `bulkAddIngredientsSchema` - Batch ingredient addition
- `ingredientSearchSchema` - Ingredient search

#### **Menu Planning (`src/actions/sppg/menu-planning.ts`)**
- `getMenuPlansSchema` - Retrieve menu plans
- `createMenuPlanSchema` - Create planning schedules
- `assignMenuSchema` - Assign menus to dates
- `menuCalendarSchema` - Calendar integration
- `generateBalancedPlanSchema` - Auto-generate balanced plans

#### **Menu Recipes (`src/actions/sppg/menu-recipes.ts`)**
- `createRecipeStepSchema` - Recipe step creation
- `updateRecipeStepSchema` - Recipe step updates
- `reorderStepsSchema` - Step reordering
- `bulkCreateStepsSchema` - Batch step creation

#### **Inventory Domain (`src/actions/sppg/inventory.ts`)**
- `createInventoryItemSchema` - Item creation with nutrition data
- `updateInventoryItemSchema` - Item updates
- `stockMovementSchema` - Stock transactions
- `bulkStockUpdateSchema` - Batch stock updates (commented)

#### **Procurement Domain (`src/actions/sppg/procurement.ts`)**
- `createProcurementSchema` - Procurement order creation
- `updateProcurementStatusSchema` - Status updates

#### **Distribution Domain (`src/actions/sppg/distribution.ts`)**
- `createDistributionSchema` - Distribution planning
- `updateDistributionStatusSchema` - Status management

#### **Feedback Domain (`src/actions/sppg/feedback.ts`)**
- `createFeedbackSchema` - User feedback collection
- `respondToFeedbackSchema` - Admin responses
- `updateFeedbackStatusSchema` - Status tracking

#### **Dashboard Domain (`src/actions/sppg/dashboard.ts`)**
- `dashboardFiltersSchema` - Dashboard filtering
- `alertConfigSchema` - Alert configuration (commented)

---

## ⚠️ PROBLEMATIC PATTERNS IDENTIFIED

### **1. Inconsistent Field Naming**
- `remember` vs `rememberMe`
- `password` vs `newPassword` vs `confirmPassword`
- Inconsistent casing and naming conventions

### **2. Validation Rule Conflicts**
- Password minimum: 6 vs 8 characters
- Email validation: basic vs comprehensive
- Different error messages for same validation

### **3. Missing Cross-Domain Schemas**
- No centralized validation for common entities (SPPG, User, etc.)
- No shared utility schemas for dates, IDs, etc.
- No API response schemas

### **4. Architecture Pattern Violations**
- Auth schemas duplicated across layers
- Some schemas should be in `src/schemas/` but are local
- Inconsistent export patterns

---

## 🎯 RECOMMENDED ACTIONS

### **IMMEDIATE (High Priority)**

1. **Consolidate Authentication Schemas**
   - Use ONLY `src/schemas/auth.ts` versions
   - Remove duplicates from `src/lib/auth-actions.ts` and `src/auth.ts`
   - Import centralized schemas everywhere

2. **Standardize Field Names**
   - Choose `remember` or `rememberMe` (recommend `remember`)
   - Ensure consistent naming across all forms

3. **Unify Validation Rules**
   - Use enterprise-grade validation (8-char passwords, complex regex)
   - Standardize error messages
   - Apply consistent data transformations

### **SHORT TERM (Medium Priority)**

4. **Create Cross-Domain Schemas**
   ```typescript
   // src/schemas/common.ts
   export const sppgIdSchema = z.string().cuid()
   export const userIdSchema = z.string().cuid()
   export const dateRangeSchema = z.object({...})
   export const paginationSchema = z.object({...})
   ```

5. **Add Missing Central Schemas**
   ```typescript
   // src/schemas/menu.ts
   // src/schemas/procurement.ts
   // src/schemas/inventory.ts
   // src/schemas/distribution.ts
   ```

6. **Implement Schema Versioning**
   - Add version tracking for breaking changes
   - Create migration strategies
   - Document schema evolution

### **LONG TERM (Strategic)**

7. **Schema Governance**
   - Establish schema review process
   - Create schema testing standards
   - Implement automated duplication detection

8. **Performance Optimization**
   - Lazy load complex schemas
   - Implement schema caching
   - Optimize validation performance

---

## 📊 IMPACT ASSESSMENT

### **Current Risks**
- ❌ **Authentication inconsistencies** - Users may face login issues
- ❌ **Form validation conflicts** - Inconsistent user experience  
- ❌ **Security vulnerabilities** - Weaker validation in some paths
- ❌ **Maintenance overhead** - Multiple schemas to update
- ❌ **Developer confusion** - Unclear which schema to use

### **Post-Cleanup Benefits**
- ✅ **Consistent user experience** across all forms
- ✅ **Enhanced security** with standardized validation
- ✅ **Reduced maintenance** - single source of truth
- ✅ **Improved developer experience** - clear schema hierarchy
- ✅ **Better type safety** - centralized type definitions

---

## 🔄 MIGRATION STRATEGY

### **Phase 1: Authentication Cleanup**
1. Update all imports to use `src/schemas/auth.ts`
2. Remove duplicate schemas from other files
3. Test all authentication flows
4. Update tests to match new schema structure

### **Phase 2: Field Standardization**
1. Choose standard field names
2. Update all forms and components
3. Update database queries if needed
4. Test form submissions

### **Phase 3: Validation Unification**
1. Apply enterprise validation rules everywhere
2. Update error handling
3. Test edge cases
4. Update documentation

---

## 📈 SUCCESS METRICS

- **Schema Count Reduction**: Target 30-50% reduction in duplicate schemas
- **Test Coverage**: Maintain >90% coverage after cleanup
- **Performance**: No degradation in form validation speed
- **Developer Experience**: Reduced confusion and faster development
- **Security**: Enhanced validation consistency across all forms

---

**Next Steps:** Start with Phase 1 authentication cleanup to address the most critical duplications immediately.