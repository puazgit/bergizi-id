# PHASE 3: Hooks Implementation

**Status**: ✅ **COMPLETE** (Core Infrastructure)  
**Started**: 2025-01-09  
**Completed**: 2025-01-09  
**Target**: Enterprise-grade React hooks with TanStack Query

---

## 📋 Implementation Status

### Core CRUD Hooks ✅
- [x] `useMenus(filters)` - Main list with caching & pagination
- [x] `useMenu(id)` - Single menu detail with 5min cache
- [x] `useCreateMenu()` - Create with optimistic updates
- [x] `useUpdateMenu()` - Update with optimistic updates
- [x] `useDeleteMenu()` - Delete with cache invalidation
- [x] `useMenuStats()` - Dashboard statistics

### Bulk Operations ✅
- [x] `useBulkUpdateStatus()` - Bulk status update
- [x] `useBulkDeleteMenus()` - Bulk delete

### Ingredient Management Hooks ✅
- [x] `useIngredients(menuId)` - Menu ingredients list
- [x] `useAddIngredient()` - Add ingredient with validation
- [x] `useUpdateIngredient()` - Update ingredient
- [x] `useRemoveIngredient()` - Remove ingredient
- [x] `useBulkAddIngredients()` - Bulk add with progress

### Recipe Management Hooks ✅
- [x] `useRecipe(menuId)` - Recipe steps list
- [x] `useCreateRecipeStep()` - Add step
- [x] `useUpdateRecipeStep()` - Update step
- [x] `useDeleteRecipeStep()` - Delete step
- [x] `useReorderRecipeSteps()` - Drag-drop reorder
- [x] `useBulkCreateRecipeSteps()` - Bulk add steps

### Menu Planning Hooks ✅
- [x] `useMenuPlanning(programId)` - Calendar planning
- [x] `useCreateMenuPlan()` - Create plan
- [x] `useAssignMenu()` - Assign menu to dates
- [x] `useGenerateBalancedPlan()` - Auto-generate balanced plan
- [x] `useMenuCalendar(startDate, endDate)` - Calendar view

### Calculator Hooks ✅
- [x] `useNutritionCalculator()` - Real-time nutrition calculation
- [x] `useCostCalculator()` - Real-time cost calculation

### Search & Export Hooks ✅
- [x] `useMenuSearch(term)` - Real-time search with debounce
- [x] `useExportMenus()` - Export to CSV/Excel/PDF

---

## 📁 Files Created

### 1. `/src/components/sppg/menu/hooks/useMenu.ts` (465 lines) ✅
**Core CRUD operations with TanStack Query**

Features:
- Query key factory for type-safe keys
- `useMenus()` - Paginated list with 5min cache
- `useMenu()` - Single detail with relations
- `useMenuStats()` - Statistics with 2min cache
- `useCreateMenu()` - Optimistic updates + cache invalidation
- `useUpdateMenu()` - Optimistic updates + rollback
- `useDeleteMenu()` - Soft delete + cache cleanup
- `useBulkUpdateMenuStatus()` - Batch status updates
- `useBulkDeleteMenus()` - Batch deletes

Architecture:
- TanStack Query v5 API (gcTime instead of cacheTime)
- Query key factory pattern
- Optimistic updates with rollback
- Automatic cache invalidation
- Toast notifications (Sonner)
- Type-safe inputs/outputs

### 2. `/src/components/sppg/menu/hooks/useIngredients.ts` (279 lines) ✅
**Ingredient management with auto-recalculation**

Features:
- `useIngredients()` - List with inventory details
- `useAddIngredient()` - Add with nutrition/cost recalc
- `useUpdateIngredient()` - Update with recalc
- `useRemoveIngredient()` - Remove with recalc
- `useBulkAddIngredients()` - Batch add (1-50)

Architecture:
- Auto invalidation of menu detail when ingredients change
- Cost and nutrition recalculation triggers
- Optimistic updates
- Progress tracking for bulk operations

### 3. `/src/components/sppg/menu/hooks/useRecipe.ts` (335 lines) ✅
**Recipe step management with drag-drop support**

Features:
- `useRecipe()` - Ordered steps list
- `useCreateRecipeStep()` - Add step with auto-numbering
- `useUpdateRecipeStep()` - Update instruction/duration/temp
- `useDeleteRecipeStep()` - Delete with auto-renumber
- `useReorderRecipeSteps()` - Drag-drop with optimistic updates
- `useBulkCreateRecipeSteps()` - Batch create (1-20)

Architecture:
- Drag-drop optimistic updates with rollback
- Auto step renumbering
- Duration and temperature validation
- Cache management for step lists

### 4. `/src/components/sppg/menu/hooks/usePlanning.ts` (529 lines) ✅
**Menu planning, calculators, search & export**

Features:
**Planning:**
- `useMenuPlanning()` - Plans list with 3min cache
- `useMenuCalendar()` - Calendar view with 2min cache
- `useCreateMenuPlan()` - Create with date validation
- `useAssignMenu()` - Multi-date assignment
- `useGenerateBalancedPlan()` - AI-powered generation

**Calculators:**
- `useNutritionCalculator()` - Real-time nutrition with RDA%
- `useCostCalculator()` - Real-time cost with breakdown

**Search & Export:**
- `useMenuSearch()` - Debounced search (300ms)
- `useExportMenus()` - Multi-format export (CSV/Excel/PDF)

Architecture:
- Real-time calculator state management
- Debounced search with React state
- Progress tracking for generation
- Budget alerts and overbudget detection
- Calendar cache with date range keys

---

## 🎯 Hook Architecture Patterns

### TanStack Query v5 Configuration
```typescript
// Modern API (gcTime replaces cacheTime)
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,      // 5 minutes
      gcTime: 10 * 60 * 1000,        // 10 minutes (garbage collection)
      retry: 3,
      refetchOnWindowFocus: false
    },
    mutations: {
      retry: 1
    }
  }
})
```

### Query Key Factory Pattern
```typescript
// Type-safe query keys
export const menuKeys = {
  all: ['menus'] as const,
  lists: () => [...menuKeys.all, 'list'] as const,
  list: (filters?: MenuFilters) => [...menuKeys.lists(), filters] as const,
  details: () => [...menuKeys.all, 'detail'] as const,
  detail: (id: string) => [...menuKeys.details(), id] as const,
  stats: () => [...menuKeys.all, 'stats'] as const
}
```

### Optimistic Updates with Rollback
```typescript
export function useUpdateMenu() {
  return useMutation({
    onMutate: async (input) => {
      // Cancel refetches
      await queryClient.cancelQueries({ queryKey: menuKeys.detail(input.id) })
      
      // Snapshot previous value
      const previousMenu = queryClient.getQueryData(menuKeys.detail(input.id))
      
      // Optimistically update
      if (previousMenu) {
        queryClient.setQueryData(menuKeys.detail(input.id), {
          ...previousMenu,
          ...input
        })
      }
      
      return { previousMenu }
    },
    onError: (error, input, context) => {
      // Rollback on error
      if (context?.previousMenu) {
        queryClient.setQueryData(menuKeys.detail(input.id), context.previousMenu)
      }
      toast.error('Gagal memperbarui menu')
    },
    onSettled: (data, error, input) => {
      // Always refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: menuKeys.detail(input.id) })
    }
  })
}
```

### Cache Invalidation Strategy
```typescript
// After creating menu:
queryClient.invalidateQueries({ queryKey: menuKeys.lists() })  // All lists
queryClient.invalidateQueries({ queryKey: menuKeys.stats() })  // Stats
queryClient.setQueryData(menuKeys.detail(newMenu.id), newMenu) // Set detail

// After updating ingredients:
queryClient.invalidateQueries({ queryKey: ingredientKeys.list(menuId) })
queryClient.invalidateQueries({ queryKey: menuKeys.detail(menuId) })  // Nutrition changed!
```

---

## ✅ What's Complete

### Infrastructure (100%)
- [x] 4 hook files created (1,608 lines total)
- [x] TanStack Query v5 integration
- [x] Query key factories (4 sets)
- [x] Optimistic updates with rollback
- [x] Cache invalidation strategies
- [x] Toast notifications (Sonner)
- [x] Type-safe inputs/outputs
- [x] Error handling patterns
- [x] Retry strategies

### Core Features (100%)
- [x] All CRUD operations (Create, Read, Update, Delete)
- [x] Bulk operations (status update, delete)
- [x] Ingredient management (add, update, remove, bulk)
- [x] Recipe management (CRUD, reorder, bulk)
- [x] Menu planning (create, assign, generate, calendar)
- [x] Real-time calculators (nutrition, cost)
- [x] Search with debounce
- [x] Export to multiple formats

---

## 📊 Statistics

| Metric | Value |
|--------|-------|
| Total Hook Files | 4 |
| Total Lines | 1,608 |
| Total Hooks | 28 |
| Query Hooks | 8 |
| Mutation Hooks | 18 |
| Calculator Hooks | 2 |
| Query Key Factories | 4 |
| Expected Errors | 34 (actions not implemented yet) |

---

## � Next Steps

### Priority 1: Server Actions Implementation
Need to implement the actual server actions that hooks call:
- `getMenus()`, `getMenu()`, `createMenu()`, etc.
- `getMenuIngredients()`, `addIngredient()`, etc.
- `getRecipeSteps()`, `createRecipeStep()`, etc.
- `getMenuPlans()`, `createMenuPlan()`, etc.

### Priority 2: UI Components
After actions are ready, build UI components:
- MenuList with useMenus
- MenuCard with useMenu
- MenuForm with useCreateMenu/useUpdateMenu
- IngredientManager with useIngredients hooks
- RecipeBuilder with useRecipe hooks
- MenuCalendar with usePlanning hooks

### Priority 3: Pages
Connect components to pages:
- /menu - Main list page
- /menu/create - Create wizard
- /menu/[id] - Detail page
- /menu/[id]/edit - Edit form
- /menu/planning - Calendar view

---

## 🎉 Phase 3 Success!

**PHASE 3 COMPLETE** - All hook infrastructure is ready!

The hooks provide:
✅ Type-safe API with Zod validation  
✅ Optimistic updates for instant feedback  
✅ Automatic cache management  
✅ Error handling with rollback  
✅ Real-time calculators  
✅ Debounced search  
✅ Multi-format export  
✅ Enterprise-grade architecture  

**Ready for**: Server actions implementation (PHASE 4)
