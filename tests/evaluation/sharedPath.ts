import {evidenceFamily} from '../../apps/brain/src/evidence/delegationScope';
import {fixtureDiagnostics} from './fixtureDiagnostics';
import {writeFileSync} from 'node:fs';
import {join} from 'node:path';
import {sealGoalFamilyEvaluation} from '../../apps/agents/src/evaluation/goalFamilyCapture';
import {exportEvaluationTrace} from '../../apps/agents/src/evaluation/capture';
import {scoreAuthenticatedEvaluation,verifyEvaluationTrace} from '../../apps/agents/src/evaluation/trace';
import {applySharedGoalProfile} from '../../packages/db/src/sharedGoalProfile';
import assert from 'node:assert/strict';
import {randomUUID,generateKeyPairSync} from 'node:crypto';
import {spawn,spawnSync,execFileSync} from 'node:child_process';
import {pool} from '../../packages/db/src/client';
import {applyIntegrationProfile,provisionIntegrationAccess} from '../../packages/db/src/integrationProfile';
import {applySpecialistProfile,provisionSpecialistAccess} from '../../packages/db/src/specialistProfile';
import {applyEvaluationProfile,provisionEvaluationAccess,enrollEvaluationCompany} from '../../packages/db/src/evaluationProfile';
import {createEvaluationTrial,openEvaluationTrial,type TrialSpec} from '../../apps/agents/src/evaluation/trial';
import {ceiling} from '../../apps/agents/src/intelligence/contracts';
import {sharedCorpus,sharedCorpusHash} from '../../apps/agents/src/evaluation/sharedCorpus';
import {fixtureEvaluationAdapter} from '../../packages/model-gateway/src/evaluationAdapter';
import {evaluationBundleHash} from '../../apps/production/src/goalEvaluationBundle';
import {prepareBoundedEvaluationComposition} from '../../apps/production/src/boundedEvaluationBootstrap';
import {startRuntimeService} from '../../apps/runtime/src/service';
import {fixtureBundle} from './sharedFixture';
const objectives=['Compare January and February supplied ledger amounts in net EUR, with citations and limits.','Compare supplier promises against delivery dates for the supplied delivery records.','Inventory duplicate supplied documents by content hash without deleting anything.'];
const info=(objective:string)=>objective===objectives[0]?{query:'ledger',field:'total',units:'EUR',vat:'net'}:objective===objectives[1]?{query:'delivery',field:'delay',units:'calendar_day',vat:'UNKNOWN'}:{query:'document',field:'count',units:'count',vat:'UNKNOWN'};
async function worker(){
 fixtureDiagnostics('SHARED');
 const t=await openEvaluationTrial(process.env.FIXTURE_TRIAL!);let calls=0;
 console.log('SHARED_WORKER_TRIAL_OPEN');
 const adapter=fixtureEvaluationAdapter('eval-shared',async(task:any)=>{
  calls++;const input=JSON.parse(task.messages[1].content),objective=input.objective,{query,field,units,vat}=info(objective);
  let output:any;
  if(input.agent){
   const evidence=input.verifiedContext.evidence,derived=evidence.find((e:any)=>e.capabilityId==='derive_verified_evidence'),reads=evidence.filter((e:any)=>e.capabilityId==='records.search');
   const dispatch=(capabilityId:string,params:any)=>({action:'dispatch',understanding:objective,plan:['Collect requested records','Derive and verify','Cite bounded findings'],reason:'Resolve remaining evidence',tasks:[{capabilityId,objective,params}]});
   if(!reads.length)output=dispatch('records.search',{query});
   else if(reads.at(-1).result.next)output=dispatch('records.search',{query,cursor:reads.at(-1).result.next});
   else if(!derived){
    const sources=Object.fromEntries(reads.map((e:any,i:number)=>['s'+i,{executionId:e.id,contractId:'fixture-records-v1'}]));
    const operations:any[]=reads.slice(1).map((_:any,i:number)=>({op:'union',right:'s'+(i+1)}));
    operations.push(...(query==='ledger'?[{op:'group',keys:['period'],aggregates:[{fn:'sum',field:'amount',as:'total'}]}]:query==='delivery'?[{op:'derive',as:'delay',left:'delivered',right:'promised',operator:'subtract'},{op:'select',fields:{supplier:'supplier',promised:'promised',delivered:'delivered',delay:'delay'}}]:[{op:'group',keys:['digest'],aggregates:[{fn:'count',as:'count'}]}]));
    // Adversarial decision fixture: the same engine must recover from a rejected
    // transform using its verified records, without replaying source reads.
    if(query==='ledger'&&!input.verifiedContext.tasks.some((task:any)=>['FAILED','REPLANNING'].includes(task.state)))operations[0].aggregates[0].field='unobserved';
    output=dispatch('derive_verified_evidence',{sources,plan:{version:1,source:'s0',operations}});
   }else {const value=derived.result.derivedEvidence.output.dataset.rows[0].values[field];output={action:'report',understanding:objective,plan:['Cite verified derivation'],summary:'Bounded fixture comparison',claims:[{topic:field,value,path:['derivedEvidence','output','dataset','rows','0','values',field],evidenceIds:[derived.id]}],uncertainties:['Synthetic source coverage only'],completionCriteria:['Requested records accounted for']};}
  }else if(input.proposedReport)output={accepted:true,missing:[]};
  else if(input.verifiedObservations){
   const source=input.verifiedObservations.find((s:any)=>s.derivedEvidence);assert(source,'shared review must see descendant derivation');
   const quoteLines=source.citableLines.filter((i:number)=>{try{return JSON.parse(source.lines[i]).field===field;}catch{return false;}});assert(quoteLines.length>0);
   const findings=quoteLines.map((quoteLine:number)=>{const cell=JSON.parse(source.lines[quoteLine]);return {text:'Derived '+field+' = '+cell.value,executionId:source.id,quoteLine,derivedClaim:{row:cell.row,field,value:cell.value}};});const raw=input.verifiedObservations.find((s:any)=>s.capabilityId==='records.search');const rawLine=raw.citableLines.find((i:number)=>raw.lines[i].includes('\"id\"'));assert.notEqual(rawLine,undefined);findings.push({text:'Verified source identity',executionId:raw.id,quoteLine:rawLine} as any);output={status:'complete',summary:'Requested bounded fixture analysis',requirements:[{obligationId:'analysis',requirement:objective,fulfilled:true,evidenceIds:[source.id]}],findings,limitations:['Synthetic fixtures, not live evidence'],steps:[]};
  }else output={assumptions:{goalObligations:{version:1,deliverables:[{id:'analysis',description:objective,fields:[field],scope:{kind:'population',filter:query,query:{capabilityId:'records.search',params:{query}}},units,vat,period:'UNKNOWN',timeZone:'UTC'}],unresolved:[]}},steps:[{capabilityId:'reason.records',params:{objective}}]};
  return {model:'fixture',usage:{inputTokens:5,outputTokens:20},output};
 });
 const composition=await prepareBoundedEvaluationComposition({sourceBundle:fixtureBundle(t.spec.companyId,adapter),trial:t,expectedCommit:t.spec.commit,workerId:'shared-fixture'});
 console.log('SHARED_COMPOSITION_PREPARED');
 let ticks=0,done=false,failure:unknown;
 const service=await startRuntimeService({port:0,host:'127.0.0.1',tickIntervalMs:10,composition:{...composition,async runWorkTick(){
  if(done)return {processed:false};
  try{const outcome=await composition.runWorkTick();ticks++;
   const rows=(await pool.query('SELECT id,state FROM goals WHERE parent_goal_id=$1',[t.rootGoalId])).rows;
   if(ticks<=3||ticks%10===0)console.log('SHARED_WORKER_PROGRESS',JSON.stringify({ticks,states:rows.map(g=>g.state)}));
   done=rows.every(g=>['COMPLETED','FAILED','WAITING_EXTERNAL','BLOCKED'].includes(g.state));
   if(process.argv[2]==='crash'&&ticks===12){console.log('SHARED_RESTART_BARRIER');await new Promise(()=>{});}
   if(ticks>160)throw Error('FIXTURE_TICK_LIMIT');return outcome;
  }catch(error){failure=error;done=true;throw error;}
 }}});
 console.log('SHARED_SERVICE_STARTED');
 try{const deadline=Date.now()+140000;while(!done&&Date.now()<deadline)await new Promise(r=>setTimeout(r,25));assert(done,'Shared service timed out');if(failure)throw failure;}
 finally{await service.stop();}
 const rows=(await pool.query('SELECT id,state FROM goals WHERE parent_goal_id=$1',[t.rootGoalId])).rows;if(!rows.every(g=>g.state==='COMPLETED'))console.error('FINAL_REPORT_DIAGNOSTIC',JSON.stringify((await pool.query("SELECT goal_id,decision->>'status' status,decision->'limitations' limitations FROM goal_read_reviews")).rows));assert(rows.every(g=>g.state==='COMPLETED'),JSON.stringify(rows));const usage=(await pool.query('SELECT used FROM evaluation_trials WHERE id=$1',[t.id])).rows[0].used;assert(usage.models<=24);assert.equal(usage.models,usage.iterations);assert.equal(usage.tools,18);assert.equal((await pool.query('SELECT count(*)::int n FROM executions')).rows[0].n,10);assert(calls<=24);console.log('PASS shared actual composition three fixture goals; model quality NOT evaluated');
}
async function parent(){const c=await pool.connect(),role='sam_shared_'+process.pid;let made=false;try{
 await applyIntegrationProfile(c);await applySpecialistProfile(c);await applyEvaluationProfile(c);await applySharedGoalProfile(c);
 const schema=(await c.query('SELECT current_schema() s')).rows[0].s,org=randomUUID(),entity=randomUUID();
 await c.query("INSERT INTO organizations(id,name) VALUES($1,'Shared fixtures')",[org]);await c.query("INSERT INTO legal_entities(id,org_id,name) VALUES($1,$2,'Shared fixtures')",[entity,org]);await enrollEvaluationCompany(c,entity);
 await c.query(`CREATE ROLE ${role} LOGIN PASSWORD 'shared-fixture-only' NOSUPERUSER NOCREATEDB NOCREATEROLE NOBYPASSRLS`);made=true;
 await c.query('BEGIN');await provisionIntegrationAccess(c,{schema,role,orgId:org,legalEntityId:entity});await provisionSpecialistAccess(c,{schema,role,orgId:org,legalEntityId:entity});await provisionEvaluationAccess(c,{schema,role,orgId:org,legalEntityId:entity});await c.query('COMMIT');
 await c.query(`INSERT INTO model_providers(provider_id,models,capabilities,privacy_class_allowed,health,cost_per_1k_input,cost_per_1k_output) VALUES('eval-shared','["fixture"]','["planning","specialist_reasoning"]','["INTERNAL"]','HEALTHY',0.001,0.001)`);
 for(const [id,fields] of [['records.search',{readback:'boolean'}],['derive_verified_evidence',{replayed:'boolean'}],['reason.records',{grounded:'boolean'}]] as const)await c.query("INSERT INTO verification_contracts(capability_id,description,verification_method,required_evidence_fields,independent_query_template) VALUES($1,'Fixture verification','db_query',$2,'{}')",[id,fields]);
 const root=(await c.query("INSERT INTO goals(business_id,company_scope,objective,state,authority_ceiling) VALUES($1,$2,'Shared fixture coordinator','NEW','GREEN') RETURNING id",[randomUUID(),entity])).rows[0].id;
 const ids:string[]=[];for(const objective of objectives)ids.push((await c.query("INSERT INTO goals(business_id,company_scope,parent_goal_id,objective,state,authority_ceiling,completion_definition) VALUES($1,$2,$3,$4,'NEW','GREEN','sam.read_report.v1') RETURNING id",[randomUUID(),entity,root,objective])).rows[0].id);
 const limits={...ceiling,models:24,maxOutputTokens:4000,tokens:672000};const spec:TrialSpec={version:1,mode:'fixture',syntheticOnly:true,commit:process.env.SAM_VERIFICATION_SOURCE_SHA??execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),caseId:sharedCorpus.id,corpusHash:sharedCorpusHash(),companyId:entity,rootCapabilityId:'reason.records',limits,agents:{'executive-bootstrap':{...limits,models:0},...Object.fromEntries(ids.map(id=>['goal.'+id,{...limits,models:8}]))},prices:[{providerId:'eval-shared',model:'fixture',inputPer1k:0.001,outputPer1k:0.001}],capabilityHash:evaluationBundleHash(fixtureBundle(entity))};
 const trial=await createEvaluationTrial(c,{rootGoalId:root,spec});
 const target=new URL(process.env.DATABASE_URL!);target.username=role;target.password='shared-fixture-only';target.searchParams.set('options',`-c search_path=${schema},public -c app.current_org_id=${org} -c app.current_legal_entity_id=${entity} -c jit=off`);
 const env={PATH:process.env.PATH,DATABASE_URL:target.href,FIXTURE_TRIAL:trial,SAM_SPECIALIST_INTELLIGENCE:'synthetic',SAM_INTEGRATION_ENABLED:'1',SAM_KNOWLEDGE_ENABLED:'true'};
 const child=spawn(process.execPath,['--import','tsx','tests/evaluation/sharedPath.ts','crash'],{env,stdio:['ignore','pipe','pipe']});let log='';child.stdout.on('data',b=>log+=b);child.stderr.on('data',b=>log+=b);
 const closed=new Promise(r=>child.once('close',r));
 const started=Date.now();while(!log.includes('SHARED_RESTART_BARRIER')&&child.exitCode===null&&child.signalCode===null&&Date.now()-started<60000)await new Promise(r=>setTimeout(r,25));
 const ready=log.includes('SHARED_RESTART_BARRIER');if(child.exitCode===null&&child.signalCode===null)child.kill('SIGKILL');await closed;assert(ready,log||'SHARED_CHILD_EXIT:'+String(child.exitCode??child.signalCode??'timeout'));
 const before=(await c.query('SELECT used FROM evaluation_trials WHERE id=$1',[trial])).rows[0].used;
 const run=spawnSync(process.execPath,['--import','tsx','tests/evaluation/sharedPath.ts','worker'],{env,encoding:'utf8',timeout:150000});process.stdout.write(run.stdout+run.stderr);assert.equal(run.status,0);
 const after=(await c.query('SELECT used FROM evaluation_trials WHERE id=$1',[trial])).rows[0].used;for(const key of ['models','tools','iterations','delegations'])assert(after[key]>=before[key]);
 // Same guard under the actual profile: no coordinator-state workaround.
 const source=(await c.query("SELECT e.* FROM executions e WHERE capability_id='records.search' LIMIT 1")).rows[0];
 const link=(await c.query('SELECT w.goal_id owner FROM specialist_delegations d JOIN work_queue w ON w.id=d.parent_queue_id WHERE d.goal_id=$1',[source.goal_id])).rows[0];
 const copy=()=>c.query(`INSERT INTO executions(queue_id,goal_id,plan_id,plan_hash,execution_hash,capability_id,params,result,evidence,fencing_token,actor,status)
 SELECT queue_id,goal_id,plan_id,plan_hash,execution_hash,capability_id,params,result,evidence,fencing_token,actor,status FROM executions WHERE id=$1`,[source.id]);
 for(const variant of ['valid','coordinator-cancelled','owner-paused','family-cancelled','unrelated-coordinator']){
  await c.query('BEGIN');try{
   await c.query("UPDATE goals SET state='EXECUTING' WHERE id=ANY($1::uuid[])",[[source.goal_id,link.owner]]);
   if(variant==='coordinator-cancelled')await c.query("UPDATE goals SET state='CANCELLED' WHERE id=$1",[root]);
   if(variant==='owner-paused')await c.query("UPDATE goals SET state='WAITING_EXTERNAL' WHERE id=$1",[link.owner]);
   if(variant==='family-cancelled')await c.query('UPDATE specialist_budgets SET cancelled=true');
   if(variant==='unrelated-coordinator'){const other=(await c.query("INSERT INTO goals(business_id,company_scope,objective,state,authority_ceiling) VALUES($1,$2,'Unenrolled coordinator','NEW','GREEN') RETURNING id",[randomUUID(),entity])).rows[0].id;await c.query('UPDATE goals SET parent_goal_id=$2 WHERE id=$1',[link.owner,other]);}
   if(variant==='valid')await copy();else await assert.rejects(copy,/SPECIALIST_EXECUTION_CANCELLED_OR_EXPIRED|EVALUATION_CANCELLED_OR_EXPIRED/);
  }finally{await c.query('ROLLBACK');}
 }
 assert.equal((await c.query("SELECT count(*)::int n FROM knowledge_records WHERE kind='SOURCE_FACT'")).rows[0].n,3);assert.equal((await c.query("SELECT count(*)::int n FROM knowledge_records WHERE kind<>'SOURCE_FACT'")).rows[0].n,0);
 // Historical capture must retain failed/blocked owners' assigned descendants,
 // while the runtime resolver continues to deny dispatch from those owners.
 for(const state of ['FAILED','WAITING_EXTERNAL','CANCELLED','BLOCKED']){
  const testBundle=fixtureBundle(entity);
  const captureClient={query:async(sql:any,params?:any)=>{
   const result=await c.query(sql==='COMMIT'?'ROLLBACK':sql,params);
   if(sql==='BEGIN'){
    await c.query('UPDATE goals SET state=$2,next_wake_at=NULL WHERE id=$1',[link.owner,state]);
    await c.query('DELETE FROM goal_read_reviews WHERE goal_id=$1',[link.owner]);
    await assert.rejects(()=>evidenceFamily(c,link.owner,entity,testBundle.descendantEvidencePolicy!),/EVIDENCE_DELEGATION_SCOPE_INVALID/);
   }
   return result;
  }};
  const failed=await sealGoalFamilyEvaluation(captureClient as any,trial,testBundle);
  assert.equal(failed.goals.find(g=>g.id===link.owner)?.state,state);
  assert(failed.sources.some(s=>s.goal_id===source.goal_id));
  assert(!failed.reports.some(r=>r.goal_id===link.owner));
 }
 const snapshot=await sealGoalFamilyEvaluation(c,trial,fixtureBundle(entity));assert.equal(snapshot.goals.filter(g=>g.state==='COMPLETED').length,3);assert.equal(Object.keys(snapshot.obligations).length,3);
 const key=generateKeyPairSync('ed25519'),trace=await exportEvaluationTrace(c,trial,key.privateKey),score=scoreAuthenticatedEvaluation(trace,key.publicKey,spec.commit);assert.equal(score.status,'PASS');assert.equal(score.liveReasoningValidated,false);verifyEvaluationTrace(trace,key.publicKey);
 // Benchmark assertions are outside the runtime and absent from every prompt.
 const reports=snapshot.reports.map(r=>r.decision);assert(reports.every(r=>r.findings.length>=2));
 const datasets=snapshot.sources.filter(s=>s.capability_id==='derive_verified_evidence').map(s=>s.result.derivedEvidence.output.dataset);
 assert.deepEqual(datasets.find(d=>d.columns.total).rows.map((r:any)=>r.values.total),['12.1','15.35']);
 assert.deepEqual(datasets.find(d=>d.columns.delay).rows.map((r:any)=>r.values.delay),['3','0']);
 assert.deepEqual(datasets.find(d=>d.columns.count).rows.map((r:any)=>r.values.count),['2','1']);
 if(process.env.SAM_EVALUATION_ARTIFACT_DIR){writeFileSync(join(process.env.SAM_EVALUATION_ARTIFACT_DIR,'shared-path-trace.json'),JSON.stringify(trace));writeFileSync(join(process.env.SAM_EVALUATION_ARTIFACT_DIR,'shared-path-public.pem'),key.publicKey.export({format:'pem',type:'spki'}));}
 console.log('PASS shared SIGKILL/restart, no duplicate execution, 18 source/readback charges including rejected transform, signed descendant capture, original obligations and coordinator/cancellation guards; fixture decisions only');
 }finally{if(made){await c.query('DROP OWNED BY '+role);await c.query('DROP ROLE '+role);}c.release();}}
(process.argv[2]?worker():parent()).catch(e=>{console.error(e);process.exitCode=1;}).finally(()=>pool.end());
