-- Explicit operator opt-in only. No roles, grants, RLS policies or startup hooks.
-- A coordinator is not a specialist executor. Its exception is admitted only
-- through an existing live trial and its immutable enrolled owner identity.
CREATE OR REPLACE FUNCTION specialist_execution_live_guard() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE domain_name text; root_id uuid; session_id uuid; owner_goal uuid; live boolean; ancestor record; admitted boolean;
BEGIN
 SELECT domain INTO domain_name FROM goals WHERE id=NEW.goal_id;
 IF domain_name='sam_specialist' OR NEW.evidence ? 'specialist_session' THEN
  IF NEW.evidence ? 'specialist_session' THEN
   SELECT root_queue_id,queue_id INTO root_id,session_id FROM specialist_sessions WHERE queue_id=NEW.queue_id;
  ELSE
   SELECT root_queue_id,parent_queue_id INTO root_id,session_id FROM specialist_delegations WHERE goal_id=NEW.goal_id;
  END IF;
  IF NEW.evidence ? 'specialist_session' AND NEW.result->>'status'='STOPPED' AND root_id IS NOT NULL THEN RETURN NEW; END IF;
  SELECT NOT b.cancelled AND b.deadline>clock_timestamp() AND s.deadline>clock_timestamp() AND g.state='EXECUTING' AND g.current_plan_id=w.plan_id,w.goal_id
   INTO live,owner_goal FROM specialist_budgets b JOIN specialist_sessions s ON s.queue_id=session_id JOIN work_queue w ON w.id=b.root_queue_id JOIN goals g ON g.id=w.goal_id WHERE b.root_queue_id=root_id;
  IF live IS DISTINCT FROM true THEN RAISE EXCEPTION 'SPECIALIST_EXECUTION_CANCELLED_OR_EXPIRED'; END IF;
  FOR ancestor IN WITH RECURSIVE lineage(id,parent_goal_id,state,company_scope,depth) AS (
   SELECT id,parent_goal_id,state,company_scope,0 FROM goals WHERE id=NEW.goal_id
   UNION ALL SELECT g.id,g.parent_goal_id,g.state,g.company_scope,l.depth+1 FROM goals g JOIN lineage l ON g.id=l.parent_goal_id WHERE l.depth<4
  ) SELECT * FROM lineage WHERE state<>'EXECUTING'
  LOOP
   admitted:=false;
   -- Invoker rights and existing evaluation RLS apply. An ordinary NEW parent,
   -- terminal parent, foreign trial, unenrolled child or expired trial is denied.
   IF ancestor.state='NEW' AND to_regclass('evaluation_trials') IS NOT NULL THEN
    SELECT EXISTS(SELECT 1 FROM evaluation_trials t JOIN goals owner ON owner.id=owner_goal
     WHERE t.root_goal_id=ancestor.id AND owner.parent_goal_id=ancestor.id
      AND t.legal_entity_id=owner.company_scope AND t.legal_entity_id=ancestor.company_scope
      AND NOT t.cancelled AND NOT t.sealed AND t.deadline>clock_timestamp()
      AND t.spec->'agents' ? ('goal.'||owner_goal::text)
      AND (t.spec->'agents'->'executive-bootstrap'->>'models')::integer=0
      AND (t.agent_deadlines->>('goal.'||owner_goal::text))::timestamptz>clock_timestamp()) INTO admitted;
   END IF;
   IF admitted IS DISTINCT FROM true THEN RAISE EXCEPTION 'SPECIALIST_EXECUTION_CANCELLED_OR_EXPIRED'; END IF;
  END LOOP;
 END IF;
 RETURN NEW;
END $$;
