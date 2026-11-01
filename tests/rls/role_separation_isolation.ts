// Real-PostgreSQL proof that row-level security is ENFORCED for the production
// application identities (migration 00011 + deploy/production/provision-roles.sql).
// Uses real LOGIN roles (no superuser, no owner, NOBYPASSRLS), never SET ROLE.
// Needs: DATABASE_URL = admin/owner login of a migrated database, and `psql` on PATH.
import assert from "node:assert/strict";
import {spawnSync} from "node:child_process";
import {randomBytes,randomUUID} from "node:crypto";
import {resolve} from "node:path";
import {Client} from "pg";
import {assertReleaseDatabaseSafety} from "../../packages/db/src/releaseSafety";
import {assertProductionDatabaseRole,assertTenantContextConsistent} from "../../packages/db/src/productionRoleGuard";

const adminUrl:string=process.env.DATABASE_URL??"";
if(!adminUrl)throw new Error("DATABASE_URL (admin login) is required");
const base=new URL(adminUrl);
const pw={worker:randomBytes(16).toString("hex"),mcp:randomBytes(16).toString("hex"),cc:randomBytes(16).toString("hex")};

function provision(){
  const r=spawnSync("psql",[adminUrl,"-X","-q","-v","ON_ERROR_STOP=1","-f",resolve("deploy/production/provision-roles.sql")],{
    encoding:"utf8",env:{...process.env,SAM_WORKER_DB_PASSWORD:pw.worker,SAM_MCP_DB_PASSWORD:pw.mcp,SAM_COMMAND_CENTER_DB_PASSWORD:pw.cc}});
  assert.equal(r.status,0,"provision-roles.sql failed: "+r.stderr);
  const dup=spawnSync("psql",[adminUrl,"-X","-q","-v","ON_ERROR_STOP=1","-f",resolve("deploy/production/provision-roles.sql")],{
    encoding:"utf8",env:{...process.env,SAM_WORKER_DB_PASSWORD:pw.worker,SAM_MCP_DB_PASSWORD:pw.mcp,SAM_COMMAND_CENTER_DB_PASSWORD:pw.cc}});
  assert.equal(dup.status,0,"provisioning must be idempotent: "+dup.stderr);
  assert.equal(dup.stderr.trim(),"","idempotent re-run must be quiet");
  const same=spawnSync("psql",[adminUrl,"-X","-q","-f",resolve("deploy/production/provision-roles.sql")],{
    encoding:"utf8",env:{...process.env,SAM_WORKER_DB_PASSWORD:pw.worker,SAM_MCP_DB_PASSWORD:pw.worker,SAM_COMMAND_CENTER_DB_PASSWORD:pw.cc}});
  assert.notEqual(same.status,0,"identical passwords must be refused");
  const empty=spawnSync("psql",[adminUrl,"-X","-q","-f",resolve("deploy/production/provision-roles.sql")],{
    encoding:"utf8",env:{...process.env,SAM_WORKER_DB_PASSWORD:"",SAM_MCP_DB_PASSWORD:pw.mcp,SAM_COMMAND_CENTER_DB_PASSWORD:pw.cc}});
  assert.notEqual(empty.status,0,"empty password must be refused");
}

async function login(user:string,password:string){
  const c=new Client({host:base.hostname,port:Number(base.port||5432),database:base.pathname.slice(1),user,password});
  await c.connect();return c;
}
type Ctx={org?:string;entity?:string};
async function inTx<T>(c:Client,ctx:Ctx,fn:()=>Promise<T>):Promise<T>{
  await c.query("BEGIN");
  try{
    await c.query("SELECT set_config('app.current_org_id',$1,true),set_config('app.current_legal_entity_id',$2,true)",[ctx.org??"",ctx.entity??""]);
    return await fn();
  }finally{await c.query("ROLLBACK")}
}
async function denied(p:Promise<unknown>,re:RegExp=/permission denied|row-level security/){
  await assert.rejects(p,(e:any)=>e?.code==="42501"&&re.test(String(e.message)),"expected a 42501 denial");
}
const ids=async(c:Client,sql:string,v:unknown[]=[])=>(await c.query(sql,v)).rows.map(r=>r.id as string).sort();

async function main(){
  const admin=new Client({connectionString:adminUrl});await admin.connect();
  const tag="RLSROLE_"+randomBytes(4).toString("hex");
  const orgA=randomUUID(),orgB=randomUUID(),a1=randomUUID(),a2=randomUUID(),b1=randomUUID();
  const g={a1:randomUUID(),a2:randomUUID(),b1:randomUUID()};
  try{
    provision();
    await admin.query("INSERT INTO organizations(id,name) VALUES ($1,$3),($2,$4)",[orgA,orgB,tag+"A",tag+"B"]);
    await admin.query("INSERT INTO legal_entities(id,org_id,name) VALUES ($1,$4,$5),($2,$4,$6),($3,$7,$8)",[a1,a2,b1,orgA,tag+"A1",tag+"A2",orgB,tag+"B1"]);
    for(const [k,e] of [["a1",a1],["a2",a2],["b1",b1]] as const)
      await admin.query("INSERT INTO goals(id,business_id,company_scope,objective) VALUES ($1,$2,$3,$4)",[g[k],tag+k,e,tag+" "+k]);
    await admin.query("INSERT INTO users(legal_entity_id,email,role) VALUES ($1,$4,'owner'),($2,$5,'owner'),($3,$6,'owner')",[a1,a2,b1,tag+"a1@x.test",tag+"a2@x.test",tag+"b1@x.test"]);

    const cc=await login("sam_command_center",pw.cc);
    const worker=await login("sam_worker",pw.worker);
    const mcp=await login("sam_mcp",pw.mcp);
    try{
      const mine=`SELECT id FROM goals WHERE objective LIKE '${tag}%'`;
      // --- tenant role: entity context sees exactly its entity
      assert.deepEqual(await inTx(cc,{org:orgA,entity:a1},()=>ids(cc,mine)),[g.a1]);
      assert.deepEqual(await inTx(cc,{org:orgB,entity:b1},()=>ids(cc,mine)),[g.b1]);
      // --- org-wide context (entity unset) sees the whole org, never another org
      assert.deepEqual(await inTx(cc,{org:orgA},()=>ids(cc,mine)),[g.a1,g.a2].sort());
      // --- fail closed: no context, or an entity from another org, sees nothing
      assert.deepEqual(await inTx(cc,{},()=>ids(cc,mine)),[]);
      // Entity-only scoping is the baseline policy (00008/00009): an org/entity pairing from
      // different orgs is caught by the startup consistency check, not by row policy.
      await inTx(cc,{org:orgA,entity:a1},()=>assertTenantContextConsistent(cc,a1));
      await inTx(cc,{org:orgA},()=>assertTenantContextConsistent(cc,a2));
      await inTx(cc,{org:orgA,entity:b1},()=>assert.rejects(()=>assertTenantContextConsistent(cc,b1),/RELEASE_TENANT_CONTEXT_MISMATCH/));
      await inTx(cc,{},()=>assert.rejects(()=>assertTenantContextConsistent(cc,a1),/RELEASE_TENANT_CONTEXT_MISMATCH/));
      assert.deepEqual(await inTx(cc,{org:randomUUID()},()=>ids(cc,mine)),[]);
      // --- other tenant tables follow the same predicate
      // legal_entities is org-scoped by the baseline policy (sibling entities of the same org are listable; other orgs never).
      assert.deepEqual(await inTx(cc,{org:orgA,entity:a1},()=>ids(cc,`SELECT id FROM legal_entities WHERE name LIKE '${tag}%'`)),[a1,a2].sort());
      const orgRows=await inTx(cc,{org:orgA,entity:a1},()=>cc.query(`SELECT name FROM organizations WHERE name LIKE '${tag}%'`));
      assert.deepEqual(orgRows.rows.map(r=>r.name),[tag+"A"]);
      const userRows=await inTx(cc,{org:orgA,entity:a1},()=>cc.query(`SELECT email FROM users WHERE email LIKE '${tag}%'`));
      assert.deepEqual(userRows.rows.map(r=>r.email),[tag+"a1@x.test"]);
      assert.equal((await inTx(cc,{},()=>cc.query(`SELECT 1 FROM users WHERE email LIKE '${tag}%'`))).rowCount,0);
      // --- tenant writes: own entity ok, cross-tenant denied, foreign rows untouchable
      await inTx(cc,{org:orgA,entity:a1},async()=>{
        const ok=await cc.query("INSERT INTO goals(business_id,company_scope,objective) VALUES ($1,$2,$3) RETURNING id",[tag+"new",a1,tag+" new"]);
        assert.equal(ok.rowCount,1);
      });
      await inTx(cc,{org:orgA,entity:a1},async()=>{
        await denied(cc.query("INSERT INTO goals(business_id,company_scope,objective) VALUES ($1,$2,$3)",[tag+"x",b1,tag+" x"]),/row-level security/);
      });
      await inTx(cc,{org:orgA,entity:a1},async()=>{
        const r=await cc.query("UPDATE goals SET priority=9 WHERE id=$1",[g.b1]);
        assert.equal(r.rowCount,0,"cross-tenant UPDATE must touch nothing");
      });
      // --- tenant role has no destructive or system-table access
      await inTx(cc,{org:orgA,entity:a1},async()=>{await denied(cc.query("DELETE FROM goals WHERE id=$1",[g.a1]));});
      await inTx(cc,{org:orgA,entity:a1},async()=>{await denied(cc.query("SELECT 1 FROM world_facts"));});
      await inTx(cc,{org:orgA,entity:a1},async()=>{await denied(cc.query("SELECT 1 FROM model_calls"));});
      await inTx(cc,{org:orgA,entity:a1},async()=>{await denied(cc.query("INSERT INTO work_queue(goal_id) VALUES ($1)",[g.a1]));});
      await denied(cc.query("TRUNCATE goals"));
      await denied(cc.query("UPDATE audit_log SET result='x'"));

      // --- system role: needs no tenant context, but is bounded
      assert.deepEqual(await inTx(worker,{},()=>ids(worker,mine)),[g.a1,g.a2,g.b1].sort());
      await inTx(worker,{},async()=>{
        const r=await worker.query("UPDATE goals SET priority=3 WHERE id=ANY($1::uuid[])",[[g.a1,g.b1]]);
        assert.equal(r.rowCount,2);
      });
      await inTx(worker,{},async()=>{await denied(worker.query("DELETE FROM goals WHERE id=$1",[g.a1]));});
      await denied(worker.query("TRUNCATE goals"));
      await denied(worker.query("SELECT 1 FROM users"));
      await denied(worker.query("SELECT 1 FROM organizations"));
      await denied(worker.query("SELECT 1 FROM financial_documents"));
      await denied(worker.query("UPDATE audit_log SET result='x'"));
      await denied(worker.query("DELETE FROM audit_log"));
      await denied(worker.query("UPDATE executions SET status='x'"));
      await denied(worker.query("UPDATE event_fabric_events SET payload='{}'::jsonb"));
      await denied(worker.query("UPDATE legal_entities SET status='INACTIVE'"));
      await denied(worker.query("CREATE TABLE rls_escape(x int)"));
      // row locks on executions/event_fabric_events must work (kernel uses them)
      await inTx(worker,{},async()=>{await worker.query("SELECT id FROM executions LIMIT 1 FOR UPDATE");});
      await inTx(worker,{},async()=>{await worker.query("SELECT id FROM event_fabric_events LIMIT 1 FOR UPDATE SKIP LOCKED");});

      // --- bridge role: union of both memberships, still no destructive rights
      assert.deepEqual(await inTx(mcp,{},()=>ids(mcp,mine)),await ids(admin,mine));
      await inTx(mcp,{},async()=>{await denied(mcp.query("DELETE FROM goals WHERE id=$1",[g.a1]));});
      await denied(mcp.query("SELECT 1 FROM organizations"));

      // --- startup guard: the three production logins pass, owner/admin does not
      for(const c of [cc,worker,mcp])await assertReleaseDatabaseSafety(c);
      await assert.rejects(()=>assertReleaseDatabaseSafety(admin),/RELEASE_/);
      const guarded=await assertProductionDatabaseRole({NODE_ENV:"test"});
      assert.equal(guarded,undefined,"guard is a no-op outside production");
      await assert.rejects(()=>assertProductionDatabaseRole({NODE_ENV:"production"}),/RELEASE_/);
    }finally{await Promise.allSettled([cc.end(),worker.end(),mcp.end()]);}
    console.log("PASS rls_role_separation_isolation");
  }finally{
    await admin.query("DELETE FROM goals WHERE objective LIKE $1",[tag+"%"]).catch(()=>{});
    await admin.query("DELETE FROM users WHERE email LIKE $1",[tag+"%"]).catch(()=>{});
    await admin.query("DELETE FROM legal_entities WHERE name LIKE $1",[tag+"%"]).catch(()=>{});
    await admin.query("DELETE FROM organizations WHERE name LIKE $1",[tag+"%"]).catch(()=>{});
    await admin.end();
  }
}
main().then(()=>process.exit(0),e=>{console.error(e);process.exit(1)});
