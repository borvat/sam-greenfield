/** Existing restricted application identity only. Defaults to a read-only dry run. */
import {assertRuntimeTenantBinding} from '../../packages/db/src/runtimeAccess';
import {pool} from '../../packages/db/src/client';
import {recoverBoundReadDiagnostic,LEGACY_MAIL_DIAGNOSTIC_BINDING} from '../../apps/production/src/legacyReadDiagnostic';
const args=process.argv.slice(2);
async function main(){
 if(args.length>1||args.some(x=>!['--dry-run','--apply'].includes(x)))throw Error('USE_ONLY_DRY_RUN_OR_APPLY');
 const c=await pool.connect();try{
  await assertRuntimeTenantBinding(c);
  const role=(await c.query('SELECT rolsuper,rolbypassrls,rolcreatedb,rolcreaterole FROM pg_roles WHERE rolname=current_user')).rows[0];
  if(!role||Object.values(role).some(Boolean))throw Error('RESTRICTED_APPLICATION_IDENTITY_REQUIRED');
  console.log(JSON.stringify(await recoverBoundReadDiagnostic(c,LEGACY_MAIL_DIAGNOSTIC_BINDING,{actor:'owner-authorized-deterministic-operator',apply:args[0]==='--apply'})));
 }finally{c.release();await pool.end()}
}
main().catch(()=>{console.error('LEGACY_DIAGNOSTIC_RECOVERY_REFUSED');process.exitCode=1});
