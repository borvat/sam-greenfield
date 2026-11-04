import {runOwnerReportEmailTick} from '../../notifications/src/delivery';
import {GmailSendAdapter} from '../../tools/src/gmailSendAdapter';
import {runScopedOwnerNotificationTick} from '../../notifications/src/center';
import {recordWorkFailure} from "../../kernel/src/failures";
import {reviewNextReadGoal} from './readGoalReview';
import {relayOutboxUntilEmpty} from '../../kernel/src/outboxRelay';
import {processNextKernelEventAtomic} from '../../kernel/src/eventConsumer';
import {reconcileBlockedDependencies} from '../../kernel/src/dependencies';
import { createToolExecutors } from "../../tools/src/executorFactory";
import { reconcilePendingSideEffects } from "../../tools/src/reconciler";
import { runCatalogSpecialistTick } from "../../agents/src/executiveFlow";
import type { RuntimeComposition } from "../../runtime/src/service";
import type { ValidatedProductionBundle } from "./bundle";
import { planNextNewGoal } from "./planner";
import { verifyNextExecution } from "./verifier";
import { learnNextVerifiedExecution } from "./learning";
import { recoverKernelAfterRestart } from "../../kernel/src/recovery";
import {withTransaction} from "../../../packages/db/src/client";
import {pilotEnabled,authorizePilotGoal,assertPilotStep} from "./syntheticPilotScope";

export function createProductionComposition(input:{
  bundle:ValidatedProductionBundle;
  workerId:string;
  ordinaryFailurePolicy?:"retry"|"record";
  readReportReview?:boolean;
  specialistConcurrency?:number;
  specialistScopeGoalId?:string;
  planning?:Pick<Parameters<typeof planNextNewGoal>[1]&{},'goalId'|'gatewayForGoal'>;
  excludeDelegatedSpecialistPlanning?:boolean;
  specialistAdvancers?:Parameters<typeof runCatalogSpecialistTick>[0]['advancers'];
  operationalTick?:()=>Promise<unknown>;
  executeTool?:(work:import('../../kernel/src/workerRuntime').ClaimedWork,execute:import('../../kernel/src/workerRuntime').CapabilityExecutor)=>ReturnType<import('../../kernel/src/workerRuntime').CapabilityExecutor>;
  authorizeWork?:(work:import('../../kernel/src/workerRuntime').ClaimedWork)=>Promise<void>;
}):RuntimeComposition{
  const ordinaryExecutors=createToolExecutors({
    catalog:input.bundle.catalog,
    tools:input.bundle.tools
  });
  const executors=Object.fromEntries(Object.entries(ordinaryExecutors).map(([id,execute])=>[id,async(work:Parameters<typeof execute>[0])=>{
    if(input.authorizeWork)await input.authorizeWork(work);
    if(pilotEnabled()){
      if(!work.goalId)throw new Error("PILOT_GOAL_SCOPE_DENIED");
      const objective=await withTransaction(client=>authorizePilotGoal(client,work.goalId!));
      assertPilotStep(objective,work.capabilityId,work.params);
    }
    try{return await (input.executeTool?input.executeTool(work,execute):execute(work));}
    catch(error){
      // Deployed ordinary tools record deterministic failures. Phase8 and
      // integration compositions retain bounded lease recovery by default.
      if(input.ordinaryFailurePolicy==="record")await recordWorkFailure({queueId:work.queueId,fencingToken:work.fencingToken,error,actor:input.workerId});
      throw error;
    }
  }]));
  const ttl=input.bundle.raw.workerLeaseTtlSeconds??60;
  const hasSideEffects=Object.keys(input.bundle.catalog.authorityPolicies()).some(id=>input.bundle.tools.definition(id).sideEffect);

  const attempt=async<T>(stage:string,run:()=>Promise<T>):Promise<T|{processed:false;failed:true;reason:string}>=>{
    try{return await run();}catch(error){
      // Sanitized: the stage, the SQLSTATE when there is one, and an app error code only when the
      // message is a bare code. Free text and request data stay withheld.
      const code=typeof (error as any)?.code==='string'?(error as any).code:null;
      const message=error instanceof Error?error.message:String(error);
      const reason=/^[A-Z0-9_.:-]{3,80}$/.test(message)?message:'MESSAGE_WITHHELD';
      console.error(JSON.stringify({event:'RUNTIME_STAGE_FAILED',stage,code,reason}));
      return {processed:false,failed:true,reason:'STAGE_FAILED'};
    }
  };
  return {
    async runWorkTick(){
      const recovery=await recoverKernelAfterRestart();
      const dependencyRecovery=await reconcileBlockedDependencies();
      const events={relayed:await relayOutboxUntilEmpty(100),consumed:0};
      while(events.consumed<100&&(await processNextKernelEventAtomic()).processed)events.consumed++;
      const reconciliation=hasSideEffects?await attempt("reconciliation",()=>reconcilePendingSideEffects({
        tools:input.bundle.tools,
        limit:25
      })):null;
      const earlyVerification=input.bundle.raw.deferVerification?await attempt("verification",()=>verifyNextExecution(input.bundle)):null;
      const earlyLearning=input.bundle.raw.deferVerification?await attempt("learning",()=>learnNextVerifiedExecution(input.bundle)):null;
      const planning=await attempt("planning",()=>planNextNewGoal(input.bundle,{...input.planning,excludeDelegatedSpecialistTasks:input.excludeDelegatedSpecialistPlanning}));
      const execution=await attempt("execution",()=>runCatalogSpecialistTick({
        catalog:input.bundle.catalog,
        workerInstanceId:input.workerId,
        ttlSeconds:ttl,
        executors,advancers:input.specialistAdvancers,maxConcurrency:input.specialistConcurrency,rootGoalId:input.specialistScopeGoalId
      }));
      const verification=earlyVerification??await attempt("verification",()=>verifyNextExecution(input.bundle));
      const learning=earlyLearning??await attempt("learning",()=>learnNextVerifiedExecution(input.bundle));
      const review=input.readReportReview?await attempt("review",()=>reviewNextReadGoal(input.bundle)):null;
      const operational=input.operationalTick?await attempt("operational",input.operationalTick):null;

      const ownerNotifications=await runScopedOwnerNotificationTick();
      const binding=input.bundle.raw.ownerReportEmail;
      const gmail=input.bundle.raw.ownerReportEmailAdapter;
      const ownerReportEmail=await runOwnerReportEmailTick(
        binding?.dataClassification===input.bundle.raw.dataClassification?binding:undefined,
        gmail instanceof GmailSendAdapter?gmail:undefined);
      return {ownerReportEmail,ownerNotifications,events,dependencyRecovery,recovery,reconciliation,planning,execution,verification,review,learning,operational};
    }
  };
}
