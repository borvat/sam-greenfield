import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const dir=mkdtempSync(join(tmpdir(),"sam-module-loading-"));
function run(modulePath:string){
  const env={...process.env,NODE_ENV:"test",SAM_COMPOSITION_MODULE:modulePath,
    SAM_PRODUCTION_BUNDLE_MODULE:"apps/production/src/defaultBundleModule.ts"};
  for(const key of Object.keys(env)){
    if(/^(GOOGLE_|BOL_|EBOEKHOUDEN_|OPENAI_|ANTHROPIC_|GEMINI_|DEEPSEEK_|QWEN_)/.test(key)) delete env[key];
  }
  const result=spawnSync(process.execPath,["--import","tsx","apps/runtime/src/main.ts"],
    {env,encoding:"utf8",timeout:10000});
  assert.equal(result.error,undefined);
  assert.equal(result.status,1);
  return result.stderr.trim();
}
try{
  const asyncModule=join(dir,"async.ts");
  writeFileSync(asyncModule,'export default Promise.reject(new Error("module-initialization-rejected"));\n');
  assert.equal(run(asyncModule),"SAM startup failed: module-initialization-rejected");
  const syncModule=join(dir,"sync.ts");
  writeFileSync(syncModule,'export default {};\n');
  assert.equal(run(syncModule),"SAM startup failed: Composition module must export runWorkTick()");
  assert.equal(run("apps/runtime/src/productionCompositionModule.ts"),
    "SAM startup failed: Production bundle requires at least one real capability");
  console.log("RUNTIME_MODULE_LOADING PASS: async failures propagate, contract validation remains, empty production capabilities stay blocked");
}finally{
  rmSync(dir,{recursive:true,force:true});
}
