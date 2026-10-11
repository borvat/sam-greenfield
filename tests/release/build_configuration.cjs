// No install, registry access or credentials. Protect the production build contract.
const assert=require("node:assert/strict");
const fs=require("node:fs");
const {spawnSync}=require("node:child_process");
const source=fs.readFileSync(".replit","utf8");
const deployment=source.split("[deployment]")[1]?.split(/\n\[/)[0];
assert.ok(deployment);
const command=JSON.parse(deployment.match(/^build\s*=\s*(.+)$/m)[1]);
assert.deepEqual(command,["sh","-c","npm ci --include=dev && npm run typecheck"]);
assert.match(deployment,/^run\s*=\s*\["npm", "run", "start:release"\]/m);
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
console.log("BUILD_CONFIGURATION_PASS: explicit build dev dependencies despite production/omit; runtime unchanged; no install/network.");
