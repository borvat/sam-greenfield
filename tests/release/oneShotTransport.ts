// Acceptance-only boundary. This does not change SAM's production adapter.
import assert from "node:assert/strict";
import {createHash,randomUUID} from "node:crypto";
import {existsSync,readFileSync,renameSync,writeFileSync} from "node:fs";
import {fetchJson} from "../../packages/model-providers/src/common";

export const oneShotObjective={synthetic:true,operation:"sum",values:[13,-8,21,5]};
export const oneShotPrice={input:0.0003,output:0.0012}; // USD / 1K; conservative peak/cache-miss.
export const oneShotReservation=(5120*oneShotPrice.input+512*oneShotPrice.output)/1000;
export const liveClaimFile=".local/sam-dev/synthetic-pilot-live-attempt.json";
export const priceReviewFile=".local/sam-dev/synthetic-pilot-price-review.json";
const endpoint="https://api.deepseek.com/chat/completions";
const safeCodes=["PROVIDER_AUTH_REJECTED","PROVIDER_ACCESS_REJECTED","PROVIDER_RATE_LIMITED",
  "PROVIDER_UNAVAILABLE","PROVIDER_HTTP_REJECTED"];

export function assertPriceReview(path=priceReviewFile,now=Date.now()){
  let review:any;
  try{review=JSON.parse(readFileSync(path,"utf8"));}catch{throw new Error("LIVE_PRICE_REVIEW_REQUIRED");}
  const age=now-Date.parse(review.reviewedAt);
  if(review.source!=="https://api-docs.deepseek.com/quick_start/pricing"||
    review.model!=="deepseek-flash"||review.inputUsdPer1K!==oneShotPrice.input||
    review.outputUsdPer1K!==oneShotPrice.output||!Number.isFinite(age)||age<0||age>900000||
    oneShotReservation>0.01)throw new Error("LIVE_PRICE_REVIEW_REQUIRED");
}

export function assertOneShotInput(url:string,init:RequestInit){
  try{
    assert.equal(url,endpoint);assert.equal(init.method,"POST");
    const body=JSON.parse(String(init.body));
    assert.deepEqual(Object.keys(body).sort(),["max_tokens","messages","model","thinking"]);
    assert.equal(body.model,"deepseek-flash");assert.equal(body.max_tokens,512);
    assert.deepEqual(body.thinking,{type:"disabled"});
    assert.equal(body.messages.length,1);
    assert.deepEqual(Object.keys(body.messages[0]).sort(),["content","role"]);
    assert.equal(body.messages[0].role,"user");
    assert(Buffer.byteLength(body.messages[0].content,"utf8")<=4096);
    const prompt=JSON.parse(body.messages[0].content);
    assert.deepEqual(prompt,{
      instruction:"Return only the best answer for this task. If the input requests a structured contract, return valid JSON only.",
      task:"executive_planning",capability:"planning",input:{
        objective:oneShotObjective,context:{synthetic:true,facts:[],memory:[]},
        capabilities:[{capabilityId:"local.calculate",operations:["sum","mean","min","max","count"]},
          {capabilityId:"local.statistics",operation:"mean",parameters:["values"]}],
        contract:{output:"CandidatePlan",steps:[{capabilityId:"an allowed capability",
          params:{operation:"requested operation",values:"requested integer array"},priority:1}],
          assumptions:{},constraints:{},dependencies:{},
          rule:"One proposal-only step matching the numeric objective."}
      }});
    return createHash("sha256").update(body.messages[0].content).digest("hex");
  }catch{throw new Error("ONE_SHOT_INPUT_DENIED");}
}

// A durable, exclusive claim is consumed before fetch. Never removed by DB cleanup.
// Unknown transport outcomes remain consumed; a subsequent run cannot spend again.
export function createOneShotTransport(path:string,runId:string,send:typeof fetchJson=fetchJson){
  if(!/^[0-9a-f-]{36}$/i.test(runId))throw new Error("ONE_SHOT_RUN_INVALID");
  return async(url:string,init:RequestInit,timeout?:number)=>{
    const inputHash=assertOneShotInput(url,init);
    if(existsSync(path))throw new Error("ONE_SHOT_ALREADY_CONSUMED");
    const evidence:any={runId,provider:"deepseek",requestedModel:"deepseek-flash",
      startedAt:new Date().toISOString(),requestsAttempted:1,inputHash,
      syntheticInputPreflight:"PASS_EXACT_PUBLIC_TEMPLATE",maxOutputTokens:512,
      thinking:"disabled",estimatedFeeCeilingUsd:oneShotReservation,
      ownerEstimatedFeeLimitUsd:0.01,providerDollarHardCap:false,usageKnown:false};
    try{writeFileSync(path,JSON.stringify(evidence,null,2),{flag:"wx",mode:0o600});}
    catch{throw new Error("ONE_SHOT_ALREADY_CONSUMED");}
    try{
      const response=await send(url,{...init,redirect:"error"},timeout);
      evidence.httpStatus=200;evidence.responseReceived=true;
      const model=response?.model;
      if(typeof model==="string"&&/^deepseek[-a-zA-Z0-9.]{1,60}$/.test(model))evidence.reportedModel=model;
      const usage=response?.usage;
      const input=usage?.prompt_tokens,output=usage?.completion_tokens;
      if(Number.isInteger(input)&&input>=0&&input<=5120&&
        Number.isInteger(output)&&output>=0&&output<=512){
        evidence.usageKnown=true;evidence.inputTokens=input;evidence.outputTokens=output;
        evidence.estimatedPeakCacheMissCostUsd=(input*oneShotPrice.input+output*oneShotPrice.output)/1000;
      }
      const reasoning=usage?.completion_tokens_details?.reasoning_tokens??usage?.reasoning_tokens;
      if(Number.isInteger(reasoning)&&reasoning>=0&&reasoning<=512)evidence.reasoningTokens=reasoning;
      evidence.responseHash=createHash("sha256").update(JSON.stringify(response)).digest("hex");
      return response; // Original SAM usage/plan/scope guards still decide acceptance.
    }catch(error:any){
      if(Number.isInteger(error?.status)&&error.status>=400&&error.status<=599){
        evidence.httpStatus=error.status;evidence.responseReceived=true;
      }
      evidence.errorCode=safeCodes.includes(error?.code)?error.code:"LIVE_TRANSPORT_FAILED";
      const safeError=new Error(evidence.errorCode) as Error&{code:string};
      safeError.code=evidence.errorCode;
      throw safeError;
    }finally{
      evidence.finishedAt=new Date().toISOString();
      // A crash during metadata update must not truncate the consumed claim.
      const update=`${path}.tmp-${randomUUID()}`;
      writeFileSync(update,JSON.stringify(evidence,null,2),{flag:"wx",mode:0o600});
      renameSync(update,path);
    }
  };
}
