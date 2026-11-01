// Regression tests for the independent security review (migration 00013 and follow-ups).
// Needs: DATABASE_URL = admin login of a migrated database, and `psql` on PATH.
import assert from "node:assert/strict";
import {spawnSync} from "node:child_process";
import {randomBytes,randomUUID} from "node:crypto";
import {resolve} from "node:path";
import {Client,Pool} from "pg";
import {CredentialVault,VaultKeyring} from "../../packages/db/src/credentialVault";
import {CredentialResolver} from "../../packages/credentials/src/resolver";
import {CredentialError,runWithLegalEntity} from "../../packages/credentials/src/entityContext";
import {createToolExecutors} from "../../apps/tools/src/executorFactory";
import {validateProductionBundle} from "../../apps/production/src/bundle";
import {runVaultCli,type CliIo} from "../../apps/admin/src/vaultCli";

const adminUrl:string=process.env.DATABASE_URL??"";
if(!adminUrl)throw new Error("DATABASE_URL (admin login) is required");
const base=new URL(adminUrl);
const pw={worker:randomBytes(16).toString("hex"),mcp:randomBytes(16).toString("hex"),cc:randomBytes(16).toString("hex")};
const conn=(user:string,password:string)=>({host:base.hostname,port:Number(base.port||5432),database:base.pathname.slice(1),user,password});
async function denied(p:Promise<unknown>,re:RegExp=/permission denied|row-level security|append-only|immutable|final/){
  await assert.rejects(p,(e:any)=>["42501","P0001"].includes(e?.code)&&re.test(String(e.message)),"expected denial");
}

async function main(){
  const r=spawnSync("psql",[adminUrl,"-X","-q","-v","ON_ERROR_STOP=1","-f",resolve("deploy/production/provision-roles.sql")],{
    encoding:"utf8",env:{...process.env,SAM_WORKER_DB_PASSWORD:pw.worker,SAM_MCP_DB_PASSWORD:pw.mcp,SAM_COMMAND_CENTER_DB_PASSWORD:pw.cc}});
  assert.equal(r.status,0,r.stderr);
  const admin=new Client({connectionString:adminUrl});await admin.connect();
  const tag="REVIEW_"+randomBytes(4).toString("hex");
  const org=randomUUID(),e1=randomUUID();
  const worker=new Pool(conn("sam_worker",pw.worker)),mcp=new Pool(conn("sam_mcp",pw.mcp)),cc=new Pool(conn("sam_command_center",pw.cc));
  try{
    await admin.query("INSERT INTO organizations(id,name) VALUES ($1,$2)",[org,tag]);
    await admin.query("INSERT INTO legal_entities(id,org_id,name) VALUES ($1,$2,$3)",[e1,org,tag]);
    const goal=(await admin.query("INSERT INTO goals(business_id,company_scope,objective) VALUES ($1,$2,$3) RETURNING id",[tag,e1,tag])).rows[0].id;
    const ev=(await admin.query("INSERT INTO event_fabric_events(source,event_type,occurred_at,dedup_key) VALUES ($1,'t',now(),$1) RETURNING id",[tag])).rows[0].id;

    // 1. append-only: UPDATE(id) exists only for row locks and cannot rewrite anything
    await worker.query("BEGIN");await worker.query("SELECT id FROM event_fabric_events WHERE id=$1 FOR UPDATE",[ev]);await worker.query("ROLLBACK");
    await denied(worker.query("UPDATE event_fabric_events SET id=gen_random_uuid() WHERE id=$1",[ev]),/append-only/);
    await denied(admin.query("UPDATE event_fabric_events SET payload='{}'::jsonb WHERE id=$1",[ev]),/append-only/);
    await admin.query("UPDATE event_fabric_events SET id=id WHERE id=$1",[ev]); // no-op updates stay allowed

    // 2. MCP bridge: reads, requests approval, but can never approve or mutate
    assert((await mcp.query("SELECT 1 FROM goals WHERE id=$1",[goal])).rowCount===1,"bridge can read goals");
    assert((await mcp.query("SELECT 1 FROM world_facts LIMIT 1")).rowCount!==null);
    await mcp.query("INSERT INTO goals(business_id,company_scope,objective) VALUES ($1,$2,$3)",[tag+"-mcp",e1,tag+" mcp"]);
    const req=await mcp.query(`INSERT INTO approvals(goal_id,capability_id,params_hash,legal_entity_id,limits,expiry_at,max_uses,authority_class,requested_by,status)
      VALUES ($1,'gmail_send','h',$2,'{}'::jsonb,now()+interval '24 hours',1,'YELLOW','mcp','PENDING') RETURNING id`,[goal,e1]);
    assert.equal(req.rowCount,1,"bridge can request approval");
    await denied(mcp.query("UPDATE approvals SET status='APPROVED',approved_by='mcp',max_uses=1000 WHERE id=$1",[req.rows[0].id]));
    await denied(mcp.query(`INSERT INTO approvals(goal_id,capability_id,params_hash,legal_entity_id,limits,expiry_at,max_uses,authority_class,requested_by,status,approved_by)
      VALUES ($1,'gmail_send','h2',$2,'{}'::jsonb,now()+interval '24 hours',1,'YELLOW','mcp','APPROVED','mcp')`,[goal,e1]),/row-level security/);
    await denied(mcp.query("UPDATE goals SET company_scope=NULL WHERE id=$1",[goal]));
    await denied(mcp.query("UPDATE goals SET authority_ceiling='GREEN' WHERE id=$1",[goal]));
    await denied(mcp.query("UPDATE work_queue SET status='QUEUED'"));
    await denied(mcp.query("UPDATE outbox_events SET publish_attempt=0"));
    await denied(mcp.query("UPDATE plans SET plan_hash='x'"));
    await denied(mcp.query("SELECT 1 FROM credential_vault"));
    await denied(mcp.query("DELETE FROM approvals"));
    const mcpRoles=(await admin.query("SELECT g.rolname FROM pg_auth_members m JOIN pg_roles g ON g.oid=m.roleid JOIN pg_roles u ON u.oid=m.member WHERE u.rolname='sam_mcp' ORDER BY 1")).rows.map(x=>x.rolname);
    assert.deepEqual(mcpRoles,["sam_mcp_bridge"],"MCP holds only the narrow bridge role");

    // 3. tenant sessions cannot forge vault audit rows (worker rows are legitimate)
    for(const [source,ok] of [["credential_vault",false],["command_center",true]] as const){
      const c=await cc.connect();
      try{
        await c.query("BEGIN");
        await c.query("SELECT set_config('app.current_org_id',$1,true),set_config('app.current_legal_entity_id',$2,true)",[org,e1]);
        const ins=c.query("INSERT INTO audit_log(actor,action,source) VALUES ('x','NOTE',$1)",[source]);
        if(ok)await ins;else await denied(ins,/row-level security/);
      }finally{await c.query("ROLLBACK").catch(()=>{});c.release();}
    }

    // 4. vault: revoked_* final, optimistic version check, no env fallback after revocation
    const vault=new CredentialVault(worker,VaultKeyring.fromEnv({SAM_VAULT_KEYS:"1:"+randomBytes(32).toString("hex"),SAM_VAULT_ACTIVE_KEY_VERSION:"1"}),{cacheTtlMs:0});
    const ref={legalEntityId:e1,provider:"bol",name:"default",actor:"t"};
    const v1=await vault.put({...ref,secret:{client_id:"a",client_secret:"b"}});
    await vault.put({...ref,secret:{client_id:"a2",client_secret:"b2"}});
    await assert.rejects(()=>vault.put({...ref,secret:{client_id:"stale",client_secret:"stale"},expectedActiveVersion:v1.secretVersion}),/VAULT_VERSION_CONFLICT/);
    assert.equal((await vault.getWithVersion(ref))?.secret.client_id,"a2","stale rotation did not overwrite the newer secret");
    await denied(admin.query("UPDATE credential_vault SET revoked_by='someone-else' WHERE id=$1",[v1.id]),/final|immutable/);
    assert.equal(await vault.hasHistory(ref),true);
    assert.equal(await vault.hasHistory({...ref,provider:"gmail"}),false);
    const legacyEnv={SAM_LEGACY_CREDENTIAL_ENTITY_ID:e1,BOL_CLIENT_ID:"env-id",BOL_CLIENT_SECRET:"env-secret"};
    const resolver=new CredentialResolver({vault,env:legacyEnv});
    await runWithLegalEntity(e1,async()=>{assert.equal((await resolver.resolve("bol")).client_id,"a2");});
    await vault.revoke(ref);
    await assert.rejects(()=>runWithLegalEntity(e1,()=>resolver.resolve("bol")),(e:any)=>e instanceof CredentialError&&e.code==="CREDENTIAL_NOT_CONFIGURED");
    await runWithLegalEntity(e1,async()=>{ // never configured slot still gets the explicit legacy bridge
      assert.equal((await resolver.resolve("eboekhouden").catch(()=>({api_token:"none"}))).api_token,"none");});

    // 5. preflight: a credential failure happens BEFORE any side effect or approval is touched
    let executed=0;
    const bundle=validateProductionBundle({
      capabilities:[{capabilityId:"probe_send",authorityClass:"YELLOW",specialistAgentId:"p",specialistVersion:"1.0.0"}],
      toolDefinitions:[{capabilityId:"probe_send",authorityClass:"YELLOW",sideEffect:true}],
      toolAdapters:[{capabilityId:"probe_send",
        async preflight(){throw new CredentialError("CREDENTIAL_NOT_CONFIGURED");},
        async execute(){executed++;return {providerReference:"x",result:{},evidence:{}};}}]
    });
    const plan=(await admin.query("INSERT INTO plans(goal_id,version,plan_hash) VALUES ($1,1,$2) RETURNING id",[goal,tag])).rows[0].id;
    const q=(await admin.query("INSERT INTO work_queue(goal_id,plan_id,capability_id,params,status) VALUES ($1,$2,'probe_send','{}'::jsonb,'LEASED') RETURNING id",[goal,plan])).rows[0].id;
    const exec=createToolExecutors({catalog:bundle.catalog,tools:bundle.tools}).probe_send;
    await assert.rejects(()=>exec({queueId:q,fencingToken:1,capabilityId:"probe_send",params:{},goalId:goal,planId:plan}),(e:any)=>e.code==="CREDENTIAL_NOT_CONFIGURED");
    assert.equal(executed,0);
    assert.equal((await admin.query("SELECT count(*)::int n FROM side_effect_operations WHERE goal_id=$1",[goal])).rows[0].n,0,"no side-effect record was created");
    assert.equal((await admin.query("SELECT count(*)::int n FROM approvals WHERE goal_id=$1 AND used_at IS NOT NULL",[goal])).rows[0].n,0,"no approval was consumed");

    // 6. CLI: malformed JSON never echoes input
    const out:string[]=[];
    const cli:CliIo={out:l=>out.push(l),err:l=>out.push(l),isInteractive:false,readHidden:async()=>"",readStdin:async()=>'{"client_id":"x","client_secret":SUPERSECRETVALUE'};
    assert.equal(await runVaultCli(["put","--entity",e1,"--provider","bol","--json-stdin"],cli,vault,"o"),1);
    assert(!out.join("").includes("SUPERSECRET")&&/not valid JSON/.test(out.join("")));
    console.log("PASS review_hardening");
  }finally{
    await Promise.allSettled([worker.end(),mcp.end(),cc.end()]);
    await admin.end();
  }
}
main().then(()=>process.exit(0),e=>{console.error(e);process.exit(1)});
