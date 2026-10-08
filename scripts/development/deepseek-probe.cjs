const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const { root, developmentEnvironment, databaseClient, assertDevelopmentIdentity } = require("./environment.cjs");

async function main() {
  if (process.argv[2] !== "--approved-live-once") throw new Error("Explicit one-shot approval argument required.");
  if (!process.env.DEEPSEEK_API_KEY) throw new Error("Secure DeepSeek credential missing.");
  const lock = path.join(root, ".local/sam-dev/deepseek-probe-used.json");
  if (fs.existsSync(lock)) throw new Error("Inference already claimed; no automatic retry permitted.");
  const env = developmentEnvironment();
  const admin = databaseClient(env);
  await admin.connect();
  const schema = `sam_replit_test_${Date.now()}`;
  let created = false;
  try {
    await assertDevelopmentIdentity(admin); // Must succeed BEFORE any database write.
    await admin.query(`CREATE SCHEMA ${schema}`);
    created = true;
    const isolated = developmentEnvironment(schema);
    const migrations = spawnSync(process.execPath, ["packages/db/src/migrate.js", "--apply"], {
      cwd: root, env: isolated, encoding: "utf8", timeout: 30_000
    });
    if (migrations.status !== 0) throw new Error("Disposable migrations failed; diagnostics suppressed.");
    // No business service configuration, other credentials, or real entity bindings.
    isolated.DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
    isolated.DEEPSEEK_MODEL = "deepseek-flash"; // Process-scoped; no shared/production settings changed.
    const run = spawnSync(process.execPath, ["--import", "tsx", "scripts/development/deepseek-probe.ts"], {
      cwd: root, env: isolated, stdio: "inherit", timeout: 100_000
    });
    if (run.status !== 0) process.exitCode = 1;
  } finally {
    if (created) {
      await admin.query(`DROP SCHEMA ${schema} CASCADE`);
      const file = path.join(root, ".local/sam-dev/deepseek-probe-report.json");
      if (fs.existsSync(file)) {
        const report = JSON.parse(fs.readFileSync(file, "utf8"));
        report.disposableSchemaRemoved = true;
        fs.writeFileSync(file, JSON.stringify(report, null, 2));
      }
    }
    await admin.end();
  }
}
main().catch(() => {
  console.error("DEEPSEEK_PROBE_SETUP_BLOCKED: no automatic retry; sensitive diagnostics suppressed.");
  process.exitCode = 1;
});
