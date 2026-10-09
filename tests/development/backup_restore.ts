import assert from "node:assert/strict";
import {createRequire} from "node:module";
import {spawnSync} from "node:child_process";
import {randomUUID,createHash} from "node:crypto";
import {mkdirSync,writeFileSync,chmodSync,readFileSync,rmSync} from "node:fs";
import {Client} from "pg";
const require=createRequire(import.meta.url);
const {developmentEnvironment,databaseClient,assertDevelopmentIdentity,readTarget}=require("../../scripts/development/environment.cjs");
const started=Date.now(),suffix=String(started);
const source="sam_replit_restore_src_"+suffix,target="sam_replit_restore_dst_"+suffix,
  rollback="sam_replit_restore_rollback_"+suffix,role="sam_restore_reader_"+suffix;
const builds=["45294e263f497fb7a6e69e86264d0709756d5e16","068b1d142cd837b713a3f7d4d9ce13daca7aefc0"];
const ownOrg=randomUUID(),ownEntity=randomUUID(),foreignOrg=randomUUID(),foreignEntity=randomUUID();
const fixturePassword="synthetic-restore-fixture-not-a-production-secret";
const directory=".local/sam-dev/restore-fixture-"+suffix;
let stage="initial_identity";
function fixtureIdentifier(s:string){
  if(!/^sam_(replit_restore_(src|dst|rollback)|restore_reader)_[0-9]+$/.test(s))throw new Error("RESTORE_FIXTURE_IDENTIFIER");
  return s;
}
function urlFor(database:string,user?:string){
  fixtureIdentifier(database);const u=new URL(process.env.DATABASE_URL!);
  u.pathname="/"+database;u.searchParams.delete("options");
  if(user){fixtureIdentifier(user);u.username=user;u.password=fixturePassword;}
  return u;
}
function cliEnvironment(database:string){
  const u=urlFor(database);
  return {...developmentEnvironment(),PGHOST:u.hostname,PGPORT:u.port||"5432",
    PGUSER:decodeURIComponent(u.username),PGPASSWORD:decodeURIComponent(u.password),
    PGDATABASE:database,PGOPTIONS:"-c search_path=public,pg_catalog",PGSSLMODE:u.searchParams.get("sslmode")??"prefer"};
}
function run(command:string,args:string[],env:NodeJS.ProcessEnv){
  const result=spawnSync(command,args,{env,encoding:"utf8",timeout:60000});
  if(result.status!==0)throw new Error("RESTORE_FIXTURE_COMMAND_FAILED:"+command);
}
async function inventory(c:Client){
  const tables=(await c.query("SELECT tablename FROM pg_tables WHERE schemaname='public' ORDER BY tablename")).rows.map(r=>r.tablename as string);
  const rows:Record<string,{count:number;hash:string}>={};
  for(const table of tables){
    assert.match(table,/^[a-z_][a-z0-9_]*$/);
    const data=(await c.query(`SELECT to_jsonb(t)::text row FROM public.${table} t ORDER BY to_jsonb(t)::text`)).rows.map(r=>r.row);
    rows[table]={count:data.length,hash:createHash("sha256").update(JSON.stringify(data)).digest("hex")};
  }
  const policies=(await c.query(`SELECT tablename,policyname,permissive,roles,cmd,qual,with_check
    FROM pg_policies WHERE schemaname='public' ORDER BY tablename,policyname`)).rows;
  const rls=(await c.query(`SELECT c.relname,c.relrowsecurity,c.relforcerowsecurity
    FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='public'
    AND c.relkind='r' ORDER BY c.relname`)).rows;
  const sequences:Record<string,unknown>={};
  for(const row of (await c.query("SELECT sequencename,increment_by::text FROM pg_sequences WHERE schemaname='public' ORDER BY sequencename")).rows){
    assert.match(row.sequencename,/^[a-z_][a-z0-9_]*$/);
    sequences[row.sequencename]={...(await c.query(`SELECT last_value::text,is_called FROM public.${row.sequencename}`)).rows[0],incrementBy:row.increment_by};
  }
  return {rows,policies,rls,sequences};
}
async function main(){
  const admin=databaseClient(developmentEnvironment()),created:string[]=[];
  let a:Client|undefined,b:Client|undefined,c:Client|undefined,reader:Client|undefined,roleCreated=false;
  await admin.connect();let outcome:any;
  try{
    await assertDevelopmentIdentity(admin);
    const rights=(await admin.query("SELECT rolcreatedb,rolcreaterole FROM pg_roles WHERE rolname=current_user")).rows[0];
    if(!rights.rolcreatedb||!rights.rolcreaterole){
      outcome={status:"BLOCKED",code:"DEVELOPMENT_CREATE_DATABASE_OR_ROLE_NOT_AVAILABLE"};
      return;
    }
    for(const name of [source,target,rollback]){
      await admin.query(`CREATE DATABASE ${fixtureIdentifier(name)}`);created.push(name);
    }
    a=new Client({connectionString:urlFor(source).toString(),options:"-c search_path=public,pg_catalog"});
    b=new Client({connectionString:urlFor(target).toString(),options:"-c search_path=public,pg_catalog"});
    c=new Client({connectionString:urlFor(rollback).toString(),options:"-c search_path=public,pg_catalog"});
    await a.connect();await b.connect();await c.connect();
    for(const [connection,name] of [[a,source],[b,target],[c,rollback]] as const){
      stage="new_database_identity_and_schema";
      const identity=(await connection.query("SELECT current_database() name,current_schema() schema,system_identifier::text cluster FROM pg_control_system()")).rows[0];
      assert.equal(identity.name,name);assert.equal(identity.cluster,readTarget().clusterIdentifier);
      assert.equal(identity.schema,"public");
    }
    // Original migrations only on a newly created EMPTY fixture database.
    stage="fixture_migrations";
    run(process.execPath,["packages/db/src/migrate.js","--apply"],{
      ...developmentEnvironment(),DATABASE_URL:urlFor(source).toString(),PGOPTIONS:"-c search_path=public,pg_catalog"});
    stage="synthetic_seed";
    await a.query("INSERT INTO organizations(id,name) VALUES($1,'Synthetic restore own'),($2,'Synthetic restore other')",[ownOrg,foreignOrg]);
    await a.query("INSERT INTO legal_entities(id,org_id,name) VALUES($1,$2,'Synthetic restore own'),($3,$4,'Synthetic restore other')",[ownEntity,ownOrg,foreignEntity,foreignOrg]);
    const goals=(await a.query(`INSERT INTO goals(business_id,company_scope,domain,objective)
      VALUES('RESTORE-OWN',$1,'development_probe','Synthetic restore own'),
            ('RESTORE-OTHER',$2,'development_probe','Synthetic restore other') RETURNING id`,[ownEntity,foreignEntity])).rows;
    const goal=goals[0].id;
    await a.query(`INSERT INTO audit_log(actor,goal_id,action,after_ref,source,result)
      VALUES('synthetic-restore', $1,'RESTORE_FIXTURE','{"synthetic":true}','local-test','RECORDED')`,[goal]);
    const auditPolicy=(await a.query(`SELECT format('CREATE POLICY fixture_audit_read ON audit_log FOR SELECT TO PUBLIC
      USING (goal_id=%L::uuid AND current_setting(''app.current_org_id'',true)=%L)', $1::text,$2::text) sql`,[goal,ownOrg])).rows[0].sql;
    await a.query(auditPolicy);
    await a.query(`INSERT INTO model_calls(task,provider,model,tokens,cost,success,data_classification)
      VALUES('SYNTHETIC_RESTORE_RECEIPT','synthetic','synthetic-provider-receipt',120,0.000054,true,'PUBLIC')`);
    const receiptPolicy=(await a.query(`SELECT format('CREATE POLICY fixture_receipt_read ON model_calls FOR SELECT TO PUBLIC
      USING (task=''SYNTHETIC_RESTORE_RECEIPT'' AND current_setting(''app.current_org_id'',true)=%L)', $1::text) sql`,[ownOrg])).rows[0].sql;
    await a.query(receiptPolicy);
    const ids=[];
    for(let i=0;i<3;i++)ids.push((await a.query("SELECT next_business_id($1,$2) id",["restore_fixture",ownOrg])).rows[0].id);
    assert.equal(new Set(ids).size,3);
    await a.query("INSERT INTO work_queue(goal_id,capability_id,params) VALUES($1,'restore.quarantined','{}')",[goal]);
    await a.query("INSERT INTO outbox_events(aggregate_type,aggregate_id,event_type,payload) VALUES('goal',$1,'RESTORE_FIXTURE_ONLY','{}')",[goal]);
    // Permissive policies combine with OR. Restore quarantine must be restrictive.
    const policy=(await a.query(`SELECT format('CREATE POLICY fixture_restore_scope ON goals AS RESTRICTIVE FOR SELECT TO PUBLIC USING
      (company_scope=%L::uuid AND NULLIF(current_setting(''app.current_legal_entity_id'',true),'''')::uuid=%L::uuid
      AND NULLIF(current_setting(''app.current_org_id'',true),'''')::uuid=%L::uuid)', $1::text,$1::text,$2::text) sql`,
      [ownEntity,ownOrg])).rows[0].sql;
    await a.query(policy);
    // Advance every actual SAM SQL sequence before dumping, so restoration of
    // non-initial sequence state is tested rather than inferred from metadata.
    for(const row of (await a.query("SELECT sequencename FROM pg_sequences WHERE schemaname='public'")).rows){
      assert.match(row.sequencename,/^[a-z_][a-z0-9_]*$/);
      for(let i=0;i<2;i++)await a.query("SELECT nextval($1::regclass)",["public."+row.sequencename]);
    }
    const before=await inventory(a);
    stage="pg_dump_and_pg_restore";
    mkdirSync(directory,{recursive:true,mode:0o700});
    const dump=directory+"/synthetic-only.dump";
    run("pg_dump",["--format=custom","--file",dump,"--no-password"],cliEnvironment(source));chmodSync(dump,0o600);
    run("pg_restore",["--exit-on-error","--no-owner","--no-acl","--dbname",target,"--no-password",dump],cliEnvironment(target));
    run("pg_restore",["--exit-on-error","--no-owner","--no-acl","--dbname",rollback,"--no-password",dump],cliEnvironment(rollback));
    const after=await inventory(b);
    stage="inventory_rows";
    assert.deepEqual(after.rows,before.rows);
    stage="inventory_policies";
    assert.deepEqual(after.policies,before.policies);
    stage="inventory_rls_flags";
    assert.deepEqual(after.rls,before.rls);
    assert.deepEqual(after.sequences,before.sequences);
    assert.deepEqual(await inventory(c),before);
    stage="restored_sequence_next_values";
    for(const [name,unknown] of Object.entries(before.sequences)){
      const value=unknown as {last_value:string;is_called:boolean;incrementBy:string};
      const expected=BigInt(value.last_value)+(value.is_called?BigInt(value.incrementBy):0n);
      assert.equal((await b.query("SELECT nextval($1::regclass)::text n",["public."+name])).rows[0].n,expected.toString());
    }
    stage="restored_id_counters";
    const countersBefore=(await a.query("SELECT entity_type,org_scope_id,last_number::text FROM business_id_sequences ORDER BY entity_type")).rows;
    assert.deepEqual((await b.query("SELECT entity_type,org_scope_id,last_number::text FROM business_id_sequences ORDER BY entity_type")).rows,countersBefore);
    const next=(await b.query("SELECT next_business_id($1,$2) id",["restore_fixture",ownOrg])).rows[0].id;
    assert.equal(ids.includes(next),false);
    assert.equal(Number((await b.query("SELECT last_number FROM business_id_sequences WHERE entity_type=$1 AND org_scope_id=$2",["restore_fixture",ownOrg])).rows[0].last_number),4);
    // SAM uses UUID defaults and a transactional business-id counter table.
    const generated=(await b.query("INSERT INTO goals(business_id,company_scope,domain,objective) VALUES($1,$2,'development_probe','Synthetic restored ID probe') RETURNING id",[next,ownEntity])).rows[0].id;
    assert.ok(!goals.some(g=>g.id===generated));
    // A real non-bypass LOGIN, not an administrator hidden behind SET ROLE.
    stage="reader_role_setup";
    const roleSql=(await admin.query(`SELECT format('CREATE ROLE %I LOGIN NOINHERIT NOSUPERUSER NOCREATEDB NOCREATEROLE NOBYPASSRLS PASSWORD %L',$1::text,$2::text) sql`,[role,fixturePassword])).rows[0].sql;
    await admin.query(roleSql);roleCreated=true;
    for(const db of [b,c])await db.query(`REVOKE ALL ON ALL TABLES IN SCHEMA public FROM PUBLIC;
      REVOKE CREATE ON SCHEMA public FROM PUBLIC;
      GRANT USAGE ON SCHEMA public TO ${fixtureIdentifier(role)};
      GRANT SELECT ON goals,audit_log,model_calls TO ${fixtureIdentifier(role)}`);
    for(const name of [target,rollback]){
      await admin.query(`REVOKE CONNECT ON DATABASE ${fixtureIdentifier(name)} FROM PUBLIC`);
      await admin.query(`GRANT CONNECT ON DATABASE ${fixtureIdentifier(name)} TO ${fixtureIdentifier(role)}`);
    }
    await assert.rejects(()=>b!.query("UPDATE audit_log SET action='forbidden-privileged-probe'"),(e:any)=>e.code==="P0001");
    reader=new Client({connectionString:urlFor(target,role).toString(),options:"-c search_path=public,pg_catalog"});await reader.connect();
    const identity=(await reader.query(`SELECT current_user=session_user direct_login,
      (SELECT rolsuper OR rolbypassrls FROM pg_roles WHERE rolname=current_user) bypass,
      (SELECT pg_get_userbyid(relowner)=current_user FROM pg_class WHERE oid='goals'::regclass) owner`)).rows[0];
    stage="actual_reader_login";assert.equal(identity.direct_login,true);assert.equal(identity.bypass,false);assert.equal(identity.owner,false);
    stage="rls_missing_context";
    assert.equal((await reader.query("SELECT * FROM goals")).rowCount,0);
    await reader.query("SELECT set_config('app.current_org_id',$1,false),set_config('app.current_legal_entity_id',$2,false)",[ownOrg,ownEntity]);
    stage="rls_own_context";assert.equal((await reader.query("SELECT * FROM goals")).rowCount,2);
    assert.equal((await reader.query("SELECT * FROM goals WHERE company_scope=$1",[foreignEntity])).rowCount,0);
    await reader.query("SELECT set_config('app.current_org_id',$1,false),set_config('app.current_legal_entity_id',$2,false)",[foreignOrg,foreignEntity]);
    stage="rls_foreign_context";assert.equal((await reader.query("SELECT * FROM goals")).rowCount,0);
    stage="queue_outbox_quarantine";
    for(const sql of ["SELECT * FROM work_queue","UPDATE work_queue SET status='LEASED'","SELECT * FROM outbox_events","UPDATE outbox_events SET status='PUBLISHED'"]){
      await assert.rejects(()=>reader!.query(sql),(e:any)=>e.code==="42501");
    }
    for(const sql of ["CREATE TABLE forbidden_fixture(id int)","UPDATE audit_log SET action='forbidden'","DELETE FROM model_calls","INSERT INTO goals(business_id) VALUES('forbidden')"])
      await assert.rejects(()=>reader!.query(sql),(e:any)=>e.code==="42501");
    stage="real_archived_build_rollback";
    const buildRoots=[];
    for(const sha of builds){
      const root=directory+"/build-"+sha.slice(0,7);mkdirSync(root,{recursive:true});
      const archive=directory+"/"+sha+".tar";
      run("git",["archive","--format=tar","--output",archive,sha],developmentEnvironment());
      run("tar",["-xf",archive,"-C",root],developmentEnvironment());
      buildRoots.push(root);
    }
    const codeFiles=["packages/db/src/client.ts","apps/supervisor/src/incidents.ts","apps/kernel/src/verification.ts",
      "apps/kernel/src/leaseBudget.ts","apps/kernel/src/reconciliation.ts","apps/kernel/src/workerRuntime.ts",
      "apps/supervisor/src/telemetry.ts","scripts/release/contract.cjs"];
    const codeDigest=createHash("sha256").update(JSON.stringify(codeFiles.map(path=>[path,readFileSync(path,"utf8")]))).digest("hex");
    const versions=[...builds,"WORKTREE_CODE_DIGEST:"+codeDigest];
    buildRoots.push(process.cwd());
    const cycle=[];
    // Historical compatibility, then baseline -> current code -> baseline.
    for(const index of [0,1,2,1]){
      const buildUrl=urlFor(rollback,role);
      buildUrl.searchParams.set("options",`-c search_path=public,pg_catalog -c app.current_org_id=${ownOrg} -c app.current_legal_entity_id=${ownEntity}`);
      const p:ReturnType<typeof spawnSync>=spawnSync(process.execPath,["--import","tsx","tests/development/rollback_reader.cjs",buildRoots[index]],{
        env:{...developmentEnvironment(),DATABASE_URL:buildUrl.toString(),PGOPTIONS:"-c search_path=public,pg_catalog"},
        encoding:"utf8",timeout:15000});
      if(p.status!==0){console.error(String(p.stderr));throw new Error("ARCHIVED_BUILD_READ_FAILED");}
      const proof=JSON.parse(String(p.stdout).trim());
      console.log(JSON.stringify({test:"ARCHIVED_BUILD_READ",build:versions[index].slice(0,7),auditCount:proof.auditCount,receiptCount:proof.receiptCount,goalCount:proof.goalCount}));
      stage="archived_audit_visibility";assert.equal(proof.auditCount,1);
      stage="archived_receipt_visibility";assert.equal(proof.receiptCount,1);
      cycle.push({build:versions[index],...proof});
    }
    assert.equal(new Set(cycle.map(x=>x.auditHash)).size,1);
    assert.equal(new Set(cycle.map(x=>x.receiptHash)).size,1);
    assert.deepEqual(await inventory(c),before,"ROLLBACK_MUST_NOT_MUTATE_DATA");
    assert.equal((await b.query("SELECT count(*)::int n FROM executions")).rows[0].n,0);
    assert.equal((await b.query("SELECT count(*)::int n FROM outbox_events WHERE status='PENDING'")).rows[0].n,1);
    assert.equal((await b.query("SELECT count(*)::int n FROM work_queue WHERE status='QUEUED'")).rows[0].n,1);
    outcome={status:"PASS",classification:"REAL_PG_DUMP_RESTORE_SYNTHETIC_ONLY_NOT_PRODUCTION",
      checkedAt:new Date().toISOString(),sourceDatabase:source,restoreDatabase:target,
      tablesCompared:Object.keys(before.rows).length,dataHashesMatched:true,rlsMetadataMatched:true,
      actualNonOwnerNonBypassLogin:true,foreignAndMissingContextDenied:true,
      queueAndOutboxReadWriteDenied:true,pendingRowsPreservedWithoutExecution:true,
      restoredExecutionCount:0,externalCalls:0,elapsedMs:Date.now()-started,
      rollbackCycle:cycle,rollbackDataUnchanged:true,rollbackWorkersStarted:0,
      testedCodeDigest:codeDigest,baselineToCurrentToBaselineReadOnlyCycle:true,
      schemaCompatibleAcrossBuilds:true,nonEmptyAuditAndReceiptPreserved:true,
      aclDdlAndAuditReceiptWritesDenied:true,businessIdCounterRestoredAndAdvanced:true,uuidIdsUnique:true,
      sqlSequencesCompared:Object.keys(before.sequences).length,sqlSequenceStatesMatched:true,
      nonInitialSqlSequenceStatesSeeded:true,restoredNextSequenceValuesValidated:true,
      restoredAuditAppendOnlyTriggerEnforced:true,publicConnectRevokedOnRestoreClones:true,
      fixturePoliciesOnlyNotProductionRlsProof:true,rollbackSurface:"ARCHIVED_NATIVE_DATABASE_CLIENT_AND_INCIDENT_READERS_NOT_FULL_RELEASE_WORKERS",
      identityStrategy:"UUID_DEFAULTS_AND_TRANSACTIONAL_BUSINESS_ID_COUNTER",
      productionBackupRestore:"NOT_RUN",productionRpoRto:"NOT_ESTABLISHED"};
  }catch(e:any){
    outcome={status:"FAIL",stage,code:e.code??"ASSERTION",details:"withheld"};
    throw e;
  }finally{
    if(reader)await reader.end();if(a)await a.end();if(b)await b.end();if(c)await c.end();
    for(const name of [...created].reverse())await admin.query(`DROP DATABASE ${fixtureIdentifier(name)}`);
    if(roleCreated)await admin.query(`DROP ROLE ${fixtureIdentifier(role)}`);
    rmSync(directory,{recursive:true,force:true});
    await admin.end();
    if(outcome){
      outcome.fixtureDatabasesDropped=created.length;outcome.fixtureRoleDropped=roleCreated;
      writeFileSync(".local/sam-dev/backup-restore-evidence.json",JSON.stringify(outcome,null,2));
      console.log(JSON.stringify({test:"BACKUP_RESTORE",status:outcome.status,code:outcome.code,tables:outcome.tablesCompared}));
    }
  }
}
main().catch(e=>{console.error(JSON.stringify({test:"BACKUP_RESTORE",status:"FAIL",stage,code:e.code??"ASSERTION",details:"withheld"}));process.exitCode=1;});
