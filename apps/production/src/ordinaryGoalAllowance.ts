import {hasAdmittedGoalTransition} from '../../../packages/db/src/commitAdmission';
import {randomUUID} from 'node:crypto';
import type {PoolClient} from 'pg';
import {withTransaction} from '../../../packages/db/src/client';
import {sha256Hex} from '../../../packages/shared/src/stableJson';
import {validateLimits,type Limits} from '../../agents/src/intelligence/contracts';

/** No evaluation authority: these receipts belong to the authenticated executing
 * root. Caller must still enforce runtime admission and descendant assignments. */
export interface OrdinaryAllowancePolicy {
 version:1; capabilityHash:string; limits:Limits;
 prices:{providerId:string;model:string;inputPer1k:number;outputPer1k:number}[];
}
type Kind='model'|'tool'|'readback'|'iteration'|'delegation';
type Counters={models:number;tools:number;iterations:number;tokens:number;costNanos:number;delegations:number};
const zero=():Counters=>({models:0,tools:0,iterations:0,tokens:0,costNanos:0,delegations:0});
const action='ORDINARY_GOAL_ALLOWANCE_V1';
const closed=new Set(['COMPLETED','FAILED','CANCELLED','BLOCKED','WAITING_EXTERNAL','WAITING_OWNER']);
const nanos=(n:number)=>{const v=Math.ceil(n*1e9);if(!Number.isFinite(n)||n<0||!Number.isSafeInteger(v))throw Error('ORDINARY_ALLOWANCE_COST_INVALID');return v;};
export function validateOrdinaryLimits(limits:Limits){
 // Existing planning/review deadlines are 30s/40s. The specialist-only schema
 // caps reasoning at 20s; do not silently impose that on ordinary review.
 validateLimits({...limits,modelCallMs:Math.min(limits.modelCallMs,20000)});
 if(!Number.isSafeInteger(limits.modelCallMs)||limits.modelCallMs<1||limits.modelCallMs>40000)throw Error('ORDINARY_MODEL_DEADLINE_INVALID');
 return {...limits};
}
function validatePolicy(p:OrdinaryAllowancePolicy){
 if(p.version!==1||! /^[a-f0-9]{64}$/.test(p.capabilityHash)||!Array.isArray(p.prices)||!p.prices.length||p.prices.length>16||
  new Set(p.prices.map(v=>v.providerId+':'+v.model)).size!==p.prices.length||p.prices.some(v=>!v.providerId||!v.model||
   !Number.isFinite(v.inputPer1k)||!Number.isFinite(v.outputPer1k)||v.inputPer1k<=0||v.outputPer1k<=0))throw Error('ORDINARY_ALLOWANCE_POLICY_INVALID');
 validateOrdinaryLimits(p.limits);nanos(p.limits.costUsd);
 return structuredClone(p);
}
interface Event {sequence:number;type:'OPEN'|'RESERVED'|'INVOKING'|'FINISHED';ticket?:string;[key:string]:unknown}
/** Existing audit grants only; append-only rows cannot reset consumed amounts.
 * Every ledger access first locks the same root, including settlement. */
export async function openOrdinaryGoalAllowance(input:{rootGoalId:string;tenant:string;policy:OrdinaryAllowancePolicy}){
 const policy=validatePolicy(input.policy),policyHash=sha256Hex(policy);
 async function locked(c:PoolClient){
  const root=(await c.query(`SELECT *,clock_timestamp() observed_at FROM goals WHERE id=$1 FOR UPDATE`,[input.rootGoalId])).rows[0];
  if(!root||root.company_scope!==input.tenant||root.parent_goal_id||root.authority_ceiling!=='GREEN'||root.completion_definition!=='sam.read_report.v1')throw Error('ORDINARY_ALLOWANCE_SCOPE_DENIED');
  const events=(await c.query('SELECT after_ref FROM audit_log WHERE goal_id=$1 AND action=$2',[input.rootGoalId,action])).rows.map(r=>r.after_ref as Event).sort((a,b)=>a.sequence-b.sequence);
  if(events.length>512||events.some((e,i)=>e.sequence!==i||i===0&&e.type!=='OPEN'||i>0&&e.type==='OPEN'))throw Error('ORDINARY_ALLOWANCE_LEDGER_INVALID');
  const first=events[0];
  if(first&&(first.policyHash!==policyHash||first.objectiveHash!==sha256Hex(root.objective)||first.tenant!==input.tenant||!Number.isFinite(Date.parse(String(first.deadline)))))throw Error('ORDINARY_ALLOWANCE_BINDING_CHANGED');
  return {root,events,first};
 }
 async function append(c:PoolClient,events:Event[],event:Omit<Event,'sequence'>){
  const value={...event,sequence:events.length} as Event;
  await c.query(`INSERT INTO audit_log(actor,goal_id,action,entity_type,entity_id,after_ref,source,authority_class,result)
   VALUES('ordinary_goal_allowance',$1,$2,'goal',$1,$3::jsonb,'runtime','GREEN','RECORDED')`,[input.rootGoalId,action,JSON.stringify(value)]);
  events.push(value);
 }
 function liveState(s:Awaited<ReturnType<typeof locked>>){
  if(!s.first)throw Error('ORDINARY_ALLOWANCE_MISSING');
  if(closed.has(s.root.state))throw Error('ORDINARY_ALLOWANCE_GOAL_CLOSED');
  if(Date.parse(String(s.first.deadline))<=new Date(s.root.observed_at).getTime())throw Error('ORDINARY_ALLOWANCE_TIME_EXHAUSTED');
 }
 await withTransaction(async c=>{
  const s=await locked(c);
  if(!s.first){
   if(s.root.state!=='NEW'||!(await c.query("SELECT 1 FROM audit_log WHERE goal_id=$1 AND action='SAM_GOAL_SUBMITTED' AND source='sam_mcp' AND authority_class='GREEN' AND result='CREATED' AND after_ref->>'ordinaryGeneralAgentV1'='true'",[input.rootGoalId])).rowCount)throw Error('ORDINARY_ALLOWANCE_AUTHENTICATED_SUBMISSION_REQUIRED');
   await append(c,s.events,{type:'OPEN',policy,policyHash,objectiveHash:sha256Hex(s.root.objective),tenant:input.tenant,
    deadline:new Date(new Date(s.root.observed_at).getTime()+policy.limits.elapsedMs).toISOString()});
  }
 });
 function used(events:Event[]){
  const value=zero();for(const e of events.filter(e=>e.type==='RESERVED')){
   const delta=e.delta as Counters;
   if(!delta||Object.keys(delta).length!==Object.keys(value).length)throw Error('ORDINARY_ALLOWANCE_LEDGER_INVALID');
   for(const k of Object.keys(value) as (keyof Counters)[]){if(!Number.isSafeInteger(delta[k])||delta[k]<0)throw Error('ORDINARY_ALLOWANCE_LEDGER_INVALID');value[k]+=delta[k];if(!Number.isSafeInteger(value[k]))throw Error('ORDINARY_ALLOWANCE_LEDGER_INVALID');}
  }return value;
 }
 async function live(c:PoolClient){const s=await locked(c);liveState(s);return {deadline:String(s.first.deadline),used:used(s.events)};}
 async function reserveIn(c:PoolClient,kind:Kind,details?:{providerId:string;model:string;inputTokens:number;outputTokens:number}){
   const s=await locked(c);liveState(s);const delta=zero();
   if(kind==='model'){
    if(!details||!Number.isSafeInteger(details.inputTokens)||!Number.isSafeInteger(details.outputTokens)||details.inputTokens<1||details.outputTokens<1||details.inputTokens>policy.limits.maxInputTokens||details.outputTokens>policy.limits.maxOutputTokens)throw Error('ORDINARY_ALLOWANCE_MODEL_LIMIT_INVALID');
    const price=policy.prices.find(p=>p.providerId===details.providerId&&p.model===details.model);if(!price)throw Error('ORDINARY_ALLOWANCE_PRICE_REQUIRED');
    delta.models=1;delta.tokens=details.inputTokens+details.outputTokens;
    delta.costNanos=nanos((details.inputTokens*price.inputPer1k+details.outputTokens*price.outputPer1k)/1000);
   }else if(kind==='tool'||kind==='readback')delta.tools=1;
   else if(kind==='iteration')delta.iterations=1;else if(kind==='delegation')delta.delegations=1;else throw Error('ORDINARY_ALLOWANCE_KIND_INVALID');
   const totals=used(s.events),limits={...policy.limits,costNanos:Math.floor(policy.limits.costUsd*1e9)};
   for(const k of Object.keys(delta) as (keyof Counters)[])if(totals[k]+delta[k]>limits[k])throw Error('ORDINARY_ALLOWANCE_BUDGET_EXHAUSTED:'+k);
   const ticket=randomUUID();await append(c,s.events,{type:'RESERVED',ticket,kind,delta,...(details?{model:details.model,providerId:details.providerId}:{})});return ticket;
 }
 const reserve=(kind:Kind,details?:{providerId:string;model:string;inputTokens:number;outputTokens:number})=>withTransaction(c=>reserveIn(c,kind,details));
 async function charge(c:PoolClient,kind:'iteration'|'delegation'){
  const ticket=await reserveIn(c,kind),s=await locked(c);
  await append(c,s.events,{type:'INVOKING',ticket});await append(c,s.events,{type:'FINISHED',ticket,status:'success'});return ticket;
 }
 async function begin(ticket:string){
  await withTransaction(async c=>{const s=await locked(c);liveState(s);
   if(!s.events.some(e=>e.ticket===ticket&&e.type==='RESERVED')||s.events.some(e=>e.ticket===ticket&&e.type!=='RESERVED'))throw Error('ORDINARY_ALLOWANCE_INVOCATION_DENIED');
   await append(c,s.events,{type:'INVOKING',ticket});
  });
 }
 async function finish(ticket:string,status:'success'|'failure',resultHash?:string){
  // Late failures may settle after cancellation, but never authorize a report.
  await withTransaction(async c=>{const s=await locked(c);
   if(!['success','failure'].includes(status)||resultHash!==undefined&&!/^[a-f0-9]{64}$/.test(resultHash)||!s.events.some(e=>e.ticket===ticket&&e.type==='RESERVED')||
    status==='success'&&!s.events.some(e=>e.ticket===ticket&&e.type==='INVOKING')||s.events.some(e=>e.ticket===ticket&&e.type==='FINISHED'))throw Error('ORDINARY_ALLOWANCE_SETTLEMENT_DENIED');
   await append(c,s.events,{type:'FINISHED',ticket,status,...(resultHash?{resultHash}:{})});
  });
 }
 return Object.freeze({rootGoalId:input.rootGoalId,live,reserve,charge,begin,finish,
  waiting:async(c:PoolClient)=>{const s=await locked(c);if(!s.first||s.root.state!=='WAITING_EXTERNAL')throw Error('ORDINARY_ALLOWANCE_GOAL_CLOSED');if(Date.parse(String(s.first.deadline))<=new Date(s.root.observed_at).getTime())throw Error('ORDINARY_ALLOWANCE_TIME_EXHAUSTED');},
  commit:async(c:PoolClient)=>{
   const s=await locked(c);if(!s.first||s.root.state==='CANCELLED')throw Error('ORDINARY_ALLOWANCE_GOAL_CLOSED');
   if(closed.has(s.root.state)){
    // Certify the state-machine transition made by THIS PostgreSQL transaction,
    // not a terminal event from an earlier commit. The root lock prevents a
    // concurrent cancellation from interleaving. No late callback can reuse it.
    if(!await hasAdmittedGoalTransition(c,input.rootGoalId,s.root.state,['NEW','MODELING','PLANNING','EXECUTING','VERIFYING','REPLANNING']))throw Error('ORDINARY_ALLOWANCE_GOAL_CLOSED');
   }
   if(Date.parse(String(s.first.deadline))<=new Date(s.root.observed_at).getTime())throw Error('ORDINARY_ALLOWANCE_TIME_EXHAUSTED');
  },
  snapshot:()=>withTransaction(async c=>{const s=await locked(c);return {deadline:String(s.first?.deadline),used:used(s.events),uncertain:s.events.filter(e=>e.type==='RESERVED'&&!s.events.some(f=>f.ticket===e.ticket&&f.type==='FINISHED')).map(e=>e.ticket)};})});
}
