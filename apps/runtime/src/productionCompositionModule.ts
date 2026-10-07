import { loadRuntimeConfig } from "./config";
import { loadProductionBundle } from "../../production/src/loadBundle";
import { createProductionComposition } from "../../production/src/composition";
import { syncProductionModelRegistry } from "../../production/src/modelRegistry";
import { syncVerificationContracts } from "../../production/src/verificationContracts";
import { DRIVE_VERIFICATION_CONTRACTS } from "../../production/src/driveBundle";
import { EBOEKHOUDEN_VERIFICATION_CONTRACTS } from "../../production/src/eboekhoudenBundle";
import { BOL_VERIFICATION_CONTRACTS } from "../../production/src/bolBundle";
import { GMAIL_READ_VERIFICATION_CONTRACTS } from "../../production/src/gmailBundle";

const config=loadRuntimeConfig();
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
const hasGmailReads=bundle.raw.capabilities.some((c)=>
  ["gmail_search_threads","gmail_get_thread","gmail_get_message"].includes(c.capabilityId)
);
if(hasGmailReads){
  await syncVerificationContracts(GMAIL_READ_VERIFICATION_CONTRACTS);
}

export default createProductionComposition({
  bundle,
  workerId:config.workerId
});
