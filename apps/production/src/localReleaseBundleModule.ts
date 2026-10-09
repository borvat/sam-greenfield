import type {ProductionBundle} from "./types";
import {pool} from "../../../packages/db/src/client";
import {sha256Hex} from "../../../packages/shared/src/stableJson";
import {calculateLocal,independentLocalAggregates} from "../../../packages/shared/src/localMath";

// Release composition for existing local.calculate/local.statistics ONLY.
// No sandbox artifacts, knowledge lookup, model, connector or environment loader.
// Stateless arithmetic has no external effect; SAM still persists execution,
// applies authority/idempotency/leases and checks independent goal acceptance.
const ids=["local.calculate","local.statistics"];
const operations=["sum","mean","min","max","count"];
function parameters(id:string,params:Record<string,unknown>){
  const keys=id==="local.calculate"?["operation","values"]:["values"];
  if(!ids.includes(id)||!params||Object.keys(params).some(k=>!keys.includes(k))||
    !Array.isArray(params.values)||params.values.length<1||params.values.length>16||
    params.values.some(v=>!Number.isSafeInteger(v)||Math.abs(v)>1000000)||
    (id==="local.calculate"&&!operations.includes(String(params.operation)))){
    throw new Error("RELEASE_LOCAL_PARAMETERS_REFUSED");
  }
  return {values:params.values as number[],operation:id==="local.calculate"?String(params.operation):"mean"};
}
function shape(id:string,operation:string,numeric:Record<string,number>){
  return id==="local.calculate"?{operation,value:numeric[operation]}:
    {operation:"mean",value:numeric.mean,count:numeric.count,min:numeric.min,max:numeric.max};
}
const values={type:"array",minItems:1,maxItems:16,items:{type:"integer",minimum:-1000000,maximum:1000000}};
const bundle:ProductionBundle={
  capabilities:ids.map(capabilityId=>({capabilityId,authorityClass:"GREEN",specialistAgentId:"autonomy-local",
    specialistVersion:"1.0.0",description:"Existing local aggregate arithmetic, bounded integer inputs; no external effects.",
    parameters:{type:"object",additionalProperties:false,
      required:capabilityId==="local.calculate"?["operation","values"]:["values"],
      properties:capabilityId==="local.calculate"?{operation:{type:"string",enum:operations},values}:{values}}})),
  toolDefinitions:ids.map(capabilityId=>({capabilityId,authorityClass:"GREEN",sideEffect:false})),
  toolAdapters:ids.map(capabilityId=>({capabilityId,async execute(request){
    if(request.capabilityId!==capabilityId)throw new Error("RELEASE_LOCAL_CAPABILITY_REFUSED");
    const p=parameters(capabilityId,request.params);
    const result=capabilityId==="local.calculate"?{operation:p.operation,value:calculateLocal(p.values,p.operation)}:
      {operation:"mean",value:calculateLocal(p.values,"mean"),count:p.values.length,min:Math.min(...p.values),max:Math.max(...p.values)};
    return {result,evidence:{result,resultHash:sha256Hex(result),source:"local_arithmetic"}};
  }})),
  verificationAdapters:ids.map(capabilityId=>({capabilityId,async verify(input){
    if(input.execution.capabilityId!==capabilityId)throw new Error("RELEASE_LOCAL_CAPABILITY_REFUSED");
    const p=parameters(capabilityId,input.execution.params);
    const independent=shape(capabilityId,p.operation,await independentLocalAggregates(pool,p.values));
    const matches=sha256Hex(independent)===input.execution.evidence.resultHash&&
      sha256Hex(input.execution.evidence.result)===input.execution.evidence.resultHash;
    return {result:matches?"VERIFIED":"FAILED",verifier:"release-independent-sql",
      evidence:{independentSql:true,resultHash:sha256Hex(independent),reason:matches?"MATCH":"RESULT_MISMATCH"}};
  }})),
  modelAdapters:[],modelProviderConfigs:[],workerLeaseTtlSeconds:60
};
export default bundle;
