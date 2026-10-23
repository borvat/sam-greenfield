import assert from 'node:assert/strict';
import {mkdtemp,writeFile,readFile,mkdir,rm,copyFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {randomUUID,generateKeyPairSync} from 'node:crypto';
import {spawn,execFileSync} from 'node:child_process';
import {pool} from '../../packages/db/src/client';
import {applyIntegrationProfile,provisionIntegrationAccess} from '../../packages/db/src/integrationProfile';
import {applySpecialistProfile,provisionSpecialistAccess} from '../../packages/db/src/specialistProfile';
import {applyEvaluationProfile,provisionEvaluationAccess,enrollEvaluationCompany} from '../../packages/db/src/evaluationProfile';
import {applySharedGoalProfile} from '../../packages/db/src/sharedGoalProfile';
import {ceiling} from '../../apps/agents/src/intelligence/contracts';
import {sharedCorpus,sharedCorpusHash} from '../../apps/agents/src/evaluation/sharedCorpus';
import {authorizeLiveEvaluation} from '../../packages/model-gateway/src/evaluationPermit';
import {rehearseFixtureTrialLaunch,runOperatorTrialLaunch,recoverTrialLaunch,type LaunchRequest} from '../../apps/agents/src/evaluation/operatorLaunch';
import {openLaunchJournal} from '../../apps/agents/src/evaluation/launchJournal';
import {createLaunchBindings} from './launchFixture';
async function main(){
 const c=await pool.connect(),role='sam_launch_'+process.pid,temporary=await mkdtemp(join(tmpdir(),'sam-launch-fixture-'));
 const evidence=process.env.SAM_EVALUATION_ARTIFACT_DIR==='/evidence'?'/evidence':await mkdtemp(join(tmpdir(),'sam-launch-public-evidence-'));let made=false;
 try{
  await applyIntegrationProfile(c);await applySpecialistProfile(c);await applyEvaluationProfile(c);await applySharedGoalProfile(c);
  const schema=(await c.query('SELECT current_schema() s')).rows[0].s,org=randomUUID(),entity=randomUUID();
  await c.query("INSERT INTO organizations(id,name) VALUES($1,'Launcher fixtures')",[org]);await c.query("INSERT INTO legal_entities(id,org_id,name) VALUES($1,$2,'Launcher fixtures')",[entity,org]);await enrollEvaluationCompany(c,entity);
  await c.query(`CREATE ROLE ${role} LOGIN PASSWORD 'ephemeral-launch-fixture' NOSUPERUSER NOCREATEDB NOCREATEROLE NOBYPASSRLS`);made=true;
  await c.query('BEGIN');await provisionIntegrationAccess(c,{schema,role,orgId:org,legalEntityId:entity});await provisionSpecialistAccess(c,{schema,role,orgId:org,legalEntityId:entity});await provisionEvaluationAccess(c,{schema,role,orgId:org,legalEntityId:entity});await c.query('COMMIT');
  const url=new URL(process.env.DATABASE_URL!);url.username=role;url.password='ephemeral-launch-fixture';url.searchParams.set('options',`-c search_path=${schema},public -c app.current_org_id=${org} -c app.current_legal_entity_id=${entity}`);
  const keys=generateKeyPairSync('ed25519'),privateKey=keys.privateKey.export({format:'pem',type:'pkcs8'}).toString(),publicKey=keys.publicKey.export({format:'pem',type:'spki'}).toString();
  const results:any[]=[];
  for(const scenario of ['normal','sign','bad-signature','delivery','restart','observe','uncertain-create','expired','restore','quiesce','cancel','db-cancel','crash','crash-after-restart']){
   const dir=join(temporary,scenario);await mkdir(dir);process.env.LAUNCH_FIXTURE_DIR=dir;
   const root=(await c.query("INSERT INTO goals(business_id,company_scope,objective,state,authority_ceiling) VALUES($1,$2,'Launcher fixture coordinator','NEW','GREEN') RETURNING id",[randomUUID(),entity])).rows[0].id;
   const ownerIds=[];for(let i=0;i<3;i++)ownerIds.push((await c.query("INSERT INTO goals(business_id,company_scope,parent_goal_id,objective,state,authority_ceiling,completion_definition) VALUES($1,$2,$3,'Synthetic launcher child','NEW','GREEN','sam.read_report.v1') RETURNING id",[randomUUID(),entity,root])).rows[0].id);
   const limits={...ceiling,models:24,iterations:24,tokens:672000,costUsd:0.30,tools:20,delegations:16,elapsedMs:300000,maxInputTokens:24000,maxOutputTokens:4000,modelCallMs:20000,toolCallMs:20000};
   const request:LaunchRequest={version:1,rootGoalId:root,spec:{version:1,mode:'fixture',syntheticOnly:true,commit:process.env.SAM_VERIFICATION_SOURCE_SHA??execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),caseId:sharedCorpus.id,corpusHash:sharedCorpusHash(),companyId:entity,rootCapabilityId:'reason.records',limits,agents:{'executive-bootstrap':{...limits,models:0,tools:0,iterations:0,tokens:0,costUsd:0,delegations:0},...Object.fromEntries(ownerIds.map(id=>['goal.'+id,{...limits,models:8,iterations:8,tokens:224000,costUsd:0.1}]))},prices:[{providerId:'deepseek',model:'deepseek-flash',inputPer1k:0.0003,outputPer1k:0.0012}],capabilityHash:'d'.repeat(64)}};
   const meta={scenario,runtimeUrl:url.href,publicKey};await writeFile(join(dir,'fixture.json'),JSON.stringify(meta),{mode:0o600});await writeFile(join(dir,'fixture-private.pem'),privateKey,{mode:0o600});await writeFile(join(dir,'request.json'),JSON.stringify(request));
   let opened:Awaited<ReturnType<typeof openLaunchJournal>>|undefined;let result:any;
   if(scenario.startsWith('crash')){
    const barrier=scenario==='crash'?'FIXTURE_AFTER_INSERT':'FIXTURE_AFTER_RESTART';
    const child=spawn(process.execPath,['--import','tsx','scripts/evaluation/launch.ts','rehearsal',join(dir,'request.json'),resolve('tests/evaluation/launchFixture.ts'),join(dir,'journal')],{env:{PATH:process.env.PATH,DATABASE_URL:process.env.DATABASE_URL,LAUNCH_FIXTURE_DIR:dir},stdio:['ignore','pipe','pipe']});
    let log='';const closed=new Promise<void>(r=>child.once('close',()=>r()));
    await new Promise<void>((accept,reject)=>{const timer=setTimeout(()=>{child.kill('SIGKILL');reject(Error('CRASH_BARRIER_TIMEOUT'));},15000);child.stdout.on('data',b=>{log+=b;if(log.includes(barrier)){clearTimeout(timer);accept();}});child.once('exit',()=>{clearTimeout(timer);if(!log.includes(barrier))reject(Error('CRASH_CHILD_FAILED'));});});
    child.kill('SIGKILL');await closed;
    await writeFile(join(dir,'fixture.json'),JSON.stringify({...meta,scenario:'normal'}));opened=await openLaunchJournal(join(dir,'journal'),true);
    const b=await createLaunchBindings(request);result=await recoverTrialLaunch(request,{...b,journal:opened.journal});await b.close();assert(result.restored);
   }else{
    opened=await openLaunchJournal(join(dir,'journal'));await assert.rejects(openLaunchJournal(join(dir,'journal'),true),/LAUNCH_OPERATOR_ACTIVE/);const b=await createLaunchBindings(request);
    if(scenario==='normal'){
     await assert.rejects(runOperatorTrialLaunch(request,{...b,journal:opened.journal}),/LAUNCH_MODE_MISMATCH/);
     await assert.rejects(rehearseFixtureTrialLaunch(request,{...b,signer:undefined,journal:opened.journal}),/LAUNCH_SIGNER_REQUIRED/);
     assert.equal((await c.query('SELECT count(*)::int n FROM evaluation_trials WHERE root_goal_id=$1',[root])).rows[0].n,0);
    }
    const cancel=new AbortController();const timer=scenario==='cancel'?setTimeout(()=>cancel.abort(),50):undefined;
    try{result=await rehearseFixtureTrialLaunch(request,{...b,journal:opened.journal,signal:cancel.signal});}finally{if(timer)clearTimeout(timer);}await b.close();
    await assert.rejects(rehearseFixtureTrialLaunch(request,{...b,journal:opened.journal}),/LAUNCH_ALREADY_STARTED_USE_RECOVERY/);
    await assert.rejects(recoverTrialLaunch({...request,rootGoalId:randomUUID()},{...b,journal:opened.journal}),/LAUNCH_RECOVERY_SCOPE_INVALID/);
    if(['restore','quiesce'].includes(scenario)){
     assert.equal(result.restored,false);await writeFile(join(dir,'fixture.json'),JSON.stringify({...meta,scenario:'normal'}));
     const fixed=await createLaunchBindings(request);assert((await recoverTrialLaunch(request,{...fixed,journal:opened.journal})).restored);await fixed.close();
    }else assert(result.restored);
    assert.equal(result.outcome,['normal','restore','quiesce'].includes(scenario)?'blocked':'failed');
   }
   const rows=(await c.query('SELECT *,clock_timestamp() now FROM evaluation_trials WHERE root_goal_id=$1',[root])).rows;assert.equal(rows.length,1,'never replace a trial');const row=rows[0];
   assert.equal(new Date(row.deadline).getTime()-new Date(row.created_at).getTime(),300000);assert(row.cancelled);assert.equal(row.used.models,0);assert.equal(row.used.costUsd,0);
   assert.equal(await readFile(join(dir,'service-state'),'utf8'),'ordinary');
   const events=await opened!.journal.read();assert.equal(events.filter(e=>e.phase==='CREATE_REQUESTED').length,1);
   if(scenario==='normal'){
    const delivered=JSON.parse(await readFile(join(dir,'approval.json'),'utf8'));
    assert.throws(()=>authorizeLiveEvaluation({payload:delivered.payload,signature:delivered.signature,trustedOwnerPublicKey:publicKey,expectedPayload:{...delivered.payload,kind:'SAM_LIVE_EVALUATION_APPROVAL'}}),/EVALUATION_OWNER_AUTHORIZATION_INVALID/);
   }
   results.push({scenario,result,elapsedFromInsertMs:new Date(row.now).getTime()-new Date(row.created_at).getTime(),deadlineMs:300000,models:row.used.models,costUsd:row.used.costUsd,restored:true,trialCount:1});
   await opened!.close();await copyFile(join(dir,'journal/events.jsonl'),join(evidence,'operator-launch-'+scenario+'.jsonl'));
  }
  await writeFile(join(evidence,'operator-launch-results.json'),JSON.stringify({classification:'FIXTURE_ONLY_LAUNCH_ORCHESTRATION_NOT_MODEL_QUALITY',liveCalls:0,productionAuthority:false,results},null,2));await writeFile(join(evidence,'operator-launch-fixture-public.pem'),publicKey);
  console.log(JSON.stringify({status:'PASS',scenarios:results.length,evidence,results}));
 }finally{if(made){await c.query('DROP OWNED BY '+role);await c.query('DROP ROLE '+role);}c.release();await rm(temporary,{recursive:true,force:true});await pool.end();}
}
main().catch(e=>{console.error(e);process.exit(1);});
