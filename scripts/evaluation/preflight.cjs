"use strict";
// Explicit read-only operator diagnostic. No startup hooks, provisioning, model
// calls, credential prompts, credential exports or production-data reads.
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");

function profileManifests(root = path.resolve(__dirname, "../..")) {
  return [
    { name: "specialist", receipt: "sam_specialist_migrations", files: [
      "packages/db/specialist-migrations/00106_specialist_intelligence.sql",
      "packages/db/specialist-migrations/00107_learning_provenance.sql"
    ], tables: ["specialist_budgets", "specialist_sessions", "specialist_delegations", "specialist_learning"] },
    { name: "evaluation", receipt: "sam_evaluation_migrations", files: [
      "packages/db/evaluation-migrations/00108_evaluation_trials.sql"
    ], tables: ["evaluation_companies", "evaluation_trials", "evaluation_events"] }
  ].map(p => ({ ...p, expected: p.files.map(filename => ({
    filename: path.basename(filename),
    sha256: crypto.createHash("sha256").update(fs.readFileSync(path.join(root, filename))).digest("hex")
  })) }));
}

function releaseEnabled(root = path.resolve(__dirname, "../..")) {
  const source = fs.readFileSync(path.join(root, "packages/model-gateway/src/evaluationPermit.ts"), "utf8");
  // A diagnostic must not import the runtime or execute its composition.
  const matches = [...source.matchAll(/^export const LIVE_EVALUATION_ENABLED\s*=\s*(true|false)\s*;/gm)];
  if (matches.length !== 1) throw Error("RELEASE_INTERLOCK_UNRECOGNIZED");
  return matches[0][1] === "true";
}

async function inspect(client, profiles = profileManifests(), liveRelease = releaseEnabled()) {
  let begun = false;
  try {
    await client.query("BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY");
    begun = true;
    const context = (await client.query(`SELECT current_schema() AS schema,
      current_setting('transaction_read_only') AS read_only,
      has_database_privilege(current_user,current_database(),'CREATE') AS can_create_schema,
      r.rolsuper OR r.rolcreaterole OR r.rolbypassrls AS elevated_role
      FROM pg_roles r WHERE r.rolname=current_user`)).rows[0];
    if (!context || context.read_only !== "on" || !/^[a-z_][a-z0-9_]*$/.test(context.schema))
      throw Error("READ_ONLY_CONTEXT_REQUIRED");
    const catalog = (await client.query(`SELECT c.relname AS name,
      has_table_privilege(current_user,c.oid,'SELECT') AS can_read,
      c.relrowsecurity AS rls,c.relforcerowsecurity AS forced_rls
      FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
      WHERE n.nspname=$1 AND c.relkind IN ('r','p')`, [context.schema])).rows;
    const byName = new Map(catalog.map(r => [r.name, r]));
    const findings = [];
    for (const p of profiles) {
      const missing = [p.receipt, ...p.tables].filter(name => !byName.has(name));
      const receipt = byName.get(p.receipt);
      let migration = !receipt ? "MISSING" : !receipt.can_read ? "UNREADABLE" : "MISMATCH";
      if (receipt?.can_read) {
        // Identifier is a checked-in manifest constant; still validate it before
        // constructing qualified SQL. Never trust search_path for receipt reads.
        if (!/^[a-z_][a-z0-9_]*$/.test(p.receipt)) throw Error("MANIFEST_IDENTIFIER_INVALID");
        const rows = (await client.query(`SELECT filename,sha256 FROM "${context.schema}"."${p.receipt}" ORDER BY filename`)).rows;
        const expected = [...p.expected].sort((a,b) => a.filename.localeCompare(b.filename));
        if (rows.length === expected.length && rows.every((r,i) =>
          r.filename === expected[i].filename && r.sha256 === expected[i].sha256)) migration = "MATCH";
      }
      findings.push({ profile: p.name, migration, missingRelations: missing,
        unreadableRelations: p.tables.filter(name => byName.has(name) && !byName.get(name).can_read),
        unfencedRelations: p.tables.filter(name => byName.has(name) &&
          (!byName.get(name).rls || !byName.get(name).forced_rls)) });
    }
    return { version: 1, status: "PREFLIGHT_ONLY", readOnly: true, liveReleaseEnabled: liveRelease,
      schema: context.schema,
      connectedRole: { canCreateSchema: context.can_create_schema, elevated: context.elevated_role },
      profiles: findings,
      remainingChecks: ["DEDICATED_SYNTHETIC_PRINCIPAL_AND_FIXED_TENANT_FENCES",
        "OWNER_SIGNER_AND_EXACT_TRIAL_APPROVAL", "REAL_RENDER_LIFECYCLE_AND_RESTORATION",
        "REGISTERED_LIVE_EVALUATION_COMPOSITION"],
      execution: { migrations: false, grants: false, activation: false, modelCalls: 0 },
      limitations: ["Catalog and receipt inspection only; presence and matching hashes do not certify scoped permissions, enrollment, a signer, runtime wiring or live quality."] };
  } finally {
    if (begun) await client.query("ROLLBACK");
  }
}

async function main() {
  if (process.argv.length !== 2) throw Error("NO_ARGUMENTS_ACCEPTED");
  if (!process.env.DATABASE_URL?.trim()) throw Error("EXISTING_DATABASE_CONFIGURATION_REQUIRED");
  const { Client } = require("pg");
  const client = new Client({ connectionString: process.env.DATABASE_URL,
    connectionTimeoutMillis: 5000, statement_timeout: 5000, query_timeout: 8000 });
  try {
    await client.connect();
    const report = await inspect(client);
    console.log(JSON.stringify(report));
    // This is never a release-readiness or permission-grant certificate.
  } finally { await client.end(); }
}

module.exports = { inspect, profileManifests, releaseEnabled };
if (require.main === module) main().catch(() => {
  // Never serialize a driver exception: it may contain connection/config data.
  console.error(JSON.stringify({ status: "PREFLIGHT_UNAVAILABLE", code: "READ_ONLY_PREFLIGHT_FAILED" }));
  process.exitCode = 1;
});
