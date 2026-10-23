import assert from 'node:assert/strict';
import {pool} from '../../packages/db/src/client';
import {planNextNewGoal} from '../../apps/production/src/planner';
import {proposePlan,planningValidationCode} from '../../apps/brain/src/planner';
import {reviewFixture} from './reviewFixture';
import type {ModelGateway} from '../../packages/model-gateway/src/gateway';

const pause=(ms:number)=>new Promise(r=>setTimeout(r,ms));
const valid={steps:[{capabilityId:'review_echo',params:{ok:true}}]};
const routed=(output:unknown)=>({result:{output}});
async function main(){
 const f=await reviewFixture();
 const count=async(table:string,id:string)=>(await pool.query(`SELECT count(*)::int n FROM ${table} WHERE goal_id=$1`,[id])).rows[0].n;
 const retry=async(id:string)=>pool.query('UPDATE goals SET planning_retry_at=now() WHERE id=$1',[id]);
 const options={deadlineMs:400,maxAttempts:3,backoffMs:1};
 const repaired=await f.goal('synthetic private objective');
 let calls=0;const signals:AbortSignal[]=[];
 const gateway={async invoke(task:any){
  calls++;signals.push(task.signal);
  assert.equal(task.maxCostUsd,0.125,'per-call spend cap must not increase');
  assert.ok(task.input.contract.fields.steps);
  if(calls===2)assert.equal(task.input.validationFeedback,'PLAN_DUPLICATE_STEP');
  await pause(260); // Each response fits; two responses cannot share one deadline.
  return routed(calls===1?{steps:[...valid.steps,...valid.steps]}:valid);
 }} as unknown as ModelGateway;
 const run=()=>planNextNewGoal(f.bundle,{...options,goalId:repaired,gatewayForGoal:()=>gateway});
 const first=await run();assert.equal(first.failed,true);assert.equal(calls,1);
 assert.equal(await count('plans',repaired),0);
 await retry(repaired);
 const results=await Promise.all([run(),run()]);
 assert.equal(results.filter(r=>r.processed).length,1,'reservation prevents duplicate planning');
 assert.equal(calls,2);assert.notEqual(signals[0],signals[1]);assert.equal(signals[1].aborted,false);
 assert.equal(await count('plans',repaired),1);assert.equal(await count('work_queue',repaired),1);
 assert.equal(await count('executions',repaired),0,'planning never directly executes tools');
 assert.equal((await run()).processed,false);
 const events=(await pool.query("SELECT payload FROM outbox_events WHERE aggregate_id=$1 AND event_type='PLANNING_PHASE' ORDER BY created_at,id",[repaired])).rows.map(r=>r.payload);
 assert(events.some(e=>e.code==='PLAN_DUPLICATE_STEP'&&e.attempt===1));
 assert(events.some(e=>e.phase==='validation_passed'&&e.attempt===2));
 for(const e of events){
  assert.equal(typeof e.elapsedMs,'number');
  assert.deepEqual(Object.keys(e).sort(),['attempt','candidateAttempt',...(e.code?['code']:[]),'deadlineMs','elapsedMs','maxAttempts','phase'].sort());
 }
 assert(!JSON.stringify(events).includes('private objective'));
 assert(!JSON.stringify(events).includes('review_echo'));
 assert.equal(planningValidationCode(new Error('PLAN_EVIL_PRIVATE_VALUE')),'PLAN_CONTRACT_INVALID');
 const exhausted=await f.goal('exhaustion');let rejected=0;
 for(let i=0;i<3;i++){
  const r=await planNextNewGoal(f.bundle,{...options,goalId:exhausted,gatewayForGoal:()=>({async invoke(){rejected++;return routed({steps:[]});}} as unknown as ModelGateway)});
  assert.equal(r.failed,true);await retry(exhausted);
 }
 assert.equal(rejected,3);assert.equal((await pool.query('SELECT state FROM goals WHERE id=$1',[exhausted])).rows[0].state,'FAILED');
 assert.equal(await count('plans',exhausted),0);
 assert.equal((await planNextNewGoal(f.bundle,{...options,goalId:exhausted})).processed,false);
 const interruptedRepair=await f.goal('repair feedback survives timeout');
 let repairCalls=0;
 const repairGateway={async invoke(task:any){
  repairCalls++;
  if(repairCalls>1)assert.equal(task.input.validationFeedback,'PLAN_STEPS_REQUIRED');
  if(repairCalls===1)return routed({steps:[]});
  if(repairCalls===2){await pause(150);return routed(valid);}
  return routed(valid);
 }} as unknown as ModelGateway;
 for(let i=0;i<3;i++){
  const r=await planNextNewGoal(f.bundle,{...options,deadlineMs:i===1?50:400,goalId:interruptedRepair,gatewayForGoal:()=>repairGateway});
  if(i<2){assert.equal(r.failed,true);await retry(interruptedRepair);}else assert.equal(r.failed,undefined);
 }
 assert.equal(await count('plans',interruptedRepair),1);
 const late=await f.goal('late response');
 const timeout=await planNextNewGoal(f.bundle,{...options,goalId:late,deadlineMs:50,gatewayForGoal:()=>({async invoke(){await pause(150);return routed(valid);}} as unknown as ModelGateway)});
 assert.equal(timeout.reason,'PLANNING_DEADLINE_EXCEEDED');await pause(180);
 assert.equal(await count('plans',late),0);assert.equal(await count('work_queue',late),0);
 const controller=new AbortController();let cancelledCalls=0;
 const cancelled=proposePlan({gateway:{async invoke(){cancelledCalls++;controller.abort();return routed(valid);}} as unknown as ModelGateway,
  goalId:late,objective:'cancel',context:{},dataClassification:'INTERNAL',maxCostUsd:0.25,signal:controller.signal});
 await assert.rejects(cancelled);assert.equal(cancelledCalls,1);
 const stopped=await f.goal('cancel persisted goal');
 await planNextNewGoal(f.bundle,{...options,goalId:stopped,gatewayForGoal:()=>({async invoke(){
  await pool.query("UPDATE goals SET state='CANCELLED' WHERE id=$1",[stopped]);return routed(valid);
 }} as unknown as ModelGateway)});
 assert.equal(await count('plans',stopped),0);assert.equal(await count('work_queue',stopped),0);
 assert.equal(f.counters().sends,0);
 console.log('PASS slow valid repair with fresh durable reservation; sanitized goal-linked diagnostics; three-attempt exhaustion; cancellation; late response discarded; concurrent planner creates one plan and queue entry, no execution');
 await pool.end();
}
main().catch(async e=>{console.error(e);await pool.end();process.exitCode=1;});
