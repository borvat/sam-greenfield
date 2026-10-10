// One real-DEVELOPMENT-PG acceptance case; only the model is a local HTTP mock.
// This is not the production launcher or live-provider acceptance.
import assert from "node:assert/strict";
import {createRequire} from "node:module";
import {randomBytes,randomUUID} from "node:crypto";
import {spawn} from "node:child_process";
import {createServer} from "node:http";
import {writeFileSync} from "node:fs";
import {Client} from "pg";
const require=createRequire(import.meta.url);
const dev=require("../../scripts/development/environment.cjs");
const wait=(ms:number)=>new Promise(resolve=>setTimeout(resolve,ms));
let stage="development_identity";
const output=".local/sam-dev/synthetic-pilot-postgres-acceptance.json";

async function child(){
  const allowedPort=process.env.SAM_TEST_MODEL_PORT!;
  const originalFetch=globalThis.fetch;
  globalThis.fetch=(async(input:any,init:any)=>{
    const u=new URL(typeof input==="string"?input:input.url??input.toString());
    if(u.hostname!=="127.0.0.1")throw new Error("TEST_OUTBOUND_DENIED");
    return originalFetch(input,init);
  }) as typeof fetch;
  const {pool}=await import("../../packages/db/src/client");
  const {assertReleaseDatabaseSafety}=await import("../../packages/db/src/releaseSafety");
  const {assertPilotLedgerPrivileges}=await import("../../apps/production/src/syntheticPilotScope");
  const {fetchJson}=await import("../../packages/model-providers/src/common");
  const {createSyntheticPilotBundle}=await import("../../apps/production/src/syntheticPilotBundleModule");
  const {validateProductionBundle}=await import("../../apps/production/src/bundle");
  const bundle=validateProductionBundle(createSyntheticPilotBundle(async(_url,init,timeout)=>
    fetchJson(`http://127.0.0.1:${allowedPort}/mock`,init,timeout)));
  await assertReleaseDatabaseSafety(pool);
  await assertPilotLedgerPrivileges(pool);
  const mode=process.argv[3];
  try{
    if(mode==="plan"){
      const {startCommandCenterHttpServer}=await import("../../apps/command-center/src/http");
      const intake=await startCommandCenterHttpServer({
        legalEntityId:process.env.SAM_COMMAND_CENTER_LEGAL_ENTITY_ID!,
        port:0,host:"127.0.0.1",bearerToken:"synthetic-acceptance-owner-not-real"});
      try{
        const port=(intake.server.address() as any).port;
        const base=`http://127.0.0.1:${port}`;
        assert.equal((await fetch(base+"/api/goals")).status,401);
        const response=await fetch(base+"/api/goals",{method:"POST",headers:{
          authorization:"Bearer synthetic-acceptance-owner-not-real","content-type":"application/json"},
          body:JSON.stringify({objective:JSON.stringify({synthetic:true,operation:"sum",values:[7,-4,19]}),
            domain:"release_synthetic",authority_ceiling:"GREEN",acceptance_contract:{
              version:1,constraints:[{capabilityId:"local.calculate",params:{operation:"sum"},
                result:{field:"value",equals:22}}]}})});
        const body=await response.json() as any;
        if(response.status!==201){
          const safe=/business_id_sequences/.test(body.error??"")?"INTAKE_BUSINESS_ID_RLS":
            /row-level security/.test(body.error??"")?"INTAKE_RLS":"INTAKE_REJECTED";
          throw new Error(safe);
        }
        const goalId=body.data.id;
        const {planNextNewGoal}=await import("../../apps/production/src/planner");
        const planned=await planNextNewGoal(bundle);
        assert.equal(planned.goalId,goalId);
        assert.equal((await pool.query("SELECT state FROM goals WHERE id=$1",[goalId])).rows[0].state,"EXECUTING");
        console.log(JSON.stringify({phase:"PLAN_COMMITTED",goalId}));
      }finally{await intake.close();}
      // Parent SIGKILLs this real process after the durable plan checkpoint.
      await new Promise(()=>{});
    }else if(mode==="act"){
      const {createProductionComposition}=await import("../../apps/production/src/composition");
      const worker=createProductionComposition({bundle,workerId:"synthetic-pg-restarted-worker"});
      const id=process.env.SAM_TEST_GOAL_ID!;
      for(let n=0;n<5;n++){
        await worker.runWorkTick();
        if((await pool.query("SELECT state FROM goals WHERE id=$1",[id])).rows[0].state==="COMPLETED")break;
      }
      assert.equal((await pool.query("SELECT state FROM goals WHERE id=$1",[id])).rows[0].state,"COMPLETED");
      const before=(await pool.query("SELECT count(*)::int n FROM executions WHERE goal_id=$1",[id])).rows[0].n;
      await worker.runWorkTick();
      assert.equal((await pool.query("SELECT count(*)::int n FROM executions WHERE goal_id=$1",[id])).rows[0].n,before);
      let negative=0;
      const client=await pool.connect();
      try{
        for(const [org,entity] of [["",""],[process.env.SAM_RELEASE_ORG_ID,""],
          [process.env.SAM_TEST_OTHER_ORG,process.env.SAM_TEST_OTHER_ENTITY],
          [process.env.SAM_RELEASE_ORG_ID,process.env.SAM_TEST_SIBLING_ENTITY]]){
          await client.query("BEGIN");
          try{
            await client.query("SELECT set_config('app.current_org_id',$1,true),set_config('app.current_legal_entity_id',$2,true)",[org,entity]);
            for(const table of ["goals","plans","work_queue","executions","verifications","audit_log"])
              assert.equal((await client.query(`SELECT count(*)::int n FROM ${table}`)).rows[0].n,0);
            negative++;
          }finally{await client.query("ROLLBACK");}
        }
      }finally{client.release();}
      for(const sql of ["DELETE FROM model_calls","UPDATE model_calls SET cost=0",
        "UPDATE model_calls SET task='reset'","TRUNCATE model_calls","CREATE TABLE forbidden_test(id int)"]){
        await assert.rejects(()=>pool.query(sql),(error:any)=>error.code==="42501");negative++;
      }
      // Reserve a second attempt with an unknown outcome, without any HTTP call.
      const failed=createSyntheticPilotBundle(async()=>{throw new Error("SYNTHETIC_TRANSPORT_INTERRUPTED");});
      const {proposePlan}=await import("../../apps/brain/src/planner");
      await assert.rejects(()=>proposePlan({gateway:failed.plannerGateway!(),goalId:id,
        objective:JSON.stringify({synthetic:true,operation:"sum",values:[7,-4,19]}),
        context:{entityType:"legal_entity",entityId:process.env.SAM_COMMAND_CENTER_LEGAL_ENTITY_ID,facts:[],memory:[]},
        dataClassification:"PUBLIC",maxCostUsd:0.25}),/PILOT_MODEL_ATTEMPT_REJECTED/);
      console.log(JSON.stringify({phase:"COMPLETED",negativeCases:negative}));
    }else if(mode==="budget"){
      const {proposePlan}=await import("../../apps/brain/src/planner");
      await assert.rejects(()=>proposePlan({gateway:bundle.raw.plannerGateway!(),
        goalId:process.env.SAM_TEST_GOAL_ID!,objective:JSON.stringify({synthetic:true,operation:"sum",values:[7,-4,19]}),
        context:{entityType:"legal_entity",entityId:process.env.SAM_COMMAND_CENTER_LEGAL_ENTITY_ID,facts:[],memory:[]},
        dataClassification:"PUBLIC",maxCostUsd:0.25}),/PILOT_RUN_BUDGET_EXHAUSTED/);
      console.log(JSON.stringify({phase:"BUDGET_RESTART_REFUSED"}));
    }else throw new Error("TEST_MODE_INVALID");
  }finally{await pool.end();}
}

async function parent(){
  const base=dev.developmentEnvironment();
  const raw=new URL(base.DATABASE_URL);
  if(raw.hostname!=="helium"||raw.pathname!=="/heliumdb"||
    ["host","hostaddr","user","password","dbname","database","ssl","port"].some(k=>raw.searchParams.has(k)))
    throw new Error("DEVELOPMENT_DESTINATION_NOT_APPROVED");
  const admin=dev.databaseClient(base);await admin.connect();
  const suffix=Date.now().toString()+randomBytes(2).readUInt16BE().toString();
  const schema=`sam_replit_test_${suffix}`,role=`sam_pilot_test_${suffix}`;
  assert.match(schema,/^sam_replit_test_[0-9]+$/);assert.match(role,/^sam_pilot_test_[0-9]+$/);
  const marker=`SAM synthetic acceptance ${randomUUID()}`;
  const org=randomUUID(),entity=randomUUID(),otherOrg=randomUUID(),otherEntity=randomUUID(),sibling=randomUUID(),run=randomUUID();
  let schemaCreated=false,roleCreated=false,modelCalls=0,processKilled=false;
  let modelServer:ReturnType<typeof createServer>|undefined;
  const active=new Set<ReturnType<typeof spawn>>();
  const report:any={classification:"REAL_DEVELOPMENT_POSTGRES_LOCAL_MOCK_MODEL_NOT_NEON_NOT_PUBLISHED",
    status:"BLOCKED",sourceSha:require("node:child_process").execFileSync("git",["rev-parse","HEAD"],{encoding:"utf8"}).trim(),
    realProviderCalls:0,paidModelCostUsd:0,productionEnvelopeTls:"BLOCKED_NOT_VERIFY_FULL",
    gates:{},cleanup:{schema:false,role:false}};
  const launch=(env:Record<string,string>,mode:string)=>{
    const p=spawn(process.execPath,["--import","tsx","tests/release/synthetic_pilot_postgres.ts","--child",mode],{
      env,cwd:dev.root,stdio:["ignore","pipe","pipe"]});
    active.add(p);p.once("exit",()=>active.delete(p));
    return p;
  };
  const waitChild=async(p:ReturnType<typeof spawn>)=>{
    let text="";p.stdout!.on("data",part=>text+=part.toString());
    const code=await new Promise<number|null>((resolve,reject)=>{
      const timer=setTimeout(()=>{p.kill("SIGKILL");reject(new Error("TEST_CHILD_TIMEOUT"));},30000);
      p.once("exit",code=>{clearTimeout(timer);resolve(code);});
    });
    if(code!==0)throw new Error("TEST_CHILD_FAILED");
    return text;
  };
  try{
    await dev.assertDevelopmentIdentity(admin);
    const original=(await admin.query(`SELECT
      to_regnamespace('sam_replit_autonomy')::oid::text AS schema_oid,
      (SELECT oid::text FROM pg_roles WHERE rolname='sam_autonomy_app') AS role_oid`)).rows[0];
    assert((await admin.query("SELECT EXISTS(SELECT 1 FROM pg_extension WHERE extname='pgcrypto') ok")).rows[0].ok,
      "TEST_REQUIRES_PREEXISTING_PGCRYPTO");
    stage="test_schema_migrations";
    await admin.query(`CREATE SCHEMA ${schema}`);schemaCreated=true;
    await admin.query(`COMMENT ON SCHEMA ${schema} IS '${marker}'`);
    const migrationEnv=dev.developmentEnvironment(schema);
    const {spawnSync}=require("node:child_process");
    const migrated=spawnSync(process.execPath,["packages/db/src/migrate.js","--apply"],{
      cwd:dev.root,env:migrationEnv,encoding:"utf8",timeout:30000});
    if(migrated.status!==0)throw new Error("TEST_MIGRATION_FAILED");
    await admin.query(`SET search_path=${schema},pg_catalog`);
    const password=randomBytes(24).toString("base64url");
    await admin.query(`CREATE ROLE ${role} LOGIN PASSWORD '${password}' NOINHERIT NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS`);
    roleCreated=true;
    await admin.query(`GRANT USAGE ON SCHEMA ${schema} TO ${role}; GRANT USAGE,SELECT ON ALL SEQUENCES IN SCHEMA ${schema} TO ${role}`);
    await admin.query("INSERT INTO organizations(id,name) VALUES($1,'Synthetic acceptance own'),($2,'Synthetic acceptance other')",[org,otherOrg]);
    await admin.query(`INSERT INTO legal_entities(id,org_id,name) VALUES($1,$2,'Synthetic own'),($3,$4,'Synthetic foreign'),($5,$2,'Synthetic sibling')`,
      [entity,org,otherEntity,otherOrg,sibling]);
    const ownContext=`current_setting('app.current_org_id',true)='${org}' AND current_setting('app.current_legal_entity_id',true)='${entity}'`;
    const policies:Record<string,string>={
      organizations:`id='${org}'`,legal_entities:`id='${entity}' AND org_id='${org}'`,
      goals:`company_scope='${entity}' AND domain='release_synthetic' AND authority_ceiling='GREEN'`,
      plans:"EXISTS(SELECT 1 FROM goals g WHERE g.id=goal_id)",
      work_queue:"EXISTS(SELECT 1 FROM goals g WHERE g.id=goal_id)",
      executions:"EXISTS(SELECT 1 FROM goals g WHERE g.id=goal_id)",
      verifications:"EXISTS(SELECT 1 FROM executions e WHERE e.id=execution_id)",
      audit_log:"EXISTS(SELECT 1 FROM goals g WHERE g.id=goal_id)",
      world_facts:`entity_id='${entity}' AND domain='release_synthetic'`,
      business_id_sequences:`entity_type='goal' AND org_scope_id='${org}'`,
      model_providers:"provider_id='deepseek'",
      model_calls:`provider='deepseek' AND task='release_synthetic:${run}' AND data_classification='PUBLIC'`,
      verification_contracts:"capability_id IN ('local.calculate','local.statistics')",
      outbox_events:`(aggregate_type='goal' AND EXISTS(SELECT 1 FROM goals g WHERE g.id=aggregate_id))
        OR (aggregate_type='work_queue' AND EXISTS(SELECT 1 FROM work_queue w WHERE w.id=aggregate_id))
        OR (aggregate_type='execution' AND EXISTS(SELECT 1 FROM executions e WHERE e.id=aggregate_id))
        OR (aggregate_type='verification' AND EXISTS(SELECT 1 FROM verifications v WHERE v.id=aggregate_id))`
    };
    const readonly=new Set(["organizations","legal_entities","world_facts","model_providers","verification_contracts"]);
    const append=new Set(["audit_log","verifications","model_calls"]);
    for(const [table,expression] of Object.entries(policies)){
      stage=`test_policy_${table}`;
      assert.match(table,/^[a-z_]+$/);
      await admin.query(`ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY`);
      const predicate=`(${ownContext}) AND (${expression})`;
      // A permissive grant policy plus a restrictive principal policy; originals remain.
      await admin.query(`CREATE POLICY test_access ON ${table} TO ${role} USING(${predicate}) WITH CHECK(${predicate});
        CREATE POLICY test_principal ON ${table} AS RESTRICTIVE TO ${role} USING(${predicate}) WITH CHECK(${predicate})`);
      await admin.query(`GRANT ${readonly.has(table)?"SELECT":append.has(table)?"SELECT,INSERT":"SELECT,INSERT,UPDATE"} ON ${table} TO ${role}`);
    }
    await admin.query(`GRANT UPDATE(tokens,success,verification_result) ON model_calls TO ${role}`);
    await admin.query(`INSERT INTO model_providers(provider_id,models,capabilities,privacy_class_allowed,health,cost_per_1k_input,cost_per_1k_output)
      VALUES('deepseek','["deepseek-flash"]','["planning"]','["PUBLIC"]','HEALTHY',0.001,0.002)`);
    for(const capability of ["local.calculate","local.statistics"])
      await admin.query(`INSERT INTO verification_contracts(capability_id,description,verification_method,required_evidence_fields,independent_query_template,must_not_trust_execution_result)
        VALUES($1,'Synthetic independent SQL aggregate','db_query','{"resultHash":"string","sqlReadback":"boolean"}','{"local":true,"independent":true}',true)`,[capability]);
    for(const foreign of [otherEntity,sibling])
      await admin.query(`INSERT INTO goals(business_id,company_scope,objective,domain,authority_ceiling)
        VALUES($1,$2,$3,'release_synthetic','GREEN')`,[`synthetic-foreign-${foreign}`,foreign,
        JSON.stringify({synthetic:true,operation:"sum",values:[99]})]);
    assert.equal((await admin.query(`SELECT count(*)::int n FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
      WHERE n.nspname<>$1 AND n.nspname NOT LIKE 'pg_%' AND n.nspname<>'information_schema' AND c.relkind IN('r','p')
      AND has_table_privilege($2,c.oid,'SELECT,INSERT,UPDATE,DELETE')`,[schema,role])).rows[0].n,0);
    modelServer=createServer(async(req,res)=>{
      try{
        let text="";for await(const part of req)text+=part;
        modelCalls++;assert(modelCalls<=2);
        const body=JSON.parse(text);
        assert.equal(body.model,"deepseek-flash");assert.equal(body.max_tokens,512);assert.equal(body.thinking.type,"disabled");
        assert(!text.includes(org)&&!text.includes(entity));
        const objective=JSON.parse(body.messages[0].content).input.objective;
        assert.equal(objective.synthetic,true);
        res.setHeader("content-type","application/json");
        res.end(JSON.stringify({model:"deepseek-flash",usage:{prompt_tokens:100,completion_tokens:70},
          choices:[{message:{content:JSON.stringify({assumptions:{},constraints:{},dependencies:{},
            steps:[{capabilityId:"local.calculate",params:{operation:objective.operation,values:objective.values},priority:1}]})}}]}));
      }catch{res.writeHead(400);res.end('{"error":"MOCK_REFUSED"}');}
    });
    await new Promise<void>(resolve=>modelServer!.listen(0,"127.0.0.1",resolve));
    const appUrl=new URL(base.DATABASE_URL);appUrl.username=role;appUrl.password=password;
    appUrl.searchParams.set("options",`-c search_path=${schema},pg_catalog -c app.current_org_id=${org} -c app.current_legal_entity_id=${entity}`);
    const childEnv:Record<string,string>={};
    for(const key of ["PATH","HOME","TMPDIR","LANG"])if(process.env[key])childEnv[key]=process.env[key]!;
    Object.assign(childEnv,{DATABASE_URL:appUrl.toString(),NODE_ENV:"production",
      SAM_RELEASE_APPROVED:"1",SAM_DATABASE_TARGET:"production",SAM_REQUIRE_GOAL_ACCEPTANCE:"1",
      SAM_RELEASE_SYNTHETIC_PLANNER:"1",SAM_RELEASE_SYNTHETIC_PLANNER_APPROVED:"1",
      SAM_PRODUCTION_BUNDLE_MODULE:"apps/production/src/syntheticPilotBundleModule.ts",
      SAM_RELEASE_CAPABILITIES:"local.calculate,local.statistics",DEEPSEEK_API_KEY:"synthetic-mock-not-a-provider-key",
      SAM_PILOT_RUN_ID:run,SAM_PILOT_EXPIRES_AT:new Date(Date.now()+600000).toISOString(),
      SAM_PILOT_PRICE_REVIEWED_AT:new Date().toISOString(),SAM_PILOT_INPUT_USD_PER_1K:"0.001",SAM_PILOT_OUTPUT_USD_PER_1K:"0.002",
      SAM_PILOT_MAX_REQUESTS:"2",SAM_PILOT_MAX_COST_USD:"0.25",
      SAM_RELEASE_ORG_ID:org,SAM_COMMAND_CENTER_LEGAL_ENTITY_ID:entity,
      SAM_COMMAND_CENTER_ALLOWED_HOSTS:"127.0.0.1",SAM_TEST_OTHER_ORG:otherOrg,
      SAM_TEST_OTHER_ENTITY:otherEntity,SAM_TEST_SIBLING_ENTITY:sibling,
      SAM_TEST_MODEL_PORT:String((modelServer.address() as any).port)});
    stage="authenticated_intake_and_persisted_planning";
    const first=launch(childEnv,"plan");
    let text="",diagnostic="";
    first.stdout!.on("data",part=>text+=part.toString());
    first.stderr!.on("data",part=>diagnostic+=part.toString());
    for(let n=0;n<300&&!text.includes("PLAN_COMMITTED")&&first.exitCode===null;n++)await wait(50);
    if(!text.includes("PLAN_COMMITTED")){
      if(diagnostic.includes("INTAKE_BUSINESS_ID_RLS"))throw new Error("INTAKE_BUSINESS_ID_RLS");
      throw new Error("TEST_PLANNING_BLOCKED");
    }
    const goalId=JSON.parse(text.trim().split("\n").find(line=>line.includes("PLAN_COMMITTED"))!).goalId;
    const exited=new Promise(resolve=>first.once("exit",resolve));first.kill("SIGKILL");await exited;processKilled=true;
    report.gates.authenticatedIntake="PASS";report.gates.persistedPlan="PASS";report.gates.killAfterPlanCommit="PASS";
    stage="worker_restart_act_verify";
    childEnv.SAM_TEST_GOAL_ID=goalId;
    const completed=await waitChild(launch(childEnv,"act"));
    assert(completed.includes("COMPLETED"));
    report.negativeCases=JSON.parse(completed.trim().split("\n").find(line=>line.includes("COMPLETED"))!).negativeCases;
    stage="persistent_budget_restart";
    assert((await waitChild(launch(childEnv,"budget"))).includes("BUDGET_RESTART_REFUSED"));
    const counts=(await admin.query(`SELECT
      (SELECT state FROM goals WHERE id=$1) AS goal_state,
      (SELECT count(*)::int FROM plans WHERE goal_id=$1) AS plans,
      (SELECT count(*)::int FROM work_queue WHERE goal_id=$1) AS delegated,
      (SELECT count(*)::int FROM executions WHERE goal_id=$1) AS executions,
      (SELECT count(*)::int FROM verifications v JOIN executions e ON e.id=v.execution_id WHERE e.goal_id=$1) AS verifications,
      (SELECT count(*)::int FROM audit_log WHERE goal_id=$1) AS audits,
      (SELECT count(*)::int FROM verifications v JOIN executions e ON e.id=v.execution_id WHERE e.goal_id=$1) AS verification_receipts,
      (SELECT count(*)::int FROM model_calls) AS model_reservations,
      (SELECT count(*)::int FROM model_calls WHERE success) AS validated_model_proposals,
      (SELECT count(*)::int FROM verifications v JOIN executions e ON e.id=v.execution_id
       WHERE e.goal_id=$1 AND v.verifier<>e.actor AND v.plan_hash=e.plan_hash AND v.execution_hash=e.execution_hash AND v.result='VERIFIED') AS independent_hash_bound_verifications`,
      [goalId])).rows[0];
    assert.equal(counts.goal_state,"COMPLETED");assert.equal(counts.plans,1);assert.equal(counts.executions,1);
    assert.equal(counts.verifications,1);assert.equal(counts.independent_hash_bound_verifications,1);
    assert(counts.audits>0&&counts.verification_receipts>0);
    assert.equal(counts.model_reservations,2);assert.equal(counts.validated_model_proposals,1);assert.equal(modelCalls,1);
    report.counts=counts;report.mockHttpCalls=modelCalls;report.processKilled=processKilled;
    report.gates.realRestrictedLogin="PASS";report.gates.realRlsNegativeChecks="PASS";
    report.gates.workerExecution="PASS";report.gates.independentPgVerification="PASS";
    report.gates.completedGoalAndAudit="PASS";report.gates.idempotencyAfterRestart="PASS";
    report.gates.persistentModelBudget="PASS";
    const preserved=(await admin.query(`SELECT to_regnamespace('sam_replit_autonomy')::oid::text AS schema_oid,
      (SELECT oid::text FROM pg_roles WHERE rolname='sam_autonomy_app') AS role_oid`)).rows[0];
    assert.deepEqual(preserved,original);report.existingAutonomyObjectsUnchanged=true;
    report.status="PASS_KERNEL_ACCEPTANCE_PRODUCTION_LAUNCHER_BLOCKED";
  }catch(error:any){
    report.blockedStage=stage;
    report.reason=/^[A-Z_]+$/.test(error?.message??"")?error.message:
      /^[0-9A-Z]{5}$/.test(error?.code??"")?error.code:"ASSERTION_OR_DATABASE_GATE";
    process.exitCode=1;
  }finally{
    for(const p of active)p.kill("SIGKILL");
    if(active.size)await wait(150);
    modelServer?.closeAllConnections();
    if(modelServer)await new Promise<void>(resolve=>modelServer!.close(()=>resolve()));
    report.capturedAt=new Date().toISOString();
    writeFileSync(output,JSON.stringify(report,null,2));
    try{
      if(schemaCreated){
        const ownership=(await admin.query("SELECT obj_description(oid,'pg_namespace') marker FROM pg_namespace WHERE nspname=$1",[schema])).rows[0];
        assert.equal(ownership?.marker,marker);
        await admin.query(`SET search_path=pg_catalog; DROP SCHEMA ${schema} CASCADE`);
        report.cleanup.schema=true;
      }
      if(roleCreated){await admin.query(`DROP ROLE ${role}`);report.cleanup.role=true;}
    }catch{report.cleanup.failure="TEST_CLEANUP_BLOCKED";process.exitCode=1;}
    await admin.end();
    writeFileSync(output,JSON.stringify(report,null,2));
    console.log(JSON.stringify(report));
  }
}
if(process.argv[2]==="--child"){
  child().catch((error:any)=>{
    console.error(/^[A-Z_]+$/.test(error?.message??"")?error.message:
      /^[0-9A-Z]{5}$/.test(error?.code??"")?error.code:"TEST_CHILD_GATE_BLOCKED");
    process.exitCode=1;
  });
}else parent().catch(()=>{console.error("TEST_DEVELOPMENT_IDENTITY_BLOCKED");process.exitCode=1;});
