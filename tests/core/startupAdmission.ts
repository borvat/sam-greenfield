import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import path from 'node:path';
const env={PATH:process.env.PATH,NODE_ENV:'production',DATABASE_URL:process.env.DATABASE_URL!,
 SAM_MCP_BEARER_TOKEN:'synthetic-fixture-only',SAM_MCP_ALLOWED_HOSTS:'localhost',
 SAM_COMMAND_CENTER_BEARER_TOKEN:'synthetic-fixture-only',SAM_COMMAND_CENTER_ALLOWED_HOSTS:'localhost',
 SAM_COMMAND_CENTER_LEGAL_ENTITY_ID:'00000000-0000-4000-8000-000000000001',
 SAM_WORKER_ID:'review-fixture',SAM_COMPOSITION_MODULE:path.resolve('apps/runtime/src/productionCompositionModule.ts')};
for(const file of ['apps/runtime/src/main.ts','apps/mcp/src/main.ts','apps/command-center/src/main.ts']){
 const child=spawnSync(process.execPath,['--import','tsx',file],{env,encoding:'utf8',timeout:10000});
 assert.equal(child.error,undefined,'startup must reject before opening a service');
 assert.equal(child.status,1,`${file} must reject fixture owner identity`);
 assert(!child.stdout.includes('synthetic-fixture-only')&&!child.stderr.includes('synthetic-fixture-only'));
 console.log('PASS production owner-role refusal before serving:',file);
}
