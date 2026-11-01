import type { ProductionBundle } from "./types";
import { withStandardModelProvidersFromEnv } from "./standardModels";
import { withGmailFromEnv,withGmailFromVault } from "./gmailBundle";
import { withGoogleDriveFromEnv } from "./driveBundle";
import { withEBoekhoudenFromEnv,withEBoekhoudenFromVault } from "./eboekhoudenBundle";
import { withBolRetailerFromEnv,withBolRetailerFromVault } from "./bolBundle";
import { withFinanceReconciliationFromEnv,withFinanceReconciliationFromVault } from "./financeReconciliationBundle";
import { sharedCredentialResolver } from "../../../packages/credentials/src/runtime";

let bundle:ProductionBundle={
  capabilities:[],
  toolDefinitions:[],
  toolAdapters:[]
};

bundle=withStandardModelProvidersFromEnv(bundle);
// Credentialed integrations (Gmail, e-Boekhouden, bol, finance) are multi-account when
// the credential vault is configured: each goal runs under its legal entity's own
// credentials. Without SAM_VAULT_KEYS the original single-account env wiring applies.
const resolver=sharedCredentialResolver();
if(resolver){
  bundle=withGmailFromVault(bundle,resolver);
  bundle=withGoogleDriveFromEnv(bundle);
  bundle=withEBoekhoudenFromVault(bundle,resolver);
  bundle=withBolRetailerFromVault(bundle,resolver);
  bundle=withFinanceReconciliationFromVault(bundle,resolver);
}else{
  bundle=withGmailFromEnv(bundle);
  bundle=withGoogleDriveFromEnv(bundle);
  bundle=withEBoekhoudenFromEnv(bundle);
  bundle=withBolRetailerFromEnv(bundle);
  bundle=withFinanceReconciliationFromEnv(bundle);
}

export default bundle;
