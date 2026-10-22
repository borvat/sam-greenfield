"use strict";
// Hidden terminal input -> private pipe -> credential-free child environment.
// No workspace Secrets reads or writes and no daemon/worker launches.
const { spawn } = require("node:child_process");
const { readSync } = require("node:fs");
const { StringDecoder } = require("node:string_decoder");
const path = require("node:path");
let packet;
function isolatedInputs() {
  if (packet) return packet;
  if (process.env.SAM_PROVISIONING_ISOLATED_CHANNEL !== "1" ||
      Object.keys(process.env).some(key => /SECRET|PASSWORD|DATABASE_URL|NODE_OPTIONS|API_KEY/.test(key)))
    throw new Error("ISOLATED_INPUT_REQUIRED");
  const bytes = Buffer.alloc(32769);
  let size = 0;
  while (size < bytes.length) {
    const count = readSync(3, bytes, size, bytes.length - size, null);
    if (!count) break;
    size += count;
  }
  if (size === bytes.length) throw new Error("ISOLATED_INPUT_INVALID");
  try {
    const data = JSON.parse(bytes.subarray(0, size).toString("utf8"));
    bytes.fill(0);
    if (Object.keys(data).some(key => !["SAM_PILOT_PROVISIONER_DATABASE_URL",
      "SAM_PILOT_MIGRATOR_PASSWORD"].includes(key))) throw new Error();
    packet = data; return packet;
  } catch { throw new Error("ISOLATED_INPUT_INVALID"); }
}
function hidden(prompt, input = process.stdin, output = process.stdout) {
  return new Promise((resolve, reject) => {
    if (!input.isTTY || !output.isTTY) return reject(new Error("PRIVATE_TERMINAL_REQUIRED"));
    const previous = Boolean(input.isRaw), decoder = new StringDecoder("utf8");
    let value = "", finished = false;
    const finish = (error) => {
      if (finished) return; finished = true;
      input.off("data", onData); input.off("end", onEnd); input.pause();
      process.off("SIGTERM", onEnd);
      input.setRawMode(previous); output.write("\n");
      if (error) reject(new Error("PRIVATE_INPUT_CANCELLED")); else resolve(value);
    };
    const onEnd = () => finish(true);
    const onData = chunk => {
      for (const char of decoder.write(chunk)) {
        if (char === "\r" || char === "\n") return finish(false);
        if (char === "\u0003" || char === "\u0004" || value.length >= 16000) return finish(true);
        if (char === "\u007f" || char === "\b") value = value.slice(0, -1);
        else value += char;
      }
    };
    output.write(prompt); input.setRawMode(true); input.resume();
    input.on("data", onData); input.once("end", onEnd);
    process.once("SIGTERM", onEnd);
  });
}
function launch(argv, inputs, spawnChild = spawn) {
  return new Promise(resolve => {
    const child = spawnChild(process.execPath,
      [path.join(__dirname, "neon-migrator.cjs"), ...argv], {
        env: { LANG: "C.UTF-8", SAM_PROVISIONING_ISOLATED_CHANNEL: "1" },
        stdio: ["ignore", "pipe", "pipe", "pipe"]
      });
    let stdout = "", settled = false;
    const timer = setTimeout(() => {
      child.kill("SIGTERM"); finish({ status: "FAIL", code: "RECONCILE_REQUIRED" });
    }, 60000);
    timer.unref();
    const finish = result => {
      if (!settled) { settled = true; clearTimeout(timer); resolve(result); }
    };
    // Never forward child stderr/raw output, even if it crashes before run().
    child.stdout.on("data", chunk => {
      stdout = (stdout + chunk.toString("utf8")).slice(0, 8192);
    });
    child.stderr.on("data", () => {});
    child.on("error", () => finish({ status: "FAIL", code: "ISOLATED_CHILD_FAILED" }));
    child.on("exit", code => {
      try {
        const result = JSON.parse(stdout);
        // Allowlist values, not just field names; arbitrary child output is untrusted.
        const allowed = ["MIGRATOR_AUTHENTICATED_AND_CLOSED", "MIGRATOR_RECONCILED_CLOSED"];
        if (code === 0 && result.status === "PASS" && allowed.includes(result.code)) {
          finish({ status: "PASS", code: result.code, migrationsRun: false });
        } else {
          const localCodes = ["PROVISIONER_URL_INVALID", "PROVISIONER_TARGET_DENIED",
            "TLS_URL_OPTIONS_DENIED", "PROVISIONER_IDENTITY_DENIED",
            "MIGRATOR_PASSWORD_POLICY_DENIED", "TLS_OVERRIDE_DENIED", "LOCAL_VALIDATION_FAILED"];
          const preWriteCodes = ["SERVER_LOGGING_REVIEW_REQUIRED", "ROLE_ADMIN_PERMISSION_DENIED",
            "ROLE_PRECONDITIONS_DENIED", "ROLE_LEASE_PRECONDITIONS_DENIED",
            "EMPTY_PILOT_SCHEMA_REQUIRED", "PILOT_SCHEMA_OWNER_DENIED", "EXTENSION_PRECONDITIONS_DENIED"];
          if (result.status === "FAIL" && result.connectionAttempts === 0 &&
              localCodes.includes(result.code))
            finish({ status: "FAIL", code: result.code });
          else if (result.status === "FAIL" && result.recovery === "ROLLED_BACK" &&
              preWriteCodes.includes(result.code))
            finish({ status: "FAIL", code: result.code });
          else finish({ status: "FAIL", code: "RECONCILE_REQUIRED" });
        }
      } catch { finish({ status: "FAIL", code: "RECONCILE_REQUIRED" }); }
    });
    child.stdio[3].on("error", () => {});
    child.stdio[3].end(JSON.stringify(inputs));
  });
}
async function main() {
  const argv = process.argv.slice(2);
  const { argumentsFor } = require("./neon-migrator.cjs");
  const request = argumentsFor(argv);
  if (!request) return console.log('{"status":"NOT_APPLIED","code":"APPLY_REQUIRED"}');
  if (Object.keys(process.env).some(key => ["NODE_OPTIONS",
    "SAM_PILOT_PROVISIONER_DATABASE_URL", "SAM_PILOT_MIGRATOR_PASSWORD"].includes(key)))
    throw new Error("SHARED_SECRET_OR_PRELOAD_DENIED");
  const inputs = {
    SAM_PILOT_PROVISIONER_DATABASE_URL: await hidden("Administrator URL (hidden): ")
  };
  if (!request.reconcile)
    inputs.SAM_PILOT_MIGRATOR_PASSWORD = await hidden("Temporary random password (hidden): ");
  const result = await launch(argv, inputs);
  console.log(JSON.stringify(result));
  process.exitCode = result.status === "PASS" ? 0 : 1;
}
module.exports = { isolatedInputs, hidden, launch };
if (require.main === module) {
  main().catch(() => {
    console.error('{"status":"FAIL","code":"ISOLATED_INPUT_OR_APPROVAL_FAILED"}');
    process.exitCode = 1;
  });
}
