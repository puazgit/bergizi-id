# Server Actions vs WebSocket API Routes - Architecture Analysis

**Date**: October 7, 2024  
**Issue**: Konflik arsitektur antara Server Actions dan WebSocket API routes  
**Status**: 🔍 **ARCHITECTURE ANALYSIS** - Evaluasi solusi optimal

---

## 🤔 Problem Statement

### Current Architecture Issue
Production domain menggunakan **mixed approach**:
- ✅ **Direct Prisma calls** dalam hooks (`useProductionService.ts`)
- ✅ **Server Actions** untuk beberapa domain lain (`menu.ts`, `procurement.ts`)  
- ❌ **WebSocket needs API routes** tapi production tidak menggunakan API routes

### Architecture Conflict
```typescript
// Production Hook - Direct Prisma approach
export function useCreateProduction() {
  return useMutation({
    mutationFn: (input: CreateProductionInput) => {
      // ❌ Direct Prisma call di client-side hook
      return createProduction(input, session.user.sppgId)  
    }
  })
}

// vs WebSocket - Needs API route
const wsUrl = `wss://${window.location.host}/api/ws`  // ❌ API route required
```

---

## 📊 Architecture Pattern Analysis

### Pattern 1: Direct Prisma in Hooks (Current Production)
```typescript
// ❌ PROBLEMATIC - Server code mixed with client hooks
async function createProduction(input: CreateProductionInput, sppgId: string) {
  // This runs on server but called from client hook
  const production = await db.foodProduction.create({ ... })
  return production
}

export function useCreateProduction() {
  return useMutation({
    mutationFn: (input) => createProduction(input, sppgId)  // Server call from client
  })
}
```

**Problems**:
- Server code mixed dengan client-side hooks
- Sulit untuk integrate dengan WebSocket (no API endpoints)
- Security concerns (direct DB access dari client)
- Tidak konsisten dengan Next.js best practices

### Pattern 2: Pure Server Actions (Menu/Procurement)  
```typescript
// ✅ CLEAN - Pure server actions
'use server'

export async function createMenuAction(input: CreateMenuInput) {
  const session = await auth()
  // ... validation & business logic
  const menu = await prisma.nutritionMenu.create({ ... })
  revalidatePath('/menu')
  return { success: true, data: menu }
}

// Client usage
const { mutate } = useMutation({
  mutationFn: createMenuAction  // Clean server action call
})
```

**Benefits**:
- Clean separation server/client
- Built-in security dengan auth()
- Type-safe dengan TypeScript
- Follows Next.js App Router patterns

**WebSocket Problem**:
- Server Actions tidak bisa handle WebSocket connections
- Perlu API route terpisah untuk WebSocket

### Pattern 3: API Routes (Traditional)
```typescript
// API Route: /app/api/production/route.ts
export async function POST(request: Request) {
  const session = await auth()
  const input = await request.json()
  // ... business logic
  return Response.json({ success: true, data: production })
}

// Client usage
const { mutate } = useMutation({
  mutationFn: (input) => fetch('/api/production', {
    method: 'POST',
    body: JSON.stringify(input)
  }).then(res => res.json())
})
```

**Benefits**:
- Consistent API endpoints
- Easy WebSocket integration (same route structure)
- RESTful approach
- Clear API documentation

**Drawbacks**:
- More boilerplate
- Manual serialization/deserialization
- Less type safety than Server Actions

---

## 🎯 Recommended Solutions

### Solution 1: Hybrid Approach (RECOMMENDED) ⭐⭐⭐⭐⭐

**Approach**: Keep Server Actions for mutations + Add API routes for real-time

```typescript
// 1. Convert production hooks to Server Actions
'use server'

export async function createProductionAction(input: CreateProductionInput) {
  const session = await auth()
  if (!session?.user?.sppgId) throw new Error('Unauthorized')
  
  // Business logic
  const production = await db.foodProduction.create({...})
  
  // ✅ Broadcast real-time update
  await redis.publish(`production:updates:${session.user.sppgId}`, JSON.stringify({
    type: 'production_created',
    data: production
  }))
  
  revalidatePath('/production')
  return { success: true, data: production }
}

// 2. Separate WebSocket API route
// /app/api/ws/route.ts
export async function GET(request: Request) {
  // WebSocket upgrade handling
  // Subscribe to Redis channels
  // Broadcast to connected clients
}
```

**Benefits**:
- ✅ Clean Server Actions untuk business logic
- ✅ Dedicated WebSocket handling
- ✅ Real-time broadcasting integrated dalam Server Actions
- ✅ Type safety + security
- ✅ Follows Next.js best practices

### Solution 2: Pure API Routes Approach ⭐⭐⭐⭐

**Approach**: Convert semua ke API routes untuk consistency

```typescript
// /app/api/production/route.ts - CRUD operations
export async function POST(request: Request) { ... }
export async function PUT(request: Request) { ... }

// /app/api/ws/route.ts - WebSocket handling  
export async function GET(request: Request) { ... }

// Hooks menggunakan fetch calls
const { mutate } = useMutation({
  mutationFn: (input) => fetch('/api/production', { ... })
})
```

**Benefits**:
- ✅ Consistent API approach
- ✅ Easy WebSocket integration
- ✅ RESTful architecture
- ✅ Clear API boundaries

**Drawbacks**:
- ❌ More boilerplate
- ❌ Loss of Server Actions type safety
- ❌ Manual serialization

### Solution 3: Server Actions + tRPC Bridge ⭐⭐⭐

**Approach**: Use tRPC untuk type-safe API + WebSocket

```typescript
// tRPC router dengan WebSocket support
export const productionRouter = router({
  create: protectedProcedure.input(createProductionSchema).mutation(...),
  onUpdate: protectedProcedure.subscription(...) // Real-time subscription
})

// Client usage - same as Server Actions but with WebSocket
const { mutate } = trpc.production.create.useMutation()
const subscription = trpc.production.onUpdate.useSubscription()
```

**Benefits**:
- ✅ Type safety
- ✅ Built-in real-time subscriptions
- ✅ Clean API design

**Drawbacks**:
- ❌ Additional dependency (tRPC)
- ❌ Learning curve
- ❌ Migration effort

---

## 🚀 Implementation Recommendation

### Phase 1: Minimal Change Approach (IMMEDIATE)

**Keep current production hooks + Add minimal WebSocket API**:

```typescript
// 1. Keep existing production hooks AS-IS
// src/components/sppg/production/hooks/useProductionService.ts
// (No changes to existing mutations)

// 2. Add dedicated WebSocket-only API route
// src/app/api/ws/route.ts
export async function GET(request: Request) {
  // ONLY handle WebSocket upgrade
  // Subscribe to Redis channels
  // Broadcast messages to clients
  // NO business logic here
}

// 3. Integrate broadcasting in existing hooks
async function createProduction(...) {
  const production = await db.foodProduction.create({...})
  
  // Add this line to existing functions
  await redis.publish(`production:updates:${sppgId}`, JSON.stringify({
    type: 'production_created',
    data: production
  }))
  
  return production
}
```

**Benefits**:
- ✅ Minimal code changes
- ✅ Real-time functionality works
- ✅ No breaking changes
- ✅ Quick implementation

### Phase 2: Long-term Architecture (FUTURE)

**Gradually migrate to pure Server Actions**:

1. Convert production hooks to Server Actions (one by one)
2. Add proper error handling and validation
3. Enhance WebSocket API with more features
4. Add real-time subscriptions untuk different events

---

## ⚡ Quick Implementation Guide

### Step 1: Add WebSocket API Route (30 minutes)
```typescript
// src/app/api/ws/route.ts
import { NextRequest } from 'next/server'
import { auth } from '@/auth'
import { redis } from '@/lib/redis'

export async function GET(request: NextRequest) {
  // WebSocket upgrade logic
  // Redis subscription setup
  // Message broadcasting
}
```

### Step 2: Add Broadcasting to Existing Hooks (15 minutes)
```typescript
// In existing production functions, add:
await redis.publish(`production:updates:${sppgId}`, message)
```

### Step 3: Test Real-time Functionality (15 minutes)
```typescript
// Test WebSocket connection
// Verify message broadcasting
// Check multi-tenant isolation
```

---

## 🎯 Answer to Your Question

**Question**: "Apakah akan ada masalah dengan websocket yang memerlukan API route?"

**Answer**: 
✅ **TIDAK ADA MASALAH** - WebSocket API route dapat coexist dengan Server Actions

**Explanation**:
1. **WebSocket hanya butuh 1 API route** (`/api/ws`) untuk connection upgrade
2. **Server Actions tetap bisa digunakan** untuk business logic
3. **Integration point**: Server Actions broadcast ke Redis → WebSocket API subscribe Redis → Forward ke clients
4. **No conflict**: Different responsibilities (business logic vs real-time communication)

**Recommended Architecture**:
```
Business Logic: Server Actions (existing)
         ↓ (broadcast via Redis)
Real-time Layer: WebSocket API Route (/api/ws)
         ↓ (push to connected clients)  
Client: WebSocket client (existing hooks)
```

This is actually a **CLEAN SEPARATION OF CONCERNS**! 🎉

---

**Status**: ✅ **FEASIBLE** - No architectural conflicts, minimal implementation needed