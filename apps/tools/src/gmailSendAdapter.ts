import type { ReconciliableToolAdapter,ToolExecutionRequest,ToolExecutionResult,ToolReconciliationResult } from "../../../packages/tool-gateway/src/types";
import type { GmailApiClient } from "../../../packages/gmail/src/client";
import { buildRawMessage,deterministicMessageId } from "../../../packages/gmail/src/mime";

export class GmailSendAdapter implements ReconciliableToolAdapter{
  readonly capabilityId="gmail_send";

  constructor(
    private readonly client:GmailApiClient,
    private readonly options:{fromEmail?:string}={}
  ){}

  async execute(request:ToolExecutionRequest):Promise<ToolExecutionResult>{
    const params=request.params;
    const built=buildRawMessage({
      idempotencyKey:request.idempotencyKey,
      to:params.to,
      cc:params.cc,
      bcc:params.bcc,
      subject:String(params.subject??""),
      text:String(params.text??""),
      from:this.options.fromEmail,
      replyTo:params.reply_to?String(params.reply_to):undefined
    });

    const sent=await this.client.sendRaw(built.raw);
    if(typeof sent?.id!=="string") throw new Error("Gmail send response missing message id");

    return {
      providerReference:sent.id,
      result:{
        message_id:sent.id,
        thread_id:sent.threadId??null
      },
      evidence:{
        provider_message_id:sent.id,
        provider_thread_id:sent.threadId??null,
        rfc822_message_id:built.messageId
      }
    };
  }

  async reconcile(input:{
    capabilityId:string;
    providerReference:string|null;
    idempotencyKey:string;
  }):Promise<ToolReconciliationResult>{
    if(input.providerReference){
      const found=await this.client.getMessage(input.providerReference);
      if(found){
        return {
          result:"CONFIRMED",
          evidence:{
            provider_message_id:input.providerReference,
            reconciliation:"message_get"
          }
        };
      }
    }

    const messageId=deterministicMessageId(input.idempotencyKey);
    const listed=await this.client.listByRfc822MessageId(messageId);
    const found=Array.isArray(listed?.messages)&&listed.messages.length>0
      ? listed.messages[0]
      : null;

    if(found?.id){
      return {
        result:"CONFIRMED",
        evidence:{
          provider_message_id:found.id,
          provider_thread_id:found.threadId??null,
          rfc822_message_id:messageId,
          reconciliation:"rfc822msgid_search"
        }
      };
    }

    return {
      result:"NOT_FOUND",
      evidence:{
        rfc822_message_id:messageId,
        reconciliation:"rfc822msgid_search"
      }
    };
  }
}
