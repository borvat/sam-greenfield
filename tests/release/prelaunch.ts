import assert from "node:assert/strict";
import {createRequire} from "node:module";
const require=createRequire(import.meta.url);
const {evaluate,required,settings}=require("./prelaunch.cjs");
const sha="a".repeat(40),now=Date.now();
const env={
  NODE_ENV:"production",SAM_RELEASE_APPROVED:"1",SAM_DATABASE_TARGET:"production",
  DATABASE_URL:"postgresql://sam_app@database.invalid/release?sslmode=verify-full",
  SAM_DB_APP_ROLE:"sam_app",SAM_DB_SCHEMA:"sam",
  SAM_RELEASE_ORG_ID:"11111111-1111-1111-1111-111111111111",
  SAM_COMMAND_CENTER_LEGAL_ENTITY_ID:"22222222-2222-2222-2222-222222222222",
  SAM_COMMAND_CENTER_BEARER_TOKEN:"synthetic-unit-bearer-not-an-actual-secret",
  SAM_COMMAND_CENTER_ALLOWED_HOSTS:"example.invalid",SAM_COMMAND_CENTER_ALLOWED_ORIGINS:"https://example.invalid",
  SAM_PRODUCTION_BUNDLE_MODULE:"apps/production/src/defaultBundleModule.ts",SAM_RELEASE_CAPABILITIES:"local.calculate"
};
const records=Object.fromEntries(required.map((k:string)=>[k,{status:"PASS",classification:"LIVE_REVIEWED",
  ownerReviewed:true,sourceSha:sha,checkedAt:new Date(now).toISOString(),reference:"synthetic-unit-evidence/"+k}]));
const base={env,source:{sha,remoteSha:sha,clean:true},approvedSourceSha:sha,records,now};
assert.equal(evaluate(base).declarationsComplete,true); // Constructed declarations, not LIVE proof.
assert.equal(evaluate(base).status,"BLOCKED");
assert.equal(evaluate(base).publishAuthorized,false);
let rejected=0;
for(const gate of required){
  for(const patch of [undefined,{...records[gate],classification:"FIXTURE"},
    {...records[gate],ownerReviewed:false},{...records[gate],sourceSha:"b".repeat(40)},
    {...records[gate],checkedAt:new Date(now-86400001).toISOString()},
    {...records[gate],checkedAt:new Date(now+1).toISOString()},
    {...records[gate],reference:"../untrusted"}]){
    const result=evaluate({...base,records:{...records,[gate]:patch}});
    assert.equal(result.status,"BLOCKED");assert.equal(result.declarationsComplete,false);rejected++;
  }
}
for(const patch of [{approvedSourceSha:null},{source:{...base.source,clean:false}},
  {source:{...base.source,remoteSha:"b".repeat(40)}},{env:{...env,SAM_RELEASE_APPROVED:"0"}},
  {env:{...env,REPLIT_DEV_DOMAIN:"fixture.invalid"}},{env:{...env,SAM_RELEASE_CAPABILITIES:"gmail_send"}},
  {records:{...records,unknown:{}}}]){
  const result=evaluate({...base,...patch});
  assert.equal(result.status,"BLOCKED");assert.equal(result.declarationsComplete,false);rejected++;
}
assert.equal(JSON.stringify(evaluate(base)).includes(env.SAM_COMMAND_CENTER_BEARER_TOKEN),false);
assert.equal(JSON.stringify(evaluate(base)).includes(env.DATABASE_URL),false);
for(const key of settings){
  const result=evaluate({...base,env:{...env,[key]:undefined}});
  assert.equal(result.status,"BLOCKED");assert.equal(result.declarationsComplete,false);rejected++;
}
console.log(JSON.stringify({test:"PRELAUNCH_EVIDENCE_GATE",status:"PASS",rejectedCases:rejected,
  classification:"UNIT_SYNTHETIC_DECLARATIONS_NOT_PRODUCTION_PROOF",externalCalls:0}));
