import { withTransaction } from '../../../packages/db/src/client';
import { CapabilityCatalog } from '../../agents/src/capabilityCatalog';
import { sha256Hex } from '../../../packages/shared/src/stableJson';
import { evaluatePlanAuthority } from '../../brain/src/authorityGuard';
import { consumeApproval } from '../../../packages/db/src/approvals';
import type { ClaimedWork } from '../../kernel/src/workerRuntime';
import type { ToolDefinition } from '../../../packages/tool-gateway/src/types';

export const perceptionActionEnabled=()=>process.env.SAM_INTEGRATION_ENABLED==='1'&&process.env.SAM_PERCEPTION_ACTION_ENABLED==='true';
export async function scopedCatalog(c:any,catalog:CapabilityCatalog,goalId:string){
 if(!perceptionActionEnabled())return catalog;
 const goal=(await c.query('SELECT company_scope FROM goals WHERE id=$1',[goalId])).rows[0];
 if(!goal?.company_scope)throw new Error('ACTION_ENTITY_REQUIRED');
 const rows=await c.query('SELECT capability_id,allow_side_effect FROM entity_capability_bindings WHERE legal_entity_id=$1 AND enabled',[goal.company_scope]);
 const grants=new Map(rows.rows.map((r:any)=>[r.capability_id,r.allow_side_effect]));
 const allowed=catalog.planningDescriptors().filter(d=>grants.has(d.capabilityId)&&(!d.sideEffect||grants.get(d.capabilityId)===true));
 if(!allowed.length)throw new Error('ACTION_NO_SCOPED_CAPABILITIES');
 return new CapabilityCatalog(allowed.map(d=>({...catalog.get(d.capabilityId)})));
}

// Uses the existing executor, approval store and side-effect ledger. This is a
// scoped preflight, not a parallel execution engine or a new source of authority.
export async function authorizeClaimedAction(work:ClaimedWork,tool:ToolDefinition){
 if(!perceptionActionEnabled())return null;
 return withTransaction(async c=>{
  const row=(await c.query(`SELECT w.*,g.company_scope,g.authority_ceiling,g.state AS goal_state,g.current_plan_id
    FROM work_queue w JOIN goals g ON g.id=w.goal_id WHERE w.id=$1`,[work.queueId])).rows[0];
  if(!row||!row.company_scope||row.goal_id!==work.goalId||row.plan_id!==work.planId||row.current_plan_id!==work.planId||
    row.goal_state!=='EXECUTING'||!['LEASED','EXECUTING'].includes(row.status)||
    Number(row.fencing_token)!==work.fencingToken||new Date(row.lease_expiry)<=new Date()||
    row.capability_id!==tool.capabilityId||sha256Hex(row.params??{})!==sha256Hex(work.params??{}))throw new Error('ACTION_STALE_OR_MISMATCHED_CLAIM');
  const binding=(await c.query(`SELECT * FROM entity_capability_bindings WHERE legal_entity_id=$1 AND capability_id=$2 AND enabled`,[row.company_scope,tool.capabilityId])).rows[0];
  if(!binding||(tool.sideEffect&&!binding.allow_side_effect))throw new Error('ACTION_BINDING_DENIED');
  if(tool.sideEffect&&tool.authorityClass==='GREEN')throw new Error('ACTION_EXTERNAL_WRITE_MUST_REQUIRE_APPROVAL');
  const policy=await evaluatePlanAuthority(c,{goalId:row.goal_id,legalEntityId:row.company_scope,
    steps:[{capabilityId:tool.capabilityId,params:work.params}],capabilityPolicies:{[tool.capabilityId]:tool.authorityClass}});
  // Confirmed replay is handled by the existing ledger, without a second approval
  // consumption. Preflight still checks company, ceiling, lease and binding.
  const rank={GREEN:0,YELLOW:1,RED:2};
  if(rank[tool.authorityClass]>rank[(row.authority_ceiling??"GREEN") as keyof typeof rank])throw new Error('ACTION_ABOVE_CEILING');
  let operationKey=tool.sideEffect?`tool:${row.goal_id}:${tool.capabilityId}:${sha256Hex(work.params)}`:null;
  const prior=operationKey?(await c.query(`SELECT * FROM side_effect_operations WHERE goal_id=$1 AND capability_id=$2 AND request_hash=$3 ORDER BY CASE WHEN state='CONFIRMED' THEN 1 ELSE 0 END,created_at,id LIMIT 1`,[row.goal_id,tool.capabilityId,sha256Hex(work.params)])).rows[0]:null;
  if(prior)operationKey=prior.operation_key;
  if(prior&&(prior.legal_entity_id!==row.company_scope||prior.goal_id!==row.goal_id||prior.capability_id!==tool.capabilityId||prior.request_hash!==sha256Hex(work.params)))throw new Error('ACTION_OPERATION_SCOPE_MISMATCH');
  if(!policy.authorized&&!prior)throw new Error('ACTION_APPROVAL_REQUIRED');
  if(!tool.sideEffect&&tool.authorityClass!=='GREEN')await consumeApproval(c,{capabilityId:tool.capabilityId,params:work.params,legalEntityId:row.company_scope,authorityClass:tool.authorityClass,goalId:row.goal_id});
  return {operationKey,legalEntityId:row.company_scope};
 });
}
