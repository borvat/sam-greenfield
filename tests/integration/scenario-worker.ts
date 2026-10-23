// Model and upstream responses are deterministic TEST DOUBLES. The planner,
// ModelGateway, queue, specialist handoffs, verifier, report and DB are REAL.
import assert from 'node:assert/strict';
import {pool} from '../../packages/db/src/client';
import {validateProductionBundle} from '../../apps/production/src/bundle';
import {createIntegrationComposition} from '../../apps/integration/src/composition';
import {recallKnowledge} from '../../apps/brain/src/knowledge';
import {observeAndEnterPlanning} from '../../apps/kernel/src/orchestrator';
import {discoverResearchMcpCapabilities} from '../../apps/tools/src/mcpResearchAdapter';
import {scopedCatalog} from '../../apps/perception/src/policy';
import {runPerceptionTick} from '../../apps/perception/src/monitor';
import {runOwnerNotificationTick} from '../../apps/notifications/src/center';
import {persistPlanAndDelegateAtomic} from '../../apps/kernel/src/planning';
import {runOneSpecialistWork} from '../../apps/agents/src/runtime';
import {createToolExecutors} from '../../apps/tools/src/executorFactory';
import {verifyNextExecution} from '../../apps/production/src/verifier';
import {assertIntegrationAccess} from '../../packages/db/src/integrationProfile';
const entity=process.env.FIXTURE_ENTITY!,goalId=process.env.FIXTURE_GOAL!;
const one=async(sql:string,v:any[]=[])=> (await pool.query(sql,v)).rows[0];
async function main(){
 if(process.argv[2]==='admission-denied'){
  const c=await pool.connect();try{await assert.rejects(()=>assertIntegrationAccess(c),/FIXED_POLICY_REQUIRED/);}finally{c.release();}
  console.log('PASS missing immutable feature policy refuses integration admission');return;
 }
 if(process.argv[2]==='recall'||process.argv[2]==='revoked'){
  const knowledge=await recallKnowledge(pool,entity,'FixtureBox');
  assert.equal(knowledge.length,process.argv[2]==='revoked'?0:2);
  if(process.argv[2]==='recall'){
   assert.equal((await pool.query('SELECT * FROM knowledge_records')).rowCount,2);
   assert.equal((await pool.query("SELECT * FROM owner_notifications WHERE title='Foreign fixture'")).rowCount,0);
   const c=await pool.connect();try{
    await c.query("SELECT set_config('app.current_legal_entity_id',$1,false)",[process.env.FIXTURE_FOREIGN]);
    assert.equal((await c.query('SELECT * FROM knowledge_records')).rowCount,0);assert.equal((await c.query('SELECT * FROM owner_notifications')).rowCount,0);
    await c.query("SELECT set_config('app.current_legal_entity_id',$1,false)",[entity]);
   }finally{c.release();}
  }
  assert.equal((await one('SELECT state FROM goals WHERE id=$1',[goalId])).state,'COMPLETED');
  assert.equal((await one("SELECT count(*)::int n FROM owner_notifications WHERE goal_id=$1 AND status='UNROUTED'",[goalId])).n,1);
  console.log('PASS cold-process',process.argv[2],'durable goal/report/knowledge/UNROUTED notification; revocation fails closed');return;
 }
 let fault=true,initial=0,replans=0,reviews=0,critiques=0;
 const terms={content:[{type:'text',text:'FixtureBox supplier price EUR 23; lead time 4 days.'}],structuredContent:{price:23}};
 const remote={listTools:async()=>({tools:[{name:'terms',inputSchema:{type:'object',properties:{},additionalProperties:false}}]}),callTool:async()=>{
  if(fault){fault=false;throw Error('SYNTHETIC_TRANSIENT_SPECIALIST_FAILURE');}return terms;
 }};
 const discovered=await discoverResearchMcpCapabilities({serverId:'fixture',client:remote,allowedReadTools:['terms'],specialistAgentId:'source-researcher'});
 const readId=discovered.capabilities[0].capabilityId,analysis='decision_summarize';
 const researchPlan={questions:[{id:'cost',question:'What is the source cost?',evidenceNeeded:['supplier terms'],sourceKinds:['synthetic-primary']},
  {id:'decision',question:'What does independently verified analysis conclude?',evidenceNeeded:['verified calculation'],sourceKinds:['synthetic-analysis']}],maxIterations:3,maxSources:8,maxElapsedSeconds:60,maxToolCalls:10,maxCostUsd:0.01,stopConditions:['both deliverables verified']};
 const adapter={providerId:'integration-fixture',async invoke(task:any){
  const input=task.input;
  if(input.proposedReport){critiques++;return {model:'fixture',usage:{inputTokens:1,outputTokens:1},output:{accepted:true,missing:[]}};}
  if(input.verifiedObservations){
   reviews++;const observations=input.verifiedObservations;
   assert(observations.length===2);assert(observations.every((s:any)=>s.trustBoundary));
   return {model:'fixture',usage:{inputTokens:1,outputTokens:1},output:{status:'complete',summary:'FixtureBox: source price EUR 23; verified analysis agrees. A failed analysis was replanned and a specialist retry recovered. Synthetic evidence only.',
    requirements:[{requirement:'Source terms and consolidated decision',fulfilled:true,evidenceIds:observations.map((s:any)=>s.id)}],
    findings:observations.map((s:any)=>{
     const detail=s.lines.findIndex((line:string)=>line.includes('"sku"'));
     const quoteLine=detail>=0?detail:0;
     assert(s.citableLines.includes(quoteLine));
     if(detail>=0){assert(s.sourceTruncated);const wrapper=s.lines.findIndex((line:string)=>line.includes('"items"'));assert(wrapper>=0&&!s.citableLines.includes(wrapper));}
     return {text:s.lines[quoteLine],executionId:s.id,quoteLine,confidence:'MEDIUM',confidenceBasis:'Synthetic independently reread source; no real market evidence'};
    }),
    limitations:['Model/critic responses are fixtures; specialist executors do not perform independent reasoning.'],contradictions:[],steps:[]}};
  }
  assert.match(input.objective,/FixtureBox/);assert(input.capabilities.some((d:any)=>d.capabilityId===readId));
  const recovering=Boolean(input.context.previousPlan);
  if(recovering){replans++;assert(input.context.executionEvidence.some((e:any)=>e.verification_result==='FAILED'));}
  else initial++;
  const steps=recovering?[{stepKey:'terms',capabilityId:readId,params:{}},
   {stepKey:'decision',capabilityId:analysis,dependsOn:['terms'],resultRefs:{value:{step:'terms',path:['structuredContent','price'],type:'number'}}}]:
   [{stepKey:'initial',capabilityId:analysis,params:{value:1}}];
  return {model:'fixture',usage:{inputTokens:1,outputTokens:1},output:{assumptions:{research_plan:researchPlan},steps}};
 }};
 const capabilities=[...discovered.capabilities,{capabilityId:analysis,authorityClass:'GREEN' as const,specialistAgentId:'decision-analyst',specialistVersion:'1',sideEffect:false,parameters:{type:'object',properties:{value:{type:'number'}},required:['value'],additionalProperties:false}}].map(d=>({...d,companyScopes:[entity]}));
 const tools=[...discovered.toolDefinitions,{capabilityId:analysis,authorityClass:'GREEN' as const,sideEffect:false}].map(d=>({...d,companyScopes:[entity]}));
 const bundle=validateProductionBundle({capabilities,toolDefinitions:tools,
  toolAdapters:[...discovered.toolAdapters,{capabilityId:analysis,async execute(r){const result={value:r.params.value,report:{products:Array.from({length:90},(_,i)=>({sku:'FixtureBox-'+i,description:'detail '.repeat(15),quantity:2}))}};assert(JSON.stringify(result,null,2).length>16000&&JSON.stringify(result,null,2).length<22000);return {result,evidence:{readback:true}};}}],
  verificationAdapters:[...discovered.verificationAdapters,{capabilityId:analysis,async verify(r){return {result:r.execution.result?.value===terms.structuredContent.price?'VERIFIED' as const:'FAILED' as const,evidence:{readback:true,value:terms.structuredContent.price},verifier:'synthetic-independent-price-query'};} }],
  modelAdapters:[adapter],modelProviderConfigs:[{providerId:adapter.providerId,models:['fixture'],capabilities:['planning'],privacyClasses:['INTERNAL'],health:'HEALTHY',costPer1kInput:0,costPer1kOutput:0}],workerLeaseTtlSeconds:1});
 const composition=await createIntegrationComposition({bundle,workerId:'integration-acceptance'});
 await assert.rejects(()=>createIntegrationComposition({bundle:validateProductionBundle({...bundle.raw,
  toolDefinitions:tools.map(d=>({...d,sideEffect:true}))}),workerId:'must-refuse'}),/READ_ONLY_PROFILE/);
 await assert.rejects(()=>createIntegrationComposition({bundle:validateProductionBundle({...bundle.raw,
  toolDefinitions:tools.map(d=>({...d,companyScopes:[process.env.FIXTURE_FOREIGN!]}))}),workerId:'must-refuse'}),/PROVIDER_BINDING/);
 const started=Date.now();
 while(Date.now()-started<20000){
  await composition.runWorkTick();
  if((await one('SELECT state FROM goals WHERE id=$1',[goalId])).state==='COMPLETED')break;
  await new Promise(r=>setTimeout(r,100));
 }
 assert.equal((await one('SELECT state FROM goals WHERE id=$1',[goalId])).state,'COMPLETED');
 assert.equal(initial,1);assert.equal(replans,1);assert.equal(reviews,1);assert.equal(critiques,1);
 const rows=(await pool.query('SELECT * FROM goal_read_reviews WHERE goal_id=$1',[goalId])).rows;assert.equal(rows.length,1);
 const report=rows[0].decision;assert.equal(report.findings.length,2);
 const detail=report.findings.find((f:any)=>f.quote.includes('\"sku\"'));assert(detail,'projected detail citation persisted');assert.equal(detail.quote,detail.quote.trim());
 assert.equal((await one('SELECT count(*)::int n FROM knowledge_records WHERE statement=$1',[detail.quote])).n,1,'literal nested detail survives knowledge capture under restricted runtime');
 assert.equal((await one('SELECT count(*)::int n FROM knowledge_records')).n,2);
 const hands=(await pool.query('SELECT handoff,status,attempt FROM work_queue WHERE goal_id=$1',[goalId])).rows;
 assert(hands.some(w=>Number(w.attempt)>=2),'durable lease retry after transient specialist failure');
 assert(hands.some(w=>w.handoff.agent_id==='source-researcher'));assert(hands.some(w=>w.handoff.agent_id==='decision-analyst'));
 assert.equal((await one('SELECT count(*)::int n FROM side_effect_operations')).n,0);
 assert.equal((await one("SELECT count(*)::int n FROM perception_observations WHERE classification='BASELINE'")).n,1);
 // A second synthetic source version passes through the real queue/executor/
 // verifier before it can become a perception change or an internal notification.
 terms.structuredContent.price=24;terms.content[0].text='FixtureBox supplier price EUR 24; lead time 4 days.';
 const changed=(await one(`INSERT INTO goals(business_id,company_scope,objective,state,authority_ceiling,domain)
  VALUES(next_business_id('goal',NULL),$1,'Synthetic monitor reading','PLANNING','GREEN','sam_perception') RETURNING id`,[entity])).id;
 await persistPlanAndDelegateAtomic({goalId:changed,steps:[{capabilityId:readId,params:{}}]});
 await pool.query('INSERT INTO perception_polls(source_id,goal_id) VALUES($1,$2)',[process.env.FIXTURE_SOURCE,changed]);
 await runOneSpecialistWork({agent:bundle.catalog.specialists.getAgent('source-researcher'),workerInstanceId:'changed-source',ttlSeconds:5,executors:createToolExecutors({catalog:bundle.catalog,tools:bundle.tools})});
 await verifyNextExecution(bundle);await runPerceptionTick(bundle);
 assert.equal((await one("SELECT count(*)::int n FROM perception_observations WHERE classification='CHANGED'")).n,1);
 const before=await pool.query('SELECT id,status FROM outbox_events ORDER BY id');
 assert(!('errorCode' in await runOwnerNotificationTick()));
 assert.deepEqual((await pool.query('SELECT id,status FROM outbox_events ORDER BY id')).rows,before.rows);
 assert.equal((await one("SELECT count(*)::int n FROM owner_notifications WHERE body->>'requiredAction'='REVIEW_OBSERVATION' AND status='UNROUTED'")).n,1);
 assert.equal((await runOwnerNotificationTick()).created,0);
 const foreign=process.env.FIXTURE_FOREIGN!;assert.equal((await pool.query('SELECT * FROM goals WHERE company_scope=$1',[foreign])).rowCount,0);

 // pool sessions must keep their explicit URL-bound tenant; use a dedicated connection for spoofing proof.
 const client=await pool.connect();try{
  await client.query("SELECT set_config('app.current_legal_entity_id',$1,false)",[foreign]);assert.equal((await client.query('SELECT * FROM goals')).rowCount,0);
  await client.query("SELECT set_config('app.current_legal_entity_id','',false)");assert.equal((await client.query('SELECT * FROM owner_notifications')).rowCount,0);
  await client.query("SELECT set_config('app.current_legal_entity_id',$1,false)",[entity]);
  await assert.rejects(()=>client.query('SELECT * FROM sam_google_oauth_tokens'),/permission denied/);
  await assert.rejects(()=>client.query('UPDATE entity_capability_bindings SET allow_side_effect=true'),/permission denied/);
  await assert.rejects(()=>client.query('SELECT * FROM notification_delivery_attempts'),/permission denied/);
 }finally{client.release();}
 const next=(await one("INSERT INTO goals(business_id,company_scope,objective,state,authority_ceiling) VALUES(next_business_id('goal',NULL),$1,'FixtureBox follow-up','NEW','GREEN') RETURNING id",[entity])).id;
 const context=await observeAndEnterPlanning(next);assert.equal(context.knowledge?.length,2);
 console.log(JSON.stringify({test:'MULTI_AGENT_ORCHESTRATION',status:'PASS',initialPlans:initial,revisedPlans:replans,reportReviews:reviews,critiqueCalls:critiques,
  specialists:['source-researcher','decision-analyst'],reportCount:rows.length,verifiedKnowledge:2,liveModelCalls:0,liveProviderRequests:0,
  modelUnderstanding:'UNVERIFIED_MOCK_MODEL',independentSpecialistReasoning:'NOT_IMPLEMENTED',classification:'REAL_KERNEL_ORCHESTRATION_WITH_SYNTHETIC_MODEL_AND_SOURCE_FIXTURES'}));
}
main().then(()=>pool.end()).catch(async e=>{console.error(e);await pool.end();process.exitCode=1;});
