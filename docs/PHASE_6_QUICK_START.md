# PHASE 6: Quick Start Guide

**Date**: 2025-01-10  
**Goal**: Implement 16 NEW enterprise-grade UI components for Menu Management

---

## 🚀 Quick Summary

### What We Have ✅
- ✅ 4 server action files (2,241 lines) from PHASE 5
- ✅ 28 React hooks (1,608 lines) from PHASE 3
- ✅ 3 existing components (MenuList, MenuCard, MenuForm)
- ✅ UI library dependencies installed (@dnd-kit, react-big-calendar, recharts)

### What We Need 🎯
- 🎯 16 NEW components across 4 priorities:
  * **Priority 1**: Ingredient Management (3 components)
  * **Priority 2**: Recipe Management (3 components)
  * **Priority 3**: Planning System (5 components)
  * **Priority 4**: Calculator Utilities (4 components)

---

## 📝 Implementation Strategy

### Approach: **Build in Order of Dependencies**

```
Priority Flow:
Calculator Utilities (15%) → Ingredient Management (20%) → 
Recipe Management (15%) → Planning System (30%) → 
Integration & Testing (20%)
```

**Why this order?**
1. **Calculator utilities are reusable** - Used by all other components
2. **Ingredients before recipes** - Recipes reference ingredients
3. **Planning last** - Uses menus, ingredients, and recipes
4. **Testing throughout** - Verify each component works before moving on

---

## 🎯 Today's Goals (Day 1 - 4 hours)

### Morning Session (2 hours)

**Block 1: Calculator Utilities (1 hour)**
1. ⏱️ NutritionDisplay.tsx (20 min)
2. ⏱️ CostDisplay.tsx (20 min)
3. ⏱️ ComplianceIndicator.tsx (20 min)

**Block 2: Start Ingredient Management (1 hour)**
4. ⏱️ IngredientSelector.tsx (45 min) - Critical dependency
5. ⏱️ Test integration (15 min)

### Afternoon Session (2 hours)

**Block 3: Complete Ingredient Management (1 hour)**
6. ⏱️ IngredientForm.tsx (30 min)
7. ⏱️ IngredientList.tsx (30 min)

**Block 4: Recipe Management (1 hour)**
8. ⏱️ RecipeStepForm.tsx (30 min)
9. ⏱️ RecipeStepList.tsx foundation (30 min) - Continue Day 2

---

## 🎯 Day 2 Goals (4 hours)

### Morning Session (2 hours)

**Block 5: Complete Recipe Management (1 hour)**
10. ⏱️ RecipeStepList.tsx with drag-drop (45 min)
11. ⏱️ RecipeViewer.tsx (15 min)

**Block 6: Start Planning System (1 hour)**
12. ⏱️ PlanForm.tsx (45 min)
13. ⏱️ RecommendationsList.tsx (15 min) - Utility component

### Afternoon Session (2 hours)

**Block 7: Planning System Core (2 hours)**
14. ⏱️ MenuCalendar.tsx (1.5 hours) - Most complex
15. ⏱️ Test calendar integration (30 min)

---

## 🎯 Day 3 Goals (2-3 hours)

### Final Session

**Block 8: Complete Planning System (1.5 hours)**
16. ⏱️ PlanDetail.tsx (45 min)
17. ⏱️ BalancedPlanGenerator.tsx (45 min)

**Block 9: Dashboard & Integration (1 hour)**
18. ⏱️ PlanningDashboard.tsx (45 min)
19. ⏱️ Final integration testing (15 min)

**Block 10: Polish & Documentation (30 min)**
20. ⏱️ Dark mode verification
21. ⏱️ Responsive testing
22. ⏱️ Update documentation

---

## 🛠️ Component Templates

### Simple Component Template (Utilities)
```typescript
'use client'

import { type FC } from 'react'
import { cn } from '@/lib/utils'
import { Card } from '@/components/ui/card'

interface ComponentNameProps {
  data: any
  className?: string
}

export const ComponentName: FC<ComponentNameProps> = ({
  data,
  className
}) => {
  return (
    <Card className={cn('base-styles dark:dark-styles', className)}>
      {/* Content */}
    </Card>
  )
}

ComponentName.displayName = 'ComponentName'
```

### Complex Component Template (with hooks)
```typescript
'use client'

import { type FC, useState } from 'react'
import { cn } from '@/lib/utils'
import { useComponentHook } from '../hooks/useHook'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface ComponentNameProps {
  id: string
  className?: string
}

export const ComponentName: FC<ComponentNameProps> = ({
  id,
  className
}) => {
  const { data, isLoading, error } = useComponentHook(id)
  const [state, setState] = useState(null)

  if (isLoading) return <LoadingSkeleton />
  if (error) return <ErrorDisplay error={error} />

  return (
    <div className={cn('base-styles dark:dark-styles', className)}>
      {/* Content with data */}
    </div>
  )
}

ComponentName.displayName = 'ComponentName'
```

---

## 📦 Key Integrations

### Hook Usage Pattern
```typescript
// Import hooks from PHASE 3
import { useMenus, useMenu } from '../hooks/useMenu'
import { 
  useIngredients, 
  useAddIngredient,
  useUpdateIngredient,
  useRemoveIngredient
} from '../hooks/useIngredients'
import { 
  useRecipeSteps,
  useCreateRecipeStep,
  useUpdateRecipeStep,
  useDeleteRecipeStep,
  useReorderRecipeSteps
} from '../hooks/useRecipe'
import { 
  useMenuPlans,
  useMenuCalendar,
  useCreateMenuPlan,
  useAssignMenuToPlan,
  useGenerateBalancedMenuPlan
} from '../hooks/usePlanning'
import {
  useCalculateNutrition,
  useCalculateCost,
  useNutritionStandards,
  useCompareToStandards
} from '../hooks/useCalculators'
```

### Action Integration Pattern
```typescript
// Hooks already wrap server actions from PHASE 5
const { mutate: addIngredient, isPending } = useAddIngredient()

const handleSubmit = (data) => {
  addIngredient(data, {
    onSuccess: () => {
      toast.success('Ingredient added successfully')
      onClose()
    },
    onError: (error) => {
      toast.error(error.message)
    }
  })
}
```

---

## 🎨 UI Patterns to Follow

### Dark Mode Classes
```typescript
// Card components
<Card className="bg-card dark:bg-card-dark text-foreground">

// Buttons
<Button className="bg-primary dark:hover:bg-primary/80">

// Inputs
<Input className="bg-background dark:bg-muted/30">

// Text
<p className="text-muted-foreground dark:text-muted-foreground/90">

// Borders
<div className="border border-border dark:border-border/50">

// Status colors
<Badge className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300">
```

### Responsive Patterns
```typescript
// Grid layouts
<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">

// Flex layouts
<div className="flex flex-col sm:flex-row gap-4">

// Hidden on mobile
<div className="hidden lg:block">

// Text sizing
<h1 className="text-2xl md:text-3xl lg:text-4xl">
```

---

## ✅ Quality Checklist (Per Component)

Before marking component complete:

- [ ] TypeScript strict mode (no any types)
- [ ] Dark mode support (tested both themes)
- [ ] Responsive (tested mobile, tablet, desktop)
- [ ] Loading states implemented
- [ ] Error handling implemented
- [ ] Success feedback (toast notifications)
- [ ] Accessibility (ARIA labels, keyboard nav)
- [ ] Hook integration verified
- [ ] Exports added to index.ts
- [ ] No compilation errors

---

## 🚦 Starting Point: **NutritionDisplay.tsx**

This is the simplest component and sets the pattern for others.

**Ready to start?** Let's build! 🎨

**Command to user**: "ya lanjutkan" to begin implementation of NutritionDisplay.tsx
