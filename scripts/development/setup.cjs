const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const {
  root, configPath, schema, developmentEnvironment, databaseClient, assertDevelopmentIdentity
} = require("./environment.cjs");

async function main() {
  if(process.argv.includes("--autonomy")){await setupAutonomy(false);return;}
  const env = developmentEnvironment();
  const client = databaseClient(env);
  await client.connect();
  let databaseName;
  try {
    await assertDevelopmentIdentity(client);
    const state = await client.query(`SELECT current_database() AS database,
      (SELECT count(*)::int FROM information_schema.tables WHERE table_schema='public') AS public_tables,
      EXISTS(SELECT 1 FROM pg_namespace WHERE nspname=$1) AS isolated_schema`, [schema]);
    databaseName = state.rows[0].database;
    if (!state.rows[0].isolated_schema && state.rows[0].public_tables !== 0) {
      throw new Error("Database is not empty; inspect it before initializing SAM.");
    }
    await client.query(`CREATE SCHEMA IF NOT EXISTS ${schema}`);
  } finally {
    await client.end();
  }

  const migration = spawnSync(process.execPath, ["packages/db/src/migrate.js", "--apply"], {
    cwd: root, env, stdio: "inherit"
  });
  if (migration.status !== 0) throw new Error("Development migration failed.");

  const seed = databaseClient(env);
  await seed.connect();
  let legalEntityId;
  try {
    await seed.query("BEGIN");
    const existing = await seed.query(`SELECT le.id FROM legal_entities le
      JOIN organizations o ON o.id=le.org_id
      WHERE o.name=$1 AND le.name=$2`, ["SAM Replit Development", "SAM Development Only"]);
    if (existing.rowCount) {
      legalEntityId = existing.rows[0].id;
    } else {
      const org = await seed.query("INSERT INTO organizations(name) VALUES($1) RETURNING id", ["SAM Replit Development"]);
      const entity = await seed.query(`INSERT INTO legal_entities(org_id,name,status)
        VALUES($1,$2,'ACTIVE') RETURNING id`, [org.rows[0].id, "SAM Development Only"]);
      legalEntityId = entity.rows[0].id;
    }
    await seed.query("COMMIT");
  } catch (error) {
    await seed.query("ROLLBACK");
    throw error;
  } finally {
    await seed.end();
  }
  fs.mkdirSync(path.dirname(configPath), { recursive: true });
  fs.writeFileSync(configPath, JSON.stringify({ databaseName, schema, legalEntityId }, null, 2) + "\n");
  console.log("SAM DEVELOPMENT SETUP PASS: isolated schema; development entity only; no external adapters.");
}

async function setupAutonomy(test=false){
  const schema=test?"sam_replit_test_autonomy":"sam_replit_autonomy",role=test?"sam_autonomy_test_app":"sam_autonomy_app";
  const env=developmentEnvironment(schema),client=databaseClient(env);
  await client.connect();
  let config;
  try{
    await assertDevelopmentIdentity(client);
    if((await client.query("SELECT 1 FROM pg_namespace WHERE nspname=$1",[schema])).rowCount)throw new Error("Autonomy schema already exists; never reset consent or evidence.");
    await client.query(`CREATE SCHEMA ${schema}`);
    const migration=spawnSync(process.execPath,["packages/db/src/migrate.js","--apply"],{cwd:root,env,stdio:"pipe"});
    if(migration.status!==0)throw new Error("Autonomy migration failed.");
    const org=(await client.query("INSERT INTO organizations(name) VALUES('Synthetic autonomy development') RETURNING id")).rows[0].id;
    const entity=(await client.query("INSERT INTO legal_entities(org_id,name) VALUES($1,'Synthetic-only autonomy') RETURNING id",[org])).rows[0].id;
    await client.query(`CREATE TABLE autonomy_session(id boolean PRIMARY KEY DEFAULT true CHECK(id),
      org_id uuid NOT NULL,legal_entity_id uuid NOT NULL,max_calls int NOT NULL CHECK(max_calls=4),
      max_total_usd numeric NOT NULL CHECK(max_total_usd<=0.25),expires_at timestamptz NOT NULL);
      CREATE TABLE autonomy_model_claims(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),goal_id uuid NOT NULL REFERENCES goals(id),
      input_hash text NOT NULL,max_cost_usd numeric NOT NULL DEFAULT 0.01 CHECK(max_cost_usd=0.01),created_at timestamptz NOT NULL DEFAULT now());
      CREATE TABLE autonomy_provider_receipts(claim_id uuid PRIMARY KEY REFERENCES autonomy_model_claims(id),
      started_at timestamptz NOT NULL,finished_at timestamptz NOT NULL,http_status int NOT NULL,model text NOT NULL,
      input_tokens int,output_tokens int,reasoning_tokens int,response_hash text NOT NULL,output_hash text NOT NULL);
      CREATE TABLE local_artifacts(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),goal_id uuid NOT NULL REFERENCES goals(id),
      queue_id uuid NOT NULL UNIQUE REFERENCES work_queue(id),result jsonb NOT NULL,knowledge_refs jsonb NOT NULL,created_at timestamptz DEFAULT now());
      INSERT INTO autonomy_session VALUES(true,'${org}','${entity}',4,0.25,now()+interval '2 hours');
      CREATE FUNCTION claim_autonomy_budget() RETURNS trigger LANGUAGE plpgsql AS $$
      BEGIN
        PERFORM pg_advisory_xact_lock(hashtextextended('sam-autonomy-budget',0));
        IF NOT EXISTS(SELECT 1 FROM autonomy_session WHERE expires_at>now()) OR
          (SELECT count(*) FROM autonomy_model_claims)>=(SELECT max_calls FROM autonomy_session) OR
          (SELECT coalesce(sum(max_cost_usd),0) FROM autonomy_model_claims)+NEW.max_cost_usd>(SELECT max_total_usd FROM autonomy_session)
          THEN RAISE EXCEPTION 'AUTONOMY_BUDGET_DENIED'; END IF;
        RETURN NEW;
      END $$;
      CREATE TRIGGER autonomy_budget BEFORE INSERT ON autonomy_model_claims FOR EACH ROW EXECUTE FUNCTION claim_autonomy_budget();
      CREATE FUNCTION limit_autonomy_goals() RETURNS trigger LANGUAGE plpgsql AS $$
      BEGIN
        PERFORM pg_advisory_xact_lock(hashtextextended('sam-autonomy-intake',0));
        IF NEW.company_scope='${entity}' AND (SELECT count(*) FROM goals WHERE company_scope=NEW.company_scope)>=2
          THEN RAISE EXCEPTION 'AUTONOMY_GOAL_LIMIT'; END IF;
        RETURN NEW;
      END $$;
      CREATE TRIGGER autonomy_intake BEFORE INSERT ON goals FOR EACH ROW EXECUTE FUNCTION limit_autonomy_goals();`);
    await client.query(`CREATE ROLE ${role} NOLOGIN NOSUPERUSER NOBYPASSRLS NOINHERIT;
      GRANT USAGE ON SCHEMA ${schema} TO ${role};GRANT USAGE,SELECT ON ALL SEQUENCES IN SCHEMA ${schema} TO ${role};`);
    const tables=(await client.query("SELECT tablename FROM pg_tables WHERE schemaname=$1",[schema])).rows;
    const denied=/financial|bank|finance|ledger|invoice|payment|approval|side_effect|users|user_|memory_records|document|reconciliation|journal/;
    for(const {tablename:t} of tables){
      if(denied.test(t))continue;
      const readOnly=["organizations","legal_entities","model_providers","verification_contracts","autonomy_session"].includes(t);
      const insertOnly=["autonomy_model_claims","autonomy_provider_receipts"].includes(t);
      await client.query(`GRANT ${readOnly?"SELECT":insertOnly?"SELECT,INSERT":"SELECT,INSERT,UPDATE"} ON ${schema}.${t} TO ${role}`);
    }
    const policy=async(table,expr,readOnly=false,restrictive=false)=>{
      await client.query(`ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY;
        CREATE POLICY autonomy_scope ON ${table} ${restrictive?"AS RESTRICTIVE":""} FOR ${readOnly?"SELECT":"ALL"} TO ${role}
        USING(${expr}) ${readOnly?"":`WITH CHECK(${expr})`}`);
    };
    await policy("goals",`company_scope='${entity}' AND domain='development_probe' AND authority_ceiling='GREEN'`,false,true);
    await policy("business_id_sequences",`entity_type='goal' AND org_scope_id='${org}'`);
    for(const t of ["plans","work_queue","executions","audit_log","local_artifacts"])await policy(t,"EXISTS(SELECT 1 FROM goals g WHERE g.id=goal_id)");
    await policy("verifications","EXISTS(SELECT 1 FROM executions e WHERE e.id=execution_id)");
    await policy("world_facts",`entity_type='legal_entity' AND entity_id='${entity}' AND domain='development_probe' AND attribute ~ '^local_(sum|mean|min|max|count)$'`);
    await policy("autonomy_session","true",true);
    await policy("autonomy_model_claims","EXISTS(SELECT 1 FROM goals g WHERE g.id=goal_id)");
    await policy("autonomy_provider_receipts","EXISTS(SELECT 1 FROM autonomy_model_claims c WHERE c.id=claim_id)");
    await policy("model_providers","provider_id='deepseek'",true);
    await policy("model_calls","provider='deepseek' AND task='executive_planning' AND data_classification='PUBLIC'");
    await policy("verification_contracts","capability_id IN ('local.calculate','local.statistics')",true);
    await policy("outbox_events",`aggregate_type='goal' AND EXISTS(SELECT 1 FROM goals g WHERE g.id=aggregate_id)
      OR aggregate_type='work_queue' AND EXISTS(SELECT 1 FROM work_queue w WHERE w.id=aggregate_id)
      OR aggregate_type='execution' AND EXISTS(SELECT 1 FROM executions e WHERE e.id=aggregate_id)
      OR aggregate_type='verification' AND EXISTS(SELECT 1 FROM verifications v WHERE v.id=aggregate_id)`);
    await policy("event_fabric_events","source='outbox' AND EXISTS(SELECT 1 FROM outbox_events o WHERE o.id=outbox_ref)");
    await client.query(`INSERT INTO model_providers(provider_id,models,capabilities,privacy_class_allowed,health,cost_per_1k_input,cost_per_1k_output)
      VALUES('deepseek','["deepseek-flash"]','["planning"]','["PUBLIC"]','HEALTHY',0.0003,0.0012)`);
    for(const cap of ["local.calculate","local.statistics"])await client.query(`INSERT INTO verification_contracts
      (capability_id,description,verification_method,required_evidence_fields,independent_query_template,must_not_trust_execution_result)
      VALUES($1,'Independent PostgreSQL calculation and artifact readback','db_query','{"resultHash":"string","sqlReadback":"boolean"}',
      '{"local":true,"independent":true}',true)`,[cap]);
    config={databaseName:(await client.query("SELECT current_database() n")).rows[0].n,schema,legalEntityId:entity,orgId:org,role,autonomy:true};
  }finally{await client.end();}
  if(!test){fs.writeFileSync(configPath,JSON.stringify(config,null,2),{mode:0o600});console.log("AUTONOMY_SETUP PASS: isolated synthetic schema; 4 persistent claims; no external actions.");}
  return config;
}
module.exports={setupAutonomy};
if(require.main===module)main().catch(error => {
  console.error("SAM development setup failed:", error.message);
  process.exitCode = 1;
});
