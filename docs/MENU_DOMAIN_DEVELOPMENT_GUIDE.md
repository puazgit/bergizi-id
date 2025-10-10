# 🍽️ **MENU DOMAIN DEVELOPMENT GUIDE - Enterprise Architecture**

> **Panduan Lengkap Development Domain Menu SPPG**  
> **Enterprise-Grade SaaS Platform dengan Real-Time Integration**

---

## 📋 **Table of Contents**

1. [Architecture Overview](#architecture-overview)
2. [Pattern 2 Implementation](#pattern-2-implementation)
3. [Database Schema & Workflow](#database-schema--workflow)
4. [Real-Time Integration](#real-time-integration)
5. [Development Structure](#development-structure)
6. [API Layer Implementation](#api-layer-implementation)
7. [UI Components Guide](#ui-components-guide)
8. [Testing Strategy](#testing-strategy)
9. [Performance Optimization](#performance-optimization)
10. [Security Implementation](#security-implementation)

---

## 🏗️ **Architecture Overview**

### **Domain-Driven Design (DDD) Structure**
```
src/components/sppg/menu/
├── components/          # UI Components (Pattern 2)
│   ├── MenuList.tsx
│   ├── MenuForm.tsx
│   ├── MenuCard.tsx
│   ├── ProgramSelector.tsx
│   ├── IngredientManager.tsx
│   ├── NutritionCalculator.tsx
│   ├── CostCalculator.tsx
│   ├── MenuPlanner.tsx
│   ├── RecipeBuilder.tsx
│   └── index.ts
├── hooks/               # Domain-specific hooks
│   ├── useMenus.ts
│   ├── usePrograms.ts
│   ├── useIngredients.ts
│   ├── useNutritionCalc.ts
│   ├── useCostCalc.ts
│   ├── useMenuPlanning.ts
│   ├── useRealTimeMenu.ts
│   └── index.ts
├── types/               # Domain types
│   ├── menuTypes.ts
│   ├── programTypes.ts
│   ├── nutritionTypes.ts
│   ├── calculationTypes.ts
│   └── index.ts
├── utils/               # Domain utilities
│   ├── menuCalculations.ts
│   ├── nutritionUtils.ts
│   ├── costUtils.ts
│   ├── menuValidation.ts
│   └── index.ts
└── providers/           # Context providers
    ├── MenuProvider.tsx
    ├── ProgramProvider.tsx
    └── index.ts
```

### **Enterprise Integration Points**
```typescript
// Real-time integration dengan WebSocket + Redis
interface MenuDomainIntegration {
  websocket: {
    channels: [
      'menu-updates',           // Real-time menu changes
      'nutrition-calculations', // Live nutrition updates
      'cost-calculations',      // Live cost updates
      'menu-planning',          // Collaborative planning
      'ingredient-availability' // Real-time stock updates
    ]
  }
  
  redis: {
    cache: [
      'menu-list',             // Cached menu data
      'program-data',          // Program information
      'nutrition-calculations', // Expensive calculations
      'cost-estimates',        // Price calculations
      'ingredient-prices'      // Real-time pricing
    ]
  }
  
  external: {
    procurement: 'Shopping list generation',
    production: 'Production scheduling',
    distribution: 'Menu distribution tracking',
    inventory: 'Ingredient availability',
    analytics: 'Performance metrics'
  }
}
```

---

## 🎯 **Pattern 2 Implementation**

### **✅ Core Principle: Self-Contained Domain Architecture**
```typescript
// ❌ AVOID: Centralized pattern
// src/hooks/sppg/useMenu.ts

// ✅ CORRECT: Pattern 2 structure
// src/components/sppg/menu/hooks/useMenus.ts
```

### **Component Architecture Standards**
```typescript
// src/components/sppg/menu/components/MenuCard.tsx
'use client'

import { type FC } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useMenus } from '../hooks/useMenus'
import { type MenuWithProgram } from '../types/menuTypes'
import { formatCurrency, formatNutrition } from '../utils/menuUtils'

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
  const { deleteMenu } = useMenus()

  // Dark mode support
  const cardClassName = cn(
    'transition-all duration-200',
    'hover:shadow-lg dark:hover:shadow-xl',
    'border-l-4 border-l-primary',
    variant === 'compact' && 'p-4',
    variant === 'detailed' && 'p-6'
  )

  return (
    <Card className={cardClassName}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold text-foreground">
              {menu.menuName}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {menu.program.name} • {menu.mealType}
            </p>
          </div>
          <Badge variant="secondary" className="ml-2">
            {menu.servingSize}g
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Nutrition Summary */}
        <div className="grid grid-cols-4 gap-3 text-sm">
          <div className="text-center p-2 bg-muted/30 rounded">
            <span className="block font-medium text-foreground">
              {formatNutrition(menu.calories)}
            </span>
            <span className="text-xs text-muted-foreground">Kalori</span>
          </div>
          <div className="text-center p-2 bg-muted/30 rounded">
            <span className="block font-medium text-foreground">
              {formatNutrition(menu.protein)}g
            </span>
            <span className="text-xs text-muted-foreground">Protein</span>
          </div>
          <div className="text-center p-2 bg-muted/30 rounded">
            <span className="block font-medium text-foreground">
              {formatNutrition(menu.carbohydrates)}g
            </span>
            <span className="text-xs text-muted-foreground">Karbo</span>
          </div>
          <div className="text-center p-2 bg-muted/30 rounded">
            <span className="block font-medium text-foreground">
              {formatCurrency(menu.costPerServing)}
            </span>
            <span className="text-xs text-muted-foreground">Biaya</span>
          </div>
        </div>

        {/* Actions */}
        {showActions && (
          <div className="flex gap-2 pt-2 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit?.(menu.id)}
              className="flex-1"
            >
              Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDuplicate?.(menu.id)}
            >
              Duplikasi
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete?.(menu.id)}
              className="text-destructive hover:bg-destructive/10"
            >
              Hapus
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
```

---

## 🗄️ **Database Schema & Workflow**

### **Core Models Relationship**
```prisma
// Primary Models for Menu Domain
model NutritionProgram {
  id                  String @id @default(cuid())
  sppgId              String
  name                String
  programCode         String @unique
  programType         ProgramType
  targetGroup         TargetGroup
  
  // Nutrition Goals
  calorieTarget       Float?
  proteinTarget       Float?
  carbTarget          Float?
  fatTarget           Float?
  fiberTarget         Float?
  
  // Relations
  sppg                SPPG @relation(fields: [sppgId], references: [id])
  menus               NutritionMenu[]
  
  @@index([sppgId, status])
}

model NutritionMenu {
  id                  String @id @default(cuid())
  programId           String
  menuName            String
  menuCode            String
  mealType            MealType
  servingSize         Int
  
  // Nutrition per serving
  calories            Float
  protein             Float
  carbohydrates       Float
  fat                 Float
  fiber               Float
  
  // Cost
  costPerServing      Float
  
  // Relations
  program             NutritionProgram @relation(fields: [programId], references: [id])
  ingredients         MenuIngredient[]
  nutritionCalc       MenuNutritionCalculation?
  costCalc            MenuCostCalculation?
  
  @@unique([programId, menuCode])
}

model MenuIngredient {
  id                  String @id @default(cuid())
  menuId              String
  ingredientName      String
  quantity            Float
  unit                String
  costPerUnit         Float
  totalCost           Float
  
  // Nutrition contribution
  caloriesContrib     Float @default(0)
  proteinContrib      Float @default(0)
  carbsContrib        Float @default(0)
  fatContrib          Float @default(0)
  
  menu                NutritionMenu @relation(fields: [menuId], references: [id])
}
```

### **Workflow Implementation**
```typescript
// Menu Creation Workflow
interface MenuCreationWorkflow {
  // Phase 1: Program Selection
  selectProgram: {
    programId: string
    validateAccess: boolean // Multi-tenant check
    checkBudget: boolean    // Budget availability
  }
  
  // Phase 2: Basic Menu Info
  basicInfo: {
    menuName: string
    menuCode: string      // Auto-generated: PGM-001
    mealType: MealType    // SARAPAN, MAKAN_SIANG, etc
    servingSize: number   // grams per serving
    description?: string
  }
  
  // Phase 3: Ingredient Management
  ingredients: {
    add: (ingredient: IngredientInput) => Promise<void>
    remove: (ingredientId: string) => Promise<void>
    update: (ingredientId: string, updates: Partial<IngredientInput>) => Promise<void>
    reorder: (ingredientIds: string[]) => Promise<void>
  }
  
  // Phase 4: Auto Calculations (Real-time)
  calculations: {
    nutrition: () => Promise<NutritionCalculation>
    cost: () => Promise<CostCalculation>
    akgCompliance: () => Promise<AKGCompliance>
  }
  
  // Phase 5: Validation & Save
  validation: {
    nutritionGoals: boolean   // Meets program targets
    budgetCompliance: boolean // Within budget limits
    ingredientAvailability: boolean
  }
}
```

---

## ⚡ **Real-Time Integration**

### **WebSocket Implementation**
```typescript
// src/components/sppg/menu/hooks/useRealTimeMenu.ts
'use client'

import { useEffect, useState } from 'react'
import { useWebSocket } from '@/hooks/useWebSocket'
import { toast } from 'sonner'
import { type MenuUpdate, type NutritionUpdate } from '../types'

export const useRealTimeMenu = (menuId?: string) => {
  const [realtimeData, setRealtimeData] = useState<{
    menuUpdates: MenuUpdate[]
    nutritionUpdates: NutritionUpdate[]
    collaborators: string[]
  }>({
    menuUpdates: [],
    nutritionUpdates: [],
    collaborators: []
  })

  const { socket, isConnected } = useWebSocket()

  useEffect(() => {
    if (!socket || !isConnected || !menuId) return

    // Subscribe to menu-specific updates
    socket.emit('join-menu-room', { menuId })

    // Real-time menu updates
    socket.on('menu-updated', (update: MenuUpdate) => {
      setRealtimeData(prev => ({
        ...prev,
        menuUpdates: [update, ...prev.menuUpdates.slice(0, 9)]
      }))
      
      if (update.userId !== socket.id) {
        toast.info(`Menu updated by ${update.userName}`, {
          description: update.changes.join(', ')
        })
      }
    })

    // Real-time nutrition calculations
    socket.on('nutrition-calculated', (update: NutritionUpdate) => {
      setRealtimeData(prev => ({
        ...prev,
        nutritionUpdates: [update, ...prev.nutritionUpdates.slice(0, 4)]
      }))
    })

    // Collaborative editing awareness
    socket.on('user-joined-menu', (user: { id: string; name: string }) => {
      setRealtimeData(prev => ({
        ...prev,
        collaborators: [...prev.collaborators, user.name]
      }))
      toast.success(`${user.name} joined menu editing`)
    })

    socket.on('user-left-menu', (user: { id: string; name: string }) => {
      setRealtimeData(prev => ({
        ...prev,
        collaborators: prev.collaborators.filter(name => name !== user.name)
      }))
    })

    return () => {
      socket.emit('leave-menu-room', { menuId })
      socket.off('menu-updated')
      socket.off('nutrition-calculated')
      socket.off('user-joined-menu')
      socket.off('user-left-menu')
    }
  }, [socket, isConnected, menuId])

  const broadcastMenuUpdate = (changes: string[]) => {
    if (socket && menuId) {
      socket.emit('menu-update', {
        menuId,
        changes,
        timestamp: new Date().toISOString()
      })
    }
  }

  return {
    realtimeData,
    isConnected,
    broadcastMenuUpdate
  }
}
```

### **Redis Caching Strategy**
```typescript
// src/lib/cache/menuCache.ts
import Redis from 'ioredis'
import { type MenuWithDetails, type NutritionCalculation } from '@/components/sppg/menu/types'

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379')

export class MenuCache {
  private static readonly CACHE_KEYS = {
    MENU_LIST: (sppgId: string) => `menu:list:${sppgId}`,
    MENU_DETAILS: (menuId: string) => `menu:details:${menuId}`,
    NUTRITION_CALC: (menuId: string) => `menu:nutrition:${menuId}`,
    COST_CALC: (menuId: string) => `menu:cost:${menuId}`,
    PROGRAM_MENUS: (programId: string) => `program:menus:${programId}`,
    INGREDIENT_PRICES: () => 'ingredients:prices',
    WEEKLY_PLAN: (programId: string, week: string) => `plan:weekly:${programId}:${week}`
  } as const

  private static readonly TTL = {
    MENU_DATA: 15 * 60,      // 15 minutes
    CALCULATIONS: 30 * 60,    // 30 minutes
    PRICES: 5 * 60,          // 5 minutes
    PLANS: 60 * 60           // 1 hour
  } as const

  // Menu list caching with pagination
  static async getMenuList(sppgId: string): Promise<MenuWithDetails[] | null> {
    try {
      const cached = await redis.get(this.CACHE_KEYS.MENU_LIST(sppgId))
      return cached ? JSON.parse(cached) : null
    } catch (error) {
      console.warn('Redis get error:', error)
      return null
    }
  }

  static async setMenuList(sppgId: string, menus: MenuWithDetails[]): Promise<void> {
    try {
      await redis.setex(
        this.CACHE_KEYS.MENU_LIST(sppgId),
        this.TTL.MENU_DATA,
        JSON.stringify(menus)
      )
    } catch (error) {
      console.warn('Redis set error:', error)
    }
  }

  // Expensive calculation caching
  static async getNutritionCalculation(menuId: string): Promise<NutritionCalculation | null> {
    try {
      const cached = await redis.get(this.CACHE_KEYS.NUTRITION_CALC(menuId))
      return cached ? JSON.parse(cached) : null
    } catch (error) {
      console.warn('Redis get error:', error)
      return null
    }
  }

  static async setNutritionCalculation(
    menuId: string, 
    calculation: NutritionCalculation
  ): Promise<void> {
    try {
      await redis.setex(
        this.CACHE_KEYS.NUTRITION_CALC(menuId),
        this.TTL.CALCULATIONS,
        JSON.stringify(calculation)
      )
      
      // Broadcast update via WebSocket
      await this.broadcastCalculationUpdate(menuId, 'nutrition', calculation)
    } catch (error) {
      console.warn('Redis set error:', error)
    }
  }

  // Cache invalidation patterns
  static async invalidateMenuCache(menuId: string, sppgId: string): Promise<void> {
    const keys = [
      this.CACHE_KEYS.MENU_DETAILS(menuId),
      this.CACHE_KEYS.MENU_LIST(sppgId),
      this.CACHE_KEYS.NUTRITION_CALC(menuId),
      this.CACHE_KEYS.COST_CALC(menuId)
    ]

    try {
      await redis.del(...keys)
    } catch (error) {
      console.warn('Cache invalidation error:', error)
    }
  }

  // Real-time broadcast integration
  private static async broadcastCalculationUpdate(
    menuId: string,
    type: 'nutrition' | 'cost',
    data: any
  ): Promise<void> {
    try {
      await redis.publish(`menu:calculations:${menuId}`, JSON.stringify({
        type,
        data,
        timestamp: new Date().toISOString()
      }))
    } catch (error) {
      console.warn('Broadcast error:', error)
    }
  }
}
```

---

## 🛠️ **Development Structure**

### **Server Actions Implementation**
```typescript
// src/actions/sppg/menu.ts
'use server'

import { auth } from '@/auth'
import db from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { MenuCache } from '@/lib/cache/menuCache'
import { NutritionCalculator } from '@/lib/nutrition/calculator'
import { CostCalculator } from '@/lib/cost/calculator'
import { menuSchema } from '@/components/sppg/menu/utils/menuSchemas'
import { ServiceResult } from '@/lib/service-result'
import { hasPermission } from '@/lib/permissions'
import { createComponentLogger } from '@/lib/logger'

const logger = createComponentLogger('MenuActions')

export async function getMenus(filters?: {
  programId?: string
  mealType?: string
  search?: string
  page?: number
  limit?: number
}) {
  try {
    const session = await auth()
    if (!session?.user?.sppgId) {
      return ServiceResult.error('Unauthorized')
    }

    // Multi-tenant security check
    const sppgId = session.user.sppgId

    // Try cache first
    if (!filters || Object.keys(filters).length === 0) {
      const cached = await MenuCache.getMenuList(sppgId)
      if (cached) {
        return ServiceResult.success(cached)
      }
    }

    // Build query with multi-tenant isolation
    const where = {
      program: {
        sppgId // CRITICAL: Always filter by SPPG
      },
      ...(filters?.programId && { programId: filters.programId }),
      ...(filters?.mealType && { mealType: filters.mealType }),
      ...(filters?.search && {
        OR: [
          { menuName: { contains: filters.search, mode: 'insensitive' as const } },
          { description: { contains: filters.search, mode: 'insensitive' as const } }
        ]
      }),
      isActive: true
    }

    const menus = await db.nutritionMenu.findMany({
      where,
      include: {
        program: {
          select: {
            id: true,
            name: true,
            programCode: true,
            programType: true,
            targetGroup: true
          }
        },
        ingredients: {
          select: {
            id: true,
            ingredientName: true,
            quantity: true,
            unit: true,
            totalCost: true
          }
        },
        nutritionCalc: true,
        costCalc: true
      },
      orderBy: [
        { updatedAt: 'desc' },
        { menuName: 'asc' }
      ],
      take: filters?.limit || 50,
      skip: filters?.page ? (filters.page - 1) * (filters.limit || 50) : 0
    })

    // Cache results if no filters
    if (!filters || Object.keys(filters).length === 0) {
      await MenuCache.setMenuList(sppgId, menus)
    }

    return ServiceResult.success(menus)
  } catch (error) {
    logger.error('Failed to fetch menus', error as Error)
    return ServiceResult.error('Failed to fetch menus')
  }
}

export async function createMenu(input: {
  programId: string
  menuName: string
  mealType: string
  servingSize: number
  description?: string
  ingredients: Array<{
    ingredientName: string
    quantity: number
    unit: string
    costPerUnit: number
  }>
}) {
  try {
    const session = await auth()
    if (!session?.user?.sppgId) {
      return ServiceResult.error('Unauthorized')
    }

    // Permission check
    if (!hasPermission(session.user.userRole, 'MENU_MANAGE')) {
      return ServiceResult.error('Insufficient permissions')
    }

    // Validate input
    const validation = menuSchema.safeParse(input)
    if (!validation.success) {
      return ServiceResult.error(validation.error.errors[0].message)
    }

    const sppgId = session.user.sppgId

    // Verify program belongs to SPPG (Multi-tenant security)
    const program = await db.nutritionProgram.findFirst({
      where: {
        id: input.programId,
        sppgId // CRITICAL: Multi-tenant check
      }
    })

    if (!program) {
      return ServiceResult.error('Program not found or access denied')
    }

    // Generate unique menu code
    const menuCode = await generateMenuCode(input.programId)

    // Create menu with ingredients in transaction
    const menu = await db.$transaction(async (tx) => {
      // Create menu
      const newMenu = await tx.nutritionMenu.create({
        data: {
          programId: input.programId,
          menuName: input.menuName,
          menuCode,
          mealType: input.mealType as any,
          servingSize: input.servingSize,
          description: input.description,
          // Initial nutrition values (will be calculated)
          calories: 0,
          protein: 0,
          carbohydrates: 0,
          fat: 0,
          fiber: 0,
          costPerServing: 0
        },
        include: {
          program: true
        }
      })

      // Add ingredients
      if (input.ingredients.length > 0) {
        await tx.menuIngredient.createMany({
          data: input.ingredients.map(ingredient => ({
            menuId: newMenu.id,
            ingredientName: ingredient.ingredientName,
            quantity: ingredient.quantity,
            unit: ingredient.unit,
            costPerUnit: ingredient.costPerUnit,
            totalCost: ingredient.quantity * ingredient.costPerUnit
          }))
        })
      }

      return newMenu
    })

    // Calculate nutrition and cost (async)
    await Promise.all([
      calculateMenuNutrition(menu.id),
      calculateMenuCost(menu.id)
    ])

    // Invalidate cache
    await MenuCache.invalidateMenuCache(menu.id, sppgId)

    // Revalidate relevant pages
    revalidatePath('/menu')
    revalidatePath(`/menu/${menu.id}`)

    logger.info('Menu created successfully', { menuId: menu.id, menuName: menu.menuName })

    return ServiceResult.success(menu)
  } catch (error) {
    logger.error('Failed to create menu', error as Error)
    return ServiceResult.error('Failed to create menu')
  }
}

// Helper function for menu code generation
async function generateMenuCode(programId: string): Promise<string> {
  const program = await db.nutritionProgram.findUnique({
    where: { id: programId },
    select: { programCode: true }
  })
  
  const count = await db.nutritionMenu.count({
    where: { programId }
  })
  
  const programPrefix = program?.programCode.substring(0, 3) || 'MNU'
  return `${programPrefix}-${(count + 1).toString().padStart(3, '0')}`
}

// Async calculation functions
async function calculateMenuNutrition(menuId: string): Promise<void> {
  try {
    const calculator = new NutritionCalculator()
    const calculation = await calculator.calculateForMenu(menuId)
    
    await db.menuNutritionCalculation.upsert({
      where: { menuId },
      create: { menuId, ...calculation },
      update: calculation
    })

    // Update menu with calculated values
    await db.nutritionMenu.update({
      where: { id: menuId },
      data: {
        calories: calculation.totalCalories,
        protein: calculation.totalProtein,
        carbohydrates: calculation.totalCarbs,
        fat: calculation.totalFat,
        fiber: calculation.totalFiber
      }
    })

    // Update cache
    await MenuCache.setNutritionCalculation(menuId, calculation)
  } catch (error) {
    logger.error('Nutrition calculation failed', error as Error, { menuId })
  }
}

async function calculateMenuCost(menuId: string): Promise<void> {
  try {
    const calculator = new CostCalculator()
    const calculation = await calculator.calculateForMenu(menuId)
    
    await db.menuCostCalculation.upsert({
      where: { menuId },
      create: { menuId, ...calculation },
      update: calculation
    })

    // Update menu with calculated cost
    await db.nutritionMenu.update({
      where: { id: menuId },
      data: {
        costPerServing: calculation.costPerPortion
      }
    })
  } catch (error) {
    logger.error('Cost calculation failed', error as Error, { menuId })
  }
}
```

### **Custom Hooks Implementation**
```typescript
// src/components/sppg/menu/hooks/useMenus.ts
'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { getMenus, createMenu, updateMenu, deleteMenu } from '@/actions/sppg/menu'
import { useRealTimeMenu } from './useRealTimeMenu'
import { type MenuFilters, type MenuInput } from '../types'

export const useMenus = (filters?: MenuFilters) => {
  const queryClient = useQueryClient()
  const { broadcastMenuUpdate } = useRealTimeMenu()

  // Get menus with caching
  const {
    data: menus,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['menus', filters],
    queryFn: async () => {
      const result = await getMenus(filters)
      if (!result.success) {
        throw new Error(result.error)
      }
      return result.data
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    retry: 2
  })

  // Create menu mutation
  const createMenuMutation = useMutation({
    mutationFn: createMenu,
    onSuccess: (result) => {
      if (result.success) {
        // Invalidate and refetch menus
        queryClient.invalidateQueries({ queryKey: ['menus'] })
        
        // Broadcast real-time update
        broadcastMenuUpdate(['Menu created'])
        
        toast.success('Menu berhasil dibuat', {
          description: `Menu "${result.data.menuName}" telah ditambahkan`
        })
      } else {
        toast.error('Gagal membuat menu', {
          description: result.error
        })
      }
    },
    onError: (error) => {
      toast.error('Gagal membuat menu', {
        description: error.message
      })
    }
  })

  // Update menu mutation
  const updateMenuMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<MenuInput> }) =>
      updateMenu(id, data),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ['menus'] })
        queryClient.invalidateQueries({ queryKey: ['menu', result.data.id] })
        
        broadcastMenuUpdate(['Menu updated'])
        
        toast.success('Menu berhasil diperbarui')
      } else {
        toast.error('Gagal memperbarui menu', {
          description: result.error
        })
      }
    }
  })

  // Delete menu mutation
  const deleteMenuMutation = useMutation({
    mutationFn: deleteMenu,
    onSuccess: (result, menuId) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ['menus'] })
        queryClient.removeQueries({ queryKey: ['menu', menuId] })
        
        broadcastMenuUpdate(['Menu deleted'])
        
        toast.success('Menu berhasil dihapus')
      } else {
        toast.error('Gagal menghapus menu', {
          description: result.error
        })
      }
    }
  })

  return {
    // Data
    menus: menus || [],
    isLoading,
    error,
    
    // Actions
    refetch,
    createMenu: createMenuMutation.mutate,
    updateMenu: updateMenuMutation.mutate,
    deleteMenu: deleteMenuMutation.mutate,
    
    // States
    isCreating: createMenuMutation.isPending,
    isUpdating: updateMenuMutation.isPending,
    isDeleting: deleteMenuMutation.isPending
  }
}
```

---

## 🎨 **UI Components Guide**

### **MenuList Component**
```typescript
// src/components/sppg/menu/components/MenuList.tsx
'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { 
  Search,
  Filter,
  Plus,
  Grid3X3,
  List,
  SortAsc,
  Calendar
} from 'lucide-react'

import { useMenus } from '../hooks/useMenus'
import { usePrograms } from '../hooks/usePrograms'
import { MenuCard } from './MenuCard'
import { MenuFilters } from './MenuFilters'
import { type MenuFilters as MenuFiltersType } from '../types'

export const MenuList = () => {
  const [filters, setFilters] = useState<MenuFiltersType>({})
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showFilters, setShowFilters] = useState(false)

  const { menus, isLoading, isCreating, createMenu } = useMenus(filters)
  const { programs } = usePrograms()

  const handleCreateMenu = () => {
    // Navigate to create menu form or open modal
    window.location.href = '/menu/create'
  }

  const handleFilterChange = (newFilters: Partial<MenuFiltersType>) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-3 text-muted-foreground">Loading menus...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold">Menu Management</CardTitle>
              <p className="text-muted-foreground mt-1">
                Kelola menu makanan dan nutrition untuk program SPPG
              </p>
            </div>
            <Button onClick={handleCreateMenu} disabled={isCreating} className="gap-2">
              <Plus className="h-4 w-4" />
              Buat Menu Baru
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Filters & Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari menu..."
                value={filters.search || ''}
                onChange={(e) => handleFilterChange({ search: e.target.value })}
                className="pl-10"
              />
            </div>

            {/* Program Filter */}
            <Select
              value={filters.programId || 'all'}
              onValueChange={(value) => 
                handleFilterChange({ programId: value === 'all' ? undefined : value })
              }
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Pilih Program" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Program</SelectItem>
                {programs.map((program) => (
                  <SelectItem key={program.id} value={program.id}>
                    {program.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Meal Type Filter */}
            <Select
              value={filters.mealType || 'all'}
              onValueChange={(value) =>
                handleFilterChange({ mealType: value === 'all' ? undefined : value })
              }
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Tipe Makanan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua</SelectItem>
                <SelectItem value="SARAPAN">Sarapan</SelectItem>
                <SelectItem value="MAKAN_SIANG">Makan Siang</SelectItem>
                <SelectItem value="SNACK_PAGI">Snack Pagi</SelectItem>
                <SelectItem value="SNACK_SORE">Snack Sore</SelectItem>
              </SelectContent>
            </Select>

            {/* Advanced Filters Toggle */}
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="gap-2"
            >
              <Filter className="h-4 w-4" />
              Filter
            </Button>

            {/* View Mode Toggle */}
            <div className="flex rounded-lg border">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Advanced Filters Panel */}
          {showFilters && (
            <MenuFilters
              filters={filters}
              onFiltersChange={handleFilterChange}
              className="mt-4 pt-4 border-t"
            />
          )}

          {/* Active Filters */}
          {Object.keys(filters).length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {filters.search && (
                <Badge variant="secondary" className="gap-1">
                  Search: {filters.search}
                  <button
                    onClick={() => handleFilterChange({ search: undefined })}
                    className="ml-1 hover:bg-secondary-foreground/20 rounded-full p-0.5"
                  >
                    ×
                  </button>
                </Badge>
              )}
              {filters.programId && (
                <Badge variant="secondary" className="gap-1">
                  Program: {programs.find(p => p.id === filters.programId)?.name}
                  <button
                    onClick={() => handleFilterChange({ programId: undefined })}
                    className="ml-1 hover:bg-secondary-foreground/20 rounded-full p-0.5"
                  >
                    ×
                  </button>
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Menu Grid/List */}
      <div className={
        viewMode === 'grid' 
          ? "grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          : "space-y-4"
      }>
        {menus.map((menu) => (
          <MenuCard
            key={menu.id}
            menu={menu}
            variant={viewMode === 'list' ? 'compact' : 'default'}
            onEdit={(id) => window.location.href = `/menu/${id}/edit`}
            onDuplicate={(id) => {
              // Implement duplicate logic
              console.log('Duplicate menu:', id)
            }}
          />
        ))}
      </div>

      {/* Empty State */}
      {menus.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="text-6xl mb-4">🍽️</div>
            <h3 className="text-lg font-semibold mb-2">Belum ada menu</h3>
            <p className="text-muted-foreground mb-6">
              Mulai buat menu pertama untuk program gizi Anda
            </p>
            <Button onClick={handleCreateMenu} className="gap-2">
              <Plus className="h-4 w-4" />
              Buat Menu Pertama
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
```

---

## 🧪 **Testing Strategy**

### **Unit Tests**
```typescript
// src/components/sppg/menu/__tests__/useMenus.test.ts
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useMenus } from '../hooks/useMenus'
import { getMenus } from '@/actions/sppg/menu'

// Mock server action
jest.mock('@/actions/sppg/menu', () => ({
  getMenus: jest.fn(),
  createMenu: jest.fn(),
  updateMenu: jest.fn(),
  deleteMenu: jest.fn()
}))

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  })
  
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}

describe('useMenus Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should fetch menus successfully', async () => {
    const mockMenus = [
      {
        id: '1',
        menuName: 'Test Menu',
        mealType: 'SARAPAN',
        calories: 400,
        protein: 15,
        carbohydrates: 50,
        fat: 10,
        costPerServing: 5000,
        program: {
          id: 'prog1',
          name: 'Test Program',
          programCode: 'TST-001'
        }
      }
    ]

    ;(getMenus as jest.Mock).mockResolvedValue({
      success: true,
      data: mockMenus
    })

    const { result } = renderHook(() => useMenus(), {
      wrapper: createWrapper()
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.menus).toEqual(mockMenus)
    expect(getMenus).toHaveBeenCalledWith(undefined)
  })

  it('should handle filters properly', async () => {
    const filters = {
      programId: 'prog1',
      mealType: 'SARAPAN',
      search: 'test'
    }

    ;(getMenus as jest.Mock).mockResolvedValue({
      success: true,
      data: []
    })

    renderHook(() => useMenus(filters), {
      wrapper: createWrapper()
    })

    await waitFor(() => {
      expect(getMenus).toHaveBeenCalledWith(filters)
    })
  })
})
```

### **Integration Tests**
```typescript
// src/components/sppg/menu/__tests__/MenuList.integration.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MenuList } from '../components/MenuList'
import { getMenus } from '@/actions/sppg/menu'

jest.mock('@/actions/sppg/menu')

const renderWithProviders = (component: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  })

  return render(
    <QueryClientProvider client={queryClient}>
      {component}
    </QueryClientProvider>
  )
}

describe('MenuList Integration', () => {
  beforeEach(() => {
    ;(getMenus as jest.Mock).mockResolvedValue({
      success: true,
      data: [
        {
          id: '1',
          menuName: 'Nasi Gudeg',
          mealType: 'MAKAN_SIANG',
          calories: 450,
          protein: 20,
          program: {
            name: 'Program Balita'
          }
        }
      ]
    })
  })

  it('should render menu list correctly', async () => {
    renderWithProviders(<MenuList />)

    expect(screen.getByText('Menu Management')).toBeInTheDocument()
    
    await waitFor(() => {
      expect(screen.getByText('Nasi Gudeg')).toBeInTheDocument()
    })
  })

  it('should filter menus by search', async () => {
    renderWithProviders(<MenuList />)

    const searchInput = screen.getByPlaceholderText('Cari menu...')
    fireEvent.change(searchInput, { target: { value: 'gudeg' } })

    await waitFor(() => {
      expect(getMenus).toHaveBeenCalledWith({
        search: 'gudeg'
      })
    })
  })

  it('should toggle view mode', async () => {
    renderWithProviders(<MenuList />)

    const listViewButton = screen.getByRole('button', { name: /list/i })
    fireEvent.click(listViewButton)

    // Check if view mode changed (implementation specific)
    expect(listViewButton).toHaveClass('bg-primary') // assuming active state
  })
})
```

---

## ⚡ **Performance Optimization**

### **Caching Strategy**
```typescript
// Performance optimization techniques
const optimizationStrategies = {
  // 1. Query caching with stale-while-revalidate
  queryCache: {
    staleTime: 5 * 60 * 1000,        // 5 minutes
    cacheTime: 10 * 60 * 1000,       // 10 minutes
    refetchOnWindowFocus: false,
    refetchOnReconnect: true
  },

  // 2. Redis caching for expensive operations
  redisCache: {
    menuList: 15 * 60,               // 15 minutes
    nutritionCalc: 30 * 60,          // 30 minutes
    costCalc: 30 * 60,               // 30 minutes
    ingredientPrices: 5 * 60         // 5 minutes
  },

  // 3. Component optimization
  componentOptimization: {
    memo: 'React.memo for pure components',
    callback: 'useCallback for event handlers',
    memo: 'useMemo for expensive calculations',
    virtualization: 'Virtual scrolling for large lists'
  },

  // 4. Bundle optimization
  bundleOptimization: {
    codesplitting: 'Route-based code splitting',
    lazyLoading: 'Lazy load non-critical components',
    treeshaking: 'Remove unused code',
    compression: 'Gzip compression'
  }
}
```

### **Real-Time Optimization**
```typescript
// WebSocket connection management
export const useOptimizedWebSocket = () => {
  const [socket, setSocket] = useState<Socket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>()
  const heartbeatIntervalRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    let ws: Socket

    const connect = () => {
      ws = io(process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001', {
        transports: ['websocket'],
        timeout: 20000,
        retries: 3,
        retryDelayStart: 1000,
        retryDelayMax: 5000,
        randomizationFactor: 0.5
      })

      ws.on('connect', () => {
        console.log('WebSocket connected')
        clearTimeout(reconnectTimeoutRef.current)
        
        // Start heartbeat
        heartbeatIntervalRef.current = setInterval(() => {
          ws.emit('ping')
        }, 25000)
      })

      ws.on('disconnect', (reason) => {
        console.log('WebSocket disconnected:', reason)
        clearInterval(heartbeatIntervalRef.current)
        
        // Auto-reconnect with exponential backoff
        if (reason === 'io server disconnect') {
          // Server initiated disconnect, don't reconnect
          return
        }
        
        reconnectTimeoutRef.current = setTimeout(connect, 2000)
      })

      ws.on('pong', () => {
        // Heartbeat response received
      })

      setSocket(ws)
    }

    connect()

    return () => {
      clearTimeout(reconnectTimeoutRef.current)
      clearInterval(heartbeatIntervalRef.current)
      ws?.disconnect()
    }
  }, [])

  return socket
}
```

---

## 🔒 **Security Implementation**

### **Multi-Tenant Security**
```typescript
// Security middleware for menu operations
export const menuSecurityMiddleware = {
  // 1. Authentication check
  requireAuth: async (req: Request) => {
    const session = await auth()
    if (!session?.user?.sppgId) {
      throw new Error('Unauthorized access')
    }
    return session
  },

  // 2. SPPG ownership verification
  verifySppgOwnership: async (resourceId: string, sppgId: string, type: 'menu' | 'program') => {
    let isOwner = false
    
    if (type === 'menu') {
      const menu = await db.nutritionMenu.findFirst({
        where: {
          id: resourceId,
          program: { sppgId }
        }
      })
      isOwner = !!menu
    } else if (type === 'program') {
      const program = await db.nutritionProgram.findFirst({
        where: { id: resourceId, sppgId }
      })
      isOwner = !!program
    }

    if (!isOwner) {
      throw new Error('Resource not found or access denied')
    }
  },

  // 3. Permission verification
  checkPermission: (userRole: string, action: string) => {
    const permissions = {
      'SPPG_ADMIN': ['CREATE', 'READ', 'UPDATE', 'DELETE'],
      'SPPG_AHLI_GIZI': ['CREATE', 'READ', 'UPDATE'],
      'SPPG_USER': ['READ'],
      'SPPG_VIEWER': ['READ']
    }

    const userPermissions = permissions[userRole as keyof typeof permissions] || []
    
    if (!userPermissions.includes(action)) {
      throw new Error('Insufficient permissions')
    }
  },

  // 4. Input sanitization
  sanitizeInput: (input: any) => {
    // Remove potential XSS vectors
    const sanitized = JSON.parse(JSON.stringify(input))
    
    // Sanitize string fields
    Object.keys(sanitized).forEach(key => {
      if (typeof sanitized[key] === 'string') {
        sanitized[key] = sanitized[key]
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          .replace(/javascript:/gi, '')
          .trim()
      }
    })

    return sanitized
  },

  // 5. Rate limiting
  rateLimiter: new Map<string, { count: number; resetTime: number }>(),
  
  checkRateLimit: (userId: string, action: string) => {
    const key = `${userId}:${action}`
    const now = Date.now()
    const windowMs = 60 * 1000 // 1 minute
    const maxRequests = action === 'CREATE' ? 10 : 100

    const record = menuSecurityMiddleware.rateLimiter.get(key)
    
    if (!record || now > record.resetTime) {
      menuSecurityMiddleware.rateLimiter.set(key, {
        count: 1,
        resetTime: now + windowMs
      })
      return true
    }

    if (record.count >= maxRequests) {
      throw new Error('Rate limit exceeded')
    }

    record.count++
    return true
  }
}
```

---

## 📊 **Monitoring & Analytics**

### **Performance Monitoring**
```typescript
// Performance monitoring setup
export const menuPerformanceMonitor = {
  // Track component render times
  trackRenderTime: (componentName: string, renderTime: number) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'component_render', {
        custom_parameter_component: componentName,
        custom_parameter_duration: renderTime,
        event_category: 'performance'
      })
    }
  },

  // Track API response times
  trackApiCall: (endpoint: string, duration: number, success: boolean) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'api_call', {
        custom_parameter_endpoint: endpoint,
        custom_parameter_duration: duration,
        custom_parameter_success: success,
        event_category: 'api'
      })
    }
  },

  // Track user interactions
  trackUserAction: (action: string, category: string, data?: any) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', action, {
        event_category: category,
        custom_parameter_data: JSON.stringify(data)
      })
    }
  }
}

// Performance wrapper hook
export const usePerformanceMonitor = (componentName: string) => {
  useEffect(() => {
    const startTime = performance.now()
    
    return () => {
      const endTime = performance.now()
      menuPerformanceMonitor.trackRenderTime(componentName, endTime - startTime)
    }
  }, [componentName])
}
```

---

## 🚀 **Deployment Checklist**

### **Pre-Deployment Validation**
```typescript
const deploymentChecklist = {
  // 1. Code Quality
  codeQuality: [
    '✅ TypeScript compilation with zero errors',
    '✅ ESLint passing with zero warnings',
    '✅ Prettier formatting applied',
    '✅ All tests passing (unit + integration)',
    '✅ Test coverage >= 90%'
  ],

  // 2. Security
  security: [
    '✅ All API endpoints have authentication',
    '✅ Multi-tenant isolation implemented',
    '✅ Input validation on all forms',
    '✅ XSS protection enabled',
    '✅ Rate limiting configured',
    '✅ Audit logging active'
  ],

  // 3. Performance
  performance: [
    '✅ Bundle size < 500KB (gzipped)',
    '✅ Lighthouse score >= 95',
    '✅ Core Web Vitals optimized',
    '✅ Redis caching implemented',
    '✅ Database queries optimized',
    '✅ Images optimized and lazy-loaded'
  ],

  // 4. Functionality
  functionality: [
    '✅ All CRUD operations working',
    '✅ Real-time updates functional',
    '✅ WebSocket connections stable',
    '✅ Error handling comprehensive',
    '✅ Loading states implemented',
    '✅ Offline functionality (where applicable)'
  ],

  // 5. Monitoring
  monitoring: [
    '✅ Error tracking configured (Sentry)',
    '✅ Performance monitoring active',
    '✅ User analytics enabled',
    '✅ Server monitoring setup',
    '✅ Alert systems configured'
  ]
}
```

---

## 🎯 **Success Metrics**

### **Technical KPIs**
```typescript
const technicalKPIs = {
  performance: {
    pageLoadTime: '< 3 seconds',
    apiResponseTime: '< 500ms',
    cacheHitRate: '> 80%',
    errorRate: '< 0.1%',
    uptime: '99.9%'
  },

  userExperience: {
    taskCompletionRate: '> 95%',
    userSatisfactionScore: '> 4.5/5',
    bounceRate: '< 10%',
    sessionDuration: '> 5 minutes',
    returnUserRate: '> 60%'
  },

  businessValue: {
    menuCreationTime: '< 30 minutes',
    nutritionAccuracy: '> 95%',
    costAccuracy: '< 5% variance',
    planningEfficiency: '< 2 hours/week',
    wasteReduction: '> 10%'
  }
}
```

---

## 📝 **Development Workflow**

### **Git Workflow**
```bash
# Feature development workflow
git checkout develop
git pull origin develop
git checkout -b feature/menu-domain-improvements

# Development cycle
npm run dev          # Start development server
npm run test:watch   # Run tests in watch mode
npm run lint         # Check code quality
npm run type-check   # TypeScript validation

# Before commit
npm run test         # Full test suite
npm run build        # Production build test
npm run lint:fix     # Auto-fix linting issues

# Commit and push
git add .
git commit -m "feat(menu): implement nutrition calculator with real-time updates"
git push origin feature/menu-domain-improvements

# Create pull request
# → Code review → CI/CD pipeline → Merge to develop
```

### **Environment Setup**
```bash
# Development environment
cp .env.example .env.local
npm install
npm run db:push
npm run db:seed
npm run dev

# Required environment variables
DATABASE_URL="postgresql://..."
REDIS_URL="redis://localhost:6379"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"
WEBSOCKET_URL="ws://localhost:3001"
```

---

## 🔄 **Dashboard Integration Strategy: WebSocket & Redis dalam Header Utama**

### 📊 **Konsep Central Dashboard Control di Header**

Berdasarkan implementasi WebSocket dan Redis yang sudah ada, berikut adalah strategi optimal untuk memindahkan dashboard control ke header utama:

#### 🎯 **Vision: Global Live Status Header**
```typescript
interface GlobalHeaderStatus {
  // Real-time connection status
  websocketStatus: 'CONNECTED' | 'CONNECTING' | 'DISCONNECTED'
  redisStatus: 'CONNECTED' | 'SLOW' | 'DISCONNECTED'
  
  // Live activity indicators  
  activeUsers: number
  systemHealth: 'HEALTHY' | 'WARNING' | 'CRITICAL'
  
  // Notification center
  unreadNotifications: number
  criticalAlerts: number
  
  // Quick actions
  quickActions: HeaderAction[]
}
```

### 🏗️ **Architecture Decision: Header vs Dashboard Scope**

#### ✅ **Header Utama (Global Scope)** - RECOMMENDED
**Komponen yang SEBAIKNYA di Header**:
- **System Status Indicators** - WebSocket/Redis connection status
- **Real-time Notifications** - Critical alerts, system warnings
- **Global Quick Actions** - Emergency controls, broadcast messages
- **Live User Activity** - Current active users, concurrent sessions
- **Theme & Settings** - Dark mode, user preferences

```typescript
// src/components/shared/layouts/Header.tsx - ENHANCED
export function Header({ user, config }: HeaderProps) {
  // Global real-time status hooks
  const { websocketStatus, connectionInfo } = useWebSocketStatus()
  const { systemHealth, redisStatus } = useSystemHealthGlobal()
  const { notifications, criticalAlerts } = useGlobalNotifications()
  
  return (
    <header className="border-b bg-background">
      {/* Brand & Navigation */}
      <div className="flex items-center justify-between">
        {/* Left: Brand + Global Status */}
        <div className="flex items-center gap-4">
          <Brand />
          <GlobalStatusIndicator 
            websocketStatus={websocketStatus}
            systemHealth={systemHealth}
            redisStatus={redisStatus}
          />
        </div>
        
        {/* Right: Notifications + User Menu */}
        <div className="flex items-center gap-3">
          <LiveNotificationCenter 
            notifications={notifications}
            criticalAlerts={criticalAlerts}
          />
          <GlobalQuickActions user={user} />
          <UserMenu />
        </div>
      </div>
    </header>
  )
}
```

#### ❌ **Dashboard Page (Local Scope)** - TIDAK RECOMMENDED untuk Global Control
**Komponen yang TETAP di Dashboard**:
- **Dashboard-specific Period Controls** - Date range, time filters  
- **Dashboard-specific Filters** - Chart filters, view modes
- **Dashboard-specific Export** - Dashboard data export
- **Dashboard History Navigation** - View transitions, drill-downs

### � **Implementation Strategy: Modular Header Enhancement**

#### 1. **Global Status Components**
```typescript
// src/components/shared/layouts/components/GlobalStatusIndicator.tsx
interface GlobalStatusIndicatorProps {
  websocketStatus: 'CONNECTED' | 'CONNECTING' | 'DISCONNECTED'
  systemHealth: 'HEALTHY' | 'WARNING' | 'CRITICAL'  
  redisStatus: 'CONNECTED' | 'SLOW' | 'DISCONNECTED'
}

export function GlobalStatusIndicator({ 
  websocketStatus, 
  systemHealth, 
  redisStatus 
}: GlobalStatusIndicatorProps) {
  return (
    <div className="flex items-center gap-2">
      {/* Live Connection Status */}
      <StatusBadge
        status={websocketStatus}
        label="Live"
        icon={<Wifi className="h-3 w-3" />}
      />
      
      {/* System Health */}
      <StatusBadge
        status={systemHealth}
        label="System"
        icon={<Activity className="h-3 w-3" />}
      />
      
      {/* Cache Status */}
      <StatusBadge
        status={redisStatus}
        label="Cache"
        icon={<Database className="h-3 w-3" />}
      />
    </div>
  )
}
```

#### 2. **Live Notification Center**
```typescript
// src/components/shared/layouts/components/LiveNotificationCenter.tsx
export function LiveNotificationCenter({ 
  notifications, 
  criticalAlerts 
}: LiveNotificationCenterProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-4 w-4" />
          {criticalAlerts > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500">
              {criticalAlerts}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-96">
        <NotificationList 
          notifications={notifications}
          showCriticalFirst={true}
          realTimeUpdates={true}
        />
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
```

#### 3. **Global Quick Actions**
```typescript
// src/components/shared/layouts/components/GlobalQuickActions.tsx
export function GlobalQuickActions({ user }: GlobalQuickActionsProps) {
  const canBroadcast = hasPermission(user.userRole, 'BROADCAST_MESSAGE')
  const canEmergencyControl = hasPermission(user.userRole, 'EMERGENCY_CONTROL')
  
  return (
    <div className="flex items-center gap-1">
      {canBroadcast && (
        <Button variant="ghost" size="sm" onClick={openBroadcastModal}>
          <Radio className="h-4 w-4" />
        </Button>
      )}
      
      {canEmergencyControl && (
        <Button variant="ghost" size="sm" onClick={openEmergencyPanel}>
          <AlertTriangle className="h-4 w-4" />
        </Button>
      )}
      
      <Button variant="ghost" size="sm" onClick={openGlobalSettings}>
        <Settings className="h-4 w-4" />
      </Button>
    </div>
  )
}
```

### 🔌 **WebSocket & Redis Integration di Header**

#### Global Real-time Hooks
```typescript
// src/hooks/shared/useGlobalRealTime.ts
export function useGlobalRealTime() {
  const { websocketStatus, subscribe, unsubscribe } = useWebSocket()
  const { systemHealth } = useSystemHealth()
  const { notifications } = useGlobalNotifications()
  
  useEffect(() => {
    // Subscribe to global channels
    subscribe('system:health')
    subscribe('system:notifications') 
    subscribe('system:broadcasts')
    
    return () => {
      unsubscribe('system:health')
      unsubscribe('system:notifications')
      unsubscribe('system:broadcasts')
    }
  }, [])
  
  return {
    websocketStatus,
    systemHealth,
    notifications,
    isOnline: websocketStatus === 'CONNECTED'
  }
}
```

### 📱 **Responsive Strategy**

#### Desktop Header (Full Features)
```typescript
<Header className="hidden lg:flex">
  <GlobalStatusIndicator />
  <LiveNotificationCenter />
  <GlobalQuickActions />
  <SearchGlobal />
  <UserMenu />
</Header>
```

#### Mobile Header (Compact)
```typescript
<Header className="lg:hidden">
  <StatusIndicatorCompact />
  <NotificationBadge />
  <MobileMenu />
</Header>
```

### 🎯 **Decision Matrix: Header vs Dashboard**

| Feature | Header Global | Dashboard Local | Reasoning |
|---------|---------------|-----------------|-----------|
| **WebSocket Status** | ✅ YES | ❌ NO | Affects all pages, not just dashboard |
| **Redis Status** | ✅ YES | ❌ NO | System-wide cache status |
| **Critical Alerts** | ✅ YES | ❌ NO | Emergency notifications need global visibility |
| **Period Controls** | ❌ NO | ✅ YES | Dashboard-specific time filtering |  
| **Export Dashboard** | ❌ NO | ✅ YES | Page-specific functionality |
| **Chart Filters** | ❌ NO | ✅ YES | Dashboard view customization |
| **Live User Count** | ✅ YES | ❌ NO | System-wide user activity |
| **Theme Toggle** | ✅ YES | ❌ NO | Global UI preference |

### 🔧 **Implementation Plan**

#### Phase 1: Header Enhancement (High Priority)
```typescript
// Enhanced Header Implementation
1. Global Status Indicators - WebSocket, Redis, System Health
2. Live Notification Center - Real-time alerts
3. Global Quick Actions - Emergency controls
4. Responsive mobile layout
```

#### Phase 2: Dashboard Refactor (Medium Priority)  
```typescript
// Dashboard-specific controls remain local
1. Period Controls - Date range selectors
2. Dashboard Filters - Chart customization
3. Export Functions - Data export
4. History Navigation - View management
```

#### Phase 3: Cross-Page Integration (Low Priority)
```typescript
// Extend global status to other pages
1. Menu page with header status
2. Production page with header status  
3. Inventory page with header status
4. Consistent UX across all SPPG modules
```

### 🚀 **Cross-Domain Real-Time Integration**

#### Menu Domain dengan Header Status
```typescript
// src/components/sppg/menu/MenuList.tsx
export function MenuList() {
  const { menus, isLoading } = useMenus()
  const { websocketStatus } = useGlobalRealTime() // From header
  
  return (
    <div className="space-y-4">
      {/* Real-time status indicator from header */}
      <div className="flex items-center justify-between">
        <h2>Menu Management</h2>
        <LiveStatusBadge 
          status={websocketStatus}
          label="Real-time sync"
        />
      </div>
      
      {/* Menu list with live updates */}
      <MenuGrid menus={menus} />
    </div>
  )
}
```

#### Global Notification Broadcasting
```typescript
// src/actions/sppg/menu.ts - Enhanced with global notifications
export async function createMenu(data: MenuInput) {
  try {
    const menu = await db.nutritionMenu.create({ data })
    
    // Local domain broadcast
    await redis.publish(`menu:updates:${sppgId}`, {
      type: 'MENU_CREATED',
      data: menu
    })
    
    // Global system broadcast
    await redis.publish('system:activity', {
      type: 'DOMAIN_ACTIVITY',
      domain: 'MENU',
      sppgId,
      message: `New menu "${menu.menuName}" created`
    })
    
    return { success: true, data: menu }
  } catch (error) {
    // Global error broadcast
    await redis.publish('system:alerts', {
      type: 'ERROR',
      domain: 'MENU',
      sppgId,
      severity: 'HIGH',
      message: 'Menu creation failed'
    })
    
    return { success: false, error: 'Failed to create menu' }
  }
}
```

---

**🎉 This comprehensive development guide provides everything needed to build the Menu domain following enterprise-grade standards, Pattern 2 architecture, real-time integration with WebSocket and Redis, and global header integration untuk system-wide monitoring!**