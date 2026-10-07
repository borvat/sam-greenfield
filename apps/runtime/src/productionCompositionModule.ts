import { loadRuntimeConfig } from "./config";
import { loadProductionBundle } from "../../production/src/loadBundle";
import { createProductionComposition } from "../../production/src/composition";
import { syncProductionModelRegistry } from "../../production/src/modelRegistry";

const config=loadRuntimeConfig();
const bundlePath=process.env.SAM_PRODUCTION_BUNDLE_MODULE?.trim()??"";
const bundle=await loadProductionBundle(bundlePath);
await syncProductionModelRegistry(bundle.raw.modelProviderConfigs??[]);

export default createProductionComposition({
  bundle,
  workerId:config.workerId
});
