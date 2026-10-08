const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const {
  root, configPath, schema, developmentEnvironment, databaseClient, assertDevelopmentIdentity
} = require("./environment.cjs");

async function main() {
  const env = developmentEnvironment();
  const client = databaseClient(env);
  await client.connect();
  let databaseName;
  try {
    await assertDevelopmentIdentity(client);
    const state = await client.query(`SELECT current_database() AS database,
      (SELECT count(*)::int FROM information_schema.tables WHERE table_schema='public') AS public_tables,
      EXISTS(SELECT 1 FROM pg_namespace WHERE nspname=$1) AS isolated_schema`, [schema]);
    databaseName = state.rows[0].database;
    if (!state.rows[0].isolated_schema && state.rows[0].public_tables !== 0) {
      throw new Error("Database is not empty; inspect it before initializing SAM.");
    }
    await client.query(`CREATE SCHEMA IF NOT EXISTS ${schema}`);
  } finally {
    await client.end();
  }

  const migration = spawnSync(process.execPath, ["packages/db/src/migrate.js", "--apply"], {
    cwd: root, env, stdio: "inherit"
  });
  if (migration.status !== 0) throw new Error("Development migration failed.");

  const seed = databaseClient(env);
  await seed.connect();
  let legalEntityId;
  try {
    await seed.query("BEGIN");
    const existing = await seed.query(`SELECT le.id FROM legal_entities le
      JOIN organizations o ON o.id=le.org_id
      WHERE o.name=$1 AND le.name=$2`, ["SAM Replit Development", "SAM Development Only"]);
    if (existing.rowCount) {
      legalEntityId = existing.rows[0].id;
    } else {
      const org = await seed.query("INSERT INTO organizations(name) VALUES($1) RETURNING id", ["SAM Replit Development"]);
      const entity = await seed.query(`INSERT INTO legal_entities(org_id,name,status)
        VALUES($1,$2,'ACTIVE') RETURNING id`, [org.rows[0].id, "SAM Development Only"]);
      legalEntityId = entity.rows[0].id;
    }
    await seed.query("COMMIT");
  } catch (error) {
    await seed.query("ROLLBACK");
    throw error;
  } finally {
    await seed.end();
  }
  fs.mkdirSync(path.dirname(configPath), { recursive: true });
  fs.writeFileSync(configPath, JSON.stringify({ databaseName, schema, legalEntityId }, null, 2) + "\n");
  console.log("SAM DEVELOPMENT SETUP PASS: isolated schema; development entity only; no external adapters.");
}

main().catch(error => {
  console.error("SAM development setup failed:", error.message);
  process.exitCode = 1;
});
