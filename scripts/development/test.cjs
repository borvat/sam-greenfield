const { spawnSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");
const {
  root, developmentEnvironment, databaseClient, assertDevelopmentIdentity
} = require("./environment.cjs");

const suites = [
  "tests/phase1/kernel_smoke.ts",
  "tests/phase1/runtime_loop.ts",
  "tests/phase2/authority_guard.ts",
  "tests/phase3/capability_catalog.ts",
  "tests/phase4/tool_gateway.ts",
  "tests/phase5/final_acceptance.ts",
  "tests/phase5/verified_learning.ts",
  "tests/phase6/operational_supervision.ts",
  "tests/phase6/policy_evaluation.ts",
  "tests/phase9/production_wiring.ts",
  "tests/phase7/runtime_service.ts",
  "tests/phase10/mcp_transport.ts",
  "tests/phase13/drive_adapters.ts",
  "tests/phase19/command_center.ts",
  "tests/development/data_boundaries.ts",
  "tests/development/replit_safety.ts",
  "tests/development/synthetic_probe.ts",
  "tests/development/drive_read.ts",
  "tests/development/drive_content.ts"
  ,"tests/development/autonomy.ts"
  ,"tests/release/contracts.ts"
  ,"tests/development/release_readiness.ts"
  ,"tests/release/provider_auth.ts"
  ,"tests/phase11/model_adapters.ts"
  ,"tests/development/sql_injection.ts"
  ,"tests/development/backup_restore.ts"
  ,"tests/development/observability.ts"
  ,"tests/development/fault_matrix.ts"
  ,"tests/release/prelaunch.ts"
  ,"tests/release/local_bundle.ts"
  ,"tests/release/setup.ts"
];

async function main() {
  const requested = process.argv[2];
  if (requested && !suites.includes(requested)) throw new Error("Unknown regression suite.");
  const selected = requested ? suites.filter(suite => suite === requested) : suites;
  const admin = databaseClient(developmentEnvironment());
  await admin.connect();
  let passed = 0;
  try {
    await assertDevelopmentIdentity(admin);
    for (let index = 0; index < selected.length; index++) {
      const schema = `sam_replit_test_${Date.now()}${index}`;
      // CREATE without IF NOT EXISTS ensures we only clean up a schema created by this run.
      await admin.query(`CREATE SCHEMA ${schema}`);
      try {
        const env = developmentEnvironment(schema);
        // Original suites exercise original SAM behavior in isolated synthetic schemas.
        // Development-specific suites exercise the additional opt-in boundaries.
        if (!selected[index].includes("/development/")) delete env.SAM_DEVELOPMENT_SAFE_MODE;
        const migration = spawnSync(process.execPath, ["packages/db/src/migrate.js", "--apply"], {
          cwd: root, env, encoding: "utf8", timeout: 30000
        });
        if (migration.status !== 0) {
          throw new Error(`Isolated test migrations failed for ${selected[index]}.`);
        }
        // Tests receive no external credentials. Bearers are read only in the final
        // local integration test, never printed, to test the running development services.
        if (selected[index].includes("/development/")) {
          for (const key of [
            "SESSION_SECRET", "SAM_COMMAND_CENTER_BEARER_TOKEN", "SAM_MCP_BEARER_TOKEN",
            "REPLIT_DEV_DOMAIN"
          ]) {
            if (process.env[key]) env[key] = process.env[key];
          }
        }
        console.log(`RUN ${selected[index]} (disposable development schema)`);
        const result = spawnSync(process.execPath, ["--import", "tsx", selected[index]], {
          cwd: root, env, stdio: "inherit", timeout: 60000
        });
        if (result.status !== 0) throw new Error(`Regression failed: ${selected[index]}`);
        passed++;
      } finally {
        await admin.query(`DROP SCHEMA ${schema} CASCADE`);
      }
    }
    if (!requested) {
      const reportFile = path.join(root, ".local/sam-dev/validation.json");
      let browserVerified = false;
      const browserProof = path.join(require("node:os").tmpdir(), "sam-browser-proof.json");
      if (fs.existsSync(browserProof)) {
        try {
          const proof = JSON.parse(fs.readFileSync(browserProof, "utf8"));
          browserVerified = proof.status === "PASS" && proof.ui?.connected === true &&
            Date.now() - Date.parse(proof.checkedAt) >= 0 &&
            Date.now() - Date.parse(proof.checkedAt) < 15 * 60 * 1000;
        } catch {}
      }
      fs.writeFileSync(reportFile, JSON.stringify({
        status: "PASS", passedSuites: passed, failedSuites: 0,
        authenticatedUi: browserVerified ? "PASS" : "NOT_RUN",
        goalCycle: "BLOCKED_EXTERNAL_MODEL", externalModelTest: "NOT_RUN"
      }, null, 2));
    }
    console.log(`SAM DEVELOPMENT REGRESSION PASS suites=${passed}; disposable test schemas removed.`);
  } catch (error) {
    if (!requested) {
      fs.writeFileSync(path.join(root, ".local/sam-dev/validation.json"), JSON.stringify({
        status: "FAIL", passedSuites: passed, failedSuites: 1, authenticatedUi: "NOT_RUN",
        goalCycle: "NOT_RUN", externalModelTest: "NOT_RUN"
      }));
    }
    throw error;
  } finally {
    await admin.end();
  }
}

main().catch(error => {
  console.error(error.message);
  process.exitCode = 1;
});
