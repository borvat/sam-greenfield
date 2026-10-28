/** Synthetic, source-bound deterministic recovery; no model/provider access. */
import assert from 'node:assert/strict';
import {test} from 'node:test';
import {PGlite} from '@electric-sql/pglite';
import {sha256Hex} from '../../packages/shared/src/stableJson';
const G='11111111-1111-4111-8111-111111111111',P='22222222-2222-4222-8222-222222222222',A='33333333-3333-4333-8333-333333333333',O='44444444-4444-4444-8444-444444444444';
async function fixture(){
 const db=new PGlite();
 await db.exec(`CREATE TABLE legal_entities(id UUID,org_id UUID);CREATE FUNCTION current_org_id() RETURNS UUID LANGUAGE SQL AS $$ SELECT '${O}'::uuid $$;CREATE FUNCTION current_legal_entity_id() RETURNS UUID LANGUAGE SQL AS $$ SELECT '${A}'::uuid $$;
 CREATE TABLE goals(id UUID,state TEXT,current_plan_id UUID,company_scope UUID,objective TEXT,completion_definition TEXT,authority_ceiling TEXT,parent_goal_id UUID,next_wake_at TIMESTAMPTZ,updated_at TIMESTAMPTZ);
 CREATE TABLE plans(id UUID,goal_id UUID,version INT,goal_assumptions JSONB,constraints JSONB,dependencies JSONB,steps JSONB,plan_hash TEXT);
 CREATE TABLE work_queue(id UUID,goal_id UUID,plan_id UUID,status TEXT,capability_id TEXT,params JSONB);
 CREATE TABLE executions(id UUID,queue_id UUID,goal_id UUID,plan_id UUID,plan_hash TEXT,execution_hash TEXT,capability_id TEXT,params JSONB,result JSONB,evidence JSONB,fencing_token BIGINT,operation_key_ref TEXT,actor TEXT,status TEXT,started_at TIMESTAMPTZ);
 CREATE TABLE verifications(id UUID,execution_id UUID,verifier TEXT,method TEXT,result TEXT,plan_hash TEXT,execution_hash TEXT,independent_evidence JSONB,checked_at TIMESTAMPTZ);
 CREATE TABLE goal_read_reviews(id UUID DEFAULT gen_random_uuid(),goal_id UUID,plan_id UUID,round INT,decision JSONB,report_hash TEXT,created_at TIMESTAMPTZ DEFAULT now(),UNIQUE(goal_id,plan_id));
 CREATE TABLE audit_log(id UUID DEFAULT gen_random_uuid(),actor TEXT,goal_id UUID,action TEXT,entity_type TEXT,entity_id UUID,after_ref JSONB,source TEXT,authority_class TEXT,result TEXT,timestamp TIMESTAMPTZ DEFAULT now());
 CREATE TABLE outbox_events(id UUID DEFAULT gen_random_uuid(),aggregate_type TEXT,aggregate_id TEXT,event_type TEXT,payload JSONB);`);
 await db.query('INSERT INTO legal_entities VALUES($1,$2)',[A,O]);
 const objective='Synthetic bounded first-page mail diagnostic',steps:any[]=[],executions:any[]=[],expected:any[]=[];
 for(const [index,direction] of ['sent','inbox'].entries()){
  const id=`55555555-5555-4555-8555-55555555555${index}`,queue=`66666666-6666-4666-8666-66666666666${index}`,verificationId=`77777777-7777-4777-8777-77777777777${index}`;
  const params={query:`in:${direction} after:1792985928 before:1793072328`,page_size:100,include_headers:false};
  steps.push({index,capability_id:'google_mcp_search_gmail_messages',params});
  const text=direction==='sent'?`No messages found for query: '${params.query}'`:`Found 2 messages matching '${params.query}':\n\n📧 MESSAGES:\n  1. Message ID: abcdef\n     Web Link: https://mail.invalid/a\n     Thread ID: abc\n     Thread Link: https://mail.invalid/a\n\n  2. Message ID: fedcba\n     Web Link: https://mail.invalid/b\n     Thread ID: def\n     Thread Link: https://mail.invalid/b`;
  const result={isError:false,structuredContent:{result:text},content:[{type:'text',text}]},hash=sha256Hex(result),evidence={sideEffect:false,resultHash:hash,responseHash:hash},e={id,queue_id:queue,goal_id:G,plan_id:P,capability_id:'google_mcp_search_gmail_messages',params,result,evidence,fencing_token:2,operation_key_ref:null,actor:'synthetic-executor',status:'EXECUTED'};
  executions.push(e);expected.push({id,queueId:queue,verificationId,resultHash:hash,direction,count:direction==='sent'?0:2,actor:e.actor,retrievedAt:'2026-10-27T21:00:00.000Z',verifier:'independent',verifiedAt:'2026-10-27T21:01:00.000Z',verificationEvidenceHash:sha256Hex({readback:true,responseHash:hash}),verificationContractId:null,params});
 }
 const plan={goal_id:G,version:1,assumptions:{synthetic:true},constraints:{readOnly:true},dependencies:{},steps};const planHash=sha256Hex(plan);
 await db.query("INSERT INTO goals VALUES($1,'WAITING_EXTERNAL',$2,$3,$4,'sam.read_report.v1','GREEN',NULL,NULL,now())",[G,P,A,objective]);
 await db.query('INSERT INTO plans VALUES($1,$2,1,$3,$4,$5,$6,$7)',[P,G,plan.assumptions,plan.constraints,plan.dependencies,steps,planHash]);
 for(const [i,e] of executions.entries()){
  const payload={queue_id:e.queue_id,goal_id:G,plan_id:P,plan_hash:planHash,capability_id:e.capability_id,params:e.params,result:e.result,evidence:e.evidence,fencing_token:2,operation_key_ref:null};const executionHash=sha256Hex(payload);Object.assign(expected[i],{executionHash});
  await db.query('INSERT INTO work_queue VALUES($1,$2,$3,$4,$5,$6)',[e.queue_id,G,P,'EXECUTED',e.capability_id,e.params]);
  await db.query("INSERT INTO executions VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,2,NULL,$11,'EXECUTED','2026-10-27T21:00:00Z')",[e.id,e.queue_id,G,P,planHash,executionHash,e.capability_id,e.params,e.result,e.evidence,e.actor]);
  await db.query("INSERT INTO verifications VALUES($1,$2,'independent','api_readback','VERIFIED',$3,$4,$5,'2026-10-27T21:01:00Z')",[expected[i].verificationId,e.id,planHash,executionHash,{readback:true,responseHash:expected[i].resultHash}]);
 }
 const binding={authorization:'synthetic-explicit-owner-deterministic-recovery',goalId:G,companyId:A,objectiveHash:sha256Hex(objective),planId:P,planHash,parentGoalId:null,executions:expected};
 const client={release(){},async query(sql:string,args?:any[]){const r=await db.query(sql,args);return {...r,rowCount:r.rows.length}}};
 return {db,client,binding};
}
async function api(){const module=await import('../../apps/production/src/legacyReadDiagnostic').catch(()=>null);assert.ok(module,'deterministic recovery module must exist');return module;}
test('exact saved evidence dry-runs without mutation, then atomic legal completion is stable and sanitized',async()=>{
 const {recoverBoundReadDiagnostic}=await api();const {db,client,binding}=await fixture();
 try{
  const original=(await db.query('SELECT * FROM executions ORDER BY id')).rows;
  const dry=await recoverBoundReadDiagnostic(client,binding,{actor:'synthetic-owner',apply:false});assert.equal(dry.applied,false);
  assert.equal((await db.query('SELECT * FROM goal_read_reviews')).rows.length,0);
  const result=await recoverBoundReadDiagnostic(client,binding,{actor:'synthetic-owner',apply:true});assert.equal(result.applied,true);
  assert.deepEqual(await recoverBoundReadDiagnostic(client,binding,{actor:'synthetic-owner',apply:true}),{...result,alreadyApplied:true});
  const report=(await db.query<any>('SELECT * FROM goal_read_reviews')).rows[0];assert.equal(sha256Hex(report.decision),report.report_hash);
  assert.equal(report.decision.diagnostic.originalGoalCompleted,false);assert.equal(report.decision.diagnostic.pages.find((p:any)=>p.direction==='inbox').uniqueIdentifierCount,2);
  assert.equal(report.decision.diagnostic.pages[0].pagination,'NOT_EXPOSED');assert.equal(report.decision.diagnostic.pages[0].exhaustive,'UNKNOWN');assert.equal(report.decision.diagnostic.mailboxIdentity,'UNKNOWN');assert.equal(report.decision.report.semanticPolicy,'DETERMINISTIC_BOUNDED_SAVED_EVIDENCE');assert.equal(report.decision.diagnostic.mailboxExhaustiveness,'UNKNOWN');
  assert.doesNotMatch(JSON.stringify(report),/abcdef|fedcba|mail\.invalid/);
  assert.deepEqual((await db.query('SELECT * FROM executions ORDER BY id')).rows,original);
  assert.equal((await db.query<any>('SELECT state FROM goals')).rows[0].state,'COMPLETED');
  const transitions=(await db.query<any>('SELECT payload FROM outbox_events')).rows.map(r=>[r.payload.from,r.payload.to]);assert.deepEqual(transitions,[['WAITING_EXTERNAL','VERIFYING'],['VERIFYING','COMPLETED']]);
 }finally{await db.close()}
});
test('changed source/plan/latest verification or incomplete work refuses and insertion failure rolls back all transitions',async()=>{
 const {recoverBoundReadDiagnostic}=await api();
 for(const change of ["UPDATE goals SET objective='changed'","UPDATE plans SET constraints='{}'","UPDATE executions SET result='{}' WHERE id=(SELECT id FROM executions LIMIT 1)","UPDATE work_queue SET status='QUEUED'","UPDATE verifications SET verifier='synthetic-executor'","UPDATE verifications SET verifier='different-independent-verifier'","UPDATE verifications SET checked_at=checked_at-interval '1 second'",`INSERT INTO verifications SELECT '${O}',execution_id,'independent','api_readback','INCONCLUSIVE',plan_hash,execution_hash,independent_evidence,'2026-10-28T21:01:00Z' FROM verifications LIMIT 1`]){
  const {db,client,binding}=await fixture();try{await db.exec(change);await assert.rejects(recoverBoundReadDiagnostic(client,binding,{actor:'synthetic-owner',apply:true}));assert.equal((await db.query('SELECT * FROM goal_read_reviews')).rows.length,0);assert.equal((await db.query('SELECT * FROM outbox_events')).rows.length,0);assert.equal((await db.query<any>('SELECT state FROM goals')).rows[0].state,'WAITING_EXTERNAL')}finally{await db.close()}
 }
 const {db,client,binding}=await fixture();try{
  const failing={...client,async query(sql:string,args?:any[]){if(sql.includes('INSERT INTO audit_log'))throw Error('synthetic audit failure');return client.query(sql,args)}};
  await assert.rejects(recoverBoundReadDiagnostic(failing,binding,{actor:'synthetic-owner',apply:true}),/synthetic audit failure/);
  assert.equal((await db.query('SELECT * FROM goal_read_reviews')).rows.length,0);assert.equal((await db.query('SELECT * FROM outbox_events')).rows.length,0);assert.equal((await db.query<any>('SELECT state FROM goals')).rows[0].state,'WAITING_EXTERNAL');
 }finally{await db.close()}
});

test('diagnostic report acceptance independently refuses missing/overstated narrow deliverables',async()=>{
 const module=await api();assert.equal(typeof module.validateLegacyDiagnosticReport,'function','artifact acceptance must be separate from generation');
 const {db,client,binding}=await fixture();try{
  const dry=await module.recoverBoundReadDiagnostic(client,binding,{actor:'synthetic-owner',apply:false});
  assert.equal(module.validateLegacyDiagnosticReport(dry.decision,binding),true);
  for(const change of [(x:any)=>x.diagnostic.pages[0].exhaustive=false,(x:any)=>x.diagnostic.mailboxIdentity='KNOWN',(x:any)=>x.diagnostic.originalGoalCompleted=true,(x:any)=>x.diagnostic.pages.pop(),(x:any)=>x.limitations=[],(x:any)=>x.requirements[0].fulfilled=false,(x:any)=>x.diagnostic.modelCalls=1,(x:any)=>x.findings[0].text='invented narrative']){
   const report=structuredClone(dry.decision);change(report);assert.throws(()=>module.validateLegacyDiagnosticReport(report,binding));
  }
 }finally{await db.close()}
});
test('recovery refuses a concurrent reviewer holding the shared review lock before any writes',async()=>{
 const module=await api(),{db,client,binding}=await fixture();try{
  const busy={...client,async query(sql:string,args?:any[]){if(sql.includes('pg_try_advisory_xact_lock')){assert.deepEqual(args,['read-review:'+G]);return {rowCount:1,rows:[{locked:false}]};}return client.query(sql,args)}};
  await assert.rejects(module.recoverBoundReadDiagnostic(busy,binding,{actor:'synthetic-owner',apply:true}),/REVIEW_BUSY/);
  assert.equal((await db.query('SELECT * FROM goal_read_reviews')).rows.length,0);assert.equal((await db.query('SELECT * FROM outbox_events')).rows.length,0);
 }finally{await db.close()}
});
