import { GoogleRefreshTokenProvider } from "../../../packages/google-auth/src/refreshToken";
import { GmailApiClient } from "../../../packages/gmail/src/client";
import type { ProductionBundle } from "./types";

export const GMAIL_READ_VERIFICATION_CONTRACTS=["gmail_list_messages","gmail_get_metadata"].map(capabilityId=>({
  capabilityId,description:"Verify Gmail read by independent API readback",
  verificationMethod:"api_readback" as const,requiredEvidenceFields:{readback:"boolean"},
  independentQueryTemplate:{api:"gmail",method:"GET"}
}));

export function withGmailReadFromEnv(bundle:ProductionBundle,env:NodeJS.ProcessEnv=process.env):ProductionBundle{
  const clientId=env.GOOGLE_OAUTH_CLIENT_ID?.trim(),clientSecret=env.GOOGLE_OAUTH_CLIENT_SECRET?.trim(),refreshToken=env.GOOGLE_OAUTH_REFRESH_TOKEN?.trim();
  if(!clientId&&!clientSecret&&!refreshToken) return bundle;
  if(!clientId||!clientSecret||!refreshToken) throw new Error("Gmail read requires all three Google OAuth credentials");
  const client=new GmailApiClient({tokens:new GoogleRefreshTokenProvider({clientId,clientSecret,refreshToken}),userId:env.GMAIL_USER_ID?.trim()||"me"});
  const metadata=async(id:string)=>{
    const message=await client.getMessageMetadata(id);
    if(message.id!==id) throw new Error("Gmail metadata returned a mismatched message id");
    return message;
  };
  const ids=["gmail_list_messages","gmail_get_metadata"];
  const read=async(capabilityId:string,params:Record<string,any>)=>{
    if(capabilityId==="gmail_get_metadata") return metadata(String(params.message_id??""));
    const listing=await client.listMessages({query:params.query?String(params.query):undefined,limit:Number(params.limit??5)});
    if(!Array.isArray(listing.messages)&&listing.messages!==undefined) throw new Error("Gmail list returned invalid messages");
    const messages=[];
    for(const message of listing.messages??[]){
      if(typeof message.id!=="string") throw new Error("Gmail list returned a message without id");
      messages.push(await metadata(message.id));
    }
    return {messages,next_page_token:listing.nextPageToken??null};
  };
  return {...bundle,
    capabilities:[...bundle.capabilities,...ids.map(capabilityId=>({capabilityId,authorityClass:"GREEN" as const,specialistAgentId:"communications",specialistVersion:"1.0.0"}))],
    toolDefinitions:[...bundle.toolDefinitions,...ids.map(capabilityId=>({capabilityId,authorityClass:"GREEN" as const,sideEffect:false}))],
    toolAdapters:[...bundle.toolAdapters,...ids.map(capabilityId=>({capabilityId,async execute(request){
      const result=await read(capabilityId,request.params);
      return {result,evidence:{readback:true,provider_message_ids:capabilityId==="gmail_get_metadata"?[result.id]:result.messages.map(m=>m.id)}};
    }}))],
    verificationAdapters:[...(bundle.verificationAdapters??[]),...ids.map(capabilityId=>({capabilityId,async verify(input){
      const expected=input.execution.evidence?.provider_message_ids;
      if(!Array.isArray(expected)) return {result:"INCONCLUSIVE" as const,evidence:{reason:"missing_message_ids"},verifier:"gmail-independent-readback"};
      if(expected.some(id=>typeof id!=="string")) throw new Error("Invalid Gmail verification message id");
      for(const id of expected){
        const message=await client.getMessageMetadata(id);
        if(message.id!==id) return {result:"FAILED" as const,evidence:{reason:"message_id_mismatch"},verifier:"gmail-independent-readback"};
      }
      if(expected.length===0){
        const again=await read(capabilityId,input.execution.params??{});
        if((again.messages??[]).length!==0) return {result:"INCONCLUSIVE" as const,evidence:{reason:"mailbox_changed"},verifier:"gmail-independent-readback"};
      }
      return {result:"VERIFIED" as const,evidence:{readback:true,message_count:expected.length,method:"independent_message_get"},verifier:"gmail-independent-readback"};
    }}))]
  };
}
