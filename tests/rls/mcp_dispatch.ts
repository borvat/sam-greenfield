// The real ChatGPT-direct dispatcher (apps/production/src/dispatcher.ts) must work under the
// production sam_mcp login, whose group role is deliberately narrower than the runtime role:
// GREEN work is queued, YELLOW work stops at a PENDING approval request that the bridge can
// not approve itself. Needs DATABASE_URL = admin login of a migrated database and `psql`.
import assert from "node:assert/strict";
import {spawnSync} from "node:child_process";
import {randomBytes,randomUUID} from "node:crypto";
import {resolve} from "node:path";
import {Client} from "pg";

const adminUrl:string=process.env.DATABASE_URL??"";
if(!adminUrl)throw new Error("DATABASE_URL (admin login) is required");
const base=new URL(adminUrl);
const pw={worker:randomBytes(16).toString("hex"),mcp:randomBytes(16).toString("hex"),cc:randomBytes(16).toString("hex")};

async function main(){
  const prov=spawnSync("psql",[adminUrl,"-X","-q","-v","ON_ERROR_STOP=1","-f",resolve("deploy/production/provision-roles.sql")],{
    encoding:"utf8",env:{...process.env,SAM_WORKER_DB_PASSWORD:pw.worker,SAM_MCP_DB_PASSWORD:pw.mcp,SAM_COMMAND_CENTER_DB_PASSWORD:pw.cc}});
  assert.equal(prov.status,0,prov.stderr);
  const admin=new Client({connectionString:adminUrl});await admin.connect();
  const org=randomUUID(),entity=randomUUID(),tag="MCPD_"+randomBytes(3).toString("hex");
  try{
    await admin.query("INSERT INTO organizations(id,name) VALUES ($1,$2)",[org,tag]);
    await admin.query("INSERT INTO legal_entities(id,org_id,name) VALUES ($1,$2,$3)",[entity,org,tag]);
    const url=new URL(adminUrl);url.username="sam_mcp";url.password=pw.mcp;
    const child=spawnSync(process.execPath,["--import","tsx","tests/rls/mcp_dispatch_child.ts"],{
      encoding:"utf8",env:{...process.env,NODE_ENV:"test",DATABASE_URL:url.toString(),PROBE_ENTITY:entity}});
    const line=child.stdout.trim().split("\n").pop()??"";
    const out=JSON.parse(line);
    assert.equal(out.error,undefined,"dispatcher failed under sam_mcp: "+out.error);
    assert.deepEqual(out,{green:"QUEUED",yellow:"WAITING_OWNER",approvals:1});
    const ap=(await admin.query("SELECT status,approved_by,used_count FROM approvals WHERE legal_entity_id=$1",[entity])).rows;
    assert.deepEqual(ap.map(a=>[a.status,a.approved_by]),[["PENDING",null]],"approval is only requested, never granted by the bridge");
    const goals=(await admin.query("SELECT state,authority_ceiling FROM goals WHERE company_scope=$1 ORDER BY authority_ceiling",[entity])).rows;
    assert.equal(goals.length,2);
    assert.equal((await admin.query(`SELECT count(*)::int n FROM work_queue w JOIN goals g ON g.id=w.goal_id WHERE g.company_scope=$1`,[entity])).rows[0].n,1);
    console.log("PASS mcp_dispatch");
  }finally{await admin.end();}
}
main().then(()=>process.exit(0),e=>{console.error(e);process.exit(1)});
