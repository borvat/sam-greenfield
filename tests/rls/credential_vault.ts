// Real-PostgreSQL proof of the credential vault (migration 00012, credentialVault.ts):
// secrets are stored only as ciphertext, bound to their entity/provider/name, readable
// solely by the runtime worker, append-only except for revocation, and auditable.
// Needs: DATABASE_URL = admin login of a migrated database, and `psql` on PATH.
import assert from "node:assert/strict";
import {spawnSync} from "node:child_process";
import {randomBytes,randomUUID} from "node:crypto";
import {resolve} from "node:path";
import {Pool,Client} from "pg";
import {CredentialVault,VaultKeyring,VaultError} from "../../packages/db/src/credentialVault";

const adminUrl:string=process.env.DATABASE_URL??"";
if(!adminUrl)throw new Error("DATABASE_URL (admin login) is required");
const base=new URL(adminUrl);
const pw={worker:randomBytes(16).toString("hex"),mcp:randomBytes(16).toString("hex"),cc:randomBytes(16).toString("hex")};
const hex=()=>randomBytes(32).toString("hex");

function provision(){
  const r=spawnSync("psql",[adminUrl,"-X","-q","-v","ON_ERROR_STOP=1","-f",resolve("deploy/production/provision-roles.sql")],{
    encoding:"utf8",env:{...process.env,SAM_WORKER_DB_PASSWORD:pw.worker,SAM_MCP_DB_PASSWORD:pw.mcp,SAM_COMMAND_CENTER_DB_PASSWORD:pw.cc}});
  assert.equal(r.status,0,"provisioning failed: "+r.stderr);
}
const conn=(user:string,password:string)=>({host:base.hostname,port:Number(base.port||5432),database:base.pathname.slice(1),user,password});
async function denied(p:Promise<unknown>,re:RegExp=/permission denied|row-level security/){
  await assert.rejects(p,(e:any)=>(e?.code==="42501"||e?.code==="P0001")&&re.test(String(e.message)));
}
async function vaultErr(p:Promise<unknown>,code:string){
  await assert.rejects(p,(e:any)=>e instanceof VaultError&&e.code===code,"expected "+code);
}

async function main(){
  const admin=new Client({connectionString:adminUrl});await admin.connect();
  const tag="VAULT_"+randomBytes(4).toString("hex");
  const org=randomUUID(),e1=randomUUID(),e2=randomUUID();
  const SECRET={client_id:"bol-id-"+tag,client_secret:"S3CR3T-"+randomBytes(12).toString("hex")};
  try{
    provision();
    await admin.query("INSERT INTO organizations(id,name) VALUES ($1,$2)",[org,tag]);
    await admin.query("INSERT INTO legal_entities(id,org_id,name) VALUES ($1,$3,$4),($2,$3,$5)",[e1,e2,org,tag+"1",tag+"2"]);

    // ---- keyring validation (no database)
    const k1=hex(),k2=hex();
    assert.throws(()=>VaultKeyring.fromEnv({}),/VAULT_KEYS_REQUIRED/);
    assert.throws(()=>VaultKeyring.fromEnv({SAM_VAULT_KEYS:"1:abc",SAM_VAULT_ACTIVE_KEY_VERSION:"1"}),/VAULT_KEYS_MALFORMED/);
    assert.throws(()=>VaultKeyring.fromEnv({SAM_VAULT_KEYS:`1:${k1},2:${k1}`,SAM_VAULT_ACTIVE_KEY_VERSION:"1"}),/VAULT_KEYS_NOT_DISTINCT/);
    assert.throws(()=>VaultKeyring.fromEnv({SAM_VAULT_KEYS:`1:${k1}`,SAM_VAULT_ACTIVE_KEY_VERSION:"2"}),/VAULT_ACTIVE_KEY_MISSING/);
    const ring1=VaultKeyring.fromEnv({SAM_VAULT_KEYS:`1:${k1}`,SAM_VAULT_ACTIVE_KEY_VERSION:"1"});

    const workerPool=new Pool(conn("sam_worker",pw.worker));
    const ccPool=new Pool(conn("sam_command_center",pw.cc));
    const mcpPool=new Pool(conn("sam_mcp",pw.mcp));
    try{
      const vault=new CredentialVault(workerPool,ring1,{cacheTtlMs:0});
      const ref={legalEntityId:e1,provider:"bol",name:"default",actor:"test"};

      // ---- round trip, versioning, rotation of the secret value
      assert.equal(await vault.get(ref),null);
      const first=await vault.put({...ref,secret:SECRET});
      assert.equal(first.secretVersion,1);
      assert.deepEqual({...(await vault.get(ref))},SECRET);
      const second=await vault.put({...ref,secret:{...SECRET,client_secret:"ROTATED-"+tag}});
      assert.equal(second.secretVersion,2);
      assert.equal((await vault.get(ref))?.client_secret,"ROTATED-"+tag);
      const rows=(await admin.query("SELECT secret_version,status FROM credential_vault WHERE legal_entity_id=$1 ORDER BY secret_version",[e1])).rows;
      assert.deepEqual(rows.map(r=>`${r.secret_version}:${r.status}`),["1:REVOKED","2:ACTIVE"]);

      // ---- nothing readable at rest: no plaintext in any stored column
      const dump=(await admin.query("SELECT row_to_json(v)::text t FROM credential_vault v WHERE legal_entity_id=$1",[e1])).rows.map(r=>r.t).join("");
      for(const needle of ["S3CR3T","ROTATED-","bol-id-",SECRET.client_id])assert(!dump.includes(needle),"plaintext leaked into storage");

      // ---- entity isolation: another entity has nothing; moving ciphertext fails authentication
      assert.equal(await vault.get({...ref,legalEntityId:e2}),null);
      await admin.query(`INSERT INTO credential_vault(legal_entity_id,provider,name,secret_version,key_version,dek_nonce,wrapped_dek,dek_tag,nonce,ciphertext,auth_tag,created_by)
        SELECT $2,provider,name,secret_version,key_version,dek_nonce,wrapped_dek,dek_tag,nonce,ciphertext,auth_tag,'attacker' FROM credential_vault WHERE id=$1`,[second.id,e2]);
      await vaultErr(vault.get({...ref,legalEntityId:e2}),"VAULT_DECRYPT_FAILED");
      await admin.query(`UPDATE credential_vault SET ciphertext=ciphertext WHERE false`);
      await admin.query("DELETE FROM credential_vault WHERE legal_entity_id=$1",[e2]);
      // same-entity different provider/name must not decrypt either (AAD binding)
      await admin.query(`INSERT INTO credential_vault(legal_entity_id,provider,name,secret_version,key_version,dek_nonce,wrapped_dek,dek_tag,nonce,ciphertext,auth_tag,created_by)
        SELECT legal_entity_id,'gmail',name,secret_version,key_version,dek_nonce,wrapped_dek,dek_tag,nonce,ciphertext,auth_tag,'attacker' FROM credential_vault WHERE id=$1`,[second.id]);
      await vaultErr(vault.get({...ref,provider:"gmail"}),"VAULT_DECRYPT_FAILED");

      // ---- a wrong or missing key never decrypts
      const ringOther=VaultKeyring.fromEnv({SAM_VAULT_KEYS:`1:${hex()}`,SAM_VAULT_ACTIVE_KEY_VERSION:"1"});
      await vaultErr(new CredentialVault(workerPool,ringOther,{cacheTtlMs:0}).get(ref),"VAULT_DECRYPT_FAILED");
      const ring9=VaultKeyring.fromEnv({SAM_VAULT_KEYS:`9:${hex()}`,SAM_VAULT_ACTIVE_KEY_VERSION:"9"});
      await vaultErr(new CredentialVault(workerPool,ring9,{cacheTtlMs:0}).get(ref),"VAULT_KEY_VERSION_UNAVAILABLE");

      // ---- input validation
      await vaultErr(vault.put({...ref,legalEntityId:"nope",secret:SECRET}),"VAULT_ENTITY_INVALID");
      await vaultErr(vault.put({...ref,provider:"Bol;--",secret:SECRET}),"VAULT_PROVIDER_INVALID");
      await vaultErr(vault.put({...ref,secret:{}}),"VAULT_SECRET_INVALID");
      await vaultErr(vault.put({...ref,secret:{client_id:""}}),"VAULT_SECRET_INVALID");
      await vaultErr(vault.put({...ref,actor:" ",secret:SECRET}),"VAULT_ACTOR_REQUIRED");

      // ---- master-key rotation: re-encrypt under a new key, drop the old one
      const ring12=VaultKeyring.fromEnv({SAM_VAULT_KEYS:`1:${k1},2:${k2}`,SAM_VAULT_ACTIVE_KEY_VERSION:"2"});
      const v12=new CredentialVault(workerPool,ring12,{cacheTtlMs:0});
      assert.equal((await v12.get(ref))?.client_secret,"ROTATED-"+tag,"old rows still readable while both keys are loaded");
      const rot=await v12.rotateKeys("test");
      assert.equal(rot.rotated,1);
      assert.deepEqual(rot.failed.map(f=>`${f.provider}:${f.code}`),["gmail:VAULT_DECRYPT_FAILED"],"forged row is reported, not fatal");
      assert.equal((await admin.query("SELECT key_version FROM credential_vault WHERE legal_entity_id=$1 AND status='ACTIVE' AND provider='bol'",[e1])).rows[0].key_version,2);
      const ring2only=VaultKeyring.fromEnv({SAM_VAULT_KEYS:`2:${k2}`,SAM_VAULT_ACTIVE_KEY_VERSION:"2"});
      assert.equal((await new CredentialVault(workerPool,ring2only,{cacheTtlMs:0}).get(ref))?.client_secret,"ROTATED-"+tag);

      // ---- cache honours TTL and is invalidated on write/revoke
      let t=1000;
      const cached=new CredentialVault(workerPool,ring2only,{cacheTtlMs:100,now:()=>t});
      const reads=async()=>Number((await admin.query("SELECT count(*) c FROM audit_log WHERE action='CREDENTIAL_READ' AND source='credential_vault' AND actor=$1",[tag+"-cache"])).rows[0].c);
      const cref={...ref,actor:tag+"-cache"};
      await cached.get(cref);await cached.get(cref);assert.equal(await reads(),1,"second read served from cache");
      t+=101;await cached.get(cref);assert.equal(await reads(),2,"expired entry re-read and re-audited");

      // ---- revocation
      assert.equal(await vault.revoke(ref),true);
      assert.equal(await vault.get(ref),null);
      assert.equal(await vault.revoke(ref),false);
      await vault.put({...ref,secret:SECRET}); // re-provision after revoke works as
      assert.equal((await admin.query("SELECT max(secret_version) m FROM credential_vault WHERE legal_entity_id=$1 AND provider='bol'",[e1])).rows[0].m,4);

      // ---- audit trail exists and never contains secret material
      const audit=(await admin.query("SELECT action,result,coalesce(before_ref::text,'')||coalesce(after_ref::text,'') extra FROM audit_log WHERE source='credential_vault'")).rows;
      for(const a of ["CREDENTIAL_CREATED","CREDENTIAL_ROTATED","CREDENTIAL_READ","CREDENTIAL_REVOKED"])assert(audit.some(r=>r.action===a),"missing audit "+a);
      assert(!JSON.stringify(audit).includes("S3CR3T"));

      // ---- database-level protections for the worker identity
      await denied(workerPool.query("DELETE FROM credential_vault"));
      await denied(workerPool.query("TRUNCATE credential_vault"));
      await denied(workerPool.query("UPDATE credential_vault SET ciphertext='\\x00'::bytea"));
      await denied(workerPool.query("UPDATE credential_vault SET created_by='x'"));
      // owner-level tampering is blocked by the trigger too
      await denied(admin.query("UPDATE credential_vault SET ciphertext='\\x0000'::bytea WHERE legal_entity_id=$1",[e1]),/immutable/);
      await denied(admin.query("UPDATE credential_vault SET status='ACTIVE',revoked_at=NULL,revoked_by=NULL WHERE status='REVOKED' AND legal_entity_id=$1",[e1]),/final|reactivated|immutable/);

      // ---- nobody else can read the vault: MCP bridge and Command Center
      await denied(mcpPool.query("SELECT * FROM credential_vault"));
      await denied(ccPool.query("SELECT * FROM credential_vault"));
      await denied(ccPool.query("INSERT INTO credential_vault(legal_entity_id,provider,name,secret_version,key_version,dek_nonce,wrapped_dek,dek_tag,nonce,ciphertext,auth_tag,created_by) VALUES ($1,'bol','x',1,1,$2,$3,$4,$2,$5,$4,'x')",
        [e1,randomBytes(12),randomBytes(32),randomBytes(16),randomBytes(8)]));
      // and a member of neither the vault role nor a superuser sees zero rows even with SELECT
      const noRole=await admin.query("SELECT has_table_privilege('sam_tenant_app','credential_vault','SELECT') a, has_table_privilege('sam_runtime_worker','credential_vault','SELECT') b");
      assert.deepEqual(noRole.rows[0],{a:false,b:false});
    }finally{await Promise.allSettled([workerPool.end(),ccPool.end(),mcpPool.end()]);}
    console.log("PASS credential_vault");
  }finally{
    await admin.query("ALTER TABLE credential_vault DISABLE TRIGGER credential_vault_guard_update").catch(()=>{});
    await admin.query("DELETE FROM credential_vault WHERE legal_entity_id=ANY($1::uuid[])",[[e1,e2]]).catch(()=>{});
    await admin.query("ALTER TABLE credential_vault ENABLE TRIGGER credential_vault_guard_update").catch(()=>{});
    await admin.query("DELETE FROM legal_entities WHERE org_id=$1",[org]).catch(()=>{});
    await admin.query("DELETE FROM organizations WHERE id=$1",[org]).catch(()=>{});
    await admin.end();
  }
}
main().then(()=>process.exit(0),e=>{console.error(e);process.exit(1)});
