import { test } from 'node:test';
import assert from 'node:assert/strict';
import { authenticateSamModelToken, samIdentityClaims } from '../../packages/ai-infrastructure/src/samIdentity';
import { exactCost, usdToMicrousd, assertTariff } from '../../packages/ai-infrastructure/src/exactMoney';
import { modelRequestFingerprint } from '../../packages/ai-infrastructure/src/durableLedger';

import { syntheticSamIdentity, fixtureTariff } from './durableFixtures';

test('exact money does not use floating point and rounds partial micro-USD conservatively',()=>{
  assert.equal(usdToMicrousd('123456789.123456'),123456789123456n);
  assert.equal(exactCost(fixtureTariff(),100,20,40),104n);
  assert.equal(exactCost({...fixtureTariff(),inputMicrousdPerMillion:'1'},1,0),1n);
  assert.throws(()=>usdToMicrousd('0.0000001'),/AI_USD_PRECISION_INVALID/);
  assert.throws(()=>exactCost(fixtureTariff(),100,20,101),/AI_USAGE_UNKNOWN/);
  assert.throws(()=>assertTariff({...fixtureTariff(),reviewedUntil:'2000-01-01'}),/AI_TARIFF_UNVERIFIED/);
});
test('SAM verifier accepts signed scope and rejects forged, expired, wrong audience/project and read-only tokens',()=>{
  const s=syntheticSamIdentity();assert.ok(samIdentityClaims(s.identity).actor.startsWith('mcp:'));
  assert.throws(()=>samIdentityClaims({kind:'SAM_VERIFIED_MODEL_IDENTITY'}),/AI_IDENTITY_DENIED/);
  for(const patch of [{exp:1},{aud:'https://other.invalid/mcp'},{[s.config.claimNamespace+'/legal_entity_id']:'foreign'},
    {scope:'sam:synthetic:read'}])assert.throws(()=>authenticateSamModelToken(s.token(patch),s.config));
});
test('stable content fingerprint binds task, approval, project, environment and SAM queue IDs',()=>{
  const task={task:'planning',capability:'planning',input:{a:1,b:2},dataClassification:'PUBLIC' as const};
  const context={goalId:'00000000-0000-4000-8000-000000000003',queueId:'00000000-0000-4000-8000-000000000004',
    approvalId:'00000000-0000-4000-8000-000000000005',requestKey:'goal:queue:plan',attemptId:'1'};
  const scope={actor:'sam',projectId:'qnan',environment:'test'};
  const hash=modelRequestFingerprint(task,context,scope);
  assert.equal(hash,modelRequestFingerprint({...task,input:{b:2,a:1}},context,scope));
  assert.notEqual(hash,modelRequestFingerprint({...task,input:{a:3}},context,scope));
  assert.notEqual(hash,modelRequestFingerprint(task,context,{...scope,projectId:'foreign'}));
  assert.notEqual(hash,modelRequestFingerprint(task,{...context,attemptId:'2'},scope));
  assert.notEqual(modelRequestFingerprint({...task,input:JSON.parse('{"__proto__":{"value":1}}')},context,scope),
    modelRequestFingerprint({...task,input:{}},context,scope));
  assert.throws(()=>modelRequestFingerprint({...task,input:new Date()},context,scope),/AI_CONTEXT_INVALID/);
  assert.throws(()=>modelRequestFingerprint({...task,input:{value:Infinity}},context,scope),/AI_CONTEXT_INVALID/);
});
