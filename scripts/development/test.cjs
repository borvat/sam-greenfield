const { spawnSync } = require("node:child_process");
const {
  root, developmentEnvironment, databaseClient, assertDevelopmentIdentity
} = require("./environment.cjs");

const suites = [
  "tests/phase1/kernel_smoke.ts",
  "tests/phase1/runtime_loop.ts",
  "tests/phase2/authority_guard.ts",
  "tests/phase3/capability_catalog.ts",
  "tests/phase4/tool_gateway.ts",
  "tests/phase7/runtime_service.ts",
  "tests/phase10/mcp_transport.ts",
  "tests/phase19/command_center.ts",
  "tests/development/replit_safety.ts"
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
    console.log(`SAM DEVELOPMENT REGRESSION PASS suites=${passed}; disposable test schemas removed.`);
  } finally {
    await admin.end();
  }
}

main().catch(error => {
  console.error(error.message);
  process.exitCode = 1;
});
