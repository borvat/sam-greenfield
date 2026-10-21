"use strict";
const assert=require("node:assert/strict");
const path=require("node:path");
const {spawnSync}=require("node:child_process");
const {test}=require("node:test");
const root=path.resolve(__dirname,"../..");
function run(args,withUrl=true){
  return spawnSync(process.execPath,[
    "--require",path.join(__dirname,"fixtures/migration-pg-denied.cjs"),
    "packages/db/src/migrate.js",...args
  ],{cwd:root,encoding:"utf8",timeout:10000,
    env:withUrl?{DATABASE_URL:"postgresql://fixture_user:fixture_only@invalid.local/fixture"}:{}});
}
for(const args of [[],["--check-deterministic"],["--help"],["--apply=false"]]){
  test(`offline invocation ${JSON.stringify(args)} never constructs PG client`,()=>{
    const result=run(args);
    assert.equal(result.status,0);
    assert.match(result.stdout,/OFFLINE ONLY/);
    assert.match(result.stdout,/Total migrations: 10/);
    assert.doesNotMatch(result.stdout+result.stderr,/SYNTHETIC_SECRET_SENTINEL|fixture_only|invalid\.local|fixture_user|secret_query|APPLY 000/);
    assert.equal(result.stderr,"");
  });
}
test("explicit apply rejects synthetic transport without leaking raw provider errors",()=>{
  const result=run(["--apply"]);
  assert.equal(result.status,1);
  assert.match(result.stderr,/DATABASE MIGRATION FAIL 28P01/);
  assert.doesNotMatch(result.stdout+result.stderr,/SYNTHETIC_SECRET_SENTINEL|fixture_only|invalid\.local|fixture_user|secret_query/);
});
test("missing credentials are rejected without connection or stack output",()=>{
  const result=run(["--apply"],false);
  assert.equal(result.status,1);
  assert.equal(result.stderr.trim(),"DATABASE MIGRATION FAIL MIGRATION_REJECTED");
  assert.doesNotMatch(result.stdout+result.stderr,/SYNTHETIC_SECRET_SENTINEL| at /);
});
