# Coolify Deployment Configuration
# BERGIZI-ID Production Deployment on Coolify

## 🚀 Coolify Configuration for bagizi.id

### 📋 **Deployment Settings**

#### **Basic Configuration:**
```
Domain: bagizi.id
Framework: Next.js
Build Command: npm run build
Start Command: npm start
Install Command: npm ci
Port: 3000
Node.js Version: 18.x or 20.x
```

#### **Repository Settings:**
```
Repository: https://github.com/puazgit/bergizi-id
Branch: main
Auto Deploy: ✅ Enabled (on git push)
Build Directory: ./
```

### 🌍 **Environment Variables Configuration**

#### **Critical Variables (REQUIRED):**
```bash
# Authentication
NEXTAUTH_URL=https://bagizi.id
NEXTAUTH_SECRET=your-super-secret-key-minimum-32-characters

# Database
DATABASE_URL=postgresql://username:password@host:5432/database_name

# Application
NODE_ENV=production
```

#### **Optional Variables:**
```bash
# Redis (Optional - has fallbacks)
REDIS_URL=redis://host:6379

# Email Service (Optional)
EMAIL_FROM=noreply@bagizi.id
EMAIL_SERVER_HOST=smtp.your-provider.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=your-email@bagizi.id
EMAIL_SERVER_PASSWORD=your-email-password
```

### 🐳 **Coolify-Specific Configuration**

#### **Build Configuration:**
```dockerfile
# Coolify will automatically detect Next.js
# Use these settings in Coolify dashboard:

Build Pack: nixpacks (auto-detected)
Install Command: npm ci
Build Command: npm run build
Start Command: npm start
Health Check: /api/system/health
```

#### **Resource Configuration:**
```
CPU: 0.5 - 1.0 vCPU (adjust based on traffic)
Memory: 512MB - 1GB RAM (minimum for Next.js)
Storage: 10GB SSD (sufficient for application)
```

### 🔧 **Network & SSL Configuration**

#### **Domain Setup:**
```
Primary Domain: bagizi.id
SSL Certificate: Auto (Let's Encrypt)
Force HTTPS: ✅ Enabled
HSTS: ✅ Enabled
```

#### **Subdomain Options:**
```
www.bagizi.id → redirect to bagizi.id
api.bagizi.id → API endpoints (if needed)
admin.bagizi.id → Admin interface (optional)
```

### 📊 **Database Configuration Options**

#### **Option 1: Coolify PostgreSQL Service**
```bash
# Create PostgreSQL service in Coolify
Service: PostgreSQL 15
Database Name: bergizi_production
Username: bergizi_user
Password: [auto-generated secure password]
```

#### **Option 2: External Database (Recommended)**
```bash
# Use managed database service
- Supabase PostgreSQL
- Railway PostgreSQL  
- DigitalOcean Managed Database
- AWS RDS PostgreSQL
```

### ⚡ **Performance Optimization**

#### **Coolify Settings:**
```
Auto Scale: ✅ Enable if available
Health Checks: /api/system/health
Restart Policy: unless-stopped
Log Retention: 7 days
```

#### **CDN Configuration:**
```
# Add Cloudflare in front of Coolify
Cloudflare → bagizi.id → Coolify Server
Benefits:
- Global CDN
- DDoS Protection  
- Better Performance for Indonesia
```

### 🔄 **Deployment Pipeline**

#### **Automatic Deployment Flow:**
```
1. git push origin main
2. Coolify detects changes
3. Automatic build starts
4. Health check passes
5. Traffic switches to new version
6. Old version cleaned up
```

#### **Manual Deployment:**
```bash
# Force redeploy in Coolify dashboard
1. Go to your application
2. Click "Deploy" button
3. Monitor build logs
4. Verify deployment success
```

### 🛡️ **Security Configuration**

#### **Essential Security Headers:**
```
# Coolify will handle basic security
# Additional headers can be configured in next.config.ts
```

#### **Firewall Rules:**
```
Allow: 80 (HTTP → HTTPS redirect)
Allow: 443 (HTTPS)
Allow: 22 (SSH for server management)
Block: All other ports
```

### 📋 **Post-Deployment Checklist**

#### **Immediate Verification:**
- [ ] Website loads at https://bagizi.id
- [ ] SSL certificate is valid
- [ ] Database connection works
- [ ] Authentication system works
- [ ] API endpoints respond correctly

#### **Performance Testing:**
- [ ] Page load times < 3 seconds
- [ ] Mobile responsiveness works
- [ ] All routes accessible
- [ ] Error pages display correctly

#### **Monitoring Setup:**
- [ ] Coolify monitoring enabled
- [ ] Application logs accessible
- [ ] Database performance monitoring
- [ ] Uptime monitoring configured

### 🚨 **Troubleshooting Common Issues**

#### **Build Failures:**
```bash
# Check build logs in Coolify
Common issues:
1. Environment variables missing
2. Database connection failed
3. Node.js version mismatch
4. Memory limits exceeded
```

#### **Runtime Errors:**
```bash
# Check application logs
Common issues:
1. NEXTAUTH_URL incorrect
2. Database timeout
3. Redis connection failed (should fallback)
4. Missing environment variables
```

### 📞 **Support Resources**

#### **Coolify Documentation:**
- [Coolify Docs](https://coolify.io/docs)
- [Next.js on Coolify](https://coolify.io/docs/applications/nextjs)

#### **Bergizi-ID Specific:**
- Run validation: `npm run deploy:validate`
- Check health: `https://bagizi.id/api/system/health`
- Monitor logs in Coolify dashboard

---

## 🎯 **Next Steps for Your Coolify Deployment**

1. **Verify Environment Variables** are set correctly
2. **Test Database Connection** from Coolify
3. **Configure Domain SSL** (should be automatic)
4. **Set up Monitoring** and alerts
5. **Test Complete Application Flow**

Your Bergizi-ID application should now be live at **https://bagizi.id** ! 🎉