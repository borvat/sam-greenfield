/** Operator-provisioned storage only. Startup never runs DDL, grants, migrations,
 * role renewal, enrollment, signing, provider lookup or a live model call. */
import {open,lstat} from 'node:fs/promises';
import {constants} from 'node:fs';
import {isAbsolute} from 'node:path';
import {Client} from 'pg';
import {assertIntegrationAccess} from '../../packages/db/src/integrationProfile';
import {assertEvaluationAccess} from '../../packages/db/src/evaluationProfile';
import {assertSharedGoalProfile} from '../../packages/db/src/sharedGoalProfile';
export type PersistentBinding={schema:string;role:string;org:string;entity:string;connectionString:string};
const uuid=/^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i;
export function validatePersistentBinding(value:unknown):PersistentBinding{
 const x=value as PersistentBinding;
 if(!x||typeof x!=='object'||Object.keys(x).sort().join(',')!=='connectionString,entity,org,role,schema'||
  !/^sam_eval_[a-z0-9_]{1,35}$/.test(x.schema)||!/^sam_eval_runtime_[a-z0-9_]{1,27}$/.test(x.role)||
  x.schema===x.role||!uuid.test(x.org)||!uuid.test(x.entity)||x.org===x.entity||typeof x.connectionString!=='string')throw Error('PERSISTENT_BINDING_INVALID');
 let u:URL;try{u=new URL(x.connectionString);}catch{throw Error('PERSISTENT_BINDING_INVALID');}
 const options=`-c search_path=${x.schema},pg_catalog,public -c app.current_org_id=${x.org} -c app.current_legal_entity_id=${x.entity}`;
 if(!['postgres:','postgresql:'].includes(u.protocol)||decodeURIComponent(u.username)!==x.role||!u.password||!u.hostname||!/^\/[a-zA-Z0-9_-]+$/.test(u.pathname)||
  u.hash||u.searchParams.get('options')!==options||[...u.searchParams.keys()].some(k=>!['options','sslmode'].includes(k))||
  u.searchParams.has('sslmode')&&!['require','verify-full'].includes(u.searchParams.get('sslmode')!))throw Error('PERSISTENT_BINDING_INVALID');
 return {...x};
}
export async function readPersistentBinding(path:string){
 if(!isAbsolute(path))throw Error('PRIVATE_BINDING_FILE_REQUIRED');
 const meta=await lstat(path);if(meta.isSymbolicLink())throw Error('PRIVATE_BINDING_FILE_REQUIRED');
 const f=await open(path,constants.O_RDONLY|constants.O_NOFOLLOW);
 try{const s=await f.stat();
  if(!s.isFile()||s.size<1||s.size>8192||(s.mode&0o077)!==0||s.uid!==process.getuid?.())throw Error('PRIVATE_BINDING_FILE_REQUIRED');
  const b=Buffer.alloc(8193);const {bytesRead}=await f.read(b,0,b.length,0);if(bytesRead!==s.size||bytesRead>8192)throw Error('PRIVATE_BINDING_FILE_REQUIRED');
  try{return validatePersistentBinding(JSON.parse(b.subarray(0,bytesRead).toString('utf8')));}catch{throw Error('PERSISTENT_BINDING_INVALID');}
 }finally{await f.close();}
}
export async function inspectPersistentBinding(c:any,b:PersistentBinding,
 assertions={integration:assertIntegrationAccess,evaluation:assertEvaluationAccess,shared:assertSharedGoalProfile}){
 let begun=false;
 try{
  await c.query('BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY');begun=true;
  const x=(await c.query(`SELECT current_schema() schema,current_user role,
   current_setting('app.current_org_id',true) org,current_setting('app.current_legal_entity_id',true) entity,
   current_setting('transaction_read_only') read_only,r.rolsuper,r.rolcreatedb,r.rolcreaterole,r.rolbypassrls,r.rolinherit,
   r.rolvaliduntil IS NOT NULL AND r.rolvaliduntil>now()+interval '5 minutes' valid,
   has_database_privilege(current_user,current_database(),'CREATE') can_create_schema
   FROM pg_roles r WHERE r.rolname=current_user`)).rows[0];
  if(!x||x.schema!==b.schema||x.role!==b.role||x.org!==b.org||x.entity!==b.entity||x.read_only!=='on'||
   x.rolsuper||x.rolcreatedb||x.rolcreaterole||x.rolbypassrls||x.rolinherit||x.can_create_schema||!x.valid)throw Error('PERSISTENT_PRINCIPAL_DENIED');
  await assertions.integration(c);await assertions.evaluation(c);await assertions.shared(c);
  const scope=(await c.query('SELECT id,org_id FROM legal_entities ORDER BY id')).rows;
  if(scope.length!==1||scope[0].id!==b.entity||scope[0].org_id!==b.org)throw Error('PERSISTENT_TENANT_DENIED');
  const access=(await c.query(`SELECT count(*)::int n FROM pg_class t JOIN pg_namespace n ON n.oid=t.relnamespace
   WHERE n.nspname='public' AND t.relkind IN ('r','p') AND
   (has_table_privilege(current_user,t.oid,'SELECT') OR has_table_privilege(current_user,t.oid,'INSERT') OR has_table_privilege(current_user,t.oid,'UPDATE') OR has_table_privilege(current_user,t.oid,'DELETE'))`)).rows[0];
  if(access?.n!==0)throw Error('PERSISTENT_PUBLIC_ACCESS_DENIED');
  return {status:'PROVISIONED_STORAGE_VERIFIED',checks:{restrictedRole:true,fixedTenant:true,profiles:true,noPublicTables:true},
   storage:'OPERATOR_BOUND_POSTGRES',containerReplacementValidated:false,liveReasoningEnabled:false,modelCalls:0};
 }finally{if(begun)await c.query('ROLLBACK');}
}
export async function openPersistentBinding(path:string){
 try{const b=await readPersistentBinding(path);const c=new Client({connectionString:b.connectionString,connectionTimeoutMillis:5000,statement_timeout:10000});
  try{await c.connect();const report=await inspectPersistentBinding(c,b);return {binding:b,report};}finally{await c.end();}
 }catch(e){const s=e instanceof Error?e.message:'';
  throw Error(/^PERSISTENT_[A-Z_]+$|^PRIVATE_BINDING_FILE_REQUIRED$/.test(s)?s:'PERSISTENT_STORAGE_PREFLIGHT_FAILED');}
}
