import { withTransaction } from "../../../packages/db/src/client";
import { sha256Hex } from "../../../packages/shared/src/stableJson";
import {calculateLocal as calculate,independentLocalAggregates} from "../../../packages/shared/src/localMath";
import { validateProductionBundle } from "../../production/src/bundle";
import { ModelGateway } from "../../../packages/model-gateway/src/gateway";
import { OpenAICompatibleChatAdapter } from "../../../packages/model-providers/src/openaiCompatible";
import { AutonomyPermit,autonomyClaimId } from "./autonomyPermit";
import { assertSandbox,localParameters,LOCAL_CAPABILITIES,safeTree } from "./autonomyBoundary";

async function resolveValues(client:any,params:any,refs?:any[]){
  const references:any[]=[];
  const values:number[]=[];
  for(let i=0;i<params.values.length;i++){
    const value=params.values[i];
    if(typeof value==="number"){values.push(value);continue;}
    const key=value.slice("knowledge:".length);
    const snapshot=refs?.find(r=>r.index===i);
    const r=await client.query(`SELECT f.id,f.value,f.source,f.evidence_id FROM world_facts f
      JOIN executions e ON f.source='verified_execution:'||e.id::text
      JOIN verifications v ON v.id=f.evidence_id AND v.execution_id=e.id
      WHERE f.attribute=$1 AND f.entity_id=$2 AND f.status='VERIFIED'
        AND f.value=e.result->'value' AND f.attribute='local_'||(e.result->>'operation')
        AND ($3::uuid IS NULL AND f.superseded_at IS NULL OR f.id=$3)
        AND f.domain='development_probe' AND v.result='VERIFIED' AND v.verifier<>e.actor
        AND v.plan_hash=e.plan_hash AND v.execution_hash=e.execution_hash
      ORDER BY f.source_timestamp DESC,f.id LIMIT 1`,[key,process.env.SAM_DEV_LEGAL_ENTITY_ID,snapshot?.factId??null]);
    if(r.rowCount!==1||typeof r.rows[0].value!=="number")throw new Error("LOCAL_KNOWLEDGE_UNAVAILABLE");
    values.push(r.rows[0].value);
    references.push({index:i,factId:r.rows[0].id,source:r.rows[0].source,verificationId:r.rows[0].evidence_id});
  }
  return {values,references};
}
async function boundedModelTransport(url:string,init:RequestInit,claimId:string){
  if(process.env.SAM_AUTONOMY_TEST_SESSION==="1")throw new Error("AUTONOMY_TEST_TRANSPORT_FORBIDDEN");
  if(url!=="https://api.deepseek.com/chat/completions"||init.method!=="POST")throw new Error("AUTONOMY_PROVIDER_DESTINATION");
  const body=JSON.parse(String(init.body));
  if(body.model!=="deepseek-flash"||body.messages?.length!==1||Buffer.byteLength(body.messages[0].content,"utf8")>16000)throw new Error("AUTONOMY_PROVIDER_BODY");
  const started=new Date();
  const response=await fetch(url,{...init,redirect:"error",signal:AbortSignal.timeout(30000),
    body:JSON.stringify({...body,max_tokens:1024,thinking:{type:"disabled"},response_format:{type:"json_object"}})});
  const reader=response.body?.getReader();if(!reader)throw new Error("AUTONOMY_PROVIDER_EMPTY");
  const chunks:Uint8Array[]=[];let size=0;
  for(;;){const chunk=await reader.read();if(chunk.done)break;size+=chunk.value.length;
    if(size>64000){await reader.cancel();throw new Error("AUTONOMY_PROVIDER_SIZE");}chunks.push(chunk.value);}
  const parsed=JSON.parse(Buffer.concat(chunks).toString("utf8"));
  await withTransaction(async client=>{
    await assertSandbox(client);
    const integer=(v:unknown)=>typeof v==="number"&&Number.isSafeInteger(v)&&v>=0?v:null;
    await client.query(`INSERT INTO autonomy_provider_receipts(claim_id,started_at,finished_at,http_status,model,input_tokens,output_tokens,reasoning_tokens,response_hash,output_hash)
      VALUES($1,$2,now(),$3,$4,$5,$6,$7,$8,$9)`,[claimId,started,response.status,
      /^deepseek-(?:flash|v4(?:[.]1)?-flash)(?:-[a-z0-9]+)*$/.test(parsed.model)?parsed.model:"UNRECOGNIZED",
      integer(parsed.usage?.prompt_tokens),integer(parsed.usage?.completion_tokens),
      integer(parsed.usage?.completion_tokens_details?.reasoning_tokens??0),sha256Hex(parsed),sha256Hex(parsed.choices?.[0]?.message?.content??"")]);
  });
  if(!response.ok)throw new Error(`AUTONOMY_PROVIDER_HTTP_${response.status}`);
  if(!/^deepseek-(?:flash|v4(?:[.]1)?-flash)(?:-[a-z0-9]+)*$/.test(parsed.model)||
    !Number.isInteger(parsed.usage?.prompt_tokens)||parsed.usage.prompt_tokens>16512||
    !Number.isInteger(parsed.usage?.completion_tokens)||parsed.usage.completion_tokens>1024||
    Number(parsed.usage.completion_tokens_details?.reasoning_tokens??0)!==0)throw new Error("AUTONOMY_PROVIDER_USAGE");
  return parsed;
}
export function localCapabilityBundle(adapterOverride?:any){
  const valuesSchema={type:"array",minItems:1,maxItems:16,items:{type:["number","string"],
    minimum:-1000000,maximum:1000000,pattern:"^knowledge:local_(sum|mean|min|max|count)$"}};
  const adapter=adapterOverride??{providerId:"deepseek",async invoke(task:any,model:string){
    const claimId=autonomyClaimId(task);
    return new OpenAICompatibleChatAdapter("deepseek",{apiKey:process.env.DEEPSEEK_API_KEY??"",baseUrl:"https://api.deepseek.com",
      transport:(url,init)=>boundedModelTransport(url,init,claimId)}).invoke(task,model);
  }};
  const configs=[{providerId:"deepseek",models:["deepseek-flash"],capabilities:["planning"],privacyClasses:["PUBLIC"] as any,health:"HEALTHY" as const,
    costPer1kInput:0.0003,costPer1kOutput:0.0012}];
  const bundle=validateProductionBundle({
    capabilities:LOCAL_CAPABILITIES.map(capabilityId=>({capabilityId,authorityClass:"GREEN" as const,
      specialistAgentId:"autonomy-local",specialistVersion:"1.0.0",
      description:capabilityId==="local.calculate"?"Calculate one aggregate on a local numeric list. No external effects.":"Compute count, mean, min and max locally. No external effects.",
      parameters:{type:"object",additionalProperties:false,
        required:capabilityId==="local.calculate"?["operation","values"]:["values"],
        properties:capabilityId==="local.calculate"?{operation:{type:"string",enum:["sum","mean","min","max","count"]},values:valuesSchema}:{values:valuesSchema}}})),
    toolDefinitions:LOCAL_CAPABILITIES.map(capabilityId=>({capabilityId,authorityClass:"GREEN" as const,sideEffect:false})),
    toolAdapters:LOCAL_CAPABILITIES.map(capabilityId=>({capabilityId,async execute(request:any){
      localParameters(capabilityId,request.params);
      return withTransaction(async client=>{
        await assertSandbox(client);
        const queueId=/^tool:([0-9a-f-]{36}):/.exec(request.idempotencyKey)?.[1];
        const work=await client.query("SELECT goal_id FROM work_queue WHERE id=$1 AND capability_id=$2",[queueId,capabilityId]);
        if(work.rowCount!==1)throw new Error("LOCAL_WORK_BINDING");
        const old=await client.query("SELECT * FROM local_artifacts WHERE queue_id=$1",[queueId]);
        if(old.rowCount)return {result:old.rows[0].result,evidence:{artifactId:old.rows[0].id,resultHash:sha256Hex(old.rows[0].result),knowledgeRefs:old.rows[0].knowledge_refs}};
        const {values,references}=await resolveValues(client,request.params);
        const result=capabilityId==="local.calculate"?{operation:request.params.operation,value:calculate(values,request.params.operation)}:
          {operation:"mean",value:calculate(values,"mean"),count:values.length,min:Math.min(...values),max:Math.max(...values)};
        const row=await client.query(`INSERT INTO local_artifacts(goal_id,queue_id,result,knowledge_refs)
          VALUES($1,$2,$3::jsonb,$4::jsonb) ON CONFLICT(queue_id) DO NOTHING RETURNING id`,
          [work.rows[0].goal_id,queueId,JSON.stringify(result),JSON.stringify(references)]);
        if(!row.rowCount)throw new Error("LOCAL_CONCURRENT_ARTIFACT_RETRY");
        return {result,evidence:{artifactId:row.rows[0].id,resultHash:sha256Hex(result),knowledgeRefs:references}};
      });
    }})),
    verificationAdapters:LOCAL_CAPABILITIES.map(capabilityId=>({capabilityId,async verify(input:any){
      localParameters(capabilityId,input.execution.params);
      return withTransaction(async client=>{
        await assertSandbox(client);
        const rows=await client.query(`SELECT a.* FROM local_artifacts a JOIN executions e ON e.queue_id=a.queue_id AND e.goal_id=a.goal_id
          WHERE a.id=$1 AND e.id=$2`,[input.execution.evidence.artifactId,input.execution.id]);
        if(rows.rowCount!==1)return {result:"FAILED" as const,verifier:"autonomy-independent-sql",evidence:{reason:"ARTIFACT_MISSING"}};
        const row=rows.rows[0];
        const {values,references}=await resolveValues(client,input.execution.params,input.execution.evidence.knowledgeRefs);
        // Independent PostgreSQL aggregate, not the executor's calculation routine/result.
        const numeric=await independentLocalAggregates(client,values);
        const op=capabilityId==="local.calculate"?input.execution.params.operation:"mean";
        const expected=capabilityId==="local.calculate"?{operation:op,value:numeric[op]}:
          {operation:op,value:numeric.mean,count:numeric.count,min:numeric.min,max:numeric.max};
        const matches=sha256Hex(row.result)===input.execution.evidence.resultHash&&
          sha256Hex(references)===sha256Hex(row.knowledge_refs)&&sha256Hex(row.result)===sha256Hex(expected);
        return {result:matches?"VERIFIED" as const:"FAILED" as const,verifier:"autonomy-independent-sql",
          evidence:{artifactId:row.id,resultHash:sha256Hex(row.result),sqlReadback:true,reason:matches?"MATCH":"ARTIFACT_MISMATCH"}};
      });
    }})),
    modelAdapters:[adapter],modelProviderConfigs:configs,dataClassification:"PUBLIC",planningMaxCostUsd:0.01,
    plannerGateway:()=>new ModelGateway({deepseek:adapter},new AutonomyPermit()),
    workerLeaseTtlSeconds:10,deferVerification:true,
    replanPolicy:{recoverableEvidenceReasons:["ARTIFACT_MISSING","ARTIFACT_MISMATCH"]},
    verifiedLearning:{capabilityIds:LOCAL_CAPABILITIES,project(e){
      safeTree(e.result);
      if(!["sum","mean","min","max","count"].includes(String(e.result.operation))||typeof e.result.value!=="number")throw new Error("LOCAL_LEARNING_PROJECTION");
      return [{attribute:"local_"+e.result.operation,value:e.result.value}];
    }}
  });
  return bundle;
}
