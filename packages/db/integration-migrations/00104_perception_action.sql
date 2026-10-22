-- Opt-in only. No implicit provider/account grants or monitor registrations.
CREATE TABLE entity_capability_bindings (
 legal_entity_id UUID NOT NULL REFERENCES legal_entities(id),
 capability_id TEXT NOT NULL,
 enabled BOOLEAN NOT NULL DEFAULT false,
 allow_side_effect BOOLEAN NOT NULL DEFAULT false,
 PRIMARY KEY(legal_entity_id,capability_id)
);
CREATE TABLE perception_sources (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 legal_entity_id UUID NOT NULL REFERENCES legal_entities(id),
 provider TEXT NOT NULL CHECK(provider IN ('GMAIL','BOL','OSS')),
 capability_id TEXT NOT NULL,
 params JSONB NOT NULL,
 projection_paths JSONB NOT NULL DEFAULT '[]',
 enabled BOOLEAN NOT NULL DEFAULT false,
 interval_seconds INT NOT NULL DEFAULT 900 CHECK(interval_seconds BETWEEN 300 AND 86400),
 next_poll_at TIMESTAMPTZ NOT NULL DEFAULT now(),
 last_hash TEXT,
 last_observed_at TIMESTAMPTZ,
 created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
 FOREIGN KEY(legal_entity_id,capability_id) REFERENCES entity_capability_bindings(legal_entity_id,capability_id)
);
CREATE TABLE perception_polls (
 source_id UUID NOT NULL REFERENCES perception_sources(id),
 goal_id UUID NOT NULL UNIQUE REFERENCES goals(id),
 created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
 PRIMARY KEY(source_id,goal_id)
);
CREATE TABLE perception_observations (
 source_id UUID NOT NULL REFERENCES perception_sources(id),
 execution_id UUID NOT NULL REFERENCES executions(id),
 verification_id UUID NOT NULL REFERENCES verifications(id),
 fingerprint TEXT NOT NULL,
 classification TEXT NOT NULL CHECK(classification IN ('BASELINE','UNCHANGED','CHANGED','STALE')),
 observed_at TIMESTAMPTZ NOT NULL,
 event_seq BIGINT REFERENCES event_fabric_events(event_seq),
 PRIMARY KEY(source_id,execution_id)
);
CREATE INDEX perception_due ON perception_sources(next_poll_at) WHERE enabled;
ALTER TABLE entity_capability_bindings ENABLE ROW LEVEL SECURITY;
ALTER TABLE perception_sources ENABLE ROW LEVEL SECURITY;
CREATE POLICY perception_binding_isolation ON entity_capability_bindings
 USING(legal_entity_id::text=nullif(current_setting('app.current_legal_entity_id',true),''))
 WITH CHECK(legal_entity_id::text=nullif(current_setting('app.current_legal_entity_id',true),''));
CREATE POLICY perception_source_isolation ON perception_sources
 USING(legal_entity_id::text=nullif(current_setting('app.current_legal_entity_id',true),''))
 WITH CHECK(legal_entity_id::text=nullif(current_setting('app.current_legal_entity_id',true),''));
REVOKE ALL ON perception_polls,perception_observations FROM PUBLIC;
