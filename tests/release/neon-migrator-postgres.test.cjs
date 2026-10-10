"use strict";
// Real SQL/quoting/authentication on a private, disposable LOCAL PostgreSQL
// cluster. Not a Neon/PG18/full-helper acceptance test; no existing DB/secret.
const test = require("node:test");
const assert = require("node:assert/strict");
const { spawnSync, spawn } = require("node:child_process");
const { mkdtempSync, rmSync } = require("node:fs");
const { tmpdir } = require("node:os");
const { join } = require("node:path");
const net = require("node:net");
const { once } = require("node:events");
const { Client } = require("pg");
const { PASSWORD_FUNCTION_SQL, disable } = require("../../scripts/provisioning/neon-migrator.cjs");

function tool(name, args) {
  const result = spawnSync(name, args, {
    encoding: "utf8", timeout: 30000,
    // Never inherit external credentials even if this fixture is invoked alone.
    env: { PATH: process.env.PATH, HOME: tmpdir(), LC_ALL: "C" }
  });
  assert.equal(result.status, 0, `Local fixture command failed: ${name}`);
}
async function port() {
  const server = net.createServer();
  server.listen(0, "127.0.0.1"); await once(server, "listening");
  const value = server.address().port;
  await new Promise(resolve => server.close(resolve));
  return value;
}
test("real local PostgreSQL quotes adversarial passwords and preserves restricted/app roles", async () => {
  const dir = mkdtempSync(join(tmpdir(), "sam-migrator-sql-fixture-"));
  const data = join(dir, "data");
  const tcpPort = await port();
  let started = false, root, admin;
  const base = { port: tcpPort, database: "postgres", ssl: false, connectionTimeoutMillis: 5000 };
  try {
    tool("initdb", ["-D", data, "-U", "local_fixture_admin", "--auth-local=trust",
      "--auth-host=scram-sha-256", "--no-locale"]);
    tool("pg_ctl", ["-D", data, "-l", join(dir, "postgres.log"),
      "-o", `-p ${tcpPort} -k ${dir} -h 127.0.0.1 -c log_statement=none`, "-w", "start"]);
    started = true;
    root = new Client({ ...base, host: dir, user: "local_fixture_admin" });
    await root.connect();
    await root.query("CREATE ROLE neondb_owner LOGIN CREATEROLE NOSUPERUSER NOBYPASSRLS");
    await root.query("GRANT pg_signal_backend TO neondb_owner");
    admin = new Client({ ...base, host: dir, user: "neondb_owner" });
    await admin.connect();
    await admin.query(`CREATE ROLE sam_pilot_migrator NOLOGIN NOINHERIT NOSUPERUSER
      NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS;
      CREATE ROLE sam_pilot_app NOLOGIN NOINHERIT NOSUPERUSER
      NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS`);
    const membership = (await admin.query(`SELECT m.admin_option FROM pg_auth_members m
      JOIN pg_roles r ON r.oid=m.roleid JOIN pg_roles u ON u.oid=m.member
      WHERE r.rolname=$1 AND u.rolname=current_user`, ["sam_pilot_migrator"])).rows;
    assert.equal(membership[0]?.admin_option, true);
    const payloads = [
      "synthetic-password-32-characters'); DROP ROLE sam_pilot_app; --",
      "synthetic-quote-'double\"-backslash\\-dollar$$-Unicode-\u03bb-password",
      "synthetic-only-32-character-password-with-semicolon;and-comment--"
    ];
    for (const password of payloads) {
      await admin.query("BEGIN");
      await admin.query(PASSWORD_FUNCTION_SQL);
      await admin.query("SELECT pg_temp.sam_set_migrator_password($1::text)", [password]);
      await admin.query("DROP FUNCTION pg_temp.sam_set_migrator_password(text)");
      await admin.query("COMMIT");
      const login = new Client({
        ...base, host: "127.0.0.1", user: "sam_pilot_migrator", password
      });
      try {
        await login.connect();
        assert.equal((await login.query("SHOW default_transaction_read_only")).rows[0].default_transaction_read_only, "on");
        await assert.rejects(() => login.query("CREATE TABLE local_should_not_exist(id int)"),
          error => error.code === "25006");
        const row = (await login.query("SELECT current_user AS role, session_user AS session")).rows[0];
        assert.equal(row.role, "sam_pilot_migrator");
        assert.equal(row.session, row.role);
        const attributes = (await login.query(`SELECT rolname,rolcanlogin,rolsuper,
          rolcreatedb,rolcreaterole,rolreplication,rolbypassrls,rolinherit
          FROM pg_roles WHERE rolname IN ($1,$2) ORDER BY rolname`,
          ["sam_pilot_migrator", "sam_pilot_app"])).rows;
        assert.equal(attributes.length, 2);
        assert.equal(attributes[0].rolcanlogin, false);
        assert.equal(attributes[1].rolcanlogin, true);
        for (const row of attributes)
          for (const flag of ["rolsuper", "rolcreatedb", "rolcreaterole",
            "rolreplication", "rolbypassrls", "rolinherit"])
            assert.equal(row[flag], false);
      } finally { await login.end(); }
    }
    // Original migrations and model-adapter regression receive ONLY this local
    // synthetic cluster's restricted migrator credentials, never existing secrets.
    await root.query(`CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;
      CREATE SCHEMA sam_pilot AUTHORIZATION sam_pilot_migrator;
      GRANT USAGE ON SCHEMA sam_pilot TO sam_pilot_app`);
    // Only this synthetic regression fixture explicitly removes the advisory
    // read-only default; normal helper authentication NEVER runs migrations.
    await admin.query("ALTER ROLE sam_pilot_migrator RESET ALL");
    const url = new URL(`postgresql://sam_pilot_migrator@127.0.0.1:${tcpPort}/postgres`);
    url.password = payloads[payloads.length - 1];
    url.searchParams.set("sslmode", "disable"); // Loopback fixture only, not helper configuration.
    url.searchParams.set("options", "-c search_path=sam_pilot,pg_catalog");
    const env = {
      PATH: process.env.PATH, HOME: tmpdir(), NODE_ENV: "test",
      DATABASE_URL: url.toString()
    };
    for (const args of [
      ["packages/db/src/migrate.js", "--apply"],
      ["--import", "tsx", "tests/phase11/model_adapters.ts"]
    ]) {
      const regression = spawnSync(process.execPath, args, {
        env, encoding: "utf8", timeout: 30000
      });
      // Never print subprocess output: it could contain an adversarial fixture value.
      assert.equal(regression.status, 0, "Private synthetic database regression failed");
    }
    // The same temporary function is transactional; rollback preserves NOLOGIN.
    await admin.query("ALTER ROLE sam_pilot_migrator NOLOGIN PASSWORD NULL");
    await admin.query("BEGIN");
    await admin.query(PASSWORD_FUNCTION_SQL);
    await admin.query("SELECT pg_temp.sam_set_migrator_password($1::text)", [payloads[0]]);
    await admin.query("ROLLBACK");
    assert.equal((await admin.query("SELECT rolcanlogin FROM pg_roles WHERE rolname=$1",
      ["sam_pilot_migrator"])).rows[0].rolcanlogin, false);
    assert.equal((await admin.query(
      "SELECT to_regprocedure('pg_temp.sam_set_migrator_password(text)') AS helper"
    )).rows[0].helper, null);
    // Genuine process death after credential commit; IPC carries synthetic data
    // only. No task/runtime changes or credentials in argv/environment.
    const child = spawn(process.execPath, ["-e", `
      const {Client}=require('pg');
      const {PASSWORD_FUNCTION_SQL}=require('./scripts/provisioning/neon-migrator.cjs');
      process.once('message',async data=>{
        try {
          const client=new Client(data.config);await client.connect();
          await client.query('BEGIN');await client.query(PASSWORD_FUNCTION_SQL);
          await client.query('SELECT pg_temp.sam_set_migrator_password($1::text)',[data.password]);
          await client.query('DROP FUNCTION pg_temp.sam_set_migrator_password(text)');
          await client.query('COMMIT');process.send({phase:'COMMITTED'});
        } catch {process.exit(1);}
      });
    `], { env: { LANG: "C" }, stdio: ["ignore", "ignore", "ignore", "ipc"] });
    try {
      const committed = new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          child.kill("SIGKILL"); reject(new Error("LOCAL_CRASH_FIXTURE_TIMEOUT"));
        }, 10000);
        child.once("message", message => { clearTimeout(timeout); resolve(message); });
        child.once("exit", () => { clearTimeout(timeout); reject(new Error("LOCAL_CRASH_FIXTURE_EXITED")); });
      });
      child.send({ config: { ...base, host: dir, user: "neondb_owner" }, password: payloads[0] });
      const message = await committed;
      assert.equal(message.phase, "COMMITTED");
      const exited = once(child, "exit"); child.kill("SIGKILL"); await exited;
      const state = (await admin.query(`SELECT rolcanlogin,rolconnlimit,
        rolvaliduntil > now() AND rolvaliduntil <= now()+interval '121 seconds' AS bounded
        FROM pg_roles WHERE rolname=$1`, ["sam_pilot_migrator"])).rows[0];
      assert.equal(state.rolcanlogin, true); assert.equal(state.rolconnlimit, 1);
      assert.equal(state.bounded, true); // Crash is contained, NOT automatically reconciled.
      const existing = new Client({ ...base, host: "127.0.0.1", user: "sam_pilot_migrator", password: payloads[0] });
      existing.on("error", () => {});
      try {
        await existing.connect();
        await admin.query("ALTER ROLE sam_pilot_migrator VALID UNTIL 'epoch'");
        assert.equal((await existing.query("SELECT 1 AS alive")).rows[0].alive, 1);
        // Expiry alone does NOT terminate this existing authenticated session.
        const expired = new Client({ ...base, host: "127.0.0.1",
          user: "sam_pilot_migrator", password: payloads[0] });
        try { await assert.rejects(() => expired.connect(), error => error.code === "28P01"); }
        finally { await expired.end(); }
        await disable(admin);
        const final = (await admin.query(`SELECT rolcanlogin,rolconnlimit,
          rolvaliduntil < now() AS expired FROM pg_roles WHERE rolname=$1`,
          ["sam_pilot_migrator"])).rows[0];
        assert.deepEqual(final, { rolcanlogin: false, rolconnlimit: 0, expired: true });
        const rejected = new Client({ ...base, host: "127.0.0.1", user: "sam_pilot_migrator", password: payloads[0] });
        try { await assert.rejects(() => rejected.connect()); } finally { await rejected.end(); }
      } finally { await existing.end().catch(() => {}); }
    } finally { if (child.exitCode === null && child.signalCode === null) child.kill("SIGKILL"); }
  } finally {
    await admin?.end(); await root?.end();
    try { if (started) tool("pg_ctl", ["-D", data, "-m", "immediate", "-w", "stop"]); }
    finally { rmSync(dir, { recursive: true, force: true }); }
  }
});
