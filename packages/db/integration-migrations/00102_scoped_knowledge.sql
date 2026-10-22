-- Staged feature: no extraction or retrieval until SAM_KNOWLEDGE_ENABLED=true.
CREATE TABLE knowledge_records (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 legal_entity_id UUID NOT NULL REFERENCES legal_entities(id),
 kind TEXT NOT NULL CHECK (kind IN ('SOURCE_FACT','INFERENCE','OWNER_DECISION')),
 statement TEXT NOT NULL CHECK (length(statement) BETWEEN 3 AND 1500),
 execution_id UUID REFERENCES executions(id),
 verification_id UUID REFERENCES verifications(id),
 goal_id UUID NOT NULL REFERENCES goals(id),
 source_key TEXT NOT NULL,
 source_timestamp TIMESTAMPTZ NOT NULL,
 expires_at TIMESTAMPTZ NOT NULL,
 approved_by TEXT,
 approval_id UUID REFERENCES approvals(id),
 supersedes UUID REFERENCES knowledge_records(id),
 superseded_at TIMESTAMPTZ,
 created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
 CHECK (expires_at > source_timestamp),
 CHECK (kind <> 'SOURCE_FACT' OR (execution_id IS NOT NULL AND verification_id IS NOT NULL)),
 CHECK (kind <> 'OWNER_DECISION' OR (approved_by IS NOT NULL AND length(trim(approved_by)) > 0 AND approval_id IS NOT NULL)),
 UNIQUE (legal_entity_id, kind, goal_id, source_key)
);
CREATE INDEX knowledge_scope_freshness ON knowledge_records(legal_entity_id,expires_at) WHERE superseded_at IS NULL;
ALTER TABLE knowledge_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY knowledge_entity_isolation ON knowledge_records
 USING (legal_entity_id::text = nullif(current_setting('app.current_legal_entity_id',true),''))
 WITH CHECK (legal_entity_id::text = nullif(current_setting('app.current_legal_entity_id',true),''));
