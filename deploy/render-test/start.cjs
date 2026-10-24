// Disposable Render sandbox. Never loads production credentials or adapters.
const {spawn,spawnSync}=require('node:child_process');
const fs=require('node:fs');
const {randomBytes}=require('node:crypto');
const {Client}=require('pg');
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
  launch('apps/command-center/src/main.ts',{SAM_COMMAND_CENTER_PORT:process.env.PORT||'10000',SAM_COMMAND_CENTER_HOST:'0.0.0.0',SAM_COMMAND_CENTER_LEGAL_ENTITY_ID:entity,SAM_DEV_LEGAL_ENTITY_ID:entity,SAM_COMMAND_CENTER_BEARER_TOKEN:token,SAM_COMMAND_CENTER_ALLOWED_HOSTS:`${host},localhost,127.0.0.1`,SAM_COMMAND_CENTER_ALLOWED_ORIGINS:`https://${host}`});
  console.log('SAM disposable sandbox started: local PostgreSQL; maintenance-only; no external adapters. Data resets on redeploy.');
}
let stopping=false;function shutdown(code){if(stopping)return;stopping=true;for(const p of children)p.kill('SIGTERM');setTimeout(()=>process.exit(code),1500);}
process.on('SIGTERM',()=>shutdown(0));process.on('SIGINT',()=>shutdown(0));
main().catch(()=>{console.error('SAM sandbox initialization failed; details withheld');shutdown(1);});
