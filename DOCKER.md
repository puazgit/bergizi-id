# 🐳 Bergizi-ID Docker Setup

Enterprise-grade Docker configuration for the Bergizi-ID SaaS platform with PostgreSQL 17, pgAdmin 4, and Redis 7.

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Bergizi-ID SaaS Platform                │
├─────────────────────────────────────────────────────────────┤
│  📱 Next.js App (Port 3000)                               │
├─────────────────────────────────────────────────────────────┤
│  🗄️  PostgreSQL 17     │  🔧 pgAdmin 4      │  ⚡ Redis 7    │
│     (Port 5432)        │    (Port 8080)     │   (Port 6379)  │
│  📊 Enterprise DB      │  🖥️  Admin UI       │  💾 Cache/Session│
└─────────────────────────────────────────────────────────────┘
```

## 🚀 Quick Start

### Prerequisites
- Docker Desktop or Docker Engine 20.10+
- Docker Compose v2.0+
- Make (optional, for easier commands)

### 1. Setup Environment
```bash
# Copy environment template
cp .env.docker .env

# Edit environment variables (update passwords!)
nano .env
```

### 2. Start Services

**Using Make (Recommended):**
```bash
# Complete setup for new developers
make setup

# Start development environment
make dev

# Start production environment  
make up
```

**Using Docker Compose directly:**
```bash
# Development with Redis Commander
docker-compose --profile dev up -d

# Production
docker-compose up -d
```

### 3. Verify Services
```bash
# Check all services
make health

# Or manually
docker-compose ps
```

## 📋 Available Services

| Service | URL | Credentials | Description |
|---------|-----|-------------|-------------|
| PostgreSQL | `localhost:5432` | `bergizi_admin` / `bergizi_secure_2024` | Enterprise database |
| pgAdmin | http://localhost:8080 | `admin@bergizi.id` / `admin_secure_2024` | Database admin UI |
| Redis | `localhost:6379` | Password: `redis_secure_2024` | Cache & sessions |
| Redis Commander | http://localhost:8081 | `admin` / `redis_admin_2024` | Redis admin UI (dev only) |

## 🛠️ Management Commands

### Docker Management
```bash
make up          # Start all services
make down        # Stop all services  
make restart     # Restart all services
make logs        # Show logs
make ps          # Show running containers
make clean       # Clean up everything
```

### Database Operations
```bash
make db-shell    # Connect to PostgreSQL
make db-reset    # Reset database
make db-backup   # Backup database
make db-restore FILE=backup.sql  # Restore from backup
```

### Redis Operations
```bash
make redis-cli   # Connect to Redis CLI
make redis-flush # Clear all Redis data
```

### Development
```bash
make dev         # Start with dev tools
make setup       # Initial project setup
```

## 📁 Directory Structure

```
bergizi-id/
├── docker-compose.yml          # Main Docker configuration
├── .env.docker                 # Environment template
├── Makefile                    # Management commands
└── docker/
    ├── postgres/
    │   └── init/
    │       └── 01-init-bergizi.sql  # Database initialization
    ├── pgladmin/
    │   └── servers.json        # pgAdmin server config
    ├── redis/
    │   └── redis.conf          # Redis configuration
    └── volumes/                # Data persistence
        ├── postgres/
        ├── pgadmin/
        └── redis/
```

## 🔒 Security Features

### PostgreSQL Security
- ✅ Multiple user roles (admin, app, readonly)
- ✅ Schema-based access control
- ✅ Audit logging for compliance
- ✅ Performance monitoring
- ✅ Connection limits and timeouts

### Redis Security
- ✅ Password authentication
- ✅ Memory limits and policies
- ✅ AOF + RDB persistence
- ✅ Network security

### Network Security
- ✅ Isolated Docker network
- ✅ Internal service communication
- ✅ Port exposure control

## 📊 Enterprise Features

### Database
- **High Performance**: Optimized PostgreSQL configuration
- **Backup & Recovery**: Automated backup scripts
- **Monitoring**: Performance statistics and slow query logging
- **Compliance**: Audit trail for all data changes
- **Multi-tenancy**: Schema-based tenant isolation

### Caching
- **Session Management**: Redis-based session store
- **Performance**: Application-level caching
- **Scalability**: Memory management and eviction policies
- **Persistence**: Dual AOF + RDB persistence

### Administration
- **Database UI**: pgAdmin with pre-configured servers
- **Redis UI**: Redis Commander for development
- **Health Checks**: Automated service health monitoring
- **Log Management**: Centralized logging with structured output

## 🚨 Production Considerations

### Security Checklist
- [ ] Change all default passwords
- [ ] Use strong passwords (32+ characters)
- [ ] Enable SSL/TLS certificates
- [ ] Configure firewall rules
- [ ] Set up backup retention policies
- [ ] Enable audit logging
- [ ] Configure monitoring alerts

### Performance Tuning
- [ ] Adjust PostgreSQL memory settings based on server specs
- [ ] Configure Redis memory limit based on usage
- [ ] Set up read replicas for scaling
- [ ] Configure connection pooling
- [ ] Monitor slow queries and optimize

### Backup Strategy
```bash
# Daily automated backup
0 2 * * * /path/to/make db-backup

# Weekly full backup to external storage
0 3 * * 0 /path/to/backup-to-s3.sh
```

## 🔧 Troubleshooting

### Common Issues

**Services won't start:**
```bash
# Check logs
make logs

# Verify Docker resources
docker system df
docker system prune -f
```

**Database connection issues:**
```bash
# Check PostgreSQL status
make logs-postgres

# Test connection
docker-compose exec postgres pg_isready -U bergizi_admin
```

**Redis connection issues:**
```bash
# Check Redis status  
make logs-redis

# Test connection
docker-compose exec redis redis-cli -a redis_secure_2024 ping
```

**Data persistence issues:**
```bash
# Check volumes
docker volume ls | grep bergizi

# Recreate volumes
make clean-volumes
make setup
```

## 📞 Support

For issues related to the Docker setup:
1. Check the logs: `make logs`
2. Verify health: `make health`
3. Clean and restart: `make clean && make setup`

---

**🎯 Enterprise-Ready**: This Docker setup is production-ready and follows enterprise best practices for security, performance, and maintainability.