// Residual-risk closure: business-id counters are a closed interface; production role guard.
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
async function denied(p:Promise<unknown>,re:RegExp){
  await assert.rejects(p,(e:any)=>["42501","P0001"].includes(e?.code)&&re.test(String(e.message)),"expected denial");
}

async function main(){
  const r=spawnSync("psql",[adminUrl,"-X","-q","-v","ON_ERROR_STOP=1","-f",resolve("deploy/production/provision-roles.sql")],{
    encoding:"utf8",env:{...process.env,SAM_WORKER_DB_PASSWORD:pw.worker,SAM_MCP_DB_PASSWORD:pw.mcp,SAM_COMMAND_CENTER_DB_PASSWORD:pw.cc}});
  assert.equal(r.status,0,r.stderr);
  const admin=new Client({connectionString:adminUrl});await admin.connect();
  const tag="RESID_"+randomBytes(4).toString("hex");
  const org=randomUUID(),otherOrg=randomUUID(),e1=randomUUID();
  await admin.query("INSERT INTO organizations(id,name) VALUES ($1,$2),($3,$4)",[org,tag,otherOrg,tag+"o"]);
  await admin.query("INSERT INTO legal_entities(id,org_id,name) VALUES ($1,$2,$3)",[e1,org,tag]);
  await admin.query("INSERT INTO sam_role_scope(role_name,org_id,legal_entity_id) VALUES ('sam_command_center',$1,$2) ON CONFLICT (role_name) DO UPDATE SET org_id=EXCLUDED.org_id,legal_entity_id=EXCLUDED.legal_entity_id",[org,e1]);
  const worker=new Pool(conn("sam_worker",pw.worker));
  const mcp=new Pool(conn("sam_mcp",pw.mcp));
  const cc=new Pool(conn("sam_command_center",pw.cc,`-c app.current_org_id=${org} -c app.current_legal_entity_id=${e1}`));
  try{
    // counter table is closed to every SAM role
    for(const [n,p] of [["worker",worker],["mcp",mcp],["cc",cc]] as const){
      await denied(p.query("SELECT * FROM business_id_sequences"),/permission denied/);
      await denied(p.query("UPDATE business_id_sequences SET last_number=0"),/permission denied/);
      await denied(p.query("INSERT INTO business_id_sequences(entity_type,org_scope_id,last_number) VALUES ('goal',NULL,0)"),/permission denied/);
      void n;
    }
    // ...but the interface works for the legitimate paths, strictly increasing
    const a=(await worker.query("SELECT next_business_id('goal',NULL) id")).rows[0].id;
    const b=(await worker.query("SELECT next_business_id('goal',NULL) id")).rows[0].id;
    assert.match(a,/^G\d{6}$/);assert.ok(b>a);
    assert.match((await mcp.query("SELECT next_business_id('goal',NULL) id")).rows[0].id,/^G\d{6}$/);
    assert.match((await cc.query("SELECT next_business_id('goal',$1::uuid) id",[org])).rows[0].id,/^G\d{6}$/);
    // restricted roles: no other entity types, no foreign organisation scope
    await denied(worker.query("SELECT next_business_id('purchase_order',NULL)"),/not permitted/);
    await denied(cc.query("SELECT next_business_id('goal',$1::uuid)",[otherOrg]),/does not match/);
    await denied(cc.query("SELECT next_business_id('product',$1::uuid)",[org]),/not permitted/);
    // search_path is pinned: a schema-shadowing attempt cannot hijack the definer function
    const pc=await admin.query("SELECT prosecdef,proconfig FROM pg_proc WHERE proname='next_business_id'");
    assert.equal(pc.rows[0].prosecdef,true);assert.match(String(pc.rows[0].proconfig),/search_path=pg_catalog, public/);
    // owner / non-SAM callers are unchanged
    assert.match((await admin.query("SELECT next_business_id('restore_fixture',NULL) id")).rows[0].id,/^RE\d{6}$/);

    // production role guard
    await assertSamRoleIsolation(worker as any);   // worker: runtime+vault -> ok
    await assertSamRoleIsolation(mcp as any);
    await assertSamRoleIsolation(cc as any);
    await assertSamRoleIsolation(admin as any);    // non-SAM -> no-op
    await admin.query("GRANT sam_tenant_app TO sam_mcp");
    try{await assert.rejects(assertSamRoleIsolation(mcp as any),/RELEASE_ROLE_MEMBERSHIP_OVERLAP/);}
    finally{await admin.query("REVOKE sam_tenant_app FROM sam_mcp");}
    await admin.query("GRANT sam_credential_vault TO sam_mcp");
    await admin.query("REVOKE sam_credential_vault FROM sam_mcp");
    await admin.query("GRANT SELECT ON credential_vault TO sam_mcp_bridge");
    try{await assert.rejects(assertSamRoleIsolation(mcp as any),/RELEASE_VAULT_ACCESS_UNEXPECTED/);}
    finally{await admin.query("REVOKE SELECT ON credential_vault FROM sam_mcp_bridge");}
    await admin.query("ALTER TABLE credential_vault DISABLE ROW LEVEL SECURITY");
    try{await assert.rejects(assertSamRoleIsolation(worker as any),/RELEASE_VAULT_RLS_DISABLED/);}
    finally{await admin.query("ALTER TABLE credential_vault ENABLE ROW LEVEL SECURITY");}
    await assertSamRoleIsolation(worker as any);
    console.log("PASS residual_risks");
  }finally{
    await admin.query("DELETE FROM sam_role_scope WHERE role_name='sam_command_center'");
    await worker.end();await mcp.end();await cc.end();await admin.end();
  }
}
main().catch(e=>{console.error(e);process.exit(1);});
