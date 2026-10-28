import assert from 'node:assert/strict';
import {test} from 'node:test';
import {randomUUID} from 'node:crypto';
import {createServer,request,type Server} from 'node:http';
import {PGlite} from '@electric-sql/pglite';
import {acceptanceFixture as f,acceptanceHost,acceptanceHeader,assertAcceptanceEnvironment,assertOwnerAcceptancePrivileges,cappedAcceptanceDeadline,createOwnerAcceptance,forwardAcceptanceMutation,seedAcceptanceNotification} from './ownerAcceptance';
import {acceptanceReadback} from './ownerAcceptanceOperator';
import {startCommandCenterHttpServer} from '../../apps/command-center/src/http';
import {pool} from '../../packages/db/src/client';
const entity='22222222-2222-4222-8222-222222222222';
const payload=()=>({...f,notificationId:undefined,approved:true,source_timestamp:new Date().toISOString(),idempotency_key:randomUUID()});
function save(){const x=payload();delete (x as any).notificationId;return x;}
test('exact admission, original monotonic deadline cap and adversarial mutation guards',()=>{
 assert.throws(()=>assertAcceptanceEnvironment({}));
 const env={SAM_RELIABILITY_TEST_ENABLED:'1',SAM_UI_ACCEPTANCE_ENABLED:'1',RENDER_SERVICE_ID:'srv-dbe27ics728c738tuoc0',RENDER_EXTERNAL_HOSTNAME:acceptanceHost};
 assert.doesNotThrow(()=>assertAcceptanceEnvironment(env));
 for(const key of Object.keys(env))assert.throws(()=>assertAcceptanceEnvironment({...env,[key]:'wrong'}));
 assert.equal(cappedAcceptanceDeadline(3600010,10),1800010);assert.equal(cappedAcceptanceDeadline(600010,10),600010);
 let clock=1;const gate=createOwnerAcceptance(100,{now:()=>clock,wallNow:()=>Date.parse('2026-10-28T12:00:00.000Z')});
 const req={method:'POST',url:'/api/owner-memory',headers:{host:acceptanceHost,[acceptanceHeader]:gate.nonce}};
 const body={...save(),source_timestamp:'2026-10-28T12:00:00.000Z'};
 for(const changed of [{...body,approved:false},{...body,legal_entity_id:entity},{...body,context_key:'other'},{...body,source:'other'},{...body,statement:'other'},{...body,idempotency_key:'bad'},{...body,source_timestamp:'2026-10-28T12:00:00Z'}])assert.throws(()=>gate.assertMutation(req,changed));
 for(const changed of [{...req,method:'GET'},{...req,url:'/api/notifications/poll'},{...req,headers:{...req.headers,host:'other'}},{...req,headers:{...req.headers,[acceptanceHeader]:'other'}}])assert.throws(()=>gate.assertMutation(changed,body));
 gate.assertMutation(req,body);gate.assertMutation(req,{...body});
 assert.throws(()=>gate.assertMutation(req,{...body,idempotency_key:randomUUID()}),/REPLAY/);
 gate.assertMutation({...req,url:`/api/notifications/${f.notificationId}/ack`},{});
 assert.throws(()=>gate.assertMutation({...req,url:'/api/notifications/e0283121-947e-47b9-94e7-8be1aae16299/ack'},{}));
 assert.equal(gate.loseSuccessfulResponse(req.url,400,{ok:false}),false);
 assert.equal(gate.loseSuccessfulResponse(req.url,201,{ok:true,data:{id:'synthetic'}}),true);
 assert.equal(gate.loseSuccessfulResponse(req.url,201,{ok:true,data:{id:'synthetic'}}),false);
 clock=100;assert.throws(()=>gate.assertMutation(req,body),/EXPIRED/);
});
test('isolated controls expose only frozen fixture save and exact notification ack while other writes remain denied',async()=>{
 const old={...process.env},original=pool.connect;let connects=0;
 process.env.SAM_COMMAND_CENTER_READ_ONLY='1';process.env.SAM_DEVELOPMENT_SAFE_MODE='1';
 (pool as any).connect=async()=>{connects++;throw Error('database must not be reached');};
 const gate=createOwnerAcceptance(performance.now()+60000);
 const server=await startCommandCenterHttpServer({legalEntityId:entity,host:'127.0.0.1',port:0,bearerToken:'synthetic',isolatedAcceptance:gate});
 try{
  const addr=server.server.address();assert.ok(addr&&typeof addr==='object');const base=`http://127.0.0.1:${addr.port}`;
  const html=await(await fetch(base)).text();
  assert.match(html,/data-isolated-notification=/);assert.match(html,/sam_ui_acceptance_20261028/);
  assert.match(html,/<div class="card form" hidden aria-hidden="true">/);
  assert.match(html,/<button data-owner-mutation hidden class="btn secondary" onclick="pollInternalNotifications/);
  assert.doesNotMatch(html,/<div data-owner-mutation hidden>/);
  for(const path of ['/api/goals','/api/notifications/poll',`/api/notifications/e0283121-947e-47b9-94e7-8be1aae16299/ack`,'/api/owner-memory']){
   const result=await fetch(base+path,{method:'POST',headers:{authorization:'Bearer synthetic'},body:'{}'});assert.ok([400,405].includes(result.status));
  }
  assert.equal(connects,0);
 }finally{await server.close();pool.connect=original;for(const k of Object.keys(process.env))delete process.env[k];Object.assign(process.env,old);}
});
async function fixture(){
 const db=new PGlite(),org='11111111-1111-4111-8111-111111111111',goal='33333333-3333-4333-8333-333333333333';
 await db.exec(`CREATE FUNCTION current_org_id() RETURNS uuid LANGUAGE SQL AS $$ SELECT '${org}'::uuid $$;
 CREATE FUNCTION current_legal_entity_id() RETURNS uuid LANGUAGE SQL AS $$ SELECT '${entity}'::uuid $$;
 CREATE TABLE legal_entities(id uuid PRIMARY KEY,org_id uuid);
 CREATE TABLE goals(id uuid PRIMARY KEY,company_scope uuid);
 CREATE TABLE evaluation_companies(legal_entity_id uuid,purpose text);
 CREATE TABLE evaluation_trials(root_goal_id uuid,legal_entity_id uuid);
 CREATE TABLE memory_records(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),type text,statement text,scope jsonb,source text,confidence float,support_count int,status text,created_at timestamptz DEFAULT now(),last_confirmed_at timestamptz DEFAULT now());
 CREATE TABLE audit_log(id uuid DEFAULT gen_random_uuid(),actor text,action text,entity_type text,entity_id uuid,after_ref jsonb,source text,authority_class text,result text,timestamp timestamptz DEFAULT now());
 CREATE TABLE owner_notifications(id uuid PRIMARY KEY,legal_entity_id uuid,goal_id uuid,dedup_key text UNIQUE,kind text,severity text,title text,body jsonb,status text,created_at timestamptz DEFAULT now());`);
 await db.query('INSERT INTO legal_entities VALUES($1,$2)',[entity,org]);
 await db.query('INSERT INTO goals VALUES($1,$2)',[goal,entity]);
 await db.query("INSERT INTO evaluation_companies VALUES($1,'SYNTHETIC_EVALUATION_ONLY')",[entity]);
 await db.query('INSERT INTO evaluation_trials VALUES($1,$2)',[goal,entity]);
 const client={release(){},async query(sql:string,args:any[]=[]){const r=await db.query(sql,args);return {...r,rowCount:r.rows.length};}};
 return {db,client,goal};
}
function address(server:Server){const a=server.address();assert.ok(a&&typeof a==='object');return a.port;}
test('real CC commit then withheld reply replays exact save/ack once with scoped recall and one durable audit each',async()=>{
 const {db,client,goal}=await fixture(),prior={...process.env},connect=pool.connect;
 process.env.NODE_ENV='development';process.env.SAM_DEVELOPMENT_SAFE_MODE='1';process.env.SAM_COMMAND_CENTER_READ_ONLY='1';
 (pool as any).connect=async()=>client;
 const gate=createOwnerAcceptance(performance.now()+60000),body=save();
 let cc:Awaited<ReturnType<typeof startCommandCenterHttpServer>>|undefined,proxy:Server|undefined;
 try{
  await assertOwnerAcceptancePrivileges(client);
  await client.query('BEGIN');await seedAcceptanceNotification(client,entity,goal);await client.query('COMMIT');
  cc=await startCommandCenterHttpServer({legalEntityId:entity,host:'127.0.0.1',port:0,bearerToken:'synthetic',isolatedAcceptance:gate});
  const port=address(cc.server);
  proxy=createServer((req,res)=>void forwardAcceptanceMutation(req,res,gate,'synthetic',port));
  await new Promise<void>(resolve=>proxy!.listen(0,'127.0.0.1',resolve));
  const base=`http://127.0.0.1:${address(proxy)}`;
  const post=(path:string,x:unknown,extra:Record<string,string>={})=>new Promise<{status:number;json():Promise<any>}>((resolve,reject)=>{
   const req=request(base+path,{method:'POST',headers:{host:acceptanceHost,authorization:'Bearer synthetic','content-type':'application/json',...extra}},res=>{
    const chunks:Buffer[]=[];res.on('data',b=>chunks.push(b));res.on('end',()=>resolve({status:res.statusCode!,json:async()=>JSON.parse(Buffer.concat(chunks).toString('utf8'))}));
   });req.on('error',reject);req.end(JSON.stringify(x));
  });
  assert.equal((await post('/api/owner-memory',{...body,idempotency_key:randomUUID()},{authorization:'Bearer wrong'})).status,401);
  assert.equal((await post('/api/owner-memory',body,{[acceptanceHeader]:'wrong'})).status,403);
  assert.equal((await post('/api/owner-memory',body,{host:'wrong.invalid'})).status,403);
  const first=await post('/api/owner-memory',body);assert.equal(first.status,503);assert.match((await first.json()).error,/committed response intentionally withheld/);
  const saved:any=(await db.query('SELECT * FROM memory_records')).rows[0];assert.ok(saved?.id);
  assert.equal(saved.scope.legal_entity_id,entity);assert.equal(saved.scope.source_timestamp,body.source_timestamp);assert.equal(saved.scope.approved_by,'command-center-owner');
  for(let n=0;n<2;n++){const replay=await post('/api/owner-memory',body);assert.equal(replay.status,201);assert.equal((await replay.json()).data.id,saved.id);}
  assert.equal((await post('/api/owner-memory',{...body,idempotency_key:randomUUID()})).status,403);
  const recall=async(q:string)=>(await(await fetch(`http://127.0.0.1:${port}/api/owner-memory?query=${encodeURIComponent(q)}`,{headers:{authorization:'Bearer synthetic'}})).json()).data.records;
  assert.equal((await recall('Review '+f.context_key)).length,1);assert.deepEqual(await recall('Review unrelated task'),[]);assert.deepEqual(await recall(f.context_key+'extra'),[]);
  const ack=`/api/notifications/${f.notificationId}/ack`;
  assert.equal((await post(ack,{})).status,503);
  const receipts:any=(await db.query("SELECT * FROM audit_log WHERE action='OWNER_NOTIFICATION_READ'")).rows;
  assert.equal(receipts.length,1);
  for(let n=0;n<2;n++){const replay=await post(ack,{});assert.equal(replay.status,200);const result=await replay.json();assert.equal(result.data.receipt.id,receipts[0].id);assert.equal(result.data.pushPerformed,false);}
  for(const path of ['/api/goals','/api/notifications/poll','/api/notifications/e0283121-947e-47b9-94e7-8be1aae16299/ack'])assert.equal((await post(path,{})).status,405);
  await client.query('BEGIN READ ONLY');const report=await acceptanceReadback(client,entity);await client.query('ROLLBACK');
  assert.equal(report.memoryCount,1);assert.equal(report.save_audits,1);assert.equal(report.read_receipts,1);assert.equal(report.notification.status,'UNROUTED');
 }finally{if(proxy)await new Promise<void>(resolve=>proxy!.close(()=>resolve()));await cc?.close();pool.connect=connect;for(const k of Object.keys(process.env))delete process.env[k];Object.assign(process.env,prior);await db.close();}
});
test('notification seed is explicit scoped, deduplicated and refuses conflict; missing privileges fail closed',async()=>{
 const {db,client,goal}=await fixture();
 try{
  await assert.rejects(assertOwnerAcceptancePrivileges({query:async()=>({rows:[{allowed:false}]})}),/PRIVILEGES/);
  await assert.rejects(seedAcceptanceNotification(client,entity,randomUUID()),/SYNTHETIC_GOAL/);
  await client.query('BEGIN');await seedAcceptanceNotification(client,entity,goal);await client.query('COMMIT');
  await client.query('BEGIN');await seedAcceptanceNotification(client,entity,goal);await client.query('COMMIT');
  assert.equal((await db.query('SELECT * FROM owner_notifications')).rows.length,1);
  assert.equal((await db.query('SELECT * FROM memory_records')).rows.length,0);
  await db.query("UPDATE owner_notifications SET status='PENDING'");
  await client.query('BEGIN');await assert.rejects(seedAcceptanceNotification(client,entity,goal),/CONFLICT/);await client.query('ROLLBACK');
  assert.equal((await db.query('SELECT * FROM audit_log')).rows.length,0);
 }finally{await db.close();}
});
test('acceptance readiness refuses SELECT/INSERT-only memory role before owner save can need FOR UPDATE',async()=>{
 const {db,client}=await fixture();
 try{
  await db.exec(`CREATE ROLE synthetic_acceptance_without_update;
   GRANT SELECT ON memory_records,audit_log,owner_notifications,goals,evaluation_trials,evaluation_companies TO synthetic_acceptance_without_update;
   GRANT INSERT ON memory_records,audit_log,owner_notifications TO synthetic_acceptance_without_update;
   SET ROLE synthetic_acceptance_without_update;`);
  await assert.rejects(assertOwnerAcceptancePrivileges(client),/PERSISTENT_UI_ACCEPTANCE_PRIVILEGES_REQUIRED/);
  await db.exec('RESET ROLE; GRANT UPDATE ON memory_records TO synthetic_acceptance_without_update; SET ROLE synthetic_acceptance_without_update;');
  await assertOwnerAcceptancePrivileges(client);
 }finally{await db.exec('RESET ROLE');await db.close();}
});
test('optional isolated exception refuses unsafe configuration before listening',async()=>{
 const prior={...process.env},gate=createOwnerAcceptance(performance.now()+60000);
 try{
  for(const env of [{NODE_ENV:'production',SAM_DEVELOPMENT_SAFE_MODE:'1',SAM_COMMAND_CENTER_READ_ONLY:'1'},
   {NODE_ENV:'development',SAM_DEVELOPMENT_SAFE_MODE:'0',SAM_COMMAND_CENTER_READ_ONLY:'1'},
   {NODE_ENV:'development',SAM_DEVELOPMENT_SAFE_MODE:'1',SAM_COMMAND_CENTER_READ_ONLY:'0'}]){
   Object.assign(process.env,env);await assert.rejects(startCommandCenterHttpServer({legalEntityId:entity,host:'127.0.0.1',port:0,bearerToken:'synthetic',isolatedAcceptance:gate}),/SAFE_READ_ONLY/);
  }
 }finally{for(const k of Object.keys(process.env))delete process.env[k];Object.assign(process.env,prior);}
});
