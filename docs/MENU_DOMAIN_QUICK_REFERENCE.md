# 🚀 Menu Domain Quick Reference

**Last Updated**: January 9, 2025  
**Status**: PHASE 1-4 Complete (87.5%)

---

## 📁 File Locations

```
src/components/sppg/menu/
├── types/
│   └── menuTypes.ts (340 lines) ✅
├── validators/
│   └── menuValidation.ts (717 lines) ✅
├── hooks/
│   ├── useMenu.ts (465 lines, 8 hooks) ✅
│   ├── useIngredients.ts (279 lines, 5 hooks) ✅
│   ├── useRecipe.ts (335 lines, 6 hooks) ✅
│   └── usePlanning.ts (529 lines, 9 hooks) ✅
└── actions/
    └── menuActions.ts (867 lines, 6 functions) ✅
```

---

## ⚡ Quick Usage Examples

### 1. Fetch Menu List
```typescript
import { useMenus } from '@/components/sppg/menu/hooks/useMenu'

function MenuList() {
  const { data, isLoading, error } = useMenus({
    programId: 'prog_123',
    isActive: true,
    mealType: 'SARAPAN',
    page: 1,
    limit: 20
  })
  
  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>
  
  return (
    <div>
      {data?.menus.map(menu => (
        <MenuCard key={menu.id} menu={menu} />
      ))}
    </div>
  )
}
```

### 2. Get Single Menu
```typescript
import { useMenu } from '@/components/sppg/menu/hooks/useMenu'

function MenuDetail({ id }: { id: string }) {
  const { data: menu, isLoading } = useMenu(id)
  
  if (isLoading) return <div>Loading...</div>
  if (!menu) return <div>Menu not found</div>
  
  return (
    <div>
      <h1>{menu.menuName}</h1>
      <p>Calories: {menu.calories}</p>
      <p>Cost: Rp {menu.costPerServing}</p>
    </div>
  )
}
```

### 3. Create Menu
```typescript
import { useCreateMenu } from '@/components/sppg/menu/hooks/useMenu'
import type { CreateMenuInput } from '@/components/sppg/menu/types/menuTypes'

function CreateMenuForm() {
  const { mutate: createMenu, isPending } = useCreateMenu()
  
  const handleSubmit = (data: CreateMenuInput) => {
    createMenu(data, {
      onSuccess: (result) => {
        console.log('Menu created:', result.data)
        // Automatic cache invalidation + toast notification
      },
      onError: (error) => {
        console.error('Failed:', error)
      }
    })
  }
  
  return <form onSubmit={handleSubmit}>...</form>
}
```

### 4. Update Menu
```typescript
import { useUpdateMenu } from '@/components/sppg/menu/hooks/useMenu'

function EditMenuForm({ menu }: { menu: MenuWithDetails }) {
  const { mutate: updateMenu, isPending } = useUpdateMenu()
  
  const handleSubmit = (updates: Partial<UpdateMenuInput>) => {
    updateMenu({
      id: menu.id,
      ...updates
    }, {
      onSuccess: () => {
        // Optimistic update applied
        // Cache automatically updated
        // Toast notification shown
      }
    })
  }
  
  return <form onSubmit={handleSubmit}>...</form>
}
```

### 5. Delete Menu
```typescript
import { useDeleteMenu } from '@/components/sppg/menu/hooks/useMenu'

function MenuActions({ menuId }: { menuId: string }) {
  const { mutate: deleteMenu, isPending } = useDeleteMenu()
  
  const handleDelete = () => {
    if (confirm('Delete this menu?')) {
      deleteMenu(menuId, {
        onSuccess: () => {
          // Soft delete (isActive: false)
          // Cache updated
          // Toast shown
        }
      })
    }
  }
  
  return <button onClick={handleDelete}>Delete</button>
}
```

### 6. Get Dashboard Stats
```typescript
import { useMenuStats } from '@/components/sppg/menu/hooks/useMenu'

function MenuDashboard({ programId }: { programId: string }) {
  const { data: stats, isLoading } = useMenuStats(programId)
  
  if (isLoading) return <div>Loading stats...</div>
  
  return (
    <div>
      <div>Total Menus: {stats?.totalMenus}</div>
      <div>Active: {stats?.activeMenus}</div>
      <div>Avg Calories: {stats?.avgCalories}</div>
      <div>Avg Cost: Rp {stats?.avgCostPerServing}</div>
    </div>
  )
}
```

---

## 🔒 Security Patterns

### Multi-Tenant Filtering
```typescript
// All queries automatically filter by sppgId
const menus = await getMenus({
  programId: 'prog_123'
  // sppgId automatically added from session
})
```

### RBAC Authorization
```typescript
// All mutations check permissions
const result = await createMenu(input)
// Automatically checks: canManageMenu(session.user.userRole)
```

### Ownership Verification
```typescript
// All operations verify ownership
const menu = await getMenu(id)
// Automatically checks: menu.program.sppgId === session.user.sppgId
```

---

## 📊 Available Filters

### MenuFilters Interface
```typescript
{
  programId?: string        // Filter by program
  mealType?: MealType      // SARAPAN, MAKAN_SIANG, etc.
  isActive?: boolean       // Active/inactive status
  minCalories?: number     // Nutrition filtering
  maxCalories?: number
  minProtein?: number
  maxProtein?: number
  minCost?: number         // Budget filtering
  maxCost?: number
  hasAllergens?: boolean   // Allergen filtering
  isVegetarian?: boolean   // Diet type
  search?: string          // Full-text search
  sortBy?: SortField       // Sort field
  sortOrder?: 'asc'|'desc' // Sort direction
  page?: number            // Pagination
  limit?: number           // Page size
}
```

---

## 🎯 Hook Return Types

### Query Hooks
```typescript
// useMenus
{
  data: PaginatedMenusResult | undefined
  isLoading: boolean
  error: Error | null
  refetch: () => void
}

// useMenu
{
  data: MenuWithDetails | undefined
  isLoading: boolean
  error: Error | null
}

// useMenuStats
{
  data: MenuStats | undefined
  isLoading: boolean
  error: Error | null
}
```

### Mutation Hooks
```typescript
// useCreateMenu, useUpdateMenu, useDeleteMenu
{
  mutate: (input, options) => void
  mutateAsync: (input) => Promise<result>
  isPending: boolean
  isError: boolean
  error: Error | null
  reset: () => void
}
```

---

## 🔄 Cache Management

### Query Keys (Auto-managed)
```typescript
menuKeys.all                          // All menu queries
menuKeys.lists()                      // All list queries
menuKeys.list(filters)                // Specific list query
menuKeys.details()                    // All detail queries
menuKeys.detail(id)                   // Specific detail query
menuKeys.stats()                      // All stats queries
menuKeys.stat(programId)              // Specific stats query
```

### Automatic Invalidation
```typescript
// After createMenu() → Invalidates:
- menuKeys.lists()
- menuKeys.stats()

// After updateMenu(id) → Invalidates:
- menuKeys.detail(id)
- menuKeys.lists()
- menuKeys.stats()

// After deleteMenu(id) → Invalidates:
- menuKeys.detail(id)
- menuKeys.lists()
- menuKeys.stats()
```

---

## ✅ Type Definitions

### Core Types
```typescript
import type {
  MenuWithDetails,      // Full menu with relations
  MenuListItem,         // List view optimized
  MenuStats,           // Dashboard statistics
  PaginatedMenusResult, // Paginated response
  MenuFilters,         // Query filters
  CreateMenuInput,     // Creation input
  UpdateMenuInput,     // Update input
  MenuOperationResult  // Response wrapper
} from '@/components/sppg/menu/types/menuTypes'
```

### Validation Schemas
```typescript
import {
  createMenuSchema,    // Menu creation validation
  updateMenuSchema,    // Menu update validation
  menuFiltersSchema,   // Filters validation
  bulkUpdateStatusSchema,
  bulkDeleteSchema
} from '@/components/sppg/menu/validators/menuValidation'
```

---

## 🧪 Testing Examples

### Unit Test (Hook)
```typescript
import { renderHook, waitFor } from '@testing-library/react'
import { useMenus } from '@/components/sppg/menu/hooks/useMenu'

test('useMenus fetches menu list', async () => {
  const { result } = renderHook(() => useMenus({ isActive: true }))
  
  expect(result.current.isLoading).toBe(true)
  
  await waitFor(() => {
    expect(result.current.isLoading).toBe(false)
    expect(result.current.data?.menus).toHaveLength(10)
  })
})
```

### Integration Test (Action)
```typescript
import { createMenu } from '@/components/sppg/menu/actions/menuActions'

test('createMenu validates and creates menu', async () => {
  const input: CreateMenuInput = {
    programId: 'prog_123',
    menuCode: 'TEST_001',
    menuName: 'Test Menu',
    mealType: 'SARAPAN',
    servingSize: 250,
    calories: 450,
    protein: 15,
    carbohydrates: 60,
    fat: 12,
    costPerServing: 8500
  }
  
  const result = await createMenu(input)
  
  expect(result.success).toBe(true)
  expect(result.data?.menuName).toBe('Test Menu')
})
```

---

## 🚨 Error Handling

### Structured Responses
```typescript
// Success
{
  success: true,
  data: MenuWithDetails
}

// Error
{
  success: false,
  error: string
}
```

### Error Recovery
```typescript
const { mutate, error, reset } = useCreateMenu()

// Retry after error
if (error) {
  reset()        // Clear error state
  mutate(input)  // Retry
}
```

---

## 📝 Validation Examples

### Menu Creation
```typescript
import { createMenuSchema } from '@/components/sppg/menu/validators/menuValidation'

// Validate before submit
const result = createMenuSchema.safeParse(formData)

if (!result.success) {
  console.error(result.error.errors)
  // Show validation errors
} else {
  createMenu(result.data)
}
```

### Custom Validation
```typescript
// Calories must be 50-1500
calories: z.number()
  .min(50, 'Minimum 50 calories')
  .max(1500, 'Maximum 1500 calories'),

// Cost must be positive
costPerServing: z.number()
  .min(0, 'Cost must be positive'),

// Menu code format
menuCode: z.string()
  .regex(/^[A-Z0-9_-]+$/, 'Invalid menu code format')
```

---

## 🎨 UI Component Examples

### Menu Card Component
```typescript
import { MenuWithDetails } from '@/components/sppg/menu/types/menuTypes'
import { useDeleteMenu } from '@/components/sppg/menu/hooks/useMenu'

function MenuCard({ menu }: { menu: MenuWithDetails }) {
  const { mutate: deleteMenu, isPending } = useDeleteMenu()
  
  return (
    <div className="menu-card">
      <h3>{menu.menuName}</h3>
      <p>{menu.mealType}</p>
      <div className="nutrition">
        <span>Calories: {menu.calories}</span>
        <span>Protein: {menu.protein}g</span>
      </div>
      <div className="cost">
        Rp {menu.costPerServing.toLocaleString()}
      </div>
      <button 
        onClick={() => deleteMenu(menu.id)}
        disabled={isPending}
      >
        {isPending ? 'Deleting...' : 'Delete'}
      </button>
    </div>
  )
}
```

---

## 🔍 Search & Filter Example
```typescript
function MenuSearch() {
  const [filters, setFilters] = useState<MenuFilters>({
    isActive: true,
    page: 1,
    limit: 20
  })
  
  const { data, isLoading } = useMenus(filters)
  
  return (
    <div>
      <input
        type="search"
        placeholder="Search menus..."
        onChange={(e) => setFilters({
          ...filters,
          search: e.target.value,
          page: 1 // Reset to first page
        })}
      />
      
      <select
        value={filters.mealType || ''}
        onChange={(e) => setFilters({
          ...filters,
          mealType: e.target.value as MealType,
          page: 1
        })}
      >
        <option value="">All Meal Types</option>
        <option value="SARAPAN">Breakfast</option>
        <option value="MAKAN_SIANG">Lunch</option>
        <option value="MAKAN_MALAM">Dinner</option>
      </select>
      
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <MenuList menus={data?.menus || []} />
      )}
    </div>
  )
}
```

---

## 📚 Additional Resources

- **Full Documentation**: `/docs/MENU_DOMAIN_SUMMARY.md`
- **Types Reference**: `/src/components/sppg/menu/types/menuTypes.ts`
- **Validation Schemas**: `/src/components/sppg/menu/validators/menuValidation.ts`
- **Hook Examples**: `/src/components/sppg/menu/hooks/`
- **Action Implementation**: `/src/components/sppg/menu/actions/menuActions.ts`

---

## ✅ Status Summary

- **PHASE 1-4**: ✅ Complete (87.5%)
- **Basic CRUD**: ✅ Production-ready
- **Security**: ✅ Enterprise-grade
- **Type Safety**: ✅ Full TypeScript
- **Validation**: ✅ Zod schemas
- **Cache**: ✅ TanStack Query
- **Audit**: ✅ Complete logging

**Next**: PHASE 5 - Remaining Actions (ingredientActions, recipeActions, planningActions)

---

**Quick Start**: Import hooks from `@/components/sppg/menu/hooks/` and start building UI! 🚀
