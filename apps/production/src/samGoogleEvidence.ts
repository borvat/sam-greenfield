import {createHash} from "node:crypto";
import {sha256Hex} from "../../../packages/shared/src/stableJson";
import {SAM_GOOGLE_MCP_URL,type SamGoogleTool} from "./samGoogleMcpBridge";

const origin=new URL(SAM_GOOGLE_MCP_URL).origin;
const maxBytes=10*1024*1024;
export interface GoogleArtifact {sha256:string;bytes:number;mimeType:string;text?:string;truncated?:boolean}

/** No bearer headers, redirects, arbitrary hosts or unbounded downloads. */
export async function readGoogleArtifact(url:string):Promise<GoogleArtifact>{
 const u=new URL(url);
 if(u.origin!==origin||u.username||u.password||u.search||u.hash||!/^\/attachments\/[a-f0-9-]{36}$/i.test(u.pathname))throw new Error("SAM_GOOGLE_ARTIFACT_URL_DENIED");
 const ctrl=new AbortController(),timer=setTimeout(()=>ctrl.abort(),20000);
 try{
  const response=await fetch(u,{method:"GET",redirect:"error",signal:ctrl.signal});
  if(!response.ok)throw new Error("SAM_GOOGLE_ARTIFACT_FETCH_FAILED");
  if(Number(response.headers.get("content-length"))>maxBytes){await response.body?.cancel();throw new Error("SAM_GOOGLE_ARTIFACT_TOO_LARGE")}
  if(!response.body)throw new Error("SAM_GOOGLE_ARTIFACT_EMPTY_BODY");
  const reader=response.body.getReader(),chunks:Uint8Array[]=[];let bytes=0;
  while(true){const next=await reader.read();if(next.done)break;bytes+=next.value.length;if(bytes>maxBytes){await reader.cancel();throw new Error("SAM_GOOGLE_ARTIFACT_TOO_LARGE")}chunks.push(next.value)}
  const data=Buffer.concat(chunks),mimeType=(response.headers.get("content-type")??"application/octet-stream").split(";")[0];
  const textual=/^(text\/|application\/(json|xml))/.test(mimeType);
  return {sha256:createHash("sha256").update(data).digest("hex"),bytes,mimeType,...(textual?{text:data.toString("utf8").slice(0,24000),truncated:data.toString("utf8").length>24000}:{})};
 }finally{clearTimeout(timer)}
}

export async function googleReadEvidence(name:SamGoogleTool,result:Record<string,unknown>,readArtifact=readGoogleArtifact){
 if(result.isError===true)throw new Error("REMOTE_TOOL_ERROR");
 const strings:string[]=[];
 const visit=(v:any)=>{if(typeof v==="string")strings.push(v);else if(Array.isArray(v))v.forEach(visit);else if(v&&typeof v==="object")Object.values(v).forEach(visit)};visit(result);
 const texts=(result.content as any[]??[]).filter(c=>c.type==="text").map(c=>String(c.text));
 if(texts.some(s=>/^\s*(Error:|Error executing tool|Failed to )/i.test(s)))throw new Error("REMOTE_TOOL_ERROR");
 const exports=name==="get_drive_file_download_url"||name==="get_gmail_message_content";
 const urls=exports?[...new Set(texts.flatMap(s=>[...s.matchAll(/(?:^|\n)[^\S\r\n]*(?:📎\s*)?Download URL:\s*(https?:\/\/[^\s<>"'\)]+\/attachments\/[a-f0-9-]{36})/gi)].map(m=>m[1])))]:[];
 if(urls.length>10)throw new Error("SAM_GOOGLE_ARTIFACT_LIMIT");
 const artifacts:GoogleArtifact[]=[],replacements:Array<[string,string]>=[];
 for(const url of urls){const artifact=await readArtifact(url);artifacts.push(artifact);replacements.push([url,"artifact-sha256:"+artifact.sha256],[new URL(url).pathname.split("/").at(-1)!,artifact.sha256])}
 const normalize=(v:any):any=>{
  if(typeof v==="string"){
   for(const [from,to] of replacements)v=v.split(from).join(to);
   // Opaque navigation cursors are not records. Preserve whether more data exists.
   if(name==="search_drive_files")v=v.replace(/(^|\n)nextPageToken: [^\r\n]+/g,"$1nextPageToken: [MORE_RESULTS]");
   if(name==="search_gmail_messages")v=v.replace(/page_token='[^']+'/g,"page_token='[MORE_RESULTS]'");
   return v;
  }
  if(Array.isArray(v))return v.map(normalize);
  if(v&&typeof v==="object")return Object.fromEntries(Object.entries(v).map(([k,x])=>[k,normalize(x)]));
  return v;
 };
 const canonical=normalize(result);
 const responseHash=sha256Hex(artifacts.length?{response:canonical,artifacts:artifacts.map(({text,truncated,...a})=>a)}:canonical);
 return {responseHash,verificationVersion:2,artifacts,result:artifacts.length?{...result,samArtifacts:artifacts}:result};
}
