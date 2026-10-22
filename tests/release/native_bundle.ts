// Test-only catalog of SAM's REAL development local adapters, with planning and
// learning removed. Used to boot native service processes, never for publication.
import {localCapabilityBundle} from "../../apps/development/src/localCapabilities";
const bundle=localCapabilityBundle({providerId:"deepseek",async invoke(){throw new Error("UNIT_MODEL_DISABLED");}} as any).raw;
export default {...bundle,modelAdapters:[],modelProviderConfigs:[],plannerGateway:undefined,verifiedLearning:undefined};
