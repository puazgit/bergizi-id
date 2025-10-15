#!/bin/bash

# Bergizi-ID Deployment Validation Script
# Validates configuration before production deployment

echo "🔍 BERGIZI-ID DEPLOYMENT VALIDATION"
echo "===================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check functions
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
echo "1. 📦 Package Configuration"
echo "-------------------------"

# Check package.json scripts
if grep -q '"build": "next build' package.json; then
    check_item "Build script configured"
else
    check_item "Build script missing or incorrect"
fi

if grep -q '"start": "next start' package.json; then
    check_item "Start script configured"
else
    check_item "Start script missing or incorrect"
fi

echo ""
echo "2. 🔧 Next.js Configuration" 
echo "-------------------------"

# Check next.config.ts exists
if [ -f "next.config.ts" ] || [ -f "next.config.js" ]; then
    check_item "Next.js config file exists"
else
    check_item "Next.js config file missing"
fi

# Check for proper SSR configuration (no static export)
if grep -q "output.*['\"]export['\"]" next.config.* 2>/dev/null; then
    echo -e "❌ ${RED}Static export detected - WRONG for SSR${NC}"
    ((check_failed++))
else
    echo -e "✅ ${GREEN}SSR configuration (no static export)${NC}"
    ((check_passed++))
fi

echo ""
echo "3. 🗂️  Directory Structure"
echo "------------------------"

# Check critical directories
[ -d "src/app" ] && check_item "App directory exists" || check_item "App directory missing"
[ -d "prisma" ] && check_item "Prisma directory exists" || check_item "Prisma directory missing"
[ -f "prisma/schema.prisma" ] && check_item "Database schema exists" || check_item "Database schema missing"

echo ""
echo "4. 🌍 Environment Configuration"
echo "------------------------------"

# Check for environment files
[ -f ".env.example" ] && check_item "Environment example exists" || warn_item "No .env.example found"
[ -f ".env.production" ] && check_item "Production environment exists" || warn_item "No .env.production found"

# Check critical environment variables in .env.example or .env.production
if [ -f ".env.example" ] || [ -f ".env.production" ]; then
    ENV_FILE=""
    [ -f ".env.production" ] && ENV_FILE=".env.production" || ENV_FILE=".env.example"
    
    grep -q "NEXTAUTH_URL" "$ENV_FILE" && check_item "NEXTAUTH_URL configured" || check_item "NEXTAUTH_URL missing"
    grep -q "NEXTAUTH_SECRET" "$ENV_FILE" && check_item "NEXTAUTH_SECRET configured" || check_item "NEXTAUTH_SECRET missing"
    grep -q "DATABASE_URL" "$ENV_FILE" && check_item "DATABASE_URL configured" || check_item "DATABASE_URL missing"
fi

echo ""
echo "5. 🚀 Deployment Files"
echo "--------------------"

# Check deployment configuration files
[ -f "vercel.json" ] && info_item "Vercel config exists"
[ -f "netlify.toml" ] && info_item "Netlify config exists"
[ -f "railway.json" ] && info_item "Railway config exists"
[ -f "Dockerfile" ] && info_item "Docker config exists"

echo ""
echo "6. 📋 Build Test"
echo "---------------"

info_item "Testing production build..."
if npm run build > /dev/null 2>&1; then
    check_item "Production build successful"
else
    check_item "Production build failed"
    warn_item "Run 'npm run build' manually to see errors"
fi

echo ""
echo "7. 📊 Critical Deployment Settings"
echo "================================="

echo -e "${BLUE}✅ CORRECT DEPLOYMENT CONFIGURATION:${NC}"
echo ""
echo "📁 Publish Directory: ./ (empty/root)"
echo "🔨 Build Command: npm run build"
echo "▶️  Start Command: npm start"
echo "📦 Install Command: npm ci"
echo "🟢 Node Version: 18.x or 20.x"
echo "🌐 Framework: Next.js (SSR Mode)"
echo ""

echo -e "${RED}❌ DO NOT USE:${NC}"
echo "📁 out/ (static export only)"
echo "📁 dist/ (not Next.js pattern)"
echo "📁 build/ (not Next.js pattern)"
echo "📁 .next/ (internal build files)"
echo ""

echo "📈 SUMMARY"
echo "========="
echo -e "✅ Passed: ${GREEN}$check_passed${NC}"
echo -e "❌ Failed: ${RED}$check_failed${NC}"

if [ $check_failed -eq 0 ]; then
    echo -e "\n🎉 ${GREEN}DEPLOYMENT READY!${NC}"
    echo "Your application is configured correctly for production deployment."
else
    echo -e "\n⚠️  ${YELLOW}ISSUES FOUND!${NC}"
    echo "Please fix the failed checks before deploying to production."
fi

echo ""
echo "📚 For detailed deployment instructions, see DEPLOYMENT.md"
echo ""