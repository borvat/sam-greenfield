import {createPublicKey,verify} from 'node:crypto';
import {stableStringify,sha256Hex} from '../../../../packages/shared/src/stableJson';
import {LIVE_EVALUATION_ENABLED} from '../../../../packages/model-gateway/src/evaluationPermit';
import {validateTrialSpec,type TrialSpec} from './trialSpec';

export type LaunchRequest={version:1;rootGoalId:string;spec:TrialSpec};
export type TrialReceipt={id:string;rootGoalId:string;companyId:string;specHash:string;createdAt:string;deadline:string;observedAt:string;cancelled:boolean;sealed:boolean};
export type LaunchEvent={phase:string;requestHash:string;at:string;detail?:Record<string,unknown>};
export interface LaunchJournal {readonly signal?:AbortSignal;read():Promise<LaunchEvent[]>;append(event:LaunchEvent):Promise<void>}
/** Implemented by a separately authorized operator, never by runtime credentials.
 * All methods must honor AbortSignal; quiesce must reconcile in-flight remote
 * actions before restoration. Snapshot is an opaque durable reference, no secrets. */
export interface LaunchAdministration {
 mode:'fixture'|'live';
 preflight(request:LaunchRequest,signal:AbortSignal):Promise<void>;
 snapshot(signal:AbortSignal):Promise<string>;
 pause(snapshot:string,signal:AbortSignal):Promise<void>;
 create(request:LaunchRequest,signal:AbortSignal):Promise<TrialReceipt>;
 lookup(rootGoalId:string,signal:AbortSignal):Promise<TrialReceipt|null>;
 deliver(input:{trial:TrialReceipt;payload:Record<string,unknown>;signature:string;publicKey:string},signal:AbortSignal):Promise<void>;
 restart(trial:TrialReceipt,signal:AbortSignal):Promise<void>;
 observe(trial:TrialReceipt,signal:AbortSignal):Promise<{outcome:'complete'|'blocked';trialId:string;commit:string}>;
 quiesce(rootGoalId:string,signal:AbortSignal):Promise<void>;
 cancelAndCapture(trial:TrialReceipt,signal:AbortSignal):Promise<void>;
 restore(snapshot:string,signal:AbortSignal):Promise<void>;
 verifyRestored(snapshot:string,signal:AbortSignal):Promise<void>;
}
export interface LaunchSigner {authority:'fixture-only'|'owner-attested';publicKey:string;sign(payload:Record<string,unknown>,signal:AbortSignal):Promise<string>}
type Bindings={admin:LaunchAdministration;journal:LaunchJournal;signer?:LaunchSigner;signal?:AbortSignal};
const code=(e:unknown)=>e instanceof Error&&/^[A-Z][A-Z_]{2,80}$/.test(e.message)?e.message:'LAUNCH_OPERATION_FAILED';
const failure=(s:string):never=>{throw Error(s);};
function requestCopy(request:LaunchRequest){
 if(request.version!==1||!/^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(request.rootGoalId))failure('LAUNCH_REQUEST_INVALID');
 const copy={version:1 as const,rootGoalId:request.rootGoalId,spec:validateTrialSpec(request.spec)};
 if(copy.spec.limits.elapsedMs!==300000)failure('LAUNCH_FIVE_MINUTE_LIMIT_REQUIRED');
 const freeze=(v:any):void=>{if(v&&typeof v==='object'){Object.values(v).forEach(freeze);Object.freeze(v);}};freeze(copy);return copy;
}
function receipt(request:LaunchRequest,r:TrialReceipt){
 if(!r||r.rootGoalId!==request.rootGoalId||r.companyId!==request.spec.companyId||r.specHash!==sha256Hex(request.spec)||!/^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(r.id)||typeof r.cancelled!=='boolean'||typeof r.sealed!=='boolean'||
  ![r.createdAt,r.deadline,r.observedAt].every(v=>Number.isFinite(Date.parse(v)))||Date.parse(r.deadline)-Date.parse(r.createdAt)!==300000||Date.parse(r.observedAt)<Date.parse(r.createdAt))failure('LAUNCH_TRIAL_RECEIPT_INVALID');
 return r;
}
export function launchApproval(request:LaunchRequest,r:TrialReceipt){
 return {kind:request.spec.mode==='live'?'SAM_LIVE_EVALUATION_APPROVAL':'SAM_FIXTURE_LAUNCH_REHEARSAL',trialId:r.id,rootGoalId:r.rootGoalId,companyId:r.companyId,
  specHash:r.specHash,commit:request.spec.commit,corpusHash:request.spec.corpusHash,endpoint:request.spec.liveEndpoint??'fixture://no-network',prices:request.spec.prices,expiresAt:r.deadline};
}
/** One operation deadline, with abort propagated to the operator adapter. A
 * timeout never means the remote action did not happen; cleanup reconciles it. */
async function bounded<T>(fn:(signal:AbortSignal)=>Promise<T>,ms:number,parent?:AbortSignal):Promise<T>{
 if(ms<=0)failure('LAUNCH_EXPIRED');const controller=new AbortController();
 const abort=()=>controller.abort();parent?.addEventListener('abort',abort,{once:true});
 let timer:ReturnType<typeof setTimeout>|undefined;
 try{return await Promise.race([Promise.resolve().then(()=>{if(parent?.aborted)failure('LAUNCH_CANCELLED');return fn(controller.signal);}),new Promise<never>((_,reject)=>{
  controller.signal.addEventListener('abort',()=>reject(Error('LAUNCH_CANCELLED')),{once:true});
  timer=setTimeout(()=>{reject(Error('LAUNCH_OPERATION_DEADLINE'));controller.abort();},ms);
 })]);}finally{if(timer)clearTimeout(timer);parent?.removeEventListener('abort',abort);}
}
/** Recovery never creates a trial, signs, delivers or restarts evaluation. */
export async function recoverTrialLaunch(input:LaunchRequest,b:Bindings){
 const request=requestCopy(input),hash=sha256Hex(request),events=await b.journal.read();
 if(b.admin.mode!==request.spec.mode||!events.length||events.some(e=>e.requestHash!==hash))failure('LAUNCH_RECOVERY_SCOPE_INVALID');
 const snapshot=events.find(e=>e.phase==='SNAPSHOT')?.detail?.reference;
 if(typeof snapshot!=='string'||!snapshot)failure('LAUNCH_RECOVERY_SNAPSHOT_REQUIRED');
 const record=async(phase:string,detail?:Record<string,unknown>)=>b.journal.append({phase,requestHash:hash,at:new Date().toISOString(),detail});
 try{
  await bounded(s=>b.admin.preflight(request,s),15000,b.journal.signal);
  // Do not restore over an uncertain remote restart/delivery operation.
  await bounded(s=>b.admin.quiesce(request.rootGoalId,s),15000,b.journal.signal);
  const found=await bounded(s=>b.admin.lookup(request.rootGoalId,s),5000,b.journal.signal);
  if(found){receipt(request,found);await bounded(s=>b.admin.cancelAndCapture(found,s),15000,b.journal.signal);await record('TRIAL_CAPTURED',{trialId:found.id,elapsedFromInsertMs:Date.parse(found.observedAt)-Date.parse(found.createdAt)});}
  await bounded(s=>b.admin.restore(snapshot as string,s),15000,b.journal.signal);
  await bounded(s=>b.admin.verifyRestored(snapshot as string,s),10000,b.journal.signal);
  await record('RESTORED');return {restored:true as const};
 }catch(e){await record('RESTORATION_PENDING',{code:code(e)});return {restored:false as const,code:code(e)};}
}
async function launch(input:LaunchRequest,b:Bindings,mode:'fixture'|'live'){
 const request=requestCopy(input),hash=sha256Hex(request);
 const signals=[b.signal,b.journal.signal].filter((s):s is AbortSignal=>!!s);
 b={...b,signal:signals.length?AbortSignal.any(signals):undefined};
 if(request.spec.mode!==mode||b.admin.mode!==mode)failure('LAUNCH_MODE_MISMATCH');
 if(mode==='live'&&!LIVE_EVALUATION_ENABLED)failure('LIVE_EVALUATION_RELEASE_DISABLED');
 if(!b.signer||b.signer.authority!==(mode==='live'?'owner-attested':'fixture-only'))failure('LAUNCH_SIGNER_REQUIRED');
 const signer=b.signer!;
 if(createPublicKey(signer.publicKey).asymmetricKeyType!=='ed25519')failure('LAUNCH_SIGNER_INVALID');
 if((await b.journal.read()).length)failure('LAUNCH_ALREADY_STARTED_USE_RECOVERY');
 const record=async(phase:string,detail?:Record<string,unknown>)=>b.journal.append({phase,requestHash:hash,at:new Date().toISOString(),detail});
 await bounded(s=>b.admin.preflight(request,s),15000,b.signal);
 const snapshot=await bounded(s=>b.admin.snapshot(s),15000,b.signal);
 if(!snapshot||snapshot.length>300)failure('LAUNCH_SNAPSHOT_INVALID');
 await record('SNAPSHOT',{reference:snapshot});
 let outcome:'complete'|'blocked'|'failed'='failed',error:string|undefined;
 try{
  await record('PAUSE_REQUESTED');await bounded(s=>b.admin.pause(snapshot,s),15000,b.signal);
  await record('CREATE_REQUESTED');
  const createStarted=performance.now();
  const r=receipt(request,await bounded(s=>b.admin.create(request,s),15000,b.signal));
  await record('CREATED',{trialId:r.id,createdAt:r.createdAt,deadline:r.deadline,observedAt:r.observedAt});
  // DB timestamps determine remaining budget. Monotonic local time can only
  // shorten it; repeated DB checks must not reset the insertion-time deadline.
  const stop=createStarted+Math.min(300000,Date.parse(r.deadline)-Date.parse(r.observedAt));
  const stage=async<T>(name:string,fn:(s:AbortSignal)=>Promise<T>,cap=30000)=>{
   await record(name+'_REQUESTED');
   const fresh=receipt(request,(await bounded(s=>b.admin.lookup(request.rootGoalId,s),Math.min(5000,stop-performance.now()),b.signal))!);
   if(fresh.cancelled||fresh.sealed)failure('LAUNCH_TRIAL_CLOSED');
   if(fresh.id!==r.id||fresh.deadline!==r.deadline||fresh.createdAt!==r.createdAt||Date.parse(fresh.observedAt)>=Date.parse(r.deadline))failure('LAUNCH_EXPIRED');
   return bounded(fn,Math.min(cap,stop-performance.now(),Date.parse(r.deadline)-Date.parse(fresh.observedAt)),b.signal);
  };
  const payload=launchApproval(request,r),signed=await stage('SIGN',s=>signer.sign(structuredClone(payload),s));
  if(!verify(null,Buffer.from(stableStringify(payload)),signer.publicKey,Buffer.from(signed,'base64')))failure('LAUNCH_SIGNATURE_INVALID');
  await stage('DELIVER',s=>b.admin.deliver({trial:r,payload,signature:signed,publicKey:signer.publicKey},s));
  await stage('RESTART',s=>b.admin.restart(r,s));
  const observed=await stage('OBSERVE',s=>b.admin.observe(r,s),300000);
  if(observed.trialId!==r.id||observed.commit!==request.spec.commit||!['complete','blocked'].includes(observed.outcome))failure('LAUNCH_OBSERVATION_INVALID');
  await stage('FINAL_RECEIPT',async()=>undefined,5000);
  outcome=observed.outcome;await record('OBSERVED',{outcome});
 }catch(e){error=code(e);try{await record('FAILED',{code:error});}catch{error='LAUNCH_JOURNAL_WRITE_FAILED';}}
 const recovery=await recoverTrialLaunch(request,b);
 return {outcome,error,...recovery};
}
export const runOperatorTrialLaunch=(r:LaunchRequest,b:Bindings)=>launch(r,b,'live');
/** Explicitly different payload kind; never accepted as live owner approval. */
export const rehearseFixtureTrialLaunch=(r:LaunchRequest,b:Bindings)=>launch(r,b,'fixture');
