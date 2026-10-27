/** Synthetic local SQL only: no provider calls or business database access. */
import assert from 'node:assert/strict';
import {test} from 'node:test';
import {PGlite} from '@electric-sql/pglite';
import {pool} from '../../packages/db/src/client';
import {sha256Hex} from '../../packages/shared/src/stableJson';
import {createReliabilityReadTools} from '../../apps/chatgpt-tools/src/reliabilityReadTools';
import {recordReviewDiagnostic,hasPreflightRecoveryEvidence,safeReviewCode} from '../../apps/kernel/src/readReviewDiagnostic';
import {recordReadReviewBudget} from '../../apps/kernel/src/readReviewBudget';
import {observeVerifiedMemory,learnVerifiedWorldFact} from '../../apps/brain/src/learning';
import {SamGoogleConnection} from '../../apps/production/src/samGoogleConnection';
import {buildRevision} from '../../packages/shared/src/buildRevision';
const A='11111111-1111-4111-8111-111111111111',B='22222222-2222-4222-8222-222222222222',G='33333333-3333-4333-8333-333333333333',R='44444444-4444-4444-8444-444444444444';

test('synthetic scoped report replay is exact and performs zero execution; missing/wrong company reveals no row',async()=>{
 const db=new PGlite(),original=pool.connect;let reads=0;
 const client={query:async(sql:string,args?:any[])=>{reads++;const result=await db.query(sql,args);return {...result,rowCount:result.rows.length}},release(){}};
 (pool as any).connect=async()=>client;
 try{
  await db.exec(`CREATE TABLE memory_records(id UUID,type TEXT,statement TEXT,scope JSONB,status TEXT,source TEXT,confidence NUMERIC,support_count INT,created_at TIMESTAMPTZ DEFAULT now(),last_confirmed_at TIMESTAMPTZ DEFAULT now()); CREATE TABLE legal_entities(id UUID,org_id UUID); CREATE TABLE goals(id UUID,company_scope UUID,current_plan_id UUID,state TEXT); CREATE TABLE goal_read_reviews(id UUID,goal_id UUID,decision JSONB,report_hash TEXT,plan_id UUID);
  CREATE FUNCTION current_org_id() RETURNS UUID LANGUAGE SQL AS $$ SELECT current_setting('app.current_org_id')::uuid $$;
  CREATE FUNCTION current_legal_entity_id() RETURNS UUID LANGUAGE SQL AS $$ SELECT current_setting('app.current_legal_entity_id')::uuid $$;`);
  await db.query('INSERT INTO legal_entities VALUES($1,$2),($3,$2)',[A,G,B]);
  await db.query("SELECT set_config('app.current_org_id',$1,false),set_config('app.current_legal_entity_id',$2,false)",[G,A]);
  const decision={status:'complete',summary:'Historical exact narrative',report:{sourceHash:'original'}};const hash=sha256Hex(decision);
  await db.query("INSERT INTO goals VALUES($1,$2,$3,'COMPLETED')",[G,A,R]);await db.query('INSERT INTO goal_read_reviews VALUES($1,$2,$3,$4,$1)',[R,G,JSON.stringify(decision),hash]);
  const tool=createReliabilityReadTools().find(t=>t.definition.name==='sam_get_report')!;
  const owner={actor:'synthetic-owner',systemOwner:true,legalEntityId:A};
  const result=await tool.handler({report_id:R},owner);assert.equal(result.ok,true);
  assert.deepEqual((result.data as any).report.decision,decision);assert.equal((result.data as any).report.report_hash,hash);
  assert.equal((result.data as any).visibility,'CURRENT_ROLE_RLS_VISIBLE_REPORTS');assert.equal((result.data as any).nullReason,null);assert.match(tool.definition.description,/earlier plans may be invisible/);assert.equal((result.data as any).executionPerformed,false);assert.match((result.data as any).semanticValidation,/HISTORICAL/);
  assert.deepEqual(await tool.handler({report_id:R},owner),result);
  // Model the existing integration policy: earlier-plan reports remain stored
  // but invisible. The tool must not identify hidden versus absent IDs.
  await db.exec(`ALTER TABLE goal_read_reviews ENABLE ROW LEVEL SECURITY;
   CREATE POLICY current_plan_report ON goal_read_reviews USING(EXISTS(SELECT 1 FROM goals g WHERE g.id=goal_id AND g.current_plan_id=plan_id AND g.company_scope=current_legal_entity_id()));
   CREATE ROLE report_reader;GRANT SELECT ON goal_read_reviews,goals,legal_entities TO report_reader;SET ROLE report_reader;`);
  assert.equal(((await tool.handler({report_id:R},owner)).data as any).report.report_hash,hash,'Completed same-plan report preserves original hash under RLS');
  await db.exec('RESET ROLE');await db.query('UPDATE goals SET current_plan_id=$1',[B]);await db.exec('SET ROLE report_reader');
  const priorPlan=(await tool.handler({report_id:R},owner)).data as any;
  assert.equal(priorPlan.report,null);assert.equal(priorPlan.visibility,'CURRENT_ROLE_RLS_VISIBLE_REPORTS');assert.equal(priorPlan.nullReason,'NOT_FOUND_OR_NOT_VISIBLE_UNDER_CURRENT_RLS');
  assert.deepEqual((await tool.handler({report_id:B},owner)).data,priorPlan);
  await db.exec('RESET ROLE');await db.query('UPDATE goals SET current_plan_id=$1',[R]);

  assert.equal((await tool.handler({report_id:R},{...owner,legalEntityId:B})).ok,false,'Requested company must match fixed principal');
  await db.query("SELECT set_config('app.current_legal_entity_id',$1,false)",[B]);
  const hidden=(await tool.handler({report_id:R},{...owner,legalEntityId:B})).data as any;assert.equal(hidden.report,null);assert.equal(hidden.nullReason,'NOT_FOUND_OR_NOT_VISIBLE_UNDER_CURRENT_RLS');assert.equal(hidden.visibility,'CURRENT_ROLE_RLS_VISIBLE_REPORTS');assert.deepEqual((await tool.handler({report_id:B},{...owner,legalEntityId:B})).data,hidden,'Absent and unauthorized/hidden IDs share the same response');
  await db.query("SELECT set_config('app.current_legal_entity_id',$1,false)",[A]);
  await db.query("INSERT INTO memory_records(id,type,statement,scope,status,source,confidence,support_count) VALUES($1,'OPERATIONAL','Synthetic approved rule',$2,'APPROVED_RULE','owner;approved_by:synthetic-owner',1,1),($3,'OPERATIONAL','Synthetic other company',$4,'OBSERVED','verified_execution:foreign',0.7,1)",[R,{legal_entity_id:A},B,{legal_entity_id:B}]);
  const oldIntegration=process.env.SAM_INTEGRATION_ENABLED,oldKnowledge=process.env.SAM_KNOWLEDGE_ENABLED,oldNotifications=process.env.SAM_NOTIFICATIONS_ENABLED;
  try{
   process.env.SAM_INTEGRATION_ENABLED='0';
   const recall=createReliabilityReadTools().find(t=>t.definition.name==='sam_recall_memory')!;
   const memory=(await recall.handler({query:'Synthetic'},owner)).data as any;
   assert.equal(memory.execution.availability,'FEATURE_DISABLED');assert.equal(memory.operational.records.length,1);
   assert.equal(memory.operational.records[0].status,'APPROVED_RULE');assert.ok(memory.operational.records[0].created_at);assert.ok(memory.operational.records[0].last_confirmed_at);assert.deepEqual(memory.operational.records[0].scope,{legal_entity_id:A});
   process.env.SAM_INTEGRATION_ENABLED='1';process.env.SAM_KNOWLEDGE_ENABLED='true';
   const status=(await createReliabilityReadTools().find(t=>t.definition.name==='sam_memory_status')!.handler({},owner)).data as any;
   assert.equal(status.execution.availability,'MISSING_INTEGRATION_TABLE');assert.equal(status.operational.count,1);
   const missingRecall=(await recall.handler({query:'Synthetic'},owner)).data as any;
   assert.equal(missingRecall.execution.availability,'MISSING_INTEGRATION_TABLE');assert.equal(missingRecall.operational.records.length,1);
   process.env.SAM_NOTIFICATIONS_ENABLED='true';
   const notificationTool=createReliabilityReadTools().find(t=>t.definition.name==='sam_list_notifications')!;
   const missingNotifications=(await notificationTool.handler({},owner)).data as any;
   assert.equal(missingNotifications.availability,'MISSING_INTEGRATION_TABLE');assert.equal(missingNotifications.pushPerformed,false);
   await db.exec(`CREATE TABLE verifications(id UUID,execution_id UUID,result TEXT,checked_at TIMESTAMPTZ DEFAULT now());
    CREATE TABLE knowledge_records(id UUID,kind TEXT,statement TEXT,legal_entity_id UUID,execution_id UUID,verification_id UUID,goal_id UUID,approval_id UUID,source_timestamp TIMESTAMPTZ DEFAULT now(),expires_at TIMESTAMPTZ DEFAULT now()+interval '30 days',superseded_at TIMESTAMPTZ);
    ALTER TABLE knowledge_records ENABLE ROW LEVEL SECURITY;
    CREATE POLICY source_facts_only ON knowledge_records USING(kind='SOURCE_FACT');
    CREATE TABLE owner_notifications(id UUID,legal_entity_id UUID,created_at TIMESTAMPTZ);
    CREATE ROLE knowledge_denied;GRANT SELECT ON memory_records,legal_entities TO knowledge_denied;
    CREATE ROLE knowledge_reader;
    GRANT SELECT ON knowledge_records,memory_records,legal_entities,verifications TO knowledge_reader;`);
   await db.query("INSERT INTO verifications(id,execution_id,result) VALUES($1,$2,'VERIFIED')",[R,G]);
   await db.query("INSERT INTO knowledge_records(id,kind,statement,legal_entity_id,execution_id,verification_id,goal_id) VALUES($1,'SOURCE_FACT','Synthetic attributed quotation',$2,$3,$1,$3),($3,'INFERENCE','Synthetic hidden inference',$2,NULL,NULL,$3),($4,'OWNER_DECISION','Synthetic hidden decision',$2,NULL,NULL,$3)",[R,A,G,B]);
   await db.exec('SET ROLE knowledge_denied');
   const deniedStatus=(await createReliabilityReadTools().find(t=>t.definition.name==='sam_memory_status')!.handler({},owner)).data as any;
   assert.equal(deniedStatus.execution.availability,'PERMISSION_UNAVAILABLE');assert.equal(deniedStatus.operational.count,1);
   const deniedRecall=(await recall.handler({query:'Synthetic'},owner)).data as any;
   assert.equal(deniedRecall.execution.availability,'PERMISSION_UNAVAILABLE');assert.equal(deniedRecall.operational.records.length,1);
   assert.equal(((await notificationTool.handler({},owner)).data as any).availability,'PERMISSION_UNAVAILABLE');
   await db.exec('RESET ROLE');await db.exec('SET ROLE knowledge_reader');
   const restrictedStatus=(await createReliabilityReadTools().find(t=>t.definition.name==='sam_memory_status')!.handler({},owner)).data as any;
   assert.equal(restrictedStatus.execution.availability,'RLS_VISIBLE_ATTRIBUTED_ROWS');assert.equal(restrictedStatus.execution.count,1);assert.equal(restrictedStatus.execution.countMeaning,'RLS_VISIBLE_ATTRIBUTED_ROWS_ONLY');
   assert.equal(restrictedStatus.execution.categories.INFERENCE.visibility,'NOT_VERIFIED');assert.equal(restrictedStatus.execution.categories.OWNER_DECISION.visibility,'NOT_VERIFIED');
   const restrictedRecall=(await recall.handler({query:'Synthetic'},owner)).data as any;
   assert.equal(restrictedRecall.execution.availability,'RLS_VISIBLE_ROWS');assert.equal(restrictedRecall.execution.records.length,1);assert.equal(restrictedRecall.execution.records[0].kind,'SOURCE_FACT');assert.equal(restrictedRecall.execution.categories.OWNER_DECISION.visibility,'NOT_VERIFIED');
   assert.equal(Object.hasOwn(restrictedRecall.execution.categories.INFERENCE,'count'),false,'Hidden categories must not appear empty');
   await db.exec('RESET ROLE');
   const permittedRecall=(await recall.handler({query:'Synthetic'},owner)).data as any;
   assert.equal(permittedRecall.execution.records.length,3,'A role permitted to read inference and decisions retains every returned category');
   assert.deepEqual(new Set(permittedRecall.execution.records.map((r:any)=>r.kind)),new Set(['SOURCE_FACT','INFERENCE','OWNER_DECISION']));
   assert.match(permittedRecall.execution.records.find((r:any)=>r.kind==='INFERENCE').interpretation,/Unconfirmed inference/);
   assert.match(permittedRecall.execution.records.find((r:any)=>r.kind==='OWNER_DECISION').interpretation,/never expands execution authority/);
   process.env.SAM_NOTIFICATIONS_ENABLED='false';
   const notifications=(await createReliabilityReadTools().find(t=>t.definition.name==='sam_list_notifications')!.handler({},owner)).data as any;
   assert.equal(notifications.availability,'FEATURE_DISABLED');assert.equal(notifications.delivery,'POLLING_ONLY');assert.equal(notifications.pushPerformed,false);
  }finally{for(const [key,value]of Object.entries({SAM_INTEGRATION_ENABLED:oldIntegration,SAM_KNOWLEDGE_ENABLED:oldKnowledge,SAM_NOTIFICATIONS_ENABLED:oldNotifications})){if(value===undefined)delete process.env[key];else process.env[key]=value;}}
  const count=reads;assert.equal((await tool.handler({report_id:R,legal_entity_id:A},{...owner,legalEntityId:B})).ok,false);assert.equal(reads,count);
  assert.equal((await tool.handler({report_id:R},{actor:'none',systemOwner:false,legalEntityId:A})).ok,false);assert.equal(reads,count+2);
 }finally{pool.connect=original;await db.close();}
});

test('synthetic append-only diagnostic preserves reservations, rejects absent/consumed budget recovery, sanitizes errors',async()=>{
 const db=new PGlite();try{
  await db.exec('CREATE TABLE audit_log(id UUID DEFAULT gen_random_uuid(),actor TEXT,goal_id UUID,action TEXT,entity_type TEXT,entity_id UUID,after_ref JSONB,source TEXT,authority_class TEXT,result TEXT,timestamp TIMESTAMPTZ DEFAULT now())');
  const c={query:(sql:string,args:any[])=>db.query(sql,args)};
  assert.equal(await hasPreflightRecoveryEvidence(c,G,R),false);
  assert.equal(safeReviewCode(Error('password=secret provider raw body')),'REVIEW_RUNTIME_FAILED');
  await recordReviewDiagnostic(c,{goalId:G,planId:R,code:'REVIEW_SOURCE_BUDGET_EXCEEDED',phase:'preflight',beforeFirstReservation:true});
  assert.equal(await hasPreflightRecoveryEvidence(c,G,R),true);assert.equal(await hasPreflightRecoveryEvidence(c,G,B),false);
  const budget={attempts:2,callsUsed:4,retryable:false};await recordReadReviewBudget(c,G,R,budget);
  const before=(await db.query("SELECT * FROM audit_log WHERE action='READ_REVIEW_BUDGET'")).rows;
  await recordReviewDiagnostic(c,{goalId:G,planId:R,code:'secret payload',phase:'runtime',beforeFirstReservation:false});
  assert.equal(await hasPreflightRecoveryEvidence(c,G,R),false);
  assert.deepEqual((await db.query("SELECT * FROM audit_log WHERE action='READ_REVIEW_BUDGET'")).rows,before);
  assert.doesNotMatch(JSON.stringify((await db.query('SELECT * FROM audit_log')).rows),/secret payload/);
 }finally{await db.close();}
});

test('synthetic verified memory derives company scope and rejects cross-company reinforcement before mutation',async()=>{
 const original=pool.connect;let inserted:any[]|undefined;let mutated=0;
 (pool as any).connect=async()=>({release(){},async query(sql:string,args?:any[]){
  if(sql.includes('FROM executions e JOIN goals'))return {rowCount:1,rows:[{company_scope:A,verification_result:'VERIFIED',goal_state:'COMPLETED'}]};
  if(sql.includes('FROM memory_records'))return {rowCount:0,rows:[]};
  if(sql.includes('INSERT INTO memory_records')){inserted=args;mutated++;return {rows:[{id:R,status:'OBSERVED',support_count:1}]};}
  return {rows:[]};
 }});
 try{
  await observeVerifiedMemory({executionId:G,type:'OPERATIONAL',statement:'Synthetic evidence'});
  assert.deepEqual(JSON.parse(inserted![2]),{legal_entity_id:A});assert.equal(mutated,1);
  for(const scope of [{legal_entity_id:B},{legalEntityId:B},{company_scope:B}])await assert.rejects(observeVerifiedMemory({executionId:G,type:'OPERATIONAL',statement:'Synthetic evidence',scope}),/SCOPE_MISMATCH/);
  assert.equal(mutated,1);
 }finally{pool.connect=original;}
});

test('synthetic Google stored authorization never claims a live read or send; revision metadata is sanitized',async()=>{
 const connection=new SamGoogleConnection({store:{tools:async()=>[],loadRefresh:async()=>({token:'private'})}} as any);
 const status=await connection.status();assert.equal(status.authorizationStored,true);assert.equal(status.liveReadVerified,null);assert.equal(status.liveReadProbe,'NOT_PERFORMED');assert.equal(status.sendCapability,'NOT_AUTHORIZED');
 assert.deepEqual(buildRevision({SAM_BUILD_REVISION:'secret arbitrary text'}),{revision:null,revisionStatus:'UNKNOWN'});
 assert.equal(buildRevision({SAM_BUILD_REVISION:'a'.repeat(40)}).revision,'a'.repeat(40));assert.equal(buildRevision({SAM_BUILD_REVISION:'a'.repeat(7)}).revision,null);assert.equal(buildRevision({SAM_BUILD_REVISION:'a'.repeat(64)}).revision,null);
});

test('synthetic owner continuation requires positive preflight proof, never resets spent usage and rolls back failed scheduling',async()=>{
 const {continueReadReview}=await import('../../apps/production/src/readReviewContinuation');
 const db=new PGlite(),original=pool.connect;let failAudit=false;
 const c={release(){},async query(sql:string,args?:any[]){if(failAudit&&sql.includes("'READ_REVIEW_CONTINUATION_REQUESTED'"))throw Error('synthetic scheduling failure');const r=await db.query(sql,args);return {...r,rowCount:r.rows.length}}};
 (pool as any).connect=async()=>c;
 try{
  await db.exec(`CREATE TABLE goals(id UUID,state TEXT,company_scope UUID,current_plan_id UUID,completion_definition TEXT,next_wake_at TIMESTAMPTZ,updated_at TIMESTAMPTZ);
   CREATE TABLE goal_read_reviews(goal_id UUID,plan_id UUID,decision JSONB);
   CREATE TABLE audit_log(id UUID DEFAULT gen_random_uuid(),actor TEXT,goal_id UUID,action TEXT,entity_type TEXT,entity_id UUID,after_ref JSONB,source TEXT,authority_class TEXT,result TEXT,timestamp TIMESTAMPTZ DEFAULT now());
   CREATE TABLE executions(id UUID,goal_id UUID,plan_id UUID);
   CREATE TABLE verifications(id UUID,execution_id UUID,result TEXT,checked_at TIMESTAMPTZ);
   CREATE TABLE work_queue(goal_id UUID,plan_id UUID,status TEXT);
   CREATE TABLE outbox_events(id UUID DEFAULT gen_random_uuid(),aggregate_type TEXT,aggregate_id TEXT,event_type TEXT,payload JSONB);`);
  await db.query("INSERT INTO goals VALUES($1,'WAITING_EXTERNAL',$2,$3,'sam.read_report.v1',NULL,now())",[G,A,R]);
  await db.query('INSERT INTO executions VALUES($1,$2,$3)',[B,G,R]);await db.query("INSERT INTO verifications VALUES($1,$2,'VERIFIED',now())",[R,B]);
  const input={goalId:G,legalEntityId:A,actor:'synthetic-owner'};
  await assert.rejects(continueReadReview(input),/PREFLIGHT_EVIDENCE_REQUIRED/);
  await assert.rejects(continueReadReview({...input,legalEntityId:B}),/GOAL_NOT_FOUND/);
  await recordReviewDiagnostic(c,{goalId:G,planId:R,code:'RESEARCH_QUESTIONS_INVALID',phase:'preflight',beforeFirstReservation:true});
  failAudit=true;await assert.rejects(continueReadReview(input),/synthetic scheduling failure/);failAudit=false;
  assert.equal((await db.query<any>('SELECT state FROM goals')).rows[0].state,'WAITING_EXTERNAL');assert.equal((await db.query('SELECT * FROM outbox_events')).rows.length,0);
  const result=await continueReadReview(input);assert.equal(result.state,'VERIFYING');assert.equal(result.remainingAttempts,2);assert.equal((await db.query("SELECT * FROM audit_log WHERE action='READ_REVIEW_BUDGET'")).rows.length,0);
  await db.query("UPDATE goals SET state='WAITING_EXTERNAL'");await recordReadReviewBudget(c,G,R,{attempts:2,callsUsed:4,retryable:false});
  const before=(await db.query("SELECT * FROM audit_log WHERE action='READ_REVIEW_BUDGET'")).rows;
  await assert.rejects(continueReadReview(input),/BUDGET_EXHAUSTED_REQUIRES_NEW_AUTHORIZATION/);
  assert.deepEqual((await db.query("SELECT * FROM audit_log WHERE action='READ_REVIEW_BUDGET'")).rows,before);
 }finally{pool.connect=original;await db.close();}
});


test('synthetic world-fact scope preserves legacy identity and rejects foreign company keys',async()=>{
 const db=new PGlite();
 const client={async query(sql:string,args?:any[]){const result=await db.query(sql,args);return {...result,rowCount:result.rows.length};}};
 try{
  await db.exec(`CREATE TABLE goals(id UUID,company_scope UUID,current_plan_id UUID,state TEXT);
   CREATE TABLE executions(id UUID,goal_id UUID,plan_id UUID,capability_id TEXT,result JSONB,evidence JSONB,plan_hash TEXT,execution_hash TEXT,actor TEXT);
   CREATE TABLE verifications(id UUID,execution_id UUID,result TEXT,plan_hash TEXT,execution_hash TEXT,verifier TEXT,checked_at TIMESTAMPTZ DEFAULT now());
   CREATE TABLE world_facts(id UUID DEFAULT gen_random_uuid(),entity_type TEXT,entity_id UUID,domain TEXT,attribute TEXT,value JSONB,scope JSONB,status TEXT,source TEXT,source_timestamp TIMESTAMPTZ,confidence NUMERIC,evidence_id UUID,event_seq_ref BIGINT,superseded_at TIMESTAMPTZ);`);
  await db.query("INSERT INTO goals VALUES($1,$2,$2,'COMPLETED')",[G,A]);
  await db.query("INSERT INTO executions VALUES($1,$2,$3,'synthetic-observation','{}','{}','plan-hash','execution-hash','synthetic-executor')",[R,G,A]);
  await db.query("INSERT INTO verifications(id,execution_id,result,plan_hash,execution_hash,verifier) VALUES($1,$2,'VERIFIED','plan-hash','execution-hash','independent-synthetic')",[B,R]);
  await db.query("INSERT INTO world_facts(id,entity_type,entity_id,domain,attribute,value,scope,status,source,source_timestamp,confidence) VALUES($1,'legal_entity',$2,'synthetic','legacy_quantity','1','{}','VERIFIED','legacy-verification',now()-interval '1 day',1)",[B,A]);
  const input={executionId:R,entityType:'legal_entity',entityId:A,domain:'synthetic',attribute:'legacy_quantity',value:2};
  const id=await learnVerifiedWorldFact(input,client);
  const facts=(await db.query<any>('SELECT * FROM world_facts ORDER BY source_timestamp')).rows;
  assert.equal(facts.length,2);assert.ok(facts.find(f=>f.id===B).superseded_at,'Existing empty-scope fact must be superseded');
  assert.deepEqual(facts.find(f=>f.id===id).scope,{});assert.equal(facts.filter(f=>!f.superseded_at).length,1);
  assert.equal(await learnVerifiedWorldFact(input,client),id,'Duplicate lookup must retain the same legacy scope identity');
  for(const scope of [{legal_entity_id:B},{legalEntityId:B},{company_scope:B}])await assert.rejects(learnVerifiedWorldFact({...input,value:3,scope},client),/SCOPE_MISMATCH/);
  assert.equal((await db.query('SELECT * FROM world_facts')).rows.length,2);
 }finally{await db.close();}
});
