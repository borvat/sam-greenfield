import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {pool} from "../../packages/db/src/client";
import {validateProductionBundle} from "../../apps/production/src/bundle";
import bundle from "../../apps/production/src/localReleaseBundleModule";

async function main(){
  const valid=validateProductionBundle(bundle);
  assert.deepEqual(bundle.capabilities.map(c=>c.capabilityId),["local.calculate","local.statistics"]);
  assert.equal(bundle.modelAdapters?.length,0);
  assert.equal(bundle.modelProviderConfigs?.length,0);
  assert(bundle.toolDefinitions.every(t=>t.sideEffect===false&&t.authorityClass==="GREEN"));
  for(const id of ["gmail_send","drive_get_document","finance_reconciliation_preview"])
    assert.throws(()=>valid.tools.definition(id));
  const tool=valid.tools.adapter("local.calculate");
  for(const [operation,expected] of [["sum",11],["mean",11/3],["min",-2],["max",9],["count",3]] as const){
    const request={capabilityId:"local.calculate",params:{operation,values:[4,-2,9]},idempotencyKey:"unit-local"};
    const output=await tool.execute(request);
    assert.equal(output.result.value,expected);
    assert.deepEqual(await tool.execute(request),output);
    const execution={id:"unit-execution",capabilityId:"local.calculate",params:request.params,evidence:output.evidence,operationKeyRef:null};
    const contract={id:"unit-contract",method:"INDEPENDENT_QUERY",requiredEvidenceFields:{},independentQueryTemplate:{}};
    const verifier=valid.verifiers.get("local.calculate")!;
    assert.equal((await verifier.verify({execution,contract})).result,"VERIFIED");
    assert.equal((await verifier.verify({execution:{...execution,evidence:{...output.evidence,resultHash:"tampered"}},contract})).result,"FAILED");
  }
  const stats=await valid.tools.adapter("local.statistics").execute({
    capabilityId:"local.statistics",params:{values:[4,-2,9]},idempotencyKey:"unit-statistics"});
  assert.deepEqual(stats.result,{operation:"mean",value:11/3,count:3,min:-2,max:9});
  assert.equal((await valid.verifiers.get("local.statistics")!.verify({
    execution:{id:"unit-statistics",capabilityId:"local.statistics",params:{values:[4,-2,9]},evidence:stats.evidence,operationKeyRef:null},
    contract:{id:"unit-contract",method:"INDEPENDENT_QUERY",requiredEvidenceFields:{},independentQueryTemplate:{}}
  })).result,"VERIFIED");
  let refused=0;
  for(const params of [
    {operation:"sum",values:[]},{operation:"sum",values:Array(17).fill(1)},
    {operation:"sum",values:[NaN]},{operation:"sum",values:[Infinity]},
    {operation:"sum",values:[1.5]},{operation:"sum",values:[1000001]},
    {operation:"sum",values:["knowledge:local_sum"]},{operation:"sum",values:["1); DROP TABLE goals;--"]},
    {operation:"sum",values:[1],memory:"unit-only-secret-never-output"},
    {operation:"sum",values:[1],entityId:"another-entity"},
    {operation:"sum",values:[1],fileId:"other-file"},{operation:"shell",values:[1]}
  ]){
    await assert.rejects(()=>tool.execute({capabilityId:"local.calculate",params,idempotencyKey:"unit-negative"}),
      /RELEASE_LOCAL_PARAMETERS_REFUSED/);refused++;
  }
  const config=readFileSync(".replit","utf8");
  assert(/deploymentTarget\s*=\s*"vm"/.test(config));
  const deployment=config.split("[deployment]")[1]?.split(/\n\[/)[0]??"";
  assert(deployment.includes('"start:release"'));
  assert(!/db:migrate|db:push|dev:runtime|dev:command-center/.test(deployment));
  console.log(JSON.stringify({test:"LOCAL_RELEASE_BUNDLE",status:"PASS",rejectedParameterCases:refused,
    classification:"LOCAL_REAL_POSTGRES_AGGREGATES_WITH_SYNTHETIC_INPUT_NOT_PRODUCTION_ACCEPTANCE",
    modelCalls:0,externalEffects:0}));
}
main().catch(()=>{console.error("LOCAL_RELEASE_BUNDLE FAIL; details withheld");process.exitCode=1;})
  .finally(()=>pool.end());
