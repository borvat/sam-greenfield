// Local disposable database only. Never inherit provider keys or production URLs.
const {Client}=require('pg');const {spawnSync}=require('node:child_process');const fs=require('node:fs');const path=require('node:path');
async function main(){
 const url=new URL(process.env.SAM_CORE_TEST_DATABASE_URL||'');
 if(!['127.0.0.1','localhost'].includes(url.hostname)||!/^\/sam_core_test(?:_[a-z0-9]+)?$/.test(url.pathname))throw Error('DISPOSABLE_LOCAL_DATABASE_REQUIRED');
 const root=path.resolve(__dirname,'../..');process.chdir(root);
 const selected=process.argv.indexOf('--suite');
 if(selected>=0&&!/^tests\/[a-zA-Z0-9_/-]+\.(ts|cjs)$/.test(process.argv[selected+1]??''))throw Error('TEST_PATH_INVALID');
 const tests=selected>=0?[process.argv[selected+1]]:process.argv.includes('--regression')?fs.readdirSync('tests').filter(x=>/^phase[1-9][0-9]*$/.test(x)).sort((a,b)=>Number(a.slice(5))-Number(b.slice(5))).flatMap(d=>fs.readdirSync('tests/'+d).filter(x=>x.endsWith('.ts')).map(f=>'tests/'+d+'/'+f)):['tests/core/reliability.ts'];
 const admin=new Client({connectionString:url.href});await admin.connect();let results=[];
 try{for(const test of tests){
   const schema='core_'+process.pid+'_'+results.length;
   await admin.query('CREATE SCHEMA '+schema);
   try{
     const target=new URL(url);target.searchParams.set('options','-c search_path='+schema+',public');
     const env={PATH:process.env.PATH,TMPDIR:'/tmp',NODE_ENV:'test',DATABASE_URL:target.href};
     const migrated=spawnSync(process.execPath,['packages/db/src/migrate.js','--apply'],{env,encoding:'utf8',timeout:30000});
     const run=migrated.status===0?spawnSync(process.execPath,['--import','tsx',test],{env,encoding:'utf8',timeout:90000}):migrated;
     const passed=run.status===0;results.push({test,passed,exit:run.status});console.log(passed?'PASS':'FAIL',test);
     if(!passed)console.log((run.stdout+run.stderr).slice(-6000));else if(!process.argv.includes('--regression'))console.log(run.stdout);
   }finally{await admin.query('DROP SCHEMA '+schema+' CASCADE');}
 }}finally{await admin.end();}
 console.log(JSON.stringify({passed:results.filter(x=>x.passed).length,failed:results.filter(x=>!x.passed).length,results}));
 if(results.some(x=>!x.passed))process.exitCode=1;
}
main().catch(()=>{console.error('ISOLATED_TEST_RUN_FAILED');process.exitCode=1;});
