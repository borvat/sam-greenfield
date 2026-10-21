// Actual database restart sentinel; process recovery is separately exercised
// with SIGKILL in acceptance.ts. This does not call or simulate a live model.
import assert from 'node:assert/strict';
import {pool} from '../../packages/db/src/client';
import {applySpecialistProfile,specialistManifest} from '../../packages/db/src/specialistProfile';
import {persistPlanAndDelegateAtomic} from '../../apps/kernel/src/planning';
import {ceiling} from '../../apps/agents/src/intelligence/contracts';
async function main(){
 const url=new URL(process.env.DATABASE_URL!);assert.equal(url.hostname,'127.0.0.1');assert.equal(url.pathname,'/sam_core_test_lifecycle');
 const c=await pool.connect();try{
 if(process.argv[2]==='prepare'){
  await applySpecialistProfile(c);
  const org=(await c.query("INSERT INTO organizations(name) VALUES('Specialist restart sentinel') RETURNING id")).rows[0].id;
  const entity=(await c.query("INSERT INTO legal_entities(org_id,name) VALUES($1,'Specialist restart sentinel') RETURNING id",[org])).rows[0].id;
  const goal=(await c.query("INSERT INTO goals(business_id,company_scope,objective,state,authority_ceiling) VALUES('P5-RESTART-SENTINEL',$1,'Specialist state persistence sentinel','PLANNING','GREEN') RETURNING id",[entity])).rows[0].id;
  const {queueIds}=await persistPlanAndDelegateAtomic({goalId:goal,steps:[{capabilityId:'specialist.executive',params:{objective:'restart sentinel'}}]});
  await c.query(`INSERT INTO specialist_budgets(root_queue_id,legal_entity_id,limits,used,deadline) VALUES($1,$2,$3,'{"models":2,"tools":1,"iterations":2,"tokens":64000,"costUsd":0.064,"delegations":1}',now()+interval '1 hour')`,[queueIds[0],entity,JSON.stringify(ceiling)]);
  await c.query(`INSERT INTO specialist_sessions(queue_id,root_queue_id,legal_entity_id,agent_id,config_hash,depth,used,deadline,state) VALUES($1,$1,$2,'restart-sentinel','fixture-sentinel',0,'{"models":1,"tools":1,"iterations":1,"tokens":32000,"costUsd":0.032,"delegations":1}',now()+interval '1 hour','{"phase":"MODEL_PENDING","children":[],"history":[{"reservation":"uncertain-do-not-refund"}]}')`,[queueIds[0],entity]);
 }else assert.equal(process.argv[2],'after-restart');
 const r=(await c.query(`SELECT b.used,s.used agent_used,s.state FROM specialist_budgets b JOIN specialist_sessions s USING(root_queue_id)
  JOIN work_queue w ON w.id=s.queue_id JOIN goals g ON g.id=w.goal_id WHERE g.business_id='P5-RESTART-SENTINEL'`)).rows[0];
 assert.deepEqual(r.used,{models:2,tools:1,iterations:2,tokens:64000,costUsd:0.064,delegations:1});
 assert.deepEqual(r.agent_used,{models:1,tools:1,iterations:1,tokens:32000,costUsd:0.032,delegations:1});
 assert.deepEqual(r.state,{phase:'MODEL_PENDING',children:[],history:[{reservation:'uncertain-do-not-refund'}]});
 assert.equal((await c.query('SELECT sha256 FROM sam_specialist_migrations')).rows[0].sha256,specialistManifest().sha256);
 console.log('SPECIALIST_POSTGRES_RESTART PASS',process.argv[2],'durable counters, pending reasoning state and migration receipt retained; no live models');
 }finally{c.release();}
}
main().catch(e=>{console.error(e);process.exitCode=1;}).finally(()=>pool.end());
