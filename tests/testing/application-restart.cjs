// Boots REAL application entrypoints from the clean-built image. Maintenance
// composition only, synthetic database/schema/tokens, no model or provider keys.
const assert=require('node:assert/strict');
const {Client}=require('pg');
const {spawn,spawnSync}=require('node:child_process');
const {randomUUID}=require('node:crypto');
const path=require('node:path');
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const url=new URL(process.env.DATABASE_URL||'');
assert.equal(url.hostname,'127.0.0.1');assert.equal(url.pathname,'/sam_core_test_application');
const schema='verification_service',token='verification-fixture-bearer';
async function main(){
 const c=new Client({connectionString:url.href});await c.connect();let children=[];
 const stop=async()=>{
  for(const child of children)if(child.exitCode===null&&child.signalCode===null)child.kill('SIGTERM');
  for(let i=0;i<200&&children.some(c=>c.exitCode===null&&c.signalCode===null);i++)await wait(50);
  for(const child of children)if(child.exitCode===null&&child.signalCode===null)child.kill('SIGKILL');
 };
 try{
  await c.query('CREATE SCHEMA '+schema);url.searchParams.set('options','-c search_path='+schema+',public');
  const migrated=spawnSync(process.execPath,['packages/db/src/migrate.js','--apply'],{
   env:{PATH:process.env.PATH,DATABASE_URL:url.href},encoding:'utf8',timeout:60000});
  assert.equal(migrated.status,0,migrated.stdout+migrated.stderr);
  const org=randomUUID(),entity=randomUUID();
  await c.query(`INSERT INTO ${schema}.organizations(id,name) VALUES($1,'Service restart fixture')`,[org]);
  await c.query(`INSERT INTO ${schema}.legal_entities(id,org_id,name) VALUES($1,$2,'Service restart fixture')`,[entity,org]);
  const env={PATH:process.env.PATH,HOME:'/tmp',NODE_ENV:'development',DATABASE_URL:url.href,
   SAM_DEVELOPMENT_SAFE_MODE:'1',SAM_RUNTIME_HOST:'127.0.0.1',SAM_MCP_HOST:'127.0.0.1',SAM_COMMAND_CENTER_HOST:'127.0.0.1',
   PORT:'8080',SAM_RUNTIME_PORT:'8080',SAM_MCP_PORT:'3001',SAM_COMMAND_CENTER_PORT:'5000',SAM_TICK_INTERVAL_MS:'100',
   SAM_COMMAND_CENTER_LEGAL_ENTITY_ID:entity,SAM_COMMAND_CENTER_ALLOWED_HOSTS:'127.0.0.1,localhost',
   SAM_MCP_ALLOWED_HOSTS:'127.0.0.1,localhost',SAM_COMMAND_CENTER_BEARER_TOKEN:token,
   SAM_MCP_RELEASE_READ_ONLY:'1',
   SAM_MCP_BEARER_TOKEN:token,SAM_RUNTIME_STATUS_BEARER_TOKEN:token,
   SAM_COMPOSITION_MODULE:path.resolve('apps/runtime/src/developmentCompositionModule.ts')};
  for(let round=0;round<2;round++){
   children=['runtime','command-center','mcp'].map(app=>{
    const render=app==='runtime'||app==='mcp';
    const child=spawn(render?'sh':process.execPath,render?['deploy/render/start.sh',app]:['--import','tsx',`apps/${app}/src/main.ts`],{env:{...env,...(render?{PORT:app==='mcp'?'3001':'8080',RENDER_EXTERNAL_HOSTNAME:'127.0.0.1'}:{})},stdio:['ignore','pipe','pipe']});
    child.on('error',()=>{});child.stdout.on('data',b=>process.stdout.write(b));child.stderr.on('data',b=>process.stderr.write(b));return child;
   });
   let ready=false;
   for(let i=0;i<200;i++){
    assert(children.every(c=>c.exitCode===null&&c.signalCode===null),'application exited before ready');
    const checks=await Promise.all([8080,5000,3001].map(p=>fetch(`http://127.0.0.1:${p}/${p===3001?'livez':'readyz'}`,{
     signal:AbortSignal.timeout(300)}).then(r=>r.status===200).catch(()=>false)));
    if(checks.every(Boolean)){ready=true;break;}await wait(50);
   }
   assert(ready,'all three real services must become ready');
   for(const [port,route] of [[8080,'/statusz'],[5000,'/api/overview'],[3001,'/mcp']]){
    assert.equal((await fetch(`http://127.0.0.1:${port}${route}`)).status,401,'unauthenticated service access');
   }
   for(const [port,route] of [[8080,'/statusz'],[5000,'/api/overview']]){
    const response=await fetch(`http://127.0.0.1:${port}${route}`,{headers:{authorization:'Bearer '+token}});
    assert.equal(response.status,200);assert.equal(typeof await response.json(),'object');
   }
   let ticked=false;
   for(let attempt=0;attempt<100;attempt++){
    const metrics=await(await fetch('http://127.0.0.1:8080/statusz',{headers:{authorization:'Bearer '+token}})).json();
    assert.equal(metrics.errors,0);assert.equal(metrics.dependencyFailures,0);
    if(metrics.ticks>0){ticked=true;break;}await wait(20);
   }
   assert(ticked,'real maintenance tick must complete, not just listen on a port');
   const initialized=await fetch('http://127.0.0.1:3001/mcp',{
    method:'POST',headers:{authorization:'Bearer '+token,'content-type':'application/json',accept:'application/json, text/event-stream'},
    body:JSON.stringify({jsonrpc:'2.0',id:1,method:'initialize',params:{protocolVersion:'2025-11-25',capabilities:{},clientInfo:{name:'verification-fixture',version:'1'}}})
   });
   assert.equal(initialized.status,200);assert.match(await initialized.text(),/"result"/);
   const notification=await fetch('http://127.0.0.1:3001/mcp',{
    method:'POST',headers:{authorization:'Bearer '+token,'content-type':'application/json',accept:'application/json, text/event-stream',
     'mcp-protocol-version':'2025-11-25',...(initialized.headers.get('mcp-session-id')?{'mcp-session-id':initialized.headers.get('mcp-session-id')}:{})},
    body:JSON.stringify({jsonrpc:'2.0',method:'notifications/initialized'})
   });
   assert([200,202].includes(notification.status));await notification.body?.cancel();
   let rpcId=2;
   for(const name of ['sam_service_status','sam_release_test_results']){
    const id=rpcId++,response=await fetch('http://127.0.0.1:3001/mcp',{
     method:'POST',headers:{authorization:'Bearer '+token,'content-type':'application/json',accept:'application/json, text/event-stream',
      'mcp-protocol-version':'2025-11-25',...(initialized.headers.get('mcp-session-id')?{'mcp-session-id':initialized.headers.get('mcp-session-id')}:{})},
     body:JSON.stringify({jsonrpc:'2.0',id,method:'tools/call',params:{name,arguments:{}}})
    });
    assert.equal(response.status,200);const raw=await response.text();
    const body=response.headers.get('content-type').includes('text/event-stream')?
     raw.split(/\r?\n/).filter(l=>l.startsWith('data:')).map(l=>JSON.parse(l.slice(5))).find(j=>j.id===id):JSON.parse(raw);
    assert(!body.error);assert(!body.result.isError);const payload=JSON.parse(body.result.content[0].text);
    assert.equal(payload.ok,true);
    if(name==='sam_service_status'){assert.equal(payload.data.worker,'READY');assert.equal(payload.data['command-center'],'READY');}
    else assert.equal(payload.data.status,'NOT_RUN','archived/absent evidence must not become current image PASS');
   }
   await stop();for(const child of children)assert.equal(child.exitCode,0,'graceful application stop');
   assert.equal((await c.query(`SELECT count(*)::int n FROM ${schema}.legal_entities WHERE id=$1`,[entity])).rows[0].n,1);
   console.log('APPLICATION_RESTART_PASS round',round+1,'real runtime/Command Center/MCP ready, auth enforced, graceful stop, sentinel retained');
  }
 }finally{await stop();await c.query('DROP SCHEMA IF EXISTS '+schema+' CASCADE');await c.end();}
}
main().catch(e=>{console.error(e);process.exitCode=1;});
