import localBundle from "./localReleaseBundleModule";
import {ModelGateway} from "../../../packages/model-gateway/src/gateway";
import {OpenAICompatibleChatAdapter} from "../../../packages/model-providers/src/openaiCompatible";
import {fetchJson} from "../../../packages/model-providers/src/common";
import {recordModelCall} from "../../../packages/db/src/modelCalls";
import {loadProviderRegistry} from "../../../packages/model-gateway/src/registry";
import {applyRecentFailureCircuitBreaker} from "../../../packages/model-gateway/src/health";
import {routeModel} from "../../../packages/model-gateway/src/router";
import {withTransaction} from "../../../packages/db/src/client";
import {validateCandidatePlan} from "../../brain/src/planner";
import {numericObjective,pilotConfiguration,assertPilotStep,assertPilotLedgerPrivileges} from "./syntheticPilotScope";
import type {ModelTask,ProviderResult} from "../../../packages/model-gateway/src/types";
import type {ProductionBundle} from "./types";

const model="deepseek-flash",endpoint="https://api.deepseek.com/chat/completions";
const maxOutput=512,maxInput=4096;
function deny(code:string):never{throw new Error(code);}
export function createSyntheticPilotBundle(transport:typeof fetchJson=fetchJson):ProductionBundle{
  const config=pilotConfiguration();
  const permits=new WeakSet<object>();
  const clientAdapter=new OpenAICompatibleChatAdapter("deepseek",{
    apiKey:process.env.DEEPSEEK_API_KEY!,baseUrl:"https://api.deepseek.com",timeoutMs:10000,
    transport:async(url,init,timeout)=>{
      pilotConfiguration();
      if(url!==endpoint||init.method!=="POST")deny("PILOT_PROVIDER_DESTINATION_DENIED");
      const body=JSON.parse(String(init.body));
      if(body.model!==model||body.messages?.length!==1||
        Buffer.byteLength(body.messages[0].content,"utf8")>maxInput)deny("PILOT_PROMPT_LIMIT");
      body.max_tokens=maxOutput;body.thinking={type:"disabled"};
      const response=await transport(url,{...init,body:JSON.stringify(body)},timeout);
      const usage=response?.usage;
      if(response?.model!==model||!Number.isInteger(usage?.prompt_tokens)||usage.prompt_tokens<0||
        usage.prompt_tokens>maxInput+1024||!Number.isInteger(usage?.completion_tokens)||
        usage.completion_tokens<0||usage.completion_tokens>maxOutput||
        (usage.completion_tokens_details?.reasoning_tokens??0)!==0||
        (usage.reasoning_tokens??0)!==0||response?.choices?.[0]?.message?.reasoning_content)
        deny("PILOT_PROVIDER_USAGE_DENIED");
      return response;
    }
  });
  const adapter={providerId:"deepseek",async invoke(task:ModelTask,requestedModel:string){
    if(!permits.has(task)||requestedModel!==model)deny("PILOT_ADAPTER_PERMIT_REQUIRED");
    permits.delete(task);
    return clientAdapter.invoke(task,requestedModel);
  }};
  class PilotGateway extends ModelGateway{
    constructor(){super({deepseek:adapter});}
    async invoke(task:ModelTask){
      pilotConfiguration();
      const source=task.input as any;
      const objective=numericObjective(source?.objective??"");
      const context=source?.context;
      const entityType=context?.entityType??context?.entity?.type;
      const entityId=context?.entityId??context?.entity?.id;
      const allowed=context?.entity?["entity","facts","memory","replan_reason"]:["entityId","entityType","facts","memory","replan_reason"];
      if(task.task!=="executive_planning"||task.capability!=="planning"||task.dataClassification!=="PUBLIC"||
        !context||entityId!==process.env.SAM_COMMAND_CENTER_LEGAL_ENTITY_ID||
        entityType!=="legal_entity"||Object.keys(context).some(k=>!allowed.includes(k))||
        (context.entity&&Object.keys(context.entity).sort().join(",")!=="id,type")||
        !Array.isArray(context.facts)||context.facts.length||!Array.isArray(context.memory)||context.memory.length)
        deny("PILOT_INPUT_SCOPE_DENIED");
      // Only this public numeric specification leaves the process. No SAM IDs.
      const safeTask:ModelTask={task:"executive_planning",capability:"planning",dataClassification:"PUBLIC",
        input:{objective,context:{synthetic:true,facts:[],memory:[]},
          capabilities:[{capabilityId:"local.calculate",operations:["sum","mean","min","max","count"]},
            {capabilityId:"local.statistics",operation:"mean",parameters:["values"]}],
          ...(context.replan_reason?{replan:"A previous local proposal failed verification. Correct it to match the original numeric objective."}:{}),
          contract:{output:"CandidatePlan",steps:[{capabilityId:"an allowed capability",
            params:{operation:"requested operation",values:"requested integer array"},priority:1}],
            assumptions:{},constraints:{},dependencies:{},rule:"One proposal-only step matching the numeric objective."}}};
      const reserve=((maxInput+1024)*config.input+maxOutput*config.output)/1000;
      const limit=Math.min(config.cost,task.maxCostUsd??config.cost);
      if(!Number.isFinite(limit)||limit<=0||reserve>limit)deny("PILOT_COST_CEILING");
      // Preserve SAM's registry, privacy, routing and recent-failure admission.
      // A pin narrows eligibility; it must not override a disabled provider.
      const providers=await withTransaction(async client=>
        applyRecentFailureCircuitBreaker(client,await loadProviderRegistry(client)));
      const provider=providers.find(p=>p.providerId==="deepseek");
      if(!provider||provider.costPer1kInput!==config.input||provider.costPer1kOutput!==config.output||
        routeModel({...safeTask,maxCostUsd:limit,requiredModels:[model]},providers)
          .filter(c=>c.providerId==="deepseek"&&c.model===model).length!==1)
        deny("PILOT_PROVIDER_POLICY_DENIED");
      const ledgerTask=`release_synthetic:${config.runId}`;
      // Separate committed reservation survives provider errors and worker crashes.
      const claim=await withTransaction(async client=>{
        await assertPilotLedgerPrivileges(client);
        await client.query("SELECT pg_advisory_xact_lock(hashtextextended($1,0))",[ledgerTask]);
        const used=(await client.query("SELECT count(*)::int n,coalesce(sum(cost),0)::float reserved FROM model_calls WHERE task=$1",[ledgerTask])).rows[0];
        if(!used||!Number.isInteger(used.n)||!Number.isFinite(used.reserved)||
          used.n>=config.requests||used.reserved+reserve>config.cost)deny("PILOT_RUN_BUDGET_EXHAUSTED");
        return recordModelCall(client,{task:ledgerTask,provider:"deepseek",model,reasonSelected:"SYNTHETIC_BOUNDED_RESERVATION",
          costUsd:reserve,latencyMs:0,retryCount:0,success:false,
          verificationResult:"RESERVED_USAGE_UNKNOWN",dataClassification:"PUBLIC"});
      });
      let phase="PROVIDER_RESPONSE",received:ProviderResult|undefined;
      try{
        permits.add(safeTask);
        const result:ProviderResult=await adapter.invoke(safeTask,model);
        received=result;phase="ORIGINAL_PLAN_VALIDATION";
        const raw=result.output as any;
        const candidate=validateCandidatePlan(raw);
        phase="PILOT_PLAN_SCOPE";
        if(!raw||Object.keys(raw).some(k=>!["steps","assumptions","constraints","dependencies"].includes(k))||
          ["assumptions","constraints","dependencies"].some(k=>raw[k]!==undefined&&
            (!raw[k]||Array.isArray(raw[k])||Object.keys(raw[k]).length))||
          candidate.steps.length!==1||Object.keys(raw.steps[0]).some(k=>!["capabilityId","params","priority"].includes(k))||
          (raw.steps[0].priority!==undefined&&
            (typeof raw.steps[0].priority!=="number"||!Number.isFinite(raw.steps[0].priority)||
              raw.steps[0].priority<0||raw.steps[0].priority>100)))
          deny("PILOT_PLAN_SCOPE_DENIED");
        assertPilotStep(objective,candidate.steps[0].capabilityId,candidate.steps[0].params);
        phase="USAGE_COST";
        const actual=(result.usage.inputTokens*config.input+result.usage.outputTokens*config.output)/1000;
        if(actual>reserve)deny("PILOT_USAGE_COST_DENIED");
        await withTransaction(client=>client.query(`UPDATE model_calls SET success=true,tokens=$2,
          verification_result=$3 WHERE id=$1`,[claim,result.usage.inputTokens+result.usage.outputTokens,
          JSON.stringify({stage:"PROPOSAL_VALIDATED_NOT_EXECUTED",inputTokens:result.usage.inputTokens,
            outputTokens:result.usage.outputTokens,estimatedCostUsd:actual,reservedCostUsd:reserve})]));
        return {providerId:"deepseek",result,attempts:1};
      }catch(error){
        const allowed=["PROVIDER_AUTH_REJECTED","PROVIDER_ACCESS_REJECTED","PROVIDER_RATE_LIMITED","PROVIDER_UNAVAILABLE","PROVIDER_HTTP_REJECTED"];
        const code=allowed.includes((error as any)?.code)?(error as any).code:"PILOT_STAGE_REJECTED";
        const usage=received?.usage;
        await withTransaction(client=>client.query("UPDATE model_calls SET tokens=$2,verification_result=$3 WHERE id=$1",[
          claim,usage?usage.inputTokens+usage.outputTokens:0,JSON.stringify({stage:phase,code,
            usageKnown:!!usage,...(usage?{inputTokens:usage.inputTokens,outputTokens:usage.outputTokens,
              estimatedCostUsd:(usage.inputTokens*config.input+usage.outputTokens*config.output)/1000}:{}),
            reservedCostUsd:reserve})]));
        deny("PILOT_MODEL_ATTEMPT_REJECTED");
      }
    }
  }
  return {...localBundle,modelAdapters:[adapter],modelProviderConfigs:[{providerId:"deepseek",models:[model],
    capabilities:["planning"],privacyClasses:["PUBLIC"],health:"HEALTHY",costPer1kInput:config.input,costPer1kOutput:config.output}],
    dataClassification:"PUBLIC",planningMaxCostUsd:config.cost,plannerGateway:()=>new PilotGateway()};
}
export default createSyntheticPilotBundle();
