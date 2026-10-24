// Engineering tests on the container's disposable PostgreSQL only. No paid
// models, production URLs, host control or real business data enter children.
const {spawn}=require('node:child_process');
const fs=require('node:fs');
const {Client}=require('pg');
const SUITES=['tests/core/reliability.ts','tests/core/tenantWorkload.ts','tests/evaluation/sharedPath.ts','tests/evaluation/budgets.ts'];
async function runVerification({databaseUrl,sourceCommit,probe,startApplication}){
 const u=new URL(databaseUrl);
 if(u.hostname!=='127.0.0.1'||u.pathname!=='/sam_core_test'||!/^[a-f0-9]{40}$/.test(sourceCommit||''))throw Error('LOCAL_VERIFICATION_SCOPE_REQUIRED');
 const report={version:1,sourceCommit,mode:'fixture',status:'RUNNING',startedAt:new Date().toISOString(),modelPaidCalls:0,liveReasoningValidated:false,results:[]};
 const persist=()=>{const path='/tmp/sam-test-verification.json';fs.writeFileSync(path+'.new',JSON.stringify(report),{mode:0o600});fs.renameSync(path+'.new',path);};
 persist();
 report.api={status:'PENDING'};persist();
 for(const suite of SUITES){
  const started=Date.now(),log='/tmp/sam-verification-'+report.results.length+'.log',output=fs.openSync(log,'w',0o600);
  try{
   const env={PATH:process.env.PATH,TMPDIR:'/tmp',SAM_CORE_TEST_DATABASE_URL:u.href,SAM_VERIFICATION_SOURCE_SHA:sourceCommit};
   let inspecting=false;
   const inspector=setInterval(async()=>{
    if(inspecting)return;inspecting=true;
    const c=new Client({connectionString:u.href,connectionTimeoutMillis:2000,statement_timeout:2000});
    try{await c.connect();const rows=(await c.query(`SELECT pid,state,wait_event_type,wait_event,pg_blocking_pids(pid) blockers,
      extract(epoch FROM clock_timestamp()-query_start)::int age,query
      FROM pg_stat_activity WHERE datname=current_database() AND pid<>pg_backend_pid() AND state<>'idle'
      AND query_start<clock_timestamp()-interval '5 seconds' ORDER BY query_start LIMIT 8`)).rows;
     const sessions=rows.map(({query,...r})=>({...r,statement:String(query).replace(/'(?:[^']|'')*'/g,'?').slice(0,180)}));
     console.log(JSON.stringify({service:'sam-isolated-postgres-waits',sourceCommit,suite,sessions}));
    }catch{}finally{await c.end().catch(()=>{});inspecting=false;}
   },15000);
   const status=await new Promise(resolve=>{
    const child=spawn(process.execPath,['scripts/testing/core-reliability.cjs','--suite',suite],{env,detached:true,stdio:['ignore',output,output]});
    let timedOut=false,hardStop;
    const stop=signal=>{try{process.kill(-child.pid,signal);}catch{}};
    const timer=setTimeout(()=>{timedOut=true;stop('SIGTERM');hardStop=setTimeout(()=>stop('SIGKILL'),2000);},220000);
    child.on('error',()=>{clearTimeout(timer);resolve({exitCode:null,signal:null,reason:'SPAWN_FAILED'});});
    child.on('close',(exitCode,signal)=>{clearTimeout(timer);clearTimeout(hardStop);if(timedOut)stop('SIGKILL');resolve({exitCode,signal,reason:timedOut?'TIMEOUT':null});});
   });
   clearInterval(inspector);
   const text=fs.readFileSync(log,'utf8');
   const passed=status.exitCode===0&&text.includes('"failed":0');
   if(!passed){
    const diagnostic=text.replace(/postgres(?:ql)?:\/\/[^\s"']+/gi,'[database URL withheld]')
     .replaceAll(u.password,'[credential withheld]').replaceAll(decodeURIComponent(u.password),'[credential withheld]')
     .replace(/PASSWORD\s+'[^']*'/gi,'PASSWORD [withheld]')
     .replace(/-----BEGIN [^-]*PRIVATE KEY-----[\s\S]*?-----END [^-]*PRIVATE KEY-----/g,'[key withheld]')
     .split('\n').filter(line=>/Error|Assertion|code:|actual:|expected:|operator:|^FAIL|SHARED_|SOURCE_|^\s+at /.test(line)).join('\n').slice(-5000);
    console.log(JSON.stringify({service:'sam-isolated-verification-diagnostic',sourceCommit,suite,diagnostic}));
   }
   report.results.push({suite,status:passed?'PASS':'FAIL',...status,durationMs:Date.now()-started,privateLogRetained:true});
   console.log(JSON.stringify({service:'sam-isolated-verification-suite',sourceCommit,...report.results.at(-1),liveReasoningValidated:false,modelPaidCalls:0}));
   persist();
  }finally{fs.closeSync(output);}
 }
 await startApplication?.();
 try{report.api=typeof probe==='function'?await probe():{status:'NOT_RUN'};}catch{report.api={status:'FAIL',reason:'API_OR_DATABASE_ASSERTION_FAILED'};}
 console.log(JSON.stringify({service:'sam-isolated-api-smoke',sourceCommit,...report.api}));persist();
 const suitesPassed=report.results.every(r=>r.status==='PASS');
 report.status=suitesPassed?(report.api.status==='PASS'?'PASSED':report.api.status==='NOT_RUN'?'FIXTURE_SUITES_PASSED_API_PENDING':'FAILED'):'FAILED';report.completedAt=new Date().toISOString();persist();
 console.log(JSON.stringify({service:'sam-isolated-verification',sourceCommit,status:report.status,passed:report.results.filter(r=>r.status==='PASS').length,failed:report.results.filter(r=>r.status==='FAIL').length,liveReasoningValidated:false,modelPaidCalls:0}));
 return report;
}
module.exports={runVerification};
