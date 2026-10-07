CREATE SEQUENCE global_event_seq_seq START 1;
CREATE TABLE event_fabric_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_seq BIGINT NOT NULL DEFAULT nextval('global_event_seq_seq') UNIQUE,
  source TEXT NOT NULL, source_event_id TEXT, event_type TEXT NOT NULL,
  entity_refs JSONB, occurred_at TIMESTAMPTZ NOT NULL, received_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  payload JSONB, dedup_key TEXT UNIQUE, provenance JSONB, outbox_ref UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX event_fabric_source_seq_idx ON event_fabric_events(source, event_seq);
CREATE INDEX event_fabric_global_seq_idx ON event_fabric_events(event_seq);
CREATE INDEX event_fabric_dedup_idx ON event_fabric_events(dedup_key);
ALTER TABLE event_fabric_events ENABLE ROW LEVEL SECURITY;
CREATE TABLE inbox_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consumer_id TEXT NOT NULL, event_seq BIGINT NOT NULL, dedup_key TEXT NOT NULL,
  source_event_id TEXT, payload JSONB,
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING','PROCESSED','FAILED')),
  processed_at TIMESTAMPTZ, created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(consumer_id, dedup_key)
);
CREATE INDEX inbox_consumer_seq_idx ON inbox_events(consumer_id, event_seq);
ALTER TABLE inbox_events ENABLE ROW LEVEL SECURITY;
