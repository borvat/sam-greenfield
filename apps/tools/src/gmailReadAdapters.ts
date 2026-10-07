import type { ToolAdapter,ToolExecutionRequest,ToolExecutionResult } from "../../../packages/tool-gateway/src/types";
import type { GmailApiClient } from "../../../packages/gmail/src/client";

abstract class GmailReadAdapter implements ToolAdapter{
  abstract readonly capabilityId:string;
  constructor(protected readonly client:GmailApiClient){}
  abstract execute(request:ToolExecutionRequest):Promise<ToolExecutionResult>;
  protected output(data:any):ToolExecutionResult{
    return {
      result:{data},
      evidence:{readback:true}
    };
  }
}

export class GmailSearchThreadsAdapter extends GmailReadAdapter{
  readonly capabilityId="gmail_search_threads";
  async execute(request:ToolExecutionRequest){
    return this.output(await this.client.searchThreads({
      query:request.params.query?String(request.params.query):undefined,
      maxResults:request.params.max_results,
      pageToken:request.params.page_token?String(request.params.page_token):undefined,
      labelIds:Array.isArray(request.params.label_ids)
        ? request.params.label_ids.map(String)
        : undefined,
      includeSpamTrash:request.params.include_spam_trash===true
    }));
  }
}

export class GmailGetThreadAdapter extends GmailReadAdapter{
  readonly capabilityId="gmail_get_thread";
  async execute(request:ToolExecutionRequest){
    const threadId=String(request.params.thread_id??"").trim();
    if(!threadId) throw new Error("gmail_get_thread requires thread_id");
    const format=request.params.format?String(request.params.format):"full";
    return this.output(await this.client.getThread(threadId,format));
  }
}

export class GmailGetMessageAdapter extends GmailReadAdapter{
  readonly capabilityId="gmail_get_message";
  async execute(request:ToolExecutionRequest){
    const messageId=String(request.params.message_id??"").trim();
    if(!messageId) throw new Error("gmail_get_message requires message_id");
    const format=request.params.format?String(request.params.format):"full";
    return this.output(await this.client.getMessageWithFormat(messageId,format));
  }
}
