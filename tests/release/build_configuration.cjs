// No install, registry access or credentials. Protect the production build contract.
const assert=require("node:assert/strict");
const fs=require("node:fs");
const {spawnSync}=require("node:child_process");
const source=fs.readFileSync(".replit","utf8");
const deployment=source.split("[deployment]")[1]?.split(/\n\[/)[0];
assert.ok(deployment);
const command=JSON.parse(deployment.match(/^build\s*=\s*(.+)$/m)[1]);
assert.deepEqual(command,["sh","-c","npm ci --include=dev && npm run typecheck"]);
assert.deepEqual(JSON.parse(deployment.match(/^run\s*=\s*(.+)$/m)[1]),
  ["env","NODE_ENV=production","npm","run","start:release"]);
const pkg=JSON.parse(fs.readFileSync("package.json","utf8"));
assert.ok(pkg.devDependencies.typescript);
assert.ok(pkg.dependencies.tsx); // Existing runtime TS loader remains available.
const lock=JSON.parse(fs.readFileSync("package-lock.json","utf8"));
assert.equal(lock.packages["node_modules/typescript"].dev,true);
const npm=spawnSync("npm",["config","get","include","--include=dev"],{
  env:{PATH:process.env.PATH,HOME:process.env.HOME,
    NODE_ENV:"production",NPM_CONFIG_OMIT:"dev"},
  encoding:"utf8"
});
assert.equal(npm.status,0);
assert.equal(npm.stdout.trim(),"dev");
const launch=spawnSync("env",["NODE_ENV=production","npm","run","start:release","--","--validate-only"],{
  env:{PATH:process.env.PATH,NODE_ENV:"development",SAM_RELEASE_SETUP_MODE:"1",
    SAM_RELEASE_SETUP_LOCAL:"0",SAM_RELEASE_APPROVED:"0"},
  encoding:"utf8"
});
assert.equal(launch.status,0);
assert.match(launch.stdout,/RELEASE_SETUP_CONTRACT PASS/);
console.log("BUILD_CONFIGURATION_PASS: explicit build dev dependencies; production launch pins NODE_ENV; executive disabled; no install/network.");
