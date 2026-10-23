import {planningValidationCode,type PlanningDiagnostic} from '../../brain/src/planner';
import {withTransaction} from '../../../packages/db/src/client';
import {ModelGateway} from '../../../packages/model-gateway/src/gateway';
import {runCatalogPlanningCycle,runCatalogReplanCycle} from '../../agents/src/executiveFlow';
import {autonomyEnabled} from '../../development/src/autonomyBoundary';
import {transitionGoal} from '../../kernel/src/stateMachine';
import {insertOutboxEvent} from '../../../packages/db/src/outbox';
import type {ValidatedProductionBundle} from './bundle';

export async function planNextNewGoal(bundle:ValidatedProductionBundle,options:{deadlineMs?:number;maxAttempts?:number;backoffMs?:number;excludeDelegatedSpecialistTasks?:boolean;goalId?:string;gatewayForGoal?:(goalId:string)=>ModelGateway}={})
 :Promise<{processed:boolean;goalId?:string;failed?:boolean;reason?:string}>{
  const adapters=bundle.raw.modelAdapters??[];
  if(!adapters.length)return {processed:false};
  // One candidate per reservation: defaults cap generation at 3 calls / 90s
  // total active deadline time (plus existing scheduler/backoff and DB work).
  // Keep the original 30s per-call deadline and half-budget cost ceiling.
  const deadlineMs=options.deadlineMs??30000,maxAttempts=options.maxAttempts??3,backoffMs=options.backoffMs??1000;
  if(!Number.isSafeInteger(deadlineMs)||deadlineMs<1||deadlineMs>120000||!Number.isSafeInteger(maxAttempts)||maxAttempts<1||maxAttempts>10||
    !Number.isSafeInteger(backoffMs)||backoffMs<1||backoffMs>60000)throw new Error('PLANNING_POLICY_INVALID');
  // A short row-locked transaction commits the durable deadline reservation.
  // No pool connection is held while nested kernel transactions or models run.
  const reservation=await withTransaction(async client=>{
    const next=(await client.query(`SELECT id,state,planning_attempts,planning_failure FROM goals
      WHERE state IN ('NEW','MODELING','PLANNING','REPLANNING')
      AND ($1::uuid IS NULL OR id=$1)
      AND (planning_retry_at IS NULL OR planning_retry_at<=now())
      AND ${options.excludeDelegatedSpecialistTasks?'NOT EXISTS(SELECT 1 FROM specialist_delegations d WHERE d.goal_id=goals.id)':'true'}
      ORDER BY last_planning_at ASC NULLS FIRST,priority DESC,created_at,id
      LIMIT 1 FOR UPDATE SKIP LOCKED`,[options.goalId??null])).rows[0];
    if(!next)return null;
    if(next.planning_attempts>=maxAttempts){
      await transitionGoal(client,next.id,next.state,'FAILED','planning_attempts_exhausted');
      return {result:{processed:true,goalId:next.id,failed:true,reason:'PLANNING_ATTEMPTS_EXHAUSTED'}};
    }
    if(next.state==='REPLANNING'&&bundle.raw.replanPolicy){
      const failure=await client.query(`SELECT v.independent_evidence FROM verifications v JOIN executions e ON e.id=v.execution_id
        WHERE e.goal_id=$1 AND v.result='FAILED' ORDER BY v.checked_at DESC,v.id DESC LIMIT 1`,[next.id]);
      if(!bundle.raw.replanPolicy.recoverableEvidenceReasons.includes(failure.rows[0]?.independent_evidence?.reason)){
        await transitionGoal(client,next.id,'REPLANNING','BLOCKED','nonrecoverable_verification_failure');
        return {result:{processed:true,goalId:next.id}};
      }
    }
    await client.query(`UPDATE goals SET planning_attempts=planning_attempts+1,last_planning_at=now(),
      planning_retry_at=now()+($2::double precision*interval '1 millisecond') WHERE id=$1`,[next.id,deadlineMs]);
    return {next};
  });
  if(!reservation)return {processed:false};
  if(reservation.result)return reservation.result;
  const next=reservation.next!,current=next;
  const started=performance.now();
  let lastDiagnostic:PlanningDiagnostic|undefined;
  let validationCode=next.planning_failure?.validationCode?
    planningValidationCode({code:next.planning_failure.validationCode}):undefined;
  const onDiagnostic=async(event:PlanningDiagnostic)=>{
    lastDiagnostic=event;
    if(event.code)validationCode=event.code;
    await withTransaction(async client=>{
      await insertOutboxEvent(client,{aggregateType:'goal',aggregateId:next.id,eventType:'PLANNING_PHASE',
        payload:{...event,attempt:current.planning_attempts+1,deadlineMs,maxAttempts}});
    });
  };
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),deadlineMs);
  try{
    const input={catalog:bundle.catalog,gateway:options.gatewayForGoal?.(next.id)??bundle.raw.plannerGateway?.()??new ModelGateway(Object.fromEntries(adapters.map(a=>[a.providerId,a]))),
      goalId:next.id,dataClassification:bundle.raw.dataClassification??'INTERNAL',maxCostUsd:bundle.raw.planningMaxCostUsd??0.25,signal:controller.signal,
      candidatePolicy:{singleCandidate:true,onDiagnostic,
        validationFeedback:validationCode}};
    if(current.state==='REPLANNING')await runCatalogReplanCycle({...input,reason:'independent_verification_failed'});
    else await runCatalogPlanningCycle(input);
    await withTransaction(client=>client.query('UPDATE goals SET planning_attempts=0,last_planning_at=now(),planning_retry_at=NULL,planning_failure=NULL WHERE id=$1 AND planning_attempts=$2',[next.id,current.planning_attempts+1]));
    return {processed:true,goalId:next.id};
  }catch(error){
    const message=error instanceof Error?error.message:'';
    const known=(error as {code?:string})?.code;
    const classified=['PROVIDER_AUTH_REJECTED','PROVIDER_ACCESS_REJECTED','PROVIDER_RATE_LIMITED','PROVIDER_UNAVAILABLE'].includes(known??'')?known!:
      /PLAN_|Planner output|Planner step|TOOL_PARAMETER/.test(message)?'PLAN_CONTRACT_INVALID':
      /authority|AUTHORITY/.test(message)?'PLAN_AUTHORITY_REQUIRED':'PLANNING_PROPOSAL_REJECTED';
    const reason=controller.signal.aborted?'PLANNING_DEADLINE_EXCEEDED':/^EVALUATION_[A-Z_]+(?::[a-zA-Z]+)?$/.test(message)?message:classified;
    return withTransaction(async client=>{
    const row=(await client.query('SELECT state,planning_attempts FROM goals WHERE id=$1 FOR UPDATE',[next.id])).rows[0];
    if(row.planning_attempts!==current.planning_attempts+1)return {processed:true,goalId:next.id,failed:true,reason:'PLANNING_RESERVATION_SUPERSEDED'};
    const state=row.state;
    const attempt=current.planning_attempts+1;
    await client.query(`UPDATE goals SET planning_attempts=$2,last_planning_at=now(),
      planning_retry_at=now()+($3::double precision*interval '1 millisecond'),planning_failure=$4::jsonb WHERE id=$1`,
      [next.id,attempt,Math.min(60000,backoffMs*2**(attempt-1)),JSON.stringify({code:reason,attempt,maxAttempts,deadlineMs,elapsedMs:Math.round(performance.now()-started),phase:lastDiagnostic?.phase??'preparation',...(validationCode?{validationCode}:{})})]);
    if(state==='PLANNING'&&autonomyEnabled())await transitionGoal(client,next.id,state,'WAITING_OWNER','planning_failed_closed');
    else if(['NEW','MODELING','PLANNING','REPLANNING'].includes(state)&&attempt>=maxAttempts)
      await transitionGoal(client,next.id,state,'FAILED','planning_attempts_exhausted');
    await insertOutboxEvent(client,{aggregateType:'goal',aggregateId:next.id,eventType:'PLANNING_ATTEMPT_FAILED',payload:{code:reason,attempt,elapsedMs:Math.round(performance.now()-started),phase:lastDiagnostic?.phase??'preparation',...(validationCode?{validationCode}:{})}});
    return {processed:true,goalId:next.id,failed:true,reason};
    });
  }finally{clearTimeout(timer);}
}
