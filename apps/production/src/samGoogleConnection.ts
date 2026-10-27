import {pool} from "../../../packages/db/src/client";
import {PostgresSamGoogleOauthStore} from "./samGoogleOauthPostgres";
import {parseSamGoogleEncryptionKey} from "./samGoogleTokenCrypto";
import {beginSamGoogleOauth,finishSamGoogleOauth} from "./samGoogleOauthFlow";
import {SamGoogleMcpBridge,SAM_GOOGLE_ALLOWED_TOOLS,filterReadOnlyTools,type SamGoogleTool} from "./samGoogleMcpBridge";
import type {SamGoogleOauthFlowConfig} from "./samGoogleOauthFlow";
export interface SamGoogleConnectionConfig extends SamGoogleOauthFlowConfig{
 store:PostgresSamGoogleOauthStore;
 publicOrigin:string;
}
export function samGoogleConfigFromEnv(env:NodeJS.ProcessEnv=process.env):SamGoogleConnectionConfig|undefined{
 if(env.SAM_GOOGLE_MCP_ENABLED!=="true"&&env.SAM_GOOGLE_MCP_AUTH_ENABLED!=="true")return undefined;
 const url=new URL(env.SAM_GOOGLE_PUBLIC_ORIGIN??"");
 if(url.protocol!=="https:"||url.username||url.password||url.pathname!=="/"||url.search||url.hash)throw new Error("SAM_GOOGLE_PUBLIC_ORIGIN_INVALID");
 const ownerId=env.SAM_GOOGLE_OWNER_ID?.trim();
 if(!ownerId)throw new Error("SAM_GOOGLE_OWNER_REQUIRED");
 const store=new PostgresSamGoogleOauthStore(pool,parseSamGoogleEncryptionKey(env.SAM_GOOGLE_TOKEN_ENCRYPTION_KEY??""));
 return {ownerId,clientId:url.origin+"/google/oauth/client.json",redirectUri:url.origin+"/google/oauth/callback",publicOrigin:url.origin,store,transactions:store,tokens:store};
}
export class SamGoogleConnection{
 constructor(readonly config:SamGoogleConnectionConfig){}
 begin(){return beginSamGoogleOauth(this.config)}
 async finish(input:{state:string;code:string;issuer:string}){
  await finishSamGoogleOauth(this.config,input);
  const tools=await (await this.bridge()).discover();
  if(tools.length!==SAM_GOOGLE_ALLOWED_TOOLS.length||!SAM_GOOGLE_ALLOWED_TOOLS.every(name=>tools.some(t=>t.name===name)))throw new Error("SAM_GOOGLE_SEVEN_READ_TOOLS_REQUIRED");
  await this.config.store.saveTools(this.config.ownerId,this.config.clientId,tools);
 }
 private async bridge(){return new SamGoogleMcpBridge(await this.config.store.accessToken(this.config.ownerId,this.config.clientId))}
 async read(name:SamGoogleTool,args:Record<string,unknown>):Promise<Record<string,unknown>>{
  try{return await (await this.bridge()).read(name,args) as Record<string,unknown>}
  catch(e){
   if(!(e instanceof Error)||e.message!=="SAM_GOOGLE_AUTH_REQUIRED")throw e;
   await this.config.store.invalidateAccess(this.config.ownerId,this.config.clientId);
   return await (await this.bridge()).read(name,args) as Record<string,unknown>;
  }
 }
 async status(){
  const stored=await this.config.store.tools(this.config.ownerId,this.config.clientId);
  return {configured:true,discoveredReadTools:filterReadOnlyTools(stored).length,authorizationStored:!!await this.config.store.loadRefresh(this.config.ownerId,this.config.clientId),liveReadVerified:false};
 }
}
