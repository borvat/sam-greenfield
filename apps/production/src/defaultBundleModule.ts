import type { ProductionBundle } from "./types";
import { withStandardModelProvidersFromEnv } from "./standardModels";
import { withGmailFromEnv } from "./gmailBundle";

let bundle:ProductionBundle={
  capabilities:[],
  toolDefinitions:[],
  toolAdapters:[]
};

bundle=withStandardModelProvidersFromEnv(bundle);
bundle=withGmailFromEnv(bundle);

export default bundle;
