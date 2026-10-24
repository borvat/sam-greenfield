import {test} from 'node:test';
import assert from 'node:assert/strict';
import {goalProgress} from '../../apps/command-center/src/goalProgress';
const goal={state:'COMPLETED',current_plan_id:'plan',created_at:'start',updated_at:'last'};
const work=[{id:'queue',plan_id:'plan',capability_id:'read',status:'EXECUTED',attempt:1}];
const execution={id:'e',queue_id:'queue',plan_id:'plan',status:'EXECUTED',plan_hash:'p',execution_hash:'x'};
const verification={id:'v',execution_id:'e',checked_at:'2026-10-24',result:'VERIFIED',plan_hash:'p',execution_hash:'x'};
const reports=[{plan_id:'plan',decision:{status:'complete',summary:'Grounded report'}}];
test('COMPLETED alone is execution completion, not verified acceptance',()=>{
 const p=goalProgress({goal,work:[],executions:[],verifications:[],reports:[]});assert.equal(p.displayState,'EXECUTION_COMPLETE');assert.equal(p.reportVerified,false);
});
test('only matching current-plan verification plus final report establishes verified display',()=>{
 const p=goalProgress({goal,work,executions:[execution],verifications:[verification],reports});assert.equal(p.displayState,'VERIFIED');
 for(const patch of [{execution_hash:'tampered'},{result:'INCONCLUSIVE'},{plan_hash:'old'}])assert.equal(goalProgress({goal,work,executions:[execution],verifications:[{...verification,...patch}],reports}).displayState,'EXECUTION_COMPLETE');
});
test('a newer failed verification or a previous-plan report cannot be hidden by an earlier success',()=>{
 const p=goalProgress({goal,work,executions:[execution],verifications:[verification,{...verification,id:'new',checked_at:'2026-10-25',result:'FAILED'}],reports});assert.equal(p.displayState,'EXECUTION_COMPLETE');
 assert.equal(goalProgress({goal,work,executions:[execution],verifications:[verification],reports:[{...reports[0],plan_id:'old'}]}).reportVerified,false);
});
test('blocked reports preserve reasons; zero source work does not become verified',()=>{
 const p=goalProgress({goal:{...goal,state:'WAITING_EXTERNAL'},work,executions:[],verifications:[],reports:[{plan_id:'plan',decision:{status:'blocked',limitations:['Authorization expired']}}]});
 assert.equal(p.displayState,'BLOCKED');assert.equal(p.executionState,'WAITING_EXTERNAL');assert.equal(p.resolution?.automaticResume,false);assert.deepEqual(p.blockedReason,['Authorization expired']);assert.equal(p.verifiedCount,0);
});
test('duplicate execution cannot inflate a successful verification display',()=>{
 const duplicate={...execution,id:'duplicate'};
 assert.equal(goalProgress({goal,work,executions:[execution,duplicate],verifications:[verification,{...verification,id:'v2',execution_id:'duplicate'}],reports}).reportVerified,false);
});

test('review retry requires a scheduled wake, remaining budget and current-plan receipt',()=>{
 const audit=[{action:'READ_REVIEW_BUDGET',after_ref:{planId:'plan',runtimeReview:{retryable:true,attempts:1,callsUsed:1,errorCode:'REVIEW_MODEL_DEADLINE'}}}];
 const waiting={...goal,state:'WAITING_EXTERNAL',next_wake_at:'2026-10-24'};
 const input={goal:waiting,work,executions:[execution],verifications:[verification],reports:[],audit};
 assert.equal(goalProgress(input).resolution?.disposition,'BOUNDED_RETRY_SCHEDULED');
 assert.equal(goalProgress({...input,goal:{...waiting,next_wake_at:null}}).resolution?.disposition,'STOPPED');
 const exhausted=structuredClone(audit);exhausted[0].after_ref.runtimeReview.attempts=2;
 assert.equal(goalProgress({...input,audit:exhausted}).resolution?.automaticResume,false);
 const stale=structuredClone(audit);stale[0].after_ref.planId='old';assert.equal(goalProgress({...input,audit:stale}).resolution,null);
});
test('revoked verification cannot present a report as a completed outcome',()=>{
 const result=goalProgress({goal,work,executions:[execution],verifications:[],reports});
 assert.equal(result.resolution?.outcome,'blocked');assert.equal(result.reportVerified,false);
});
