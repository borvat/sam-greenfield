/** Independent adversarial acceptance. In-process synthetic PostgreSQL only. */
import assert from 'node:assert/strict';
import {test} from 'node:test';
import {PGlite} from '@electric-sql/pglite';
import {pool,withTransaction} from '../../packages/db/src/client';
import {saveApprovedOwnerDecision} from '../../apps/brain/src/learning';
import {recallApprovedOwnerDecisions} from '../../apps/brain/src/memory';
import {pollScopedOwnerNotifications,acknowledgeOwnerNotification,listOwnerNotifications} from '../../apps/notifications/src/center';
import {createCoreReadTools} from '../../apps/chatgpt-tools/src/coreReadTools';
import {startCommandCenterHttpServer} from '../../apps/command-center/src/http';
import {recoverBoundReadDiagnostic,type DiagnosticBinding} from '../../apps/production/src/legacyReadDiagnostic';
import {sha256Hex} from '../../packages/shared/src/stableJson';
const id=(n:number)=>`90000000-0000-4000-8000-${String(n).padStart(12,'0')}`;
const A=id(1),B=id(2),ORG=id(3),FOREIGN_ORG=id(4),G=id(5),P=id(6),HISTORICAL=id(7);
const owner={actor:'independent-synthetic-owner',systemOwner:true,legalEntityId:A};
const decision={statement:'Synthetic procurement uses two quotations.',contextKey:'procurement',source:'independent-synthetic-session',sourceTimestamp:'2026-10-28T09:00:00.000Z',idempotencyKey:'independent-once',approved:true};
async function fixture(){
 const db=new PGlite();
 await db.exec(`CREATE FUNCTION current_org_id() RETURNS uuid LANGUAGE SQL AS $$ SELECT nullif(current_setting('app.current_org_id',true),'')::uuid $$;
 CREATE FUNCTION current_legal_entity_id() RETURNS uuid LANGUAGE SQL AS $$ SELECT nullif(current_setting('app.current_legal_entity_id',true),'')::uuid $$;
 CREATE TABLE legal_entities(id uuid PRIMARY KEY,org_id uuid);
 CREATE TABLE memory_records(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),type text,statement text,scope jsonb,source text,confidence float,support_count int DEFAULT 1,status text,created_at timestamptz DEFAULT now(),last_confirmed_at timestamptz DEFAULT now());
 CREATE TABLE audit_log(id uuid DEFAULT gen_random_uuid(),actor text,goal_id uuid,action text,entity_type text,entity_id uuid,after_ref jsonb,source text,authority_class text,result text,timestamp timestamptz DEFAULT now());
 CREATE TABLE goals(id uuid PRIMARY KEY,company_scope uuid,objective text,state text,current_plan_id uuid,completion_definition text,authority_ceiling text,parent_goal_id uuid,next_wake_at timestamptz,updated_at timestamptz,business_id text,domain text,replan_attempts int DEFAULT 0);
 CREATE TABLE plans(id uuid,goal_id uuid,version int,goal_assumptions jsonb,constraints jsonb,dependencies jsonb,steps jsonb,plan_hash text);
 CREATE TABLE work_queue(id uuid,goal_id uuid,plan_id uuid,status text,capability_id text,params jsonb,queued_at timestamptz DEFAULT now(),wake_reason text,attempt int);
 CREATE TABLE executions(id uuid,queue_id uuid,goal_id uuid,plan_id uuid,plan_hash text,execution_hash text,capability_id text,params jsonb,result jsonb,evidence jsonb,fencing_token bigint,operation_key_ref text,actor text,status text,started_at timestamptz);
 CREATE TABLE verifications(id uuid,execution_id uuid,verifier text,method text,result text,plan_hash text,execution_hash text,independent_evidence jsonb,checked_at timestamptz,contract_id uuid,operation_key_ref text);
 CREATE TABLE goal_read_reviews(id uuid DEFAULT gen_random_uuid(),goal_id uuid,plan_id uuid,round int,decision jsonb,report_hash text,created_at timestamptz DEFAULT now());
 CREATE TABLE outbox_events(id uuid DEFAULT gen_random_uuid(),aggregate_type text,aggregate_id uuid,event_type text,payload jsonb,created_at timestamptz DEFAULT now());
 CREATE TABLE owner_notifications(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),legal_entity_id uuid,goal_id uuid,source_event_id uuid,dedup_key text UNIQUE,kind text,severity text,title text,body jsonb,status text DEFAULT 'UNROUTED',last_error_code text,created_at timestamptz DEFAULT now(),updated_at timestamptz DEFAULT now());
 CREATE TABLE notification_event_receipts(event_id uuid PRIMARY KEY,notification_id uuid,disposition text);
 CREATE TABLE approvals(id uuid,goal_id uuid,legal_entity_id uuid,capability_id text,expiry_at timestamptz,status text,created_at timestamptz DEFAULT now());
 CREATE TABLE side_effect_operations(reconciliation_state text);
 CREATE TABLE model_providers(health text);`);
 await db.query('INSERT INTO legal_entities VALUES($1,$2),($3,$2)',[A,ORG,B]);
 await db.query("SELECT set_config('app.current_org_id',$1,false),set_config('app.current_legal_entity_id',$2,false)",[ORG,A]);
 const queries:{sql:string,args:any[]}[]=[];
 const client={release(){},async query(sql:string,args:any[]=[]){queries.push({sql,args});const result=await db.query(sql,args);return {...result,rowCount:result.rows.length}}};
 return {db,client,queries};
}
async function usingPool<T>(client:any,fn:()=>Promise<T>){const prior=pool.connect,priorQuery=pool.query;(pool as any).connect=async()=>client;(pool as any).query=(sql:string,args?:any[])=>client.query(sql,args);try{return await fn()}finally{pool.connect=prior;pool.query=priorQuery}}
async function digest(db:PGlite,tables:string[]){const out:any={};for(const table of tables)out[table]=(await db.query(`SELECT to_jsonb(t) AS r FROM ${table} t ORDER BY to_jsonb(t)::text`)).rows;return sha256Hex(out)}
const allTables=['goals','plans','work_queue','executions','verifications','goal_read_reviews','audit_log','outbox_events','memory_records','owner_notifications','notification_event_receipts'];

test('independent owner approval, provenance and idempotency reject altered actor/source/date/task/GUC',async()=>{
 const {db,client}=await fixture();try{await usingPool(client,async()=>{
  const row:any=await withTransaction(()=>saveApprovedOwnerDecision(client,owner,decision));
  assert.equal(row.scope.approved_by,owner.actor);assert.equal(row.scope.source_timestamp,decision.sourceTimestamp);assert.equal(row.source,decision.source);assert.equal(row.status,'APPROVED_RULE');
  const original=await digest(db,['memory_records','audit_log']);
  assert.equal((await withTransaction(()=>saveApprovedOwnerDecision(client,owner,decision))).id,row.id);
  assert.equal(await digest(db,['memory_records','audit_log']),original);
  for(const mutation of [{source:'changed'},{sourceTimestamp:'2026-10-28T09:00:01.000Z'},{contextKey:'sales'},{statement:'Changed synthetic statement.'},{approved:false}]){
   await assert.rejects(withTransaction(()=>saveApprovedOwnerDecision(client,owner,{...decision,...mutation})));assert.equal(await digest(db,['memory_records','audit_log']),original);
  }
  assert.equal((await recallApprovedOwnerDecisions(client,A,'Plan procurement')).length,1);
  assert.deepEqual(await recallApprovedOwnerDecisions(client,A,'Plan procurementness'),[]);
  assert.deepEqual(await recallApprovedOwnerDecisions(client,A,'Plan sales'),[]);
  assert.deepEqual(await recallApprovedOwnerDecisions(client,B,'Plan procurement'),[]);
  for(const context of [{...owner,systemOwner:false},{...owner,actor:''},{...owner,legalEntityId:B}])await assert.rejects(withTransaction(()=>saveApprovedOwnerDecision(client,context,decision)),/AUTHORIZED/);
  await db.query("SELECT set_config('app.current_org_id',$1,false)",[FOREIGN_ORG]);
  assert.deepEqual(await recallApprovedOwnerDecisions(client,A,'Plan procurement'),[]);
  await assert.rejects(withTransaction(()=>saveApprovedOwnerDecision(client,owner,decision)),/AUTHORIZED/);
  await db.query("SELECT set_config('app.current_org_id',$1,false),set_config('app.current_legal_entity_id','',false)",[ORG]);
  assert.deepEqual(await recallApprovedOwnerDecisions(client,A,'Plan procurement'),[]);
  assert.equal(await digest(db,['memory_records','audit_log']),original);
 })}finally{await db.close()}
});

test('independent owner write rolls back memory when audit persistence fails; observations stay unapproved',async()=>{
 const {db,client}=await fixture();try{
  const fail={...client,async query(sql:string,args?:any[]){if(/INSERT INTO audit_log/.test(sql))throw Error('independent audit fault');return client.query(sql,args)}};
  await usingPool(fail,async()=>{await assert.rejects(withTransaction(()=>saveApprovedOwnerDecision(fail,owner,decision)),/independent audit fault/)});
  assert.equal((await db.query('SELECT * FROM memory_records')).rows.length,0);
  await db.query("INSERT INTO memory_records(type,statement,scope,status) VALUES('OWNER_DECISION','unapproved',$1,'OBSERVED'),('OWNER_DECISION','no provenance',$2,'APPROVED_RULE')",[{schema:'sam.approved_owner_decision.v1',legal_entity_id:A,context_key:'procurement',approved_by:owner.actor,source_timestamp:decision.sourceTimestamp},{legal_entity_id:A,context_key:'procurement'}]);
  assert.deepEqual(await recallApprovedOwnerDecisions(client,A,'procurement'),[]);
 }finally{await db.close()}
});

test('independent polling and acknowledgement deduplicate only current-company post-activation events',async()=>{
 const {db,client}=await fixture();try{await usingPool(client,async()=>{
  await db.query("INSERT INTO goals(id,company_scope,objective,state,business_id) VALUES($1,$2,'synthetic current','WAITING_EXTERNAL','SYN-A'),($3,$4,'synthetic foreign','WAITING_EXTERNAL','SYN-B')",[G,A,id(8),B]);
  const insert=async(event:string,goal:string,when:string)=>db.query("INSERT INTO outbox_events(id,aggregate_type,aggregate_id,event_type,payload,created_at) VALUES($1,'goal',$2,'GOAL_STATE_CHANGED',$3,$4)",[event,goal,{to:'WAITING_EXTERNAL',reason:'synthetic'},when]);
  await insert(id(20),G,'2000-01-01T00:00:00Z');
  const activated=await withTransaction(()=>pollScopedOwnerNotifications(client,owner));assert.equal(activated.created,0);
  await insert(id(21),G,'2099-01-01T00:00:00Z');await insert(id(22),id(8),'2099-01-01T00:00:00Z');
  assert.equal((await withTransaction(()=>pollScopedOwnerNotifications(client,owner))).created,1);
  assert.equal((await withTransaction(()=>pollScopedOwnerNotifications(client,owner))).created,0);
  const visible=await listOwnerNotifications(client,owner);assert.equal(visible.records.length,1);assert.equal(visible.pushPerformed,false);
  const notification=visible.records[0],before=await digest(db,['owner_notifications']);
  const receipt=await withTransaction(()=>acknowledgeOwnerNotification(client,owner,notification.id));assert.ok(receipt);
  assert.deepEqual(await withTransaction(()=>acknowledgeOwnerNotification(client,owner,notification.id)),receipt);
  assert.equal((await db.query("SELECT * FROM audit_log WHERE action='OWNER_NOTIFICATION_READ'")).rows.length,1);
  assert.equal(await digest(db,['owner_notifications']),before);
  const other=await listOwnerNotifications(client,{...owner,actor:'second-synthetic-owner'});assert.equal(other.records[0].readReceipt,null);
  await assert.rejects(withTransaction(()=>acknowledgeOwnerNotification(client,{...owner,legalEntityId:B},notification.id)),/AUTHORIZED/);
  assert.equal(await withTransaction(()=>acknowledgeOwnerNotification(client,owner,id(99))),null);
  assert.equal((await db.query('SELECT * FROM notification_event_receipts')).rows.length,1,'foreign and historical events have no receipt');
 })}finally{await db.close()}
});

test('independent READ tools preserve historical report identity/hash and perform zero SQL mutations',async()=>{
 const {db,client,queries}=await fixture();try{await usingPool(client,async()=>{
  const historical={status:'complete',summary:'Synthetic historical narrative.',limitations:['Coverage unknown.'],report:{semanticPolicy:'HISTORICAL_POLICY'}};
  await db.query("INSERT INTO goals(id,company_scope,objective,state,current_plan_id) VALUES($1,$2,'procurement','COMPLETED',$3)",[G,A,P]);
  await db.query('INSERT INTO goal_read_reviews(id,goal_id,plan_id,round,decision,report_hash) VALUES($1,$2,$3,1,$4,$5)',[HISTORICAL,G,P,historical,sha256Hex(historical)]);
  const before=await digest(db,allTables),tools=createCoreReadTools();queries.length=0;
  for(const [name,args] of [['sam_get_report',{report_id:HISTORICAL}],['sam_get_goal_timeline',{goal_id:G}],['sam_system_status',{}],['sam_recall_memory',{query:'procurement'}],['sam_memory_status',{}],['sam_list_notifications',{}],['sam_notification_status',{}]] as const){
   const tool=tools.find(t=>t.definition.name===name)!;assert.equal(tool.definition.risk,'READ');
   const first:any=await tool.handler(args,owner);assert.equal(first.ok,true,name);
   const again:any=await tool.handler(args,owner);assert.equal(again.ok,true,name);
   if(name==='sam_get_report'){assert.equal(first.data.report.id,HISTORICAL);assert.equal(first.data.report.report_hash,sha256Hex(historical));assert.deepEqual(first.data.report.decision,historical);}
   if(name==='sam_get_goal_timeline'){assert.equal(first.data.reports[0].id,HISTORICAL);assert.equal(first.data.reports[0].report_hash,sha256Hex(historical));assert.deepEqual(first.data.reports[0].decision,historical);assert.equal(first.data.continuity.executionPerformed,false);}
  }
  assert.deepEqual(queries.filter(q=>!/^\s*(SELECT|BEGIN|COMMIT|ROLLBACK)\b/i.test(q.sql)),[],'READ handlers must not issue DML or DDL');
  assert.equal(await digest(db,allTables),before);
  const report=tools.find(t=>t.definition.name==='sam_get_report')!;
  assert.equal((await report.handler({report_id:HISTORICAL},{...owner,legalEntityId:B})).ok,false);
  await db.query("SELECT set_config('app.current_legal_entity_id',$1,false)",[B]);
  const foreign:any=await report.handler({report_id:HISTORICAL},{...owner,legalEntityId:B});assert.equal(foreign.ok,true);assert.equal(foreign.data.report,null,'valid foreign principal must not retrieve the company A report');
 })}finally{await db.close()}
});

test('independent narrow projector suppresses stale approval/progress only in the activated company',async()=>{
 const {db,client}=await fixture();try{await usingPool(client,async()=>{
  await db.query("INSERT INTO goals(id,company_scope,objective,state) VALUES($1,$2,'synthetic resumed','EXECUTING'),($3,$4,'synthetic foreign','EXECUTING')",[G,A,id(8),B]);
  for(const [n,company,goal,kind,body] of [[60,A,G,'APPROVAL',{state:'WAITING_OWNER'}],[61,A,G,'PROGRESS',{state:'WAITING_EXTERNAL'}],[62,A,G,'PROGRESS',{state:'WAITING_EXTERNAL',requiredAction:'REVIEW_OBSERVATION'}],[63,B,id(8),'APPROVAL',{state:'WAITING_OWNER'}]] as const){
   await db.query('INSERT INTO owner_notifications(id,legal_entity_id,goal_id,dedup_key,kind,body) VALUES($1,$2,$3,$4,$5,$6)',[id(n),company,goal,'independent:'+n,kind,body]);
  }
  await withTransaction(()=>pollScopedOwnerNotifications(client,owner));
  const rows:any=(await db.query('SELECT id,status,last_error_code FROM owner_notifications ORDER BY id')).rows;
  assert.deepEqual(rows.map((r:any)=>[r.id,r.status]),[[id(60),'SUPPRESSED'],[id(61),'SUPPRESSED'],[id(62),'UNROUTED'],[id(63),'UNROUTED']]);
  assert.equal(rows[0].last_error_code,'GOAL_STATE_CHANGED');assert.equal(rows[1].last_error_code,'GOAL_STATE_CHANGED');
 })}finally{await db.close()}
});

test('independent Command Center read-only mode rejects all new POST writes before database access',async()=>{
 const prior=process.env.SAM_COMMAND_CENTER_READ_ONLY;process.env.SAM_COMMAND_CENTER_READ_ONLY='1';let connects=0;const original=pool.connect;(pool as any).connect=async()=>{connects++;throw Error('database must not be reached')};
 const http=await startCommandCenterHttpServer({legalEntityId:A,host:'127.0.0.1',port:0,bearerToken:'synthetic-independent-token'});
 try{const address=http.server.address();assert.ok(address&&typeof address==='object');const base=`http://127.0.0.1:${address.port}`;
  for(const path of ['/api/owner-memory','/api/notifications/poll',`/api/notifications/${id(98)}/ack`]){
   assert.equal((await fetch(base+path,{method:'POST',body:'{}'})).status,401);
   const result=await fetch(base+path,{method:'POST',headers:{authorization:'Bearer synthetic-independent-token'},body:'{}'});assert.equal(result.status,405);assert.equal(result.headers.get('allow'),'GET');
  }
  assert.match(await (await fetch(base)).text(),/data-read-only="true"/);assert.equal(connects,0);
 }finally{await http.close();pool.connect=original;if(prior===undefined)delete process.env.SAM_COMMAND_CENTER_READ_ONLY;else process.env.SAM_COMMAND_CENTER_READ_ONLY=prior}
});

async function diagnosticFixture(){
 const f=await fixture(),{db}=f,objective='Independent synthetic two-page diagnostic';
 const plan={goal_id:G,version:1,assumptions:{synthetic:true},constraints:{readOnly:true},dependencies:{},steps:[]};const planHash=sha256Hex(plan);
 await db.query("INSERT INTO goals(id,company_scope,objective,state,current_plan_id,completion_definition,authority_ceiling,parent_goal_id,next_wake_at) VALUES($1,$2,$3,'WAITING_EXTERNAL',$4,'sam.read_report.v1','GREEN',NULL,NULL)",[G,A,objective,P]);
 await db.query('INSERT INTO plans VALUES($1,$2,1,$3,$4,$5,$6,$7)',[P,G,plan.assumptions,plan.constraints,plan.dependencies,plan.steps,planHash]);
 const binding:DiagnosticBinding={authorization:'independent-synthetic-review',goalId:G,companyId:A,objectiveHash:sha256Hex(objective),planId:P,planHash,parentGoalId:null,executions:[]};
 for(const [i,direction] of ['inbox','sent'].entries()){
  const executionId=id(30+i),queueId=id(40+i),verificationId=id(50+i),params={query:`in:${direction} after:100 before:200`,page_size:100,include_headers:false};
  const result={isError:false,structuredContent:{result:`No messages found for query: '${params.query}'`}},resultHash=sha256Hex(result),evidence={sideEffect:false,resultHash,responseHash:resultHash};
  const payload={queue_id:queueId,goal_id:G,plan_id:P,plan_hash:planHash,capability_id:'google_mcp_search_gmail_messages',params,result,evidence,fencing_token:1,operation_key_ref:null};
  const executionHash=sha256Hex(payload),verificationEvidence={readback:true,responseHash:resultHash},retrievedAt='2026-10-27T20:00:00.000Z',verifiedAt='2026-10-27T20:00:01.000Z';
  await db.query("INSERT INTO work_queue(id,goal_id,plan_id,status,capability_id,params) VALUES($1,$2,$3,'EXECUTED',$4,$5)",[queueId,G,P,payload.capability_id,params]);
  await db.query("INSERT INTO executions VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,1,NULL,'independent-executor','EXECUTED',$11)",[executionId,queueId,G,P,planHash,executionHash,payload.capability_id,params,result,evidence,retrievedAt]);
  await db.query("INSERT INTO verifications VALUES($1,$2,'independent-verifier','api_readback','VERIFIED',$3,$4,$5,$6,NULL,NULL)",[verificationId,executionId,planHash,executionHash,verificationEvidence,verifiedAt]);
  binding.executions.push({id:executionId,queueId,verificationId,resultHash,executionHash,direction,count:0,actor:'independent-executor',retrievedAt,verifier:'independent-verifier',verifiedAt,verificationEvidenceHash:sha256Hex(verificationEvidence),verificationContractId:null,params});
 }
 return {...f,binding};
}

test('independent diagnostic dry-run is immutable, shares the runtime review lock and applies exactly once',async()=>{
 const {db,client,queries,binding}=await diagnosticFixture();try{
  const before=await digest(db,allTables);const dry:any=await recoverBoundReadDiagnostic(client,binding,{actor:owner.actor,apply:false});assert.equal(dry.applied,false);assert.equal(await digest(db,allTables),before);
  const savedSource=await digest(db,['plans','work_queue','executions','verifications']);
  const applied=await recoverBoundReadDiagnostic(client,binding,{actor:owner.actor,apply:true});const after=await digest(db,allTables);
  assert.deepEqual(await recoverBoundReadDiagnostic(client,binding,{actor:owner.actor,apply:true}),{...applied,alreadyApplied:true});assert.equal(await digest(db,allTables),after);
  assert.equal(await digest(db,['plans','work_queue','executions','verifications']),savedSource);
  assert.ok(queries.some(q=>/pg_try_advisory_xact_lock/.test(q.sql)&&q.args[0]==='read-review:'+G));
  const row:any=(await db.query('SELECT * FROM goal_read_reviews')).rows[0];assert.equal(row.report_hash,dry.reportHash);assert.equal(row.report_hash,sha256Hex(row.decision));assert.equal(row.decision.diagnostic.modelCalls,0);assert.equal(row.decision.diagnostic.newReads,0);assert.equal(row.decision.diagnostic.mailboxExhaustiveness,'UNKNOWN');assert.equal(row.decision.diagnostic.originalGoalCompleted,false);
  const changes:any=(await db.query('SELECT payload FROM outbox_events')).rows;assert.deepEqual(changes.map((r:any)=>[r.payload.from,r.payload.to]),[['WAITING_EXTERNAL','VERIFYING'],['VERIFYING','COMPLETED']]);
 }finally{await db.close()}
});

test('independent diagnostic rejects source/provenance/latest verification tampering without mutation and rolls back late failure',async()=>{
 const attacks=[
  "UPDATE goals SET company_scope='"+B+"'",
  "UPDATE plans SET dependencies='{\"tampered\":true}'",
  "UPDATE executions SET started_at=started_at+interval '1 second'",
  "UPDATE verifications SET independent_evidence=independent_evidence||'{\"tampered\":true}'::jsonb",
  "UPDATE verifications SET contract_id='"+id(80)+"'",
  "INSERT INTO verifications SELECT '"+id(81)+"',execution_id,verifier,method,'INCONCLUSIVE',plan_hash,execution_hash,independent_evidence,checked_at+interval '1 second',NULL,NULL FROM verifications LIMIT 1",
  "UPDATE work_queue SET params=params||'{\"page_token\":\"changed\"}'::jsonb"
 ];
 for(const attack of attacks){const {db,client,binding}=await diagnosticFixture();try{await db.exec(attack);const before=await digest(db,allTables);await assert.rejects(recoverBoundReadDiagnostic(client,binding,{actor:owner.actor,apply:true}),/BINDING_CHANGED/);assert.equal(await digest(db,allTables),before)}finally{await db.close()}}
 for(const needle of ['INSERT INTO goal_read_reviews','INSERT INTO audit_log','UPDATE goals SET next_wake_at']){
  const {db,client,binding}=await diagnosticFixture();try{const before=await digest(db,allTables);const failing={...client,async query(sql:string,args?:any[]){if(sql.includes(needle))throw Error('independent late fault');return client.query(sql,args)}};await assert.rejects(recoverBoundReadDiagnostic(failing,binding,{actor:owner.actor,apply:true}),/independent late fault/);assert.equal(await digest(db,allTables),before)}finally{await db.close()}
 }
 const {db,client,binding}=await diagnosticFixture();try{const before=await digest(db,allTables);const busy={...client,async query(sql:string,args?:any[]){return /pg_try_advisory_xact_lock/.test(sql)?{rows:[{locked:false}],rowCount:1}:client.query(sql,args)}};await assert.rejects(recoverBoundReadDiagnostic(busy,binding,{actor:owner.actor,apply:true}),/REVIEW_BUSY/);assert.equal(await digest(db,allTables),before)}finally{await db.close()}
});
