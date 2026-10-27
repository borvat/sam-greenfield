-- Additive only. Existing migrations remain immutable.
ALTER TABLE goals ADD COLUMN planning_attempts integer NOT NULL DEFAULT 0;
ALTER TABLE goals ADD COLUMN last_planning_at timestamptz;
ALTER TABLE goals ADD COLUMN planning_retry_at timestamptz;
ALTER TABLE goals ADD COLUMN planning_failure jsonb;
ALTER TABLE work_queue ADD COLUMN step_key text;
ALTER TABLE work_queue ADD COLUMN depends_on uuid[] NOT NULL DEFAULT '{}';
ALTER TABLE work_queue ADD COLUMN result_refs jsonb NOT NULL DEFAULT '{}';
ALTER TABLE side_effect_operations ADD COLUMN reconciliation_evidence jsonb;
UPDATE side_effect_operations SET reconciliation_state='NEEDS_RECONCILIATION' WHERE state='PENDING' AND reconciliation_state='NONE';
CREATE INDEX goals_planning_schedule ON goals(planning_retry_at,last_planning_at)
  WHERE state IN ('NEW','MODELING','PLANNING','REPLANNING');
CREATE UNIQUE INDEX work_plan_step_key ON work_queue(plan_id,step_key) WHERE step_key IS NOT NULL;
-- A queue can be claimed only while its current plan/goal remains active and
-- every predecessor has independently verified evidence. No RLS bypass.
CREATE FUNCTION work_dependencies_ready(p_work uuid) RETURNS boolean LANGUAGE sql STABLE AS $$
 SELECT EXISTS(SELECT 1 FROM work_queue w JOIN goals g ON g.id=w.goal_id
   WHERE w.id=p_work AND g.current_plan_id=w.plan_id AND g.state='EXECUTING'
   AND NOT EXISTS(SELECT 1 FROM unnest(w.depends_on) dep(id)
     WHERE NOT EXISTS(SELECT 1 FROM work_queue prior
       JOIN executions e ON e.queue_id=prior.id
       JOIN verifications v ON v.execution_id=e.id
       WHERE prior.id=dep.id AND prior.plan_id=w.plan_id AND prior.status='EXECUTED'
         AND v.result='VERIFIED' AND v.plan_hash=e.plan_hash AND v.execution_hash=e.execution_hash)))
$$;
