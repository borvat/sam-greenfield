'use strict';
// Explicit operator-only renewal. Never imported by application startup.
const {createHash}=require('node:crypto');
const {createRequire}=require('node:module');
const {resolve}=require('node:path');
const readline=require('node:readline');
const ROLE='sam_eval_runtime_20261024',SCHEMA='sam_eval_20261024';
const OPERATOR='sam_trial_postgres_user';

function operatorTarget(value){
 let u;try{u=new URL(value??'');}catch{throw Error('EXISTING_DATABASE_REQUIRED');}
 if(!['postgres:','postgresql:'].includes(u.protocol)||u.hostname!=='dpg-db37k3rbc2fs73csjung-a'||u.pathname!=='/sam_trial_postgres'||u.hash||!['','5432'].includes(u.port))throw Error('EXISTING_DATABASE_REQUIRED');
 const keys=[...u.searchParams.keys()];
 if(new Set(keys).size!==keys.length||keys.some(k=>!['options','sslmode'].includes(k))||
  u.searchParams.has('sslmode')&&!['require','verify-full'].includes(u.searchParams.get('sslmode')))throw Error('EXISTING_DATABASE_REQUIRED');
 // Operator metadata queries use explicit schema names. Never inherit the
 // application's startup options (including a possible role/tenant override).
 const clean=new URL(u);clean.search='';clean.port='5432';
 clean.searchParams.set('options','-c search_path=pg_catalog');
 if(u.searchParams.has('sslmode'))clean.searchParams.set('sslmode',u.searchParams.get('sslmode'));
 return clean;
}

async function snapshot(client){
 const role=(await client.query(`SELECT rolname,rolsuper,rolinherit,rolcreaterole,rolcreatedb,rolcanlogin,
  rolreplication,rolconnlimit,rolbypassrls,rolvaliduntil,clock_timestamp() checked_at,
  ARRAY(SELECT x FROM unnest(rolconfig) x WHERE x LIKE 'search_path=%') search_path,
  has_database_privilege(rolname,current_database(),'CREATE') database_create,
  has_schema_privilege(rolname,'${SCHEMA}','CREATE') schema_create
  FROM pg_roles WHERE rolname=$1`,[ROLE])).rows[0];
 const tables=(await client.query(`SELECT c.relname,c.relowner,c.relrowsecurity,c.relforcerowsecurity,c.relacl::text
  FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname=$1 ORDER BY c.relname,c.oid`,[SCHEMA])).rows;
 const policies=(await client.query('SELECT tablename,policyname,roles::text,cmd,qual,with_check FROM pg_policies WHERE schemaname=$1 ORDER BY tablename,policyname',[SCHEMA])).rows;
 const memberships=(await client.query('SELECT roleid,member,admin_option FROM pg_auth_members WHERE roleid=(SELECT oid FROM pg_roles WHERE rolname=$1) OR member=(SELECT oid FROM pg_roles WHERE rolname=$1) ORDER BY roleid,member',[ROLE])).rows;
 if(!role||role.rolsuper||role.rolinherit||role.rolcreaterole||role.rolcreatedb||!role.rolcanlogin||role.rolreplication||role.rolbypassrls||role.database_create||role.schema_create||
  role.search_path?.length!==1||role.search_path[0].replaceAll(' ','')!==`search_path=${SCHEMA},pg_catalog,public`||tables.length===0||policies.length===0)throw Error('EXISTING_RESTRICTED_PROFILE_REQUIRED');
 const {rolvaliduntil,checked_at,...stableRole}=role;
 return {role,hash:createHash('sha256').update(JSON.stringify({role:stableRole,tables,policies,memberships})).digest('hex')};
}

async function renewExistingLogin(client){
 const who=(await client.query('SELECT current_user AS operator,current_database() AS database')).rows[0];
 if(who?.operator!==OPERATOR||who.database!=='sam_trial_postgres')throw Error('EXISTING_OPERATOR_REQUIRED');
 await client.query('BEGIN');
 try{
  await client.query("SELECT pg_advisory_xact_lock(hashtext('sam-ui-acceptance-20261028:existing-login-renewal'))");
  const before=await snapshot(client);
  const oldExpiry=new Date(before.role.rolvaliduntil).getTime(),serverNow=new Date(before.role.checked_at).getTime();
  if(before.role.rolvaliduntil===null||!Number.isFinite(oldExpiry)||!Number.isFinite(serverNow)||oldExpiry>serverNow)throw Error('ACTIVE_OR_UNBOUNDED_LOGIN_MUST_NOT_EXTEND');
  const expires=new Date(serverNow+30*60*1000).toISOString();
  // The sole mutation: exact existing role, server-clock-derived30min expiry.
  await client.query(`ALTER ROLE ${ROLE} VALID UNTIL '${expires}'`);
  const after=await snapshot(client);
  if(after.hash!==before.hash||new Date(after.role.rolvaliduntil).toISOString()!==expires)throw Error('UNCHANGED_PRIVILEGES_REQUIRED');
  await client.query('COMMIT');
  const committed=await snapshot(client);
  if(committed.hash!==before.hash)throw Error('POST_COMMIT_PROFILE_CHANGED');
  return {role:ROLE,expiresAt:expires,privilegeFingerprint:committed.hash,grantsChanged:false,rlsChanged:false,passwordChanged:false};
 }catch(e){await client.query('ROLLBACK');throw e;}
}

function hiddenPassword(){
 if(!process.stdin.isTTY||!process.stdout.isTTY||typeof process.stdin.setRawMode!=='function')throw Error('PRIVATE_OPERATOR_TTY_REQUIRED');
 return new Promise((resolvePassword,reject)=>{
  let value='';process.stdout.write('Existing database operator password (hidden; never paste into chat): ');
  process.stdin.setRawMode(true);process.stdin.resume();process.stdin.setEncoding('utf8');
  const finish=(error)=>{process.stdin.removeListener('data',read);process.stdin.setRawMode(false);process.stdin.pause();process.stdout.write('\n');error?reject(error):resolvePassword(value);value='';};
  const read=chunk=>{for(const c of chunk){if(c==='\u0003'){finish(Error('SAFE_CANCELLED'));return;}if(c==='\r'||c==='\n'){finish();return;}if(c==='\u007f'||c==='\b'){value=value.slice(0,-1);continue;}if(c>=' ')value+=c;}};
  process.stdin.on('data',read);
 });
}

async function main(){
 if(process.argv[2]!=='--prepare-renewal'||process.argv.length!==3||process.env.RENDER_SERVICE_ID!=='srv-db37vbvlk1mc739o0b70')throw Error('EXACT_OPERATOR_PREPARATION_REQUIRED');
 const u=operatorTarget(process.env.DATABASE_URL);
 u.username=OPERATOR;u.password=encodeURIComponent(await hiddenPassword());
 const {Client}=createRequire(resolve(process.cwd(),'package.json'))('pg');
 const c=new Client({connectionString:u.toString(),connectionTimeoutMillis:5000,statement_timeout:10000});
 try{
  await c.connect();u.password='';await snapshot(c);
  console.log('READY_FOR_BOUNDED_RENEWAL — authenticated only; lease not renewed. Parent sends RENEW_30_MINUTES. Session expires in5min.');
  const input=readline.createInterface({input:process.stdin,output:process.stdout});
  const command=await new Promise(resolveCommand=>{const t=setTimeout(()=>resolveCommand('TIMEOUT'),300000);input.once('line',line=>{clearTimeout(t);resolveCommand(line);});});
  input.close();
  if(command!=='RENEW_30_MINUTES')throw Error('SAFE_CANCELLED');
  console.log('BOUNDED_LOGIN_RENEWED '+JSON.stringify(await renewExistingLogin(c)));
 }finally{u.password='';await c.end();}
}
module.exports={snapshot,renewExistingLogin,operatorTarget};
if(require.main===module)main().catch(e=>{if(process.stdin.isTTY)process.stdin.setRawMode(false);console.error('BOUNDED_LOGIN_BLOCKED '+(/^[A-Z_]+$/.test(e?.message??'')?e.message:String(e.code??'DETAILS_WITHHELD')));process.exitCode=1;});
