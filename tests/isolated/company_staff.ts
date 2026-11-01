/** Isolated source acceptance; no providers, external sends or live claims. */
import assert from 'node:assert/strict';
import {test} from 'node:test';
import {readFileSync} from 'node:fs';
import {PGlite} from '@electric-sql/pglite';
import {COMPANY_ROSTER,companyCapabilities,assignCompanyWork,companyStaffSnapshot,companyProfileMemory,performanceRank,attributedModelCost,profileForCapability} from '../../apps/agents/src/company';
import {CapabilityCatalog} from '../../apps/agents/src/capabilityCatalog';
import {proposeCompanySkill,reviewCompanySkill,adoptCompanySkill,replaceCompanySkillSource,SKILL_REVIEW_CHECKS} from '../../apps/agents/src/companySkills';
import {pool} from '../../packages/db/src/client';
import {startCommandCenterHttpServer} from '../../apps/command-center/src/http';
import {ModelGateway} from '../../packages/model-gateway/src/gateway';
import {assessCompanyPerformance} from '../../apps/agents/src/companyPerformance';
import {recordModelCall} from '../../packages/db/src/modelCalls';
const id=(n:number)=>'11111111-1111-4111-8111-'+n.toString(16).padStart(12,'0');
const entity=id(1),foreign=id(2),org=id(3),goal=id(4),otherGoal=id(5),plan=id(6);
const owner={actor:'owner-fixture',systemOwner:true,legalEntityId:entity};

test('15 immutable role contracts map existing owners without expanding authority, and rank fails closed',()=>{
 assert.equal(COMPANY_ROSTER.length,15);assert.equal(new Set(COMPANY_ROSTER.map(p=>p.id)).size,15);
 for(const role of COMPANY_ROSTER){assert.ok(Object.isFrozen(role));assert.ok(role.responsibilities.length>=2);assert.ok(role.acceptance.length>=2);assert.ok(role.handoff.input.includes('queue_id'));}
 const catalog=new CapabilityCatalog([{capabilityId:'bol_get_offer',specialistAgentId:'marketplace',specialistVersion:'1',authorityClass:'GREEN'}]);
 assert.deepEqual(companyCapabilities(catalog,'marketplace'),[{capabilityId:'bol_get_offer',owner:'marketplace',authority:'GREEN'}]);
 assert.equal(profileForCapability('google_mcp_gmail_read'),'negotiation');assert.equal(profileForCapability('invented_capability'),null);assert.equal(profileForCapability('google_mcp_get_drive_shareable_link','documents'),'content');
 assert.equal(performanceRank({verified:1000,failed:0,knownCost:false,authorityBreaches:0,distinctDays:100}).rank,null);
 assert.equal(performanceRank({verified:1000,failed:0,knownCost:true,authorityBreaches:null,distinctDays:100}).rank,null);
 const rank=performanceRank({verified:300,failed:0,knownCost:true,authorityBreaches:0,distinctDays:90});assert.equal(rank.label,'أسطورة');assert.equal(rank.permissionsChanged,false);
 assert.equal(attributedModelCost([]).amount,null);assert.equal(attributedModelCost([]).status,'UNKNOWN');
 assert.equal(attributedModelCost([{id:'a',cost:0,created_at:new Date()}]).amount,0);
 assert.equal(attributedModelCost([{id:'a',cost:0.2,created_at:new Date()},{id:'b',cost:null,created_at:new Date()}]).status,'PARTIAL_ATTRIBUTED_SUBTOTAL');
});

test('persisted office, actual ledger links, independent verification, scoped memory and pinned skills',async()=>{
 const db=new PGlite();
 const c={async query(sql:string,args?:any[]){const r:any=await db.query(sql,args);return {...r,rowCount:r.rows.length};}} as any;
 try{
  await db.exec(`CREATE FUNCTION current_org_id() RETURNS uuid LANGUAGE sql STABLE AS $$ SELECT nullif(current_setting('app.current_org_id',true),'')::uuid $$;
   CREATE FUNCTION current_legal_entity_id() RETURNS uuid LANGUAGE sql STABLE AS $$ SELECT nullif(current_setting('app.current_legal_entity_id',true),'')::uuid $$;
   CREATE TABLE audit_log(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),actor text,action text,entity_type text,entity_id uuid,goal_id uuid,after_ref jsonb,source text,authority_class text,result text,timestamp timestamptz DEFAULT now());
   CREATE TABLE legal_entities(id uuid PRIMARY KEY,org_id uuid);
   CREATE TABLE goals(id uuid PRIMARY KEY,company_scope uuid,state text,current_plan_id uuid);
   CREATE TABLE work_queue(id uuid PRIMARY KEY,goal_id uuid,plan_id uuid,capability_id text,status text,lease_owner text,lease_expiry timestamptz,lease_timestamp timestamptz,fencing_token bigint DEFAULT 1,worker_version text,queued_at timestamptz DEFAULT now(),wake_reason text,attempt int DEFAULT 0,handoff jsonb);
   CREATE TABLE executions(id uuid PRIMARY KEY,queue_id uuid,goal_id uuid,plan_id uuid,actor text,result jsonb,evidence jsonb,started_at timestamptz DEFAULT now(),finished_at timestamptz,plan_hash text,execution_hash text);
   CREATE TABLE verifications(id uuid PRIMARY KEY,execution_id uuid,result text,verifier text,checked_at timestamptz DEFAULT now(),plan_hash text,execution_hash text);
   CREATE TABLE model_calls(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),legal_entity_id uuid DEFAULT current_legal_entity_id(),task text,provider text,model text,model_version text,reason_selected text,tokens int,cost float,latency_ms int,retry_count int,success boolean,verification_result text,data_classification text,created_at timestamptz DEFAULT now());`);
  await c.query('SELECT set_config($1,$2,false),set_config($3,$4,false)',['app.current_org_id',org,'app.current_legal_entity_id',entity]);
  await c.query('INSERT INTO legal_entities VALUES($1,$3),($2,$3)',[entity,foreign,org]);
  await c.query("INSERT INTO goals VALUES($1,$3,'EXECUTING',$5),($2,$4,'EXECUTING',$5)",[goal,otherGoal,entity,foreign,plan]);
  let snapshot=await companyStaffSnapshot(c,owner);assert.equal(snapshot.availability,'MIGRATION_REQUIRED');
  for(const file of ['00014_company_staff.sql','00015_company_model_attribution.sql','00016_company_skill_guards.sql'])await db.exec(readFileSync('packages/db/migrations/'+file,'utf8'));
  const queue=id(10),execution=id(11),verification=id(12),staleQueue=id(13),foreignQueue=id(14);
  await c.query("INSERT INTO work_queue(id,goal_id,plan_id,capability_id,status,handoff) VALUES($1,$2,$3,'bol_get_offer','EXECUTED',$4)",[queue,goal,plan,{agent_id:'marketplace'}]);
  await assignCompanyWork(c,owner,{queueId:queue,profileId:'marketplace'});
  await assert.rejects(assignCompanyWork(c,owner,{queueId:queue,profileId:'accountant'}),/ASSIGNMENT_DENIED/);
  await c.query("INSERT INTO work_queue(id,goal_id,plan_id,capability_id,status,lease_expiry,company_profile_id,wake_reason) VALUES($1,$2,$3,'gmail_read','LEASED',now()-interval '1 minute','negotiation','LEASE_EXPIRED')",[staleQueue,goal,plan]);
  await c.query("INSERT INTO work_queue(id,goal_id,plan_id,capability_id,status,company_profile_id) VALUES($1,$2,$3,'bol_get_offer','EXECUTED','marketplace')",[foreignQueue,otherGoal,plan]);
  await assert.rejects(assignCompanyWork(c,owner,{queueId:foreignQueue,profileId:'marketplace'}),/ASSIGNMENT_DENIED/);
  await c.query("INSERT INTO executions(id,queue_id,goal_id,plan_id,actor,result,evidence,finished_at,plan_hash,execution_hash) VALUES($1,$2,$3,$4,'marketplace@1',$5,$6,now(),'plan-hash','execution-hash')",[execution,queue,goal,plan,{quote:'verified fixture value'},{specialist_agent_id:'marketplace'}]);
  await c.query("INSERT INTO verifications(id,execution_id,result,verifier,plan_hash,execution_hash) VALUES($1,$2,'VERIFIED','independent-fixture','plan-hash','execution-hash')",[verification,execution]);
  const call=await recordModelCall(c,{task:'specialist_reasoning',queueId:queue,provider:'fixture',model:'fixture',reasonSelected:'FIXTURE',costUsd:0.125,success:true,latencyMs:1,retryCount:0,dataClassification:'INTERNAL'});
  await recordModelCall(c,{task:'unattributed-fixture',provider:'fixture',model:'fixture',reasonSelected:'FIXTURE',costUsd:9,success:true,latencyMs:1,retryCount:0,dataClassification:'INTERNAL'});
  snapshot=await companyStaffSnapshot(c,owner);
  const market=snapshot.profiles.find(p=>p.id==='marketplace')!;
  assert.equal(market.work.length,1);assert.equal(market.work[0].execution_id,execution);assert.equal(market.work[0].verification_id,verification);
  assert.equal(market.work[0].progress.verified,1);assert.equal(market.performance?.verified,1);assert.equal(market.cost.amount,0.125);assert.deepEqual(market.cost.ledgerCallIds,[call]);assert.equal(market.performance?.rank,null);
  assert.equal(snapshot.profiles.find(p=>p.id==='negotiation')!.state,'STALE');assert.equal(snapshot.incidents[0].queueId,staleQueue);
  await assert.rejects(companyStaffSnapshot(c,{...owner,legalEntityId:foreign}),/AUTHORIZED_COMPANY/);
  await db.exec(`CREATE TABLE specialist_learning(id uuid PRIMARY KEY,statement text,detail jsonb,execution_id uuid,verification_id uuid,expires_at timestamptz,legal_entity_id uuid,goal_id uuid,kind text,created_at timestamptz DEFAULT now());`);
  for(const [n,kind,scope,expiry] of [[20,'VERIFIED_LESSON',entity,"now()+interval '1 day'"],[21,'HYPOTHESIS',entity,"now()+interval '1 day'"],[22,'VERIFIED_LESSON',entity,"now()-interval '1 day'"],[23,'VERIFIED_LESSON',foreign,"now()+interval '1 day'"]] as const){
   await c.query(`INSERT INTO specialist_learning VALUES($1,'verified fixture value','{}',$2,$3,${expiry},$4,$5,$6,now())`,[id(n),execution,verification,scope,goal,kind]);
  }
  const beforeForeign=(await c.query('SELECT count(*)::int count FROM model_calls')).rows[0].count;
  await assert.rejects(recordModelCall(c,{task:'foreign-rejected',queueId:foreignQueue,provider:'fixture',model:'fixture',reasonSelected:'FIXTURE',costUsd:0.1,success:true,latencyMs:1,retryCount:0,dataClassification:'INTERNAL'}),/ATTRIBUTION_DENIED/);
  assert.equal((await c.query('SELECT count(*)::int count FROM model_calls')).rows[0].count,beforeForeign);
  const originalConnect=pool.connect,originalFlag=process.env.SAM_COMPANY_ENABLED;
  (pool as any).connect=async()=>({...c,release(){}});process.env.SAM_COMPANY_ENABLED='1';
  const http=await startCommandCenterHttpServer({legalEntityId:entity,port:0,host:'127.0.0.1',bearerToken:'synthetic-office-fixture'});
  try{
   await db.exec(`CREATE TABLE model_providers(provider_id text,models jsonb,capabilities jsonb,cost_per_1k_input float,cost_per_1k_output float,privacy_class_allowed jsonb,health text);
    INSERT INTO model_providers VALUES('gateway-fixture','["fixture"]','["bounded"]',0.01,0.02,'["INTERNAL"]','HEALTHY');`);
   const gateway=new ModelGateway({'gateway-fixture':{providerId:'gateway-fixture',executionMode:'synthetic',supportsUsageLimits:true,async invoke(){return {model:'fixture',usage:{inputTokens:10,outputTokens:20},output:{fixture:true}};}}});
   await gateway.invoke({task:'bounded',capability:'bounded',ledgerQueueId:queue,input:{fixture:true},dataClassification:'INTERNAL',boundedSynthetic:{maxInputTokens:1000,maxOutputTokens:100,async reserveAttempt(){}}});
   const linked=(await c.query('SELECT m.cost FROM model_calls m JOIN company_model_call_attributions a ON a.model_call_id=m.id WHERE m.provider=$1',['gateway-fixture'])).rows;
   assert.equal(linked.length,1);assert.equal(linked[0].cost,0.0005);
   const failedGateway=new ModelGateway({'gateway-fixture':{providerId:'gateway-fixture',executionMode:'synthetic',supportsUsageLimits:true,async invoke(){throw Error('SYNTHETIC_PROVIDER_FAILURE');}}});
   await assert.rejects(failedGateway.invoke({task:'bounded',capability:'bounded',ledgerQueueId:queue,input:{fixture:true},dataClassification:'INTERNAL',boundedSynthetic:{maxInputTokens:1000,maxOutputTokens:100,async reserveAttempt(){}}}),/SYNTHETIC_PROVIDER_FAILURE/);
   const partial=(await companyStaffSnapshot(c,owner)).profiles.find(p=>p.id==='marketplace')!;
   assert.equal(partial.cost.status,'PARTIAL_ATTRIBUTED_SUBTOTAL');assert.equal(partial.cost.unknownCalls,1);
   const address=http.server.address();assert.ok(address&&typeof address!=='string');const base='http://127.0.0.1:'+address.port;
   const html=await (await fetch(base+'/')).text();assert.match(html,/data-company-enabled="true"/);
   const anonymous=await fetch(base+'/api/company/office');assert.equal(anonymous.status,401);
   const response=await fetch(base+'/api/company/office',{headers:{authorization:'Bearer synthetic-office-fixture'}});
   assert.equal(response.status,200);const payload=await response.json();assert.equal(payload.data.companyId,entity);assert.equal(payload.data.profiles.length,15);
   assert.equal(payload.data.profiles.find((p:any)=>p.id==='marketplace').work[0].execution_id,execution);
   const forged=await fetch(base+'/api/company/office?company='+foreign,{headers:{authorization:'Bearer synthetic-office-fixture'}});assert.equal(forged.status,400);
  }finally{await http.close();pool.connect=originalConnect;if(originalFlag===undefined)delete process.env.SAM_COMPANY_ENABLED;else process.env.SAM_COMPANY_ENABLED=originalFlag;}
  const memory=await companyProfileMemory(c,owner,'marketplace','fixture');assert.equal(memory.records.length,1);assert.equal(memory.records[0].id,id(20));
  assert.equal((await companyProfileMemory(c,owner,'content','fixture')).records.length,0);
  await c.query("UPDATE verifications SET verifier='marketplace@1' WHERE id=$1",[verification]);
  assert.equal((await companyStaffSnapshot(c,owner)).profiles.find(p=>p.id==='marketplace')!.performance?.verified,0);
  assert.equal((await companyProfileMemory(c,owner,'marketplace','fixture')).records.length,0);
  await c.query("UPDATE verifications SET verifier='independent-fixture',execution_hash='different' WHERE id=$1",[verification]);
  assert.equal((await companyStaffSnapshot(c,owner)).profiles.find(p=>p.id==='marketplace')!.work[0].progress.verified,0);
  const proposal=await proposeCompanySkill(c,{...owner,actor:'proposer'},{profileId:'developer',sourceUrl:'https://github.com/fixture/project',commit:'a'.repeat(40),hash:'b'.repeat(64),rollbackRef:'disable-fixture-skill'});
  const checks=Object.fromEntries(SKILL_REVIEW_CHECKS.map(key=>[key,true]));
  await assert.rejects(adoptCompanySkill(c,owner,{id:proposal.id,hash:proposal.source_hash,approved:true}),/ADOPTION_DENIED/);
  await assert.rejects(reviewCompanySkill(c,{...owner,actor:'proposer'},{id:proposal.id,hash:proposal.source_hash,checks,evidence:'fixture review'}),/REVIEW_DENIED/);
  await assert.rejects(reviewCompanySkill(c,{...owner,actor:'reviewer'},{id:proposal.id,hash:proposal.source_hash,checks:{...checks,secrets:false},evidence:'fixture review'}),/SECURITY_REVIEW_REQUIRED/);
  // Exercise the actual SQL trigger, bypassing the application's checks.
  for(const state of ['REVIEWED','ADOPTED'])for(const review of [{evidence:'evidence without checks'},{evidence:'null checks',checks:null},{evidence:'non-object checks',checks:[]},{evidence:'incomplete checks',checks:{source:true}}]){
   await assert.rejects(c.query(`UPDATE company_skill_proposals SET state=$2,review=$3::jsonb,reviewed_by='reviewer',reviewed_hash=source_hash,adopted_by=CASE WHEN $2='ADOPTED' THEN 'owner-fixture' ELSE NULL END WHERE id=$1`,[proposal.id,state,JSON.stringify(review)]),/SKILL_SECURITY_REVIEW_REQUIRED/);
  }
  await reviewCompanySkill(c,{...owner,actor:'reviewer'},{id:proposal.id,hash:proposal.source_hash,checks,evidence:'fixture license/dependency/secret/isolation/evaluation evidence'});
  const adopted=await adoptCompanySkill(c,owner,{id:proposal.id,hash:proposal.source_hash,approved:true});assert.equal(adopted.state,'ADOPTED');assert.match(adopted.execution,/NOT_INSTALLED/);
  await c.query("UPDATE company_skill_proposals SET source_commit=$2 WHERE id=$1",[proposal.id,'c'.repeat(40)]);
  assert.equal((await c.query('SELECT * FROM company_skill_proposals WHERE id=$1',[proposal.id])).rows[0].state,'QUARANTINED');
  await assert.rejects(adoptCompanySkill(c,owner,{id:proposal.id,hash:proposal.source_hash,approved:true}),/ADOPTION_DENIED/);
  await replaceCompanySkillSource(c,owner,{id:proposal.id,commit:'d'.repeat(40),hash:'e'.repeat(64)});
  await assert.rejects(reviewCompanySkill(c,{...owner,actor:'reviewer'},{id:proposal.id,hash:proposal.source_hash,checks,evidence:'stale pin'}),/REVIEW_DENIED/);
  assert.equal((await c.query("SELECT count(*)::int count FROM audit_log WHERE action LIKE 'COMPANY_SKILL_%'")).rows[0].count,4);
  const pins=(await c.query("SELECT after_ref FROM audit_log WHERE action='COMPANY_SKILL_PIN_REPLACED'")).rows[0].after_ref;
  assert.equal(pins.previous.commit,'c'.repeat(40));assert.equal(pins.current.commit,'d'.repeat(40));assert.equal(pins.current.state,'QUARANTINED');
  const skillView=(await companyStaffSnapshot(c,owner)).profiles.find(p=>p.id==='developer')!;
  assert.equal(skillView.skills[0].execution,'NOT_INSTALLED');assert.equal(skillView.skills[0].reviewCurrent,false);
  // Five independent document results with real linked fixture ledger rows.
  for(let n=0;n<5;n++){
   const q=id(100+n),e=id(110+n),v=id(120+n);
   await c.query("INSERT INTO work_queue(id,goal_id,plan_id,capability_id,status,company_profile_id) VALUES($1,$2,$3,'drive_get_metadata','EXECUTED','content')",[q,goal,plan]);
   await c.query("INSERT INTO executions(id,queue_id,goal_id,plan_id,actor,result,evidence,finished_at,plan_hash,execution_hash) VALUES($1,$2,$3,$4,'documents@1','{}',$5,now(),'p','e')",[e,q,goal,plan,{specialist_agent_id:'documents'}]);
   await c.query("INSERT INTO verifications(id,execution_id,result,verifier,plan_hash,execution_hash) VALUES($1,$2,'VERIFIED','independent-documents','p','e')",[v,e]);
   await recordModelCall(c,{task:'document-fixture',queueId:q,provider:'fixture',model:'fixture',reasonSelected:'FIXTURE',costUsd:0.01,success:true,latencyMs:1,retryCount:0,dataClassification:'INTERNAL'});
  }
  const reviewRef=(await c.query("INSERT INTO audit_log(actor,action,entity_type,entity_id) VALUES('independent-reviewer','PERFORMANCE_REVIEW_EVIDENCE','legal_entity',$1) RETURNING id",[entity])).rows[0].id;
  let content=(await companyStaffSnapshot(c,owner)).profiles.find(p=>p.id==='content')!;assert.equal(content.performance.rank,null);assert.equal(content.performance.ledgerCoverageEligible,true);
  const assessmentInput={profileId:'content',sourceHash:content.performance.sourceHash,approved:true,completeCostCoverage:true,authorityBreaches:0,evidenceRefs:[reviewRef]};
  await assert.rejects(assessCompanyPerformance(c,{...owner,actor:'documents@1'},assessmentInput),/SOURCE_REVIEW_DENIED/);
  await assert.rejects(assessCompanyPerformance(c,owner,{...assessmentInput,completeCostCoverage:false}),/REVIEW_REQUIRED/);
  await assert.rejects(assessCompanyPerformance(c,owner,{...assessmentInput,evidenceRefs:[id(900)]}),/EVIDENCE_REQUIRED/);
  const assessment=await assessCompanyPerformance(c,owner,assessmentInput);assert.equal((await assessCompanyPerformance(c,owner,assessmentInput)).id,assessment.id);
  content=(await companyStaffSnapshot(c,owner)).profiles.find(p=>p.id==='content')!;assert.equal(content.performance.label,'متدرّب');assert.equal(content.performance.permissionsChanged,false);
  await c.query("UPDATE executions SET result='{\"changed\":true}' WHERE id=$1",[id(110)]);
  assert.equal((await companyStaffSnapshot(c,owner)).profiles.find(p=>p.id==='content')!.performance.rank,null);
  await c.query("UPDATE executions SET result='{}' WHERE id=$1",[id(110)]);
  await c.query("UPDATE verifications SET result='FAILED' WHERE id=$1",[id(120)]);
  content=(await companyStaffSnapshot(c,owner)).profiles.find(p=>p.id==='content')!;assert.equal(content.performance.rank,null);assert.equal(content.performance.assessment,null);
  // Restricted-role RLS, without a production GRANT or bypass role.
  await db.exec(`CREATE ROLE company_fixture_reader;GRANT USAGE ON SCHEMA public TO company_fixture_reader;GRANT SELECT,INSERT,UPDATE ON company_skill_proposals,company_model_call_attributions TO company_fixture_reader;GRANT SELECT ON work_queue,goals,model_calls TO company_fixture_reader;`);
  await c.query('SELECT set_config($1,$2,false)',['app.current_legal_entity_id',foreign]);
  await db.exec('SET ROLE company_fixture_reader');
  assert.equal((await c.query('SELECT * FROM company_skill_proposals')).rows.length,0);
  assert.equal((await c.query('SELECT * FROM company_model_call_attributions')).rows.length,0);
  await assert.rejects(c.query("INSERT INTO company_model_call_attributions VALUES($1,$2,$3,now())",[id(99),queue,entity]),/row-level security/);
 }finally{await db.close();}
});
