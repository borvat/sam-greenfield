// Owner-only setup artifact. Not imported by production. Run in the pinned source checkout.
import pg from 'pg';
import {execFileSync} from 'node:child_process';
import {writeFileSync} from 'node:fs';
import {applySpecialistProfile,provisionSpecialistAccess,assertSpecialistAccess} from '../../../packages/db/src/specialistProfile';
import {assertRuntimeTenantBinding} from '../../../packages/db/src/runtimeAccess';
const PIN='bc95f24ca11ac104c575ab1aae3c6cf2b3f5ebc0';
const HOST='dpg-db37k3rbc2fs73csjung-a';
const DB='sam_trial_postgres';
const ROLE='sam_runtime_app';
const registrations=[
 ['derive_verified_evidence','Deterministic verified evidence replay','replayed','verified-evidence-replay-v1'],
 ['reason.research','Ordinary coordinator verified pointer replay','grounded','ordinary-specialist-pointer-replay-v1'],
 ['reason.records','Ordinary records specialist verified pointer replay','grounded','ordinary-specialist-pointer-replay-v1'],
];
function requireThat(ok:unknown,code:string):asserts ok {if(!ok)throw Error(code);}
function target(connection:string,existingRuntime=false){
 const u=new URL(connection);
 requireThat(['postgres:','postgresql:'].includes(u.protocol)&&u.hostname===HOST&&
  (!u.port||u.port==='5432')&&u.pathname==='/'+DB&&(existingRuntime||!u.search),'EXACT_INTERNAL_TARGET_REQUIRED');
 return u;
}
async function identity(c:pg.Client){return (await c.query(`SELECT current_user role,current_database() db,current_schema() schema,
 current_org_id() org,current_legal_entity_id() entity`)).rows[0];}
async function main(){
 requireThat(['preflight','apply'].includes(process.argv[2])&&process.argv.length===3,'MODE_REQUIRED');
 // The artifact is copied into an isolated checkout of PIN; application remains unchanged.
 requireThat(execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim()===PIN,'PINNED_CHECKOUT_REQUIRED');
 requireThat(execFileSync('git',['diff','HEAD','--','packages/db'],{encoding:'utf8'}).trim()==='','PROFILE_SOURCE_CHANGED');
 const runtimeUrl=process.env.DATABASE_URL;requireThat(runtimeUrl,'RUNTIME_CONNECTION_REQUIRED');target(runtimeUrl,true);
 const runtime=new pg.Client({connectionString:runtimeUrl,connectionTimeoutMillis:10000,statement_timeout:15000});
 let admin:pg.Client|undefined,phase='PREFLIGHT',inTransaction=false;
 try{
  await runtime.connect();const scope=await identity(runtime);
  requireThat(scope.role===ROLE&&scope.db===DB&&/^[a-z_][a-z0-9_]*$/.test(scope.schema),'RUNTIME_TARGET_MISMATCH');
  await assertRuntimeTenantBinding(runtime);
  console.log(JSON.stringify({phase,role:scope.role,database:scope.db,schema:scope.schema,org:scope.org,entity:scope.entity,pin:PIN}));
  if(process.argv[2]==='preflight')return;
  let raw='';for await(const chunk of process.stdin){raw+=chunk;requireThat(raw.length<16384,'INPUT_TOO_LARGE');}
  const input=JSON.parse(raw);raw='';const u=target(input.connection);
  requireThat(!['sam_runtime_app','sam_mcp_app'].includes(decodeURIComponent(u.username)),'ADMINISTRATOR_REQUIRED');
  admin=new pg.Client({connectionString:input.connection,connectionTimeoutMillis:10000,statement_timeout:30000});input.connection=undefined;
  await admin.connect();
  await admin.query('SET search_path TO "'+scope.schema+'",public');
  const rights=(await admin.query(`SELECT current_user role, current_database() db,
   pg_has_role(current_user,d.datdba,'USAGE') owns_database,
   has_schema_privilege(current_user,$1,'CREATE') creates_schema,
   pg_has_role(current_user,c.relowner,'USAGE') owns_executions
   FROM pg_database d JOIN pg_class c ON c.oid=to_regclass('executions') WHERE d.datname=current_database()`,[scope.schema])).rows[0];
  requireThat(rights?.db===DB&&rights.owns_database&&rights.creates_schema&&rights.owns_executions,'EXISTING_OBJECT_ADMINISTRATOR_REQUIRED');
  await admin.query("SELECT set_config('app.current_org_id',$1,false),set_config('app.current_legal_entity_id',$2,false)",[scope.org,scope.entity]);
  requireThat((await admin.query('SELECT 1 FROM legal_entities WHERE id=$1 AND org_id=$2',[scope.entity,scope.org])).rowCount===1,'TENANT_MISMATCH');
  await admin.query("SELECT set_config('app.current_org_id',$1,false),set_config('app.current_legal_entity_id',$2,false)",[scope.org,scope.entity]);
  await admin.query("SELECT set_config('lock_timeout','5000',false)");
  requireThat((await admin.query("SELECT pg_try_advisory_lock(hashtext('sam-owner-specialist-setup')) locked")).rows[0].locked,'SETUP_ALREADY_RUNNING');
  requireThat((await admin.query("SELECT count(*)::int n FROM work_queue WHERE status IN ('QUEUED','LEASED','EXECUTING','HANDBACK')")).rows[0].n===0,'PENDING_WORK_RECONCILIATION_REQUIRED');
  const existing=(await admin.query("SELECT to_regclass('sam_specialist_migrations') receipt,to_regclass('specialist_budgets') budgets")).rows[0];
  requireThat(!existing.receipt&&!existing.budgets,'EXISTING_OR_PARTIAL_SETUP_REQUIRES_RECONCILIATION');
  const provider=(await admin.query("SELECT provider_id,models,capabilities,cost_per_1k_input,cost_per_1k_output,privacy_class_allowed,health FROM model_providers WHERE provider_id='deepseek'")).rows;
  requireThat(provider.length===1&&Array.isArray(provider[0].capabilities)&&provider[0].models.includes('deepseek-flash'),'EXISTING_PROVIDER_MISMATCH');
  const prior=(await admin.query('SELECT capability_id,verification_method,required_evidence_fields,independent_query_template,must_not_trust_execution_result FROM verification_contracts WHERE capability_id=ANY($1::text[])',[registrations.map(r=>r[0])])).rows;
  for(const r of prior){const wanted=registrations.find(w=>w[0]===r.capability_id)!;
   requireThat(r.verification_method==='db_query'&&r.must_not_trust_execution_result===true&&
    JSON.stringify(r.required_evidence_fields)===JSON.stringify({[wanted[2]]:'boolean'})&&
    JSON.stringify(r.independent_query_template)===JSON.stringify({method:wanted[3]}),'REGISTRATION_MISMATCH');}
  // Nonsecret rollback metadata only; exclusive creation prevents overwriting prior evidence.
  writeFileSync('ordinary-setup-before.json',JSON.stringify({pin:PIN,scope,provider:provider[0],registrations:prior},null,2),{mode:0o600,flag:'wx'});
  phase='MIGRATIONS';console.log(phase);
  await applySpecialistProfile(admin as any); // Own transaction, exactly 00106/00107.
  phase='PROFILE_COMMITTED';console.log(phase);
  await admin.query('BEGIN');inTransaction=true;
  await provisionSpecialistAccess(admin as any,{schema:scope.schema,role:ROLE,orgId:scope.org,legalEntityId:scope.entity});
  for(const [id,description,field,method] of registrations)await admin.query(`INSERT INTO verification_contracts
   (capability_id,description,verification_method,required_evidence_fields,independent_query_template,must_not_trust_execution_result)
   VALUES($1,$2,'db_query',$3,$4,true) ON CONFLICT(capability_id) DO NOTHING`,[id,description,JSON.stringify({[field]:'boolean'}),JSON.stringify({method})]);
  await admin.query(`UPDATE model_providers SET cost_per_1k_input=0.0003,cost_per_1k_output=0.0012,
   capabilities=CASE WHEN capabilities @> '["specialist_reasoning"]'::jsonb THEN capabilities ELSE capabilities||'["specialist_reasoning"]'::jsonb END WHERE provider_id='deepseek'`);
  phase='COMMIT_PENDING';console.log(phase);
  await admin.query('COMMIT');inTransaction=false;phase='SETUP_COMMITTED';console.log(phase);
  await assertSpecialistAccess(runtime as any);
  console.log('RUNTIME_PROFILE_READBACK_PASS; deployment and live goals remain separate operator steps.');
 }catch(_error){
  if(admin&&inTransaction)try{await admin.query('ROLLBACK');}catch{}
  // Never emit driver messages, URLs, connection objects, stack, or raw input.
  console.error(JSON.stringify({status:'STOPPED',phase,code:_error instanceof Error&&/^[A-Z][A-Z_]{3,90}$/.test(_error.message)?_error.message:'DATABASE_OR_TRANSPORT_FAILURE',action:'Keep services paused; reconcile before retry. COMMIT_PENDING is uncertain.'}));
  process.exitCode=1;
 }finally{await runtime.end().catch(()=>{});if(admin)await admin.end().catch(()=>{});}
}
main().catch(()=>{console.error('SETUP_PREFLIGHT_FAILED');process.exitCode=1;});
