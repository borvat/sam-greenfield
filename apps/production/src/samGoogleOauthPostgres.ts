/** Durable, encrypted SAM credentials. Refreshes serialize across all processes. */
import type {Pool} from "pg";
import type {OAuthTxn,OAuthTxnStore} from "./samGoogleOauthState";
import {openSamGoogleToken,sealSamGoogleToken} from "./samGoogleTokenCrypto";
import {refreshSamMcpAccessToken} from "./samGoogleOauthPkce";
import type {McpTool} from "./samGoogleMcpBridge";
export class PostgresSamGoogleOauthStore implements OAuthTxnStore {
 constructor(private readonly db:Pool,private readonly encryptionKey:Buffer){}
 async put(id:string,txn:OAuthTxn):Promise<void>{
   if(!txn.ownerId||!txn.clientId)throw new Error("OAUTH_TRANSACTION_BINDING_REQUIRED");
   const sealed=sealSamGoogleToken(txn.verifier,this.encryptionKey,"pkce:"+id);
   await this.db.query("DELETE FROM sam_google_oauth_states WHERE created_at < now()-interval '10 minutes'");
   await this.db.query("INSERT INTO sam_google_oauth_states(state_hash,verifier_sealed,redirect_uri,created_at,owner_id,client_id) VALUES($1,$2,$3,$4,$5,$6)",[id,sealed,txn.redirectUri,new Date(txn.createdAt),txn.ownerId,txn.clientId]);
 }
 async take(id:string):Promise<OAuthTxn|undefined>{
   const result=await this.db.query("DELETE FROM sam_google_oauth_states WHERE state_hash=$1 RETURNING *",[id]);
   if(!result.rowCount)return undefined;
   const r=result.rows[0];
   return {stateHash:r.state_hash,verifier:openSamGoogleToken(r.verifier_sealed,this.encryptionKey,"pkce:"+id),redirectUri:r.redirect_uri,createdAt:new Date(r.created_at).getTime(),ownerId:r.owner_id,clientId:r.client_id};
 }
 private context(ownerId:string,clientId:string){return "sam-google:"+ownerId+":"+clientId}
 async saveRefresh(input:{ownerId:string;clientId:string;refreshToken:string}):Promise<void>{
   if(!input.ownerId||!input.clientId||!input.refreshToken)throw new Error("SAM_GOOGLE_OAUTH_RECORD_INVALID");
   const sealed=sealSamGoogleToken(input.refreshToken,this.encryptionKey,this.context(input.ownerId,input.clientId));
   const client=await this.db.connect();
   try{
    await client.query("BEGIN");
    await client.query("SELECT pg_advisory_xact_lock(hashtextextended($1,0))",[this.context(input.ownerId,input.clientId)]);
    await client.query("INSERT INTO sam_google_oauth_tokens(owner_id,client_id,refresh_sealed,updated_at) VALUES($1,$2,$3,now()) ON CONFLICT(owner_id,client_id) DO UPDATE SET refresh_sealed=EXCLUDED.refresh_sealed,access_sealed=NULL,access_expires_at=NULL,discovered_tools=NULL,updated_at=now()",[input.ownerId,input.clientId,sealed]);
    await client.query("COMMIT");
   }catch(e){await client.query("ROLLBACK");throw e}finally{client.release()}
 }
 async loadRefresh(ownerId:string,clientId:string):Promise<string|undefined>{
   const r=await this.db.query("SELECT refresh_sealed FROM sam_google_oauth_tokens WHERE owner_id=$1 AND client_id=$2",[ownerId,clientId]);
   return r.rowCount?openSamGoogleToken(r.rows[0].refresh_sealed,this.encryptionKey,this.context(ownerId,clientId)):undefined;
 }
 async accessToken(ownerId:string,clientId:string):Promise<string>{
   const client=await this.db.connect(),context=this.context(ownerId,clientId);
   try{
    await client.query("BEGIN");
    await client.query("SELECT pg_advisory_xact_lock(hashtextextended($1,0))",[context]);
    const r=await client.query("SELECT * FROM sam_google_oauth_tokens WHERE owner_id=$1 AND client_id=$2 FOR UPDATE",[ownerId,clientId]);
    if(!r.rowCount)throw new Error("SAM_GOOGLE_AUTH_REQUIRED");
    const row=r.rows[0];
    if(row.access_sealed&&new Date(row.access_expires_at).getTime()>Date.now()+60_000){
     const token=openSamGoogleToken(row.access_sealed,this.encryptionKey,"access:"+context);
     await client.query("COMMIT");return token;
    }
    const issued=await refreshSamMcpAccessToken({clientId,refreshToken:openSamGoogleToken(row.refresh_sealed,this.encryptionKey,context)});
    const expiry=Number(issued.expires_in??300);
    if(!Number.isFinite(expiry)||expiry<=0)throw new Error("OAUTH_TOKEN_EXPIRY_INVALID");
    await client.query("UPDATE sam_google_oauth_tokens SET refresh_sealed=$3,access_sealed=$4,access_expires_at=$5,updated_at=now() WHERE owner_id=$1 AND client_id=$2",[ownerId,clientId,issued.refresh_token?sealSamGoogleToken(issued.refresh_token,this.encryptionKey,context):row.refresh_sealed,sealSamGoogleToken(issued.access_token,this.encryptionKey,"access:"+context),new Date(Date.now()+expiry*1000)]);
    await client.query("COMMIT");return issued.access_token;
   }catch(e){await client.query("ROLLBACK");throw e}finally{client.release()}
 }
 async invalidateAccess(ownerId:string,clientId:string):Promise<void>{
   await this.db.query("UPDATE sam_google_oauth_tokens SET access_sealed=NULL,access_expires_at=NULL WHERE owner_id=$1 AND client_id=$2",[ownerId,clientId]);
 }
 async saveTools(ownerId:string,clientId:string,tools:McpTool[]):Promise<void>{
   await this.db.query("UPDATE sam_google_oauth_tokens SET discovered_tools=$3::jsonb WHERE owner_id=$1 AND client_id=$2",[ownerId,clientId,JSON.stringify(tools)]);
 }
 async tools(ownerId:string,clientId:string):Promise<McpTool[]>{
   const r=await this.db.query("SELECT discovered_tools FROM sam_google_oauth_tokens WHERE owner_id=$1 AND client_id=$2",[ownerId,clientId]);
   return r.rows[0]?.discovered_tools??[];
 }
}
