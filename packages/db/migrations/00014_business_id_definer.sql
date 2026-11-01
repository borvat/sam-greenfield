-- 00014_business_id_definer
--
-- Business-id counters become a closed interface.
--   * next_business_id() runs as its owner (SECURITY DEFINER, pinned search_path),
--     so SAM application roles no longer need any privilege on business_id_sequences.
--   * For SAM application roles (session user is a member of sam_runtime_worker,
--     sam_tenant_app or sam_mcp_bridge) the function only serves entity type 'goal',
--     and a non-NULL organisation scope must be the session's own organisation.
--     Any other caller (owner, superuser, release/development roles) is unchanged.
--   * The direct-table policies of 00011/00013 are dropped; privileges are removed in
--     deploy/production/provision-roles.sql.

CREATE OR REPLACE FUNCTION next_business_id(p_entity_type TEXT, p_org_scope_id UUID)
RETURNS TEXT LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, public AS $$
DECLARE
  v_last BIGINT;
  v_next BIGINT;
  v_prefix TEXT;
  v_restricted BOOLEAN;
  v_ctx_org UUID;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM pg_catalog.pg_roles r
    WHERE r.rolname IN ('sam_runtime_worker','sam_tenant_app','sam_mcp_bridge')
      AND pg_catalog.pg_has_role(session_user, r.oid, 'USAGE')
  ) AND NOT EXISTS (SELECT 1 FROM pg_catalog.pg_roles s WHERE s.rolname = session_user AND s.rolsuper)
  INTO v_restricted;

  IF v_restricted THEN
    IF p_entity_type IS DISTINCT FROM 'goal' THEN
      RAISE EXCEPTION 'next_business_id: entity type not permitted for this role' USING ERRCODE = '42501';
    END IF;
    IF p_org_scope_id IS NOT NULL THEN
      v_ctx_org := NULLIF(pg_catalog.current_setting('app.current_org_id', true), '')::uuid;
      IF v_ctx_org IS NULL AND NULLIF(pg_catalog.current_setting('app.current_legal_entity_id', true), '') IS NOT NULL THEN
        SELECT le.org_id INTO v_ctx_org FROM public.legal_entities le
         WHERE le.id = NULLIF(pg_catalog.current_setting('app.current_legal_entity_id', true), '')::uuid;
      END IF;
      IF v_ctx_org IS DISTINCT FROM p_org_scope_id THEN
        RAISE EXCEPTION 'next_business_id: organisation scope does not match the session' USING ERRCODE = '42501';
      END IF;
    END IF;
  END IF;

  IF p_org_scope_id IS NULL THEN
    INSERT INTO public.business_id_sequences(entity_type, org_scope_id, last_number)
    VALUES (p_entity_type, NULL, 0)
    ON CONFLICT (entity_type) WHERE org_scope_id IS NULL DO NOTHING;
    SELECT last_number INTO v_last FROM public.business_id_sequences
     WHERE entity_type = p_entity_type AND org_scope_id IS NULL FOR UPDATE;
    v_next := v_last + 1;
    UPDATE public.business_id_sequences SET last_number = v_next, updated_at = now()
     WHERE entity_type = p_entity_type AND org_scope_id IS NULL;
  ELSE
    INSERT INTO public.business_id_sequences(entity_type, org_scope_id, last_number)
    VALUES (p_entity_type, p_org_scope_id, 0)
    ON CONFLICT (entity_type, org_scope_id) DO NOTHING;
    SELECT last_number INTO v_last FROM public.business_id_sequences
     WHERE entity_type = p_entity_type AND org_scope_id = p_org_scope_id FOR UPDATE;
    v_next := v_last + 1;
    UPDATE public.business_id_sequences SET last_number = v_next, updated_at = now()
     WHERE entity_type = p_entity_type AND org_scope_id = p_org_scope_id;
  END IF;

  v_prefix := CASE p_entity_type
    WHEN 'product' THEN 'P'
    WHEN 'goal' THEN 'G'
    WHEN 'procurement_case' THEN 'S'
    WHEN 'purchase_order' THEN 'PO'
    WHEN 'shipment' THEN 'SHP'
    ELSE upper(substring(p_entity_type, 1, 2))
  END;
  RETURN v_prefix || lpad(v_next::TEXT, 6, '0');
END;
$$;

-- EXECUTE is restricted to the SAM roles in provision-roles.sql (self-hosted); managed and
-- development roles keep the default so their existing owner/release logins still work.

DROP POLICY IF EXISTS business_id_sequences_sam_roles ON business_id_sequences;
DROP POLICY IF EXISTS business_id_sequences_sam_mcp_bridge ON business_id_sequences;
