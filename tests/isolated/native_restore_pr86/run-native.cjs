'use strict';
/** Operator-armed execution only; secrets stay in memory/env and raw child logs are discarded. */
const fs=require('node:fs'),path=require('node:path'),net=require('node:net'),crypto=require('node:crypto'),{createRequire}=require('node:module'),{pathToFileURL}=require('node:url');
const common=require('./common.cjs');
const delay=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function deadline(promise,ms,onTimeout=()=>{}){let timer;try{return await Promise.race([promise,new Promise((_,reject)=>{timer=setTimeout(()=>{onTimeout();reject(Error('NATIVE_PHASE_TIMEOUT'));},ms);})]);}finally{clearTimeout(timer);}}
const {ProcessRegistry}=require('./process-registry.cjs'),registry=new ProcessRegistry();let shutdownSignal=null;
for(const signal of ['SIGTERM','SIGINT'])process.once(signal,()=>{shutdownSignal=signal;void registry.stopAll();});
async function exit(child){const result=await registry.stop(child);if(result.exitCode!==0||result.signal||result.escalated)throw Error('CHILD_GRACEFUL_STOP_FAILED');return result;}
async function port(){const server=net.createServer();await new Promise((r,j)=>server.once('error',j).listen(0,'127.0.0.1',r));const p=server.address().port;await new Promise(r=>server.close(r));return p;}
function childProcess(args,cwd,env,ipc=false){if(shutdownSignal)throw Error('HARNESS_SHUTDOWN_REQUESTED');const child=registry.spawn(process.execPath,args,{cwd,env,stdio:ipc?['ignore','pipe','pipe','ipc']:['ignore','pipe','pipe']},cwd.split('/').at(-1)+':'+path.basename(args.at(-1)||'process'));child.stdout.on('data',()=>{});child.stderr.on('data',()=>{});return child;}
async function main(){
 const configPath=path.resolve(process.argv[2]||''),out=path.resolve(process.argv[3]||path.join(__dirname,'native-output'));
 const c=common.config(configPath);const artifacts=common.verifyRuntimeArtifacts(true);for(const name of Object.keys(common.PINS.sources))common.verifySource(name);
 if(process.argv.includes('--validate-only')){console.log(JSON.stringify({preparedSourcePins:'MATCH',configuration:'REVIEWED_TARGET_ONLY',databaseConnected:false,processesStarted:false}));return;}
 const url=common.credentials(c);if(fs.existsSync(out))throw Error('FRESH_OUTPUT_DIRECTORY_REQUIRED');fs.mkdirSync(out,{mode:0o700,recursive:true});
 const statePath=path.join(out,'synthetic-fixture-state.json'),receipts=[],services=[];
 const state=()=>JSON.parse(fs.readFileSync(statePath,'utf8'));
 const resumeFile=process.argv[4]==='--resume-native-run2'?process.argv[5]:null;let inheritedProof=null;
 if(resumeFile){
  const previous=path.resolve(resumeFile),previousState=path.join(path.dirname(previous),'synthetic-fixture-state.json');
  if(common.fileSha(previous)!=='6cde74dda5eac90930d01d59b352ecac863fb11502729dab0a736af684249efc'||common.fileSha(previousState)!=='8ed31f87940fd194b75698df04c429a3444cdff9575c0c5dca2c723854468fe0')throw Error('NATIVE_RUN2_RESUME_DIGEST_MISMATCH');
  if(fs.statSync(previous).size>1024*1024||fs.statSync(previousState).size>1024*1024)throw Error('NATIVE_RUN2_RESUME_RECORD_TOO_LARGE');
  const prior=JSON.parse(fs.readFileSync(previous,'utf8')),saved=JSON.parse(fs.readFileSync(previousState,'utf8'));
  if(saved.runId!==c.runId||prior.targetRenderId!==c.targetRenderId||prior.databaseName!==c.databaseName||prior.status!=='BLOCKED_OR_FAILED'||prior.processCleanup?.allRegisteredChildrenClosed!==true)throw Error('NATIVE_RUN2_RESUME_CONTEXT_MISMATCH');
  for(const key of ['nodeVersion','nodeBinarySha256','nodeArchiveSha256','dependencyArchiveSha256','dependencyTreeManifestSha256','installProvenanceSha256'])if(prior.runtimeArtifacts?.[key]!==artifacts[key])throw Error('NATIVE_RUN2_RUNTIME_ARTIFACT_CHANGED');
  const expected=[['forward','seed'],['forward','save'],['forward','revision2'],['runtime_fallback','save'],['runtime_fallback','negative'],['runtime_fallback','fingerprint'],['cc_mcp_fallback','save'],['cc_mcp_fallback','negative'],['cc_mcp_fallback','fingerprint'],['cc_mcp_fallback','fingerprint']];
  if(prior.receipts?.length!==expected.length)throw Error('NATIVE_RUN2_EXPECTED_TEN_PHASES_REQUIRED');
  for(let i=0;i<expected.length;i++){
   const [variant,mode]=expected[i],row=prior.receipts[i],pin=common.PINS.sources[variant];
   if(row.variant!==variant||row.mode!==mode||row.status==='FAILED'||row.sourceCommit!==pin.commit||row.sourceTree!==pin.tree||row.roleVisibleOriginalFingerprintsUnchanged!==true||row.role!==c.appRole||row.database!==c.databaseName)throw Error('NATIVE_RUN2_SUCCESS_RECEIPT_MISMATCH');
   if(mode==='save'&&(row.id!==saved.reportId||row.report_hash!==saved.reportHash||row.revision!==1))throw Error('NATIVE_RUN2_REPORT_IDENTITY_MISMATCH');
   if(mode==='revision2'&&row.revision2Id!==saved.revision2Id)throw Error('NATIVE_RUN2_REVISION2_MISMATCH');
   if(mode==='negative'&&JSON.stringify(row.negativeChecks)!==JSON.stringify(['CHANGED_ACCEPTED_PAYLOAD_CONFLICT','FOREIGN_SOURCE_BINDING_DENIED','ROLE_GUC_SPOOF_READ_WRITE_DENIED']))throw Error('NATIVE_RUN2_NEGATIVE_CHECKS_REQUIRED');
  }
  const cc=prior.appProof?.find(row=>row.variant==='cc_mcp_fallback'&&row.round===1&&row.service==='command-center'&&row.authAndSavedRead==='PASS_SAVED_ORIGINAL_ID_HASH'&&row.revision2Preserved===true),stop=prior.appProof?.find(row=>row.variant==='cc_mcp_fallback'&&row.round===1&&row.service==='command-center'&&row.gracefulStop===true);
  if(!cc||!stop||cc.commit!==common.PINS.sources.cc_mcp_fallback.commit||cc.tree!==common.PINS.sources.cc_mcp_fallback.tree)throw Error('NATIVE_RUN2_CC_ROUND1_PROOF_REQUIRED');
  fs.copyFileSync(previousState,statePath);fs.chmodSync(statePath,0o600);
  inheritedProof={classification:'PINNED_PRIOR_ACTUAL_RESULTS_NOT_RERUN',receiptSha256:common.fileSha(previous),fixtureStateSha256:common.fileSha(previousState),successfulNativePhases:10,ccRound1:'SAVED_READ_AND_GRACEFUL_STOP_PINNED',runId:c.runId};
 }

 const stage=async(variant,mode,hold=false)=>{
  if(shutdownSignal)throw Error('HARNESS_SHUTDOWN_REQUESTED');
  if(Date.now()>=Date.parse(c.deadline))throw Error('TARGET_WINDOW_EXPIRED');
  const receipt=path.join(out,`${receipts.length+1}-${variant}-${mode}.json`),env={...common.baseEnvironment(url,c),SAM_NATIVE_APP_DATABASE_URL:url,SAM_NATIVE_DRILL_APPROVAL:'RUN_ISOLATED_NATIVE_SYNTHETIC_DRILL'};
  const child=childProcess(['--import','tsx',path.join(__dirname,'native-child.mjs'),configPath,statePath,variant,mode,receipt,...(hold?['hold-after-commit']:[])],common.root(variant),env,hold);
  try{
   if(hold){await deadline(new Promise((resolve,reject)=>{child.once('message',m=>m?.committed?resolve():reject(Error('COMMIT_BARRIER_INVALID')));child.once('exit',()=>reject(Error('FORWARD_EXITED_BEFORE_COMMIT_BARRIER')));}),30000);await exit(child);}
   else{const result=await registry.wait(child,30000);if(result.exitCode!==0||result.signal)throw Error('NATIVE_PHASE_FAILED');}
  }catch(error){
   let classified=null;
   if(fs.existsSync(receipt)&&fs.statSync(receipt).size<=8192){try{const failure=JSON.parse(fs.readFileSync(receipt,'utf8'));if(failure.status==='FAILED'&&failure.variant===variant&&failure.mode===mode)classified={status:'FAILED',variant,mode,error:common.safeError({message:failure.error?.code,code:failure.error?.sqlState})};}catch{}}
   classified??={status:'FAILED',variant,mode,error:common.safeError(error),childExitCode:child.exitCode,childSignal:child.signalCode};receipts.push(classified);if(!fs.existsSync(receipt))common.writeJson(receipt,classified);
   throw error;
  }finally{await registry.stop(child);}
  const result=JSON.parse(fs.readFileSync(receipt,'utf8'));receipts.push(result);return result;
 };
 const health=async(base,name,commit,child)=>{
  for(let i=0;i<100;i++){if(registry.entry(child).closed)throw Error(name==='mcp'?'MCP_MAIN_EXITED_BEFORE_HEALTH':'SERVICE_EXITED_BEFORE_HEALTH');try{const response=await fetch(base+'/'+(name==='runtime'?'readyz':'livez'),{signal:AbortSignal.timeout(1000),redirect:'error'});if(response.status===200){const body=await response.json();if(body.revision!==commit)throw Error('SERVICE_SOURCE_REVISION_MISMATCH');return body;}}catch(error){if(error.message==='SERVICE_SOURCE_REVISION_MISMATCH'||error.message==='UNEXPECTED_RUNTIME_WORK_TICK')throw error;}await delay(100);}
  throw Error('NATIVE_SERVICE_BOOT_BLOCKED');
 };
 const appProof=[];
 const serviceRound=async(variant,round,includeRuntime,onlyServices)=>{
  const base=common.baseEnvironment(url,c),sourceRoot=common.root(variant),pin=common.PINS.sources[variant];
  // Services occupy separate production containers; this bounded rehearsal starts them serially.
  for(const [name,file] of [['command-center','apps/command-center/src/main.ts'],['mcp','apps/mcp/src/main.ts'],...(includeRuntime?[['runtime','apps/runtime/src/main.ts']]:[])].filter(([name])=>!onlyServices||onlyServices.includes(name))){
   const servicePort=await port(),token=crypto.randomBytes(32).toString('hex');
   const env={...base,SAM_BUILD_REVISION:pin.commit,SAM_COMMAND_CENTER_PORT:String(servicePort),SAM_COMMAND_CENTER_HOST:'127.0.0.1',SAM_COMMAND_CENTER_BEARER_TOKEN:token,SAM_COMMAND_CENTER_ALLOWED_HOSTS:'127.0.0.1',SAM_COMMAND_CENTER_READ_ONLY:'1',SAM_MCP_PORT:String(servicePort),SAM_MCP_HOST:'127.0.0.1',SAM_MCP_ALLOWED_HOSTS:'127.0.0.1',SAM_MCP_BEARER_TOKEN:token,SAM_MCP_ACTOR:'native-drill-read-only-caller',SAM_RUNTIME_PORT:String(servicePort),SAM_RUNTIME_STATUS_BEARER_TOKEN:token};
   if(name==='runtime'){
    const currentGate=await stage('runtime_fallback','runtime-gate');if(!currentGate.runtimeAllowed)throw Error('NATIVE_RUNTIME_QUEUE_NO_LONGER_EMPTY');
    Object.assign(env,{PORT:String(servicePort),SAM_RUNTIME_HOST:'127.0.0.1',SAM_WORKER_ID:'native-drill-startup-only',SAM_TICK_INTERVAL_MS:'86400000',SAM_SHUTDOWN_GRACE_MS:'5000',SAM_COMPOSITION_MODULE:path.join(sourceRoot,'apps/runtime/src/releaseCompositionModule.ts'),SAM_PRODUCTION_BUNDLE_MODULE:path.join(sourceRoot,'apps/production/src/localReleaseBundleModule.ts'),SAM_RELEASE_CAPABILITIES:'local.calculate,local.statistics'});
   }
   const child=childProcess(['--import','tsx',path.join(sourceRoot,file)],sourceRoot,env),endpoint='http://127.0.0.1:'+servicePort;
   let primaryError=null;
   try{
    await health(endpoint,name,pin.commit,child);
    if(name==='command-center'){
     if((await fetch(endpoint+'/api/goals',{signal:AbortSignal.timeout(5000)})).status!==401)throw Error('CC_AUTH_DENIAL_FAILED');
     const response=await fetch(endpoint+'/api/goals/'+state().input.goalId+'/timeline',{headers:{authorization:'Bearer '+token},signal:AbortSignal.timeout(5000)});if(response.status!==200)throw Error('CC_AUTHENTICATED_TIMELINE_FAILED');
     const timeline=(await response.json()).data,original=timeline.reports.find(r=>r.id===state().reportId),revision2=timeline.reports.find(r=>r.id===state().revision2Id);
     if(!original||original.report_hash!==state().reportHash||!revision2)throw Error('CC_IMMUTABLE_REPORT_READBACK_FAILED');
    }else if(name==='mcp'){
     const mcp=endpoint+'/mcp';if((await fetch(mcp,{method:'POST',headers:{'content-type':'application/json'},body:'{}',signal:AbortSignal.timeout(5000)})).status!==401)throw Error('MCP_AUTH_DENIAL_FAILED');
     const req=createRequire(path.join(sourceRoot,'package.json')),sdk=await import(pathToFileURL(req.resolve('@modelcontextprotocol/sdk/client/index.js')).href),transportSdk=await import(pathToFileURL(req.resolve('@modelcontextprotocol/sdk/client/streamableHttp.js')).href),client=new sdk.Client({name:'native-rehearsal',version:'1.0.0'});
     try{
      await deadline(client.connect(new transportSdk.StreamableHTTPClientTransport(new URL(mcp),{requestInit:{headers:{authorization:'Bearer '+token}}})),10000);
      const saved=await deadline(client.callTool({name:'sam_get_report',arguments:{report_id:state().reportId}}),10000),payload=JSON.parse(saved.content.find(item=>item.type==='text').text);
      if(payload.ok!==true||payload.data?.report?.id!==state().reportId||payload.data.report.report_hash!==state().reportHash||payload.data.executionPerformed!==false)throw Error('MCP_AUTHENTICATED_SAVED_REPORT_FAILED');
     }finally{await client.close();}
    }else{
     const response=await fetch(endpoint+'/statusz',{headers:{authorization:'Bearer '+token},signal:AbortSignal.timeout(3000)});if(response.status!==200)throw Error('RUNTIME_STATUS_PROOF_UNAVAILABLE');
     const metrics=await response.json();if(metrics.ticks!==0||metrics.errors!==0||metrics.inFlight!==false)throw Error('UNEXPECTED_RUNTIME_WORK_TICK');
    }
    appProof.push({variant,round,service:name,commit:pin.commit,tree:pin.tree,actualMainFile:true,serialServiceProcess:true,loopbackOnly:true,providerEnvironment:'EMPTY_ALLOWLIST',authAndSavedRead:name==='runtime'?'ZERO_TICKS_ERRORS_AND_INFLIGHT':'PASS_SAVED_ORIGINAL_ID_HASH',revision2Preserved:true});
   }catch(error){primaryError=error;appProof.push({variant,round,service:name,status:'FAILED',primaryError:common.safeError(error),childExitCode:child.exitCode,childSignal:child.signalCode});throw error;}finally{try{const stopped=await exit(child);appProof.push({variant,round,service:name,gracefulStop:stopped.exitCode===0});}catch(cleanupError){appProof.push({variant,round,service:name,cleanupError:common.safeError(cleanupError)});if(!primaryError)throw cleanupError;}}
   await stage(variant,'fingerprint');
  }
 };
 const evidence={classification:'NATIVE_SYNTHETIC_REHEARSAL_NOT_LIVE_BUSINESS_ACCEPTANCE',targetRenderId:c.targetRenderId,databaseName:c.databaseName,startedAt:new Date().toISOString(),inheritedProof,transport:{mode:c.tlsMode,certificateVerification:c.tlsMode==='verify-full',encryptedSessionAssertion:'Required in every native phase; actual application mains consume the same pinned URI'},runtimeArtifacts:artifacts,limits:['All catalog-discovered local tables are classified; only SELECT-visible restored rows are fingerprinted, and mandatory public queue/report/model/audit/memory/budget sources must be visible. Denied tables are explicit, not covered.','No providers, real report recovery, commerce or outside messages.','MCP actual main uses no dispatcher/providers; only saved-read methods are invoked by this harness.','Restricted-role fingerprints cover role-visible restored rows; owner-wide restore/ACL evidence is separate.'],receipts,appProof};
 try{
  if(inheritedProof){
   // First resumed DB action is a read-only comparison; never recreate or replay successful fixtures.
   await stage('cc_mcp_fallback','fingerprint');
   await serviceRound('cc_mcp_fallback',1,false,['mcp']);
   await serviceRound('cc_mcp_fallback',2,false,['command-center','mcp']);
  }else{
   await stage('forward','seed');await stage('forward','save',true);await stage('forward','revision2');
   for(const variant of ['runtime_fallback','cc_mcp_fallback']){await stage(variant,'save');await stage(variant,'negative');await stage(variant,'fingerprint');}
   await serviceRound('cc_mcp_fallback',1,false);await stage('cc_mcp_fallback','fingerprint');await serviceRound('cc_mcp_fallback',2,false);await stage('cc_mcp_fallback','fingerprint');
  }
  const gate=await stage('runtime_fallback','runtime-gate');
  if(gate.runtimeAllowed){await serviceRound('runtime_fallback',1,true,['runtime']);await stage('runtime_fallback','fingerprint');await serviceRound('runtime_fallback',2,true,['runtime']);await stage('runtime_fallback','fingerprint');}
  else evidence.runtimeStartup='BLOCKED: original recovery/work queue not empty or explicit startup approval absent; no records changed to bypass gate';
  evidence.status=gate.runtimeAllowed?'ROLE_SCOPED_NATIVE_SOURCE_AND_STARTUP_REHEARSAL_PASS':'PARTIAL_RUNTIME_STARTUP_BLOCKED';
 }catch(error){evidence.status='BLOCKED_OR_FAILED';evidence.error=common.safeError(error);throw error;}
 finally{
  evidence.shutdownSignal=shutdownSignal;evidence.processCleanup=await registry.stopAll();if(!evidence.processCleanup.allRegisteredChildrenClosed)evidence.status='BLOCKED_UNCONFIRMED_CHILD_CLEANUP';
  evidence.finishedAt=new Date().toISOString();common.writeJson(path.join(out,'native-drill-receipt.json'),evidence);
 }
 console.log(JSON.stringify({status:evidence.status,receipt:path.join(out,'native-drill-receipt.json'),syntheticFixtureState:statePath,productionChanged:false}));
}
main().catch(error=>{console.error(JSON.stringify(common.safeError(error)));process.exitCode=1;});
