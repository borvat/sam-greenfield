import {pool} from '../../packages/db/src/client';
import {validateProductionBundle} from '../../apps/production/src/bundle';
import {createToolExecutors} from '../../apps/tools/src/executorFactory';
import {runOneSpecialistWork} from '../../apps/agents/src/runtime';
const bundle=validateProductionBundle({capabilities:[{capabilityId:'side',authorityClass:'YELLOW',specialistAgentId:'side-agent',specialistVersion:'1'}],toolDefinitions:[{capabilityId:'side',authorityClass:'YELLOW',sideEffect:true}],toolAdapters:[{capabilityId:'side',async execute(){
 await pool.query(`INSERT INTO audit_log(actor,goal_id,action,entity_type,entity_id,source,authority_class,result) VALUES('fixture',$1,'FIXTURE_PROVIDER_SENT','goal',$1,'local','GREEN','SENT')`,[process.env.TEST_GOAL_ID]);
 process.exit(72); // Real process loss between provider commit and ledger receipt.
}}]});
runOneSpecialistWork({agent:bundle.catalog.specialists.getAgent('side-agent'),workerInstanceId:'crash-child',ttlSeconds:1,executors:createToolExecutors({catalog:bundle.catalog,tools:bundle.tools})}).catch(async e=>{console.error(e);await pool.end();process.exitCode=1;});
