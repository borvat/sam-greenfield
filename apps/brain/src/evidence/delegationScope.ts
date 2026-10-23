import {sha256Hex} from '../../../../packages/shared/src/stableJson';
/** Trusted bundle configuration. Model parameters never select this policy. */
export type DelegationPolicy=Readonly<Record<string,readonly string[]>>;
export type EvidenceFamily={rootGoalId:string;goalIds:string[];hash:string;links:any[]};
const bad=():never=>{throw Error('EVIDENCE_DELEGATION_SCOPE_INVALID');};
/** Resolve only persisted specialist assignments, not arbitrary parent_goal_id.
 * A replan, changed assignment, tenant or revoked ancestor invalidates replay. */
export async function evidenceFamily(c:any,goalId:string,tenant:string,policy:DelegationPolicy):Promise<EvidenceFamily>{
 const goals=(await c.query(`WITH RECURSIVE lineage AS (
 SELECT id,parent_goal_id,company_scope,current_plan_id,state,0 depth FROM goals WHERE id=$1
 UNION ALL SELECT g.id,g.parent_goal_id,g.company_scope,g.current_plan_id,g.state,l.depth+1
 FROM goals g JOIN lineage l ON g.id=l.parent_goal_id WHERE l.depth<4)
 SELECT l.*,p.goal_assumptions authorization FROM lineage l LEFT JOIN plans p ON p.id=l.current_plan_id AND p.goal_id=l.id ORDER BY depth`,[goalId])).rows;
 if(!goals.length||goals[0].company_scope!==tenant)bad();

 let root=goals[0];
 for(const child of goals){
  const link=(await c.query(`SELECT d.*,w.goal_id parent_goal_id,w.plan_id parent_plan_id,w.capability_id parent_capability,w.params parent_params,p.plan_hash parent_plan_hash
   FROM specialist_delegations d JOIN work_queue w ON w.id=d.parent_queue_id JOIN plans p ON p.id=w.plan_id AND p.goal_id=w.goal_id WHERE d.goal_id=$1`,[child.id])).rows[0];
  if(!link)break;
  const parent=goals.find((g:any)=>g.id===link.parent_goal_id);
  validateLink(child,parent,link,tenant,policy);root=parent;
 }
 const members=(await c.query(`WITH RECURSIVE family AS (
 SELECT id,parent_goal_id,company_scope,current_plan_id,state,0 depth FROM goals WHERE id=$1
 UNION ALL SELECT g.id,g.parent_goal_id,g.company_scope,g.current_plan_id,g.state,f.depth+1
 FROM goals g JOIN family f ON g.parent_goal_id=f.id JOIN specialist_delegations d ON d.goal_id=g.id WHERE f.depth<3)
 SELECT f.*,p.goal_assumptions authorization FROM family f LEFT JOIN plans p ON p.id=f.current_plan_id AND p.goal_id=f.id ORDER BY depth,f.id`,[root.id])).rows;
 if(!members.length||members.length>32||members.some((g:any)=>g.company_scope!==tenant))bad();

 const accepted:any[]=[];
 for(const child of members.filter((g:any)=>g.id!==root.id)){
  const link=(await c.query(`SELECT d.*,w.goal_id parent_goal_id,w.plan_id parent_plan_id,w.capability_id parent_capability,w.params parent_params,p.plan_hash parent_plan_hash
   FROM specialist_delegations d JOIN work_queue w ON w.id=d.parent_queue_id JOIN plans p ON p.id=w.plan_id AND p.goal_id=w.goal_id WHERE d.goal_id=$1`,[child.id])).rows[0];
  const parent=members.find((g:any)=>g.id===child.parent_goal_id);validateLink(child,parent,link,tenant,policy);
  accepted.push({goalId:child.id,planId:child.current_plan_id,parentGoalId:parent.id,parentPlanId:link.parent_plan_id,parentQueueId:link.parent_queue_id,rootQueueId:link.root_queue_id,capabilityId:link.capability_id,paramsHash:link.params_hash,depth:link.depth});
 }
 if(!members.some((g:any)=>g.id===goalId))bad();
 const content={rootGoalId:root.id,policyHash:sha256Hex(policy),links:accepted};
 return {rootGoalId:root.id,goalIds:members.map((g:any)=>g.id).sort(),links:accepted,hash:sha256Hex(content)};
}
function validateLink(child:any,parent:any,link:any,tenant:string,policy:DelegationPolicy){
 if(!link||!parent||child.parent_goal_id!==parent.id||child.company_scope!==tenant||parent.company_scope!==tenant||link.legal_entity_id!==tenant||(parent.current_plan_id!==link.parent_plan_id&&!parent.authorization?.verifiedDelegationPlans?.includes(link.parent_plan_hash))||
  !['EXECUTING','VERIFYING','COMPLETED','REPLANNING','PLANNING'].includes(parent.state)||!policy[link.parent_capability]?.includes(link.capability_id)||!Number.isInteger(link.depth)||link.depth<1||link.depth>3)bad();
}
export async function assertAssignedExecution(c:any,row:any,family:EvidenceFamily){
 if(!family.goalIds.includes(row.goal_id))bad();
 if(row.goal_id===family.rootGoalId)return;
 const link=family.links.find(l=>l.goalId===row.goal_id);
 if(!link||link.planId!==row.plan_id||link.capabilityId!==row.capability_id||link.paramsHash!==sha256Hex(row.params??{}))bad();
 const work=(await c.query('SELECT goal_id,plan_id,capability_id,params FROM work_queue WHERE id=$1',[row.queue_id])).rows[0];
 if(!work||work.goal_id!==row.goal_id||work.plan_id!==row.plan_id||work.capability_id!==row.capability_id||sha256Hex(work.params??{})!==link.paramsHash)bad();
}

/** Immutable authorization of one source chain. New sibling assignments must
 * not invalidate previously verified data, unlike a revoked ancestor. */
export function sourceDelegationHash(family:EvidenceFamily,goalId:string,policy:DelegationPolicy){
 const links:any[]=[];let next=goalId;
 while(next!==family.rootGoalId){const link=family.links.find(l=>l.goalId===next);if(!link||links.length>=3)bad();links.push(link);next=link.parentGoalId;}
 return sha256Hex({rootGoalId:family.rootGoalId,policyHash:sha256Hex(policy),links});
}
