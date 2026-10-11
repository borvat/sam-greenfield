import {connectedParameters} from "./parameters";
import localBundle from "../../production/src/localReleaseBundleModule";
import {withGoogleDriveFromEnv} from "../../production/src/driveBundle";
import {withBolRetailerFromEnv} from "../../production/src/bolBundle";
import {withEBoekhoudenFromEnv} from "../../production/src/eboekhoudenBundle";
import {withStandardModelProvidersFromEnv} from "../../production/src/standardModels";
import {validateProductionBundle} from "../../production/src/bundle";
import {ModelGateway} from "../../../packages/model-gateway/src/gateway";
import type {ModelProviderAdapter,ModelTask} from "../../../packages/model-gateway/src/types";
import {withTransaction} from "../../../packages/db/src/client";
import {sha256Hex} from "../../../packages/shared/src/stableJson";
import {validateCandidatePlan} from "../../brain/src/planner";
import {objectSchema} from "../../mcp/src/schema";
import type {ProductionBundle} from "../../production/src/types";

export interface DirectBudget{goalsPerDay:number;modelCallsPerDay:number;planningMaxCostUsd:number;}
export function boundedAdapters(adapters:ModelProviderAdapter[],budget:DirectBudget){
  return adapters.map(adapter=>({providerId:adapter.providerId,async invoke(task:ModelTask,model:string){
    if(task.task!=="executive_planning"||!["PUBLIC","INTERNAL"].includes(task.dataClassification)||
      Buffer.byteLength(JSON.stringify(task.input))>32768)throw new Error("DIRECT_MODEL_INPUT_REFUSED");
    // Commit the reservation BEFORE HTTP. Crashes and provider errors consume it.
    await withTransaction(async client=>{
      await client.query("SELECT pg_advisory_xact_lock(hashtextextended($1,0))",["direct-model-budget"]);
      const count=(await client.query(`SELECT count(*)::int n FROM model_calls WHERE task='direct_budget'
        AND created_at>=date_trunc('day',now() AT TIME ZONE 'UTC') AT TIME ZONE 'UTC'`)).rows[0].n;
      if(count>=budget.modelCallsPerDay)throw new Error("DIRECT_DAILY_MODEL_LIMIT");
      await client.query(`INSERT INTO model_calls(task,provider,model,cost,success,data_classification,reason_selected,verification_result)
        VALUES('direct_budget',$1,$2,$3,false,$4,'DIRECT_RESERVED','RESERVED_BEFORE_HTTP')`,
        [adapter.providerId,model,budget.planningMaxCostUsd,task.dataClassification]);
    });
    try{
      const result=await adapter.invoke({...task,maxOutputTokens:2048},model);
      if(![result.usage.inputTokens,result.usage.outputTokens].every(x=>Number.isSafeInteger(x)&&x>=0)||
        result.usage.outputTokens>2048||Buffer.byteLength(JSON.stringify(result.output))>65536)throw new Error("DIRECT_MODEL_RESPONSE_REFUSED");
      const candidate=validateCandidatePlan(result.output);
      if(candidate.steps.length>16||candidate.steps.some(s=>s.operationKeyRef||s.idempotencyKey))throw new Error("DIRECT_MODEL_RESPONSE_REFUSED");
      return result;
    }catch{throw new Error("DIRECT_MODEL_ATTEMPT_REFUSED");}
  }}));
}
export function buildDirectBundle(env:NodeJS.ProcessEnv,allowed:string[],budget:DirectBudget){
  let raw:ProductionBundle=withStandardModelProvidersFromEnv(localBundle,env);
  if(allowed.some(x=>x.startsWith("drive_")))raw=withGoogleDriveFromEnv(raw,env);
  if(allowed.some(x=>x.startsWith("bol_")))raw=withBolRetailerFromEnv(raw,env);
  if(allowed.some(x=>x.startsWith("eboekhouden_")))raw=withEBoekhoudenFromEnv(raw,env);
  const active=new Set(allowed);
  for(const id of allowed){
    const capability=raw.capabilities.find(c=>c.capabilityId===id),definition=raw.toolDefinitions.find(t=>t.capabilityId===id);
    if(!capability||capability.authorityClass!=="GREEN"||!definition||definition.sideEffect)throw new Error("DIRECT_CAPABILITY_NOT_READY");
  }
  const adapters=raw.toolAdapters.filter(a=>active.has(a.capabilityId));
  const definitions=raw.capabilities.filter(c=>active.has(c.capabilityId)).map(c=>({...c,parameters:connectedParameters(c.capabilityId)??c.parameters}));
  // Connected reads are checked by a fresh source request AND an exact result comparison.
  // Existing local arithmetic keeps its separate PostgreSQL verifier.
  const verifiers=adapters.map(adapter=>{
    if(adapter.capabilityId.startsWith("local."))return raw.verificationAdapters!.find(v=>v.capabilityId===adapter.capabilityId)!;
    return {capabilityId:adapter.capabilityId,async verify(input:any){
      const readback=await adapter.execute({capabilityId:adapter.capabilityId,params:input.execution.params,
        idempotencyKey:"verify:"+input.execution.id});
      const hash=sha256Hex(readback.result),matches=hash===sha256Hex(input.execution.result);
      return {result:matches?"VERIFIED" as const:"FAILED" as const,verifier:"direct-independent-source-readback",
        evidence:{freshSourceRequest:true,resultHash:hash,reason:matches?"MATCH":"SOURCE_CHANGED"}};
    }};
  });
  const guardedAdapters=adapters.map(adapter=>({capabilityId:adapter.capabilityId,async execute(request:any){
    const spec=definitions.find(c=>c.capabilityId===adapter.capabilityId)?.parameters;
    if(Buffer.byteLength(JSON.stringify(request.params))>16384)throw new Error("DIRECT_PARAMS_REFUSED");
    if(spec)objectSchema(spec).parse(request.params);
    return adapter.execute(request);
  }}));
  const models=boundedAdapters(raw.modelAdapters??[],budget);
  if(!models.length)throw new Error("DIRECT_MODEL_PROVIDER_REQUIRED");
  // Bound model proposals to this deployment's trusted capability catalog.
  class DirectGateway extends ModelGateway{
    async invoke(task:ModelTask){
      const reply=await super.invoke(task);
      const candidate=validateCandidatePlan(reply.result.output);
      for(const step of candidate.steps){
        if(!active.has(step.capabilityId))throw new Error("DIRECT_PLAN_CAPABILITY_REFUSED");
        const spec=definitions.find(c=>c.capabilityId===step.capabilityId)?.parameters;
        if(spec)objectSchema(spec).parse(step.params);
      }
      return reply;
    }
  }
  raw={...raw,capabilities:definitions,toolDefinitions:raw.toolDefinitions.filter(t=>active.has(t.capabilityId)),
    toolAdapters:guardedAdapters,verificationAdapters:verifiers,modelAdapters:models,
    plannerGateway:()=>new DirectGateway(Object.fromEntries(models.map(a=>[a.providerId,a]))),
    planningMaxCostUsd:budget.planningMaxCostUsd,dataClassification:"INTERNAL",
    replanPolicy:{recoverableEvidenceReasons:["RESULT_MISMATCH","SOURCE_CHANGED","GOAL_INTENT_MISMATCH"]},
    verifiedLearning:{capabilityIds:definitions.filter(c=>c.capabilityId.startsWith("local.")).map(c=>c.capabilityId),
      project:e=>[{attribute:e.capabilityId.replace(/\./g,"_")+"_last_value",value:e.result.value}]}};
  return validateProductionBundle(raw);
}
