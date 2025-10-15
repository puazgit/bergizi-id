# COOLIFY ENVIRONMENT VARIABLES TEMPLATE - BERGIZI-ID
# Copy each variable individually to Coolify Dashboard > Environment Variables

# =============================================================================
# CRITICAL VARIABLES (MUST BE SET FOR AUTH.JS TO WORK)
# =============================================================================

# Application Environment
NODE_ENV=production

# Authentication Configuration (EXACT MATCH REQUIRED)
NEXTAUTH_URL=https://bagizi.id

# Authentication Secret (MUST BE 32+ CHARACTERS)
# Generate with: openssl rand -base64 32
NEXTAUTH_SECRET=REPLACE_WITH_32_PLUS_CHARACTER_SECRET

# Database Connection (REPLACE WITH YOUR COOLIFY DATABASE CREDENTIALS)
DATABASE_URL=postgresql://bergizi_user:your_password@postgres:5432/bergizi_db

# =============================================================================
# OPTIONAL VARIABLES (RECOMMENDED FOR FULL FUNCTIONALITY)
# =============================================================================

# Redis Cache (Optional - app has fallbacks)
REDIS_URL=redis://redis:6379

# =============================================================================
# EXAMPLE SECURE VALUES (REPLACE WITH YOUR OWN)
# =============================================================================

# Example NEXTAUTH_SECRET (generate your own with openssl):
# NEXTAUTH_SECRET=abcdefghijklmnopqrstuvwxyz123456abcdefghijklmnop

# Example DATABASE_URL for Coolify PostgreSQL service:
# DATABASE_URL=postgresql://bergizi_admin:secure_password_123@postgres:5432/bergizi_production

# =============================================================================
# STEP-BY-STEP SETUP INSTRUCTIONS
# =============================================================================

# Step 1: Generate NEXTAUTH_SECRET
# Run in terminal: openssl rand -base64 32
# Copy the output and use it as NEXTAUTH_SECRET value

# Step 2: Get Database Credentials
# In Coolify Dashboard:
# - Go to Services > PostgreSQL
# - Copy the connection details
# - Format as: postgresql://user:password@host:port/database

# Step 3: Set Variables in Coolify
# - Go to Applications > bergizi-id > Environment Variables
# - Add each variable above with your actual values
# - Save and redeploy

# Step 4: Verify Setup
# - After redeploy, check application logs
# - Test login at https://bagizi.id/login
# - Run validation script: node scripts/validate-auth.mjs

# =============================================================================
# SECURITY NOTES
# =============================================================================

# 1. NEXTAUTH_SECRET must be unique and secure (32+ chars)
# 2. DATABASE_URL should use strong password
# 3. Never commit these values to git
# 4. Rotate NEXTAUTH_SECRET periodically for security
# 5. Use different secrets for different environments

# =============================================================================
# TROUBLESHOOTING
# =============================================================================

# Common Issues:
# - Auth error: Check NEXTAUTH_URL matches exact domain (no trailing slash)
# - Database error: Verify DATABASE_URL format and credentials
# - Login fails: Ensure database is seeded with users
# - HTTPS required: NEXTAUTH_URL must use https:// in production

# Validation Commands (run in Coolify terminal):
# node scripts/validate-auth.mjs  # Check auth configuration
# node scripts/list-users.mjs     # List database users
# npx prisma db pull              # Test database connection