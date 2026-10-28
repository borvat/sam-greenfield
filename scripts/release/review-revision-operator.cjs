'use strict';
// Explicit one-shot operator migration; never imported by application startup.
const {readFileSync}=require('node:fs');
const {createHash}=require('node:crypto');
const {resolve}=require('node:path');
const readline=require('node:readline');
const {operatorTarget}=require('../../deploy/reliability-test/renewLogin.cjs');
const {hidden}=require('../provisioning/neon-migrator-once.cjs');
const FILE='00106_read_review_revisions.sql';
const OPERATOR='sam_trial_postgres_user';
const digest=value=>createHash('sha256').update(typeof value==='string'?value:JSON.stringify(value)).digest('hex');
function migrationPacket(root,expectedHash){
 if(!/^[a-f0-9]{64}$/.test(expectedHash??''))throw Error('REVIEWED_MIGRATION_HASH_REQUIRED');
 const sql=readFileSync(resolve(root,'packages/db/integration-migrations',FILE),'utf8');
 if(digest(sql)!==expectedHash)throw Error('REVIEWED_MIGRATION_HASH_MISMATCH');
 return {sql,sha256:expectedHash};
}
function operatorConfig(target,password){
 target.password=encodeURIComponent(password);
 return {connectionString:target.toString(),connectionTimeoutMillis:5000,statement_timeout:15000};
}
async function permissionSnapshot(c){
 return digest((await c.query(`SELECT c.relname,c.relrowsecurity,c.relforcerowsecurity,c.relacl::text,
  pg_get_userbyid(c.relowner) owner,
  (SELECT jsonb_agg(jsonb_build_object('name',p.polname,'roles',p.polroles,'cmd',p.polcmd,
   'permissive',p.polpermissive,'qual',pg_get_expr(p.polqual,p.polrelid),
   'check',pg_get_expr(p.polwithcheck,p.polrelid)) ORDER BY p.polname)
   FROM pg_policy p WHERE p.polrelid=c.oid) policies
  FROM pg_class c JOIN pg_namespace n ON c.relnamespace=n.oid
  WHERE n.nspname='public' AND c.relkind IN ('r','p') ORDER BY c.relname`)).rows);
}
async function applyReviewedMigration(c,packet){
 const who=(await c.query('SELECT current_user AS operator,current_database() AS database')).rows[0];
 if(who?.operator!==OPERATOR||who.database!=='sam_trial_postgres')throw Error('EXISTING_OPERATOR_REQUIRED');
 await c.query('BEGIN');
 try{
  await c.query('SET LOCAL search_path=public,pg_catalog');
  await c.query("SET LOCAL lock_timeout='5s'");
  await c.query("SELECT pg_advisory_xact_lock(hashtext('sam-integration-migrations'))");
  const previous=(await c.query('SELECT sha256 FROM sam_integration_migrations WHERE filename=$1',[FILE])).rows[0];
  if(previous){if(previous.sha256!==packet.sha256)throw Error('INTEGRATION_MIGRATION_HASH_MISMATCH');await c.query('COMMIT');return {status:'ALREADY_APPLIED',filename:FILE,sha256:packet.sha256};}
  const owner=(await c.query("SELECT pg_get_userbyid(relowner) owner FROM pg_class WHERE oid='public.goal_read_reviews'::regclass")).rows[0];
  if(owner?.owner!==OPERATOR)throw Error('EXISTING_SCHEMA_OWNER_REQUIRED');
  const before=await permissionSnapshot(c);
  await c.query(packet.sql);
  if(await permissionSnapshot(c)!==before)throw Error('PERMISSIONS_CHANGED');
  await c.query('INSERT INTO sam_integration_migrations(filename,sha256) VALUES($1,$2)',[FILE,packet.sha256]);
  await c.query('COMMIT');
  return {status:'APPLIED',filename:FILE,sha256:packet.sha256,permissionFingerprint:before,grantsChanged:false,rlsChanged:false,credentialsChanged:false};
 }catch(e){await c.query('ROLLBACK');throw e;}
}
async function main(){
 if(process.argv.length!==4||process.argv[2]!=='--prepare'||process.env.RENDER_SERVICE_ID!=='srv-db37vbvlk1mc739o0b70')throw Error('EXACT_OPERATOR_PREPARATION_REQUIRED');
 const packet=migrationPacket(process.cwd(),process.argv[3]);
 const target=operatorTarget(process.env.DATABASE_URL);target.username=OPERATOR;
 console.log('REVIEWED_MIGRATION '+JSON.stringify({filename:FILE,sha256:packet.sha256,schema:'public',changes:'immutable report revision constraints only',applied:false}));
 const config=operatorConfig(target,await hidden('Existing database operator password (hidden; never paste into chat): '));
 const {Client}=require('pg');
 const c=new Client(config);config.connectionString='';
 try{
  await c.connect();target.password='';
  const who=(await c.query('SELECT current_user AS operator,current_database() AS database')).rows[0];
  if(who?.operator!==OPERATOR||who.database!=='sam_trial_postgres')throw Error('EXISTING_OPERATOR_REQUIRED');
  console.log('READY_FOR_REVIEW_REVISION_MIGRATION — authenticated only; no changes applied. Coordinator sends APPLY_REVIEW_REVISION_00106. Session expires in5min.');
  const input=readline.createInterface({input:process.stdin,output:process.stdout});
  const command=await new Promise(resolveCommand=>{const t=setTimeout(()=>resolveCommand('TIMEOUT'),300000);input.once('line',line=>{clearTimeout(t);resolveCommand(line);});});input.close();
  if(command!=='APPLY_REVIEW_REVISION_00106')throw Error('SAFE_CANCELLED');
  console.log('REVIEW_REVISION_MIGRATION '+JSON.stringify(await applyReviewedMigration(c,packet)));
 }finally{target.password='';await c.end();}
}
module.exports={migrationPacket,applyReviewedMigration,permissionSnapshot,operatorConfig};
if(require.main===module)main().catch(e=>{if(process.stdin.isTTY)process.stdin.setRawMode(false);console.error('REVIEW_REVISION_BLOCKED '+(/^[A-Z_]+$/.test(e?.message??'')?e.message:String(e.code??'DETAILS_WITHHELD')));process.exitCode=1;});
