/** Prevent a flag-only rollback from handing already admitted work to the
 * unbounded legacy composition. Read-only; operator must reconcile or pause work. */
export async function assertNoPendingOrdinaryGoals(db:{query(sql:string,values?:any[]):Promise<{rows:any[]}>}){
 const result=await db.query(`WITH RECURSIVE admitted AS (
  SELECT g.id,g.state FROM goals g WHERE g.parent_goal_id IS NULL AND EXISTS(
   SELECT 1 FROM audit_log a WHERE a.goal_id=g.id AND a.action='SAM_GOAL_SUBMITTED'
    AND a.source='sam_mcp' AND a.after_ref->>'ordinaryGeneralAgentV1'='true')
  UNION ALL SELECT g.id,g.state FROM goals g JOIN admitted p ON g.parent_goal_id=p.id
 ) SELECT 1 FROM admitted a WHERE a.state NOT IN ('COMPLETED','FAILED','CANCELLED','BLOCKED')
  OR EXISTS(SELECT 1 FROM work_queue w WHERE w.goal_id=a.id AND w.status IN ('PENDING','QUEUED','LEASED','EXECUTING')) LIMIT 1`);
 if(result.rows.length)throw Error('ORDINARY_GOAL_ROLLBACK_RECONCILIATION_REQUIRED');
}
