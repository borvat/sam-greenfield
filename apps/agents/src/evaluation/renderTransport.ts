import {mkdir,open,rename,lstat} from 'node:fs/promises';
import {join,resolve} from 'node:path';
import {constants} from 'node:fs';
import {sha256Hex,stableStringify} from '../../../../packages/shared/src/stableJson';
import {openLaunchJournal} from './launchJournal';
import type {LaunchAdministration,LaunchRequest,TrialReceipt} from './operatorLaunch';

const files=['sam-eval-owner-public.pem','sam-eval-approval.json'] as const;
const terminal=new Set(['live','deactivated','build_failed','update_failed','canceled','pre_deploy_failed']);
type Deploy={id:string;status:string;commit?:{id:string}};
type Config={service:Record<string,unknown>;groups:unknown[];env:Record<string,string>;files:Record<string,string>};
type Pending={method:string;path:string;body?:unknown;kind:'cell'|'suspend'|'resume'|'deploy';expected?:unknown;baseline?:string[];commit?:string;deployId?:string;previous?:string|null};
type State={version:1;scope:string;original:Config;originalDeploy:Deploy;pending?:Pending;sequence:number;applied:Record<string,string|null>;launched?:boolean;restoredDeployId?:string;restored?:boolean};
export type RenderTransportOptions={
 serviceId:string;allowedServiceIds:readonly string[];workspaceId:string;directory:string;
 request:LaunchRequest;preparedBuildId:string;environment:Record<string,string>;
 /** Secret access is explicit, lazy and never logged. No ambient environment fallback. */
 credential:(signal:AbortSignal)=>Promise<string>;
 /** Optional transport injection is restricted to loopback and fixture mode. */
 simulation?:{baseUrl:string};
 pollMs?:number;
};
/** Only the Render portion is implemented here. Existing operator SQL/report and
 * signer bindings stay outside cloud transport and outside runtime authority. */
export type TrialAdministration=Pick<LaunchAdministration,'mode'|'preflight'|'create'|'lookup'|'observe'|'cancelAndCapture'> & {
 assertStopped(signal:AbortSignal):Promise<void>;
 verifyRuntime(input:{commit:string;trialId?:string;restored:boolean},signal:AbortSignal):Promise<void>;
};
const fail=(code:string):never=>{throw Error(code);};
const equal=(a:unknown,b:unknown)=>stableStringify(a)===stableStringify(b);
const check=(s:AbortSignal)=>{if(s.aborted)fail('RENDER_TRANSPORT_CANCELLED');};
const id=(v:unknown,prefix:string):v is string=>typeof v==='string'&&new RegExp('^'+prefix+'-[a-zA-Z0-9]+$').test(v);
function serviceConfig(s:any){
 if(!s||!['web_service','private_service','background_worker'].includes(s.type))fail('RENDER_SERVICE_SHAPE_INVALID');
 // Do not PATCH service configuration: pin fields relevant to code/command and
 // topology, excluding dynamic timestamps, ports, deploy status and URLs.
 return {id:s.id,ownerId:s.ownerId,type:s.type,repo:s.repo??null,branch:s.branch??null,
  autoDeploy:s.autoDeployTrigger??s.autoDeploy,rootDir:s.rootDir??'',
  details:{env:s.serviceDetails?.env??null,region:s.serviceDetails?.region??null,
   plan:s.serviceDetails?.plan??null,numInstances:s.serviceDetails?.numInstances??null,
   envSpecificDetails:s.serviceDetails?.envSpecificDetails??null}};
}
export async function createRenderLaunchAdministration(options:RenderTransportOptions,db:TrialAdministration):Promise<LaunchAdministration & {close():Promise<void>}>{
 const o=structuredClone({...options,credential:undefined}) as Omit<RenderTransportOptions,'credential'>;
 const credential=options.credential;
 if(!id(o.serviceId,'srv')||!o.allowedServiceIds.includes(o.serviceId)||!o.workspaceId||!id(o.preparedBuildId,'bld')||db.mode!==o.request.spec.mode)fail('RENDER_SCOPE_DENIED');
 if(Object.keys(o.environment).length>30||Object.entries(o.environment).some(([k,v])=>!/^[_A-Z][_A-Z0-9]*$/.test(k)||typeof v!=='string'||v.length>32768))fail('RENDER_CONFIG_INVALID');
 const base=o.simulation?new URL(o.simulation.baseUrl):new URL('https://api.render.com/v1/');
 if(o.simulation&&(db.mode!=='fixture'||base.protocol!=='http:'||base.hostname!=='127.0.0.1'||base.username||base.password||base.search||base.hash))fail('RENDER_SIMULATION_DENIED');
 if(!base.pathname.endsWith('/'))fail('RENDER_ENDPOINT_INVALID');
 const scope=sha256Hex({serviceId:o.serviceId,workspaceId:o.workspaceId,request:o.request,build:o.preparedBuildId,environment:o.environment,base:base.href});
 const dir=resolve(o.directory),path=join(dir,'render-private-state.json');
 await mkdir(dir,{recursive:true,mode:0o700});const stat=await lstat(dir);
 if(!stat.isDirectory()||stat.isSymbolicLink()||(stat.mode&0o077))fail('RENDER_PRIVATE_DIRECTORY_REQUIRED');
 const lock=await openLaunchJournal(dir,true);
 try{
 let state:State|undefined,busy=false,closed=false;
 try{const h=await open(path,constants.O_RDONLY|constants.O_NOFOLLOW);try{const st=await h.stat();if(!st.isFile()||st.mode&0o077||st.size>2*1024*1024)fail('RENDER_PRIVATE_STATE_INVALID');state=JSON.parse(await h.readFile('utf8'));}finally{await h.close();}}catch(e){if((e as NodeJS.ErrnoException).code!=='ENOENT')throw e;}
 if(state&&(state.version!==1||state.scope!==scope))fail('RENDER_SNAPSHOT_SCOPE_MISMATCH');
 async function save(){const serialized=JSON.stringify(state);if(Buffer.byteLength(serialized)>2*1024*1024)fail('RENDER_PRIVATE_STATE_TOO_LARGE');const tmp=join(dir,'render-private-state.next');const h=await open(tmp,constants.O_CREAT|constants.O_TRUNC|constants.O_WRONLY|constants.O_NOFOLLOW,0o600);try{await h.writeFile(serialized);await h.sync();}finally{await h.close();}await rename(tmp,path);const d=await open(dir,'r');try{await d.sync();}finally{await d.close();}}
 const route=(suffix='')=>'services/'+o.serviceId+suffix;
 async function api(method:string,suffix:string,signal:AbortSignal,body?:unknown,missing=false,groupList=false):Promise<any>{
  signal=AbortSignal.any([signal,lock.journal.signal!]);check(signal);const token=await credential(signal);check(signal);if(!token||/[\r\n]/.test(token))fail('RENDER_CREDENTIAL_INVALID');
  if(groupList&&method!=='GET')fail('RENDER_SCOPE_DENIED');
  let r:Response;try{r=await fetch(new URL(groupList?'env-groups'+suffix:route(suffix),base),{method,signal,redirect:'error',headers:{Authorization:'Bearer '+token,Accept:'application/json',...(body===undefined?{}:{'Content-Type':'application/json'})},...(body===undefined?{}:{body:JSON.stringify(body)})});}catch{fail('RENDER_REQUEST_UNCERTAIN');}
  if(r!.status===404&&missing)return null;
  if(!r!.ok)fail('RENDER_HTTP_'+r!.status);
  if(r!.status===204||r!.headers.get('content-length')==='0')return null;
  const text=await r!.text();if(text.length>2*1024*1024)fail('RENDER_RESPONSE_TOO_LARGE');if(!text)return null;
  try{return JSON.parse(text);}catch{fail('RENDER_RESPONSE_INVALID');}
 }
 async function list(suffix:string,key:string,signal:AbortSignal):Promise<any[]>{const result:any[]=[];let cursor='';for(let page=0;page<20;page++){
  const rows=await api('GET',suffix+'?limit=100'+(cursor?'&cursor='+encodeURIComponent(cursor):''),signal);
  if(!Array.isArray(rows)||rows.some((r:any)=>!r||!r[key]||typeof r.cursor!=='string'))fail('RENDER_LIST_INVALID');result.push(...rows.map((r:any)=>r[key]));
  if(rows.length<100)return result;const next=rows.at(-1).cursor;if(next===cursor)fail('RENDER_PAGINATION_INVALID');cursor=next;
 }return fail('RENDER_PAGINATION_LIMIT');}
 async function cells(kind:'env-vars'|'secret-files',signal:AbortSignal){const rows=await list('/'+kind,kind==='env-vars'?'envVar':'secretFile',signal),out:Record<string,string>={};for(const r of rows){const k=kind==='env-vars'?r.key:r.name,v=kind==='env-vars'?r.value:r.content;if(typeof k!=='string'||typeof v!=='string'||Object.hasOwn(out,k))fail('RENDER_CELL_INVALID');Object.defineProperty(out,k,{value:v,enumerable:true,writable:true,configurable:true});}return out;}
 async function directCells(kind:'env-vars'|'secret-files',signal:AbortSignal){
  const listed=await cells(kind,signal),direct:Record<string,string>={};
  // Individual endpoints explicitly exclude linked groups. Do not infer direct
  // ownership from a list result or materialize an inherited value on restore.
  for(const key of Object.keys(listed)){const value=await cell('/'+kind+'/'+encodeURIComponent(key),signal);if(value!==null)Object.defineProperty(direct,key,{value,enumerable:true,writable:true,configurable:true});}
  return direct;
 }
 async function groups(signal:AbortSignal){
  const result:unknown[]=[];let cursor='';for(let page=0;page<20;page++){
   const rows=await api('GET','?ownerId='+encodeURIComponent(o.workspaceId)+'&limit=100'+(cursor?'&cursor='+encodeURIComponent(cursor):''),signal,undefined,false,true);
   if(!Array.isArray(rows))fail('RENDER_GROUP_SHAPE_INVALID');
   for(const row of rows){const g=row?.envGroup;if(!g||typeof row.cursor!=='string'||typeof g.id!=='string'||g.ownerId!==o.workspaceId||!Array.isArray(g.serviceLinks)||typeof g.updatedAt!=='string')fail('RENDER_GROUP_SHAPE_INVALID');
    if(g.serviceLinks.some((link:any)=>link.id===o.serviceId))result.push({id:g.id,updatedAt:g.updatedAt,serviceIds:g.serviceLinks.map((link:any)=>link.id).sort()});
   }
   if(rows.length<100)return result.sort((a:any,b:any)=>a.id.localeCompare(b.id));const next=rows.at(-1).cursor;if(next===cursor)fail('RENDER_PAGINATION_INVALID');cursor=next;
  }return fail('RENDER_PAGINATION_LIMIT');
 }
 async function config(signal:AbortSignal):Promise<Config>{const service=await api('GET','',signal);if(service.id!==o.serviceId||service.ownerId!==o.workspaceId)fail('RENDER_SCOPE_DENIED');return {service:serviceConfig(service),groups:await groups(signal),env:await directCells('env-vars',signal),files:await directCells('secret-files',signal)};}
 async function deploys(signal:AbortSignal):Promise<Deploy[]>{const rows=await list('/deploys','deploy',signal);if(rows.some(r=>!id(r.id,'dep')||!terminal.has(r.status)&&!['created','queued','build_in_progress','update_in_progress','pre_deploy_in_progress'].includes(r.status)))fail('RENDER_DEPLOY_SHAPE_INVALID');return rows;}
 async function sleep(signal:AbortSignal){check(signal);await new Promise<void>((resolve,reject)=>{const done=()=>{signal.removeEventListener('abort',abort);resolve();},abort=()=>{clearTimeout(timer);reject(Error('RENDER_TRANSPORT_CANCELLED'));};const timer=setTimeout(done,o.pollMs??250);signal.addEventListener('abort',abort,{once:true});if(signal.aborted)abort();});}
 async function cell(p:string,signal:AbortSignal){const r=await api('GET',p,signal,undefined,true);if(r===null)return null;const v=p.startsWith('/env-vars/')?r.value:r.content;if(typeof v!=='string')fail('RENDER_CELL_INVALID');return v;}
 async function settled(p:Pending,signal:AbortSignal):Promise<boolean>{
  if(p.kind==='cell')return equal(await cell(p.path,signal),p.expected);
  if(p.kind==='suspend'||p.kind==='resume')return (await api('GET','',signal)).suspended===(p.kind==='suspend'?'suspended':'not_suspended');
  const rows=await deploys(signal);let candidates=rows.filter(r=>!p.baseline!.includes(r.id));
  if(p.deployId&&candidates.some(r=>r.id!==p.deployId))fail('RENDER_DEPLOY_AMBIGUOUS');
  if(candidates.length>1)fail('RENDER_DEPLOY_AMBIGUOUS');if(!candidates.length)return false;
  const d=candidates[0];if(d.commit?.id!==p.commit)fail('RENDER_DEPLOY_COMMIT_MISMATCH');
  if(!p.deployId){p.deployId=d.id;await save();}
  if(!terminal.has(d.status))return false;
  // Receipt is resolved even on failure: no future activation can arrive from it.
  if(d.status!=='live'){state!.pending=undefined;await save();fail('RENDER_DEPLOY_FAILED');}return true;
 }
 async function reconcile(signal:AbortSignal){if(!state?.pending)return;const p=state.pending;for(;;){check(signal);if(await settled(p,signal)){if(p.kind==='deploy'&&p.path==='/rollback')state.restoredDeployId=p.deployId;state.pending=undefined;await save();return;}await sleep(signal);}}
 async function mutate(p:Pending,signal:AbortSignal){if(!state)fail('RENDER_SNAPSHOT_REQUIRED');if(state!.pending)fail('RENDER_PENDING_RECONCILIATION');check(signal);state!.pending=p;state!.sequence++;await save();
  // A failure (including HTTP rejection) leaves durable intent. No blind replay.
  let result:any;try{result=await api(p.method,p.path,signal,p.body);}catch(e){
   if(/^RENDER_HTTP_(400|401|403|404|405|409|422|429)$/.test((e as Error).message)){
    if(p.kind==='cell')state!.applied[p.path.slice(1).split('/').map(decodeURIComponent).join('/')]=p.previous??null;
    state!.pending=undefined;await save();
   }throw e;
  }
  if(p.kind==='deploy'&&result?.id){if(!id(result.id,'dep'))fail('RENDER_DEPLOY_SHAPE_INVALID');p.deployId=result.id;await save();}
  await reconcile(signal);
 }
 async function ensureCell(kind:'env-vars'|'secret-files',key:string,value:string|null,signal:AbortSignal){const p='/'+kind+'/'+encodeURIComponent(key),previous=await cell(p,signal);if(equal(previous,value)){await save();return;}
  await mutate({method:value===null?'DELETE':'PUT',path:p,...(value===null?{}:{body:kind==='env-vars'?{value}:{content:value}}),kind:'cell',expected:value,previous},signal);
 }
 async function suspended(signal:AbortSignal){const s=await api('GET','',signal);if(s.suspended!=='suspended')fail('RENDER_NOT_SUSPENDED');const instances=await api('GET','/instances',signal);if(!Array.isArray(instances)||instances.length)fail('RENDER_INSTANCES_NOT_STOPPED');await db.assertStopped(signal);}
 async function suspend(signal:AbortSignal){if((await api('GET','',signal)).suspended!=='suspended')await mutate({method:'POST',path:'/suspend',kind:'suspend'},signal);await suspended(signal);}
 async function noRunningDeploys(signal:AbortSignal){if((await deploys(signal)).some(d=>!terminal.has(d.status)))fail('RENDER_DEPLOY_STILL_RUNNING');}
 async function drift(signal:AbortSignal){const c=await config(signal),s=state!;if(!equal(c.groups,s.original.groups))fail('RENDER_INHERITED_CONFIG_DRIFT');if(!equal(c.service,s.original.service))fail('RENDER_SERVICE_DRIFT');
  for(const [kind,current,original] of [['env-vars',c.env,s.original.env],['secret-files',c.files,s.original.files]] as const){
   const expected={...original};for(const [p,v] of Object.entries(s.applied)){if(!p.startsWith(kind+'/'))continue;const k=p.slice(kind.length+1);if(v===null)delete expected[k];else expected[k]=v;}
   if(!equal(current,expected))fail('RENDER_CONFIG_DRIFT');
  }
 }
 async function change(kind:'env-vars'|'secret-files',key:string,value:string|null,signal:AbortSignal){
  // Expected desired value is durable before dispatch; response loss reconciles it.
  state!.applied[kind+'/'+key]=value;await ensureCell(kind,key,value,signal);
 }
 async function deploy(body:unknown,commit:string,signal:AbortSignal){await suspended(signal);await noRunningDeploys(signal);const baseline=(await deploys(signal)).map(d=>d.id);
  await mutate({method:'POST',path:'/deploys',body,kind:'deploy',baseline,commit},signal);
  // Do not resume if deployment unexpectedly started instances while suspended.
  await suspended(signal);
 }
 async function resume(signal:AbortSignal){await mutate({method:'POST',path:'/resume',kind:'resume'},signal);}
 async function exclusive<T>(fn:()=>Promise<T>):Promise<T>{if(closed||lock.journal.signal!.aborted)fail('RENDER_TRANSPORT_CLOSED');if(busy)fail('RENDER_TRANSPORT_CONCURRENT');busy=true;try{return await fn();}finally{busy=false;}}
 const reference='render:'+scope;
 return {
  async close(){if(busy)fail('RENDER_TRANSPORT_BUSY');closed=true;await lock.close();},
  mode:db.mode,
  preflight:(r,signal)=>exclusive(async()=>{if(!equal(r,o.request))fail('RENDER_SCOPE_DENIED');const c=await config(signal);if(!['off','no'].includes(String(c.service.autoDeploy)))fail('RENDER_AUTODEPLOY_MUST_BE_OFF');await db.preflight(r,signal);}),
  snapshot:signal=>exclusive(async()=>{if(state)fail('RENDER_SNAPSHOT_ALREADY_EXISTS');const original=await config(signal);await noRunningDeploys(signal);const live=(await deploys(signal)).filter(d=>d.status==='live');if(live.length!==1||!live[0].commit?.id)fail('RENDER_LIVE_RELEASE_REQUIRED');if((await api('GET','',signal)).suspended!=='not_suspended')fail('RENDER_ORIGINAL_MUST_BE_RUNNING');
   if(files.some(f=>Object.hasOwn(original.files,f)))fail('RENDER_APPROVAL_FILE_COLLISION');state={version:1,scope,original,originalDeploy:live[0],sequence:0,applied:{}};await save();return reference;}),
  pause:(ref,signal)=>exclusive(async()=>{if(ref!==reference||!state)fail('RENDER_SNAPSHOT_SCOPE_MISMATCH');await drift(signal);await suspend(signal);}),
  create:db.create.bind(db),lookup:db.lookup.bind(db),observe:db.observe.bind(db),cancelAndCapture:db.cancelAndCapture.bind(db),
  deliver:(input,signal)=>exclusive(async()=>{if(!state||input.trial.rootGoalId!==o.request.rootGoalId||input.payload.commit!==o.request.spec.commit)fail('RENDER_SCOPE_DENIED');await suspended(signal);await drift(signal);
   const env={...o.environment,SAM_EVALUATION_TRIAL_ID:input.trial.id,SAM_EVALUATION_COMMIT:o.request.spec.commit,SAM_EVALUATION_APPROVAL_PATH:'/etc/secrets/'+files[1],SAM_EVALUATION_OWNER_PUBLIC_KEY_PATH:'/etc/secrets/'+files[0]};
   await change('secret-files',files[0],input.publicKey,signal);await change('secret-files',files[1],JSON.stringify({payload:input.payload,signature:input.signature}),signal);
   for(const [key,value] of Object.entries(env))await change('env-vars',key,value,signal);
  }),
  restart:(trial,signal)=>exclusive(async()=>{if(!state||trial.rootGoalId!==o.request.rootGoalId)fail('RENDER_SCOPE_DENIED');await drift(signal);await deploy({buildId:o.preparedBuildId},o.request.spec.commit,signal);await resume(signal);await db.verifyRuntime({commit:o.request.spec.commit,trialId:trial.id,restored:false},signal);state!.launched=true;await save();}),
  quiesce:(_root,signal)=>exclusive(async()=>{if(_root!==o.request.rootGoalId||!state)fail('RENDER_SCOPE_DENIED');await reconcile(signal);await suspend(signal);await noRunningDeploys(signal);}),
  restore:(ref,signal)=>exclusive(async()=>{if(ref!==reference||!state)fail('RENDER_SNAPSHOT_SCOPE_MISMATCH');await reconcile(signal);await suspended(signal);await noRunningDeploys(signal);
   // For an interrupted cell attempt, an unapplied desired value is allowed only
   // after its pending request has authoritatively settled. Never overwrite drift.
   await drift(signal);
   for(const p of Object.keys(state!.applied)){const slash=p.indexOf('/'),kind=p.slice(0,slash) as 'env-vars'|'secret-files',key=p.slice(slash+1),original=kind==='env-vars'?state!.original.env:state!.original.files;await change(kind,key,original[key]??null,signal);}
   const current=await deploys(signal),baseline=current.map(d=>d.id);
   if(!current.some(d=>d.status==='live'&&(d.id===state!.originalDeploy.id||d.id===state!.restoredDeployId)))await mutate({method:'POST',path:'/rollback',body:{deployId:state!.originalDeploy.id},kind:'deploy',baseline,commit:state!.originalDeploy.commit!.id},signal);
   await suspended(signal);await resume(signal);await db.verifyRuntime({commit:state!.originalDeploy.commit!.id,restored:true},signal);state!.restored=true;await save();
  }),
  verifyRestored:(ref,signal)=>exclusive(async()=>{if(ref!==reference||!state?.restored||state!.pending)fail('RENDER_RESTORATION_PENDING');if(!equal(await config(signal),state!.original))fail('RENDER_RESTORATION_MISMATCH');await noRunningDeploys(signal);const live=(await deploys(signal)).filter(d=>d.status==='live');if(live.length!==1||live[0].commit?.id!==state!.originalDeploy.commit!.id||![state!.originalDeploy.id,state!.restoredDeployId].includes(live[0].id)||(await api('GET','',signal)).suspended!=='not_suspended')fail('RENDER_RESTORATION_MISMATCH');await db.verifyRuntime({commit:state!.originalDeploy.commit!.id,restored:true},signal);})
 };
 }catch(e){await lock.close();throw e;}
}
