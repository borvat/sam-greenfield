import {ModelGateway} from '../../../packages/model-gateway/src/gateway';
import type {ModelTask} from '../../../packages/model-gateway/src/types';
import {assertOrdinaryAdmission,type OrdinaryModelAdmission} from '../../../packages/model-gateway/src/ordinaryAdmission';
import {evaluationInputBytes} from '../../../packages/model-gateway/src/evaluationAdapter';
import {withTransaction} from '../../../packages/db/src/client';
import {sha256Hex} from '../../../packages/shared/src/stableJson';
import type {openOrdinaryGoalAllowance,OrdinaryAllowancePolicy} from './ordinaryGoalAllowance';

export function ordinaryGoalGateway(input:{base:ModelGateway;admission:OrdinaryModelAdmission;allowance:Awaited<ReturnType<typeof openOrdinaryGoalAllowance>>;policy:OrdinaryAllowancePolicy}){
 assertOrdinaryAdmission(input.admission);
 return new class extends ModelGateway{
  constructor(){super({});}
  override async invoke(task:ModelTask){
   if(task.boundedOrdinary||task.boundedEvaluation)throw Error('ORDINARY_MODEL_BOUNDARY_OVERRIDE_DENIED');
   const local=task.boundedSynthetic,limits=input.policy.limits;
   const maxInputTokens=Math.min(local?.maxInputTokens??limits.maxInputTokens,limits.maxInputTokens);
   const maxOutputTokens=Math.min(local?.maxOutputTokens??limits.maxOutputTokens,limits.maxOutputTokens);
   if(evaluationInputBytes(task.input)>maxInputTokens)throw Error('ORDINARY_MODEL_INPUT_EXHAUSTED');
   const before=await withTransaction(async c=>{
    // Specialist decision iterations are charged atomically by its session;
    // planning/review decisions are charged here, including invalid proposals.
    if(!local)await input.allowance.charge(c,'iteration');
    return input.allowance.live(c);
   });
   const ms=Math.min(limits.modelCallMs,Date.parse(before.deadline)-Date.now());
   if(ms<=0)throw Error('ORDINARY_ALLOWANCE_TIME_EXHAUSTED');
   const controller=new AbortController();
   const signal=task.signal?AbortSignal.any([task.signal,controller.signal]):controller.signal;
   let timer:ReturnType<typeof setTimeout>|undefined;
   try{
    const call=input.base.invoke({...task,boundedSynthetic:undefined,signal,maxCostUsd:Math.min(task.maxCostUsd??limits.costUsd,limits.costUsd),
     boundedOrdinary:{admission:input.admission,maxInputTokens,maxOutputTokens,
      reserveAttempt:async a=>{
       // Local limits are additional restrictions. Neither reservation is
       // refundable when the other refuses; no callback has dispatched yet.
       if(local)await local.reserveAttempt(a);
       const ticket=await input.allowance.reserve('model',{providerId:a.providerId,model:a.model,inputTokens:maxInputTokens,outputTokens:maxOutputTokens});
       await input.allowance.begin(ticket);return ticket;
      },finishAttempt:async(id,result)=>{
       if(!id)throw Error('ORDINARY_ALLOWANCE_TICKET_REQUIRED');
       await input.allowance.finish(id,result.status,result.result?sha256Hex(result.result):undefined);
       await withTransaction(c=>input.allowance.live(c));
      }}});
    const result=await Promise.race([call,new Promise<never>((_,reject)=>{timer=setTimeout(()=>{controller.abort();reject(Error('ORDINARY_MODEL_TIMEOUT'));},ms);})]);
    await withTransaction(c=>input.allowance.live(c));return result;
   }finally{if(timer)clearTimeout(timer);controller.abort();}
  }
 }();
}
