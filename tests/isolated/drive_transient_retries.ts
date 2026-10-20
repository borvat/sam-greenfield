import assert from "node:assert/strict";
import {GoogleDriveApiClient} from "../../packages/google-drive/src/client";

const tokens={getAccessToken:async()=>"synthetic-test-token"};
function result(status:number){
 return new Response(JSON.stringify(status===200?{id:"fake-file"}:{error:{message:"simulated"}}),{
   status,headers:{"content-type":"application/json"}
 });
}
async function scenario(sequence:(number|"network")[],operation:"GET"|"POST"="GET"){
 let calls=0;
 const client=new GoogleDriveApiClient({tokens,baseUrl:"https://fake.invalid/drive/v3",fetchImpl:(async(_url,init)=>{
   const step=sequence[Math.min(calls++,sequence.length-1)];
   if(step==="network")throw new TypeError("simulated connection refused");
   return result(step);
 }) as typeof fetch});
 if(operation==="POST")return {calls:()=>calls,exec:()=>client.createFolder({name:"Synthetic",operationKey:"isolated-test"})};
 return {calls:()=>calls,exec:()=>client.getFile("fake-file")};
}
async function main(){
 for(const failure of [429,502,503,504] as const){
   const x=await scenario([failure,200]);assert.equal((await x.exec()).id,"fake-file");assert.equal(x.calls(),2);
 }
 const network=await scenario(["network",200]);assert.equal((await network.exec()).id,"fake-file");assert.equal(network.calls(),2);
 const exhausted=await scenario([503,503,503,200]);await assert.rejects(exhausted.exec(),/HTTP 503/);assert.equal(exhausted.calls(),3);
 const forbidden=await scenario([403,200]);await assert.rejects(forbidden.exec(),/HTTP 403/);assert.equal(forbidden.calls(),1);
 const missing=await scenario([404,200]);await assert.rejects(missing.exec(),/HTTP 404/);assert.equal(missing.calls(),1);
 const write=await scenario([503,200],"POST");await assert.rejects(write.exec(),/HTTP 503/);assert.equal(write.calls(),1);
 console.log("ISOLATED_DRIVE_TRANSIENT_RETRY PASS checks=9 writes_replayed=0");
}
main().catch(error=>{console.error(error);process.exitCode=1;});
