import {assertReviewInputBudget,REVIEW_INPUT_BYTES,reviewSourceAllowance,reviewCatalogProjection} from '../../apps/production/src/reviewInputBudget';
import {readReviewBudget,recordReadReviewBudget} from '../../apps/kernel/src/readReviewBudget';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createServer} from 'node:http';
import {pool,withTransaction,setTenantContext} from '../../packages/db/src/client';
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
import {pollScopedOwnerNotifications} from '../../apps/notifications/src/center';
import {createReliabilityReadTools} from '../../apps/chatgpt-tools/src/reliabilityReadTools';
import {createActionTools} from '../../apps/chatgpt-tools/src/actionTools';
const pause=(ms:number)=>new Promise(r=>setTimeout(r,ms));
async function main(){
 await pool.query(await readFile('packages/db/integration-migrations/00101_goal_read_reviews.sql','utf8'));
 await pool.query(await readFile('packages/db/integration-migrations/00106_read_review_revisions.sql','utf8'));
 await pool.query(await readFile('packages/db/integration-migrations/00105_owner_notifications.sql','utf8'));
 const f=await reviewFixture();
 const contract=(await pool.query(`INSERT INTO verification_contracts(capability_id,description,verification_method,required_evidence_fields,independent_query_template)
 VALUES('review_echo','Synthetic independent readback','db_query','{"readback":"boolean"}','{}') RETURNING id`)).rows[0].id;
 async function fixture(objective='Read verified source',result:any={message:'Verified source confirms quantity 7'}){
  const id=await f.goal(objective,'PLANNING');await pool.query("UPDATE goals SET completion_definition='sam.read_report.v1' WHERE id=$1",[id]);
  const results=Array.isArray(result)?result:[result];
  const plan=await persistPlanAndDelegateAtomic({goalId:id,steps:results.map((_,i)=>({capabilityId:'review_echo',params:{fixture:true,index:i}}))});
  let executionId='';
  for(const [i,result] of results.entries()){
  const lease=await leaseWorkAtomic(plan.queueIds[i],'synthetic-reader',60);
  const ex=await recordExecutionAndRequestVerificationAtomic({queueId:plan.queueIds[i],fencingToken:lease.token,actor:'synthetic-reader',result,evidence:{readback:true}});
  await recordIndependentVerificationAtomic({executionId:ex.executionId,verifier:'synthetic-independent-verifier',contractId:contract,independentEvidence:{readback:true},result:'VERIFIED'});
  executionId=ex.executionId;
  }
  return {id,planId:plan.planId,executionId};
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
 assert.equal((await readReviewBudget(pool,timeout.id,timeout.planId)).attempts,1);
 assert.equal((await pool.query('SELECT 1 FROM goal_read_reviews WHERE goal_id=$1',[timeout.id])).rowCount,0,'retry has no terminal report');
 assert.equal((await readReviewBudget(pool,timeout.id,timeout.planId)).retryable,true);
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
  const content=input.verifiedObservations[0].lines.join('\n');assert(content.includes('includedOrders'));assert(content.includes('VAT and revenue unavailable'));
  assert.equal(input.verifiedObservations[0].sourceTruncated,true);return final(input);
 });
 assert.equal((await row(incomplete.id)).state,'WAITING_EXTERNAL');
 const blocked=await report(incomplete.id);assert.equal(blocked.status,'blocked');assert(blocked.requirements.every((r:any)=>!r.fulfilled));assert.equal(blocked.findings.length,0);
 assert(blocked.limitations.includes('VAT and revenue unavailable'));assert(blocked.limitations.some((s:string)=>s.includes('MONETARY_COVERAGE_UNPROVEN')));
 const unstructured=await fixture('Read entire content',{content:[{type:'text',text:'x'.repeat(30000)}]});let invoked=0;
 await reviewNextReadGoal(f.bundle,pool,async()=>{invoked++;return {};});assert.equal(invoked,0);assert((await report(unstructured.id)).limitations.some((s:string)=>s.startsWith('REVIEW_EVIDENCE_PROJECTION_BLOCKED')));
 // Four realistic large sources: analysis, orders, stock and a mismatched invoice.
 const multi=await fixture('Compare verified operational evidence',[
  large,{orders:Array.from({length:250},(_,i)=>({orderId:'ORDER-'+i,quantity:2,description:'product '.repeat(15)})),period:large.report.period,limitations:['Order list has no prices']},
  {inventory:Array.from({length:300},(_,i)=>({ean:String(i),stock:12,description:'stock '.repeat(15)})),coverage:{complete:true}},
  {invoices:Array.from({length:100},(_,i)=>({invoiceId:'INV-'+i,description:'settlement '.repeat(15)})),period:invoice.data.period,limitations:['September settlement is not October daily revenue']}]);
 const multiBefore=await counts(multi.id);const sizes:number[]=[];
 await reviewNextReadGoal(f.bundle,pool,async input=>{
  sizes.push(assertReviewInputBudget(input));assert.equal(input.verifiedObservations.length,4);
  for(const s of input.verifiedObservations){assert(s.lines.every((l:any)=>typeof l==='string'));assert(s.sourceContentHash);assert(s.trustBoundary);assert(s.lines.join('\n').includes('originalContentHash'));}
  const texts=input.verifiedObservations.map((s:any)=>s.lines.join('\n')).join('\n');
  for(const key of ['includedOrders','orderItems','totals','2026-10-22','2026-09-30'])assert(texts.includes(key));
  assert(input.evidenceLimitations.some((s:string)=>s.includes('detail items omitted')));
  assert(input.evidenceLimitations.includes('Order list has no prices'));
  return input.proposedReport?{accepted:true,missing:[]}:final(input);
 });
 assert.equal((await report(multi.id)).status,'complete');assert.equal(sizes.length,2);assert(sizes.every(n=>n<=REVIEW_INPUT_BYTES));assert.deepEqual(await counts(multi.id),multiBefore);
 assert.equal(reviewSourceAllowance(20),800);assert.throws(()=>reviewSourceAllowance(21),/SOURCE_BUDGET/);
 // Entire context is measured, including Unicode, escaping, schemas and critique.
 assert.throws(()=>assertReviewInputBudget({capabilities:[{description:'界'.repeat(17000)}]}),/INPUT_BUDGET/);
 assert.throws(()=>assertReviewInputBudget({proposedReport:{summary:'"'.repeat(25000)}}),/INPUT_BUDGET/);
 // Documentation projection keeps schema semantics, every capability and authority scope.
 const schemaDescriptor={capabilityId:'read',authorityClass:'GREEN',sideEffect:false,companyScopes:[f.entity],description:'Read a verified record by its observed identity',parameters:{type:'object',description:'schema documentation '.repeat(8000),properties:{description:{type:'string',description:'field documentation',minLength:3},identity:{const:{description:'literal data stays'}}},required:['description'],additionalProperties:false}};
 const compact=reviewCatalogProjection([schemaDescriptor])[0];
 assert.deepEqual(compact.parameters.properties.identity.const,{description:'literal data stays'});assert.equal(compact.parameters.properties.description.minLength,3);assert.deepEqual(compact.parameters.required,['description']);assert.equal(compact.parameters.additionalProperties,false);assert.deepEqual(compact.companyScopes,[f.entity]);
 assert.throws(()=>assertReviewInputBudget({capabilities:[schemaDescriptor]}),/INPUT_BUDGET/);assertReviewInputBudget({capabilities:[compact]});
 const catalogGoal=await fixture();const richBundle={...f.bundle,catalog:{planningDescriptors:()=>[{...schemaDescriptor,capabilityId:'review_echo',parameters:{type:'object',additionalProperties:true}}]}};
 let catalogCalls=0;await reviewNextReadGoal(richBundle as any,pool,async input=>{catalogCalls++;if(!input.proposedReport){assert.equal(input.contextCoverage.catalog.included,1);assert.equal(input.contextCoverage.catalog.total,1);assert.equal(input.capabilities[0].capabilityId,'review_echo');}return input.proposedReport?{accepted:true,missing:[]}:final(input);});
 const nativeShaped=Array.from({length:61},(_,i)=>({...schemaDescriptor,capabilityId:'read_'+i,description:'Read an existing record by its observed recordId; use only to inspect saved contents.',parameters:{type:'object',description:'documented schema '.repeat(40),properties:{recordId:{type:'string',minLength:1,maxLength:80}},required:['recordId'],additionalProperties:false}}));
 assert.throws(()=>assertReviewInputBudget({capabilities:nativeShaped}),/INPUT_BUDGET/);const allCompact=reviewCatalogProjection(nativeShaped);assertReviewInputBudget({capabilities:allCompact});assert.equal(allCompact.length,61);assert.deepEqual(allCompact.map(d=>d.capabilityId),nativeShaped.map(d=>d.capabilityId));for(const d of allCompact){assert.equal(d.parameters.additionalProperties,false);assert.deepEqual(d.parameters.required,['recordId']);assert.equal(d.parameters.properties.recordId.maxLength,80);}
 assert.equal(catalogCalls,2);assert.equal((await report(catalogGoal.id)).status,'complete');
 const oversized=await fixture('Read '+'界'.repeat(17000));let oversizedCalls=0;
 await reviewNextReadGoal(f.bundle,pool,async()=>{oversizedCalls++;return {};});
 assert.equal(oversizedCalls,0);assert.equal((await report(oversized.id)).runtimeReview.callsUsed,0);
 assert((await report(oversized.id)).evidenceSnapshot[0].projectedText.includes('Verified source confirms quantity 7'));assert.equal((await report(oversized.id)).evidenceSnapshot[0].executionId,oversized.executionId);
 assert.equal((await readReviewBudget(pool,oversized.id,oversized.planId)),undefined,'preflight never reserves historical attempts or calls');
 assert.equal(await wakeGoalFromEventAtomic(oversized.id,2,'EXTERNAL_REPLY'),false);
 assert.equal((await row(oversized.id)).next_wake_at,null);assert((await report(oversized.id)).limitations.includes('REVIEW_INPUT_BUDGET_EXCEEDED'));
 // Reproduce the old immutable size failure after its reservation. Recovery appends exactly once.
 const ownerContext={actor:'owner',systemOwner:true,legalEntityId:f.entity};
 const pollNotifications=()=>withTransaction(async c=>{await setTenantContext(c,{orgId:f.org,legalEntityId:f.entity});return pollScopedOwnerNotifications(c,ownerContext);});
 await pollNotifications();
 const recovery=await fixture();const originalCounts=await counts(recovery.id);
 const historical={status:'blocked',summary:'Historical immutable size failure',requirements:[],findings:[],limitations:['REVIEW_INPUT_BUDGET_EXCEEDED'],steps:[],runtimeReview:{attempts:1,callsUsed:0,retryable:false,phase:'finished',errorCode:'REVIEW_INPUT_BUDGET_EXCEEDED'}};
 await pool.query("UPDATE goals SET state='WAITING_EXTERNAL' WHERE id=$1",[recovery.id]);
 await recordReadReviewBudget(pool,recovery.id,recovery.planId,historical.runtimeReview);
 const old=(await pool.query('INSERT INTO goal_read_reviews(goal_id,plan_id,round,decision,report_hash) VALUES($1,$2,1,$3::jsonb,$4) RETURNING *',[recovery.id,recovery.planId,JSON.stringify(historical),'immutable-original-hash'])).rows[0];
 const beforeHistory=(await pool.query("SELECT * FROM audit_log WHERE goal_id=$1 AND action='READ_REVIEW_BUDGET' ORDER BY timestamp,id",[recovery.id])).rows;
 await assert.rejects(continueReadReview({goalId:recovery.id,legalEntityId:crypto.randomUUID(),actor:'owner'}),/NOT_FOUND/);
 await continueReadReview({goalId:recovery.id,legalEntityId:f.entity,actor:'owner'});
 assert.equal((await continueReadReview({goalId:recovery.id,legalEntityId:f.entity,actor:'owner'})).idempotent,true);
 assert.deepEqual((await pool.query("SELECT * FROM audit_log WHERE goal_id=$1 AND action='READ_REVIEW_BUDGET' ORDER BY timestamp,id",[recovery.id])).rows,beforeHistory,'owner continuation preserves all budget rows');
 let recoveryCalls=0;await reviewNextReadGoal(f.bundle,pool,async input=>{recoveryCalls++;return input.proposedReport?{accepted:true,missing:[]}:final(input);});
 assert.equal(recoveryCalls,2);assert.equal((await row(recovery.id)).state,'COMPLETED');assert.deepEqual(await counts(recovery.id),originalCounts);
 const revisions=(await pool.query('SELECT * FROM goal_read_reviews WHERE goal_id=$1 ORDER BY revision',[recovery.id])).rows;
 assert.equal(revisions.length,2);assert.deepEqual(revisions[0],old);assert.equal(revisions[1].supersedes_report_id,old.id);assert.equal(revisions[1].decision.supersedesReport.hash,old.report_hash);assert.equal(revisions[1].decision.runtimeReview.attempts,2);assert.equal(revisions[1].decision.runtimeReview.callsUsed,2);assert.equal(revisions[1].decision.runtimeReview.gatewayInvocations,2);
 await continueReadReview({goalId:recovery.id,legalEntityId:f.entity,actor:'owner'});assert.equal((await reviewNextReadGoal(f.bundle,pool,async()=>{throw Error('unexpected redispatch');})).processed,false);
 assert.equal((await pool.query("SELECT count(*)::int n FROM audit_log WHERE goal_id=$1 AND action='READ_REVIEW_CONTINUATION_REQUESTED'",[recovery.id])).rows[0].n,1);
 const foreign=await fixture();await pool.query("UPDATE goals SET state='WAITING_EXTERNAL' WHERE id=$1",[foreign.id]);
 await assert.rejects(pool.query('INSERT INTO goal_read_reviews(goal_id,plan_id,round,decision,report_hash,revision,supersedes_report_id) VALUES($1,$2,1,$3::jsonb,$4,2,$5)',[foreign.id,foreign.planId,JSON.stringify(historical),'cross-goal-denied',(await pool.query('SELECT id FROM goal_read_reviews WHERE goal_id=$1',[legacy.id])).rows[0].id]),/foreign key/);
 await assert.rejects(pool.query('INSERT INTO goal_read_reviews(goal_id,plan_id,round,decision,report_hash,revision,supersedes_report_id) VALUES($1,$2,1,$3::jsonb,$4,2,$5)',[recovery.id,recovery.planId,JSON.stringify(historical),'forbidden-third',old.id]));
 const savedOnly=await fixture();await pool.query("UPDATE goals SET state='WAITING_EXTERNAL' WHERE id=$1",[savedOnly.id]);await recordReadReviewBudget(pool,savedOnly.id,savedOnly.planId,historical.runtimeReview);
 await pool.query('INSERT INTO goal_read_reviews(goal_id,plan_id,round,decision,report_hash) VALUES($1,$2,1,$3::jsonb,$4)',[savedOnly.id,savedOnly.planId,JSON.stringify(historical),'saved-only-original']);const savedOnlyCounts=await counts(savedOnly.id);
 await continueReadReview({goalId:savedOnly.id,legalEntityId:f.entity,actor:'owner'});
 await reviewNextReadGoal(f.bundle,pool,async input=>({...final(input),status:'continue',requirements:[{requirement:'Additional proof',fulfilled:false,evidenceIds:[savedOnly.executionId]}],steps:[{capabilityId:'review_echo',params:{fixture:true,index:99}}]}));
 assert.deepEqual(await counts(savedOnly.id),savedOnlyCounts,'recovery never delegates proposed follow-up reads');const savedOnlyRevision=(await pool.query('SELECT * FROM goal_read_reviews WHERE goal_id=$1 ORDER BY revision DESC',[savedOnly.id])).rows[0];assert.equal(savedOnlyRevision.decision.status,'blocked');assert.deepEqual(savedOnlyRevision.decision.steps,[]);assert(savedOnlyRevision.decision.limitations.some((x:string)=>x.startsWith('RECOVERY_SAVED_EVIDENCE_ONLY')));
 await pollNotifications();await pollNotifications();
 const recoveredNotices=(await pool.query("SELECT * FROM owner_notifications WHERE goal_id=$1 AND kind='COMPLETED'",[recovery.id])).rows;assert.equal(recoveredNotices.length,1,'recovery creates only one completion notification');assert.equal(recoveredNotices[0].body.report.id,revisions[1].id);assert.equal(recoveredNotices[0].body.report.hash,revisions[1].report_hash);assert.equal(recoveredNotices[0].status,'UNROUTED');
 const waitingNotice=(await pool.query("SELECT * FROM owner_notifications WHERE goal_id=$1 AND kind='PROGRESS'",[savedOnly.id])).rows;assert.equal(waitingNotice.length,1);assert.equal(waitingNotice[0].body.report.id,savedOnlyRevision.id);assert.equal(waitingNotice[0].body.report.hash,savedOnlyRevision.report_hash);assert.equal(waitingNotice[0].body.requiredAction,'INSPECT_REVIEW_DIAGNOSTICS_AND_BUDGET_THEN_OWNER_CONTINUE_IF_ELIGIBLE');
 const twenty=await fixture('Compare twenty bounded sources',Array.from({length:20},(_,i)=>({source:i,period:large.report.period,totals:{quantity:i},limitations:['Prices absent'],products:Array.from({length:30},(_,j)=>({ean:String(j),stock:3}))})));
 let twentyCalls=0;
 await reviewNextReadGoal(f.bundle,pool,async input=>{twentyCalls++;assertReviewInputBudget(input);assert.equal(input.verifiedObservations.length,20);return input.proposedReport?{accepted:true,missing:[]}:final(input);});
 assert.equal(twentyCalls,2);assert.equal((await report(twenty.id)).status,'complete');
 const critiqueOverflow=await fixture();let critiqueCalls=0;
 await reviewNextReadGoal(f.bundle,pool,async input=>{critiqueCalls++;const r=final(input);r.findings[0].text='x'.repeat(50000);return r;});
 assert.equal(critiqueCalls,1,'oversized critique never dispatched');assert.equal((await report(critiqueOverflow.id)).runtimeReview.callsUsed,1);
 assert((await report(critiqueOverflow.id)).limitations.includes('REVIEW_INPUT_BUDGET_EXCEEDED'));assert.equal((await row(critiqueOverflow.id)).next_wake_at,null);
 // Arabic characters fit a character-only allowance but exceed the UTF-8 boundary.
 const arabicObjective='اقرأ '.repeat(6000);assert(arabicObjective.length<REVIEW_INPUT_BYTES);assert(Buffer.byteLength(arabicObjective,'utf8')>REVIEW_INPUT_BYTES);
 const arabic=await fixture(arabicObjective);let arabicCalls=0;
 await reviewNextReadGoal(f.bundle,pool,async()=>{arabicCalls++;return {};});
 assert.equal(arabicCalls,0);assert.equal(await readReviewBudget(pool,arabic.id,arabic.planId),undefined);
 assert((await report(arabic.id)).limitations.includes('REVIEW_INPUT_BUDGET_EXCEEDED'));assert.equal((await row(arabic.id)).state,'WAITING_EXTERNAL');
 // Prior narrative can be huge; unmet deliverables remain available as control history.
 const history=await fixture();const narrative='Historical narrative '.repeat(6000);
 for(let i=0;i<4;i++){
  const oldPlan=(await pool.query(`INSERT INTO plans(goal_id,version,goal_assumptions,constraints,steps,plan_hash)
   SELECT goal_id,$2,goal_assumptions,constraints,steps,plan_hash FROM plans WHERE id=$1 RETURNING id`,[history.planId,100+i])).rows[0].id;
  await pool.query('INSERT INTO goal_read_reviews(goal_id,plan_id,round,decision,report_hash) VALUES($1,$2,$3,$4::jsonb,$5)',[history.id,oldPlan,i+1,JSON.stringify({status:'continue',summary:narrative,requirements:[{requirement:'Previously unmet deliverable '+i,fulfilled:false,evidenceIds:[]}],findings:[{text:narrative}],limitations:['Earlier review was incomplete'],steps:[]}),'synthetic-history-'+i]);
 }
 const historyBefore=await counts(history.id);let historyCalls=0;
 await reviewNextReadGoal(f.bundle,pool,async input=>{
  historyCalls++;assertReviewInputBudget(input);
  if(!input.proposedReport){assert.equal(input.previousDecisions.length,4);assert(input.previousDecisions.every((d:any)=>d.requirements[0].fulfilled===false));assert(input.contextCoverage.history.originalHash);assert(!JSON.stringify(input).includes(narrative));}
  return input.proposedReport?{accepted:true,missing:[]}:final(input);
 });
 assert.equal(historyCalls,2);assert.equal((await row(history.id)).state,'COMPLETED');assert.deepEqual(await counts(history.id),historyBefore);
 // The source identifies a different product and explicitly lacks monetary/stock proof.
 const identityData={ean:'8710000000002',stock:null,price:{amount:null,currency:null},taxBasis:'UNKNOWN',limitations:['Expected EAN 8710000000001 is not the returned product; stock and monetary fields are unknown']};
 const identity=await fixture('Read stock and price for expected EAN 8710000000001',identityData);const identityBefore=await counts(identity.id);
 await reviewNextReadGoal(f.bundle,pool,async input=>{
  const observation=input.verifiedObservations[0],quoteLine=observation.lines.findIndex((line:string)=>line.includes('"ean": "8710000000002"'));
  return {status:'blocked',summary:'Returned EAN differs from the expected product; requested stock, currency and tax basis are unknown.',requirements:[{requirement:'Stock and monetary proof for expected EAN 8710000000001',fulfilled:false,evidenceIds:[observation.id]}],findings:[{text:'Returned product EAN is 8710000000002; it cannot be attributed to expected EAN 8710000000001.',executionId:observation.id,quoteLine}],limitations:identityData.limitations,steps:[]};
 });
 const identityReport=await report(identity.id),snapshot=identityReport.evidenceSnapshot[0];
 const projectedIdentity=JSON.parse(snapshot.projectedText.split('\n[Verified execution evidence]')[0]);
 assert.deepEqual(projectedIdentity,identityData);assert.equal(projectedIdentity.stock,null);assert.equal(projectedIdentity.price.amount,null);assert.equal(projectedIdentity.price.currency,null);assert.equal(projectedIdentity.taxBasis,'UNKNOWN');assert.equal(projectedIdentity.ean,'8710000000002');
 assert.equal(identityReport.status,'blocked');assert.equal(identityReport.requirements[0].fulfilled,false);assert(identityReport.findings[0].quote.includes('8710000000002'));assert.equal((await row(identity.id)).state,'WAITING_EXTERNAL');assert.deepEqual(await counts(identity.id),identityBefore);
 // Audit latency can exhaust the deadline after a conservative call reservation.
 const slowAudit=await fixture();let slowInvocations=0;const slowDb={connect:async()=>{
  const c=await pool.connect();return {release:()=>c.release(),query:async(sql:string,args?:any[])=>{
   const result=await c.query(sql,args);if(sql.includes("'READ_REVIEW_BUDGET'")&&sql.includes('INSERT INTO')&&JSON.parse(args?.[1]).runtimeReview.callsUsed===1)await pause(250);return result;
  }};
 }};
 await reviewNextReadGoal(f.bundle,slowDb,async()=>{slowInvocations++;return {};},{callDeadlineMs:100});
 const slowBudget=await readReviewBudget(pool,slowAudit.id,slowAudit.planId);assert.equal(slowInvocations,0);assert.equal(slowBudget.attempts,1);assert.equal(slowBudget.callsUsed,1);assert.equal(slowBudget.gatewayInvocations,0);assert.equal(slowBudget.attemptGatewayInvocations,0);assert.equal(slowBudget.errorCode,'REVIEW_MODEL_DEADLINE');assert.equal(slowBudget.callsUsedMeaning,'CONSERVATIVE_CALL_RESERVATIONS_INCLUDING_HISTORICAL_UNKNOWN_USAGE');assert.equal(slowBudget.gatewayInvocationsMeaning,'GATEWAY_FUNCTION_INVOCATIONS_NOT_PROVIDER_LEDGER; NULL_IS_HISTORICAL_UNKNOWN');
 // Exercise the authenticated single-report read with a tenant-bound test connection.
 const reportConnection=await pool.connect(),originalConnect=pool.connect;
 try{
  (pool as any).connect=async()=>({release(){},query:async(sql:string,args?:any[])=>{
   const result=await reportConnection.query(sql,args);if(sql==='BEGIN')await setTenantContext(reportConnection,{orgId:f.org,legalEntityId:f.entity});return result;
  }});
  const readTool=createReliabilityReadTools().find(t=>t.definition.name==='sam_get_report')!;
  const oldRead=await readTool.handler({report_id:old.id},ownerContext),newRead=await readTool.handler({report_id:revisions[1].id},ownerContext);
  assert.equal(oldRead.ok,true);assert.equal(newRead.ok,true);assert.deepEqual((oldRead.data as any).report,old);assert.equal((oldRead.data as any).interpretation.supersededByReportId,revisions[1].id);assert.equal((newRead.data as any).report.report_hash,revisions[1].report_hash);assert.equal((newRead.data as any).interpretation.supersedesReportId,old.id);assert.equal((oldRead.data as any).executionPerformed,false);
 }finally{pool.connect=originalConnect;reportConnection.release();}
 console.log('PASS Arabic UTF-8 preflight, large prior narratives, identity and unknown monetary/stock evidence, reserved-without-invocation deadline, scoped old/new report linkage');
 console.log('PASS total serialized review/critique input ceilings; four large sources retain totals/periods/provenance/omissions; Unicode/escaping oversized input makes zero calls',JSON.stringify({inputBytes:sizes,limit:REVIEW_INPUT_BYTES}));
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
