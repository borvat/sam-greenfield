CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor TEXT NOT NULL, agent_id UUID, goal_id UUID, action TEXT NOT NULL,
  entity_type TEXT, entity_id UUID, before_ref JSONB, after_ref JSONB, source TEXT,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  authority_class TEXT CHECK (authority_class IN ('GREEN','YELLOW','RED')),
  approval_id UUID, result TEXT, evidence_id UUID, event_seq_ref BIGINT
);
CREATE OR REPLACE FUNCTION prevent_audit_mutation() RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN RAISE EXCEPTION 'audit_log is append-only, UPDATE/DELETE forbidden'; END;
$$;
CREATE TRIGGER audit_no_update BEFORE UPDATE OR DELETE ON audit_log FOR EACH ROW EXECUTE FUNCTION prevent_audit_mutation();
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
CREATE INDEX audit_log_timestamp_idx ON audit_log(timestamp);
