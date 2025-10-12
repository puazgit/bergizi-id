#!/bin/bash

# ====================================================================
# 🏗️ BERGIZI-ID ENTERPRISE SETUP SCRIPT
# ====================================================================
# 
# 🚀 Purpose: Automated environment setup for Bergizi-ID platform
# 📋 Features: 
#   - Generate secure environment variables
#   - Validate configuration
#   - Setup development services
#   - Database initialization
# 
# Usage: ./scripts/setup-env.sh [environment]
# Environments: development, staging, production
# ====================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
ENV_FILE="$ROOT_DIR/.env"
ENV_LOCAL_FILE="$ROOT_DIR/.env.local"

# Default environment
ENVIRONMENT=${1:-development}

echo -e "${BLUE}"
echo "======================================================================"
echo "🏗️  BERGIZI-ID ENTERPRISE ENVIRONMENT SETUP"
echo "======================================================================"
echo -e "${NC}"

# Function to generate random secret
generate_secret() {
    local length=${1:-32}
    openssl rand -base64 $length | tr -d '\n'
}

# Function to generate JWT secret
generate_jwt_secret() {
    openssl rand -base64 64 | tr -d '\n'
}

# Function to print status
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if running in correct directory
check_directory() {
    if [[ ! -f "$ROOT_DIR/package.json" ]] || [[ ! -f "$ROOT_DIR/prisma/schema.prisma" ]]; then
        print_error "This script must be run from the Bergizi-ID project root directory"
        exit 1
    fi
    print_status "Directory check passed"
}

# Check required dependencies
check_dependencies() {
    print_info "Checking required dependencies..."
    
    local missing_deps=()
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        missing_deps+=("Node.js (v18+)")
    fi
    
    # Check npm
    if ! command -v npm &> /dev/null; then
        missing_deps+=("npm")
    fi
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        missing_deps+=("Docker")
    fi
    
    # Check Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        missing_deps+=("Docker Compose")
    fi
    
    # Check openssl
    if ! command -v openssl &> /dev/null; then
        missing_deps+=("OpenSSL")
    fi
    
    if [[ ${#missing_deps[@]} -gt 0 ]]; then
        print_error "Missing required dependencies:"
        for dep in "${missing_deps[@]}"; do
            echo "  - $dep"
        done
        exit 1
    fi
    
    print_status "All dependencies are installed"
}

# Setup environment file
setup_environment() {
    print_info "Setting up environment for: $ENVIRONMENT"
    
    # Check if .env already exists
    if [[ -f "$ENV_FILE" ]]; then
        print_warning ".env file already exists"
        read -p "Do you want to overwrite it? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            print_info "Keeping existing .env file"
            return
        fi
    fi
    
    # Copy template
    if [[ -f "$ROOT_DIR/.env.example" ]]; then
        cp "$ROOT_DIR/.env.example" "$ENV_FILE"
        print_status "Copied .env.example to .env"
    else
        print_error ".env.example not found"
        exit 1
    fi
    
    # Generate secrets
    print_info "Generating secure secrets..."
    
    local nextauth_secret=$(generate_secret 32)
    local jwt_secret=$(generate_jwt_secret)
    local csrf_secret=$(generate_secret 32)
    
    # Replace secrets in .env file
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # MacOS
        sed -i '' "s/generate-with-openssl-rand-base64-32/$nextauth_secret/" "$ENV_FILE"
        sed -i '' "s/your-jwt-secret-minimum-32-characters/$jwt_secret/" "$ENV_FILE"
        sed -i '' "s/your-csrf-secret-key/$csrf_secret/" "$ENV_FILE"
    else
        # Linux
        sed -i "s/generate-with-openssl-rand-base64-32/$nextauth_secret/" "$ENV_FILE"
        sed -i "s/your-jwt-secret-minimum-32-characters/$jwt_secret/" "$ENV_FILE"
        sed -i "s/your-csrf-secret-key/$csrf_secret/" "$ENV_FILE"
    fi
    
    # Environment-specific configurations
    case "$ENVIRONMENT" in
        development)
            setup_development_env
            ;;
        staging)
            setup_staging_env
            ;;
        production)
            setup_production_env
            ;;
        *)
            print_error "Unknown environment: $ENVIRONMENT"
            exit 1
            ;;
    esac
    
    print_status "Environment configuration completed"
}

# Setup development environment
setup_development_env() {
    print_info "Configuring development environment..."
    
    # Create .env.local for development overrides
    if [[ -f "$ROOT_DIR/.env.local.example" ]]; then
        cp "$ROOT_DIR/.env.local.example" "$ENV_LOCAL_FILE"
        print_status "Created .env.local for development"
    fi
    
    # Update NODE_ENV
    if [[ "$OSTYPE" == "darwin"* ]]; then
        sed -i '' 's/NODE_ENV=development/NODE_ENV=development/' "$ENV_FILE"
    else
        sed -i 's/NODE_ENV=development/NODE_ENV=development/' "$ENV_FILE"
    fi
}

# Setup staging environment
setup_staging_env() {
    print_info "Configuring staging environment..."
    
    # Update NODE_ENV
    if [[ "$OSTYPE" == "darwin"* ]]; then
        sed -i '' 's/NODE_ENV=development/NODE_ENV=staging/' "$ENV_FILE"
    else
        sed -i 's/NODE_ENV=development/NODE_ENV=staging/' "$ENV_FILE"
    fi
    
    print_warning "Please update the following for staging:"
    echo "  - Database URLs"
    echo "  - Redis URLs"
    echo "  - API keys"
    echo "  - Domain names"
}

# Setup production environment
setup_production_env() {
    print_info "Configuring production environment..."
    
    # Update NODE_ENV
    if [[ "$OSTYPE" == "darwin"* ]]; then
        sed -i '' 's/NODE_ENV=development/NODE_ENV=production/' "$ENV_FILE"
    else
        sed -i 's/NODE_ENV=development/NODE_ENV=production/' "$ENV_FILE"
    fi
    
    print_warning "CRITICAL: Update all production values:"
    echo "  - Database URLs (production)"
    echo "  - Redis URLs (production)"
    echo "  - All API keys (production)"
    echo "  - Domain names (production)"
    echo "  - Email configuration"
    echo "  - Payment provider keys"
    echo "  - Storage credentials"
    echo "  - Monitoring keys"
}

# Validate environment
validate_environment() {
    print_info "Validating environment configuration..."
    
    if [[ ! -f "$ENV_FILE" ]]; then
        print_error ".env file not found"
        return 1
    fi
    
    # Check for placeholder values
    local placeholders=(
        "your-"
        "example.com"
        "localhost:5432"
        "username:password"
    )
    
    local has_placeholders=false
    for placeholder in "${placeholders[@]}"; do
        if grep -q "$placeholder" "$ENV_FILE"; then
            if [[ "$ENVIRONMENT" != "development" ]]; then
                print_warning "Found placeholder value: $placeholder"
                has_placeholders=true
            fi
        fi
    done
    
    if [[ "$has_placeholders" == true && "$ENVIRONMENT" != "development" ]]; then
        print_error "Please replace all placeholder values in .env before deploying to $ENVIRONMENT"
        return 1
    fi
    
    print_status "Environment validation completed"
}

# Setup Docker services
setup_docker_services() {
    if [[ "$ENVIRONMENT" == "development" ]]; then
        print_info "Setting up Docker services for development..."
        
        # Check if Docker is running
        if ! docker info &> /dev/null; then
            print_error "Docker is not running. Please start Docker and try again."
            return 1
        fi
        
        # Start development services
        print_info "Starting PostgreSQL and Redis..."
        cd "$ROOT_DIR"
        docker-compose up -d postgres redis
        
        # Wait for services to be ready
        print_info "Waiting for services to be ready..."
        sleep 10
        
        print_status "Docker services are running"
    fi
}

# Initialize database
initialize_database() {
    if [[ "$ENVIRONMENT" == "development" ]]; then
        print_info "Initializing database..."
        
        cd "$ROOT_DIR"
        
        # Generate Prisma client
        npm run db:generate
        
        # Run migrations
        npm run db:migrate
        
        # Seed database
        npm run db:seed
        
        print_status "Database initialized"
    fi
}

# Main execution
main() {
    echo -e "${BLUE}Environment: $ENVIRONMENT${NC}"
    echo
    
    check_directory
    check_dependencies
    setup_environment
    validate_environment
    setup_docker_services
    initialize_database
    
    echo
    echo -e "${GREEN}"
    echo "======================================================================"
    echo "🎉 SETUP COMPLETED SUCCESSFULLY!"
    echo "======================================================================"
    echo -e "${NC}"
    
    print_info "Next steps:"
    echo "  1. Review and update .env file with your actual credentials"
    echo "  2. Start the development server: npm run dev"
    echo "  3. Open http://localhost:3000 in your browser"
    
    if [[ "$ENVIRONMENT" != "development" ]]; then
        print_warning "For $ENVIRONMENT environment:"
        echo "  - Replace all placeholder values in .env"
        echo "  - Configure production services"
        echo "  - Set up monitoring and alerts"
        echo "  - Test all integrations"
    fi
    
    echo
    print_status "Bergizi-ID is ready for $ENVIRONMENT!"
}

# Run main function
main