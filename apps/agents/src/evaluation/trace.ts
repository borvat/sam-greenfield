import {createHash,createPublicKey,verify,type KeyObject} from 'node:crypto';
import {stableStringify,sha256Hex} from '../../../../packages/shared/src/stableJson';
import {validateTrialSpec,zero,type TrialSpec,type Counters} from './trialSpec';
import {scoreEvaluation,contentHash,type EvaluationTrace} from './harness';
export interface SignedEvaluationTrace {format:'sam-evaluation-v1';keyId:string;payload:any;signature:string}
export function verifyEvaluationTrace(input:unknown,trustedKey:string|KeyObject){
 const envelope=input as SignedEvaluationTrace;const key=typeof trustedKey==='string'?createPublicKey(trustedKey):trustedKey;
 if(key.type!=='public'||key.asymmetricKeyType!=='ed25519'||envelope?.format!=='sam-evaluation-v1'||
  envelope.keyId!==createHash('sha256').update(key.export({type:'spki',format:'der'})).digest('hex')||
  !verify(null,Buffer.from(stableStringify(envelope.payload)),key,Buffer.from(envelope.signature??'','base64')))throw Error('EVALUATION_TRACE_AUTHENTICATION_FAILED');
 const {trial:t,events}=envelope.payload;const spec=validateTrialSpec(t.spec as TrialSpec);
 const complete=t.sealed&&envelope.payload.captureStatus==='SEALED_COMPLETE';
 if(!complete&&envelope.payload.captureStatus!=='INCOMPLETE_SNAPSHOT'||t.legal_entity_id!==spec.companyId||!Number.isFinite(Date.parse(t.deadline))||!Number.isFinite(Date.parse(t.created_at))||!Array.isArray(events)||events.length>1000||complete&&(!events.length||events.at(-1).kind!=='SNAPSHOT'))throw Error('EVALUATION_TRACE_INCOMPLETE');
 let previous='0'.repeat(64);const used=zero(),agentUsed:Record<string,Counters>={},reservations=new Map<string,any>(),finished=new Map<string,any>(),invoked=new Set<string>();
 events.forEach((e:any,i:number)=>{
  const canonical=JSON.parse(e.canonical);
  if(e.trial_id!==t.id||Number(e.sequence)!==i+1||e.previous_hash!==previous||e.hash!==createHash('sha256').update(previous+e.canonical).digest('hex')||
   canonical.trialId!==t.id||canonical.sequence!==i+1||canonical.kind!==e.kind||canonical.reservationId!==e.reservation_id||stableStringify(canonical.payload)!==stableStringify(e.payload)||Date.parse(canonical.at)!==Date.parse(e.created_at))throw Error('EVALUATION_HASH_CHAIN_INVALID');
  previous=e.hash;
  if(e.kind==='RESERVED'){
   if(reservations.has(e.reservation_id))throw Error('EVALUATION_RESERVATION_REUSED');reservations.set(e.reservation_id,e);
   const p=e.payload;if(!Object.hasOwn(spec.agents,p.agentId))throw Error('EVALUATION_AGENT_DENIED');const a=agentUsed[p.agentId]??=zero();
   for(const k of Object.keys(used) as (keyof Counters)[]){const n=p.reserved[k];if(!Number.isFinite(n)||n<0||k!=='costUsd'&&!Number.isSafeInteger(n))throw Error('EVALUATION_RESERVATION_INVALID');used[k]+=n;a[k]+=n;}
   if(Date.parse(e.created_at)>Date.parse(t.deadline))throw Error('EVALUATION_LATE_RESERVATION');
   if(!Number.isFinite(Date.parse(t.agent_deadlines[p.agentId]))||Date.parse(e.created_at)>Date.parse(t.agent_deadlines[p.agentId]))throw Error('EVALUATION_LATE_AGENT_RESERVATION');
  }
  if(e.kind==='INVOKING'){if(!reservations.has(e.reservation_id)||invoked.has(e.reservation_id))throw Error('EVALUATION_INVOCATION_INVALID');invoked.add(e.reservation_id);}
  if(e.kind==='FINISHED'){if(!reservations.has(e.reservation_id)||finished.has(e.reservation_id))throw Error('EVALUATION_COMPLETION_INVALID');finished.set(e.reservation_id,e);}
 });
 for(const k of Object.keys(used) as (keyof Counters)[]){if(Math.abs(used[k]-t.used[k])>1e-8||used[k]>spec.limits[k]+1e-12)throw Error('EVALUATION_LEDGER_MISMATCH');}
 if(stableStringify(agentUsed)!==stableStringify(t.agent_used))throw Error('EVALUATION_AGENT_LEDGER_MISMATCH');
 for(const [id,u]of Object.entries(agentUsed))for(const k of Object.keys(u) as (keyof Counters)[])if(u[k]>spec.agents[id][k]+1e-12)throw Error('EVALUATION_AGENT_BUDGET_EXHAUSTED');
 const pending=[...reservations.keys()].filter(id=>!finished.has(id));
 if(complete&&pending.length)throw Error('EVALUATION_UNCERTAIN_ATTEMPTS_REQUIRE_REVIEW');
 return {trial:t,spec,events,reservations,finished,invoked,headHash:previous,complete,pending};
}
/** Transform only authenticated DB capture; caller cannot submit a replacement
 * scored trace or omit bootstrap/failed reservations from the projection. */
export function scoreAuthenticatedEvaluation(input:unknown,trustedKey:string|KeyObject,commit:string){
 const capture=verifyEvaluationTrace(input,trustedKey),{trial:t,spec,events,reservations,finished}=capture;
 if(spec.commit!==commit)throw Error('EVALUATION_COMMIT_MISMATCH');
 if(!capture.complete)return {schemaVersion:1,commit,status:'FAIL',classification:'AUTHENTICATED_INCOMPLETE_CAPTURE',traceAuthenticated:true,headHash:capture.headHash,wholeTrialUsed:t.used,
  liveReasoningValidated:false,independentHumanReview:'PENDING',pendingReservations:capture.pending,checks:[{name:'complete-trial',status:'FAIL',detail:'Incomplete snapshot; reservations remain charged, outcomes and final report are not certified'}]};
 const snapshot=events.at(-1).payload,report=snapshot.report;
 const sources=snapshot.sources.filter((s:any)=>s.verification_result==='VERIFIED'&&s.result.sourceId);
 const sourceForExecution=(id:string)=>sources.find((s:any)=>s.id===id)?.result.sourceId as string|undefined;
 const lean=({iterations,elapsedMs,maxInputTokens,maxOutputTokens,modelCallMs,toolCallMs,...c}:any)=>c;
 const projected:EvaluationTrace['events']=[];
 for(const [id,r]of reservations){
  const p=r.payload,f=finished.get(id).payload;if(p.kind==='iteration')continue;
  if(p.kind==='delegation')continue; // Actual child records below carry each count.
  const result=f.result;
  const sourceId=p.kind==='tool'?result?.result?.sourceId:p.kind==='readback'?sourceForExecution(p.executionId):undefined;
  projected.push({id,agentId:p.agentId,companyId:spec.companyId,at:new Date(r.created_at).toISOString(),kind:p.kind,
   reserved:lean(p.reserved),outcome:f.status==='success'&&(p.kind!=='readback'||result?.result==='VERIFIED')?'success':'failure',sideEffect:false,
   ...(p.kind==='model'?{providerId:p.providerId,model:p.model,...(result?.usage?{usage:result.usage}:{})}:{capabilityId:p.capabilityId,...(sourceId?{sourceId}:{})})});
 }
 for(const e of events.filter((e:any)=>e.kind==='DELEGATED'))projected.push({id:'child-'+e.sequence,agentId:e.payload.agentId,companyId:spec.companyId,at:new Date(e.created_at).toISOString(),kind:'delegation',capabilityId:e.payload.capabilityId,reserved:{models:0,tools:0,tokens:0,costUsd:0,delegations:1},outcome:'success',sideEffect:false});
 const counterDelegations=[...reservations.values()].reduce((n,r)=>n+r.payload.reserved.delegations,0);
 if(projected.filter(e=>e.kind==='delegation').length!==counterDelegations)throw Error('EVALUATION_DELEGATION_CAPTURE_MISMATCH');
 const uniqueSources=new Map<string,any>();for(const s of sources)uniqueSources.set(s.result.sourceId,s);
 const trace:EvaluationTrace={schemaVersion:1,classification:spec.mode==='fixture'?'FIXTURE':'CAPTURED_MODEL_RUN',commit:spec.commit,caseId:spec.caseId,companyId:spec.companyId,rootQueueId:snapshot.root.queue_id,
  startedAt:new Date(t.created_at).toISOString(),completedAt:new Date(events.at(-1).created_at).toISOString(),deadline:new Date(t.deadline).toISOString(),sharedLimits:lean(spec.limits),agentLimits:Object.fromEntries(Object.entries(spec.agents).map(([id,l])=>[id,lean(l)])),events:projected,
  verifiedSources:[...uniqueSources.values()].map((s:any)=>({id:s.result.sourceId,companyId:s.company_scope,executionId:s.id,verificationId:s.verification_id,verifiedAt:new Date(s.checked_at).toISOString(),status:'VERIFIED',contentHash:contentHash(s.result.sourceData)})),
  conflicts:events.filter((e:any)=>e.kind==='CONFLICTS').flatMap((e:any)=>e.payload.conflicts.map((c:any)=>({topic:c.topic,detectedAt:new Date(e.created_at).toISOString(),correctiveReadEventId:projected.find(p=>p.kind==='tool'&&p.outcome==='success'&&Date.parse(p.at)>Date.parse(e.created_at)&&p.sourceId===report.evidence.find((s:any)=>report.claims.some((cl:any)=>cl.topic===c.topic&&cl.evidenceIds.includes(s.id)))?.result.sourceId)?.id??'MISSING'}))),
  report:{summary:report.summary,classification:'MODEL_INFERENCE',claims:report.claims.map((c:any)=>({topic:c.topic,value:c.value,sourceId:sourceForExecution(c.evidenceIds[0])??'MISSING'})),uncertainties:report.uncertainties},
  learning:snapshot.learning.filter((l:any)=>['OBSERVATION','HYPOTHESIS','EVALUATION','VERIFIED_LESSON','MODEL_INFERENCE'].includes(l.kind)&&sourceForExecution(l.execution_id)).map((l:any)=>({id:l.id,parentId:l.parent_id,kind:l.kind,statement:l.statement,sourceId:sourceForExecution(l.execution_id)!,trusted:l.kind==='VERIFIED_LESSON'})),humanReview:'PENDING'};
 const scored=scoreEvaluation(trace,commit,{tokens:spec.limits.tokens,costUsd:spec.limits.costUsd,models:spec.limits.models,tools:spec.limits.tools});
 return {...scored,classification:spec.mode==='fixture'?'AUTHENTICATED_FIXTURE_CAPTURE':'AUTHENTICATED_LIVE_CAPTURE_QUALITY_REVIEW_PENDING',traceAuthenticated:true,headHash:capture.headHash,wholeTrialUsed:t.used,projectedTrace:trace,liveReasoningValidated:false};
}
