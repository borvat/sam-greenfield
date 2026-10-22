const {developmentEnvironment,databaseClient,assertDevelopmentIdentity}=require("./environment.cjs");

function scope(config){
  const test=config.schema==="sam_replit_test_autonomy";
  if(config.schema!==(test?"sam_replit_test_autonomy":"sam_replit_autonomy")||
     config.role!==(test?"sam_autonomy_test_app":"sam_autonomy_app")||
     !/^[a-f0-9-]{36}$/.test(config.legalEntityId)||!/^[a-f0-9-]{36}$/.test(config.orgId))
    throw new Error("AUTONOMY_SESSION_SCOPE");
}

async function migrateSessions(client,config){
  scope(config);
  await client.query("SELECT pg_advisory_xact_lock(hashtextextended('sam-autonomy-control',0))");
  const found=await client.query(`SELECT 1 FROM information_schema.columns
    WHERE table_schema=current_schema() AND table_name='autonomy_session' AND column_name='session_id'`);
  if(found.rowCount)return;
  const old=(await client.query("SELECT org_id,legal_entity_id FROM autonomy_session")).rows;
  if(old.length!==1||old[0].org_id!==config.orgId||old[0].legal_entity_id!==config.legalEntityId)
    throw new Error("AUTONOMY_LEGACY_SESSION_SCOPE");
  await client.query(`
    ALTER TABLE autonomy_session ADD COLUMN session_id uuid NOT NULL DEFAULT gen_random_uuid();
    ALTER TABLE autonomy_session ADD COLUMN created_at timestamptz NOT NULL DEFAULT now();
    ALTER TABLE autonomy_session DROP CONSTRAINT autonomy_session_pkey;
    ALTER TABLE autonomy_session ADD PRIMARY KEY(session_id);
    ALTER TABLE goals ADD COLUMN autonomy_session_id uuid REFERENCES autonomy_session(session_id);
    UPDATE goals SET autonomy_session_id=(SELECT session_id FROM autonomy_session)
      WHERE company_scope='${config.legalEntityId}';
    ALTER TABLE autonomy_model_claims ADD COLUMN session_id uuid REFERENCES autonomy_session(session_id);
    UPDATE autonomy_model_claims c SET session_id=g.autonomy_session_id FROM goals g WHERE g.id=c.goal_id;
    ALTER TABLE autonomy_model_claims ALTER COLUMN session_id SET NOT NULL;

    CREATE OR REPLACE FUNCTION claim_autonomy_budget() RETURNS trigger LANGUAGE plpgsql AS $$
    DECLARE sid uuid; allowed autonomy_session%ROWTYPE;
    BEGIN
      PERFORM pg_advisory_xact_lock(hashtextextended('sam-autonomy-budget',0));
      SELECT g.autonomy_session_id INTO sid FROM goals g WHERE g.id=NEW.goal_id;
      IF sid IS NULL OR (NEW.session_id IS NOT NULL AND NEW.session_id<>sid)
        THEN RAISE EXCEPTION 'AUTONOMY_CLAIM_SESSION'; END IF;
      SELECT s.* INTO allowed FROM autonomy_session s JOIN goals g ON g.id=NEW.goal_id
        WHERE s.session_id=sid AND s.legal_entity_id=g.company_scope AND s.expires_at>now();
      IF NOT FOUND OR
        (SELECT count(*) FROM autonomy_model_claims c WHERE c.session_id=sid)>=allowed.max_calls OR
        (SELECT coalesce(sum(c.max_cost_usd),0) FROM autonomy_model_claims c WHERE c.session_id=sid)+NEW.max_cost_usd>allowed.max_total_usd
        THEN RAISE EXCEPTION 'AUTONOMY_BUDGET_DENIED'; END IF;
      NEW.session_id:=sid;
      RETURN NEW;
    END $$;
    CREATE OR REPLACE FUNCTION limit_autonomy_goals() RETURNS trigger LANGUAGE plpgsql AS $$
    DECLARE sid uuid;
    BEGIN
      IF NEW.company_scope='${config.legalEntityId}' THEN
        PERFORM pg_advisory_xact_lock(hashtextextended('sam-autonomy-intake',0));
        SELECT session_id INTO sid FROM autonomy_session
          WHERE legal_entity_id=NEW.company_scope AND org_id='${config.orgId}' AND expires_at>now();
        IF sid IS NULL OR (NEW.autonomy_session_id IS NOT NULL AND NEW.autonomy_session_id<>sid)
          THEN RAISE EXCEPTION 'AUTONOMY_INTAKE_SESSION'; END IF;
        IF (SELECT count(*) FROM goals WHERE autonomy_session_id=sid)>=2
          THEN RAISE EXCEPTION 'AUTONOMY_GOAL_LIMIT'; END IF;
        NEW.autonomy_session_id:=sid;
      END IF;
      RETURN NEW;
    END $$;
    CREATE FUNCTION immutable_autonomy_goal_session() RETURNS trigger LANGUAGE plpgsql AS $$
    BEGIN
      IF OLD.autonomy_session_id IS DISTINCT FROM NEW.autonomy_session_id
        THEN RAISE EXCEPTION 'AUTONOMY_SESSION_IMMUTABLE'; END IF;
      RETURN NEW;
    END $$;
    CREATE TRIGGER autonomy_session_binding BEFORE UPDATE OF autonomy_session_id ON goals
      FOR EACH ROW EXECUTE FUNCTION immutable_autonomy_goal_session();
  `);
}

async function prepareSessions(config,{open=false,ownerAuthorized=false}={}){
  scope(config);
  if(open&&!ownerAuthorized)throw new Error("AUTONOMY_NEW_OWNER_AUTHORIZATION_REQUIRED");
  const client=databaseClient(developmentEnvironment(config.schema));
  await client.connect();
  try{
    await assertDevelopmentIdentity(client);
    await client.query("BEGIN");
    const acl=()=>client.query("SELECT relname,relacl::text FROM pg_class JOIN pg_namespace n ON n.oid=relnamespace WHERE n.nspname=current_schema() AND relkind='r' ORDER BY relname");
    const before=JSON.stringify((await acl()).rows);
    await migrateSessions(client,config);
    let session;
    if(open){
      if((await client.query("SELECT 1 FROM autonomy_session WHERE expires_at>now()")).rowCount)
        throw new Error("AUTONOMY_ACTIVE_SESSION_EXISTS");
      session=(await client.query(`INSERT INTO autonomy_session(org_id,legal_entity_id,max_calls,max_total_usd,expires_at)
        VALUES($1,$2,4,0.25,now()+interval '2 hours')
        RETURNING session_id,max_calls,max_total_usd,expires_at`,[config.orgId,config.legalEntityId])).rows[0];
    }
    if(JSON.stringify((await acl()).rows)!==before)throw new Error("AUTONOMY_PRIVILEGES_CHANGED");
    await client.query("COMMIT");
    return {session,privilegesUnchanged:true};
  }catch(error){await client.query("ROLLBACK");throw error;}
  finally{await client.end();}
}
module.exports={prepareSessions};
