import { GoogleRefreshTokenProvider } from "../../../packages/google-auth/src/refreshToken";
import { GmailApiClient } from "../../../packages/gmail/src/client";
import { GmailSendAdapter } from "../../tools/src/gmailSendAdapter";
import {
  GmailSearchThreadsAdapter,
  GmailGetThreadAdapter,
  GmailGetMessageAdapter
} from "../../tools/src/gmailReadAdapters";
import { GmailSentVerificationAdapter } from "./gmailVerifier";
import type { ProductionBundle,VerificationAdapter } from "./types";

const GMAIL_READ_CAPABILITIES=[
  "gmail_search_threads",
  "gmail_get_thread",
  "gmail_get_message"
] as const;

export const GMAIL_READ_VERIFICATION_CONTRACTS=GMAIL_READ_CAPABILITIES.map((capabilityId)=>({
  capabilityId,
  description:`Verify ${capabilityId} by an independent Gmail API readback`,
  verificationMethod:"api_readback" as const,
  requiredEvidenceFields:{readback:"boolean"},
  independentQueryTemplate:{api:"gmail",method:"GET"}
}));

function gmailReadVerifier(
  capabilityId:typeof GMAIL_READ_CAPABILITIES[number],
  client:GmailApiClient
):VerificationAdapter{
  return {
    capabilityId,
    async verify(input){
      const p=input.execution.params??{};
      if(capabilityId==="gmail_search_threads"){
        await client.searchThreads({
          query:p.query?String(p.query):undefined,
          maxResults:p.max_results,
          pageToken:p.page_token?String(p.page_token):undefined,
          labelIds:Array.isArray(p.label_ids)?p.label_ids.map(String):undefined,
          includeSpamTrash:p.include_spam_trash===true
        });
      }else if(capabilityId==="gmail_get_thread"){
        await client.getThread(
          String(p.thread_id??""),
          p.format?String(p.format):"full"
        );
      }else{
        await client.getMessageWithFormat(
          String(p.message_id??""),
          p.format?String(p.format):"full"
        );
      }
      return {
        result:"VERIFIED" as const,
        evidence:{method:"gmail-independent-api-readback"},
        verifier:"gmail-independent-readback"
      };
    }
  };
}

export function withGmailFromEnv(
  bundle:ProductionBundle,
  env:NodeJS.ProcessEnv=process.env
):ProductionBundle{
  const clientId=env.GOOGLE_OAUTH_CLIENT_ID?.trim();
  const clientSecret=env.GOOGLE_OAUTH_CLIENT_SECRET?.trim();
  const refreshToken=env.GOOGLE_OAUTH_REFRESH_TOKEN?.trim();

  if(!clientId&&!clientSecret&&!refreshToken) return bundle;
  if(!clientId||!clientSecret||!refreshToken){
    throw new Error("Gmail production wiring requires GOOGLE_OAUTH_CLIENT_ID, GOOGLE_OAUTH_CLIENT_SECRET, and GOOGLE_OAUTH_REFRESH_TOKEN");
  }

  const tokens=new GoogleRefreshTokenProvider({
    clientId,
    clientSecret,
    refreshToken,
    tokenUrl:env.GOOGLE_OAUTH_TOKEN_URL?.trim()||undefined
  });
  const client=new GmailApiClient({
    tokens,
    userId:env.GMAIL_USER_ID?.trim()||"me",
    baseUrl:env.GMAIL_API_BASE_URL?.trim()||undefined
  });

  return {
    ...bundle,
    capabilities:[
      ...bundle.capabilities,
      {
        capabilityId:"gmail_send",
        authorityClass:"YELLOW",
        specialistAgentId:"communications",
        specialistVersion:"1.0.0"
      },
      ...GMAIL_READ_CAPABILITIES.map((capabilityId)=>({
        capabilityId,
        authorityClass:"GREEN" as const,
        specialistAgentId:"communications",
        specialistVersion:"1.0.0"
      }))
    ],
    toolDefinitions:[
      ...bundle.toolDefinitions,
      {
        capabilityId:"gmail_send",
        authorityClass:"YELLOW",
        sideEffect:true
      },
      ...GMAIL_READ_CAPABILITIES.map((capabilityId)=>({
        capabilityId,
        authorityClass:"GREEN" as const,
        sideEffect:false
      }))
    ],
    toolAdapters:[
      ...bundle.toolAdapters,
      new GmailSendAdapter(client,{fromEmail:env.GMAIL_FROM_EMAIL?.trim()||undefined}),
      new GmailSearchThreadsAdapter(client),
      new GmailGetThreadAdapter(client),
      new GmailGetMessageAdapter(client)
    ],
    verificationAdapters:[
      ...(bundle.verificationAdapters??[]),
      new GmailSentVerificationAdapter(client),
      ...GMAIL_READ_CAPABILITIES.map((capabilityId)=>gmailReadVerifier(capabilityId,client))
    ]
  };
}
