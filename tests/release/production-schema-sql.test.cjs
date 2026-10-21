"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs"),os=require("node:os"),path=require("node:path");
const {generate}=require("../../scripts/release/production-schema-sql.cjs");
const dir=fs.mkdtempSync(path.join(os.tmpdir(),"sam-mig-"));
try{
 for(let i=1;i<=10;i++)fs.writeFileSync(path.join(dir,String(i).padStart(5,"0")+"_fixture.sql"),"SELECT "+i+";");
 const a=generate({database:"neondb",dir});
 assert.equal(a.files.length,10);
 assert.match(a.sql,/current_database\(\) <> 'neondb'/);
 assert.match(a.sql,/SET LOCAL search_path=sam,pg_catalog/);
 assert.match(a.sql,/SAM_SCHEMA_ALREADY_PRESENT/);
 assert.match(a.sql,/RLS_COVERAGE_MISMATCH/);
 assert.match(a.sql,/DELETE FROM sam.verification_contracts/);
 assert.throws(()=>generate({database:"neondb';drop database x",dir}),/SAFE_EXPECTED_DATABASE_REQUIRED/);
 fs.writeFileSync(path.join(dir,"00001_fixture.sql"),"COMMIT;");
 assert.throws(()=>generate({database:"neondb",dir}),/UNSAFE_EMBEDDED_TRANSACTION_STATEMENT/);
 console.log("PASS: 8 offline assertions; not live production validation");
}finally{fs.rmSync(dir,{recursive:true,force:true});}
