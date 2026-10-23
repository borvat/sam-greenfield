import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createServer,type IncomingMessage,type ServerResponse} from 'node:http';
import {mkdtemp,readFile,writeFile,rm,stat,mkdir} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {spawn} from 'node:child_process';
import {once} from 'node:events';
import {ceiling} from '../../apps/agents/src/intelligence/contracts';
import {sharedCorpus,sharedCorpusHash} from '../../apps/agents/src/evaluation/sharedCorpus';
import {openLaunchJournal} from '../../apps/agents/src/evaluation/launchJournal';
import {rehearseFixtureTrialLaunch,recoverTrialLaunch,type LaunchRequest} from '../../apps/agents/src/evaluation/operatorLaunch';
import {createRenderLaunchAdministration} from '../../apps/agents/src/evaluation/renderTransport';
import {assertOfficialWire,envGroupMeta} from '../fixtures/renderWireContracts';
import {createLaunchBindings,closeFixtureBindings} from '../fixtures/renderOperatorBinding';
let evidenceCase=0;
const old='a'.repeat(40),candidate='b'.repeat(40);
const request:LaunchRequest={version:1,rootGoalId:'11111111-2222-4333-8444-000000000001',spec:{version:1,mode:'fixture',syntheticOnly:true,commit:candidate,caseId:sharedCorpus.id,corpusHash:sharedCorpusHash(),companyId:'11111111-2222-4333-8444-000000000002',rootCapabilityId:'reason.records',limits:{...ceiling,models:24,costUsd:.3},agents:{'executive-bootstrap':{...ceiling,models:0,tools:0,iterations:0,tokens:0,costUsd:0,delegations:0}},prices:[{providerId:'deepseek',model:'deepseek-flash',inputPer1k:.0003,outputPer1k:.0012}],capabilityHash:'d'.repeat(64)}};
type Fault='none'|'file-denial'|'file-loss'|'deploy-loss'|'late-file'|'hold-deploy'|'restore-denial'|'redirect'|'hold-file'|'deploy-ambiguous'|'suspended-deploy-denial'|'deploy-queued';
async function simulated(fault:Fault='none'){
 const dir=await mkdtemp(join(tmpdir(),'sam-render-api-')),env:Record<string,string>={DATABASE_URL:'ORIGINAL_FAKE_SECRET',UNRELATED:'unchanged'},files:Record<string,string>={'existing.txt':'PRESERVE_FAKE_SECRET'};
 const service:any={id:'srv-fixture',ownerId:'tea-fixture',type:'web_service',repo:'https://example.invalid/repo',branch:'production',autoDeployTrigger:'off',suspended:'not_suspended',name:'fixture runtime',slug:'fixture',rootDir:'',autoDeploy:'no',createdAt:'2026-01-01T00:00:00Z',updatedAt:'2026-01-01T00:00:00Z',dashboardUrl:'https://dashboard.render.com/web/srv-fixture',notifyOnFail:'default',suspenders:[],serviceDetails:{env:'node',envSpecificDetails:{buildCommand:'npm ci',startCommand:'original command'}}};
 const inherited={SAM_COMPOSITION_MODULE:'inherited original command'};
 const group={id:'evg-fixture',name:'fixture group',createdAt:'2026-01-01T00:00:00Z',ownerId:'tea-fixture',updatedAt:'2026-01-01T00:00:00Z',serviceLinks:[{id:'srv-fixture',name:'fixture runtime',type:'web'}]};
 let deployments:any[]=[{id:'dep-original',status:'live',commit:{id:old}}],instances=1,hit=false,delayed:(()=>void)|undefined;
 let groupResponse:((query:URLSearchParams)=>unknown)|undefined;const groupRequests:(string|null)[]=[];
 const mutations:{method:string;path:string;body:any}[]=[];
 const wireErrors:Error[]=[];
 const handle=async(req:IncomingMessage,res:ServerResponse)=>{
  let contractPath:string|undefined,body:any;
  const send=(v:any,status=200)=>{if(contractPath!==undefined)assertOfficialWire(req.method!,contractPath,status,body,v);res.writeHead(status,{'content-type':'application/json'});res.end(JSON.stringify(v));};
  const u=new URL(req.url!,'http://localhost'),path=u.pathname;
  if(path==='/probe')return send({instances,commit:deployments.find(d=>d.status==='live')?.commit.id,trialId:env.SAM_EVALUATION_TRIAL_ID});
  if(req.headers.authorization!=='Bearer PUBLIC_SIMULATION_TOKEN')return send({},401);
  if(path==='/v1/env-groups'&&req.method==='GET'){groupRequests.push(u.searchParams.get('cursor'));if(groupResponse)return send(groupResponse(u.searchParams));contractPath='/groups';return send([group]);}
  if(!path.startsWith('/v1/services/srv-fixture'))return send({},403);
  const p=path.slice('/v1/services/srv-fixture'.length);contractPath=p;const chunks=[];for await(const c of req)chunks.push(c);if(chunks.length)body=JSON.parse(Buffer.concat(chunks).toString());
  if(req.method!=='GET')mutations.push({method:req.method!,path:p,body});
  if(req.method==='GET'){
   if(!p)return send(service);
   if(p==='/instances')return send(instances?[{id:'instance-one',createdAt:new Date().toISOString()}]:[]);
   if(p==='/deploys')return send(deployments.map(deploy=>({deploy,cursor:deploy.id})));
   if(p==='/env-vars')return send(Object.entries({...inherited,...env}).map(([key,value])=>({envVar:{key,value},cursor:key})));
   if(p==='/secret-files')return send(Object.entries(files).map(([name,content])=>({secretFile:{name,content},cursor:name})));
   const match=p.match(/^\/(env-vars|secret-files)\/(.+)$/);if(match){const key=decodeURIComponent(match[2]),map=match[1]==='env-vars'?env:files;if(!Object.hasOwn(map,key))return send({},404);return send(match[1]==='env-vars'?{key,value:map[key]}:{name:key,content:map[key]});}
  }
  if(p==='/suspend'){service.suspended='suspended';instances=0;assertOfficialWire(req.method!,p,202,body,undefined);res.writeHead(202);return res.end();}
  if(p==='/resume'){service.suspended='not_suspended';instances=1;assertOfficialWire(req.method!,p,202,body,undefined);res.writeHead(202);return res.end();}
  const match=p.match(/^\/(env-vars|secret-files)\/(.+)$/);
  if(match){const key=decodeURIComponent(match[2]),map=match[1]==='env-vars'?env:files;
   if(fault==='restore-denial'&&key==='DATABASE_URL'&&body?.value==='ORIGINAL_FAKE_SECRET'&&!hit){hit=true;return send({},403);}
   if(key==='sam-eval-approval.json'&&!hit&&fault!=='none'){
    if(fault==='file-denial'){hit=true;return send({},403);}
    if(fault==='redirect'){hit=true;res.writeHead(307,{location:'http://127.0.0.1:1/steal'});return res.end();}
    if(fault==='hold-file'){hit=true;map[key]=body.content;delayed=()=>send({name:key,content:body.content},201);return;}
    if(fault==='late-file'){hit=true;delayed=()=>{map[key]=body.content;};req.socket.destroy();return;}
    if(fault==='file-loss'){hit=true;map[key]=body.content;req.socket.destroy();return;}
   }
   if(req.method==='DELETE')delete map[key];else map[key]=match[1]==='env-vars'?body.value:body.content;
   const status=req.method==='DELETE'?204:match[1]==='env-vars'?200:201;const response=req.method==='DELETE'?undefined:match[1]==='env-vars'?{key,value:map[key]}:{name:key,content:map[key]};assertOfficialWire(req.method!,p,status,body,response);res.writeHead(status,{'content-type':'application/json'});return res.end(response===undefined?undefined:JSON.stringify(response));
  }
  if(p==='/deploys'||p==='/rollback'){
   if(fault==='suspended-deploy-denial'&&p==='/deploys')return send({},409);
   const d={id:'dep-new'+mutations.length,status:'live',commit:{id:p==='/rollback'?deployments.find(d=>d.id===body.deployId)!.commit.id:candidate}};
   for(const old of deployments)if(old.status==='live')old.status='deactivated';deployments.unshift(d);
   if(fault==='deploy-queued'&&p==='/deploys'){d.status='queued';setTimeout(()=>{d.status='live';},25);assertOfficialWire(req.method!,p,202,body,undefined);res.writeHead(202);res.end();return;}
   if(fault==='deploy-ambiguous'&&!hit){hit=true;deployments.unshift({...d,id:'dep-unrelated'});req.socket.destroy();return;}
   if(fault==='deploy-loss'&&!hit){hit=true;req.socket.destroy();return;}
   if(fault==='hold-deploy'&&!hit){hit=true;delayed=()=>send(d,201);return;}
   return send(d,201);
  }
  send({},400);
 };const server=createServer((req,res)=>{void handle(req,res).catch(e=>{wireErrors.push(e);if(!res.headersSent){res.writeHead(500);res.end();}else res.destroy();});});server.listen(0,'127.0.0.1');await once(server,'listening');const baseUrl='http://127.0.0.1:'+(server.address() as any).port+'/v1/';
 await writeFile(join(dir,'fixture.json'),JSON.stringify({baseUrl}));process.env.RENDER_BINDING_FIXTURE_DIRECTORY=dir;
 return {dir,env,files,service,group,deployments,groupRequests,setGroupResponse:(fn:typeof groupResponse)=>{groupResponse=fn;},mutations,baseUrl,release:()=>delayed?.(),pending:()=>!!delayed,async close(){await closeFixtureBindings();if(process.env.SAM_RENDER_TRANSPORT_EVIDENCE_DIR){const out=resolve(process.env.SAM_RENDER_TRANSPORT_EVIDENCE_DIR);await mkdir(out,{recursive:true});const name=String(++evidenceCase).padStart(2,'0')+'-'+fault;await writeFile(join(out,name+'.json'),JSON.stringify({classification:'SIMULATED_RENDER_API_NO_HOSTED_ACCEPTANCE',fault,hostedCalls:0,paidCalls:0,mutations:mutations.map(m=>({method:m.method,path:m.path,...(['/deploys','/rollback'].includes(m.path)?{body:m.body}:{})}))},null,2)+'\n');try{await writeFile(join(out,name+'-journal.jsonl'),await readFile(join(dir,'journal/events.jsonl')));}catch(e){if((e as NodeJS.ErrnoException).code!=='ENOENT')throw e;}}server.closeAllConnections();await new Promise<void>(r=>server.close(()=>r()));await rm(dir,{recursive:true,force:true});assert.deepEqual(wireErrors.map(e=>e.message),[], 'simulated API violated independent wire contract');}};
}
async function restored(s:Awaited<ReturnType<typeof simulated>>){assert.deepEqual(s.env,{DATABASE_URL:'ORIGINAL_FAKE_SECRET',UNRELATED:'unchanged'});assert.deepEqual(s.files,{'existing.txt':'PRESERVE_FAKE_SECRET'});assert.equal(s.service.suspended,'not_suspended');assert.equal(s.mutations.filter(m=>m.path==='/deploys').length<=1,true);const receipt=JSON.parse(await readFile(join(s.dir,'trial.json'),'utf8'));assert.equal(receipt.cancelled,true);assert.equal(Date.parse(receipt.deadline)-Date.parse(receipt.createdAt),300000);const journal=await readFile(join(s.dir,'journal/events.jsonl'),'utf8');assert(!journal.includes('FAKE_SECRET'));assert(!journal.includes('PUBLIC_SIMULATION_TOKEN'));assert.equal((await stat(join(s.dir,'private/render-private-state.json'))).mode&0o077,0);}
for(const fault of ['none','file-denial','file-loss','deploy-loss','restore-denial','suspended-deploy-denial','deploy-queued'] as Fault[])test('actual launcher with simulated Render: '+fault,{timeout:20000},async()=>{
 const s=await simulated(fault),opened=await openLaunchJournal(join(s.dir,'journal'));try{const b=await createLaunchBindings(request);const result=await rehearseFixtureTrialLaunch(request,{...b,journal:opened.journal});
  if(fault==='restore-denial'){assert.equal(result.restored,false);await b.close();const next=await createLaunchBindings(request);assert((await recoverTrialLaunch(request,{...next,journal:opened.journal})).restored);}else assert(result.restored,JSON.stringify(result));
  await restored(s);if(fault==='none'){assert.deepEqual(s.mutations.find(m=>m.path==='/deploys')?.body,{buildId:'bld-prepared'});assert.deepEqual(s.mutations.find(m=>m.path==='/rollback')?.body,{deployId:'dep-original'});}
  assert.equal(s.mutations.filter(m=>m.method==='PUT'&&m.path==='/secret-files/sam-eval-approval.json').length,1);
  console.log(JSON.stringify({scenario:fault,restored:true,modelCalls:0,hostedCalls:0,mutationCount:s.mutations.length}));
 }finally{await opened.close();await s.close();}
});
test('unknown delayed write blocks restoration until authoritative readback; no blind retry',{timeout:20000},async()=>{
 const s=await simulated('late-file'),opened=await openLaunchJournal(join(s.dir,'journal'));try{
  const b=await createLaunchBindings(request);await b.admin.preflight(request,AbortSignal.timeout(1000));const ref=await b.admin.snapshot(AbortSignal.timeout(1000));await opened.journal.append({phase:'SNAPSHOT',requestHash:(await import('../../packages/shared/src/stableJson')).sha256Hex(request),at:new Date().toISOString(),detail:{reference:ref}});await b.admin.pause(ref,AbortSignal.timeout(1000));const t=await b.admin.create(request,AbortSignal.timeout(1000));
  await assert.rejects(b.admin.deliver({trial:t,payload:{commit:candidate},signature:'fixture',publicKey:'fixture'},AbortSignal.timeout(1000)),/UNCERTAIN/);
  await assert.rejects(b.admin.quiesce(request.rootGoalId,AbortSignal.timeout(70)));assert.equal(s.mutations.filter(m=>m.path==='/rollback').length,0);
  s.release();await b.close();const next=await createLaunchBindings(request);assert((await recoverTrialLaunch(request,{...next,journal:opened.journal})).restored);await restored(s);assert.equal(s.mutations.filter(m=>m.path==='/secret-files/sam-eval-approval.json'&&m.method==='PUT').length,1);
 }finally{await opened.close();await s.close();}
});
test('actual SIGKILL after remote deploy application resumes recovery without duplicate deploy',{timeout:20000},async()=>{
 const s=await simulated('hold-deploy');try{
  await writeFile(join(s.dir,'request.json'),JSON.stringify(request));const child=spawn(process.execPath,['--import','tsx','scripts/evaluation/launch.ts','rehearsal',join(s.dir,'request.json'),resolve('tests/fixtures/renderOperatorBinding.ts'),join(s.dir,'journal')],{env:{...process.env,RENDER_BINDING_FIXTURE_DIRECTORY:s.dir},stdio:'ignore'});
  const closed=once(child,'close');const end=Date.now()+5000;while(!s.pending()){if(Date.now()>end){child.kill('SIGKILL');throw Error('CRASH_BARRIER_TIMEOUT');}await new Promise(r=>setTimeout(r,10));}child.kill('SIGKILL');await closed;
  const opened=await openLaunchJournal(join(s.dir,'journal'),true);try{const next=await createLaunchBindings(request);assert((await recoverTrialLaunch(request,{...next,journal:opened.journal})).restored);await restored(s);assert.equal(s.mutations.filter(m=>m.path==='/deploys').length,1);}finally{await opened.close();}
 }finally{await s.close();}
});
async function prepare(s:Awaited<ReturnType<typeof simulated>>){
 const b=await createLaunchBindings(request),signal=AbortSignal.timeout(2000),ref=await b.admin.snapshot(signal);await b.admin.pause(ref,signal);const trial=await b.admin.create(request,signal);return {...b,ref,trial};
}
test('cancellation reaches HTTP transport; applied request is reconciled, not repeated',{timeout:10000},async()=>{
 const s=await simulated('hold-file');try{const b=await prepare(s),cancel=new AbortController();const p=b.admin.deliver({trial:b.trial,payload:{commit:candidate},signature:'fixture',publicKey:'fixture'},cancel.signal);const rejected=assert.rejects(p,/UNCERTAIN|CANCELLED/);const until=Date.now()+2000;while(!s.pending()){assert(Date.now()<until);await new Promise(r=>setTimeout(r,5));}cancel.abort();await rejected;
  await b.close();const next=await createLaunchBindings(request);await next.admin.quiesce(request.rootGoalId,AbortSignal.timeout(2000));await next.admin.cancelAndCapture(b.trial,AbortSignal.timeout(1000));await next.admin.restore(b.ref,AbortSignal.timeout(2000));await next.admin.verifyRestored(b.ref,AbortSignal.timeout(1000));assert.deepEqual(s.files,{'existing.txt':'PRESERVE_FAKE_SECRET'});assert.equal(s.mutations.filter(m=>m.method==='PUT'&&m.path==='/secret-files/sam-eval-approval.json').length,1);
 }finally{await s.close();}
});
test('configuration drift is preserved and blocks restoration, then exact verification catches later drift',{timeout:10000},async()=>{
 const s=await simulated();try{const b=await prepare(s);await b.admin.deliver({trial:b.trial,payload:{commit:candidate},signature:'fixture',publicKey:'fixture'},AbortSignal.timeout(2000));s.env.UNRELATED='other-operator';const before=s.mutations.length;
  await assert.rejects(b.admin.restore(b.ref,AbortSignal.timeout(1000)),/CONFIG_DRIFT/);assert.equal(s.mutations.length,before);assert.equal(s.env.UNRELATED,'other-operator');s.env.UNRELATED='unchanged';await b.admin.restore(b.ref,AbortSignal.timeout(2000));await b.admin.verifyRestored(b.ref,AbortSignal.timeout(1000));s.env.UNRELATED='later-drift';await assert.rejects(b.admin.verifyRestored(b.ref,AbortSignal.timeout(1000)),/RESTORATION_MISMATCH/);
 }finally{await s.close();}
});
test('service allowlist and simulation origin reject before credential access',{timeout:5000},async()=>{
 let credentials=0;const options:any={serviceId:'srv-wrong',allowedServiceIds:['srv-approved'],workspaceId:'tea-fixture',preparedBuildId:'bld-prepared',directory:'/unused',request,environment:{},credential:async()=>{credentials++;return 'UNUSED';}};
 await assert.rejects(createRenderLaunchAdministration(options,{mode:'fixture'} as any),/SCOPE_DENIED/);
 await assert.rejects(createRenderLaunchAdministration({...options,serviceId:'srv-approved',simulation:{baseUrl:'https://api.render.com/v1/'}},{mode:'fixture'} as any),/SIMULATION_DENIED/);
 assert.equal(credentials,0);
});
test('redirects never forward authentication and leave the unknown write pending',{timeout:10000},async()=>{
 const s=await simulated('redirect');try{const b=await prepare(s);await assert.rejects(b.admin.deliver({trial:b.trial,payload:{commit:candidate},signature:'fixture',publicKey:'fixture'},AbortSignal.timeout(2000)),/UNCERTAIN/);
  await assert.rejects(b.admin.quiesce(request.rootGoalId,AbortSignal.timeout(60)));assert.equal(s.mutations.filter(m=>m.path==='/resume').length,0);assert.equal(s.mutations.filter(m=>m.path==='/secret-files/sam-eval-approval.json').length,1);
 }finally{await s.close();}
});
test('ambiguous deployment receipt never chooses a candidate or repeats POST',{timeout:10000},async()=>{
 const s=await simulated('deploy-ambiguous');try{const b=await prepare(s);await b.admin.deliver({trial:b.trial,payload:{commit:candidate},signature:'fixture',publicKey:'fixture'},AbortSignal.timeout(2000));await assert.rejects(b.admin.restart(b.trial,AbortSignal.timeout(2000)),/UNCERTAIN/);
  await b.close();const recovered=await createLaunchBindings(request);await assert.rejects(recovered.admin.quiesce(request.rootGoalId,AbortSignal.timeout(2000)),/DEPLOY_AMBIGUOUS/);assert.equal(s.mutations.filter(m=>m.path==='/deploys').length,1);assert.equal(s.mutations.filter(m=>m.path==='/resume').length,0);
 }finally{await s.close();}
});
test('private snapshot lock excludes a second operator and scope cannot change on recovery',{timeout:10000},async()=>{
 const s=await simulated();try{const b=await prepare(s);await assert.rejects(createLaunchBindings(request),/LAUNCH_OPERATOR_ACTIVE/);await b.close();await assert.rejects(createLaunchBindings({...request,rootGoalId:'11111111-2222-4333-8444-000000000099'}),/SNAPSHOT_SCOPE_MISMATCH/);const recovered=await createLaunchBindings(request);await recovered.close();}finally{await s.close();}
});
test('linked environment group drift blocks writes without modifying the group',{timeout:10000},async()=>{
 const s=await simulated();try{const b=await prepare(s);s.group.updatedAt='2026-01-02T00:00:00Z';const before=s.mutations.length;await assert.rejects(b.admin.deliver({trial:b.trial,payload:{commit:candidate},signature:'fixture',publicKey:'fixture'},AbortSignal.timeout(2000)),/INHERITED_CONFIG_DRIFT/);assert.equal(s.mutations.length,before);}finally{await s.close();}
});
test('restoration rolls back the exact original deploy even when commit hashes match',{timeout:10000},async()=>{
 const s=await simulated();try{s.deployments[0].commit.id=candidate;const b=await prepare(s);await b.admin.deliver({trial:b.trial,payload:{commit:candidate},signature:'fixture',publicKey:'fixture'},AbortSignal.timeout(2000));await b.admin.restart(b.trial,AbortSignal.timeout(2000));await b.admin.quiesce(request.rootGoalId,AbortSignal.timeout(2000));await b.admin.restore(b.ref,AbortSignal.timeout(2000));await b.admin.verifyRestored(b.ref,AbortSignal.timeout(2000));assert.deepEqual(s.mutations.find(m=>m.path==='/rollback')?.body,{deployId:'dep-original'});s.deployments.find(d=>d.status==='live')!.id='dep-unrelatedsamecommit';await assert.rejects(b.admin.verifyRestored(b.ref,AbortSignal.timeout(1000)),/RESTORATION_MISMATCH/);}finally{await s.close();}
});
test('official bare envGroupMeta succeeds; required fields are enforced before mutation',{timeout:10000},async()=>{
 for(const malformed of [false,true]){const s=await simulated();try{const response:any={...s.group};if(malformed)delete response.createdAt;
  assert.equal(envGroupMeta.safeParse(response).success,!malformed);s.setGroupResponse(()=>[response]);const b=await createLaunchBindings(request);
  if(malformed)await assert.rejects(b.admin.preflight(request,AbortSignal.timeout(2000)),/GROUP_SHAPE_INVALID/);else await b.admin.preflight(request,AbortSignal.timeout(2000));assert.equal(s.mutations.length,0);
 }finally{await s.close();}}
});
test('bare full group page fails completeness without inventing a cursor from an ID',{timeout:10000},async()=>{
 const s=await simulated();try{const rows=Array.from({length:100},(_,i)=>({...s.group,id:'evg-'+i}));rows.forEach(g=>envGroupMeta.parse(g));s.setGroupResponse(()=>rows);const b=await createLaunchBindings(request);await assert.rejects(b.admin.preflight(request,AbortSignal.timeout(2000)),/GROUP_COMPLETENESS_UNPROVEN/);assert.deepEqual(s.groupRequests,[null]);assert.equal(s.mutations.length,0);}finally{await s.close();}
});
test('documented generic cursor envelope is validated and follows the opaque cursor',{timeout:10000},async()=>{
 const s=await simulated();try{s.setGroupResponse(q=>q.get('cursor')===null?Array.from({length:100},(_,i)=>({envGroup:{...s.group,id:'evg-'+i},cursor:'opaque-token-'+i})):[{envGroup:{...s.group,id:'evg-final'},cursor:'opaque-final'}]);const b=await createLaunchBindings(request);await b.admin.preflight(request,AbortSignal.timeout(2000));assert.deepEqual(s.groupRequests,[null,'opaque-token-99']);assert.equal(s.mutations.length,0);}finally{await s.close();}
});
test('mixed, duplicated and cursorless envelope responses fail closed',{timeout:10000},async()=>{
 for(const kind of ['mixed','duplicate','cursorless'] as const){const s=await simulated();try{s.setGroupResponse(()=>kind==='mixed'?[s.group,{envGroup:s.group,cursor:'x'}]:kind==='duplicate'?[s.group,s.group]:[{envGroup:s.group}]);const b=await createLaunchBindings(request);await assert.rejects(b.admin.preflight(request,AbortSignal.timeout(2000)),kind==='duplicate'?/GROUP_DUPLICATE/:/GROUP_SHAPE_INVALID/);assert.equal(s.mutations.length,0);}finally{await s.close();}}
});
test('repeated cursor cannot conceal an incomplete group collection',{timeout:10000},async()=>{
 const s=await simulated();try{let page=0;s.setGroupResponse(()=>Array.from({length:100},(_,i)=>({envGroup:{...s.group,id:'evg-'+page+'-'+i},cursor:'same-cursor'})).map((r,i)=>{if(i===99)page++;return r;}));const b=await createLaunchBindings(request);await assert.rejects(b.admin.preflight(request,AbortSignal.timeout(2000)),/PAGINATION_INVALID/);assert.deepEqual(s.groupRequests,[null,'same-cursor']);assert.equal(s.mutations.length,0);}finally{await s.close();}
});
