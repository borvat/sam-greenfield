import {contentHash} from '../../apps/agents/src/evaluation/harness';
import assert from 'node:assert/strict';
import {pool} from '../../packages/db/src/client';
import {applyEvaluationProfile,evaluationManifest,enrollEvaluationCompany} from '../../packages/db/src/evaluationProfile';
import {createEvaluationTrial,appendTrialEvent,zero} from '../../apps/agents/src/evaluation/trial';
import {ceiling} from '../../apps/agents/src/intelligence/contracts';
import {publicCases} from '../../apps/agents/src/evaluation/cases';
import {sha256Hex} from '../../packages/shared/src/stableJson';
import {applyIntegrationProfile} from '../../packages/db/src/integrationProfile';
import {randomUUID} from 'node:crypto';
async function main(){
 const url=new URL(process.env.DATABASE_URL!);assert.equal(url.hostname,'127.0.0.1');assert.equal(url.pathname,'/sam_core_test_lifecycle');
 const c=await pool.connect();try{
 if(process.argv[2]==='prepare'){
  await applyIntegrationProfile(c);
  await applyEvaluationProfile(c);
  const org=(await c.query("INSERT INTO organizations(name) VALUES('Synthetic evaluation restart') RETURNING id")).rows[0].id;
  const entity=(await c.query("INSERT INTO legal_entities(org_id,name) VALUES($1,'Synthetic evaluation restart') RETURNING id",[org])).rows[0].id;await enrollEvaluationCompany(c,entity);
  const goal=(await c.query("INSERT INTO goals(business_id,company_scope,objective,state) VALUES('PHASE7-RESTART',$1,'Synthetic restart sentinel','NEW') RETURNING id",[entity])).rows[0].id;
  const spec={version:1 as const,mode:'fixture' as const,syntheticOnly:true as const,commit:process.env.SAM_VERIFICATION_SOURCE_SHA!,caseId:'industrial-refrigeration',corpusHash:contentHash(publicCases()),companyId:entity,rootCapabilityId:'specialist.executive',limits:ceiling,agents:{'executive-bootstrap':ceiling},prices:[{providerId:'fixture',model:'fixture',inputPer1k:0.001,outputPer1k:0.001}],capabilityHash:'f'.repeat(64)};
  const id=await createEvaluationTrial(c,{rootGoalId:goal,spec});
  await c.query('BEGIN');const used={...zero(),models:1,tokens:32000,costUsd:0.032};
  await c.query(`UPDATE evaluation_trials SET used=$2,agent_used=$3,agent_deadlines=$4 WHERE id=$1`,[id,JSON.stringify(used),JSON.stringify({'executive-bootstrap':used}),JSON.stringify({'executive-bootstrap':new Date(Date.now()+200000).toISOString()})]);
  await appendTrialEvent(c,id,'RESERVED',{agentId:'executive-bootstrap',goalId:goal,kind:'model',reserved:used},randomUUID());await c.query('COMMIT');
 }else assert.equal(process.argv[2],'after-restart');
 const t=(await c.query("SELECT t.* FROM evaluation_trials t JOIN goals g ON g.id=t.root_goal_id WHERE g.business_id='PHASE7-RESTART'")).rows[0];
 assert.deepEqual(t.used,{models:1,tools:0,iterations:0,tokens:32000,costUsd:0.032,delegations:0});assert.deepEqual(t.agent_used['executive-bootstrap'],t.used);assert(t.agent_deadlines['executive-bootstrap']);
 const e=(await c.query('SELECT * FROM evaluation_events WHERE trial_id=$1',[t.id])).rows;assert.equal(e.length,1);assert.equal(e[0].kind,'RESERVED');assert.equal(e[0].previous_hash,'0'.repeat(64));
 assert.equal((await c.query('SELECT sha256 FROM sam_evaluation_migrations')).rows[0].sha256,evaluationManifest().sha256);
 await assert.rejects(()=>c.query("UPDATE evaluation_trials SET used=jsonb_set(used,'{models}','0') WHERE id=$1",[t.id]),/BUDGET_DENIED/);
 console.log('EVALUATION_POSTGRES_RESTART PASS',process.argv[2],'root budget, uncertain reservation, agent deadline, hash chain and migration receipt retained; no live provider');
 }finally{c.release();await pool.end();}
}
main().catch(e=>{console.error(e);process.exitCode=1;});
