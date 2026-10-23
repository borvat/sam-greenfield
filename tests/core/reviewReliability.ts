import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createServer} from 'node:http';
import {pool} from '../../packages/db/src/client';
import {reviewFixture} from './reviewFixture';
import {persistPlanAndDelegateAtomic} from '../../apps/kernel/src/planning';
import {leaseWorkAtomic} from '../../apps/kernel/src/queue';
import {recordExecutionAndRequestVerificationAtomic} from '../../apps/kernel/src/execution';
import {recordIndependentVerificationAtomic} from '../../apps/kernel/src/verification';
import {wakeDueGoals,wakeGoalFromEventAtomic} from '../../apps/kernel/src/continuation';
import {continueReadReview} from '../../apps/production/src/readReviewContinuation';
import {reviewNextReadGoal,validateReadReview} from '../../apps/production/src/readGoalReview';
import {projectReviewEvidence,monetaryEvidenceLimitations} from '../../apps/production/src/reviewEvidence';
import {invokeReviewWithinDeadline} from '../../apps/production/src/reviewDeadline';
import {OpenAICompatibleChatAdapter} from '../../packages/model-providers/src/openaiCompatible';
import {createActionTools} from '../../apps/chatgpt-tools/src/actionTools';
const pause=(ms:number)=>new Promise(r=>setTimeout(r,ms));
async function main(){
 await pool.query(await readFile('packages/db/integration-migrations/00101_goal_read_reviews.sql','utf8'));
 const f=await reviewFixture();
 const contract=(await pool.query(`INSERT INTO verification_contracts(capability_id,description,verification_method,required_evidence_fields,independent_query_template)
 VALUES('review_echo','Synthetic independent readback','db_query','{"readback":"boolean"}','{}') RETURNING id`)).rows[0].id;
 async function fixture(objective='Read verified source',result:any={message:'Verified source confirms quantity 7'}){
  const id=await f.goal(objective,'PLANNING');await pool.query("UPDATE goals SET completion_definition='sam.read_report.v1' WHERE id=$1",[id]);
  const plan=await persistPlanAndDelegateAtomic({goalId:id,steps:[{capabilityId:'review_echo',params:{fixture:true}}]});
  const lease=await leaseWorkAtomic(plan.queueIds[0],'synthetic-reader',60);
  const ex=await recordExecutionAndRequestVerificationAtomic({queueId:plan.queueIds[0],fencingToken:lease.token,actor:'synthetic-reader',result,evidence:{readback:true}});
  await recordIndependentVerificationAtomic({executionId:ex.executionId,verifier:'synthetic-independent-verifier',contractId:contract,independentEvidence:{readback:true},result:'VERIFIED'});
  return {id,planId:plan.planId,executionId:ex.executionId};
 }
 const row=async(id:string)=>(await pool.query('SELECT * FROM goals WHERE id=$1',[id])).rows[0];
 const report=async(id:string)=>(await pool.query('SELECT decision FROM goal_read_reviews WHERE goal_id=$1',[id])).rows[0].decision;
 const counts=async(id:string)=>(await pool.query(`SELECT (SELECT count(*)::int FROM plans WHERE goal_id=$1) plans,
 (SELECT count(*)::int FROM work_queue WHERE goal_id=$1) work,(SELECT count(*)::int FROM executions WHERE goal_id=$1) executions`,[id])).rows[0];
 const final=(input:any)=>({status:'complete',summary:'Evidence-linked report',requirements:[{requirement:'Read verified source',fulfilled:true,evidenceIds:[input.verifiedObservations[0].id]}],
  findings:[{text:'Source confirms recorded facts',executionId:input.verifiedObservations[0].id,quoteLine:1}],limitations:[],steps:[]});
 let calls=0,active=0,aborted=0;
 const pending=async(_input:any,signal:AbortSignal)=>{calls++;active++;return new Promise((_,reject)=>signal.addEventListener('abort',()=>{active--;aborted++;reject(Error('synthetic aborted'));},{once:true}));};
 const timeout=await fixture();const before=await counts(timeout.id);
 assert.equal((await reviewNextReadGoal(f.bundle,pool,pending,{callDeadlineMs:30})).status,'blocked');
 assert.equal(active,0);assert.equal(calls,1);assert.equal(aborted,1);
 assert.equal((await row(timeout.id)).state,'WAITING_EXTERNAL');assert((await row(timeout.id)).next_wake_at);
 assert.equal((await report(timeout.id)).runtimeReview.attempts,1);
 assert.equal((await report(timeout.id)).runtimeReview.retryable,true);
 assert.equal(await wakeGoalFromEventAtomic(timeout.id,1,'EXTERNAL_REPLY'),false,'generic events must not send review back to planning');
 assert.equal((await reviewNextReadGoal(f.bundle,pool,pending,{callDeadlineMs:30})).processed,false,'not retried before wake');
 await pool.query("UPDATE goals SET next_wake_at=now()-interval '1 second' WHERE id=$1",[timeout.id]);
 assert((await wakeDueGoals()).includes(timeout.id));assert.equal((await row(timeout.id)).state,'VERIFYING');
 let resumed=0;
 assert.equal((await reviewNextReadGoal(f.bundle,pool,async input=>{resumed++;return input.proposedReport?{accepted:true,missing:[]}:final(input);})).status,'complete');
 assert.equal(resumed,2);assert.deepEqual(await counts(timeout.id),before);
 assert.equal((await report(timeout.id)).runtimeReview.attempts,2);assert.equal((await report(timeout.id)).runtimeReview.callsUsed,3);
 const exhausted=await fixture();
 await reviewNextReadGoal(f.bundle,pool,pending,{callDeadlineMs:30});
 await assert.rejects(continueReadReview({goalId:exhausted.id,legalEntityId:crypto.randomUUID(),actor:'owner'}),/NOT_FOUND/);
 await continueReadReview({goalId:exhausted.id,legalEntityId:f.entity,actor:'owner'});
 await reviewNextReadGoal(f.bundle,pool,pending,{callDeadlineMs:30});
 assert.equal((await row(exhausted.id)).next_wake_at,null);assert.equal((await report(exhausted.id)).runtimeReview.retryable,false);
 await assert.rejects(continueReadReview({goalId:exhausted.id,legalEntityId:f.entity,actor:'owner'}),/BUDGET_EXHAUSTED_REQUIRES_NEW_AUTHORIZATION/);
 assert.equal(active,0);
 const legacy=await fixture();await pool.query("UPDATE goals SET state='WAITING_EXTERNAL' WHERE id=$1",[legacy.id]);
 await pool.query(`INSERT INTO goal_read_reviews(goal_id,plan_id,round,decision,report_hash) VALUES($1,$2,1,'{"status":"blocked","limitations":["REVIEW_MODEL_DEADLINE"]}','legacy')`,[legacy.id,legacy.planId]);
 await assert.rejects(continueReadReview({goalId:legacy.id,legalEntityId:f.entity,actor:'owner'}),/NEW_AUTHORIZATION/);
 await pool.query("UPDATE goals SET completion_definition='another-contract' WHERE id=$1",[legacy.id]);
 await assert.rejects(continueReadReview({goalId:legacy.id,legalEntityId:f.entity,actor:'owner'}),/GOAL_CONTRACT_REQUIRED/);
 const cancelled=await fixture();const controller=new AbortController();controller.abort();
 let cancelledCalls=0;
 await reviewNextReadGoal(f.bundle,pool,async()=>{cancelledCalls++;return {};},{signal:controller.signal});assert.equal(cancelledCalls,0);
 assert.equal((await report(cancelled.id)).runtimeReview.retryable,false);
 const large={report:{products:Array.from({length:700},(_,i)=>({ean:String(i),description:'detail '.repeat(12),quantity:i})),includedOrders:123,orderItems:456,
  totals:{ordered:678,cancelled:9},period:{startDate:'2026-10-22',endDate:'2026-10-22'},limitations:['Returns absent','VAT and revenue unavailable'],coverage:{pagination:'every requested collection reached an empty terminal page'},candidates:[{ean:'0',stock:3}]}};
 const projection=projectReviewEvidence(large,22000);
 assert(projection.truncated);assert(projection.text.length<=22000);
 for(const key of ['includedOrders','orderItems','limitations','coverage','period','totals','candidates'])assert(projection.text.includes('"'+key+'"'));
 assert(projection.text.includes('Returns absent'));assert(projection.omissions.length);assert.equal(JSON.parse(projection.text).report.totals.ordered,678);
 assert.deepEqual(projectReviewEvidence(large,22000),projection,'deterministic projection');
 const invoice={capabilityId:'bol_list_invoices',data:{period:{startDate:'2026-09-01',endDate:'2026-09-30'},currency:'EUR',vat:'inclusive',totalAmount:9900,coverage:{complete:true}}};
 assert(monetaryEvidenceLimitations('2026-10-22 sales revenue EUR VAT',[invoice]).length);
 assert(monetaryEvidenceLimitations('2026-10-22 sales revenue EUR VAT',[{...invoice,capabilityId:'sales'}]).length,'period mismatch');
 const monetary={capabilityId:'sales',data:{...invoice.data,period:{startDate:'2026-10-22',endDate:'2026-10-22'}}};
 assert.equal(monetaryEvidenceLimitations('2026-10-22 sales revenue EUR VAT',[monetary]).length,0);
 assert(monetaryEvidenceLimitations('2026-10-22 sales revenue EUR VAT',[{...monetary,data:{...monetary.data,vat:'unknown'}}]).length);
 const incomplete=await fixture('2026-10-22 sales revenue EUR VAT',large);
 await reviewNextReadGoal(f.bundle,pool,async input=>{
  const content=input.verifiedObservations[0].lines.map((l:any)=>l.text).join('\n');assert(content.includes('includedOrders'));assert(content.includes('VAT and revenue unavailable'));
  assert.equal(input.verifiedObservations[0].sourceTruncated,true);return final(input);
 });
 assert.equal((await row(incomplete.id)).state,'WAITING_EXTERNAL');
 const blocked=await report(incomplete.id);assert.equal(blocked.status,'blocked');assert(blocked.requirements.every((r:any)=>!r.fulfilled));assert.equal(blocked.findings.length,0);
 assert(blocked.limitations.includes('VAT and revenue unavailable'));assert(blocked.limitations.some((s:string)=>s.includes('MONETARY_COVERAGE_UNPROVEN')));
 const unstructured=await fixture('Read entire content',{content:[{type:'text',text:'x'.repeat(30000)}]});let invoked=0;
 await reviewNextReadGoal(f.bundle,pool,async()=>{invoked++;return {};});assert.equal(invoked,0);assert((await report(unstructured.id)).limitations.some((s:string)=>s.startsWith('REVIEW_EVIDENCE_PROJECTION_BLOCKED')));
 const tool=createActionTools({manifest:()=>[],execute:async()=>{},continueReview:async()=>{throw Error('must not dispatch');}}).find(t=>t.definition.name==='sam_continue_review')!;
 assert.equal((await tool.handler({goal_id:legacy.id,legal_entity_id:f.entity},{actor:'not-owner',systemOwner:false})).ok,false);
 // Actual provider HTTP transport cancellation, not just a rejected fake Promise.
 let requests=0,closed=0;
 const server=createServer((req,res)=>{requests++;req.resume();res.on('close',()=>{closed++;});});
 await new Promise<void>(r=>server.listen(0,'127.0.0.1',r));
 try{
  const address=server.address() as {port:number};
  const adapter=new OpenAICompatibleChatAdapter('synthetic',{apiKey:'synthetic-fixture',baseUrl:`http://127.0.0.1:${address.port}`,timeoutMs:60000});
  await assert.rejects(invokeReviewWithinDeadline(signal=>adapter.invoke({task:'executive_planning',capability:'planning',input:{},dataClassification:'INTERNAL',signal},'fixture'),150),/REVIEW_MODEL_DEADLINE/);
  for(let i=0;i<20&&closed<requests;i++)await pause(10);
  assert.equal(requests,1);assert.equal(closed,1,'HTTP request closed at review deadline, no orphan request');
 }finally{server.closeAllConnections();await new Promise<void>(r=>server.close(()=>r()));}
 assert.equal(f.counters().sends,0);
 console.log('PASS review deadlines abort provider transport; durable bounded continuation reuses verified work; exhaustion/cancellation/contracts/tenant/owner gates; deterministic large evidence metadata; wrong-period invoices and missing EUR/VAT/coverage cannot complete; incomplete reports remain honest');
 await pool.end();
}
main().catch(async e=>{console.error(e);await pool.end();process.exitCode=1;});
