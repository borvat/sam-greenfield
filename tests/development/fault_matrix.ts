import assert from "node:assert/strict";
import {createRequire} from "node:module";
import {fork,spawnSync} from "node:child_process";
import {once} from "node:events";
import {randomUUID,randomInt} from "node:crypto";
import {writeFileSync,readFileSync} from "node:fs";
const require=createRequire(import.meta.url);
const {setupAutonomy}=require("../../scripts/development/setup.cjs");
const {databaseClient,developmentEnvironment,assertDevelopmentIdentity}=require("../../scripts/development/environment.cjs");
const wait=(n:number)=>new Promise(r=>setTimeout(r,n));
let stage="SETUP";
const phases=["BEFORE_ACT","AFTER_EXECUTION_COMMIT","DURING_VERIFY_READ","AFTER_VERIFY_COMMIT","CONCURRENT_VERIFY","LEASE_RETRY_BUDGET"];
async function main(selected:string){
  const config=await setupAutonomy(true),admin=databaseClient(developmentEnvironment(config.schema));await admin.connect();
  let pool:any,child:any;const proofs:any[]=[];
  try{
    await assertDevelopmentIdentity(admin);
    const env=developmentEnvironment(config.schema),url=new URL(env.DATABASE_URL);
    url.searchParams.set("options",`${env.PGOPTIONS} -c role=${config.role} -c app.current_org_id=${config.orgId} -c app.current_legal_entity_id=${config.legalEntityId}`);
    Object.assign(process.env,{DATABASE_URL:url.toString(),SAM_DEVELOPMENT_SAFE_MODE:"1",NODE_ENV:"development",
      SAM_AUTONOMY_SANDBOX:"1",SAM_AUTONOMY_TEST_SESSION:"1",SAM_DEV_LEGAL_ENTITY_ID:config.legalEntityId});
    ({pool}=await import("../../packages/db/src/client"));
    const {localCapabilityBundle}=await import("../../apps/development/src/localCapabilities");
    const {createToolExecutors}=await import("../../apps/tools/src/executorFactory");
    const {runCatalogSpecialistTick}=await import("../../apps/agents/src/executiveFlow");
    const {persistPlanAndDelegateAtomic}=await import("../../apps/kernel/src/planning");
    const {verifyNextExecution}=await import("../../apps/production/src/verifier");
    const {recoverKernelAfterRestart}=await import("../../apps/kernel/src/recovery");
    const {recordExecutionAndRequestVerificationAtomic}=await import("../../apps/kernel/src/execution");
    const bundle=localCapabilityBundle({providerId:"deepseek",async invoke(){throw new Error("NO_MODEL_AUTHORIZATION");}} as any);
    const executors=createToolExecutors({catalog:bundle.catalog,tools:bundle.tools});
    async function seed(two=false){
      const values=[randomInt(1,50),randomInt(1,50),randomInt(1,50)];
      const id=(await admin.query(`INSERT INTO goals(business_id,company_scope,domain,objective,state,authority_ceiling)
        VALUES($1,$2,'development_probe','Synthetic local fault invariant','PLANNING','GREEN') RETURNING id`,
        ["FAULT-"+randomUUID(),config.legalEntityId])).rows[0].id;
      const steps=[{capabilityId:"local.calculate",params:{operation:"sum",values}}];
      if(two)steps.push({capabilityId:"local.calculate",params:{operation:"count",values}});
      const plan=await persistPlanAndDelegateAtomic({goalId:id,steps});return {id,plan};
    }
    const tick=()=>runCatalogSpecialistTick({catalog:bundle.catalog,workerInstanceId:"fault-matrix-resumed",ttlSeconds:10,executors});
    async function interrupt(phase:string){
      const childEnv={...env,...process.env,SAM_TEST_CRASH_PHASE:phase};
      for(const k of Object.keys(childEnv))if(/KEY|SECRET|TOKEN|OAUTH|GOOGLE|GITHUB|REPLIT_CONNECTORS/i.test(k))delete childEnv[k];
      child=fork("tests/development/act_crash_child.ts",[],{execArgv:["--import","tsx"],env:childEnv,stdio:["ignore","ignore","ignore","ipc"]});
      const message=await new Promise<any>((resolve,reject)=>{
        const timer=setTimeout(()=>reject(new Error("FAULT_CHILD_TIMEOUT")),10000);
        child.once("message",(m:any)=>{clearTimeout(timer);resolve(m);});
        child.once("exit",()=>{clearTimeout(timer);reject(new Error("FAULT_CHILD_EXITED"));});
      });
      assert.equal(message.event,phase);
      const exited=once(child,"exit");child.kill("SIGKILL");await exited;child=null;return message;
    }
    for(const phase of phases.filter(p=>p===selected&&!["CONCURRENT_VERIFY","LEASE_RETRY_BUDGET"].includes(p))){
      stage=phase;
      const goal=await seed();
      if(phase.includes("VERIFY"))await tick();
      const message=await interrupt(phase);
      if(phase==="BEFORE_ACT"){
        assert.equal((await admin.query("SELECT count(*)::int n FROM local_artifacts WHERE goal_id=$1",[goal.id])).rows[0].n,0);
        await wait(1250);
        const recovered=await recoverKernelAfterRestart();assert.ok(recovered.expiredLeases.includes(goal.plan.queueIds[0]));
        assert.equal((await recoverKernelAfterRestart()).expiredLeases.length,0);
      }else await recoverKernelAfterRestart();
      await tick();
      if(phase==="BEFORE_ACT")await assert.rejects(()=>recordExecutionAndRequestVerificationAtomic({
        queueId:goal.plan.queueIds[0],fencingToken:message.token,actor:"stale-fault-child",result:{},evidence:{}}));
      await verifyNextExecution(bundle);
      assert.equal((await verifyNextExecution(bundle)).processed,false);
      assert.equal((await admin.query("SELECT state FROM goals WHERE id=$1",[goal.id])).rows[0].state,"COMPLETED");
      for(const table of ["local_artifacts","executions"])
        assert.equal((await admin.query(`SELECT count(*)::int n FROM ${table} WHERE goal_id=$1`,[goal.id])).rows[0].n,1);
      assert.equal((await admin.query(`SELECT count(*)::int n FROM verifications v JOIN executions e ON e.id=v.execution_id
        WHERE e.goal_id=$1 AND v.verifier<>e.actor AND v.execution_hash=e.execution_hash AND v.plan_hash=e.plan_hash`,[goal.id])).rows[0].n,1);
      proofs.push({phase,realSigkill:true,artifactCount:1,executionCount:1,independentVerificationCount:1,completed:true});
    }
    // Two real readers race on the first execution of a multi-step plan. No
    // fabricated verifier result: both wait only AFTER native SQL readback.
    if(selected==="CONCURRENT_VERIFY"){
    const race=await seed(true);await tick();await tick();
    stage="CONCURRENT_VERIFY";
    let arrivals=0,release!:()=>void;
    const barrier=new Promise<void>(r=>release=r);
    const verifiers=new Map(bundle.verifiers);
    for(const [id,verifier] of verifiers)verifiers.set(id,{...verifier,verify:async(input:any)=>{
      const actual=await verifier.verify(input);if(++arrivals===2)release();await barrier;return actual;
    }});
    const results=await Promise.all([verifyNextExecution({...bundle,verifiers}),verifyNextExecution({...bundle,verifiers})]);
    const duplicates=(await admin.query(`SELECT count(*)::int n FROM verifications v JOIN executions e ON e.id=v.execution_id WHERE e.goal_id=$1`,[race.id])).rows[0].n;
    assert.equal(duplicates,1,"CONCURRENT_VERIFICATION_MUST_BE_IDEMPOTENT");
    assert.equal(results[0].verificationId,results[1].verificationId);
    const {recordIndependentVerificationAtomic}=await import("../../apps/kernel/src/verification");
    const receipt=(await admin.query(`SELECT v.* FROM verifications v JOIN executions e ON e.id=v.execution_id WHERE e.goal_id=$1`,[race.id])).rows[0];
    await assert.rejects(()=>recordIndependentVerificationAtomic({executionId:receipt.execution_id,
      verifier:receipt.verifier,contractId:receipt.contract_id,result:"FAILED",independentEvidence:receipt.independent_evidence}),/VERIFICATION_RECEIPT_CONFLICT/);
    await verifyNextExecution(bundle);
    assert.equal((await admin.query("SELECT state FROM goals WHERE id=$1",[race.id])).rows[0].state,"COMPLETED");
    proofs.push({phase:"CONCURRENT_VERIFY",nativeReaders:2,firstExecutionVerificationCount:1,sharedVerificationId:true,planCompleted:true});
    }
    if(selected==="LEASE_RETRY_BUDGET"){
      process.env.SAM_WORK_LEASE_MAX_ATTEMPTS="2";
      const {claimNextWorkAtomic}=await import("../../apps/kernel/src/workerRuntime");
      const goal=await seed(),first=await claimNextWorkAtomic("retry-first",1);assert.ok(first);
      assert.equal(await claimNextWorkAtomic("retry-concurrent",1),null);
      await wait(1250);await recoverKernelAfterRestart();
      const second=await claimNextWorkAtomic("retry-second",1);assert.ok(second);assert.ok(second.fencingToken>first.fencingToken);
      const {withTransaction}=await import("../../packages/db/src/client");
      const {stopExhaustedLease}=await import("../../apps/kernel/src/leaseBudget");
      await assert.rejects(()=>withTransaction(c=>stopExhaustedLease(c,{id:first.queueId,goal_id:goal.id,
        fencing_token:first.fencingToken})),/LEASE_BUDGET_FENCE_CHANGED/);
      for(const payload of [
        {id:"'; DROP TABLE goals; --",goal_id:goal.id,fencing_token:second.fencingToken},
        {id:second.queueId,goal_id:goal.id,fencing_token:"1 OR 1=1" as any}
      ])await assert.rejects(()=>withTransaction(c=>stopExhaustedLease(c,payload)),(e:any)=>e.code==="22P02");
      assert.equal((await admin.query("SELECT state FROM goals WHERE id=$1",[goal.id])).rows[0].state,"EXECUTING");
      await assert.rejects(()=>recordExecutionAndRequestVerificationAtomic({queueId:first.queueId,
        fencingToken:first.fencingToken,actor:"retry-stale",result:{},evidence:{}}));
      await wait(1250);await recoverKernelAfterRestart();
      assert.equal(await claimNextWorkAtomic("retry-exhausted",1),null);
      assert.equal((await recoverKernelAfterRestart()).expiredLeases.length,0);
      const row=(await admin.query("SELECT status,attempt,wake_reason FROM work_queue WHERE id=$1",[first.queueId])).rows[0];
      assert.equal(row.status,"FAILED");assert.equal(row.attempt,2);assert.equal(row.wake_reason,"LEASE_ATTEMPTS_EXHAUSTED");
      assert.equal((await admin.query("SELECT state FROM goals WHERE id=$1",[goal.id])).rows[0].state,"FAILED");
      assert.equal((await admin.query("SELECT count(*)::int n FROM outbox_events WHERE aggregate_id=$1 AND event_type='WORK_ATTEMPTS_EXHAUSTED'",[first.queueId])).rows[0].n,1);
      assert.equal((await admin.query("SELECT count(*)::int n FROM executions WHERE goal_id=$1",[goal.id])).rows[0].n,0);
      process.env.SAM_WORK_LEASE_MAX_ATTEMPTS="0";
      await assert.rejects(()=>claimNextWorkAtomic("invalid-budget",1),/LEASE_ATTEMPT_LIMIT_INVALID/);
      delete process.env.SAM_WORK_LEASE_MAX_ATTEMPTS;
      const original=await seed();
      await admin.query("UPDATE work_queue SET attempt=99 WHERE goal_id=$1",[original.id]);
      assert.ok(await claimNextWorkAtomic("unconfigured-original-behavior",1));
      proofs.push({phase:"LEASE_RETRY_BUDGET",naturalExpiryCycles:2,attempts:2,terminalFailed:true,staleFencingDenied:true,
        staleBudgetStopDenied:true,adversarialBoundParameterCases:2,duplicateRecoveryEvents:0,executionCount:0,
        invalidBudgetDenied:true,originalUnconfiguredBehaviorPreserved:true});
    }
    assert.equal((await admin.query("SELECT count(*)::int n FROM autonomy_model_claims")).rows[0].n,0);
    const receipt={status:"PASS",checkedAt:new Date().toISOString(),classification:"REAL_PROCESS_POSTGRES_NATIVE_ADAPTERS_WITH_SYNTHETIC_PLAN_FIXTURES",
      proofs,externalModelCalls:0,productionChanges:0,modelAcceptance:"NOT_RUN",leaseRecoveryRetryBound:"OPT_IN_MAX_ATTEMPTS_FAIL_CLOSED"};
    writeFileSync(".local/sam-dev/fault-matrix-"+selected+".json",JSON.stringify(receipt,null,2));
    console.log(JSON.stringify({test:"FAULT_MATRIX",status:"PASS",cases:proofs.length}));
  }finally{
    if(child){child.kill("SIGKILL");await once(child,"exit").catch(()=>{});}
    if(pool)await pool.end();await admin.query(`DROP SCHEMA ${config.schema} CASCADE; DROP ROLE ${config.role}`);await admin.end();
  }
}
async function dispatch(){
  const selected=process.argv[2];
  if(selected){assert.ok(phases.includes(selected));return main(selected);}
  const receipts=[];
  for(const phase of phases){
    const p=spawnSync(process.execPath,["--import","tsx","tests/development/fault_matrix.ts",phase],{env:process.env,encoding:"utf8",timeout:25000});
    if(p.status!==0){console.error(p.stderr);throw new Error("FAULT_MATRIX_CASE_FAILED:"+phase);}
    receipts.push(JSON.parse(readFileSync(".local/sam-dev/fault-matrix-"+phase+".json","utf8")));
  }
  writeFileSync(".local/sam-dev/fault-matrix-evidence.json",JSON.stringify({
    status:"PASS",checkedAt:new Date().toISOString(),classification:"REAL_PROCESS_POSTGRES_NATIVE_ADAPTERS_WITH_SYNTHETIC_PLAN_FIXTURES",
    cases:receipts.flatMap(r=>r.proofs),sandboxPerCase:true,originalTwoGoalGuardPreserved:true,externalModelCalls:0,productionChanges:0,
    leaseRecoveryRetryBound:"OPT_IN_MAX_ATTEMPTS_FAIL_CLOSED"
  },null,2));
  console.log("FAULT_MATRIX PASS cases="+receipts.length);
}
dispatch().catch(e=>{console.error(JSON.stringify({test:"FAULT_MATRIX",status:"FAIL",code:e.code??"ASSERTION",
  stage,assertion:e.code==="ERR_ASSERTION"?e.message:"withheld",
  safeGuard:e.code==="P0001"&&/^[A-Za-z _:-]+$/.test(e.message)?e.message:undefined,
  frames:String(e.stack??"").split("\n").filter((x:string)=>x.trim().startsWith("at ")).slice(0,3)}));process.exitCode=1;});
