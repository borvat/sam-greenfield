import {readFile,writeFile,readdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {cloudPrerequisites,fixedCloudRevision,assessCloudTrials,assessCloudRecovery,type CloudTrial} from '../apps/production/src/cloudAcceptance';
const hash=(v:unknown)=>createHash('sha256').update(JSON.stringify(v)).digest('hex');
async function main(){
 const reportPath=process.env.SAM_CLOUD_REPORT;
 if(!reportPath||!reportPath.startsWith('/'))throw new Error('CLOUD_ABSOLUTE_REPORT_PATH_REQUIRED');
 const report:any={capturedAt:new Date().toISOString(),state:'BLOCKED',productionChanged:false,liveAccepted:false,trials:[]};
 let pool:any,expansion:any;
 try{
  const missing=cloudPrerequisites(process.env);report.missing=missing;
  if(missing.length){await writeFile(reportPath,JSON.stringify(report,null,2)+'\n');process.exitCode=2;return}
  report.commit=fixedCloudRevision(process.env.SAM_CLOUD_REVISION!);
  const database=new URL(process.env.SAM_CLOUD_DB_URL!);
  if(!['postgres:','postgresql:'].includes(database.protocol)||!['127.0.0.1','localhost','[::1]'].includes(database.hostname)||!/^\/sam_cloud_acceptance_[a-z0-9_]+$/.test(database.pathname))throw new Error('CLOUD_LOCAL_ISOLATED_DATABASE_REQUIRED');
  // No fallback to the production DATABASE_URL, default bundle or connector credentials.
  process.env.DATABASE_URL=database.href;
  process.env.SAM_KNOWLEDGE_ENABLED='true';process.env.SAM_NOTIFICATIONS_ENABLED='true';
  process.env.SAM_PERCEPTION_ACTION_ENABLED='false';process.env.SAM_NOTIFICATION_DELIVERY_ENABLED='false';
  const {pool:db}=await import('../packages/db/src/client');pool=db;
  const counts=await pool.query('SELECT count(*)::int AS n FROM goals');
  if(counts.rows[0].n!==0)throw new Error('CLOUD_DATABASE_MUST_BE_FRESH');
  // Existing migration runner must have initialized this explicit disposable DB.
  const migrations=await pool.query('SELECT filename,sha256 FROM sam_schema_migrations');
  const actual=new Map(migrations.rows.map((m:any)=>[m.filename,m.sha256]));
  const files=(await readdir('packages/db/migrations')).filter(f=>f.endsWith('.sql'));
  if(actual.size!==files.length)throw new Error('CLOUD_DATABASE_SCHEMA_MISMATCH');
  for(const file of files){const digest=createHash('sha256').update(await readFile('packages/db/migrations/'+file)).digest('hex');if(actual.get(file)!==digest)throw new Error('CLOUD_DATABASE_SCHEMA_MISMATCH')}
  const scope=JSON.parse(await readFile(process.env.SAM_CLOUD_SCOPE!,'utf8'));
  const manifest=await readFile(process.env.SAM_CLOUD_MANIFEST!,'utf8');
  const {buildCloudReadOnlyBundle}=await import('../apps/production/src/cloudReadOnlyBundle');
  let activeGoal='';let singleFaultArmed=false;let injectedFault:any;
  const {connectScopedMcp}=await import('../apps/production/src/scopedMcpBundle');
  const faultableConnect:typeof connectScopedMcp=async(server,token)=>{
   const connection=await connectScopedMcp(server,token);
   return {close:connection.close,client:{listTools:(args)=>connection.client.listTools(args),callTool:async(args,...rest)=>{
    if(singleFaultArmed&&server.domain==='github'&&!injectedFault){
     injectedFault={goalId:activeGoal,serverId:server.serverId,capabilityId:'research_mcp_'+server.serverId+'_'+args.name,at:new Date().toISOString()};
     throw new Error('CLOUD_LAB_ONE_READ_UNAVAILABLE');
    }
    return connection.client.callTool(args,...rest);
   }}};
  };
  expansion=await buildCloudReadOnlyBundle({capabilities:[],toolDefinitions:[],toolAdapters:[]},manifest,scope,process.env,faultableConnect);
  const {withStandardModelProvidersFromEnv}=await import('../apps/production/src/standardModels');
  const {validateProductionBundle}=await import('../apps/production/src/bundle');
  const raw=withStandardModelProvidersFromEnv(expansion.bundle);
  if(raw.modelAdapters?.length!==1)throw new Error('CLOUD_LIVE_MODEL_REQUIRED');
  const choices=new Map<string,number>();const selected=new Map<string,Set<string>>();
  raw.modelAdapters=raw.modelAdapters.map(adapter=>({providerId:adapter.providerId,async invoke(task,model){
   fixedCloudRevision(report.commit);
   const result=await adapter.invoke(task,model);
   // Record actual model choices, never replace them with predetermined steps.
   await pool.query(`INSERT INTO audit_log(actor,goal_id,action,source,after_ref,result) VALUES('cloud-acceptance',$1,'CLOUD_LIVE_MODEL_OUTPUT','cloud_lab',$2,'RECORDED')`,[activeGoal,{provider:adapter.providerId,model:result.model,version:result.modelVersion??null,inputHash:hash(task.input),outputHash:hash(result.output),output:result.output}]);
   const output:any=result.output;
   const caps=selected.get(activeGoal)??new Set<string>();
   for(const step of output?.steps??[])if(typeof step.capabilityId==='string')caps.add(step.capabilityId);
   selected.set(activeGoal,caps);
   choices.set(activeGoal,(choices.get(activeGoal)??0)+1);return result;
  }}));
  raw.planningMaxCostUsd=.10;
  const bundle=validateProductionBundle(raw);
  if(bundle.raw.capabilities.some(c=>c.sideEffect!==false||c.authorityClass!=='GREEN'))throw new Error('CLOUD_READS_ONLY');
  const {syncProductionModelRegistry}=await import('../apps/production/src/modelRegistry');await syncProductionModelRegistry(raw.modelProviderConfigs??[]);
  const org=(await pool.query("INSERT INTO organizations(name) VALUES('Isolated SAM cloud acceptance') RETURNING id")).rows[0];
  await pool.query("INSERT INTO legal_entities(id,org_id,name) VALUES($1,$2,'Isolated scoped company')",[scope.companyId,org.id]);
  await pool.query("INSERT INTO notification_settings(id) VALUES('owner')");
  const {createGoal}=await import('../apps/production/src/dispatcher');
  const {createProductionComposition}=await import('../apps/production/src/composition');
  const runtime=createProductionComposition({bundle,workerId:'cloud-acceptance'});
  report.manifestHash=hash(JSON.parse(manifest));report.scopeHash=hash(scope);
  const intents=[
   'Assess the current repository and hosting state, citing both sources.',
   'Check recent integration activity and the current hosted application state.',
   'Review recent test outcomes and deployment outcomes; explain any uncertainty.',
   'Compare the repository revision evidence with the hosted revision evidence.',
   'Inspect current pull requests and current deployment readiness.',
   'Review the latest code changes and whether hosting reflects them.',
   'Assess repository workflow health together with hosting health.',
   'Produce a fresh repository and deployment evidence report.',
   'Check for discrepancies between repository activity and hosting activity.',
   'Independently recheck repository and hosting status with fresh sources.'
  ];
  const resources=`Repository ${scope.repository.owner}/${scope.repository.name}; workspace ${scope.workspaceId}; service IDs ${scope.serviceIds.join(', ')}. Read only. No external actions. Address both systems with fresh evidence.`;
  for(const intent of intents){
   fixedCloudRevision(report.commit);
   const goal=await createGoal({legalEntityId:scope.companyId,objective:intent+' '+resources,actor:'cloud-acceptance',authorityCeiling:'GREEN',completionDefinition:'sam.read_report.v1',domain:'cloud_acceptance'});
   activeGoal=goal.id;
   const until=Date.now()+240000;
   while(Date.now()<until){
    await runtime.runWorkTick();
    const state=(await pool.query('SELECT state FROM goals WHERE id=$1',[goal.id])).rows[0].state;
    if(['COMPLETED','FAILED','WAITING_OWNER','BLOCKED','CANCELLED'].includes(state))break;
   }
   const state=(await pool.query('SELECT state FROM goals WHERE id=$1',[goal.id])).rows[0].state;
   const executions=await pool.query(`SELECT e.capability_id,v.result FROM executions e LEFT JOIN LATERAL(SELECT result FROM verifications WHERE execution_id=e.id ORDER BY checked_at DESC,id DESC LIMIT 1)v ON true WHERE e.goal_id=$1`,[goal.id]);
   const githubIds=new Set(expansion.inventory.filter((s:any)=>s.domain==='github').flatMap((s:any)=>s.capabilities));
   const renderIds=new Set(expansion.inventory.filter((s:any)=>s.domain==='render').flatMap((s:any)=>s.capabilities));
   const verified=(ids:Set<any>)=>executions.rows.filter((r:any)=>ids.has(r.capability_id)&&r.result==='VERIFIED').length;
   const memories=(await pool.query('SELECT e.capability_id FROM knowledge_records k JOIN executions e ON e.id=k.execution_id WHERE k.goal_id=$1',[goal.id])).rows;
   const trial:CloudTrial={goalId:goal.id,state,liveChoices:choices.get(goal.id)??0,modelSelectedAllExecuted:executions.rows.length>0&&executions.rows.every((r:any)=>selected.get(goal.id)?.has(r.capability_id)),githubMemory:memories.filter((m:any)=>githubIds.has(m.capability_id)).length,renderMemory:memories.filter((m:any)=>renderIds.has(m.capability_id)).length,githubVerified:verified(githubIds),renderVerified:verified(renderIds),unverified:executions.rows.filter((r:any)=>r.result!=='VERIFIED').length,memory:Number((await pool.query('SELECT count(*) FROM knowledge_records WHERE goal_id=$1',[goal.id])).rows[0].count),report:!!(await pool.query("SELECT id FROM goal_read_reviews WHERE goal_id=$1 AND decision->>'status'='complete'",[goal.id])).rowCount};
   report.trials.push(trial);
   // Persist incomplete history too. One failed attempt invalidates this sequence.
   await writeFile(reportPath,JSON.stringify(report,null,2)+'\n');
   if(!assessCloudTrials([trial],1))break;
  }
  fixedCloudRevision(report.commit);
  report.sequencePassed=assessCloudTrials(report.trials);
  if(report.sequencePassed){
   const recovery=await createGoal({legalEntityId:scope.companyId,objective:'Compare repository revision and hosting state in one evidence report. If a source is temporarily unavailable, seek another permitted source and document the interruption and remaining limitations. If recovery occurs, include its exact recorded error code in report limitations. '+resources,actor:'cloud-acceptance',authorityCeiling:'GREEN',completionDefinition:'sam.read_report.v1',domain:'cloud_acceptance_recovery'});
   activeGoal=recovery.id;singleFaultArmed=true;
   for(let tick=0;tick<30;tick++){
    fixedCloudRevision(report.commit);await runtime.runWorkTick();
    const state=(await pool.query('SELECT state FROM goals WHERE id=$1',[recovery.id])).rows[0].state;
    if(['FAILED','COMPLETED','WAITING_OWNER','BLOCKED','WAITING_EXTERNAL'].includes(state))break;
   }
   singleFaultArmed=false;
   const goal=(await pool.query('SELECT state,replan_attempts FROM goals WHERE id=$1',[recovery.id])).rows[0];
   const audit=(await pool.query("SELECT after_ref,timestamp FROM audit_log WHERE goal_id=$1 AND action='RUNTIME_RECOVERY_REQUESTED' ORDER BY timestamp,id",[recovery.id])).rows;
   const executions=(await pool.query(`SELECT e.id,e.capability_id,e.started_at,v.result FROM executions e LEFT JOIN LATERAL(SELECT result FROM verifications WHERE execution_id=e.id ORDER BY checked_at DESC,id DESC LIMIT 1)v ON true WHERE e.goal_id=$1`,[recovery.id])).rows;
   const domain=(cap:string)=>expansion.inventory.find((i:any)=>i.capabilities.includes(cap))?.domain;
   const final=(await pool.query("SELECT decision FROM goal_read_reviews WHERE goal_id=$1 AND decision->>'status'='complete' ORDER BY created_at DESC,id DESC LIMIT 1",[recovery.id])).rows[0]?.decision;
   const models=(await pool.query("SELECT timestamp FROM audit_log WHERE goal_id=$1 AND action='CLOUD_LIVE_MODEL_OUTPUT'",[recovery.id])).rows;
   report.recoveryTrial={goalId:recovery.id,state:goal.state,failedGoalId:injectedFault?.goalId??'',faults:audit.filter((a:any)=>a.after_ref.queue_id&&a.after_ref.capability_id===injectedFault?.capabilityId).length,replans:Number(goal.replan_attempts),modelCallsAfterFault:models.filter((m:any)=>injectedFault&&new Date(m.timestamp)>=new Date(injectedFault.at)).length,verifiedGithub:executions.filter((e:any)=>domain(e.capability_id)==='github'&&e.result==='VERIFIED').length,verifiedRender:executions.filter((e:any)=>domain(e.capability_id)==='render'&&e.result==='VERIFIED').length,verifiedAfterFaultOnOtherServer:executions.filter((e:any)=>domain(e.capability_id)==='render'&&e.result==='VERIFIED'&&injectedFault&&new Date(e.started_at)>=new Date(injectedFault.at)).length,memory:Number((await pool.query('SELECT count(*) FROM knowledge_records WHERE goal_id=$1',[recovery.id])).rows[0].count),report:!!final,limitationRecorded:!!final?.limitations?.some((s:any)=>typeof s==='string'&&s.includes('SCOPED_CLOUD_READ_UNAVAILABLE')),selectedByModel:!!injectedFault&&!!selected.get(recovery.id)?.has(injectedFault.capabilityId)&&executions.length>0&&executions.every((e:any)=>selected.get(recovery.id)?.has(e.capability_id))};
   report.recoveryFault=injectedFault??null;
   report.recoveryPassed=assessCloudRecovery(report.recoveryTrial);
   await writeFile(reportPath,JSON.stringify(report,null,2)+'\n');
  }
  if(report.sequencePassed&&report.recoveryPassed){
   // Fault injection affects only this process's isolated MCP sessions. It does
   // not stop/restart/change a GitHub or Render resource.
   await expansion.close();
   const fault=await createGoal({legalEntityId:scope.companyId,objective:'Recheck repository and hosting availability with fresh evidence. '+resources,actor:'cloud-acceptance',authorityCeiling:'GREEN',completionDefinition:'sam.read_report.v1',domain:'cloud_acceptance_fault'});
   activeGoal=fault.id;
   for(let tick=0;tick<20;tick++){
    fixedCloudRevision(report.commit);await runtime.runWorkTick();
    const state=(await pool.query('SELECT state FROM goals WHERE id=$1',[fault.id])).rows[0].state;
    if(['FAILED','COMPLETED','WAITING_OWNER','BLOCKED'].includes(state))break;
   }
   const failures=(await pool.query("SELECT id FROM work_queue WHERE goal_id=$1 AND status='FAILED'",[fault.id])).rows;
   report.faultProbe={goalId:fault.id,kind:'closed isolated MCP sessions; no cloud resource changed',failedProviderWork:failures.length};
   report.internalProblemAlerts=(await pool.query("SELECT id,goal_id,status FROM owner_notifications WHERE goal_id=$1 AND kind='FAILED'",[fault.id])).rows;
  }
  report.liveAccepted=!!(report.sequencePassed&&report.recoveryPassed&&report.faultProbe?.failedProviderWork>0&&report.internalProblemAlerts?.length>0);
  report.state=report.liveAccepted?'PASSED':'NOT_ACCEPTED';
  if(!report.liveAccepted)process.exitCode=2;
 }catch(error){
  // Provider/model/database exceptions can contain tokens or source data.
  report.state='BLOCKED';report.errorCode=error instanceof Error&&/^CLOUD_[A-Z0-9_]+$/.test(error.message)?error.message:'CLOUD_ACCEPTANCE_INTERRUPTED';process.exitCode=2;
 }finally{
  if(expansion)await expansion.close();if(pool)await pool.end();
  await writeFile(reportPath,JSON.stringify(report,null,2)+'\n');
  console.log(JSON.stringify({state:report.state,liveAccepted:report.liveAccepted,completedTrials:report.trials.length,missing:report.missing??[]}));
 }
}
main().catch(()=>{console.error('CLOUD_ACCEPTANCE_START_FAILED');process.exitCode=2});
