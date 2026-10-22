import assert from 'node:assert/strict';
import {pool} from '../../packages/db/src/client';
import {ModelGateway} from '../../packages/model-gateway/src/gateway';
import type {ModelTask,ModelProviderAdapter} from '../../packages/model-gateway/src/types';
async function main(){
 await pool.query(`INSERT INTO model_providers(provider_id,models,capabilities,privacy_class_allowed,health,cost_per_1k_input,cost_per_1k_output)
 VALUES('fixture-a','["test"]','["bounded"]','["INTERNAL"]','HEALTHY',0.01,0.02),('fixture-b','["test"]','["bounded"]','["INTERNAL"]','HEALTHY',0.02,0.03)`);
 let calls=0,reservations=0;
 const adapter=(id:string):ModelProviderAdapter=>({providerId:id,executionMode:'synthetic',supportsUsageLimits:true,async invoke(){calls++;throw Error('SYNTHETIC_UNCERTAIN_PROVIDER_RESPONSE');}});
 const gateway=new ModelGateway({'fixture-a':adapter('fixture-a'),'fixture-b':adapter('fixture-b')});
 const task:ModelTask={task:'bounded',capability:'bounded',dataClassification:'INTERNAL',input:{objective:'synthetic'},maxCostUsd:1,boundedSynthetic:{maxInputTokens:1000,maxOutputTokens:100,
  async reserveAttempt(a){assert.equal(a.tokens,1100);assert(a.costUsd>0);reservations++;if(reservations>1)throw Error('DURABLE_RESERVATION_EXHAUSTED');}}};
 await assert.rejects(()=>gateway.invoke(task),/RESERVATION_EXHAUSTED/);assert.equal(calls,1);assert.equal(reservations,2);
 calls=0;await assert.rejects(()=>gateway.invoke({...task,input:'x'.repeat(1001)}),/INPUT_BUDGET_INVALID/);assert.equal(calls,0);
 const unbounded=new ModelGateway({'fixture-a':{providerId:'fixture-a',async invoke(){calls++;throw Error('MUST_NOT_CALL');}}});
 await assert.rejects(()=>unbounded.invoke(task),/SYNTHETIC_ADAPTER_REQUIRED/);assert.equal(calls,0);
 const wrong:ModelProviderAdapter={providerId:'fixture-a',executionMode:'synthetic',supportsUsageLimits:true,async invoke(){calls++;return {model:'test',usage:{inputTokens:-1,outputTokens:0},output:{}};}};
 const invalid=new ModelGateway({'fixture-a':wrong,'fixture-b':wrong});
 await assert.rejects(()=>invalid.invoke({...task,boundedSynthetic:{...task.boundedSynthetic!,async reserveAttempt(){}}}),/USAGE_LIMIT_VIOLATION/);assert.equal(calls,2);
 const abort=new AbortController();abort.abort();calls=0;
 await assert.rejects(()=>gateway.invoke({...task,signal:abort.signal}));assert.equal(calls,0);
 console.log(JSON.stringify({suite:'bounded-gateway',status:'PASS',checks:['pre-call fallback reservation','ambiguous calls charged','oversize input refusal','live/unbounded adapter refusal','invalid usage rejection','pre-cancel no invocation'],providers:'SYNTHETIC_ONLY'}));
}
main().catch(e=>{console.error(e);process.exitCode=1;}).finally(()=>pool.end());
