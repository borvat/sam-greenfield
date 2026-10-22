import {createOwnerGoal} from '../../apps/command-center/src/store';
import {transitionGoalAtomic} from '../../apps/kernel/src/stateMachine';
import assert from 'node:assert/strict';
import {pool} from '../../packages/db/src/client';
import {persistPlanAndDelegateAtomic} from '../../apps/kernel/src/planning';
import {validateProductionBundle} from '../../apps/production/src/bundle';
import {createToolExecutors} from '../../apps/tools/src/executorFactory';
import {runOneSpecialistWork} from '../../apps/agents/src/runtime';
import {verifyNextExecution} from '../../apps/production/src/verifier';
import {assertReleaseDatabaseSafety} from '../../packages/db/src/releaseSafety';
import {assertRuntimeTenantBinding} from '../../packages/db/src/runtimeAccess';
async function main(){
 await assertReleaseDatabaseSafety(pool);
 await assertRuntimeTenantBinding(pool);
 const tenant=(await pool.query('SELECT current_legal_entity_id() entity')).rows[0].entity;
 const created=await createOwnerGoal(tenant,{objective:'Restricted synthetic workflow',authorityCeiling:'GREEN',acceptanceContract:{version:1,constraints:[{capabilityId:'echo',params:{value:42},result:{field:'value',equals:42}}]}});
 const g=created.id;
 await transitionGoalAtomic(g,'NEW','MODELING','test_observe');await transitionGoalAtomic(g,'MODELING','PLANNING','test_plan');
 await persistPlanAndDelegateAtomic({goalId:g,steps:[{capabilityId:'echo',params:{value:42}}]});
 const bundle=validateProductionBundle({capabilities:[{capabilityId:'echo',authorityClass:'GREEN',specialistAgentId:'local',specialistVersion:'1'}],toolDefinitions:[{capabilityId:'echo',authorityClass:'GREEN',sideEffect:false}],toolAdapters:[{capabilityId:'echo',async execute(){return {result:{value:42},evidence:{readback:true}};}}],verificationAdapters:[{capabilityId:'echo',async verify(){return {result:'VERIFIED',evidence:{value:42,readback:true},verifier:'independent'};}}]});
 await runOneSpecialistWork({agent:bundle.catalog.specialists.getAgent('local'),workerInstanceId:'restricted',ttlSeconds:10,executors:createToolExecutors({catalog:bundle.catalog,tools:bundle.tools})});
 await verifyNextExecution(bundle);
 assert.equal((await pool.query('SELECT state FROM goals WHERE id=$1',[g])).rows[0].state,'COMPLETED');
}
main().then(()=>pool.end()).catch(async e=>{console.error(e);await pool.end();process.exitCode=1;});
