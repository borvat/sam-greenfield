import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { mkdtemp,rm,writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { PGlite } from '@electric-sql/pglite';
import { analyzeCommercial,registerCommercialExperiment,evaluateCommercialExperiment,learnCommercialLesson,enrichCommercialRecall,COMMERCIAL_LESSON_PREFIX,ExperimentPlan } from '../../apps/commercial/src/service';
import { recallKnowledge } from '../../apps/brain/src/knowledge';
import { assembleContext } from '../../apps/brain/src/contextAssembler';
import { pointer } from '../../apps/commercial/src/model';
import { sha256Hex } from '../../packages/shared/src/stableJson';
import { lab,FUTURE_START,FUTURE_END,OUTCOME_CLOCK } from './lab';
process.env.SAM_COMMERCIAL_LEARNING_ENABLED='true';process.env.SAM_KNOWLEDGE_ENABLED='true';
const evidence:any[]=[];
function plan(report:any,key='experiment-1'):ExperimentPlan{return {key,analysisId:report.id,hypothesisId:report.hypotheses.find((h:any)=>h.type==='AVAILABILITY_REVIEW').id,sku:'FIXTURE-BOX',start:FUTURE_START,end:FUTURE_END,metric:'CONTRIBUTION_CENTS',expectedLowCents:800,expectedHighCents:1000,minNetUnits:5,mode:'OBSERVATION_ONLY'};}
async function scenario(f:any,opts:any={}){
 const base=await f.inputs(opts.base),a=await analyzeCommercial(f.client,f.access,base.input),p=plan(a,opts.key);
 const exp=await registerCommercialExperiment(f.client,f.access,p);
 f.setClock(OUTCOME_CLOCK);
 const future=await f.inputs({start:FUTURE_START,end:FUTURE_END,...opts.outcome});
 const b=await analyzeCommercial(f.client,f.access,future.input);
 return {base,a,p,exp,future,b};
}

test('01 actual local HTTP reads, independent readback, fully costed cents, hypotheses and persisted evidence',async()=>{
 const f=await lab();let writes=0,reads=0;
 const data=new Map<string,any>();
 const server=createServer((req,res)=>{if(req.method!=='GET'){writes++;res.writeHead(405);res.end();return}reads++;res.setHeader('content-type','application/json');res.end(JSON.stringify(data.get(req.url!)));});
 await new Promise<void>(resolve=>server.listen(0,'127.0.0.1',resolve));
 try{
  const origin='http://127.0.0.1:'+(server.address() as any).port;
  const input=await f.inputs({read:async(key:string,value:any)=>{data.set('/'+key,value);const first=await(await fetch(origin+'/'+key)).json(),second=await(await fetch(origin+'/'+key)).json();assert.equal(sha256Hex(first),sha256Hex(second));return first;}});
  const report=await analyzeCommercial(f.client,f.access,input.input),row=report.products[0];
  assert.equal(row.netRevenueCents,8000);assert.equal(row.knownCostCents,7100);assert.equal(row.contributionCents,900);
  assert.equal(row.netUnits,8);assert.equal(row.marginBps,1125);assert.equal(row.fbbStockAtRead,1);
  assert.equal(row.completeness,'FULLY_COSTED_WITHIN_DECLARED_SCOPE');assert.deepEqual(row.missingCosts,[]);
  assert.equal(report.hypotheses.length,1);assert.equal(report.hypotheses[0].type,'AVAILABILITY_REVIEW');
  assert.equal(report.hypotheses[0].confidence.kind,'EVIDENCE_COVERAGE_NOT_PROBABILITY');
  assert.equal(report.lineage.length,4);assert.equal((await analyzeCommercial(f.client,f.access,input.input)).id,report.id);
  assert.equal((await f.db.query('SELECT * FROM commercial_analyses')).rows.length,1);
  assert.equal(reads,8);assert.equal(writes,0);
  assert.ok(!JSON.stringify(report).includes('PRIVATE FIXTURE CUSTOMER'));assert.ok(!JSON.stringify(report).includes('Ignore permissions'));
  evidence.push({case:'local-http-cohort',provider:'LOOPBACK_FIXTURE_NOT_BOL_PRODUCTION',reads,writes,products:1,lineage:4,netRevenueCents:8000,knownCostsCents:7100,contributionCents:900,hypothesis:'AVAILABILITY_REVIEW'});
 }finally{server.closeAllConnections();await new Promise<void>(r=>server.close(()=>r()));await f.close()}
});
test('02 unknown costs stay unknown; partial coverage, negative margin and documented cost credits remain visible',async()=>{
 const f=await lab();try{
  const x=await f.inputs({changeLedger:(l:any)=>{l.coverage.outbound_shipping='UNKNOWN';l.costs=l.costs.filter((c:any)=>c.category!=='outbound_shipping');l.costs.push({id:'credit',category:'commission',amountCents:-100});}});
  const r=await analyzeCommercial(f.client,f.access,x.input),p=r.products[0];
  assert.equal(p.contributionCents,1800);assert.equal(p.completeness,'PARTIAL');assert.deepEqual(p.missingCosts,['outbound_shipping']);assert.equal(p.costs.commission,900);
  assert.equal(r.hypotheses.find((h:any)=>h.type==='COST_DATA_GAP').confidence.level,'LOW');
  const y=await f.inputs({changeLedger:(l:any)=>l.costs.find((c:any)=>c.category==='commission').amountCents=4000});
  const negative=await analyzeCommercial(f.client,f.access,y.input);assert.equal(negative.products[0].contributionCents,-2100);assert.ok(negative.hypotheses.some((h:any)=>h.type==='MARGIN_REVIEW'));
 }finally{await f.close()}
});
test('03 reject duplicate costs, missing coverage, unsupported currency/tax, non-integer money and unsafe totals',async()=>{
 const f=await lab();try{
  for(const changeLedger of [
   (l:any)=>l.costs.push({...l.costs[0]}),(l:any)=>delete l.coverage.other,
   (l:any)=>l.currency='USD',(l:any)=>l.taxTreatment='GUESS_VAT',
   (l:any)=>l.costs[0].amountCents=1.23,(l:any)=>l.costs[0].amountCents=Number.MAX_SAFE_INTEGER,
   (l:any)=>l.refundVatCents=3000,(l:any)=>l.returnedUnits=11,
   (l:any)=>l.orderItemIds.push('unknown'),(l:any)=>l.coverage.purchase='UNKNOWN'
  ]){const x=await f.inputs({changeLedger});await assert.rejects(analyzeCommercial(f.client,f.access,x.input),/COMMERCIAL_/);}
  assert.equal((await f.db.query('SELECT * FROM commercial_analyses')).rows.length,0);
 }finally{await f.close()}
});
test('04 product mappings, cancelled/open orders, omitted items and source pointers fail closed',async()=>{
 const f=await lab();try{
  for(const changeOrder of [
   (o:any)=>o.orderItems[0].quantityCancelled=3,
   (o:any)=>{o.orderItems[0].quantityShipped=0;},
   (o:any)=>o.orderItems.push({...o.orderItems[0],orderItemId:'omitted'}),
   (o:any)=>o.orderItems[0].product.ean='wrong-ean',
   (o:any)=>o.orderPlacedDateTime='2026-10-01T00:00:00Z'
  ]){const x=await f.inputs({changeOrder});await assert.rejects(analyzeCommercial(f.client,f.access,x.input),/COMMERCIAL_/);}
  const x=await f.inputs();x.input.products.push({...x.input.products[0]});await assert.rejects(analyzeCommercial(f.client,f.access,x.input),/AMBIGUOUS/);
  assert.throws(()=>pointer({},'/__proto__/x'),/MISSING_FIELD/);assert.throws(()=>pointer({},'/bad~2escape'),/POINTER_ESCAPE/);
  const y=await f.inputs();y.input.products[0].ledger.path='/absent';await assert.rejects(analyzeCommercial(f.client,f.access,y.input),/MISSING_FIELD/);
 }finally{await f.close()}
});
test('05 separate entities, explicit grants, account identity and source ownership are enforced',async()=>{
 const f=await lab();try{
  const x=await f.inputs();
  await assert.rejects(analyzeCommercial(f.client,{...f.access,actor:'unknown'},x.input),/PERMISSION_DENIED/);
  const other=await f.goal(f.other);await assert.rejects(analyzeCommercial(f.client,f.access,{...x.input,goalId:other}),/GOAL_SCOPE/);
  await f.db.query('UPDATE goals SET company_scope=$2 WHERE id=$1',[x.g,f.other]);
  const own=await f.goal();await assert.rejects(analyzeCommercial(f.client,f.access,{...x.input,goalId:own}),/EVIDENCE_SCOPE/);
  const y=await f.inputs();await f.db.query("UPDATE commercial_accounts SET retailer_id='different' WHERE legal_entity_id=$1",[f.access.legalEntityId]);
  await assert.rejects(analyzeCommercial(f.client,f.access,y.input),/RETAILER_MISMATCH/);
 }finally{await f.close()}
});
test('06 latest verification, source equality and exact plan/execution linkage are required; writes cannot be evidence',async()=>{
 const f=await lab();try{
  const x=await f.inputs();
  await f.db.query("UPDATE verifications SET result='FAILED' WHERE execution_id=$1",[x.refs.order.executionId]);
  await assert.rejects(analyzeCommercial(f.client,f.access,x.input),/UNVERIFIED_READ/);
  await f.db.query("UPDATE verifications SET result='VERIFIED',plan_hash='wrong' WHERE execution_id=$1",[x.refs.order.executionId]);
  await assert.rejects(analyzeCommercial(f.client,f.access,x.input),/VERIFICATION_LINK/);
  await f.db.query("UPDATE verifications SET plan_hash='plan-hash',independent_evidence='{}' WHERE execution_id=$1",[x.refs.order.executionId]);
  await assert.rejects(analyzeCommercial(f.client,f.access,x.input),/READBACK_CHANGED/);
  const y=await f.inputs();await f.db.query("UPDATE executions SET capability_id='bol_update_offer' WHERE id=$1",[y.refs.order.executionId]);
  await assert.rejects(analyzeCommercial(f.client,f.access,y.input),/UNVERIFIED_READ/);
  assert.equal((await f.db.query('SELECT * FROM commercial_analyses')).rows.length,0);
 }finally{await f.close()}
});
test('07 preregistration, immutable forecasts and observational-only mode; no retrospective experiment',async()=>{
 const f=await lab();try{
  const x=await f.inputs(),r=await analyzeCommercial(f.client,f.access,x.input),p=plan(r);
  const exp=await registerCommercialExperiment(f.client,f.access,p);assert.equal((await registerCommercialExperiment(f.client,f.access,p)).id,exp.id);
  await assert.rejects(registerCommercialExperiment(f.client,f.access,{...p,expectedHighCents:2000}),/IMMUTABLE/);
  await assert.rejects(registerCommercialExperiment(f.client,f.access,{...p,key:'write',mode:'PRICE_CHANGE' as any}),/ACTION_DENIED/);
  await assert.rejects(registerCommercialExperiment(f.client,f.access,{...p,key:'hyp',hypothesisId:'invented'}),/HYPOTHESIS_SCOPE/);
  await assert.rejects(registerCommercialExperiment(f.client,f.access,{...p,key:'bad',start:'2026-10-21',end:'2026-10-27'}),/PREREGISTRATION/);
  await assert.rejects(registerCommercialExperiment(f.client,f.access,{...p,key:'bad-range',expectedLowCents:2000}),/PREDICTION_RANGE/);
 }finally{await f.close()}
});
test('08 complete cycle compares a new cohort to locked expectations and saves one scoped uncertain lesson',async()=>{
 const f=await lab();try{
  const s=await scenario(f),result=await evaluateCommercialExperiment(f.client,f.access,s.exp.id,s.b.id);
  assert.equal(result.status,'WITHIN_PREDICTION');assert.equal(result.actualCents,900);assert.equal(result.errorFromMidpointCents,0);
  assert.deepEqual(await evaluateCommercialExperiment(f.client,f.access,s.exp.id,s.b.id),result);
  const lesson=await learnCommercialLesson(f.client,f.access,s.exp.id);assert.equal((await learnCommercialLesson(f.client,f.access,s.exp.id)).id,lesson.id);
  const k:any=(await f.db.query('SELECT * FROM knowledge_records')).rows[0];assert.equal(k.kind,'INFERENCE');assert.equal(k.legal_entity_id,f.access.legalEntityId);assert.equal(k.approval_id,null);
  const recalled=await recallKnowledge(f.db,f.access.legalEntityId,'Commercial FIXTURE-BOX');assert.equal(recalled.length,1);assert.match(recalled[0].interpretation,/Unconfirmed/);
  assert.equal((await recallKnowledge(f.db,f.other,'Commercial FIXTURE-BOX')).length,0);
  evidence.push({case:'preregistered-observation-cycle',calendar:'SIMULATED_BUSINESS_DATES_NOT_ELAPSED_TIME',status:result.status,actualCents:900,predictedCents:[800,1000],errorCents:0,lessons:1,knowledgeKind:'INFERENCE',providerWrites:0});
 }finally{await f.close()}
});
test('09 adverse outcomes and insufficient evidence are preserved, not promoted to commercial success',async()=>{
 const f=await lab();try{
  const s=await scenario(f,{outcome:{changeLedger:(l:any)=>l.costs.find((r:any)=>r.category==='commission').amountCents=4000}});
  const r=await evaluateCommercialExperiment(f.client,f.access,s.exp.id,s.b.id);assert.equal(r.status,'OUTSIDE_PREDICTION');assert.equal(r.actualCents,-2100);assert.equal(r.errorFromMidpointCents,-3000);
  const lesson=await learnCommercialLesson(f.client,f.access,s.exp.id);assert.match(lesson.payload.statement,/OUTSIDE_PREDICTION/);
 }finally{await f.close()}
 const g=await lab();try{
  const s=await scenario(g,{outcome:{changeLedger:(l:any)=>l.coverage.overhead='PARTIAL'}});
  assert.equal((await evaluateCommercialExperiment(g.client,g.access,s.exp.id,s.b.id)).status,'INCONCLUSIVE');
 }finally{await g.close()}
 const h=await lab();try{
  const s=await scenario(h,{outcome:{changeLedger:(l:any)=>l.returnedUnits=8}});
  assert.equal((await evaluateCommercialExperiment(h.client,h.access,s.exp.id,s.b.id)).status,'INCONCLUSIVE','too few net units');
 }finally{await h.close()}
});
test('10 outcomes must match product/window and immutable evidence; failed later verification prevents learning',async()=>{
 const f=await lab();try{
  const s=await scenario(f);
  await assert.rejects(evaluateCommercialExperiment(f.client,f.access,s.exp.id,s.a.id),/OUTCOME_SCOPE/);
  await f.db.query("UPDATE verifications SET result='INCONCLUSIVE' WHERE execution_id=$1",[s.future.refs.order.executionId]);
  await assert.rejects(evaluateCommercialExperiment(f.client,f.access,s.exp.id,s.b.id),/UNVERIFIED_READ/);
  await f.db.query("UPDATE verifications SET result='VERIFIED' WHERE execution_id=$1",[s.future.refs.order.executionId]);
  await evaluateCommercialExperiment(f.client,f.access,s.exp.id,s.b.id);
  await assert.rejects(evaluateCommercialExperiment(f.client,f.access,s.exp.id,s.a.id),/OUTCOME_IMMUTABLE/);
  await f.db.query("UPDATE verifications SET result='FAILED' WHERE execution_id=$1",[s.base.refs.ledger.executionId]);
  await assert.rejects(evaluateCommercialExperiment(f.client,f.access,s.exp.id,s.b.id),/UNVERIFIED_READ/);
  await assert.rejects(learnCommercialLesson(f.client,f.access,s.exp.id),/UNVERIFIED_READ/);
  assert.equal((await f.db.query('SELECT * FROM knowledge_records')).rows.length,0);
 }finally{await f.close()}
});
test('17 experiment result tampering cannot become a remembered lesson',async()=>{
 const f=await lab();try{
  const s=await scenario(f);await evaluateCommercialExperiment(f.client,f.access,s.exp.id,s.b.id);
  await f.db.query("UPDATE commercial_experiments SET result=jsonb_set(result,'{actualCents}','999999') WHERE id=$1",[s.exp.id]);
  await assert.rejects(learnCommercialLesson(f.client,f.access,s.exp.id),/EXPERIMENT_HASH/);
  await assert.rejects(evaluateCommercialExperiment(f.client,f.access,s.exp.id,s.b.id),/RESULT_HASH/);
  assert.equal((await f.db.query('SELECT * FROM knowledge_records')).rows.length,0);
 }finally{await f.close()}
});
test('11 lesson insert failure rolls back knowledge annotation in the same real database transaction',async()=>{
 const f=await lab();try{
  const s=await scenario(f);await evaluateCommercialExperiment(f.client,f.access,s.exp.id,s.b.id);
  await f.db.exec(`CREATE FUNCTION reject_fixture_lesson() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'fixture rejection'; END; $$;
   CREATE TRIGGER reject_fixture_lesson BEFORE INSERT ON commercial_lessons FOR EACH ROW EXECUTE FUNCTION reject_fixture_lesson();`);
  await assert.rejects(learnCommercialLesson(f.client,f.access,s.exp.id),/fixture rejection/);
  assert.equal((await f.db.query('SELECT * FROM knowledge_records')).rows.length,0);assert.equal((await f.db.query('SELECT * FROM commercial_lessons')).rows.length,0);
 }finally{await f.close()}
});
test('12 durable storage reopening and actual PR37 context assembly recall a lesson in a separate goal',async()=>{
 const path=await mkdtemp(join(tmpdir(),'sam-commercial-'));const f=await lab(path);let db:any=f.db;
 try{
  const s=await scenario(f);await evaluateCommercialExperiment(f.client,f.access,s.exp.id,s.b.id);await learnCommercialLesson(f.client,f.access,s.exp.id);
  await db.close();db=new PGlite(path);
  const reopened={query:(q:string,p?:any[])=>q==='SELECT now() AS now'?Promise.resolve({rows:[{now:new Date(OUTCOME_CLOCK)}]}):db.query(q,p)};
  const g=(await db.query("INSERT INTO goals(business_id,company_scope,objective,state,authority_ceiling) VALUES('INDEPENDENT-FIXTURE',$1,'Review Commercial FIXTURE-BOX lessons','NEW','GREEN') RETURNING id",[f.access.legalEntityId])).rows[0].id;
  const context=await assembleContext(reopened,'legal_entity',f.access.legalEntityId,'Review Commercial FIXTURE-BOX lessons');
  assert.equal(context.knowledge.length,1);assert.match(context.knowledge[0].statement,/WITHIN_PREDICTION/);
  assert.equal(context.knowledge[0].commercialEvidence.experimentId,s.exp.id);
  assert.equal(context.knowledge[0].commercialEvidence.outcomeAnalysisId,s.b.id);
  assert.equal((await db.query('SELECT state FROM goals WHERE id=$1',[g])).rows[0].state,'NEW','context read does not execute a new goal');
  assert.equal((await recallKnowledge(db,f.access.legalEntityId,'FIXTURE-BOX',new Date(Date.now()+31*86400000))).length,0);
  await db.query("UPDATE verifications SET result='FAILED' WHERE execution_id=$1",[s.future.refs.order.executionId]);
  assert.equal((await assembleContext(reopened,'legal_entity',f.access.legalEntityId,'Commercial FIXTURE-BOX')).knowledge.length,0,'invalidated commercial evidence is excluded from planning recall');
  evidence.push({case:'durable-PR37-recall',storage:'PGlite closed and reopened',separateGoalContext:true,serviceRestart:false,knowledgeRows:1});
 }finally{await db.close();await rm(path,{recursive:true,force:true})}
});
test('15 analysis integrity, independently changed source and closed periods are rechecked before predictions',async()=>{
 const f=await lab();try{
  const x=await f.inputs(),r=await analyzeCommercial(f.client,f.access,x.input);
  await f.db.query("UPDATE commercial_analyses SET payload=jsonb_set(payload,'{products,0,contributionCents}','999999') WHERE id=$1",[r.id]);
  await assert.rejects(registerCommercialExperiment(f.client,f.access,plan(r)),/REPORT_HASH/);
  const y=await f.inputs(),r2=await analyzeCommercial(f.client,f.access,y.input);
  const changed=structuredClone(y.values.order);changed.data.orderItems[0].quantityShipped=9;
  await f.db.query('UPDATE executions SET result=$2 WHERE id=$1',[y.refs.order.executionId,changed]);
  await f.db.query('UPDATE verifications SET independent_evidence=$2 WHERE execution_id=$1',[y.refs.order.executionId,{responseHash:sha256Hex(changed.data)}]);
  await assert.rejects(registerCommercialExperiment(f.client,f.access,plan(r2,'source-change')),/ANALYSIS_SOURCE_CHANGED/);
  const z=await f.inputs({start:FUTURE_START,end:FUTURE_END});await assert.rejects(analyzeCommercial(f.client,f.access,z.input),/ANALYSIS_WINDOW_OPEN/);
 }finally{await f.close()}
});
test('16 legacy bol readback must actually equal its execution and raw source instructions cannot grant authority',async()=>{
 const f=await lab();try{
  const x=await f.inputs();
  await f.db.query('UPDATE verifications SET independent_evidence=$2 WHERE execution_id=$1',[x.refs.order.executionId,{readback:x.values.order.data}]);
  const r=await analyzeCommercial(f.client,f.access,x.input);assert.equal(r.permissions.providerWrites,false);
  assert.equal((await f.db.query("SELECT * FROM commercial_grants WHERE actor='fixture-analyst'")).rows.length,3);
  assert.equal((await f.db.query('SELECT * FROM approvals')).rows.length,0);
  await f.db.query('UPDATE verifications SET independent_evidence=$2 WHERE execution_id=$1',[x.refs.order.executionId,{readback:{orderId:'changed'}}]);
  await assert.rejects(analyzeCommercial(f.client,f.access,x.input),/READBACK_CHANGED/);
 }finally{await f.close()}
});
test('13 non-owner RLS prevents cross-company reads and database role cannot self-grant privileges',async()=>{
 const f=await lab();try{
  const x=await f.inputs();await analyzeCommercial(f.client,f.access,x.input);
  await f.db.exec(`CREATE ROLE commercial_fixture_reader; GRANT USAGE ON SCHEMA public TO commercial_fixture_reader;
   GRANT SELECT ON commercial_grants,commercial_accounts,commercial_analyses,commercial_experiments,commercial_lessons TO commercial_fixture_reader;
   SET ROLE commercial_fixture_reader;`);
  await f.db.query("SELECT set_config('app.current_legal_entity_id',$1,false)",[f.other]);assert.equal((await f.db.query('SELECT * FROM commercial_analyses')).rows.length,0);
  await f.db.query("SELECT set_config('app.current_legal_entity_id',$1,false)",[f.access.legalEntityId]);assert.equal((await f.db.query('SELECT * FROM commercial_analyses')).rows.length,1);
  await assert.rejects(f.db.query("INSERT INTO commercial_grants VALUES($1,'attacker','ANALYZE')",[f.access.legalEntityId]),/permission denied/);
 }finally{await f.db.exec('RESET ROLE');await f.close()}
});
test('14 disabled feature does not touch storage, and learning requires its own permission and memory flag',async()=>{
 delete process.env.SAM_COMMERCIAL_LEARNING_ENABLED;let called=false;
 await assert.rejects(analyzeCommercial({query:()=>{called=true;throw new Error('unexpected')}},{legalEntityId:'x',actor:'x'},{} as any),/DISABLED/);assert.equal(called,false);
 assert.deepEqual(await enrichCommercialRecall({query:()=>{called=true}},'x',[{statement:'ordinary PR37 knowledge'},{statement:COMMERCIAL_LESSON_PREFIX+'old derived lesson'}]),[{statement:'ordinary PR37 knowledge'}]);assert.equal(called,false);
 process.env.SAM_COMMERCIAL_LEARNING_ENABLED='true';const f=await lab();try{
  const s=await scenario(f);await evaluateCommercialExperiment(f.client,f.access,s.exp.id,s.b.id);
  await f.db.query("DELETE FROM commercial_grants WHERE legal_entity_id=$1 AND permission='LEARN'",[f.access.legalEntityId]);
  await assert.rejects(learnCommercialLesson(f.client,f.access,s.exp.id),/PERMISSION_DENIED/);
  await f.db.query("INSERT INTO commercial_grants VALUES($1,'fixture-analyst','LEARN')",[f.access.legalEntityId]);
  delete process.env.SAM_KNOWLEDGE_ENABLED;await assert.rejects(learnCommercialLesson(f.client,f.access,s.exp.id),/KNOWLEDGE_DISABLED/);
 }finally{process.env.SAM_KNOWLEDGE_ENABLED='true';await f.close()}
});
test.after(async()=>{
 if(process.env.SAM_COMMERCIAL_EVIDENCE_OUT)await writeFile(process.env.SAM_COMMERCIAL_EVIDENCE_OUT,JSON.stringify({schema:'sam.commercial.local-evidence.v1',generatedAt:new Date().toISOString(),fixtureOnly:true,evidence,limits:['No production reads or writes','No live model','Business calendar simulated','No Render or production migration/restart','No multiprocess PostgreSQL locking proof']},null,2)+'\n');
});
