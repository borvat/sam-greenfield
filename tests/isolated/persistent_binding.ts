import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,writeFile,chmod,symlink,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {validatePersistentBinding,readPersistentBinding,inspectPersistentBinding} from '../../deploy/render-test/persistentBinding';
const org='11111111-1111-4111-8111-111111111111',entity='22222222-2222-4222-8222-222222222222';
function binding(){const u=new URL('postgres://sam_eval_runtime_probe:unused-synthetic@127.0.0.1/sam_core_test');
 u.searchParams.set('options',`-c search_path=sam_eval_probe,pg_catalog,public -c app.current_org_id=${org} -c app.current_legal_entity_id=${entity}`);
 return {schema:'sam_eval_probe',role:'sam_eval_runtime_probe',org,entity,connectionString:u.href};}
function fixture(patch:any={}){const b=binding(),calls:string[]=[];
 return {calls,async query(sql:string){calls.push(sql);assert.match(sql,/^(SELECT |BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY|ROLLBACK)/);
  if(sql.includes('FROM pg_roles'))return {rows:[{...b,read_only:'on',valid:true,remaining_ms:3500000,rolsuper:false,rolcreatedb:false,rolcreaterole:false,rolbypassrls:false,rolinherit:false,rolreplication:false,can_create_schema:false,...patch}]};
  if(sql.includes('FROM legal_entities'))return {rows:[{id:entity,org_id:org}]};
  if(sql.includes('FROM pg_class'))return {rows:[{n:0}]};return {rows:[]};}};
}
const checks={integration:async()=>({org,entity}),evaluation:async()=>({org,entity}),shared:async()=>{}};
test('binding requires exact restricted identity, tenant and connection context',()=>{
 const b=binding();assert.deepEqual(validatePersistentBinding(b),b);
 for(const p of [{role:'postgres'},{org:entity},{connectionString:b.connectionString.replace('app.current_org_id','unrelated')},{credential:b.connectionString}])assert.throws(()=>validatePersistentBinding({...b,...p}),/BINDING_INVALID/);
});
test('private binding file rejects symlink and public permissions without exposing its connection',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'sam-binding-'));const file=join(dir,'binding.json');
 try{await writeFile(file,JSON.stringify(binding()),{mode:0o600});assert.deepEqual(await readPersistentBinding(file),binding());
  await chmod(file,0o644);await assert.rejects(readPersistentBinding(file),/PRIVATE_BINDING_FILE_REQUIRED/);
  await chmod(file,0o600);await symlink(file,join(dir,'link'));await assert.rejects(readPersistentBinding(join(dir,'link')),/PRIVATE_BINDING_FILE_REQUIRED/);
  await writeFile(file,'x'.repeat(9000));await assert.rejects(readPersistentBinding(file),/PRIVATE_BINDING_FILE_REQUIRED/);
 }finally{await rm(dir,{recursive:true,force:true});}
});
test('startup admission is read-only and refuses admin flags, wrong tenant, expiry and role inheritance',async()=>{
 for(const p of [{rolsuper:true},{rolcreatedb:true},{rolcreaterole:true},{rolbypassrls:true},{rolinherit:true},{rolreplication:true},{can_create_schema:true},{valid:false},{remaining_ms:3600001},{remaining_ms:NaN},{remaining_ms:0},{entity:org}]){
  const f=fixture(p);await assert.rejects(inspectPersistentBinding(f,binding(),checks),/PRINCIPAL_DENIED/);assert.equal(f.calls.at(-1),'ROLLBACK');
 }
 const f=fixture();const r=await inspectPersistentBinding(f,binding(),checks);assert.equal(r.liveReasoningEnabled,false);assert.equal(r.containerReplacementValidated,false);assert(!JSON.stringify(r).includes('unused-synthetic'));
});
test('profile admission failure rolls back without provisioning or a fallback',async()=>{
 const f=fixture();await assert.rejects(inspectPersistentBinding(f,binding(),{...checks,evaluation:async()=>{throw Error('PROFILE_MISSING');}}),/PROFILE_MISSING/);assert.equal(f.calls.at(-1),'ROLLBACK');
});
