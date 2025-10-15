# Platform-Specific Deployment Configurations
# BERGIZI-ID Production Deployment Templates

## 🚀 Vercel Deployment (Recommended)

### Dashboard Settings:
```
Framework Preset: Next.js
Build Command: npm run build
Output Directory: (Leave Empty)
Install Command: npm ci
Development Command: npm run dev
Node.js Version: 18.x
```

### Environment Variables:
```bash
NEXTAUTH_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=your-super-secret-key-min-32-chars
DATABASE_URL=postgresql://user:pass@host:5432/db
REDIS_URL=redis://host:6379 (optional)
NODE_ENV=production
```

### Advanced Settings:
- Enable Edge Runtime: ❌ (We use Node.js runtime)
- Enable Experimental Features: ❌
- Functions Region: Singapore (sin1) for Indonesia

---

## 🌊 Netlify Deployment

### Build Settings:
```
Build Command: npm run build && npm run export
Publish Directory: out
Functions Directory: netlify/functions
```

### netlify.toml:
```toml
[build]
  command = "npm run build"
  publish = ".next"

[[plugins]]
  package = "@netlify/plugin-nextjs"

[build.environment]
  NODE_ENV = "production"
  NEXTAUTH_URL = "https://your-app.netlify.app"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200
```

---

## 🚂 Railway Deployment

### railway.json:
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "numReplicas": 1,
    "sleepApplication": false,
    "restartPolicyType": "ON_FAILURE"
  }
}
```

### Environment Variables:
```bash
PORT=3000
NEXTAUTH_URL=https://bergizi-id-production.up.railway.app
DATABASE_URL=${{Postgres.DATABASE_URL}}
REDIS_URL=${{Redis.REDIS_URL}}
```

---

## 🌊 DigitalOcean App Platform

### app.yaml:
```yaml
name: bergizi-id
services:
- name: web
  source_dir: /
  github:
    repo: puazgit/bergizi-id
    branch: main
  run_command: npm start
  build_command: npm run build
  environment_slug: node-js
  instance_count: 1
  instance_size_slug: professional-xs
  http_port: 3000
  routes:
  - path: /
  envs:
  - key: NODE_ENV
    value: production
  - key: NEXTAUTH_URL
    value: https://bergizi-id-xxxxx.ondigitalocean.app
databases:
- name: postgres-db
  engine: PG
  version: "14"
  size: db-s-1vcpu-1gb
```

---

## 🐳 Docker Deployment (Advanced)

### Dockerfile:
```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED 1

RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

### docker-compose.yml:
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - NEXTAUTH_URL=http://localhost:3000
      - DATABASE_URL=postgresql://postgres:password@postgres:5432/bergizi
    depends_on:
      - postgres
      - redis
    
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: bergizi
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
      
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

---

## 🔧 Platform Comparison

| Platform | Ease | Performance | Price | Best For |
|----------|------|-------------|-------|----------|
| **Vercel** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | Next.js apps, Global CDN |
| **Netlify** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | JAMstack, Static sites |
| **Railway** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | Full-stack, Databases |
| **DigitalOcean** | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | Custom setup, Scale |
| **Docker** | ⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐ | Custom infrastructure |

---

## ✅ Pre-Deployment Checklist

### Required:
- [ ] All environment variables set
- [ ] Database accessible from production
- [ ] Domain/subdomain configured
- [ ] SSL certificates (auto on most platforms)

### Recommended:
- [ ] Redis server configured (optional, has fallbacks)
- [ ] Email service configured (for auth)
- [ ] CDN setup for static assets
- [ ] Monitoring and error tracking
- [ ] Backup strategy for database

### Testing:
- [ ] Run `npm run deploy:validate`
- [ ] Test build locally: `npm run build && npm start`
- [ ] Verify all routes work
- [ ] Test authentication flow
- [ ] Check API endpoints
- [ ] Mobile responsiveness
- [ ] Performance audit (Lighthouse)

---

## 🚨 Critical: Publish Directory Setting

**For ALL Next.js SSR deployments:**

✅ **CORRECT:**
- Publish Directory: **`.` or `/` (empty/root)**
- Output Directory: **Leave Empty**

❌ **WRONG:**
- `out/` - Only for static export
- `dist/` - Not Next.js pattern
- `build/` - Not Next.js pattern
- `.next/` - Internal build files

**Why root directory?**
- Next.js SSR needs server functionality
- `.next/` contains server files
- `public/` contains static assets
- Server needs access to all files