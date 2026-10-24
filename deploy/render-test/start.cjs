// Disposable Render sandbox. Never loads production credentials or adapters.
const {spawn,spawnSync}=require('node:child_process');
const fs=require('node:fs');
const {randomBytes}=require('node:crypto');
const {Client}=require('pg');
const http=require('node:http');
const children=[];
function command(bin,args,options={}){const r=spawnSync(bin,args,{stdio:'inherit',...options});if(r.status!==0)throw new Error('Sandbox initialization failed');}
async function main(){
  for(const key of Object.keys(process.env))if(/API_KEY|CLIENT_SECRET|REFRESH_TOKEN|DATABASE_URL|SAM_PRODUCTION|GOOGLE_|BOL_|EBOEK/i.test(key))delete process.env[key];
  const pg='/usr/lib/postgresql/15/bin/';
  const data=fs.mkdtempSync('/tmp/sam-test-');command('chown',['postgres:postgres',data]);
  command('runuser',['-u','postgres','--',pg+'initdb','-D',data,'--encoding=UTF8','--auth-local=trust','--auth-host=scram-sha-256']);
  command('runuser',['-u','postgres','--',pg+'pg_ctl','-D',data,'-l','/tmp/sam-test-postgres.log','-o',"-c listen_addresses=127.0.0.1 -c shared_buffers=32MB -c max_connections=25",'-w','start']);
  const password=randomBytes(32).toString('hex');
  const admin=new Client({host:'/var/run/postgresql',user:'postgres',database:'postgres'});await admin.connect();
  await admin.query(`CREATE ROLE sam_synthetic LOGIN PASSWORD '${password}'`);
  await admin.query('CREATE DATABASE sam_synthetic OWNER sam_synthetic');await admin.end();
  const env={PATH:process.env.PATH,HOME:'/tmp',NODE_ENV:'development',SAM_DEVELOPMENT_SAFE_MODE:'1',DATABASE_URL:`postgres://sam_synthetic:${password}@127.0.0.1:5432/sam_synthetic`};
  command(process.execPath,['packages/db/src/migrate.js','--apply'],{env});
  const client=new Client({connectionString:env.DATABASE_URL});await client.connect();
  const org=(await client.query("INSERT INTO organizations(name) VALUES('TEST-SAM') RETURNING id")).rows[0].id;
  const entity=(await client.query("INSERT INTO legal_entities(org_id,name) VALUES($1,'TEST-SAM') RETURNING id",[org])).rows[0].id;await client.end();
  const token=process.env.SAM_TEST_BEARER_TOKEN;if(!token)throw new Error('SAM_TEST_BEARER_TOKEN required');
  const host=process.env.RENDER_EXTERNAL_HOSTNAME||'localhost';
  const launch=(entry,extra)=>{const p=spawn(process.execPath,['--import','tsx',entry],{env:{...env,...extra},stdio:'inherit'});children.push(p);p.on('exit',()=>shutdown(1));};
  launch('apps/runtime/src/main.ts',{PORT:'8080',SAM_RUNTIME_HOST:'127.0.0.1',SAM_WORKER_ID:'render-test',SAM_COMPOSITION_MODULE:'/app/apps/runtime/src/developmentCompositionModule.ts',SAM_RUNTIME_STATUS_BEARER_TOKEN:token});
  launch('apps/command-center/src/main.ts',{SAM_COMMAND_CENTER_PORT:'5000',SAM_COMMAND_CENTER_HOST:'0.0.0.0',SAM_COMMAND_CENTER_LEGAL_ENTITY_ID:entity,SAM_DEV_LEGAL_ENTITY_ID:entity,SAM_COMMAND_CENTER_BEARER_TOKEN:token,SAM_COMMAND_CENTER_ALLOWED_HOSTS:`${host},localhost,127.0.0.1`,SAM_COMMAND_CENTER_ALLOWED_ORIGINS:`https://${host}`});
  launch('apps/mcp/src/main.ts',{SAM_MCP_PORT:'3001',SAM_MCP_HOST:'127.0.0.1',SAM_MCP_BEARER_TOKEN:token,SAM_MCP_ALLOWED_HOSTS:`${host},localhost,127.0.0.1`,SAM_MCP_ALLOWED_ORIGINS:`https://${host}`,SAM_DEV_LEGAL_ENTITY_ID:entity});
  http.createServer(async(req,res)=>{
    if(req.url==='/readyz'){
      try{
        const checks=await Promise.all([8080,3001,5000].map(port=>fetch(`http://127.0.0.1:${port}/${port===3001?'livez':'readyz'}`,{signal:AbortSignal.timeout(3000)})));
        const ready=checks.every(r=>r.status===200);res.writeHead(ready?200:503,{'content-type':'application/json'});res.end(JSON.stringify({ready,services:checks.map(r=>r.status)}));
      }catch{res.writeHead(503);res.end('not ready');}return;
    }
    const upstream=http.request({hostname:'127.0.0.1',port:req.url?.startsWith('/mcp')?3001:5000,path:req.url,method:req.method,headers:req.headers},response=>{res.writeHead(response.statusCode,response.headers);response.pipe(res);});
    upstream.on('error',()=>{if(!res.headersSent)res.writeHead(503);res.end('service starting');});
    req.pipe(upstream);
  }).listen(Number(process.env.PORT||10000),'0.0.0.0');
  console.log('SAM disposable sandbox started: local PostgreSQL; maintenance-only; no external adapters. Data resets on redeploy.');
}
let stopping=false;function shutdown(code){if(stopping)return;stopping=true;for(const p of children)p.kill('SIGTERM');setTimeout(()=>process.exit(code),1500);}
process.on('SIGTERM',()=>shutdown(0));process.on('SIGINT',()=>shutdown(0));
main().catch(()=>{console.error('SAM sandbox initialization failed; details withheld');shutdown(1);});
