// Server-side tenant binding (migration 00015): a bound tenant login cannot widen its scope
// with SET app.current_*; unbound logins keep the settings behaviour; the guard refuses them.
// Needs: DATABASE_URL = admin login of a migrated database, and `psql` on PATH.
import assert from "node:assert/strict";
import {spawnSync} from "node:child_process";
import {randomBytes,randomUUID} from "node:crypto";
import {resolve} from "node:path";
import {Client,Pool} from "pg";
import {assertSamRoleIsolation} from "../../packages/db/src/productionRoleGuard";

const adminUrl:string=process.env.DATABASE_URL??"";
if(!adminUrl)throw new Error("DATABASE_URL (admin login) is required");
const base=new URL(adminUrl);
const pw={worker:randomBytes(16).toString("hex"),mcp:randomBytes(16).toString("hex"),cc:randomBytes(16).toString("hex")};
const conn=(user:string,password:string,options?:string)=>({host:base.hostname,port:Number(base.port||5432),database:base.pathname.slice(1),user,password,options});

function provision(extra:Record<string,string>){
  const r=spawnSync("psql",[adminUrl,"-X","-q","-v","ON_ERROR_STOP=1","-f",resolve("deploy/production/provision-roles.sql")],{
    encoding:"utf8",env:{...process.env,SAM_WORKER_DB_PASSWORD:pw.worker,SAM_MCP_DB_PASSWORD:pw.mcp,SAM_COMMAND_CENTER_DB_PASSWORD:pw.cc,
      SAM_ORG_ID:"",SAM_COMMAND_CENTER_LEGAL_ENTITY_ID:"",...extra}});
  assert.equal(r.status,0,r.stderr);
}

async function main(){
  const admin=new Client({connectionString:adminUrl});await admin.connect();
  const tag="BIND_"+randomBytes(4).toString("hex");
  const orgA=randomUUID(),orgB=randomUUID(),eA=randomUUID(),eA2=randomUUID(),eB=randomUUID();
  await admin.query("INSERT INTO organizations(id,name) VALUES ($1,$2),($3,$4)",[orgA,tag+"A",orgB,tag+"B"]);
  await admin.query("INSERT INTO legal_entities(id,org_id,name) VALUES ($1,$2,$3),($4,$2,$5),($6,$7,$8)",[eA,orgA,tag+"a1",eA2,tag+"a2",eB,orgB,tag+"b"]);
  for(const [e,t] of [[eA,"a1"],[eA2,"a2"],[eB,"b"]] as const)
    await admin.query("INSERT INTO goals(business_id,company_scope,objective) VALUES ($1,$2,$3)",[tag+t,e,tag+t]);

  // unbound: settings still choose the scope; guard refuses the tenant login
  provision({});
  const spoofable=new Pool(conn("sam_command_center",pw.cc,`-c app.current_org_id=${orgA} -c app.current_legal_entity_id=${eA}`));
  try{
    assert.equal((await spoofable.query("SELECT sam_session_is_bound() b")).rows[0].b,false);
    await assert.rejects(assertSamRoleIsolation(spoofable as any),/RELEASE_TENANT_BINDING_MISSING/);
    const c=await spoofable.connect();
    try{await c.query("SELECT set_config('app.current_org_id',$1,false),set_config('app.current_legal_entity_id',$2,false)",[orgB,eB]);
      assert.equal((await c.query("SELECT count(*)::int n FROM goals WHERE objective LIKE $1",[tag+"%"])).rows[0].n,1);}finally{c.release();}
  }finally{await spoofable.end();}

  // bound to (orgA, eA): the session cannot escape it
  provision({SAM_ORG_ID:orgA,SAM_COMMAND_CENTER_LEGAL_ENTITY_ID:eA});
  const bound=new Pool(conn("sam_command_center",pw.cc,`-c app.current_org_id=${orgB} -c app.current_legal_entity_id=${eB}`)); // hostile startup settings
  try{
    assert.equal((await bound.query("SELECT sam_session_is_bound() b")).rows[0].b,true);
    await assertSamRoleIsolation(bound as any);
    const c=await bound.connect();
    try{
      const seen=async()=>(await c.query("SELECT objective FROM goals WHERE objective LIKE $1 ORDER BY 1",[tag+"%"])).rows.map(r=>r.objective);
      assert.deepEqual(await seen(),[tag+"a1"]);
      for(const [o,e] of [[orgB,eB],[orgA,eA2],[orgA,""],["",""]] as const){
        await c.query("SELECT set_config('app.current_org_id',$1,false),set_config('app.current_legal_entity_id',$2,false)",[o,e]);
        assert.deepEqual(await seen(),[tag+"a1"],`spoof ${o}/${e}`);
      }
      assert.equal((await c.query("SELECT current_org_id() o,current_legal_entity_id() e")).rows[0].o,orgA);
      // cannot read or edit the binding table, nor insert into it
      await assert.rejects(c.query("SELECT * FROM sam_role_scope"),/permission denied/);
      await assert.rejects(c.query("INSERT INTO sam_role_scope(role_name,org_id) VALUES ('sam_command_center',$1)",[orgB]),/permission denied/);
      await assert.rejects(c.query("UPDATE sam_role_scope SET org_id=$1",[orgB]),/permission denied/);
      // cannot insert a goal for another entity
      await assert.rejects(c.query("INSERT INTO goals(business_id,company_scope,objective) VALUES ($1,$2,$1)",[tag+"x",eB]),/row-level security|permission denied/);
    }finally{c.release();}
  }finally{await bound.end();}

  // org-wide binding (no entity): sees every entity of its org, never the other org
  await admin.query("UPDATE sam_role_scope SET legal_entity_id=NULL WHERE role_name='sam_command_center'");
  const orgWide=new Pool(conn("sam_command_center",pw.cc));
  try{
    const rows=(await orgWide.query("SELECT objective FROM goals WHERE objective LIKE $1 ORDER BY 1",[tag+"%"])).rows.map(r=>r.objective);
    assert.deepEqual(rows,[tag+"a1",tag+"a2"]);
  }finally{await orgWide.end();}

  // the runtime worker and MCP bridge are not bound and stay cross-tenant by design
  const w=new Pool(conn("sam_worker",pw.worker));
  try{assert.equal((await w.query("SELECT count(*)::int n FROM goals WHERE objective LIKE $1",[tag+"%"])).rows[0].n,3);}finally{await w.end();}

  provision({}); // leave the shared test database unbound
  await admin.end();
  console.log("PASS tenant_binding");
}
main().catch(e=>{console.error(e);process.exit(1);});
