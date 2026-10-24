// Engineering tests on the container's disposable PostgreSQL only. No paid
// models, production URLs, host control or real business data enter children.
const {spawn}=require('node:child_process');
const fs=require('node:fs');
const SUITES=['tests/core/reliability.ts','tests/core/tenantWorkload.ts','tests/evaluation/sharedPath.ts','tests/evaluation/budgets.ts'];
async function runVerification({databaseUrl,sourceCommit}){
 const u=new URL(databaseUrl);
 if(u.hostname!=='127.0.0.1'||u.pathname!=='/sam_core_test'||!/^[a-f0-9]{40}$/.test(sourceCommit||''))throw Error('LOCAL_VERIFICATION_SCOPE_REQUIRED');
 const report={version:1,sourceCommit,mode:'fixture',status:'RUNNING',startedAt:new Date().toISOString(),modelPaidCalls:0,liveReasoningValidated:false,results:[]};
 const persist=()=>{const path='/tmp/sam-test-verification.json';fs.writeFileSync(path+'.new',JSON.stringify(report),{mode:0o600});fs.renameSync(path+'.new',path);};
 persist();
 for(const suite of SUITES){
  const started=Date.now(),log='/tmp/sam-verification-'+report.results.length+'.log',output=fs.openSync(log,'w',0o600);
  try{
   const env={PATH:process.env.PATH,TMPDIR:'/tmp',SAM_CORE_TEST_DATABASE_URL:u.href,SAM_VERIFICATION_SOURCE_SHA:sourceCommit};
   const status=await new Promise(resolve=>{
    const child=spawn(process.execPath,['scripts/testing/core-reliability.cjs','--suite',suite],{env,detached:true,stdio:['ignore',output,output]});
    let timedOut=false,hardStop;
    const stop=signal=>{try{process.kill(-child.pid,signal);}catch{}};
    const timer=setTimeout(()=>{timedOut=true;stop('SIGTERM');hardStop=setTimeout(()=>stop('SIGKILL'),2000);},220000);
    child.on('error',()=>{clearTimeout(timer);resolve({exitCode:null,signal:null,reason:'SPAWN_FAILED'});});
    child.on('close',(exitCode,signal)=>{clearTimeout(timer);clearTimeout(hardStop);if(timedOut)stop('SIGKILL');resolve({exitCode,signal,reason:timedOut?'TIMEOUT':null});});
   });
   const text=fs.readFileSync(log,'utf8');
   const passed=status.exitCode===0&&text.includes('"failed":0');
   report.results.push({suite,status:passed?'PASS':'FAIL',...status,durationMs:Date.now()-started,privateLogRetained:true});
   console.log(JSON.stringify({service:'sam-isolated-verification-suite',sourceCommit,...report.results.at(-1),liveReasoningValidated:false,modelPaidCalls:0}));
   persist();
  }finally{fs.closeSync(output);}
 }
 report.status=report.results.every(r=>r.status==='PASS')?'PASSED':'FAILED';report.completedAt=new Date().toISOString();persist();
 console.log(JSON.stringify({service:'sam-isolated-verification',sourceCommit,status:report.status,passed:report.results.filter(r=>r.status==='PASS').length,failed:report.results.filter(r=>r.status==='FAIL').length,liveReasoningValidated:false,modelPaidCalls:0}));
 return report;
}
module.exports={runVerification};
