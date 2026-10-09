import assert from "node:assert/strict";
import { scopedDriveRequest, driveReadBundle, validateDriveMetadata } from "../../apps/development/src/driveRead";
import { GoogleDriveApiClient } from "../../packages/google-drive/src/client";
const fileId="fixture-personal-document-001";
let calls=0;
async function main(){
const source=scopedDriveRequest({fileId,fetchMetadata:async path=>{
  calls++; assert.equal(path,`/drive/v3/files/${fileId}?fields=id,mimeType,modifiedTime,trashed`);
  return new Response(JSON.stringify({id:fileId,mimeType:"application/vnd.google-apps.document",trashed:false}),{status:200});
}});
for(const path of ["/files","/files/another-file?fields=id",`/files/${fileId}?alt=media`,`/files/${fileId}/export?mimeType=text/plain`]){
  await assert.rejects(source(path),/DRIVE_PATH_OR_FIELDS_DENIED/);
}
assert.equal(calls,0);
const client=new GoogleDriveApiClient({readOnlyRequest:source});
await assert.rejects(client.createFolder({name:"forbidden",operationKey:"fixture"}),/READ_ONLY_DRIVE_METHOD_DENIED/);
assert.equal(calls,0);
const bundle=driveReadBundle({fileId,executeRequest:source,verifyRequest:async()=>({id:fileId,mimeType:"application/vnd.google-apps.document"})});
await assert.rejects(bundle.tools.adapter("drive_get_metadata").execute({capabilityId:"drive_get_metadata",params:{file_id:fileId,owners:true},idempotencyKey:"fixture"}));
await assert.rejects(bundle.tools.adapter("drive_get_metadata").execute({capabilityId:"drive_get_metadata",params:{file_id:"other-resource"},idempotencyKey:"fixture"}));
for(const capability of ["drive_create_folder","drive_search","gmail_send","finance_pay"]) assert.throws(()=>bundle.tools.adapter(capability));
for(const value of [
  {id:fileId,mimeType:"application/vnd.google-apps.document",name:"not-permitted"},
  {id:fileId,mimeType:"application/vnd.google-apps.document",modifiedTime:"Bearer fixture-secret"},
  {id:"other-resource",mimeType:"application/vnd.google-apps.document"}
]) assert.throws(()=>validateDriveMetadata(value,fileId));
await bundle.tools.adapter("drive_get_metadata").execute({capabilityId:"drive_get_metadata",params:{file_id:fileId},idempotencyKey:"fixture"});
assert.equal(calls,1);
await assert.rejects(client.getFile(fileId),/DRIVE_READ_ALREADY_CONSUMED/);
assert.equal(calls,1);
const forbiddenResponse=scopedDriveRequest({fileId,fetchMetadata:async()=>new Response(JSON.stringify({
  id:fileId,mimeType:"application/vnd.google-apps.document",modifiedTime:"Bearer fixture-secret"
}),{status:200})});
await assert.rejects(new GoogleDriveApiClient({readOnlyRequest:forbiddenResponse}).getFile(fileId),/DRIVE_RESPONSE_SAFETY_REJECTED/);
const unauthorized=scopedDriveRequest({fileId,fetchMetadata:async()=>new Response(JSON.stringify({
  error:{status:"PERMISSION_DENIED",message:"private fixture message never echoed"}
}),{status:403})});
await assert.rejects(new GoogleDriveApiClient({readOnlyRequest:unauthorized}).getFile(fileId),/DRIVE_METADATA_HTTP_REJECTED/);
console.log("DRIVE_READ_BOUNDARIES PASS: exact resource/field/GET allowlists; no list/content/export/write; one request per phase; original adapter retained. Provider response is a UNIT FIXTURE, not live.");
}
main().catch(error=>{console.error(error);process.exitCode=1;});
