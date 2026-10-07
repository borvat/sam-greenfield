-- 00008_rls_tenant_isolation_policies - FAIL-CLOSED VERSION
-- Security: missing tenant context must DENY, not ALLOW

CREATE OR REPLACE FUNCTION current_legal_entity_id() RETURNS UUID LANGUAGE sql STABLE AS $$
  SELECT NULLIF(current_setting('app.current_legal_entity_id', true), '')::UUID;
$$;

CREATE OR REPLACE FUNCTION current_org_id() RETURNS UUID LANGUAGE sql STABLE AS $$
  SELECT NULLIF(current_setting('app.current_org_id', true), '')::UUID;
$$;

DROP POLICY IF EXISTS legal_entities_tenant_isolation ON legal_entities;
DROP POLICY IF EXISTS goals_tenant_isolation ON goals;
DROP POLICY IF EXISTS financial_documents_tenant_isolation ON financial_documents;
DROP POLICY IF EXISTS legal_entities_tenant_isolation_fail_closed ON legal_entities;
DROP POLICY IF EXISTS goals_tenant_isolation_fail_closed ON goals;
DROP POLICY IF EXISTS financial_documents_tenant_isolation_fail_closed ON financial_documents;

-- FAIL-CLOSED: IS NOT NULL AND =
CREATE POLICY legal_entities_tenant_isolation_fail_closed ON legal_entities
  FOR ALL USING (current_org_id() IS NOT NULL AND org_id = current_org_id())
  WITH CHECK (current_org_id() IS NOT NULL AND org_id = current_org_id());

CREATE POLICY goals_tenant_isolation_fail_closed ON goals
  FOR ALL USING (current_legal_entity_id() IS NOT NULL AND company_scope = current_legal_entity_id())
  WITH CHECK (current_legal_entity_id() IS NOT NULL AND company_scope = current_legal_entity_id());

CREATE POLICY financial_documents_tenant_isolation_fail_closed ON financial_documents
  FOR ALL USING (current_legal_entity_id() IS NOT NULL AND legal_entity_id = current_legal_entity_id())
  WITH CHECK (current_legal_entity_id() IS NOT NULL AND legal_entity_id = current_legal_entity_id());
