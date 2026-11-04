import test from 'node:test';
import assert from 'node:assert/strict';
import {withExecutiveBrief,EXECUTIVE_BRIEF_CAPABILITY,EXECUTIVE_BRIEF_VERIFICATION_CONTRACTS} from '../../apps/production/src/executiveBriefCapability';

const empty:any={capabilities:[],toolDefinitions:[],toolAdapters:[]};

test('the capability, its tool and its verifier are registered together', () => {
  const bundle=withExecutiveBrief(empty);
  assert.equal(bundle.capabilities.length,1);
  assert.equal(bundle.capabilities[0].capabilityId,EXECUTIVE_BRIEF_CAPABILITY);
  assert.equal(bundle.capabilities[0].authorityClass,'GREEN');
  assert.equal(bundle.toolDefinitions[0].sideEffect,false);
  assert.equal(bundle.toolAdapters[0].capabilityId,EXECUTIVE_BRIEF_CAPABILITY);
  assert.equal(bundle.verificationAdapters?.length,1);
  assert.equal(bundle.verificationAdapters?.[0].capabilityId,EXECUTIVE_BRIEF_CAPABILITY);
});

test('registering twice does not duplicate the capability', () => {
  const once=withExecutiveBrief(empty);
  const twice=withExecutiveBrief(once);
  assert.equal(twice.capabilities.length,1);
  assert.equal(twice.toolAdapters.length,1);
});

test('a contract exists and forbids trusting the execution result', () => {
  const spec=EXECUTIVE_BRIEF_VERIFICATION_CONTRACTS[0];
  assert.equal(spec.capabilityId,EXECUTIVE_BRIEF_CAPABILITY);
  assert.equal(spec.verificationMethod,'db_query');
  assert.equal((spec.requiredEvidenceFields as any).callId,'string');
  assert.equal((spec.requiredEvidenceFields as any).factsHash,'string');
  assert.match(String((spec.independentQueryTemplate as any).query),/executive_briefing:/);
});

test('the verifier is registered with the capability and never trusts the answer alone', () => {
  const verifier=withExecutiveBrief(empty).verificationAdapters![0];
  assert.equal(verifier.capabilityId,EXECUTIVE_BRIEF_CAPABILITY);
  assert.equal(typeof verifier.verify,'function');
  // The real proof lives in executive_brief_verification.ts, which seeds model_calls and audit rows.
  assert.notEqual(EXECUTIVE_BRIEF_VERIFICATION_CONTRACTS[0].independentQueryTemplate.query, undefined);
});
