-- 00013_review_hardening
--
-- Findings from the independent review of 00011/00012. Policies, triggers and one
-- function only: no roles, grants or passwords (provision-roles.sql owns those).
--
--  1. executions / event_fabric_events are append-only. The runtime role holds
--     UPDATE (id) solely so SELECT ... FOR UPDATE can take row locks; a trigger now
--     forbids any actual change, so that privilege cannot rewrite ids.
--  2. credential_vault: revoked_by / revoked_at are immutable once revoked.
--  3. The MCP bridge (ChatGPT-facing) gets its own group role, sam_mcp_bridge, instead
--     of the runtime role: read-only on system tables plus exactly the writes the
--     ChatGPT-direct dispatcher needs (create goal, advance its state, plan, queue,
--     audit) and PENDING approval requests. It can no longer approve anything.
--  4. A tenant session cannot forge credential-vault audit rows.

-- 1 ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION forbid_append_only_update() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  IF NEW IS DISTINCT FROM OLD THEN
    RAISE EXCEPTION '% is append-only; UPDATE is forbidden', TG_TABLE_NAME;
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS executions_append_only ON executions;
CREATE TRIGGER executions_append_only BEFORE UPDATE ON executions
  FOR EACH ROW EXECUTE FUNCTION forbid_append_only_update();
DROP TRIGGER IF EXISTS event_fabric_events_append_only ON event_fabric_events;
CREATE TRIGGER event_fabric_events_append_only BEFORE UPDATE ON event_fabric_events
  FOR EACH ROW EXECUTE FUNCTION forbid_append_only_update();

-- 2 ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION credential_vault_guard_update() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.id IS DISTINCT FROM OLD.id
     OR NEW.legal_entity_id IS DISTINCT FROM OLD.legal_entity_id
     OR NEW.provider IS DISTINCT FROM OLD.provider
     OR NEW.name IS DISTINCT FROM OLD.name
     OR NEW.secret_version IS DISTINCT FROM OLD.secret_version
     OR NEW.key_version IS DISTINCT FROM OLD.key_version
     OR NEW.dek_nonce IS DISTINCT FROM OLD.dek_nonce
     OR NEW.wrapped_dek IS DISTINCT FROM OLD.wrapped_dek
     OR NEW.dek_tag IS DISTINCT FROM OLD.dek_tag
     OR NEW.nonce IS DISTINCT FROM OLD.nonce
     OR NEW.ciphertext IS DISTINCT FROM OLD.ciphertext
     OR NEW.auth_tag IS DISTINCT FROM OLD.auth_tag
     OR NEW.created_by IS DISTINCT FROM OLD.created_by
     OR NEW.created_at IS DISTINCT FROM OLD.created_at THEN
    RAISE EXCEPTION 'credential_vault secret material is immutable; rotate by inserting a new version';
  END IF;
  IF OLD.status = 'REVOKED' AND (NEW.status IS DISTINCT FROM 'REVOKED'
     OR NEW.revoked_by IS DISTINCT FROM OLD.revoked_by
     OR NEW.revoked_at IS DISTINCT FROM OLD.revoked_at) THEN
    RAISE EXCEPTION 'a revoked credential is final';
  END IF;
  RETURN NEW;
END $$;

-- 3 ---------------------------------------------------------------------------
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['goals','plans','work_queue','executions','verifications',
    'side_effect_operations','approvals','audit_log','outbox_events','event_fabric_events',
    'inbox_events','world_facts','memory_records','model_calls','model_providers',
    'verification_contracts','policy_envelopes','legal_entities'] LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I', t || '_sam_mcp_bridge_read', t);
    EXECUTE format($f$CREATE POLICY %I ON %I FOR SELECT USING ((SELECT sam_has_role('sam_mcp_bridge')))$f$,
      t || '_sam_mcp_bridge_read', t);
  END LOOP;
END $$;

DROP POLICY IF EXISTS goals_sam_mcp_bridge_insert ON goals;
CREATE POLICY goals_sam_mcp_bridge_insert ON goals FOR INSERT
  WITH CHECK ((SELECT sam_has_role('sam_mcp_bridge')));

-- The bridge may only REQUEST approval: a PENDING row with no approver and no use.
DROP POLICY IF EXISTS approvals_sam_mcp_bridge_insert ON approvals;
CREATE POLICY approvals_sam_mcp_bridge_insert ON approvals FOR INSERT
  WITH CHECK ((SELECT sam_has_role('sam_mcp_bridge'))
    AND status = 'PENDING' AND approved_by IS NULL AND used_at IS NULL AND COALESCE(used_count, 0) = 0);

-- The ChatGPT-direct dispatcher drives a goal through the kernel (NEW -> PLANNING, plan,
-- queue). Allow exactly those writes; privileges are further narrowed to columns in
-- provision-roles.sql (goals: state/updated_at/current_plan_id only).
DROP POLICY IF EXISTS goals_sam_mcp_bridge_update ON goals;
CREATE POLICY goals_sam_mcp_bridge_update ON goals FOR UPDATE
  USING ((SELECT sam_has_role('sam_mcp_bridge'))) WITH CHECK ((SELECT sam_has_role('sam_mcp_bridge')));
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['plans','work_queue','audit_log','outbox_events'] LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I', t || '_sam_mcp_bridge_insert', t);
    EXECUTE format($f$CREATE POLICY %I ON %I FOR INSERT WITH CHECK ((SELECT sam_has_role('sam_mcp_bridge')))$f$,
      t || '_sam_mcp_bridge_insert', t);
  END LOOP;
END $$;

-- Goal business ids come from the shared counter (next_business_id / business_id_sequences).
DROP POLICY IF EXISTS business_id_sequences_sam_mcp_bridge ON business_id_sequences;
CREATE POLICY business_id_sequences_sam_mcp_bridge ON business_id_sequences FOR ALL
  USING ((SELECT sam_has_role('sam_mcp_bridge'))) WITH CHECK ((SELECT sam_has_role('sam_mcp_bridge')));

-- 4 ---------------------------------------------------------------------------
DROP POLICY IF EXISTS audit_log_sam_tenant_insert ON audit_log;
CREATE POLICY audit_log_sam_tenant_insert ON audit_log FOR INSERT
  WITH CHECK ((SELECT sam_has_role('sam_tenant_app'))
    AND (current_org_id() IS NOT NULL OR current_legal_entity_id() IS NOT NULL)
    AND source IS DISTINCT FROM 'credential_vault');
