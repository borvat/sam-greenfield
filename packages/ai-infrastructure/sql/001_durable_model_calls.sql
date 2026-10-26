-- PROPOSED, NOT auto-discovered by SAM migrator. Apply ONLY to an isolated test DB
-- until shared-schema ownership and deployment are explicitly coordinated.
BEGIN;
CREATE TABLE sam_ai_project_state (
  project_id TEXT NOT NULL, environment TEXT NOT NULL CHECK(environment IN ('test','production')),
  org_id UUID NOT NULL REFERENCES organizations(id), legal_entity_id UUID NOT NULL REFERENCES legal_entities(id),
  enabled BOOLEAN NOT NULL DEFAULT true, PRIMARY KEY(project_id,environment)
);
CREATE TABLE sam_ai_service_grants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), actor TEXT NOT NULL, service_id TEXT NOT NULL,
  project_id TEXT NOT NULL, environment TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL, revoked_at TIMESTAMPTZ, enabled BOOLEAN NOT NULL DEFAULT true,
  providers JSONB NOT NULL, capabilities JSONB NOT NULL, classifications JSONB NOT NULL,
  FOREIGN KEY(project_id,environment) REFERENCES sam_ai_project_state(project_id,environment),
  UNIQUE(actor,environment)
);
CREATE TABLE sam_ai_budget_periods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), environment TEXT NOT NULL CHECK(environment IN ('test','production')),
  kind TEXT NOT NULL CHECK(kind IN ('GLOBAL','PROJECT','GOAL','TASK')), scope_key TEXT NOT NULL,
  starts_at TIMESTAMPTZ NOT NULL, ends_at TIMESTAMPTZ NOT NULL CHECK(ends_at>starts_at),
  limit_microusd BIGINT NOT NULL CHECK(limit_microusd>=0), revision INTEGER NOT NULL DEFAULT 1,
  approval_id UUID NOT NULL REFERENCES approvals(id),
  UNIQUE(environment,kind,scope_key,starts_at)
);
ALTER TABLE model_calls
  ADD COLUMN ai_project_id TEXT,
  ADD COLUMN ai_environment TEXT,
  ADD COLUMN ai_grant_id UUID REFERENCES sam_ai_service_grants(id),
  ADD COLUMN ai_approval_id UUID REFERENCES approvals(id),
  ADD COLUMN ai_goal_id UUID REFERENCES goals(id),
  ADD COLUMN ai_queue_id UUID REFERENCES work_queue(id),
  ADD COLUMN ai_execution_id UUID REFERENCES executions(id),
  ADD COLUMN ai_attempt_id TEXT,
  ADD COLUMN ai_request_key TEXT,
  ADD COLUMN ai_content_sha256 TEXT,
  ADD COLUMN ai_owner_sha256 TEXT,
  ADD COLUMN ai_state TEXT CHECK(ai_state IN ('RESERVED','DISPATCHING','UNRESOLVED','SUCCEEDED','NOT_SENT','RECONCILED')),
  ADD COLUMN ai_estimated_microusd BIGINT CHECK(ai_estimated_microusd>=0),
  ADD COLUMN ai_reserved_microusd BIGINT CHECK(ai_reserved_microusd>=0),
  ADD COLUMN ai_exposure_microusd BIGINT CHECK(ai_exposure_microusd>=0),
  ADD COLUMN ai_computed_microusd BIGINT CHECK(ai_computed_microusd>=0),
  ADD COLUMN ai_invoiced_microusd BIGINT CHECK(ai_invoiced_microusd>=0),
  ADD COLUMN ai_input_tokens BIGINT CHECK(ai_input_tokens>=0),
  ADD COLUMN ai_output_tokens BIGINT CHECK(ai_output_tokens>=0),
  ADD COLUMN ai_cached_tokens BIGINT CHECK(ai_cached_tokens>=0 AND ai_cached_tokens<=ai_input_tokens),
  ADD COLUMN ai_requested_model TEXT,
  ADD COLUMN ai_reported_model TEXT,
  ADD COLUMN ai_provider_request_sha256 TEXT,
  ADD COLUMN ai_result_sha256 TEXT,
  ADD COLUMN ai_tariff JSONB,
  ADD COLUMN ai_dispatched_at TIMESTAMPTZ,
  ADD COLUMN ai_finished_at TIMESTAMPTZ,
  ADD CONSTRAINT ai_project_scope FOREIGN KEY(ai_project_id,ai_environment) REFERENCES sam_ai_project_state(project_id,environment),
  ADD CONSTRAINT ai_request_unique UNIQUE(ai_project_id,ai_environment,ai_request_key),
  ADD CONSTRAINT ai_unknown_not_zero CHECK(ai_state IS NULL OR (
    cost IS NULL AND (ai_state NOT IN ('RESERVED','DISPATCHING','UNRESOLVED') OR
      (ai_computed_microusd IS NULL AND ai_input_tokens IS NULL AND ai_output_tokens IS NULL AND ai_cached_tokens IS NULL AND tokens IS NULL)))),
  ADD CONSTRAINT ai_exposure_consistent CHECK(ai_state IS NULL OR
    (ai_state='NOT_SENT' AND ai_exposure_microusd=0) OR
    (ai_state IN ('RESERVED','DISPATCHING','UNRESOLVED') AND ai_exposure_microusd=ai_reserved_microusd) OR
    ai_state IN ('SUCCEEDED','RECONCILED')),
  ADD CONSTRAINT ai_full_record CHECK(ai_state IS NULL OR (
    ai_project_id IS NOT NULL AND ai_environment IS NOT NULL AND ai_request_key IS NOT NULL AND
    ai_content_sha256 IS NOT NULL AND ai_content_sha256 ~ '^[a-f0-9]{64}$' AND
    ai_owner_sha256 IS NOT NULL AND ai_owner_sha256 ~ '^[a-f0-9]{64}$' AND ai_grant_id IS NOT NULL AND ai_approval_id IS NOT NULL AND
    ai_goal_id IS NOT NULL AND ai_queue_id IS NOT NULL AND ai_attempt_id IS NOT NULL AND
    ai_tariff IS NOT NULL AND ai_requested_model IS NOT NULL AND
    ai_estimated_microusd IS NOT NULL AND ai_reserved_microusd IS NOT NULL AND ai_exposure_microusd IS NOT NULL)),
  ADD CONSTRAINT ai_success_usage_required CHECK(ai_state IS DISTINCT FROM 'SUCCEEDED' OR (
    ai_computed_microusd IS NOT NULL AND ai_input_tokens IS NOT NULL AND ai_output_tokens IS NOT NULL AND
    ai_cached_tokens IS NOT NULL AND ai_reported_model IS NOT NULL AND ai_result_sha256 IS NOT NULL));
CREATE TABLE sam_ai_call_budgets (
  model_call_id UUID NOT NULL REFERENCES model_calls(id),
  budget_period_id UUID NOT NULL REFERENCES sam_ai_budget_periods(id),
  PRIMARY KEY(model_call_id,budget_period_id)
);
CREATE TABLE sam_ai_billing_evidence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), model_call_id UUID NOT NULL REFERENCES model_calls(id),
  kind TEXT NOT NULL CHECK(kind IN ('PROVIDER_RECEIPT','VERIFIED_INVOICE','CONFIRMED_NOT_SENT')),
  amount_microusd BIGINT CHECK(amount_microusd>=0), source_sha256 TEXT NOT NULL CHECK(source_sha256 ~ '^[a-f0-9]{64}$'),
  actor TEXT NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TRIGGER sam_ai_evidence_immutable BEFORE UPDATE OR DELETE ON sam_ai_billing_evidence
  FOR EACH ROW EXECUTE FUNCTION prevent_audit_mutation();
CREATE FUNCTION sam_ai_preserve_request_identity() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF OLD.ai_state IS NOT NULL AND
    ROW(OLD.ai_project_id,OLD.ai_environment,OLD.ai_request_key,OLD.ai_content_sha256,OLD.ai_owner_sha256,
      OLD.ai_grant_id,OLD.ai_approval_id,OLD.ai_goal_id,OLD.ai_queue_id,OLD.ai_execution_id,OLD.ai_attempt_id,
      OLD.ai_estimated_microusd,OLD.ai_reserved_microusd,OLD.ai_requested_model,OLD.ai_tariff)
    IS DISTINCT FROM
    ROW(NEW.ai_project_id,NEW.ai_environment,NEW.ai_request_key,NEW.ai_content_sha256,NEW.ai_owner_sha256,
      NEW.ai_grant_id,NEW.ai_approval_id,NEW.ai_goal_id,NEW.ai_queue_id,NEW.ai_execution_id,NEW.ai_attempt_id,
      NEW.ai_estimated_microusd,NEW.ai_reserved_microusd,NEW.ai_requested_model,NEW.ai_tariff)
  THEN RAISE EXCEPTION 'AI_REQUEST_IDENTITY_IMMUTABLE'; END IF;
  RETURN NEW;
END; $$;
CREATE TRIGGER sam_ai_request_identity_immutable BEFORE UPDATE ON model_calls
  FOR EACH ROW EXECUTE FUNCTION sam_ai_preserve_request_identity();
CREATE FUNCTION sam_ai_prevent_call_deletion() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF OLD.ai_state IS NOT NULL THEN RAISE EXCEPTION 'AI_CALL_HISTORY_IMMUTABLE'; END IF;
  RETURN OLD;
END; $$;
CREATE TRIGGER sam_ai_call_no_delete BEFORE DELETE ON model_calls
  FOR EACH ROW EXECUTE FUNCTION sam_ai_prevent_call_deletion();
-- Runtime is a trusted SAM component; none of these tables is exposed to agents.
-- Grant actual roles only after existing SAM RLS/tenant policies are coordinated.
REVOKE ALL ON sam_ai_project_state,sam_ai_service_grants,sam_ai_budget_periods,
  sam_ai_call_budgets,sam_ai_billing_evidence FROM PUBLIC;
COMMIT;
