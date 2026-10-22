import assert from 'node:assert/strict';
import {pool} from '../../packages/db/src/client';
import {persistPlanAndDelegateAtomic} from '../../apps/kernel/src/planning';
import {runOneSpecialistWork} from '../../apps/agents/src/runtime';
import {createToolExecutors} from '../../apps/tools/src/executorFactory';
import {verifyNextExecution} from '../../apps/production/src/verifier';
import {learnNextVerifiedExecution} from '../../apps/production/src/learning';
import {validateProductionBundle} from '../../apps/production/src/bundle';
import {reviewFixture} from './reviewFixture';
async function main(){
 const f=await reviewFixture();
 await pool.query(`INSERT INTO verification_contracts(capability_id,description,verification_method,required_evidence_fields,independent_query_template)
 VALUES('review_echo','Synthetic independent check','db_query','{"readback":"boolean"}','{}')`);
 const bundle=validateProductionBundle({...f.bundle.raw,verifiedLearning:{capabilityIds:['review_echo'],project(){return [{attribute:'synthetic',value:true}];}},
 verificationAdapters:[{capabilityId:'review_echo',async verify(){return {result:'VERIFIED' as const,evidence:{readback:true},verifier:'review-independent'};}}]});
 const unfinished=await f.goal('unfinished','PLANNING'),finished=await f.goal('finished','PLANNING');
 const old=await persistPlanAndDelegateAtomic({goalId:unfinished,steps:[{capabilityId:'review_echo',params:{}},{capabilityId:'review_echo',params:{}}]});
 await pool.query("UPDATE work_queue SET due_at=now()+interval '1 day' WHERE id=$1",[old.queueIds[1]]);
 const agent=bundle.catalog.specialists.getAgent('review'),executors=createToolExecutors({catalog:bundle.catalog,tools:bundle.tools});
 await runOneSpecialistWork({agent,workerInstanceId:'first',ttlSeconds:30,executors});await verifyNextExecution(bundle);
 assert.equal((await pool.query('SELECT state FROM goals WHERE id=$1',[unfinished])).rows[0].state,'EXECUTING');
 await persistPlanAndDelegateAtomic({goalId:finished,steps:[{capabilityId:'review_echo',params:{}}]});
 await runOneSpecialistWork({agent,workerInstanceId:'second',ttlSeconds:30,executors});await verifyNextExecution(bundle);
 assert.equal((await pool.query('SELECT state FROM goals WHERE id=$1',[finished])).rows[0].state,'COMPLETED');
 assert.equal((await learnNextVerifiedExecution(bundle)).processed,true);
 const source=(await pool.query('SELECT source FROM world_facts')).rows;
 assert.equal(source.length,1);
 assert.equal((await pool.query("SELECT count(*)::int n FROM executions WHERE goal_id=$1 AND 'verified_execution:'||id::text=$2",[finished,source[0].source])).rows[0].n,1);
 console.log('PASS unfinished legacy goal does not starve learning from a completed verified goal');
 await pool.end();
}
main().catch(async e=>{console.error(e);await pool.end();process.exitCode=1;});
