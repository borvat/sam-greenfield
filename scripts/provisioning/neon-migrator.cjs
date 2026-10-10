"use strict";

// Standalone, opt-in credential provisioning. Never imported by SAM's runtime.
const tls = require("node:tls");
const ROLE = "sam_pilot_migrator";
const APP = "sam_pilot_app";
const SCHEMA = "sam_pilot";
const OWNER = "neondb_owner";
const DB = "neondb";
const INPUTS = ["SAM_PILOT_PROVISIONER_DATABASE_URL", "SAM_PILOT_MIGRATOR_PASSWORD"];
class Denied extends Error {
  constructor(code) { super(code); this.safeCode = code; }
}
const deny = code => { throw new Denied(code); };

function argumentsFor(argv) {
  if (!argv.length) return null;
  if (argv.length === 1 && argv[0] === "--help") return null;
  const hostArgs = argv.filter(arg => arg.startsWith("--host="));
  if (argv.length !== 3 || !argv.includes("--apply") ||
      !argv.includes("--ack-provider-audit-risk") || hostArgs.length !== 1)
    deny("EXPLICIT_APPROVAL_REQUIRED");
  const host = hostArgs[0].slice("--host=".length);
  if (!/^ep-[a-z0-9-]+(?:\.[a-z0-9-]+)+\.neon\.tech$/.test(host) ||
      host.includes("pooler") || host.length > 253)
    deny("DIRECT_HOST_REQUIRED");
  return host;
}

function configurations(host, readSecret, readEnv) {
  if (readEnv("NODE_TLS_REJECT_UNAUTHORIZED") === "0") deny("TLS_OVERRIDE_DENIED");
  const input = readSecret(INPUTS[0]);
  const password = readSecret(INPUTS[1]);
  let url;
  try { url = new URL(input); } catch { deny("PROVISIONER_URL_INVALID"); }
  if (!["postgres:", "postgresql:"].includes(url.protocol) || url.hash ||
      url.hostname !== host || url.pathname !== `/${DB}` ||
      (url.port && url.port !== "5432"))
    deny("PROVISIONER_TARGET_DENIED");
  if ([...url.searchParams.keys()].length !== 1 ||
      url.searchParams.get("sslmode") !== "verify-full")
    deny("TLS_URL_OPTIONS_DENIED");
  let user, adminPassword;
  try {
    user = decodeURIComponent(url.username);
    adminPassword = decodeURIComponent(url.password);
  } catch { deny("PROVISIONER_URL_INVALID"); }
  if (user !== OWNER || !adminPassword) deny("PROVISIONER_IDENTITY_DENIED");
  // A 32+ character password-manager-generated random value is required.
  // Length is a safety minimum, not proof of entropy.
  if (typeof password !== "string" || password.length < 32 ||
      password.length > 256 || /[\u0000-\u001f\u007f]/u.test(password))
    deny("MIGRATOR_PASSWORD_POLICY_DENIED");
  const base = {
    host, port: 5432, database: DB,
    ssl: { rejectUnauthorized: true, servername: host, checkServerIdentity: tls.checkServerIdentity },
    connectionTimeoutMillis: 5000, query_timeout: 10000,
    statement_timeout: 10000, lock_timeout: 3000,
    application_name: "sam-pilot-credential-provisioner"
  };
  // Explicit pg fields avoid connection-string sslmode overriding SSL settings.
  return {
    admin: { ...base, user: OWNER, password: adminPassword },
    migrator: { ...base, user: ROLE, password, options: `-c search_path=${SCHEMA},pg_catalog` },
    password
  };
}

const IDENTITY_SQL = `
SELECT current_database() AS database, current_user AS current_role,
 session_user AS session_role, current_setting('server_version_num')::int AS version,
 (SELECT rolcreaterole FROM pg_roles WHERE rolname=current_user) AS can_manage_roles,
 EXISTS(SELECT 1 FROM pg_auth_members m
   JOIN pg_roles r ON r.oid=m.roleid
   JOIN pg_roles u ON u.oid=m.member
   WHERE r.rolname=$1 AND u.rolname=current_user AND m.admin_option) AS migration_admin`;
const ROLES_SQL = `
SELECT r.rolname AS name, r.rolcanlogin AS login, r.rolinherit AS inherit,
 r.rolsuper AS superuser, r.rolcreatedb AS createdb, r.rolcreaterole AS createrole,
 r.rolreplication AS replication, r.rolbypassrls AS bypassrls,
 EXISTS(SELECT 1 FROM pg_auth_members m WHERE m.member=r.oid) AS parent_membership,
 has_database_privilege(r.oid,current_database(),'CREATE') AS database_create,
 has_database_privilege(r.oid,current_database(),'CONNECT') AS database_connect,
 has_schema_privilege(r.oid,$3,'USAGE') AS schema_usage,
 has_schema_privilege(r.oid,$3,'CREATE') AS schema_create,
 has_schema_privilege(r.oid,'public','CREATE') AS public_create
FROM pg_roles r WHERE r.rolname IN ($1,$2) ORDER BY r.rolname`;
const SCHEMA_SQL = `
SELECT pg_get_userbyid(n.nspowner) AS owner,
 NOT EXISTS(SELECT 1 FROM pg_class c WHERE c.relnamespace=n.oid)
 AND NOT EXISTS(SELECT 1 FROM pg_proc p WHERE p.pronamespace=n.oid)
 AND NOT EXISTS(SELECT 1 FROM pg_type t WHERE t.typnamespace=n.oid) AS empty
FROM pg_namespace n WHERE n.nspname=$1`;
const EXTENSION_SQL = `
SELECT e.extversion AS version, n.nspname AS schema,
 pg_get_userbyid(e.extowner) AS owner,
 to_regprocedure('pg_catalog.gen_random_uuid()') IS NOT NULL AS core_uuid
FROM pg_extension e JOIN pg_namespace n ON n.oid=e.extnamespace
WHERE e.extname=$1`;

function identity(row, user) {
  if (!row || row.database !== DB || row.current_role !== user ||
      row.session_role !== user || !Number.isInteger(row.version) ||
      row.version < 180000 || row.version >= 190000)
    deny("DATABASE_IDENTITY_DENIED");
}
function roles(rows, enabled) {
  if (rows.length !== 2 || new Set(rows.map(row => row.name)).size !== 2)
    deny("ROLE_PRECONDITIONS_DENIED");
  for (const row of rows) {
    if (![ROLE, APP].includes(row.name) || row.login !== (row.name === ROLE && enabled) ||
        [row.inherit, row.superuser, row.createdb, row.createrole, row.replication,
          row.bypassrls, row.parent_membership, row.database_create, row.public_create]
          .some(value => value !== false) ||
        row.database_connect !== true || row.schema_usage !== true ||
        row.schema_create !== (row.name === ROLE))
      deny("ROLE_PRECONDITIONS_DENIED");
  }
}

async function preflight(client) {
  const id = (await client.query(IDENTITY_SQL, [ROLE])).rows[0];
  identity(id, OWNER);
  if (id.can_manage_roles !== true || id.migration_admin !== true)
    deny("ROLE_ADMIN_PERMISSION_DENIED");
  roles((await client.query(ROLES_SQL, [ROLE, APP, SCHEMA])).rows, false);
  const schema = (await client.query(SCHEMA_SQL, [SCHEMA])).rows;
  if (schema.length !== 1 || schema[0].owner !== ROLE || schema[0].empty !== true)
    deny("EMPTY_PILOT_SCHEMA_REQUIRED");
  const extension = (await client.query(EXTENSION_SQL, ["pgcrypto"])).rows;
  if (extension.length !== 1 || extension[0].version !== "1.4" ||
      extension[0].schema !== "public" || extension[0].owner !== OWNER ||
      extension[0].core_uuid !== true)
    deny("EXTENSION_PRECONDITIONS_DENIED");
}

// SQL utility commands cannot use PASSWORD $1 directly. The password is bound
// only to a temporary, SECURITY INVOKER function; %I/%L quote server-side.
// Provider statement/parameter/error auditing can still expose credentials.
const PASSWORD_FUNCTION_SQL = `
CREATE FUNCTION pg_temp.sam_set_migrator_password(p_password text)
RETURNS void LANGUAGE plpgsql SECURITY INVOKER SET search_path=pg_catalog AS $fn$
BEGIN
 EXECUTE format('ALTER ROLE %I LOGIN PASSWORD %L', 'sam_pilot_migrator', p_password);
END
$fn$`;

async function close(client) {
  if (client) { try { await client.end(); } catch { /* Never log driver errors. */ } }
}

async function run(argv, dependencies = {}) {
  const emit = dependencies.emit || (result => console.log(JSON.stringify(result)));
  // Default accessors do not read any environment values until explicitly called.
  const readSecret = dependencies.readSecret || (key => process.env[key]);
  const readEnv = dependencies.readEnv || (key => process.env[key]);
  const makeClient = dependencies.makeClient || (config => new (require("pg").Client)(config));
  let admin, verifier, connected = false, transaction = false;
  let mutationAttempted = false, committed = false, commitAttempted = false, attempts = 0;
  let stage = "LOCAL_VALIDATION_FAILED";
  try {
    const host = argumentsFor(argv);
    if (!host) {
      const result = { status: "NOT_APPLIED", code: "APPLY_REQUIRED", connectionAttempts: 0 };
      emit(result); return result;
    }
    const config = configurations(host, readSecret, readEnv);
    stage = "PROVISIONER_CONNECTION_FAILED";
    admin = makeClient(config.admin);
    // Prevent unhandled idle socket errors from reaching stderr.
    admin.on("error", () => {});
    attempts++;
    await admin.connect(); connected = true;
    stage = "PREFLIGHT_FAILED";
    await admin.query("BEGIN"); transaction = true;
    const lock = (await admin.query(
      "SELECT pg_try_advisory_xact_lock(hashtextextended($1,0)) AS locked",
      ["sam_pilot_migrator_auth"]
    )).rows[0];
    if (lock?.locked !== true) deny("PROVISIONING_BUSY");
    await preflight(admin);
    stage = "PROVISIONING_FAILED";
    await admin.query(PASSWORD_FUNCTION_SQL);
    mutationAttempted = true;
    await admin.query("SELECT pg_temp.sam_set_migrator_password($1::text)", [config.password]);
    await admin.query("DROP FUNCTION pg_temp.sam_set_migrator_password(text)");
    commitAttempted = true;
    await admin.query("COMMIT"); transaction = false; committed = true;
    stage = "MIGRATOR_AUTHENTICATION_FAILED";
    verifier = makeClient(config.migrator);
    verifier.on("error", () => {});
    attempts++;
    await verifier.connect();
    await verifier.query("BEGIN READ ONLY");
    identity((await verifier.query(IDENTITY_SQL, [ROLE])).rows[0], ROLE);
    const context = (await verifier.query("SELECT current_schema() AS schema")).rows[0];
    if (context?.schema !== SCHEMA) deny("MIGRATOR_SEARCH_PATH_DENIED");
    roles((await verifier.query(ROLES_SQL, [ROLE, APP, SCHEMA])).rows, true);
    const owner = (await verifier.query(SCHEMA_SQL, [SCHEMA])).rows[0];
    if (owner?.owner !== ROLE || owner.empty !== true) deny("PILOT_SCHEMA_CHANGED");
    await verifier.query("COMMIT");
    // Check the application role is still NOLOGIN and unchanged in privileges.
    roles((await admin.query(ROLES_SQL, [ROLE, APP, SCHEMA])).rows, true);
    const result = {
      status: "PASS", code: "MIGRATOR_AUTHENTICATED",
      connectionAttempts: attempts, migrationRole: ROLE, applicationRoleUntouched: true,
      migrationsRun: false, providerAuditRiskAcknowledged: true
    };
    emit(result); return result;
  } catch (error) {
    let recovery = "NOT_NEEDED";
    if (transaction && connected) {
      try { await admin.query("ROLLBACK"); recovery = "ROLLED_BACK"; }
      catch { recovery = "REMOTE_STATE_UNKNOWN"; }
    }
    // A failed COMMIT reply can mean the commit happened. Fail closed by trying
    // to disable ONLY the migration LOGIN and erase its newly supplied password.
    if (connected && mutationAttempted &&
        (committed || commitAttempted || recovery === "REMOTE_STATE_UNKNOWN")) {
      try {
        await admin.query("BEGIN");
        await admin.query("ALTER ROLE sam_pilot_migrator NOLOGIN PASSWORD NULL");
        await admin.query("COMMIT");
        recovery = "MIGRATOR_DISABLED";
      } catch {
        recovery = "REMOTE_STATE_UNKNOWN";
        try { await admin.query("ROLLBACK"); } catch {}
      }
    }
    const result = {
      status: "FAIL", code: error instanceof Denied ? error.safeCode : stage,
      connectionAttempts: attempts, recovery, migrationsRun: false
    };
    // Never include err.message/stack/detail/query, URL, password or pg config.
    emit(result); return result;
  } finally {
    await close(verifier);
    await close(admin);
  }
}

module.exports = { run, PASSWORD_FUNCTION_SQL };
if (require.main === module) {
  run(process.argv.slice(2)).then(result => {
    process.exitCode = result.status === "FAIL" ? 1 : 0;
  }).catch(() => {
    console.error('{"status":"FAIL","code":"SAFE_OUTPUT_FAILURE"}');
    process.exitCode = 1;
  });
}
