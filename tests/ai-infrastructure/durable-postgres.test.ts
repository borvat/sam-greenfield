import { test, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { readFileSync } from 'node:fs';
import { Pool } from 'pg';
import { randomUUID } from 'node:crypto';
import { fork } from 'node:child_process';
import { once } from 'node:events';
import { fileURLToPath } from 'node:url';
import { createServer } from 'node:http';
import { pathToFileURL } from 'node:url';
import { vaultHarness } from './vaultHarness';
import { VaultAiSecrets,aiReaderPolicy } from '../../packages/ai-infrastructure/src/vault';
import { samModelCallBoundary,vaultBoundTestAdapter } from '../../packages/ai-infrastructure/src/samBoundary';
import { postgresHarness } from './postgresHarness';
import { syntheticSamIdentity,fixtureTariff } from './durableFixtures';
import { PostgresModelLedger,modelRequestFingerprint } from '../../packages/ai-infrastructure/src/durableLedger';
import { PostgresModelAdministration } from '../../packages/ai-infrastructure/src/durableAdministration';
import { authenticateSamModelToken,samIdentityClaims } from '../../packages/ai-infrastructure/src/samIdentity';
import { sha256Hex } from '../../packages/shared/src/stableJson';

const uidMap=process.getuid?.()===0?readFileSync('/proc/self/uid_map','utf8'):'';
const blocked=!process.env.AI_TEST_POSTGRES_BIN?'BLOCKED: PostgreSQL test binary not configured':
  /^\s*0\s+0\s+1\s*$/.test(uidMap)?'BLOCKED: only root UID mapped; PostgreSQL refuses root and non-root UID cannot be created':false;
const check={skip:blocked};
let pg:Awaited<ReturnType<typeof postgresHarness>>;
let s:ReturnType<typeof syntheticSamIdentity>,goalId:string,queueId:string,grantId:string;
const task={task:'planning',capability:'planning',dataClassification:'PUBLIC' as const,input:{synthetic:true}};
before(async()=>{if(blocked)return;pg=await postgresHarness();pg.pool.on('error',()=>{});
  await pg.pool.query(await readFile(new URL('../../packages/ai-infrastructure/sql/001_durable_model_calls.sql',import.meta.url),'utf8'));
});
after(async()=>{if(pg)await pg.close();});
async function approval(capability:string,payloadHash:string,goal:string|null,limits:object={}){
  const id=randomUUID();await pg.pool.query(`INSERT INTO approvals(id,goal_id,capability_id,params_hash,legal_entity_id,limits,
    expiry_at,authority_class,status,max_uses) VALUES($1,$2,$3,$4,$5,$6::jsonb,now()+interval '1 hour','GREEN','APPROVED',100)`,
    [id,goal,capability,payloadHash,s.config.entityId,JSON.stringify(limits)]);return id;
}
async function adminApproval(payload:object){return approval('ai.infrastructure.admin',sha256Hex(payload),null);}
async function binding(key=randomUUID()){
  const context={goalId,queueId,attemptId:'1',requestKey:key,approvalId:randomUUID()};
  const hash=modelRequestFingerprint(task,context,{actor:samIdentityClaims(s.identity).actor,projectId:'qnan',environment:'test'});
  await pg.pool.query(`INSERT INTO approvals(id,goal_id,capability_id,params_hash,legal_entity_id,limits,expiry_at,authority_class,status,max_uses)
    VALUES($1,$2,'ai.model.invoke',$3,$4,$5::jsonb,now()+interval '1 hour','GREEN','APPROVED',1)`,
    [context.approvalId,goalId,hash,s.config.entityId,JSON.stringify({models:[fixtureTariff()]})]);
  return {identity:s.identity,context};
}
const candidate={providerId:'deepseek',model:'requested-model'};
beforeEach(async()=>{
  if(blocked)return;
  // Only the disposable cluster created above. No shared/test-service database URI is accepted.
  await pg.pool.query(`TRUNCATE sam_ai_billing_evidence,sam_ai_call_budgets,model_calls,sam_ai_budget_periods,
    sam_ai_service_grants,sam_ai_project_state,approvals,executions,work_queue,plans,goals,audit_log,legal_entities,organizations CASCADE`);
  s=syntheticSamIdentity();goalId=randomUUID();queueId=randomUUID();grantId=randomUUID();
  await pg.pool.query('INSERT INTO organizations(id,name) VALUES($1,$2)',[s.config.orgId,'Synthetic organization']);
  await pg.pool.query('INSERT INTO legal_entities(id,org_id,name) VALUES($1,$2,$3)',[s.config.entityId,s.config.orgId,'Synthetic QNAN']);
  await pg.pool.query("INSERT INTO goals(id,business_id,company_scope,objective) VALUES($1,'G-FIXTURE',$2,'synthetic')",[goalId,s.config.entityId]);
  await pg.pool.query("INSERT INTO work_queue(id,goal_id,capability_id) VALUES($1,$2,'planning')",[queueId,goalId]);
  await pg.pool.query("INSERT INTO sam_ai_project_state VALUES('qnan','test',$1,$2,true)",[s.config.orgId,s.config.entityId]);
  await pg.pool.query(`INSERT INTO sam_ai_service_grants(id,actor,service_id,project_id,environment,expires_at,providers,capabilities,classifications)
    VALUES($1,$2,'sam','qnan','test',now()+interval '1 hour','["deepseek","qwen"]','["planning"]','["PUBLIC"]')`,[grantId,samIdentityClaims(s.identity).actor]);
  const budgetApproval=await approval('ai.budget.limit',sha256Hex({synthetic:true}),null);
  for(const [kind,key]of [['GLOBAL','all'],['PROJECT','qnan'],['GOAL',goalId],['TASK',queueId]]){
    await pg.pool.query(`INSERT INTO sam_ai_budget_periods(environment,kind,scope_key,starts_at,ends_at,limit_microusd,approval_id)
      VALUES('test',$1,$2,now()-interval '1 hour',now()+interval '1 hour',2000,$3)`,[kind,key,budgetApproval]);
  }
});

test('PostgreSQL: concurrent workers cannot reserve a budget that only covers one request',check,async()=>{
  const one=await binding(),two=await binding(),a=new PostgresModelLedger(pg.pool),b=new PostgresModelLedger(pg.pool);
  const result=await Promise.allSettled([a.reserve(one,task,candidate),b.reserve(two,task,candidate)]);
  assert.equal(result.filter(r=>r.status==='fulfilled').length,1);
  assert.equal((await pg.pool.query('SELECT count(*)::int n FROM model_calls')).rows[0].n,1);
});
test('PostgreSQL: same request reuses saved identity after process restart; different content is rejected',check,async()=>{
  const bound=await binding(),ledger=new PostgresModelLedger(pg.pool);await ledger.reserve(bound,task,candidate);
  const renewed={...bound,identity:authenticateSamModelToken(s.token(),s.config)};
  const fresh=new PostgresModelLedger(pg.pool);
  await assert.rejects(fresh.reserve(renewed,task,candidate),/AI_REQUEST_ALREADY_RECORDED/);
  await assert.rejects(fresh.reserve(renewed,{...task,input:{different:true}},candidate),/AI_REQUEST_CONTENT_CONFLICT/);
});
async function killWorker(phase:'before-send'|'after-send',bound:Awaited<ReturnType<typeof binding>>,endpoint?:string){
  const child=fork(fileURLToPath(new URL('./durableCrashChild.ts',import.meta.url)),[],{execArgv:['--import','tsx'],stdio:['ignore','ignore','ignore','ipc'],
    env:{PATH:process.env.PATH}});
  const message=new Promise<any>((resolve,reject)=>{
    const timer=setTimeout(()=>{child.kill('SIGKILL');reject(Error('CRASH_CHECKPOINT_TIMEOUT'));},10000);
    child.once('message',m=>{clearTimeout(timer);resolve(m);});child.once('error',reject);
  });
  child.send({url:pg.url,config:{...s.config,keys:undefined},publicKeyPem:s.config.keys.get('fixture')!.export({type:'spki',format:'pem'}),
    token:s.token(),context:bound.context,task,phase,syntheticEndpoint:endpoint});
  const receipt=await message;assert.equal(receipt.error,undefined);
  const exited=once(child,'exit');child.kill('SIGKILL');await exited;return receipt.id as string;
}
test('PostgreSQL: SIGKILL after reservation preserves held budget with no resend after restart',check,async()=>{
  const bound=await binding(),id=await killWorker('before-send',bound);
  const ledger=new PostgresModelLedger(pg.pool),row=await ledger.inspect(s.identity,id);
  assert.equal(row.ai_state,'RESERVED');assert.ok(BigInt(row.ai_exposure_microusd)>0n);
  await assert.rejects(ledger.reserve(bound,task,candidate),/AI_REQUEST_ALREADY_RECORDED/);
});
test('PostgreSQL: SIGKILL after actual synthetic HTTP send persists unresolved spend and blocks resending',check,async()=>{
  let calls=0;const server=createServer((_q,r)=>{calls++;r.end('synthetic');});await new Promise<void>(r=>server.listen(0,'127.0.0.1',r));
  try{const bound=await binding(),id=await killWorker('after-send',bound,`http://127.0.0.1:${(server.address() as any).port}`);
    const ledger=new PostgresModelLedger(pg.pool);await ledger.recoverPending(s.identity,id);
    const row=await ledger.inspect(s.identity,id);assert.equal(row.ai_state,'UNRESOLVED');assert.ok(BigInt(row.ai_exposure_microusd)>0n);
    assert.equal(row.ai_input_tokens,null);assert.equal(row.ai_computed_microusd,null);
    await assert.rejects(ledger.reserve(bound,task,candidate),/AI_REQUEST_ALREADY_RECORDED/);assert.equal(calls,1);
  }finally{await new Promise<void>(r=>server.close(()=>r()));}
});
test('PostgreSQL: database server crash/restart preserves request, reservation and approval usage',check,async()=>{
  const bound=await binding(),l=new PostgresModelLedger(pg.pool),t=await l.reserve(bound,task,candidate);await l.dispatch(t);
  await pg.restart();const fresh=new PostgresModelLedger(pg.pool);await fresh.recoverPending(s.identity,t.id);
  const row=await fresh.inspect(s.identity,t.id);assert.equal(row.ai_state,'UNRESOLVED');
  await assert.rejects(fresh.reserve(bound,task,candidate),/AI_REQUEST_ALREADY_RECORDED/);
  assert.equal((await pg.pool.query('SELECT used_count FROM approvals WHERE id=$1',[bound.context.approvalId])).rows[0].used_count,1);
});
test('PostgreSQL: service revocation and project disable survive fresh ledger and identity objects',check,async()=>{
  const bound=await binding(),admin=new PostgresModelAdministration(pg.pool);
  await admin.revokeService(grantId,await adminApproval({action:'revokeService',grantId}));
  await assert.rejects(new PostgresModelLedger(pg.pool).reserve({...bound,identity:authenticateSamModelToken(s.token(),s.config)},task,candidate),/AI_SERVICE_DENIED/);
  await admin.setProjectEnabled('qnan','test',false,await adminApproval({action:'setProjectEnabled',projectId:'qnan',environment:'test',enabled:false}));
  assert.equal((await pg.pool.query("SELECT enabled FROM sam_ai_project_state WHERE project_id='qnan'")).rows[0].enabled,false);
});
test('PostgreSQL: forged identity, mismatched SAM goal, expired grant and revoked approval are denied before send',check,async()=>{
  const bound=await binding(),l=new PostgresModelLedger(pg.pool);
  await assert.rejects(l.reserve({...bound,identity:{kind:'SAM_VERIFIED_MODEL_IDENTITY'}},task,candidate),/AI_IDENTITY_DENIED/);
  await assert.rejects(l.reserve({...bound,context:{...bound.context,goalId:randomUUID()}},task,candidate),/AI_SAM_TASK_SCOPE_DENIED/);
  await pg.pool.query("UPDATE approvals SET status='REJECTED' WHERE id=$1",[bound.context.approvalId]);
  await assert.rejects(l.reserve(bound,task,candidate),/AI_APPROVAL_DENIED/);
  await pg.pool.query("UPDATE sam_ai_service_grants SET expires_at=now()-interval '1 second'");
  await assert.rejects(l.reserve(bound,task,candidate),/AI_SERVICE_DENIED/);
});
test('PostgreSQL: project revocation remains denied after database restart even with a valid service grant',check,async()=>{
  const bound=await binding();const payload={action:'setProjectEnabled',projectId:'qnan',environment:'test',enabled:false};
  await new PostgresModelAdministration(pg.pool).setProjectEnabled('qnan','test',false,await adminApproval(payload));
  await pg.restart();await assert.rejects(new PostgresModelLedger(pg.pool).reserve(bound,task,candidate),/AI_SERVICE_DENIED/);
});
test('PostgreSQL: malformed/missing usage stays NULL, unknown failure retains reserve, not zero',check,async()=>{
  const l=new PostgresModelLedger(pg.pool),t=await l.reserve(await binding(),task,candidate);await l.dispatch(t);
  await assert.rejects(l.finish(t,{model:'reported-version',output:4,usage:undefined} as any),/AI_USAGE_UNKNOWN/);await l.fail(t);
  const row=await l.inspect(s.identity,t.id);assert.equal(row.ai_state,'UNRESOLVED');assert.equal(row.ai_input_tokens,null);
  assert.equal(row.ai_computed_microusd,null);assert.equal(row.ai_reserved_microusd,row.ai_exposure_microusd);
});
test('PostgreSQL: reported usage, calculated cost and verified invoice are separate values',check,async()=>{
  const l=new PostgresModelLedger(pg.pool),t=await l.reserve(await binding(),task,candidate);await l.dispatch(t);
  await l.finish(t,{model:'reported-version',output:4,usage:{inputTokens:100,outputTokens:20}},40);
  let row=await l.inspect(s.identity,t.id);assert.equal(row.ai_computed_microusd,'104');assert.equal(row.ai_invoiced_microusd,null);
  const evidence={kind:'VERIFIED_INVOICE' as const,amountMicrousd:'105',sourceSha256:'2'.repeat(64)};
  await new PostgresModelAdministration(pg.pool).reconcile(t.id,evidence,await adminApproval({action:'reconcile',id:t.id,evidence}));
  row=await l.inspect(s.identity,t.id);assert.equal(row.ai_computed_microusd,'104');assert.equal(row.ai_invoiced_microusd,'105');
  assert.equal(row.ai_requested_model,'requested-model');assert.equal(row.ai_reported_model,'reported-version');
});
test('PostgreSQL: known pre-send failure releases exposure but does not erase estimated/reserved history',check,async()=>{
  const l=new PostgresModelLedger(pg.pool),t=await l.reserve(await binding(),task,candidate);await l.fail(t);
  const row=await l.inspect(s.identity,t.id);assert.equal(row.ai_state,'NOT_SENT');assert.equal(row.ai_exposure_microusd,'0');assert.ok(BigInt(row.ai_reserved_microusd)>0n);
});
test('PostgreSQL: changed limits use revision CAS; expired periods do not erase held reservations',check,async()=>{
  const l=new PostgresModelLedger(pg.pool),t=await l.reserve(await binding(),task,candidate),admin=new PostgresModelAdministration(pg.pool);
  const b=(await pg.pool.query("SELECT id FROM sam_ai_budget_periods WHERE kind='PROJECT'")).rows[0];
  const payload={action:'changeLimit',id:b.id,limitMicrousd:'1',expectedRevision:1};await admin.changeLimit(b.id,'1',1,await adminApproval(payload));
  await assert.rejects(l.dispatch(t),/AI_BUDGET_EXHAUSTED/);
  await assert.rejects(admin.changeLimit(b.id,'1',1,await adminApproval(payload)),/AI_LIMIT_REVISION_CONFLICT/);
  await pg.pool.query("UPDATE sam_ai_budget_periods SET ends_at=now()-interval '1 second' WHERE kind='PROJECT'");
  const row=await l.inspect(s.identity,t.id);assert.ok(BigInt(row.ai_exposure_microusd)>0n);
});
test('PostgreSQL: ledger database unavailable rejects admission without a secret/provider operation',check,async()=>{
  const pool=new Pool({connectionString:'postgresql://fixture@127.0.0.1:1/closed',connectionTimeoutMillis:100});
  try{await assert.rejects(new PostgresModelLedger(pool).reserve(await binding(),task,candidate),/AI_LEDGER_UNAVAILABLE/);}finally{await pool.end();}
});
test('PostgreSQL: unallocated legacy model_calls history is never silently treated as free',check,async()=>{
  await pg.pool.query(`INSERT INTO model_calls(task,provider,model,success,data_classification,tokens,cost)
    VALUES('planning','deepseek','historical-model',false,'PUBLIC',0,NULL)`);
  await assert.rejects(new PostgresModelLedger(pg.pool).reserve(await binding(),task,candidate),/AI_LEGACY_ALLOCATION_REQUIRED/);
});
test('PostgreSQL + actual SAM Gateway + real Vault: one canonical model_calls reservation/usage record',
  {skip:blocked||(!process.env.AI_TEST_GATEWAY_ROOT?'BLOCKED: actual gateway fixture root missing':false)},async()=>{
  process.env.DATABASE_URL=pg.url;
  const root=process.env.AI_TEST_GATEWAY_ROOT!;
  const {ModelGateway}=await import(pathToFileURL(root+'/packages/model-gateway/src/gateway.ts').href);
  const {pool:gatewayPool}=await import(pathToFileURL(root+'/packages/db/src/client.ts').href);
  const vault=await vaultHarness(),key='synthetic-only-credential-for-pg-contract';
  const admin=new VaultAiSecrets({address:vault.address,token:vault.rootToken,project:'qnan',environment:'test',allowLoopbackTest:true});
  await admin.rotate('deepseek',{apiKey:key,enabled:true},0);
  const token=await vault.reader(aiReaderPolicy('qnan','test',['deepseek']));
  const secrets=new VaultAiSecrets({address:vault.address,token,project:'qnan',environment:'test',allowLoopbackTest:true});
  let calls=0;const server=createServer((q,r)=>{
    calls++;assert.equal(q.headers.authorization===`Bearer ${key}`,true);
    r.setHeader('content-type','application/json');r.end(JSON.stringify({model:'reported-version',choices:[{message:{content:'4'}}],usage:{prompt_tokens:50,completion_tokens:20}}));
  });
  await new Promise<void>(r=>server.listen(0,'127.0.0.1',r));
  try{
    await pg.pool.query(`INSERT INTO model_providers(provider_id,models,capabilities,cost_per_1k_input,cost_per_1k_output,privacy_class_allowed)
      VALUES('deepseek','["requested-model"]','["planning"]',0.001,0.002,'["PUBLIC"]')`);
    const bound=await binding(),l=new PostgresModelLedger(pg.pool);
    const adapter=vaultBoundTestAdapter({providerId:'deepseek',endpoint:`http://127.0.0.1:${(server.address() as any).port}/v1`,secrets});
    const gateway=new ModelGateway({deepseek:adapter}).withModelCallBoundary(samModelCallBoundary(l,bound));
    await gateway.invoke(task);await assert.rejects(gateway.invoke(task),/AI_REQUEST_ALREADY_RECORDED/);
    assert.equal(calls,1);const rows=(await pg.pool.query('SELECT * FROM model_calls')).rows;
    assert.equal(rows.length,1);assert.equal(rows[0].ai_state,'SUCCEEDED');assert.equal(rows[0].ai_goal_id,goalId);
    assert.equal(rows[0].ai_invoiced_microusd,null);assert.equal(JSON.stringify(rows).includes(key),false);
  }finally{await new Promise<void>(r=>server.close(()=>r()));await vault.close();await gatewayPool.end();}
});
