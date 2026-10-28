import assert from 'node:assert/strict';
import {test} from 'node:test';
import {applicationEnvironment,main} from './entry';
import {validatePersistentBinding} from './persistentBinding';
import {createRequire} from 'node:module';
const {createStorageLease}=createRequire(import.meta.url)('./storageLease.cjs');

test('synthetic staging environment cannot inherit provider credentials, billing or old live flags',()=>{
 const env=applicationEnvironment({PATH:'/usr/bin',RENDER_GIT_COMMIT:'a'.repeat(40),DEEPSEEK_API_KEY:'fixture',
  DATABASE_URL:'postgres://wrong',SAM_HERMES_DATA_ANALYSIS_ENABLED:'1',SAM_HERMES_PROBE_ENABLED:'1',
  SAM_HERMES_CODING_PROBE_ENABLED:'1',SAM_INTEGRATION_ENABLED:'1',SAM_PRODUCTION_BUNDLE_MODULE:'wrong',SAM_UI_ACCEPTANCE_ENABLED:'1'},
  {connectionString:'postgres://restricted-fixture',entity:'synthetic-entity'});
 assert.equal(env.DATABASE_URL,'postgres://restricted-fixture');assert.equal(env.SAM_COMMAND_CENTER_READ_ONLY,'1');
 assert.equal(env.RENDER_GIT_COMMIT,'a'.repeat(40));
 assert.equal('SAM_UI_ACCEPTANCE_ENABLED' in env,false);
 for(const k of Object.keys(env))assert.doesNotMatch(k,/API_KEY|HERMES|BUNDLE|INTEGRATION_ENABLED/);
 assert.equal(applicationEnvironment({RENDER_GIT_COMMIT:'untrusted text'},{connectionString:'fixture',entity:'fixture'}).RENDER_GIT_COMMIT,undefined);
});
test('test service opt-in is mandatory before any storage read or application start',async()=>{
 const before=process.env.SAM_RELIABILITY_TEST_ENABLED;delete process.env.SAM_RELIABILITY_TEST_ENABLED;
 try{await assert.rejects(main(),/EXACT_TEST_SERVICE_OPT_IN_REQUIRED/);}finally{
  if(before===undefined)delete process.env.SAM_RELIABILITY_TEST_ENABLED;else process.env.SAM_RELIABILITY_TEST_ENABLED=before;
 }
});
test('persistent binding rejects non-test role, absent fixed tenant and arbitrary URL options',()=>{
 assert.throws(()=>validatePersistentBinding({}),/PERSISTENT_BINDING_INVALID/);
 const schema='sam_eval_fixture',role='sam_eval_runtime_fixture',org='11111111-1111-4111-8111-111111111111',entity='22222222-2222-4222-8222-222222222222';
 const url=new URL('postgres://'+role+':synthetic-fixture@db.invalid/synthetic');
 url.searchParams.set('options',`-c search_path=${schema},pg_catalog,public -c app.current_org_id=${org} -c app.current_legal_entity_id=${entity}`);
 const binding={schema,role,org,entity,connectionString:url.href};assert.deepEqual(validatePersistentBinding(binding),binding);
 for(const change of [{role:'postgres'},{schema:'public'},{org:entity},{connectionString:url.href+'&extra=1'}])assert.throws(()=>validatePersistentBinding({...binding,...change}));
});
test('storage lease expires monotonically without renewing or repeating callback',()=>{
 let clock=10,callback=()=>{},calls=0;const lease=createStorageLease(10000,()=>calls++,{now:()=>clock,schedule:(cb:()=>void)=>{callback=cb;return 1},cancel:()=>{}});
 assert.equal(lease.expired(),false);clock=8010;assert.equal(lease.expired(),true);callback();assert.equal(calls,1);
 assert.throws(()=>createStorageLease(3600001,()=>{}),/STORAGE_WINDOW_INVALID/);
});
