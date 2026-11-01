'use strict';
// Staged reviewed source only. Explicit operator action; never application startup.
const {readFileSync,lstatSync}=require('node:fs');
const {createHash}=require('node:crypto');
const {resolve}=require('node:path');
const {createRequire}=require('node:module');
const readline=require('node:readline');
const FILE='00107_owner_notification_delivery_access.sql';
const SQL_SHA='e540bf2a973e2fc053e4170992a5f67cfdc8785a579bb17a69e1c831acdcd6f9';
const PREVIOUS='00106_read_review_revisions.sql';
const PREVIOUS_SHA='b8a62b8b5de73dea82210965132523d27adfa3cf3d3ccc84bd9fa86f70826db2';
const OPERATOR='sam_trial_postgres_user',DATABASE='sam_trial_postgres',RUNTIME='sam_runtime_app';
const TOKEN='APPLY_OWNER_NOTIFICATION_DELIVERY_00107';
const SOURCE_FILES=[
 'scripts/release/owner-notification-delivery-operator.cjs',
 'packages/db/integration-migrations/'+FILE,'packages/db/integration-migrations/'+PREVIOUS,
 'packages/db/src/ownerNotificationDeliveryAccess.ts','deploy/reliability-test/renewLogin.cjs',
 'scripts/provisioning/neon-migrator-once.cjs','package-lock.json'
];
const digest=value=>createHash('sha256').update(typeof value==='string'||Buffer.isBuffer(value)?value:JSON.stringify(value)).digest('hex');
function sourceManifest(root){
 return SOURCE_FILES.map(filename=>{
  const path=resolve(root,filename);if(lstatSync(path).isSymbolicLink())throw Error('REVIEWED_SOURCE_SYMLINK_REFUSED');
  return {filename,sha256:digest(readFileSync(path))};
 });
}
function reviewedPacket(root,sqlHash,sourceHash){
 if(!/^[a-f0-9]{64}$/.test(sqlHash??'')||!/^[a-f0-9]{64}$/.test(sourceHash??''))throw Error('REVIEWED_HASHES_REQUIRED');
 const manifest=sourceManifest(root);
 if(digest(manifest)!==sourceHash)throw Error('REVIEWED_SOURCE_HASH_MISMATCH');
 const sql=readFileSync(resolve(root,'packages/db/integration-migrations',FILE),'utf8');
 if(sqlHash!==SQL_SHA||digest(sql)!==SQL_SHA||manifest.find(x=>x.filename.endsWith(PREVIOUS)).sha256!==PREVIOUS_SHA)
  throw Error('REVIEWED_MIGRATION_HASH_MISMATCH');
 return {filename:FILE,sql,sha256:SQL_SHA,sourceSha256:sourceHash};
}
async function identity(c){
 const row=(await c.query(`SELECT current_user AS operator,session_user AS login,current_database() AS database,
  current_setting('server_version_num')::int/10000 AS major,
  COALESCE((SELECT ssl FROM pg_stat_ssl WHERE pid=pg_backend_pid()),false) AS ssl`)).rows[0];
 if(row?.operator!==OPERATOR||row.login!==OPERATOR||row.database!==DATABASE||row.major!==15||row.ssl!==true)
  throw Error('EXISTING_PG15_SSL_OPERATOR_REQUIRED');
}
async function readPrincipal(c){
 const row=(await c.query(`SELECT pg_get_expr(p.polqual,p.polrelid) qual FROM pg_policy p
  JOIN pg_class t ON t.oid=p.polrelid JOIN pg_namespace n ON n.oid=t.relnamespace
  WHERE n.nspname='public' AND t.relname='owner_notifications'
   AND p.polname='integration_fence_sam_runtime_app' AND NOT p.polpermissive AND p.polcmd='*'
   AND p.polroles=ARRAY[(SELECT oid FROM pg_roles WHERE rolname=$1)]`,[RUNTIME])).rows[0];
 const expression=String(row?.qual??'').replace(/[\s()"]/g,'').toLowerCase();
 const uuid='([a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12})';
 const tail=expression.match(new RegExp("and(?:public\\.)?current_org_id='"+uuid+"'::uuidand(?:public\\.)?current_legal_entity_id='"+uuid+"'::uuid$"));
 if(!tail||/\bOR\b/i.test(row.qual))throw Error('EXISTING_RUNTIME_TENANT_FENCE_REQUIRED');
 return {schema:'public',role:RUNTIME,orgId:tail[1],legalEntityId:tail[2]};
}
async function securitySnapshot(c){
 return (await c.query(`SELECT c.relname,c.relrowsecurity,c.relforcerowsecurity,c.relacl::text,
  pg_get_userbyid(c.relowner) owner,
  (SELECT jsonb_agg(jsonb_build_object('column',a.attname,'acl',a.attacl::text) ORDER BY a.attnum)
   FROM pg_attribute a WHERE a.attrelid=c.oid AND a.attnum>0 AND NOT a.attisdropped AND a.attacl IS NOT NULL) column_acls,
  (SELECT jsonb_agg(jsonb_build_object('name',p.polname,'roles',p.polroles,'cmd',p.polcmd,'permissive',p.polpermissive,
    'qual',pg_get_expr(p.polqual,p.polrelid),'check',pg_get_expr(p.polwithcheck,p.polrelid)) ORDER BY p.polname)
   FROM pg_policy p WHERE p.polrelid=c.oid) policies
  FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
  WHERE n.nspname='public' AND c.relkind IN ('r','p') ORDER BY c.relname`)).rows;
}
async function applyMigration(c,packet){
 if(packet?.filename!==FILE||packet.sha256!==SQL_SHA||digest(packet.sql)!==SQL_SHA)throw Error('REVIEWED_MIGRATION_HASH_MISMATCH');
 await identity(c);
 await c.query('BEGIN');
 try{
  await c.query('SET LOCAL search_path=pg_catalog,public');
  await c.query("SET LOCAL lock_timeout='5s'");await c.query("SET LOCAL statement_timeout='15s'");
  await c.query("SELECT pg_advisory_xact_lock(hashtext('sam-integration-migrations'))");
  const previous=(await c.query('SELECT sha256 FROM public.sam_integration_migrations WHERE filename=$1',[PREVIOUS])).rows[0];
  if(previous?.sha256!==PREVIOUS_SHA)throw Error('EXACT_00106_LEDGER_REQUIRED');
  const existing=(await c.query('SELECT sha256 FROM public.sam_integration_migrations WHERE filename=$1',[FILE])).rows[0];
  if(existing&&existing.sha256!==SQL_SHA)throw Error('INTEGRATION_MIGRATION_HASH_MISMATCH');
  const before=await securitySnapshot(c),table=before.find(x=>x.relname==='notification_delivery_attempts');
  if(table?.owner!==OPERATOR)throw Error('EXISTING_NOTIFICATION_ATTEMPT_OWNER_REQUIRED');
  if(!existing)await c.query(packet.sql);
  const after=await securitySnapshot(c),actual=after.find(x=>x.relname==='notification_delivery_attempts');
  if(!actual?.relrowsecurity||!actual.relforcerowsecurity)throw Error('OWNER_DELIVERY_FORCED_RLS_REQUIRED');
  const expected=before.map(x=>x.relname==='notification_delivery_attempts'?{...x,relrowsecurity:true,relforcerowsecurity:true}:x);
  if(digest(after)!==digest(expected))throw Error('UNEXPECTED_MIGRATION_SECURITY_CHANGE');
  if(!existing)await c.query('INSERT INTO public.sam_integration_migrations(filename,sha256) VALUES($1,$2)',[FILE,SQL_SHA]);
  await c.query('COMMIT');
  return {status:existing?'ALREADY_APPLIED':'APPLIED',filename:FILE,sha256:SQL_SHA,securitySha256:digest(after),
   application8aCompatible:true,attemptsForcedRls:true,grantsApplied:false,deliveryActivated:false};
 }catch(error){await c.query('ROLLBACK');throw error;}
}
async function applyActivation(c,packet,principal,provisionAccess){
 const migration=await applyMigration(c,packet);
 try{
  const access=await provisionAccess(c,principal);
  return {status:'OWNER_DELIVERY_ACCESS_PROVISIONED',migration,access,deliveryActivated:false,credentialsChanged:false,providerInvoked:false};
 }catch(error){
  // 00107 stays committed. Inspect the separate access transaction after failure.
  return {status:'MIGRATION_APPLIED_ACCESS_FAILED',migration,accessProvisioned:false,
   accessOutcome:'UNCONFIRMED_INSPECT_CURRENT_SCOPE',attemptsForcedRls:true,grantFailureCode:/^[A-Z_]+$/.test(error?.message??'')?error.message:'PRIVATE_DIAGNOSTICS_WITHHELD',
   recovery:'PRESERVE_00107_AND_INSPECT_EXISTING_SCOPE_BEFORE_RETRY',application8aCompatible:true,
   deliveryActivated:false,credentialsChanged:false,providerInvoked:false};
 }
}
function awaitApply(input,timeoutMs=300000){
 return new Promise(resolveCommand=>{
  let finished=false;const finish=value=>{if(finished)return;finished=true;clearTimeout(timer);input.removeListener('line',line);input.removeListener('close',closed);resolveCommand(value);};
  const line=value=>finish(value),closed=()=>finish('CLOSED');
  const timer=setTimeout(()=>finish('TIMEOUT'),timeoutMs);input.once('line',line);input.once('close',closed);
 });
}
async function main(){
 const root=resolve(__dirname,'../..');
 if(process.argv.length===3&&process.argv[2]==='--manifest'){
  const files=sourceManifest(root);console.log(JSON.stringify({files,sha256:digest(files),migrationSha256:SQL_SHA}));return;
 }
 if(process.argv.length!==5||process.argv[2]!=='--prepare'||process.env.RENDER_SERVICE_ID!=='srv-db37vbvlk1mc739o0b70')
  throw Error('EXACT_OPERATOR_PREPARATION_REQUIRED');
 const packet=reviewedPacket(root,process.argv[3],process.argv[4]);
 if(digest(readFileSync(resolve(process.cwd(),'package-lock.json')))!==sourceManifest(root).find(x=>x.filename==='package-lock.json').sha256)
  throw Error('EXISTING_RUNTIME_DEPENDENCY_LOCK_REQUIRED');
 const {operatorTarget}=require('../../deploy/reliability-test/renewLogin.cjs');
 const {hidden}=require('../provisioning/neon-migrator-once.cjs');
 const target=operatorTarget(process.env.DATABASE_URL);target.username=OPERATOR;
 if(!target.searchParams.has('sslmode'))target.searchParams.set('sslmode','require');
 const access=require('../../packages/db/src/ownerNotificationDeliveryAccess.ts');
 if(typeof access.provisionOwnerNotificationDeliveryAccess!=='function')throw Error('REVIEWED_ACCESS_MODULE_REQUIRED');
 console.log('REVIEWED_OWNER_DELIVERY_PACKET '+JSON.stringify({filename:FILE,sha256:packet.sha256,sourceSha256:packet.sourceSha256,
  role:RUNTIME,scope:'EXISTING_FIXED_TENANT_ONLY',deliveryActivated:false}));
 target.password=encodeURIComponent(await hidden('Existing database operator password (hidden; never paste into chat): '));
 const {Client}=createRequire(resolve(process.cwd(),'package.json'))('pg');
 const config={connectionString:target.toString(),connectionTimeoutMillis:5000,statement_timeout:15000};
 const c=new Client(config);config.connectionString='';
 try{
  await c.connect();target.password='';await identity(c);
  const predecessor=(await c.query('SELECT sha256 FROM public.sam_integration_migrations WHERE filename=$1',[PREVIOUS])).rows[0];
  if(predecessor?.sha256!==PREVIOUS_SHA)throw Error('EXACT_00106_LEDGER_REQUIRED');
  const principal=await readPrincipal(c);
  console.log('READY_FOR_OWNER_DELIVERY_ACCESS '+JSON.stringify({authenticatedOnly:true,principal,filename:FILE,
   migrationSha256:packet.sha256,sourceSha256:packet.sourceSha256,expiresInSeconds:300,applyToken:TOKEN,
   deliveryActivated:false,providerInvoked:false,newProductionApprovalRequired:true}));
  const input=readline.createInterface({input:process.stdin,output:process.stdout});
  const command=await awaitApply(input);input.close();if(command!==TOKEN)throw Error('SAFE_CANCELLED');
  const result=await applyActivation(c,packet,principal,access.provisionOwnerNotificationDeliveryAccess);
  console.log('OWNER_DELIVERY_OPERATOR_RESULT '+JSON.stringify(result));
  if(result.status!=='OWNER_DELIVERY_ACCESS_PROVISIONED')process.exitCode=1;
 }finally{target.password='';await c.end();}
}
module.exports={sourceManifest,reviewedPacket,identity,readPrincipal,applyMigration,applyActivation,awaitApply,FILE,SQL_SHA,PREVIOUS_SHA,TOKEN};
if(require.main===module)main().catch(error=>{
 if(process.stdin.isTTY)process.stdin.setRawMode(false);
 console.error('OWNER_DELIVERY_OPERATOR_BLOCKED '+(/^[A-Z_]+$/.test(error?.message??'')?error.message:String(error?.code??'DETAILS_WITHHELD')));process.exitCode=1;
});
