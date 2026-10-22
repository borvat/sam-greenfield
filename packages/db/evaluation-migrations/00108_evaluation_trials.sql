-- Explicit operator-only opt-in; no modification of published profiles.
CREATE TABLE evaluation_companies (
 legal_entity_id uuid PRIMARY KEY REFERENCES legal_entities(id),
 purpose text NOT NULL CHECK(purpose='SYNTHETIC_EVALUATION_ONLY'),
 created_at timestamptz NOT NULL DEFAULT clock_timestamp()
);
CREATE TABLE evaluation_trials (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), root_goal_id uuid NOT NULL UNIQUE REFERENCES goals(id),
 legal_entity_id uuid NOT NULL REFERENCES evaluation_companies(legal_entity_id), spec jsonb NOT NULL,
 used jsonb NOT NULL DEFAULT '{"models":0,"tools":0,"iterations":0,"tokens":0,"costUsd":0,"delegations":0}',
 agent_used jsonb NOT NULL DEFAULT '{}', agent_deadlines jsonb NOT NULL DEFAULT '{}', deadline timestamptz NOT NULL,
 cancelled boolean NOT NULL DEFAULT false, sealed boolean NOT NULL DEFAULT false,
 created_at timestamptz NOT NULL DEFAULT clock_timestamp()
);
CREATE TABLE evaluation_events (
 trial_id uuid NOT NULL REFERENCES evaluation_trials(id), sequence bigint NOT NULL,
 kind text NOT NULL, reservation_id uuid, payload jsonb NOT NULL,
 created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
 canonical text NOT NULL, previous_hash text NOT NULL, hash text NOT NULL,
 PRIMARY KEY(trial_id,sequence)
);
CREATE UNIQUE INDEX evaluation_reservation_once ON evaluation_events(trial_id,reservation_id) WHERE kind='RESERVED';
CREATE UNIQUE INDEX evaluation_completion_once ON evaluation_events(trial_id,reservation_id) WHERE kind='FINISHED';
CREATE UNIQUE INDEX evaluation_invocation_once ON evaluation_events(trial_id,reservation_id) WHERE kind='INVOKING';
CREATE FUNCTION evaluation_trial_guard() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE k text; a text; n numeric;
BEGIN
 IF TG_OP='DELETE' THEN RAISE EXCEPTION 'EVALUATION_IMMUTABLE'; END IF;
 IF TG_OP='UPDATE' THEN
  IF NEW.id<>OLD.id OR NEW.root_goal_id<>OLD.root_goal_id OR NEW.legal_entity_id<>OLD.legal_entity_id OR NEW.spec<>OLD.spec
   OR NEW.deadline<>OLD.deadline OR NEW.created_at<>OLD.created_at OR OLD.sealed
   OR (OLD.cancelled AND NOT NEW.cancelled) THEN RAISE EXCEPTION 'EVALUATION_IMMUTABLE'; END IF;
  FOR k IN SELECT jsonb_object_keys(OLD.used) LOOP
   n:=(NEW.used->>k)::numeric;
   IF n IS NULL OR n<(OLD.used->>k)::numeric OR n>(NEW.spec->'limits'->>k)::numeric THEN RAISE EXCEPTION 'EVALUATION_BUDGET_DENIED'; END IF;
  END LOOP;
  IF EXISTS(SELECT 1 FROM jsonb_each_text(OLD.agent_deadlines) d WHERE NEW.agent_deadlines->>d.key IS DISTINCT FROM d.value) THEN RAISE EXCEPTION 'EVALUATION_AGENT_DEADLINE_IMMUTABLE'; END IF;
  FOR a IN SELECT jsonb_object_keys(NEW.agent_deadlines) LOOP
   IF NOT NEW.spec->'agents' ? a OR (NEW.agent_deadlines->>a)::timestamptz>NEW.deadline
    OR NOT OLD.agent_deadlines ? a AND (NEW.agent_deadlines->>a)::timestamptz>clock_timestamp()+((NEW.spec->'agents'->a->>'elapsedMs')||' milliseconds')::interval
    THEN RAISE EXCEPTION 'EVALUATION_AGENT_DEADLINE_DENIED'; END IF;
  END LOOP;
  FOR a IN SELECT jsonb_object_keys(NEW.agent_used) LOOP
   IF NOT NEW.spec->'agents' ? a THEN RAISE EXCEPTION 'EVALUATION_AGENT_DENIED'; END IF;
   FOR k IN SELECT jsonb_object_keys(OLD.used) LOOP
    n:=(NEW.agent_used->a->>k)::numeric;
    IF n IS NULL OR n<coalesce((OLD.agent_used->a->>k)::numeric,0) OR n>(NEW.spec->'agents'->a->>k)::numeric THEN RAISE EXCEPTION 'EVALUATION_AGENT_BUDGET_DENIED'; END IF;
   END LOOP;
  END LOOP;
  IF EXISTS(SELECT 1 FROM jsonb_object_keys(OLD.agent_used) AS keys(key) WHERE NOT NEW.agent_used ? keys.key) THEN RAISE EXCEPTION 'EVALUATION_IMMUTABLE'; END IF;
 END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER evaluation_trial_guard BEFORE UPDATE OR DELETE ON evaluation_trials FOR EACH ROW EXECUTE FUNCTION evaluation_trial_guard();
CREATE FUNCTION evaluation_event_guard() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE t evaluation_trials; last_event evaluation_events; prior_event evaluation_events;
BEGIN
 IF TG_OP<>'INSERT' THEN RAISE EXCEPTION 'EVALUATION_IMMUTABLE'; END IF;
 SELECT * INTO t FROM evaluation_trials WHERE id=NEW.trial_id FOR UPDATE;
 IF t.id IS NULL OR t.sealed THEN RAISE EXCEPTION 'EVALUATION_TRACE_CLOSED'; END IF;
 IF NEW.kind='RESERVED' AND (t.cancelled OR t.deadline<=clock_timestamp()) THEN RAISE EXCEPTION 'EVALUATION_CANCELLED_OR_EXPIRED'; END IF;
 IF NEW.kind IN ('FINISHED','INVOKING') THEN
  SELECT * INTO prior_event FROM evaluation_events WHERE trial_id=NEW.trial_id AND reservation_id=NEW.reservation_id AND kind='RESERVED';
  IF prior_event.trial_id IS NULL THEN RAISE EXCEPTION 'EVALUATION_RESERVATION_REQUIRED'; END IF;
 END IF;
 SELECT * INTO last_event FROM evaluation_events WHERE trial_id=NEW.trial_id ORDER BY sequence DESC LIMIT 1;
 NEW.sequence:=coalesce(last_event.sequence,0)+1;NEW.previous_hash:=coalesce(last_event.hash,repeat('0',64));NEW.created_at:=clock_timestamp();
 NEW.canonical:=jsonb_build_object('trialId',NEW.trial_id,'sequence',NEW.sequence,'kind',NEW.kind,'reservationId',NEW.reservation_id,'payload',NEW.payload,'at',NEW.created_at)::text;
 NEW.hash:=encode(digest(NEW.previous_hash||NEW.canonical,'sha256'),'hex');RETURN NEW;
END $$;
CREATE TRIGGER evaluation_event_guard BEFORE INSERT OR UPDATE OR DELETE ON evaluation_events FOR EACH ROW EXECUTE FUNCTION evaluation_event_guard();
-- Late application commits cannot outlive a cancelled/expired/sealed trial.
CREATE FUNCTION evaluation_execution_guard() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE denied boolean;
BEGIN
 SELECT bool_or(t.cancelled OR t.sealed OR t.deadline<=clock_timestamp()) INTO denied FROM evaluation_trials t WHERE t.root_goal_id IN (
  WITH RECURSIVE lineage(id,parent_goal_id,depth) AS (
   SELECT id,parent_goal_id,0 FROM goals WHERE id=NEW.goal_id
   UNION ALL SELECT g.id,g.parent_goal_id,l.depth+1 FROM goals g JOIN lineage l ON g.id=l.parent_goal_id WHERE l.depth<4
  ) SELECT id FROM lineage);
 IF denied IS TRUE AND NEW.result->>'status' IS DISTINCT FROM 'STOPPED' THEN RAISE EXCEPTION 'EVALUATION_CANCELLED_OR_EXPIRED'; END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER evaluation_execution_guard BEFORE INSERT ON executions FOR EACH ROW EXECUTE FUNCTION evaluation_execution_guard();
CREATE FUNCTION evaluation_plan_guard() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
 IF EXISTS(SELECT 1 FROM evaluation_trials t WHERE t.root_goal_id=NEW.goal_id AND (t.cancelled OR t.sealed OR t.deadline<=clock_timestamp()))
 THEN RAISE EXCEPTION 'EVALUATION_CANCELLED_OR_EXPIRED'; END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER evaluation_plan_guard BEFORE INSERT ON plans FOR EACH ROW EXECUTE FUNCTION evaluation_plan_guard();
-- Invoker rights with a fixed operator-selected schema. Temporary relations
-- cannot shadow the durable budget or chain inside trigger functions.
DO $$ DECLARE namespace text:=current_schema(); function_name text;
BEGIN
 FOREACH function_name IN ARRAY ARRAY['evaluation_trial_guard','evaluation_event_guard','evaluation_execution_guard','evaluation_plan_guard'] LOOP
  EXECUTE format('ALTER FUNCTION %I.%I() SET search_path TO %I,pg_catalog,public,pg_temp',namespace,function_name,namespace);
 END LOOP;
END $$;
