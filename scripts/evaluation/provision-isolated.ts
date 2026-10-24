/** Explicit operator setup for a NEW isolated synthetic schema and principal.
 * Never imported by startup. The operator connection is read from a non-echoing
 * terminal, never argv/environment/files; only the NEW restricted connection is
 * persisted in an owner-private directory. No live/model activation occurs.
 */
import {Client} from 'pg';
import {randomUUID,createHash} from 'node:crypto';
import {readFileSync,readdirSync} from 'node:fs';
import {mkdir,writeFile,chmod,unlink} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {pathToFileURL} from 'node:url';
import assert from 'node:assert/strict';
import {provisionIntegrationAccess,assertIntegrationAccess} from '../../packages/db/src/integrationProfile';
import {provisionSpecialistAccess} from '../../packages/db/src/specialistProfile';
import {provisionEvaluationAccess,enrollEvaluationCompany,assertEvaluationAccess} from '../../packages/db/src/evaluationProfile';
import {assertSharedGoalProfile} from '../../packages/db/src/sharedGoalProfile';

export function scope(schema:string,role:string){
 const valid=/^sam_eval_[a-z0-9_]{1,35}$/;
 if(!valid.test(schema)||!valid.test(role)||schema===role)throw Error('ISOLATED_SCOPE_REQUIRED');
 return {schema,role};
}
async function hiddenConnection(){
 if(!process.stdin.isTTY||!process.stdin.setRawMode)throw Error('PRIVATE_TERMINAL_REQUIRED');
 return new Promise<string>((accept,reject)=>{
  let value='';const prior=process.stdin.isRaw;
  const finish=(cancelled:boolean)=>{process.stdin.off('data',data);process.stdin.off('end',end);
   process.stdin.setRawMode(prior);process.stdin.pause();process.stdout.write('\n');
   cancelled?reject(Error('PRIVATE_INPUT_CANCELLED')):accept(value);};
  const end=()=>finish(true);
  const data=(b:Buffer)=>{for(const ch of b.toString('utf8')){
   if(ch==='\r'||ch==='\n'){finish(false);return;}
   if(ch==='\u0003'||ch==='\u0004'||value.length>=16000){finish(true);return;}
   if(ch==='\u007f')value=value.slice(0,-1);else value+=ch;
  }};
  process.stdin.setRawMode(true);process.stdin.resume();process.stdin.on('data',data);process.stdin.once('end',end);
  process.stdout.write('ADMIN_CONNECTION_READY\n');
 });
}
const literal=(s:string)=>"'"+s.replaceAll("'","''")+"'";
async function applyDirectory(c:Client,directory:string,receipt:string){
 await c.query(`CREATE TABLE ${receipt}(filename text PRIMARY KEY,sha256 text NOT NULL,applied_at timestamptz NOT NULL DEFAULT now())`);
 const files=readdirSync(directory).filter(f=>f.endsWith('.sql')).sort();
 for(const filename of files){const sql=readFileSync(join(directory,filename),'utf8');
  await c.query(sql);await c.query(`INSERT INTO ${receipt}(filename,sha256) VALUES($1,$2)`,[filename,createHash('sha256').update(sql).digest('hex')]);}
 return files.length;
}
async function denied(c:Client,sql:string,params?:unknown[]){
 await c.query('SAVEPOINT deny_probe');let code:string|undefined;
 try{await c.query(sql,params);}catch(e){code=(e as {code?:string}).code;}
 await c.query('ROLLBACK TO SAVEPOINT deny_probe');await c.query('RELEASE SAVEPOINT deny_probe');
 if(code!=='42501')throw Error('ISOLATION_DENIAL_NOT_PROVEN');
}
export async function provision(connectionString:string,schema:string,role:string,directory:string){
 scope(schema,role);const original=new URL(connectionString);
 if(!['postgres:','postgresql:'].includes(original.protocol))throw Error('POSTGRES_CONNECTION_REQUIRED');
 const c=new Client({connectionString,connectionTimeoutMillis:5000,statement_timeout:15000});
 let connected=false,begun=false,committed=false,privatePath:string|undefined;
 const org=randomUUID(),entity=randomUUID(),foreignOrg=randomUUID(),foreignEntity=randomUUID();
 let phase='CONNECT';
 try{
  await c.connect();connected=true;
  await c.query('BEGIN');begun=true;
  await c.query("SET LOCAL lock_timeout='5s'");
  await c.query('SET LOCAL row_security=on');
  await c.query('SELECT pg_advisory_xact_lock(hashtextextended($1,0))',['sam-isolated-setup:'+schema]);
  phase='ADMIN_PREFLIGHT';
  const op=(await c.query(`SELECT current_user=pg_get_userbyid(d.datdba) AS owns_database,r.rolcreaterole,
   current_setting('log_statement') AS logs,current_setting('pgaudit.log',true) AS audit
   FROM pg_database d JOIN pg_roles r ON r.rolname=current_user WHERE d.datname=current_database()`)).rows[0];
  if(!op?.owns_database||!op.rolcreaterole||op.logs!=='none'||!['none','',null].includes(op.audit))throw Error('ADMIN_PREFLIGHT_DENIED');
  if((await c.query('SELECT 1 FROM pg_namespace WHERE nspname=$1 UNION ALL SELECT 1 FROM pg_roles WHERE rolname=$2',[schema,role])).rowCount)throw Error('NEW_SCOPE_REQUIRED');
  if(!(await c.query("SELECT 1 FROM pg_extension WHERE extname='pgcrypto'")).rowCount)throw Error('EXISTING_CRYPTO_EXTENSION_REQUIRED');
  phase='CREATE_ISOLATED_SCOPE';
  await c.query(`CREATE ROLE "${role}" NOLOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS NOINHERIT`);
  await c.query(`CREATE SCHEMA "${schema}"`);
  await c.query(`REVOKE ALL ON SCHEMA "${schema}" FROM PUBLIC`);
  await c.query(`SET LOCAL search_path TO "${schema}",pg_catalog,public`);
  phase='ISOLATED_MIGRATIONS';
  const core=await applyDirectory(c,'packages/db/migrations','sam_schema_migrations');
  const integration=await applyDirectory(c,'packages/db/integration-migrations','sam_integration_migrations');
  const specialist=await applyDirectory(c,'packages/db/specialist-migrations','sam_specialist_migrations');
  const evaluation=await applyDirectory(c,'packages/db/evaluation-migrations','sam_evaluation_migrations');
  await c.query(readFileSync('packages/db/shared-goal-profile/001_shared_coordinator.sql','utf8'));
  await c.query(`ALTER FUNCTION specialist_execution_live_guard() SET search_path TO "${schema}",pg_catalog,public,pg_temp`);
  phase='SYNTHETIC_ENROLLMENT';
  await c.query("INSERT INTO organizations(id,name) VALUES($1,'Synthetic evaluation'),($2,'Synthetic isolation control')",[org,foreignOrg]);
  await c.query("INSERT INTO legal_entities(id,org_id,name) VALUES($1,$2,'Synthetic evaluation'),($3,$4,'Synthetic isolation control')",[entity,org,foreignEntity,foreignOrg]);
  await enrollEvaluationCompany(c as any,entity);
  phase='INTEGRATION_GRANTS';const p={schema,role,orgId:org,legalEntityId:entity};
  await c.query("SELECT set_config('app.current_org_id',$1,true),set_config('app.current_legal_entity_id',$2,true)",[org,entity]);
  await provisionIntegrationAccess(c as any,p);
  phase='SPECIALIST_GRANTS';await provisionSpecialistAccess(c as any,p);
  phase='EVALUATION_GRANTS';await provisionEvaluationAccess(c as any,p);
  await c.query(`ALTER ROLE "${role}" SET search_path TO "${schema}",pg_catalog,public`);
  await c.query(`ALTER ROLE "${role}" SET app.current_org_id TO ${literal(org)}`);
  await c.query(`ALTER ROLE "${role}" SET app.current_legal_entity_id TO ${literal(entity)}`);
  phase='PRODUCTION_ACCESS_DENIAL';
  const leaked=(await c.query(`SELECT count(*)::int n FROM pg_class t JOIN pg_namespace n ON n.oid=t.relnamespace
   WHERE n.nspname='public' AND t.relkind IN ('r','p') AND
   (has_table_privilege($1,t.oid,'SELECT') OR has_table_privilege($1,t.oid,'INSERT') OR has_table_privilege($1,t.oid,'UPDATE') OR has_table_privilege($1,t.oid,'DELETE'))`,[role])).rows[0];
  if(leaked.n!==0)throw Error('PUBLIC_TABLE_ACCESS_DENIED');
  const definer=(await c.query(`SELECT count(*)::int n FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
   WHERE n.nspname='public' AND p.prosecdef AND has_function_privilege($1,p.oid,'EXECUTE')`,[role])).rows[0];
  if(definer.n!==0)throw Error('PUBLIC_DEFINER_REVIEW_REQUIRED');
  phase='PRIVATE_RUNTIME_CREDENTIAL';
  // The slow-statement log sees only this fixed DO body, never the generated
  // password. No operator credential is placed in a file or child environment.
  await c.query(`DO $private$ DECLARE secret text:=encode(gen_random_bytes(32),'hex'); BEGIN
   EXECUTE format('ALTER ROLE %I LOGIN PASSWORD %L VALID UNTIL %L',${literal(role)},secret,clock_timestamp()+interval '1 hour');
   PERFORM set_config('sam.private_new_role_password',secret,true);
   END $private$`);
  const password=(await c.query("SELECT current_setting('sam.private_new_role_password') value")).rows[0].value;
  await c.query("SELECT set_config('sam.private_new_role_password','',true)");
  const runtime=new URL(original);runtime.username=role;runtime.password=password;runtime.searchParams.delete('options');
  // Role defaults carry the immutable nominated context; the runtime cannot
  // acquire a second role or administrative privileges through this connection.
  await mkdir(directory,{mode:0o700});await chmod(directory,0o700);
  privatePath=join(directory,'restricted-connection.json');
  await writeFile(privatePath,JSON.stringify({schema,role,org,entity,connectionString:runtime.href}),{mode:0o600,flag:'wx'});
  phase='COMMIT';await c.query('COMMIT');begun=false;committed=true;
  phase='RESTRICTED_LOGIN_VALIDATION';
  const r=new Client({connectionString:runtime.href,connectionTimeoutMillis:5000,statement_timeout:5000});
  try{
   await r.connect();await r.query('BEGIN');
   await assertIntegrationAccess(r as any);await assertEvaluationAccess(r as any);await assertSharedGoalProfile(r as any);
   assert.equal((await r.query('SELECT count(*)::int n FROM legal_entities')).rows[0].n,1);
   await denied(r,'SELECT id FROM public.goals LIMIT 0');
   await denied(r,`CREATE TABLE "${schema}".forbidden_probe(id int)`);
   await r.query("SELECT set_config('app.current_org_id',$1,true),set_config('app.current_legal_entity_id',$2,true)",[foreignOrg,foreignEntity]);
   assert.equal((await r.query('SELECT count(*)::int n FROM legal_entities')).rows[0].n,0);
   await denied(r,"INSERT INTO goals(business_id,company_scope,objective,state,authority_ceiling) VALUES($1,$2,'Synthetic denial probe','NEW','GREEN')",[randomUUID(),foreignEntity]);
   await r.query('ROLLBACK');
  }finally{await r.end();}
  return {status:'ISOLATED_SETUP_VERIFIED',schema,role,profiles:{core,integration,specialist,evaluation},
   checks:{restrictedLogin:true,profileAdmission:true,publicTablesDenied:true,ddlDenied:true,tenantSpoofDenied:true},
   credentialLifetimeMinutes:60,productionChanges:false,liveActivation:false,modelCalls:0};
 }catch(e){
  if(begun)await c.query('ROLLBACK').catch(()=>{});
  if(committed)await c.query(`ALTER ROLE "${role}" NOLOGIN`).catch(()=>{});
  if(privatePath)await unlink(privatePath).catch(()=>{});
  const message=e instanceof Error?e.message:'';
  const reason=/row.level security/i.test(message)?'ROW_SECURITY':/permission denied/i.test(message)?'PRIVILEGE':/owner/i.test(message)?'OWNERSHIP':'UNCLASSIFIED';
  const deniedObject=/^(?:permission denied for|query would be affected by row-level security policy for) (?:table|sequence|schema|function) "?([a-z_][a-z0-9_]*)"?$/.exec(message)?.[1]??null;
  throw Object.assign(Error('ISOLATED_SETUP_FAILED'),{phase,committed,sqlCode:(e as {code?:string}).code??null,reason,deniedObject});
 }finally{if(connected)await c.end();}
}
async function main(){
 const [schema,role,directory,...extra]=process.argv.slice(2);
 if(!schema||!role||!directory||extra.length)throw Error('SCOPE_AND_PRIVATE_DIRECTORY_REQUIRED');
 scope(schema,role);process.chdir(resolve(import.meta.dirname,'../..'));
 const connection=await hiddenConnection();
 console.log(JSON.stringify(await provision(connection,schema,role,resolve(directory))));
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href)
 main().catch(e=>{console.error(JSON.stringify({status:'ISOLATED_SETUP_FAILED',phase:e.phase??'LOCAL_VALIDATION',committed:e.committed??false,sqlCode:e.sqlCode??null,reason:e.reason??null,deniedObject:e.deniedObject??null}));process.exitCode=1;});
