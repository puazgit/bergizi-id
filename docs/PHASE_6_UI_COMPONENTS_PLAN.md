# PHASE 6: UI Components Implementation Plan

**Status**: 🔧 IN PROGRESS (0% complete)  
**Started**: 2025-01-10  
**Estimated Time**: 8-10 hours  
**Dependencies**: PHASE 5 (Server Actions) ✅

---

## 🎯 Objectives

Implement **enterprise-grade UI components** for the Menu Management domain following Pattern 2 architecture with:

- ✅ Dark mode support (theme-aware components)
- ✅ Responsive design (mobile-first approach)
- ✅ Accessibility (WCAG 2.1 AA compliance)
- ✅ Type safety (strict TypeScript)
- ✅ Performance optimization (React.memo, lazy loading)
- ✅ Enterprise UX (loading states, error handling, success feedback)

---

## 📊 Implementation Priority

### Priority 1: Core Menu Components (3-4 hours)
**Purpose**: Basic menu management UI

1. **MenuList.tsx** (1 hour)
   - List/grid view toggle
   - Filters (program, mealType, status)
   - Search functionality
   - Pagination
   - Sort options
   - Dark mode support

2. **MenuCard.tsx** (45 minutes)
   - Menu preview card
   - Nutrition highlights
   - Cost display
   - Action buttons (edit, delete, view)
   - Hover effects
   - Dark mode variants

3. **MenuForm.tsx** (1.5 hours)
   - Create/edit form
   - Real-time validation
   - Auto-save draft
   - Image upload
   - Multi-step wizard (Info → Ingredients → Recipe)
   - Dark mode support

4. **MenuDetail.tsx** (45 minutes)
   - Tabbed interface (Info, Ingredients, Recipe, Assignments)
   - Nutrition visualization
   - Cost breakdown
   - Production history
   - Print-friendly view

---

### Priority 2: Ingredient Management (2-2.5 hours)
**Purpose**: Ingredient CRUD with auto-recalculation

5. **IngredientList.tsx** (45 minutes)
   - Editable table (inline editing)
   - Quantity adjustment
   - Real-time cost/nutrition update
   - Add new ingredient button
   - Bulk delete
   - Dark mode table styling

6. **IngredientForm.tsx** (30 minutes)
   - Modal/dialog form
   - Inventory item selector (autocomplete)
   - Quantity input with unit conversion
   - Cost preview
   - Validation feedback

7. **IngredientSelector.tsx** (45 minutes)
   - Searchable dropdown
   - Category filters
   - Stock status indicator
   - Price display
   - Quick add frequently used items
   - Dark mode dropdown styling

---

### Priority 3: Recipe Management (1.5-2 hours)
**Purpose**: Recipe step builder with drag-drop

8. **RecipeStepList.tsx** (1 hour)
   - Drag-drop reordering (dnd-kit)
   - Inline editing
   - Add step button
   - Step number auto-increment
   - Collapsible steps
   - Print recipe view
   - Dark mode support

9. **RecipeStepForm.tsx** (30 minutes)
   - Modal form
   - Rich text editor (optional)
   - Duration input (hours, minutes)
   - Temperature input
   - Image upload per step
   - Validation

10. **RecipeViewer.tsx** (30 minutes)
    - Read-only recipe display
    - Step-by-step navigation
    - Timer integration (optional)
    - Print-friendly format
    - Share recipe option

---

### Priority 4: Planning System (3-3.5 hours)
**Purpose**: Enterprise-grade menu planning with BI

11. **MenuCalendar.tsx** (1.5 hours)
    - Full calendar view (react-big-calendar or custom)
    - Drag-drop menu assignments
    - Multi-meal type display
    - Date range selector
    - Week/month view toggle
    - Assignment details popup
    - Color-coded by meal type
    - Dark mode calendar

12. **PlanForm.tsx** (45 minutes)
    - Create plan wizard
    - Date range picker
    - Program selector
    - Description editor
    - Budget constraints input
    - Validation

13. **PlanDetail.tsx** (45 minutes)
    - Plan header with status badge
    - BI metrics cards (nutrition score, variety score, cost efficiency)
    - Assignment timeline
    - Approval workflow UI
    - Actions (edit, publish, archive)
    - Export plan (PDF/Excel)

14. **BalancedPlanGenerator.tsx** (45 minutes)
    - AI generation modal
    - Date range selector
    - Meal type checkboxes
    - Budget input
    - Generation progress indicator
    - Preview before confirm
    - Dark mode support

15. **PlanningDashboard.tsx** (1 hour)
    - Active plans overview
    - BI metrics visualization (charts)
    - Calendar preview
    - Quick actions
    - Upcoming assignments
    - Compliance status
    - Dark mode charts

---

### Priority 5: Calculator Utilities (1-1.5 hours)
**Purpose**: Nutrition/cost display components

16. **NutritionDisplay.tsx** (20 minutes)
    - Nutrition facts label
    - Visual bars (progress bars)
    - Color-coded values
    - Tooltip details
    - Dark mode colors

17. **CostDisplay.tsx** (20 minutes)
    - Cost breakdown table
    - Total vs per-serving
    - Budget comparison
    - Price trends (optional)
    - Dark mode styling

18. **ComplianceIndicator.tsx** (30 minutes)
    - Status badge (LOW/ADEQUATE/EXCESSIVE)
    - Percentage display
    - Color-coded (red/green/yellow)
    - Tooltip with details
    - Trend indicator
    - Dark mode variants

19. **RecommendationsList.tsx** (20 minutes)
    - Recommendation cards
    - Priority sorting
    - Actionable buttons
    - Dismiss functionality
    - Dark mode support

---

## 📁 File Structure

Following **Pattern 2: Component-Level Domain Architecture**:

```
src/components/sppg/menu/
├── components/
│   ├── MenuList.tsx              # Priority 1
│   ├── MenuCard.tsx              # Priority 1
│   ├── MenuForm.tsx              # Priority 1
│   ├── MenuDetail.tsx            # Priority 1
│   │
│   ├── IngredientList.tsx        # Priority 2
│   ├── IngredientForm.tsx        # Priority 2
│   ├── IngredientSelector.tsx    # Priority 2
│   │
│   ├── RecipeStepList.tsx        # Priority 3
│   ├── RecipeStepForm.tsx        # Priority 3
│   ├── RecipeViewer.tsx          # Priority 3
│   │
│   ├── MenuCalendar.tsx          # Priority 4
│   ├── PlanForm.tsx              # Priority 4
│   ├── PlanDetail.tsx            # Priority 4
│   ├── BalancedPlanGenerator.tsx # Priority 4
│   ├── PlanningDashboard.tsx     # Priority 4
│   │
│   ├── NutritionDisplay.tsx      # Priority 5
│   ├── CostDisplay.tsx           # Priority 5
│   ├── ComplianceIndicator.tsx   # Priority 5
│   ├── RecommendationsList.tsx   # Priority 5
│   │
│   └── index.ts                  # Export barrel
│
├── hooks/                         # Already exists from PHASE 3
├── actions/                       # Already exists from PHASE 5
├── types/                         # Already exists from PHASE 2
└── utils/                         # Will be created as needed
```

---

## 🎨 Design System Integration

### Theme Support (Dark Mode)

All components will use:
```typescript
import { cn } from '@/lib/utils'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

// Components automatically support dark mode via Tailwind classes
<Card className="bg-card text-card-foreground dark:bg-card-dark">
  <Button variant="default" className="dark:hover:bg-primary/80">
    Action
  </Button>
</Card>
```

### Color Palette (Nutrition/Compliance)
```typescript
const complianceColors = {
  LOW: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950',
  ADEQUATE: 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950',
  EXCESSIVE: 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-950'
}

const mealTypeColors = {
  SARAPAN: 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300',
  MAKAN_SIANG: 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300',
  SNACK_PAGI: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300',
  SNACK_SORE: 'bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300',
  MAKAN_MALAM: 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300'
}
```

---

## 🔧 Technical Patterns

### Component Structure Template

```typescript
/**
 * ComponentName Component
 * 
 * Description of what this component does
 * 
 * @module components/sppg/menu/components/ComponentName
 */

'use client'

import { type FC } from 'react'
import { cn } from '@/lib/utils'

interface ComponentNameProps {
  className?: string
  // ... other props
}

export const ComponentName: FC<ComponentNameProps> = ({
  className,
  // ... other props
}) => {
  // Hooks
  // State
  // Event handlers
  
  return (
    <div className={cn(
      'base-styles',
      'dark:dark-mode-styles',
      className
    )}>
      {/* Content */}
    </div>
  )
}

ComponentName.displayName = 'ComponentName'
```

### Hook Integration Pattern

```typescript
// Use hooks from PHASE 3
import { useMenus, useMenu } from '../hooks/useMenu'
import { useIngredients } from '../hooks/useIngredients'
import { useRecipeSteps } from '../hooks/useRecipe'
import { useMenuPlans } from '../hooks/usePlanning'

export const MenuList: FC = () => {
  const { data: menus, isLoading, error } = useMenus(programId)
  
  if (isLoading) return <LoadingSpinner />
  if (error) return <ErrorMessage error={error} />
  
  return (
    <div>
      {menus?.map(menu => <MenuCard key={menu.id} menu={menu} />)}
    </div>
  )
}
```

### Form Pattern (with react-hook-form + Zod)

```typescript
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createMenuSchema } from '../types/menuTypes'

export const MenuForm: FC = () => {
  const form = useForm({
    resolver: zodResolver(createMenuSchema),
    defaultValues: {
      menuName: '',
      mealType: 'MAKAN_SIANG',
      servingSize: 100
    }
  })
  
  const { mutate: createMenu, isPending } = useCreateMenu()
  
  const onSubmit = form.handleSubmit((data) => {
    createMenu(data, {
      onSuccess: () => {
        toast.success('Menu berhasil dibuat')
        form.reset()
      },
      onError: (error) => {
        toast.error(error.message)
      }
    })
  })
  
  return (
    <Form {...form}>
      <form onSubmit={onSubmit}>
        {/* Form fields */}
      </form>
    </Form>
  )
}
```

---

## 📦 Dependencies to Install

### UI Libraries
```bash
# Drag-drop for recipe steps
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities

# Calendar for planning
npm install react-big-calendar date-fns

# Charts for BI metrics
npm install recharts

# Rich text editor (optional for recipe steps)
npm install @tiptap/react @tiptap/starter-kit

# Date picker
npm install react-day-picker

# Form handling (already installed)
# react-hook-form @hookform/resolvers
```

### Type Definitions
```bash
npm install -D @types/react-big-calendar
```

---

## ✅ Success Criteria

### For Each Component

- [ ] TypeScript strict mode (no any types)
- [ ] Dark mode support
- [ ] Responsive design (mobile, tablet, desktop)
- [ ] Loading states
- [ ] Error handling
- [ ] Success feedback
- [ ] Accessibility (ARIA labels, keyboard navigation)
- [ ] Performance optimized (React.memo if needed)
- [ ] Proper hook integration
- [ ] Export in index.ts

### Quality Metrics

```
Compilation Errors:     0 (target)
Type Safety:            100%
Dark Mode Coverage:     100%
Responsive:             100% (mobile-first)
Accessibility Score:    >= 95 (WCAG 2.1 AA)
Performance Score:      >= 90 (Lighthouse)
```

---

## 🎯 Implementation Strategy

### Phase 6A: Core Menu Components (Day 1, 3-4 hours)
1. ✅ Install dependencies
2. ⏳ MenuList.tsx
3. ⏳ MenuCard.tsx
4. ⏳ MenuForm.tsx
5. ⏳ MenuDetail.tsx
6. ⏳ Test integration with hooks

### Phase 6B: Ingredient & Recipe (Day 1-2, 3-4 hours)
7. ⏳ IngredientList.tsx
8. ⏳ IngredientForm.tsx
9. ⏳ IngredientSelector.tsx
10. ⏳ RecipeStepList.tsx (with dnd-kit)
11. ⏳ RecipeStepForm.tsx
12. ⏳ RecipeViewer.tsx

### Phase 6C: Planning System (Day 2, 3-4 hours)
13. ⏳ MenuCalendar.tsx (with react-big-calendar)
14. ⏳ PlanForm.tsx
15. ⏳ PlanDetail.tsx
16. ⏳ BalancedPlanGenerator.tsx
17. ⏳ PlanningDashboard.tsx (with recharts)

### Phase 6D: Calculator Utilities (Day 2, 1-1.5 hours)
18. ⏳ NutritionDisplay.tsx
19. ⏳ CostDisplay.tsx
20. ⏳ ComplianceIndicator.tsx
21. ⏳ RecommendationsList.tsx

### Phase 6E: Testing & Polish (Day 3, 2-3 hours)
22. ⏳ Visual testing (Storybook optional)
23. ⏳ Accessibility audit
24. ⏳ Dark mode verification
25. ⏳ Responsive testing
26. ⏳ Performance optimization
27. ⏳ Documentation

---

## 🚀 Getting Started

**Current Target**: Phase 6A - Core Menu Components

**First Component**: MenuList.tsx

Let's start implementing! 🎨
