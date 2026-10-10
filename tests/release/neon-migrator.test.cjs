"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const { run, PASSWORD_FUNCTION_SQL } = require("../../scripts/provisioning/neon-migrator.cjs");
const host = "ep-synthetic-pilot.eu-central-1.aws.neon.tech";
const apply = ["--apply", `--host=${host}`, "--ack-provider-audit-risk"];
const password = "synthetic-only-password-32-characters'); DROP ROLE sam_pilot_app; --";
const url = `postgresql://neondb_owner:synthetic-admin-only@${host}/neondb?sslmode=verify-full`;

function roleRows(enabled) {
  return ["sam_pilot_app", "sam_pilot_migrator"].map(name => ({
    name, login: name === "sam_pilot_migrator" && enabled, inherit: false,
    superuser: false, createdb: false, createrole: false, replication: false,
    bypassrls: false, parent_membership: false, database_create: false,
    database_connect: true, schema_usage: true,
    schema_create: name === "sam_pilot_migrator", public_create: false
  }));
}
function fixture(options = {}) {
  const calls = [], configs = [], outputs = [], reads = [];
  let enabled = false;
  const deps = {
    readSecret(key) {
      reads.push(key);
      return key.endsWith("DATABASE_URL") ? (options.url ?? url) : (options.password ?? password);
    },
    readEnv() { return options.tlsOverride; },
    emit(result) { outputs.push(JSON.stringify(result)); },
    makeClient(config) {
      configs.push(config);
      const isAdmin = config.user === "neondb_owner";
      return {
        on(event, handler) { assert.equal(event, "error"); assert.equal(typeof handler, "function"); },
        async connect() {
          if (options.connectFailure === config.user) throw new Error(`${url} ${password}`);
        },
        async end() {
          if (options.closeFailure) throw new Error(`${url} ${password}`);
        },
        async query(sql, params) {
          calls.push({ sql, params, user: config.user });
          if (options.failSql?.(sql, isAdmin)) throw new Error(`${url} ${password}`);
          if (sql === "SELECT pg_temp.sam_set_migrator_password($1::text)") enabled = true;
          if (sql === "ALTER ROLE sam_pilot_migrator NOLOGIN PASSWORD NULL") enabled = false;
          let rows = [];
          if (sql.includes("AS locked")) rows = [{ locked: options.locked ?? true }];
          else if (sql.includes("AS migration_admin")) rows = [{
            database: options.database ?? "neondb",
            current_role: options.currentRole ?? config.user,
            session_role: options.sessionRole ?? config.user,
            version: options.version ?? 180000,
            can_manage_roles: options.canManage ?? true, migration_admin: options.adminOption ?? true
          }];
          else if (sql.includes("ORDER BY r.rolname")) {
            rows = roleRows(enabled);
            options.changeRoles?.(rows, isAdmin);
          } else if (sql.includes("FROM pg_namespace n WHERE")) rows = [{
            owner: options.schemaOwner ?? "sam_pilot_migrator", empty: options.empty ?? true
          }];
          else if (sql.includes("e.extversion")) rows = options.extensionMissing ? [] : [{
            version: options.extensionVersion ?? "1.4", schema: options.extensionSchema ?? "public",
            owner: options.extensionOwner ?? "neondb_owner", core_uuid: true
          }];
          else if (sql.includes("current_schema()")) rows = [{ schema: options.searchPath ?? "sam_pilot" }];
          return { rows };
        }
      };
    }
  };
  return { deps, calls, configs, outputs, reads };
}
async function execute(options = {}, argv = apply) {
  const f = fixture(options);
  const result = await run(argv, f.deps);
  assert.ok(f.outputs.every(line => !line.includes(password) && !line.includes("synthetic-admin-only")));
  return { ...f, result };
}

test("default/help never read environment, load pg or connect", async () => {
  for (const argv of [[], ["--help"]]) {
    const f = fixture();
    f.deps.readSecret = f.deps.readEnv = f.deps.makeClient = () => assert.fail("Unexpected access");
    assert.equal((await run(argv, f.deps)).status, "NOT_APPLIED");
  }
});
test("approval flags are exact, duplicate/unknown options denied before secret reads", async () => {
  for (const argv of [
    ["--apply"], ["--apply", `--host=${host}`], [...apply, "--apply"],
    [...apply, "--password=do-not-pass-secrets"], ["--help", "--apply"]
  ]) {
    const f = await execute({}, argv);
    assert.equal(f.result.status, "FAIL");
    assert.equal(f.reads.length, 0); assert.equal(f.configs.length, 0);
  }
});
test("direct hostname must be explicitly pinned; poolers/URLs/IPs/case tricks rejected", async () => {
  for (const bad of ["localhost", "127.0.0.1", "ep-a-pooler.eu.aws.neon.tech",
    "ep-a.eu.aws.neon.tech.evil.example", "https://ep-a.eu.aws.neon.tech", "EP-a.eu.aws.neon.tech"]) {
    const f = await execute({}, ["--apply", `--host=${bad}`, "--ack-provider-audit-risk"]);
    assert.equal(f.result.code, "DIRECT_HOST_REQUIRED"); assert.equal(f.reads.length, 0);
  }
});
test("URL target/identity/TLS overrides fail before connection", async () => {
  for (const bad of [
    url.replace(host, "ep-other.eu-central-1.aws.neon.tech"),
    url.replace("/neondb?", "/otherdb?"), url.replace("neondb_owner", "sam_pilot_migrator"),
    url.replace("verify-full", "require"), `${url}&sslmode=verify-full`,
    `${url}&ssl=false`, `${url}&options=-c%20role%3Dneondb_owner`, `${url}#fragment`,
    url.replace("/neondb?", ":6543/neondb?")
  ]) {
    const f = await execute({ url: bad });
    assert.equal(f.result.status, "FAIL"); assert.equal(f.configs.length, 0);
  }
  assert.equal((await execute({ tlsOverride: "0" })).result.code, "TLS_OVERRIDE_DENIED");
});
test("password policy rejects absent/short/control-character values without disclosure", async () => {
  for (const bad of ["", "short", `${password}\n`, `${password}\0`, "x".repeat(257)]) {
    const f = await execute({ password: bad });
    assert.equal(f.result.code, "MIGRATOR_PASSWORD_POLICY_DENIED"); assert.equal(f.configs.length, 0);
  }
});
test("successful mocked provisioning binds injection payload, pins TLS and authenticates restricted role", async () => {
  const f = await execute();
  assert.equal(f.result.status, "PASS"); assert.equal(f.result.connectionAttempts, 2);
  assert.equal(f.configs[0].ssl.rejectUnauthorized, true);
  assert.equal(f.configs[0].ssl.servername, host);
  assert.equal(typeof f.configs[0].ssl.checkServerIdentity, "function");
  assert.ok(f.configs[0].ssl.checkServerIdentity(host, { subject: { CN: "wrong.invalid" } }));
  assert.equal(f.configs[1].options, "-c search_path=sam_pilot,pg_catalog");
  const write = f.calls.find(call => call.sql === "SELECT pg_temp.sam_set_migrator_password($1::text)");
  assert.deepEqual(write.params, [password]);
  assert.ok(f.calls.every(call => !call.sql.includes(password)));
  assert.match(PASSWORD_FUNCTION_SQL, /SECURITY INVOKER SET search_path=pg_catalog/);
  assert.match(PASSWORD_FUNCTION_SQL, /format\('ALTER ROLE %I LOGIN PASSWORD %L', 'sam_pilot_migrator', p_password\)/);
  assert.ok(f.calls.some(call => call.sql.startsWith("DROP FUNCTION pg_temp.")));
  assert.ok(f.calls.every(call => !/ALTER ROLE sam_pilot_app|GRANT |CREATE ROLE|CREATE EXTENSION/i.test(call.sql)));
  assert.equal(f.result.migrationsRun, false);
});
test("raw provider/TLS errors and close errors never reach output", async () => {
  const f = await execute({ connectFailure: "neondb_owner", closeFailure: true });
  assert.equal(f.result.code, "PROVISIONER_CONNECTION_FAILED");
  assert.equal(f.result.connectionAttempts, 1);
});
test("identity, ADMIN option, schema and extension preconditions fail without mutation", async () => {
  for (const options of [
    { database: "other" }, { currentRole: "other" }, { sessionRole: "other" },
    { version: 170000 }, { version: 190000 }, { version: "180000" },
    { adminOption: false }, { canManage: false },
    { schemaOwner: "neondb_owner" }, { empty: false }, { extensionMissing: true },
    { extensionVersion: "1.3" }, { extensionSchema: "sam_pilot" }, { extensionOwner: "other" },
    { locked: false }
  ]) {
    const f = await execute(options);
    assert.equal(f.result.status, "FAIL");
    assert.ok(!f.calls.some(call => call.sql === PASSWORD_FUNCTION_SQL));
    assert.ok(f.calls.some(call => call.sql === "ROLLBACK"));
  }
});
test("each unsafe role attribute/membership/effective privilege is denied", async () => {
  for (const key of ["login", "inherit", "superuser", "createdb", "createrole",
    "replication", "bypassrls", "parent_membership", "database_create", "public_create"]) {
    for (const index of [0, 1]) {
      const f = await execute({ changeRoles(rows) { rows[index][key] = true; } });
      assert.equal(f.result.code, "ROLE_PRECONDITIONS_DENIED");
      assert.ok(!f.calls.some(call => call.sql === PASSWORD_FUNCTION_SQL));
    }
  }
  for (const key of ["database_connect", "schema_usage"]) {
    assert.equal((await execute({ changeRoles(rows) { rows[1][key] = false; } })).result.status, "FAIL");
  }
});
test("transaction failure rolls back without retrying the password call", async () => {
  const f = await execute({ failSql: sql => sql.startsWith("SELECT pg_temp.sam_set") });
  assert.equal(f.result.recovery, "ROLLED_BACK");
  assert.equal(f.calls.filter(call => call.sql.startsWith("SELECT pg_temp.sam_set")).length, 1);
  assert.equal(f.configs.length, 1);
});
test("failed authentication/search_path disables migrator; never claims PASS", async () => {
  for (const options of [{ connectFailure: "sam_pilot_migrator" }, { searchPath: "public" }]) {
    const f = await execute(options);
    assert.equal(f.result.status, "FAIL"); assert.equal(f.result.recovery, "MIGRATOR_DISABLED");
    assert.ok(f.calls.some(call => call.sql === "ALTER ROLE sam_pilot_migrator NOLOGIN PASSWORD NULL"));
  }
});
test("uncertain COMMIT and failed compensation report remote state unknown", async () => {
  const f = await execute({ failSql: sql => sql === "COMMIT" || sql.startsWith("ALTER ROLE") });
  assert.equal(f.result.status, "FAIL"); assert.equal(f.result.recovery, "REMOTE_STATE_UNKNOWN");
  assert.equal(f.configs.length, 1);
});
test("post-auth application-role change is detected without altering application", async () => {
  const f = await execute({ changeRoles(rows, isAdmin) {
    if (!isAdmin) rows[0].login = true;
  } });
  assert.equal(f.result.status, "FAIL"); assert.equal(f.result.recovery, "MIGRATOR_DISABLED");
  assert.ok(f.calls.every(call => !/ALTER ROLE sam_pilot_app/.test(call.sql)));
});
