'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {readFileSync}=require('node:fs');
const {EventEmitter}=require('node:events');
const {createHash}=require('node:crypto');
const operator=require('../../scripts/release/owner-notification-delivery-operator.cjs');
const {sourceManifest,reviewedPacket,applyMigration,applyActivation,readPrincipal,awaitApply,FILE,SQL_SHA,PREVIOUS_SHA,TOKEN}=operator;
const hash=value=>createHash('sha256').update(typeof value==='string'?value:JSON.stringify(value)).digest('hex');
const packet=()=>reviewedPacket(process.cwd(),SQL_SHA,hash(sourceManifest(process.cwd())));
function client(options={}){
 const queries=[];
 let state={ledger:options.prior??null,rls:Boolean(options.prior),force:Boolean(options.prior)};
 let saved;
 const c={queries,state:()=>({...state}),async query(text,args=[]){
  queries.push({text,args});
  if(text.includes('current_user AS operator'))return {rows:[{operator:options.operator??'sam_trial_postgres_user',login:'sam_trial_postgres_user',database:options.database??'sam_trial_postgres',major:15,ssl:options.ssl??true}]};
  if(text==='BEGIN'){saved={...state};return {rows:[]};}
  if(text==='ROLLBACK'){state={...saved};return {rows:[]};}
  if(text==='COMMIT')return {rows:[]};
  if(text.startsWith('SELECT sha256 FROM public.sam_integration_migrations'))return {rows:args[0].startsWith('00106')?(options.missingPrevious?[]:[{sha256:options.previous??PREVIOUS_SHA}]):state.ledger?[{sha256:state.ledger}]:[]};
  if(text.includes('SELECT c.relname,c.relrowsecurity'))return {rows:[
   {relname:'goals',relrowsecurity:true,relforcerowsecurity:true,relacl:options.collateral&&state.rls?'unexpected':null,owner:'sam_trial_postgres_user',column_acls:null,policies:null},
   {relname:'notification_delivery_attempts',relrowsecurity:state.rls,relforcerowsecurity:state.force,relacl:null,owner:options.owner??'sam_trial_postgres_user',column_acls:null,policies:null}
  ]};
  if(text===readFileSync('packages/db/integration-migrations/'+FILE,'utf8')){
   if(options.sqlFailure)throw Object.assign(Error('synthetic private SQL failure'),{code:'42501'});
   state.rls=true;state.force=true;return {rows:[]};
  }
  if(text.startsWith('INSERT INTO public.sam_integration_migrations')){state.ledger=args[1];return {rows:[]};}
  return {rows:[]};
 }};
 return c;
}

test('reviewed operator packet binds exact00107 and the complete staged source manifest',()=>{
 const p=packet();assert.equal(p.sha256,SQL_SHA);assert.equal(p.filename,FILE);
 assert.throws(()=>reviewedPacket(process.cwd(),'a'.repeat(64),p.sourceSha256),/MIGRATION_HASH_MISMATCH/);
 assert.throws(()=>reviewedPacket(process.cwd(),SQL_SHA,'b'.repeat(64)),/SOURCE_HASH_MISMATCH/);
 assert.throws(()=>reviewedPacket(process.cwd(),'bad','bad'),/HASHES_REQUIRED/);
});

test('operator executes only00107 atomically after exact00106 receipt, and replay executes no DDL',async()=>{
 const c=client(),p=packet();
 const first=await applyMigration(c,p);assert.equal(first.status,'APPLIED');assert.deepEqual(c.state(),{ledger:SQL_SHA,rls:true,force:true});
 assert.equal(c.queries.filter(q=>q.text===p.sql).length,1);
 assert.ok(c.queries.some(q=>q.text==='SET LOCAL search_path=pg_catalog,public'));
 assert.ok(c.queries.some(q=>q.text==="SET LOCAL lock_timeout='5s'"));
 assert.ok(c.queries.some(q=>q.text==='COMMIT'));
 const replay=client({prior:SQL_SHA});assert.equal((await applyMigration(replay,p)).status,'ALREADY_APPLIED');
 assert.equal(replay.queries.filter(q=>q.text===p.sql).length,0);
 assert.ok(!c.queries.some(q=>/0010[0-6].*ALTER TABLE/.test(q.text)));
});

test('principal, TLS, predecessor, SQL hash and collateral changes fail closed',async()=>{
 for(const options of [{operator:'sam_runtime_app'},{database:'wrong_database'},{ssl:false},{missingPrevious:true},
  {previous:'wrong'},{prior:'wrong'},{owner:'wrong_owner'},{collateral:true},{sqlFailure:true}]){
  const c=client(options);await assert.rejects(()=>applyMigration(c,packet()));
  assert.ok(!c.queries.some(q=>q.text==='COMMIT'));
  if(c.queries.some(q=>q.text==='BEGIN'))assert.ok(c.queries.some(q=>q.text==='ROLLBACK'));
 }
 const c=client();await assert.rejects(()=>applyMigration(c,{...packet(),sql:'DROP TABLE forbidden'}),/HASH_MISMATCH/);
 assert.equal(c.queries.length,0);
});

test('access failure preserves committed00107 secure RLS and reports partial state without schema rollback',async()=>{
 const c=client();let calls=0;
 const result=await applyActivation(c,packet(),{role:'sam_runtime_app'},async()=>{calls++;throw Error('OWNER_DELIVERY_SYNTHETIC_DENIAL');});
 assert.equal(calls,1);assert.equal(result.status,'MIGRATION_APPLIED_ACCESS_FAILED');
 assert.deepEqual(c.state(),{ledger:SQL_SHA,rls:true,force:true});
 assert.equal(result.deliveryActivated,false);assert.equal(result.providerInvoked,false);
 assert.equal(result.recovery,'PRESERVE_00107_AND_INSPECT_EXISTING_SCOPE_BEFORE_RETRY');
 assert.equal(c.queries.filter(q=>q.text==='ROLLBACK').length,0);
 const success=await applyActivation(client({prior:SQL_SHA}),packet(),{},async()=>({scope:'synthetic',deliveryActivated:false}));
 assert.equal(success.status,'OWNER_DELIVERY_ACCESS_PROVISIONED');assert.equal(success.deliveryActivated,false);
});

test('principal derives only the existing fixed public runtime-policy tenant, without caller UUIDs',async()=>{
 const org='11111111-1111-4111-8111-111111111111',entity='22222222-2222-4222-8222-222222222222';
 const qualify=prefix=>`(legal_entity_id='${entity}'::uuid AND ${prefix}current_org_id()='${org}'::uuid AND ${prefix}current_legal_entity_id()='${entity}'::uuid)`;
 for(const prefix of ['','public.','"public".']){
  const p=await readPrincipal({query:async()=>({rows:[{qual:qualify(prefix)}]})});
  assert.deepEqual(p,{schema:'public',role:'sam_runtime_app',orgId:org,legalEntityId:entity});
 }
 for(const qual of [qualify('foreign_schema.'),qualify('public.')+' OR true','',qualify('public.').replace(/current_org_id/g,'wrong_function')])
  await assert.rejects(()=>readPrincipal({query:async()=>({rows:[{qual}]})}),/TENANT_FENCE_REQUIRED/);
});

test('apply handoff is finite, exact-token checked by caller, and close cancels safely',async()=>{
 const input=new EventEmitter(),accepted=awaitApply(input,100);input.emit('line',TOKEN);assert.equal(await accepted,TOKEN);
 const wrong=new EventEmitter(),denied=awaitApply(wrong,100);wrong.emit('line','APPLY_ALL');assert.notEqual(await denied,TOKEN);
 const closed=new EventEmitter(),cancelled=awaitApply(closed,100);closed.emit('close');assert.equal(await cancelled,'CLOSED');
 assert.equal(await awaitApply(new EventEmitter(),5),'TIMEOUT');
 assert.equal(input.listenerCount('line'),0);assert.equal(input.listenerCount('close'),0);
});

test('operator rejects raw OR even when normalized expression retains a valid fixed-tenant tail',async()=>{
 const org='11111111-1111-4111-8111-111111111111',entity='22222222-2222-4222-8222-222222222222';
 const qual=`(legal_entity_id='${entity}'::uuid OR company_scope='${entity}'::uuid)
  AND public.current_org_id()='${org}'::uuid AND public.current_legal_entity_id()='${entity}'::uuid`;
 await assert.rejects(()=>readPrincipal({query:async()=>({rows:[{qual}]})}),/TENANT_FENCE_REQUIRED/);
});

test('operator entry refuses wrong service or database host before credential prompt or connection',()=>{
 const {spawnSync}=require('node:child_process');
 const entry='scripts/release/owner-notification-delivery-operator.cjs';
 for(const [service,url,code] of [
  ['wrong-service','postgres://fixture:fixture@dpg-db37k3rbc2fs73csjung-a/sam_trial_postgres','EXACT_OPERATOR_PREPARATION_REQUIRED'],
  ['srv-db37vbvlk1mc739o0b70','postgres://fixture:fixture@wrong.invalid/sam_trial_postgres','EXISTING_DATABASE_REQUIRED']
 ]){
  const result=spawnSync(process.execPath,['--import','tsx',entry,'--prepare',SQL_SHA,packet().sourceSha256],
   {cwd:process.cwd(),encoding:'utf8',env:{PATH:process.env.PATH,RENDER_SERVICE_ID:service,DATABASE_URL:url}});
  assert.equal(result.status,1);assert.match(result.stderr,new RegExp(code));
  assert.equal(result.stdout,'');assert.ok(!result.stderr.includes('fixture'));assert.ok(!result.stderr.includes('password'));
 }
});
