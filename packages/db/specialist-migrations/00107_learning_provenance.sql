-- Additive upgrade: never edit the published 00106 receipt or silently promote
-- legacy malformed records. Operator remediation/backup is required if found.
DO $$ BEGIN
 IF EXISTS(SELECT 1 FROM specialist_learning l JOIN executions x ON x.id=l.execution_id
  WHERE l.kind IN ('OBSERVATION','EVALUATION','VERIFIED_LESSON') AND NOT EXISTS(
   SELECT 1 FROM jsonb_path_query(x.result,'strict $.**') leaf(value)
   WHERE jsonb_typeof(leaf.value) NOT IN ('object','array') AND coalesce(leaf.value #>> '{}','null')=l.statement))
 OR EXISTS(SELECT 1 FROM specialist_learning l LEFT JOIN specialist_learning e ON e.id=l.parent_id
  LEFT JOIN specialist_learning h ON h.id=e.parent_id LEFT JOIN specialist_learning o ON o.id=h.parent_id
  WHERE l.kind='VERIFIED_LESSON' AND (e.kind IS DISTINCT FROM 'EVALUATION' OR h.kind IS DISTINCT FROM 'HYPOTHESIS'
   OR o.kind IS DISTINCT FROM 'OBSERVATION' OR o.statement IS DISTINCT FROM l.statement
   OR o.execution_id IS DISTINCT FROM l.execution_id OR o.verification_id IS DISTINCT FROM l.verification_id))
 THEN RAISE EXCEPTION 'SPECIALIST_LEGACY_LEARNING_REVIEW_REQUIRED'; END IF;
END $$;
CREATE OR REPLACE FUNCTION specialist_learning_guard() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE p specialist_learning; e specialist_learning; o specialist_learning;
BEGIN
 IF NOT EXISTS(SELECT 1 FROM goals g WHERE g.id=NEW.goal_id AND g.company_scope=NEW.legal_entity_id) THEN RAISE EXCEPTION 'LEARNING_SCOPE_DENIED'; END IF;
 IF NEW.parent_id IS NOT NULL THEN
  SELECT * INTO p FROM specialist_learning WHERE id=NEW.parent_id;
  IF p.id IS NULL OR p.legal_entity_id<>NEW.legal_entity_id OR p.goal_id<>NEW.goal_id THEN RAISE EXCEPTION 'LEARNING_PARENT_DENIED'; END IF;
 END IF;
 IF NEW.kind='HYPOTHESIS' AND p.kind IS DISTINCT FROM 'OBSERVATION' THEN RAISE EXCEPTION 'LEARNING_HYPOTHESIS_PARENT_REQUIRED'; END IF;
 IF NEW.parent_id IS NOT NULL AND p.expires_at<=now() THEN RAISE EXCEPTION 'LEARNING_PARENT_EXPIRED'; END IF;
 IF NEW.kind IN ('OBSERVATION','EVALUATION','VERIFIED_LESSON') THEN
  IF NOT EXISTS(SELECT 1 FROM executions x JOIN goals g ON g.id=x.goal_id
    JOIN LATERAL(SELECT id,result FROM verifications v WHERE v.execution_id=x.id ORDER BY checked_at DESC,id DESC LIMIT 1)v ON true
    WHERE x.id=NEW.execution_id AND g.company_scope=NEW.legal_entity_id AND v.id=NEW.verification_id AND v.result='VERIFIED'
      AND EXISTS(SELECT 1 FROM jsonb_path_query(x.result,'strict $.**') leaf(value)
        WHERE jsonb_typeof(leaf.value) NOT IN ('object','array') AND coalesce(leaf.value #>> '{}','null')=NEW.statement) AND x.finished_at>now()-interval '30 days'
      AND EXISTS(WITH RECURSIVE lineage(id,parent_goal_id,depth) AS (
       SELECT id,parent_goal_id,0 FROM goals WHERE id=x.goal_id
       UNION ALL SELECT g.id,g.parent_goal_id,l.depth+1 FROM goals g JOIN lineage l ON g.id=l.parent_goal_id WHERE l.depth<3
      ) SELECT 1 FROM lineage WHERE id=NEW.goal_id)) THEN RAISE EXCEPTION 'LEARNING_VERIFIED_QUOTE_REQUIRED'; END IF;
 END IF;
 IF NEW.kind='EVALUATION' AND (p.kind IS DISTINCT FROM 'HYPOTHESIS' OR p.statement<>NEW.statement OR NEW.detail->>'criterion' IS DISTINCT FROM 'exact_verified_quote') THEN RAISE EXCEPTION 'LEARNING_EVALUATION_DENIED'; END IF;
 IF NEW.kind='VERIFIED_LESSON' THEN
  SELECT * INTO e FROM specialist_learning WHERE id=p.parent_id;
  SELECT * INTO o FROM specialist_learning WHERE id=e.parent_id;
  IF p.kind IS DISTINCT FROM 'EVALUATION' OR e.kind IS DISTINCT FROM 'HYPOTHESIS' OR p.statement<>NEW.statement
   OR p.execution_id IS DISTINCT FROM NEW.execution_id OR p.verification_id IS DISTINCT FROM NEW.verification_id
   OR o.kind IS DISTINCT FROM 'OBSERVATION' OR o.statement IS DISTINCT FROM NEW.statement
   OR o.execution_id IS DISTINCT FROM NEW.execution_id OR o.verification_id IS DISTINCT FROM NEW.verification_id
   OR o.expires_at<=now() OR e.expires_at<=now()
   THEN RAISE EXCEPTION 'LEARNING_CYCLE_REQUIRED'; END IF;
 END IF;
 IF NEW.expires_at>now()+interval '30 days' OR NEW.expires_at<=now() THEN RAISE EXCEPTION 'LEARNING_FRESHNESS_DENIED'; END IF;
 RETURN NEW;
END $$;
