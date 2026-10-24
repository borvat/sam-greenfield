import {test} from 'node:test';
import assert from 'node:assert/strict';
import {sha256Hex} from '../../packages/shared/src/stableJson';
import {assertStorageContinuity} from '../../scripts/evaluation/storage-continuity-probe';
function capture(){
 const snapshot={goal:[{id:'fixture-goal',state:'PLANNING',current_plan_id:'fixture-plan'}],plans:[{id:'fixture-plan',steps:[{dispatch:false}]}],audit:[{action:'STORAGE_FIXTURE_PREPARED'}],trial:[{used:{models:0,tools:1,costUsd:0.03}}],events:[{kind:'RESERVED',hash:'fixture-chain',payload:{reserved:{costUsd:0.03}}}]};
 return {snapshot,sha256:sha256Hex(snapshot),costBasis:'SYNTHETIC_RESERVATION_NOT_INVOICE' as const,actualBilledUsd:null,providerCalls:0 as const};
}
test('continuity compares complete captured state while synthetic reservation stays distinct from billing',()=>{
 const before=capture(),after=structuredClone(before);const r=assertStorageContinuity(before,after);
 assert.equal(r.sameReservation,true);assert.equal(r.actualBilledUsd,null);assert.equal(r.providerCalls,0);
});
test('state, plan, audit, trial counters or evidence loss fails even with a recomputed artifact hash',()=>{
 for(const key of ['goal','plans','audit','trial','events'] as const){
  const before=capture(),after=structuredClone(before);after.snapshot[key]=[];after.sha256=sha256Hex(after.snapshot);
  assert.throws(()=>assertStorageContinuity(before,after));
 }
 const before=capture(),after=structuredClone(before);after.snapshot.trial[0].used.costUsd=0;after.sha256=sha256Hex(after.snapshot);
 assert.throws(()=>assertStorageContinuity(before,after));
});
test('tampering with the snapshot without updating its hash is refused',()=>{
 const before=capture(),after=structuredClone(before);after.snapshot.goal[0].state='NEW';
 assert.throws(()=>assertStorageContinuity(before,after));
});
