"use strict";
// Development schema source ONLY. No connections, credentials, runtime hook or
// production migration command. Replit Publish owns production schema changes.
const fs=require("node:fs");
const path=require("node:path");
const crypto=require("node:crypto");
const directory=path.resolve(__dirname,"../../packages/db/migrations");
function prepare(){
  const files=fs.readdirSync(directory).filter(x=>/^\d{5}_[a-z0-9_]+\.sql$/.test(x)).sort();
  if(files.length!==12||files.at(-2)!=="00012_core_reliability.sql"||files.at(-1)!=="00013_operational_tenant_policies.sql")throw new Error("MANAGED_SOURCE_MIGRATION_REVIEW_REQUIRED");
  const migrations=files.map(filename=>{
    const sql=fs.readFileSync(path.join(directory,filename),"utf8");
    return {filename,sql,sha256:crypto.createHash("sha256").update(sql).digest("hex")};
  });
  const sql=`BEGIN;
SET LOCAL lock_timeout='3s';
SET LOCAL statement_timeout='30s';
DO $source_guard$
BEGIN
 IF current_database()<>'heliumdb' THEN RAISE EXCEPTION 'DEVELOPMENT_DATABASE_REQUIRED'; END IF;
 IF to_regnamespace('sam') IS NOT NULL THEN RAISE EXCEPTION 'MANAGED_SOURCE_ALREADY_EXISTS'; END IF;
 IF NOT EXISTS(SELECT 1 FROM pg_extension WHERE extname='pgcrypto') THEN
   RAISE EXCEPTION 'PREEXISTING_PGCRYPTO_REQUIRED';
 END IF;
END $source_guard$;
CREATE SCHEMA sam;
REVOKE ALL ON SCHEMA sam FROM PUBLIC;
SET LOCAL search_path=sam,pg_catalog;
${migrations.map(m=>m.sql).join("\n")}
-- Migration 00006 supplies static verification catalog rows. Managed Publish
-- synchronizes schema, not these rows; keep this new schema source data-free.
DELETE FROM verification_contracts;
DO $source_check$
DECLARE t record; n bigint;
BEGIN
 FOR t IN SELECT relname FROM pg_class WHERE relnamespace=to_regnamespace('sam') AND relkind='r' LOOP
   EXECUTE format('SELECT count(*) FROM sam.%I',t.relname) INTO n;
   IF n<>0 THEN RAISE EXCEPTION 'MANAGED_SOURCE_MUST_BE_EMPTY'; END IF;
 END LOOP;
 IF (SELECT count(*) FROM pg_class WHERE relnamespace=to_regnamespace('sam')
   AND relname IN ('goals','plans','work_queue','executions','verifications','world_facts')
   AND relrowsecurity)<>6 THEN RAISE EXCEPTION 'MANAGED_SOURCE_RLS_REQUIRED'; END IF;
END $source_check$;
SELECT 'EMPTY_DEVELOPMENT_SCHEMA_SOURCE_READY' AS status,
 count(*) FILTER(WHERE relkind='r') AS tables
 FROM pg_class WHERE relnamespace=to_regnamespace('sam');
COMMIT;`;
  return {sql,migrations:migrations.map(({filename,sha256})=>({filename,sha256}))};
}
module.exports={prepare};
if(require.main===module){
  const result=prepare();
  if(process.argv.includes("--emit-development-sql"))process.stdout.write(result.sql);
  else console.log(JSON.stringify({status:"OFFLINE_DEVELOPMENT_SOURCE_ONLY",
    productionWrites:0,connections:0,credentialsRead:false,migrations:result.migrations},null,2));
}
