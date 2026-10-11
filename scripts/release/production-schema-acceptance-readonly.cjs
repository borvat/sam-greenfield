#!/usr/bin/env node
"use strict";
// Read-only PostgreSQL acceptance inventory. No DDL/DML, no secret printing.
// Requires read-only credentials and explicit target label.
const {Client}=require("pg");
async function inspect(client){
 await client.query("BEGIN READ ONLY");
 try {
  const identity=(await client.query("SELECT current_database() AS db, current_user AS principal, session_user AS session_principal")).rows[0];
  const rows=await client.query(`SELECT c.relname AS name,c.relrowsecurity AS rls,c.relforcerowsecurity AS force_rls,
      (SELECT count(*)::int FROM pg_catalog.pg_policy p WHERE p.polrelid=c.oid) AS policy_count
      FROM pg_catalog.pg_class c JOIN pg_catalog.pg_namespace n ON n.oid=c.relnamespace
      WHERE n.nspname='sam' AND c.relkind IN ('r','p') ORDER BY c.relname`);
  const schema=await client.query("SELECT EXISTS(SELECT 1 FROM pg_catalog.pg_namespace WHERE nspname='sam') AS exists");
  const tables=rows.rows;
  return {identity,schemaExists:schema.rows[0].exists,tableCount:tables.length,
   allRlsEnabled:tables.length===22&&tables.every(t=>t.rls===true),
   tablesWithoutPolicies:tables.filter(t=>Number(t.policy_count)===0).map(t=>t.name),
   tablesWithForceRls:tables.filter(t=>t.force_rls).map(t=>t.name),
   status:!schema.rows[0].exists?"SCHEMA_ABSENT":tables.length!==22?"TABLE_COUNT_MISMATCH":tables.some(t=>!t.rls)?"RLS_MISSING":"RLS_FLAGS_ONLY_VERIFIED",
   warning:"RLS-enabled flags and policy counts are not proof of tenant isolation, safe grants or application functionality."};
 } finally {await client.query("ROLLBACK");}
}
async function main(){
 const target=process.env.SAM_SCHEMA_DIAG_TARGET;
 if(!["development","production"].includes(target))throw Error("EXPLICIT_TARGET_REQUIRED");
 const url=process.env.SAM_SCHEMA_READONLY_DATABASE_URL;
 if(!url)throw Error("READONLY_DATABASE_URL_REQUIRED");
 const client=new Client({connectionString:url,connectionTimeoutMillis:8000,query_timeout:8000});
 await client.connect();
 try{const out=await inspect(client);console.log(JSON.stringify({target,...out},null,2));
 if(out.status!=="RLS_FLAGS_ONLY_VERIFIED")process.exitCode=2;}
 finally{await client.end();}
}
if(require.main===module)main().catch(e=>{console.error("READONLY_SCHEMA_ACCEPTANCE_FAILED",e.code||"ERROR");process.exitCode=1;});
module.exports={inspect};
