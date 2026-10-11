"use strict";
// SAM's own server/worker. No intermediary, migrations, provisioning or OAuth client secret.
const path=require("node:path");
const {configuration}=require("./config.cjs");
async function main(){
  const config=configuration(process.env);
  if(process.argv.includes("--validate-only")){console.log("DIRECT_CONFIGURATION_VALID");return;}
  // The private administrative URL is never selected by the application.
  process.env.DATABASE_URL=config.databaseUrl;
  process.env.SAM_REQUIRE_GOAL_ACCEPTANCE="1";
  process.env.SAM_WORK_LEASE_MAX_ATTEMPTS="3";
  process.env.SAM_DB_SCHEMA=config.schema;process.env.SAM_DB_APP_ROLE=config.role;
  process.env.SAM_COMMAND_CENTER_LEGAL_ENTITY_ID=config.entityId;process.env.SAM_RELEASE_ORG_ID=config.orgId;
  const {register}=require("tsx/cjs/api");register();
  await require(path.resolve(__dirname,"../../apps/direct/src/service.ts")).startDirectSam(config);
}
main().catch(()=>{console.error("DIRECT_STARTUP_REFUSED; inspect configuration and database admission");process.exit(1);});
