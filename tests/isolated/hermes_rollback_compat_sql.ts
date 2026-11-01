/** Exact pinned application modules; real migration/report/provenance SQL; no providers. */
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {readFile} from 'node:fs/promises';
import {randomUUID} from 'node:crypto';
import ts from 'typescript';
import {z} from 'zod';
import {sha256Hex} from '../../packages/shared/src/stableJson';
import {validateGoalAcceptance} from '../../apps/kernel/src/goalAcceptance';
import {ANALYST,SOURCE,ANALYSIS_MARKER} from '../../apps/production/src/dataAnalysisContract';
import {followupFixture,OTHER} from './hermes_source_followup_fixture';
const path='apps/production/src/hermesSourceFollowup.ts';
const pins=[
 {baseline:'62ccbdbb94e080f22425f64396c894270ee551aa',candidate:'2d4d32e286ff71307417f7375985b85214c7a2e6'},
 {baseline:'1e4e21a773c88e2366915edd3bb2e307fddaa157',candidate:'0f056d36f98413b7590a405294693c0b5fc18885'}
];
function moduleAt(pin:string){
 const source=execFileSync('git',['show',`${pin}:${path}`],{encoding:'utf8'});
 // Compile the entire exact source module, replacing only its import/export wrappers.
 const body=source.replace(/^import .*;\n/gm,'').replace(/^export /gm,'');
 const compiled=ts.transpileModule(body,{compilerOptions:{target:ts.ScriptTarget.ES2023,module:ts.ModuleKind.None}}).outputText;
 return new Function('z','sha256Hex','validateGoalAcceptance','ANALYST','SOURCE','ANALYSIS_MARKER',compiled+'\nreturn {saveAcceptedFollowupReport};')(z,sha256Hex,validateGoalAcceptance,ANALYST,SOURCE,ANALYSIS_MARKER);
}
async function acceptedFixture(preMigration:boolean){
 const f=await followupFixture();
 if(preMigration){
  // Only the disposable fixture is reset; then apply the unchanged actual 00101.
  await f.sql.exec('DROP TABLE goal_read_reviews');
  await f.sql.exec(await readFile(new URL('../../packages/db/integration-migrations/00101_goal_read_reviews.sql',import.meta.url),'utf8'));
 }
 const goalId=randomUUID(),planId=randomUUID(),executionId=randomUUID(),verificationId=randomUUID(),queue=randomUUID();
 const assumptions={sourceReuse:f.binding},receipt={synthetic:true};
 const report={sourceReuse:f.binding,sourceExecutionId:f.binding.sourceExecutionId,sourceHash:f.binding.sourceHash,source:f.sourceReport,interpretation:{summary:'Synthetic accepted analysis',classification:'SOURCE_DERIVED'}};
 const result={sourceReuse:f.binding,sourceBindingHash:sha256Hex(f.binding),report,candidate:{synthetic:true}};
 const evidence={reportHash:sha256Hex(report)};
 await f.query("INSERT INTO goals(id,company_scope,domain,objective,state,current_plan_id) VALUES($1,$2,'hermes_data_analysis',$3,'VERIFYING',$4)",[goalId,f.entity,'Synthetic rollback check',planId]);
 await f.query('INSERT INTO plans(id,goal_id,goal_assumptions,plan_hash) VALUES($1,$2,$3::jsonb,$4)',[planId,goalId,JSON.stringify(assumptions),'accepted-plan']);
 await f.query("INSERT INTO work_queue(id,goal_id,plan_id,status,handoff) VALUES($1,$2,$3,'EXECUTED',$4::jsonb)",[queue,goalId,planId,JSON.stringify({hermes:receipt})]);
 await f.query('INSERT INTO executions(id,queue_id,goal_id,plan_id,result,evidence,execution_hash,plan_hash) VALUES($1,$2,$3,$4,$5::jsonb,$6::jsonb,$7,$8)',[executionId,queue,goalId,planId,JSON.stringify(result),JSON.stringify(evidence),'accepted-execution','accepted-plan']);
 const accepted={reportHash:sha256Hex(report),candidateHash:sha256Hex(result.candidate),sourceBindingHash:sha256Hex(f.binding),receiptHash:sha256Hex(receipt)};
 await f.query("INSERT INTO verifications(id,execution_id,execution_hash,plan_hash,independent_evidence,result) VALUES($1,$2,$3,$4,$5::jsonb,'VERIFIED')",[verificationId,executionId,'accepted-execution','accepted-plan',JSON.stringify(accepted)]);
 const input={goalId,planId,executionId,verificationId,expectedResultHash:sha256Hex(result),expectedEvidenceHash:sha256Hex(evidence),expectedObjective:'Synthetic rollback check',expectedPlanAssumptionsHash:sha256Hex(assumptions)};
 const history=async()=>JSON.stringify((await f.query('SELECT * FROM goal_read_reviews ORDER BY id')).rows);
 return {...f,input,result,evidence,history};
}
for(const pin of pins)for(const pre of [true,false])test(`${pin.baseline.slice(0,7)}: exact old/candidate full function, ${pre?'00101':'00101+00106'}`,async()=>{
 const f=await acceptedFixture(pre),old=moduleAt(pin.baseline),candidate=moduleAt(pin.candidate);
 try{
  const db={query:f.query};
  if(!pre)await assert.rejects(()=>old.saveAcceptedFollowupReport(db,f.input),(e:any)=>e.code==='42P10');
  const id=pre?await old.saveAcceptedFollowupReport(db,f.input):await candidate.saveAcceptedFollowupReport(db,f.input);
  const before=await f.history();
  assert.equal(await candidate.saveAcceptedFollowupReport(db,f.input),id);
  assert.equal(await f.history(),before);
  if(!pre){
   await f.query('INSERT INTO goal_read_reviews(goal_id,plan_id,round,decision,report_hash,revision,supersedes_report_id) VALUES($1,$2,1,$3::jsonb,$4,2,$5)',[f.input.goalId,f.input.planId,JSON.stringify({status:'revised'}),'revised-hash',id]);
   // Reverse physical order so an unqualified rows[0] retrieval fails deterministically.
   await f.sql.exec('CREATE INDEX rollback_reverse_revision ON goal_read_reviews(revision DESC); CLUSTER goal_read_reviews USING rollback_reverse_revision');
   const rows=(await f.query('SELECT * FROM goal_read_reviews')).rows;
   assert.equal(rows[0].revision,2);
   const both=await f.history();
   assert.equal(await candidate.saveAcceptedFollowupReport(db,f.input),id);
   assert.equal(await f.history(),both,'Both immutable revisions remain byte-identical');
  }
  const stable=await f.history();
  // Valid changed accepted payload must reach the established report hash conflict.
  const changed=structuredClone(f.result);changed.report.interpretation.summary='Changed accepted summary';
  const changedEvidence={reportHash:sha256Hex(changed.report)};
  await f.query('UPDATE executions SET result=$2::jsonb,evidence=$3::jsonb WHERE id=$1',[f.input.executionId,JSON.stringify(changed),JSON.stringify(changedEvidence)]);
  await f.query("UPDATE verifications SET independent_evidence=jsonb_set(independent_evidence,'{reportHash}',to_jsonb($2::text)) WHERE id=$1",[f.input.verificationId,sha256Hex(changed.report)]);
  await assert.rejects(()=>candidate.saveAcceptedFollowupReport(db,{...f.input,expectedResultHash:sha256Hex(changed),expectedEvidenceHash:sha256Hex(changedEvidence)}),{message:'ANALYSIS_FOLLOWUP_REPORT_CONFLICT'});
  await f.query('UPDATE executions SET result=$2::jsonb,evidence=$3::jsonb WHERE id=$1',[f.input.executionId,JSON.stringify(f.result),JSON.stringify(f.evidence)]);
  await f.query("UPDATE verifications SET independent_evidence=jsonb_set(independent_evidence,'{reportHash}',to_jsonb($2::text)) WHERE id=$1",[f.input.verificationId,sha256Hex(f.result.report)]);
  await f.query('UPDATE goals SET company_scope=$2 WHERE id=$1',[f.input.goalId,OTHER]);
  await assert.rejects(()=>candidate.saveAcceptedFollowupReport(db,f.input),{message:'ANALYSIS_SOURCE_SCOPE_DENIED'});
  await f.query('UPDATE goals SET company_scope=$2 WHERE id=$1',[f.input.goalId,f.entity]);
  await f.query("UPDATE verifications SET independent_evidence=jsonb_set(independent_evidence,'{matches}','false') WHERE id=$1",[f.binding.sourceVerificationId]);
  await assert.rejects(()=>candidate.saveAcceptedFollowupReport(db,f.input),{message:'ANALYSIS_VERIFIED_SOURCE_BINDING_DENIED'});
  assert.equal(await f.history(),stable);
  assert.equal(f.wire.length,0);assert.equal(f.sourceCalls,0);
 }finally{await f.close();}
});
test('new application report then rollback after 00106 preserves every history byte',async()=>{
 const f=await acceptedFixture(false);
 try{
  const db={query:f.query},forward=moduleAt('8a08e6163516f30f37c65313134170744330c4f4');
  const id=await forward.saveAcceptedFollowupReport(db,f.input),before=await f.history();
  for(const pin of pins)assert.equal(await moduleAt(pin.candidate).saveAcceptedFollowupReport(db,f.input),id);
  assert.equal(await f.history(),before);assert.equal(sha256Hex(await f.original()),f.originalHash);
  assert.equal(f.wire.length,0);assert.equal(f.sourceCalls,0);
 }finally{await f.close();}
});

for(const pin of pins)test(`${pin.baseline.slice(0,7)}: candidate first save before00106 then forward and rollback replay`,async()=>{
 const f=await acceptedFixture(true);
 try{
  const db={query:f.query},candidate=moduleAt(pin.candidate);
  const id=await candidate.saveAcceptedFollowupReport(db,f.input),before=(await f.query('SELECT id,decision,report_hash FROM goal_read_reviews')).rows;
  assert.equal(await candidate.saveAcceptedFollowupReport(db,f.input),id);
  await f.sql.exec(await readFile(new URL('../../packages/db/integration-migrations/00106_read_review_revisions.sql',import.meta.url),'utf8'));
  assert.equal(await moduleAt('8a08e6163516f30f37c65313134170744330c4f4').saveAcceptedFollowupReport(db,f.input),id);
  assert.equal(await candidate.saveAcceptedFollowupReport(db,f.input),id);
  assert.deepEqual((await f.query('SELECT id,decision,report_hash FROM goal_read_reviews')).rows,before);
  assert.equal(sha256Hex(await f.original()),f.originalHash);assert.equal(f.wire.length,0);assert.equal(f.sourceCalls,0);
 }finally{await f.close();}
});
