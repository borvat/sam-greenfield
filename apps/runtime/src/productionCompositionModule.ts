import { loadRuntimeConfig } from "./config";
import { loadProductionBundle } from "../../production/src/loadBundle";
import { createProductionComposition } from "../../production/src/composition";
import { syncProductionModelRegistry } from "../../production/src/modelRegistry";
import { syncVerificationContracts } from "../../production/src/verificationContracts";
import { DRIVE_VERIFICATION_CONTRACTS } from "../../production/src/driveBundle";

const config=loadRuntimeConfig();
const bundlePath=process.env.SAM_PRODUCTION_BUNDLE_MODULE?.trim()??"";
const bundle=await loadProductionBundle(bundlePath);
await syncProductionModelRegistry(bundle.raw.modelProviderConfigs??[]);
const hasDrive=bundle.raw.capabilities.some((c)=>c.capabilityId.startsWith("drive_"));
if(hasDrive){
  await syncVerificationContracts(DRIVE_VERIFICATION_CONTRACTS);
}

export default createProductionComposition({
  bundle,
  workerId:config.workerId
});
