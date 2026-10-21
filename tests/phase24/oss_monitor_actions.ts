import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,readFile,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {randomUUID} from 'node:crypto';
import {lab} from './lab';
import {buildOssStdioReadBundle} from '../../apps/production/src/ossStdioBundle';
import {withOssFileAction} from '../../apps/production/src/ossFileAction';
import {validateProductionBundle} from '../../apps/production/src/bundle';
import {createToolExecutors} from '../../apps/tools/src/executorFactory';
import {runPerceptionTick} from '../../apps/perception/src/monitor';
import {scopedCatalog} from '../../apps/perception/src/policy';
import {runCatalogPlanningCycle,runCatalogSpecialistTick} from '../../apps/agents/src/executiveFlow';
import {verifyNextExecution} from '../../apps/production/src/verifier';
import {reviewNextReadGoal} from '../../apps/production/src/readGoalReview';
import {createGoal} from '../../apps/production/src/dispatcher';
import {persistPlanAndStartExecution} from '../../apps/kernel/src/orchestrator';
import {reconcileOneSideEffectAtomic} from '../../apps/tools/src/reconciler';
import {sha256Hex} from '../../packages/shared/src/stableJson';
import {pool} from '../../packages/db/src/client';
const root=process.env.SAM_OSS_LAB_ROOT;

test('actual upstream file -> SAM goal/planner/worker/verifier/report -> persistent observation and one change event; guarded SAM write/reconcile/dedup', {skip:!root},async()=>{
 const l=await lab(),work=await mkdtemp(join(tmpdir(),'sam-stage-')),source=join(work,'orders.json'),target=join(work,'report.txt');
 const pin=JSON.parse(await readFile('integrations/oss-mcp/reviewed-tools.json','utf8'));
 const actionPin=JSON.parse(await readFile('integrations/oss-mcp/reviewed-file-action.json','utf8'));
 const serverEntry=resolve(root!,'oss-mcp-lab/node_modules/@modelcontextprotocol/server-filesystem/dist/index.js');
 const readCap='research_mcp_monitor_files_read_text_file';
 await writeFile(source,'{"orders":2,"stock":10}\n');
 const added=await buildOssStdioReadBundle({capabilities:[],toolDefinitions:[],toolAdapters:[]},[{id:'monitor_files',companyId:l.entity,command:process.execPath,args:[serverEntry,work],package:'@modelcontextprotocol/server-filesystem',version:'2.0.0',repository:'https://github.com/modelcontextprotocol/servers/tree/main/src/filesystem',tools:pin.filesystem.filter((t:any)=>t.name==='read_text_file'),parameterConstraints:{read_text_file:{path:{type:'string',enum:[source,target]}}}}]);
 const bundle=validateProductionBundle(await withOssFileAction(added.bundle,{companyId:l.entity,root:work,target,serverEntry,reviewedWriteSchema:actionPin.write_file,reviewedReadSchema:actionPin.read_text_file}));
 process.env.SAM_PERCEPTION_ACTION_ENABLED='true';
 try{
  for(const [cap,write] of [[readCap,false],['oss_files_write_report',true]])await l.db.query('INSERT INTO entity_capability_bindings VALUES($1,$2,true,$3)',[l.entity,cap,write]);
  const sourceId=(await l.db.query("INSERT INTO perception_sources(legal_entity_id,provider,capability_id,params,enabled) VALUES($1,'OSS',$2,$3,true) RETURNING id",[l.entity,readCap,{path:source}])).rows[0].id;
  const executors=createToolExecutors({catalog:bundle.catalog,tools:bundle.tools});
  async function cycle(){
   await l.db.query('UPDATE perception_sources SET next_poll_at=now() WHERE id=$1',[sourceId]);
   assert.equal((await runPerceptionTick(bundle)).queued,1);
   const goal:any=(await l.db.query('SELECT g.* FROM goals g JOIN perception_polls p ON p.goal_id=g.id ORDER BY g.created_at DESC LIMIT 1')).rows[0];
   const catalog=await scopedCatalog(l.db,bundle.catalog,goal.id);
   const gateway:any={invoke:async()=>({result:{output:{steps:[{capabilityId:readCap,params:{path:source}}]}}})};
   await runCatalogPlanningCycle({catalog,gateway,goalId:goal.id,dataClassification:'INTERNAL',maxCostUsd:.1});
   const executed=await runCatalogSpecialistTick({catalog:bundle.catalog,workerInstanceId:'isolated',ttlSeconds:60,executors});assert.equal(executed.processed,true);
   assert.equal((await verifyNextExecution(bundle)).processed,true);
   const review=await reviewNextReadGoal(bundle,pool,async(input:any)=>{
    if(input.proposedReport)return {accepted:true,missing:[]};
    const observation=input.verifiedObservations[0];
    return {status:'complete',summary:'Bounded source observation',requirements:[{requirement:'Read source',fulfilled:true,evidenceIds:[observation.id]}],findings:[{text:'Observed source snapshot',executionId:observation.id,quoteLine:0}],limitations:['Isolated synthetic source'],steps:[]};
   });
   assert.equal((await l.db.query('SELECT state FROM goals WHERE id=$1',[goal.id])).rows[0].state,'COMPLETED',JSON.stringify(review));
   // Not due now: capture only, without queueing another task.
   await l.db.query("UPDATE perception_sources SET next_poll_at=now()+interval '1 hour' WHERE id=$1",[sourceId]);
   assert.equal((await runPerceptionTick(bundle)).observations,1);
  }
  await cycle();await cycle();await writeFile(source,'{"orders":3,"stock":9}\n');await cycle();
  assert.deepEqual((await l.db.query('SELECT classification FROM perception_observations ORDER BY observed_at')).rows.map((r:any)=>r.classification),['BASELINE','UNCHANGED','CHANGED']);
  assert.equal((await l.db.query("SELECT * FROM event_fabric_events WHERE event_type='PERCEPTION_ATTENTION'")).rows.length,1);
  assert.equal((await runPerceptionTick(bundle)).observations,0);
  // Source contents cannot add a write approval. Approval is a separate fixture owner record.
  const goal=await createGoal({legalEntityId:l.entity,objective:'Write the exact isolated report',actor:'fixture-owner',authorityCeiling:'YELLOW'});
  await l.db.query("UPDATE goals SET state='PLANNING' WHERE id=$1",[goal.id]);
  const params={path:target,content:'SAM approved local action report.\n'};
  await persistPlanAndStartExecution({goalId:goal.id,steps:[{capabilityId:'oss_files_write_report',params}]});
  async function claim(){const r:any=(await l.db.query("UPDATE work_queue SET status='LEASED',lease_expiry=now()+interval '5 minutes' WHERE goal_id=$1 RETURNING *",[goal.id])).rows[0];return {queueId:r.id,goalId:goal.id,planId:r.plan_id,capabilityId:r.capability_id,params:r.params,fencingToken:Number(r.fencing_token)}}
  const claimed=await claim(),execute=executors.oss_files_write_report;
  await assert.rejects(execute(claimed),/APPROVAL_REQUIRED/);
  assert.equal((await l.db.query('SELECT * FROM side_effect_operations WHERE goal_id=$1',[goal.id])).rows.length,0);
  const other=await createGoal({legalEntityId:l.entity,objective:'Other goal',actor:'fixture-owner',authorityCeiling:'YELLOW'});
  const approval=(await l.db.query("INSERT INTO approvals(goal_id,capability_id,params_hash,legal_entity_id,expiry_at,authority_class,status,approved_by) VALUES($1,'oss_files_write_report',$2,$3,now()+interval '1 hour','YELLOW','APPROVED','fixture-owner') RETURNING id",[other.id,sha256Hex(params),l.entity])).rows[0].id;
  await assert.rejects(execute(claimed),/APPROVAL_REQUIRED/);
  await l.db.query('UPDATE approvals SET goal_id=$2 WHERE id=$1',[approval,goal.id]);
  const outcome=await execute(claimed);assert.equal(await readFile(target,'utf8'),params.content);
  const operationKey=String(outcome.evidence.operation_key);
  assert.equal(await reconcileOneSideEffectAtomic({tools:bundle.tools,operationKey}),'CONFIRMED');
  const replay=await execute(claimed);assert.equal(replay.result.deduplicated,true);
  assert.equal((await l.db.query('SELECT used_count FROM approvals WHERE id=$1',[approval])).rows[0].used_count,1);
  assert.equal((await l.db.query('SELECT attempt FROM side_effect_operations WHERE operation_key=$1',[operationKey])).rows[0].attempt,1);
  const verifier=bundle.verifiers.get('oss_files_write_report')!;
  const input:any={execution:{id:randomUUID(),legalEntityId:l.entity,capabilityId:'oss_files_write_report',params,evidence:outcome.evidence},contract:{method:'api_readback'}};
  assert.equal((await verifier.verify(input)).result,'VERIFIED');
  await writeFile(target,'changed externally');assert.equal((await verifier.verify(input)).result,'INCONCLUSIVE');
  const uncertain=await createGoal({legalEntityId:l.entity,objective:'Isolated outcome recovery',actor:'fixture-owner',authorityCeiling:'YELLOW'});
  await l.db.query("UPDATE goals SET state='PLANNING' WHERE id=$1",[uncertain.id]);
  const uncertainParams={path:target,content:'An actual file write with a lost receipt.\n'};
  await persistPlanAndStartExecution({goalId:uncertain.id,steps:[{capabilityId:'oss_files_write_report',params:uncertainParams}]});
  await l.db.query("INSERT INTO approvals(goal_id,capability_id,params_hash,legal_entity_id,expiry_at,authority_class,status,approved_by) VALUES($1,'oss_files_write_report',$2,$3,now()+interval '1 hour','YELLOW','APPROVED','fixture-owner')",[uncertain.id,sha256Hex(uncertainParams),l.entity]);
  const uncertainRow:any=(await l.db.query("UPDATE work_queue SET status='LEASED',lease_expiry=now()+interval '5 minutes' WHERE goal_id=$1 RETURNING *",[uncertain.id])).rows[0];
  const uncertainWork={queueId:uncertainRow.id,goalId:uncertain.id,planId:uncertainRow.plan_id,capabilityId:'oss_files_write_report',params:uncertainParams,fencingToken:Number(uncertainRow.fencing_token)};
  const actual=bundle.tools.adapter('oss_files_write_report');let writes=0;
  const interrupted=validateProductionBundle({...bundle.raw,toolAdapters:bundle.raw.toolAdapters.map(adapter=>adapter.capabilityId!=='oss_files_write_report'?adapter:{capabilityId:adapter.capabilityId,execute:async(request)=>{writes++;await actual.execute(request);throw new Error('simulated lost receipt')}})});
  const interruptedExecutor=createToolExecutors({catalog:interrupted.catalog,tools:interrupted.tools}).oss_files_write_report;
  await assert.rejects(interruptedExecutor(uncertainWork),/lost receipt/);
  const op:any=(await l.db.query('SELECT * FROM side_effect_operations WHERE goal_id=$1',[uncertain.id])).rows[0];
  assert.equal(op.state,'PENDING');assert.equal(op.reconciliation_state,'NEEDS_RECONCILIATION');
  await assert.rejects(interruptedExecutor(uncertainWork),/reconciliation required/);assert.equal(writes,1);
  // A fresh server/adapter reconstructs expected state from the durable SAM ledger.
  const reconstructed=validateProductionBundle(await withOssFileAction({capabilities:[],toolDefinitions:[],toolAdapters:[]},{companyId:l.entity,root:work,target,serverEntry,reviewedWriteSchema:actionPin.write_file,reviewedReadSchema:actionPin.read_text_file}));
  try{assert.equal(await reconcileOneSideEffectAtomic({tools:reconstructed.tools,operationKey:op.operation_key}),'CONFIRMED')}finally{await reconstructed.raw.closeIntegrations?.()}
  const freshQueue:any=(await l.db.query("INSERT INTO work_queue(goal_id,plan_id,capability_id,params,status,lease_expiry) VALUES($1,$2,'oss_files_write_report',$3,'LEASED',now()+interval '5 minutes') RETURNING *",[uncertain.id,uncertainRow.plan_id,uncertainParams])).rows[0];
  assert.equal((await interruptedExecutor({...uncertainWork,queueId:freshQueue.id,fencingToken:Number(freshQueue.fencing_token)})).result.deduplicated,true);assert.equal(writes,1);
  assert.equal((await l.db.query("SELECT * FROM outbox_events WHERE event_type='SIDE_EFFECT_OUTCOME_UNKNOWN'")).rows.length,1);
  const classes=(await l.db.query('SELECT classification FROM perception_observations ORDER BY observed_at')).rows.map((row:any)=>row.classification);
  await writeFile('docs/acceptance/oss-workflow-evidence.json',JSON.stringify({capturedAt:new Date().toISOString(),productionChanged:false,realUpstreamMcp:true,model:'deterministic test gateway',database:'isolated PGlite; advisory locking stubbed',pollIntervals:'simulated by advancing due timestamp; not elapsed scheduling proof',sourceClassifications:classes,attentionEvents:(await l.db.query("SELECT * FROM event_fabric_events WHERE event_type='PERCEPTION_ATTENTION'")).rows.length,normalAction:'written, independently verified and reconciled',tamperedResult:'INCONCLUSIVE',approval:'fixture owner records, exact company/goal/params',unknownOutcome:'actual write then simulated lost receipt; fresh adapter readback CONFIRMED',replannedQueueReplay:'deduplicated with no second provider write',ownerDelivery:'internal event/outbox only; no external notification channel'},null,2)+'\n');

 }finally{delete process.env.SAM_PERCEPTION_ACTION_ENABLED;await bundle.raw.closeIntegrations?.();await l.close();await rm(work,{recursive:true,force:true})}
});
