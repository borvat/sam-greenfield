import {test} from "node:test";
import assert from "node:assert/strict";
import {PGlite} from "@electric-sql/pglite";
import {ReadSourceNotFoundError,isReadSourceNotFound} from "../../packages/shared/src/readSourceFailure";
import {samGoogleReadFailure,SamGoogleMcpBridge} from "../../apps/production/src/samGoogleMcpBridge";
import {googleReadEvidence} from "../../apps/production/src/samGoogleEvidence";
import {proposePlan} from "../../apps/brain/src/planner";
import {recordWorkFailure} from "../../apps/kernel/src/failures";
import {beginReplanAtomic} from "../../apps/kernel/src/replanning";
import {pool} from "../../packages/db/src/client";

const capability="google_mcp_get_drive_file_content";
const missing={isError:true,content:[{type:"text",text:'API error: <HttpError 404 returned "File not found"> secret-provider-detail'}]};

test("Google file 404s retain typed classification without provider text; other errors fail closed",async()=>{
 const error=samGoogleReadFailure("get_drive_file_content",missing);
 assert.ok(isReadSourceNotFound(capability,error));
 assert.equal(error.message,"READ_SOURCE_NOT_FOUND");
 assert.equal(JSON.stringify(error).includes("secret-provider-detail"),false);
 for(const name of ["get_drive_file_content","get_drive_file_download_url","get_drive_shareable_link"] as const){
  assert.ok(isReadSourceNotFound("google_mcp_"+name,samGoogleReadFailure(name,missing)));
 }
 for(const status of [401,403,429,503]){
  const e=samGoogleReadFailure("get_drive_file_content",{...missing,content:[{type:"text",text:`<HttpError ${status} returned error>`}]});
  assert.equal(isReadSourceNotFound(capability,e),false);
  assert.equal(e.message,"REMOTE_TOOL_ERROR");
 }
 assert.equal(isReadSourceNotFound(capability,new Error("READ_SOURCE_NOT_FOUND")),false);
 assert.equal(isReadSourceNotFound("gmail_send",new ReadSourceNotFoundError("gmail_send")),false);
 assert.equal(isReadSourceNotFound(capability,samGoogleReadFailure("get_drive_file_content",{...missing,isError:false})),false);
 assert.equal(isReadSourceNotFound(capability,samGoogleReadFailure("search_gmail_messages",missing)),false);
 await assert.rejects(googleReadEvidence("get_drive_file_content",missing),ReadSourceNotFoundError);
 await assert.rejects(googleReadEvidence("get_drive_file_content",{content:[{type:"text",text:'Error calling tool: <HttpError 404>'}]}),/REMOTE_TOOL_ERROR/);
});

test("actual bridge error response preserves the recoverable code across RPC",async()=>{
 const saved=globalThis.fetch;
 globalThis.fetch=(async(_url:any,options:any)=>{
  const r=JSON.parse(options.body);
  if(r.method==="notifications/initialized")return new Response(null,{status:202});
  const result=r.method==="initialize"?{protocolVersion:"2025-03-26"}:r.method==="tools/list"
   ?{tools:[{name:"get_drive_file_content",annotations:{readOnlyHint:true}}]}:missing;
  return new Response(JSON.stringify({jsonrpc:"2.0",id:r.id,result}),{headers:{"content-type":"application/json"}});
 }) as any;
 try{await assert.rejects(new SamGoogleMcpBridge("isolated-test-token").read("get_drive_file_content",{file_id:"missing"}),ReadSourceNotFoundError)}
 finally{globalThis.fetch=saved}
});

test("same-goal replanner can discover a search fallback despite an explicitly named initial read",async()=>{
 const capabilities=[
  {capabilityId:capability,sideEffect:false,parameters:{type:"object"}},
  {capabilityId:"google_mcp_search_drive_files",sideEffect:false,parameters:{type:"object"}},
  {capabilityId:"delete_drive_file",sideEffect:true,parameters:{type:"object"}}
 ];
 let offered:string[]=[];
 const p=await proposePlan({goalId:"same-goal",objective:`read-only first attempt ${capability}, recover by title search`,
  context:{replan_reason:"source missing"},dataClassification:"INTERNAL",maxCostUsd:0.1,availableCapabilities:capabilities,
  forbiddenReadSteps:[{capabilityId:capability,params:{file_id:"missing"}}],
  gateway:{async invoke(task:any){offered=task.input.capabilities.map((c:any)=>c.capabilityId);
   return {result:{output:{steps:[{capabilityId:"google_mcp_search_drive_files",params:{query:"name = 'actual title'"}}]}}};
  }} as any});
 assert.equal(p.goalId,"same-goal");assert.ok(offered.includes("google_mcp_search_drive_files"));assert.ok(!offered.includes("delete_drive_file"));
 await assert.rejects(()=>proposePlan({goalId:"same-goal",objective:`read-only ${capability}`,context:{},dataClassification:"INTERNAL",maxCostUsd:0.1,
  availableCapabilities:capabilities,forbiddenReadSteps:[{capabilityId:capability,params:{file_id:"missing"}}],
  gateway:{async invoke(){return {result:{output:{steps:[{capabilityId:capability,params:{file_id:"missing"}}]}}}}} as any}),/PLAN_FAILED_READ_REPLAY/);
});

test("isolated PostgreSQL: 404 transitions the same goal; budget, fencing, writes and atomic rollback stay enforced",async()=>{
 const db=new PGlite();
 await db.exec(`CREATE TABLE goals(id TEXT PRIMARY KEY,state TEXT,current_plan_id TEXT,replan_attempts INT DEFAULT 0,replan_reason TEXT,updated_at TIMESTAMPTZ DEFAULT now());
 CREATE TABLE work_queue(id TEXT PRIMARY KEY,goal_id TEXT,plan_id TEXT,capability_id TEXT,params JSONB DEFAULT '{}',status TEXT,fencing_token INT,lease_owner TEXT,lease_timestamp TIMESTAMPTZ,lease_expiry TIMESTAMPTZ,wake_reason TEXT,operation_key_ref TEXT);
 CREATE TABLE audit_log(id UUID PRIMARY KEY DEFAULT gen_random_uuid(),actor TEXT,goal_id TEXT,action TEXT,entity_type TEXT,entity_id TEXT,after_ref JSONB,source TEXT,result TEXT,timestamp TIMESTAMPTZ DEFAULT now());
 CREATE TABLE outbox_events(id UUID PRIMARY KEY DEFAULT gen_random_uuid(),aggregate_type TEXT,aggregate_id TEXT,event_type TEXT,payload JSONB);`);
 const saved=pool.connect;let failAudit=false;
 (pool as any).connect=async()=>({query:async(q:string,p?:any[])=>{
  if(failAudit&&q.includes("INSERT INTO audit_log")){failAudit=false;throw new Error("injected audit failure")}
  const r=await db.query<any>(q,p);return {...r,rowCount:r.rows.length||r.affectedRows||0};
 },release(){}});
 const seed=async(id:string,cap=capability,attempts=0,operation:string|null=null)=>{
  await db.query<any>("INSERT INTO goals(id,state,current_plan_id,replan_attempts) VALUES($1,'EXECUTING',$2,$3)",[id,id+"-plan",attempts]);
  await db.query<any>("INSERT INTO work_queue(id,goal_id,plan_id,capability_id,status,fencing_token,operation_key_ref) VALUES($1,$2,$3,$4,'LEASED',2,$5)",[id+"-work",id,id+"-plan",cap,operation]);
 };
 const state=async(id:string)=>(await db.query<any>("SELECT * FROM goals WHERE id=$1",[id])).rows[0] as any;
 const fail=async(id:string,error:unknown=new ReadSourceNotFoundError(capability),token=2)=>recordWorkFailure({queueId:id+"-work",fencingToken:token,actor:"documents@test",error});
 try{
  await seed("recovered");assert.equal(await fail("recovered"),true);
  assert.equal((await state("recovered")).state,"REPLANNING");
  assert.equal((await db.query<any>("SELECT status FROM work_queue WHERE id='recovered-work'")).rows[0].status,"FAILED");
  assert.equal(await beginReplanAtomic("recovered","missing read"),"PLANNING");
  assert.equal((await state("recovered")).replan_attempts,1);
  assert.equal((await db.query<any>("SELECT * FROM audit_log WHERE action='RUNTIME_RECOVERY_REQUESTED'")).rows.length,1);
  await seed("exhausted",capability,2);await fail("exhausted");assert.equal((await state("exhausted")).state,"FAILED");
  await seed("write","gmail_send");await fail("write");assert.equal((await state("write")).state,"FAILED");
  await seed("ledger",capability,0,"write-ledger-ref");assert.equal(await fail("ledger"),false);
  assert.equal((await state("ledger")).state,"EXECUTING","bound writes remain under reconciliation, not missing-read recovery");
  assert.equal((await db.query<any>("SELECT status FROM work_queue WHERE id='ledger-work'")).rows[0].status,"LEASED");
  assert.equal((await db.query<any>("SELECT * FROM outbox_events WHERE aggregate_id='ledger-work'")).rows.length,0);
  await seed("generic");await fail("generic",new Error("REMOTE_TOOL_ERROR HttpError 404"));assert.equal((await state("generic")).state,"FAILED");
  await seed("stale");assert.equal(await fail("stale",undefined,1),false);assert.equal((await state("stale")).state,"EXECUTING");
  await seed("rollback");failAudit=true;await assert.rejects(fail("rollback"),/injected audit/);
  assert.equal((await state("rollback")).state,"EXECUTING");
  assert.equal((await db.query<any>("SELECT status FROM work_queue WHERE id='rollback-work'")).rows[0].status,"LEASED");
  assert.equal((await db.query<any>("SELECT * FROM outbox_events WHERE aggregate_id='rollback-work'")).rows.length,0);
 }finally{(pool as any).connect=saved;await db.close()}
});
