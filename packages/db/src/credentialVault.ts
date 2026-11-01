import {createCipheriv,createDecipheriv,randomBytes} from "node:crypto";

// Envelope-encrypted per-legal-entity credential store (table: credential_vault,
// migration 00012). AES-256-GCM everywhere. Layout per stored secret:
//   random 256-bit data key (DEK) --encrypts--> secret JSON
//   versioned master key (KEK, from the environment) --wraps--> DEK
// Both operations bind AAD = entity|provider|name|secretVersion|keyVersion, so a
// row moved to another entity/name/version, or downgraded to another key version,
// fails authentication instead of decrypting. Secrets never appear in SQL text.

export type Queryable={query(text:string,values?:any[]):Promise<{rows:any[];rowCount?:number|null}>};
export type TxPool=Queryable&{connect():Promise<Queryable&{release():void}>};
export type SecretFields=Readonly<Record<string,string>>;

const KEY_BYTES=32,NONCE_BYTES=12,TAG_BYTES=16,MAX_PLAINTEXT=16*1024;
const PROVIDER=/^[a-z][a-z0-9_]{1,63}$/,NAME=/^[a-z0-9][a-z0-9_.-]{0,63}$/;
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export class VaultError extends Error{
  constructor(readonly code:string){super(code);this.name="VaultError";}
}

export class VaultKeyring{
  private constructor(private readonly keys:ReadonlyMap<number,Buffer>,readonly activeVersion:number){}
  // SAM_VAULT_KEYS="1:<64 hex>,2:<64 hex>"  SAM_VAULT_ACTIVE_KEY_VERSION="2"
  // Old versions stay listed until every row has been re-encrypted (rotateKeys()).
  static fromEnv(env:NodeJS.ProcessEnv=process.env):VaultKeyring{
    const raw=env.SAM_VAULT_KEYS?.trim();
    if(!raw)throw new VaultError("VAULT_KEYS_REQUIRED");
    const keys=new Map<number,Buffer>(),seen=new Set<string>();
    for(const part of raw.split(",")){
      const m=/^([1-9][0-9]{0,5}):([0-9a-fA-F]{64})$/.exec(part.trim());
      if(!m)throw new VaultError("VAULT_KEYS_MALFORMED");
      const v=Number(m[1]),hex=m[2].toLowerCase();
      if(keys.has(v)||seen.has(hex))throw new VaultError("VAULT_KEYS_NOT_DISTINCT");
      keys.set(v,Buffer.from(hex,"hex"));seen.add(hex);
    }
    const active=Number(env.SAM_VAULT_ACTIVE_KEY_VERSION?.trim());
    if(!Number.isInteger(active)||!keys.has(active))throw new VaultError("VAULT_ACTIVE_KEY_MISSING");
    return new VaultKeyring(keys,active);
  }
  static forTest(keys:Record<number,string>,active:number):VaultKeyring{
    return new VaultKeyring(new Map(Object.entries(keys).map(([v,h])=>[Number(v),Buffer.from(h,"hex")])),active);
  }
  key(version:number):Buffer{
    const k=this.keys.get(version);
    if(!k)throw new VaultError("VAULT_KEY_VERSION_UNAVAILABLE");
    return k;
  }
}

function aad(entity:string,provider:string,name:string,secretVersion:number,keyVersion:number){
  return Buffer.from([entity,provider,name,secretVersion,keyVersion].join("|"),"utf8");
}
function seal(key:Buffer,plaintext:Buffer,ad:Buffer){
  const nonce=randomBytes(NONCE_BYTES),c=createCipheriv("aes-256-gcm",key,nonce);
  c.setAAD(ad);
  const ciphertext=Buffer.concat([c.update(plaintext),c.final()]);
  return {nonce,ciphertext,tag:c.getAuthTag()};
}
function open(key:Buffer,nonce:Buffer,ciphertext:Buffer,tag:Buffer,ad:Buffer){
  try{
    const d=createDecipheriv("aes-256-gcm",key,nonce,{authTagLength:TAG_BYTES});
    d.setAAD(ad);d.setAuthTag(tag);
    return Buffer.concat([d.update(ciphertext),d.final()]);
  }catch{throw new VaultError("VAULT_DECRYPT_FAILED");}
}
function validateRef(entity:string,provider:string,name:string){
  if(!UUID.test(entity))throw new VaultError("VAULT_ENTITY_INVALID");
  if(!PROVIDER.test(provider))throw new VaultError("VAULT_PROVIDER_INVALID");
  if(!NAME.test(name))throw new VaultError("VAULT_NAME_INVALID");
}
function validateSecret(secret:SecretFields):Buffer{
  const entries=Object.entries(secret);
  if(!entries.length||entries.some(([k,v])=>!/^[a-z][a-z0-9_]{0,63}$/.test(k)||typeof v!=="string"||v===""))
    throw new VaultError("VAULT_SECRET_INVALID");
  const buf=Buffer.from(JSON.stringify(secret),"utf8");
  if(buf.length>MAX_PLAINTEXT)throw new VaultError("VAULT_SECRET_TOO_LARGE");
  return buf;
}

export type VaultRef={legalEntityId:string;provider:string;name:string};

export class CredentialVault{
  private cache=new Map<string,{secret:SecretFields;version:number;expires:number}>();
  constructor(
    private readonly db:TxPool,
    private readonly keyring:VaultKeyring,
    private readonly opts:{cacheTtlMs?:number;now?:()=>number}={}
  ){}
  private now(){return (this.opts.now??Date.now)();}
  private k(r:VaultRef){return `${r.legalEntityId}|${r.provider}|${r.name}`;}

  // Stores a new ACTIVE version and revokes the previous one atomically.
  async put(ref:VaultRef&{secret:SecretFields;actor:string;expectedActiveVersion?:number|null}):Promise<{id:string;secretVersion:number}>{
    validateRef(ref.legalEntityId,ref.provider,ref.name);
    if(!ref.actor?.trim())throw new VaultError("VAULT_ACTOR_REQUIRED");
    const plaintext=validateSecret(ref.secret);
    const client=await this.db.connect();
    try{
      await client.query("BEGIN");
      // Serialise concurrent writers for the same slot.
      await client.query("SELECT pg_advisory_xact_lock(hashtextextended($1,0))",[this.k(ref)]);
      const prev=(await client.query(
        `SELECT id,secret_version FROM credential_vault
          WHERE legal_entity_id=$1 AND provider=$2 AND name=$3 AND status='ACTIVE' FOR UPDATE`,
        [ref.legalEntityId,ref.provider,ref.name])).rows[0];
      // Optimistic check: a rotation that read version N must not overwrite a newer one.
      if(ref.expectedActiveVersion!==undefined&&(prev?.secret_version??null)!==ref.expectedActiveVersion)
        throw new VaultError("VAULT_VERSION_CONFLICT");
      const max=(await client.query(
        `SELECT COALESCE(MAX(secret_version),0)::int v FROM credential_vault
          WHERE legal_entity_id=$1 AND provider=$2 AND name=$3`,
        [ref.legalEntityId,ref.provider,ref.name])).rows[0].v as number;
      const secretVersion=max+1,keyVersion=this.keyring.activeVersion;
      const ad=aad(ref.legalEntityId,ref.provider,ref.name,secretVersion,keyVersion);
      const dek=randomBytes(KEY_BYTES);
      const data=seal(dek,plaintext,ad);
      const wrapped=seal(this.keyring.key(keyVersion),dek,ad);
      dek.fill(0);plaintext.fill(0);
      if(prev)await client.query(
        "UPDATE credential_vault SET status='REVOKED',revoked_by=$2,revoked_at=now() WHERE id=$1",
        [prev.id,ref.actor]);
      const ins=await client.query(
        `INSERT INTO credential_vault(legal_entity_id,provider,name,secret_version,key_version,
           dek_nonce,wrapped_dek,dek_tag,nonce,ciphertext,auth_tag,created_by)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING id`,
        [ref.legalEntityId,ref.provider,ref.name,secretVersion,keyVersion,
         wrapped.nonce,wrapped.ciphertext,wrapped.tag,data.nonce,data.ciphertext,data.tag,ref.actor]);
      await this.audit(client,ref.actor,prev?"CREDENTIAL_ROTATED":"CREDENTIAL_CREATED",ins.rows[0].id);
      await client.query("COMMIT");
      this.cache.delete(this.k(ref));
      return {id:ins.rows[0].id,secretVersion};
    }catch(e){
      await client.query("ROLLBACK").catch(()=>{});throw e;
    }finally{client.release();}
  }

  // Returns the ACTIVE secret or null. Every database read is audited; the
  // in-process cache (default 30 s) only serves repeats within one process.
  async get(ref:VaultRef&{actor:string}):Promise<SecretFields|null>{
    return (await this.getWithVersion(ref))?.secret??null;
  }

  async getWithVersion(ref:VaultRef&{actor:string}):Promise<{secret:SecretFields;secretVersion:number}|null>{
    validateRef(ref.legalEntityId,ref.provider,ref.name);
    const hit=this.cache.get(this.k(ref));
    if(hit&&hit.expires>this.now())return {secret:hit.secret,secretVersion:hit.version};
    const row=(await this.db.query(
      `SELECT id,secret_version,key_version,dek_nonce,wrapped_dek,dek_tag,nonce,ciphertext,auth_tag
         FROM credential_vault
        WHERE legal_entity_id=$1 AND provider=$2 AND name=$3 AND status='ACTIVE'`,
      [ref.legalEntityId,ref.provider,ref.name])).rows[0];
    if(!row)return null;
    const secret=this.decryptRow(ref,row);
    await this.audit(this.db,ref.actor,"CREDENTIAL_READ",row.id);
    this.cache.set(this.k(ref),{secret,version:row.secret_version,expires:this.now()+(this.opts.cacheTtlMs??30_000)});
    return {secret,secretVersion:row.secret_version};
  }

  async revoke(ref:VaultRef&{actor:string}):Promise<boolean>{
    validateRef(ref.legalEntityId,ref.provider,ref.name);
    const r=await this.db.query(
      `UPDATE credential_vault SET status='REVOKED',revoked_by=$4,revoked_at=now()
        WHERE legal_entity_id=$1 AND provider=$2 AND name=$3 AND status='ACTIVE' RETURNING id`,
      [ref.legalEntityId,ref.provider,ref.name,ref.actor]);
    this.cache.delete(this.k(ref));
    if(r.rows[0])await this.audit(this.db,ref.actor,"CREDENTIAL_REVOKED",r.rows[0].id);
    return r.rows.length>0;
  }

  // True when this slot has EVER held a vault secret (active or revoked). The resolver uses
  // it so that revoking a secret can never re-enable an environment fallback.
  async hasHistory(ref:VaultRef):Promise<boolean>{
    validateRef(ref.legalEntityId,ref.provider,ref.name);
    const r=await this.db.query(
      "SELECT 1 FROM credential_vault WHERE legal_entity_id=$1 AND provider=$2 AND name=$3 LIMIT 1",
      [ref.legalEntityId,ref.provider,ref.name]);
    return r.rows.length>0;
  }

  // Metadata only (never ciphertext or plaintext); for operators and diagnostics.
  async list(legalEntityId?:string):Promise<Array<{legalEntityId:string;provider:string;name:string;
    secretVersion:number;keyVersion:number;status:string;createdAt:Date;createdBy:string}>>{
    if(legalEntityId&&!UUID.test(legalEntityId))throw new VaultError("VAULT_ENTITY_INVALID");
    const r=await this.db.query(
      `SELECT legal_entity_id,provider,name,secret_version,key_version,status,created_at,created_by
         FROM credential_vault WHERE ($1::uuid IS NULL OR legal_entity_id=$1::uuid)
        ORDER BY legal_entity_id,provider,name,secret_version`,[legalEntityId??null]);
    return r.rows.map(x=>({legalEntityId:x.legal_entity_id,provider:x.provider,name:x.name,
      secretVersion:x.secret_version,keyVersion:x.key_version,status:x.status,createdAt:x.created_at,createdBy:x.created_by}));
  }

  // Re-encrypts every ACTIVE secret under the keyring's active key version.
  // Run after adding a new key and before dropping the old one. One undecryptable
  // row never blocks the rest: it is reported in `failed` and left untouched.
  async rotateKeys(actor:string):Promise<{rotated:number;failed:Array<VaultRef&{code:string}>}>{
    const rows=(await this.db.query(
      `SELECT legal_entity_id,provider,name FROM credential_vault
        WHERE status='ACTIVE' AND key_version<>$1`,[this.keyring.activeVersion])).rows;
    let rotated=0;const failed:Array<VaultRef&{code:string}>=[];
    for(const r of rows){
      const ref={legalEntityId:r.legal_entity_id,provider:r.provider,name:r.name};
      try{
        this.cache.delete(this.k(ref));
        const cur=await this.getWithVersion({...ref,actor});
        if(cur){await this.put({...ref,actor,secret:cur.secret,expectedActiveVersion:cur.secretVersion});rotated++;}
      }catch(e){
        failed.push({...ref,code:e instanceof VaultError?e.code:"VAULT_ROTATION_FAILED"});
      }
    }
    return {rotated,failed};
  }

  private decryptRow(ref:VaultRef,row:any):SecretFields{
    const ad=aad(ref.legalEntityId,ref.provider,ref.name,row.secret_version,row.key_version);
    const dek=open(this.keyring.key(row.key_version),row.dek_nonce,row.wrapped_dek,row.dek_tag,ad);
    try{
      const plain=open(dek,row.nonce,row.ciphertext,row.auth_tag,ad);
      try{return Object.freeze(JSON.parse(plain.toString("utf8")) as Record<string,string>);}
      finally{plain.fill(0);}
    }finally{dek.fill(0);}
  }

  private async audit(db:Queryable,actor:string,action:string,credentialId:string){
    await db.query(
      `INSERT INTO audit_log(actor,action,entity_type,entity_id,source,result)
       VALUES ($1,$2,'credential_vault',$3,'credential_vault','OK')`,[actor,action,credentialId]);
  }
}
