import {existsSync} from 'node:fs';
import {pool} from '../../packages/db/src/client';
import {assertRuntimeTenantBinding} from '../../packages/db/src/runtimeAccess';
async function main(){
 const service=process.argv[2];
 if(!['worker','mcp','command-center'].includes(service)||process.env.NODE_ENV!=='production'||process.env.SAM_DATABASE_TARGET!=='staging'||process.env.SAM_INTEGRATION_PROFILE!=='synthetic-local')throw Error('STAGING_PROFILE_REQUIRED');
 const url=new URL(process.env.DATABASE_URL||'');
 if(url.hostname!==process.env.SAM_STAGING_DB_HOST||url.searchParams.get('sslmode')!=='verify-full'||url.searchParams.get('sslrootcert')!=='/run/staging-ca.pem'||!existsSync('/run/staging-ca.pem'))throw Error('STAGING_VERIFIED_TLS_REQUIRED');
 if(process.env.SAM_PRODUCTION_BUNDLE_MODULE||process.env.SAM_MCP_SYNTHETIC_TOOLS==='1'||process.env.SAM_MCP_INTERNAL_OAUTH_ENABLED==='1'||process.env.SAM_GOOGLE_MCP_ENABLED==='true')throw Error('STAGING_CONNECTORS_FORBIDDEN');
 const tenant=await assertRuntimeTenantBinding(pool);
 if(tenant.org!==process.env.SAM_STAGING_ORG_ID||tenant.entity!==process.env.SAM_STAGING_ENTITY_ID)throw Error('STAGING_EXPECTED_TENANT_MISMATCH');
 const modules={worker:'../../apps/runtime/src/main.ts',mcp:'../../apps/mcp/src/main.ts','command-center':'../../apps/command-center/src/main.ts'};
 await import(modules[service as keyof typeof modules]);
}
main().catch(async()=>{console.error('STAGING_SERVICE_REFUSED; verify profile, TLS, bound LOGIN and expected synthetic tenant');await pool.end();process.exitCode=1;});
