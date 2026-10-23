import {applySharedGoalProfile} from '../../packages/db/src/sharedGoalProfile';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {spawnSync,execFileSync} from 'node:child_process';
import {pool} from '../../packages/db/src/client';
import {applyIntegrationProfile,provisionIntegrationAccess} from '../../packages/db/src/integrationProfile';
import {applySpecialistProfile,provisionSpecialistAccess} from '../../packages/db/src/specialistProfile';
import {applyEvaluationProfile,provisionEvaluationAccess,enrollEvaluationCompany} from '../../packages/db/src/evaluationProfile';
import {createEvaluationTrial,openEvaluationTrial,type TrialSpec} from '../../apps/agents/src/evaluation/trial';
import {ceiling} from '../../apps/agents/src/intelligence/contracts';
import {sharedCorpus,sharedCorpusHash} from '../../apps/agents/src/evaluation/sharedCorpus';
import {fixtureEvaluationAdapter} from '../../packages/model-gateway/src/evaluationAdapter';
import {evaluationBundleHash} from '../../apps/production/src/goalEvaluationBundle';
import {createSharedGoalComposition} from '../../apps/production/src/sharedGoalComposition';
import {fixtureBundle} from './sharedFixture';
const objectives=['Compare January and February supplied ledger amounts in net EUR, with citations and limits.','Compare supplier promises against delivery dates for the supplied delivery records.','Inventory duplicate supplied documents by content hash without deleting anything.'];
const info=(objective:string)=>objective===objectives[0]?{query:'ledger',field:'total',units:'EUR',vat:'net'}:objective===objectives[1]?{query:'delivery',field:'delay',units:'calendar_day',vat:'UNKNOWN'}:{query:'document',field:'count',units:'count',vat:'UNKNOWN'};
async function worker(){
 const t=await openEvaluationTrial(process.env.FIXTURE_TRIAL!);let calls=0;
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
    operations.push(...(query==='ledger'?[{op:'group',keys:['period'],aggregates:[{fn:'sum',field:'amount',as:'total'}]}]:query==='delivery'?[{op:'derive',as:'delay',left:'delivered',right:'promised',operator:'subtract'}]:[{op:'group',keys:['digest'],aggregates:[{fn:'count',as:'count'}]}]));
    output=dispatch('derive_verified_evidence',{sources,plan:{version:1,source:'s0',operations}});
   }else {const value=derived.result.derivedEvidence.output.dataset.rows[0].values[field];output={action:'report',understanding:objective,plan:['Cite verified derivation'],summary:'Bounded fixture comparison',claims:[{topic:field,value,path:['derivedEvidence','output','dataset','rows','0','values',field],evidenceIds:[derived.id]}],uncertainties:['Synthetic source coverage only'],completionCriteria:['Requested records accounted for']};}
  }else if(input.proposedReport)output={accepted:true,missing:[]};
  else if(input.verifiedObservations){
   const source=input.verifiedObservations.find((s:any)=>s.derivedEvidence);assert(source,'shared review must see descendant derivation');
   const quoteLine=source.citableLines.find((i:number)=>{try{return JSON.parse(source.lines[i]).field===field;}catch{return false;}});assert.notEqual(quoteLine,undefined);
   const cell=JSON.parse(source.lines[quoteLine]);output={status:'complete',summary:'Requested bounded fixture analysis',requirements:[{obligationId:'analysis',requirement:objective,fulfilled:true,evidenceIds:[source.id]}],findings:[{text:'Derived '+field,executionId:source.id,quoteLine,derivedClaim:{row:cell.row,field,value:cell.value}}],limitations:['Synthetic fixtures, not live evidence'],steps:[]};
  }else output={assumptions:{goalObligations:{version:1,deliverables:[{id:'analysis',description:objective,fields:[field],scope:{kind:'population',filter:query,query:{capabilityId:'records.search',params:{query}}},units,vat,period:'UNKNOWN',timeZone:'UTC'}],unresolved:[]}},steps:[{capabilityId:'reason.records',params:{objective}}]};
  return {model:'fixture',usage:{inputTokens:5,outputTokens:20},output};
 });
 const composition=await createSharedGoalComposition({bundle:fixtureBundle(t.spec.companyId,adapter),trial:t,expectedCommit:t.spec.commit,workerId:'shared-fixture',diagnostic:(stage,error)=>console.error(stage,error)});
 await composition.recover();
 for(let i=0;i<160;i++){try{await composition.runWorkTick();}catch(error){console.error('FIXTURE_FAILURE_STATE',JSON.stringify({goals:(await pool.query('SELECT id,parent_goal_id,state FROM goals')).rows,sessions:(await pool.query("SELECT state->>'phase' phase,state->>'reason' reason FROM specialist_sessions")).rows,reviews:(await pool.query('SELECT goal_id,decision FROM goal_read_reviews')).rows,verifications:(await pool.query('SELECT result,independent_evidence FROM verifications')).rows}));throw error;}const rows=(await pool.query('SELECT id,state FROM goals WHERE parent_goal_id=$1',[t.rootGoalId])).rows;if(rows.every(g=>['COMPLETED','FAILED','WAITING_EXTERNAL','BLOCKED'].includes(g.state)))break;if(i%20===0)console.log(JSON.stringify({tick:i,goals:rows,calls}));}
 const rows=(await pool.query('SELECT id,state FROM goals WHERE parent_goal_id=$1',[t.rootGoalId])).rows;if(!rows.every(g=>g.state==='COMPLETED'))console.error('FINAL_REPORT_DIAGNOSTIC',JSON.stringify((await pool.query('SELECT goal_id,decision FROM goal_read_reviews')).rows));assert(rows.every(g=>g.state==='COMPLETED'),JSON.stringify(rows));assert(calls<=24);console.log('PASS shared actual composition three fixture goals; model quality NOT evaluated');
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
 const limits={...ceiling,models:24,maxOutputTokens:4000,tokens:672000};const spec:TrialSpec={version:1,mode:'fixture',syntheticOnly:true,commit:process.env.SAM_VERIFICATION_SOURCE_SHA??execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),caseId:sharedCorpus.id,corpusHash:sharedCorpusHash(),companyId:entity,rootCapabilityId:'reason.records',limits,agents:{'executive-bootstrap':{...limits,models:0},...Object.fromEntries(ids.map(id=>['goal.'+id,{...limits,models:8}]))},prices:[{providerId:'eval-shared',model:'fixture',inputPer1k:0.001,outputPer1k:0.001}],capabilityHash:evaluationBundleHash(fixtureBundle(entity,null))};
 const trial=await createEvaluationTrial(c,{rootGoalId:root,spec});
 const target=new URL(process.env.DATABASE_URL!);target.username=role;target.password='shared-fixture-only';target.searchParams.set('options',`-c search_path=${schema},public -c app.current_org_id=${org} -c app.current_legal_entity_id=${entity} -c jit=off`);
 const run=spawnSync(process.execPath,['--import','tsx','tests/evaluation/sharedPath.ts','worker'],{env:{PATH:process.env.PATH,DATABASE_URL:target.href,FIXTURE_TRIAL:trial,SAM_SPECIALIST_INTELLIGENCE:'synthetic',SAM_INTEGRATION_ENABLED:'1'},encoding:'utf8',timeout:150000});process.stdout.write(run.stdout+run.stderr);assert.equal(run.status,0);
 }finally{if(made){await c.query('DROP OWNED BY '+role);await c.query('DROP ROLE '+role);}c.release();}}
(process.argv[2]?worker():parent()).catch(e=>{console.error(e);process.exitCode=1;}).finally(()=>pool.end());
