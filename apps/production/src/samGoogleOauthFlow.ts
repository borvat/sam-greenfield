/** Framework-neutral SAM-only OAuth integration boundary.
 * HTTP routes must call start only after authenticating the SAM owner.
 * Callback must stay bound to the same configured client and redirect URI.
 */
import {createPkceRequest,redeemPkceCode} from "./samGoogleOauthPkce";
import {consumeOAuthTxn,hashState,type OAuthTxnStore} from "./samGoogleOauthState";

export interface SamGoogleTokenSink {
 saveRefresh(input:{ownerId:string;clientId:string;refreshToken:string}):Promise<void>;
}
export interface SamGoogleOauthFlowConfig{
 ownerId:string;
 clientId:string;
 redirectUri:string;
 transactions:OAuthTxnStore;
 tokens:SamGoogleTokenSink;
}
export async function beginSamGoogleOauth(config:SamGoogleOauthFlowConfig):Promise<string>{
 if(!config.ownerId?.trim())throw new Error("SAM_GOOGLE_OWNER_REQUIRED");
 const result=await createPkceRequest({
  clientId:config.clientId,redirectUri:config.redirectUri,
  stateStore:async(state,verifier)=>{
   const id=hashState(state);
   await config.transactions.put(id,{
    stateHash:id,verifier,redirectUri:config.redirectUri,createdAt:Date.now()
   });
  }
 });
 return result.authorizationUrl;
}
export async function finishSamGoogleOauth(config:SamGoogleOauthFlowConfig,input:{state:string;code:string}):Promise<"AUTHORIZED">{
 if(!input.state||!input.code)throw new Error("OAUTH_CALLBACK_FIELDS_REQUIRED");
 const transaction=await consumeOAuthTxn({store:config.transactions,state:input.state});
 if(transaction.redirectUri!==config.redirectUri)throw new Error("OAUTH_CALLBACK_REDIRECT_MISMATCH");
 const issued=await redeemPkceCode({
  code:input.code,state:input.state,storedState:input.state,
  verifier:transaction.verifier,clientId:config.clientId,
  redirectUri:transaction.redirectUri
 });
 // A renewable SAM runtime connection is not possible without a refresh grant.
 if(!issued.refresh_token)throw new Error("SAM_MCP_OFFLINE_REFRESH_TOKEN_REQUIRED");
 await config.tokens.saveRefresh({
  ownerId:config.ownerId,clientId:config.clientId,
  refreshToken:issued.refresh_token
 });
 return "AUTHORIZED";
}
