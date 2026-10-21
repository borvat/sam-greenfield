-- Explicit opt-in, operator-only profile. No alteration of earlier migrations.
CREATE TABLE specialist_budgets (
 root_queue_id uuid PRIMARY KEY REFERENCES work_queue(id),
 legal_entity_id uuid NOT NULL REFERENCES legal_entities(id),
 limits jsonb NOT NULL, used jsonb NOT NULL DEFAULT '{"models":0,"tools":0,"iterations":0,"tokens":0,"costUsd":0,"delegations":0}',
 deadline timestamptz NOT NULL, cancelled boolean NOT NULL DEFAULT false,
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE specialist_sessions (
 queue_id uuid PRIMARY KEY REFERENCES work_queue(id),
 root_queue_id uuid NOT NULL REFERENCES specialist_budgets(root_queue_id),
 legal_entity_id uuid NOT NULL REFERENCES legal_entities(id),
 agent_id text NOT NULL, config_hash text NOT NULL, depth int NOT NULL CHECK(depth BETWEEN 0 AND 3),
 state jsonb NOT NULL, updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE specialist_delegations (
 goal_id uuid PRIMARY KEY REFERENCES goals(id),
 parent_queue_id uuid NOT NULL REFERENCES specialist_sessions(queue_id),
 capability_id text NOT NULL, params_hash text NOT NULL,
 root_queue_id uuid NOT NULL REFERENCES specialist_budgets(root_queue_id),
 legal_entity_id uuid NOT NULL REFERENCES legal_entities(id),
 depth int NOT NULL CHECK(depth BETWEEN 1 AND 3),
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE specialist_learning (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 legal_entity_id uuid NOT NULL REFERENCES legal_entities(id), goal_id uuid NOT NULL REFERENCES goals(id),
 kind text NOT NULL CHECK(kind IN ('OBSERVATION','HYPOTHESIS','EVALUATION','VERIFIED_LESSON','MODEL_INFERENCE','USER_DECISION','EXPERIMENT_OUTCOME')),
 statement text NOT NULL CHECK(length(statement) BETWEEN 1 AND 2000),
 parent_id uuid REFERENCES specialist_learning(id), execution_id uuid REFERENCES executions(id), verification_id uuid REFERENCES verifications(id),
 detail jsonb NOT NULL DEFAULT '{}', expires_at timestamptz NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now()
);
-- Invoker rights, no role/credential creation or SECURITY DEFINER functions.
CREATE FUNCTION specialist_learning_guard() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE p specialist_learning; e specialist_learning;
BEGIN
 IF NOT EXISTS(SELECT 1 FROM goals g WHERE g.id=NEW.goal_id AND g.company_scope=NEW.legal_entity_id) THEN RAISE EXCEPTION 'LEARNING_SCOPE_DENIED'; END IF;
 IF NEW.parent_id IS NOT NULL THEN
  SELECT * INTO p FROM specialist_learning WHERE id=NEW.parent_id;
  IF p.id IS NULL OR p.legal_entity_id<>NEW.legal_entity_id OR p.goal_id<>NEW.goal_id THEN RAISE EXCEPTION 'LEARNING_PARENT_DENIED'; END IF;
 END IF;
 IF NEW.kind IN ('OBSERVATION','EVALUATION','VERIFIED_LESSON') THEN
  IF NOT EXISTS(SELECT 1 FROM executions x JOIN goals g ON g.id=x.goal_id
    JOIN LATERAL(SELECT id,result FROM verifications v WHERE v.execution_id=x.id ORDER BY checked_at DESC,id DESC LIMIT 1)v ON true
    WHERE x.id=NEW.execution_id AND g.company_scope=NEW.legal_entity_id AND v.id=NEW.verification_id AND v.result='VERIFIED'
      AND strpos(x.result::text,NEW.statement)>0 AND x.finished_at>now()-interval '30 days'
      AND EXISTS(WITH RECURSIVE lineage(id,parent_goal_id,depth) AS (
       SELECT id,parent_goal_id,0 FROM goals WHERE id=x.goal_id
       UNION ALL SELECT g.id,g.parent_goal_id,l.depth+1 FROM goals g JOIN lineage l ON g.id=l.parent_goal_id WHERE l.depth<3
      ) SELECT 1 FROM lineage WHERE id=NEW.goal_id)) THEN RAISE EXCEPTION 'LEARNING_VERIFIED_QUOTE_REQUIRED'; END IF;
 END IF;
 IF NEW.kind='EVALUATION' AND (p.kind IS DISTINCT FROM 'HYPOTHESIS' OR p.statement<>NEW.statement OR NEW.detail->>'criterion' IS DISTINCT FROM 'exact_verified_quote') THEN RAISE EXCEPTION 'LEARNING_EVALUATION_DENIED'; END IF;
 IF NEW.kind='VERIFIED_LESSON' THEN
  SELECT * INTO e FROM specialist_learning WHERE id=p.parent_id;
  IF p.kind IS DISTINCT FROM 'EVALUATION' OR e.kind IS DISTINCT FROM 'HYPOTHESIS' OR p.statement<>NEW.statement
   OR p.execution_id IS DISTINCT FROM NEW.execution_id OR p.verification_id IS DISTINCT FROM NEW.verification_id
   OR NOT EXISTS(SELECT 1 FROM specialist_learning o WHERE o.kind='OBSERVATION' AND o.execution_id=NEW.execution_id
     AND o.verification_id=NEW.verification_id AND o.statement=NEW.statement AND o.goal_id=NEW.goal_id AND o.legal_entity_id=NEW.legal_entity_id)
   THEN RAISE EXCEPTION 'LEARNING_CYCLE_REQUIRED'; END IF;
 END IF;
 IF NEW.expires_at>now()+interval '30 days' OR NEW.expires_at<=now() THEN RAISE EXCEPTION 'LEARNING_FRESHNESS_DENIED'; END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER specialist_learning_guard BEFORE INSERT ON specialist_learning FOR EACH ROW EXECUTE FUNCTION specialist_learning_guard();
CREATE INDEX specialist_learning_recall ON specialist_learning(legal_entity_id,kind,expires_at);
-- Prevent a read that finishes after cancellation/deadline/replanning from
-- committing, even if the adapter itself cannot abort an in-flight request.
-- Ordinary core/Phase 4 work does not enter this profile-specific branch.
CREATE FUNCTION specialist_execution_live_guard() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE domain_name text; root_id uuid; live boolean;
BEGIN
 SELECT domain INTO domain_name FROM goals WHERE id=NEW.goal_id;
 IF domain_name='sam_specialist' OR NEW.evidence ? 'specialist_session' THEN
  IF NEW.evidence ? 'specialist_session' THEN
   SELECT root_queue_id INTO root_id FROM specialist_sessions WHERE queue_id=NEW.queue_id;
  ELSE
   SELECT root_queue_id INTO root_id FROM specialist_delegations WHERE goal_id=NEW.goal_id;
  END IF;
  -- A stopped report carries uncertainty and verifies INCONCLUSIVE. Persist it
  -- for audit even when the budget/deadline caused the stop; successful results
  -- still require a live family below.
  IF NEW.evidence ? 'specialist_session' AND NEW.result->>'status'='STOPPED' AND root_id IS NOT NULL THEN RETURN NEW; END IF;
  SELECT NOT b.cancelled AND b.deadline>clock_timestamp() AND g.state='EXECUTING' AND g.current_plan_id=w.plan_id
   INTO live FROM specialist_budgets b JOIN work_queue w ON w.id=b.root_queue_id JOIN goals g ON g.id=w.goal_id WHERE b.root_queue_id=root_id;
  IF live IS DISTINCT FROM true OR EXISTS(WITH RECURSIVE lineage(id,parent_goal_id,state,depth) AS (
    SELECT id,parent_goal_id,state,0 FROM goals WHERE id=NEW.goal_id
    UNION ALL SELECT g.id,g.parent_goal_id,g.state,l.depth+1 FROM goals g JOIN lineage l ON g.id=l.parent_goal_id WHERE l.depth<3
   ) SELECT 1 FROM lineage WHERE state<>'EXECUTING') THEN RAISE EXCEPTION 'SPECIALIST_EXECUTION_CANCELLED_OR_EXPIRED'; END IF;
 END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER specialist_execution_live_guard BEFORE INSERT ON executions FOR EACH ROW EXECUTE FUNCTION specialist_execution_live_guard();
