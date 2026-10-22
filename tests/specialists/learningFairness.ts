import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {pool,withTransaction} from '../../packages/db/src/client';
import {applySpecialistProfile} from '../../packages/db/src/specialistProfile';
import {persistPlanAndDelegateAtomic} from '../../apps/kernel/src/planning';
import {learnNextSpecialistReport,type LearningScanCursor} from '../../apps/agents/src/intelligence/learning';
import {claimSupportForScenario} from '../../apps/agents/src/intelligence/engine';
import {commercialScenario} from '../../apps/agents/src/evaluation/scenarios';
async function main(){
 const c=await pool.connect();try{
  await applySpecialistProfile(c);
  const org=randomUUID(),entity=randomUUID();
  await c.query("INSERT INTO organizations(id,name) VALUES($1,'Learning fairness fixture')",[org]);
  await c.query("INSERT INTO legal_entities(id,org_id,name) VALUES($1,$2,'Synthetic only')",[entity,org]);
  async function goal(parent:string|null,capabilityId:string){
   const id=(await c.query("INSERT INTO goals(business_id,company_scope,objective,state,parent_goal_id) VALUES($1,$2,'Learning fairness','PLANNING',$3) RETURNING id",[randomUUID(),entity,parent])).rows[0].id;
   const plan=await persistPlanAndDelegateAtomic({goalId:id,steps:[{capabilityId,params:{}}]});
   return {id,queue:plan.queueIds[0],plan:(await c.query('SELECT current_plan_id FROM goals WHERE id=$1',[id])).rows[0].current_plan_id};
  }
  async function execution(g:Awaited<ReturnType<typeof goal>>,result:any,minutes:number){
   const e=(await c.query(`INSERT INTO executions(goal_id,plan_id,queue_id,plan_hash,execution_hash,capability_id,result,evidence,fencing_token,actor,finished_at)
    VALUES($1,$2,$3,'fixture-plan',$4,'source.read',$5,'{}',1,'fixture',now()-($6::text||' minutes')::interval) RETURNING id`,[g.id,g.plan,g.queue,randomUUID(),result,minutes])).rows[0].id;
   const v=(await c.query(`INSERT INTO verifications(execution_id,verifier,method,independent_evidence,result,plan_hash,execution_hash)
    VALUES($1,'independent-fixture','api_readback','{}','VERIFIED','fixture-plan',$2) RETURNING id`,[e,randomUUID()])).rows[0].id;
   return {e,v};
  }
  const scenario=commercialScenario('commercial-market')!,otherScenario=commercialScenario('commercial-profitability')!;
  const fixtures:Record<string,string>={},receipts:Record<string,string>={};
  for(const [index,kind] of ['expired','revoked',...Array.from({length:18},(_,i)=>'incompatible-'+i),'fresh-one','fresh-two'].entries()){
   const root=await goal(null,'specialist.executive'),source=await goal(root.id,'source.read');
   const commercial=kind.startsWith('incompatible-')?otherScenario.sources[0]:scenario.sources[0];
   const leaf=await execution(source,{sourceId:commercial.id,sourceData:commercial.data},kind==='expired'?31*24*60:0);
   if(kind==='revoked')await c.query("UPDATE verifications SET result='FAILED' WHERE id=$1",[leaf.v]);
   await c.query("UPDATE goals SET state='COMPLETED' WHERE id=$1",[source.id]);
   await c.query("INSERT INTO specialist_budgets(root_queue_id,legal_entity_id,limits,deadline) VALUES($1,$2,'{}',now()+interval '1 hour')",[root.queue,entity]);
   await c.query("INSERT INTO specialist_sessions(queue_id,root_queue_id,legal_entity_id,agent_id,config_hash,depth,state,deadline) VALUES($1,$1,$2,'fixture','fixture',0,'{}',now()+interval '1 hour')",[root.queue,entity]);
   await execution(root,{status:'COMPLETE',report:{claims:[{topic:commercial.data.topic,value:commercial.data.value,evidenceIds:[leaf.e]}],evidence:[{id:leaf.e,goalId:source.id,verificationId:leaf.v}]}},100-index);
   await c.query("UPDATE goals SET state='COMPLETED' WHERE id=$1",[root.id]);fixtures[kind]=root.id;receipts[kind]=leaf.v;
  }
  const cursor:LearningScanCursor={};
  const tick=()=>withTransaction(c=>learnNextSpecialistReport(c,entity,claimSupportForScenario(scenario),cursor));
  assert.equal((await withTransaction(c=>learnNextSpecialistReport(c,randomUUID(),claimSupportForScenario(scenario),{}))).learned,0,'explicit tenant scope also holds for an operator connection');
  assert.equal((await tick()).learned,0,'a tick scans at most 16 incompatible reports');
  assert.equal((await tick()).learned,1,'old incompatible-scenario report must not starve production-predicate learning');
  assert.equal((await tick()).learned,1,'next eligible report must make progress');
  assert.equal((await tick()).learned,0,'completed learning is idempotent');
  const lessons=(await c.query("SELECT goal_id FROM specialist_learning WHERE kind='VERIFIED_LESSON' ORDER BY goal_id")).rows.map(r=>r.goal_id).sort();
  assert.deepEqual(lessons,[fixtures['fresh-one'],fixtures['fresh-two']].sort());
  await c.query("UPDATE verifications SET result='VERIFIED' WHERE id=$1",[receipts.revoked]);
  assert.equal((await tick()).learned,1,'restored current evidence becomes eligible without a permanent skip marker');
  assert.equal((await tick()).learned,0);
  assert.equal((await c.query("SELECT count(*)::int n FROM specialist_learning WHERE kind='VERIFIED_LESSON' AND goal_id=$1",[fixtures.expired])).rows[0].n,0);
  console.log('PASS learning fairness: expired, revoked and incompatible-scenario oldest reports skipped; both fresh reports learned; no stale promotion or duplicate lessons');
 }finally{c.release();await pool.end();}
}
main().catch(e=>{console.error(e);process.exitCode=1;});
