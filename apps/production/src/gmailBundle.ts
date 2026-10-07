import { GoogleRefreshTokenProvider } from "../../../packages/google-auth/src/refreshToken";
import { GmailApiClient } from "../../../packages/gmail/src/client";
import { GmailSendAdapter } from "../../tools/src/gmailSendAdapter";
import { GmailSentVerificationAdapter } from "./gmailVerifier";
import type { ProductionBundle } from "./types";

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
      }
    ],
    toolDefinitions:[
      ...bundle.toolDefinitions,
      {
        capabilityId:"gmail_send",
        authorityClass:"YELLOW",
        sideEffect:true
      }
    ],
    toolAdapters:[
      ...bundle.toolAdapters,
      new GmailSendAdapter(client,{fromEmail:env.GMAIL_FROM_EMAIL?.trim()||undefined})
    ],
    verificationAdapters:[
      ...(bundle.verificationAdapters??[]),
      new GmailSentVerificationAdapter(client)
    ]
  };
}
