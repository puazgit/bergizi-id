# Next.js Application Deployment Guide
# BERGIZI-ID Production Deployment Configuration

## 🚀 Platform-Specific Deployment Settings

### 1. **Vercel (Recommended)**
```bash
# Build Command
npm run build

# Output Directory  
./ 
# (Leave empty or "/" - Next.js SSR handles this automatically)

# Install Command
npm ci

# Root Directory
./

# Node.js Version
18.x or 20.x
```

### 2. **Netlify**
```bash
# Build Command
npm run build

# Publish Directory
./
# (Leave empty - Next.js will handle SSR routing)

# Functions Directory
.next/server/pages/api/

# Node.js Version  
18 or 20
```

### 3. **Railway**
```bash
# Build Command
npm run build

# Start Command
npm start

# Port Variable
PORT (automatically provided)

# Root Directory
./
```

### 4. **DigitalOcean App Platform**
```yaml
# app.yaml
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
  instance_size_slug: basic-xxs
  routes:
  - path: /
```

## 🔧 **Critical Configuration Requirements**

### Environment Variables (Production)
```bash
# Authentication
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your-super-secret-key

# Database
DATABASE_URL=postgresql://user:password@host:5432/database

# Redis (Optional - has fallbacks)
REDIS_URL=redis://host:6379

# Email (Optional)
EMAIL_FROM=noreply@your-domain.com
EMAIL_SERVER_HOST=smtp.your-provider.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=your-email@your-domain.com
EMAIL_SERVER_PASSWORD=your-email-password

# Other
NODE_ENV=production
```

### Package.json Scripts Verification
```json
{
  "scripts": {
    "build": "next build --turbopack",
    "start": "next start", 
    "dev": "next dev --turbopack"
  }
}
```

## ✅ **Deployment Checklist**

### Pre-Deployment
- [ ] Set all environment variables
- [ ] Database is accessible from production
- [ ] Redis setup (optional, has fallbacks)
- [ ] Domain DNS configured
- [ ] SSL certificates ready

### Build Configuration
- [ ] Output Directory: **Leave Empty** or **"/"**
- [ ] Build Command: `npm run build`
- [ ] Start Command: `npm start`
- [ ] Node.js Version: 18.x or 20.x
- [ ] Install Command: `npm ci`

### Post-Deployment
- [ ] Test all major routes
- [ ] Verify SSR functionality
- [ ] Check API endpoints
- [ ] Test authentication flow
- [ ] Monitor error logs
- [ ] Performance audit

## 🎯 **Platform-Specific Notes**

### **Vercel (Best for Next.js)**
- Automatic Next.js optimization
- Built-in CDN and edge functions
- Zero-config deployment
- Excellent performance

### **Netlify** 
- Good Next.js support with plugins
- May need additional configuration for SSR
- Built-in forms and identity

### **Railway**
- Docker-friendly
- Automatic deployments
- Good for full-stack apps
- Database hosting available

### **DigitalOcean**
- Full control over infrastructure
- Scalable containers
- Custom domains included
- Database clusters available

## 🚨 **Important: Publish Directory**

**For ALL Next.js SSR Applications:**
```
Publish Directory: ./ (empty or root)
```

**Why?**
- Next.js handles SSR routing internally
- Server needs access to .next/ build output
- Static export not used (we need server functionality)
- Framework manages file serving automatically

**Never use:**
- `out/` (static export only)
- `dist/` (not Next.js pattern) 
- `build/` (not Next.js pattern)
- `.next/` (internal build directory)