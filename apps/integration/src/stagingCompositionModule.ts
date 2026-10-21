import local from '../../production/src/localReleaseBundleModule';
import {validateProductionBundle} from '../../production/src/bundle';
import {pool} from '../../../packages/db/src/client';
import {assertRuntimeTenantBinding} from '../../../packages/db/src/runtimeAccess';
import {createIntegrationComposition} from './composition';

// Existing runtime loader awaits a Promise export before opening HTTP. Synthetic
// local arithmetic only: no natural-language planner, model or provider adapter.
export default (async()=>{
 if(process.env.SAM_INTEGRATION_PROFILE!=='synthetic-local'||process.env.SAM_INTEGRATION_ENABLED!=='1'||process.env.NODE_ENV!=='production')throw Error('STAGING_PROFILE_REQUIRED');
 if(process.env.SAM_GOOGLE_MCP_ENABLED==='true'||process.env.SAM_MCP_INTERNAL_OAUTH_ENABLED==='1'||process.env.SAM_MCP_SYNTHETIC_TOOLS==='1')throw Error('STAGING_LIVE_CONNECTORS_FORBIDDEN');
 const tenant=await assertRuntimeTenantBinding(pool);
 const bundle=validateProductionBundle({...local,
  capabilities:local.capabilities.map(d=>({...d,sideEffect:false,companyScopes:[tenant.entity]})),
  toolDefinitions:local.toolDefinitions.map(d=>({...d,companyScopes:[tenant.entity]}))});
 return createIntegrationComposition({bundle,workerId:process.env.SAM_WORKER_ID||'staging-synthetic'});
})();
