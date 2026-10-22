import { GoogleDriveApiClient } from "../../../packages/google-drive/src/client";
import { validateProductionBundle } from "../../production/src/bundle";
import { assertSafeScalar,localDevelopment } from "./planningPolicy";
import { DriveReadError } from "./driveRead";
import { sha256Hex } from "../../../packages/shared/src/stableJson";

export const DRIVE_CONTENT_CAPABILITY="drive_read_test_text";
export const DRIVE_CONTENT_OBJECTIVE="Read only the approved dedicated personal test document's plain text; confirm the owner's known test line and independently compare fresh content. No model disclosure, other resources, or mutations.";
export const DRIVE_CONTENT_TITLE="SAM TEST READ ONLY - October 2026";
export type ContentScope={fileId:string;expectedTitle:string;expectedLine:string};
export type ContentSummary={contentHash:string;byteCount:number;lineCount:number;knownLineMatched:boolean};

async function boundedText(response:Response,limit:number){
  if(!response.body)throw new DriveReadError("DRIVE_EMPTY_RESPONSE");
  const reader=response.body.getReader();const chunks:Uint8Array[]=[];let bytes=0;
  try{
    while(true){const part=await reader.read();if(part.done)break;bytes+=part.value.length;
      if(bytes>limit){await reader.cancel();throw new DriveReadError("DRIVE_CONTENT_SIZE_DENIED");}
      chunks.push(part.value);}
    return new TextDecoder("utf-8",{fatal:true}).decode(Buffer.concat(chunks));
  }finally{reader.releaseLock();}
}
export function summarizeTestText(text:string,expectedLine:string):ContentSummary{
  if(!text.trim()||text.includes("\0")||Buffer.byteLength(text)>16_000)throw new DriveReadError("DRIVE_INVALID_TEXT");
  // Whole-value safety check before slicing, to avoid boundary-spanning token bypass.
  if(/Bearer\s|postgres(?:ql)?:\/\/|-----BEGIN |(?:sk-|ghp_)[A-Za-z0-9_-]{8,}|eyJ[A-Za-z0-9_-]+\./i.test(text)){
    throw new DriveReadError("DRIVE_CONTENT_SAFETY_REJECTED");
  }
  const liveSecrets=Object.entries(process.env).filter(([key,value])=>/SECRET|TOKEN|PASSWORD|API.?KEY|CREDENTIAL|AUTHORIZATION/i.test(key)&&value).map(([,value])=>value!);
  try{const password=new URL(process.env.DATABASE_URL||"").password;if(password)liveSecrets.push(decodeURIComponent(password));}catch{}
  if(liveSecrets.some(value=>text.includes(value)))throw new DriveReadError("DRIVE_CONTENT_SAFETY_REJECTED");
  try{for(let i=0;i<text.length;i+=1000)assertSafeScalar(text.slice(Math.max(0,i-1000),i+1000));}
  catch{throw new DriveReadError("DRIVE_CONTENT_SAFETY_REJECTED");}
  try{const value=JSON.parse(text);if(value&&typeof value==="object"&&("id" in value||"mimeType" in value)){
    throw new DriveReadError("DRIVE_METADATA_IS_NOT_CONTENT");
  }}catch(error){if(error instanceof DriveReadError)throw error;}
  const lines=text.replace(/\r\n/g,"\n").split("\n");
  if(!lines.some(line=>line.trim()===expectedLine))throw new DriveReadError("DRIVE_KNOWN_LINE_MISMATCH");
  return{contentHash:sha256Hex(text),byteCount:Buffer.byteLength(text),lineCount:lines.length,knownLineMatched:true};
}
export function scopedDriveContentRequest(scope:ContentScope,fetchRead:(path:string)=>Promise<Response>,onCall:(value:any)=>void=()=>{}){
  if(!localDevelopment()||process.env.NODE_ENV!=="development")throw new DriveReadError("DRIVE_CONTENT_DEVELOPMENT_ONLY");
  if(!/^[A-Za-z0-9_-]{10,200}$/.test(scope.fileId)||scope.expectedTitle!==DRIVE_CONTENT_TITLE||
      !scope.expectedLine.trim()||scope.expectedLine!==scope.expectedLine.trim()||scope.expectedLine.length>400){
    throw new DriveReadError("DRIVE_CONTENT_SCOPE_INVALID");
  }
  assertSafeScalar(scope.expectedLine);let spent=false;
  return async(path:string)=>{
    if(path!==`/files/${scope.fileId}/export?mimeType=text%2Fplain`)throw new DriveReadError("DRIVE_CONTENT_PATH_DENIED");
    if(spent)throw new DriveReadError("DRIVE_CONTENT_ALREADY_CONSUMED");spent=true;
    const read=async(path:string,kind:string,limit:number)=>{
      const call:any={at:new Date().toISOString(),kind,httpStatus:0};
      try{
        const response=await fetchRead(path);call.httpStatus=response.status;
        if(!response.ok)throw new DriveReadError("DRIVE_CONTENT_HTTP_REJECTED",response.status);
        if(kind==="CONTENT"&&!/^text\/plain(?:;|$)/i.test(response.headers.get("content-type")||"")){
          throw new DriveReadError("DRIVE_CONTENT_MEDIA_TYPE_DENIED");
        }
        const text=await boundedText(response,limit);
        if(kind==="CONTENT")Object.assign(call,summarizeTestText(text,scope.expectedLine));
        else{
          let metadata:any;try{metadata=JSON.parse(text);}catch{throw new DriveReadError("DRIVE_GUARD_INVALID_JSON");}
          if(!metadata||typeof metadata!=="object"||Array.isArray(metadata)||
              Object.keys(metadata).some(k=>!["id","name","mimeType","trashed"].includes(k))||
              metadata.id!==scope.fileId||metadata.name!==scope.expectedTitle||
              metadata.mimeType!=="application/vnd.google-apps.document"||metadata.trashed!==false){
            throw new DriveReadError("DRIVE_DOCUMENT_IDENTITY_GUARD_REJECTED");
          }
        }
        return text;
      }catch(error){
        call.failureCode=error instanceof DriveReadError?error.code:"DRIVE_CONTENT_ACCESS_UNAVAILABLE";
        throw new DriveReadError(call.failureCode,call.httpStatus||undefined);
      }finally{onCall(call);}
    };
    await read(`/drive/v3/files/${scope.fileId}?fields=id,name,mimeType,trashed`,"METADATA_GUARD",6400);
    return read(`/drive/v3/files/${scope.fileId}/export?mimeType=text%2Fplain`,"CONTENT",16_000);
  };
}
export function driveContentBundle(scope:ContentScope,executeRequest:(path:string)=>Promise<string>,verifyRequest:(path:string)=>Promise<string>){
  const client=(request:(path:string)=>Promise<string>)=>new GoogleDriveApiClient({
    readOnlyRequest:async()=>{throw new DriveReadError("DRIVE_CONTENT_OTHER_METHOD_DENIED");},readOnlyTextRequest:request});
  const executor=client(executeRequest),verifier=client(verifyRequest);
  const params=(p:Record<string,unknown>)=>{
    if(!p||Object.getPrototypeOf(p)!==Object.prototype||Object.keys(p).length!==1||p.file_id!==scope.fileId){
      throw new DriveReadError("DRIVE_CONTENT_PARAMS_DENIED");
    }
  };
  return validateProductionBundle({
    capabilities:[{capabilityId:DRIVE_CONTENT_CAPABILITY,authorityClass:"GREEN",specialistAgentId:"documents",specialistVersion:"1.0.0"}],
    toolDefinitions:[{capabilityId:DRIVE_CONTENT_CAPABILITY,authorityClass:"GREEN",sideEffect:false}],
    toolAdapters:[{capabilityId:DRIVE_CONTENT_CAPABILITY,async execute(request){
      params(request.params);const text=await executor.exportPlainText(scope.fileId);
      const summary=summarizeTestText(text,scope.expectedLine);
      return{result:summary,evidence:{...summary,method:"drive_plain_text_export"}};
    }}],
    verificationAdapters:[{capabilityId:DRIVE_CONTENT_CAPABILITY,async verify(request){
      params(request.execution.params);
      const summary=summarizeTestText(await verifier.exportPlainText(scope.fileId),scope.expectedLine);
      const same=summary.contentHash===request.execution.evidence.contentHash;
      return{result:same?"VERIFIED" as const:"FAILED" as const,evidence:{...summary,method:"drive_plain_text_export",independentContentMatch:same},
        verifier:"drive-independent-content-readback"};
    }}],
    modelAdapters:[],modelProviderConfigs:[],workerLeaseTtlSeconds:30
  });
}
