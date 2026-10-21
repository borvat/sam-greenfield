/** PostgreSQL storage for SAM-only MCP authorization state and sealed tokens.
 * Run its migration before use; credentials are never returned by listing API.
 */
import type {Pool} from "pg";
import type {OAuthTxn,OAuthTxnStore} from "./samGoogleOauthState";
import {openSamGoogleToken,sealSamGoogleToken} from "./samGoogleTokenCrypto";
export class PostgresSamGoogleOauthStore implements OAuthTxnStore {
 constructor(private readonly db:Pool,private readonly encryptionKey:Buffer){}
 async put(id:string,txn:OAuthTxn):Promise<void>{
   const sealed=sealSamGoogleToken(txn.verifier,this.encryptionKey,"pkce:"+id);
   await this.db.query("INSERT INTO sam_google_oauth_states(state_hash,verifier_sealed,redirect_uri,created_at) VALUES($1,$2,$3,$4)",[id,sealed,txn.redirectUri,new Date(txn.createdAt)]);
 }
 async take(id:string):Promise<OAuthTxn|undefined>{
   const result=await this.db.query("DELETE FROM sam_google_oauth_states WHERE state_hash=$1 RETURNING state_hash,verifier_sealed,redirect_uri,created_at",[id]);
   if(!result.rowCount)return undefined;
   const r=result.rows[0];
   return {stateHash:r.state_hash,verifier:openSamGoogleToken(r.verifier_sealed,this.encryptionKey,"pkce:"+id),redirectUri:r.redirect_uri,createdAt:new Date(r.created_at).getTime()};
 }
 async saveRefresh(input:{ownerId:string;clientId:string;refreshToken:string}):Promise<void>{
   if(!input.ownerId||!input.clientId||!input.refreshToken)throw new Error("SAM_GOOGLE_OAUTH_RECORD_INVALID");
   const context="sam-google:"+input.ownerId+":"+input.clientId;
   const sealed=sealSamGoogleToken(input.refreshToken,this.encryptionKey,context);
   await this.db.query("INSERT INTO sam_google_oauth_tokens(owner_id,client_id,refresh_sealed,updated_at) VALUES($1,$2,$3,now()) ON CONFLICT(owner_id,client_id) DO UPDATE SET refresh_sealed=EXCLUDED.refresh_sealed,updated_at=now()",[input.ownerId,input.clientId,sealed]);
 }
 async loadRefresh(ownerId:string,clientId:string):Promise<string|undefined>{
   const r=await this.db.query("SELECT refresh_sealed FROM sam_google_oauth_tokens WHERE owner_id=$1 AND client_id=$2",[ownerId,clientId]);
   return r.rowCount?openSamGoogleToken(r.rows[0].refresh_sealed,this.encryptionKey,"sam-google:"+ownerId+":"+clientId):undefined;
 }
}
