"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const { EventEmitter } = require("node:events");
const { PassThrough } = require("node:stream");
const { spawnSync, spawn } = require("node:child_process");
const { once } = require("node:events");
const { hidden, launch } = require("../../scripts/provisioning/neon-migrator-once.cjs");

test("one-shot child receives credentials only in private pipe, never env/argv", async () => {
  const secret = "synthetic-private-admin-credential";
  let options, args, sent = "";
  const spawn = (_binary, argv, opts) => {
    options = opts; args = argv;
    const child = new EventEmitter();
    child.stdout = new PassThrough(); child.stderr = new PassThrough();
    child.stdio = [null, child.stdout, child.stderr, new PassThrough()];
    child.stdio[3].on("data", chunk => sent += chunk);
    child.stdio[3].on("finish", () => {
      child.stderr.write(secret); // Even malicious/raw child stderr is discarded.
      child.stdout.write('{"status":"PASS","code":"MIGRATOR_AUTHENTICATED_AND_CLOSED"}');
      child.emit("exit", 0);
    });
    return child;
  };
  const result = await launch(["--apply"], { SAM_PILOT_PROVISIONER_DATABASE_URL: secret }, spawn);
  assert.deepEqual(options.env, { LANG: "C.UTF-8", SAM_PROVISIONING_ISOLATED_CHANNEL: "1" });
  assert.ok(!JSON.stringify(args).includes(secret));
  assert.ok(!JSON.stringify(options).includes(secret));
  assert.equal(JSON.parse(sent).SAM_PILOT_PROVISIONER_DATABASE_URL, secret);
  assert.ok(!JSON.stringify(result).includes(secret));
});
test("child crash or injected output never becomes PASS or exposes raw text", async () => {
  for (const output of ["synthetic-password-leak", '{"status":"PASS","code":"synthetic-password"}']) {
    const spawn = () => {
      const child = new EventEmitter();
      child.stdout = new PassThrough(); child.stderr = new PassThrough();
      child.stdio = [null, child.stdout, child.stderr, new PassThrough()];
      child.stdio[3].on("finish", () => {
        child.stdout.write(output); child.emit("exit", null, "SIGKILL");
      });
      return child;
    };
    assert.deepEqual(await launch([], {}, spawn), { status: "FAIL", code: "RECONCILE_REQUIRED" });
  }
});
test("hidden prompt echoes no input and restores terminal mode on success/cancel", async () => {
  for (const cancelled of [false, true]) {
    const input = new PassThrough(), output = new PassThrough();
    input.isTTY = output.isTTY = true; input.isRaw = false;
    input.setRawMode = value => input.isRaw = value;
    let printed = ""; output.on("data", chunk => printed += chunk);
    const promise = hidden("Safe fixed prompt: ", input, output);
    input.write(Buffer.from("synthetic-hidden-password"));
    input.write(Buffer.from(cancelled ? "\u0003" : "\r"));
    if (cancelled) await assert.rejects(promise); else assert.equal(await promise, "synthetic-hidden-password");
    assert.equal(input.isRaw, false); assert.ok(!printed.includes("synthetic-hidden-password"));
  }
});
test("direct entry cannot fall back to shared secrets; no-apply remains inert", () => {
  const argv = ["--apply", "--host=ep-synthetic.eu-central-1.aws.neon.tech", "--ack-provider-audit-risk"];
  const env = { LANG: "C", SAM_PILOT_PROVISIONER_DATABASE_URL: "synthetic-must-not-be-read" };
  for (const file of ["neon-migrator.cjs", "neon-migrator-once.cjs"]) {
    const result = spawnSync(process.execPath, [`scripts/provisioning/${file}`, ...argv],
      { env, encoding: "utf8", timeout: 5000 });
    assert.equal(result.status, 1); assert.ok(!result.stdout.includes(env.SAM_PILOT_PROVISIONER_DATABASE_URL));
    const idle = spawnSync(process.execPath, [`scripts/provisioning/${file}`],
      { env, encoding: "utf8", timeout: 5000 });
    assert.equal(idle.status, 0); assert.match(idle.stdout, /NOT_APPLIED/);
  }
});
test("real private-fd child validates synthetic inputs without echo or network attempt", async () => {
  const child = spawn(process.execPath, ["scripts/provisioning/neon-migrator.cjs",
    "--apply", "--host=ep-synthetic.eu-central-1.aws.neon.tech", "--ack-provider-audit-risk"], {
      env: { LANG: "C", SAM_PROVISIONING_ISOLATED_CHANNEL: "1" },
      stdio: ["ignore", "pipe", "pipe", "pipe"]
    });
  let output = "", stderr = "";
  child.stdout.on("data", chunk => output += chunk);
  child.stderr.on("data", chunk => stderr += chunk);
  const exited = once(child, "exit");
  child.stdio[3].end(JSON.stringify({
    SAM_PILOT_PROVISIONER_DATABASE_URL: "synthetic-invalid-url",
    SAM_PILOT_MIGRATOR_PASSWORD: "synthetic-private-password-at-least-32-characters"
  }));
  const [code] = await exited;
  assert.equal(code, 1);
  const result = JSON.parse(output);
  assert.equal(result.code, "PROVISIONER_URL_INVALID");
  assert.equal(result.connectionAttempts, 0);
  assert.equal(stderr, "");
  assert.ok(!output.includes("synthetic-invalid-url") && !output.includes("synthetic-private-password"));
});
test("actual isolated launcher reports invalid private input without claiming remote recovery needed", async () => {
  const result = await launch(["--apply", "--host=ep-synthetic.eu-central-1.aws.neon.tech",
    "--ack-provider-audit-risk"], {
    SAM_PILOT_PROVISIONER_DATABASE_URL: "synthetic-invalid-url",
    SAM_PILOT_MIGRATOR_PASSWORD: "synthetic-password-at-least-32-characters"
  });
  assert.deepEqual(result, { status: "FAIL", code: "PROVISIONER_URL_INVALID" });
});
