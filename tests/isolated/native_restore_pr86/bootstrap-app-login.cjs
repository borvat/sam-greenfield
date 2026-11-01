'use strict';
/** Prepared operator-only wrapper. No role creation, membership/ACL grant, production target or secret output. */
const fs=require('node:fs'),path=require('node:path'),{createRequire}=require('node:module'),crypto=require('node:crypto'),common=require('./common.cjs'),{ProcessRegistry}=require('./process-registry.cjs');
const registry=new ProcessRegistry();let interrupted=false;
for(const signal of ['SIGTERM','SIGINT'])process.once(signal,()=>{interrupted=true;void registry.stopAll(60000,5000);});
async function main(){
 const remaining=process.argv.slice(4);if(remaining.length&&!(remaining.length===2&&remaining[0]==='--resume-native-run2'&&path.isAbsolute(remaining[1])))throw Error('ONLY_PINNED_NATIVE_RUN2_RESUME_SUPPORTED');
 const configPath=path.resolve(process.argv[2]||''),out=path.resolve(process.argv[3]||''),c=common.config(configPath),artifacts=common.verifyRuntimeArtifacts(true);
 if(c.appRole!=='sam_runtime_app'||c.allowAppStubLoginBootstrap!==true||c.restoredStubHasNoOriginalCredentials!==true||!c.bootstrapReviewReference||/^FILL/.test(c.bootstrapReviewReference)||process.env.SAM_NATIVE_BOOTSTRAP_APPROVAL!=='ENABLE_RESTORED_TARGET_APP_LOGIN_ONCE')throw Error('EXPLICIT_RESTORED_STUB_BOOTSTRAP_REVIEW_REQUIRED');
 if(!/^[a-z_][a-z0-9_]{0,62}$/.test(c.operatorRole||'')||c.operatorRole===c.appRole||/^fill/.test(c.operatorRole))throw Error('EXACT_TARGET_OPERATOR_ROLE_PIN_REQUIRED');
 if(fs.existsSync(out))throw Error('FRESH_OUTPUT_DIRECTORY_REQUIRED');fs.mkdirSync(out,{recursive:true,mode:0o700});
 let url;try{url=new URL(process.env.SAM_NATIVE_OPERATOR_DATABASE_URL||'');}catch{throw Error('PRIVATE_TARGET_OPERATOR_URL_REQUIRED');}
 if(!['postgres:','postgresql:'].includes(url.protocol)||url.hostname!==c.hostname||decodeURIComponent(url.pathname.slice(1))!==c.databaseName||!url.username||decodeURIComponent(url.username)!==c.operatorRole||!url.password||url.searchParams.get('sslmode')!==(c.tlsMode==='internal-encrypted-unverified'?'require':'verify-full')||process.env.NODE_TLS_REJECT_UNAUTHORIZED==='0')throw Error('BOOTSTRAP_TARGET_OR_TLS_PIN_MISMATCH');
 for(const key of url.searchParams.keys())if(!['sslmode','connect_timeout','application_name','uselibpqcompat'].includes(key)||url.searchParams.getAll(key).length!==1)throw Error('BOOTSTRAP_URI_OVERRIDE_FORBIDDEN');
 if(url.searchParams.has('uselibpqcompat')&&(c.tlsMode!=='internal-encrypted-unverified'||url.searchParams.get('uselibpqcompat')!=='true'))throw Error('BOOTSTRAP_TLS_COMPATIBILITY_FLAG_FORBIDDEN');
 if(c.tlsMode==='internal-encrypted-unverified')url.searchParams.set('uselibpqcompat','true');
 const req=createRequire(path.join(common.root('forward'),'package.json')),{Client}=req('pg'),db=new Client({connectionString:url.href,...(c.tlsMode==='internal-encrypted-unverified'?{ssl:{rejectUnauthorized:false}}:{}),options:'-c search_path=public,pg_catalog',connectionTimeoutMillis:5000,statement_timeout:15000});
 const receipt={classification:'DISPOSABLE_RESTORE_APP_STUB_LOGIN_WINDOW',targetRenderId:c.targetRenderId,database:c.databaseName,role:c.appRole,reviewReference:c.bootstrapReviewReference,credentialsPersistedOrPrinted:false,roleCreated:false,aclOrMembershipChanged:false,runtimeArtifacts:artifacts};
 let enabled=false;
 try{
  await db.connect();const identity=(await db.query("SELECT current_database() db,session_user login,current_user active,current_setting('server_version_num')::int version")).rows[0];
  if(identity.db!==c.databaseName||identity.login!==identity.active||identity.login!==c.operatorRole||identity.version<150000||identity.version>=160000)throw Error('BOOTSTRAP_NATIVE_IDENTITY_MISMATCH');
  if((await db.query('SELECT ssl FROM pg_stat_ssl WHERE pid=pg_backend_pid()')).rows[0]?.ssl!==true)throw Error('BOOTSTRAP_ENCRYPTED_CONNECTION_REQUIRED');
  receipt.transport={mode:c.tlsMode,encrypted:true,certificateVerification:c.tlsMode==='verify-full'};
  const role=(await db.query('SELECT rolcanlogin,rolsuper,rolbypassrls,rolcreatedb,rolcreaterole,rolreplication FROM pg_roles WHERE rolname=$1',[c.appRole])).rows[0];
  if(!role||Object.values(role).some(Boolean))throw Error('RESTORED_ROLE_MUST_BE_NONLOGIN_UNPRIVILEGED');
  if((await db.query("SELECT count(*)::int n FROM pg_roles WHERE rolname<>$1 AND pg_has_role($1,oid,'MEMBER')",[c.appRole])).rows[0].n!==0)throw Error('RESTORED_ROLE_MEMBERSHIPS_FORBIDDEN');
  const owner=(await db.query("SELECT count(*)::int n FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname NOT LIKE 'pg_%' AND n.nspname<>'information_schema' AND c.relowner=(SELECT oid FROM pg_roles WHERE rolname=$1)",[c.appRole])).rows[0];
  if(owner.n!==0)throw Error('RESTORED_APP_ROLE_OBJECT_OWNERSHIP_FORBIDDEN');
  const ddl=(await db.query("SELECT has_schema_privilege($1,'public','CREATE') schema_create,has_database_privilege($1,current_database(),'CREATE') database_create,EXISTS(SELECT 1 FROM pg_class WHERE relnamespace='public'::regnamespace AND relkind IN('r','p') AND (has_table_privilege($1,oid,'TRIGGER') OR has_table_privilege($1,oid,'TRUNCATE'))) table_ddl",[c.appRole])).rows[0];
  if(Object.values(ddl).some(Boolean))throw Error('RESTORED_APP_ROLE_PERSISTENT_DDL_FORBIDDEN');
  const sessions=async()=>(await db.query('SELECT count(*)::int n FROM pg_stat_activity WHERE datname=current_database() AND usename=$1',[c.appRole])).rows[0].n;
  if(await sessions()!==0)throw Error('RESTORED_APP_ROLE_ALREADY_IN_USE');
  if(interrupted||Date.now()>=Date.parse(c.deadline))throw Error('BOOTSTRAP_WINDOW_CLOSED');
  // Generated characters contain no SQL quoting syntax; no caller text enters this DDL.
  const password=crypto.randomBytes(36).toString('base64url');
  await db.query(`ALTER ROLE sam_runtime_app LOGIN PASSWORD '${password}'`);enabled=true;receipt.enabledAt=new Date().toISOString();
  const app=new URL(url.href);app.username=c.appRole;app.password=password;
  const env={...common.baseEnvironment(app.href,c),SAM_NATIVE_APP_DATABASE_URL:app.href,SAM_NATIVE_DRILL_APPROVAL:'RUN_ISOLATED_NATIVE_SYNTHETIC_DRILL'};
  const child=registry.spawn(process.execPath,[path.join(__dirname,'run-native.cjs'),configPath,path.join(out,'drill'),...remaining],{cwd:__dirname,env,stdio:['ignore','pipe','pipe']},'armed-native-harness');child.stdout.on('data',()=>{});child.stderr.on('data',()=>{});
  try{const result=await registry.wait(child,15*60*1000);receipt.harnessProcess=result;if(result.exitCode!==0||result.signal)throw Error('NATIVE_HARNESS_BLOCKED_OR_FAILED');}
  finally{await registry.stop(child,60000,5000);}
  receipt.status='HARNESS_EXITED_ZERO; inspect native drill receipt for partial/blocked coverage';
 }catch(error){receipt.status='BLOCKED_OR_FAILED';receipt.error=common.safeError(error);throw error;}
 finally{
  receipt.processCleanup=await registry.stopAll(60000,5000);
  if(enabled){try{await db.query('ALTER ROLE sam_runtime_app NOLOGIN PASSWORD NULL');receipt.scrubbedAt=new Date().toISOString();receipt.restoredStubNoLogin=(await db.query("SELECT NOT rolcanlogin AS safe FROM pg_roles WHERE rolname='sam_runtime_app'")).rows[0]?.safe===true;receipt.remainingAppSessions=(await db.query("SELECT count(*)::int n FROM pg_stat_activity WHERE datname=current_database() AND usename='sam_runtime_app'")).rows[0].n;}catch(error){receipt.status='APP_ROLE_SCRUB_UNCONFIRMED';receipt.cleanupError=common.safeError(error);}}
  if(!receipt.processCleanup.allRegisteredChildrenClosed||(enabled&&(receipt.restoredStubNoLogin!==true||receipt.remainingAppSessions!==0))){receipt.status='BLOCKED_CLEANUP_INCOMPLETE';process.exitCode=1;}
  try{await db.end();}catch{}receipt.finishedAt=new Date().toISOString();common.writeJson(path.join(out,'app-login-bootstrap-receipt.json'),receipt);
 }
}
main().catch(error=>{console.error(JSON.stringify(common.safeError(error)));process.exitCode=1;});
