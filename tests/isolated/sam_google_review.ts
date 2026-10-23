import {sha256Hex} from '../../packages/shared/src/stableJson';
import {readReviewBudget} from '../../apps/kernel/src/readReviewBudget';
import {test} from "node:test";
import assert from "node:assert/strict";
import {PGlite} from "@electric-sql/pglite";
import {readFile} from "node:fs/promises";
import {validateReadReview,reviewNextReadGoal} from "../../apps/production/src/readGoalReview";
const id="11111111-1111-4111-8111-111111111111",plan="22222222-2222-4222-8222-222222222222",execution="33333333-3333-4333-8333-333333333333";
const descriptors=[{capabilityId:"google_mcp_get_gmail_message_content",authorityClass:"GREEN",sideEffect:false,parameters:{type:"object",properties:{message_id:{type:"string"}},required:["message_id"],additionalProperties:false}}];
const source={id:execution,capabilityId:"google_mcp_search_gmail_messages",params:{query:"business"},text:"Found message ID: actual-message. Supplier confirms release.",truncated:false,actor:"communications@1.0.0",retrievedAt:"2026-10-22T00:00:00Z"};
const review=(status:string)=>({status,summary:"Evidence-linked result",requirements:[{obligationId:"read-source",requirement:"Read the source",fulfilled:status==="complete",evidenceIds:[execution]}],findings:[{text:"Supplier confirms release",executionId:execution,quote:"Supplier confirms release."}],limitations:[],steps:status==="continue"?[{capabilityId:descriptors[0].capabilityId,params:{message_id:"actual-message"}}]:[]});
test("review rejects invented IDs, unsafe actions, repeated reads, unsupported citations and premature completion",()=>{
 const indexed:any=review("complete");indexed.findings[0]={text:"Source finding",executionId:execution,quoteLine:0,quote:"Retyped wrong value"};
 assert.equal(validateReadReview(indexed,[source],"Read",descriptors).findings[0].quote,source.text);
 indexed.findings[0].quoteLine=9;assert.throws(()=>validateReadReview(indexed,[source],"Read",descriptors),/QUOTE_LINE/);
 const address=review("complete");address.summary="Owner ceo@examplle.test";
 assert.throws(()=>validateReadReview(address,[{...source,text:source.text+" Owner ceo@example.test"}],"Read",descriptors),/UNOBSERVED_EMAIL/);
 const cited:any=review("complete");cited.summary="Owner ceo@examplle.test";cited.findings[0]={text:"Owner ceo@examplle.test",executionId:execution,quoteLine:1};
 const corrected=validateReadReview(cited,[{...source,text:source.text+"\nOwner ceo@example.test"}],"Read",descriptors);
 assert.equal(corrected.findings[0].quote,"Owner ceo@example.test");assert.equal(JSON.stringify(corrected).includes("examplle.test"),false);assert.ok(corrected.limitations.length);
 assert.equal(validateReadReview(review("continue"),[source],"Read the source",descriptors).status,"continue");
 assert.throws(()=>validateReadReview(review("continue"),[source],"Read the source",descriptors,
  [{capabilityId:descriptors[0].capabilityId,params:{message_id:"actual-message"}}]),/REPEATED_FAILED_READ/);
 const bad=structuredClone(review("continue"));bad.steps[0].params.message_id="invented";assert.throws(()=>validateReadReview(bad,[source],"Read",descriptors),/UNOBSERVED_ID/);
 bad.steps[0].capabilityId="send_email";assert.throws(()=>validateReadReview(bad,[source],"Read",descriptors),/UNSAFE/);
 const final=review("complete");final.findings[0].quote="Invented quote";assert.throws(()=>validateReadReview(final,[source],"Read",descriptors),/CITATION/);
 final.findings[0].quote=source.text;final.requirements[0].fulfilled=false;assert.throws(()=>validateReadReview(final,[source],"Read",descriptors),/UNFULFILLED/);
 const previous={...source,capabilityId:descriptors[0].capabilityId,params:{message_id:"actual-message"}};
 assert.throws(()=>validateReadReview(review("continue"),[previous],"Read",descriptors),/REPEATED_READ/);
});
test("projected detail quotes use verified literals and reject projection wrappers",()=>{
 const projected={...source,text:'{\n  "items": [\n        "sku": "actual-sku",\n}',verifiedQuotes:{2:'"sku": "actual-sku",'}};
 const candidate:any=review('complete');candidate.findings=[{text:'Observed SKU',executionId:execution,quoteLine:2}];
 assert.equal(validateReadReview(candidate,[projected],'Read',descriptors).findings[0].quote,'"sku": "actual-sku",');
 candidate.findings=[{text:'Invented wrapper claim',executionId:execution,quoteLine:1}];
 assert.throws(()=>validateReadReview(candidate,[projected],'Read',descriptors),/UNSUPPORTED_CITATION/);
 candidate.findings=[{text:'Invented wrapper claim',executionId:execution,quote:'"items": ['}];
 assert.throws(()=>validateReadReview(candidate,[projected],'Read',descriptors),/UNSUPPORTED_CITATION/);
});
test("isolated PostgreSQL: observation commits next plan, final report gates completion and survives reconstruction",async()=>{
 const db=new PGlite();
 // Minimal real SQL schema for this boundary; no production database or network.
 await db.exec(`CREATE TABLE goals(id UUID PRIMARY KEY,state TEXT,completion_definition TEXT,current_plan_id UUID,objective TEXT,updated_at TIMESTAMPTZ DEFAULT now(),next_wake_at TIMESTAMPTZ);
 CREATE TABLE plans(id UUID PRIMARY KEY DEFAULT gen_random_uuid(),goal_id UUID,version INT,goal_assumptions JSONB,constraints JSONB,dependencies JSONB,steps JSONB,plan_hash TEXT);
 CREATE TABLE work_queue(id UUID PRIMARY KEY DEFAULT gen_random_uuid(),goal_id UUID,plan_id UUID,step_id UUID,capability_id TEXT,params JSONB,priority INT,due_at TIMESTAMPTZ,queued_at TIMESTAMPTZ DEFAULT now(),status TEXT DEFAULT 'QUEUED', idempotency_key TEXT,operation_key_ref TEXT,step_key TEXT,depends_on UUID[],result_refs JSONB);
 CREATE TABLE executions(id UUID PRIMARY KEY,goal_id UUID,plan_id UUID,capability_id TEXT,params JSONB,result JSONB,actor TEXT,queue_id UUID,plan_hash TEXT,execution_hash TEXT,fencing_token BIGINT,operation_key_ref TEXT,evidence JSONB DEFAULT '{}',started_at TIMESTAMPTZ DEFAULT now());
 CREATE TABLE verifications(execution_id UUID,result TEXT,plan_hash TEXT,execution_hash TEXT,id UUID DEFAULT gen_random_uuid(),checked_at TIMESTAMPTZ DEFAULT now());
 CREATE TABLE outbox_events(id UUID PRIMARY KEY DEFAULT gen_random_uuid(),aggregate_type TEXT,aggregate_id TEXT,event_type TEXT,payload JSONB);
 ALTER TABLE goals ADD COLUMN replan_attempts INT DEFAULT 0;
 CREATE TABLE audit_log(id UUID PRIMARY KEY DEFAULT gen_random_uuid(),goal_id UUID,actor TEXT,entity_type TEXT,entity_id UUID,source TEXT,authority_class TEXT,result TEXT,action TEXT,after_ref JSONB,timestamp TIMESTAMPTZ DEFAULT now());`);
 await db.exec(await readFile("packages/db/integration-migrations/00101_goal_read_reviews.sql","utf8"));
 let failEnqueue=false;
 const query=async(q:string,args?:any[])=>{if(failEnqueue&&q.includes("INSERT INTO work_queue")){failEnqueue=false;throw new Error("injected queue insert failure")}return q.includes("pg_try_advisory_lock")?{rows:[{locked:true}]}:q.includes("pg_advisory_unlock")?{rows:[{}]}:db.query<any>(q,args)};
 const connection={query:async(q:string,args?:any[])=>{const r=await query(q,args);return {...r,rowCount:r.rows.length};},release(){}};const sql={connect:async()=>connection};
 const bundle:any={catalog:{planningDescriptors:()=>descriptors},raw:{}};
 try{
  await db.query<any>("INSERT INTO goals(id,state,completion_definition,current_plan_id,objective,updated_at) VALUES($1,'VERIFYING','sam.read_report.v1',$2,'Read the source',now())",[id,plan]);
  await db.query<any>("INSERT INTO plans(id,goal_id,version) VALUES($1,$2,1)",[plan,id]);
  const insertVerified=async(executionId:string,planId:string,queueId:string,capabilityId:string,params:unknown,result:unknown)=>{
   const planHash=(await db.query<any>('SELECT plan_hash FROM plans WHERE id=$1',[planId])).rows[0].plan_hash;
   const payload={queue_id:queueId,goal_id:id,plan_id:planId,plan_hash:planHash,capability_id:capabilityId,params,result,evidence:{fixture:'verified read'},fencing_token:1,operation_key_ref:null};
   const hash=sha256Hex(payload);
   await db.query("INSERT INTO executions(id,goal_id,plan_id,queue_id,plan_hash,execution_hash,fencing_token,capability_id,params,result,evidence,actor) VALUES($1,$2,$3,$4,$5,$6,1,$7,$8,$9,$10,'communications@1.0.0')",
    [executionId,id,planId,queueId,planHash,hash,capabilityId,params,result,payload.evidence]);
   await db.query("INSERT INTO verifications(execution_id,result,plan_hash,execution_hash) VALUES($1,'VERIFIED',$2,$3)",[executionId,planHash,hash]);
  };
  await db.query('UPDATE plans SET plan_hash=$1 WHERE id=$2',[sha256Hex({goalId:id,version:1}),plan]);
  await insertVerified(execution,plan,'55555555-5555-4555-8555-555555555555',source.capabilityId,source.params,{content:[{type:"text",text:source.text}]});
  const obligations={version:1,objectiveHash:sha256Hex('Read the source'),deliverables:[{id:'read-source',description:'Read the source',fields:[],scope:{kind:'unknown'},units:'UNKNOWN',vat:'UNKNOWN',period:'UNKNOWN',timeZone:'UNKNOWN'}],unresolved:[]};
  await db.query('UPDATE plans SET goal_assumptions=$1 WHERE id=$2',[{goalObligations:obligations},plan]);
  failEnqueue=true;
  assert.equal((await reviewNextReadGoal(bundle,sql,async()=>review("continue"))).status,"blocked");
  assert.equal((await db.query<any>('SELECT * FROM goal_read_reviews')).rows.length,0);
  const reserved=await readReviewBudget(connection,id,plan);
  assert.equal(reserved.attempts,1);
  assert.equal(reserved.phase,'review');
  assert.equal((await db.query<any>("SELECT * FROM plans")).rows.length,1);
  assert.equal((await db.query<any>("SELECT state FROM goals")).rows[0].state,"WAITING_EXTERNAL");
  await db.query<any>("UPDATE goals SET state='VERIFYING'");
  assert.equal((await reviewNextReadGoal(bundle,sql,async()=>review("continue"))).status,"continue");
  let g:any=(await db.query<any>("SELECT * FROM goals")).rows[0];assert.equal(g.state,"EXECUTING");assert.notEqual(g.current_plan_id,plan);
  assert.equal((await db.query<any>("SELECT * FROM work_queue")).rows.length,1);
  assert.deepEqual((await db.query<any>('SELECT goal_assumptions FROM plans WHERE id=$1',[g.current_plan_id])).rows[0].goal_assumptions.goalObligations,obligations);
  const second="44444444-4444-4444-8444-444444444444";
  await db.query<any>("UPDATE work_queue SET status='EXECUTED'");await db.query<any>("UPDATE goals SET state='VERIFYING'");
  const queueId=(await db.query<any>('SELECT id FROM work_queue WHERE plan_id=$1',[g.current_plan_id])).rows[0].id;
  await insertVerified(second,g.current_plan_id,queueId,descriptors[0].capabilityId,{message_id:"actual-message"},{content:[{type:"text",text:"Supplier confirms release."}]});
  const final=review("complete");final.requirements[0].evidenceIds=[second];final.findings[0].executionId=second;
  await db.query<any>("UPDATE goals SET replan_attempts=1");
  await db.query<any>("INSERT INTO audit_log(goal_id,action,after_ref) VALUES($1,'RUNTIME_RECOVERY_REQUESTED',$2)",[id,{queue_id:"failed-work",capability_id:"google_mcp_get_drive_file_content",params:{file_id:"missing"},error_code:"READ_SOURCE_NOT_FOUND"}]);
  let calls=0;
  assert.equal((await reviewNextReadGoal(bundle,sql,async(input:any)=>{
   assert.deepEqual(input.goalObligations,obligations);
   assert.equal(input.failedReadAttempts.length,1);
   assert.equal(input.failedReadAttempts[0].after_ref.error_code,"READ_SOURCE_NOT_FOUND");
   assert.equal(input.verifiedObservations.length,2);
   return ++calls===1?final:{accepted:true,missing:[]};
  })).status,"complete");
  assert.equal((await db.query<any>("SELECT state FROM goals")).rows[0].state,"COMPLETED");
  const reports=await db.query<any>("SELECT * FROM goal_read_reviews ORDER BY round");assert.equal(reports.rows.length,2);assert.equal((reports.rows[1] as any).decision.status,"complete");
  assert.equal((await reviewNextReadGoal(bundle,sql,async()=>{throw new Error("must not rerun")})).processed,false);
  await db.query<any>("DELETE FROM goal_read_reviews WHERE plan_id=$1",[g.current_plan_id]);
  // Reset only this synthetic scenario's budget alongside its deleted report.
  await db.query<any>("DELETE FROM audit_log WHERE action='READ_REVIEW_BUDGET' AND after_ref->>'planId'=$1",[g.current_plan_id]);
  await db.query<any>("UPDATE goals SET state='VERIFYING'");
  let rejectedCritiques=0;
  assert.equal((await reviewNextReadGoal(bundle,sql,async(input:any)=>{if(input.proposedReport){rejectedCritiques++;return {accepted:false,missing:["Original comparison is absent"]};}return final;})).status,"blocked");
  assert.equal(rejectedCritiques,1);
  assert.equal((await db.query<any>("SELECT state FROM goals")).rows[0].state,"WAITING_EXTERNAL");
 }finally{await db.close()}
});
