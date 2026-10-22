import {BOL_VERIFICATION_CONTRACTS as BOL_MCP_CONTRACTS} from '../../production/src/bolMcpBundle';
import {SAM_GOOGLE_VERIFICATION_CONTRACTS} from '../../production/src/samGoogleBundle';
import {GMAIL_READ_VERIFICATION_CONTRACTS} from '../../production/src/gmailReadBundle';
import {pool} from '../../../packages/db/src/client';
import {assertRuntimeTenantBinding} from '../../../packages/db/src/runtimeAccess';
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
 await assertRuntimeTenantBinding(pool);
}
const bundlePath=process.env.SAM_PRODUCTION_BUNDLE_MODULE?.trim()??"";
const bundle=await loadProductionBundle(bundlePath);
await syncProductionModelRegistry(bundle.raw.modelProviderConfigs??[]);
if(bundle.raw.capabilities.some(c=>c.capabilityId.startsWith("google_mcp_")))await syncVerificationContracts(SAM_GOOGLE_VERIFICATION_CONTRACTS);
if(bundle.raw.capabilities.some(c=>c.capabilityId==="gmail_list_messages"))await syncVerificationContracts(GMAIL_READ_VERIFICATION_CONTRACTS);
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
  await syncVerificationContracts(BOL_MCP_CONTRACTS.length?BOL_MCP_CONTRACTS:BOL_VERIFICATION_CONTRACTS);
}
const hasFinance=bundle.raw.capabilities.some((c)=>c.capabilityId.startsWith("finance_"));
if(hasFinance){
  await syncVerificationContracts(FINANCE_RECONCILIATION_CONTRACTS);
}

return createProductionComposition({
  bundle,
  workerId:config.workerId,ordinaryFailurePolicy:"record",readReportReview:true,
  operationalTick:createFinanceOperationalTickFromEnv()
});
})();
