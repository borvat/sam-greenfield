"use strict";
// Explicit maintenance operation only. Never imported by SAM startup or build.
const fs=require("node:fs"),path=require("node:path"),crypto=require("node:crypto");
const {tenant,limits}=require("./config.cjs");
const identifier=x=>'"'+x.replace(/"/g,'""')+'"';
const literal=x=>"'"+String(x).replace(/'/g,"''")+"'";
const tableNames=["organizations","legal_entities","users","business_id_sequences","audit_log",
  "event_fabric_events","inbox_events","outbox_events","side_effect_operations","work_queue","world_facts",
  "memory_records","policy_envelopes","approvals","verification_contracts","executions","verifications",
  "goals","plans","financial_documents","model_providers","model_calls"];
function fail(code){throw new Error(code);}
function manifest(env){
  const t=tenant(env),budget=limits(env);
  const capabilities=(env.SAM_RELEASE_CAPABILITIES??"").split(",").map(x=>x.trim()).sort();
  const supported=["local.calculate","local.statistics","drive_search","drive_get_metadata",
    "bol_list_orders","bol_list_returns","bol_list_invoices","bol_get_retailer","bol_get_order",
    "bol_list_shipments","bol_get_commission","bol_get_competing_offers","eboekhouden_list_mutations",
    "eboekhouden_outstanding_invoices","eboekhouden_list_ledgers","eboekhouden_list_relations"];
  if(!capabilities.length||new Set(capabilities).size!==capabilities.length||capabilities.some(x=>!supported.includes(x)))fail("PROVISION_CAPABILITIES_INVALID");
  let providers;try{providers=JSON.parse(env.SAM_MODEL_REGISTRY_JSON);}catch{fail("PROVISION_MODEL_REGISTRY_REQUIRED");}
  if(!Array.isArray(providers)||providers.length<1||providers.length>5)fail("PROVISION_MODEL_REGISTRY_REQUIRED");
  for(const p of providers){
    if(!["openai","anthropic","google","deepseek","qwen"].includes(p.providerId)||!Array.isArray(p.models)||p.models.length!==1||
      typeof p.models[0]!=="string"||!/^[-a-zA-Z0-9_.:/]{1,120}$/.test(p.models[0])||
      !Array.isArray(p.privacyClasses)||p.privacyClasses.length<1||p.privacyClasses.some(x=>!["PUBLIC","INTERNAL"].includes(x))||
      ![p.costPer1kInput,p.costPer1kOutput].every(x=>Number.isFinite(x)&&x>0&&x<100))fail("PROVISION_MODEL_REGISTRY_INVALID");
  }
  if(new Set(providers.map(p=>p.providerId)).size!==providers.length)fail("PROVISION_MODEL_REGISTRY_INVALID");
  providers=providers.map(p=>({providerId:p.providerId,models:p.models,privacyClasses:p.privacyClasses,
    costPer1kInput:p.costPer1kInput,costPer1kOutput:p.costPer1kOutput})).sort((a,b)=>a.providerId.localeCompare(b.providerId));
  const directory=path.resolve(__dirname,"../../packages/db/migrations");
  const migrations=fs.readdirSync(directory).filter(x=>/^\d{5}_[a-z0-9_]+\.sql$/.test(x)).sort().map(filename=>{
    const sql=fs.readFileSync(path.join(directory,filename),"utf8");
    if(!sql.trim()||/\b(?:BEGIN|COMMIT|ROLLBACK)\s*;/i.test(sql))fail("PROVISION_MIGRATION_INVALID");
    return {filename,sql,sha256:crypto.createHash("sha256").update(sql).digest("hex")};
  });
  if(migrations.length!==10)fail("PROVISION_MIGRATION_REVIEW_REQUIRED");
  const organization=env.SAM_ORGANIZATION_NAME??"SAM",entity=env.SAM_LEGAL_ENTITY_NAME??"SAM operational entity";
  if([organization,entity].some(x=>typeof x!=="string"||!x.trim()||x.length>200))fail("PROVISION_NAMES_REQUIRED");
  const metadata={version:1,...t,budget,capabilities,providers,organization,entity,
    migrations:migrations.map(({filename,sha256})=>({filename,sha256}))};
  const hash=crypto.createHash("sha256").update(JSON.stringify(metadata)).digest("hex");
  return {metadata,hash,migrations};
}
function policies(t){
  const org=literal(t.orgId),entity=literal(t.entityId);
  return {
    organizations:`id=${org}::uuid`,legal_entities:`id=${entity}::uuid AND org_id=${org}::uuid`,
    goals:`company_scope=${entity}::uuid AND domain='executive' AND authority_ceiling='GREEN'`,
    plans:"EXISTS(SELECT 1 FROM goals g WHERE g.id=goal_id)",work_queue:"EXISTS(SELECT 1 FROM goals g WHERE g.id=goal_id)",
    executions:"EXISTS(SELECT 1 FROM goals g WHERE g.id=goal_id)",
    verifications:"EXISTS(SELECT 1 FROM executions e WHERE e.id=execution_id)",
    audit_log:"EXISTS(SELECT 1 FROM goals g WHERE g.id=goal_id)",
    world_facts:`entity_type='legal_entity' AND entity_id=${entity}::uuid`,
    memory_records:`scope->>'legal_entity_id'=${entity}`,
    business_id_sequences:`entity_type='goal' AND org_scope_id=${org}::uuid`,
    model_providers:"true",model_calls:"data_classification IN ('PUBLIC','INTERNAL')",
    verification_contracts:"true",sam_installation:`org_id=${org}::uuid AND entity_id=${entity}::uuid`,
    outbox_events:`(aggregate_type='goal' AND EXISTS(SELECT 1 FROM goals g WHERE g.id=aggregate_id))
      OR (aggregate_type='work_queue' AND EXISTS(SELECT 1 FROM work_queue w WHERE w.id=aggregate_id))
      OR (aggregate_type='execution' AND EXISTS(SELECT 1 FROM executions e WHERE e.id=aggregate_id))
      OR (aggregate_type='verification' AND EXISTS(SELECT 1 FROM verifications v WHERE v.id=aggregate_id))`
  };
}
async function initialize(client,env){
  const m=manifest(env),t=m.metadata,schema=identifier(t.schema),role=identifier(t.role);
  await client.query("BEGIN");
  try{
    await client.query("SET LOCAL lock_timeout='5s'; SET LOCAL statement_timeout='30s'; SET LOCAL standard_conforming_strings=on");
    await client.query("SELECT pg_advisory_xact_lock(hashtextextended($1,0))",["sam-provision:"+t.schema]);
    const existing=(await client.query("SELECT to_regnamespace($1) present",[t.schema])).rows[0].present;
    if(existing){
      // No CREATE IF NOT EXISTS guessing; a prior reviewed installation must match exactly.
      const prior=(await client.query(`SELECT fingerprint FROM ${schema}.sam_installation`)).rows;
      if(prior.length!==1||prior[0].fingerprint!==m.hash)fail("PROVISION_EXISTING_SCHEMA_REFUSED");
      await client.query("ROLLBACK");return {status:"ALREADY_PROVISIONED",fingerprint:m.hash};
    }
    const roles=(await client.query("SELECT oid FROM pg_roles WHERE rolname=$1",[t.role])).rows;
    if(roles.length)fail("PROVISION_EXISTING_ROLE_REFUSED");
    if(!env.SAM_RUNTIME_PASSWORD||env.SAM_RUNTIME_PASSWORD.length<32||env.SAM_RUNTIME_PASSWORD.length>256||/[\u0000-\u001f]/.test(env.SAM_RUNTIME_PASSWORD))fail("PROVISION_RUNTIME_PASSWORD_REQUIRED");
    if(!(await client.query("SELECT EXISTS(SELECT 1 FROM pg_extension WHERE extname='pgcrypto') ok")).rows[0].ok)fail("PROVISION_PREEXISTING_PGCRYPTO_REQUIRED");
    await client.query(`CREATE SCHEMA ${schema}; REVOKE ALL ON SCHEMA ${schema} FROM PUBLIC; SET LOCAL search_path=${schema},pg_catalog,pg_temp`);
    for(const migration of m.migrations)await client.query(migration.sql);
    await client.query(`CREATE TABLE sam_installation(fingerprint text PRIMARY KEY,org_id uuid NOT NULL,entity_id uuid NOT NULL,metadata jsonb NOT NULL,created_at timestamptz NOT NULL DEFAULT now())`);
    await client.query("INSERT INTO sam_installation(fingerprint,org_id,entity_id,metadata) VALUES($1,$2,$3,$4)",[m.hash,t.orgId,t.entityId,t]);
    await client.query("INSERT INTO organizations(id,name) VALUES($1,$2)",[t.orgId,t.organization]);
    await client.query("INSERT INTO legal_entities(id,org_id,name) VALUES($1,$2,$3)",[t.entityId,t.orgId,t.entity]);
    // Only this new installation's static catalog is replaced; no pre-existing schema is touched.
    await client.query("DELETE FROM verification_contracts");
    for(const capability of t.capabilities)await client.query(`INSERT INTO verification_contracts
      (capability_id,description,verification_method,required_evidence_fields,independent_query_template,must_not_trust_execution_result)
      VALUES($1,'Independent source readback and goal acceptance',$2,'{}',$3,true)`,
      [capability,capability.startsWith("local.")?"db_query":"api_readback",{source:capability.startsWith("local.")?"independent_sql":"independent_api",compareResult:true}]);
    for(const p of t.providers)await client.query(`INSERT INTO model_providers
      (provider_id,models,capabilities,cost_per_1k_input,cost_per_1k_output,privacy_class_allowed,health)
      VALUES($1,$2,'["planning"]',$3,$4,$5,'HEALTHY')`,[p.providerId,JSON.stringify(p.models),p.costPer1kInput,p.costPer1kOutput,JSON.stringify(p.privacyClasses)]);
    await client.query(`CREATE ROLE ${role} NOLOGIN NOINHERIT NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS`);
    // Bound secret; server-side utility SQL necessarily handles the supplied password.
    await client.query(`CREATE FUNCTION pg_temp.sam_set_runtime_password(role_name text,secret text) RETURNS void
      LANGUAGE plpgsql SECURITY INVOKER AS $body$ BEGIN EXECUTE format('ALTER ROLE %I LOGIN PASSWORD %L',role_name,secret); END $body$`);
    await client.query("SELECT pg_temp.sam_set_runtime_password($1,$2)",[t.role,env.SAM_RUNTIME_PASSWORD]);
    await client.query("DROP FUNCTION pg_temp.sam_set_runtime_password(text,text)");
    const database=(await client.query("SELECT current_database() name")).rows[0].name;
    await client.query(`GRANT CONNECT ON DATABASE ${identifier(database)} TO ${role}; GRANT USAGE ON SCHEMA ${schema} TO ${role}`);
    const readonly=new Set(["organizations","legal_entities","memory_records","model_providers","verification_contracts","sam_installation"]);
    const append=new Set(["audit_log","verifications","model_calls"]);
    const context=`current_setting('app.current_org_id',true)=${literal(t.orgId)} AND current_setting('app.current_legal_entity_id',true)=${literal(t.entityId)}`;
    for(const [table,expression] of Object.entries(policies(t))){
      const predicate=`(${context}) AND (${expression})`;
      await client.query(`ALTER TABLE ${identifier(table)} ENABLE ROW LEVEL SECURITY;
        CREATE POLICY direct_access ON ${identifier(table)} TO ${role} USING(${predicate}) WITH CHECK(${predicate});
        CREATE POLICY direct_principal ON ${identifier(table)} AS RESTRICTIVE TO ${role} USING(${predicate}) WITH CHECK(${predicate});
        GRANT ${readonly.has(table)?"SELECT":append.has(table)?"SELECT,INSERT":"SELECT,INSERT,UPDATE"} ON ${identifier(table)} TO ${role}`);
    }
    await client.query(`GRANT UPDATE(tokens,success,verification_result) ON model_calls TO ${role};
      GRANT USAGE,SELECT ON ALL SEQUENCES IN SCHEMA ${schema} TO ${role};
      REVOKE EXECUTE ON ALL FUNCTIONS IN SCHEMA ${schema} FROM PUBLIC;
      GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA ${schema} TO ${role};
      ALTER VIEW current_world_facts SET (security_invoker=true)`);
    for(const name of [...tableNames,"sam_installation"])await client.query(`ALTER TABLE ${identifier(name)} FORCE ROW LEVEL SECURITY`);
    const maintenance=(await client.query("SELECT current_user name")).rows[0].name;
    await client.query(`CREATE POLICY direct_manifest_maintenance ON sam_installation FOR SELECT TO ${identifier(maintenance)} USING(true)`);
    const count=(await client.query("SELECT count(*)::int n FROM pg_class WHERE relnamespace=to_regnamespace($1) AND relkind='r' AND relrowsecurity AND relforcerowsecurity",[t.schema])).rows[0].n;
    if(count!==23)fail("PROVISION_SCHEMA_POSTCONDITION_FAILED");
    await client.query("COMMIT");
    return {status:"PROVISIONED",fingerprint:m.hash};
  }catch(error){await client.query("ROLLBACK");throw error;}
}
async function apply(packet){
  const {Client}=require("pg");
  const admin=new URL(packet.adminUrl);
  if(!["postgres:","postgresql:"].includes(admin.protocol)||admin.hostname!==packet.expectedHost||
    decodeURIComponent(admin.pathname.slice(1))!==packet.expectedDatabase||
    admin.searchParams.get("sslmode")!=="verify-full"||[...admin.searchParams.keys()].some(k=>k!=="sslmode"))fail("PROVISION_TARGET_REFUSED");
  const client=new Client({connectionString:admin.href,connectionTimeoutMillis:5000,query_timeout:30000});
  await client.connect();
  try{
    const identity=(await client.query("SELECT current_database() name,current_user=session_user same_login,(SELECT ssl FROM pg_stat_ssl WHERE pid=pg_backend_pid()) ssl")).rows[0];
    if(identity.name!==packet.expectedDatabase||!identity.same_login||!identity.ssl)fail("PROVISION_TARGET_REFUSED");
    const result=await initialize(client,{...packet.metadata,SAM_RUNTIME_PASSWORD:packet.runtimePassword});
    const t=tenant(packet.metadata),runtime=new URL(admin.href);
    runtime.username=t.role;runtime.password=packet.runtimePassword;
    runtime.searchParams.set("options",`-c search_path=${t.schema},pg_catalog,pg_temp -c app.current_org_id=${t.orgId} -c app.current_legal_entity_id=${t.entityId}`);
    const probe=new Client({connectionString:runtime.href,connectionTimeoutMillis:5000,query_timeout:15000});
    try{
      await probe.connect();
      const identity=(await probe.query(`SELECT current_user role,session_user login,
        (SELECT ssl FROM pg_stat_ssl WHERE pid=pg_backend_pid()) ssl`)).rows[0];
      if(identity.role!==t.role||identity.login!==t.role||!identity.ssl)fail("PROVISION_RUNTIME_CHECK_FAILED");
      const record=(await probe.query("SELECT fingerprint FROM sam_installation")).rows;
      if(record.length!==1||record[0].fingerprint!==result.fingerprint)fail("PROVISION_RUNTIME_CHECK_FAILED");
      await probe.query("BEGIN; SELECT set_config('app.current_org_id','',true),set_config('app.current_legal_entity_id','',true)");
      if((await probe.query("SELECT count(*)::int n FROM legal_entities")).rows[0].n!==0)fail("PROVISION_RUNTIME_CHECK_FAILED");
      await probe.query("ROLLBACK");
      return {...result,runtimeLoginVerified:true};
    }finally{await probe.end();}
  }finally{await client.end();}
}
async function main(){
  if(!process.argv.includes("--apply")){console.log(JSON.stringify({status:"NOT_APPLIED",connections:0}));return;}
  const input=fs.readFileSync(3,"utf8");if(Buffer.byteLength(input)>65536)fail("PROVISION_INPUT_REFUSED");
  const packet=JSON.parse(input);
  const result=await apply(packet);console.log(JSON.stringify(result));
}
if(require.main===module)main().catch(()=>{console.error("DIRECT_PROVISION_REFUSED; no credential or provider error is printed; inspect target state before retry");process.exitCode=1;});
module.exports={manifest,initialize,apply,tableNames};
