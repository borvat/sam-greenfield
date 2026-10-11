#!/usr/bin/env node
"use strict";
// Generates a reviewed SQL DRAFT offline; never connects to a database.
const fs=require("node:fs"),path=require("node:path"),crypto=require("node:crypto");
function generate({database,dir=path.resolve(__dirname,"../../packages/db/migrations")}){
 if(typeof database!=="string"||!/^[A-Za-z_][A-Za-z_0-9]{0,62}$/.test(database))throw Error("SAFE_EXPECTED_DATABASE_REQUIRED");
 const names=fs.readdirSync(dir).filter(n=>/^\d{5}_[a-z0-9_]+\.sql$/.test(n)).sort();
 if(names.length!==10)throw Error("EXPECTED_TEN_REVIEWED_MIGRATIONS");
 const entries=names.map(name=>({name,sql:fs.readFileSync(path.join(dir,name),"utf8")}));
 if(entries.some(e=>!e.sql.trim()||/\b(?:BEGIN|COMMIT|ROLLBACK)\s*;/i.test(e.sql)))throw Error("UNSAFE_EMBEDDED_TRANSACTION_STATEMENT");
 const fingerprint=crypto.createHash("sha256").update(entries.map(e=>e.name+"\n"+e.sql).join("\n")).digest("hex");
 const sql=[
 "-- OFFLINE DRAFT ONLY. NOT APPROVED FOR PRODUCTION EXECUTION.",
 "-- Requires verified backup, explicit owner approval, privilege review and independent SQL review.",
 "-- Reviewed migration bundle sha256: "+fingerprint,
 "BEGIN;",
 "SET LOCAL lock_timeout='3s';",
 "SET LOCAL statement_timeout='60s';",
 "DO $guard$ BEGIN",
 "  IF current_database() <> '"+database+"' THEN RAISE EXCEPTION 'WRONG_DATABASE'; END IF;",
 "  IF to_regnamespace('sam') IS NOT NULL THEN RAISE EXCEPTION 'SAM_SCHEMA_ALREADY_PRESENT'; END IF;",
 "  IF NOT EXISTS(SELECT 1 FROM pg_extension WHERE extname='pgcrypto') THEN RAISE EXCEPTION 'PGCRYPTO_REQUIRED'; END IF;",
 "END $guard$;",
 "CREATE SCHEMA sam;",
 "REVOKE ALL ON SCHEMA sam FROM PUBLIC;",
 "SET LOCAL search_path=sam,pg_catalog;",
 ...entries.flatMap(e=>["-- ORIGINAL MIGRATION: "+e.name,e.sql]),
 "-- Remove static verification-contract seeds; source development schema is empty.",
 "DELETE FROM sam.verification_contracts;",
 "DO $verify$ DECLARE n integer; BEGIN",
 " SELECT count(*) INTO n FROM pg_class c JOIN pg_namespace ns ON ns.oid=c.relnamespace WHERE ns.nspname='sam' AND c.relkind='r';",
 " IF n<>22 THEN RAISE EXCEPTION 'TABLE_COUNT_MISMATCH %',n; END IF;",
 " SELECT count(*) INTO n FROM pg_class c JOIN pg_namespace ns ON ns.oid=c.relnamespace WHERE ns.nspname='sam' AND c.relkind='r' AND c.relrowsecurity;",
 " IF n<>22 THEN RAISE EXCEPTION 'RLS_COVERAGE_MISMATCH %',n; END IF;",
 "END $verify$;",
 "COMMIT;"
 ].join("\n");
 return {sql,fingerprint,files:names};
}
if(require.main===module){try{
 const arg=process.argv.find(x=>x.startsWith("--expected-database="));
 if(!process.argv.includes("--emit-reviewed-draft")||!arg)throw Error("USAGE: node scripts/release/production-schema-sql.cjs --emit-reviewed-draft --expected-database=neondb");
 process.stdout.write(generate({database:arg.slice("--expected-database=".length)}).sql+"\n");
}catch(e){console.error("OFFLINE_SQL_GENERATOR_REJECTED:",e.message);process.exitCode=1;}}
module.exports={generate};
