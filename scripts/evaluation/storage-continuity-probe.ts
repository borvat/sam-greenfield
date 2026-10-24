/** Explicit operator fixture preparation/readback, never a startup hook.
 * No model/tool invocation, owner signing, grants, renewal or live activation.
 * The caller supplies an authorized operator connection; RLS is never bypassed.
 */
import {randomUUID} from 'node:crypto';
import assert from 'node:assert/strict';
import {validatePersistentBinding,type PersistentBinding} from '../../deploy/render-test/persistentBinding';
import {createEvaluationTrial,appendTrialEvent,type TrialSpec} from '../../apps/agents/src/evaluation/trial';
import {sharedCorpus,sharedCorpusHash} from '../../apps/agents/src/evaluation/sharedCorpus';
import {ceiling} from '../../apps/agents/src/intelligence/contracts';
import {sha256Hex} from '../../packages/shared/src/stableJson';

export async function seedStorageContinuityFixture(c:any,b:PersistentBinding,commit:string){
 validatePersistentBinding(b);if(!/^[a-f0-9]{40}$/.test(commit))throw Error('STORAGE_FIXTURE_COMMIT_REQUIRED');
 await c.query('BEGIN');
 try{
  await c.query(`SET LOCAL search_path TO "${b.schema}",pg_catalog,public`);
  await c.query("SELECT set_config('app.current_org_id',$1,true),set_config('app.current_legal_entity_id',$2,true)",[b.org,b.entity]);
  const owner=(await c.query('SELECT current_user=pg_get_userbyid(nspowner) owner FROM pg_namespace WHERE nspname=$1',[b.schema])).rows[0];
  if(!owner?.owner)throw Error('STORAGE_FIXTURE_OPERATOR_REQUIRED');
  const goal=(await c.query("INSERT INTO goals(business_id,company_scope,domain,objective,state,authority_ceiling,completion_definition) VALUES($1,$2,'storage_fixture','Synthetic storage continuity fixture. No model, tool or business execution.','NEW','GREEN','sam.read_report.v1') RETURNING id",['STORAGE-FIXTURE-'+randomUUID(),b.entity])).rows[0].id;
  const limits={...ceiling,models:0,tools:1,iterations:0,tokens:0,costUsd:0.03};
  const spec:TrialSpec={version:1,mode:'fixture',syntheticOnly:true,commit,caseId:sharedCorpus.id,corpusHash:sharedCorpusHash(),companyId:b.entity,rootCapabilityId:'storage.fixture.only',limits,agents:{'executive-bootstrap':{...limits}},prices:[{providerId:'storage-fixture-only',model:'no-invocation',inputPer1k:0,outputPer1k:0}],capabilityHash:sha256Hex({fixture:'storage-continuity-v1',dispatch:false})};
  const trialId=await createEvaluationTrial(c,{rootGoalId:goal,spec});
  const steps=[{fixture:true,description:'Retain this operator-authored plan through process and container replacement',dispatch:false}];
  const planId=(await c.query('INSERT INTO plans(goal_id,version,goal_assumptions,constraints,dependencies,steps,plan_hash) VALUES($1,1,$2,$3,$4,$5,$6) RETURNING id',[goal,JSON.stringify({fixture:true,modelGenerated:false}),JSON.stringify({noDispatch:true}),JSON.stringify([]),JSON.stringify(steps),sha256Hex(steps)])).rows[0].id;
  await c.query("UPDATE goals SET current_plan_id=$2,state='PLANNING' WHERE id=$1",[goal,planId]);
  const marker={fixture:true,providerCalls:0,actualBilledUsd:null,syntheticReservationUsd:0.03,planId};
  await c.query("INSERT INTO audit_log(actor,goal_id,action,entity_type,entity_id,after_ref,source,authority_class,result) VALUES('storage-fixture-operator',$1,'STORAGE_FIXTURE_PREPARED','goal',$1,$2,'storage_fixture','GREEN','RECORDED')",[goal,JSON.stringify(marker)]);
  await appendTrialEvent(c,trialId,'STORAGE_FIXTURE_PREPARED',marker);
  await c.query('COMMIT');return {goalId:goal as string,planId:planId as string,trialId};
 }catch(e){await c.query('ROLLBACK');throw e;}
}

export async function readStorageContinuityFixture(c:any,b:PersistentBinding,ids:{goalId:string;planId:string;trialId:string}){
 validatePersistentBinding(b);
 for(const id of Object.values(ids))if(!/^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(id))throw Error('STORAGE_FIXTURE_IDS_REQUIRED');
 await c.query('BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY');
 try{
  const ctx=(await c.query('SELECT current_schema() schema,current_user role')).rows[0];
  assert.deepEqual(ctx,{schema:b.schema,role:b.role});
  const goal=(await c.query('SELECT * FROM goals WHERE id=$1',[ids.goalId])).rows;
  const plans=(await c.query('SELECT * FROM plans WHERE goal_id=$1 ORDER BY version,id',[ids.goalId])).rows;
  const audit=(await c.query('SELECT * FROM audit_log WHERE goal_id=$1 ORDER BY timestamp,id',[ids.goalId])).rows;
  const trial=(await c.query('SELECT * FROM evaluation_trials WHERE id=$1',[ids.trialId])).rows;
  const events=(await c.query('SELECT * FROM evaluation_events WHERE trial_id=$1 ORDER BY sequence',[ids.trialId])).rows;
  assert.equal(goal.length,1);assert.equal(goal[0].domain,'storage_fixture');assert.equal(goal[0].state,'PLANNING');assert.equal(goal[0].current_plan_id,ids.planId);
  assert.equal(plans.length,1);assert.equal(plans[0].id,ids.planId);assert.equal(trial.length,1);assert.equal(trial[0].root_goal_id,ids.goalId);assert.equal(trial[0].spec.mode,'fixture');
  assert.equal(trial[0].used.models,0);assert.equal(trial[0].used.tools,1);assert.equal(trial[0].used.costUsd,0.03);
  const reserved=events.filter((e:any)=>e.kind==='RESERVED');assert.equal(reserved.length,1);
  assert.equal(reserved[0].payload.kind,'storage_fixture');assert.equal(reserved[0].payload.reserved.costUsd,0.03);
  assert.equal(events.filter((e:any)=>['INVOKING','FINISHED'].includes(e.kind)).length,0);
  assert.equal(audit.filter((a:any)=>a.action==='STORAGE_FIXTURE_PREPARED').length,1);
  // JSON normalization retains timestamps as strings before canonical hashing.
  const snapshot=JSON.parse(JSON.stringify({goal,plans,audit,trial,events}));
  return {snapshot,sha256:sha256Hex(snapshot),costBasis:'SYNTHETIC_RESERVATION_NOT_INVOICE' as const,actualBilledUsd:null,providerCalls:0 as const};
 }finally{await c.query('ROLLBACK');}
}

export function assertStorageContinuity(before:Awaited<ReturnType<typeof readStorageContinuityFixture>>,after:Awaited<ReturnType<typeof readStorageContinuityFixture>>){
 assert.equal(before.sha256,sha256Hex(before.snapshot));assert.equal(after.sha256,sha256Hex(after.snapshot));
 assert.deepEqual(after.snapshot,before.snapshot);assert.equal(after.sha256,before.sha256);
 return {sameGoal:true,samePlan:true,sameAudit:true,sameTrial:true,sameReservation:true,actualBilledUsd:null,providerCalls:0};
}
