import assert from "node:assert/strict";
import { scopedDriveContentRequest,driveContentBundle,summarizeTestText,DRIVE_CONTENT_CAPABILITY,DRIVE_CONTENT_TITLE } from "../../apps/development/src/driveContent";
import { GoogleDriveApiClient } from "../../packages/google-drive/src/client";
const scope={fileId:"fixture-personal-document-001",expectedTitle:DRIVE_CONTENT_TITLE,expectedLine:"SAM integration test - October 2026"};
const path=`/files/${scope.fileId}/export?mimeType=text%2Fplain`;
const text=`${scope.expectedLine}\nSynthetic local test text; not LIVE.`;
const metadata={id:scope.fileId,name:scope.expectedTitle,mimeType:"application/vnd.google-apps.document",trashed:false};
const response=(body:string,type="text/plain")=>new Response(body,{headers:{"content-type":type}});
const fail=(code:string)=>(e:any)=>e.code===code&&!e.message.includes(scope.fileId);
async function main(){
  process.env.NODE_ENV="development";process.env.SAM_DEVELOPMENT_SAFE_MODE="1";
  let calls=0;
  const fetchRead=async(p:string)=>{calls++;return p.includes("/export?")?response(text):response(JSON.stringify(metadata),"application/json");};
  const request=scopedDriveContentRequest(scope,fetchRead);
  for(const p of ["/files","/files/other-approved-000/export?mimeType=text%2Fplain",`${path}&alt=media`,`${path.replace("text%2Fplain","application%2Fpdf")}`]){
    await assert.rejects(request(p),fail("DRIVE_CONTENT_PATH_DENIED"));
  }
  assert.equal(calls,0);
  assert.equal(await request(path),text);assert.equal(calls,2);
  await assert.rejects(request(path),fail("DRIVE_CONTENT_ALREADY_CONSUMED"));assert.equal(calls,2);
  assert.throws(()=>summarizeTestText("different text",scope.expectedLine),fail("DRIVE_KNOWN_LINE_MISMATCH"));
  assert.throws(()=>summarizeTestText(JSON.stringify({id:scope.fileId,mimeType:"x"}),scope.expectedLine),fail("DRIVE_METADATA_IS_NOT_CONTENT"));
  assert.throws(()=>summarizeTestText(`${scope.expectedLine}\nBearer fixture-secret`,scope.expectedLine),fail("DRIVE_CONTENT_SAFETY_REJECTED"));
  assert.throws(()=>summarizeTestText(`${scope.expectedLine}\n${"x".repeat(16000)}`,scope.expectedLine),fail("DRIVE_INVALID_TEXT"));
  let guardCalls=0;
  const wrongTitle=scopedDriveContentRequest(scope,async()=>{guardCalls++;return response(JSON.stringify({...metadata,name:"not approved"}));});
  await assert.rejects(wrongTitle(path),fail("DRIVE_DOCUMENT_IDENTITY_GUARD_REJECTED"));assert.equal(guardCalls,1);
  await assert.rejects(wrongTitle(path),fail("DRIVE_CONTENT_ALREADY_CONSUMED"));
  const wrongMedia=scopedDriveContentRequest(scope,async p=>p.includes("/export?")?response(text,"application/json"):response(JSON.stringify(metadata)));
  await assert.rejects(wrongMedia(path),fail("DRIVE_CONTENT_MEDIA_TYPE_DENIED"));
  const oversized=scopedDriveContentRequest(scope,async p=>p.includes("/export?")?response("x".repeat(16001)):response(JSON.stringify(metadata)));
  await assert.rejects(oversized(path),fail("DRIVE_CONTENT_SIZE_DENIED"));
  const invalidUtf8=scopedDriveContentRequest(scope,async p=>p.includes("/export?")
    ?new Response(new Uint8Array([0xff,0xfe]),{headers:{"content-type":"text/plain"}}):response(JSON.stringify(metadata)));
  await assert.rejects(invalidUtf8(path),fail("DRIVE_CONTENT_ACCESS_UNAVAILABLE"));
  const extraMetadata=scopedDriveContentRequest(scope,async()=>response(JSON.stringify({...metadata,owners:["not allowed"]})));
  await assert.rejects(extraMetadata(path),fail("DRIVE_DOCUMENT_IDENTITY_GUARD_REJECTED"));
  process.env.UNIT_CONTENT_API_KEY="fixture-private-long-value-".repeat(60);
  assert.throws(()=>summarizeTestText(`${scope.expectedLine}\n${process.env.UNIT_CONTENT_API_KEY}`,scope.expectedLine),fail("DRIVE_CONTENT_SAFETY_REJECTED"));
  delete process.env.UNIT_CONTENT_API_KEY;
  const rejected=scopedDriveContentRequest(scope,async()=>new Response("Bearer DO_NOT_LEAK_PROVIDER_ERROR",{status:403}));
  await assert.rejects(rejected(path),fail("DRIVE_CONTENT_HTTP_REJECTED"));
  await assert.rejects(rejected(path),fail("DRIVE_CONTENT_ALREADY_CONSUMED"));
  const bundle=driveContentBundle(scope,async()=>text,async()=>`${text}\nChanged independently`);
  for(const cap of ["drive_search","drive_create_folder","drive_get_metadata","gmail_send","finance_pay"])assert.throws(()=>bundle.tools.adapter(cap));
  const adapter=bundle.tools.adapter(DRIVE_CONTENT_CAPABILITY);
  for(const params of [{file_id:"other-file-001"},{file_id:scope.fileId,query:"extra"}]){
    await assert.rejects(adapter.execute({capabilityId:DRIVE_CONTENT_CAPABILITY,params,idempotencyKey:"local"}),fail("DRIVE_CONTENT_PARAMS_DENIED"));
  }
  const execution=await adapter.execute({capabilityId:DRIVE_CONTENT_CAPABILITY,params:{file_id:scope.fileId},idempotencyKey:"local"});
  assert.equal(JSON.stringify(execution).includes(text),false);
  const independent=bundle.verifiers.get(DRIVE_CONTENT_CAPABILITY)!;
  const result=await independent.verify({execution:{id:"unit",capabilityId:DRIVE_CONTENT_CAPABILITY,params:{file_id:scope.fileId},
    evidence:execution.evidence,operationKeyRef:null},contract:{id:"unit",method:"api_readback",requiredEvidenceFields:{},independentQueryTemplate:{}}});
  assert.equal(result.result,"FAILED");assert.equal(result.evidence.independentContentMatch,false);
  const client=new GoogleDriveApiClient({readOnlyRequest:async()=>{throw new Error("DENIED");},readOnlyTextRequest:async p=>{assert.equal(p,path);return text;}});
  assert.equal(await client.exportPlainText(scope.fileId),text);
  await assert.rejects(client.createFolder({name:"not allowed",operationKey:"unit"}),/READ_ONLY_DRIVE_METHOD_DENIED/);
  console.log("DRIVE_CONTENT_BOUNDARIES PASS: one resource, GET/export only, identity guard, known line, streaming size/UTF8/media/safety checks, independent drift rejection, no raw text in outputs; LOCAL_UNIT_FIXTURE.");
}
main().catch(()=>{console.error("DRIVE_CONTENT_BOUNDARIES FAIL: details suppressed");process.exitCode=1;});
