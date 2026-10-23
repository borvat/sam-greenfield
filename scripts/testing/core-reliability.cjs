// Local disposable database only. Never inherit provider keys or production URLs.
const {Client}=require('pg');const {spawnSync}=require('node:child_process');const fs=require('node:fs');const path=require('node:path');
async function main(){
 const url=new URL(process.env.SAM_CORE_TEST_DATABASE_URL||'');
 if(!['127.0.0.1','localhost'].includes(url.hostname)||!/^\/sam_core_test(?:_[a-z0-9]+)?$/.test(url.pathname))throw Error('DISPOSABLE_LOCAL_DATABASE_REQUIRED');
 const root=path.resolve(__dirname,'../..');process.chdir(root);
 const selected=process.argv.indexOf('--suite');
 if(selected>=0&&!/^tests\/[a-zA-Z0-9_/-]+\.(ts|cjs)$/.test(process.argv[selected+1]??''))throw Error('TEST_PATH_INVALID');
 const tests=selected>=0?[process.argv[selected+1]]:process.argv.includes('--regression')?fs.readdirSync('tests').filter(x=>/^phase[1-9][0-9]*$/.test(x)).sort((a,b)=>Number(a.slice(5))-Number(b.slice(5))).flatMap(d=>fs.readdirSync('tests/'+d).filter(x=>x.endsWith('.ts')).map(f=>'tests/'+d+'/'+f)):['tests/core/reliability.ts','tests/core/planningConcurrency.ts','tests/core/reservationRace.ts','tests/core/tenantWorkload.ts','tests/core/eventBacklog.ts','tests/core/learningScheduling.ts','tests/core/startupAdmission.ts','tests/core/planningDeadline.ts','tests/core/planningRepair.ts','tests/core/reviewReliability.ts','tests/core/evidenceTransforms.ts','tests/core/evidenceIntegration.ts','tests/core/sourceContracts.ts','tests/core/evidenceChaining.ts','tests/core/ordinaryAllowance.ts','tests/core/ordinaryPath.ts','tests/core/ordinaryZeroTools.ts','tests/core/ordinaryMissingRegistration.ts','tests/core/ordinaryCancellation.ts','tests/core/ordinaryRestart.ts','tests/core/ordinaryUnknownSemantics.ts','tests/core/ordinaryRevocation.ts'];
 const admin=new Client({connectionString:url.href});await admin.connect();let results=[];
 try{for(const test of tests){
   const schema='core_'+process.pid+'_'+results.length,startedAt=new Date().toISOString();
   await admin.query('CREATE SCHEMA '+schema);
   try{
     const target=new URL(url);target.searchParams.set('options','-c search_path='+schema+',public');
     const env={PATH:process.env.PATH,TMPDIR:'/tmp',NODE_ENV:'test',DATABASE_URL:target.href};
     if(/^[0-9a-f]{40}$/.test(process.env.SAM_VERIFICATION_SOURCE_SHA||''))env.SAM_VERIFICATION_SOURCE_SHA=process.env.SAM_VERIFICATION_SOURCE_SHA;
     if(process.env.SAM_EVALUATION_ARTIFACT_DIR==='/evidence')env.SAM_EVALUATION_ARTIFACT_DIR='/evidence';
     if(process.env.SAM_VERIFICATION_ARTIFACT_DIR==='/evidence')env.SAM_VERIFICATION_ARTIFACT_DIR='/evidence';
     const commands=[];
     const execute=(args,timeout)=>{
       const start=new Date().toISOString(),r=spawnSync(process.execPath,args,{env,encoding:'utf8',timeout});
       commands.push({argv:[process.execPath,...args],startedAt:start,completedAt:new Date().toISOString(),
         exitCode:r.status,signal:r.signal,error:r.error?.code??null});return r;
     };
     const migrated=execute(['packages/db/src/migrate.js','--apply'],30000);
     const run=migrated.status===0?execute(['--import','tsx',test],/^tests\/core\/ordinary/.test(test)?240000:test==='tests/evaluation/sharedPath.ts'?180000:90000):migrated;
     const passed=run.status===0;results.push({test,passed,status:passed?'PASS':'FAIL',exit:run.status,
       startedAt,completedAt:new Date().toISOString(),commands,testExecuted:migrated.status===0});console.log(passed?'PASS':'FAIL',test);
     if(!passed)console.log((run.stdout+run.stderr).slice(-6000));else if(!process.argv.includes('--regression'))console.log(run.stdout);
   }finally{await admin.query('DROP SCHEMA '+schema+' CASCADE');}
 }}finally{await admin.end();}
 console.log(JSON.stringify({passed:results.filter(x=>x.passed).length,failed:results.filter(x=>!x.passed).length,results}));
 if(results.some(x=>!x.passed))process.exitCode=1;
}
main().catch(()=>{console.error('ISOLATED_TEST_RUN_FAILED');process.exitCode=1;});
