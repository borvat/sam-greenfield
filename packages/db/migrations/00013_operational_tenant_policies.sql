-- Invoker-rights policies. No role creation, GRANT, credential or ownership changes.
-- Runtime connections must carry a fixed trusted tenant context; missing context denies.
CREATE POLICY organizations_current ON organizations FOR SELECT USING(id=current_org_id());
CREATE POLICY plans_current ON plans FOR ALL
USING(EXISTS(SELECT 1 FROM goals g WHERE g.id=goal_id))
WITH CHECK(EXISTS(SELECT 1 FROM goals g WHERE g.id=goal_id));
CREATE POLICY work_current ON work_queue FOR ALL
 USING(EXISTS(SELECT 1 FROM goals g WHERE g.id=goal_id))
 WITH CHECK(EXISTS(SELECT 1 FROM goals g WHERE g.id=goal_id));
CREATE POLICY executions_current ON executions FOR ALL
 USING(EXISTS(SELECT 1 FROM goals g WHERE g.id=goal_id))
 WITH CHECK(EXISTS(SELECT 1 FROM goals g WHERE g.id=goal_id));
CREATE POLICY verifications_current ON verifications FOR ALL
 USING(EXISTS(SELECT 1 FROM executions e WHERE e.id=execution_id))
 WITH CHECK(EXISTS(SELECT 1 FROM executions e WHERE e.id=execution_id));
CREATE POLICY approvals_current ON approvals FOR ALL
 USING(legal_entity_id=current_legal_entity_id()) WITH CHECK(legal_entity_id=current_legal_entity_id());
CREATE POLICY side_effects_current ON side_effect_operations FOR ALL
 USING(legal_entity_id=current_legal_entity_id()) WITH CHECK(legal_entity_id=current_legal_entity_id());
CREATE POLICY facts_current ON world_facts FOR ALL
 USING(entity_type='legal_entity' AND entity_id=current_legal_entity_id())
 WITH CHECK(entity_type='legal_entity' AND entity_id=current_legal_entity_id());
CREATE POLICY memory_current ON memory_records FOR ALL
 USING(scope->>'legal_entity_id'=current_legal_entity_id()::text)
 WITH CHECK(scope->>'legal_entity_id'=current_legal_entity_id()::text);
CREATE POLICY audit_current ON audit_log FOR ALL
 USING(EXISTS(SELECT 1 FROM goals g WHERE g.id=goal_id) OR (entity_type='legal_entity' AND entity_id=current_legal_entity_id()))
 WITH CHECK(EXISTS(SELECT 1 FROM goals g WHERE g.id=goal_id) OR (entity_type='legal_entity' AND entity_id=current_legal_entity_id()));
-- Explicit tenant labels on operational streams; never infer ownership from JSON input.
ALTER TABLE outbox_events ADD COLUMN legal_entity_id uuid DEFAULT current_legal_entity_id();
ALTER TABLE event_fabric_events ADD COLUMN legal_entity_id uuid DEFAULT current_legal_entity_id();
ALTER TABLE inbox_events ADD COLUMN legal_entity_id uuid DEFAULT current_legal_entity_id();
ALTER TABLE model_calls ADD COLUMN legal_entity_id uuid DEFAULT current_legal_entity_id();
CREATE POLICY outbox_current ON outbox_events FOR ALL USING(legal_entity_id=current_legal_entity_id()) WITH CHECK(legal_entity_id=current_legal_entity_id());
CREATE POLICY events_current ON event_fabric_events FOR ALL USING(legal_entity_id=current_legal_entity_id()) WITH CHECK(legal_entity_id=current_legal_entity_id());
CREATE POLICY inbox_current ON inbox_events FOR ALL USING(legal_entity_id=current_legal_entity_id()) WITH CHECK(legal_entity_id=current_legal_entity_id());
CREATE POLICY calls_current ON model_calls FOR ALL USING(legal_entity_id=current_legal_entity_id()) WITH CHECK(legal_entity_id=current_legal_entity_id());
CREATE POLICY providers_read ON model_providers FOR SELECT USING(current_legal_entity_id() IS NOT NULL);
CREATE POLICY contracts_read ON verification_contracts FOR SELECT USING(current_legal_entity_id() IS NOT NULL);
-- Global business-ID allocation remains a migration/operator concern. Runtime
-- allocation is tenant scoped, so another tenant's counter cannot be inspected.
CREATE POLICY business_ids_current ON business_id_sequences FOR ALL
 USING(org_scope_id=current_org_id()) WITH CHECK(org_scope_id=current_org_id());

CREATE POLICY goals_org_boundary ON goals AS RESTRICTIVE FOR ALL
 USING(EXISTS(SELECT 1 FROM legal_entities le WHERE le.id=company_scope AND le.org_id=current_org_id()))
 WITH CHECK(EXISTS(SELECT 1 FROM legal_entities le WHERE le.id=company_scope AND le.org_id=current_org_id()));

-- Preserve legacy unbound IDs; bound runtime IDs include the full org UUID.
CREATE OR REPLACE FUNCTION next_business_id(p_entity_type TEXT, p_org_scope_id UUID)
RETURNS TEXT LANGUAGE plpgsql AS $$
DECLARE
  v_last BIGINT;
  v_next BIGINT;
  v_prefix TEXT;
BEGIN
  -- A fixed runtime principal allocates only within its own counter.
  IF current_org_id() IS NOT NULL THEN p_org_scope_id:=COALESCE(p_org_scope_id,current_org_id()); END IF;
  IF p_org_scope_id IS NULL THEN
    INSERT INTO business_id_sequences(entity_type, org_scope_id, last_number)
    VALUES (p_entity_type, NULL, 0)
    ON CONFLICT (entity_type) WHERE org_scope_id IS NULL DO NOTHING;

    SELECT last_number INTO v_last
    FROM business_id_sequences
    WHERE entity_type=p_entity_type
      AND org_scope_id IS NULL
    FOR UPDATE;

    v_next:=v_last+1;

    UPDATE business_id_sequences
    SET last_number=v_next,updated_at=now()
    WHERE entity_type=p_entity_type
      AND org_scope_id IS NULL;
  ELSE
    INSERT INTO business_id_sequences(entity_type, org_scope_id, last_number)
    VALUES (p_entity_type, p_org_scope_id, 0)
    ON CONFLICT (entity_type, org_scope_id) DO NOTHING;

    SELECT last_number INTO v_last
    FROM business_id_sequences
    WHERE entity_type=p_entity_type
      AND org_scope_id=p_org_scope_id
    FOR UPDATE;

    v_next:=v_last+1;

    UPDATE business_id_sequences
    SET last_number=v_next,updated_at=now()
    WHERE entity_type=p_entity_type
      AND org_scope_id=p_org_scope_id;
  END IF;

  v_prefix:=CASE p_entity_type
    WHEN 'product' THEN 'P'
    WHEN 'goal' THEN 'G'
    WHEN 'procurement_case' THEN 'S'
    WHEN 'purchase_order' THEN 'PO'
    WHEN 'shipment' THEN 'SHP'
    ELSE upper(substring(p_entity_type,1,2))
  END;

  RETURN v_prefix || CASE WHEN current_org_id() IS NOT NULL THEN '-' || p_org_scope_id::text || '-' ELSE '' END || lpad(v_next::TEXT,6,'0');
END;
$$;
