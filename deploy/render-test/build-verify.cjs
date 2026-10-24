// Build-only PostgreSQL rehearsal. No service credentials are referenced as
// Docker ARGs or passed to child processes. Only the nonsecret source SHA is used.
const {spawnSync}=require('node:child_process');
const fs=require('node:fs');
const {randomBytes}=require('node:crypto');
const {Client}=require('pg');
const {runVerification}=require('./verification.cjs');
const pg='/usr/lib/postgresql/15/bin/';
function command(bin,args){const r=spawnSync(bin,args,{stdio:'inherit'});if(r.status!==0)throw Error('BUILD_DATABASE_COMMAND_FAILED');}
async function main(){
 if(!/^[a-f0-9]{40}$/.test(process.env.RENDER_GIT_COMMIT||''))throw Error('BUILD_SOURCE_COMMIT_REQUIRED');
 const data=fs.mkdtempSync('/tmp/sam-build-pg-');let started=false;
 try{
  command('chown',['postgres:postgres',data]);
  command('runuser',['-u','postgres','--',pg+'initdb','-D',data,'--encoding=UTF8','--auth-local=trust','--auth-host=scram-sha-256']);
  command('runuser',['-u','postgres','--',pg+'pg_ctl','-D',data,'-l','/tmp/sam-build-postgres.log','-o',"-c listen_addresses=127.0.0.1 -c shared_buffers=32MB -c max_connections=25",'-w','start']);started=true;
  const secret=randomBytes(32).toString('hex');
  const c=new Client({host:'/var/run/postgresql',user:'postgres',database:'postgres'});
  try{await c.connect();await c.query(`ALTER ROLE postgres PASSWORD '${secret}'`);await c.query('CREATE DATABASE sam_core_test');}finally{await c.end();}
  const report=await runVerification({databaseUrl:`postgres://postgres:${secret}@127.0.0.1:5432/sam_core_test`,sourceCommit:process.env.RENDER_GIT_COMMIT});
  if(report.status!=='FIXTURE_SUITES_PASSED_API_PENDING')throw Error('BUILD_FIXTURE_VERIFICATION_FAILED');
  fs.mkdirSync('/app/test-results',{recursive:true,mode:0o700});
  fs.writeFileSync('/app/test-results/build-verification.json',JSON.stringify({...report,executionEnvironment:'DOCKER_BUILD',api:{status:'NOT_RUN'}}),{mode:0o600});
 }finally{
  if(started)spawnSync('runuser',['-u','postgres','--',pg+'pg_ctl','-D',data,'-m','fast','-w','stop'],{stdio:'ignore'});
  fs.rmSync(data,{recursive:true,force:true});
 }
}
void main().catch(()=>{console.error('BUILD_FIXTURE_VERIFICATION_FAILED; inspect sanitized suite diagnostics');process.exitCode=1;});
