import {randomUUID} from 'node:crypto';
import type {PoolClient} from 'pg';
import {ModelGateway} from '../../../../packages/model-gateway/src/gateway';
import type {ModelTask} from '../../../../packages/model-gateway/src/types';
import {fixtureEvaluationPermit,authorizeLiveEvaluation} from '../../../../packages/model-gateway/src/evaluationPermit';
import {withTransaction} from '../../../../packages/db/src/client';
import {assertEvaluationAccess} from '../../../../packages/db/src/evaluationProfile';
import {sha256Hex} from '../../../../packages/shared/src/stableJson';
import {commercialScenario} from './scenarios';
import {evaluationCases} from './cases';
import {validateTrialSpec,zero,type TrialSpec,type Counters} from './trialSpec';
export {validateTrialSpec,zero,type TrialSpec,type Counters} from './trialSpec';
/** Operator-only: runtime receives SELECT and monotonic counters, never INSERT. */
export async function createEvaluationTrial(c:PoolClient,input:{rootGoalId:string;spec:TrialSpec}){
 const s=validateTrialSpec(input.spec);
 const g=(await c.query("SELECT state,company_scope,parent_goal_id FROM goals WHERE id=$1",[input.rootGoalId])).rows[0];
 if(!g||g.state!=='NEW'||g.company_scope!==s.companyId||g.parent_goal_id)throw Error('EVALUATION_NEW_SYNTHETIC_ROOT_REQUIRED');
 const r=await c.query(`INSERT INTO evaluation_trials(root_goal_id,legal_entity_id,spec,deadline) VALUES($1,$2,$3,clock_timestamp()+($4::text||' milliseconds')::interval) RETURNING id`,[input.rootGoalId,s.companyId,JSON.stringify(s),s.limits.elapsedMs]);return r.rows[0].id as string;
}
export async function appendTrialEvent(c:PoolClient,trialId:string,kind:string,payload:unknown,reservationId:string|null=null){
 return (await c.query(`INSERT INTO evaluation_events(trial_id,kind,reservation_id,payload) VALUES($1,$2,$3,$4) RETURNING sequence,hash,created_at`,[trialId,kind,reservationId,JSON.stringify(payload)])).rows[0];
}
const trials=new WeakSet<object>();
export function assertEvaluationTrial(t:EvaluationTrial){if(!trials.has(t))throw Error('EVALUATION_TRIAL_AUTHORIZATION_REQUIRED');}
export async function openEvaluationTrial(trialId:string,approval?:{payload:Record<string,unknown>;signature:string;trustedOwnerPublicKey:string}){
 const {tenant,row,schema}=await withTransaction(async c=>{const tenant=await assertEvaluationAccess(c);const schema=(await c.query('SELECT current_schema() s')).rows[0].s;
  if(!/^[a-z_][a-z0-9_]*$/.test(schema))throw Error('EVALUATION_SCHEMA_DENIED');
  await c.query("SELECT set_config('search_path',$1,true)",[schema+',pg_catalog,public,pg_temp']);
  const row=(await c.query('SELECT * FROM evaluation_trials WHERE id=$1',[trialId])).rows[0];return {tenant,row,schema};});
 if(!row||row.legal_entity_id!==tenant.entity)throw Error('EVALUATION_SCOPE_DENIED');
 const spec=validateTrialSpec(row.spec),specHash=sha256Hex(spec);
 const permit=spec.mode==='fixture'?fixtureEvaluationPermit(trialId,spec.prices):(()=>{
  if(!approval)throw Error('EVALUATION_OWNER_AUTHORIZATION_REQUIRED');
  return authorizeLiveEvaluation({...approval,expectedPayload:{kind:'SAM_LIVE_EVALUATION_APPROVAL',trialId,rootGoalId:row.root_goal_id,companyId:tenant.entity,specHash,commit:spec.commit,corpusHash:spec.corpusHash,endpoint:spec.liveEndpoint,prices:spec.prices,expiresAt:new Date(row.deadline).toISOString()}});
 })();
 const freeze=(o:any)=>{if(o&&typeof o==='object'){Object.values(o).forEach(freeze);Object.freeze(o);}};freeze(spec);
 const rootGoalId=row.root_goal_id as string;
 async function fixedPath(c:PoolClient){await c.query("SELECT set_config('search_path',$1,true)",[schema+',pg_catalog,public,pg_temp']);}
 async function live(c:PoolClient,agentId?:string){
  await fixedPath(c);
  const t=(await c.query(`SELECT t.*,g.state root_state,t.deadline>clock_timestamp() timely,clock_timestamp() observed_at FROM evaluation_trials t JOIN goals g ON g.id=t.root_goal_id WHERE t.id=$1 FOR UPDATE OF t`,[trialId])).rows[0];
  if(!t||t.legal_entity_id!==tenant.entity||sha256Hex(t.spec)!==specHash)throw Error('EVALUATION_SCOPE_OR_SPEC_CHANGED');
  if(t.cancelled||t.sealed||!t.timely||['COMPLETED','FAILED','CANCELLED','BLOCKED','WAITING_EXTERNAL','WAITING_OWNER'].includes(t.root_state))throw Error('EVALUATION_CANCELLED_OR_EXPIRED');
  if(agentId&&t.agent_deadlines[agentId]&&Date.parse(t.agent_deadlines[agentId])<=new Date(t.observed_at).getTime())throw Error('EVALUATION_AGENT_TIME_EXHAUSTED');return t;
 }
 async function scope(c:PoolClient,goalId:string){
  await fixedPath(c);
  const r=await c.query(`WITH RECURSIVE lineage(id,parent_goal_id,company_scope,depth) AS (
   SELECT id,parent_goal_id,company_scope,0 FROM goals WHERE id=$1 UNION ALL
   SELECT g.id,g.parent_goal_id,g.company_scope,l.depth+1 FROM goals g JOIN lineage l ON g.id=l.parent_goal_id WHERE l.depth<4)
   SELECT id FROM lineage WHERE id=$2 AND company_scope=$3`,[goalId,rootGoalId,tenant.entity]);if(r.rowCount!==1)throw Error('EVALUATION_GOAL_SCOPE_DENIED');
 }
 async function reserve(c:PoolClient,input:{goalId:string;agentId:string;delta:Partial<Counters>;kind:string;metadata?:Record<string,unknown>}){
  await scope(c,input.goalId);const t=await live(c,input.agentId);const limit=spec.agents[input.agentId];if(!Object.hasOwn(spec.agents,input.agentId))throw Error('EVALUATION_AGENT_DENIED');
  const used={...t.used} as Counters,agents={...t.agent_used},agent={...zero(),...agents[input.agentId]} as Counters;
  for(const [key,n] of Object.entries(input.delta)){
   const k=key as keyof Counters;if(!Object.hasOwn(zero(),k)||!Number.isFinite(n)||n<0||k!=='costUsd'&&!Number.isSafeInteger(n)||used[k]+n>spec.limits[k]+1e-12)throw Error('EVALUATION_BUDGET_EXHAUSTED:'+k);
   if(agent[k]+n>limit[k]+1e-12)throw Error('EVALUATION_AGENT_BUDGET_EXHAUSTED:'+k);used[k]+=n;agent[k]+=n;
  }
  agents[input.agentId]=agent;
  const deadlines={...t.agent_deadlines};deadlines[input.agentId]??=new Date(Math.min(new Date(t.deadline).getTime(),new Date(t.observed_at).getTime()+limit.elapsedMs)).toISOString();
  await c.query('UPDATE evaluation_trials SET used=$2,agent_used=$3,agent_deadlines=$4 WHERE id=$1',[trialId,JSON.stringify(used),JSON.stringify(agents),JSON.stringify(deadlines)]);
  const id=randomUUID();await appendTrialEvent(c,trialId,'RESERVED',{...input.metadata,agentId:input.agentId,goalId:input.goalId,kind:input.kind,reserved:{...zero(),...input.delta}},id);
  // Iteration/delegation counters are instantaneous; provider/tool attempts are
  // settled separately. A crash between reservation and result stays unknown.
  if(['iteration','delegation'].includes(input.kind))await appendTrialEvent(c,trialId,'FINISHED',{status:'success'},id);
  return id;
 }
 async function finish(id:string|void,result:Record<string,unknown>){if(!id)throw Error('EVALUATION_RESERVATION_REQUIRED');await withTransaction(async c=>{await fixedPath(c);
  if(!['success','failure'].includes(String(result.status)))throw Error('EVALUATION_COMPLETION_INVALID');
  if(result.status==='success'&&!(await c.query("SELECT 1 FROM evaluation_events WHERE trial_id=$1 AND reservation_id=$2 AND kind='INVOKING'",[trialId,id])).rowCount)throw Error('EVALUATION_INVOCATION_REQUIRED');
  return appendTrialEvent(c,trialId,'FINISHED',result,id);});}
 async function begin(id:string|void,metadata:Record<string,unknown>){
  if(!id)throw Error('EVALUATION_RESERVATION_REQUIRED');
  await withTransaction(async c=>{
   if(typeof metadata.workGoalId==='string')await scope(c,metadata.workGoalId);
   await live(c);const r=(await c.query("SELECT payload FROM evaluation_events WHERE trial_id=$1 AND reservation_id=$2 AND kind='RESERVED'",[trialId,id])).rows[0]?.payload;
   if(!r||r.kind!==metadata.kind||metadata.agentId&&r.agentId!==metadata.agentId||metadata.tokens!==undefined&&r.reserved.tokens!==metadata.tokens||
    metadata.costUsd!==undefined&&r.reserved.costUsd!==metadata.costUsd)throw Error('EVALUATION_RESERVATION_MISMATCH');
   await live(c,r.agentId); // Recheck the reserved agent at execution admission.
   if(['providerId','model','capabilityId','workGoalId','queueId','executionId','fencingToken'].some(k=>metadata[k]!==undefined&&r[k]!==metadata[k]))throw Error('EVALUATION_RESERVATION_MISMATCH');
   if((await c.query("SELECT 1 FROM evaluation_events WHERE trial_id=$1 AND reservation_id=$2 AND kind='FINISHED'",[trialId,id])).rowCount)throw Error('EVALUATION_ATTEMPT_ALREADY_FINISHED');
   await appendTrialEvent(c,trialId,'INVOKING',metadata,id);
  });
 }
 function gateway(base:ModelGateway,goalId:string,agentId:string){
  return new class extends ModelGateway{
   constructor(){super({});}
   override async invoke(task:ModelTask){
    const original=task.boundedSynthetic;const l=spec.agents[agentId];if(!l)throw Error('EVALUATION_AGENT_DENIED');
    const inputTokens=Math.min(original?.maxInputTokens??l.maxInputTokens,l.maxInputTokens,spec.limits.maxInputTokens),outputTokens=Math.min(original?.maxOutputTokens??l.maxOutputTokens,l.maxOutputTokens,spec.limits.maxOutputTokens);
    const controller=new AbortController();const signal=task.signal?AbortSignal.any([task.signal,controller.signal]):controller.signal;
    let ticket:string|void;let timer:ReturnType<typeof setTimeout>|undefined;
    try{
     const admission=await withTransaction(async c=>{await scope(c,goalId);await live(c,agentId);if(agentId==='executive-bootstrap'||agentId.startsWith('goal.'))await reserve(c,{goalId,agentId,delta:{iterations:1},kind:'iteration'});return live(c,agentId);});
     const maxMs=Math.min(new Date(admission.agent_deadlines[agentId]??row.deadline).getTime()-Date.now(),new Date(row.deadline).getTime()-Date.now(),l.modelCallMs,spec.limits.modelCallMs);if(maxMs<=0)throw Error('EVALUATION_CANCELLED_OR_EXPIRED');
     const call=base.invoke({...task,boundedSynthetic:undefined,signal,maxCostUsd:Math.min(task.maxCostUsd??spec.limits.costUsd,l.costUsd,spec.limits.costUsd),
      boundedEvaluation:{permit,maxInputTokens:inputTokens,maxOutputTokens:outputTokens,
       note:event=>withTransaction(async c=>{await fixedPath(c);await appendTrialEvent(c,trialId,'ROUTING',{agentId,goalId,...event});}),
       reserveAttempt:async a=>{
        // Family + trial reservation share ONE transaction. The specialist's
        // original callback is installed by the engine and handles this path.
        if(original){ticket=await original.reserveAttempt(a);}
        else {
        ticket=await withTransaction(c=>reserve(c,{goalId,agentId,delta:{models:1,tokens:a.tokens,costUsd:a.costUsd},kind:'model',metadata:{...a,input:task.input,maxInputTokens:inputTokens,maxOutputTokens:outputTokens}}));}
        await begin(ticket,{agentId,kind:'model',providerId:a.providerId,model:a.model,tokens:a.tokens,costUsd:a.costUsd,input:task.input,maxInputTokens:inputTokens,maxOutputTokens:outputTokens});return ticket;
       },
       finishAttempt:async(id,result)=>{await finish(id,{status:result.status,...(result.result?{result:result.result}:{} )});await withTransaction(c=>live(c,agentId));}
      }});
     const result=await Promise.race([call,new Promise<never>((_,reject)=>{timer=setTimeout(()=>{controller.abort();reject(Error('EVALUATION_MODEL_TIMEOUT'));},maxMs);})]);
     await withTransaction(c=>live(c,agentId));
     if(agentId==='executive-bootstrap'){
      const value=result.result.output as {steps?:{capabilityId:string;params?:{objective?:string}}[]};
      if(value?.steps?.length!==1||value.steps[0].capabilityId!==spec.rootCapabilityId||value.steps[0].params?.objective!==(task.input as any)?.objective)throw Error('EVALUATION_ROOT_PLAN_DENIED');
     }
     return result;
    }catch(e){
     // Gateway may still settle an abort-aware attempt. Never refund uncertain
     // reservations or fabricate successful usage on timeout/crash.
     const code=e instanceof Error&&/^EVALUATION_[A-Z_]+(?::[a-zA-Z]+)?$/.test(e.message)?e.message:'EVALUATION_STEP_REJECTED';
     await withTransaction(async c=>{await fixedPath(c);await appendTrialEvent(c,trialId,'STEP_REJECTED',{agentId,goalId,code});});throw e;
    }finally{if(timer)clearTimeout(timer);controller.abort();}
   }
  }();
 }
 const instance={id:trialId,rootGoalId,spec,permit,scope,live,reserve,finish,gateway,
  begin,record:(c:PoolClient,kind:string,payload:unknown)=>appendTrialEvent(c,trialId,kind,payload),
  cancel:()=>withTransaction(async c=>{await fixedPath(c);await c.query('UPDATE evaluation_trials SET cancelled=true WHERE id=$1',[trialId]);await appendTrialEvent(c,trialId,'CANCELLED',{});}),
  checkSource:(value:Record<string,unknown>)=>{
   const source=(commercialScenario(spec.caseId)??evaluationCases.find(c=>c.id===spec.caseId))?.sources.find(s=>s.id===value.sourceId);
   if(!source||sha256Hex(source.data)!==sha256Hex(value.sourceData))throw Error('EVALUATION_FROZEN_SOURCE_REQUIRED');
   // Forward only enrolled corpus bytes. An adapter cannot smuggle extra
   // company fields alongside an otherwise valid sourceData envelope.
   const data=JSON.parse(JSON.stringify(source.data));
   return {sourceId:source.id,sourceData:data,value:'value'in data?data.value:data.text,uri:'fixture://'+spec.caseId+'/'+source.id};
  }
 };trials.add(instance);return Object.freeze(instance);
}
export type EvaluationTrial=Awaited<ReturnType<typeof openEvaluationTrial>>;
