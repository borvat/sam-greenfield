import assert from 'node:assert/strict';
import {randomUUID,generateKeyPairSync,sign,createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {writeFileSync} from 'node:fs';
import {join} from 'node:path';
import {pool} from '../../packages/db/src/client';
import {applyIntegrationProfile} from '../../packages/db/src/integrationProfile';
import {applySpecialistProfile,provisionSpecialistAccess} from '../../packages/db/src/specialistProfile';
import {applyEvaluationProfile,provisionEvaluationAccess,enrollEvaluationCompany} from '../../packages/db/src/evaluationProfile';
import {provisionRuntimeAccess} from '../../packages/db/src/runtimeAccess';
import {commercialEvaluationBundle} from '../../apps/agents/src/evaluation/scenarioRuntime';
import {commercialCorpusHash,prepareCommercialEvaluation} from '../../apps/agents/src/evaluation/scenarios';
import {fixtureEvaluationAdapter} from '../../packages/model-gateway/src/evaluationAdapter';
import {createEvaluationTrial} from '../../apps/agents/src/evaluation/trial';
import {sealEvaluationTrial,exportEvaluationTrace} from '../../apps/agents/src/evaluation/capture';
import {scoreAuthenticatedEvaluation} from '../../apps/agents/src/evaluation/trace';
import {stableStringify} from '../../packages/shared/src/stableJson';
export async function runScenario(caseId:string){
 const c=await pool.connect(),role='sam_commercial_'+process.pid;let made=false;
 try{
  await applyIntegrationProfile(c);await applySpecialistProfile(c);await applyEvaluationProfile(c);
  const schema=(await c.query('SELECT current_schema() s')).rows[0].s,org=randomUUID(),entity=randomUUID();
  await c.query("INSERT INTO organizations(id,name) VALUES($1,'Synthetic evaluation only')",[org]);await c.query("INSERT INTO legal_entities(id,org_id,name) VALUES($1,$2,'Synthetic company')",[entity,org]);await enrollEvaluationCompany(c,entity);
  await c.query(`CREATE ROLE ${role} LOGIN PASSWORD 'synthetic-phase8-only' NOSUPERUSER NOCREATEDB NOCREATEROLE NOBYPASSRLS`);made=true;
  await c.query('BEGIN');try{await provisionRuntimeAccess(c,{schema,role,orgId:org,legalEntityId:entity});await provisionSpecialistAccess(c,{schema,role,orgId:org,legalEntityId:entity});await provisionEvaluationAccess(c,{schema,role,orgId:org,legalEntityId:entity});await c.query('COMMIT');}catch(e){await c.query('ROLLBACK');throw e;}
  const adapter=fixtureEvaluationAdapter('commercial-fixture',async()=>{throw Error('PARENT_MUST_NOT_INVOKE');}),{scenario,configs,limits,capabilityHash}=commercialEvaluationBundle(entity,caseId,adapter);
  await c.query(`INSERT INTO model_providers(provider_id,models,capabilities,privacy_class_allowed,health,cost_per_1k_input,cost_per_1k_output) VALUES('commercial-fixture','["fixture"]','["planning","specialist_reasoning"]','["INTERNAL"]','HEALTHY',0.001,0.001)`);
  for(const cfg of [...configs,{capabilityId:'source.read'}])await c.query("INSERT INTO verification_contracts(capability_id,description,verification_method,required_evidence_fields,independent_query_template) VALUES($1,'Synthetic independent verification','api_readback',$2,'{}')",[cfg.capabilityId,JSON.stringify(cfg.capabilityId==='source.read'?{readback:'boolean'}:{grounded:'boolean'})]);
  const goal=(await c.query("INSERT INTO goals(business_id,company_scope,objective,state,authority_ceiling) VALUES($1,$2,$3,'NEW','GREEN') RETURNING id",[randomUUID(),entity,scenario.objective])).rows[0].id;
  const commit=process.env.SAM_VERIFICATION_SOURCE_SHA!;
  const trialId=await createEvaluationTrial(c,{rootGoalId:goal,spec:{version:1,mode:'fixture',syntheticOnly:true,commit,caseId,corpusHash:commercialCorpusHash(),companyId:entity,rootCapabilityId:'specialist.executive',limits,agents:{'executive-bootstrap':limits,...Object.fromEntries(configs.map(s=>[s.agentId,s.limits]))},prices:[{providerId:adapter.providerId,model:'fixture',inputPer1k:0.001,outputPer1k:0.001}],capabilityHash}});
  const target=new URL(process.env.DATABASE_URL!);target.username=role;target.password='synthetic-phase8-only';target.searchParams.set('options',`-c search_path=${schema},public -c app.current_org_id=${org} -c app.current_legal_entity_id=${entity}`);
  const worker=spawnSync(process.execPath,['--import','tsx','tests/evaluation/scenarioWorker.ts',caseId],{env:{PATH:process.env.PATH,DATABASE_URL:target.href,FIXTURE_ENTITY:entity,FIXTURE_TRIAL:trialId,SAM_SPECIALIST_INTELLIGENCE:'synthetic'},encoding:'utf8',timeout:65000});
  process.stdout.write(worker.stdout+worker.stderr);assert.equal(worker.status,0);
  await sealEvaluationTrial(c,trialId);const keys=generateKeyPairSync('ed25519'),capture=JSON.parse(JSON.stringify(await exportEvaluationTrace(c,trialId,keys.privateKey)));
  const scored=scoreAuthenticatedEvaluation(capture,keys.publicKey,commit);console.log(JSON.stringify(scored));assert.equal(scored.status,'PASS');assert.equal(scored.liveReasoningValidated,false);
  const snapshot=(p:any)=>p.events.at(-1).payload;
  const negatives:Record<string,(p:any)=>void>={
   'unsupported field/topic':p=>snapshot(p).report.claims[0].topic='guaranteed-profit',
   'missing evidence':p=>snapshot(p).report.claims[0].evidenceIds=[randomUUID()],
   'second invalid citation':p=>snapshot(p).report.claims[0].evidenceIds.push(randomUUID()),
   'invalid canonical source bytes':p=>snapshot(p).sources[0].result.sourceData.value='FORGED',
   'invalid value':p=>snapshot(p).report.claims[0].value='guaranteed profit',
   'contradictory final claims':p=>snapshot(p).report.claims.push({...snapshot(p).report.claims[0],value:'conflicting quotation'}),
   'stale publication':p=>{const s=snapshot(p).sources.find((s:any)=>s.id===snapshot(p).report.claims[0].evidenceIds[0]);s.result.sourceId=scenario.sources[3].id;s.result.sourceData=scenario.sources[3].data;},
   'failed readback':p=>{for(const e of p.events)if(e.kind==='FINISHED'&&e.payload.result?.result==='VERIFIED')e.payload.result.result='FAILED';},
   'cross-company source':p=>snapshot(p).sources[0].company_scope=randomUUID(),
   'unlinked trusted lesson':p=>snapshot(p).learning.find((l:any)=>l.kind==='VERIFIED_LESSON').parent_id=null,
   'missing child capture':p=>{p.events=p.events.filter((e:any)=>e!==p.events.find((e:any)=>e.kind==='DELEGATED'&&e.payload.capabilityId==='source.read'));},
   'foreign-root child':p=>{p.events.find((e:any)=>e.kind==='DELEGATED').payload.parentGoalId=randomUUID();},
   'absent correction':p=>{for(const e of p.events)if(e.kind==='CONFLICTS')for(const conflict of e.payload.conflicts)conflict.topic='unsupported-topic';}
  };
  const negativeResults:any[]=[];
  for(const [name,edit]of Object.entries(negatives)){
   const payload=structuredClone(capture.payload);edit(payload);snapshot(payload).root.result.report=structuredClone(snapshot(payload).report);
   let previous='0'.repeat(64);for(const [index,e] of payload.events.entries()){e.sequence=index+1;e.canonical=stableStringify({trialId:e.trial_id,sequence:Number(e.sequence),kind:e.kind,reservationId:e.reservation_id,payload:e.payload,at:e.created_at});e.previous_hash=previous;e.hash=createHash('sha256').update(previous+e.canonical).digest('hex');previous=e.hash;}
   const changed={...capture,payload,signature:sign(null,Buffer.from(stableStringify(payload)),keys.privateKey).toString('base64')};
   const result=scoreAuthenticatedEvaluation(changed,keys.publicKey,commit);assert.equal(result.status,'FAIL',name);negativeResults.push({name,expected:'FAIL',actual:result.status,sha256:createHash('sha256').update(JSON.stringify(changed)).digest('hex'),failedChecks:result.checks.filter(c=>c.status==='FAIL').map(c=>c.name)});
  }
  if(process.env.SAM_EVALUATION_ARTIFACT_DIR){const dir=process.env.SAM_EVALUATION_ARTIFACT_DIR;for(const [file,data]of Object.entries({[caseId+'-trace.json']:JSON.stringify(capture),[caseId+'-public.pem']:keys.publicKey.export({format:'pem',type:'spki'}).toString(),[caseId+'-score.json']:JSON.stringify(scored,null,2),[caseId+'-negative-results.json']:JSON.stringify(negativeResults,null,2),[caseId+'-protocol.json']:JSON.stringify(prepareCommercialEvaluation(commit),null,2)}))writeFileSync(join(dir,file),data,{mode:0o644});}
  console.log(JSON.stringify({suite:'commercial-acceptance',caseId,status:'PASS',negativeChecks:Object.keys(negatives).length,commit,modelQuality:'NOT_EVALUATED',liveCalls:0}));
 }finally{if(made){await c.query('DROP OWNED BY '+role);await c.query('DROP ROLE '+role);}c.release();await pool.end();}
}
