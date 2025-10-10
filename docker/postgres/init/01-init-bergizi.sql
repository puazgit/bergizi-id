-- Bergizi-ID Database Initialization Script
-- Enterprise-grade PostgreSQL setup for SaaS platform

-- Create extensions for enterprise features
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gin";
CREATE EXTENSION IF NOT EXISTS "btree_gist";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- Create database users with appropriate permissions
CREATE USER bergizi_app WITH PASSWORD 'bergizi_app_2024';
CREATE USER bergizi_readonly WITH PASSWORD 'bergizi_readonly_2024';

-- Grant privileges
GRANT CONNECT ON DATABASE bergizi_id TO bergizi_app;
GRANT CONNECT ON DATABASE bergizi_id TO bergizi_readonly;

-- Create schemas for multi-tenancy
CREATE SCHEMA IF NOT EXISTS public;
CREATE SCHEMA IF NOT EXISTS audit;
CREATE SCHEMA IF NOT EXISTS analytics;

-- Grant schema permissions
GRANT USAGE ON SCHEMA public TO bergizi_app;
GRANT USAGE ON SCHEMA audit TO bergizi_app;
GRANT USAGE ON SCHEMA analytics TO bergizi_app;

GRANT USAGE ON SCHEMA public TO bergizi_readonly;
GRANT USAGE ON SCHEMA audit TO bergizi_readonly;
GRANT USAGE ON SCHEMA analytics TO bergizi_readonly;

-- Set default privileges for future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO bergizi_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA audit GRANT SELECT, INSERT ON TABLES TO bergizi_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA analytics GRANT SELECT, INSERT ON TABLES TO bergizi_app;

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO bergizi_readonly;
ALTER DEFAULT PRIVILEGES IN SCHEMA audit GRANT SELECT ON TABLES TO bergizi_readonly;
ALTER DEFAULT PRIVILEGES IN SCHEMA analytics GRANT SELECT ON TABLES TO bergizi_readonly;

-- Create audit trigger function for compliance
CREATE OR REPLACE FUNCTION audit.audit_trigger()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO audit.audit_log(
            table_name, operation, old_data, new_data, 
            user_name, timestamp, ip_address
        ) VALUES (
            TG_TABLE_NAME, TG_OP, NULL, row_to_json(NEW),
            current_user, current_timestamp, inet_client_addr()
        );
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO audit.audit_log(
            table_name, operation, old_data, new_data, 
            user_name, timestamp, ip_address
        ) VALUES (
            TG_TABLE_NAME, TG_OP, row_to_json(OLD), row_to_json(NEW),
            current_user, current_timestamp, inet_client_addr()
        );
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO audit.audit_log(
            table_name, operation, old_data, new_data, 
            user_name, timestamp, ip_address
        ) VALUES (
            TG_TABLE_NAME, TG_OP, row_to_json(OLD), NULL,
            current_user, current_timestamp, inet_client_addr()
        );
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create audit log table
CREATE TABLE IF NOT EXISTS audit.audit_log (
    id SERIAL PRIMARY KEY,
    table_name TEXT NOT NULL,
    operation TEXT NOT NULL,
    old_data JSONB,
    new_data JSONB,
    user_name TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT current_timestamp,
    ip_address INET
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_audit_log_table_name ON audit.audit_log(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_log_timestamp ON audit.audit_log(timestamp);
CREATE INDEX IF NOT EXISTS idx_audit_log_user ON audit.audit_log(user_name);

-- Performance monitoring setup
CREATE OR REPLACE VIEW analytics.slow_queries AS
SELECT 
    query,
    calls,
    total_time,
    mean_time,
    stddev_time,
    rows,
    100.0 * shared_blks_hit / nullif(shared_blks_hit + shared_blks_read, 0) AS hit_percent
FROM pg_stat_statements 
ORDER BY mean_time DESC;

-- Print success message
DO $$
BEGIN
    RAISE NOTICE 'Bergizi-ID Database initialized successfully with enterprise features!';
END $$;