import assert from 'node:assert/strict';
import {mkdtempSync,readFileSync,writeFileSync,symlinkSync,rmSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {tmpdir} from 'node:os';
import {resolve,join} from 'node:path';
import {spawn,spawnSync,type ChildProcess} from 'node:child_process';
import {createServer} from 'node:net';
const wait=(ms:number)=>new Promise(r=>setTimeout(r,ms));
async function port(){const s=createServer();await new Promise<void>(r=>s.listen(0,'127.0.0.1',r));const p=(s.address() as any).port;await new Promise<void>(r=>s.close(()=>r()));return p;}
export async function rehearseRollbackRuntime(urls:string[]){
 const manifest=JSON.parse(readFileSync('tests/fixtures/rollback/manifest.json','utf8'));
 const archive=readFileSync('tests/fixtures/rollback/pr50-source.tar.gz');
 assert.equal(createHash('sha256').update(archive).digest('hex'),manifest.archiveSha256);
 const root=mkdtempSync(join(tmpdir(),'sam-pr50-rollback-')),children:ChildProcess[]=[];
 try{
  const unpack=spawnSync('tar',['-xzf',resolve('tests/fixtures/rollback/pr50-source.tar.gz'),'-C',root],{encoding:'utf8'});assert.equal(unpack.status,0,unpack.stderr);
  assert.equal(readFileSync(join(root,'package-lock.json'),'utf8'),readFileSync('package-lock.json','utf8'),'rollback dependency graph must match installed lock');
  symlinkSync(resolve('node_modules'),join(root,'node_modules'),'dir');
  // Existing native production startup, immutable PR50 code. Fixture adapter
  // throws if called: no model or real provider is available in this rehearsal.
  const fixture=join(root,'fixture.cjs');writeFileSync(fixture,`module.exports={capabilities:[{capabilityId:'fixture.read',authorityClass:'GREEN',specialistAgentId:'fixture',specialistVersion:'1'}],toolDefinitions:[{capabilityId:'fixture.read',authorityClass:'GREEN',sideEffect:false}],toolAdapters:[{capabilityId:'fixture.read',async execute(){throw Error('UNEXPECTED_FIXTURE_CALL')}}]};`);
  for(let round=0;round<2;round++){
   const ports=[await port(),await port()];assert.notEqual(ports[0],ports[1]);
   const errors:string[]=[];
   for(const [i,app] of ['runtime','mcp'].entries()){
    const child=spawn('sh',['deploy/render/start.sh',app],{cwd:root,env:{PATH:process.env.PATH,HOME:'/tmp',NODE_ENV:'production',DATABASE_URL:urls[i],
     PORT:String(ports[i]),SAM_RUNTIME_HOST:'127.0.0.1',RENDER_EXTERNAL_HOSTNAME:'127.0.0.1',SAM_WORKER_ID:'synthetic-rollback',SAM_TICK_INTERVAL_MS:'100',
     SAM_COMPOSITION_MODULE:join(root,'apps/runtime/src/productionCompositionModule.ts'),SAM_PRODUCTION_BUNDLE_MODULE:fixture,
     SAM_MCP_BEARER_TOKEN:'synthetic-rollback-bearer',SAM_RUNTIME_STATUS_BEARER_TOKEN:'synthetic-rollback-bearer'},stdio:['ignore','pipe','pipe']});
    child.stderr?.on('data',b=>errors.push(String(b)));child.stdout?.resume();children.push(child);
   }
   let ready=false;
   for(let n=0;n<100;n++){
    assert(children.every(c=>c.exitCode===null),'rollback child exited: '+errors.join(''));
    const state=await Promise.all(ports.map((p,i)=>fetch(`http://127.0.0.1:${p}/${i?'livez':'readyz'}`,{signal:AbortSignal.timeout(250)}).then(r=>r.status===200).catch(()=>false)));
    if(state.every(Boolean)){ready=true;break;}await wait(100);
   }
   assert(ready,'rollback services ready with restricted production principals');
   assert.equal((await fetch(`http://127.0.0.1:${ports[1]}/mcp`)).status,401);
   const status=await fetch(`http://127.0.0.1:${ports[0]}/statusz`,{headers:{authorization:'Bearer synthetic-rollback-bearer'}});assert.equal(status.status,200);
   const metrics=await status.json() as any;assert.equal(metrics.errors,0);assert.equal(metrics.dependencyFailures,0);
   for(const child of children)child.kill('SIGTERM');
   for(let n=0;n<100&&children.some(c=>c.exitCode===null);n++)await wait(50);
   assert(children.every(c=>c.exitCode===0),'graceful rollback shutdown');children.length=0;
   console.log('ROLLBACK_PR50 PASS round',round+1,manifest.source,'unchanged production entrypoints; restricted principals; no migrations or live adapters');
  }
 }finally{for(const child of children)if(child.exitCode===null)child.kill('SIGKILL');rmSync(root,{recursive:true,force:true});}
}
