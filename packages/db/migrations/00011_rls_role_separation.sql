-- 00011_rls_role_separation
--
-- Role-aware row level security for the self-hosted deployment.
--
-- Scope of this migration: POLICIES AND ONE HELPER FUNCTION ONLY.
--   * It creates no roles, grants, passwords or other cluster-level objects.
--     Roles and table privileges are provisioned by deploy/production/provision-roles.sql
--     so that managed-provider paths (which forbid role creation) can apply this file.
--   * Every policy below applies only to members of one of two group roles:
--       sam_runtime_worker  system role used by the runtime worker (and the MCP
--                           bridge for its kernel-backed execution path). It is
--                           intentionally cross-tenant, but table privileges
--                           (see provision-roles.sql) bound what it can touch:
--                           no DELETE/TRUNCATE, and no access at all to users,
--                           organizations or financial_documents.
--       sam_tenant_app      tenant-scoped role (Command Center, owner read surface).
--                           Sees only rows of the session's legal entity, or of
--                           every entity in the session's organization when only
--                           app.current_org_id is set. No context means no rows.
--     A role that is not a member of either group (superuser, a managed-provider
--     owner, the restricted release/development roles) is unaffected.
--   * Policies are PERMISSIVE and OR with the existing 00008/00009 fail-closed
--     policies, which are left untouched.
--   * FORCE ROW LEVEL SECURITY is deliberately NOT enabled: owners are kept out
--     of the runtime by assertReleaseDatabaseSafety at service startup, and FORCE
--     would break future data migrations run by a non-superuser owner.
--
-- Scope derivation used below:
--   direct entity scope    goals.company_scope, side_effect_operations / approvals /
--                          users / financial_documents.legal_entity_id
--   indirect (through goal) plans, work_queue, executions, verifications, audit_log
--                          These rely on the goals policy: the EXISTS subquery runs
--                          under the caller's own RLS, so a goal the session cannot
--                          see makes its children invisible too.
--   system only            outbox_events, event_fabric_events, inbox_events,
--                          world_facts, memory_records, model_calls, model_providers,
--                          verification_contracts, policy_envelopes

CREATE OR REPLACE FUNCTION sam_has_role(p_role TEXT) RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY INVOKER SET search_path = pg_catalog AS $$
  SELECT EXISTS (
    SELECT 1 FROM pg_catalog.pg_roles r
    WHERE r.rolname = p_role AND pg_catalog.pg_has_role(CURRENT_USER, r.oid, 'USAGE')
  );
$$;

COMMENT ON FUNCTION sam_has_role(TEXT) IS
  'True when CURRENT_USER is a member of the named role. False (never an error) when the role does not exist, so policies stay portable across deployments that do not provision it.';

-- ---------------------------------------------------------------------------
-- System role: sam_runtime_worker
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS goals_sam_runtime_worker ON goals;
CREATE POLICY goals_sam_runtime_worker ON goals FOR ALL
  USING ((SELECT sam_has_role('sam_runtime_worker')))
  WITH CHECK ((SELECT sam_has_role('sam_runtime_worker')));

DROP POLICY IF EXISTS plans_sam_runtime_worker ON plans;
CREATE POLICY plans_sam_runtime_worker ON plans FOR ALL
  USING ((SELECT sam_has_role('sam_runtime_worker')))
  WITH CHECK ((SELECT sam_has_role('sam_runtime_worker')));

DROP POLICY IF EXISTS work_queue_sam_runtime_worker ON work_queue;
CREATE POLICY work_queue_sam_runtime_worker ON work_queue FOR ALL
  USING ((SELECT sam_has_role('sam_runtime_worker')))
  WITH CHECK ((SELECT sam_has_role('sam_runtime_worker')));

DROP POLICY IF EXISTS executions_sam_runtime_worker ON executions;
CREATE POLICY executions_sam_runtime_worker ON executions FOR ALL
  USING ((SELECT sam_has_role('sam_runtime_worker')))
  WITH CHECK ((SELECT sam_has_role('sam_runtime_worker')));

DROP POLICY IF EXISTS verifications_sam_runtime_worker ON verifications;
CREATE POLICY verifications_sam_runtime_worker ON verifications FOR ALL
  USING ((SELECT sam_has_role('sam_runtime_worker')))
  WITH CHECK ((SELECT sam_has_role('sam_runtime_worker')));

DROP POLICY IF EXISTS side_effect_operations_sam_runtime_worker ON side_effect_operations;
CREATE POLICY side_effect_operations_sam_runtime_worker ON side_effect_operations FOR ALL
  USING ((SELECT sam_has_role('sam_runtime_worker')))
  WITH CHECK ((SELECT sam_has_role('sam_runtime_worker')));

DROP POLICY IF EXISTS approvals_sam_runtime_worker ON approvals;
CREATE POLICY approvals_sam_runtime_worker ON approvals FOR ALL
  USING ((SELECT sam_has_role('sam_runtime_worker')))
  WITH CHECK ((SELECT sam_has_role('sam_runtime_worker')));

DROP POLICY IF EXISTS audit_log_sam_runtime_worker ON audit_log;
CREATE POLICY audit_log_sam_runtime_worker ON audit_log FOR ALL
  USING ((SELECT sam_has_role('sam_runtime_worker')))
  WITH CHECK ((SELECT sam_has_role('sam_runtime_worker')));

DROP POLICY IF EXISTS legal_entities_sam_runtime_worker ON legal_entities;
CREATE POLICY legal_entities_sam_runtime_worker ON legal_entities FOR SELECT
  USING ((SELECT sam_has_role('sam_runtime_worker')));

DROP POLICY IF EXISTS outbox_events_sam_runtime_worker ON outbox_events;
CREATE POLICY outbox_events_sam_runtime_worker ON outbox_events FOR ALL
  USING ((SELECT sam_has_role('sam_runtime_worker')))
  WITH CHECK ((SELECT sam_has_role('sam_runtime_worker')));

DROP POLICY IF EXISTS event_fabric_events_sam_runtime_worker ON event_fabric_events;
CREATE POLICY event_fabric_events_sam_runtime_worker ON event_fabric_events FOR ALL
  USING ((SELECT sam_has_role('sam_runtime_worker')))
  WITH CHECK ((SELECT sam_has_role('sam_runtime_worker')));

DROP POLICY IF EXISTS inbox_events_sam_runtime_worker ON inbox_events;
CREATE POLICY inbox_events_sam_runtime_worker ON inbox_events FOR ALL
  USING ((SELECT sam_has_role('sam_runtime_worker')))
  WITH CHECK ((SELECT sam_has_role('sam_runtime_worker')));

DROP POLICY IF EXISTS world_facts_sam_runtime_worker ON world_facts;
CREATE POLICY world_facts_sam_runtime_worker ON world_facts FOR ALL
  USING ((SELECT sam_has_role('sam_runtime_worker')))
  WITH CHECK ((SELECT sam_has_role('sam_runtime_worker')));

DROP POLICY IF EXISTS memory_records_sam_runtime_worker ON memory_records;
CREATE POLICY memory_records_sam_runtime_worker ON memory_records FOR ALL
  USING ((SELECT sam_has_role('sam_runtime_worker')))
  WITH CHECK ((SELECT sam_has_role('sam_runtime_worker')));

DROP POLICY IF EXISTS model_calls_sam_runtime_worker ON model_calls;
CREATE POLICY model_calls_sam_runtime_worker ON model_calls FOR ALL
  USING ((SELECT sam_has_role('sam_runtime_worker')))
  WITH CHECK ((SELECT sam_has_role('sam_runtime_worker')));

DROP POLICY IF EXISTS model_providers_sam_runtime_worker ON model_providers;
CREATE POLICY model_providers_sam_runtime_worker ON model_providers FOR ALL
  USING ((SELECT sam_has_role('sam_runtime_worker')))
  WITH CHECK ((SELECT sam_has_role('sam_runtime_worker')));

DROP POLICY IF EXISTS verification_contracts_sam_runtime_worker ON verification_contracts;
CREATE POLICY verification_contracts_sam_runtime_worker ON verification_contracts FOR ALL
  USING ((SELECT sam_has_role('sam_runtime_worker')))
  WITH CHECK ((SELECT sam_has_role('sam_runtime_worker')));

DROP POLICY IF EXISTS policy_envelopes_sam_runtime_worker ON policy_envelopes;
CREATE POLICY policy_envelopes_sam_runtime_worker ON policy_envelopes FOR ALL
  USING ((SELECT sam_has_role('sam_runtime_worker')))
  WITH CHECK ((SELECT sam_has_role('sam_runtime_worker')));

-- ---------------------------------------------------------------------------
-- Tenant role: sam_tenant_app
-- ---------------------------------------------------------------------------

-- Own organization only.
DROP POLICY IF EXISTS organizations_sam_tenant_scoped ON organizations;
CREATE POLICY organizations_sam_tenant_scoped ON organizations FOR SELECT
  USING ((SELECT sam_has_role('sam_tenant_app')) AND current_org_id() IS NOT NULL AND id = current_org_id());

-- Goals: the session's legal entity, or every entity of the session's
-- organization when no legal entity is set (owner-wide read surface).
DROP POLICY IF EXISTS goals_sam_tenant_scoped ON goals;
CREATE POLICY goals_sam_tenant_scoped ON goals FOR ALL
  USING (
    (SELECT sam_has_role('sam_tenant_app')) AND company_scope IS NOT NULL AND (
      company_scope = current_legal_entity_id()
      OR (current_legal_entity_id() IS NULL AND current_org_id() IS NOT NULL AND EXISTS (
        SELECT 1 FROM legal_entities le WHERE le.id = company_scope AND le.org_id = current_org_id()))
    )
  )
  WITH CHECK (
    (SELECT sam_has_role('sam_tenant_app')) AND company_scope IS NOT NULL AND (
      company_scope = current_legal_entity_id()
      OR (current_legal_entity_id() IS NULL AND current_org_id() IS NOT NULL AND EXISTS (
        SELECT 1 FROM legal_entities le WHERE le.id = company_scope AND le.org_id = current_org_id()))
    )
  );

-- Children of goals: visible exactly when the parent goal is visible to the caller.
DROP POLICY IF EXISTS plans_sam_tenant_scoped ON plans;
CREATE POLICY plans_sam_tenant_scoped ON plans FOR SELECT
  USING ((SELECT sam_has_role('sam_tenant_app')) AND goal_id IS NOT NULL
    AND EXISTS (SELECT 1 FROM goals gl WHERE gl.id = goal_id));

DROP POLICY IF EXISTS work_queue_sam_tenant_scoped ON work_queue;
CREATE POLICY work_queue_sam_tenant_scoped ON work_queue FOR SELECT
  USING ((SELECT sam_has_role('sam_tenant_app')) AND goal_id IS NOT NULL
    AND EXISTS (SELECT 1 FROM goals gl WHERE gl.id = goal_id));

DROP POLICY IF EXISTS executions_sam_tenant_scoped ON executions;
CREATE POLICY executions_sam_tenant_scoped ON executions FOR SELECT
  USING ((SELECT sam_has_role('sam_tenant_app')) AND goal_id IS NOT NULL
    AND EXISTS (SELECT 1 FROM goals gl WHERE gl.id = goal_id));

DROP POLICY IF EXISTS verifications_sam_tenant_scoped ON verifications;
CREATE POLICY verifications_sam_tenant_scoped ON verifications FOR SELECT
  USING ((SELECT sam_has_role('sam_tenant_app')) AND execution_id IS NOT NULL
    AND EXISTS (SELECT 1 FROM executions ex WHERE ex.id = execution_id));

-- Audit log: append-only (trigger already forbids UPDATE/DELETE). A tenant
-- session may append only while it carries a tenant context, and may read only
-- rows that belong to a goal it can see.
DROP POLICY IF EXISTS audit_log_sam_tenant_insert ON audit_log;
CREATE POLICY audit_log_sam_tenant_insert ON audit_log FOR INSERT
  WITH CHECK ((SELECT sam_has_role('sam_tenant_app'))
    AND (current_org_id() IS NOT NULL OR current_legal_entity_id() IS NOT NULL));

DROP POLICY IF EXISTS audit_log_sam_tenant_select ON audit_log;
CREATE POLICY audit_log_sam_tenant_select ON audit_log FOR SELECT
  USING ((SELECT sam_has_role('sam_tenant_app')) AND goal_id IS NOT NULL
    AND EXISTS (SELECT 1 FROM goals gl WHERE gl.id = goal_id));

-- Rows with a direct legal_entity_id. NULL entity means invisible (fail closed).
DROP POLICY IF EXISTS side_effect_operations_sam_tenant_scoped ON side_effect_operations;
CREATE POLICY side_effect_operations_sam_tenant_scoped ON side_effect_operations FOR SELECT
  USING (
    (SELECT sam_has_role('sam_tenant_app')) AND legal_entity_id IS NOT NULL AND (
      legal_entity_id = current_legal_entity_id()
      OR (current_legal_entity_id() IS NULL AND current_org_id() IS NOT NULL AND EXISTS (
        SELECT 1 FROM legal_entities le WHERE le.id = legal_entity_id AND le.org_id = current_org_id()))
    )
  );

DROP POLICY IF EXISTS approvals_sam_tenant_scoped ON approvals;
CREATE POLICY approvals_sam_tenant_scoped ON approvals FOR SELECT
  USING (
    (SELECT sam_has_role('sam_tenant_app')) AND legal_entity_id IS NOT NULL AND (
      legal_entity_id = current_legal_entity_id()
      OR (current_legal_entity_id() IS NULL AND current_org_id() IS NOT NULL AND EXISTS (
        SELECT 1 FROM legal_entities le WHERE le.id = legal_entity_id AND le.org_id = current_org_id()))
    )
  );

DROP POLICY IF EXISTS users_sam_tenant_scoped ON users;
CREATE POLICY users_sam_tenant_scoped ON users FOR SELECT
  USING (
    (SELECT sam_has_role('sam_tenant_app')) AND legal_entity_id IS NOT NULL AND (
      legal_entity_id = current_legal_entity_id()
      OR (current_legal_entity_id() IS NULL AND current_org_id() IS NOT NULL AND EXISTS (
        SELECT 1 FROM legal_entities le WHERE le.id = legal_entity_id AND le.org_id = current_org_id()))
    )
  );

DROP POLICY IF EXISTS financial_documents_sam_tenant_scoped ON financial_documents;
CREATE POLICY financial_documents_sam_tenant_scoped ON financial_documents FOR SELECT
  USING (
    (SELECT sam_has_role('sam_tenant_app')) AND legal_entity_id IS NOT NULL AND (
      legal_entity_id = current_legal_entity_id()
      OR (current_legal_entity_id() IS NULL AND current_org_id() IS NOT NULL AND EXISTS (
        SELECT 1 FROM legal_entities le WHERE le.id = legal_entity_id AND le.org_id = current_org_id()))
    )
  );

-- ---------------------------------------------------------------------------
-- Shared counters: both roles take business ids through next_business_id().
-- The table holds counters only (no tenant data).
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS business_id_sequences_sam_roles ON business_id_sequences;
CREATE POLICY business_id_sequences_sam_roles ON business_id_sequences FOR ALL
  USING ((SELECT sam_has_role('sam_runtime_worker')) OR (SELECT sam_has_role('sam_tenant_app')))
  WITH CHECK ((SELECT sam_has_role('sam_runtime_worker')) OR (SELECT sam_has_role('sam_tenant_app')));
