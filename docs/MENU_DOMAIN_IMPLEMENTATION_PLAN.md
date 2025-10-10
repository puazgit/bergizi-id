# 🍽️ **MENU DOMAIN - Implementation Plan**

## 📋 **Phase-by-Phase Implementation Plan**

### **PHASE 1: Foundation & Server Actions** 🏗️

#### **1.1 Server Actions Priority List**

```typescript
// src/actions/sppg/menu.ts - Complete server actions file

// 🎯 CRITICAL ACTIONS (Implement First)
1. getMenus()              // List menus with pagination & filters
2. getMenuById()           // Get single menu with full details  
3. createMenu()            // Create new menu with validation
4. updateMenu()            // Update existing menu
5. deleteMenu()            // Soft delete menu

// 🔄 PROGRAM MANAGEMENT
6. getPrograms()           // List nutrition programs for SPPG
7. createProgram()         // Create new nutrition program
8. updateProgram()         // Update program details
9. deleteProgram()         // Delete program (with dependency check)

// 📊 CALCULATION ACTIONS
10. calculateNutrition()   // Calculate nutritional values
11. calculateCost()        // Calculate menu cost
12. validateMenuBalance()  // Validate nutritional balance

// 🧩 INGREDIENT MANAGEMENT  
13. getIngredients()       // Get available ingredients
14. searchIngredients()    // Search ingredients with filters
15. addIngredientToMenu()  // Add ingredient to menu
16. removeIngredientFromMenu() // Remove ingredient from menu
17. updateIngredientQuantity() // Update ingredient quantity

// 📅 MENU PLANNING
18. getMenuPlans()         // Get menu planning schedules
19. createMenuPlan()       // Create menu planning
20. assignMenuToPlan()     // Assign menu to specific dates
21. getMenuCalendar()      // Get menu calendar view

// 📋 RECIPE MANAGEMENT
22. getRecipes()           // Get recipes for menu
23. createRecipe()         // Create cooking recipe
24. updateRecipe()         // Update recipe steps
25. duplicateMenu()        // Duplicate existing menu
```

#### **1.2 Server Actions Implementation Order**

```typescript
// Week 1: Core CRUD Operations
✅ Priority 1: getMenus, getMenuById, createMenu, updateMenu, deleteMenu
✅ Priority 2: getPrograms, createProgram, updateProgram, deleteProgram

// Week 2: Business Logic
✅ Priority 3: calculateNutrition, calculateCost, validateMenuBalance  
✅ Priority 4: getIngredients, searchIngredients, ingredient management

// Week 3: Advanced Features
✅ Priority 5: Menu planning actions (getMenuPlans, createMenuPlan, etc.)
✅ Priority 6: Recipe management and menu duplication
```

### **PHASE 2: Data Layer & Types** 📊

#### **2.1 Types Implementation**

```typescript
// src/components/sppg/menu/types/menuTypes.ts

export interface Menu {
  id: string
  menuName: string
  menuCode: string
  programId: string
  mealType: MealType
  servingSize: number
  preparationTime: number
  cookingTime: number
  difficulty: DifficultyLevel
  description?: string
  instructions?: string
  
  // Nutritional Information
  calories: number
  protein: number
  carbohydrates: number
  fat: number
  fiber: number
  sodium: number
  calcium: number
  iron: number
  vitaminA: number
  vitaminC: number
  
  // Cost Information
  ingredientCost: number
  laborCost: number
  overheadCost: number
  totalCost: number
  costPerServing: number
  
  // Media
  imageUrl?: string
  imageAlt?: string
  
  // Metadata
  createdAt: Date
  updatedAt: Date
  createdBy: string
  updatedBy: string
  version: number
  isActive: boolean
  
  // Relations
  program?: NutritionProgram
  ingredients: MenuIngredient[]
  recipes: Recipe[]
  menuPlans: MenuPlan[]
}

export interface MenuIngredient {
  id: string
  menuId: string
  inventoryItemId: string
  quantity: number
  unit: string
  cost: number
  
  // Relations
  menu?: Menu
  inventoryItem?: InventoryItem
}

export interface Recipe {
  id: string
  menuId: string
  stepNumber: number
  instruction: string
  duration: number
  temperature?: number
  equipment?: string
  notes?: string
  
  // Relations
  menu?: Menu
}

// ... Additional types
```

#### **2.2 Validation Schemas**

```typescript  
// src/components/sppg/menu/utils/menuValidation.ts

import { z } from 'zod'

export const menuSchema = z.object({
  menuName: z.string()
    .min(3, 'Menu name must be at least 3 characters')
    .max(100, 'Menu name must not exceed 100 characters'),
  menuCode: z.string()
    .min(2, 'Menu code must be at least 2 characters')
    .max(20, 'Menu code must not exceed 20 characters')
    .regex(/^[A-Z0-9-]+$/, 'Menu code must contain only uppercase letters, numbers, and hyphens'),
  programId: z.string().cuid('Invalid program ID'),
  mealType: z.enum(['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK']),
  servingSize: z.number()
    .min(1, 'Serving size must be at least 1')
    .max(1000, 'Serving size must not exceed 1000g'),
  preparationTime: z.number()
    .min(0, 'Preparation time cannot be negative')
    .max(480, 'Preparation time must not exceed 8 hours'),
  cookingTime: z.number()
    .min(0, 'Cooking time cannot be negative')
    .max(480, 'Cooking time must not exceed 8 hours'),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']),
  description: z.string().max(500, 'Description too long').optional(),
  instructions: z.string().max(2000, 'Instructions too long').optional(),
  
  // Nutritional validation
  calories: z.number().min(0, 'Calories cannot be negative').max(5000, 'Calories too high'),
  protein: z.number().min(0, 'Protein cannot be negative').max(200, 'Protein too high'),
  // ... other nutritional validations
  
  // Cost validation
  ingredientCost: z.number().min(0, 'Ingredient cost cannot be negative'),
  laborCost: z.number().min(0, 'Labor cost cannot be negative'),
  overheadCost: z.number().min(0, 'Overhead cost cannot be negative'),
})

export type MenuInput = z.infer<typeof menuSchema>
export type MenuUpdate = Partial<MenuInput> & { id: string }
```

### **PHASE 3: Hooks & State Management** 🪝

#### **3.1 Core Hooks Implementation**

```typescript
// src/components/sppg/menu/hooks/useMenus.ts

'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'
import { 
  getMenus, 
  getMenuById, 
  createMenu, 
  updateMenu, 
  deleteMenu 
} from '@/actions/sppg/menu'
import { type Menu, type MenuInput, type MenuUpdate } from '../types/menuTypes'

export const useMenus = (filters?: MenuFilters) => {
  const { data: session } = useSession()
  const queryClient = useQueryClient()

  // List menus with filters
  const {
    data: menus,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['menus', session?.user?.sppgId, filters],
    queryFn: async () => {
      const result = await getMenus(filters)
      if (!result.success) {
        throw new Error(result.error)
      }
      return result.data
    },
    enabled: !!session?.user?.sppgId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false
  })

  // Create menu mutation
  const createMenuMutation = useMutation({
    mutationFn: async (menuData: MenuInput) => {
      const result = await createMenu(menuData)
      if (!result.success) {
        throw new Error(result.error)
      }
      return result.data
    },
    onSuccess: (newMenu) => {
      queryClient.invalidateQueries({ queryKey: ['menus'] })
      toast.success(`Menu "${newMenu.menuName}" created successfully`)
    },
    onError: (error: Error) => {
      toast.error(`Failed to create menu: ${error.message}`)
    }
  })

  // Update menu mutation
  const updateMenuMutation = useMutation({
    mutationFn: async (menuData: MenuUpdate) => {
      const result = await updateMenu(menuData)
      if (!result.success) {
        throw new Error(result.error)
      }
      return result.data
    },
    onSuccess: (updatedMenu) => {
      queryClient.invalidateQueries({ queryKey: ['menus'] })
      queryClient.invalidateQueries({ queryKey: ['menu', updatedMenu.id] })
      toast.success(`Menu "${updatedMenu.menuName}" updated successfully`)
    },
    onError: (error: Error) => {
      toast.error(`Failed to update menu: ${error.message}`)
    }
  })

  // Delete menu mutation
  const deleteMenuMutation = useMutation({
    mutationFn: async (menuId: string) => {
      const result = await deleteMenu(menuId)
      if (!result.success) {
        throw new Error(result.error)
      }
      return result.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menus'] })
      toast.success('Menu deleted successfully')
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete menu: ${error.message}`)
    }
  })

  return {
    // Data
    menus,
    isLoading,
    error,
    
    // Actions
    createMenu: createMenuMutation.mutate,
    updateMenu: updateMenuMutation.mutate,
    deleteMenu: deleteMenuMutation.mutate,
    refetch,
    
    // States
    isCreating: createMenuMutation.isPending,
    isUpdating: updateMenuMutation.isPending,
    isDeleting: deleteMenuMutation.isPending
  }
}

// Hook for single menu
export const useMenu = (menuId: string) => {
  return useQuery({
    queryKey: ['menu', menuId],
    queryFn: async () => {
      const result = await getMenuById(menuId)
      if (!result.success) {
        throw new Error(result.error)
      }
      return result.data
    },
    enabled: !!menuId,
    staleTime: 10 * 60 * 1000 // 10 minutes
  })
}
```

#### **3.2 Specialized Hooks**

```typescript
// src/components/sppg/menu/hooks/useNutritionCalculator.ts
export const useNutritionCalculator = () => {
  // Nutrition calculation logic
}

// src/components/sppg/menu/hooks/useCostCalculator.ts  
export const useCostCalculator = () => {
  // Cost calculation logic
}

// src/components/sppg/menu/hooks/useMenuPlanning.ts
export const useMenuPlanning = () => {
  // Menu planning logic
}

// src/components/sppg/menu/hooks/useRealTimeMenu.ts
export const useRealTimeMenu = () => {
  // Real-time updates for menu changes
}
```

### **PHASE 4: UI Components** 🎨

#### **4.1 Core Components Implementation Order**

```typescript
// Week 1: Basic Components
1. MenuCard.tsx           // Display menu in card format
2. MenuList.tsx           // List of menus with pagination
3. MenuForm.tsx           // Create/edit menu form
4. ProgramSelector.tsx    // Select nutrition program

// Week 2: Advanced Components  
5. IngredientManager.tsx  // Manage menu ingredients
6. NutritionCalculator.tsx // Display nutrition calculations
7. CostCalculator.tsx     // Display cost calculations
8. RecipeBuilder.tsx      // Build cooking recipes

// Week 3: Planning Components
9. MenuPlanner.tsx        // Menu planning interface
10. MenuCalendar.tsx      // Calendar view of menu plans
11. MenuFilters.tsx       // Advanced filtering
12. MenuSearch.tsx        // Search functionality
```

#### **4.2 Component Architecture Example**

```typescript
// src/components/sppg/menu/components/MenuCard.tsx

'use client'

import { type FC } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Clock, 
  Users, 
  Calculator, 
  ChefHat, 
  Edit, 
  Trash2, 
  Copy 
} from 'lucide-react'
import { useMenus } from '../hooks'
import { type MenuWithProgram } from '../types'
import { formatCurrency, formatNutrition } from '../utils'
import { cn } from '@/lib/utils'

interface MenuCardProps {
  menu: MenuWithProgram
  onEdit?: (menuId: string) => void
  onDelete?: (menuId: string) => void
  onDuplicate?: (menuId: string) => void
  variant?: 'default' | 'compact' | 'detailed'
  showActions?: boolean
}

export const MenuCard: FC<MenuCardProps> = ({
  menu,
  onEdit,
  onDelete,
  onDuplicate,
  variant = 'default',
  showActions = true
}) => {
  const { deleteMenu, isDeleting } = useMenus()

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete "${menu.menuName}"?`)) {
      deleteMenu(menu.id)
    }
  }

  return (
    <Card className={cn(
      'transition-all duration-200 hover:shadow-lg',
      'dark:hover:shadow-xl dark:hover:shadow-primary/5',
      'border-l-4 border-l-primary',
      variant === 'compact' && 'p-4'
    )}>
      <CardHeader className={cn(
        'pb-3',
        variant === 'compact' && 'pb-2'
      )}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className={cn(
              'text-lg font-semibold text-foreground',
              variant === 'compact' && 'text-base'
            )}>
              {menu.menuName}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {menu.program?.name} • {menu.mealType}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {menu.difficulty}
            </Badge>
            {menu.imageUrl && (
              <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted">
                <img 
                  src={menu.imageUrl} 
                  alt={menu.imageAlt || menu.menuName}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Nutrition & Cost Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Calculator className="h-3 w-3" />
              <span>Calories</span>
            </div>
            <p className="font-semibold text-foreground">
              {menu.calories} kal
            </p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-muted-foreground">
              <ChefHat className="h-3 w-3" />
              <span>Protein</span>
            </div>
            <p className="font-semibold text-foreground">
              {menu.protein}g
            </p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>Cook Time</span>
            </div>
            <p className="font-semibold text-foreground">
              {menu.cookingTime}m
            </p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Users className="h-3 w-3" />
              <span>Cost</span>
            </div>
            <p className="font-semibold text-foreground">
              {formatCurrency(menu.costPerServing)}
            </p>
          </div>
        </div>

        {/* Description */}
        {menu.description && variant !== 'compact' && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {menu.description}
          </p>
        )}

        {/* Actions */}
        {showActions && (
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit?.(menu.id)}
              >
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDuplicate?.(menu.id)}
              >
                <Copy className="h-4 w-4 mr-1" />
                Duplicate
              </Button>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDelete}
              disabled={isDeleting}
              className="text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
```

### **PHASE 5: Routes & Pages** 🛣️

#### **5.1 Route Structure**

```typescript
// App Router structure
src/app/(sppg)/menu/
├── page.tsx              // Main menu list page
├── create/
│   └── page.tsx         // Create new menu page
├── [id]/
│   ├── page.tsx         // Menu detail page
│   └── edit/
│       └── page.tsx     // Edit menu page
├── planning/
│   └── page.tsx         // Menu planning page
└── settings/
    └── page.tsx         // Menu settings page
```

#### **5.2 Page Implementation Example**

```typescript
// src/app/(sppg)/menu/page.tsx

import { Suspense } from 'react'
import { Metadata } from 'next'
import { MenuList } from '@/components/sppg/menu/components'
import { MenuListSkeleton } from '@/components/sppg/menu/components'

export const metadata: Metadata = {
  title: 'Menu Management - Bergizi ID',
  description: 'Manage nutrition menus for your SPPG program'
}

export default function MenuPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Menu Management</h1>
          <p className="text-muted-foreground">
            Create and manage nutrition menus for your programs
          </p>
        </div>
      </div>

      <Suspense fallback={<MenuListSkeleton />}>
        <MenuList />
      </Suspense>
    </div>
  )
}
```

### **PHASE 6: Real-Time Integration** ⚡ **[INFRASTRUCTURE READY ✅]**

> **🎉 GREAT NEWS**: Redis dan WebSocket infrastructure **SUDAH TERINTEGRASI LENGKAP** berdasarkan dokumentasi yang ada!

#### **6.1 WebSocket Infrastructure Status** ✅

**✅ Yang SUDAH Ada dan Siap Digunakan:**
- ✅ **Redis Client** dengan connection pooling (`src/lib/redis.ts`)
- ✅ **WebSocket Server** (`src/app/api/ws/route.ts`) dengan authentication
- ✅ **SSE Dashboard** (`src/app/api/sse/dashboard/route.ts`) sebagai template
- ✅ **Menu SSE Endpoint** (`src/app/api/sse/menu/route.ts`) - **BARU DIBUAT** ✨
- ✅ **Cache Service** dengan domain-specific caching
- ✅ **Session Management** multi-tenant

#### **6.2 Menu Real-Time Hook Implementation**

```typescript
// src/components/sppg/menu/hooks/useMenuWebSocket.ts - ENHANCED IMPLEMENTATION

'use client'

import { useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'

interface MenuWebSocketConfig {
  enabled?: boolean
  showNotifications?: boolean
  autoReconnect?: boolean
}

export const useMenuWebSocket = (config: MenuWebSocketConfig = {}) => {
  const { data: session } = useSession()
  const queryClient = useQueryClient()
  const [isConnected, setIsConnected] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected')

  const {
    enabled = true,
    showNotifications = true,
    autoReconnect = true
  } = config

  useEffect(() => {
    if (!enabled || !session?.user?.sppgId) return

    setConnectionStatus('connecting')
    
    // Connect to Menu SSE endpoint
    const eventSource = new EventSource(`/api/sse/menu`)

    eventSource.onopen = () => {
      setIsConnected(true)
      setConnectionStatus('connected')
      console.log('Menu WebSocket connected')
    }

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        
        // Handle different event types
        switch (data.type) {
          case 'CONNECTED':
            setIsConnected(true)
            setConnectionStatus('connected')
            break
            
          case 'PING':
            // Keep-alive ping, no action needed
            break
            
          case 'MENU_CREATED':
            queryClient.invalidateQueries({ queryKey: ['menus'] })
            if (showNotifications) {
              toast.success(`New menu "${data.data?.menuName}" created`)
            }
            break
            
          case 'MENU_UPDATED':
            queryClient.invalidateQueries({ queryKey: ['menus'] })
            queryClient.invalidateQueries({ queryKey: ['menu', data.data?.id] })
            if (showNotifications) {
              toast.info(`Menu "${data.data?.menuName}" updated`)
            }
            break
            
          case 'MENU_DELETED':
            queryClient.invalidateQueries({ queryKey: ['menus'] })
            if (showNotifications) {
              toast.info(`Menu deleted`)
            }
            break
            
          case 'MENU_STATUS_TOGGLED':
            queryClient.invalidateQueries({ queryKey: ['menus'] })
            queryClient.invalidateQueries({ queryKey: ['menu', data.data?.id] })
            if (showNotifications) {
              toast.info(`Menu status updated`)
            }
            break
        }
      } catch (error) {
        console.error('Menu WebSocket message parse error:', error)
      }
    }

    eventSource.onerror = () => {
      setIsConnected(false)
      setConnectionStatus('disconnected')
      console.log('Menu WebSocket disconnected')
    }

    return () => {
      eventSource.close()
      setIsConnected(false)
      setConnectionStatus('disconnected')
    }
  }, [enabled, session?.user?.sppgId, queryClient, showNotifications])

  return {
    isConnected,
    connectionStatus,
    // Legacy compatibility
    isRealtimeEnabled: isConnected
  }
}
```

### **PHASE 7: Testing & Documentation** 🧪

#### **7.1 Testing Strategy**

```typescript
// Unit Tests
src/components/sppg/menu/__tests__/
├── hooks/
│   ├── useMenus.test.ts
│   └── useNutritionCalculator.test.ts
├── components/
│   ├── MenuCard.test.tsx
│   └── MenuForm.test.tsx
├── utils/
│   ├── menuValidation.test.ts
│   └── menuUtils.test.ts
└── server-actions/
    └── menu.test.ts

// Integration Tests
src/__tests__/integration/menu/
├── menu-crud-flow.test.ts
├── menu-planning-flow.test.ts
└── menu-real-time.test.ts

// E2E Tests
cypress/e2e/menu/
├── menu-management.cy.ts
├── menu-creation.cy.ts
└── menu-planning.cy.ts
```

## 🎯 **Implementation Timeline**

### **Week 1-2: Foundation**
- ✅ Server actions (CRUD operations)
- ✅ Types and validation schemas
- ✅ Basic hooks (useMenus, useMenu)

### **Week 3-4: Core Features**
- ✅ Core UI components (MenuCard, MenuList, MenuForm)
- ✅ Calculation hooks (nutrition, cost)
- ✅ Pages and routing

### **Week 5-6: Advanced Features**
- ✅ Menu planning functionality
- ✅ Recipe builder
- ✅ Advanced filtering and search

### **Week 7-8: Integration & Polish**
- ✅ Real-time WebSocket integration **[INFRASTRUCTURE READY ✅]**
- ✅ Testing implementation
- ✅ Performance optimization
- ✅ Documentation completion

> **🚀 ACCELERATED TIMELINE**: Karena Redis dan WebSocket infrastructure sudah siap, Week 7-8 bisa fokus pada testing dan polish!

## ✅ **Success Criteria**

1. **Functionality**: All CRUD operations working
2. **Performance**: Sub-3 second load times
3. **UX**: Intuitive and responsive interface
4. **Real-time**: Live updates across users
5. **Testing**: 90%+ test coverage
6. **Security**: Multi-tenant data isolation
7. **Scalability**: Handle 1000+ concurrent users

## 🎉 **GREAT NEWS: Infrastructure Ready!**

### **✅ Redis & WebSocket SUDAH TERINTEGRASI PENUH**

Berdasarkan audit dokumentasi yang mendalam, **semua infrastructure yang dibutuhkan untuk Menu domain sudah siap dan terintegrasi dengan baik:**

#### **🚀 Yang Sudah Siap Digunakan:**
- ✅ **Redis Client** dengan enterprise-grade connection pooling
- ✅ **Cache Service** untuk domain-specific caching dengan TTL management  
- ✅ **Session Management** dengan multi-tenant SPPG isolation
- ✅ **WebSocket Server** dengan token authentication dan security
- ✅ **SSE Menu Endpoint** untuk real-time menu updates (baru dibuat)
- ✅ **Pub/Sub Broadcasting** untuk cross-user real-time synchronization

#### **🏃‍♂️ Accelerated Implementation Timeline:**
Karena infrastruktur real-time sudah lengkap, kita bisa **langsung fokus ke PHASE 1** tanpa khawatir tentang Redis/WebSocket setup. Timeline Week 7-8 bisa dipercepat untuk fokus pada testing dan polish.

**Ready to start dengan PHASE 1: Server Actions?** 🚀