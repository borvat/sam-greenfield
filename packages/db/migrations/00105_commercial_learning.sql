-- Draft only. No default grants, provider credentials, workers, tools or schedules.
CREATE TABLE commercial_grants (
 legal_entity_id UUID NOT NULL REFERENCES legal_entities(id),
 actor TEXT NOT NULL CHECK(length(trim(actor)) BETWEEN 1 AND 200),
 permission TEXT NOT NULL CHECK(permission IN ('ANALYZE','EXPERIMENT','LEARN')),
 PRIMARY KEY(legal_entity_id,actor,permission)
);
CREATE TABLE commercial_accounts (
 legal_entity_id UUID PRIMARY KEY REFERENCES legal_entities(id),
 retailer_id TEXT NOT NULL CHECK(length(retailer_id)>0)
);
CREATE TABLE commercial_analyses (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 legal_entity_id UUID NOT NULL REFERENCES legal_entities(id),
 goal_id UUID NOT NULL REFERENCES goals(id),
 input_hash TEXT NOT NULL,
 input JSONB NOT NULL,
 report_hash TEXT NOT NULL,
 payload JSONB NOT NULL,
 actor TEXT NOT NULL,
 created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
 UNIQUE(legal_entity_id,goal_id,input_hash),
 UNIQUE(legal_entity_id,id)
);
CREATE TABLE commercial_experiments (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 legal_entity_id UUID NOT NULL REFERENCES legal_entities(id),
 experiment_key TEXT NOT NULL,
 analysis_id UUID NOT NULL,
 hypothesis_id TEXT NOT NULL,
 plan JSONB NOT NULL,
 plan_hash TEXT NOT NULL,
 registered_at TIMESTAMPTZ NOT NULL DEFAULT now(),
 outcome_analysis_id UUID,
 result JSONB,
 result_hash TEXT,
 actor TEXT NOT NULL,
 UNIQUE(legal_entity_id,experiment_key),
 UNIQUE(legal_entity_id,id),
 FOREIGN KEY(legal_entity_id,analysis_id) REFERENCES commercial_analyses(legal_entity_id,id),
 FOREIGN KEY(legal_entity_id,outcome_analysis_id) REFERENCES commercial_analyses(legal_entity_id,id),
 CHECK((result IS NULL) = (outcome_analysis_id IS NULL)),
 CHECK((result IS NULL) = (result_hash IS NULL))
);
CREATE TABLE commercial_lessons (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 legal_entity_id UUID NOT NULL REFERENCES legal_entities(id),
 experiment_id UUID NOT NULL,
 knowledge_id UUID NOT NULL REFERENCES knowledge_records(id),
 payload JSONB NOT NULL,
 created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
 UNIQUE(legal_entity_id,experiment_id),
 FOREIGN KEY(legal_entity_id,experiment_id) REFERENCES commercial_experiments(legal_entity_id,id)
);
ALTER TABLE commercial_grants ENABLE ROW LEVEL SECURITY;
ALTER TABLE commercial_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE commercial_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE commercial_experiments ENABLE ROW LEVEL SECURITY;
ALTER TABLE commercial_lessons ENABLE ROW LEVEL SECURITY;
CREATE POLICY commercial_grant_scope ON commercial_grants USING(legal_entity_id::text=nullif(current_setting('app.current_legal_entity_id',true),'')) WITH CHECK(legal_entity_id::text=nullif(current_setting('app.current_legal_entity_id',true),''));
CREATE POLICY commercial_account_scope ON commercial_accounts USING(legal_entity_id::text=nullif(current_setting('app.current_legal_entity_id',true),'')) WITH CHECK(legal_entity_id::text=nullif(current_setting('app.current_legal_entity_id',true),''));
CREATE POLICY commercial_analysis_scope ON commercial_analyses USING(legal_entity_id::text=nullif(current_setting('app.current_legal_entity_id',true),'')) WITH CHECK(legal_entity_id::text=nullif(current_setting('app.current_legal_entity_id',true),''));
CREATE POLICY commercial_experiment_scope ON commercial_experiments USING(legal_entity_id::text=nullif(current_setting('app.current_legal_entity_id',true),'')) WITH CHECK(legal_entity_id::text=nullif(current_setting('app.current_legal_entity_id',true),''));
CREATE POLICY commercial_lesson_scope ON commercial_lessons USING(legal_entity_id::text=nullif(current_setting('app.current_legal_entity_id',true),'')) WITH CHECK(legal_entity_id::text=nullif(current_setting('app.current_legal_entity_id',true),''));
