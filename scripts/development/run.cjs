const { spawn } = require("node:child_process");
const { root, readConfig, serviceEnvironment, checkDatabase } = require("./environment.cjs");

async function main() {
  const service = process.argv[2];
  const config = readConfig();
  const env = serviceEnvironment(service, config);
  await checkDatabase(env, config);
  const entries = {
    runtime: "apps/runtime/src/main.ts",
    mcp: "apps/mcp/src/main.ts",
    "command-center": "apps/command-center/src/main.ts"
  };
  console.log(`SAM development ${service}: isolated database; external/financial/legal execution DISABLED.`);
  const child = spawn(process.execPath, ["--import", "tsx", entries[service]], {
    cwd: root, env, stdio: "inherit"
  });
  for (const signal of ["SIGTERM", "SIGINT"]) {
    process.on(signal, () => child.kill(signal));
  }
  child.on("error", () => {
    console.error("Could not launch SAM development service.");
    process.exitCode = 1;
  });
  child.on("exit", (code, signal) => {
    process.exitCode = code ?? (signal ? 1 : 0);
  });
}

main().catch(error => {
  console.error("SAM development launch failed:", error.message);
  process.exitCode = 1;
});
