import {evidenceFamily,assertAssignedExecution,type EvidenceFamily} from '../../../brain/src/evidence/delegationScope';
import {validateGoalObligations,assertObligationReview} from '../../../kernel/src/goalObligations';
import {assertGoalFamilyOperationLinks} from './goalFamilyScore';
import type {PoolClient} from 'pg';
import {sha256Hex} from '../../../../packages/shared/src/stableJson';
import {assertExecutionIntegrity} from '../../../brain/src/evidence/verifiedSources';
import {replayStoredArtifact,DERIVE_CAPABILITY} from '../../../brain/src/evidence/artifacts';
import {evaluationBundleHash} from '../../../production/src/goalEvaluationBundle';
import type {ProductionBundle} from '../../../production/src/types';
import {appendTrialEvent} from './trial';
/** Operator capture of ordinary goal reports. No invented root execution, no grants.
 * Lock order matches report commit: executions -> receipts -> goals -> trial. */
export async function sealGoalFamilyEvaluation(c:PoolClient,trialId:string,bundle:ProductionBundle){
 await c.query('BEGIN');try{
  const owner=(await c.query("SELECT current_user=pg_get_userbyid(relowner) permitted FROM pg_class WHERE oid='evaluation_trials'::regclass")).rows[0];
  if(!owner?.permitted)throw Error('EVALUATION_CAPTURE_OPERATOR_REQUIRED');
  const initial=(await c.query('SELECT * FROM evaluation_trials WHERE id=$1',[trialId])).rows[0];
  if(!initial||initial.spec.capabilityHash!==evaluationBundleHash(bundle))throw Error('EVALUATION_CAPTURE_MANIFEST_REQUIRED');
  const ids=Object.keys(initial.spec.agents).filter(k=>k.startsWith('goal.')).map(k=>k.slice(5)).sort();
  if(ids.length!==3||initial.spec.agents['executive-bootstrap']?.models!==0)throw Error('EVALUATION_GOAL_ENROLLMENT_REQUIRED');
  const families:Record<string,EvidenceFamily>={};
  if(bundle.descendantEvidencePolicy)for(const id of ids)families[id]=await evidenceFamily(c,id,initial.legal_entity_id,bundle.descendantEvidencePolicy,true);
  const memberIds=[...new Set(ids.flatMap(id=>families[id]?.goalIds??[id]))].sort();
  const executions=(await c.query('SELECT * FROM executions WHERE goal_id=ANY($1::uuid[]) ORDER BY id FOR UPDATE',[memberIds])).rows;
  await c.query('SELECT id FROM verifications WHERE execution_id=ANY($1::uuid[]) ORDER BY execution_id,id FOR SHARE',[executions.map(e=>e.id)]);
  const goals=(await c.query('SELECT * FROM goals WHERE id=ANY($1::uuid[]) ORDER BY id FOR UPDATE',[[initial.root_goal_id,...memberIds]])).rows;
  for(const id of ids)if(families[id]&&(await evidenceFamily(c,id,initial.legal_entity_id,bundle.descendantEvidencePolicy!,true)).hash!==families[id].hash)throw Error('EVALUATION_CAPTURE_DELEGATION_CHANGED');
  const trial=(await c.query('SELECT * FROM evaluation_trials WHERE id=$1 FOR UPDATE',[trialId])).rows[0];
  if(trial.sealed||trial.cancelled||sha256Hex(initial.spec)!==sha256Hex(trial.spec))throw Error('EVALUATION_TRACE_CLOSED');
  if((await c.query("SELECT 1 FROM evaluation_events r WHERE trial_id=$1 AND kind='RESERVED' AND NOT EXISTS(SELECT 1 FROM evaluation_events f WHERE f.trial_id=r.trial_id AND f.reservation_id=r.reservation_id AND f.kind='FINISHED')",[trialId])).rowCount)throw Error('EVALUATION_UNCERTAIN_ATTEMPTS_REQUIRE_REVIEW');
  const root=goals.find(g=>g.id===trial.root_goal_id),children=ids.map(id=>goals.find(g=>g.id===id));
  if(root?.state!=='NEW'||root.company_scope!==trial.legal_entity_id||children.some(g=>!g||g.parent_goal_id!==root.id||g.company_scope!==trial.legal_entity_id||!['COMPLETED','WAITING_EXTERNAL','FAILED','CANCELLED','BLOCKED'].includes(g.state)))throw Error('EVALUATION_GOAL_FAMILY_NOT_TERMINAL');
  const reports=(await c.query('SELECT r.* FROM goal_read_reviews r JOIN goals g ON g.id=r.goal_id AND g.current_plan_id=r.plan_id WHERE r.goal_id=ANY($1::uuid[]) ORDER BY r.goal_id FOR SHARE OF r',[ids])).rows;
  const sources=(await c.query(`SELECT e.*,v.id verification_id,v.result verification_result,v.execution_hash verified_hash,v.plan_hash verified_plan_hash,v.independent_evidence verification_evidence
   FROM executions e LEFT JOIN LATERAL(SELECT * FROM verifications WHERE execution_id=e.id ORDER BY checked_at DESC,id DESC LIMIT 1)v ON true
   WHERE e.goal_id=ANY($1::uuid[]) ORDER BY e.id`,[memberIds])).rows;
  if(sha256Hex(sources.map(s=>s.id))!==sha256Hex(executions.map(e=>e.id)))throw Error('EVALUATION_CAPTURE_SOURCE_SET_CHANGED');
  for(const goal of children){
   const report=reports.find(r=>r.goal_id===goal.id);
   if(goal.state==='COMPLETED'&&report?.decision.status!=='complete'||report&&(sha256Hex(report.decision)!==report.report_hash||report.decision.runtimeReview?.retryable))throw Error('EVALUATION_FINAL_REPORT_REQUIRED');
   if(!report)continue; // A failed/cancelled child is captured as failure, never success.
   const referenced=new Set<string>([...(report.decision.findings??[]).map((f:any)=>f.executionId),...(report.decision.requirements??[]).flatMap((r:any)=>r.evidenceIds)]);
   for(const id of referenced){
    const source=sources.find(s=>s.id===id&&(families[goal.id]?.goalIds??[goal.id]).includes(s.goal_id));
    if(!source||source.verification_result!=='VERIFIED'||source.verified_hash!==source.execution_hash)throw Error('EVALUATION_EVIDENCE_REVOKED');
    assertExecutionIntegrity(source);if(families[goal.id])await assertAssignedExecution(c,source,families[goal.id]);
    if(source.capability_id===DERIVE_CAPABILITY){
     if(!bundle.verifiedEvidenceContracts)throw Error('EVALUATION_DERIVED_CONTRACT_REQUIRED');
     await replayStoredArtifact(c,{goalId:source.goal_id,legalEntityId:goal.company_scope,delegationPolicy:bundle.descendantEvidencePolicy,historicalReplay:true},source.id,bundle.verifiedEvidenceContracts);
    }
   }
  }
  const obligations:Record<string,unknown>={};
  for(const goal of children){
   const initial=(await c.query('SELECT goal_assumptions FROM plans WHERE goal_id=$1 ORDER BY version LIMIT 1 FOR SHARE',[goal.id])).rows[0]?.goal_assumptions?.goalObligations;
   if(initial!==undefined){const contract=validateGoalObligations(initial,goal.objective);const report=reports.find(r=>r.goal_id===goal.id);if(report)assertObligationReview(contract,report.decision);obligations[goal.id]={contract,hash:sha256Hex(contract)};}
  }
  const events=(await c.query('SELECT * FROM evaluation_events WHERE trial_id=$1 ORDER BY sequence',[trialId])).rows;
  const snapshot={format:'sam.goal-family.v1',obligations,...(bundle.descendantEvidencePolicy?{delegationPolicy:bundle.descendantEvidencePolicy,families,descendants:goals.filter(g=>memberIds.includes(g.id)&&!ids.includes(g.id)).map(g=>({id:g.id,parentGoalId:g.parent_goal_id,state:g.state,currentPlanId:g.current_plan_id,companyScope:g.company_scope}))}:{}),root:{id:root.id,state:root.state},goals:children.map(g=>({id:g.id,objective:g.objective,state:g.state,currentPlanId:g.current_plan_id})),reports,sources};
  assertGoalFamilyOperationLinks(snapshot,{trial,spec:trial.spec,events});
  await appendTrialEvent(c,trialId,'SNAPSHOT',snapshot);
  await c.query('UPDATE evaluation_trials SET sealed=true WHERE id=$1',[trialId]);await c.query('COMMIT');return snapshot;
 }catch(e){await c.query('ROLLBACK');throw e;}
}
