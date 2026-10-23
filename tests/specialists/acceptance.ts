import {contentHash} from '../../apps/agents/src/evaluation/harness';
import assert from 'node:assert/strict';
import {spawn,spawnSync} from 'node:child_process';
import {randomUUID,generateKeyPairSync} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {applyEvaluationProfile,provisionEvaluationAccess,enrollEvaluationCompany} from '../../packages/db/src/evaluationProfile';
import {createEvaluationTrial} from '../../apps/agents/src/evaluation/trial';
import {sealEvaluationTrial,exportEvaluationTrace} from '../../apps/agents/src/evaluation/capture';
import {scoreAuthenticatedEvaluation,verifyEvaluationTrace} from '../../apps/agents/src/evaluation/trace';
import {sha256Hex} from '../../packages/shared/src/stableJson';
import {publicCases,evaluationCases} from '../../apps/agents/src/evaluation/cases';
import {mkdtempSync,writeFileSync,readFileSync,rmSync,copyFileSync,chmodSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {pool} from '../../packages/db/src/client';
import {provisionRuntimeAccess} from '../../packages/db/src/runtimeAccess';
import {applyIntegrationProfile} from '../../packages/db/src/integrationProfile';
import {applySpecialistProfile,provisionSpecialistAccess} from '../../packages/db/src/specialistProfile';
import {persistPlanAndDelegateAtomic} from '../../apps/kernel/src/planning';
export async function runSpecialistAcceptance(phase7=false){
 const c=await pool.connect(),role='sam_specialist_'+process.pid;let created=false;
 try{
  assert.equal((await applyIntegrationProfile(c)).length,8);
  const manifest=await applySpecialistProfile(c);assert.deepEqual(await applySpecialistProfile(c),manifest);
  if(phase7)await applyEvaluationProfile(c);
  await c.query("UPDATE sam_specialist_migrations SET sha256='tampered'");await assert.rejects(()=>applySpecialistProfile(c),/HASH_MISMATCH/);
  for(const receipt of manifest.migrations)await c.query('UPDATE sam_specialist_migrations SET sha256=$1 WHERE filename=$2',[receipt.sha256,receipt.filename]);
  assert.equal((await c.query('SELECT count(*)::int n FROM sam_schema_migrations')).rows[0].n,12);
  const schema=(await c.query('SELECT current_schema() s')).rows[0].s;
  const org=randomUUID(),entity=randomUUID(),foreign=randomUUID(),otherOrg=randomUUID(),otherEntity=randomUUID();
  await c.query("INSERT INTO organizations(id,name) VALUES($1,'Synthetic specialist company'),($2,'Other company')",[org,otherOrg]);
  await c.query("INSERT INTO legal_entities(id,org_id,name) VALUES($1,$2,'Our company'),($3,$2,'Sibling'),($4,$5,'Other')",[entity,org,foreign,otherEntity,otherOrg]);
  if(phase7)await enrollEvaluationCompany(c,entity);
  await c.query(`CREATE ROLE ${role} LOGIN PASSWORD 'synthetic-specialist-only' NOSUPERUSER NOCREATEDB NOCREATEROLE NOBYPASSRLS`);created=true;
  await c.query('BEGIN');try{
   await provisionRuntimeAccess(c,{schema,role,orgId:org,legalEntityId:entity});
   await provisionSpecialistAccess(c,{schema,role,orgId:org,legalEntityId:entity});
   if(phase7)await provisionEvaluationAccess(c,{schema,role,orgId:org,legalEntityId:entity});await c.query('COMMIT');
  }catch(e){await c.query('ROLLBACK');throw e;}
  await c.query(`INSERT INTO model_providers(provider_id,models,capabilities,privacy_class_allowed,health,cost_per_1k_input,cost_per_1k_output)
   VALUES('specialist-fixture','["fixture"]','["planning","specialist_reasoning"]','["INTERNAL"]','HEALTHY',0.001,0.001)`);
  for(const cap of ['specialist.executive','specialist.market','specialist.risk','source.read'])await c.query(`INSERT INTO verification_contracts(capability_id,description,verification_method,required_evidence_fields,independent_query_template)
    VALUES($1,'Synthetic independent evidence validation','api_readback',$2,'{}')`,[cap,JSON.stringify(cap==='source.read'?{readback:'boolean'}:{grounded:'boolean'})]);
  const make=async(label:string,cap='specialist.executive',tenant=entity)=>{
   const goal=(await c.query("INSERT INTO goals(business_id,company_scope,objective,state,authority_ceiling) VALUES($1,$2,$3,'PLANNING','GREEN') RETURNING id",['P5-'+label+'-'+randomUUID(),tenant,label])).rows[0].id;
   const p=await persistPlanAndDelegateAtomic({goalId:goal,steps:[{capabilityId:cap,params:{objective:label}}]});return {goal,queue:p.queueIds[0]};
  };
  const target=new URL(process.env.DATABASE_URL!);target.username=role;target.password='synthetic-specialist-only';target.searchParams.set('options',`-c search_path=${schema},public -c app.current_org_id=${org} -c app.current_legal_entity_id=${entity}`);
  const env={PATH:process.env.PATH,DATABASE_URL:target.href,SAM_SPECIALIST_INTELLIGENCE:'synthetic',FIXTURE_ENTITY:entity,FIXTURE_FOREIGN:foreign};
  const run=(mode:string,extra:Record<string,string>={})=>{
   const r=spawnSync(process.execPath,['--import','tsx','tests/specialists/worker.ts',mode],{env:{...env,...extra},encoding:'utf8',timeout:65000});
   process.stdout.write(r.stdout+r.stderr);console.log(JSON.stringify({worker:mode,exit:r.status,signal:r.signal,error:r.error?.message??null}));assert.equal(r.status,0,'restricted specialist worker '+mode);
  };
  if(phase7){
   const extra={FIXTURE_PHASE7:'1'};
   const described=spawnSync(process.execPath,['--import','tsx','tests/specialists/worker.ts','describe'],{env:{...env,...extra},encoding:'utf8',timeout:8000});
   assert.equal(described.status,0,described.stderr);const description=JSON.parse(described.stdout.trim());
   const goal=(await c.query("INSERT INTO goals(business_id,company_scope,objective,state,authority_ceiling) VALUES($1,$2,$3,'NEW','GREEN') RETURNING id",[randomUUID(),entity,evaluationCases[0].objective])).rows[0].id;
   const commit=process.env.SAM_VERIFICATION_SOURCE_SHA??execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();
   const limits={...description.configs[0].limits,elapsedMs:120000,models:20,tokens:400000,costUsd:0.5};
   const trial=await createEvaluationTrial(c,{rootGoalId:goal,spec:{version:1,mode:'fixture',syntheticOnly:true,commit,caseId:evaluationCases[0].id,corpusHash:contentHash(publicCases()),companyId:entity,
    rootCapabilityId:'specialist.executive',limits,agents:{'executive-bootstrap':limits,...Object.fromEntries(description.configs.map((s:any)=>[s.agentId,s.limits]))},prices:[{providerId:'specialist-fixture',model:'fixture',inputPer1k:0.001,outputPer1k:0.001}],capabilityHash:description.capabilityHash}});
   const unrelated=await make('unrelated-synthetic-work');
   run('collaboration',{...extra,FIXTURE_GOAL:goal,FIXTURE_TRIAL:trial});
   assert.equal((await c.query('SELECT status FROM work_queue WHERE id=$1',[unrelated.queue])).rows[0].status,'QUEUED','trial must not claim unrelated work');
   await sealEvaluationTrial(c,trial);const keys=generateKeyPairSync('ed25519');const capture=JSON.parse(JSON.stringify(await exportEvaluationTrace(c,trial,keys.privateKey)));
   verifyEvaluationTrace(capture,keys.publicKey);const scored=scoreAuthenticatedEvaluation(capture,keys.publicKey,commit);
   console.log(JSON.stringify({score:scored.status,checks:scored.checks}));assert.equal(scored.status,'PASS');assert.equal(scored.liveReasoningValidated,false);
   const changed=structuredClone(capture);changed.payload.trial.used.models=0;assert.throws(()=>verifyEvaluationTrace(changed,keys.publicKey),/AUTHENTICATION_FAILED/);
   assert.throws(()=>verifyEvaluationTrace(capture,generateKeyPairSync('ed25519').publicKey),/AUTHENTICATION_FAILED/);
   const corrupt=structuredClone(capture);corrupt.payload.events[1].hash='0'.repeat(64);
   const {sign}=await import('node:crypto');const {stableStringify}=await import('../../packages/shared/src/stableJson');
   corrupt.signature=sign(null,Buffer.from(stableStringify(corrupt.payload)),keys.privateKey).toString('base64');
   assert.throws(()=>verifyEvaluationTrace(corrupt,keys.publicKey),/HASH_CHAIN_INVALID/);
   await assert.rejects(()=>c.query("UPDATE evaluation_events SET payload='{}' WHERE trial_id=$1",[trial]),/IMMUTABLE/);
   const temporary=mkdtempSync(join(tmpdir(),'sam-authenticated-trace-'));
   try{
    writeFileSync(join(temporary,'trace.json'),JSON.stringify(capture));writeFileSync(join(temporary,'public.pem'),keys.publicKey.export({format:'pem',type:'spki'}));
    const cli=spawnSync(process.execPath,['--import','tsx','apps/agents/src/evaluation/cli.ts','score-authenticated','--commit',commit,'--input',join(temporary,'trace.json'),'--trusted-key',join(temporary,'public.pem'),'--output',join(temporary,'score')],{env:{PATH:process.env.PATH},encoding:'utf8',timeout:10000});
    assert.equal(cli.status,0,cli.stdout+cli.stderr);
    if(process.env.SAM_EVALUATION_ARTIFACT_DIR){
     for(const [from,to]of [['trace.json','evaluation-signed-trace.json'],['public.pem','evaluation-fixture-public.pem'],['score/report.json','evaluation-authenticated-score.json'],['score/report.md','evaluation-authenticated-score.md']]){
      const target=join(process.env.SAM_EVALUATION_ARTIFACT_DIR,to);copyFileSync(join(temporary,from),target);chmodSync(target,0o644);
     }
    }
   }finally{rmSync(temporary,{recursive:true,force:true});}
   console.log(JSON.stringify({suite:'authenticated-end-to-end-trial',status:'PASS',wholeTrialUsed:scored.wholeTrialUsed,headHash:scored.headHash,commit,liveCalls:0}));return;
  }
  run('collaboration');
  // Kill a real process only after its model attempt has a durable reservation.
  const crash=await make('crash-recovery');
  const child=spawn(process.execPath,['--import','tsx','tests/specialists/worker.ts','crash'],{env:{...env,FIXTURE_GOAL:crash.goal,FIXTURE_QUEUE:crash.queue},stdio:['ignore','pipe','pipe']});
  let logs='';child.stdout.on('data',x=>logs+=x);child.stderr.on('data',x=>logs+=x);
  const started=Date.now();while(!logs.includes('MODEL_ATTEMPT_RESERVED')&&Date.now()-started<8000){await new Promise(r=>setTimeout(r,25));}
  assert.match(logs,/MODEL_ATTEMPT_RESERVED/);child.kill('SIGKILL');await new Promise(r=>child.once('close',r));
  assert.equal((await c.query('SELECT used->>\'models\' n FROM specialist_budgets WHERE root_queue_id=$1',[crash.queue])).rows[0].n,'1');
  await c.query("UPDATE work_queue SET lease_expiry=now()-interval '1 second' WHERE id=$1",[crash.queue]);
  run('recover',{FIXTURE_GOAL:crash.goal,FIXTURE_QUEUE:crash.queue});
  run('controls');
  // Populated foreign rows test both same-org and cross-org isolation.
  for(const tenant of [foreign,otherEntity]){
   const g=await make('foreign','specialist.executive',tenant);
   await c.query(`INSERT INTO specialist_budgets(root_queue_id,legal_entity_id,limits,deadline) VALUES($1,$2,'{}',now()+interval '1 hour')`,[g.queue,tenant]);
   await c.query(`INSERT INTO specialist_sessions(queue_id,root_queue_id,legal_entity_id,agent_id,config_hash,depth,deadline,state) VALUES($1,$1,$2,'foreign','foreign',0,now()+interval '1 hour','{}')`,[g.queue,tenant]);
   await c.query(`INSERT INTO specialist_learning(legal_entity_id,goal_id,kind,statement,expires_at) VALUES($1,$2,'MODEL_INFERENCE','foreign secret',now()+interval '1 day')`,[tenant,g.goal]);
  }
  run('isolation');
  const upgrade=manifest.migrations[1];await c.query('DELETE FROM sam_specialist_migrations WHERE filename=$1',[upgrade.filename]);run('profile-denied');
  await c.query('INSERT INTO sam_specialist_migrations VALUES($1,$2)',[upgrade.filename,upgrade.sha256]);
  await c.query("UPDATE sam_specialist_migrations SET sha256='invalid' WHERE filename=$1",[upgrade.filename]);run('profile-denied');
  await c.query('UPDATE sam_specialist_migrations SET sha256=$1 WHERE filename=$2',[upgrade.sha256,upgrade.filename]);
  await c.query(`DROP POLICY "specialist_fence_${role}" ON specialist_learning`);run('admission-denied');
  console.log(JSON.stringify({suite:'specialist-acceptance',status:'PASS',classification:'SYNTHETIC_MODEL_ARCHITECTURE',liveModels:'NOT_RUN',migration:manifest,
   coverage:['independent reasoning','parallel delegation','verified result passing','failure replan','contradiction correction','executive synthesis','SIGKILL durable recovery','tenant/company fences','side-effect refusal','typed learning/revocation','budgets','cancellation']}));
 }finally{if(created){await c.query('DROP OWNED BY '+role);await c.query('DROP ROLE '+role);}c.release();await pool.end();}
}
if(process.argv[1]?.endsWith('tests/specialists/acceptance.ts'))runSpecialistAcceptance().catch(e=>{console.error(e);process.exitCode=1;});
