import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createServer, type Server } from 'node:http';
import { randomBytes, randomUUID } from 'node:crypto';
import { pathToFileURL } from 'node:url';
import { vaultHarness } from './vaultHarness';
import { VaultAiSecrets, aiReaderPolicy } from '../../packages/ai-infrastructure/src/vault';
import { samModelCallBoundary, vaultBoundTestAdapter, type ModelLedgerPort } from '../../packages/ai-infrastructure/src/samBoundary';
import { fixtureTariff } from './durableFixtures';
import type { DurableBinding, DurableTicket } from '../../packages/ai-infrastructure/src/durableLedger';

// Storage below is an explicit test double. These tests prove actual Gateway
// control flow + real Vault/wire behavior, NOT PostgreSQL persistence/atomicity.
class FixtureLedger implements ModelLedgerPort {
  state=''; reserved=0; finished=0; allowed=true;
  async authorize(){if(!this.allowed)throw Error('FIXTURE_REVOKED');}
  async reserve(){await this.authorize();if(this.state)throw Error('FIXTURE_DUPLICATE');this.state='RESERVED';this.reserved=5000;return Object.freeze({id:randomUUID()});}
  async dispatch(){await this.authorize();this.state='DISPATCHING';}
  async tariff(){return {...fixtureTariff(),inputBound:1000};}
  async finish(_ticket:DurableTicket,r:any){if(!r.usage||r.usage.inputTokens>1000)throw Error('FIXTURE_BAD_USAGE');this.state='SUCCEEDED';this.finished++;}
  async fail(){if(this.state==='RESERVED'){this.state='NOT_SENT';this.reserved=0;}else if(this.state!=='SUCCEEDED')this.state='UNRESOLVED';}
}
let vault:Awaited<ReturnType<typeof vaultHarness>>,server:Server,baseUrl:string,secret=randomBytes(32).toString('hex');
let calls=0,mode='ok',ModelGateway:any,dbPool:any,legacyRows:any[]=[];
let secrets:VaultAiSecrets;
const task:any={task:'planning',capability:'planning',dataClassification:'PUBLIC',input:{synthetic:true}};
before(async()=>{
  const root=process.env.AI_TEST_GATEWAY_ROOT;if(!root)throw Error('AI_TEST_GATEWAY_ROOT_REQUIRED');
  process.env.DATABASE_URL='postgresql://fixture-only@127.0.0.1:1/no_network';
  ({ModelGateway}=await import(pathToFileURL(root+'/packages/model-gateway/src/gateway.ts').href));
  ({pool:dbPool}=await import(pathToFileURL(root+'/packages/db/src/client.ts').href));
  dbPool.connect=async()=>({release(){},query:async(sql:string,params:any[])=>{
    if(sql.includes('FROM model_providers'))return {rows:['deepseek','qwen'].map(provider_id=>({provider_id,models:['requested-model'],capabilities:['planning'],privacy_class_allowed:['PUBLIC'],health:'HEALTHY',cost_per_1k_input:.001,cost_per_1k_output:.002}))};
    if(sql.includes('WITH ranked AS'))return {rows:[]};
    if(sql.includes('INSERT INTO model_calls')){legacyRows.push(params);return {rows:[{id:randomUUID()}]};}
    if(['BEGIN','COMMIT','ROLLBACK'].includes(sql))return {rows:[]};
    throw Error('UNEXPECTED_FIXTURE_SQL');
  }});
  vault=await vaultHarness();
  const admin=new VaultAiSecrets({address:vault.address,token:vault.rootToken,project:'qnan',environment:'test',allowLoopbackTest:true});
  await admin.rotate('deepseek',{apiKey:secret,enabled:true},0);
  const reader=await vault.reader(aiReaderPolicy('qnan','test',['deepseek']));
  secrets=new VaultAiSecrets({address:vault.address,token:reader,project:'qnan',environment:'test',allowLoopbackTest:true});
  server=createServer(async(req,res)=>{
    calls++;const chunks:Buffer[]=[];for await(const chunk of req)chunks.push(Buffer.from(chunk));
    if(req.headers.authorization!==`Bearer ${secret}`){res.writeHead(401);res.end();return;}
    const body=JSON.parse(Buffer.concat(chunks).toString());assert.equal(body.max_tokens,512);
    if(mode==='wait'){setTimeout(()=>res.end('{}'),150);return;}
    if(mode==='failure'){res.writeHead(503);res.end(secret);return;}
    res.setHeader('content-type','application/json');res.end(JSON.stringify({...(mode==='model'?{}:{model:'reported-version'}),choices:[{message:{content:mode==='echo'?secret:'4'}}],
      ...(mode==='usage'?{}:{usage:{prompt_tokens:50,completion_tokens:20,prompt_tokens_details:{cached_tokens:10}}})}));
  });
  await new Promise<void>(r=>server.listen(0,'127.0.0.1',r));baseUrl=`http://127.0.0.1:${(server.address() as any).port}/v1`;
});
after(async()=>{await new Promise<void>(r=>server?.close(()=>r()));await vault?.close();await dbPool?.end();});
function composition(store=new FixtureLedger(),credential=secrets){
  calls=0;mode='ok';legacyRows=[];let fallbackCalls=0;
  const adapters={deepseek:vaultBoundTestAdapter({providerId:'deepseek',endpoint:baseUrl,secrets:credential}),
    qwen:{providerId:'qwen',async invoke(){fallbackCalls++;throw Error('UNAUTHORIZED_FALLBACK');}}};
  const gateway=new ModelGateway(adapters).withModelCallBoundary(samModelCallBoundary(store,{} as DurableBinding));
  return {store,gateway,fallbackCalls:()=>fallbackCalls};
}
test('real SAM ModelGateway delegates reserve, Vault credential, dispatch and receipt without legacy double-write',async()=>{
  const x=composition();const result=await x.gateway.invoke(task);
  assert.equal(calls,1);assert.equal(x.store.state,'SUCCEEDED');assert.equal(x.store.finished,1);
  assert.equal(result.providerId,'deepseek');assert.equal(result.result.model,'reported-version');assert.equal(legacyRows.length,0);
  await assert.rejects(x.gateway.invoke(task),/FIXTURE_DUPLICATE/);assert.equal(calls,1);
});
test('actual outer Gateway fallback stops on ambiguous provider failure and missing usage',async()=>{
  for(const failure of ['failure','usage','echo','model']){
    const x=composition();mode=failure;await assert.rejects(x.gateway.invoke(task),/AI_DURABLE_ATTEMPT_STOPPED/);
    assert.equal(x.store.state,'UNRESOLVED');assert.equal(x.store.reserved,5000);assert.equal(calls,1);
    assert.equal(x.fallbackCalls(),0);assert.equal(legacyRows.length,0);
  }
});
test('rejected authority, ledger failure and forged direct adapter invocation cause zero provider calls',async()=>{
  const x=composition();x.store.allowed=false;await assert.rejects(x.gateway.invoke(task),/FIXTURE_REVOKED/);assert.equal(calls,0);
  const bad=composition();bad.store.reserve=async()=>{throw Error('FIXTURE_DATABASE_UNAVAILABLE');};
  await assert.rejects(bad.gateway.invoke(task),/FIXTURE_DATABASE_UNAVAILABLE/);assert.equal(calls,0);
  await assert.rejects(vaultBoundTestAdapter({providerId:'deepseek',endpoint:baseUrl,secrets}).invoke(task,'requested-model'),/AI_DURABLE_BOUNDARY_REQUIRED/);
});
test('Vault denies wrong-project reader and pre-dispatch failure is distinguished from possible send',async()=>{
  const restricted=await vault.reader(aiReaderPolicy('foreign','test',['deepseek']));
  const denied=new VaultAiSecrets({address:vault.address,token:restricted,project:'qnan',environment:'test',allowLoopbackTest:true});
  const x=composition(new FixtureLedger(),denied);await assert.rejects(x.gateway.invoke(task),/AI_DURABLE_ATTEMPT_STOPPED/);
  assert.equal(x.store.state,'NOT_SENT');assert.equal(x.store.reserved,0);assert.equal(calls,0);assert.equal(x.fallbackCalls(),0);
});
test('real Vault rotation is picked up by the bound provider and no provider secret enters stored legacy results',async()=>{
  const old=secret;secret=randomBytes(32).toString('hex');
  const admin=new VaultAiSecrets({address:vault.address,token:vault.rootToken,project:'qnan',environment:'test',allowLoopbackTest:true});
  const version=(await vault.api('surooh-ai/data/test/qnan/deepseek')).data.metadata.version;
  await admin.rotate('deepseek',{apiKey:secret,enabled:true},version);
  const x=composition();await x.gateway.invoke(task);assert.equal(calls,1);
  assert.equal(JSON.stringify(legacyRows).includes(secret),false);assert.equal(JSON.stringify(legacyRows).includes(old),false);
});
test('in-flight cancellation cannot cause a paid alternative attempt through actual Gateway',async()=>{
  const x=composition();mode='wait';const controller=new AbortController();
  const pending=assert.rejects(x.gateway.invoke({...task,signal:controller.signal}),/AI_DURABLE_ATTEMPT_STOPPED/);
  await new Promise(r=>setTimeout(r,30));controller.abort();await pending;
  assert.equal(x.store.state,'UNRESOLVED');assert.equal(x.fallbackCalls(),0);assert.equal(calls,1);
});
test('without extension, actual SAM gateway retains previous fallback and legacy recording',async()=>{
  legacyRows=[];let first=0,second=0;
  const result=await new ModelGateway({deepseek:{providerId:'deepseek',async invoke(){first++;throw Error('synthetic');}},
    qwen:{providerId:'qwen',async invoke(){second++;return {model:'requested-model',output:4,usage:{inputTokens:10,outputTokens:5}};}}}).invoke(task);
  assert.equal(first,1);assert.equal(second,1);assert.equal(result.providerId,'qwen');assert.equal(legacyRows.length,2);
});
