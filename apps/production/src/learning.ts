import { withTransaction } from "../../../packages/db/src/client";
import { learnVerifiedWorldFact } from "../../brain/src/learning";
import type { ValidatedProductionBundle } from "./bundle";

// Explicit capability-owned projection, never arbitrary model output or all memory.
export async function learnNextVerifiedExecution(bundle:ValidatedProductionBundle){
  const policy=bundle.raw.verifiedLearning;
  if(!policy)return {processed:false};
  return withTransaction(async client=>{
    const r=await client.query(`SELECT e.id,e.goal_id,e.capability_id,e.result,g.company_scope,g.domain
      FROM executions e JOIN goals g ON g.id=e.goal_id
      JOIN verifications v ON v.execution_id=e.id
      WHERE v.result='VERIFIED' AND v.verifier<>e.actor
        AND e.plan_hash IS NOT NULL AND v.plan_hash=e.plan_hash AND v.execution_hash=e.execution_hash
        AND e.capability_id=ANY($1::text[])
        AND NOT EXISTS(SELECT 1 FROM world_facts f WHERE f.source='verified_execution:'||e.id::text)
      ORDER BY e.finished_at,e.id LIMIT 1`,[policy.capabilityIds]);
    if(!r.rowCount)return {processed:false};
    const e=r.rows[0];
    const lock=await client.query("SELECT pg_try_advisory_xact_lock(hashtextextended($1,0)) AS ok",["sam-learning:"+e.id]);
    if(!lock.rows[0].ok)return {processed:false};
    for(const fact of policy.project({capabilityId:e.capability_id,result:e.result})){
      const factId=await learnVerifiedWorldFact({executionId:e.id,entityType:"legal_entity",entityId:e.company_scope,
        domain:e.domain,attribute:fact.attribute,value:fact.value,
        scope:{legal_entity_id:e.company_scope,capability_id:e.capability_id}},client);
      await client.query(`INSERT INTO audit_log(actor,goal_id,action,entity_type,entity_id,after_ref,source,authority_class,result,evidence_id)
        VALUES('verified-learning',$1,'VERIFIED_FACT_LEARNED','legal_entity',$2,$3::jsonb,'brain_learning','GREEN','VERIFIED',$4)`,
        [e.goal_id,e.company_scope,JSON.stringify({attribute:fact.attribute,execution_id:e.id,fact_id:factId}),factId]);
    }
    return {processed:true,executionId:e.id};
  });
}
