"use strict";
const assert = require("node:assert/strict");
const { test } = require("node:test");
const { inspect, profileManifests, releaseEnabled } = require("../../scripts/evaluation/preflight.cjs");
const profiles = profileManifests();
function fixture(options = {}) {
  const calls = [];
  return { calls, async query(sql, params) {
    calls.push({sql,params});
    assert.match(sql, /^(BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY|ROLLBACK|SELECT )/);
    if (sql.startsWith("BEGIN") || sql === "ROLLBACK") return { rows: [] };
    if (sql.includes("FROM pg_roles")) return { rows: [{schema: options.schema ?? "public",read_only:"on",can_create_schema:false,elevated_role:false}] };
    if (sql.includes("FROM pg_class")) return { rows: options.catalog ?? [] };
    if (options.throwReceipt) throw Error("postgres://PRIVATE_SECRET_MUST_NOT_ESCAPE");
    const p = profiles.find(p => sql.includes(`"${p.receipt}"`));
    assert(p);
    return { rows: options.mismatch ? [] : [...p.expected] };
  }};
}
test("missing profiles are classified without querying absent receipts or changing state", async () => {
  const c=fixture(),r=await inspect(c);
  assert.equal(r.status,"PREFLIGHT_ONLY");assert.equal(r.liveReleaseEnabled,false);
  assert(r.profiles.every(p => p.migration === "MISSING" && p.missingRelations.length>0));
  assert.equal(c.calls.length,4);assert.equal(c.calls.at(-1).sql,"ROLLBACK");
  assert.deepEqual(r.execution,{migrations:false,grants:false,activation:false,modelCalls:0});
});
test("matching receipt hashes do not imply permission or live readiness",async()=>{
  const catalog=profiles.flatMap(p=>[p.receipt,...p.tables].map(name=>({name,can_read:true,rls:true,forced_rls:true})));
  const c=fixture({catalog}),r=await inspect(c);
  assert(r.profiles.every(p=>p.migration==="MATCH"));assert.equal(r.status,"PREFLIGHT_ONLY");
  assert.equal(r.remainingChecks.length,4);assert.equal(c.calls.at(-1).sql,"ROLLBACK");
});
test("unreadable and mismatched receipts stay distinct; unfenced tables are reported",async()=>{
  const catalog=profiles.flatMap(p=>[p.receipt,...p.tables].map(name=>({name,can_read:p.name!=="specialist",rls:false,forced_rls:false})));
  const c=fixture({catalog,mismatch:true}),r=await inspect(c);
  assert.equal(r.profiles[0].migration,"UNREADABLE");assert.equal(r.profiles[1].migration,"MISMATCH");
  assert.equal(r.profiles[0].unreadableRelations.length,4);
  assert.equal(r.profiles[1].unfencedRelations.length,3);
  assert(!c.calls.some(x=>x.sql.includes('FROM "public"."sam_specialist_migrations"')));
});
test("invalid schema is rejected with rollback before qualified queries",async()=>{
  const c=fixture({schema:'public"; DROP SCHEMA public; --'});
  await assert.rejects(inspect(c),/READ_ONLY_CONTEXT_REQUIRED/);
  assert.equal(c.calls.at(-1).sql,"ROLLBACK");assert.equal(c.calls.length,3);
});
test("receipt read failure still rolls back; successful output contains no receipt values",async()=>{
  const catalog=profiles.map(p=>({name:p.receipt,can_read:true}));
  const c=fixture({catalog,throwReceipt:true});await assert.rejects(inspect(c));
  assert.equal(c.calls.at(-1).sql,"ROLLBACK");
  const r=await inspect(fixture({catalog}));
  assert(!JSON.stringify(r).includes(profiles[0].expected[0].sha256));
  assert(!JSON.stringify(r).includes("DATABASE_URL"));
});
test("release check reads the disabled interlock without loading runtime code",()=>{
  assert.equal(releaseEnabled(),false);
});
