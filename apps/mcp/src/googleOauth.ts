import type {IncomingMessage,ServerResponse} from "node:http";
import type {SamGoogleConnection} from "../../production/src/samGoogleConnection";
import type {RegisteredChatGPTTool} from "../../chatgpt-tools/src/types";
function json(res:ServerResponse,status:number,data:unknown){
 res.statusCode=status;res.setHeader("content-type","application/json");res.end(JSON.stringify(data));
}
export function googleConnectionTools(connection:SamGoogleConnection):RegisteredChatGPTTool[]{
 return [{definition:{name:"sam_google_authorize",description:"Create a ten-minute Google consent URL for SAM's independent read-only connection. Owner must open it and grant consent. Does not send mail or modify Drive.",risk:"YELLOW",availability:"AVAILABLE",inputSchema:{type:"object",properties:{},additionalProperties:false}},handler:async()=>({ok:true,data:{authorization_url:await connection.begin(),expires_in_seconds:600}})},
 {definition:{name:"sam_google_connection_status",description:"Inspect stored Google authorization and discovered read tools without exposing credentials. Does not prove live reads.",risk:"READ",availability:"READ_ONLY",inputSchema:{type:"object",properties:{},additionalProperties:false}},handler:async()=>({ok:true,data:await connection.status()})}];
}
/** Public client metadata + state/issuer checked callback; start/status require existing MCP owner bearer. */
export async function handleGoogleOauth(req:IncomingMessage,res:ServerResponse,connection:SamGoogleConnection,authorized:boolean):Promise<boolean>{
 const u=new URL(req.url??"/",connection.config.publicOrigin);
 if(!u.pathname.startsWith("/google/"))return false;
 res.setHeader("cache-control","no-store");res.setHeader("referrer-policy","no-referrer");res.setHeader("x-content-type-options","nosniff");res.setHeader("content-security-policy","default-src 'none'; frame-ancestors 'none'");
 try{
  if(req.method==="GET"&&u.pathname==="/google/oauth/client.json"){
   json(res,200,{client_id:connection.config.clientId,client_name:"SAM read-only Google connector",client_uri:connection.config.publicOrigin,redirect_uris:[connection.config.redirectUri],grant_types:["authorization_code","refresh_token"],response_types:["code"],token_endpoint_auth_method:"none"});return true;
  }
  if(u.pathname==="/google/oauth/callback"&&req.method==="GET"){
   if(["code","state","iss","error"].some(k=>u.searchParams.getAll(k).length>1))throw new Error("INVALID_CALLBACK");
   if(u.searchParams.has("error"))throw new Error("CONSENT_NOT_GRANTED");
   await connection.finish({state:u.searchParams.get("state")??"",code:u.searchParams.get("code")??"",issuer:u.searchParams.get("iss")??""});
   // Remove the one-time code from the address bar before rendering anything.
   res.statusCode=303;res.setHeader("location","/google/connected");res.end();return true;
  }
  if(req.method==="GET"&&u.pathname==="/google/connected"){
   res.statusCode=200;res.setHeader("content-type","text/html; charset=utf-8");res.end("<!doctype html><html lang=en><meta charset=utf-8><title>SAM Google</title><p>Authorization callback completed. Return to SAM to verify the connection and live reads.</p></html>");return true;
  }
  if(!authorized){json(res,401,{error:"unauthorized"});return true}
  if(req.method==="POST"&&u.pathname==="/google/oauth/start"){
   json(res,200,{authorization_url:await connection.begin(),expires_in_seconds:600});return true;
  }
  if(req.method==="GET"&&u.pathname==="/google/status"){
   json(res,200,await connection.status());return true;
  }
  json(res,404,{error:"not_found"});return true;
 }catch{
  // Never echo provider error bodies, authorization codes, state, or tokens.
  json(res,400,{error:"GOOGLE_AUTHORIZATION_FAILED",message:"Authorization was not completed. Request a new consent link from SAM."});return true;
 }
}
