# 🏗️ Bergizi-ID SaaS Platform - Copilot Instructions

## 📊 Platform Overview

**Bergizi-ID** adalah **Enterprise-Grade SaaS Platform** modern dan professional untuk manajemen SPPG (Satuan Pelayanan Pemenuhan Gizi) dengan 3 layer:

> **🎯 Vision**: Membangun aplikasi **enterprise-level** yang scalable, secure, dan maintainable dengan standar industri terbaru untuk melayani ribuan SPPG di seluruh Indonesia.

### Layer 1: Marketing Website (Public)
- Landing pages & features showcase
- Blog, testimonials, case studies
- Lead capture & demo requests
- Routes: `/`, `/features`, `/pricing`, `/blog/*`, `/case-studies/*`

### Layer 2: SPPG Dashboard (Protected - Multi-tenant)
- **SPPG sebagai TENANT utama** (bukan "Customer")
- Full operational management: Menu → Procurement → Production → Distribution → Reporting
- Routes: `/dashboard/*`, `/menu/*`, `/procurement/*`, `/production/*`, `/distribution/*`
- Roles: `SPPG_ADMIN`, `SPPG_USER`, `SPPG_AHLI_GIZI`, etc.

### Layer 3: Platform Admin (Protected - Platform Management)
- Manage all SPPG tenants
- Subscription & billing management
- Platform analytics & monitoring
- Routes: `/admin/*`
- Role: `SUPERADMIN`, `PLATFORM_SUPPORT`

---

## 🎯 Enterprise-Grade Tech Stack

### Core Framework & Runtime
- **Framework**: Next.js 15+ (App Router) - Production-ready React framework
- **Runtime**: Node.js 18+ dengan Edge Runtime support
- **TypeScript**: Strict mode dengan enterprise-level type safety

### Authentication & Security
- **Authentication**: Auth.js v5 dengan enterprise multi-role system
- **Authorization**: RBAC (Role-Based Access Control) dengan fine-grained permissions
- **Security**: OWASP compliance, rate limiting, input sanitization
- **Audit Trail**: Comprehensive logging untuk compliance

### Database & Data Layer
- **Database**: PostgreSQL 15+ dengan connection pooling
- **ORM**: Prisma dengan enterprise migrations strategy
- **Caching**: Redis untuk session management & performance
- **Backup**: Automated daily backups dengan point-in-time recovery

### State Management & API
- **Client State**: Zustand dengan enterprise patterns
- **Server State**: TanStack Query (React Query) dengan optimistic updates
- **Validation**: Zod dengan enterprise validation rules
- **API**: RESTful dengan OpenAPI 3.0 documentation

### UI/UX & Design System
- **Styling**: Tailwind CSS dengan enterprise design tokens
- **Components**: Radix UI primitives dengan accessibility compliance
- **Dark Mode**: System-wide theme support dengan user preferences
- **Design System**: Consistent component library dengan Storybook
- **Responsive**: Mobile-first dengan enterprise dashboard layouts

### Architecture & Development
- **Architecture**: Domain-Driven Design (DDD) dengan clean architecture
- **Patterns**: Repository, Service Layer, CQRS untuk scalability
- **Code Quality**: ESLint + Prettier + Husky untuk enterprise standards
- **Testing**: Jest + Testing Library + Playwright untuk E2E
- **Documentation**: JSDoc + TypeDoc untuk API documentation

### DevOps & Production
- **Deployment**: Vercel Pro atau AWS dengan auto-scaling
- **Monitoring**: Real-time error tracking dengan Sentry
- **Analytics**: User behavior tracking dengan enterprise privacy
- **Performance**: Core Web Vitals optimization
- **CDN**: Global content delivery untuk Indonesia-wide access

---

## � Enterprise-Grade Development Principles

### Core Principles
1. **Scalability First**: Aplikasi harus dapat menangani 10,000+ concurrent users
2. **Security by Design**: Zero-trust architecture dengan multiple security layers
3. **Performance Optimized**: Sub-3 second loading times dengan optimized bundle sizes
4. **Accessibility Compliant**: WCAG 2.1 AA compliance untuk inclusive design
5. **Mobile-First**: Progressive Web App (PWA) dengan offline capabilities
6. **Data Privacy**: GDPR-compliant dengan comprehensive data protection

### Enterprise Quality Standards
```typescript
// Code Quality Metrics
const enterpriseStandards = {
  testCoverage: '>=90%',           // Minimum test coverage
  typeScriptStrict: true,         // No any types allowed
  performanceScore: '>=95',       // Lighthouse performance score
  accessibilityScore: '>=95',     // WCAG compliance score
  bundleSize: '<500KB',           // Initial bundle size limit
  loadTime: '<3s',                // First contentful paint
  errorRate: '<0.1%',             // Production error rate
  uptime: '99.9%'                 // Service level agreement
}
```

### Enterprise Development Workflow
```bash
# Development Pipeline
1. Feature Branch → Development
2. Code Review → Quality Gates
3. Automated Testing → CI/CD
4. Staging Deployment → QA
5. Production Deployment → Monitoring

# Quality Gates
- ✅ TypeScript compilation with zero errors
- ✅ ESLint + Prettier formatting
- ✅ Unit tests (>=90% coverage)
- ✅ Integration tests passing
- ✅ E2E tests in staging
- ✅ Security vulnerability scan
- ✅ Performance budget check
- ✅ Accessibility audit
```

### Enterprise Monitoring & Observability
```typescript
// Production Monitoring Stack
const monitoring = {
  errorTracking: 'Sentry',        // Real-time error monitoring
  performance: 'Web Vitals',      // Core performance metrics  
  uptime: 'Pingdom/UptimeRobot',  // Service availability
  analytics: 'Vercel Analytics',   // User behavior insights
  logging: 'Structured JSON',      // Centralized log management
  alerts: 'Slack/Email',          // Real-time incident alerts
  dashboards: 'Grafana/DataDog'   // Executive reporting
}
```

---

## �🏗️ Modular Architecture Patterns

### Domain-Driven Design (DDD)
Setiap domain memiliki struktur modular yang konsisten:

```
src/domains/{domain_name}/
├── components/          # Domain-specific UI components
│   ├── {Domain}List.tsx
│   ├── {Domain}Form.tsx
│   ├── {Domain}Card.tsx
│   └── index.ts        # Export barrel
├── hooks/              # Domain-specific hooks
│   ├── use{Domain}.ts
│   ├── use{Domain}List.ts
│   └── index.ts
├── services/           # Business logic layer
│   ├── {domain}Service.ts
│   ├── {domain}Calculator.ts
│   └── index.ts
├── repositories/       # Data access layer
│   ├── {domain}Repository.ts
│   └── index.ts
├── validators/         # Domain validation schemas
│   ├── {domain}Schema.ts
│   └── index.ts
├── types/              # Domain-specific types
│   ├── {domain}.types.ts
│   └── index.ts
└── utils/              # Domain utilities
    ├── {domain}Utils.ts
    └── index.ts
```

### Component Hierarchy & Dark Mode Support
```
components/
├── ui/                 # Base UI primitives with theme variants
│   ├── button.tsx      # cn(baseStyles, darkMode && darkStyles)
│   ├── card.tsx        # Auto dark mode support
│   ├── input.tsx       # Theme-aware inputs
│   └── theme-toggle.tsx
├── shared/             # Cross-domain reusable components
│   ├── layouts/
│   │   ├── AppLayout.tsx        # Main app shell
│   │   ├── SppgLayout.tsx       # SPPG-specific layout
│   │   └── AdminLayout.tsx      # Admin-specific layout
│   ├── navigation/
│   │   ├── Sidebar.tsx          # Theme-aware navigation
│   │   ├── Breadcrumb.tsx
│   │   └── UserMenu.tsx
│   └── data-display/
│       ├── DataTable.tsx        # Generic table with dark mode
│       ├── StatsCard.tsx        # Metrics display
│       └── Charts/              # Chart components
├── sppg/               # SPPG domain modules
└── admin/              # Admin domain modules
```

### Service Layer Pattern
```typescript
// src/domains/menu/services/menuService.ts
export class MenuService {
  constructor(
    private menuRepository: MenuRepository,
    private nutritionCalculator: NutritionCalculator,
    private costCalculator: CostCalculator
  ) {}

  async createMenu(input: MenuInput, sppgId: string): Promise<ServiceResult<Menu>> {
    // 1. Validation
    const validated = menuSchema.safeParse(input)
    if (!validated.success) {
      return ServiceResult.error('Validation failed')
    }

    // 2. Business logic
    const nutrition = await this.nutritionCalculator.calculate(input.ingredients)
    const cost = await this.costCalculator.calculate(input.ingredients, sppgId)

    // 3. Create entity
    const menu = await this.menuRepository.create({
      ...validated.data,
      nutrition,
      cost,
      sppgId
    })

    return ServiceResult.success(menu)
  }
}
```

### Repository Pattern
```typescript
// src/domains/menu/repositories/menuRepository.ts
export class MenuRepository {
  constructor(private db: PrismaClient) {}

  async findBySppgId(sppgId: string): Promise<Menu[]> {
    return this.db.nutritionMenu.findMany({
      where: {
        program: {
          sppgId
        }
      },
      include: {
        program: true,
        ingredients: {
          include: {
            inventoryItem: true
          }
        }
      }
    })
  }

  async create(data: CreateMenuData): Promise<Menu> {
    return this.db.nutritionMenu.create({
      data,
      include: {
        program: true,
        ingredients: {
          include: {
            inventoryItem: true
          }
        }
      }
    })
  }
}
```

---

## 🌙 Dark Mode Implementation

### Theme Configuration
```typescript
// src/lib/theme.ts
export const themeConfig = {
  colors: {
    light: {
      primary: 'hsl(222.2 84% 4.9%)',
      secondary: 'hsl(210 40% 96%)',
      muted: 'hsl(210 40% 96%)',
      accent: 'hsl(210 40% 96%)',
      background: 'hsl(0 0% 100%)',
      foreground: 'hsl(222.2 84% 4.9%)',
      card: 'hsl(0 0% 100%)',
      border: 'hsl(214.3 31.8% 91.4%)',
    },
    dark: {
      primary: 'hsl(210 40% 98%)',
      secondary: 'hsl(217.2 32.6% 17.5%)',
      muted: 'hsl(217.2 32.6% 17.5%)',
      accent: 'hsl(217.2 32.6% 17.5%)',
      background: 'hsl(222.2 84% 4.9%)',
      foreground: 'hsl(210 40% 98%)',
      card: 'hsl(222.2 84% 4.9%)',
      border: 'hsl(217.2 32.6% 17.5%)',
    }
  }
}
```

### Dark Mode Components
```typescript
// src/components/ui/card.tsx
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'outlined' | 'elevated'
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          // Base styles
          'rounded-lg border bg-card text-card-foreground shadow-sm',
          // Dark mode automatically applied via CSS variables
          variant === 'outlined' && 'border-2',
          variant === 'elevated' && 'shadow-lg',
          className
        )}
        {...props}
      />
    )
  }
)
```

### Theme Provider Setup
```typescript
// src/components/ui/theme-provider.tsx
'use client'

import { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'dark' | 'light' | 'system'

type ThemeProviderState = {
  theme: Theme
  setTheme: (theme: Theme) => void
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('system')

  useEffect(() => {
    const root = window.document.documentElement
    root.classList.remove('light', 'dark')

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light'
      root.classList.add(systemTheme)
    } else {
      root.classList.add(theme)
    }
  }, [theme])

  return (
    <ThemeProviderContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeProviderContext.Provider>
  )
}
```

---

## 🌱 Prisma Seed Architecture

### Master Seed File
```typescript
// prisma/seed.ts
import { PrismaClient } from '@prisma/client'
import { seedSppg } from './seeds/sppg-seed'
import { seedUsers } from './seeds/user-seed'
import { seedNutrition } from './seeds/nutrition-seed'
import { seedInventory } from './seeds/inventory-seed'
import { seedProcurement } from './seeds/procurement-seed'
import { seedDemo } from './seeds/demo-seed'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  try {
    // 1. Core Platform Data
    console.log('📊 Seeding SPPG entities...')
    const sppgs = await seedSppg(prisma)

    console.log('👥 Seeding users and roles...')
    const users = await seedUsers(prisma, sppgs)

    // 2. Master Data
    console.log('🥗 Seeding nutrition data...')
    await seedNutrition(prisma)

    console.log('📦 Seeding inventory items...')
    await seedInventory(prisma, sppgs)

    // 3. Operational Data
    console.log('🛒 Seeding procurement data...')
    await seedProcurement(prisma, sppgs)

    // 4. Demo Data (Optional)
    if (process.env.SEED_DEMO_DATA === 'true') {
      console.log('🎭 Seeding demo data...')
      await seedDemo(prisma, sppgs)
    }

    console.log('✅ Database seeding completed successfully!')
  } catch (error) {
    console.error('❌ Error during seeding:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
```

### Partial Seed Files Structure
```typescript
// prisma/seeds/sppg-seed.ts
import { PrismaClient, Sppg } from '@prisma/client'

export async function seedSppg(prisma: PrismaClient): Promise<Sppg[]> {
  console.log('  → Creating SPPG entities...')

  const sppgs = await Promise.all([
    // Production SPPG
    prisma.sppg.upsert({
      where: { sppgCode: 'SPPG-JKT-001' },
      update: {},
      create: {
        sppgName: 'SPPG Jakarta Pusat',
        sppgCode: 'SPPG-JKT-001',
        address: 'Jl. MH Thamrin No. 1, Jakarta Pusat',
        phone: '021-12345678',
        email: 'jakarta.pusat@sppg.id',
        status: 'ACTIVE',
        subscriptionPlan: 'PROFESSIONAL',
        subscriptionStatus: 'ACTIVE',
        isDemoAccount: false,
        maxBeneficiaries: 10000,
        allowedFeatures: [
          'MENU_MANAGEMENT',
          'PROCUREMENT',
          'PRODUCTION',
          'DISTRIBUTION',
          'REPORTING',
          'ANALYTICS'
        ]
      }
    }),

    // Demo SPPG
    prisma.sppg.upsert({
      where: { sppgCode: 'DEMO-SPPG-001' },
      update: {},
      create: {
        sppgName: 'Demo SPPG',
        sppgCode: 'DEMO-SPPG-001',
        address: 'Demo Address',
        phone: '021-00000000',
        email: 'demo@sppg.id',
        status: 'ACTIVE',
        subscriptionPlan: 'TRIAL',
        subscriptionStatus: 'TRIAL',
        isDemoAccount: true,
        demoExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        demoMaxBeneficiaries: 100,
        demoAllowedFeatures: [
          'MENU_MANAGEMENT',
          'PROCUREMENT',
          'BASIC_REPORTING'
        ]
      }
    })
  ])

  console.log(`  ✓ Created ${sppgs.length} SPPG entities`)
  return sppgs
}
```

```typescript
// prisma/seeds/nutrition-seed.ts
import { PrismaClient } from '@prisma/client'

export async function seedNutrition(prisma: PrismaClient) {
  console.log('  → Creating nutrition reference data...')

  // Food categories
  const foodCategories = await Promise.all([
    prisma.foodCategory.upsert({
      where: { name: 'Protein Hewani' },
      update: {},
      create: {
        name: 'Protein Hewani',
        description: 'Sumber protein dari hewan'
      }
    }),
    prisma.foodCategory.upsert({
      where: { name: 'Protein Nabati' },
      update: {},
      create: {
        name: 'Protein Nabati',
        description: 'Sumber protein dari tumbuhan'
      }
    }),
    prisma.foodCategory.upsert({
      where: { name: 'Karbohidrat' },
      update: {},
      create: {
        name: 'Karbohidrat',
        description: 'Sumber energi utama'
      }
    })
  ])

  // Nutrition standards for different age groups
  await Promise.all([
    prisma.nutritionStandard.upsert({
      where: { 
        ageGroup_gender: {
          ageGroup: 'BALITA_2_5',
          gender: 'MALE'
        }
      },
      update: {},
      create: {
        ageGroup: 'BALITA_2_5',
        gender: 'MALE',
        calories: 1125,
        protein: 25,
        carbohydrates: 155,
        fat: 44,
        fiber: 16,
        calcium: 650,
        iron: 8,
        vitaminA: 400,
        vitaminC: 40
      }
    })
  ])

  console.log('  ✓ Created nutrition reference data')
}
```

### Seed Commands in package.json
```json
{
  "scripts": {
    "db:seed": "tsx prisma/seed.ts",
    "db:seed:demo": "SEED_DEMO_DATA=true tsx prisma/seed.ts",
    "db:seed:dev": "NODE_ENV=development tsx prisma/seed.ts",
    "db:reset": "prisma migrate reset --force && npm run db:seed"
  }
}
```

---

## 🔐 User Roles & Permissions

### Platform Level Roles
```typescript
SUPERADMIN           // Full platform access
PLATFORM_SUPPORT     // Customer support
PLATFORM_ANALYST     // Analytics only
```

### SPPG Level Roles (Tenant Users)
```typescript
// Management
SPPG_KEPALA         // Kepala SPPG - Full SPPG access
SPPG_ADMIN          // Administrator SPPG

// Operational
SPPG_AHLI_GIZI      // Ahli Gizi - Menu & nutrition
SPPG_AKUNTAN        // Akuntan - Financial
SPPG_PRODUKSI_MANAGER
SPPG_DISTRIBUSI_MANAGER
SPPG_HRD_MANAGER

// Staff
SPPG_STAFF_DAPUR
SPPG_STAFF_DISTRIBUSI
SPPG_STAFF_ADMIN
SPPG_STAFF_QC

// Limited
SPPG_VIEWER         // Read-only
DEMO_USER           // Demo account
```

### Marketing Level
```typescript
DEMO_REQUEST        // User requesting demo
PROSPECT            // Prospective customer
```

---

## 📁 Struktur Folder

```
bergizi-id/
├── src/
│   ├── app/
│   │   ├── (marketing)/          # Layer 1: Public
│   │   │   ├── page.tsx
│   │   │   ├── features/
│   │   │   ├── pricing/
│   │   │   ├── blog/
│   │   │   └── case-studies/
│   │   │
│   │   ├── (auth)/                # Authentication
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   └── demo-request/
│   │   │
│   │   ├── (sppg)/                # Layer 2: SPPG Operations
│   │   │   ├── dashboard/
│   │   │   ├── menu/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── create/
│   │   │   │   └── [id]/
│   │   │   ├── procurement/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── plan/
│   │   │   │   └── orders/
│   │   │   ├── production/
│   │   │   ├── distribution/
│   │   │   ├── inventory/
│   │   │   ├── hrd/
│   │   │   ├── reports/
│   │   │   └── settings/
│   │   │
│   │   ├── (admin)/               # Layer 3: Platform Admin
│   │   │   ├── admin/
│   │   │   ├── sppg/              # Manage all SPPG
│   │   │   ├── subscriptions/
│   │   │   ├── billing/
│   │   │   ├── analytics/
│   │   │   ├── demo-requests/
│   │   │   └── platform-settings/
│   │   │
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   ├── sppg/              # SPPG API routes
│   │   │   │   ├── menu/
│   │   │   │   ├── procurement/
│   │   │   │   └── distribution/
│   │   │   └── admin/             # Admin API routes
│   │   │
│   │   └── providers.tsx
│   │
│   ├── components/
│   │   ├── marketing/             # Marketing components
│   │   ├── sppg/                  # SPPG components (Modular Domain)
│   │   │   ├── menu/
│   │   │   │   ├── components/    # Menu-specific components
│   │   │   │   ├── hooks/         # Menu-specific hooks
│   │   │   │   ├── types/         # Menu-specific types
│   │   │   │   └── utils/         # Menu-specific utilities
│   │   │   ├── procurement/
│   │   │   │   ├── components/
│   │   │   │   ├── hooks/
│   │   │   │   ├── types/
│   │   │   │   └── utils/
│   │   │   ├── production/
│   │   │   ├── distribution/
│   │   │   ├── inventory/
│   │   │   └── common/            # Shared SPPG components
│   │   ├── admin/                 # Admin components (Modular Domain)
│   │   │   ├── sppg-management/
│   │   │   ├── analytics/
│   │   │   ├── billing/
│   │   │   └── platform-settings/
│   │   ├── shared/                # Cross-layer shared components
│   │   │   ├── layouts/           # Layout components
│   │   │   ├── navigation/        # Navigation components
│   │   │   ├── forms/             # Generic form components
│   │   │   ├── data-display/      # Tables, cards, etc.
│   │   │   └── feedback/          # Toasts, modals, etc.
│   │   └── ui/                    # UI primitives with dark mode
│   │       ├── button.tsx         # Dark mode variants
│   │       ├── card.tsx
│   │       ├── input.tsx
│   │       ├── select.tsx
│   │       ├── table.tsx
│   │       ├── modal.tsx
│   │       ├── toast.tsx
│   │       ├── theme-toggle.tsx   # Dark mode toggle
│   │       └── theme-provider.tsx # Dark mode provider
│   │
│   ├── lib/
│   │   ├── auth.ts                # Auth.js config
│   │   ├── db.ts                  # Prisma client
│   │   ├── permissions.ts         # RBAC logic
│   │   ├── theme.ts               # Theme configuration
│   │   └── utils.ts
│   │
│   ├── stores/                    # Zustand stores (Modular)
│   │   ├── theme/
│   │   │   └── themeStore.ts      # Dark mode state
│   │   ├── auth/
│   │   │   └── authStore.ts
│   │   ├── sppg/
│   │   │   ├── menuStore.ts
│   │   │   ├── procurementStore.ts
│   │   │   └── productionStore.ts
│   │   └── admin/
│   │       ├── adminStore.ts
│   │       └── analyticsStore.ts
│   │
│   ├── domains/                   # Domain-specific logic
│   │   ├── menu/
│   │   │   ├── services/          # Business logic
│   │   │   ├── repositories/      # Data access layer
│   │   │   └── validators/        # Domain validation
│   │   ├── procurement/
│   │   ├── production/
│   │   └── distribution/
│   │
│   ├── schemas/
│   │   ├── auth.ts
│   │   ├── menu.ts
│   │   ├── procurement.ts
│   │   ├── production.ts
│   │   ├── distribution.ts
│   │   ├── inventory.ts
│   │   └── subscription.ts
│   │
│   ├── hooks/
│   │   ├── theme/
│   │   │   └── useTheme.ts        # Dark mode hook
# Note: SPPG hooks are in components/sppg/{domain}/hooks/ following Pattern 2
│   │   └── admin/                 # Admin hooks
│   │       ├── useSppgs.ts
│   │       └── useSubscriptions.ts
│   │
│   ├── actions/
│   │   ├── sppg/                  # SPPG server actions
│   │   │   ├── menu.ts
│   │   │   ├── procurement.ts
│   │   │   └── distribution.ts
│   │   └── admin/                 # Admin server actions
│   │       └── sppg.ts
│   │
│   └── types/
│       ├── index.ts
│       ├── theme.ts               # Theme types
│       └── auth.ts                # Auth-specific types
│       # Note: Domain types are in components/sppg/{domain}/types/ following Pattern 2
│
├── prisma/
│   ├── schema.prisma
│   ├── seed.ts                    # Master seed file
│   └── seeds/                     # Partial seed files
│       ├── sppg-seed.ts          # SPPG entities
│       ├── user-seed.ts          # Users & roles
│       ├── nutrition-seed.ts     # Nutrition data
│       ├── inventory-seed.ts     # Inventory items
│       ├── procurement-seed.ts   # Procurement data
│       └── demo-seed.ts          # Demo data
└── middleware.ts
```

---

## 🔒 Multi-Tenancy Architecture

### SPPG sebagai Tenant
```typescript
// CRITICAL: Setiap query SPPG data HARUS filter by sppgId
const menus = await db.nutritionMenu.findMany({
  where: {
    program: {
      sppgId: session.user.sppgId  // MANDATORY!
    }
  }
})
```

### Data Isolation Rules
1. **SPPG User** hanya bisa akses data SPPG mereka sendiri
2. **SUPERADMIN** bisa akses semua SPPG data
3. **DEMO_USER** hanya akses demo SPPG dengan batasan fitur

---

## 📐 Coding Standards

### 1. Server Action Pattern (Multi-tenant Safe)

```typescript
'use server'

import { auth } from '@/lib/auth'
import { checkSppgAccess } from '@/lib/permissions'

export async function createMenu(data: MenuInput) {
  // 1. Authentication Check
  const session = await auth()
  if (!session?.user) {
    return { success: false, error: 'Unauthorized' }
  }

  // 2. Role Check
  if (!canManageMenu(session.user.userRole)) {
    return { success: false, error: 'Insufficient permissions' }
  }

  // 3. SPPG Access Check (CRITICAL FOR MULTI-TENANCY!)
  const sppg = await checkSppgAccess(session.user.sppgId)
  if (!sppg) {
    return { success: false, error: 'SPPG not found or access denied' }
  }

  // 4. Validation
  const validated = menuSchema.safeParse(data)
  if (!validated.success) {
    return { 
      success: false, 
      error: validated.error.errors[0].message 
    }
  }

  // 5. Business Logic with sppgId
  try {
    const menu = await db.nutritionMenu.create({
      data: {
        ...validated.data,
        program: {
          connect: {
            id: validated.data.programId
          }
        }
      },
      include: {
        program: {
          select: {
            sppgId: true
          }
        }
      }
    })

    // Verify created menu belongs to user's SPPG
    if (menu.program.sppgId !== session.user.sppgId) {
      await db.nutritionMenu.delete({ where: { id: menu.id } })
      return { success: false, error: 'Access violation' }
    }
    
    return { success: true, data: menu }
  } catch (error) {
    console.error('Create menu error:', error)
    return { success: false, error: 'Failed to create menu' }
  }
}
```

### 2. Multi-tenant Query Pattern

```typescript
// ✅ CORRECT: Always filter by sppgId
async function getMenus(session: Session) {
  return await db.nutritionMenu.findMany({
    where: {
      program: {
        sppgId: session.user.sppgId  // MANDATORY!
      }
    },
    include: {
      program: {
        select: {
          name: true,
          sppgId: true
        }
      }
    }
  })
}

// ❌ WRONG: Missing sppgId filter - SECURITY RISK!
async function getMenus() {
  return await db.nutritionMenu.findMany() // NO! This exposes all data!
}
```

### 3. Permission Check Helper

```typescript
// src/lib/permissions.ts
import { UserRole, PermissionType } from '@prisma/client'

const rolePermissions: Record<UserRole, PermissionType[]> = {
  // Platform Level
  PLATFORM_SUPERADMIN: ['ALL'],
  PLATFORM_SUPPORT: ['READ', 'REPORTS_VIEW'],
  PLATFORM_ANALYST: ['READ', 'ANALYTICS_VIEW'],

  // SPPG Management
  SPPG_KEPALA: [
    'READ', 'WRITE', 'DELETE', 'APPROVE',
    'MENU_MANAGE', 'PROCUREMENT_MANAGE', 
    'PRODUCTION_MANAGE', 'DISTRIBUTION_MANAGE',
    'FINANCIAL_MANAGE', 'HR_MANAGE'
  ],
  SPPG_ADMIN: [
    'READ', 'WRITE', 'MENU_MANAGE', 
    'PROCUREMENT_MANAGE', 'USER_MANAGE'
  ],

  // SPPG Operational
  SPPG_AHLI_GIZI: [
    'READ', 'WRITE', 'MENU_MANAGE', 
    'QUALITY_MANAGE'
  ],
  SPPG_AKUNTAN: [
    'READ', 'WRITE', 'FINANCIAL_MANAGE', 
    'PROCUREMENT_MANAGE'
  ],
  SPPG_PRODUKSI_MANAGER: [
    'READ', 'WRITE', 'PRODUCTION_MANAGE', 
    'QUALITY_MANAGE'
  ],
  SPPG_DISTRIBUSI_MANAGER: [
    'READ', 'WRITE', 'DISTRIBUTION_MANAGE'
  ],

  // SPPG Staff
  SPPG_STAFF_DAPUR: ['READ', 'PRODUCTION_MANAGE'],
  SPPG_STAFF_DISTRIBUSI: ['READ', 'DISTRIBUTION_MANAGE'],
  SPPG_STAFF_QC: ['READ', 'QUALITY_MANAGE'],
  
  // Limited
  SPPG_VIEWER: ['READ'],
  DEMO_USER: ['READ']
}

export function hasPermission(
  role: UserRole, 
  permission: PermissionType
): boolean {
  const permissions = rolePermissions[role] || []
  return permissions.includes('ALL') || permissions.includes(permission)
}

export function canManageMenu(role: UserRole): boolean {
  return hasPermission(role, 'MENU_MANAGE')
}

export function canManageProcurement(role: UserRole): boolean {
  return hasPermission(role, 'PROCUREMENT_MANAGE')
}

export async function checkSppgAccess(sppgId: string | null) {
  if (!sppgId) return null
  
  return await db.sppg.findFirst({
    where: {
      id: sppgId,
      status: 'ACTIVE'
    }
  })
}
```

### 4. Middleware Pattern (Multi-role Routing)

```typescript
// middleware.ts
import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'

export default auth((req) => {
  const { pathname } = req.nextUrl
  const session = req.auth

  // Public routes
  const isPublicRoute = 
    pathname === '/' ||
    pathname.startsWith('/features') ||
    pathname.startsWith('/pricing') ||
    pathname.startsWith('/blog') ||
    pathname.startsWith('/case-studies')

  // Auth routes
  const isAuthRoute = 
    pathname.startsWith('/login') ||
    pathname.startsWith('/register') ||
    pathname.startsWith('/demo-request')

  // Admin routes
  const isAdminRoute = pathname.startsWith('/admin')

  // SPPG routes
  const isSppgRoute = 
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/menu') ||
    pathname.startsWith('/procurement') ||
    pathname.startsWith('/production') ||
    pathname.startsWith('/distribution') ||
    pathname.startsWith('/inventory') ||
    pathname.startsWith('/hrd') ||
    pathname.startsWith('/reports')

  // Allow public routes
  if (isPublicRoute) {
    return NextResponse.next()
  }

  // Redirect to login if not authenticated
  if (!session && !isAuthRoute) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  // Redirect authenticated users away from auth pages
  if (session && isAuthRoute) {
    const redirectUrl = 
      session.user.userRole === 'PLATFORM_SUPERADMIN' 
        ? '/admin' 
        : '/dashboard'
    return NextResponse.redirect(new URL(redirectUrl, req.url))
  }

  // Check admin access
  if (isAdminRoute) {
    const isAdmin = 
      session?.user.userRole === 'PLATFORM_SUPERADMIN' ||
      session?.user.userRole === 'PLATFORM_SUPPORT' ||
      session?.user.userRole === 'PLATFORM_ANALYST'
    
    if (!isAdmin) {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }
  }

  // Check SPPG access
  if (isSppgRoute) {
    // Must have sppgId
    if (!session?.user.sppgId) {
      return NextResponse.redirect(new URL('/access-denied', req.url))
    }

    // Check if SPPG role
    const isSppgUser = session.user.userRole?.startsWith('SPPG_')
    if (!isSppgUser) {
      return NextResponse.redirect(new URL('/admin', req.url))
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
}
```

---

## 🎨 Component Naming Conventions

### By Layer
```typescript
// Marketing Layer
components/marketing/
  - Hero.tsx
  - PricingCard.tsx
  - TestimonialSlider.tsx

// SPPG Layer
components/sppg/
  - menu/MenuCard.tsx
  - menu/MenuForm.tsx
  - procurement/ProcurementTable.tsx
  - production/ProductionSchedule.tsx
  - distribution/DistributionMap.tsx

// Admin Layer
components/admin/
  - SppgTable.tsx
  - SubscriptionCard.tsx
  - PlatformAnalytics.tsx
```

### Database Model Naming
```typescript
// Your schema already follows this!
SPPG                     // Tenant entity
User                     // User with sppgId
NutritionProgram         // Belongs to SPPG
NutritionMenu            // Belongs to Program
Procurement              // Belongs to SPPG
FoodProduction           // Belongs to SPPG
FoodDistribution         // Belongs to SPPG
```

---

## 🔍 Key Business Logic Patterns

### Menu Planning Flow
```typescript
// 1. Create Nutrition Program (SPPG Level)
NutritionProgram → sppgId required

// 2. Create Menus for Program
NutritionMenu → programId → program.sppgId

// 3. Add Ingredients
MenuIngredient → menuId → connects to InventoryItem

// 4. Calculate Nutrition & Cost
MenuNutritionCalculation
MenuCostCalculation
```

### Procurement Flow
```typescript
// 1. Create Procurement Plan
ProcurementPlan → sppgId required

// 2. Create Procurement Orders
Procurement → sppgId + planId

// 3. Add Items
ProcurementItem → inventoryItemId

// 4. Update Inventory
StockMovement → automatic on procurement completion
```

### Production Flow
```typescript
// 1. Schedule Production
FoodProduction → sppgId + programId + menuId

// 2. Quality Control
QualityControl → productionId

// 3. Distribution
FoodDistribution → sppgId + productionId
```

---

## ⚡ Critical Security Rules

### ✅ DO (Enterprise Security)
- Always filter by `sppgId` for SPPG users with database-level isolation
- Check `session.user.sppgId` in every server action with JWT validation
- Use `checkSppgAccess()` helper with rate limiting protection
- Validate role permissions with fine-grained RBAC before operations
- Use Prisma `include` with ownership checks and field-level permissions
- Log all sensitive operations in `AuditLog` with tamper-proof timestamps
- Implement CSRF protection on all state-changing operations
- Use input sanitization and SQL injection prevention
- Apply rate limiting per user/IP with exponential backoff
- Encrypt sensitive data at rest with AES-256 encryption
- Use HTTPS everywhere with HSTS headers
- Implement proper session management with secure cookies

### ❌ DON'T (Security Violations)
- Don't trust any client-side data including `sppgId`
- Don't skip ownership verification or rely on client-side checks
- Don't expose other SPPG data to unauthorized users (data leakage)
- Don't allow privilege escalation or cross-tenant data access
- Don't use raw SQL without parameterization (SQL injection risk)
- Don't log sensitive data (PII, passwords, tokens) in plain text
- Don't expose internal errors or stack traces to end users
- Don't store secrets in client-side code or environment variables
- Don't implement authentication/authorization logic on the frontend
- Don't skip input validation or trust user-supplied data

### 🔒 Enterprise Compliance Requirements
```typescript
// Security Compliance Checklist
const complianceRequirements = {
  authentication: {
    mfa: true,                    // Multi-factor authentication
    sessionTimeout: '8 hours',    // Auto-logout for security
    passwordPolicy: 'Strong',     // Minimum 12 chars + complexity
    accountLockout: '5 attempts'  // Brute force protection
  },
  dataProtection: {
    encryption: 'AES-256',        // Data at rest encryption
    transmission: 'TLS 1.3',      // Data in transit encryption
    backups: 'Encrypted',         // Backup encryption
    retention: '7 years',         // Data retention policy
    rightToErasure: true          // GDPR compliance
  },
  auditTrail: {
    allUserActions: true,         // Complete audit log
    immutableLogs: true,          // Tamper-proof logging
    logRetention: '10 years',     // Compliance requirement
    realTimeAlerts: true          // Security incident detection
  },
  accessControl: {
    rbac: true,                   // Role-based access control
    principleOfLeastPrivilege: true, // Minimal permissions
    regularAccessReview: true,    // Quarterly access audit
    segregationOfDuties: true     // No single point of control
  }
}
```

---

## 📊 Example SPPG Component (Dark Mode Support)

```typescript
// src/components/sppg/menu/MenuCard.tsx
'use client'

import { type FC } from 'react'
import Link from 'next/link'
import { useDeleteMenu } from '@/hooks/sppg/useMenu'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface MenuCardProps {
  menu: {
    id: string
    menuName: string
    mealType: string
    servingSize: number
    calories: number
    protein: number
    costPerServing: number
    program: {
      name: string
    }
  }
  variant?: 'default' | 'compact'
}

export const MenuCard: FC<MenuCardProps> = ({ menu, variant = 'default' }) => {
  const { mutate: deleteMenu, isPending } = useDeleteMenu()

  const handleDelete = () => {
    if (confirm(`Hapus menu "${menu.menuName}"?`)) {
      deleteMenu(menu.id)
    }
  }

  return (
    <Card className={cn(
      'p-6 hover:shadow-lg transition-all duration-200',
      'dark:hover:shadow-xl dark:hover:shadow-primary/5',
      variant === 'compact' && 'p-4'
    )}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className={cn(
            'font-semibold text-foreground',
            variant === 'compact' ? 'text-lg' : 'text-xl'
          )}>
            {menu.menuName}
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            {menu.program.name} • {menu.mealType}
          </p>
        </div>
        <Badge 
          variant="secondary" 
          className="ml-4 bg-primary/10 text-primary dark:bg-primary/20"
        >
          {menu.servingSize}g
        </Badge>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
        <div className="space-y-1">
          <span className="text-muted-foreground">Kalori</span>
          <p className="font-semibold text-foreground">
            {menu.calories} kal
          </p>
        </div>
        <div className="space-y-1">
          <span className="text-muted-foreground">Protein</span>
          <p className="font-semibold text-foreground">
            {menu.protein}g
          </p>
        </div>
        <div className="space-y-1">
          <span className="text-muted-foreground">Biaya</span>
          <p className="font-semibold text-foreground">
            Rp {menu.costPerServing.toLocaleString()}
          </p>
        </div>
      </div>

      <div className="mt-6 flex gap-2">
        <Button asChild className="flex-1">
          <Link href={`/menu/${menu.id}`}>
            Lihat Detail
          </Link>
        </Button>
        <Button asChild variant="outline" size="sm">
          <Link href={`/menu/${menu.id}/edit`}>
            Edit
          </Link>
        </Button>
        <Button
          onClick={handleDelete}
          disabled={isPending}
          variant="outline"
          size="sm"
          className="border-destructive/30 text-destructive hover:bg-destructive/10 dark:border-destructive/50 dark:hover:bg-destructive/20"
        >
          {isPending ? 'Menghapus...' : 'Hapus'}
        </Button>
      </div>
    </Card>
  )
}
```

### Dark Mode UI Components Examples

```typescript
// src/components/ui/button.tsx (Dark Mode Support)
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90 dark:hover:bg-primary/80',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90 dark:hover:bg-destructive/80',
        outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground dark:border-border dark:hover:bg-accent/50',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80 dark:hover:bg-secondary/60',
        ghost: 'hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/30',
        link: 'text-primary underline-offset-4 hover:underline dark:text-primary-foreground'
      },
      size: {
        default: 'h-10 py-2 px-4',
        sm: 'h-9 px-3 rounded-md',
        lg: 'h-11 px-8 rounded-md',
        icon: 'h-10 w-10'
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'default'
    }
  }
)
```

```typescript
// src/components/shared/layouts/SppgLayout.tsx (Dark Mode Layout)
'use client'

import { useState } from 'react'
import { Sidebar } from '@/components/shared/navigation/Sidebar'
import { TopBar } from '@/components/shared/navigation/TopBar'
import { ThemeProvider } from '@/components/ui/theme-provider'
import { cn } from '@/lib/utils'

interface SppgLayoutProps {
  children: React.ReactNode
}

export function SppgLayout({ children }: SppgLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-background text-foreground">
        <div className="flex h-screen overflow-hidden">
          {/* Sidebar */}
          <Sidebar 
            open={sidebarOpen} 
            onOpenChange={setSidebarOpen}
            className="hidden lg:flex lg:flex-col lg:w-64"
          />

          {/* Mobile sidebar overlay */}
          {sidebarOpen && (
            <div 
              className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          {/* Main content area */}
          <div className="flex flex-1 flex-col overflow-hidden">
            <TopBar onMenuClick={() => setSidebarOpen(true)} />
            
            <main className={cn(
              'flex-1 overflow-y-auto',
              'bg-muted/30 dark:bg-background',
              'p-4 lg:p-6'
            )}>
              {children}
            </main>
          </div>
        </div>
      </div>
    </ThemeProvider>
  )
}
```

```typescript
// src/components/shared/navigation/ThemeToggle.tsx
'use client'

import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function ThemeToggle() {
  const { setTheme } = useTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme('light')}>
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('dark')}>
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('system')}>
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
```

---

## 🎯 Demo System Pattern

```typescript
// Demo SPPG has special flags
const demoSppg = await db.sppg.findFirst({
  where: {
    id: session.user.sppgId,
    isDemoAccount: true
  }
})

if (demoSppg) {
  // Check demo expiry
  if (demoSppg.demoExpiresAt && new Date() > demoSppg.demoExpiresAt) {
    return { success: false, error: 'Demo expired' }
  }

  // Check feature access
  if (!demoSppg.demoAllowedFeatures.includes(featureName)) {
    return { success: false, error: 'Feature not available in demo' }
  }

  // Check limits
  const beneficiaryCount = await db.schoolBeneficiary.count({
    where: {
      program: {
        sppgId: demoSppg.id
      }
    }
  })

  if (beneficiaryCount >= (demoSppg.demoMaxBeneficiaries || 100)) {
    return { 
      success: false, 
      error: 'Demo limit reached. Upgrade to continue.' 
    }
  }
}
```

---

## 📝 Code Generation Guidelines

When generating code for Bergizi-ID:

1. **Identify Layer**: Marketing / SPPG / Admin
2. **Check Role Requirements**: What roles can access this?
3. **Implement Multi-tenancy**: Always include `sppgId` filtering
4. **Follow Naming**: Use schema model names exactly
5. **Add Type Safety**: Use Prisma types + Zod validation
6. **Error Handling**: Return `{ success, data?, error? }`
7. **Audit Logging**: Log sensitive operations

---

## 🚀 Quick Reference

### Common Queries
```typescript
// Get current SPPG
const sppg = await db.sppg.findUnique({
  where: { id: session.user.sppgId }
})

// Get SPPG programs
const programs = await db.nutritionProgram.findMany({
  where: { sppgId: session.user.sppgId }
})

// Get program menus
const menus = await db.nutritionMenu.findMany({
  where: {
    program: {
      sppgId: session.user.sppgId
    }
  }
})

// Get SPPG inventory
const inventory = await db.inventoryItem.findMany({
  where: { sppgId: session.user.sppgId }
})
```

### Session Structure
```typescript
interface Session {
  user: {
    id: string
    email: string
    name: string
    userRole: UserRole
    sppgId: string | null  // CRITICAL FOR MULTI-TENANCY!
    userType: UserType
  }
}
```

---

## ✅ Validation Examples

```typescript
// src/schemas/menu.ts
import { z } from 'zod'
import { MealType } from '@prisma/client'

export const menuSchema = z.object({
  programId: z.string().cuid(),
  menuName: z.string().min(3, 'Nama menu minimal 3 karakter'),
  menuCode: z.string().min(2),
  mealType: z.nativeEnum(MealType),
  servingSize: z.number().min(1).max(1000),
  calories: z.number().min(0),
  protein: z.number().min(0),
  carbohydrates: z.number().min(0),
  fat: z.number().min(0),
  fiber: z.number().min(0),
  costPerServing: z.number().min(0)
})

export type MenuInput = z.infer<typeof menuSchema>
```

---

---

## ⚡ Enterprise Performance & Scalability

### Performance Optimization Strategy
```typescript
// Performance Budget & Metrics
const performanceBudget = {
  // Core Web Vitals (Enterprise SLA)
  firstContentfulPaint: '<1.5s',     // Critical rendering path
  largestContentfulPaint: '<2.5s',   // Main content visibility
  cumulativeLayoutShift: '<0.1',      // Visual stability
  firstInputDelay: '<100ms',          // Interactivity
  
  // Bundle Size Optimization
  initialBundle: '<300KB',            // First load bundle
  routeBundle: '<150KB',              // Route-based code splitting
  imageOptimization: 'WebP/AVIF',     // Next.js Image optimization
  
  // Database Performance
  queryTime: '<100ms',                // Average query response
  connectionPooling: true,            // Database connection reuse
  indexOptimization: true,            // Proper database indexing
  
  // Caching Strategy
  staticAssets: '1 year',             // CDN caching
  apiResponses: '5 minutes',          // API response caching
  databaseQueries: '1 minute'         // Query result caching
}
```

### Scalability Architecture
```typescript
// Enterprise Scaling Strategy
const scalabilityPlan = {
  horizontal: {
    loadBalancing: 'Auto-scaling',    // Handle traffic spikes
    multiRegion: 'Indonesia-focused', // Jakarta, Surabaya, Medan
    cdn: 'Global edge network',       // Fast content delivery
    microservices: 'Domain-based'     // Service decomposition
  },
  
  vertical: {
    databaseSharding: 'By SPPG',      // Data partitioning
    readReplicas: 'Multiple regions', // Read scaling
    connectionPooling: 'PgBouncer',   // Connection optimization
    caching: 'Redis Cluster'          // Distributed caching
  },
  
  monitoring: {
    realTimeMetrics: true,            // Live performance data
    predictiveScaling: true,          // AI-based scaling
    costOptimization: true,           // Resource efficiency
    alerting: 'Multi-channel'         // Proactive notifications
  }
}
```

### Enterprise Code Quality Standards
```typescript
// Code Quality Enforcement
const qualityGates = {
  // Static Analysis
  typescript: {
    strict: true,                     // No implicit any
    noUnusedLocals: true,            // Clean code
    noUnusedParameters: true,        // Parameter hygiene
    exactOptionalPropertyTypes: true  // Type precision
  },
  
  // Code Style
  eslint: {
    extends: ['@next/next', 'prettier'], // Industry standards
    rules: {
      'complexity': ['error', 10],    // Cyclomatic complexity
      'max-depth': ['error', 4],      // Nesting levels
      'max-lines-per-function': ['error', 50] // Function size
    }
  },
  
  // Testing Requirements
  testing: {
    unitTests: '>=90%',               // Line coverage
    integrationTests: 'All APIs',     // End-to-end coverage
    e2eTests: 'Critical paths',       // User journey testing
    mutationTesting: '>=80%'          // Test quality score
  },
  
  // Documentation
  documentation: {
    apiDocs: 'OpenAPI 3.0',           // API documentation
    codeComments: 'JSDoc standard',   // Inline documentation
    readmeDocs: 'Updated weekly',     // Project documentation
    architectureDocs: 'C4 Model'      // System architecture
  }
}
```

---

## 🎯 Enterprise Development Guidelines

**Dengan konteks enterprise-grade ini, GitHub Copilot akan:**
✅ Generate kode dengan enterprise security standards
✅ Implement performance optimization patterns
✅ Follow scalability best practices
✅ Apply comprehensive error handling
✅ Create accessible and inclusive UI components
✅ Generate production-ready, maintainable code
✅ Include proper monitoring and observability
✅ Follow enterprise compliance requirements
✅ Implement proper caching strategies
✅ Generate comprehensive test coverage
✅ Apply security-first development approach
✅ Create professional, consistent user experiences

**Enterprise-Ready SaaS Platform**: Bergizi-ID siap melayani ribuan SPPG dengan standar enterprise yang tinggi! 🚀

---

## 📐 Pattern 2 Architecture Notes

**CRITICAL: This project follows Pattern 2 (Component-Level Domain Architecture)**

### ✅ Correct Pattern 2 Structure:
```
components/sppg/{domain}/
├── components/     # Domain UI components
├── hooks/         # Domain-specific hooks
├── types/         # Domain-specific types  
└── utils/         # Domain utilities
```

### ❌ Avoid Centralized Pattern:
- ❌ `hooks/sppg/` - Use `components/sppg/{domain}/hooks/` instead
- ❌ `types/domains/` - Use `components/sppg/{domain}/types/` instead
- ❌ Cross-domain imports - Each domain is self-contained

### 🎯 Pattern 2 Benefits:
- **Self-contained domains** - Each domain has its own hooks/types/utils
- **No cross-dependencies** - Domains don't import from each other
- **Clear boundaries** - Business logic stays within domain
- **Scalable architecture** - Easy to add new domains independently

**Remember**: Always use component-level domain structure, never centralized SPPG folders!