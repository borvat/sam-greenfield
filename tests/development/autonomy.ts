import assert from "node:assert/strict";
import { createRequire } from "node:module";
const require=createRequire(import.meta.url);
const {setupAutonomy}=require("../../scripts/development/setup.cjs");
const {databaseClient,developmentEnvironment,assertDevelopmentIdentity}=require("../../scripts/development/environment.cjs");

async function main(){
  const config=await setupAutonomy(true);
  const admin=databaseClient(developmentEnvironment(config.schema));await admin.connect();
  let server:any;
  let pool:any;
  const proofs:string[]=[];
  try{
    await assertDevelopmentIdentity(admin);
    const env=developmentEnvironment(config.schema);
    const options=`${env.PGOPTIONS} -c role=${config.role} -c app.current_org_id=${config.orgId} -c app.current_legal_entity_id=${config.legalEntityId}`;
    const url=new URL(env.DATABASE_URL);url.searchParams.set("options",options);
    Object.assign(process.env,{DATABASE_URL:url.toString(),SAM_DEVELOPMENT_SAFE_MODE:"1",NODE_ENV:"development",
      SAM_AUTONOMY_SANDBOX:"1",SAM_AUTONOMY_TEST_SESSION:"1",SAM_DEV_LEGAL_ENTITY_ID:config.legalEntityId});
    ({pool}=await import("../../packages/db/src/client"));
    const {localCapabilityBundle}=await import("../../apps/development/src/localCapabilities");
    const {createProductionComposition}=await import("../../apps/production/src/composition");
    const {startCommandCenterHttpServer}=await import("../../apps/command-center/src/http");
    const {validateAutonomyCandidate,safeTree,authorizeSandboxGoal,sandboxPlanningInput}=await import("../../apps/development/src/autonomyBoundary");
    const {recoverKernelAfterRestart}=await import("../../apps/kernel/src/recovery");
    const {planNextNewGoal}=await import("../../apps/production/src/planner");
    const {learnNextVerifiedExecution}=await import("../../apps/production/src/learning");
    let calls=0;const prompts:any[]=[];
    // UNIT FIXTURE ONLY: never used by the ordinary workflow or LIVE acceptance.
    const fixture={providerId:"deepseek",async invoke(task:any){
      calls++;prompts.push(task.input);
      const learned=task.input.context.facts.length>0;
      return {model:"deepseek-flash",usage:{inputTokens:50,outputTokens:50},output:{
        assumptions:{},constraints:{},dependencies:{},steps:[{capabilityId:"local.calculate",
          params:learned?{operation:"mean",values:["knowledge:local_sum",10]}:{operation:"sum",values:[2,5,9]},priority:1}]}};
    }};
    const bundle=localCapabilityBundle(fixture);
    let worker=createProductionComposition({bundle,workerId:"unit-before-restart"});
    server=await startCommandCenterHttpServer({legalEntityId:config.legalEntityId,port:0,host:"127.0.0.1",bearerToken:"unit-only-not-live"});
    const base=`http://127.0.0.1:${server.server.address().port}`;
    const submit=async(objective:string)=>{
      const r=await fetch(base+"/api/goals",{method:"POST",headers:{authorization:"Bearer unit-only-not-live","content-type":"application/json"},
        body:JSON.stringify({objective})});
      const body=await r.json() as any;
      assert.equal(r.status,201,`UNIT_INTAKE: ${body.error??"unknown"}`);return body.data.id;
    };
    assert.equal((await fetch(base+"/api/goals")).status,401);proofs.push("authenticated normal intake");
    const first=await submit("Synthetic fixture: sum 2, 5 and 9");
    const {transitionGoalAtomic}=await import("../../apps/kernel/src/stateMachine");
    await transitionGoalAtomic(first,"NEW","MODELING","unit_restart_during_observation");
    await Promise.all([planNextNewGoal(bundle),planNextNewGoal(bundle)]);
    assert.equal(calls,1);proofs.push("concurrent planner fencing");
    await worker.runWorkTick();
    assert.equal((await admin.query("SELECT state FROM goals WHERE id=$1",[first])).rows[0].state,"VERIFYING");
    await admin.query("UPDATE local_artifacts SET result=jsonb_set(result,'{value}','-999') WHERE goal_id=$1",[first]);
    await worker.runWorkTick();
    assert.equal(calls,2);
    assert.equal((await admin.query("SELECT count(*)::int n FROM verifications WHERE result='FAILED'")).rows[0].n,1);
    assert.equal((await admin.query("SELECT count(*)::int n FROM world_facts")).rows[0].n,0);
    proofs.push("real SQL readback rejects corrupted local artifact; automatic bounded replan; no learning from failure");
    worker=createProductionComposition({bundle,workerId:"unit-after-restart"});await recoverKernelAfterRestart();
    await worker.runWorkTick();
    assert.equal((await admin.query("SELECT state FROM goals WHERE id=$1",[first])).rows[0].state,"COMPLETED");
    const second=await submit("Synthetic fixture: mean of the verified prior sum and 10");
    await worker.runWorkTick();await worker.runWorkTick();
    assert.equal(calls,3);assert.equal(prompts[2].context.facts[0].value,16);
    const results=await admin.query("SELECT e.result FROM executions e JOIN goals g ON g.id=e.goal_id WHERE g.id=$1",[second]);
    assert.equal(results.rows[0].result.value,13);
    assert.equal((await admin.query("SELECT state FROM goals WHERE id=$1",[second])).rows[0].state,"COMPLETED");
    assert.equal((await fetch(base+"/api/overview",{headers:{authorization:"Bearer unit-only-not-live"}})).status,200);
    assert.equal((await fetch(base+`/api/goals/${second}/timeline`,{headers:{authorization:"Bearer unit-only-not-live"}})).status,200);
    assert.equal((await learnNextVerifiedExecution(bundle)).processed,false);
    assert.equal((await admin.query("SELECT count(*)::int n FROM world_facts")).rows[0].n,2);
    proofs.push("restart continuation, independent verification, idempotent provenance learning, later goal resolves learned fact");
    const serialized=JSON.stringify(prompts);assert(!serialized.includes(first));assert(!serialized.includes(config.legalEntityId));assert(!serialized.includes("unit-only-not-live"));
    proofs.push("model projections omit live identifiers and authentication values");
    for(const bad of [{steps:[{capabilityId:"gmail.send",params:{}}]},
      {steps:[{capabilityId:"local.calculate",params:{operation:"sum",values:[1],email:"x"}}]},
      {steps:[{capabilityId:"local.calculate",params:{operation:"sum",values:[1]},operationKeyRef:"x"}]}])assert.throws(()=>validateAutonomyCandidate(bad));
    assert.throws(()=>safeTree({password:"do-not-disclose"}));assert.throws(()=>safeTree({x:"Bearer unit-only-not-live"}));
    assert.throws(()=>sandboxPlanningInput({objective:"safe objective",context:{entityId:config.legalEntityId,facts:[],memory:[],documents:[]}}));
    proofs.push("reject unauthorized tools, parameters, step fields, secret patterns, unapproved context");
    const foreign=(await admin.query("INSERT INTO organizations(name) VALUES('Foreign synthetic sentinel') RETURNING id")).rows[0].id;
    const other=(await admin.query("INSERT INTO legal_entities(org_id,name) VALUES($1,'Foreign synthetic entity') RETURNING id",[foreign])).rows[0].id;
    const hidden=(await admin.query(`INSERT INTO goals(business_id,company_scope,domain,objective,state,authority_ceiling)
      VALUES('UNIT-FOREIGN',$1,'development_probe','foreign synthetic only','NEW','GREEN') RETURNING id`,[other])).rows[0].id;
    assert.equal((await pool.query("SELECT id FROM goals WHERE id=$1",[hidden])).rowCount,0);
    await assert.rejects(async()=>{const c=await pool.connect();try{await authorizeSandboxGoal(c,hidden);}finally{c.release();}});
    await assert.rejects(()=>pool.query("UPDATE goals SET company_scope=$1 WHERE id=$2",[other,first]));
    for(const table of ["users","memory_records","side_effect_operations","financial_documents"])await assert.rejects(()=>pool.query(`SELECT * FROM ${table}`));
    await assert.rejects(()=>pool.query("UPDATE autonomy_session SET max_calls=100"));
    const role=(await pool.query("SELECT current_user u,(SELECT rolbypassrls OR rolsuper FROM pg_roles WHERE rolname=current_user) bypass")).rows[0];
    assert.equal(role.bypass,false);proofs.push("real non-bypass role, foreign tenant reads/writes denied, sensitive tables and consent mutation denied");
    await pool.query("INSERT INTO autonomy_model_claims(goal_id,input_hash) VALUES($1,'unit-reserve-last')",[second]);
    await assert.rejects(()=>pool.query("INSERT INTO autonomy_model_claims(goal_id,input_hash) VALUES($1,'unit-over-budget')",[second]));
    await assert.rejects(()=>pool.query("DELETE FROM autonomy_model_claims"));
    proofs.push("four-call persistent append-only budget cannot reset");
    console.log(JSON.stringify({status:"PASS",evidence:"UNIT_FIXTURES_NOT_LIVE",assertionGroups:proofs,modelFixtureCalls:calls,liveCalls:0}));
  }finally{
    if(server)await server.close();if(pool)await pool.end();
    await admin.query(`DROP SCHEMA ${config.schema} CASCADE; DROP ROLE ${config.role}`);await admin.end();
  }
}
main().catch(e=>{console.error("AUTONOMY UNIT FAIL",e.message);process.exitCode=1;});
