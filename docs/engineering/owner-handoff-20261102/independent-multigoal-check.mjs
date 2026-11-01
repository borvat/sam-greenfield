// Run from the deployed repository root: node --import tsx --input-type=module < this-file
// Read-only, bounded queries. No source contents, addresses, report prose or credentials emitted.
import assert from 'node:assert/strict';
import pg from 'pg';
import {sha256Hex} from './packages/shared/src/stableJson.ts';
import {reviewSourceText} from './apps/production/src/reviewEvidence.ts';
const goal='6751e9a4-cda5-465e-9f8a-611eeea582b7',plan='f97561c5-ad8b-4473-a265-75a082f4dbf0';
const report='939ea95c-6d02-478d-9a41-d5d3a04e139b',expectedHash='122c6c4be8134b7ffe4e6a64f36a95a47e54a614a009ffdda1dbf257b2fec5c4';
const entity='73aa81c6-3a23-4369-9408-8bea0956d399';
const expected=new Map([['b7fca26a-40f1-449c-a565-5e8f549b6ea5','bol_get_offer'],['20d42958-4be2-4e14-b4c0-9300cb616588','google_mcp_search_gmail_messages']]);
const c=new pg.Client({connectionString:process.env.DATABASE_URL,connectionTimeoutMillis:8000,query_timeout:10000});
let begun=false,phase='CONNECT',assertion=null;
const equal=(name,actual,expected)=>{assertion=name;assert.equal(actual,expected);assertion=null;};
const truth=(name,value)=>{assertion=name;assert.ok(value);assertion=null;};
try{
 await c.connect();phase='BEGIN_READONLY';await c.query('BEGIN READ ONLY');begun=true;
 phase='SCOPE';
 await c.query("SET LOCAL statement_timeout='8s'");
 await c.query("SELECT set_config('app.current_org_id',$1,true),set_config('app.current_legal_entity_id',$2,true)",['566baa67-5d93-4195-a1d0-18c1649154bf',entity]);
 phase='GOAL';const g=(await c.query('SELECT state,current_plan_id FROM goals WHERE id=$1 AND company_scope=$2',[goal,entity])).rows;
 equal('GOAL_VISIBLE_ONE',g.length,1);equal('GOAL_COMPLETED',g[0].state,'COMPLETED');equal('GOAL_PLAN',g[0].current_plan_id,plan);
 phase='REPORT';
 const rr=(await c.query('SELECT r.* FROM goal_read_reviews r JOIN goals g ON g.id=r.goal_id WHERE r.id=$1 AND r.goal_id=$2 AND g.company_scope=$3',[report,goal,entity])).rows;
 equal('REPORT_VISIBLE_ONE',rr.length,1);const r=rr[0];equal('REPORT_PLAN',r.plan_id,plan);equal('REPORT_REVISION',r.revision,1);equal('REPORT_COMPLETE',r.decision.status,'complete');equal('REPORT_EXPECTED_HASH',r.report_hash,expectedHash);equal('REPORT_RECOMPUTED_HASH',sha256Hex(r.decision),expectedHash);
 phase='EXECUTIONS';
 const es=(await c.query(`SELECT e.id,e.queue_id,e.plan_id,e.capability_id,e.actor,e.status,e.result,e.execution_hash,e.plan_hash,w.status AS work_status,w.capability_id AS work_capability,w.handoff IS NOT NULL AS has_handoff
  FROM executions e JOIN goals g ON g.id=e.goal_id LEFT JOIN work_queue w ON w.id=e.queue_id AND w.goal_id=e.goal_id AND w.plan_id=e.plan_id
  WHERE e.goal_id=$1 AND g.company_scope=$2 ORDER BY e.id`,[goal,entity])).rows;
 equal('EXECUTION_COUNT',es.length,2);equal('DISTINCT_ACTORS',new Set(es.map(e=>e.actor)).size,2);equal('DISTINCT_QUEUE_ITEMS',new Set(es.map(e=>e.queue_id)).size,2);
 const refs=r.decision.evidenceReferences;truth('REFERENCES_ARRAY',Array.isArray(refs));equal('REFERENCE_COUNT',refs.length,2);equal('DISTINCT_REFERENCE_EXECUTIONS',new Set(refs.map(x=>x.executionId)).size,2);
 const verified=[];
 for(const e of es){
  phase='EXECUTION_BINDINGS';equal('EXPECTED_EXECUTION_CAPABILITY',e.capability_id,expected.get(e.id));equal('EXECUTION_PLAN',e.plan_id,plan);equal('EXECUTION_EXECUTED',e.status,'EXECUTED');truth('QUEUE_PRESENT',e.queue_id);equal('QUEUE_EXECUTED',e.work_status,'EXECUTED');equal('QUEUE_CAPABILITY',e.work_capability,e.capability_id);
  const ref=refs.find(x=>x.executionId===e.id);truth('EXECUTION_REFERENCE_PRESENT',ref);
  // The complete-review contract hashes original reviewSourceText, not the result envelope.
  // readGoalReview's failed-projection fallback uses the envelope only for blocked evidence.
  equal('ORIGINAL_REVIEW_SOURCE_HASH',ref.originalContentHash,sha256Hex(reviewSourceText(e.result)));
  phase='VERIFICATION';
  const vs=(await c.query(`SELECT v.id,v.verifier,v.method,v.result,v.plan_hash,v.execution_hash,v.independent_evidence FROM verifications v JOIN executions e ON e.id=v.execution_id JOIN goals g ON g.id=e.goal_id WHERE v.id=$1 AND v.execution_id=$2 AND e.goal_id=$3 AND g.company_scope=$4`,[ref.verificationId,e.id,goal,entity])).rows;
  equal('VERIFICATION_VISIBLE_ONE',vs.length,1);const v=vs[0];equal('VERIFICATION_VERIFIED',v.result,'VERIFIED');equal('VERIFICATION_PLAN_HASH',v.plan_hash,e.plan_hash);equal('VERIFICATION_EXECUTION_HASH',v.execution_hash,e.execution_hash);truth('INDEPENDENT_EVIDENCE_PRESENT',v.independent_evidence&&Object.keys(v.independent_evidence).length);
  verified.push({executionId:e.id,queueId:e.queue_id,capability:e.capability_id,actor:e.actor,workStatus:e.work_status,hasHandoffObject:e.has_handoff,verificationId:v.id,verifier:v.verifier,method:v.method,verificationResult:v.result,independentEvidenceHash:sha256Hex(v.independent_evidence),sourceHashBound:true});
 }
 console.log(JSON.stringify({schema:'sam.independent_multigoal_metadata.v1',checkedAt:new Date().toISOString(),status:'PASS',goalId:goal,state:g[0].state,planId:plan,reportId:report,revision:1,reportHash:expectedHash,recomputedReportHashMatches:true,distinctActors:2,distinctQueueItems:2,verifiedReferences:2,executions:verified,scope:'READ_ONLY_SAVED_METADATA_AND_INTERNAL_HASH_BINDINGS',limits:['No source contents exported','Persisted verification evidence is not a fresh independent provider readback by this checker','No owner UI login, email delivery, 15-staff operation or business-effect proof']}));
}catch(error){console.log(JSON.stringify({schema:'sam.independent_multigoal_metadata.v1',status:'NOT_PASS',reason:'CONNECTION_QUERY_OR_ASSERTION_FAILED',goalId:goal,phase,assertion,sqlCode:typeof error?.code==='string'&&/^[0-9A-Z]{5}$/.test(error.code)?error.code:null}));process.exitCode=1;}
finally{if(begun)await c.query('ROLLBACK').catch(()=>{});await c.end().catch(()=>{});}
