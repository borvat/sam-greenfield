/** Synthetic-only continuity checks; no provider or hosted database access. */
import assert from 'node:assert/strict';
import {test} from 'node:test';
import {Script,createContext} from 'node:vm';
import {PGlite} from '@electric-sql/pglite';
import {pool} from '../../packages/db/src/client';
import * as learning from '../../apps/brain/src/learning';
import * as memory from '../../apps/brain/src/memory';
import * as notifications from '../../apps/notifications/src/center';
import {createReliabilityReadTools} from '../../apps/chatgpt-tools/src/reliabilityReadTools';
const A='11111111-1111-4111-8111-111111111111',B='22222222-2222-4222-8222-222222222222',O='33333333-3333-4333-8333-333333333333',N='44444444-4444-4444-8444-444444444444';
async function fixture(){
 const db=new PGlite();
 await db.exec(`CREATE FUNCTION current_org_id() RETURNS UUID LANGUAGE SQL AS $$ SELECT current_setting('app.current_org_id')::uuid $$;
 CREATE FUNCTION current_legal_entity_id() RETURNS UUID LANGUAGE SQL AS $$ SELECT current_setting('app.current_legal_entity_id')::uuid $$;
 CREATE TABLE legal_entities(id UUID,org_id UUID);
 CREATE TABLE memory_records(id UUID DEFAULT gen_random_uuid(),type TEXT,statement TEXT,scope JSONB,source TEXT,confidence FLOAT,support_count INT DEFAULT 1,status TEXT,created_at TIMESTAMPTZ DEFAULT now(),last_confirmed_at TIMESTAMPTZ DEFAULT now());
 CREATE TABLE audit_log(id UUID DEFAULT gen_random_uuid(),actor TEXT,goal_id UUID,action TEXT,entity_type TEXT,entity_id UUID,after_ref JSONB,source TEXT,authority_class TEXT,result TEXT,timestamp TIMESTAMPTZ DEFAULT now());
 CREATE TABLE owner_notifications(id UUID,legal_entity_id UUID,goal_id UUID,status TEXT,body JSONB,created_at TIMESTAMPTZ DEFAULT now());`);
 await db.query('INSERT INTO legal_entities VALUES($1,$2),($3,$2)',[A,O,B]);
 await db.query("SELECT set_config('app.current_org_id',$1,false),set_config('app.current_legal_entity_id',$2,false)",[O,A]);
 const client={release(){},async query(sql:string,args?:any[]){const r=await db.query(sql,args);return {...r,rowCount:r.rows.length}}};
 return {db,client};
}
test('trusted owner decisions are idempotent, attributed, approved and relevant to one company/task',async()=>{
 assert.equal(typeof (learning as any).saveApprovedOwnerDecision,'function','owner write wrapper must exist');
 const {db,client}=await fixture();
 try{
  const context={actor:'synthetic-owner',systemOwner:true,legalEntityId:A};
  const input={statement:'Synthetic procurement requires two quotations.',contextKey:'procurement',source:'synthetic-owner-session',sourceTimestamp:'2026-10-28T10:00:00.000Z',idempotencyKey:'synthetic-decision-1',approved:true};
  const save=(learning as any).saveApprovedOwnerDecision;
  const row=await save(client,context,input);assert.equal(row.status,'APPROVED_RULE');
  assert.equal((await save(client,context,input)).id,row.id);
  assert.equal((await db.query('SELECT * FROM memory_records')).rows.length,1);
  await assert.rejects(save(client,context,{...input,statement:'changed'}),/IDEMPOTENCY_CONFLICT/);
  await assert.rejects(save(client,{...context,systemOwner:false},input),/AUTHORIZED/);
  await assert.rejects(save(client,{...context,legalEntityId:B},input),/AUTHORIZED/);
  await assert.rejects(save(client,context,{...input,approved:false}),/APPROVAL_REQUIRED/);
  await db.query("INSERT INTO memory_records(type,statement,scope,source,status) VALUES('OWNER_DECISION','Synthetic unapproved', $1,'synthetic','OBSERVED'),('OWNER_DECISION','Synthetic foreign',$2,'synthetic','APPROVED_RULE')",[{legal_entity_id:A,context_key:'procurement'},{legal_entity_id:B,context_key:'procurement'}]);
  const recall=(memory as any).recallApprovedOwnerDecisions;
  const records=await recall(client,A,'Prepare procurement quotations');assert.equal(records.length,1);
  assert.equal(records[0].scope.approved_by,context.actor);assert.equal(records[0].scope.source_timestamp,input.sourceTimestamp);assert.equal(records[0].source,input.source);
  assert.deepEqual(await recall(client,A,'Review sales'),[]);
  assert.deepEqual(await recall(client,B,'Prepare procurement quotations'),[],'context must match the fixed principal');
  await db.query("SELECT set_config('app.current_org_id',$1,false)",[B]);assert.deepEqual(await recall(client,A,'Prepare procurement quotations'),[],'wrong organization must not reveal owner decisions');
  await db.query("SELECT set_config('app.current_org_id',$1,false)",[O]);
  await db.query("SELECT set_config('app.current_legal_entity_id',$1,false)",[B]);
  await save(client,{...context,legalEntityId:B},{...input,statement:'Synthetic company B procurement decision'});
  const companyB=await recall(client,B,'Prepare procurement quotations');assert.equal(companyB.length,1);assert.equal(companyB[0].scope.legal_entity_id,B);assert.match(companyB[0].statement,/company B/);
  assert.deepEqual(await recall(client,A,'Prepare procurement quotations'),[]);
 }finally{await db.close()}
});
test('internal read receipts are append-only, per actor/company, idempotent and never delivery claims',async()=>{
 assert.equal(typeof (notifications as any).acknowledgeOwnerNotification,'function','receipt path must exist');
 const {db,client}=await fixture();
 try{
  await db.query("INSERT INTO owner_notifications VALUES($1,$2,$3,'UNROUTED','{}',now())",[N,A,O]);
  const context={actor:'synthetic-owner',systemOwner:true,legalEntityId:A};
  const ack=(notifications as any).acknowledgeOwnerNotification;
  const first=await ack(client,context,N),second=await ack(client,context,N);
  assert.deepEqual(second,first);assert.equal(first.pushPerformed,false);assert.equal(first.delivery,'POLLING_ONLY');
  assert.equal((await db.query('SELECT * FROM audit_log')).rows.length,1);
  assert.equal((await db.query<any>('SELECT status FROM owner_notifications')).rows[0].status,'UNROUTED');
  await assert.rejects(ack(client,{...context,legalEntityId:B},N),/AUTHORIZED/);
  assert.equal(await ack(client,context,B),null);
  const list=await (notifications as any).listOwnerNotifications(client,context,50);
  assert.equal(list.records.length,1);assert.equal(list.records[0].readReceipt.id,first.receipt.id);
  const other=await (notifications as any).listOwnerNotifications(client,{...context,actor:'another-owner'},50);assert.equal(other.records[0].readReceipt,null);
 }finally{await db.close()}
});
test('connected continuity tools deny anonymous/cross-company writes and preserve read-only annotations',async()=>{
 const tools=createReliabilityReadTools();
 const save=tools.find(t=>t.definition.name==='sam_save_owner_decision');assert.ok(save,'owner decision tool must be discoverable');
 const ack=tools.find(t=>t.definition.name==='sam_acknowledge_notification');assert.ok(ack);
 assert.equal(save.definition.risk,'GREEN');assert.equal(ack.definition.risk,'GREEN');
 const {db,client}=await fixture(),old=pool.connect;(pool as any).connect=async()=>client;
 try{
  const args={statement:'Synthetic procurement policy',context_key:'procurement',source:'synthetic',source_timestamp:'2026-10-28T10:00:00.000Z',idempotency_key:'synthetic-1',approved:true};
  assert.equal((await save.handler(args,{actor:'anonymous',systemOwner:false})).ok,false);
  assert.equal((await save.handler(args,{actor:'synthetic-owner',systemOwner:true,legalEntityId:B})).ok,false);
  assert.equal((await save.handler({...args,legal_entity_id:A},{actor:'synthetic-owner',systemOwner:true,legalEntityId:A})).ok,false);
  assert.equal((await save.handler(args,{actor:'synthetic-owner',systemOwner:true,legalEntityId:A})).ok,true);
 }finally{pool.connect=old;await db.close()}
});
test('explicit company activation projects only later scoped state events once, with broad flags absent',async()=>{
 assert.equal(typeof (notifications as any).pollScopedOwnerNotifications,'function','scoped poll must exist');
 const {db,client}=await fixture();try{
  await db.exec(`ALTER TABLE owner_notifications ADD COLUMN source_event_id UUID;ALTER TABLE owner_notifications ADD COLUMN dedup_key TEXT UNIQUE;ALTER TABLE owner_notifications ADD COLUMN kind TEXT;ALTER TABLE owner_notifications ADD COLUMN severity TEXT;ALTER TABLE owner_notifications ADD COLUMN title TEXT;ALTER TABLE owner_notifications ADD COLUMN last_error_code TEXT;ALTER TABLE owner_notifications ADD COLUMN updated_at TIMESTAMPTZ DEFAULT now();ALTER TABLE owner_notifications ALTER COLUMN id SET DEFAULT gen_random_uuid();ALTER TABLE owner_notifications ALTER COLUMN status SET DEFAULT 'UNROUTED';
   CREATE TABLE goals(id UUID,company_scope UUID,state TEXT,domain TEXT,business_id TEXT,current_plan_id UUID,replan_attempts INT);
   CREATE TABLE outbox_events(id UUID DEFAULT gen_random_uuid(),aggregate_id UUID,aggregate_type TEXT,event_type TEXT,payload JSONB,created_at TIMESTAMPTZ DEFAULT now());
   CREATE TABLE notification_event_receipts(event_id UUID UNIQUE,notification_id UUID,disposition TEXT);
   CREATE TABLE executions(id UUID,goal_id UUID,started_at TIMESTAMPTZ);CREATE TABLE verifications(id UUID,execution_id UUID,result TEXT,checked_at TIMESTAMPTZ);
   CREATE TABLE work_queue(id UUID,goal_id UUID,status TEXT,capability_id TEXT,wake_reason TEXT,attempt INT,queued_at TIMESTAMPTZ);`);
  await db.query("INSERT INTO goals VALUES($1,$2,'FAILED','synthetic','SYNTHETIC-A',NULL,0),($3,$4,'FAILED','synthetic','SYNTHETIC-B',NULL,0)",[O,A,B,B]);
  await db.query("INSERT INTO outbox_events(aggregate_id,aggregate_type,event_type,payload,created_at) VALUES($1,'goal','GOAL_STATE_CHANGED','{\"to\":\"FAILED\"}',now()-interval '1 day')",[O]);
  const context={actor:'synthetic-owner',systemOwner:true,legalEntityId:A},poll=(notifications as any).pollScopedOwnerNotifications;
  const first=await poll(client,context);assert.equal(first.records.length,0);assert.equal(first.enabled,true);
  await db.query("INSERT INTO outbox_events(aggregate_id,aggregate_type,event_type,payload) VALUES($1,'goal','GOAL_STATE_CHANGED','{\"to\":\"FAILED\"}'),($2,'goal','GOAL_STATE_CHANGED','{\"to\":\"FAILED\"}')",[O,B]);
  const flag=process.env.SAM_OWNER_CONTINUITY_ENABLED;process.env.SAM_OWNER_CONTINUITY_ENABLED='true';
  try{const tick=await notifications.runScopedOwnerNotificationTick({connect:async()=>client});assert.equal(tick.created,1);assert.equal((await notifications.runScopedOwnerNotificationTick({connect:async()=>client})).created,0);}finally{if(flag===undefined)delete process.env.SAM_OWNER_CONTINUITY_ENABLED;else process.env.SAM_OWNER_CONTINUITY_ENABLED=flag;}
  const second=await poll(client,context),third=await poll(client,context);assert.equal(second.records.length,1);assert.equal(third.records.length,1);assert.equal(second.records[0].legal_entity_id,A);assert.equal(second.pushPerformed,false);
  assert.equal((await db.query("SELECT * FROM audit_log WHERE action='OWNER_CONTINUITY_ENABLED'")).rows.length,1);
  assert.equal((await db.query('SELECT * FROM notification_event_receipts')).rows.length,1);
  const before=(await db.query('SELECT * FROM outbox_events ORDER BY id')).rows;await poll(client,context);assert.deepEqual((await db.query('SELECT * FROM outbox_events ORDER BY id')).rows,before);
 }finally{await db.close()}
});
test('Command Center continuity endpoints require authentication and render report approval/delivery limits as text',async()=>{
 const {startCommandCenterHttpServer}=await import('../../apps/command-center/src/http');
 const {commandCenterHtml}=await import('../../apps/command-center/src/ui');
 const server=await startCommandCenterHttpServer({legalEntityId:A,port:0,host:'127.0.0.1',bearerToken:'synthetic-token'});
 try{
  const address=server.server.address() as any,origin='http://127.0.0.1:'+address.port;
  for(const [method,path] of [['GET','/api/owner-memory?query=procurement'],['POST','/api/owner-memory'],['GET','/api/notifications'],['POST','/api/notifications/poll'],['POST','/api/notifications/'+N+'/ack']]){
   assert.equal((await fetch(origin+path,{method})).status,401);
  }
  assert.match(commandCenterHtml,/Enable and poll internal notifications/);
  assert.match(commandCenterHtml,/Save approved owner decision/);
  assert.match(commandCenterHtml,/HISTORICAL_NARRATIVE_NOT_SEMANTICALLY_VALIDATED/);
 }finally{await server.close()}
});
test('cached timeline reads include scoped continuity and external report meanings without changing saved reports',async()=>{
 const {createCoreReadTools}=await import('../../apps/chatgpt-tools/src/coreReadTools');
 const {db,client}=await fixture(),original=pool.connect,originalQuery=pool.query;(pool as any).connect=async()=>client;(pool as any).query=(sql:string,args?:any[])=>client.query(sql,args);
 try{
  await db.exec(`CREATE TABLE goals(id UUID,company_scope UUID,objective TEXT);
   CREATE TABLE plans(goal_id UUID,version INT);CREATE TABLE work_queue(goal_id UUID,queued_at TIMESTAMPTZ,id UUID);
   CREATE TABLE executions(id UUID,goal_id UUID,started_at TIMESTAMPTZ);CREATE TABLE verifications(id UUID,execution_id UUID,checked_at TIMESTAMPTZ);
   CREATE TABLE goal_read_reviews(id UUID,goal_id UUID,round INT,decision JSONB,report_hash TEXT);`);
  await db.query('INSERT INTO goals VALUES($1,$2,$3)',[O,A,'Prepare procurement quotations']);
  const decision={status:'complete',summary:'Historical EUR/tax claim',limitations:['Source period unknown']};
  await db.query('INSERT INTO goal_read_reviews VALUES($1,$2,1,$3,$4)',[N,O,decision,'original-hash']);
  await (learning as any).saveApprovedOwnerDecision(client,{actor:'synthetic-owner',systemOwner:true,legalEntityId:A},{statement:'Synthetic procurement approval',contextKey:'procurement',source:'synthetic',sourceTimestamp:'2026-10-28T10:00:00.000Z',idempotencyKey:'cached-1',approved:true});
  const timeline=createCoreReadTools().find(t=>t.definition.name==='sam_get_goal_timeline')!;
  const result=await timeline.handler({goal_id:O},{actor:'synthetic-owner',systemOwner:true,legalEntityId:A});assert.equal(result.ok,true);
  const data=result.data as any;assert.ok(data.continuity,'cached timeline must carry continuity sidecar');assert.equal(data.continuity.ownerDecisions.records.length,1);
  assert.equal(data.reports[0].report_hash,'original-hash');assert.deepEqual(data.reports[0].decision,decision);assert.match(data.reportInterpretations[0].semanticValidation,/HISTORICAL/);assert.match(data.reportInterpretations[0].unsupportedClaims,/currency.*tax/);
  await db.exec('DROP TABLE goal_read_reviews;DROP TABLE owner_notifications');const optional=(await timeline.handler({goal_id:O},{actor:'synthetic-owner',systemOwner:true,legalEntityId:A})).data as any;assert.deepEqual(optional.reports,[]);assert.equal(optional.reportsAvailability,'MISSING_TABLE');assert.equal(optional.continuity.notifications.availability,'MISSING_TABLE');
 }finally{pool.connect=original;pool.query=originalQuery;await db.close()}
});
test('read-only Command Center rejects new internal mutations and release MCP remains read-only',async()=>{
 const {startCommandCenterHttpServer}=await import('../../apps/command-center/src/http');const {createReleaseReadSurface}=await import('../../apps/mcp/src/releaseReadSurface');
 const flag=process.env.SAM_COMMAND_CENTER_READ_ONLY;process.env.SAM_COMMAND_CENTER_READ_ONLY='1';
 const server=await startCommandCenterHttpServer({legalEntityId:A,port:0,host:'127.0.0.1',bearerToken:'synthetic-token'});
 try{
  const address=server.server.address() as any,origin='http://127.0.0.1:'+address.port;
  for(const path of ['/api/owner-memory','/api/notifications/poll','/api/notifications/'+N+'/ack'])assert.equal((await fetch(origin+path,{method:'POST',headers:{authorization:'Bearer synthetic-token','content-type':'application/json'},body:'{}'})).status,405);
  const html=await (await fetch(origin)).text();assert.match(html,/data-owner-mutation hidden/);
  assert.ok(createReleaseReadSurface().definitions().every(t=>t.risk==='READ'));
 }finally{await server.close();if(flag===undefined)delete process.env.SAM_COMMAND_CENTER_READ_ONLY;else process.env.SAM_COMMAND_CENTER_READ_ONLY=flag}
});
test('scoped state transitions suppress obsolete approval/progress only in the authorized company',async()=>{
 const {db,client}=await fixture();try{
  await db.exec(`ALTER TABLE owner_notifications ADD COLUMN source_event_id UUID;ALTER TABLE owner_notifications ADD COLUMN dedup_key TEXT UNIQUE;ALTER TABLE owner_notifications ADD COLUMN kind TEXT;ALTER TABLE owner_notifications ADD COLUMN severity TEXT;ALTER TABLE owner_notifications ADD COLUMN title TEXT;ALTER TABLE owner_notifications ADD COLUMN last_error_code TEXT;ALTER TABLE owner_notifications ADD COLUMN updated_at TIMESTAMPTZ DEFAULT now();ALTER TABLE owner_notifications ALTER COLUMN id SET DEFAULT gen_random_uuid();ALTER TABLE owner_notifications ALTER COLUMN status SET DEFAULT 'UNROUTED';
   CREATE TABLE goals(id UUID,company_scope UUID,state TEXT,domain TEXT,business_id TEXT,current_plan_id UUID,replan_attempts INT);
   CREATE TABLE outbox_events(id UUID DEFAULT gen_random_uuid(),aggregate_id UUID,aggregate_type TEXT,event_type TEXT,payload JSONB,created_at TIMESTAMPTZ DEFAULT now());
   CREATE TABLE notification_event_receipts(event_id UUID UNIQUE,notification_id UUID,disposition TEXT);
   CREATE TABLE executions(id UUID,goal_id UUID,started_at TIMESTAMPTZ);CREATE TABLE verifications(id UUID,execution_id UUID,result TEXT,checked_at TIMESTAMPTZ);
   CREATE TABLE work_queue(id UUID,goal_id UUID,status TEXT,capability_id TEXT,wake_reason TEXT,attempt INT,queued_at TIMESTAMPTZ);
   CREATE TABLE approvals(id UUID,goal_id UUID,legal_entity_id UUID,capability_id TEXT,expiry_at TIMESTAMPTZ,status TEXT,created_at TIMESTAMPTZ);`);
  await db.query("INSERT INTO goals VALUES($1,$2,'WAITING_OWNER','synthetic','SYNTHETIC-A',NULL,0),($3,$4,'FAILED','synthetic','SYNTHETIC-B',NULL,0)",[O,A,B,B]);
  const context={actor:'synthetic-owner',systemOwner:true,legalEntityId:A};
  await notifications.pollScopedOwnerNotifications(client,context);
  await db.query("INSERT INTO outbox_events(aggregate_id,aggregate_type,event_type,payload) VALUES($1,'goal','GOAL_STATE_CHANGED','{\"to\":\"WAITING_OWNER\"}')",[O]);
  const first=await notifications.pollScopedOwnerNotifications(client,context);assert.equal(first.records.length,1);assert.equal(first.records[0].kind,'APPROVAL');
  const approval=first.records[0];
  await db.query(`INSERT INTO owner_notifications(legal_entity_id,goal_id,dedup_key,kind,body) VALUES
   ($1,$2,'synthetic-obsolete-progress','PROGRESS','{"state":"WAITING_OWNER","requiredAction":"NONE"}'),
   ($1,$2,'synthetic-observation','PROGRESS','{"state":"WAITING_OWNER","requiredAction":"REVIEW_OBSERVATION"}'),
   ($3,$3,'synthetic-foreign-approval','APPROVAL','{"state":"WAITING_OWNER","requiredAction":"REVIEW_OWNER_DECISION"}')`,[A,O,B]);
  await db.query("UPDATE goals SET state='EXECUTING' WHERE id=$1",[O]);
  const flag=process.env.SAM_OWNER_CONTINUITY_ENABLED;process.env.SAM_OWNER_CONTINUITY_ENABLED='true';
  try{const tick=await notifications.runScopedOwnerNotificationTick({connect:async()=>client});assert.equal(tick.enabled,true);assert.equal(tick.created,0);}finally{if(flag===undefined)delete process.env.SAM_OWNER_CONTINUITY_ENABLED;else process.env.SAM_OWNER_CONTINUITY_ENABLED=flag;}
  const rows=(await db.query<any>('SELECT * FROM owner_notifications')).rows;
  assert.equal(rows.find(r=>r.id===approval.id).status,'SUPPRESSED');assert.deepEqual(rows.find(r=>r.id===approval.id).body,approval.body,'historical evidence remains unchanged');
  assert.equal(rows.find(r=>r.dedup_key==='synthetic-obsolete-progress').status,'SUPPRESSED');
  assert.equal(rows.find(r=>r.dedup_key==='synthetic-observation').status,'UNROUTED');
  assert.equal(rows.find(r=>r.dedup_key==='synthetic-foreign-approval').status,'UNROUTED');
  const listed=await notifications.listOwnerNotifications(client,context);assert.equal(listed.records.length,1);assert.equal(listed.records[0].dedup_key,'synthetic-observation');
  const polled=await notifications.pollScopedOwnerNotifications(client,context);assert.equal(polled.records.length,1);assert.equal(polled.created,0);
 }finally{await db.close()}
});

test('notification UI hides suppressed notices rather than presenting their obsolete required actions',async()=>{
 const {commandCenterHtml}=await import('../../apps/command-center/src/ui');
 const nodes=new Map<string,any>(),node=(id:string)=>{if(!nodes.has(id))nodes.set(id,{textContent:'',hidden:false,children:[] as any[],appendChild(x:any){this.children.push(x)}});return nodes.get(id)};
 const context=createContext({sessionStorage:{getItem:()=>''},setInterval(){},document:{getElementById:node,createElement:()=>({textContent:'',children:[] as any[],appendChild(x:any){this.children.push(x)}}),body:{dataset:{}}}});
 new Script(commandCenterHtml.match(/<script>([\s\S]*?)<\/script>/)![1]).runInContext(context);
 new Script(`renderInternalNotifications({records:[{id:'synthetic-stale',status:'SUPPRESSED',body:{requiredAction:'REVIEW_OWNER_DECISION'}}]})`).runInContext(context);
 assert.equal(node('notifications-results').children.length,1,'only the empty-list meaning should remain');
 assert.match(node('notifications-results').children[0].textContent,/No visible notifications/);
});
