import assert from "node:assert/strict";
import {createRequire} from "node:module";
import {randomUUID} from "node:crypto";
import {Client} from "pg";
import {assertReleaseDatabaseSafety} from "../../packages/db/src/releaseSafety";
const require=createRequire(import.meta.url);
const {developmentEnvironment,databaseClient,assertDevelopmentIdentity}=require("../../scripts/development/environment.cjs");
let stage="identity";

async function main(){
  const admin=databaseClient(developmentEnvironment(process.env.PGOPTIONS!.match(/search_path=([^,]+)/)![1]));
  const suffix=Date.now(),app=`sam_pg_app_${suffix}`,migration=`sam_pg_migration_${suffix}`;
  const org=randomUUID(),entity=randomUUID(),otherOrg=randomUUID(),otherEntity=randomUUID(),sibling=randomUUID();
  let reader:Client|undefined,locker:Client|undefined;
  let createdApp=false,createdMigration=false;
  await admin.connect();
  try{
    await assertDevelopmentIdentity(admin);
    stage="fixture_schema";
    const schema=(await admin.query("SELECT current_schema() s")).rows[0].s;
    assert.match(schema,/^sam_replit_test_[0-9]+$/);
    await admin.query(`CREATE ROLE ${migration} NOLOGIN CREATEDB NOSUPERUSER NOBYPASSRLS`);
    createdMigration=true;
    await admin.query(`CREATE ROLE ${app} LOGIN PASSWORD 'synthetic-local-pg-fixture' NOSUPERUSER NOBYPASSRLS NOCREATEDB NOCREATEROLE NOREPLICATION NOINHERIT`);
    createdApp=true;
    await admin.query(`GRANT USAGE ON SCHEMA ${schema} TO ${app}`);
    await admin.query(`GRANT SELECT,INSERT,UPDATE,DELETE ON ALL TABLES IN SCHEMA ${schema} TO ${app}`);
    await admin.query(`GRANT USAGE,SELECT ON ALL SEQUENCES IN SCHEMA ${schema} TO ${app}`);
    await admin.query("INSERT INTO organizations(id,name) VALUES($1,'Synthetic compatibility own'),($2,'Synthetic compatibility other')",[org,otherOrg]);
    await admin.query(`INSERT INTO legal_entities(id,org_id,name) VALUES
      ($1,$2,'Synthetic own'),($3,$4,'Synthetic other'),($5,$2,'Synthetic sibling')`,[entity,org,otherEntity,otherOrg,sibling]);
    const goal=(await admin.query(`INSERT INTO goals(business_id,company_scope,objective)
      VALUES('PG-COMPAT-OWN',$1,'Synthetic transaction check'),
      ('PG-COMPAT-OTHER',$2,'Synthetic other'),('PG-COMPAT-SIBLING',$3,'Synthetic sibling') RETURNING id`,
      [entity,otherEntity,sibling])).rows[0].id;
    // Explicitly test-only fixed principal restriction, supplementing SAM's real
    // context-based policies. Never installed in development/business schemas.
    const principal=(await admin.query(`SELECT format(
      'CREATE POLICY synthetic_principal ON goals AS RESTRICTIVE TO ${app}
       USING (current_setting(''app.current_org_id'',true)=%L
       AND current_setting(''app.current_legal_entity_id'',true)=%L AND company_scope=%L::uuid)
       WITH CHECK (current_setting(''app.current_org_id'',true)=%L
       AND current_setting(''app.current_legal_entity_id'',true)=%L AND company_scope=%L::uuid)',
      $1::text,$2::text,$2::text,$1::text,$2::text,$2::text) sql`,[org,entity])).rows[0].sql;
    await admin.query(principal);
    await admin.query(`CREATE POLICY synthetic_queue ON work_queue TO ${app}
      USING(goal_id IN(SELECT id FROM goals)) WITH CHECK(goal_id IN(SELECT id FROM goals))`);
    await admin.query("INSERT INTO work_queue(goal_id,capability_id,params) VALUES($1,'local.calculate','{}'),($1,'local.calculate','{}')",[goal]);
    const url=new URL(process.env.DATABASE_URL!);
    stage="restricted_login";
    url.username=app;url.password="synthetic-local-pg-fixture";
    url.searchParams.set("options",`-c search_path=${schema},pg_catalog -c app.current_org_id=${org} -c app.current_legal_entity_id=${entity}`);
    reader=new Client({connectionString:url.toString()});await reader.connect();
    locker=new Client({connectionString:url.toString()});await locker.connect();
    stage="release_admission";
    await assertReleaseDatabaseSafety(reader);
    assert.equal((await reader.query("SELECT count(*)::int n FROM goals")).rows[0].n,1);
    stage="tenant_denials";
    for(const [o,e] of [[null,null],[org,null],[otherOrg,entity],[org,sibling],[otherOrg,otherEntity]]){
      await reader.query("BEGIN");
      try{
        await reader.query("SELECT set_config('app.current_org_id',$1,true),set_config('app.current_legal_entity_id',$2,true)",[o??"",e??""]);
        assert.equal((await reader.query("SELECT count(*)::int n FROM goals")).rows[0].n,0);
      }finally{await reader.query("ROLLBACK");}
    }
    assert.equal((await reader.query("UPDATE goals SET objective='not permitted' WHERE company_scope=$1 RETURNING id",[otherEntity])).rowCount,0);
    await assert.rejects(()=>reader!.query("INSERT INTO goals(business_id,company_scope,objective) VALUES('PG-COMPAT-DENIED',$1,'Synthetic denied')",[otherEntity]),(e:any)=>e.code==="42501");
    for(const sql of ["CREATE TABLE forbidden_compat(id int)",`CREATE SCHEMA forbidden_compat_${suffix}`,"TRUNCATE goals","CREATE ROLE forbidden_compat"]){
      await assert.rejects(()=>reader!.query(sql),(e:any)=>e.code==="42501");
    }
    const original=(await reader.query("SELECT objective FROM goals WHERE id=$1",[goal])).rows[0].objective;
    stage="transactions_and_locks";
    await reader.query("BEGIN");await reader.query("UPDATE goals SET objective='Synthetic rolled back' WHERE id=$1",[goal]);await reader.query("ROLLBACK");
    assert.equal((await reader.query("SELECT objective FROM goals WHERE id=$1",[goal])).rows[0].objective,original);
    await reader.query("BEGIN");await reader.query("UPDATE goals SET priority=7 WHERE id=$1",[goal]);await reader.query("COMMIT");
    assert.equal((await locker.query("SELECT priority FROM goals WHERE id=$1",[goal])).rows[0].priority,7);
    await reader.query("BEGIN");await locker.query("BEGIN");
    const first=(await reader.query("SELECT id FROM work_queue ORDER BY id FOR UPDATE SKIP LOCKED LIMIT 1")).rows[0].id;
    const second=(await locker.query("SELECT id FROM work_queue ORDER BY id FOR UPDATE SKIP LOCKED LIMIT 1")).rows[0].id;
    assert.notEqual(first,second);await reader.query("ROLLBACK");await locker.query("ROLLBACK");
    await admin.query(`GRANT ${migration} TO ${app}`);
    stage="unsafe_privilege_admission";
    await assert.rejects(()=>assertReleaseDatabaseSafety(reader!),/RELEASE_PRIVILEGED_ROLE_MEMBERSHIP_FORBIDDEN/);
    await admin.query(`REVOKE ${migration} FROM ${app}`);
    await admin.query(`GRANT TRUNCATE ON ${schema}.goals TO ${app}`);
    await assert.rejects(()=>assertReleaseDatabaseSafety(reader!),/RELEASE_APPLICATION_DDL_FORBIDDEN/);
    await admin.query(`REVOKE TRUNCATE ON ${schema}.goals FROM ${app}`);
    for(const [grant,revoke] of [["CREATEDB","NOCREATEDB"],["CREATEROLE","NOCREATEROLE"]]){
      await admin.query(`ALTER ROLE ${app} ${grant}`);
      await assert.rejects(()=>assertReleaseDatabaseSafety(reader!),/RELEASE_APPLICATION_ROLE_UNSAFE/);
      await admin.query(`ALTER ROLE ${app} ${revoke}`);
    }
    const owner=(await admin.query("SELECT current_user name")).rows[0].name as string;
    assert.match(owner,/^[a-z_][a-z0-9_]*$/);
    await admin.query(`GRANT CREATE ON SCHEMA ${schema} TO ${app}`);
    await admin.query(`ALTER TABLE goals OWNER TO ${app}`);
    await assert.rejects(()=>assertReleaseDatabaseSafety(reader!),/RELEASE_APPLICATION_TABLE_OWNER_FORBIDDEN/);
    await admin.query(`ALTER TABLE goals OWNER TO ${owner}`);
    await admin.query(`REVOKE CREATE ON SCHEMA ${schema} FROM ${app}`);
    await admin.query("ALTER TABLE goals DISABLE ROW LEVEL SECURITY");
    await assert.rejects(()=>assertReleaseDatabaseSafety(reader!),/RELEASE_RLS_REQUIRED/);
    await admin.query("ALTER TABLE goals ENABLE ROW LEVEL SECURITY");
    await assertReleaseDatabaseSafety(reader);
    console.log("POSTGRES_COMPATIBILITY_LOCAL_PASS: real restricted LOGIN; original migrated schema + test-only principal policy; missing/foreign/sibling contexts and DDL denied; commit/rollback and concurrent SKIP LOCKED; dangerous membership/TRUNCATE admission rejected. NOT_NEON_LIVE.");
  }finally{
    await reader?.end();await locker?.end();
    if(createdApp){await admin.query(`DROP OWNED BY ${app}`);await admin.query(`DROP ROLE ${app}`);}
    if(createdMigration){await admin.query(`DROP OWNED BY ${migration}`);await admin.query(`DROP ROLE ${migration}`);}
    await admin.end();
  }
}
main().catch((error:any)=>{
  console.error("POSTGRES_COMPATIBILITY_LOCAL_FAILED",stage,error.code??(
    /^RELEASE_[A-Z_]+$/.test(error.message)?error.message:"ASSERTION"));
  process.exitCode=1;
});
