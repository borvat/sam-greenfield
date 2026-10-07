CREATE TABLE world_facts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL, entity_id UUID NOT NULL, domain TEXT NOT NULL, attribute TEXT NOT NULL,
  value JSONB NOT NULL, scope JSONB,
  status TEXT NOT NULL CHECK (status IN ('VERIFIED','INFERRED','ESTIMATED','UNKNOWN','NOT_OBSERVABLE','CONFLICTED','STALE')),
  source TEXT NOT NULL, source_timestamp TIMESTAMPTZ NOT NULL, freshness TIMESTAMPTZ,
  confidence FLOAT NOT NULL DEFAULT 0.5, evidence_id UUID, world_model_version INT,
  event_seq_ref BIGINT REFERENCES event_fabric_events(event_seq),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), superseded_at TIMESTAMPTZ
);
CREATE INDEX world_facts_entity_attr_scope_idx ON world_facts(entity_type, entity_id, attribute, (scope::TEXT));
CREATE INDEX world_facts_status_timestamp_idx ON world_facts(status, source_timestamp DESC, confidence DESC, event_seq_ref DESC);
ALTER TABLE world_facts ENABLE ROW LEVEL SECURITY;
CREATE OR REPLACE VIEW current_world_facts AS SELECT DISTINCT ON (entity_type, entity_id, attribute, scope) * FROM world_facts WHERE status = 'VERIFIED' ORDER BY entity_type, entity_id, attribute, scope, source_timestamp DESC, confidence DESC, event_seq_ref DESC;
CREATE TABLE memory_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('OPERATIONAL','COMMERCIAL','OWNER_DECISION','FORMAL_RULE')),
  statement TEXT NOT NULL, scope JSONB, source TEXT NOT NULL, confidence FLOAT NOT NULL DEFAULT 0.5,
  support_count INT NOT NULL DEFAULT 1, first_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_confirmed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  status TEXT NOT NULL CHECK (status IN ('OBSERVED','REINFORCED','PROPOSED_RULE','APPROVED_RULE','REJECTED','SUPERSEDED')),
  supersedes UUID REFERENCES memory_records(id), superseded_by UUID REFERENCES memory_records(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE memory_records ENABLE ROW LEVEL SECURITY;
