/** Existing test service only. No provisioning, migration, provider or dispatcher. */
import {readFile,mkdtemp,writeFile,chmod,rm} from 'node:fs/promises';
import {createServer,request,type Server} from 'node:http';
import {createRequire} from 'node:module';
import {openPersistentBinding} from './persistentBinding';
const require=createRequire(import.meta.url);
const {createStorageLease}=require('./storageLease.cjs');

export function applicationEnvironment(input:NodeJS.ProcessEnv,binding:{connectionString:string;entity:string}){
 const revision=/^[a-f0-9]{40}$/.test(input.RENDER_GIT_COMMIT??'')?input.RENDER_GIT_COMMIT:undefined;
 // A fresh allowlist, never a copy of the service environment. No old Hermes,
 // coding, provider, OAuth, scheduling or live-analysis flag reaches the app.
 return {PATH:input.PATH,TMPDIR:'/tmp',NODE_ENV:'development',SAM_DEVELOPMENT_SAFE_MODE:'1',
  DATABASE_URL:binding.connectionString,RENDER_GIT_COMMIT:revision,
  SAM_DEV_LEGAL_ENTITY_ID:binding.entity,SAM_COMMAND_CENTER_LEGAL_ENTITY_ID:binding.entity,
  SAM_COMMAND_CENTER_READ_ONLY:'1',SAM_REQUIRE_GOAL_ACCEPTANCE:'1'};
}

export async function main(){
 if(process.env.SAM_RELIABILITY_TEST_ENABLED!=='1'||process.env.RENDER_SERVICE_ID!=='srv-dbe27ics728c738tuoc0')throw Error('EXACT_TEST_SERVICE_OPT_IN_REQUIRED');
 const token=process.env.SAM_TEST_BEARER_TOKEN;
 if(!token||token.length<24)throw Error('EXISTING_TEST_TOKEN_REQUIRED');
 const revision=process.env.RENDER_GIT_COMMIT;
 if(!/^[a-f0-9]{40}$/.test(revision??''))throw Error('EXACT_BUILD_REVISION_REQUIRED');
 const hostname=process.env.RENDER_EXTERNAL_HOSTNAME;
 if(hostname!=='sam-isolated-test.onrender.com')throw Error('EXACT_TEST_HOST_REQUIRED');
 const port=Number(process.env.PORT??10000);
 if(!Number.isInteger(port)||port<1||port>65535)throw Error('TEST_PORT_INVALID');
 const secret=await readFile('/etc/secrets/sam-restricted-connection.json');
 if(secret.length<1||secret.length>8192)throw Error('PRIVATE_BINDING_FILE_REQUIRED');
 const dir=await mkdtemp('/tmp/sam-reliability-binding-');await chmod(dir,0o700);
 let storage:Awaited<ReturnType<typeof openPersistentBinding>>;
 try{await writeFile(dir+'/binding.json',secret,{mode:0o600,flag:'wx'});storage=await openPersistentBinding(dir+'/binding.json');}
 finally{secret.fill(0);await rm(dir,{recursive:true,force:true});}
 const remainingMs=storage.leaseDeadline-performance.now();
 if(remainingMs<=10000)throw Error('STORAGE_WINDOW_ENDED');
 const appEnv=applicationEnvironment(process.env,storage.binding);
 for(const name of Object.keys(process.env))delete process.env[name];
 Object.assign(process.env,appEnv);
 // Import database-bound code only after exact private binding admission.
 const [{pool},{startRuntimeService},{startCommandCenterHttpServer},{startMcpHttpServer},
  {createCoreReadTools},{ChatGPTToolRegistry},{default:composition}]=await Promise.all([
  import('../../packages/db/src/client'),import('../../apps/runtime/src/service'),
  import('../../apps/command-center/src/http'),import('../../apps/mcp/src/http'),
  import('../../apps/chatgpt-tools/src/coreReadTools'),import('../../apps/chatgpt-tools/src/registry'),
  import('../../apps/runtime/src/developmentCompositionModule')]);
 const services:{close?:()=>Promise<void>;stop?:()=>Promise<void>}[]=[];
 let proxy:Server|undefined,stopping=false;
 const stop=async()=>{
  if(stopping)return;stopping=true;lease.close();proxy?.close();
  const forced=setTimeout(()=>process.exit(1),1500);forced.unref();
  await Promise.allSettled(services.map(x=>x.stop?.()??x.close?.()));await pool.end();clearTimeout(forced);
 };
 // Imports consume the original lease too; never restart its relative duration.
 const lease=createStorageLease(storage.leaseDeadline-performance.now(),()=>void stop());
 process.on('SIGTERM',()=>void stop());process.on('SIGINT',()=>void stop());
 try{
  services.push(await startRuntimeService({port:8080,host:'127.0.0.1',tickIntervalMs:1000,composition}));
  services.push(await startCommandCenterHttpServer({legalEntityId:storage.binding.entity,port:5000,host:'127.0.0.1',
   bearerToken:token,allowedHosts:`${hostname},127.0.0.1`,allowedOrigins:`https://${hostname}`}));
  const names=new Set(['sam_list_goals','sam_get_goal','sam_get_goal_timeline','sam_get_report','sam_memory_status','sam_recall_memory','sam_list_notifications']);
  const items=createCoreReadTools().filter(x=>names.has(x.definition.name));
  if(items.length!==names.size||items.some(x=>x.definition.risk!=='READ'))throw Error('READ_SURFACE_REQUIRED');
  // Explicit scoped context supplements the fixed PostgreSQL role/RLS.
  const surface=new ChatGPTToolRegistry(items.map(x=>({...x,handler:(args:any,ctx:any)=>x.handler(args,{...ctx,legalEntityId:storage.binding.entity})})),{redactedErrors:true});
  services.push(await startMcpHttpServer({surface,actor:'isolated-reliability-owner',port:3001,host:'127.0.0.1',bearerToken:token,
   allowedHosts:`${hostname},127.0.0.1`,allowedOrigins:`https://${hostname}`}));
  proxy=createServer(async(req,res)=>{
   if(stopping||lease.expired()){res.writeHead(503);res.end('Test storage window expired');return;}
   if(req.method==='GET'&&req.url==='/readyz'){
    const statuses=await Promise.all([8080,3001,5000].map(async p=>{
     try{return (await fetch(`http://127.0.0.1:${p}/${p===3001?'livez':'readyz'}`,{signal:AbortSignal.timeout(1000)})).status;}catch{return 503;}
    }));
    const ready=statuses.every(s=>s===200);res.writeHead(ready?200:503,{'content-type':'application/json','cache-control':'no-store'});
    res.end(JSON.stringify({ready,revision,services:statuses,mode:'SYNTHETIC_PERSISTENT_READ_ONLY',liveReasoningValidated:false,modelCalls:0,containerReplacementValidated:false}));return;
   }
   // This staging release exposes existing results only. Even ordinary goal
   // intake is closed; MCP is a strict READ-only tool allowlist above.
   if(req.url?.startsWith('/api/')&&req.method!=='GET'){res.writeHead(405);res.end('Test release is read-only');return;}
   const upstream=request({hostname:'127.0.0.1',port:req.url?.startsWith('/mcp')?3001:5000,path:req.url,method:req.method,headers:req.headers},r=>{res.writeHead(r.statusCode??502,r.headers);r.pipe(res);});
   upstream.on('error',()=>{if(!res.headersSent)res.writeHead(503);res.end('Test service unavailable');});req.pipe(upstream);
  });
  await new Promise<void>((resolve,reject)=>{proxy!.once('error',reject);proxy!.listen(port,'0.0.0.0',resolve);});
  console.info(JSON.stringify({event:'SAM_RELIABILITY_TEST_READY',revision,mode:'SYNTHETIC_PERSISTENT_READ_ONLY',modelCalls:0}));
 }catch(e){await stop();throw e;}
}

if(process.argv[1]?.endsWith('/entry.ts'))void main().catch(e=>{
 const code=/^(?:PERSISTENT_|PRIVATE_|STORAGE_|EXACT_|EXISTING_)[A-Z_]+$/.test(e?.message??'')?e.message:'TEST_STARTUP_FAILED';
 console.error(JSON.stringify({event:'SAM_RELIABILITY_TEST_BLOCKED',code,modelCalls:0}));process.exitCode=1;
});
