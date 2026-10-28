'use strict';
// Pure query-model tests only: no driver, connection, credential or TTY use.
const assert=require('node:assert/strict');
const {test}=require('node:test');
const {snapshot,renewExistingLogin,operatorTarget}=require('./renewLogin.cjs');
const {parse}=require('pg-connection-string');
const ConnectionParameters=require('pg/lib/connection-parameters');
const ROLE='sam_eval_runtime_20261024',SCHEMA='sam_eval_20261024';
const clock='2026-10-28T12:00:00.000Z',expired='2026-10-28T01:00:25.521Z';
function fixture(options={}){
 const role={rolname:ROLE,rolsuper:false,rolinherit:false,rolcreaterole:false,rolcreatedb:false,
  rolcanlogin:true,rolreplication:false,rolconnlimit:-1,rolbypassrls:false,rolvaliduntil:expired,
  checked_at:clock,search_path:[`search_path=${SCHEMA}, pg_catalog, public`],database_create:false,schema_create:false,...options.role};
 const tables=[{relname:'memory_records',relowner:10001,relrowsecurity:true,relforcerowsecurity:true,relacl:'synthetic-acl-v1'}];
 const policies=[{tablename:'memory_records',policyname:'fixed_synthetic_scope',roles:'{sam_eval_runtime_20261024}',cmd:'ALL',qual:'fixed synthetic company',with_check:'fixed synthetic company'}];
 const queries=[];let originalExpiry,altered=false,committed=false;
 const client={async query(sql,args=[]){
  queries.push({sql,args});
  if(sql==='SELECT current_user AS operator,current_database() AS database')return {rows:[{operator:options.operator??'sam_trial_postgres_user',database:options.database??'sam_trial_postgres'}]};
  if(sql==='BEGIN'){originalExpiry=role.rolvaliduntil;return {rows:[]};}
  if(sql==='ROLLBACK'){if(!committed)role.rolvaliduntil=originalExpiry;return {rows:[]};}
  if(sql==='COMMIT'){committed=true;return {rows:[]};}
  if(sql.startsWith('SELECT pg_advisory_xact_lock'))return {rows:[{}]};
  if(sql.startsWith('SELECT rolname,'))return {rows:[{...role,...(altered&&options.elevatedAfter?{rolsuper:true}:{})}]};
  if(sql.startsWith('SELECT c.relname,'))return {rows:structuredClone(tables).map(t=>altered&&options.changedAfter==='acl'?{...t,relacl:'changed-acl'}:altered&&options.changedAfter==='rls'?{...t,relforcerowsecurity:false}:t)};
  if(sql.startsWith('SELECT tablename,'))return {rows:structuredClone(policies).map(p=>altered&&options.changedAfter==='policy'?{...p,qual:'changed scope'}:p)};
  if(sql.startsWith('SELECT roleid,'))return {rows:altered&&options.changedAfter==='membership'?[{roleid:20001,member:10002,admin_option:true}]:[]};
  const alter=sql.match(/^ALTER ROLE sam_eval_runtime_20261024 VALID UNTIL '([^']+)'$/);
  if(alter){role.rolvaliduntil=alter[1];altered=true;return {rows:[]};}
  throw Error('UNEXPECTED_TEST_QUERY');
 }};
 return {client,queries,role,tables,policies,get committed(){return committed;}};
}
const mutations=f=>f.queries.filter(x=>/^(?:ALTER|GRANT|REVOKE|INSERT|UPDATE|DELETE|CREATE|DROP)\b/.test(x.sql));
test('operator target permits only exact internal database destination before credential prompt',()=>{
 const exact='postgresql://dpg-db37k3rbc2fs73csjung-a:5432/sam_trial_postgres';
 const accepted=operatorTarget(exact);assert.equal(accepted.hostname,'dpg-db37k3rbc2fs73csjung-a');assert.equal(accepted.port,'5432');assert.equal(accepted.pathname,'/sam_trial_postgres');
 assert.equal(operatorTarget('postgres://dpg-db37k3rbc2fs73csjung-a/sam_trial_postgres').hostname,'dpg-db37k3rbc2fs73csjung-a');
 for(const value of [exact.replace('dpg-db37k3rbc2fs73csjung-a','wrong.invalid'),exact.replace('/sam_trial_postgres','/wrong_database'),
  exact.replace(':5432',':5433'),exact+'#wrong',exact.replace('postgresql:','https:'),'malformed',undefined]){
  assert.throws(()=>operatorTarget(value),/EXISTING_DATABASE_REQUIRED/);
 }
});
test('operator target rejects driver query overrides, duplicate parameters and unsafe TLS before credential assignment',()=>{
 const base='postgresql://dpg-db37k3rbc2fs73csjung-a:5432/sam_trial_postgres';
 const queries=['host=wrong.invalid','port=5433','user=synthetic_wrong_operator','password=synthetic_wrong_password','database=wrong_database',
  'hostaddr=192.0.2.1','service=synthetic_service','sslcert=synthetic.pem','HOST=wrong.invalid',
  'options=a&options=b','sslmode=require&sslmode=verify-full','options=a&%6fptions=b','sslmode=require&%73slmode=require'];
 for(const query of queries)assert.throws(()=>operatorTarget(base+'?'+query),/EXISTING_DATABASE_REQUIRED/,query);
 for(const mode of ['disable','allow','prefer','verify-ca','no-verify','', 'unknown']){
  assert.throws(()=>operatorTarget(base+'?sslmode='+mode),/EXISTING_DATABASE_REQUIRED/,'unsafe TLS '+mode);
 }
});
test('clean operator target cannot override pg driver destination or assigned synthetic operator credential',()=>{
 const operator='sam_trial_postgres_user',syntheticPassword='synthetic hidden fixture :@/?#%';
 for(const port of ['',':5432'])for(const tls of [undefined,'require','verify-full']){
  const input=new URL(`postgresql://synthetic_previous_user:synthetic_previous_password@dpg-db37k3rbc2fs73csjung-a${port}/sam_trial_postgres`);
  input.searchParams.set('options','-c role=synthetic_wrong_role -c search_path=synthetic_wrong_schema');
  if(tls)input.searchParams.set('sslmode',tls);
  const cleaned=operatorTarget(input.toString());
  assert.equal(cleaned.searchParams.get('options'),'-c search_path=pg_catalog');
  assert.deepEqual([...cleaned.searchParams.keys()].sort(),tls?['options','sslmode']:['options']);
  assert.equal(cleaned.searchParams.get('sslmode'),tls??null);
  // Same order as main, with a local synthetic value and no connection.
  cleaned.username=operator;cleaned.password=encodeURIComponent(syntheticPassword);
  const driver=parse(cleaned.toString());
  assert.equal(driver.host,'dpg-db37k3rbc2fs73csjung-a');assert.equal(driver.port,'5432');
  assert.equal(driver.database,'sam_trial_postgres');assert.equal(driver.user,operator);assert.equal(driver.password,syntheticPassword);
  assert.equal(driver.options,'-c search_path=pg_catalog');
  if(tls)assert.ok(driver.ssl);
 }
});
test('actual pg connection parameters retain fixed operator destination and safe options against inherited PGPORT and PGOPTIONS',()=>{
 const keys=['PGHOST','PGPORT','PGDATABASE','PGUSER','PGPASSWORD','PGOPTIONS'],before=Object.fromEntries(keys.map(key=>[key,process.env[key]]));
 try{
  Object.assign(process.env,{PGHOST:'synthetic_wrong_host.invalid',PGPORT:'6543',PGDATABASE:'synthetic_wrong_database',PGUSER:'synthetic_wrong_user',PGPASSWORD:'synthetic_wrong_password',PGOPTIONS:'-c role=synthetic_wrong_role -c search_path=synthetic_wrong_schema'});
  const cleaned=operatorTarget('postgresql://dpg-db37k3rbc2fs73csjung-a/sam_trial_postgres?options=-c%20role%3Dsynthetic_wrong_role');
  cleaned.username='sam_trial_postgres_user';const syntheticPassword='synthetic hidden fixture :@/?#%';cleaned.password=encodeURIComponent(syntheticPassword);
  const actual=new ConnectionParameters({connectionString:cleaned.toString()});
  assert.equal(actual.host,'dpg-db37k3rbc2fs73csjung-a');assert.equal(actual.port,5432);assert.equal(actual.database,'sam_trial_postgres');
  assert.equal(actual.user,'sam_trial_postgres_user');assert.equal(actual.password,syntheticPassword);assert.equal(actual.options,'-c search_path=pg_catalog');
 }finally{for(const key of keys){if(before[key]===undefined)delete process.env[key];else process.env[key]=before[key];}}
});
test('wrong operator or database refuses before transaction or ALTER',async()=>{
 for(const options of [{operator:'sam_runtime_app'},{database:'other_synthetic_database'}]){
  const f=fixture(options);await assert.rejects(renewExistingLogin(f.client),/EXISTING_OPERATOR_REQUIRED/);
  assert.equal(f.queries.length,1);assert.deepEqual(mutations(f),[]);
 }
});
test('active and unbounded exact logins refuse with no ALTER and roll back',async()=>{
 for(const rolvaliduntil of ['2026-10-28T12:00:00.001Z',null,Infinity,'infinity']){
  const f=fixture({role:{rolvaliduntil}});
  await assert.rejects(renewExistingLogin(f.client),/ACTIVE_OR_UNBOUNDED_LOGIN_MUST_NOT_EXTEND/);
  assert.deepEqual(mutations(f),[]);assert.equal(f.queries.at(-1).sql,'ROLLBACK');assert.equal(f.committed,false);
 }
});
test('expired exact login changes only VALID UNTIL within server-clock30min and preserves profile fingerprint',async()=>{
 const f=fixture(),before=await snapshot(f.client),result=await renewExistingLogin(f.client),after=await snapshot(f.client);
 assert.equal(result.role,ROLE);assert.equal(result.expiresAt,'2026-10-28T12:30:00.000Z');
 assert.ok(Date.parse(result.expiresAt)-Date.parse(clock)<=30*60*1000);
 assert.deepEqual(mutations(f).map(x=>x.sql),["ALTER ROLE sam_eval_runtime_20261024 VALID UNTIL '2026-10-28T12:30:00.000Z'"]);
 assert.equal(result.privilegeFingerprint,before.hash);assert.equal(after.hash,before.hash);
 assert.equal(result.grantsChanged,false);assert.equal(result.rlsChanged,false);assert.equal(result.passwordChanged,false);assert.equal(f.committed,true);
 assert.equal(f.queries.filter(x=>x.sql==='COMMIT').length,1);
});
test('snapshot ignores only expiry and server check time while fingerprinting ACL, RLS and policy identity',async()=>{
 const f=fixture(),before=await snapshot(f.client);
 f.role.rolvaliduntil='2026-10-28T12:30:00.000Z';f.role.checked_at='2026-10-28T12:01:00.000Z';
 assert.equal((await snapshot(f.client)).hash,before.hash);
 f.tables[0].relacl='different-acl';const acl=(await snapshot(f.client)).hash;assert.notEqual(acl,before.hash);
 f.tables[0].relforcerowsecurity=false;const rls=(await snapshot(f.client)).hash;assert.notEqual(rls,acl);
 f.policies[0].with_check='different scope';assert.notEqual((await snapshot(f.client)).hash,rls);
});
test('initial elevated role refuses without ALTER; profile changes after ALTER roll back',async()=>{
 for(const flag of ['rolsuper','rolinherit','rolcreaterole','rolcreatedb','rolreplication','rolbypassrls','database_create','schema_create']){
  const f=fixture({role:{[flag]:true}});await assert.rejects(renewExistingLogin(f.client),/EXISTING_RESTRICTED_PROFILE_REQUIRED/);
  assert.deepEqual(mutations(f),[]);assert.equal(f.queries.at(-1).sql,'ROLLBACK');assert.equal(f.committed,false);
 }
 for(const options of [{elevatedAfter:true},...['acl','rls','policy','membership'].map(changedAfter=>({changedAfter}))]){
  const f=fixture(options);await assert.rejects(renewExistingLogin(f.client),/EXISTING_RESTRICTED_PROFILE_REQUIRED|UNCHANGED_PRIVILEGES_REQUIRED/);
  assert.equal(mutations(f).length,1);assert.match(mutations(f)[0].sql,/^ALTER ROLE sam_eval_runtime_20261024 VALID UNTIL /);
  assert.equal(f.queries.at(-1).sql,'ROLLBACK');assert.equal(f.committed,false);assert.equal(f.role.rolvaliduntil,expired);
 }
});
