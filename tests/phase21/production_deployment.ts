import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {spawnSync} from "node:child_process";

function file(path:string){return readFileSync(path,"utf8");}

const migrate=file("packages/db/src/migrate.js");
assert.match(migrate,/pg_advisory_lock/);
assert.match(migrate,/sam_schema_migrations/);
assert.match(migrate,/Applied migration hash mismatch/);
assert.match(migrate,/BEGIN/);
assert.match(migrate,/COMMIT/);
assert.match(migrate,/DATABASE MIGRATION PASS/);

const deterministic=spawnSync(
  process.execPath,
  ["packages/db/src/migrate.js","--check-deterministic"],
  {encoding:"utf8"}
);
assert.equal(deterministic.status,0,deterministic.stderr);
assert.match(deterministic.stdout,/Total migrations: 10/);
assert.match(deterministic.stdout,/Deterministic check PASS/);

const compose=file("deploy/production/docker-compose.live.yml");
for(const name of ["postgres:","migrate:","sam:","sam-mcp:","sam-command-center:","caddy:"]){
  assert.ok(compose.includes(name),name+" missing");
}
assert.ok(compose.includes('ports:\n      - "80:80"\n      - "443:443"'));
assert.equal((compose.match(/"8080:8080"/g)||[]).length,0);
assert.equal((compose.match(/"8081:8081"/g)||[]).length,0);
assert.equal((compose.match(/"8082:8082"/g)||[]).length,0);
assert.match(compose,/service_completed_successfully/);
assert.match(compose,/npm","run","db:migrate","--","--apply/);
assert.match(compose,/sam-command-center:8082/);

const caddy=file("deploy/production/Caddyfile");
assert.match(caddy,/\{\$SAM_COMMAND_CENTER_DOMAIN\}/);
assert.match(caddy,/reverse_proxy sam-command-center:8082/);
assert.match(caddy,/\{\$SAM_MCP_DOMAIN\}/);
assert.match(caddy,/reverse_proxy sam-mcp:8081/);

const env=file("deploy/production/env.production.example");
for(const key of [
  "POSTGRES_PASSWORD=",
  "SAM_COMMAND_CENTER_DOMAIN=",
  "SAM_MCP_DOMAIN=",
  "SAM_COMMAND_CENTER_BEARER_TOKEN=",
  "SAM_MCP_BEARER_TOKEN="
]) assert.ok(env.includes(key));

const deploy=file("deploy/production/deploy.sh");
assert.match(deploy,/docker compose/);
assert.match(deploy,/run --rm migrate/);
assert.match(deploy,/SAM services did not become healthy/);
assert.match(deploy,/DEPLOYMENT STARTUP PASS/);

console.log("PHASE21_PRODUCTION_DEPLOYMENT_PACKAGE PASS");
