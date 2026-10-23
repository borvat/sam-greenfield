// Ephemeral local rehearsal only. Never a deployable operator/owner module.
import {readFile,writeFile,rename,unlink} from 'node:fs/promises';
import {join,resolve} from 'node:path';
import {spawn,type ChildProcess} from 'node:child_process';
import {sign,verify} from 'node:crypto';
import {pool} from '../../packages/db/src/client';
import {stableStringify,sha256Hex} from '../../packages/shared/src/stableJson';
import {createEvaluationTrial,openEvaluationTrial} from '../../apps/agents/src/evaluation/trial';
import {startRuntimeService} from '../../apps/runtime/src/service';
import type {LaunchRequest,TrialReceipt,LaunchAdministration} from '../../apps/agents/src/evaluation/operatorLaunch';
const dir=()=>resolve(process.env.LAUNCH_FIXTURE_DIR!);
async function info(){return JSON.parse(await readFile(join(dir(),'fixture.json'),'utf8'));}
async function row(root:string):Promise<TrialReceipt|null>{const r=(await pool.query('SELECT *,clock_timestamp() observed_at FROM evaluation_trials WHERE root_goal_id=$1',[root])).rows[0];return r?{id:r.id,rootGoalId:r.root_goal_id,companyId:r.legal_entity_id,specHash:sha256Hex(r.spec),createdAt:new Date(r.created_at).toISOString(),deadline:new Date(r.deadline).toISOString(),observedAt:new Date(r.observed_at).toISOString(),cancelled:r.cancelled,sealed:r.sealed}:null;}
export async function createLaunchBindings(request:LaunchRequest){
 const metadata=await info();let child:ChildProcess|undefined,ready=false;
 const state=async(value:string)=>writeFile(join(dir(),'service-state'),value);
 const stop=async()=>{if(child&&child.exitCode===null&&child.signalCode===null){const done=new Promise<void>(r=>child!.once('close',()=>r()));child.kill('SIGTERM');await done;}child=undefined;};
 const reconcile=async(signal:AbortSignal)=>{
  await stop();let pid:number;try{pid=Number(await readFile(join(dir(),'worker.pid'),'utf8'));}catch(e){if((e as any).code==='ENOENT')return;throw e;}
  try{const args=(await readFile('/proc/'+pid+'/cmdline','utf8')).split('\0');if(!args.includes(dir())||!args.includes('tests/evaluation/launchFixture.ts'))throw Error('FIXTURE_PROCESS_IDENTITY_UNCERTAIN');process.kill(pid,'SIGTERM');
   while(true){if(signal.aborted)throw Error('FIXTURE_STOP_ABORTED');try{const stat=await readFile('/proc/'+pid+'/stat','utf8');if(stat.split(') ')[1]?.startsWith('Z'))break;}catch(e){if((e as any).code==='ENOENT')break;throw e;}await new Promise(r=>setTimeout(r,10));}
  }catch(e){if(!['ENOENT','ESRCH'].includes((e as any).code))throw e;}await unlink(join(dir(),'worker.pid'));
 };
 const start=async(kind:'worker'|'ordinary',signal:AbortSignal)=>{ready=false;
   child=spawn(process.execPath,['--import','tsx','tests/evaluation/launchFixture.ts',kind,dir()],{cwd:process.cwd(),env:{PATH:process.env.PATH,DATABASE_URL:metadata.runtimeUrl,LAUNCH_FIXTURE_DIR:dir()},stdio:['ignore','pipe','pipe']});let log='';await writeFile(join(dir(),'worker.pid'),String(child.pid));
   await new Promise<void>((accept,reject)=>{const abort=()=>{child?.kill('SIGTERM');reject(Error('FIXTURE_RESTART_ABORTED'));};signal.addEventListener('abort',abort,{once:true});
    child!.stdout!.on('data',b=>{log+=b;if(log.includes('FIXTURE_READY')){ready=true;signal.removeEventListener('abort',abort);accept();}});child!.stderr!.on('data',b=>log+=b);
    child!.once('exit',()=>{signal.removeEventListener('abort',abort);if(!ready)reject(Error('FIXTURE_STARTUP_FAILED'));});}); };
 const admin:LaunchAdministration={mode:'fixture',
  async preflight(){const u=new URL(process.env.DATABASE_URL!);if(request.spec.mode!=='fixture'||!['127.0.0.1','localhost'].includes(u.hostname)||!/^\/sam_core_test/.test(u.pathname))throw Error('FIXTURE_LOCAL_ONLY');
   const s=(await pool.query('SELECT current_schema() s')).rows[0].s;if(!/^core_\d+_\d+$/.test(s))throw Error('FIXTURE_SCHEMA_ONLY');},
  async snapshot(){return 'local-fixture-original';},async pause(){await state('paused');},
  async create(r){const c=await pool.connect();try{await createEvaluationTrial(c,r);}finally{c.release();}if(metadata.scenario==='db-cancel')await pool.query('UPDATE evaluation_trials SET cancelled=true WHERE root_goal_id=$1',[r.rootGoalId]);if(metadata.scenario==='uncertain-create')throw Error('FIXTURE_CREATE_REPLY_LOST');return (await row(r.rootGoalId))!;},
  async lookup(root){const found=await row(root);if(found&&metadata.scenario==='expired')found.observedAt=found.deadline;return found;},
  async deliver(input){if(metadata.scenario==='delivery')throw Error('FIXTURE_DELIVERY_FAILED');await writeFile(join(dir(),'approval.tmp'),JSON.stringify(input),{mode:0o600});await rename(join(dir(),'approval.tmp'),join(dir(),'approval.json'));},
  async restart(_trial,signal){if(metadata.scenario==='restart')throw Error('FIXTURE_RESTART_FAILED');
   await start('worker',signal);await state('evaluation');},
  async observe(trial,signal){if(metadata.scenario==='crash-after-restart'){console.log('FIXTURE_AFTER_RESTART');await new Promise<void>((_,reject)=>signal.addEventListener('abort',()=>reject(Error('FIXTURE_ABORTED')),{once:true}));}if(!ready)throw Error('FIXTURE_NOT_READY');if(metadata.scenario==='observe')throw Error('FIXTURE_OBSERVE_FAILED');return {outcome:'blocked',trialId:trial.id,commit:request.spec.commit};},
  async quiesce(_root,signal){await reconcile(signal);if(metadata.scenario==='quiesce')throw Error('FIXTURE_QUIESCE_UNCERTAIN');},
  async cancelAndCapture(trial){await pool.query('UPDATE evaluation_trials SET cancelled=true WHERE id=$1',[trial.id]);const r=(await pool.query('SELECT used,cancelled,deadline,created_at FROM evaluation_trials WHERE id=$1',[trial.id])).rows[0];await writeFile(join(dir(),'capture.json'),JSON.stringify(r));},
  async restore(_snapshot,signal){if(metadata.scenario==='restore')throw Error('FIXTURE_RESTORE_FAILED');await start('ordinary',signal);await state('ordinary');},
  async verifyRestored(){if(!ready||!child||child.exitCode!==null||child.signalCode!==null||(await readFile(join(dir(),'service-state'),'utf8'))!=='ordinary')throw Error('FIXTURE_NOT_RESTORED');}
 };
 return {admin,signer:{authority:'fixture-only' as const,publicKey:metadata.publicKey,async sign(payload:Record<string,unknown>,signal:AbortSignal){
  if(metadata.scenario==='cancel')await new Promise<void>((_,reject)=>signal.addEventListener('abort',()=>reject(Error('FIXTURE_ABORTED')),{once:true}));
  if(metadata.scenario==='crash'){console.log('FIXTURE_AFTER_INSERT');await new Promise<void>((_,reject)=>signal.addEventListener('abort',()=>reject(Error('FIXTURE_ABORTED')),{once:true}));}
  if(metadata.scenario==='sign')throw Error('FIXTURE_SIGN_FAILED');
  if(metadata.scenario==='bad-signature')return Buffer.from('invalid').toString('base64');
  return sign(null,Buffer.from(stableStringify(payload)),await readFile(join(dir(),'fixture-private.pem'),'utf8')).toString('base64');}},close:async()=>{await stop();if(process.argv[1]?.endsWith('/scripts/evaluation/launch.ts'))await pool.end();}};
}
async function worker(){
 if(process.argv[2]!=='ordinary'){
 const input=JSON.parse(await readFile(join(dir(),'approval.json'),'utf8'));
 if(input.payload.kind!=='SAM_FIXTURE_LAUNCH_REHEARSAL'||!verify(null,Buffer.from(stableStringify(input.payload)),input.publicKey,Buffer.from(input.signature,'base64'))||Date.parse(input.payload.expiresAt)<=Date.now())throw Error('FIXTURE_APPROVAL_INVALID');
 const t=await openEvaluationTrial(input.trial.id);if(t.spec.mode!=='fixture'||sha256Hex(t.spec)!==input.payload.specHash)throw Error('FIXTURE_SCOPE_INVALID');}
 const service=await startRuntimeService({port:0,host:'127.0.0.1',tickIntervalMs:50,composition:{async recover(){await pool.query('SELECT 1');},async supervise(){return {processed:false};},async runWorkTick(){await pool.query('SELECT 1');return {processed:false};}}});
 console.log('FIXTURE_READY');process.once('SIGTERM',()=>{void service.stop().then(()=>pool.end()).then(()=>process.exit(0));});
}
if(['worker','ordinary'].includes(process.argv[2]))worker().catch(()=>{console.error('FIXTURE_WORKER_REFUSED');process.exit(1);});
