-- 00009_fix_rls_fail_closed - SECURITY FIX CONFIRMATION
-- Ensures fail-closed policies are present exactly once, clean final state
-- This migration is idempotent and ensures no fail-open policies remain

-- Ensure functions exist
CREATE OR REPLACE FUNCTION current_legal_entity_id() RETURNS UUID LANGUAGE sql STABLE AS $$
  SELECT NULLIF(current_setting('app.current_legal_entity_id', true), '')::UUID;
$$;

CREATE OR REPLACE FUNCTION current_org_id() RETURNS UUID LANGUAGE sql STABLE AS $$
  SELECT NULLIF(current_setting('app.current_org_id', true), '')::UUID;
$$;

-- Remove any old fail-open policies if they still exist from earlier versions
DROP POLICY IF EXISTS legal_entities_tenant_isolation ON legal_entities;
DROP POLICY IF EXISTS goals_tenant_isolation ON goals;
DROP POLICY IF EXISTS financial_documents_tenant_isolation ON financial_documents;

-- Ensure fail-closed policies exist (create if not exists via DO block)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'legal_entities_tenant_isolation_fail_closed' AND tablename = 'legal_entities') THEN
    CREATE POLICY legal_entities_tenant_isolation_fail_closed ON legal_entities
      FOR ALL USING (current_org_id() IS NOT NULL AND org_id = current_org_id())
      WITH CHECK (current_org_id() IS NOT NULL AND org_id = current_org_id());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'goals_tenant_isolation_fail_closed' AND tablename = 'goals') THEN
    CREATE POLICY goals_tenant_isolation_fail_closed ON goals
      FOR ALL USING (current_legal_entity_id() IS NOT NULL AND company_scope = current_legal_entity_id())
      WITH CHECK (current_legal_entity_id() IS NOT NULL AND company_scope = current_legal_entity_id());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'financial_documents_tenant_isolation_fail_closed' AND tablename = 'financial_documents') THEN
    CREATE POLICY financial_documents_tenant_isolation_fail_closed ON financial_documents
      FOR ALL USING (current_legal_entity_id() IS NOT NULL AND legal_entity_id = current_legal_entity_id())
      WITH CHECK (current_legal_entity_id() IS NOT NULL AND legal_entity_id = current_legal_entity_id());
  END IF;
END
$$;

COMMENT ON POLICY legal_entities_tenant_isolation_fail_closed ON legal_entities IS 'FAIL-CLOSED: missing org context denies access';
COMMENT ON POLICY goals_tenant_isolation_fail_closed ON goals IS 'FAIL-CLOSED: missing legal entity context denies access';
COMMENT ON POLICY financial_documents_tenant_isolation_fail_closed ON financial_documents IS 'FAIL-CLOSED: missing context denies, explicit bypass only via service_role/is_admin, never NULL';


-- Ensure the business ID sequence store is fail-closed like every other tenant-scoped table.
-- No permissive policy is added here; non-privileged direct access remains denied by default.
ALTER TABLE business_id_sequences ENABLE ROW LEVEL SECURITY;
