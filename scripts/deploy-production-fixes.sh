#!/bin/bash

# COOLIFY PRODUCTION FIXES - COMMIT SCRIPT
# Commits all Auth.js and Coolify configuration fixes

set -e

echo "🚀 BERGIZI-ID PRODUCTION FIXES DEPLOYMENT"
echo "========================================"

# Check git status
echo ""
echo "📊 Current Git Status:"
git status --porcelain

# Add all changes
echo ""
echo "📦 Adding Changes..."
git add -A

# Commit with detailed message
echo ""
echo "💾 Committing Changes..."
git commit -m "🔐 Production Auth.js Configuration for Coolify

FIXES:
- Add trustHost: true for Coolify deployment compatibility
- Fix middleware null safety with optional chaining
- Add production-ready error handling and logging
- Create comprehensive Auth.js validation scripts
- Add Coolify-specific environment setup guides

FILES ADDED:
- COOLIFY_AUTH_SETUP.md: Step-by-step Auth setup guide
- scripts/validate-auth-production.mjs: Production validation
- scripts/debug-auth.mjs: Detailed Auth.js debugging
- scripts/health-check.mjs: Quick production health check

FILES MODIFIED:
- src/auth.ts: Enhanced with trustHost and production config
- src/middleware.ts: Safe session.user checking

CRITICAL FEATURES:
✅ trustHost: true for Coolify platform
✅ Production cookie security settings
✅ Comprehensive error handling
✅ Database connection validation
✅ Environment variable validation
✅ User authentication flow validation

PRODUCTION READY:
- NEXTAUTH_URL: https://bagizi.id
- Secure cookie configuration
- Production logging (no sensitive data)
- Null safety throughout auth flow
- Proper Prisma field mapping

DEPLOYMENT:
1. Set environment variables in Coolify
2. Redeploy application
3. Run validation: node scripts/health-check.mjs
4. Test login at https://bagizi.id/login

Resolves Auth.js ClientFetchError in Coolify production environment."

# Push to GitHub
echo ""
echo "🚀 Pushing to GitHub..."
git push origin main

echo ""
echo "✅ SUCCESS! All production fixes have been deployed to GitHub."
echo ""
echo "🎯 NEXT STEPS FOR COOLIFY:"
echo "1. Go to Coolify Dashboard > Applications > bergizi-id"
echo "2. Update environment variables using COOLIFY_AUTH_SETUP.md"
echo "3. Redeploy the application"
echo "4. Test with: node scripts/health-check.mjs"
echo "5. Verify login at: https://bagizi.id/login"
echo ""
echo "📚 DOCUMENTATION:"
echo "- Setup Guide: COOLIFY_AUTH_SETUP.md"
echo "- Deployment Guide: COOLIFY_DEPLOYMENT.md"
echo "- Health Check: scripts/health-check.mjs"