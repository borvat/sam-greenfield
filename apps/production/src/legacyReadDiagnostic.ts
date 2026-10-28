import {validateLegacyDiagnosticReport} from './legacyDiagnosticReport';
export {validateLegacyDiagnosticReport} from './legacyDiagnosticReport';
import {authorizedCompany} from '../../../packages/shared/src/ownerScope';
import {sha256Hex} from '../../../packages/shared/src/stableJson';
import {transitionGoal} from '../../kernel/src/stateMachine';

/** An operator-reviewed immutable binding, never accepted through an MCP/model payload. */
export interface DiagnosticBinding {
 authorization:string;goalId:string;companyId:string;objectiveHash:string;planId:string;planHash:string;parentGoalId:string|null;
 executions:{id:string;queueId:string;verificationId:string;resultHash:string;executionHash:string;direction:string;count:number;actor:string;retrievedAt:string;verifier:string;verifiedAt:string;verificationEvidenceHash:string;verificationContractId:string|null;params:Record<string,unknown>}[];
}
function requireMatch(ok:unknown){if(!ok)throw Error('LEGACY_DIAGNOSTIC_BINDING_CHANGED')}
function pageObservation(result:any,expected:DiagnosticBinding['executions'][number]){
 requireMatch(result?.isError===false&&typeof result?.structuredContent?.result==='string');
 const text=result.structuredContent.result,query=expected.params.query;
 let count:number;
 if(text===`No messages found for query: '${query}'`)count=0;
 else{
  const prefix=`Found ${expected.count} messages matching '${query}':`;
  requireMatch(text.startsWith(prefix));
  const ids=[...text.matchAll(/^\s*(\d+)\. Message ID: ([a-f0-9]+)\s*$/gm)];
  requireMatch(ids.length===expected.count&&ids.every((x:any,i:number)=>Number(x[1])===i+1));
  count=new Set(ids.map((x:any)=>x[2])).size;
 }
 requireMatch(count===expected.count&&!/next_page_token|nextPageToken/i.test(JSON.stringify(result)));
 return {direction:expected.direction,readSucceeded:true,uniqueIdentifierCount:count,pageSize:100,pagination:'NOT_EXPOSED',exhaustive:'UNKNOWN',executionId:expected.id,verificationId:expected.verificationId,resultHash:expected.resultHash,retrievedAt:expected.retrievedAt,verifiedAt:expected.verifiedAt};
}

/** Deterministic engine for reviewed bindings. Owns one serializable transaction.
 * Production entry point supplies only the compiled exact legacy binding below.
 * Does not reserve/call models, execute reads, reset budgets or edit source records. */
export async function recoverBoundReadDiagnostic(client:any,binding:DiagnosticBinding,input:{actor:string;apply:boolean}){
 await client.query(input.apply?'BEGIN ISOLATION LEVEL SERIALIZABLE':'BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY');
 try{
  requireMatch(Boolean(binding.authorization)&&binding.executions.length===2);
  await authorizedCompany(client,{actor:input.actor,systemOwner:true,legalEntityId:binding.companyId});
  if(input.apply){const lock=await client.query('SELECT pg_try_advisory_xact_lock(hashtext($1)) AS locked',['read-review:'+binding.goalId]);if(!lock.rows[0]?.locked)throw Error('LEGACY_DIAGNOSTIC_REVIEW_BUSY');}
  const goal=(await client.query(`SELECT * FROM goals WHERE id=$1 AND company_scope=$2${input.apply?' FOR UPDATE':''}`,[binding.goalId,binding.companyId])).rows[0];
  requireMatch(goal&&goal.current_plan_id===binding.planId&&sha256Hex(goal.objective)===binding.objectiveHash&&goal.parent_goal_id===binding.parentGoalId&&goal.completion_definition==='sam.read_report.v1'&&goal.authority_ceiling==='GREEN');
  const plans=(await client.query('SELECT * FROM plans WHERE goal_id=$1 ORDER BY version',[binding.goalId])).rows;
  const plan=plans[0];
  requireMatch(plans.length===1&&plan.id===binding.planId&&plan.plan_hash===binding.planHash&&sha256Hex({goal_id:plan.goal_id,version:plan.version,assumptions:plan.goal_assumptions,constraints:plan.constraints,dependencies:plan.dependencies,steps:plan.steps})===binding.planHash);
  const work=(await client.query('SELECT * FROM work_queue WHERE goal_id=$1 ORDER BY id',[binding.goalId])).rows;
  const executions=(await client.query('SELECT * FROM executions WHERE goal_id=$1 ORDER BY id',[binding.goalId])).rows;
  requireMatch(work.length===2&&executions.length===2);
  const pages=[];
  for(const expected of binding.executions){
   const e=executions.find((r:any)=>r.id===expected.id),w=work.find((r:any)=>r.id===expected.queueId);
   requireMatch(e&&w&&w.status==='EXECUTED'&&w.plan_id===binding.planId&&w.capability_id==='google_mcp_search_gmail_messages'&&sha256Hex(w.params)===sha256Hex(expected.params));
   requireMatch(e.queue_id===expected.queueId&&e.plan_id===binding.planId&&e.plan_hash===binding.planHash&&e.status==='EXECUTED'&&e.actor===expected.actor&&new Date(e.started_at).toISOString()===expected.retrievedAt&&e.capability_id===w.capability_id&&sha256Hex(e.params)===sha256Hex(expected.params)&&sha256Hex(e.result)===expected.resultHash&&e.evidence?.sideEffect===false&&e.evidence?.resultHash===expected.resultHash&&e.evidence?.responseHash===expected.resultHash&&e.operation_key_ref===null);
   const payload={queue_id:e.queue_id,goal_id:e.goal_id,plan_id:e.plan_id,plan_hash:e.plan_hash,capability_id:e.capability_id,params:e.params,result:e.result,evidence:e.evidence,fencing_token:Number(e.fencing_token),operation_key_ref:e.operation_key_ref};
   requireMatch(e.execution_hash===expected.executionHash&&sha256Hex(payload)===expected.executionHash);
   // Latest means latest full record, not the latest convenient matching VERIFIED row.
   const v=(await client.query('SELECT * FROM verifications WHERE execution_id=$1 ORDER BY checked_at DESC,id DESC LIMIT 1',[e.id])).rows[0];
   requireMatch(v?.id===expected.verificationId&&v.result==='VERIFIED'&&v.verifier!==e.actor&&v.verifier===expected.verifier&&new Date(v.checked_at).toISOString()===expected.verifiedAt&&sha256Hex(v.independent_evidence)===expected.verificationEvidenceHash&&(v.contract_id??null)===expected.verificationContractId&&(v.operation_key_ref??null)===null&&v.method==='api_readback'&&v.plan_hash===binding.planHash&&v.execution_hash===expected.executionHash&&v.independent_evidence?.readback===true&&v.independent_evidence?.responseHash===expected.resultHash);
   pages.push(pageObservation(e.result,expected));
  }
  const decision={status:'complete',summary:'The bounded saved-evidence diagnostic confirms two independently verified first-page Gmail reads. Counts describe only those returned pages; mailbox-wide and exact-window coverage remain unestablished. The original parent objective is not completed.',
   requirements:[{requirement:'Two independently verified bounded first-page reads or an explicit read blocker, with sanitized counts and coverage limits',fulfilled:true,evidenceIds:binding.executions.map(e=>e.id)}],
   findings:pages.map(p=>({text:`${p.direction}: verified saved page contains ${p.uniqueIdentifierCount} unique identifiers; pagination is not exposed.`,executionId:p.executionId,verificationId:p.verificationId})),
   limitations:['Pagination tokens are not exposed by the saved response; token absence does not prove exhaustion.','Only the first page of each direction was requested, up to 100 identifiers. Counts are not mailbox totals.','The requested millisecond window was converted to second-based Gmail queries; exact boundary coverage is not established.','No message bodies, names, addresses, identifiers or links are included in this diagnostic.','The original broader objective remains unchanged and is not declared complete.','The inbox direction searches in:inbox only; it does not establish mailbox-wide incoming coverage.','Mailbox identity is unknown from these saved responses.'],steps:[],report:{semanticPolicy:'DETERMINISTIC_BOUNDED_SAVED_EVIDENCE'},
   diagnostic:{schema:'sam.legacy_read_diagnostic.v1',authorization:binding.authorization,bindingHash:sha256Hex(binding),mode:'DETERMINISTIC_SAVED_VERIFIED_EVIDENCE_ONLY',originalGoalCompleted:false,mailboxExhaustiveness:'UNKNOWN',mailboxIdentity:'UNKNOWN',exactWindowCoverage:'UNKNOWN',pages,modelCalls:0,newReads:0}};
  validateLegacyDiagnosticReport(decision,binding);
  const hash=sha256Hex(decision);
  const reports=(await client.query('SELECT * FROM goal_read_reviews WHERE goal_id=$1 ORDER BY round',[binding.goalId])).rows;
  if(reports.length){
   const r=reports[0];requireMatch(reports.length===1&&goal.state==='COMPLETED'&&r.plan_id===binding.planId&&r.report_hash===hash&&sha256Hex(r.decision)===hash);
   await client.query('ROLLBACK');return {applied:true,alreadyApplied:true,goalId:binding.goalId,reportId:r.id,reportHash:hash};
  }
  requireMatch(goal.state==='WAITING_EXTERNAL');
  if(!input.apply){await client.query('ROLLBACK');return {applied:false,goalId:binding.goalId,reportHash:hash,decision};}
  await transitionGoal(client,goal.id,'WAITING_EXTERNAL','VERIFYING','owner_exact_saved_diagnostic_recovery');
  const report=(await client.query(`INSERT INTO goal_read_reviews(goal_id,plan_id,round,decision,report_hash) VALUES($1,$2,1,$3::jsonb,$4) RETURNING id`,[goal.id,binding.planId,JSON.stringify(decision),hash])).rows[0];
  await transitionGoal(client,goal.id,'VERIFYING','COMPLETED','evidence_report_saved',{report_hash:hash,round:1});
  await client.query('UPDATE goals SET next_wake_at=NULL WHERE id=$1',[goal.id]);
  await client.query(`INSERT INTO audit_log(actor,goal_id,action,entity_type,entity_id,after_ref,source,authority_class,result)
   VALUES($1,$2,'LEGACY_READ_DIAGNOSTIC_RECOVERED','goal',$2,$3::jsonb,'deterministic_operator','GREEN','COMPLETED')`,[input.actor,goal.id,JSON.stringify({authorization:binding.authorization,bindingHash:sha256Hex(binding),reportId:report.id,reportHash:hash,modelCalls:0,newReads:0})]);
  await client.query('COMMIT');return {applied:true,alreadyApplied:false,goalId:goal.id,reportId:report.id,reportHash:hash};
 }catch(error){await client.query('ROLLBACK');throw error}
}

/** Fixed reviewed source identity. Changing any field requires another explicit review. */
export const LEGACY_MAIL_DIAGNOSTIC_BINDING:DiagnosticBinding={
  "authorization": "owner-sam-executive-completion-20261028-exact-diagnostic",
  "goalId": "53424b11-c854-40e4-a264-14af2b7d33b0",
  "companyId": "73aa81c6-3a23-4369-9408-8bea0956d399",
  "objectiveHash": "d9ca9a8b201e020f64ccf1f39a9bc6db5668e4b98c165ca349cccf20e5311079",
  "planId": "c3a09dab-968f-4e44-9a25-39db8d2278f6",
  "planHash": "f6c4878b6a2d4b3739a5c5a325d0f800474809d20908d354977301976e3a6c6c",
  "parentGoalId": null,
  "executions": [
    {
      "id": "3c7ad839-f5e4-4fc6-bbab-db6380e77cf6",
      "queueId": "157d4dba-dfda-4d4a-a849-fad3a279d3cf",
      "verificationId": "23f25ce6-025e-4be7-b44b-28a0f6059b09",
      "resultHash": "f9d063a402ca99ff51461a72f8e146eaba18d96252f1bbf464458e5bf35769b4",
      "executionHash": "a36ce9a874aea2584d2046cc81e5e86ce0b2a57c6efcb49730271b0a615c05e3",
      "direction": "inbox",
      "count": 66,
      "actor": "communications@1.0.0",
      "params": {
        "query": "in:inbox after:1792985928 before:1793072328",
        "page_size": 100,
        "include_headers": false
      },
      "retrievedAt": "2026-10-27T21:00:11.898Z",
      "verifier": "sam-google-independent-readback",
      "verifiedAt": "2026-10-27T21:00:13.756Z",
      "verificationEvidenceHash": "57f58cf735b8646997784265ff608e3221d052bc8c677e6d09bae1ad251a0359",
      "verificationContractId": "4e86baa8-4056-4104-a148-f946078c12b8"
    },
    {
      "id": "22dc2c79-cc63-46a5-b562-9101c8406dea",
      "queueId": "d5c4316f-df79-4af3-84ec-486a27644263",
      "verificationId": "4a2231d0-e819-46e4-8201-4ae1921a68aa",
      "resultHash": "0bfb3d64ca7bfba4be6719fea73a920b23a3034573ce4189fbc8387e931152c3",
      "executionHash": "93997478f5f47f8268ae0fd394cd4bb5ec8955eb30773541022c292f54d8a81d",
      "direction": "sent",
      "count": 0,
      "actor": "communications@1.0.0",
      "params": {
        "query": "in:sent after:1792985928 before:1793072328",
        "page_size": 100,
        "include_headers": false
      },
      "retrievedAt": "2026-10-27T21:00:16.220Z",
      "verifier": "sam-google-independent-readback",
      "verifiedAt": "2026-10-27T21:00:17.450Z",
      "verificationEvidenceHash": "133a95655e47bce3e2aeb5c380b09b88c3073fdc9b8a2b2b42725f941833bcee",
      "verificationContractId": "4e86baa8-4056-4104-a148-f946078c12b8"
    }
  ]
};
