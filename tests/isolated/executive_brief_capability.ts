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
  assert.equal((spec.requiredEvidenceFields as any).attribution,'VERIFIED');
});

test('verification passes only for an attributed model answer', async () => {
  const verifier=withExecutiveBrief(empty).verificationAdapters![0];
  const ok=await verifier.verify({execution:{id:'e1',capabilityId:EXECUTIVE_BRIEF_CAPABILITY,params:{},result:{mode:'MODEL'},evidence:{callId:'c1',attribution:'VERIFIED',factsHash:'h'},operationKeyRef:null},contract:{id:'executive_brief',method:'db_query',requiredEvidenceFields:{},independentQueryTemplate:{}}});
  assert.equal(ok.result,'VERIFIED');
  const missing=await verifier.verify({execution:{id:'e2',capabilityId:EXECUTIVE_BRIEF_CAPABILITY,params:{},result:{mode:'MODEL'},evidence:{callId:null,attribution:'MISSING'},operationKeyRef:null},contract:{id:'executive_brief',method:'db_query',requiredEvidenceFields:{},independentQueryTemplate:{}}});
  assert.equal(missing.result,'FAILED');
  const refused=await verifier.verify({execution:{id:'e3',capabilityId:EXECUTIVE_BRIEF_CAPABILITY,params:{},result:{mode:'MODEL_UNAVAILABLE',reason:'BUDGET_TOO_SMALL_FOR_FACTS'},evidence:{},operationKeyRef:null},contract:{id:'executive_brief',method:'db_query',requiredEvidenceFields:{},independentQueryTemplate:{}}});
  assert.equal(refused.result,'FAILED');
});
