-- ============================================================================
-- PostgreSQL Row-Level Security (RLS) Multi-Tenant Isolation Migration
-- Enforces strict kernel-level tenant data boundary isolation on all DML operations
-- ============================================================================

BEGIN;

-- 1. Helper function: Retrieve current session tenant ID safely
CREATE OR REPLACE FUNCTION current_tenant_id() 
RETURNS UUID AS $$
BEGIN
    RETURN NULLIF(current_setting('app.current_tenant_id', true), '')::UUID;
EXCEPTION
    WHEN OTHERS THEN
        RETURN NULL;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- 2. Helper function: Check if current session has superadmin bypass privilege
CREATE OR REPLACE FUNCTION is_superadmin() 
RETURNS BOOLEAN AS $$
BEGIN
    RETURN COALESCE(NULLIF(current_setting('app.is_superadmin', true), '')::BOOLEAN, FALSE);
EXCEPTION
    WHEN OTHERS THEN
        RETURN FALSE;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- 3. Session context setter functions for connection pooling (PgBouncer/Prisma)
CREATE OR REPLACE FUNCTION set_tenant_context(p_tenant_id UUID, p_is_superadmin BOOLEAN DEFAULT FALSE)
RETURNS VOID AS $$
BEGIN
    PERFORM set_config('app.current_tenant_id', p_tenant_id::TEXT, false);
    PERFORM set_config('app.is_superadmin', p_is_superadmin::TEXT, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION reset_tenant_context()
RETURNS VOID AS $$
BEGIN
    PERFORM set_config('app.current_tenant_id', '', false);
    PERFORM set_config('app.is_superadmin', 'false', false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 4. Enable & Force Row-Level Security on Core Multi-Tenant Tables
-- ============================================================================

-- A. Organizations / Tenants
ALTER TABLE IF EXISTS organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS organizations FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS tenant_isolation_organizations ON organizations;
CREATE POLICY tenant_isolation_organizations ON organizations
    FOR ALL
    USING (
        is_superadmin() OR id = current_tenant_id()
    )
    WITH CHECK (
        is_superadmin() OR id = current_tenant_id()
    );

-- B. Users / Memberships
ALTER TABLE IF EXISTS users ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS users FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS tenant_isolation_users ON users;
CREATE POLICY tenant_isolation_users ON users
    FOR ALL
    USING (
        is_superadmin() OR tenant_id = current_tenant_id()
    )
    WITH CHECK (
        is_superadmin() OR tenant_id = current_tenant_id()
    );

-- C. Projects / Workspaces
ALTER TABLE IF EXISTS projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS projects FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS tenant_isolation_projects ON projects;
CREATE POLICY tenant_isolation_projects ON projects
    FOR ALL
    USING (
        is_superadmin() OR tenant_id = current_tenant_id()
    )
    WITH CHECK (
        is_superadmin() OR tenant_id = current_tenant_id()
    );

-- D. Subscriptions & Billing
ALTER TABLE IF EXISTS subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS subscriptions FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS tenant_isolation_subscriptions ON subscriptions;
CREATE POLICY tenant_isolation_subscriptions ON subscriptions
    FOR ALL
    USING (
        is_superadmin() OR tenant_id = current_tenant_id()
    )
    WITH CHECK (
        is_superadmin() OR tenant_id = current_tenant_id()
    );

-- E. Audit Logs (Append-only with strict read isolation)
ALTER TABLE IF EXISTS audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS audit_logs FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS tenant_isolation_audit_logs_select ON audit_logs;
CREATE POLICY tenant_isolation_audit_logs_select ON audit_logs
    FOR SELECT
    USING (
        is_superadmin() OR tenant_id = current_tenant_id()
    );

DROP POLICY IF EXISTS tenant_isolation_audit_logs_insert ON audit_logs;
CREATE POLICY tenant_isolation_audit_logs_insert ON audit_logs
    FOR INSERT
    WITH CHECK (
        is_superadmin() OR tenant_id = current_tenant_id()
    );

COMMIT;
