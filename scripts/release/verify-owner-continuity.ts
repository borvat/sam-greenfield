/** Synthetic native acceptance under the existing application principal.
 * Every inserted row is rolled back. No provider, model, DDL, grant or business collection. */
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {pool} from '../../packages/db/src/client';
import {assertRuntimeTenantBinding} from '../../packages/db/src/runtimeAccess';
import {saveApprovedOwnerDecision} from '../../apps/brain/src/learning';
import {recallApprovedOwnerDecisions} from '../../apps/brain/src/memory';
import {pollScopedOwnerNotifications,acknowledgeOwnerNotification} from '../../apps/notifications/src/center';
import {insertOutboxEvent} from '../../packages/db/src/outbox';

async function main(){
 if(process.argv.slice(2).some(x=>x!=='--rollback'))throw Error('ROLLBACK_ONLY_ACCEPTANCE');
 const client=await pool.connect();const foreign=randomUUID(),goalId=randomUUID();
 let outcome:Record<string,unknown>|undefined;
 try{
  const tenant=await assertRuntimeTenantBinding(client);
  const counters=async()=> (await client.query(`SELECT (SELECT count(*) FROM model_calls)::int models,
   (SELECT coalesce(sum(cost),0) FROM model_calls) cost,
   (SELECT count(*) FROM audit_log WHERE action='READ_REVIEW_BUDGET')::int budgets,
   (SELECT count(*) FROM memory_records)::int memories`)).rows[0];
  const before=await counters();
  await client.query('BEGIN');
  try{
   const context={actor:'synthetic-owner-continuity-acceptance',systemOwner:true,legalEntityId:tenant.entity};
   const input={statement:'SYNTHETIC acceptance only: require a synthetic continuity check.',contextKey:'syntheticcontinuity',
    source:'operator_synthetic_acceptance_rollback_only',sourceTimestamp:new Date().toISOString(),idempotencyKey:goalId,approved:true};
   const memory=await saveApprovedOwnerDecision(client,context,input);
   assert.equal((await saveApprovedOwnerDecision(client,context,input)).id,memory.id);
   assert.equal(memory.status,'APPROVED_RULE');assert.equal(memory.source,input.source);
   assert.equal(memory.scope.legal_entity_id,tenant.entity);assert.equal(memory.scope.source_timestamp,input.sourceTimestamp);
   assert.equal((await recallApprovedOwnerDecisions(client,tenant.entity,'perform syntheticcontinuity acceptance')).filter((r:any)=>r.id===memory.id).length,1);
   assert.equal((await recallApprovedOwnerDecisions(client,tenant.entity,'unrelated sales task')).filter((r:any)=>r.id===memory.id).length,0);
   await assert.rejects(saveApprovedOwnerDecision(client,context,{...input,approved:false}),/OWNER_APPROVAL_REQUIRED/);
   await assert.rejects(saveApprovedOwnerDecision(client,{...context,legalEntityId:foreign},input),/AUTHORIZED_COMPANY_CONTEXT_REQUIRED/);
   await client.query("SELECT set_config('app.current_org_id',$1,true)",[foreign]);
   assert.deepEqual(await recallApprovedOwnerDecisions(client,tenant.entity,'syntheticcontinuity'),[]);
   await client.query("SELECT set_config('app.current_org_id',$1,true)",[tenant.org]);
   await client.query("SELECT set_config('app.current_legal_entity_id',$1,true)",[foreign]);
   assert.deepEqual(await recallApprovedOwnerDecisions(client,foreign,'syntheticcontinuity'),[]);
   await assert.rejects(saveApprovedOwnerDecision(client,{...context,legalEntityId:foreign},input),/AUTHORIZED_COMPANY_CONTEXT_REQUIRED/);
   await client.query("SELECT set_config('app.current_legal_entity_id',$1,true)",[tenant.entity]);
   await client.query('SAVEPOINT forbidden_foreign_memory');let denied=false;
   try{await client.query("INSERT INTO memory_records(type,statement,scope,source,status) VALUES('OPERATIONAL','SYNTHETIC forbidden foreign memory',$1,'operator_synthetic_acceptance','OBSERVED')",[JSON.stringify({legal_entity_id:foreign})]);}
   catch(error){denied=(error as {code?:string}).code==='42501';}
   await client.query('ROLLBACK TO SAVEPOINT forbidden_foreign_memory');assert.equal(denied,true,'existing native RLS must deny foreign memory');
   await client.query('RELEASE SAVEPOINT forbidden_foreign_memory');
   await pollScopedOwnerNotifications(client,context);
   await client.query("INSERT INTO goals(id,business_id,company_scope,domain,objective,state,authority_ceiling) VALUES($1,$2,$3,'synthetic_acceptance','SYNTHETIC internal notification rollback acceptance','FAILED','GREEN')",[goalId,'SYNTHETIC-CONTINUITY-'+goalId,tenant.entity]);
   await insertOutboxEvent(client,{aggregateType:'goal',aggregateId:goalId,eventType:'GOAL_STATE_CHANGED',payload:{from:'VERIFYING',to:'FAILED',reason:'synthetic_acceptance'}});
   const first=await pollScopedOwnerNotifications(client,context),second=await pollScopedOwnerNotifications(client,context);
   const records=first.records.filter((r:any)=>r.goal_id===goalId);
   assert.equal(records.length,1);assert.equal(second.records.filter((r:any)=>r.goal_id===goalId).length,1);
   assert.equal(records[0].status,'UNROUTED');assert.equal(first.pushPerformed,false);
   const receipt1=await acknowledgeOwnerNotification(client,context,records[0].id);
   const receipt2=await acknowledgeOwnerNotification(client,context,records[0].id);
   assert.ok(receipt1);assert.deepEqual(receipt1,receipt2);
   assert.equal((await client.query('SELECT status FROM owner_notifications WHERE id=$1',[records[0].id])).rows[0].status,'UNROUTED');
   outcome={company:tenant.entity,role:(await client.query('SELECT current_user role')).rows[0].role,
    approvedMemory:true,provenanceRetained:true,idempotence:true,wrongTaskExcluded:true,wrongCompanyDenied:true,
    wrongOrgDenied:true,fixedRoleGucSpoofDenied:true,nativeForeignWriteDenied:true,syntheticNotificationDeduplicated:true,
    receiptIdempotent:true,externalPushPerformed:false,allSyntheticWritesRolledBack:true};
  }finally{await client.query('ROLLBACK');}
  assert.deepEqual(await counters(),before,'model/budget/memory counters must remain unchanged');
  assert.equal((await client.query('SELECT count(*)::int n FROM goals WHERE id=$1',[goalId])).rows[0].n,0);
  console.log(JSON.stringify({ok:true,observedAt:new Date().toISOString(),revision:process.env.RENDER_GIT_COMMIT,...outcome,countersUnchanged:true}));
 }finally{client.release();await pool.end();}
}
main().catch(error=>{console.error(JSON.stringify({ok:false,code:(error as {code?:string}).code??'SYNTHETIC_CONTINUITY_ACCEPTANCE_FAILED',details:'withheld'}));process.exitCode=1;});
