import assert from "node:assert/strict";
import { readFileSync,writeFileSync } from "node:fs";
import { pool } from "../../packages/db/src/client";
import { createProductionComposition } from "../../apps/production/src/composition";
import { relayOutboxUntilEmpty } from "../../apps/kernel/src/outboxRelay";
import { scopedDriveRequest,driveReadBundle,DriveReadError } from "../../apps/development/src/driveRead";
import { managedDriveMetadataFetcher } from "../../apps/development/src/managedDriveRead";
import { sha256Hex } from "../../packages/shared/src/stableJson";
import { scopedDriveContentRequest,driveContentBundle } from "../../apps/development/src/driveContent";
const unit=process.env.SAM_DRIVE_READ_UNIT_TEST==="1";
const content=process.env.SAM_DRIVE_CONTENT_MODE==="1";
const file=`.local/sam-dev/${content?"drive-content":"drive-read"}-worker-${unit?"local":"live"}.json`;
const report:any={startedAt:new Date().toISOString(),status:"BLOCKED",providerMode:unit?"LOCAL_UNIT_FIXTURE":"LIVE_GOOGLE_MANAGED_PROXY",proxyHttpAttempts:0,calls:[]};
async function main(){
  assert.equal(process.env.SAM_DEVELOPMENT_SAFE_MODE,"1");
  for (const key of ["DEEPSEEK_API_KEY","OPENAI_API_KEY","GOOGLE_OAUTH_REFRESH_TOKEN","SESSION_SECRET"]) assert.equal(process.env[key],undefined);
  const role=(await pool.query("SELECT rolsuper,rolbypassrls FROM pg_roles WHERE rolname=current_user")).rows[0];
  assert.equal(role.rolsuper,false);assert.equal(role.rolbypassrls,false);
  const scope=(await pool.query("SELECT goal_id,resource_hash,approval_hash FROM development_cycle_scope")).rows[0];
  const approval=unit?{fileId:"fixture-personal-document-001",expectedTitle:"SAM TEST READ ONLY - October 2026",expectedLine:"SAM integration test - October 2026"}:JSON.parse(readFileSync(process.env.SAM_DRIVE_READ_APPROVAL_FILE!,"utf8"));
  assert.equal(sha256Hex(approval.fileId),scope.resource_hash);
  const contentScope={fileId:approval.fileId,expectedTitle:approval.expectedTitle,expectedLine:approval.expectedLine};
  if(content)assert.equal(sha256Hex(contentScope),scope.approval_hash);
  const fetchMetadata=unit?async(path:string)=>content
    ? path.includes("/export?")?new Response(`${approval.expectedLine}\nLocal unit fixture; not live Google content.`,{status:200,headers:{"content-type":"text/plain; charset=utf-8"}})
      : new Response(JSON.stringify({id:approval.fileId,name:approval.expectedTitle,mimeType:"application/vnd.google-apps.document",trashed:false}),{status:200})
    : new Response(JSON.stringify({id:approval.fileId,mimeType:"application/vnd.google-apps.document",modifiedTime:"2026-01-01T00:00:00.000Z",trashed:false}),{status:200}):managedDriveMetadataFetcher(()=>{
    report.proxyHttpAttempts++;writeFileSync(file,JSON.stringify(report,null,2));
  },content);
  const request=(phase:string)=>scopedDriveRequest({fileId:approval.fileId,fetchMetadata,onCall:call=>{
    report.calls.push({phase,...call});writeFileSync(file,JSON.stringify(report,null,2));
  }});
  const contentRequest=(phase:string)=>scopedDriveContentRequest(contentScope,fetchMetadata,call=>{
    report.calls.push({phase,...call});writeFileSync(file,JSON.stringify(report,null,2));
  });
  const bundle=content?driveContentBundle(contentScope,contentRequest("EXECUTION"),contentRequest("INDEPENDENT_VERIFICATION")):
    driveReadBundle({fileId:approval.fileId,executeRequest:request("EXECUTION"),verifyRequest:request("INDEPENDENT_VERIFICATION")});
  for (const cap of ["drive_search","drive_create_folder","gmail_send","finance_pay"]) assert.throws(()=>bundle.tools.adapter(cap));
  const worker=createProductionComposition({bundle,workerId:content?"personal-drive-content-worker":"personal-drive-read-worker"});
  const outcome:any=await worker.runWorkTick();
  if(outcome.execution.processed)await pool.query(`INSERT INTO audit_log(actor,goal_id,action,source,result,evidence_id)
    VALUES('documents@1.0.0',$1,$2,'original_runtime_tick','EXECUTED',$3)`,[scope.goal_id,content?"APPROVED_TEXT_READ_EXECUTED":"APPROVED_METADATA_READ_EXECUTED",outcome.execution.executionId]);
  if(outcome.verification.processed)await pool.query(`INSERT INTO audit_log(actor,goal_id,action,source,result,evidence_id)
    SELECT verifier,$1,'INDEPENDENT_VERIFICATION_RECORDED','original_runtime_tick',result,id FROM verifications WHERE id=$2`,[scope.goal_id,outcome.verification.verificationId]);
  const goalState=(await pool.query("SELECT state FROM goals WHERE id=$1",[scope.goal_id])).rows[0].state;
  if(content&&goalState!=="COMPLETED"){
    const hashes=report.calls.filter((c:any)=>c.kind==="CONTENT"&&c.contentHash).map((c:any)=>c.contentHash);
    if(hashes.length===2&&hashes[0]!==hashes[1])throw new DriveReadError("DRIVE_INDEPENDENT_CONTENT_MISMATCH");
  }
  assert.equal(goalState,"COMPLETED");
  assert.deepEqual(report.calls.map((x:any)=>x.phase),content?["EXECUTION","EXECUTION","INDEPENDENT_VERIFICATION","INDEPENDENT_VERIFICATION"]:["EXECUTION","INDEPENDENT_VERIFICATION"]);
  assert.equal(report.calls.every((x:any)=>x.httpStatus===200),true);
  const repeat:any=await worker.runWorkTick();assert.equal(repeat.execution.processed,false);assert.equal(repeat.verification.processed,false);
  assert.equal(report.calls.length,content?4:2);
  report.relayedEvents=await relayOutboxUntilEmpty(50);
  assert.equal((await pool.query("SELECT count(*)::int AS n FROM outbox_events WHERE status='PENDING'")).rows[0].n,0);
  report.idempotentWorkerReentry=true;report.status="PASS";
}
main().catch(error=>{
  report.status="FAIL";report.failureCode=error instanceof DriveReadError?error.code:
    report.calls.find((call:any)=>call.failureCode)?.failureCode??"NATIVE_READ_WORKER_REJECTED";
  if(error instanceof DriveReadError)report.httpStatus=error.httpStatus;
}).finally(async()=>{
  report.completedAt=new Date().toISOString();writeFileSync(file,JSON.stringify(report,null,2));
  await pool.end();if(report.status!=="PASS")process.exitCode=1;
});
