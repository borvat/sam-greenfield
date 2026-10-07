CREATE TABLE policy_envelopes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  policy_id TEXT UNIQUE NOT NULL, domain TEXT NOT NULL, description TEXT,
  risk_class TEXT NOT NULL CHECK (risk_class = 'YELLOW'),
  constraints JSONB NOT NULL, valid_from TIMESTAMPTZ NOT NULL, valid_to TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('DRAFT','APPROVED','EXPIRED','REVOKED')),
  approved_by TEXT, created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE policy_envelopes ENABLE ROW LEVEL SECURITY;
CREATE TABLE approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), goal_id UUID, capability_id TEXT NOT NULL,
  params_hash TEXT NOT NULL, legal_entity_id UUID REFERENCES legal_entities(id), limits JSONB,
  policy_id TEXT REFERENCES policy_envelopes(policy_id), expiry_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ, used_count INT NOT NULL DEFAULT 0, max_uses INT NOT NULL DEFAULT 1,
  authority_class TEXT NOT NULL CHECK (authority_class IN ('GREEN','YELLOW','RED')),
  requested_by TEXT, approved_by TEXT,
  status TEXT NOT NULL CHECK (status IN ('PENDING','APPROVED','REJECTED','EXPIRED','USED')),
  evidence_id UUID, created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(capability_id, params_hash, legal_entity_id, policy_id, expiry_at)
);
CREATE INDEX approvals_scope_idx ON approvals(capability_id, params_hash, legal_entity_id, status, expiry_at);
ALTER TABLE approvals ENABLE ROW LEVEL SECURITY;
CREATE TABLE verification_contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), capability_id TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  verification_method TEXT NOT NULL CHECK (verification_method IN ('api_readback','db_query','external_event','list_search')),
  required_evidence_fields JSONB NOT NULL, independent_query_template JSONB NOT NULL,
  must_not_trust_execution_result BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE verification_contracts ENABLE ROW LEVEL SECURITY;
INSERT INTO verification_contracts(capability_id, description, verification_method, required_evidence_fields, independent_query_template) VALUES
('gmail_send','Verify email exists in Sent via operation key','list_search','{"provider_message_id":"string"}'::JSONB,'{"api":"gmail","method":"list"}'::JSONB),
('bol_update_price','Verify price via independent get','api_readback','{"ean":"string"}'::JSONB,'{"api":"bol"}'::JSONB),
('supplier_search_own','Verify via db query','db_query','{"count":"number"}'::JSONB,'{"table":"parties"}'::JSONB);
CREATE TABLE executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), queue_id UUID REFERENCES work_queue(id),
  goal_id UUID, plan_id UUID, plan_hash TEXT NOT NULL, execution_hash TEXT NOT NULL,
  capability_id TEXT NOT NULL, params JSONB, result JSONB, evidence JSONB,
  fencing_token BIGINT NOT NULL, operation_key_ref TEXT REFERENCES side_effect_operations(operation_key),
  actor TEXT NOT NULL, started_at TIMESTAMPTZ NOT NULL DEFAULT now(), finished_at TIMESTAMPTZ, status TEXT NOT NULL DEFAULT 'PENDING'
);
ALTER TABLE executions ENABLE ROW LEVEL SECURITY;
CREATE TABLE verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), execution_id UUID REFERENCES executions(id),
  verifier TEXT NOT NULL, method TEXT NOT NULL, contract_id UUID REFERENCES verification_contracts(id),
  independent_evidence JSONB NOT NULL,
  result TEXT NOT NULL CHECK (result IN ('VERIFIED','FAILED','INCONCLUSIVE','NOT_OBSERVABLE')),
  checked_at TIMESTAMPTZ NOT NULL DEFAULT now(), plan_hash TEXT NOT NULL, execution_hash TEXT NOT NULL,
  operation_key_ref TEXT REFERENCES side_effect_operations(operation_key)
);
ALTER TABLE verifications ENABLE ROW LEVEL SECURITY;
