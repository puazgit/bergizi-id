#!/bin/bash

# Bergizi-ID Coolify Deployment Validation
# Validates configuration specifically for Coolify platform

echo "🌊 COOLIFY DEPLOYMENT VALIDATION - BAGIZI.ID"
echo "============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

check_passed=0
check_failed=0

check_item() {
    if [ $? -eq 0 ]; then
        echo -e "✅ ${GREEN}$1${NC}"
        ((check_passed++))
    else
        echo -e "❌ ${RED}$1${NC}"
        ((check_failed++))
    fi
}

warn_item() {
    echo -e "⚠️  ${YELLOW}$1${NC}"
}

info_item() {
    echo -e "ℹ️  ${BLUE}$1${NC}"
}

echo ""
echo "1. 🚀 Coolify-Specific Configuration"
echo "===================================="

# Check for Next.js configuration suitable for Coolify
if [ -f "next.config.ts" ] || [ -f "next.config.js" ]; then
    check_item "Next.js configuration exists"
else
    check_item "Next.js configuration missing"
fi

# Check package.json scripts
if grep -q '"start": "next start' package.json; then
    check_item "Start script configured for Coolify"
else
    check_item "Start script missing or incorrect"
fi

if grep -q '"build": "next build' package.json; then
    check_item "Build script configured for Coolify"
else
    check_item "Build script missing or incorrect"
fi

echo ""
echo "2. 🌍 Domain Configuration (bagizi.id)"
echo "====================================="

# Check if NEXTAUTH_URL is configured for production domain
if [ -f ".env.production" ]; then
    if grep -q "bagizi.id\|NEXTAUTH_URL.*https://" .env.production; then
        check_item "Production domain configured in environment"
    else
        warn_item "Update NEXTAUTH_URL to https://bagizi.id"
    fi
else
    warn_item "Create .env.production with bagizi.id configuration"
fi

echo ""
echo "3. 🐳 Container & Build Configuration"
echo "===================================="

# Check for Dockerfile (optional for Coolify)
if [ -f "Dockerfile" ]; then
    info_item "Dockerfile found (optional for Coolify)"
else
    info_item "No Dockerfile (Coolify will use Nixpacks auto-detection)"
fi

# Check for .dockerignore
if [ -f ".dockerignore" ]; then
    info_item "Dockerignore configured"
else
    warn_item "Consider adding .dockerignore for better build performance"
fi

echo ""
echo "4. 📊 Database & External Services"
echo "================================="

# Check database configuration
if [ -f ".env.example" ] || [ -f ".env.production" ]; then
    ENV_FILE=""
    [ -f ".env.production" ] && ENV_FILE=".env.production" || ENV_FILE=".env.example"
    
    grep -q "DATABASE_URL" "$ENV_FILE" && check_item "Database URL configured" || check_item "Database URL missing"
    grep -q "REDIS_URL" "$ENV_FILE" && info_item "Redis configured (optional)" || info_item "Redis not configured (has fallbacks)"
fi

echo ""
echo "5. 🔧 Coolify Deployment Settings"
echo "================================="

info_item "Recommended Coolify Configuration:"
echo ""
echo -e "${BLUE}📋 Application Settings:${NC}"
echo "   • Framework: Next.js (auto-detected)"
echo "   • Build Command: npm run build"
echo "   • Start Command: npm start"
echo "   • Install Command: npm ci"
echo "   • Port: 3000"
echo "   • Node Version: 18.x or 20.x"
echo ""

echo -e "${BLUE}🌐 Domain Settings:${NC}"
echo "   • Domain: bagizi.id"
echo "   • SSL: Auto (Let's Encrypt)"
echo "   • Force HTTPS: ✅ Enable"
echo "   • WWW Redirect: www.bagizi.id → bagizi.id"
echo ""

echo -e "${BLUE}⚡ Resource Settings:${NC}"
echo "   • CPU: 0.5-1.0 vCPU"
echo "   • Memory: 512MB-1GB RAM"
echo "   • Storage: 10GB SSD"
echo "   • Health Check: /api/system/health"
echo ""

echo ""
echo "6. 🛡️ Security & Performance"
echo "============================"

# Check for security configurations
if grep -q "NEXTAUTH_SECRET" .env.* 2>/dev/null; then
    check_item "Authentication secret configured"
else
    check_item "NEXTAUTH_SECRET missing"
fi

echo ""
echo "7. 🔍 Pre-Deployment Test"
echo "========================"

info_item "Testing production build compatibility..."
if npm run build > /dev/null 2>&1; then
    check_item "Production build successful"
    
    # Check if build output is suitable for Coolify
    if [ -d ".next" ]; then
        check_item "Next.js build output generated"
    else
        check_item "Build output directory missing"
    fi
else
    check_item "Production build failed"
fi

echo ""
echo "8. 🌊 Coolify-Specific Recommendations"
echo "====================================="

echo -e "${GREEN}✅ COOLIFY DEPLOYMENT CHECKLIST:${NC}"
echo ""
echo "🔧 Application Configuration:"
echo "   □ Repository connected to GitHub"
echo "   □ Branch set to 'main'"
echo "   □ Auto-deploy enabled"
echo "   □ Build pack: Nixpacks (auto)"
echo ""
echo "🌍 Domain & SSL:"
echo "   □ Domain: bagizi.id configured"
echo "   □ SSL certificate: Auto (Let's Encrypt)"
echo "   □ Force HTTPS enabled"
echo "   □ Health check: /api/system/health"
echo ""
echo "💾 Database Setup:"
echo "   □ PostgreSQL service created OR"
echo "   □ External database connected"
echo "   □ DATABASE_URL environment variable set"
echo "   □ Database accessible from Coolify"
echo ""
echo "🔐 Environment Variables:"
echo "   □ NEXTAUTH_URL=https://bagizi.id"
echo "   □ NEXTAUTH_SECRET=[32+ character secret]"
echo "   □ DATABASE_URL=[postgresql connection string]"
echo "   □ NODE_ENV=production"
echo "   □ REDIS_URL=[optional, has fallbacks]"
echo ""

echo ""
echo "📈 VALIDATION SUMMARY"
echo "===================="
echo -e "✅ Passed: ${GREEN}$check_passed${NC}"
echo -e "❌ Failed: ${RED}$check_failed${NC}"

if [ $check_failed -eq 0 ]; then
    echo -e "\n🎉 ${GREEN}COOLIFY DEPLOYMENT READY!${NC}"
    echo "Your Bergizi-ID application is ready for Coolify deployment at bagizi.id"
else
    echo -e "\n⚠️  ${YELLOW}ISSUES FOUND!${NC}"
    echo "Please fix the failed checks before deploying to Coolify."
fi

echo ""
echo "🌊 Next Steps:"
echo "1. Complete Coolify dashboard configuration"
echo "2. Set all required environment variables"
echo "3. Deploy and monitor build logs"
echo "4. Test https://bagizi.id after deployment"
echo "5. Verify all application features work"
echo ""
echo "📚 See COOLIFY_DEPLOYMENT.md for detailed instructions"
echo ""