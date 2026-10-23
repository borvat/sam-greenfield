import {test} from "node:test";
import assert from "node:assert/strict";
import {googleReadEvidence,readGoogleArtifact} from "../../apps/production/src/samGoogleEvidence";
const url=(id:string)=>"https://sam-google-workspace-mcp.onrender.com/attachments/"+id;
const first="11111111-1111-4111-8111-111111111111",second="22222222-2222-4222-8222-222222222222";
const result=(id:string)=>({content:[{type:"text",text:`File: message_${id}.txt\nDownload URL: ${url(id)}`}],isError:false});
test("temporary artifact URLs/filenames verify by downloaded bytes; changed bytes cannot pass",async()=>{
 const get=async()=>({sha256:"same-content-hash",bytes:10,mimeType:"text/plain",text:"real bytes"});
 const a=await googleReadEvidence("get_gmail_message_content",result(first),get),b=await googleReadEvidence("get_gmail_message_content",result(second),get);
 assert.equal(a.responseHash,b.responseHash);assert.equal((b.result as any).samArtifacts[0].text,"real bytes");
 const changed=await googleReadEvidence("get_gmail_message_content",result(second),async()=>({...await get(),sha256:"different-content-hash"}));
 assert.notEqual(a.responseHash,changed.responseHash);
});
test("opaque search cursors may rotate but selected records and has-more state must match",async()=>{
 const r=(name:string,token:string)=>({content:[{type:"text",text:`Found 1 files:\n- Name: ${name} (ID: actual-id)\nnextPageToken: ${token}`}],structuredContent:{result:`- Name: ${name}\nnextPageToken: ${token}`}});
 assert.equal((await googleReadEvidence("search_drive_files",r("A","one"))).responseHash,(await googleReadEvidence("search_drive_files",r("A","two"))).responseHash);
 assert.notEqual((await googleReadEvidence("search_drive_files",r("A","one"))).responseHash,(await googleReadEvidence("search_drive_files",r("B","one"))).responseHash);
 const terminal={content:[{type:"text",text:"Found 1 files:\n- Name: A (ID: actual-id)"}]};
 assert.notEqual((await googleReadEvidence("search_drive_files",r("A","one"))).responseHash,(await googleReadEvidence("search_drive_files",terminal)).responseHash);
});
test("artifact fetch rejects arbitrary destinations, redirects, oversize streams and never forwards credentials",async()=>{
 for(const target of ["https://evil.example/attachments/"+first,url(first)+"?secret=x",url(first).replace("https:","http:")])await assert.rejects(readGoogleArtifact(target),/URL_DENIED/);
 const saved=globalThis.fetch;
 try{
  globalThis.fetch=(async(_u:any,init:any)=>{assert.equal(init.redirect,"error");assert.equal(init.headers,undefined);return new Response("payload",{headers:{"content-type":"text/plain"}})}) as any;
  assert.equal((await readGoogleArtifact(url(first))).bytes,7);
  globalThis.fetch=(async()=>new Response("redirect",{status:302,headers:{location:"https://evil.example"}})) as any;
  await assert.rejects(readGoogleArtifact(url(first)),/FETCH_FAILED/);
  globalThis.fetch=(async()=>new Response("x",{headers:{"content-length":String(11*1024*1024)}})) as any;
  await assert.rejects(readGoogleArtifact(url(first)),/TOO_LARGE/);
  globalThis.fetch=(async()=>new Response(new ReadableStream({start(c){c.enqueue(new Uint8Array(11*1024*1024));c.close()}}))) as any;
  await assert.rejects(readGoogleArtifact(url(first)),/TOO_LARGE/);
 }finally{globalThis.fetch=saved}
});
test("error-shaped provider text is not a successful read",async()=>{
 await assert.rejects(googleReadEvidence("get_drive_file_content",{content:[{type:"text",text:"Error: unavailable"}]}),/REMOTE_TOOL_ERROR/);
});
test('upstream cannot populate reserved artifact metadata for either exported read',async()=>{
 for(const name of ['get_drive_file_download_url','get_gmail_message_content'] as const){
  const fake={sha256:'f'.repeat(64),bytes:999,mimeType:'application/pdf'};let downloads=0;
  const r=await googleReadEvidence(name,{content:[{type:'text',text:'No download URL provided'}],samArtifacts:[fake]},async()=>{downloads++;throw Error('unexpected download');});
  assert.equal(downloads,0);assert.deepEqual(r.artifacts,[]);assert.equal(Object.hasOwn(r.result,'samArtifacts'),false);
  const local={sha256:'a'.repeat(64),bytes:10,mimeType:'text/plain'};
  const actual=await googleReadEvidence(name,{...result(first),samArtifacts:[fake]},async()=>local);
  assert.deepEqual((actual.result as any).samArtifacts,[local]);assert.deepEqual(actual.artifacts,[local]);
 }
});
