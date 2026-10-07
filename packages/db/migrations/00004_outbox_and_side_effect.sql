CREATE TABLE outbox_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  aggregate_type TEXT NOT NULL, aggregate_id UUID NOT NULL, event_type TEXT NOT NULL,
  payload JSONB NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  published_at TIMESTAMPTZ, publish_attempt INT NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING','PUBLISHED','FAILED'))
);
CREATE INDEX outbox_status_created_idx ON outbox_events(status, created_at);
ALTER TABLE outbox_events ENABLE ROW LEVEL SECURITY;

CREATE TABLE side_effect_operations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  operation_key TEXT UNIQUE NOT NULL,
  capability_id TEXT NOT NULL, goal_id UUID,
  legal_entity_id UUID REFERENCES legal_entities(id),
  request_hash TEXT NOT NULL, provider_reference TEXT,
  state TEXT NOT NULL DEFAULT 'PENDING' CHECK (state IN ('PENDING','SENT','CONFIRMED','FAILED')),
  reconciliation_state TEXT NOT NULL DEFAULT 'NONE' CHECK (reconciliation_state IN ('NONE','NEEDS_RECONCILIATION','RECONCILED','FAILED_PERMANENT')),
  attempt INT NOT NULL DEFAULT 0, last_reconciled_at TIMESTAMPTZ,
  idempotency_key TEXT, created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX side_effect_goal_idx ON side_effect_operations(goal_id);
CREATE INDEX side_effect_state_idx ON side_effect_operations(state, reconciliation_state);
ALTER TABLE side_effect_operations ENABLE ROW LEVEL SECURITY;

CREATE TABLE work_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id UUID, plan_id UUID, step_id UUID, capability_id TEXT NOT NULL, params JSONB,
  priority INT NOT NULL DEFAULT 0, due_at TIMESTAMPTZ, queued_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'QUEUED' CHECK (status IN ('QUEUED','LEASED','EXECUTING','EXECUTED','FAILED','HANDBACK')),
  lease_owner TEXT, lease_timestamp TIMESTAMPTZ, lease_expiry TIMESTAMPTZ,
  fencing_token BIGINT NOT NULL DEFAULT 1, attempt INT NOT NULL DEFAULT 0,
  worker_version TEXT, idempotency_key TEXT,
  operation_key_ref TEXT REFERENCES side_effect_operations(operation_key),
  handoff JSONB, wake_reason TEXT, created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(id, fencing_token)
);
CREATE INDEX work_queue_ordering_idx ON work_queue(priority DESC, due_at ASC, queued_at ASC, id ASC);
CREATE INDEX work_queue_status_lease_idx ON work_queue(status, lease_expiry);
ALTER TABLE work_queue ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION acquire_lease(p_queue_id UUID, p_owner TEXT, p_ttl_seconds INT) RETURNS BIGINT LANGUAGE plpgsql AS $$
DECLARE v_new_token BIGINT;
BEGIN
  UPDATE work_queue SET fencing_token = fencing_token + 1, lease_owner = p_owner, lease_timestamp = now(), lease_expiry = now() + (p_ttl_seconds || ' seconds')::INTERVAL, status = 'LEASED', attempt = attempt + 1 WHERE id = p_queue_id AND (status = 'QUEUED' OR lease_expiry < now() OR status = 'HANDBACK') RETURNING fencing_token INTO v_new_token;
  IF NOT FOUND THEN RAISE EXCEPTION 'Lease acquire failed for %', p_queue_id; END IF;
  RETURN v_new_token;
END;
$$;

CREATE OR REPLACE FUNCTION commit_with_fencing(p_queue_id UUID, p_token BIGINT) RETURNS BOOLEAN LANGUAGE plpgsql AS $$
DECLARE v_updated INT;
BEGIN UPDATE work_queue SET status = 'EXECUTED' WHERE id = p_queue_id AND fencing_token = p_token; GET DIAGNOSTICS v_updated = ROW_COUNT; RETURN v_updated = 1; END;
$$;
