const {test}=require('node:test');
const assert=require('node:assert/strict');
const {collectCheckpoint,compareCheckpoint}=require('../../deploy/render-test/storageCheckpoint.cjs');
const goal='11111111-1111-4111-8111-111111111111',entity='22222222-2222-4222-8222-222222222222',plan='33333333-3333-4333-8333-333333333333',trial='44444444-4444-4444-8444-444444444444';
function fixture(change=()=>{}){
 const tables={goals:[{row:{id:goal,company_scope:entity,current_plan_id:plan,state:'NEW'}}],plans:[{row:{id:plan,goal_id:goal,steps:[{kind:'synthetic-storage-test',externalEffects:false}]}}],
  audit:[{row:{goal_id:goal,action:'SYNTHETIC_FIXTURE'}}],trials:[{row:{id:trial,used:{costUsd:0.02}}}],
  events:[{row:{kind:'RESERVED',reservation_id:plan,payload:{reserved:{costUsd:0.02}}}}]};change(tables);
 return {async query(sql){assert.match(sql,/^SELECT /);const key=sql.includes('FROM evaluation_events')?'events':sql.includes('FROM evaluation_trials')?'trials':sql.includes('FROM audit_log')?'audit':sql.includes('FROM plans')?'plans':'goals';return {rows:tables[key]};}};
}
test('selected plan, audit and nonzero synthetic reservation remain equal on independent reads',async()=>{
 const a=await collectCheckpoint(fixture(),goal,entity),b=await collectCheckpoint(fixture(),goal,entity);
 const result=compareCheckpoint(a,b);assert.equal(result.status,'PASS');assert.equal(result.containerReplacementProven,false);
 assert.equal(result.backupRestoreProven,false);assert.equal(a.realBilledCostProven,false);
});
test('a changed audit or budget fails comparison',async()=>{
 const a=await collectCheckpoint(fixture(),goal,entity);
 for(const change of [t=>t.audit[0].row.action='CHANGED',t=>t.trials[0].row.used.costUsd=0.03]){
  const b=await collectCheckpoint(fixture(change),goal,entity);assert.throws(()=>compareCheckpoint(a,b));
 }
});
test('missing goal, plan, audit, trial or nonzero reservation fails instead of yielding a vacuous pass',async()=>{
 for(const change of [t=>t.goals=[],t=>t.goals[0].row.current_plan_id=null,t=>t.plans=[],t=>t.audit=[],t=>t.trials=[],t=>t.events=[],t=>t.events[0].row.payload.reserved.costUsd=0,t=>t.trials[0].row.used.costUsd=0]){
  await assert.rejects(collectCheckpoint(fixture(change),goal,entity));
 }
});
test('malformed identifiers are rejected before database reads',async()=>{
 await assert.rejects(collectCheckpoint({query(){throw Error('must not read');}},'invalid',entity));
});
