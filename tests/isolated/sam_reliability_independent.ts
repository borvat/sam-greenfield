/** Independent synthetic verification only; no hosted/native/provider access. */
import assert from 'node:assert/strict';
import {test} from 'node:test';
import {Script,createContext} from 'node:vm';
import {PGlite} from '@electric-sql/pglite';
import {pool} from '../../packages/db/src/client';
import {commandCenterHtml} from '../../apps/command-center/src/ui';
import {createReliabilityReadTools} from '../../apps/chatgpt-tools/src/reliabilityReadTools';
import {inspectPersistentBinding,validatePersistentBinding} from '../../deploy/reliability-test/persistentBinding';
import {applicationEnvironment} from '../../deploy/reliability-test/entry';

const A='11111111-1111-4111-8111-111111111111',B='22222222-2222-4222-8222-222222222222',O='33333333-3333-4333-8333-333333333333';
function binding(){
 const x={schema:'sam_eval_independent',role:'sam_eval_runtime_independent',org:O,entity:A,connectionString:''};
 const u=new URL('postgres://'+x.role+':synthetic@db.invalid/synthetic');
 u.searchParams.set('options',`-c search_path=${x.schema},pg_catalog,public -c app.current_org_id=${O} -c app.current_legal_entity_id=${A}`);
 x.connectionString=u.href;return x;
}

test('independent UI: emitted embedded JavaScript parses and renders original report/wait fields as text',async()=>{
 const source=commandCenterHtml.match(/<script>([\s\S]*?)<\/script>/)![1];
 const script=new Script(source);
 const nodes=new Map<string,any>();
 const node=(id:string)=>{if(!nodes.has(id))nodes.set(id,{textContent:'',hidden:false,children:[],appendChild(x:any){this.children.push(x)}});return nodes.get(id)};
 const report={id:'synthetic-report',report_hash:'original-hash',decision:{summary:'<img src=x onerror=alert(1)>',report:{analysisCoverage:{sourceProducts:43,sentProducts:30},limitations:['unknown tax']}}};
 const context=createContext({sessionStorage:{getItem:()=>'',removeItem(){},setItem(){}},setInterval(){},document:{getElementById:node,createElement:()=>({textContent:''}),body:{dataset:{}}},fetch:async()=>({status:200,ok:true,json:async()=>({data:{reports:[report],audit:[{action:'READ_REVIEW_DIAGNOSTIC',after_ref:{code:'REVIEW_RUNTIME_FAILED'}}]}})})});
 script.runInContext(context);await new Script("timeline('synthetic-goal')").runInContext(context);
 assert.equal(node('report-result').children.length,2);
 const displayed=JSON.parse(node('report-result').children[0].textContent);
 assert.equal(displayed.reportId,report.id);assert.equal(displayed.summary,report.decision.summary);assert.equal(displayed.coverage.sourceProducts,43);assert.equal(displayed.coverage.sentProducts,30);
 assert.deepEqual(displayed.limitations,['unknown tax']);assert.equal(JSON.parse(node('report-result').children[1].textContent).waitDiagnostics.code,'REVIEW_RUNTIME_FAILED');
 assert.equal(node('report-result').children[0].innerHTML,undefined);
});

test('independent staging: duplicate connection options and TLS settings must be rejected before connection',()=>{
 const b=binding();assert.deepEqual(validatePersistentBinding(b),b);
 for(const suffix of ['&options=-c%20search_path=public','&sslmode=require&sslmode=disable'])assert.throws(()=>validatePersistentBinding({...b,connectionString:b.connectionString+suffix}),/PERSISTENT_BINDING_INVALID/);
});

test('independent staging: principal/profile/public access negatives always roll back read-only admission',async()=>{
 const b=binding();
 const good={schema:b.schema,role:b.role,org:b.org,entity:b.entity,read_only:'on',rolsuper:false,rolcreatedb:false,rolcreaterole:false,rolbypassrls:false,rolinherit:false,rolreplication:false,can_create_schema:false,valid:true,remaining_ms:600000};
 const checks={integration:async()=>({org:O,entity:A}),evaluation:async()=>({org:O,entity:A}),shared:async()=>{}};
 async function run(change:Record<string,unknown>={},publicCount=0,tenant=A,profiles=checks,enrolled:string|null=A){
  const sql:string[]=[];
  const c={query:async(s:string)=>{sql.push(s);if(s.includes('FROM pg_roles'))return {rows:[{...good,...change}]};if(s.includes('FROM legal_entities'))return {rows:[{id:tenant,org_id:O}]};if(s.includes('FROM evaluation_companies'))return {rows:enrolled?[{legal_entity_id:enrolled}]:[]};if(s.includes('FROM pg_class'))return {rows:[{n:publicCount}]};return {rows:[]}}};
  try{return await inspectPersistentBinding(c,b,profiles);}finally{assert.equal(sql[0],'BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY');assert.equal(sql.at(-1),'ROLLBACK');assert.ok(sql.every(s=>!/^\s*(CREATE|ALTER|GRANT|INSERT|UPDATE|DELETE)/i.test(s)));}
 }
 const accepted=await run();assert.equal(accepted.containerReplacementValidated,false);assert.equal(accepted.modelCalls,0);
 for(const change of [{role:'postgres'},{entity:B},{org:B},{rolsuper:true},{rolbypassrls:true},{rolinherit:true},{can_create_schema:true},{valid:false},{remaining_ms:300000},{remaining_ms:3600001},{read_only:'off'}])await assert.rejects(run(change),/PERSISTENT_PRINCIPAL_DENIED/);
 await assert.rejects(run({},1),/PERSISTENT_PUBLIC_ACCESS_DENIED/);await assert.rejects(run({},0,B),/PERSISTENT_TENANT_DENIED/);
 await assert.rejects(run({},0,A,{...checks,shared:async()=>{throw Error('SHARED_COORDINATOR_PROFILE_REQUIRED')}}),/SHARED_COORDINATOR_PROFILE_REQUIRED/);
 for(const enrolled of [null,B])await assert.rejects(run({},0,A,checks,enrolled),/PERSISTENT_SYNTHETIC_ENROLLMENT_REQUIRED/);
});

test('independent staging: app environment strips every unspecified provider and autonomy switch',()=>{
 const b=binding();const env=applicationEnvironment({PATH:'/usr/bin',SAM_AUTONOMY_ENABLED:'1',SAM_KNOWLEDGE_ENABLED:'true',SAM_NOTIFICATIONS_ENABLED:'true',SAM_PLANNER_PROVIDER:'paid',OPENAI_API_KEY:'synthetic',SAM_DEFAULT_LEGAL_ENTITY_ID:B,RENDER_GIT_COMMIT:'a'.repeat(40)},b);
 assert.equal(env.DATABASE_URL,b.connectionString);assert.equal(env.SAM_COMMAND_CENTER_LEGAL_ENTITY_ID,A);
 for(const key of ['SAM_AUTONOMY_ENABLED','SAM_KNOWLEDGE_ENABLED','SAM_NOTIFICATIONS_ENABLED','SAM_PLANNER_PROVIDER','OPENAI_API_KEY','SAM_DEFAULT_LEGAL_ENTITY_ID'])assert.equal((env as any)[key],undefined,key);
});

test('independent PGlite: notification polling scopes records and rejects tenant override without source/model calls',async()=>{
 const db=new PGlite(),connect=pool.connect;
 const previous={SAM_INTEGRATION_ENABLED:process.env.SAM_INTEGRATION_ENABLED,SAM_NOTIFICATIONS_ENABLED:process.env.SAM_NOTIFICATIONS_ENABLED};
 const c={release(){},query:async(sql:string,args?:any[])=>{const r=await db.query(sql,args);return {...r,rowCount:r.rows.length}}};
 (pool as any).connect=async()=>c;
 try{
  process.env.SAM_INTEGRATION_ENABLED='1';process.env.SAM_NOTIFICATIONS_ENABLED='true';
  await db.exec(`CREATE TABLE legal_entities(id UUID,org_id UUID);CREATE TABLE owner_notifications(id UUID,legal_entity_id UUID,status TEXT,body JSONB,created_at TIMESTAMPTZ DEFAULT now());CREATE FUNCTION current_org_id() RETURNS UUID LANGUAGE SQL AS $$ SELECT current_setting('app.current_org_id')::uuid $$;CREATE FUNCTION current_legal_entity_id() RETURNS UUID LANGUAGE SQL AS $$ SELECT current_setting('app.current_legal_entity_id')::uuid $$;`);
  await db.query('INSERT INTO legal_entities VALUES($1,$2),($3,$2)',[A,O,B]);await db.query("SELECT set_config('app.current_org_id',$1,false),set_config('app.current_legal_entity_id',$2,false)",[O,A]);
  await db.query("INSERT INTO owner_notifications(id,legal_entity_id,status,body) VALUES($1,$1,'UNROUTED',$3),($2,$2,'UNROUTED',$4)",[A,B,{summary:'synthetic A'},{summary:'synthetic B'}]);
  const t=createReliabilityReadTools().find(x=>x.definition.name==='sam_list_notifications')!,ctx={actor:'independent-owner',systemOwner:true,legalEntityId:A};
  const result=(await t.handler({},ctx)).data as any;assert.equal(result.records.length,1);assert.equal(result.records[0].legal_entity_id,A);assert.equal(result.records[0].status,'UNROUTED');assert.equal(result.pushPerformed,false);assert.match(result.unroutedMeaning,/not sent/);
  assert.equal((await t.handler({legal_entity_id:B},ctx)).ok,false);assert.equal((await t.handler({},{...ctx,legalEntityId:B})).ok,false);assert.equal((await t.handler({limit:201},ctx)).ok,false);assert.equal((await t.handler({limit:'1'},ctx)).ok,false);
  await db.exec('CREATE ROLE independent_notification_reader; GRANT SELECT ON legal_entities TO independent_notification_reader; SET ROLE independent_notification_reader');assert.equal(((await t.handler({},ctx)).data as any).availability,'PERMISSION_UNAVAILABLE');
 }finally{pool.connect=connect;for(const [k,v]of Object.entries(previous)){if(v===undefined)delete process.env[k];else process.env[k]=v;}await db.close();}
});

test('independent PGlite: partial retry preserves consumed budget and refuses unverified, unfinished and already-reported plans',async()=>{
 const {continueReadReview}=await import('../../apps/production/src/readReviewContinuation');
 const {recordReadReviewBudget}=await import('../../apps/kernel/src/readReviewBudget');
 const db=new PGlite(),connect=pool.connect,G='44444444-4444-4444-8444-444444444444',P='55555555-5555-4555-8555-555555555555';
 const c={release(){},query:async(sql:string,args?:any[])=>{const r=await db.query(sql,args);return {...r,rowCount:r.rows.length}}};(pool as any).connect=async()=>c;
 try{
  await db.exec(`CREATE TABLE goals(id UUID,state TEXT,company_scope UUID,current_plan_id UUID,completion_definition TEXT,next_wake_at TIMESTAMPTZ,updated_at TIMESTAMPTZ);CREATE TABLE goal_read_reviews(goal_id UUID,plan_id UUID,decision JSONB);CREATE TABLE audit_log(id UUID DEFAULT gen_random_uuid(),actor TEXT,goal_id UUID,action TEXT,entity_type TEXT,entity_id UUID,after_ref JSONB,source TEXT,authority_class TEXT,result TEXT,timestamp TIMESTAMPTZ DEFAULT now());CREATE TABLE executions(id UUID,goal_id UUID,plan_id UUID);CREATE TABLE verifications(id UUID,execution_id UUID,result TEXT,checked_at TIMESTAMPTZ);CREATE TABLE work_queue(goal_id UUID,plan_id UUID,status TEXT);CREATE TABLE outbox_events(id UUID DEFAULT gen_random_uuid(),aggregate_type TEXT,aggregate_id TEXT,event_type TEXT,payload JSONB);`);
  await db.query("INSERT INTO goals VALUES($1,'WAITING_EXTERNAL',$2,$3,'sam.read_report.v1',now(),now())",[G,A,P]);
  await db.query('INSERT INTO executions VALUES($1,$2,$3)',[B,G,P]);await db.query("INSERT INTO verifications VALUES($1,$2,'VERIFIED',now())",[A,B]);
  await recordReadReviewBudget(c,G,P,{attempts:1,callsUsed:2,retryable:true});
  const before=(await db.query("SELECT * FROM audit_log WHERE action='READ_REVIEW_BUDGET'")).rows,input={goalId:G,legalEntityId:A,actor:'independent-owner'};
  const result=await continueReadReview(input);assert.equal(result.state,'VERIFYING');assert.equal(result.remainingAttempts,1);assert.deepEqual((await db.query("SELECT * FROM audit_log WHERE action='READ_REVIEW_BUDGET'")).rows,before);
  await db.query("UPDATE goals SET state='WAITING_EXTERNAL'");await db.query("UPDATE verifications SET result='FAILED'");
  await assert.rejects(continueReadReview(input),/VERIFIED_EVIDENCE_REQUIRED/);
  await db.query("UPDATE verifications SET result='VERIFIED'");await db.query("INSERT INTO work_queue VALUES($1,$2,'QUEUED')",[G,P]);await assert.rejects(continueReadReview(input),/VERIFIED_EVIDENCE_REQUIRED/);
  await db.query('DELETE FROM work_queue');await db.query("INSERT INTO goal_read_reviews VALUES($1,$2,'{}')",[G,P]);await assert.rejects(continueReadReview(input),/BUDGET_EXHAUSTED_REQUIRES_NEW_AUTHORIZATION/);
  assert.deepEqual((await db.query("SELECT * FROM audit_log WHERE action='READ_REVIEW_BUDGET'")).rows,before);assert.equal((await db.query<any>('SELECT state FROM goals')).rows[0].state,'WAITING_EXTERNAL');
 }finally{pool.connect=connect;await db.close();}
});

test('independent Gmail: validator preserves source limits and appends inbox/page caveats without duplicate source reads',async()=>{
 const {validateReadReview}=await import('../../apps/production/src/readGoalReview');
 const id='66666666-6666-4666-8666-666666666666';
 const source={id,capabilityId:'google_mcp_search_gmail_messages',params:{query:'supplier in:inbox'},text:'Synthetic supplier confirms release.',truncated:false,actor:'synthetic-communications',retrievedAt:'2026-10-27T00:00:00Z'};
 const decision=()=>({status:'complete',summary:'Synthetic bounded result',requirements:[{requirement:'Inspect bounded messages',fulfilled:true,evidenceIds:[id]}],findings:[{text:'Supplier confirms release.',executionId:id,quote:source.text}],limitations:['Synthetic original limitation'],steps:[]});
 const inbox=validateReadReview(decision(),[source],'Inspect bounded inbox results',[]);
 assert.ok(inbox.limitations.includes('Synthetic original limitation'));assert.ok(inbox.limitations.some(x=>x.includes('inbox-only')));
 const repeated=validateReadReview(inbox,[source],'Inspect bounded inbox results',[]);assert.equal(repeated.limitations.filter(x=>x.includes('inbox-only')).length,1);
 const page=validateReadReview(decision(),[{...source,params:{query:'supplier'}}],'Inspect returned messages',[]);assert.ok(page.limitations.some(x=>x.includes('returned page/messages')));
});

test('independent local HTTP: staging MCP exposes seven reads, denies auth/origin/write calls and replays an exact report',async()=>{
 const [{Client,StreamableHTTPClientTransport},{startMcpHttpServer},{createCoreReadTools},{ChatGPTToolRegistry}]=await Promise.all([
  import('@modelcontextprotocol/client'),import('../../apps/mcp/src/http'),import('../../apps/chatgpt-tools/src/coreReadTools'),import('../../apps/chatgpt-tools/src/registry')]);
 const names=['sam_list_goals','sam_get_goal','sam_get_goal_timeline','sam_get_report','sam_memory_status','sam_recall_memory','sam_list_notifications'];
 const items=createCoreReadTools().filter(x=>names.includes(x.definition.name));assert.equal(items.length,7);assert.ok(items.every(x=>x.definition.risk==='READ'));
 const connect=pool.connect,oldNode=process.env.NODE_ENV,oldSafe=process.env.SAM_DEVELOPMENT_SAFE_MODE;
 process.env.NODE_ENV='development';process.env.SAM_DEVELOPMENT_SAFE_MODE='1';
 const reportId='77777777-7777-4777-8777-777777777777',report={id:reportId,report_hash:'synthetic-original-hash',decision:{summary:'Synthetic immutable report',report:{semanticPolicy:'sam.source_derived_semantics.v2'}}};let reportReads=0;
 (pool as any).connect=async()=>({release(){},query:async(sql:string,args?:any[])=>{
  if(sql.includes('SELECT current_org_id()'))return {rowCount:1,rows:[{org:O,entity:A}]};
  if(sql.startsWith('SELECT id FROM legal_entities')){assert.deepEqual(args,[A,O]);return {rowCount:1,rows:[{id:A}]};}
  if(sql.includes('SELECT r.* FROM goal_read_reviews')){assert.deepEqual(args,[reportId,A]);reportReads++;return {rowCount:1,rows:[structuredClone(report)]};}
  if(['BEGIN','COMMIT','ROLLBACK'].includes(sql))return {rowCount:0,rows:[]};
  throw Error('Independent local HTTP fixture forbids unexpected SQL');
 }});
 const surface=new ChatGPTToolRegistry(items.map(x=>({...x,handler:(args:any,ctx:any)=>x.handler(args,{...ctx,legalEntityId:A})})),{redactedErrors:true});
 const server=await startMcpHttpServer({surface,actor:'independent-staging-owner',port:0,host:'127.0.0.1',bearerToken:'synthetic-local-token',allowedHosts:'127.0.0.1',allowedOrigins:'https://synthetic.invalid'});
 const port=(server.server.address() as any).port,url=new URL(`http://127.0.0.1:${port}/mcp`),client=new Client({name:'independent-staging-test',version:'1'},{versionNegotiation:{mode:'auto'}});
 try{
  assert.equal((await fetch(url,{method:'POST'})).status,401);
  assert.equal((await fetch(url,{method:'POST',headers:{Authorization:'Bearer synthetic-local-token',Origin:'https://wrong.invalid'}})).status,403);
  await client.connect(new StreamableHTTPClientTransport(url,{requestInit:{headers:{Authorization:'Bearer synthetic-local-token'}}}));
  const catalog=await client.listTools();assert.deepEqual(catalog.tools.map(x=>x.name).sort(),names.toSorted());assert.ok(catalog.tools.every(x=>x.annotations?.readOnlyHint===true));
  const first=await client.callTool({name:'sam_get_report',arguments:{report_id:reportId}}),second=await client.callTool({name:'sam_get_report',arguments:{report_id:reportId}});
  assert.deepEqual(first,second);const result=JSON.parse((first.content as any)[0].text);assert.equal(result.ok,true);assert.deepEqual(result.data.report,report);assert.equal(result.data.executionPerformed,false);assert.equal(reportReads,2);
  for(const name of ['sam_submit_goal','sam_continue_read_review']){const refused=await client.callTool({name,arguments:{}});assert.equal(refused.isError,true);assert.equal(JSON.parse((refused.content as any)[0].text).error,'Tool is not permitted.');}
  assert.equal(reportReads,2);
 }finally{await client.close();await server.close();pool.connect=connect;for(const [k,v]of Object.entries({NODE_ENV:oldNode,SAM_DEVELOPMENT_SAFE_MODE:oldSafe})){if(v===undefined)delete process.env[k];else process.env[k]=v;}}
});
