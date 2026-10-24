import assert from "node:assert/strict";
import {sameReadRequest,proposePlan} from "../../apps/brain/src/planner";

// Isolated fault injection; fake model only, no DB/provider/network access.
const missing={capabilityId:"drive_get_metadata",params:{fileId:"synthetic-missing"}};
assert.equal(sameReadRequest(missing,{capabilityId:"drive_get_metadata",params:{file_id:"synthetic-missing"}}),true);
assert.equal(sameReadRequest(missing,{capabilityId:"drive_get_metadata",params:{fileId:"another"}}),false);
assert.equal(sameReadRequest(missing,{capabilityId:"drive_search",params:{fileId:"synthetic-missing"}}),false);

const capabilities=[
 {capabilityId:"drive_get_metadata",sideEffect:false},
 {capabilityId:"drive_search",sideEffect:false}
];
function model(steps:any[][]){
 let calls=0, feedbacks:string[]=[];
 return {gateway:{async invoke(arg:any){
   feedbacks.push(String(arg.input.validationFeedback??""));
   const selected=steps[Math.min(calls++,steps.length-1)];
   return {result:{output:{assumptions:{},constraints:{},dependencies:{},steps:selected}}};
 }},counts:()=>calls,feedbacks};
}
const read=(capabilityId:string,params:any)=>({capabilityId,params,priority:1});
async function run(){
 // 404: model first repeats a failed tool, then switches to safe search.
 const recover=model([[read("drive_get_metadata",{file_id:"synthetic-missing"})],[read("drive_search",{query:"trashed = false",limit:1})]]);
 const base={goalId:"synthetic-goal",objective:"read-only Drive recovery",context:{},dataClassification:"INTERNAL" as const,maxCostUsd:1,availableCapabilities:capabilities,forbiddenReadSteps:[missing]};
 const recovered=await proposePlan({...base,gateway:recover.gateway as any});
 assert.equal(recover.counts(),2);
 assert.equal(recovered.steps[0].capabilityId,"drive_search");
 assert.equal(recover.feedbacks[1],'PLAN_FAILED_READ_REPLAY');
 // Simulated 429/503/network: a tool call that failed before cannot be replayed
 // with identical parameters by the replanner regardless of provider error.
 for(const errorLabel of ["429","503","ECONNRESET"]){
   const repeated=model([[read("drive_get_metadata",{fileId:"synthetic-missing"})],[read("drive_get_metadata",{file_id:"synthetic-missing"})]]);
   await assert.rejects(()=>proposePlan({...base,context:{fault:errorLabel},gateway:repeated.gateway as any}),/^Error: PLAN_CONTRACT_INVALID$/);
   assert.equal(repeated.counts(),2);
 }
 console.log("ISOLATED_REPLAN_FAULT_INJECTION PASS cases=4 alias=1 no_external_io=true");
}
run().catch(e=>{console.error(e);process.exitCode=1;});
