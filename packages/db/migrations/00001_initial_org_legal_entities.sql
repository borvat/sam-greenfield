-- Deterministic migration 00001
-- Organizations and legal entities foundation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE legal_entities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id),
  name TEXT NOT NULL,
  jurisdiction TEXT NOT NULL DEFAULT 'NL',
  vat_number TEXT,
  kvk TEXT,
  status TEXT NOT NULL DEFAULT 'ACTIVE',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(org_id, name)
);

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  legal_entity_id UUID REFERENCES legal_entities(id),
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE legal_entities ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE TABLE business_id_sequences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL,
  org_scope_id UUID,
  last_number BIGINT NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(entity_type, org_scope_id)
);

CREATE OR REPLACE FUNCTION next_business_id(p_entity_type TEXT, p_org_scope_id UUID)
RETURNS TEXT LANGUAGE plpgsql AS $$
DECLARE v_last BIGINT; v_next BIGINT; v_prefix TEXT;
BEGIN
  INSERT INTO business_id_sequences(entity_type, org_scope_id, last_number) VALUES (p_entity_type, p_org_scope_id, 0) ON CONFLICT (entity_type, org_scope_id) DO NOTHING;
  SELECT last_number INTO v_last FROM business_id_sequences WHERE entity_type = p_entity_type AND (org_scope_id = p_org_scope_id OR (org_scope_id IS NULL AND p_org_scope_id IS NULL)) FOR UPDATE;
  v_next := v_last + 1;
  UPDATE business_id_sequences SET last_number = v_next, updated_at = now() WHERE entity_type = p_entity_type AND (org_scope_id = p_org_scope_id OR (org_scope_id IS NULL AND p_org_scope_id IS NULL));
  v_prefix := CASE p_entity_type WHEN 'product' THEN 'P' WHEN 'goal' THEN 'G' WHEN 'procurement_case' THEN 'S' WHEN 'purchase_order' THEN 'PO' WHEN 'shipment' THEN 'SHP' ELSE upper(substring(p_entity_type,1,2)) END;
  RETURN v_prefix || lpad(v_next::TEXT, 6, '0');
END;
$$;
