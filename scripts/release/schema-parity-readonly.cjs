#!/usr/bin/env node
"use strict";
// Read-only, non-secret PostgreSQL schema parity inventory.
// Usage: SAM_SCHEMA_DIAG_TARGET=development|production DATABASE_URL=<secure URL> node scripts/release/schema-parity-readonly.cjs
// Never performs migrations, grants, DDL, DML, or database creation.
const {Client}=require("pg");
async function main(){
  const target=process.env.SAM_SCHEMA_DIAG_TARGET;
  if(!["development","production"].includes(target))throw new Error("TARGET_REQUIRED");
  const url=target==="production"?(process.env.SAM_RELEASE_DATABASE_URL||process.env.DATABASE_URL):process.env.DATABASE_URL;
  if(!url)throw new Error("DATABASE_URL_REQUIRED");
  const client=new Client({connectionString:url,connectionTimeoutMillis:8000,query_timeout:8000});
  await client.connect();
  try{
    await client.query("BEGIN READ ONLY");
    await client.query("SET LOCAL statement_timeout='6s'");
    const identity=await client.query(`SELECT current_database() AS db,
      current_user AS principal, session_user AS session_principal,
      current_setting('search_path') AS search_path,
      current_setting('server_version') AS pg_version`);
    const schema=await client.query(`SELECT n.oid, n.nspname,
      has_schema_privilege(current_user,n.oid,'USAGE') AS can_use
      FROM pg_catalog.pg_namespace n WHERE n.nspname='sam'`);
    const tables=await client.query(`SELECT c.relname AS name,
      c.relkind AS kind,c.relrowsecurity AS rls,c.relforcerowsecurity AS force_rls
      FROM pg_catalog.pg_class c JOIN pg_catalog.pg_namespace n ON n.oid=c.relnamespace
      WHERE n.nspname='sam' AND c.relkind IN ('r','p')
      ORDER BY c.relname`);
    const expectedCore=["organizations","legal_entities","goals","plans","work_queue","executions","verifications","world_facts"];
    const found=new Set(tables.rows.map(x=>x.name));
    const payload={target,identity:identity.rows[0],schemaExists:schema.rowCount===1,
      schemaUsage:schema.rows[0]?.can_use??false,tableCount:tables.rowCount,
      missingCore:expectedCore.filter(x=>!found.has(x)),
      tables:tables.rows};
    console.log(JSON.stringify(payload,null,2));
    await client.query("ROLLBACK");
  }finally{await client.end();}
}
main().catch(err=>{console.error("SCHEMA_PARITY_READ_FAILED",err.code||"ERROR");process.exitCode=1;});
