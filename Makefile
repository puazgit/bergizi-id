# Bergizi-ID Docker Management
# Enterprise-grade Docker commands for development and production

.PHONY: help up down restart logs ps clean db-reset db-backup db-restore dev prod

# Colors for output
RED    := \033[31m
GREEN  := \033[32m
YELLOW := \033[33m
BLUE   := \033[34m
RESET  := \033[0m

# Default target
help: ## Show this help message
	@echo "$(GREEN)Bergizi-ID Docker Management$(RESET)"
	@echo "$(YELLOW)Available commands:$(RESET)"
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  $(BLUE)%-15s$(RESET) %s\n", $$1, $$2}' $(MAKEFILE_LIST)

# Development Commands
dev: ## Start development environment
	@echo "$(GREEN)Starting Bergizi-ID development environment...$(RESET)"
	@mkdir -p docker/volumes/postgres docker/volumes/pgadmin docker/volumes/redis
	@docker-compose --profile dev up -d
	@echo "$(GREEN)✅ Development environment started!$(RESET)"
	@echo "$(YELLOW)🔗 Services:$(RESET)"
	@echo "  PostgreSQL: localhost:5432"
	@echo "  pgAdmin: http://localhost:8080"
	@echo "  Redis: localhost:6379"
	@echo "  Redis Commander: http://localhost:8081"

up: ## Start all services
	@echo "$(GREEN)Starting Bergizi-ID services...$(RESET)"
	@mkdir -p docker/volumes/postgres docker/volumes/pgladmin docker/volumes/redis
	@docker-compose up -d
	@echo "$(GREEN)✅ Services started!$(RESET)"

down: ## Stop all services
	@echo "$(YELLOW)Stopping Bergizi-ID services...$(RESET)"
	@docker-compose down
	@echo "$(GREEN)✅ Services stopped!$(RESET)"

restart: ## Restart all services
	@echo "$(YELLOW)Restarting Bergizi-ID services...$(RESET)"
	@docker-compose restart
	@echo "$(GREEN)✅ Services restarted!$(RESET)"

# Monitoring Commands
logs: ## Show logs for all services
	@docker-compose logs -f

logs-postgres: ## Show PostgreSQL logs
	@docker-compose logs -f postgres

logs-redis: ## Show Redis logs  
	@docker-compose logs -f redis

logs-pgadmin: ## Show pgAdmin logs
	@docker-compose logs -f pgadmin

ps: ## Show running containers
	@docker-compose ps

# Maintenance Commands
clean: ## Clean up containers, networks, and volumes
	@echo "$(RED)Cleaning up Bergizi-ID Docker resources...$(RESET)"
	@docker-compose down -v --remove-orphans
	@docker system prune -f
	@echo "$(GREEN)✅ Cleanup completed!$(RESET)"

clean-volumes: ## Remove all data volumes (DANGEROUS!)
	@echo "$(RED)⚠️  This will delete ALL data! Are you sure? [y/N]$(RESET)" && read ans && [ $${ans:-N} = y ]
	@docker-compose down -v
	@docker volume rm bergizi-id_postgres_data bergizi-id_pgadmin_data bergizi-id_redis_data 2>/dev/null || true
	@rm -rf docker/volumes/*
	@echo "$(GREEN)✅ All data volumes removed!$(RESET)"

# Database Commands
db-shell: ## Connect to PostgreSQL shell
	@docker-compose exec postgres psql -U bergizi_admin -d bergizi_id

db-reset: ## Reset database (drop and recreate)
	@echo "$(YELLOW)Resetting database...$(RESET)"
	@docker-compose exec postgres psql -U bergizi_admin -c "DROP DATABASE IF EXISTS bergizi_id;"
	@docker-compose exec postgres psql -U bergizi_admin -c "CREATE DATABASE bergizi_id;"
	@echo "$(GREEN)✅ Database reset completed!$(RESET)"

db-backup: ## Backup database
	@echo "$(YELLOW)Creating database backup...$(RESET)"
	@mkdir -p backups
	@docker-compose exec -T postgres pg_dump -U bergizi_admin bergizi_id > backups/bergizi_backup_$(shell date +%Y%m%d_%H%M%S).sql
	@echo "$(GREEN)✅ Database backup created in backups/$(RESET)"

db-restore: ## Restore database from backup (specify FILE=backup.sql)
	@if [ -z "$(FILE)" ]; then echo "$(RED)Please specify backup file: make db-restore FILE=backup.sql$(RESET)"; exit 1; fi
	@echo "$(YELLOW)Restoring database from $(FILE)...$(RESET)"
	@docker-compose exec -T postgres psql -U bergizi_admin bergizi_id < $(FILE)
	@echo "$(GREEN)✅ Database restored from $(FILE)$(RESET)"

# Redis Commands
redis-cli: ## Connect to Redis CLI
	@docker-compose exec redis redis-cli -a redis_secure_2024

redis-flush: ## Flush all Redis data
	@echo "$(RED)⚠️  This will delete ALL Redis data! Are you sure? [y/N]$(RESET)" && read ans && [ $${ans:-N} = y ]
	@docker-compose exec redis redis-cli -a redis_secure_2024 FLUSHALL
	@echo "$(GREEN)✅ Redis data flushed!$(RESET)"

# Health Checks
health: ## Check health of all services
	@echo "$(GREEN)Checking Bergizi-ID services health...$(RESET)"
	@docker-compose exec postgres pg_isready -U bergizi_admin
	@docker-compose exec redis redis-cli -a redis_secure_2024 ping
	@echo "$(GREEN)✅ All services healthy!$(RESET)"

# Setup Commands
setup: ## Initial setup for new developers
	@echo "$(GREEN)Setting up Bergizi-ID development environment...$(RESET)"
	@cp .env.docker .env 2>/dev/null || echo "$(YELLOW).env file already exists$(RESET)"
	@mkdir -p docker/volumes/postgres docker/volumes/pgadmin docker/volumes/redis
	@make dev
	@echo "$(GREEN)✅ Setup completed! Run 'make help' to see available commands.$(RESET)"

# Production Commands (use with caution)
prod: ## Start production environment
	@echo "$(RED)⚠️  Starting PRODUCTION environment$(RESET)"
	@docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
	@echo "$(GREEN)✅ Production environment started!$(RESET)"