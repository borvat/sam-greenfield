const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const { root, developmentEnvironment, databaseClient, assertDevelopmentIdentity } = require("./environment.cjs");
const { installCycleRls } = require("./goal-cycle-rls.cjs");
const localTest = process.argv[2] === "--local-acceptance";
const schema = localTest ? "sam_replit_test_cycle" : "sam_replit_goal_cycle";
const role = localTest ? "sam_goal_cycle_test_app" : "sam_goal_cycle_app";
const reportFile = path.join(root, `.local/sam-dev/goal-cycle-${localTest ? "local-acceptance" : "report"}.json`);
let createdSchema = false, createdRole = false;
let setupStage = "approval";

async function main() {
  if (!localTest && process.argv[2] !== "--approved-live-once") throw new Error("Explicit approval required.");
  if (!localTest && !process.env.DEEPSEEK_API_KEY) throw new Error("Credential missing.");
  if (!localTest && fs.existsSync(path.join(root, ".local/sam-dev/goal-cycle-used.json"))) throw new Error("Already consumed.");
  const admin = databaseClient(developmentEnvironment());
  await admin.connect();
  try {
    setupStage = "database_identity";
    await assertDevelopmentIdentity(admin);
    const occupied = await admin.query("SELECT 1 FROM pg_namespace WHERE nspname=$1", [schema]);
    if (occupied.rowCount) throw new Error("Existing evidence schema will not be overwritten.");
    await admin.query(`CREATE SCHEMA ${schema}`);
    createdSchema = true;
    setupStage = "isolated_migrations";
    const env = developmentEnvironment(schema);
    const migration = spawnSync(process.execPath, ["packages/db/src/migrate.js", "--apply"], {
      cwd: root, env, encoding: "utf8", timeout: 30000
    });
    if (migration.status !== 0) throw new Error("Migration failed.");
    setupStage = "local_artifact_table";
    await admin.query(`SET search_path TO ${schema},public`);
    await admin.query(`CREATE TABLE development_office_results(
      goal_id UUID NOT NULL REFERENCES goals(id),entity_id UUID NOT NULL REFERENCES legal_entities(id),
      task TEXT NOT NULL CHECK(task IN('A','B','C')),priority INTEGER NOT NULL CHECK(priority BETWEEN 1 AND 3),
      params_hash TEXT NOT NULL,idempotency_key TEXT PRIMARY KEY,recorded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      UNIQUE(goal_id,task));
      ALTER TABLE development_office_results ENABLE ROW LEVEL SECURITY;
      ALTER TABLE development_office_results FORCE ROW LEVEL SECURITY;
      CREATE POLICY cycle_entity_scope ON development_office_results
        USING(entity_id=NULLIF(current_setting('app.current_legal_entity_id',true),'')::uuid)
        WITH CHECK(entity_id=NULLIF(current_setting('app.current_legal_entity_id',true),'')::uuid)`);
    setupStage = "synthetic_entities";
    const org = (await admin.query("INSERT INTO organizations(name) VALUES('Synthetic local goal cycle') RETURNING id")).rows[0].id;
    const entity = (await admin.query("INSERT INTO legal_entities(org_id,name) VALUES($1,'Synthetic office entity') RETURNING id", [org])).rows[0].id;
    const foreignOrg = (await admin.query("INSERT INTO organizations(name) VALUES('Synthetic foreign sentinel') RETURNING id")).rows[0].id;
    const foreign = (await admin.query("INSERT INTO legal_entities(org_id,name) VALUES($1,'Synthetic isolation sentinel') RETURNING id", [foreignOrg])).rows[0].id;
    const goal = (await admin.query(`INSERT INTO goals(business_id,company_scope,domain,objective,state,completion_definition)
      VALUES('synthetic-real-cycle',$1,'development_probe',$2,'NEW','Three durable local task records independently verified') RETURNING id`,
      [entity, "Organize three fictional office tasks and record their priority internally in the isolated development database. No external actions."])).rows[0].id;
    await admin.query(`CREATE TABLE development_cycle_scope(goal_id UUID PRIMARY KEY REFERENCES goals(id),
      entity_id UUID NOT NULL REFERENCES legal_entities(id),org_id UUID NOT NULL REFERENCES organizations(id));
      ALTER TABLE development_cycle_scope ENABLE ROW LEVEL SECURITY;
      ALTER TABLE development_cycle_scope FORCE ROW LEVEL SECURITY;
      CREATE POLICY immutable_cycle_tenant ON development_cycle_scope FOR SELECT
      USING(entity_id=current_legal_entity_id() AND org_id=current_org_id())`);
    await admin.query("INSERT INTO development_cycle_scope(goal_id,entity_id,org_id) VALUES($1,$2,$3)", [goal, entity, org]);
    setupStage = "verification_contract";
    await admin.query(`INSERT INTO verification_contracts(capability_id,description,verification_method,
      required_evidence_fields,independent_query_template,must_not_trust_execution_result)
      VALUES('synthetic.office_task','Read real local office artifacts independently','db_query',
      '{"confirmed":"boolean","databaseReadback":"boolean","independentExpectedRank":"boolean"}',
      '{"source":"development_office_results","compare":"fixed fictional due-date order"}',true)`);
    setupStage = "model_registry";
    await admin.query("UPDATE model_providers SET health='DOWN'");
    await admin.query(`INSERT INTO model_providers(provider_id,models,capabilities,cost_per_1k_input,cost_per_1k_output,privacy_class_allowed,health)
      VALUES('deepseek','["deepseek-flash"]','["planning"]',0.0003,0.0012,'["PUBLIC"]','HEALTHY')
      ON CONFLICT(provider_id) DO UPDATE SET models=EXCLUDED.models,capabilities=EXCLUDED.capabilities,
      cost_per_1k_input=EXCLUDED.cost_per_1k_input,cost_per_1k_output=EXCLUDED.cost_per_1k_output,
      privacy_class_allowed=EXCLUDED.privacy_class_allowed,health=EXCLUDED.health`);
    setupStage = "non_bypass_role";
    if ((await admin.query("SELECT 1 FROM pg_roles WHERE rolname=$1", [role])).rowCount) throw new Error("Existing role will not be modified.");
    await admin.query(`CREATE ROLE ${role} NOLOGIN NOSUPERUSER NOBYPASSRLS NOINHERIT;
      GRANT USAGE ON SCHEMA ${schema} TO ${role};
      GRANT USAGE,SELECT ON ALL SEQUENCES IN SCHEMA ${schema} TO ${role}`);
    createdRole = true;
    const tables = (await admin.query("SELECT tablename FROM pg_tables WHERE schemaname=$1", [schema])).rows;
    for (const { tablename } of tables) {
      if (!/^[a-z_]+$/.test(tablename) || /financial|invoice|payment|bank|ledger|memory|users/.test(tablename)) continue;
      const readOnly = ["organizations", "legal_entities", "world_facts", "model_providers", "verification_contracts", "development_cycle_scope"].includes(tablename);
      await admin.query(`GRANT ${readOnly ? "SELECT" : "SELECT,INSERT,UPDATE"} ON ${schema}.${tablename} TO ${role}`);
    }
    setupStage = "scoped_rls_policies";
    await installCycleRls(admin, role);
    const options = `${env.PGOPTIONS} -c role=${role} -c app.current_org_id=${org} -c app.current_legal_entity_id=${entity}`;
    env.PGOPTIONS = options;
    const url = new URL(env.DATABASE_URL); url.searchParams.set("options", options); env.DATABASE_URL = url.toString();
    env.SAM_DEV_LEGAL_ENTITY_ID = entity;
    env.SAM_CYCLE_FOREIGN_ENTITY = foreign;
    env.SAM_CYCLE_GOAL_ID = goal;
    if (localTest) env.SAM_CYCLE_UNIT_TEST = "1";
    else delete env.SAM_CYCLE_UNIT_TEST;
    env.DEEPSEEK_API_KEY = localTest ? "fixture-not-a-credential" : process.env.DEEPSEEK_API_KEY;
    setupStage = "cycle_process";
    const result = spawnSync(process.execPath, ["--import", "tsx", "scripts/development/goal-cycle.ts"], {
      cwd: root, env, stdio: "inherit", timeout: 150000
    });
    if (result.status !== 0) process.exitCode = 1;
    // Evidence is intentionally retained, unlike disposable unit-test schemas.
    if (fs.existsSync(reportFile)) {
      const report = JSON.parse(fs.readFileSync(reportFile, "utf8"));
      if (!localTest) report.persistentEvidenceSchema = schema;
      report.adminIndependentCounts = {};
      for (const table of ["goals", "plans", "executions", "verifications", "audit_log", "model_calls", "side_effect_operations", "financial_documents", "users", "memory_records", "world_facts"]) {
        report.adminIndependentCounts[table] = (await admin.query(`SELECT count(*)::int AS n FROM ${table}`)).rows[0].n;
      }
      if (["side_effect_operations", "financial_documents", "users", "memory_records", "world_facts"]
        .some(table => report.adminIndependentCounts[table] !== 0)) {
        report.status = "FAIL"; report.failureStage = "admin_isolation_acceptance"; process.exitCode = 1;
      }
      fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
    }
  } finally {
    if (localTest && createdSchema) await admin.query(`DROP SCHEMA ${schema} CASCADE`);
    if (localTest && createdRole) await admin.query(`DROP ROLE ${role}`);
    await admin.end();
  }
}
main().catch(error => {
  console.error("GOAL_CYCLE_SETUP_BLOCKED: no retry; no existing schema/role overwritten; sensitive errors suppressed.");
  console.error(JSON.stringify({ stage: setupStage, sqlState: error.code ?? null,
    table: error.table ?? null, column: error.column ?? null, constraint: error.constraint ?? null }));
  process.exitCode = 1;
});
