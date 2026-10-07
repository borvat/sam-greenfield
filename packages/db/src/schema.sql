-- 00001_initial_org_legal_entities.sql

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
  name TEXT NOT NULL, -- Surooh Holding B.V., QNAN B.V., NAN Trading B.V., Borvat.com B.V.
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

-- RLS foundation
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE legal_entities ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Business ID sequences transactional, never MAX()+1
CREATE TABLE business_id_sequences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL, -- product, goal, procurement_case, po, shipment, etc
  org_scope_id UUID, -- nullable for global types, or legal_entity/org id
  last_number BIGINT NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(entity_type, org_scope_id)
);

CREATE OR REPLACE FUNCTION next_business_id(p_entity_type TEXT, p_org_scope_id UUID)
RETURNS TEXT LANGUAGE plpgsql AS $$
DECLARE
  v_last BIGINT;
  v_next BIGINT;
  v_prefix TEXT;
BEGIN
  -- Transactional via SELECT FOR UPDATE
  INSERT INTO business_id_sequences(entity_type, org_scope_id, last_number)
  VALUES (p_entity_type, p_org_scope_id, 0)
  ON CONFLICT (entity_type, org_scope_id) DO NOTHING;

  SELECT last_number INTO v_last FROM business_id_sequences
  WHERE entity_type = p_entity_type AND (org_scope_id = p_org_scope_id OR (org_scope_id IS NULL AND p_org_scope_id IS NULL))
  FOR UPDATE;

  v_next := v_last + 1;
  UPDATE business_id_sequences SET last_number = v_next, updated_at = now()
  WHERE entity_type = p_entity_type AND (org_scope_id = p_org_scope_id OR (org_scope_id IS NULL AND p_org_scope_id IS NULL));

  -- Prefix mapping
  v_prefix := CASE p_entity_type
    WHEN 'product' THEN 'P'
    WHEN 'goal' THEN 'G'
    WHEN 'procurement_case' THEN 'S'
    WHEN 'purchase_order' THEN 'PO'
    WHEN 'shipment' THEN 'SHP'
    ELSE upper(substring(p_entity_type,1,2))
  END;

  RETURN v_prefix || lpad(v_next::TEXT, 6, '0');
END;
$$;


-- MIGRATION SEPARATOR --

-- 00002_audit_framework.sql

-- Immutable audit framework append-only
CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor TEXT NOT NULL,
  agent_id UUID,
  goal_id UUID,
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  before_ref JSONB,
  after_ref JSONB,
  source TEXT,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  authority_class TEXT CHECK (authority_class IN ('GREEN','YELLOW','RED')),
  approval_id UUID,
  result TEXT,
  evidence_id UUID,
  event_seq_ref BIGINT
);

-- Append-only enforcement via trigger
CREATE OR REPLACE FUNCTION prevent_audit_mutation() RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION 'audit_log is append-only, UPDATE/DELETE forbidden';
END;
$$;

CREATE TRIGGER audit_no_update BEFORE UPDATE OR DELETE ON audit_log
FOR EACH ROW EXECUTE FUNCTION prevent_audit_mutation();

-- RLS
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Index for ordering by timestamp
CREATE INDEX audit_log_timestamp_idx ON audit_log(timestamp);


-- MIGRATION SEPARATOR --

-- 00003_event_fabric.sql

-- Event Fabric foundation with deterministic monotonic event_seq
CREATE SEQUENCE global_event_seq_seq START 1;

CREATE TABLE event_fabric_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_seq BIGINT NOT NULL DEFAULT nextval('global_event_seq_seq') UNIQUE,
  source TEXT NOT NULL, -- email, marketplace, bank, accounting, crm, logistics, owner, timer, webhook, connector
  source_event_id TEXT,
  event_type TEXT NOT NULL,
  entity_refs JSONB,
  occurred_at TIMESTAMPTZ NOT NULL,
  received_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  payload JSONB,
  dedup_key TEXT UNIQUE, -- provider + external_id for deduplication
  provenance JSONB,
  outbox_ref UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX event_fabric_source_seq_idx ON event_fabric_events(source, event_seq);
CREATE INDEX event_fabric_global_seq_idx ON event_fabric_events(event_seq);
CREATE INDEX event_fabric_dedup_idx ON event_fabric_events(dedup_key);

ALTER TABLE event_fabric_events ENABLE ROW LEVEL SECURITY;

-- Inbox for exactly-once per consumer
CREATE TABLE inbox_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consumer_id TEXT NOT NULL,
  event_seq BIGINT NOT NULL,
  dedup_key TEXT NOT NULL,
  source_event_id TEXT,
  payload JSONB,
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING','PROCESSED','FAILED')),
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(consumer_id, dedup_key)
);

CREATE INDEX inbox_consumer_seq_idx ON inbox_events(consumer_id, event_seq);

ALTER TABLE inbox_events ENABLE ROW LEVEL SECURITY;


-- MIGRATION SEPARATOR --

-- 00004_outbox_and_side_effect.sql

-- Transactional Outbox/Inbox + side_effect_operations ledger + work_queue with fencing

CREATE TABLE outbox_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  aggregate_type TEXT NOT NULL, -- goal, plan, queue, event_fabric
  aggregate_id UUID NOT NULL,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  published_at TIMESTAMPTZ,
  publish_attempt INT NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING','PUBLISHED','FAILED'))
);

CREATE INDEX outbox_status_created_idx ON outbox_events(status, created_at);

ALTER TABLE outbox_events ENABLE ROW LEVEL SECURITY;

-- Side-effect operations ledger for effectively-once/idempotent
CREATE TABLE side_effect_operations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  operation_key TEXT UNIQUE NOT NULL, -- semantic e.g., G000001:P000001-S01:supplier_X:RFQ:v1
  capability_id TEXT NOT NULL,
  goal_id UUID,
  legal_entity_id UUID REFERENCES legal_entities(id),
  request_hash TEXT NOT NULL, -- canonical hash of normalized params
  provider_reference TEXT, -- provider message_id/order_id
  state TEXT NOT NULL DEFAULT 'PENDING' CHECK (state IN ('PENDING','SENT','CONFIRMED','FAILED')),
  reconciliation_state TEXT NOT NULL DEFAULT 'NONE' CHECK (reconciliation_state IN ('NONE','NEEDS_RECONCILIATION','RECONCILED','FAILED_PERMANENT')),
  attempt INT NOT NULL DEFAULT 0,
  last_reconciled_at TIMESTAMPTZ,
  idempotency_key TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX side_effect_goal_idx ON side_effect_operations(goal_id);
CREATE INDEX side_effect_state_idx ON side_effect_operations(state, reconciliation_state);

ALTER TABLE side_effect_operations ENABLE ROW LEVEL SECURITY;

-- Work queue with fencing token
CREATE TABLE work_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id UUID,
  plan_id UUID,
  step_id UUID,
  capability_id TEXT NOT NULL,
  params JSONB,
  priority INT NOT NULL DEFAULT 0,
  due_at TIMESTAMPTZ,
  queued_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'QUEUED' CHECK (status IN ('QUEUED','LEASED','EXECUTING','EXECUTED','FAILED','HANDBACK')),
  lease_owner TEXT,
  lease_timestamp TIMESTAMPTZ,
  lease_expiry TIMESTAMPTZ,
  fencing_token BIGINT NOT NULL DEFAULT 1,
  attempt INT NOT NULL DEFAULT 0,
  worker_version TEXT,
  idempotency_key TEXT,
  operation_key_ref TEXT REFERENCES side_effect_operations(operation_key),
  handoff JSONB,
  wake_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(id, fencing_token) -- for fencing validation
);

CREATE INDEX work_queue_ordering_idx ON work_queue(priority DESC, due_at ASC, queued_at ASC, id ASC);
CREATE INDEX work_queue_status_lease_idx ON work_queue(status, lease_expiry);

ALTER TABLE work_queue ENABLE ROW LEVEL SECURITY;

-- Function to acquire lease with fencing token increment
CREATE OR REPLACE FUNCTION acquire_lease(p_queue_id UUID, p_owner TEXT, p_ttl_seconds INT)
RETURNS BIGINT LANGUAGE plpgsql AS $$
DECLARE v_new_token BIGINT;
BEGIN
  UPDATE work_queue
  SET fencing_token = fencing_token + 1,
      lease_owner = p_owner,
      lease_timestamp = now(),
      lease_expiry = now() + (p_ttl_seconds || ' seconds')::INTERVAL,
      status = 'LEASED',
      attempt = attempt + 1
  WHERE id = p_queue_id AND (status = 'QUEUED' OR lease_expiry < now() OR status = 'HANDBACK')
  RETURNING fencing_token INTO v_new_token;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Lease acquire failed for %', p_queue_id;
  END IF;
  RETURN v_new_token;
END;
$$;

-- Function to commit with fencing validation
CREATE OR REPLACE FUNCTION commit_with_fencing(p_queue_id UUID, p_token BIGINT)
RETURNS BOOLEAN LANGUAGE plpgsql AS $$
DECLARE v_updated INT;
BEGIN
  UPDATE work_queue SET status = 'EXECUTED' WHERE id = p_queue_id AND fencing_token = p_token;
  GET DIAGNOSTICS v_updated = ROW_COUNT;
  RETURN v_updated = 1;
END;
$$;


-- MIGRATION SEPARATOR --

-- 00005_world_facts_memory.sql

-- World facts append-only + deterministic projection + memory
CREATE TABLE world_facts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  domain TEXT NOT NULL,
  attribute TEXT NOT NULL,
  value JSONB NOT NULL,
  scope JSONB, -- legal_entity/product/supplier
  status TEXT NOT NULL CHECK (status IN ('VERIFIED','INFERRED','ESTIMATED','UNKNOWN','NOT_OBSERVABLE','CONFLICTED','STALE')),
  source TEXT NOT NULL,
  source_timestamp TIMESTAMPTZ NOT NULL,
  freshness TIMESTAMPTZ,
  confidence FLOAT NOT NULL DEFAULT 0.5,
  evidence_id UUID,
  world_model_version INT,
  event_seq_ref BIGINT REFERENCES event_fabric_events(event_seq),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  superseded_at TIMESTAMPTZ
);

CREATE INDEX world_facts_entity_attr_scope_idx ON world_facts(entity_type, entity_id, attribute, (scope::TEXT));
CREATE INDEX world_facts_status_timestamp_idx ON world_facts(status, source_timestamp DESC, confidence DESC, event_seq_ref DESC);

ALTER TABLE world_facts ENABLE ROW LEVEL SECURITY;

-- Deterministic current-state projection view
CREATE OR REPLACE VIEW current_world_facts AS
SELECT DISTINCT ON (entity_type, entity_id, attribute, scope) *
FROM world_facts
WHERE status = 'VERIFIED'
ORDER BY entity_type, entity_id, attribute, scope, source_timestamp DESC, confidence DESC, event_seq_ref DESC;

CREATE TABLE memory_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('OPERATIONAL','COMMERCIAL','OWNER_DECISION','FORMAL_RULE')),
  statement TEXT NOT NULL,
  scope JSONB,
  source TEXT NOT NULL,
  confidence FLOAT NOT NULL DEFAULT 0.5,
  support_count INT NOT NULL DEFAULT 1,
  first_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_confirmed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  status TEXT NOT NULL CHECK (status IN ('OBSERVED','REINFORCED','PROPOSED_RULE','APPROVED_RULE','REJECTED','SUPERSEDED')),
  supersedes UUID REFERENCES memory_records(id),
  superseded_by UUID REFERENCES memory_records(id),
  embedding VECTOR,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE memory_records ENABLE ROW LEVEL SECURITY;


-- MIGRATION SEPARATOR --

-- 00006_policy_approvals_verification.sql

-- Policy envelopes, approvals bound to exact scope, verification contracts

CREATE TABLE policy_envelopes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  policy_id TEXT UNIQUE NOT NULL, -- e.g., bol_price_update_policy
  domain TEXT NOT NULL,
  description TEXT,
  risk_class TEXT NOT NULL CHECK (risk_class = 'YELLOW'),
  constraints JSONB NOT NULL, -- {max_discount_pct, min_margin, allowed_hours, legal_entity_scope}
  valid_from TIMESTAMPTZ NOT NULL,
  valid_to TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('DRAFT','APPROVED','EXPIRED','REVOKED')),
  approved_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE policy_envelopes ENABLE ROW LEVEL SECURITY;

CREATE TABLE approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id UUID,
  capability_id TEXT NOT NULL,
  params_hash TEXT NOT NULL, -- canonical hash of normalized params
  legal_entity_id UUID REFERENCES legal_entities(id),
  limits JSONB, -- {amount,currency,qty,max_discount}
  policy_id TEXT REFERENCES policy_envelopes(policy_id),
  expiry_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  used_count INT NOT NULL DEFAULT 0,
  max_uses INT NOT NULL DEFAULT 1,
  authority_class TEXT NOT NULL CHECK (authority_class IN ('GREEN','YELLOW','RED')),
  requested_by TEXT,
  approved_by TEXT,
  status TEXT NOT NULL CHECK (status IN ('PENDING','APPROVED','REJECTED','EXPIRED','USED')),
  evidence_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(capability_id, params_hash, legal_entity_id, policy_id, expiry_at)
);

CREATE INDEX approvals_scope_idx ON approvals(capability_id, params_hash, legal_entity_id, status, expiry_at);

ALTER TABLE approvals ENABLE ROW LEVEL SECURITY;

CREATE TABLE verification_contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  capability_id TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  verification_method TEXT NOT NULL CHECK (verification_method IN ('api_readback','db_query','external_event','list_search')),
  required_evidence_fields JSONB NOT NULL,
  independent_query_template JSONB NOT NULL, -- template for independent query, not trusting execution result
  must_not_trust_execution_result BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE verification_contracts ENABLE ROW LEVEL SECURITY;

-- Insert default verification contracts
INSERT INTO verification_contracts(capability_id, description, verification_method, required_evidence_fields, independent_query_template)
VALUES
('gmail_send','Verify email exists in Sent via operation key header search independent of claimed message_id','list_search','{"provider_message_id": "string", "operation_key_header": "string"}'::JSONB,'{"api": "gmail", "method": "list", "query": "in:sent X-SAM-Operation-Key={{operation_key}}"}'::JSONB),
('bol_update_price','Verify price via independent get listing','api_readback','{"ean": "string", "expected_price": "number"}'::JSONB,'{"api": "bol", "method": "get_listing", "params": {"ean": "{{ean}}"}}'::JSONB),
('supplier_search_own','Verify supplier search via db query','db_query','{"count": "number"}'::JSONB,'{"table": "parties", "count_query": "SELECT count(*) FROM parties"}'::JSONB);

CREATE TABLE executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  queue_id UUID REFERENCES work_queue(id),
  goal_id UUID,
  plan_id UUID,
  plan_hash TEXT NOT NULL,
  execution_hash TEXT NOT NULL,
  capability_id TEXT NOT NULL,
  params JSONB,
  result JSONB,
  evidence JSONB, -- independent evidence, not just claimed result
  fencing_token BIGINT NOT NULL,
  operation_key_ref TEXT REFERENCES side_effect_operations(operation_key),
  actor TEXT NOT NULL,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  finished_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'PENDING'
);

ALTER TABLE executions ENABLE ROW LEVEL SECURITY;

CREATE TABLE verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  execution_id UUID REFERENCES executions(id),
  verifier TEXT NOT NULL,
  method TEXT NOT NULL,
  contract_id UUID REFERENCES verification_contracts(id),
  independent_evidence JSONB NOT NULL, -- must not be execution's claimed result
  result TEXT NOT NULL CHECK (result IN ('VERIFIED','FAILED','INCONCLUSIVE','NOT_OBSERVABLE')),
  checked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  plan_hash TEXT NOT NULL,
  execution_hash TEXT NOT NULL,
  operation_key_ref TEXT REFERENCES side_effect_operations(operation_key)
);

ALTER TABLE verifications ENABLE ROW LEVEL SECURITY;


-- MIGRATION SEPARATOR --

-- 00007_goals_plans_financial.sql

-- Goals, plans, financial immutability
CREATE TABLE goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id TEXT UNIQUE NOT NULL, -- G000001 generated via next_business_id
  owner_id UUID REFERENCES users(id),
  company_scope UUID REFERENCES legal_entities(id),
  domain TEXT,
  objective TEXT NOT NULL,
  state TEXT NOT NULL DEFAULT 'NEW' CHECK (state IN ('NEW','MODELING','PLANNING','EXECUTING','WAITING_EXTERNAL','WAITING_OWNER','BLOCKED','VERIFYING','REPLANNING','COMPLETED','CANCELLED','FAILED')),
  priority INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  next_wake_at TIMESTAMPTZ,
  current_plan_id UUID,
  world_model_version INT,
  authority_ceiling TEXT CHECK (authority_ceiling IN ('GREEN','YELLOW','RED')),
  parent_goal_id UUID REFERENCES goals(id),
  completion_definition TEXT,
  replan_attempts INT NOT NULL DEFAULT 0,
  replan_reason TEXT
);

ALTER TABLE goals ENABLE ROW LEVEL SECURITY;

CREATE TABLE plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id UUID REFERENCES goals(id),
  version INT NOT NULL DEFAULT 1,
  goal_assumptions JSONB,
  constraints JSONB,
  dependencies JSONB,
  steps JSONB,
  plan_hash TEXT NOT NULL, -- canonical stable hash
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(goal_id, version)
);

ALTER TABLE plans ENABLE ROW LEVEL SECURITY;

-- Financial documents immutability at DB level
CREATE TABLE financial_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id TEXT UNIQUE NOT NULL,
  legal_entity_id UUID NOT NULL REFERENCES legal_entities(id),
  doc_type TEXT NOT NULL CHECK (doc_type IN ('quote','invoice','credit_note')),
  payload JSONB NOT NULL,
  issued_at TIMESTAMPTZ,
  is_immutable BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION prevent_financial_mutation() RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF OLD.is_immutable = true THEN
    RAISE EXCEPTION 'financial_documents is immutable once issued, id=%, business_id=%', OLD.id, OLD.business_id;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER financial_immutable_no_update BEFORE UPDATE OR DELETE ON financial_documents
FOR EACH ROW EXECUTE FUNCTION prevent_financial_mutation();

ALTER TABLE financial_documents ENABLE ROW LEVEL SECURITY;

-- Minimal model gateway tables for Phase 1
CREATE TABLE model_providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id TEXT UNIQUE NOT NULL,
  models JSONB NOT NULL,
  capabilities JSONB,
  cost_per_1k_input FLOAT,
  cost_per_1k_output FLOAT,
  privacy_class_allowed JSONB,
  health TEXT NOT NULL DEFAULT 'HEALTHY'
);

CREATE TABLE model_calls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task TEXT NOT NULL,
  provider TEXT NOT NULL,
  model TEXT NOT NULL,
  model_version TEXT,
  reason_selected TEXT,
  tokens INT,
  cost FLOAT,
  latency_ms INT,
  retry_count INT DEFAULT 0,
  success BOOLEAN NOT NULL,
  verification_result TEXT,
  data_classification TEXT NOT NULL, -- classified locally before call
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE model_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE model_calls ENABLE ROW LEVEL SECURITY;
