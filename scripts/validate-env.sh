#!/bin/bash

# ====================================================================
# 🔍 BERGIZI-ID ENVIRONMENT VALIDATION SCRIPT
# ====================================================================
# 
# Purpose: Validate environment configuration for security and completeness
# Usage: ./scripts/validate-env.sh [environment]
# ====================================================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
ENV_FILE="$ROOT_DIR/.env"
ENVIRONMENT=${1:-development}

echo -e "${BLUE}"
echo "======================================================================"
echo "🔍 BERGIZI-ID ENVIRONMENT VALIDATION"
echo "======================================================================"
echo -e "${NC}"

# Validation functions
print_status() { echo -e "${GREEN}✅ $1${NC}"; }
print_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
print_error() { echo -e "${RED}❌ $1${NC}"; }
print_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }

# Check if .env exists
check_env_file() {
    if [[ ! -f "$ENV_FILE" ]]; then
        print_error ".env file not found. Run ./scripts/setup-env.sh first"
        exit 1
    fi
    print_status ".env file exists"
}

# Load environment variables
load_env() {
    if [[ -f "$ENV_FILE" ]]; then
        export $(grep -v '^#' "$ENV_FILE" | xargs)
    fi
}

# Validate required variables
validate_required_vars() {
    print_info "Validating required environment variables..."
    
    local required_vars=(
        "NODE_ENV"
        "NEXTAUTH_URL"
        "NEXTAUTH_SECRET"
        "DATABASE_URL"
        "REDIS_URL"
        "JWT_SECRET"
    )
    
    local missing_vars=()
    
    for var in "${required_vars[@]}"; do
        if [[ -z "${!var}" ]]; then
            missing_vars+=("$var")
        fi
    done
    
    if [[ ${#missing_vars[@]} -gt 0 ]]; then
        print_error "Missing required environment variables:"
        for var in "${missing_vars[@]}"; do
            echo "  - $var"
        done
        return 1
    fi
    
    print_status "All required variables are set"
}

# Validate secret strength
validate_secrets() {
    print_info "Validating secret strength..."
    
    local weak_secrets=()
    
    # Check NEXTAUTH_SECRET
    if [[ ${#NEXTAUTH_SECRET} -lt 32 ]]; then
        weak_secrets+=("NEXTAUTH_SECRET (too short)")
    fi
    
    # Check JWT_SECRET
    if [[ ${#JWT_SECRET} -lt 32 ]]; then
        weak_secrets+=("JWT_SECRET (too short)")
    fi
    
    # Check for placeholder values
    if [[ "$NEXTAUTH_SECRET" == *"your-"* ]] || [[ "$NEXTAUTH_SECRET" == *"example"* ]]; then
        weak_secrets+=("NEXTAUTH_SECRET (placeholder value)")
    fi
    
    if [[ "$JWT_SECRET" == *"your-"* ]] || [[ "$JWT_SECRET" == *"example"* ]]; then
        weak_secrets+=("JWT_SECRET (placeholder value)")
    fi
    
    if [[ ${#weak_secrets[@]} -gt 0 ]]; then
        print_error "Weak or invalid secrets found:"
        for secret in "${weak_secrets[@]}"; do
            echo "  - $secret"
        done
        return 1
    fi
    
    print_status "All secrets are strong"
}

# Validate database connection
validate_database() {
    print_info "Validating database configuration..."
    
    # Check DATABASE_URL format
    if [[ ! "$DATABASE_URL" =~ ^postgresql:// ]]; then
        print_error "DATABASE_URL must start with postgresql://"
        return 1
    fi
    
    # Check for placeholder values
    if [[ "$DATABASE_URL" == *"username:password"* ]] || [[ "$DATABASE_URL" == *"localhost:5432"* ]]; then
        if [[ "$ENVIRONMENT" != "development" ]]; then
            print_warning "DATABASE_URL contains placeholder values"
        fi
    fi
    
    print_status "Database configuration looks good"
}

# Validate Redis connection
validate_redis() {
    print_info "Validating Redis configuration..."
    
    # Check REDIS_URL format
    if [[ ! "$REDIS_URL" =~ ^redis:// ]]; then
        print_error "REDIS_URL must start with redis://"
        return 1
    fi
    
    print_status "Redis configuration looks good"
}

# Validate email configuration
validate_email() {
    print_info "Validating email configuration..."
    
    if [[ -z "$EMAIL_PROVIDER" ]]; then
        print_warning "EMAIL_PROVIDER not set"
        return 1
    fi
    
    case "$EMAIL_PROVIDER" in
        SMTP)
            if [[ -z "$SMTP_HOST" ]] || [[ -z "$SMTP_PORT" ]]; then
                print_error "SMTP configuration incomplete"
                return 1
            fi
            ;;
        SENDGRID)
            if [[ -z "$SENDGRID_API_KEY" ]]; then
                print_error "SENDGRID_API_KEY not set"
                return 1
            fi
            ;;
        POSTMARK)
            if [[ -z "$POSTMARK_API_TOKEN" ]]; then
                print_error "POSTMARK_API_TOKEN not set"
                return 1
            fi
            ;;
        RESEND)
            if [[ -z "$RESEND_API_KEY" ]]; then
                print_error "RESEND_API_KEY not set"
                return 1
            fi
            ;;
    esac
    
    print_status "Email configuration is valid"
}

# Validate security settings
validate_security() {
    print_info "Validating security settings..."
    
    local security_issues=()
    
    # Check password policy
    if [[ ${PASSWORD_MIN_LENGTH:-0} -lt 8 ]]; then
        security_issues+=("PASSWORD_MIN_LENGTH should be at least 8")
    fi
    
    # Check bcrypt rounds
    if [[ ${BCRYPT_ROUNDS:-0} -lt 10 ]]; then
        security_issues+=("BCRYPT_ROUNDS should be at least 10")
    fi
    
    # Check rate limiting
    if [[ -z "$RATE_LIMIT_MAX" ]] || [[ ${RATE_LIMIT_MAX:-0} -gt 1000 ]]; then
        if [[ "$ENVIRONMENT" != "development" ]]; then
            security_issues+=("RATE_LIMIT_MAX should be set and reasonable")
        fi
    fi
    
    if [[ ${#security_issues[@]} -gt 0 ]]; then
        print_warning "Security recommendations:"
        for issue in "${security_issues[@]}"; do
            echo "  - $issue"
        done
    else
        print_status "Security settings are good"
    fi
}

# Environment-specific validation
validate_environment_specific() {
    print_info "Validating $ENVIRONMENT-specific settings..."
    
    case "$ENVIRONMENT" in
        production)
            validate_production
            ;;
        staging)
            validate_staging
            ;;
        development)
            validate_development
            ;;
    esac
}

# Production validation
validate_production() {
    local prod_issues=()
    
    # Check NODE_ENV
    if [[ "$NODE_ENV" != "production" ]]; then
        prod_issues+=("NODE_ENV should be 'production'")
    fi
    
    # Check debug settings
    if [[ "$ENABLE_DEBUG_MODE" == "true" ]]; then
        prod_issues+=("ENABLE_DEBUG_MODE should be false in production")
    fi
    
    # Check demo settings
    if [[ "$ENABLE_DEMO_MODE" == "true" ]]; then
        prod_issues+=("Consider disabling ENABLE_DEMO_MODE in production")
    fi
    
    # Check HTTPS
    if [[ ! "$NEXTAUTH_URL" =~ ^https:// ]]; then
        prod_issues+=("NEXTAUTH_URL should use HTTPS in production")
    fi
    
    if [[ ${#prod_issues[@]} -gt 0 ]]; then
        print_error "Production environment issues:"
        for issue in "${prod_issues[@]}"; do
            echo "  - $issue"
        done
        return 1
    fi
    
    print_status "Production settings are secure"
}

# Staging validation
validate_staging() {
    if [[ "$NODE_ENV" != "staging" ]]; then
        print_warning "NODE_ENV should be 'staging' for staging environment"
    fi
    print_status "Staging configuration validated"
}

# Development validation
validate_development() {
    if [[ "$NODE_ENV" != "development" ]]; then
        print_warning "NODE_ENV should be 'development' for development environment"
    fi
    print_status "Development configuration validated"
}

# Generate security report
generate_security_report() {
    print_info "Generating security report..."
    
    local report_file="$ROOT_DIR/security-report.txt"
    
    {
        echo "======================================================================"
        echo "🔒 BERGIZI-ID SECURITY REPORT"
        echo "======================================================================"
        echo "Generated: $(date)"
        echo "Environment: $ENVIRONMENT"
        echo ""
        
        echo "✅ PASSED CHECKS:"
        echo "- Environment file exists"
        echo "- Required variables are set"
        echo "- Secrets are strong"
        echo "- Database configuration is valid"
        echo "- Redis configuration is valid"
        echo ""
        
        echo "⚠️  RECOMMENDATIONS:"
        echo "- Regularly rotate secrets (every 90 days)"
        echo "- Monitor access logs"
        echo "- Enable 2FA for all external services"
        echo "- Use separate credentials for each environment"
        echo "- Review permissions quarterly"
        echo ""
        
        echo "🔧 NEXT STEPS:"
        echo "- Test all integrations"
        echo "- Set up monitoring and alerts"
        echo "- Configure backup procedures"
        echo "- Document deployment process"
        
    } > "$report_file"
    
    print_status "Security report generated: $report_file"
}

# Main execution
main() {
    echo -e "${BLUE}Validating environment: $ENVIRONMENT${NC}"
    echo
    
    check_env_file
    load_env
    
    local validation_failed=false
    
    validate_required_vars || validation_failed=true
    validate_secrets || validation_failed=true
    validate_database || validation_failed=true
    validate_redis || validation_failed=true
    validate_email || validation_failed=true
    validate_security
    validate_environment_specific || validation_failed=true
    
    if [[ "$validation_failed" == true ]]; then
        echo
        print_error "Validation failed! Please fix the issues above."
        exit 1
    fi
    
    generate_security_report
    
    echo
    echo -e "${GREEN}"
    echo "======================================================================"
    echo "🎉 ENVIRONMENT VALIDATION PASSED!"
    echo "======================================================================"
    echo -e "${NC}"
    
    print_status "Your Bergizi-ID environment is properly configured and secure!"
}

# Run main function
main