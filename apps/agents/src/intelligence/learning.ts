import type {Report} from './contracts';
import type {PoolClient} from 'pg';
import {containsValue,verifiedEvidence} from './engine';
/** Bounded evidence confirmation, not automatic causal or policy learning. */
export async function learnVerifiedQuote(c:PoolClient,input:{entityId:string;goalId:string;sourceGoalId:string;executionId:string;statement:string}){
 await c.query('SELECT pg_advisory_xact_lock(hashtextextended($1,107))',[input.goalId+':'+input.executionId+':'+input.statement]);
 const prior=(await c.query(`SELECT l.id lesson,e.id evaluation,h.id hypothesis,o.id observation FROM specialist_learning l
  JOIN specialist_learning e ON e.id=l.parent_id JOIN specialist_learning h ON h.id=e.parent_id JOIN specialist_learning o ON o.id=h.parent_id
  WHERE l.kind='VERIFIED_LESSON' AND l.goal_id=$1 AND l.execution_id=$2 AND l.statement=$3 AND l.expires_at>now() LIMIT 1`,[input.goalId,input.executionId,input.statement])).rows[0];
 const source=(await verifiedEvidence(c,[input.sourceGoalId])).find(s=>s.id===input.executionId);
 if(!source||!source.fresh||!containsValue(source.result,input.statement))throw Error('LEARNING_VERIFIED_VALUE_REQUIRED');
 if(prior){const current=(await c.query('SELECT verification_id FROM specialist_learning WHERE id=$1',[prior.lesson])).rows[0];if(current.verification_id===source.verificationId)return prior as {observation:string;hypothesis:string;evaluation:string;lesson:string};}
 const insert=async(kind:string,parentId:string|null)=>{
  const r=await c.query(`INSERT INTO specialist_learning(legal_entity_id,goal_id,kind,statement,parent_id,execution_id,verification_id,detail,expires_at)
    VALUES($1,$2,$3,$4,$5,$6,$7,$8,now()+interval '29 days') RETURNING id`,
    [input.entityId,input.goalId,kind,input.statement,parentId,source.id,source.verificationId,JSON.stringify({criterion:'exact_verified_quote',trust:'retrieval_verified_not_universal_truth'})]);return r.rows[0].id as string;
 };
 // Caller must own a transaction so no partial cycle is visible on failure.
 const observation=await insert('OBSERVATION',null),hypothesis=await insert('HYPOTHESIS',observation),evaluation=await insert('EVALUATION',hypothesis),lesson=await insert('VERIFIED_LESSON',evaluation);
 return {observation,hypothesis,evaluation,lesson};
}
export async function recallVerifiedLessons(c:PoolClient,entityId:string,query:string){
 if(!query.trim()||query.length>200)throw Error('LEARNING_QUERY_INVALID');
 return (await c.query(`SELECT l.id,l.statement,l.detail,l.execution_id,l.verification_id,l.expires_at
  FROM specialist_learning l JOIN executions e ON e.id=l.execution_id JOIN goals g ON g.id=e.goal_id
  JOIN LATERAL(SELECT id,result FROM verifications v WHERE v.execution_id=e.id ORDER BY checked_at DESC,id DESC LIMIT 1)v ON true
  WHERE l.legal_entity_id=$1 AND g.company_scope=$1 AND l.kind='VERIFIED_LESSON' AND l.expires_at>now()
   AND e.finished_at>now()-interval '30 days' AND v.id=l.verification_id AND v.result='VERIFIED'
   AND strpos(lower(l.statement),lower($2))>0 ORDER BY l.created_at DESC,l.id LIMIT 20`,[entityId,query])).rows;
}
/** Store a hypothesis separately; it has no trusted-memory status. */
export async function proposeHypothesis(c:PoolClient,input:{entityId:string;goalId:string;observationId:string;statement:string}){
 const r=await c.query(`INSERT INTO specialist_learning(legal_entity_id,goal_id,kind,statement,parent_id,expires_at)
  VALUES($1,$2,'HYPOTHESIS',$3,$4,now()+interval '29 days') RETURNING id`,[input.entityId,input.goalId,input.statement,input.observationId]);return r.rows[0].id as string;
}
/** A narrow, deterministic criterion: an exact independently verified value.
 * Unsupported generalizations remain hypotheses; a mismatch is an untrusted
 * experimental outcome, never a lesson or an automatic business-policy change.
 */
export async function evaluateHypothesis(c:PoolClient,input:{hypothesisId:string;sourceGoalId:string;executionId:string}){
 const h=(await c.query("SELECT * FROM specialist_learning WHERE id=$1 AND kind='HYPOTHESIS'",[input.hypothesisId])).rows[0];
 if(!h)throw Error('LEARNING_HYPOTHESIS_REQUIRED');
 const source=(await verifiedEvidence(c,[input.sourceGoalId])).find(s=>s.id===input.executionId);
 if(!source||!source.fresh)throw Error('LEARNING_VERIFIED_VALUE_REQUIRED');
 const supported=containsValue(source.result,h.statement);
 const kind=supported?'EVALUATION':'EXPERIMENT_OUTCOME';
 const r=await c.query(`INSERT INTO specialist_learning(legal_entity_id,goal_id,kind,statement,parent_id,execution_id,verification_id,detail,expires_at)
  VALUES($1,$2,$3,$4,$5,$6,$7,$8,now()+interval '29 days') RETURNING id`,[h.legal_entity_id,h.goal_id,kind,h.statement,h.id,source.id,source.verificationId,
  JSON.stringify({criterion:'exact_verified_quote',supported,classification:supported?'VERIFIED_QUOTATION':'UNCONFIRMED_HYPOTHESIS'})]);
 return {evaluationId:r.rows[0].id as string,supported};
}

export async function learnNextSpecialistReport(c:PoolClient,entityId:string,supportsClaim:(result:Record<string,unknown>,topic:string,value:string)=>boolean){
   const row=(await c.query(`SELECT e.result,g.id goal_id FROM executions e JOIN goals g ON g.id=e.goal_id
    JOIN specialist_sessions s ON s.queue_id=e.queue_id
    JOIN LATERAL(SELECT result FROM verifications v WHERE v.execution_id=e.id ORDER BY checked_at DESC,id DESC LIMIT 1)v ON true
    WHERE g.company_scope=$1 AND g.current_plan_id=e.plan_id AND g.state='COMPLETED' AND v.result='VERIFIED' AND e.result->>'status'='COMPLETE'
     AND NOT EXISTS(SELECT 1 FROM specialist_learning l WHERE l.goal_id=g.id AND l.kind='VERIFIED_LESSON')
     -- Do not let an expired/revoked oldest report monopolize every tick.
     -- This is only scheduling eligibility; current evidence and exact claim
     -- support are rechecked below and the learning SQL guard remains active.
     AND EXISTS(
      SELECT 1 FROM jsonb_array_elements(e.result->'report'->'evidence') receipt
      JOIN executions source ON source.id::text=receipt->>'id'
      JOIN goals source_goal ON source_goal.id=source.goal_id
      JOIN LATERAL(SELECT id,result FROM verifications WHERE execution_id=source.id ORDER BY checked_at DESC,id DESC LIMIT 1) current_receipt ON true
      WHERE source_goal.company_scope=g.company_scope AND source.plan_id=source_goal.current_plan_id
       AND source.finished_at>now()-interval '30 days'
       AND current_receipt.result='VERIFIED' AND current_receipt.id::text=receipt->>'verificationId'
       AND EXISTS(SELECT 1 FROM jsonb_array_elements(e.result->'report'->'claims') claim
        WHERE claim->'evidenceIds' ? source.id::text AND EXISTS(
         SELECT 1 FROM jsonb_path_query(source.result,'strict $.**') leaf(value)
         WHERE jsonb_typeof(leaf.value) NOT IN ('object','array') AND coalesce(leaf.value #>> '{}','null') = claim->>'value')))

    ORDER BY e.finished_at,e.id LIMIT 1 FOR UPDATE OF g SKIP LOCKED`,[entityId])).rows[0];
   if(!row)return {learned:0};
   const report=row.result.report as Report;
   const current=await verifiedEvidence(c,[...new Set(report.evidence.map(e=>e.goalId))]);
   let learned=0;
   for(const claim of report.claims){
    const source=current.find(e=>claim.evidenceIds.includes(e.id)&&e.fresh&&supportsClaim(e.result,claim.topic,claim.value)&&
     report.evidence.some(old=>old.id===e.id&&old.verificationId===e.verificationId));
    if(!source)continue;
    await learnVerifiedQuote(c,{entityId,goalId:row.goal_id,sourceGoalId:source.goalId,executionId:source.id,statement:claim.value});learned++;
   }
   return {learned};
}
