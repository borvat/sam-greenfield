import type { ProductionBundle } from "./types";
import { withStandardModelProvidersFromEnv } from "./standardModels";
import { withGmailFromEnv } from "./gmailBundle";
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
bundle=withGmailFromEnv(bundle);
bundle=withGoogleDriveFromEnv(bundle);
bundle=withEBoekhoudenFromEnv(bundle);
bundle=withBolRetailerFromEnv(bundle);
bundle=withFinanceReconciliationFromEnv(bundle);

export default bundle;
