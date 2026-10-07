import type { ProductionBundle } from "./types";
import { withStandardModelProvidersFromEnv } from "./standardModels";
import { withGmailFromEnv } from "./gmailBundle";
import { withGmailReadFromEnv } from "./gmailReadBundle";
import { withGoogleDriveFromEnv } from "./driveBundle";
import { withEBoekhoudenFromEnv } from "./eboekhoudenBundle";
import { withBolRetailerFromEnv } from "./bolBundle";
import { withFinanceReconciliationFromEnv } from "./financeReconciliationBundle";

let bundle:ProductionBundle={
  capabilities:[],
  toolDefinitions:[],
  toolAdapters:[]
};

bundle=withStandardModelProvidersFromEnv(bundle);
bundle=process.env.SAM_GOOGLE_READ_ONLY==="true"?withGmailReadFromEnv(bundle):withGmailFromEnv(bundle);
bundle=withGoogleDriveFromEnv(bundle);
if(process.env.SAM_GOOGLE_READ_ONLY!=="true"){
  bundle=withEBoekhoudenFromEnv(bundle);
  bundle=withBolRetailerFromEnv(bundle);
  bundle=withFinanceReconciliationFromEnv(bundle);
}

if(process.env.SAM_GOOGLE_READ_ONLY==="true"){
  const allowed=new Set(bundle.toolDefinitions.filter(d=>!d.sideEffect&&d.authorityClass==="GREEN").map(d=>d.capabilityId));
  bundle={...bundle,capabilities:bundle.capabilities.filter(c=>allowed.has(c.capabilityId)),
    toolDefinitions:bundle.toolDefinitions.filter(d=>allowed.has(d.capabilityId)),
    toolAdapters:bundle.toolAdapters.filter(a=>allowed.has(a.capabilityId)),
    verificationAdapters:bundle.verificationAdapters?.filter(v=>allowed.has(v.capabilityId))};
}

export default bundle;
