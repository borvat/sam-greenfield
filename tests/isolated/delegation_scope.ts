import {test} from 'node:test';
import assert from 'node:assert/strict';
import {evidenceFamily,sourceDelegationHash} from '../../apps/brain/src/evidence/delegationScope';
import {sha256Hex} from '../../packages/shared/src/stableJson';
const policy={'reason.records':['records.search','derive_verified_evidence']};
function database(change:{tenant?:string;parentPlan?:string;carried?:string[];sibling?:boolean;capability?:string}={}){
 const root={id:'root',parent_goal_id:'coordinator',company_scope:'tenant',current_plan_id:change.parentPlan??'plan',state:'EXECUTING',depth:0,authorization:{verifiedDelegationPlans:change.carried??[]}};
 const child={id:'child',parent_goal_id:'root',company_scope:change.tenant??'tenant',current_plan_id:'child-plan',state:'COMPLETED',depth:1};
 const link={goal_id:'child',parent_goal_id:'root',parent_plan_id:'plan',parent_plan_hash:sha256Hex('plan'),parent_capability:'reason.records',legal_entity_id:'tenant',parent_queue_id:'queue',root_queue_id:'queue',capability_id:change.capability??'records.search',params_hash:sha256Hex({query:'supplied'}),depth:1};
 return {async query(sql:string,params:any[]){
  if(sql.includes('g.id=l.parent_goal_id'))return {rows:[root]};
  if(sql.includes('WITH RECURSIVE family'))return {rows:[root,{...child,assignment:link},...(change.sibling?[{...child,id:'sibling',current_plan_id:'sibling-plan',assignment:{...link,goal_id:'sibling'}}]:[])]};
  if(sql.includes('FROM specialist_delegations'))return {rows:params[0]==='root'?[]:[{...link,goal_id:params[0]}]};
  throw Error('Unexpected SQL');
 }};
}
test('persisted assignments enforce tenant, capability and continuation authorization',async()=>{
 const f=await evidenceFamily(database(),'root','tenant',policy);assert.deepEqual(f.goalIds,['child','root']);
 for(const change of [{tenant:'foreign'},{capability:'write'},{parentPlan:'replacement'}])await assert.rejects(()=>evidenceFamily(database(change),'root','tenant',policy),/SCOPE_INVALID/);
 const carried=await evidenceFamily(database({parentPlan:'continuation',carried:[sha256Hex('plan')]}),'root','tenant',policy);
 assert.equal(carried.hash,f.hash);
});
test('new siblings change family snapshot but not a prior source authorization hash',async()=>{
 const before=await evidenceFamily(database(),'root','tenant',policy),after=await evidenceFamily(database({sibling:true}),'root','tenant',policy);
 assert.notEqual(before.hash,after.hash);
 assert.equal(sourceDelegationHash(before,'child',policy),sourceDelegationHash(after,'child',policy));
 assert.throws(()=>sourceDelegationHash(before,'foreign',policy),/SCOPE_INVALID/);
});
