const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const { root, developmentEnvironment, databaseClient, assertDevelopmentIdentity } = require("./environment.cjs");
const { installCycleRls } = require("./goal-cycle-rls.cjs");
const { createHash } = require("node:crypto");
const unit = process.argv[2] === "--local-acceptance";
const schema = unit ? "sam_replit_test_drive_read" : "sam_replit_drive_read";
const role = unit ? "sam_drive_read_test_app" : "sam_drive_read_app";
const approvalFile = path.join(root, ".local/sam-dev/drive-read-approval.json");
const marker = path.join(root, ".local/sam-dev/drive-read-used.json");
const reportFile = path.join(root, `.local/sam-dev/drive-read-${unit ? "local-acceptance" : "report"}.json`);
let stage="approval",createdSchema=false,createdRole=false;
async function main() {
  if (!unit && process.argv[2] !== "--approved-read-only-once") throw new Error("APPROVAL_REQUIRED");
  const approval = unit ? {fileId:"fixture-personal-document-001",consent:true,nonCompanyAccount:true,metadataOnly:true} :
    JSON.parse(fs.readFileSync(approvalFile,"utf8"));
  if (approval.consent !== true || approval.nonCompanyAccount !== true || approval.metadataOnly !== true ||
      !/^[A-Za-z0-9_-]{10,200}$/.test(approval.fileId)) throw new Error("INVALID_OWNER_SCOPE");
  if (!unit && ((fs.statSync(approvalFile).mode & 0o077) !== 0 || fs.existsSync(marker))) throw new Error("PRIVATE_SCOPE_OR_ONE_SHOT_REQUIRED");
  const admin=databaseClient(developmentEnvironment());
  await admin.connect();
  try {
    stage="database_identity";await assertDevelopmentIdentity(admin);
    if ((await admin.query("SELECT 1 FROM pg_namespace WHERE nspname=$1",[schema])).rowCount ||
        (await admin.query("SELECT 1 FROM pg_roles WHERE rolname=$1",[role])).rowCount) throw new Error("EXISTING_EVIDENCE_NOT_OVERWRITTEN");
    await admin.query(`CREATE SCHEMA ${schema}`);createdSchema=true;
    stage="isolated_migrations";
    const env=developmentEnvironment(schema);
    const migration=spawnSync(process.execPath,["packages/db/src/migrate.js","--apply"],{cwd:root,env,encoding:"utf8",timeout:30000});
    if (migration.status!==0) throw new Error("ISOLATED_MIGRATION_FAILED");
    await admin.query(`SET search_path TO ${schema},public`);
    const org=(await admin.query("INSERT INTO organizations(name) VALUES('Personal read-only development scope') RETURNING id")).rows[0].id;
    const entity=(await admin.query("INSERT INTO legal_entities(org_id,name) VALUES($1,'Development-only personal resource scope') RETURNING id",[org])).rows[0].id;
    const foreignOrg=(await admin.query("INSERT INTO organizations(name) VALUES('Isolation test sentinel') RETURNING id")).rows[0].id;
    const foreign=(await admin.query("INSERT INTO legal_entities(org_id,name) VALUES($1,'Foreign isolation sentinel') RETURNING id",[foreignOrg])).rows[0].id;
    const objective="Confirm the owner-approved personal Google document exists and record permitted metadata with independent readback. No content, search, writes, or model disclosure.";
    const goal=(await admin.query(`INSERT INTO goals(business_id,company_scope,domain,objective,state,authority_ceiling,completion_definition)
      VALUES('personal-read-only-development',$1,'development_probe',$2,'NEW','GREEN','Approved document id and type independently confirmed without content or mutations') RETURNING id`,[entity,objective])).rows[0].id;
    await admin.query(`INSERT INTO audit_log(actor,goal_id,action,source,authority_class,result)
      VALUES('owner-read-request',$1,'GOAL_SUBMITTED','private_read_scope','GREEN','NEW')`,[goal]);
    await admin.query(`CREATE TABLE development_cycle_scope(
      goal_id UUID PRIMARY KEY REFERENCES goals(id),entity_id UUID NOT NULL REFERENCES legal_entities(id),
      org_id UUID NOT NULL REFERENCES organizations(id),resource_hash TEXT NOT NULL);
      ALTER TABLE development_cycle_scope ENABLE ROW LEVEL SECURITY;
      ALTER TABLE development_cycle_scope FORCE ROW LEVEL SECURITY;
      CREATE POLICY immutable_cycle_tenant ON development_cycle_scope FOR SELECT
      USING(entity_id=current_legal_entity_id() AND org_id=current_org_id())`);
    await admin.query("INSERT INTO development_cycle_scope VALUES($1,$2,$3,$4)",
      [goal,entity,org,createHash("sha256").update(JSON.stringify(approval.fileId)).digest("hex")]);
    stage="original_verification_contract";
    await admin.query(`INSERT INTO verification_contracts(capability_id,description,verification_method,
      required_evidence_fields,independent_query_template,must_not_trust_execution_result)
      VALUES('drive_get_metadata','Fresh restricted Google metadata readback','api_readback',
      '{"provider_file_id":"string","method":"string"}','{"method":"drive_file_get","content":false}',true)`);
    await admin.query("UPDATE model_providers SET health='DOWN'");
    stage="non_bypass_role";
    await admin.query(`CREATE ROLE ${role} NOLOGIN NOSUPERUSER NOBYPASSRLS NOINHERIT;
      GRANT USAGE ON SCHEMA ${schema} TO ${role}; GRANT USAGE,SELECT ON ALL SEQUENCES IN SCHEMA ${schema} TO ${role}`);
    createdRole=true;
    for (const {tablename} of (await admin.query("SELECT tablename FROM pg_tables WHERE schemaname=$1",[schema])).rows) {
      if (!/^[a-z_]+$/.test(tablename) || /financial|invoice|payment|bank|ledger|memory|users|approvals/.test(tablename)) continue;
      const readOnly=["organizations","legal_entities","world_facts","model_providers","verification_contracts","development_cycle_scope"].includes(tablename);
      await admin.query(`GRANT ${readOnly?"SELECT":"SELECT,INSERT,UPDATE"} ON ${schema}.${tablename} TO ${role}`);
    }
    await installCycleRls(admin,role);
    const options=`${env.PGOPTIONS} -c role=${role} -c app.current_org_id=${org} -c app.current_legal_entity_id=${entity}`;
    env.PGOPTIONS=options;
    const url=new URL(env.DATABASE_URL);url.searchParams.set("options",options);env.DATABASE_URL=url.toString();
    env.SAM_DEV_LEGAL_ENTITY_ID=entity;env.SAM_CYCLE_FOREIGN_ENTITY=foreign;env.SAM_CYCLE_GOAL_ID=goal;
    env.SAM_DRIVE_READ_UNIT_TEST=unit?"1":"0";
    env.SAM_DRIVE_READ_APPROVAL_FILE=approvalFile;
    // Only platform identity context needed by the official managed proxy.
    // No Google refresh tokens, model keys, app bearers or corporate settings.
    if (!unit) for (const name of ["REPL_IDENTITY","REPLIT_CLI","REPLIT_CONNECTORS_AUDIENCE","REPLIT_CONNECTORS_HOSTNAME"]) {
      if (process.env[name]) env[name]=process.env[name];
    }
    stage="native_cycle";
    const result=spawnSync(process.execPath,["--import","tsx","scripts/development/drive-read.ts"],{cwd:root,env,stdio:"inherit",timeout:90000});
    if (result.status!==0) process.exitCode=1;
    if (fs.existsSync(reportFile)) {
      const report=JSON.parse(fs.readFileSync(reportFile,"utf8"));
      report.persistentEvidenceSchema=unit?null:schema;
      report.adminIndependentCounts={};
      for (const table of ["goals","plans","work_queue","executions","verifications","audit_log","model_calls","side_effect_operations","financial_documents","users","memory_records","world_facts"]) {
        report.adminIndependentCounts[table]=(await admin.query(`SELECT count(*)::int AS n FROM ${table}`)).rows[0].n;
      }
      report.controlTableNotWritableByApplication=(await admin.query("SELECT has_table_privilege($1,$2,'UPDATE') AS allowed",[role,`${schema}.development_cycle_scope`])).rows[0].allowed===false;
      if (["model_calls","side_effect_operations","financial_documents","users","memory_records","world_facts"].some(table=>report.adminIndependentCounts[table]!==0)) {
        report.status="FAIL";report.failureStage="admin_isolation_acceptance";process.exitCode=1;
      }
      fs.writeFileSync(reportFile,JSON.stringify(report,null,2));
      console.log(JSON.stringify({DRIVE_READ_ADMIN_ACCEPTANCE:{status:report.status,counts:report.adminIndependentCounts,controlTableNotWritableByApplication:report.controlTableNotWritableByApplication}}));
    }
  } finally {
    if(unit && createdSchema) await admin.query(`DROP SCHEMA ${schema} CASCADE`);
    if(unit && createdRole) await admin.query(`DROP ROLE ${role}`);
    await admin.end();
  }
}
main().catch(error=>{
  console.error(JSON.stringify({DRIVE_READ_SETUP_BLOCKED:true,stage,sqlState:/^[A-Z0-9_]+$/.test(error.code||"")?error.code:undefined}));
  process.exitCode=1;
});
