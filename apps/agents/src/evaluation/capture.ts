import {createHash,createPublicKey,sign,type KeyObject} from 'node:crypto';
import type {PoolClient} from 'pg';
import {stableStringify} from '../../../../packages/shared/src/stableJson';
import {appendTrialEvent} from './trial';
import type {SignedEvaluationTrace} from './trace';
/** Operator capture, separate from runtime identities. Private key never enters
 * the model process, runtime database, trace, environment or provider request. */
export async function sealEvaluationTrial(c:PoolClient,trialId:string){
 await c.query('BEGIN');try{
  const owner=(await c.query("SELECT current_user=pg_get_userbyid(relowner) permitted FROM pg_class WHERE oid='evaluation_trials'::regclass")).rows[0];if(!owner?.permitted)throw Error('EVALUATION_CAPTURE_OPERATOR_REQUIRED');
  const t=(await c.query('SELECT * FROM evaluation_trials WHERE id=$1 FOR UPDATE',[trialId])).rows[0];if(!t||t.sealed)throw Error('EVALUATION_TRACE_CLOSED');
  const pending=await c.query(`SELECT r.reservation_id FROM evaluation_events r WHERE trial_id=$1 AND kind='RESERVED' AND NOT EXISTS(
   SELECT 1 FROM evaluation_events f WHERE f.trial_id=r.trial_id AND f.reservation_id=r.reservation_id AND f.kind='FINISHED')`,[trialId]);
  if(pending.rowCount)throw Error('EVALUATION_UNCERTAIN_ATTEMPTS_REQUIRE_REVIEW');
  const root=(await c.query(`SELECT g.state,e.id execution_id,e.queue_id,e.result,v.id verification_id,v.result verification_result
   FROM goals g JOIN executions e ON e.goal_id=g.id AND e.plan_id=g.current_plan_id
   JOIN LATERAL(SELECT id,result FROM verifications WHERE execution_id=e.id ORDER BY checked_at DESC,id DESC LIMIT 1)v ON true
   WHERE g.id=$1 AND g.company_scope=$2 ORDER BY e.finished_at DESC,e.id DESC LIMIT 1`,[t.root_goal_id,t.legal_entity_id])).rows[0];
  if(!root||root.state!=='COMPLETED'||root.verification_result!=='VERIFIED')throw Error('EVALUATION_VERIFIED_FINAL_REPORT_REQUIRED');
  const report=root.result.report;
  const ids=report.evidence.map((e:any)=>e.id);
  const sources=(await c.query(`SELECT e.id,e.result,e.finished_at,g.company_scope,v.id verification_id,v.result verification_result,v.checked_at FROM executions e JOIN goals g ON g.id=e.goal_id
   JOIN LATERAL(SELECT id,result,checked_at FROM verifications WHERE execution_id=e.id ORDER BY checked_at DESC,id DESC LIMIT 1)v ON true WHERE e.id=ANY($1::uuid[]) AND g.company_scope=$2`,[ids,t.legal_entity_id])).rows;
  if(report.claims.some((cl:any)=>cl.evidenceIds.some((id:string)=>!sources.some(s=>s.id===id&&s.verification_result==='VERIFIED'&&report.evidence.some((old:any)=>old.id===id&&old.verificationId===s.verification_id)))))throw Error('EVALUATION_EVIDENCE_REVOKED');
  const learning=(await c.query('SELECT id,parent_id,kind,statement,execution_id,verification_id FROM specialist_learning WHERE goal_id=$1 AND legal_entity_id=$2 ORDER BY created_at,id',[t.root_goal_id,t.legal_entity_id])).rows;
  await appendTrialEvent(c,trialId,'SNAPSHOT',{root,report,sources,learning});
  await c.query('UPDATE evaluation_trials SET sealed=true WHERE id=$1',[trialId]);await c.query('COMMIT');
 }catch(e){await c.query('ROLLBACK');throw e;}
}
export async function exportEvaluationTrace(c:PoolClient,trialId:string,privateKey:KeyObject,options:{incomplete?:boolean}={}){
 if(privateKey.type!=='private'||privateKey.asymmetricKeyType!=='ed25519')throw Error('EVALUATION_SIGNING_KEY_REQUIRED');
 await c.query('BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY');try{
  const trial=(await c.query('SELECT * FROM evaluation_trials WHERE id=$1',[trialId])).rows[0];if(!trial||!trial.sealed&&!options.incomplete)throw Error('EVALUATION_SEALED_TRACE_REQUIRED');
  const events=(await c.query('SELECT * FROM evaluation_events WHERE trial_id=$1 ORDER BY sequence',[trialId])).rows;
  const owner=(await c.query("SELECT current_user=pg_get_userbyid(relowner) permitted FROM pg_class WHERE oid='evaluation_trials'::regclass")).rows[0];if(!owner?.permitted)throw Error('EVALUATION_CAPTURE_OPERATOR_REQUIRED');
  const payload=JSON.parse(JSON.stringify({captureStatus:trial.sealed?'SEALED_COMPLETE':'INCOMPLETE_SNAPSHOT',exportedAt:new Date().toISOString(),trial,events}));const publicKey=createPublicKey(privateKey),keyId=createHash('sha256').update(publicKey.export({type:'spki',format:'der'})).digest('hex');
  const envelope:SignedEvaluationTrace={format:'sam-evaluation-v1',keyId,payload,signature:sign(null,Buffer.from(stableStringify(payload)),privateKey).toString('base64')};
  await c.query('COMMIT');return envelope;
 }catch(e){await c.query('ROLLBACK');throw e;}
}
