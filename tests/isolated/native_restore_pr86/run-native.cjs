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
 const stage=async(variant,mode,hold=false)=>{
  if(shutdownSignal)throw Error('HARNESS_SHUTDOWN_REQUESTED');
  if(Date.now()>=Date.parse(c.deadline))throw Error('TARGET_WINDOW_EXPIRED');
  const receipt=path.join(out,`${receipts.length+1}-${variant}-${mode}.json`),env={...common.baseEnvironment(url,c),SAM_NATIVE_APP_DATABASE_URL:url,SAM_NATIVE_DRILL_APPROVAL:'RUN_ISOLATED_NATIVE_SYNTHETIC_DRILL'};
  const child=childProcess(['--import','tsx',path.join(__dirname,'native-child.mjs'),configPath,statePath,variant,mode,receipt,...(hold?['hold-after-commit']:[])],common.root(variant),env,hold);
  try{
   if(hold){await deadline(new Promise((resolve,reject)=>{child.once('message',m=>m?.committed?resolve():reject(Error('COMMIT_BARRIER_INVALID')));child.once('exit',()=>reject(Error('FORWARD_EXITED_BEFORE_COMMIT_BARRIER')));}),30000);await exit(child);}
   else{const result=await registry.wait(child,30000);if(result.exitCode!==0||result.signal)throw Error('NATIVE_PHASE_FAILED');}
  }finally{await registry.stop(child);}
  const result=JSON.parse(fs.readFileSync(receipt,'utf8'));receipts.push(result);return result;
 };
 const health=async(base,name,commit)=>{
  for(let i=0;i<100;i++){try{const response=await fetch(base+'/'+(name==='runtime'?'readyz':'livez'),{signal:AbortSignal.timeout(1000),redirect:'error'});if(response.status===200){const body=await response.json();if(body.revision!==commit)throw Error('SERVICE_SOURCE_REVISION_MISMATCH');return body;}}catch(error){if(error.message==='SERVICE_SOURCE_REVISION_MISMATCH'||error.message==='UNEXPECTED_RUNTIME_WORK_TICK')throw error;}await delay(100);}
  throw Error('NATIVE_SERVICE_BOOT_BLOCKED');
 };
 const appProof=[];
 const serviceRound=async(variant,round,includeRuntime)=>{
  const base=common.baseEnvironment(url,c),sourceRoot=common.root(variant),pin=common.PINS.sources[variant],started=[];
  const ccPort=await port(),mcpPort=await port(),runtimePort=await port(),ccToken=crypto.randomBytes(32).toString('hex'),mcpToken=crypto.randomBytes(32).toString('hex'),runtimeToken=crypto.randomBytes(32).toString('hex');
  const env={...base,SAM_BUILD_REVISION:pin.commit,SAM_COMMAND_CENTER_PORT:String(ccPort),SAM_COMMAND_CENTER_HOST:'127.0.0.1',SAM_COMMAND_CENTER_BEARER_TOKEN:ccToken,SAM_COMMAND_CENTER_ALLOWED_HOSTS:'127.0.0.1',SAM_COMMAND_CENTER_READ_ONLY:'1',SAM_MCP_PORT:String(mcpPort),SAM_MCP_HOST:'127.0.0.1',SAM_MCP_ALLOWED_HOSTS:'127.0.0.1',SAM_MCP_BEARER_TOKEN:mcpToken,SAM_MCP_ACTOR:'native-drill-read-only-caller',SAM_RUNTIME_PORT:String(runtimePort),SAM_RUNTIME_STATUS_BEARER_TOKEN:runtimeToken};
  try{
   for(const [name,file] of [['command-center','apps/command-center/src/main.ts'],['mcp','apps/mcp/src/main.ts'],...(includeRuntime?[['runtime','apps/runtime/src/main.ts']]:[])]){
    if(name==='runtime'){const currentGate=await stage('runtime_fallback','runtime-gate');if(!currentGate.runtimeAllowed)throw Error('NATIVE_RUNTIME_QUEUE_NO_LONGER_EMPTY');}
    const childEnv=name==='runtime'?{...env,PORT:String(runtimePort),SAM_RUNTIME_HOST:'127.0.0.1',SAM_WORKER_ID:'native-drill-startup-only',SAM_TICK_INTERVAL_MS:'86400000',SAM_SHUTDOWN_GRACE_MS:'5000',SAM_COMPOSITION_MODULE:path.join(sourceRoot,'apps/runtime/src/releaseCompositionModule.ts'),SAM_PRODUCTION_BUNDLE_MODULE:path.join(sourceRoot,'apps/production/src/localReleaseBundleModule.ts'),SAM_RELEASE_CAPABILITIES:'local.calculate,local.statistics'}:env;
    const child=childProcess(['--import','tsx',path.join(sourceRoot,file)],sourceRoot,childEnv);started.push({name,child});services.push(child);
    await health('http://127.0.0.1:'+({mcp:mcpPort,'command-center':ccPort,runtime:runtimePort}[name]),name,pin.commit);
   }
   const cc='http://127.0.0.1:'+ccPort,headers={authorization:'Bearer '+ccToken};
   if((await fetch(cc+'/api/goals')).status!==401)throw Error('CC_AUTH_DENIAL_FAILED');
   const response=await fetch(cc+'/api/goals/'+state().input.goalId+'/timeline',{headers,signal:AbortSignal.timeout(5000)});if(response.status!==200)throw Error('CC_AUTHENTICATED_TIMELINE_FAILED');const timeline=(await response.json()).data;
   const original=timeline.reports.find(r=>r.id===state().reportId),revision2=timeline.reports.find(r=>r.id===state().revision2Id);
   if(!original||original.report_hash!==state().reportHash||!revision2)throw Error('CC_IMMUTABLE_REPORT_READBACK_FAILED');
   const mcp='http://127.0.0.1:'+mcpPort+'/mcp';
   if((await fetch(mcp,{method:'POST',headers:{'content-type':'application/json'},body:'{}'})).status!==401)throw Error('MCP_AUTH_DENIAL_FAILED');
   const req=createRequire(path.join(sourceRoot,'package.json')),sdk=await import(pathToFileURL(req.resolve('@modelcontextprotocol/sdk/client/index.js')).href),transportSdk=await import(pathToFileURL(req.resolve('@modelcontextprotocol/sdk/client/streamableHttp.js')).href),client=new sdk.Client({name:'native-rehearsal',version:'1.0.0'});
   try{
    await deadline(client.connect(new transportSdk.StreamableHTTPClientTransport(new URL(mcp),{requestInit:{headers:{authorization:'Bearer '+mcpToken}}})),10000);
    const saved=await deadline(client.callTool({name:'sam_get_report',arguments:{report_id:state().reportId}}),10000),payload=JSON.parse(saved.content.find(item=>item.type==='text').text);
    if(payload.ok!==true||payload.data?.report?.id!==state().reportId||payload.data.report.report_hash!==state().reportHash||payload.data.executionPerformed!==false)throw Error('MCP_AUTHENTICATED_SAVED_REPORT_FAILED');
   }finally{await client.close();}
   if(includeRuntime){const response=await fetch('http://127.0.0.1:'+runtimePort+'/statusz',{headers:{authorization:'Bearer '+runtimeToken},signal:AbortSignal.timeout(3000)});if(response.status!==200)throw Error('RUNTIME_STATUS_PROOF_UNAVAILABLE');const metrics=await response.json();if(metrics.ticks!==0||metrics.errors!==0||metrics.inFlight!==false)throw Error('UNEXPECTED_RUNTIME_WORK_TICK');}
   appProof.push({variant,round,commit:pin.commit,tree:pin.tree,actualMainFiles:true,loopbackOnly:true,providerEnvironment:'EMPTY_ALLOWLIST',authDenials:'PASS',ccSavedReport:'MATCH',mcpSavedReport:'MATCH',revision2Preserved:true,runtime:includeRuntime?'ACTUAL_MAIN_STARTUP_ONLY_NO_TICKS':'NOT_STARTED'});
  }finally{for(const {name,child} of started.reverse()){const stopped=await exit(child);appProof.push({variant,round,service:name,gracefulStop:stopped.exitCode===0});}}
 };
 const evidence={classification:'NATIVE_SYNTHETIC_REHEARSAL_NOT_LIVE_BUSINESS_ACCEPTANCE',targetRenderId:c.targetRenderId,databaseName:c.databaseName,startedAt:new Date().toISOString(),transport:{mode:c.tlsMode,certificateVerification:c.tlsMode==='verify-full',encryptedSessionAssertion:'Required in every native phase; actual application mains consume the same pinned URI'},runtimeArtifacts:artifacts,limits:['All catalog-discovered local tables are classified; only SELECT-visible restored rows are fingerprinted, and mandatory public queue/report/model/audit/memory/budget sources must be visible. Denied tables are explicit, not covered.','No providers, real report recovery, commerce or outside messages.','MCP actual main uses no dispatcher/providers; only saved-read methods are invoked by this harness.','Restricted-role fingerprints cover role-visible restored rows; owner-wide restore/ACL evidence is separate.'],receipts,appProof};
 try{
  await stage('forward','seed');await stage('forward','save',true);await stage('forward','revision2');
  for(const variant of ['runtime_fallback','cc_mcp_fallback']){await stage(variant,'save');await stage(variant,'negative');await stage(variant,'fingerprint');}
  await serviceRound('cc_mcp_fallback',1,false);await stage('cc_mcp_fallback','fingerprint');await serviceRound('cc_mcp_fallback',2,false);await stage('cc_mcp_fallback','fingerprint');
  const gate=await stage('runtime_fallback','runtime-gate');
  if(gate.runtimeAllowed){await serviceRound('runtime_fallback',1,true);await stage('runtime_fallback','fingerprint');await serviceRound('runtime_fallback',2,true);await stage('runtime_fallback','fingerprint');}
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
