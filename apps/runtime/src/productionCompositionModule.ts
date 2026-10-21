import {pool} from '../../../packages/db/src/client';
import {assertReleaseDatabaseSafety} from '../../../packages/db/src/releaseSafety';
import { loadRuntimeConfig } from "./config";
import { loadProductionBundle } from "../../production/src/loadBundle";
import { createProductionComposition } from "../../production/src/composition";
import { syncProductionModelRegistry } from "../../production/src/modelRegistry";
import { syncVerificationContracts } from "../../production/src/verificationContracts";
import { DRIVE_VERIFICATION_CONTRACTS } from "../../production/src/driveBundle";
import { EBOEKHOUDEN_VERIFICATION_CONTRACTS } from "../../production/src/eboekhoudenBundle";
import { BOL_VERIFICATION_CONTRACTS } from "../../production/src/bolBundle";
import { FINANCE_RECONCILIATION_CONTRACTS } from "../../production/src/financeReconciliationBundle";
import { createFinanceOperationalTickFromEnv } from "../../production/src/financeOperationalLoop";

export default (async()=>{
const config=loadRuntimeConfig();
if(config.mode==='production'){
 await assertReleaseDatabaseSafety(pool);
 const tenant=(await pool.query('SELECT current_org_id() org,current_legal_entity_id() entity')).rows[0];
 if(!tenant?.org||!tenant?.entity)throw new Error('RUNTIME_TENANT_CONTEXT_REQUIRED');
}
const bundlePath=process.env.SAM_PRODUCTION_BUNDLE_MODULE?.trim()??"";
const bundle=await loadProductionBundle(bundlePath);
await syncProductionModelRegistry(bundle.raw.modelProviderConfigs??[]);
const hasDrive=bundle.raw.capabilities.some((c)=>c.capabilityId.startsWith("drive_"));
if(hasDrive){
  await syncVerificationContracts(DRIVE_VERIFICATION_CONTRACTS);
}
const hasEBoekhouden=bundle.raw.capabilities.some((c)=>c.capabilityId.startsWith("eboekhouden_"));
if(hasEBoekhouden){
  await syncVerificationContracts(EBOEKHOUDEN_VERIFICATION_CONTRACTS);
}
const hasBol=bundle.raw.capabilities.some((c)=>c.capabilityId.startsWith("bol_"));
if(hasBol){
  await syncVerificationContracts(BOL_VERIFICATION_CONTRACTS);
}
const hasFinance=bundle.raw.capabilities.some((c)=>c.capabilityId.startsWith("finance_"));
if(hasFinance){
  await syncVerificationContracts(FINANCE_RECONCILIATION_CONTRACTS);
}

return createProductionComposition({
  bundle,
  workerId:config.workerId,
  operationalTick:createFinanceOperationalTickFromEnv()
});
})();
