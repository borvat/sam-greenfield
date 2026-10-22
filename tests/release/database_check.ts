import assert from "node:assert/strict";
import {checkReleaseDatabase,databaseCheckFailure} from "../../scripts/release/database-check";
const env={
  NODE_ENV:"production",SAM_RELEASE_APPROVED:"1",SAM_DATABASE_TARGET:"production",
  DATABASE_URL:"postgresql://sam_app:synthetic-only@database.invalid/release?sslmode=require",
  SAM_DB_CONNECTION_SOURCE:"replit_managed",SAM_DB_APP_ROLE:"sam_app",SAM_DB_SCHEMA:"sam",
  SAM_RELEASE_ORG_ID:"11111111-1111-1111-1111-111111111111",
  SAM_COMMAND_CENTER_LEGAL_ENTITY_ID:"22222222-2222-2222-2222-222222222222",
  SAM_COMMAND_CENTER_BEARER_TOKEN:"synthetic-unit-token-not-an-actual-secret",
  SAM_COMMAND_CENTER_ALLOWED_HOSTS:"example.invalid",
  SAM_COMMAND_CENTER_ALLOWED_ORIGINS:"https://example.invalid",
  SAM_PRODUCTION_BUNDLE_MODULE:"apps/production/src/defaultBundleModule.ts",
  SAM_RELEASE_CAPABILITIES:"local.calculate"
};
async function main(){
  let factories=0,closed=0;
  const factory=(failure="",throws=false)=>(config:any)=>{
    factories++;
    assert.equal(new URL(config.connectionString).searchParams.get("sslmode"),"verify-full");
    assert.equal(config.max,1);
    return {
      async query(text:string){
        assert.ok(text.startsWith("SELECT"),"only catalog SELECTs permitted");
        if(throws)throw new Error("synthetic-driver-failure");
        let row:any;
        if(text.includes("pg_stat_ssl"))row={ssl:failure!=="tls"};
        else if(text.includes("same_login"))row={same_login:failure!=="login"};
        else if(text.includes("FROM pg_roles WHERE rolname=current_user"))
          row={rolsuper:false,rolbypassrls:failure==="role",rolcreatedb:false,rolcreaterole:false,rolreplication:false};
        else if(text.includes("pg_has_role(current_user,oid"))row={n:failure==="membership"?1:0};
        else if(text.includes("relowner"))row={n:failure==="owner"?1:0};
        else if(text.includes("has_schema_privilege"))
          row={schema_create:failure==="ddl",database_create:false,table_ddl:false};
        else if(text.includes("bool_and"))row={n:6,protected:failure!=="rls"};
        else throw new Error("unexpected query");
        return {rows:[row]};
      },
      async end(){closed++;}
    };
  };
  await assert.rejects(()=>checkReleaseDatabase(env,false,factory()),/APPROVAL_REQUIRED/);
  assert.equal(factories,0);
  const result=await checkReleaseDatabase(env,true,factory());
  assert.equal(result.status,"PASS");assert.equal(result.publishAuthorized,false);
  assert.equal(result.workerStarted,false);
  assert.equal(JSON.stringify(result).includes("synthetic-only"),false);
  assert.equal(JSON.stringify(result).includes("database.invalid"),false);
  // Database inspection must not depend on OAuth/model/publish approval.
  await checkReleaseDatabase({...env,SAM_RELEASE_APPROVED:"0",
    SAM_PRODUCTION_BUNDLE_MODULE:undefined,SAM_COMMAND_CENTER_BEARER_TOKEN:undefined},
    true,factory());
  for(const message of ["postgresql://synthetic-secret@invalid/db",
    "RELEASE_SECRET_CANARY","provider raw query and password"]){
    assert.equal(databaseCheckFailure(new Error(message)),"RELEASE_DATABASE_CHECK_FAILED");
  }
  for(const [failure,code] of [
    ["tls","TLS_REQUIRED"],["login","APPLICATION_LOGIN_REQUIRED"],
    ["role","APPLICATION_ROLE_UNSAFE"],["membership","PRIVILEGED_ROLE_MEMBERSHIP_FORBIDDEN"],
    ["owner","APPLICATION_TABLE_OWNER_FORBIDDEN"],["ddl","APPLICATION_DDL_FORBIDDEN"],
    ["rls","RLS_REQUIRED"]
  ])await assert.rejects(()=>checkReleaseDatabase(env,true,factory(failure)),new RegExp(code));
  await assert.rejects(()=>checkReleaseDatabase(env,true,factory("",true)));
  assert.equal(closed,factories);
  console.log("DATABASE_CHECK_PASS: 14 local cases; no external connections; no DB/provider compatibility claim.");
}
main().catch(()=>{console.error("DATABASE_CHECK_TEST_FAILED");process.exitCode=1;});
