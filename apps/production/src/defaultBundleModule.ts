import type { ProductionBundle } from "./types";
import { withStandardModelProvidersFromEnv } from "./standardModels";
import { withGmailFromEnv } from "./gmailBundle";
import { withGoogleDriveFromEnv } from "./driveBundle";
import { withEBoekhoudenFromEnv } from "./eboekhoudenBundle";
import { withBolFromEnv } from "./bolBundle";

let bundle:ProductionBundle={
  capabilities:[],
  toolDefinitions:[],
  toolAdapters:[]
};

bundle=withStandardModelProvidersFromEnv(bundle);
bundle=withGmailFromEnv(bundle);
bundle=withGoogleDriveFromEnv(bundle);
bundle=withEBoekhoudenFromEnv(bundle);
bundle=withBolFromEnv(bundle);

export default bundle;
