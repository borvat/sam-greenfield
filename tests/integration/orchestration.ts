import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {randomUUID} from 'node:crypto';
import {pool} from '../../packages/db/src/client';
import {applyIntegrationProfile,provisionIntegrationAccess} from '../../packages/db/src/integrationProfile';
import {persistPlanAndDelegateAtomic} from '../../apps/kernel/src/planning';
import {runOneSpecialistWork} from '../../apps/agents/src/runtime';
import {recordIndependentVerificationAtomic} from '../../apps/kernel/src/verification';
import {captureVerifiedKnowledge} from '../../apps/brain/src/knowledge';
async function main(){
 const c=await pool.connect(),role='sam_integration_'+process.pid;let created=false;
 try{
  await applyIntegrationProfile(c);
  const schema=(await c.query('SELECT current_schema() s')).rows[0].s;assert(/^core_[0-9_]+$/.test(schema));
  const org=randomUUID(),entity=randomUUID(),foreign=randomUUID(),orgB=randomUUID(),entityB=randomUUID();
  await c.query("INSERT INTO organizations(id,name) VALUES($1,'Synthetic A'),($2,'Synthetic B')",[org,orgB]);
  await c.query("INSERT INTO legal_entities(id,org_id,name) VALUES($1,$2,'A'),($3,$2,'Sibling'),($4,$5,'B')",[entity,org,foreign,entityB,orgB]);
  await c.query(`CREATE ROLE ${role} LOGIN PASSWORD 'synthetic-integration-only' NOSUPERUSER NOCREATEDB NOCREATEROLE NOBYPASSRLS`);created=true;
  await c.query('BEGIN');try{await provisionIntegrationAccess(c,{schema,role,orgId:org,legalEntityId:entity});await c.query('COMMIT');}catch(e){await c.query('ROLLBACK');throw e;}
  await c.query("INSERT INTO notification_settings(id,enabled_at) VALUES('owner',now()-interval '1 minute')");
  await c.query("INSERT INTO model_providers(provider_id,models,capabilities,privacy_class_allowed,health,cost_per_1k_input,cost_per_1k_output) VALUES('integration-fixture','[\"fixture\"]','[\"planning\"]','[\"INTERNAL\"]','HEALTHY',0,0)");
  for(const cap of ['research_mcp_fixture_terms','decision_summarize']){
   await c.query('INSERT INTO entity_capability_bindings(legal_entity_id,capability_id,enabled) VALUES($1,$2,true)',[entity,cap]);
   await c.query(`INSERT INTO verification_contracts(capability_id,description,verification_method,required_evidence_fields,independent_query_template)
    VALUES($1,'Synthetic independent verification','api_readback',$2::jsonb,'{}')`,[cap,cap.startsWith('research_')?'{"freshHash":"string","executionHash":"string"}':'{"readback":"boolean","value":"number"}']);
  }
  const goal=(await c.query(`INSERT INTO goals(business_id,company_scope,objective,state,authority_ceiling,completion_definition)
   VALUES('INTEGRATION-MAIN',$1,'Research FixtureBox supply cost and produce one consolidated executive report','NEW','GREEN','sam.read_report.v1') RETURNING id`,[entity])).rows[0].id;
  const source=(await c.query(`INSERT INTO perception_sources(legal_entity_id,provider,capability_id,params,projection_paths,enabled,next_poll_at)
   VALUES($1,'OSS','research_mcp_fixture_terms','{}','["/price"]',true,now()+interval '1 day') RETURNING id`,[entity])).rows[0].id;
  await c.query('INSERT INTO perception_polls(source_id,goal_id) VALUES($1,$2)',[source,goal]);
  await c.query("INSERT INTO goals(business_id,company_scope,objective,state,authority_ceiling) VALUES('FOREIGN-SIBLING',$1,'Forbidden sibling','NEW','GREEN'),('FOREIGN-ORG',$2,'Forbidden org','NEW','GREEN')",[foreign,entityB]);
  const target=new URL(process.env.DATABASE_URL!);target.username=role;target.password='synthetic-integration-only';target.searchParams.set('options',`-c search_path=${schema},public -c app.current_org_id=${org} -c app.current_legal_entity_id=${entity}`);
  const run=(mode:string)=>{
   const r=spawnSync(process.execPath,['--import','tsx','tests/integration/scenario-worker.ts',mode],{env:{PATH:process.env.PATH,DATABASE_URL:target.href,
    SAM_INTEGRATION_ENABLED:'1',SAM_KNOWLEDGE_ENABLED:'true',SAM_NOTIFICATIONS_ENABLED:'true',SAM_PERCEPTION_ACTION_ENABLED:'true',
    FIXTURE_ENTITY:entity,FIXTURE_FOREIGN:foreign,FIXTURE_GOAL:goal,FIXTURE_SOURCE:source},encoding:'utf8',timeout:40000});
   process.stdout.write(r.stdout+r.stderr);assert.equal(r.status,0,'restricted worker '+mode);
  };
  run('execute');
  // Populate real foreign feature rows, not only empty foreign IDs, so the
  // negative checks can detect an actual missing RLS fence.
  const contract=(await c.query(`INSERT INTO verification_contracts(capability_id,description,verification_method,required_evidence_fields,independent_query_template)
   VALUES('foreign_fixture_read','Foreign synthetic fixture','db_query','{"readback":"boolean"}','{}') RETURNING id`)).rows[0].id;
  process.env.SAM_INTEGRATION_ENABLED='1';process.env.SAM_KNOWLEDGE_ENABLED='true';
  for(const tenant of [foreign,entityB]){
   const foreignGoal=(await c.query("UPDATE goals SET state='PLANNING' WHERE company_scope=$1 RETURNING id",[tenant])).rows[0].id;
   await persistPlanAndDelegateAtomic({goalId:foreignGoal,steps:[{capabilityId:'foreign_fixture_read',params:{}}]});
   const execution=await runOneSpecialistWork({agent:{agentId:'foreign-fixture',version:'1',capabilities:['foreign_fixture_read']},workerInstanceId:'tenant-seed',ttlSeconds:5,
    executors:{foreign_fixture_read:async()=>({result:{text:'FixtureBox forbidden foreign source'},evidence:{readback:true}})}});
   await recordIndependentVerificationAtomic({executionId:execution.executionId!,verifier:'foreign-fixture',contractId:contract,independentEvidence:{readback:true},result:'VERIFIED'});
   await captureVerifiedKnowledge(c,foreignGoal,[{executionId:execution.executionId!,quote:'FixtureBox forbidden foreign source'}],r=>r.text);
   await c.query(`INSERT INTO owner_notifications(legal_entity_id,goal_id,dedup_key,kind,severity,title,body)
    VALUES($1,$2,$3,'COMPLETED','INFO','Foreign fixture','{}')`,[tenant,foreignGoal,'foreign:'+tenant]);
  }
  run('recall');
  await c.query(`INSERT INTO verifications(execution_id,verifier,method,contract_id,independent_evidence,result,plan_hash,execution_hash,checked_at)
   SELECT execution_id,'revocation-fixture',method,contract_id,'{}','FAILED',plan_hash,execution_hash,now()+interval '1 second' FROM verifications
   WHERE id IN(SELECT verification_id FROM knowledge_records)`);
  run('revoked');
  await c.query(`DROP POLICY "integration_fence_${role}" ON knowledge_records`);run('admission-denied');
  console.log('INTEGRATION_ACCEPTANCE PASS: restricted LOGIN, real ModelGateway/kernel, dependent specialist handoffs, failure/replan/retry, single report, atomic learning, cold process recall, revocation, same-org/cross-org isolation; zero external actions');
 }finally{if(created){await c.query('DROP OWNED BY '+role);await c.query('DROP ROLE '+role);}c.release();await pool.end();}
}
main().catch(async e=>{console.error(e);await pool.end();process.exitCode=1;});
