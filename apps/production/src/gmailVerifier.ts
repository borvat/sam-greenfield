import type { GmailApiClient } from "../../../packages/gmail/src/client";
import { deterministicMessageId } from "../../../packages/gmail/src/mime";
import type { VerificationAdapter } from "./types";

export class GmailSentVerificationAdapter implements VerificationAdapter{
  readonly capabilityId="gmail_send";

  constructor(private readonly client:GmailApiClient){}

  async verify(input:Parameters<VerificationAdapter["verify"]>[0]){
    const providerId=
      typeof input.execution.evidence?.provider_message_id==="string"
        ? input.execution.evidence.provider_message_id
        : null;

    if(providerId){
      const found=await this.client.getMessage(providerId);
      if(found){
        return {
          result:"VERIFIED" as const,
          evidence:{
            provider_message_id:providerId,
            method:"gmail_message_get"
          },
          verifier:"gmail-independent-readback"
        };
      }
    }

    const key=input.execution.operationKeyRef;
    if(!key){
      return {
        result:"INCONCLUSIVE" as const,
        evidence:{reason:"missing_operation_key"},
        verifier:"gmail-independent-readback"
      };
    }

    const messageId=deterministicMessageId(key);
    const listed=await this.client.listByRfc822MessageId(messageId);
    const found=Array.isArray(listed?.messages)&&listed.messages[0];

    return found?.id
      ? {
          result:"VERIFIED" as const,
          evidence:{
            provider_message_id:found.id,
            rfc822_message_id:messageId,
            method:"gmail_rfc822msgid_search"
          },
          verifier:"gmail-independent-readback"
        }
      : {
          result:"FAILED" as const,
          evidence:{
            rfc822_message_id:messageId,
            method:"gmail_rfc822msgid_search",
            found:false
          },
          verifier:"gmail-independent-readback"
        };
  }
}
