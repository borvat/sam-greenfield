/** Runtime-owned metadata only: no model output or source content in audit rows. */
export async function readReviewBudget(client:any,goalId:string,planId:string){
 return (await client.query(`SELECT after_ref FROM audit_log WHERE goal_id=$1 AND action='READ_REVIEW_BUDGET'
  AND after_ref->>'planId'=$2 ORDER BY timestamp DESC,id DESC LIMIT 1`,[goalId,planId])).rows[0]?.after_ref?.runtimeReview;
}
export async function recordReadReviewBudget(client:any,goalId:string,planId:string,runtimeReview:any){
 await client.query(`INSERT INTO audit_log(actor,goal_id,action,entity_type,entity_id,after_ref,source,authority_class,result)
  VALUES('read_review',$1,'READ_REVIEW_BUDGET','goal',$1,$2::jsonb,'runtime','GREEN','RECORDED')`,
  [goalId,JSON.stringify({planId,runtimeReview})]);
}
