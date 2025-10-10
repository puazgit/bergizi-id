# Architecture Decision: Server Actions vs API Routes - Strategic Analysis

**Date**: October 7, 2024  
**Decision Required**: Menentukan arsitektur optimal untuk bergizi-id platform  
**Status**: 🎯 **STRATEGIC ANALYSIS** - Architecture recommendation

---

## 📊 Current Architecture Audit

### Pattern Analysis Berdasarkan Domain

#### 1. ✅ Menu Domain - **Server Actions Pattern**
```typescript
// Menu hooks menggunakan Server Actions
import { createMenu, updateMenu } from '@/actions/sppg/menu'

export function useCreateMenu() {
  return useMutation({
    mutationFn: async (data: CreateMenuInput) => {
      const result = await createMenu(data)  // ✅ Server Action call
      return result.data
    }
  })
}
```
**Status**: ✅ **Clean Server Actions implementation**

#### 2. ⚠️ Production Domain - **Direct Prisma Pattern**
```typescript
// Production hooks menggunakan direct Prisma calls
async function createProduction(input, sppgId) {
  const production = await db.foodProduction.create({...})  // ❌ Direct Prisma dalam client hook
  return production
}

export function useCreateProduction() {
  return useMutation({
    mutationFn: (input) => createProduction(input, sppgId)  // ❌ Server call dari client
  })
}
```
**Status**: ⚠️ **Anti-pattern - Server code dalam client hooks**

#### 3. ✅ Procurement Domain - **Server Actions Pattern**  
```typescript
// Procurement menggunakan Server Actions (dari audit sebelumnya)
import { createProcurement } from '@/actions/sppg/procurement'
```
**Status**: ✅ **Server Actions implementation**

#### 4. Mixed Patterns dalam Different Hooks
- **Menu**: Server Actions ✅
- **Production**: Direct Prisma ❌  
- **Procurement**: Server Actions ✅
- **Inventory**: Direct Prisma ❌ (based on file structure)
- **HRD**: Direct Prisma ❌ (based on file structure)
- **Distribution**: Direct Prisma ❌ (based on file structure)

---

## 🎯 Architecture Options Analysis

### Option 1: Full API Routes Approach ⭐⭐⭐⭐

**Approach**: Convert everything to RESTful API endpoints

```typescript
// API Routes structure
src/app/api/
├── sppg/
│   ├── menu/
│   │   ├── route.ts              // GET /api/sppg/menu
│   │   └── [id]/route.ts         // GET/PUT/DELETE /api/sppg/menu/[id]
│   ├── production/
│   │   ├── route.ts              // GET/POST /api/sppg/production
│   │   └── [id]/route.ts         // Production operations
│   ├── procurement/route.ts
│   ├── inventory/route.ts
│   └── distribution/route.ts
├── ws/route.ts                   // WebSocket for real-time
└── auth/[...nextauth]/route.ts   // Authentication

// Client usage
const { mutate } = useMutation({
  mutationFn: (data) => fetch('/api/sppg/production', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(res => res.json())
})
```

#### ✅ **Advantages:**
1. **Consistent Architecture**: All domains menggunakan same pattern
2. **Easy WebSocket Integration**: WebSocket coexists naturally dengan API routes
3. **RESTful Design**: Industry standard, easy documentation
4. **External Integrations**: Mobile apps, 3rd party integrations ready
5. **Clear API Boundaries**: Separation between frontend dan backend
6. **Caching Control**: Fine-grained HTTP caching control
7. **Middleware Support**: Easy authentication, rate limiting, logging
8. **Testing**: API endpoints dapat ditest independently
9. **Performance Monitoring**: API-level metrics dan observability
10. **Scalability**: Easy untuk horizontal scaling

#### ❌ **Disadvantages:**
1. **More Boilerplate**: Manual serialization/deserialization
2. **Type Safety**: Less type safety dibanding Server Actions
3. **Migration Effort**: Need to convert existing Server Actions
4. **Bundle Size**: Slightly larger client bundle
5. **Network Calls**: Every mutation requires network round-trip

#### 📊 **Implementation Effort**: 
- **High Initial**: Convert existing Server Actions (2-3 weeks)
- **Low Maintenance**: Standardized patterns, easy to maintain

---

### Option 2: Pure Server Actions Approach ⭐⭐⭐⭐⭐

**Approach**: Convert everything to Server Actions + separate WebSocket API

```typescript
// Server Actions structure  
src/actions/sppg/
├── menu.ts          // ✅ Already exists
├── production.ts    // Create new
├── procurement.ts   // ✅ Already exists  
├── inventory.ts     // Create new
├── distribution.ts  // Create new
└── hrd.ts          // Create new

// + WebSocket API route
src/app/api/ws/route.ts  // Only for real-time communication

// Client usage
import { createProduction } from '@/actions/sppg/production'

const { mutate } = useMutation({
  mutationFn: createProduction  // ✅ Direct Server Action call
})
```

#### ✅ **Advantages:**
1. **Type Safety**: Full TypeScript integration, compile-time safety
2. **Developer Experience**: Excellent DX with auto-completion
3. **Less Boilerplate**: No manual serialization needed
4. **Performance**: Direct server calls, no HTTP overhead
5. **Built-in Security**: Authentication baked into Server Actions
6. **Next.js Integration**: Perfect integration dengan App Router
7. **Caching**: Built-in caching dengan revalidatePath/revalidateTag
8. **Error Handling**: Seamless error propagation
9. **Streaming**: Support untuk Server Streaming
10. **Bundle Optimization**: Better code splitting

#### ❌ **Disadvantages:**
1. **WebSocket Separation**: Need separate API route untuk WebSocket
2. **External Integration**: Harder untuk mobile/3rd party apps
3. **Testing**: More complex integration testing
4. **Monitoring**: Less granular API-level monitoring
5. **Caching Control**: Limited HTTP caching options
6. **Documentation**: No automatic API documentation

#### 📊 **Implementation Effort**:
- **Medium**: Convert direct Prisma calls to Server Actions (1-2 weeks)
- **Low Maintenance**: Excellent DX, easy to maintain

---

### Option 3: Hybrid Approach (Current + Improvements) ⭐⭐⭐

**Approach**: Keep current mixed approach but standardize

```typescript
// Keep existing Server Actions for domains that have them
// Convert direct Prisma calls to Server Actions
// Add WebSocket API route separately

// Result: Mixed but consistent patterns
```

#### ✅ **Advantages:**
1. **Minimal Migration**: Keep what's working
2. **Gradual Improvement**: Incremental standardization
3. **Lower Risk**: No big architectural changes

#### ❌ **Disadvantages:**
1. **Inconsistent Architecture**: Multiple patterns dalam same app
2. **Maintenance Complexity**: Different patterns untuk different domains
3. **Developer Confusion**: Mixed approaches
4. **Technical Debt**: Leaves existing anti-patterns

---

## 🏆 Strategic Recommendation

### **RECOMMENDED: Option 2 - Pure Server Actions** ⭐⭐⭐⭐⭐

#### **Why Server Actions is Best untuk Bergizi-ID:**

1. **🎯 Perfect Fit untuk SaaS Platform**:
   - Enterprise-grade type safety
   - Built-in multi-tenant security
   - Excellent developer experience

2. **🚀 Performance Benefits**:
   - No HTTP serialization overhead
   - Better bundle optimization
   - Streaming support untuk large datasets

3. **🔒 Security Advantages**:
   - Authentication baked into actions
   - No exposed API endpoints
   - Automatic CSRF protection

4. **🛠️ Development Experience**:
   - Full TypeScript integration
   - Seamless error handling
   - Excellent debugging experience

5. **📈 Scalability**:
   - Built-in caching mechanisms
   - Perfect Next.js integration
   - Easy horizontal scaling

#### **WebSocket Integration Strategy:**
```typescript
// Server Actions untuk business logic
'use server'
export async function createProduction(input: CreateProductionInput) {
  // Business logic
  const production = await db.foodProduction.create({...})
  
  // Real-time broadcasting
  await redis.publish(`production:updates:${sppgId}`, JSON.stringify(production))
  
  return { success: true, data: production }
}

// Separate API route ONLY untuk WebSocket
// /app/api/ws/route.ts
export async function GET(request: Request) {
  // WebSocket upgrade handling
  // Subscribe to Redis channels  
  // Forward to connected clients
}
```

---

## 📋 Implementation Roadmap

### Phase 1: Standardize Current Architecture (Week 1-2)

#### High Priority: Convert Direct Prisma to Server Actions

1. **Production Domain** (Highest Impact):
```typescript
// Convert: src/components/sppg/production/hooks/useProductionService.ts
// From: Direct Prisma calls
// To: src/actions/sppg/production.ts - Server Actions

// Example conversion:
// Before (❌ Anti-pattern):
async function createProduction(input, sppgId) {
  const production = await db.foodProduction.create({...})
  return production
}

// After (✅ Server Action):
'use server'
export async function createProductionAction(input: CreateProductionInput) {
  const session = await auth()
  // ... validation & security
  const production = await db.foodProduction.create({...})
  revalidatePath('/production')
  return { success: true, data: production }
}
```

2. **Inventory Domain**:
   - Convert direct Prisma calls to Server Actions
   - Add proper validation dan security

3. **Distribution Domain**:
   - Convert to Server Actions pattern
   - Add real-time broadcasting integration

4. **HRD Domain**:
   - Convert to Server Actions
   - Integrate dengan authentication system

### Phase 2: Add Real-time Capabilities (Week 2)

```typescript
// Add WebSocket API route
// src/app/api/ws/route.ts

// Add broadcasting to Server Actions
// Each domain action broadcasts relevant events to Redis
```

### Phase 3: Enhancement & Optimization (Week 3-4)

1. **Performance Optimization**:
   - Add caching strategies
   - Optimize queries
   - Bundle optimization

2. **Security Hardening**:
   - Rate limiting
   - Input validation
   - Audit logging

3. **Developer Experience**:
   - Better error handling
   - Type safety improvements
   - Testing infrastructure

---

## 🎯 Migration Strategy

### Week 1: Foundation
- [ ] Create Server Action templates
- [ ] Convert Production domain (highest impact)
- [ ] Set up proper validation schemas

### Week 2: Core Domains  
- [ ] Convert Inventory domain
- [ ] Convert Distribution domain
- [ ] Add WebSocket API route
- [ ] Test real-time functionality

### Week 3: Remaining Domains
- [ ] Convert HRD domain  
- [ ] Convert Dashboard domain
- [ ] Integration testing

### Week 4: Polish & Deploy
- [ ] Performance optimization
- [ ] Security review
- [ ] Documentation
- [ ] Production deployment

---

## 🔄 Risk Mitigation

### Low Risk Migration:
1. **Gradual Conversion**: Convert one domain at a time
2. **Backward Compatibility**: Keep existing APIs during transition
3. **Feature Flags**: Enable new architecture gradually
4. **Rollback Plan**: Easy rollback strategy
5. **Testing**: Comprehensive testing at each step

### Success Metrics:
- [ ] **Performance**: Response times < 100ms
- [ ] **Type Safety**: Zero TypeScript errors
- [ ] **Real-time**: WebSocket functionality working
- [ ] **Security**: All actions properly authenticated
- [ ] **DX**: Developer productivity improved

---

## ✅ Final Recommendation

**Go with Server Actions Architecture** dengan strategic implementation:

### 🚀 **Short-term (2 weeks)**:
1. Convert direct Prisma calls to Server Actions
2. Add WebSocket API route for real-time
3. Standardize validation dan security

### 🎯 **Long-term Benefits**:
- Consistent, maintainable architecture
- Enterprise-grade type safety  
- Excellent developer experience
- Perfect Next.js integration
- Easy real-time capabilities

### 💡 **Key Insight**:
Server Actions + WebSocket API = **Best of Both Worlds**
- Business logic: Type-safe Server Actions
- Real-time: Dedicated WebSocket API route  
- Clean separation of concerns
- Maximum performance dan developer experience

**Implementation Effort**: Medium (2-3 weeks)  
**Long-term Value**: Very High ⭐⭐⭐⭐⭐  
**Risk Level**: Low (gradual migration)

---

**Decision**: ✅ **Proceed with Server Actions standardization + WebSocket integration**