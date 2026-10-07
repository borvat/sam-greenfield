CREATE TABLE goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), business_id TEXT UNIQUE NOT NULL,
  owner_id UUID REFERENCES users(id), company_scope UUID REFERENCES legal_entities(id),
  domain TEXT, objective TEXT NOT NULL,
  state TEXT NOT NULL DEFAULT 'NEW' CHECK (state IN ('NEW','MODELING','PLANNING','EXECUTING','WAITING_EXTERNAL','WAITING_OWNER','BLOCKED','VERIFYING','REPLANNING','COMPLETED','CANCELLED','FAILED')),
  priority INT NOT NULL DEFAULT 0, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  next_wake_at TIMESTAMPTZ, current_plan_id UUID, world_model_version INT,
  authority_ceiling TEXT CHECK (authority_ceiling IN ('GREEN','YELLOW','RED')),
  parent_goal_id UUID REFERENCES goals(id), completion_definition TEXT,
  replan_attempts INT NOT NULL DEFAULT 0, replan_reason TEXT
);
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
CREATE TABLE plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), goal_id UUID REFERENCES goals(id),
  version INT NOT NULL DEFAULT 1, goal_assumptions JSONB, constraints JSONB, dependencies JSONB, steps JSONB, plan_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), UNIQUE(goal_id, version)
);
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
CREATE TABLE financial_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), business_id TEXT UNIQUE NOT NULL,
  legal_entity_id UUID NOT NULL REFERENCES legal_entities(id),
  doc_type TEXT NOT NULL CHECK (doc_type IN ('quote','invoice','credit_note')),
  payload JSONB NOT NULL, issued_at TIMESTAMPTZ, is_immutable BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE OR REPLACE FUNCTION prevent_financial_mutation() RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN IF OLD.is_immutable = true THEN RAISE EXCEPTION 'financial_documents is immutable once issued, id=%, business_id=%', OLD.id, OLD.business_id; END IF; RETURN NEW; END;
$$;
CREATE TRIGGER financial_immutable_no_update BEFORE UPDATE OR DELETE ON financial_documents FOR EACH ROW EXECUTE FUNCTION prevent_financial_mutation();
ALTER TABLE financial_documents ENABLE ROW LEVEL SECURITY;
CREATE TABLE model_providers (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), provider_id TEXT UNIQUE NOT NULL, models JSONB NOT NULL, capabilities JSONB, cost_per_1k_input FLOAT, cost_per_1k_output FLOAT, privacy_class_allowed JSONB, health TEXT NOT NULL DEFAULT 'HEALTHY');
CREATE TABLE model_calls (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), task TEXT NOT NULL, provider TEXT NOT NULL, model TEXT NOT NULL, model_version TEXT, reason_selected TEXT, tokens INT, cost FLOAT, latency_ms INT, retry_count INT DEFAULT 0, success BOOLEAN NOT NULL, verification_result TEXT, data_classification TEXT NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now());
ALTER TABLE model_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE model_calls ENABLE ROW LEVEL SECURITY;
