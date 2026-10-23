import {assertNoPendingOrdinaryGoals} from '../../apps/production/src/ordinaryGoalRollback';
import assert from 'node:assert/strict';
import {pool,withTransaction} from '../../packages/db/src/client';
import {openOrdinaryGoalAllowance,type OrdinaryAllowancePolicy} from '../../apps/production/src/ordinaryGoalAllowance';
import {ceiling} from '../../apps/agents/src/intelligence/contracts';
import {reviewFixture} from './reviewFixture';

// Ledger integration only. These administrative fixtures do not prove RLS or
// authenticated MCP intake; that belongs to ordinary end-to-end acceptance.
async function main(){
 const fixture=await reviewFixture();
 const policy:OrdinaryAllowancePolicy={version:1,capabilityHash:'a'.repeat(64),limits:{...ceiling,models:1,tools:1,iterations:1,delegations:1},
  prices:[{providerId:'existing-provider',model:'configured-model',inputPer1k:0.001,outputPer1k:0.002}]};
 async function goal(receipt=true){
  const id=await fixture.goal('Invented general objective');
  await pool.query("UPDATE goals SET completion_definition='sam.read_report.v1' WHERE id=$1",[id]);
  if(receipt)await pool.query(`INSERT INTO audit_log(actor,goal_id,action,source,authority_class,result,after_ref)
   VALUES('fixture-authenticated-actor',$1,'SAM_GOAL_SUBMITTED','sam_mcp','GREEN','CREATED','{"ordinaryGeneralAgentV1":true}')`,[id]);
  return id;
 }
 const rootGoalId=await goal(),input={rootGoalId,tenant:fixture.entity,policy};
 const allowance=await openOrdinaryGoalAllowance(input);
 const initial=await allowance.snapshot();
 const competing=await Promise.allSettled(Array.from({length:8},()=>allowance.reserve('tool')));
 assert.equal(competing.filter(v=>v.status==='fulfilled').length,1);
 const ticket=(competing.find(v=>v.status==='fulfilled') as PromiseFulfilledResult<string>).value;
 await allowance.begin(ticket);await assert.rejects(allowance.begin(ticket),/INVOCATION_DENIED/);
 const reopened=await openOrdinaryGoalAllowance(input);
 assert.equal((await reopened.snapshot()).deadline,initial.deadline);
 assert.deepEqual((await reopened.snapshot()).uncertain,[ticket]);
 await assert.rejects(reopened.reserve('readback'),/BUDGET_EXHAUSTED:tools/);
 await allowance.finish(ticket,'failure');
 await assert.rejects(allowance.finish(ticket,'success'),/SETTLEMENT_DENIED/);
 await assert.rejects(reopened.reserve('tool'),/BUDGET_EXHAUSTED:tools/);
 console.log('PASS serialized root allowance / tool-readback sharing / reopen deadline / uncertain reservation / no refund');
 await assert.rejects(openOrdinaryGoalAllowance({...input,policy:{...policy,limits:{...policy.limits,tools:2}}}),/BINDING_CHANGED/);
 await assert.rejects(openOrdinaryGoalAllowance({...input,tenant:crypto.randomUUID()}),/SCOPE_DENIED/);
 await assert.rejects(openOrdinaryGoalAllowance({...input,rootGoalId:await goal(false)}),/AUTHENTICATED_SUBMISSION_REQUIRED/);
 await assert.rejects(openOrdinaryGoalAllowance({...input,policy:{...policy,prices:[{...policy.prices[0],inputPer1k:0}]}}),/POLICY_INVALID/);
 const model=await allowance.reserve('model',{providerId:'existing-provider',model:'configured-model',inputTokens:100,outputTokens:100});
 await assert.rejects(allowance.finish(model,'success'),/SETTLEMENT_DENIED/);
 await allowance.begin(model);await allowance.finish(model,'success','b'.repeat(64));
 assert.equal((await allowance.snapshot()).used.costNanos,300000,'round upward, never use a negative tolerance or refund');
 await assert.rejects(allowance.reserve('model',{providerId:'existing-provider',model:'configured-model',inputTokens:100,outputTokens:100}),/BUDGET_EXHAUSTED:models/);
 console.log('PASS pinned scope/policy / authentic-submission receipt / positive prices / model reservation and settlement');
 const cancelId=await goal(),cancel=await openOrdinaryGoalAllowance({...input,rootGoalId:cancelId});
 const reserved=await cancel.reserve('iteration');
 await pool.query("UPDATE goals SET state='CANCELLED' WHERE id=$1",[cancelId]);
 await assert.rejects(cancel.begin(reserved),/GOAL_CLOSED/);
 await assert.rejects(withTransaction(c=>cancel.live(c)),/GOAL_CLOSED/);
 await cancel.finish(reserved,'failure');
 await assert.rejects(cancel.reserve('iteration'),/GOAL_CLOSED/);
 const shortId=await goal(),shortPolicy={...policy,limits:{...policy.limits,elapsedMs:30}};
 const short=await openOrdinaryGoalAllowance({...input,rootGoalId:shortId,policy:shortPolicy});
 await new Promise(r=>setTimeout(r,40));
 await assert.rejects(short.reserve('iteration'),/TIME_EXHAUSTED/);
 const shortReopen=await openOrdinaryGoalAllowance({...input,rootGoalId:shortId,policy:shortPolicy});
 await assert.rejects(shortReopen.reserve('iteration'),/TIME_EXHAUSTED/);
 console.log('PASS cancellation and expiry prevent dispatch; reopen cannot renew allowance');
 await assert.rejects(assertNoPendingOrdinaryGoals(pool),/ROLLBACK_RECONCILIATION_REQUIRED/);
 await pool.query("UPDATE goals SET state='FAILED' WHERE state<>'CANCELLED'");await assertNoPendingOrdinaryGoals(pool);
 console.log('PASS rollback cannot hand enrolled unfinished goals to the legacy worker');
 await pool.end();
}
main().catch(async e=>{console.error(e);await pool.end();process.exitCode=1;});
