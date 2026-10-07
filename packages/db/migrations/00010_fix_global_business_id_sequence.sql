-- Phase 18 hardening: make global business ID sequences truly unique.
-- PostgreSQL UNIQUE(entity_type, org_scope_id) does not consider NULL values equal,
-- so global (NULL-scoped) sequences could fork and return duplicate business IDs.

WITH ranked AS (
  SELECT
    id,
    entity_type,
    last_number,
    first_value(id) OVER (
      PARTITION BY entity_type
      ORDER BY last_number DESC, updated_at DESC, id
    ) AS keeper_id,
    max(last_number) OVER (PARTITION BY entity_type) AS max_last
  FROM business_id_sequences
  WHERE org_scope_id IS NULL
)
UPDATE business_id_sequences s
SET last_number=r.max_last,
    updated_at=now()
FROM ranked r
WHERE s.id=r.keeper_id;

WITH ranked AS (
  SELECT
    id,
    row_number() OVER (
      PARTITION BY entity_type
      ORDER BY last_number DESC, updated_at DESC, id
    ) AS rn
  FROM business_id_sequences
  WHERE org_scope_id IS NULL
)
DELETE FROM business_id_sequences s
USING ranked r
WHERE s.id=r.id
  AND r.rn>1;

CREATE UNIQUE INDEX IF NOT EXISTS business_id_sequences_global_unique
  ON business_id_sequences(entity_type)
  WHERE org_scope_id IS NULL;

CREATE OR REPLACE FUNCTION next_business_id(p_entity_type TEXT, p_org_scope_id UUID)
RETURNS TEXT LANGUAGE plpgsql AS $$
DECLARE
  v_last BIGINT;
  v_next BIGINT;
  v_prefix TEXT;
BEGIN
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

  RETURN v_prefix || lpad(v_next::TEXT,6,'0');
END;
$$;
