import assert from "node:assert/strict";
import {mkdtempSync,readFileSync,rmSync,writeFileSync} from "node:fs";
import {tmpdir} from "node:os";
import {join} from "node:path";
import {randomUUID} from "node:crypto";
import {assertOneShotInput,assertPriceReview,createOneShotTransport,oneShotObjective,
  oneShotPrice,oneShotReservation} from "./oneShotTransport";
const endpoint="https://api.deepseek.com/chat/completions";
const prompt={instruction:"Return only the best answer for this task. If the input requests a structured contract, return valid JSON only.",
  task:"executive_planning",capability:"planning",input:{
    objective:oneShotObjective,context:{synthetic:true,facts:[],memory:[]},
    capabilities:[{capabilityId:"local.calculate",operations:["sum","mean","min","max","count"]},
      {capabilityId:"local.statistics",operation:"mean",parameters:["values"]}],
    contract:{output:"CandidatePlan",steps:[{capabilityId:"an allowed capability",
      params:{operation:"requested operation",values:"requested integer array"},priority:1}],
      assumptions:{},constraints:{},dependencies:{},
      rule:"One proposal-only step matching the numeric objective."}}};
const body=()=>({model:"deepseek-flash",messages:[{role:"user",content:JSON.stringify(prompt)}],
  max_tokens:512,thinking:{type:"disabled"}});
async function main(){
  const dir=mkdtempSync(join(tmpdir(),"sam-one-shot-"));let denied=0,calls=0;
  try{
    assert(oneShotReservation<0.01);
    const init=(b:any):RequestInit=>({method:"POST",body:JSON.stringify(b)});
    assertOneShotInput(endpoint,init(body()));
    for(const mutate of [
      (b:any)=>b.max_tokens=513,(b:any)=>b.thinking={type:"enabled"},
      (b:any)=>b.model="other",(b:any)=>b.messages.push(b.messages[0]),
      (b:any)=>{const p=JSON.parse(b.messages[0].content);p.input.context.memory=["company secret"];b.messages[0].content=JSON.stringify(p);},
      (b:any)=>{const p=JSON.parse(b.messages[0].content);p.input.objective.values=[999];b.messages[0].content=JSON.stringify(p);},
      (b:any)=>b.messages[0].content+="business data",(b:any)=>b.stream=true]){
      const b=body();mutate(b);
      assert.throws(()=>assertOneShotInput(endpoint,init(b)),/ONE_SHOT_INPUT_DENIED/);denied++;
    }
    assert.throws(()=>assertOneShotInput("https://evil.invalid",init(body())),/ONE_SHOT_INPUT_DENIED/);denied++;
    const path=join(dir,"claim.json"),run=randomUUID();
    const transport=createOneShotTransport(path,run,async(_url,options)=>{
      calls++;assert.equal(options.redirect,"error");
      return {model:"deepseek-flash",usage:{prompt_tokens:100,completion_tokens:70,reasoning_tokens:0}};
    });
    await transport(endpoint,init(body()));
    await assert.rejects(()=>transport(endpoint,init(body())),/ONE_SHOT_ALREADY_CONSUMED/);
    await assert.rejects(()=>createOneShotTransport(path,run)(endpoint,init(body())),/ONE_SHOT_ALREADY_CONSUMED/);
    const crash=join(dir,"crash.json"),sentinel="NEVER_LOG_SYNTHETIC_PASSWORD";
    const interrupted=createOneShotTransport(crash,run,async()=>{throw new Error(sentinel);});
    await assert.rejects(()=>interrupted(endpoint,init(body())),/LIVE_TRANSPORT_FAILED/);
    await assert.rejects(()=>interrupted(endpoint,init(body())),/ONE_SHOT_ALREADY_CONSUMED/);
    assert(!readFileSync(crash,"utf8").includes(sentinel));
    const review=join(dir,"prices.json");
    const valid={source:"https://api-docs.deepseek.com/quick_start/pricing",model:"deepseek-flash",
      inputUsdPer1K:oneShotPrice.input,outputUsdPer1K:oneShotPrice.output,reviewedAt:new Date().toISOString()};
    writeFileSync(review,JSON.stringify(valid));assertPriceReview(review);
    writeFileSync(review,JSON.stringify({...valid,reviewedAt:"2020-01-01"}));
    assert.throws(()=>assertPriceReview(review),/LIVE_PRICE_REVIEW_REQUIRED/);
    writeFileSync(review,JSON.stringify({...valid,inputUsdPer1K:0}));
    assert.throws(()=>assertPriceReview(review),/LIVE_PRICE_REVIEW_REQUIRED/);
    assert.equal(calls,1);
    console.log(JSON.stringify({test:"ONE_SHOT_TRANSPORT",status:"PASS",inputRefusals:denied,
      exclusiveClaim:true,restartAndUnknownOutcomeConsumed:true,redirectsDenied:true,
      staleOrZeroPricesDenied:true,safeDiagnostics:true,realProviderCalls:0}));
  }finally{rmSync(dir,{recursive:true,force:true});}
}
main().catch(()=>{console.error("ONE_SHOT_TRANSPORT_TEST_FAILED");process.exitCode=1;});
