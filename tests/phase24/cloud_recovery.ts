import test from 'node:test';
import assert from 'node:assert/strict';
import {lab} from './lab';
import {buildCloudReadOnlyBundle} from '../../apps/production/src/cloudReadOnlyBundle';
import {validateProductionBundle} from '../../apps/production/src/bundle';
import {createGoal} from '../../apps/production/src/dispatcher';
import {runCatalogPlanningCycle,runCatalogReplanCycle,runCatalogSpecialistTick} from '../../apps/agents/src/executiveFlow';
import {createToolExecutors} from '../../apps/tools/src/executorFactory';
import {verifyNextExecution} from '../../apps/production/src/verifier';
import {reviewNextReadGoal} from '../../apps/production/src/readGoalReview';
import {assessCloudRecovery,type CloudRecoveryTrial} from '../../apps/production/src/cloudAcceptance';
import {ScopedCloudReadUnavailableError,isScopedCloudReadUnavailable} from '../../packages/shared/src/readSourceFailure';
import {pool} from '../../packages/db/src/client';
const props={owner:{type:'string'},repo:{type:'string'}};
const tool=(name:string,p:any)=>({name,description:'Reviewed fixture read',inputSchema:{type:'object',properties:p,required:Object.keys(p),additionalProperties:false}});

test('mechanism only: failed cloud read -> same-goal bounded replan -> two-provider verification, report and memory',async()=>{
 const l=await lab();process.env.SAM_KNOWLEDGE_ENABLED='true';
 const scope={companyId:l.entity,repository:{owner:'fixture',name:'repo'},workspaceId:'tea-fixture',serviceIds:['srv-fixture']};
 const manifest={version:1,servers:[{serverId:'github',companyId:l.entity,domain:'github',endpoint:'https://api.githubcopilot.com/mcp/readonly',credentialEnv:'SAM_MCP_SECRET_GITHUB',tools:[tool('list_commits',props),tool('get_commit',{...props,sha:{type:'string'}})]},{serverId:'render',companyId:l.entity,domain:'render',endpoint:'https://mcp.render.com/mcp',credentialEnv:'SAM_MCP_SECRET_RENDER',tools:[tool('get_service',{workspaceId:{type:'string'},serviceId:{type:'string'}})]}]};
 let fault=true;const calls:string[]=[];
 const factory:any=async(server:any)=>({close:async()=>{},client:{listTools:async()=>({tools:server.tools}),callTool:async(args:any)=>{
  calls.push(args.name);
  if(args.name==='list_commits'&&fault){fault=false;throw new Error('fixture unavailable')}
  return {content:[{type:'text',text:server.domain==='github'?'Repository fixture revision abc123':'Hosted fixture revision abc123'}]};
 }}});
 const expansion=await buildCloudReadOnlyBundle({capabilities:[],toolDefinitions:[],toolAdapters:[]},JSON.stringify(manifest),scope,{SAM_MCP_SECRET_GITHUB:'fixture',SAM_MCP_SECRET_RENDER:'fixture'},factory);
 try{
  const bundle=validateProductionBundle(expansion.bundle),executors=createToolExecutors({catalog:bundle.catalog,tools:bundle.tools});
  const goal=await createGoal({legalEntityId:l.entity,objective:'Compare repository revision and hosting state, documenting missing evidence',actor:'fixture',authorityCeiling:'GREEN',completionDefinition:'sam.read_report.v1'});
  const gh={capabilityId:'research_mcp_github_list_commits',params:{owner:'fixture',repo:'repo'}},rd={capabilityId:'research_mcp_render_get_service',params:{workspaceId:'tea-fixture',serviceId:'srv-fixture'}};
  const gateway:any={invoke:async()=>({result:{output:{steps:[gh,rd]}}})};
  await runCatalogPlanningCycle({catalog:bundle.catalog,gateway,goalId:goal.id,dataClassification:'INTERNAL',maxCostUsd:.1});
  // Deterministic fixture ordering exercises the pending healthy-sibling path;
  // the live acceptance runner never supplies a tool order.
  await l.db.query('UPDATE work_queue SET priority=100 WHERE goal_id=$1 AND capability_id=$2',[goal.id,gh.capabilityId]);
  const tick=()=>runCatalogSpecialistTick({catalog:bundle.catalog,executors,workerInstanceId:'fixture',ttlSeconds:60});
  await tick();assert.equal((await l.db.query('SELECT state FROM goals WHERE id=$1',[goal.id])).rows[0].state,'REPLANNING');
  const history:any=(await l.db.query("SELECT after_ref FROM audit_log WHERE goal_id=$1 AND action='RUNTIME_RECOVERY_REQUESTED'",[goal.id])).rows[0].after_ref;
  assert.equal(history.error_code,'SCOPED_CLOUD_READ_UNAVAILABLE');assert.equal(history.capability_id,gh.capabilityId);
  assert.equal((await l.db.query("SELECT * FROM work_queue WHERE goal_id=$1 AND wake_reason='READ_ONLY_SOURCE_REPLAN_SKIPPED'",[goal.id])).rows.length,1);
  const alternate={capabilityId:'research_mcp_github_get_commit',params:{owner:'fixture',repo:'repo',sha:'abc123'}};
  let forbidden:any[]=[];
  const replan:any={invoke:async(input:any)=>{forbidden=input.input.forbiddenReadSteps;return {result:{output:{steps:[alternate,rd]}}}}};
  await runCatalogReplanCycle({catalog:bundle.catalog,gateway:replan,goalId:goal.id,reason:'source unavailable',dataClassification:'INTERNAL',maxCostUsd:.1});
  assert.deepEqual(forbidden,[gh],'unexecuted healthy siblings remain eligible; exact failed request stays forbidden');
  for(let i=0;i<4;i++){await tick();await verifyNextExecution(bundle)}
  const debug={goal:(await l.db.query('SELECT state,current_plan_id FROM goals WHERE id=$1',[goal.id])).rows,work:(await l.db.query('SELECT capability_id,status,wake_reason,plan_id FROM work_queue WHERE goal_id=$1',[goal.id])).rows,verification:(await l.db.query('SELECT result FROM verifications')).rows};
  assert.equal(debug.goal[0].state,'VERIFYING',JSON.stringify(debug));
  const review=await reviewNextReadGoal(bundle,pool,async(input:any)=>{
   if(input.proposedReport)return {accepted:true,missing:[]};
   assert.equal(input.failedReadAttempts.length,1);
   const evidence=input.verifiedObservations;
   return {status:'complete',summary:'Compared fixture revisions using alternate repository read and hosting read',requirements:[{requirement:'Both sources compared',fulfilled:true,evidenceIds:evidence.map((s:any)=>s.id)}],findings:evidence.map((s:any)=>({text:'Fixture revision evidence',executionId:s.id,quoteLine:0})),limitations:['SCOPED_CLOUD_READ_UNAVAILABLE: initial read failed; alternate read used'],steps:[]};
  });
  assert.equal(review.status,'complete',JSON.stringify(review));
  const state:any=(await l.db.query('SELECT state,replan_attempts FROM goals WHERE id=$1',[goal.id])).rows[0];assert.equal(state.state,'COMPLETED');assert.equal(Number(state.replan_attempts),1);
  assert.equal((await l.db.query('SELECT * FROM knowledge_records WHERE goal_id=$1',[goal.id])).rows.length,2);
  assert.equal(calls.filter(x=>x==='list_commits').length,1,'failed read was never replayed');
  assert.equal((await l.db.query('SELECT * FROM goals')).rows.length,1,'same goal throughout recovery');
  const exhausted=await createGoal({legalEntityId:l.entity,objective:'Compare repository and hosting state',actor:'fixture',authorityCeiling:'GREEN',completionDefinition:'sam.read_report.v1'});
  await runCatalogPlanningCycle({catalog:bundle.catalog,gateway,goalId:exhausted.id,dataClassification:'INTERNAL',maxCostUsd:.1});
  await l.db.query('UPDATE goals SET replan_attempts=2 WHERE id=$1',[exhausted.id]);fault=true;
  await l.db.query('UPDATE work_queue SET priority=100 WHERE goal_id=$1 AND capability_id=$2',[exhausted.id,gh.capabilityId]);
  await tick();
  assert.equal((await l.db.query('SELECT state FROM goals WHERE id=$1',[exhausted.id])).rows[0].state,'FAILED','exhausted recovery budget stays terminal');
  assert.equal((await l.db.query("SELECT * FROM audit_log WHERE goal_id=$1 AND action='RUNTIME_RECOVERY_REQUESTED'",[exhausted.id])).rows.length,0);
 }finally{delete process.env.SAM_KNOWLEDGE_ENABLED;await expansion.close();await l.close()}
});

test('acceptance rejects replacement goals, repeated faults, no cross-provider progress or no model replan; error text is not a recovery grant',()=>{
 const valid:CloudRecoveryTrial={goalId:'same',failedGoalId:'same',state:'COMPLETED',faults:1,replans:1,modelCallsAfterFault:2,verifiedGithub:1,verifiedRender:1,verifiedAfterFaultOnOtherServer:1,memory:2,report:true,limitationRecorded:true,selectedByModel:true};
 assert.equal(assessCloudRecovery(valid),true);assert.equal(assessCloudRecovery(undefined),false);
 for(const patch of [{failedGoalId:'replacement'},{state:'FAILED'},{faults:0},{faults:2},{replans:0},{replans:3},{modelCallsAfterFault:0},{verifiedGithub:0},{verifiedRender:0},{verifiedAfterFaultOnOtherServer:0},{memory:0},{report:false},{limitationRecorded:false},{selectedByModel:false}])assert.equal(assessCloudRecovery({...valid,...patch}),false);
 const cap='research_mcp_github_list_commits';
 assert.equal(isScopedCloudReadUnavailable(cap,new Error('SCOPED_CLOUD_READ_UNAVAILABLE')),false);
 assert.equal(isScopedCloudReadUnavailable('other',new ScopedCloudReadUnavailableError(cap)),false);
 assert.equal(isScopedCloudReadUnavailable(cap,new ScopedCloudReadUnavailableError(cap)),true);
});
