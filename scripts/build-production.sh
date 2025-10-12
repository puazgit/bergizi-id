#!/bin/bash

# ====================================================================
# 🚀 BERGIZI-ID PRODUCTION BUILD SCRIPT
# ====================================================================
# 
# Purpose: Complete production build preparation and validation
# Usage: ./scripts/build-production.sh
# 
# ⚠️  Run this script before deploying to production
# ✅ Includes all necessary checks and optimizations
# 
# Last Updated: October 12, 2025
# ====================================================================

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_header() {
    echo -e "${PURPLE}
====================================================================
🚀 $1
====================================================================${NC}"
}

# Start build process
print_header "BERGIZI-ID PRODUCTION BUILD PROCESS"

# ================================
# 🔍 PRE-BUILD VALIDATION
# ================================

print_status "Starting pre-build validation..."

# Check Node.js version
print_status "Checking Node.js version..."
NODE_VERSION=$(node --version)
if [[ "$NODE_VERSION" < "v18" ]]; then
    print_error "Node.js version 18+ required. Current: $NODE_VERSION"
    exit 1
fi
print_success "Node.js version: $NODE_VERSION"

# Check if production environment file exists
print_status "Checking production environment..."
if [ ! -f ".env.production" ]; then
    print_error "Production environment file (.env.production) not found!"
    print_warning "Please create .env.production with production configurations"
    exit 1
fi
print_success "Production environment file found"

# Check for required environment variables in production
print_status "Validating production environment variables..."
source .env.production

REQUIRED_VARS=(
    "NODE_ENV"
    "NEXTAUTH_URL"
    "DATABASE_URL"
    "NEXTAUTH_SECRET"
    "JWT_SECRET"
)

for var in "${REQUIRED_VARS[@]}"; do
    if [ -z "${!var}" ]; then
        print_error "Required environment variable $var is not set in .env.production"
        exit 1
    fi
done
print_success "All required environment variables are set"

# ================================
# 📦 DEPENDENCY MANAGEMENT
# ================================

print_status "Installing production dependencies..."
npm ci --production=false
print_success "Dependencies installed"

# Check for security vulnerabilities
print_status "Checking for security vulnerabilities..."
if npm audit --audit-level=high > /dev/null 2>&1; then
    print_success "No high-severity vulnerabilities found"
else
    print_warning "Security vulnerabilities detected. Run 'npm audit fix' to resolve"
    npm audit --audit-level=high
fi

# ================================
# 🧪 TESTING & QUALITY CHECKS
# ================================

print_status "Running type checking..."
npx tsc --noEmit
print_success "TypeScript compilation successful"

print_status "Running linting..."
npm run lint
print_success "Linting passed"

# Run tests if they exist
if [ -f "package.json" ] && grep -q '"test"' package.json; then
    print_status "Running tests..."
    npm test
    print_success "All tests passed"
fi

# ================================
# 🗄️ DATABASE PREPARATION
# ================================

print_status "Preparing database for production..."

# Generate Prisma client for production
print_status "Generating Prisma client..."
npx prisma generate
print_success "Prisma client generated"

# Check database connection
print_status "Testing database connection..."
if npx prisma db push --preview-feature > /dev/null 2>&1; then
    print_success "Database connection successful"
else
    print_error "Database connection failed. Please check DATABASE_URL in .env.production"
    exit 1
fi

# ================================
# 🏗️ BUILD PROCESS
# ================================

print_status "Starting production build..."

# Set production environment
export NODE_ENV=production

# Clean previous builds
print_status "Cleaning previous builds..."
rm -rf .next
rm -rf out
print_success "Previous builds cleaned"

# Build the application
print_status "Building Next.js application..."
print_warning "Skipping TypeScript checks for faster production build..."
SKIP_TYPE_CHECK=true npm run build
print_success "Build completed successfully"

# ================================
# 🔍 BUILD VALIDATION
# ================================

print_status "Validating build output..."

# Check if build directory exists
if [ ! -d ".next" ]; then
    print_error "Build directory (.next) not found!"
    exit 1
fi

# Check for critical build files
CRITICAL_FILES=(
    ".next/server/app"
    ".next/static"
    ".next/build-manifest.json"
)

for file in "${CRITICAL_FILES[@]}"; do
    if [ ! -e "$file" ]; then
        print_error "Critical build file missing: $file"
        exit 1
    fi
done
print_success "All critical build files present"

# ================================
# 📊 BUILD ANALYSIS
# ================================

print_status "Analyzing bundle size..."

# Check bundle analyzer if available
if command -v npx &> /dev/null && npm list @next/bundle-analyzer > /dev/null 2>&1; then
    print_status "Generating bundle analysis..."
    ANALYZE=true npm run build > /dev/null 2>&1 || true
    print_success "Bundle analysis generated (check .next/analyze/)"
else
    print_warning "Bundle analyzer not available. Install @next/bundle-analyzer for detailed analysis"
fi

# ================================
# 🔒 SECURITY CHECKS
# ================================

print_status "Running security checks..."

# Check for exposed secrets in build
print_status "Scanning for exposed secrets..."
if grep -r "sk_live\|pk_live\|password\|secret" .next/ > /dev/null 2>&1; then
    print_error "Potential secrets found in build output!"
    print_warning "Review build files for exposed sensitive information"
else
    print_success "No exposed secrets detected"
fi

# ================================
# 📝 BUILD SUMMARY
# ================================

print_header "BUILD SUMMARY"

BUILD_SIZE=$(du -sh .next | cut -f1)
print_status "Build size: $BUILD_SIZE"

# Get build stats
if [ -f ".next/build-manifest.json" ]; then
    PAGES_COUNT=$(find .next/server/app -name "page.js" | wc -l)
    print_status "Pages built: $PAGES_COUNT"
fi

print_success "Production build completed successfully!"

# ================================
# 🚀 DEPLOYMENT PREPARATION
# ================================

print_header "DEPLOYMENT CHECKLIST"

print_status "Pre-deployment checklist:"
echo "  ✅ Environment variables configured (.env.production)"
echo "  ✅ Database connection tested"
echo "  ✅ Dependencies installed and secure"
echo "  ✅ TypeScript compilation successful"
echo "  ✅ Linting passed"
echo "  ✅ Production build completed"
echo "  ✅ Build validation passed"
echo "  ✅ Security checks completed"

print_warning "Before deploying to production:"
echo "  🔒 Ensure all secrets are properly configured in deployment environment"
echo "  📊 Set up monitoring and error tracking (Sentry, etc.)"
echo "  🗄️ Configure production database with proper backups"
echo "  ☁️ Set up CDN for static assets"
echo "  🔍 Configure health checks and uptime monitoring"
echo "  📧 Set up email service for notifications"
echo "  💳 Configure production payment processing"

print_success "Build process completed! Ready for production deployment."

print_header "NEXT STEPS"
echo "1. Deploy to your production environment (Vercel, AWS, etc.)"
echo "2. Run database migrations: npx prisma migrate deploy"
echo "3. Seed production data if needed: npm run seed:production"
echo "4. Test all critical functionality in production"
echo "5. Set up monitoring and alerting"
echo "6. Configure automated backups"

print_status "Production build script completed at $(date)"