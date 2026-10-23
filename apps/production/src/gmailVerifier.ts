import type {GmailApiClient} from '../../../packages/gmail/src/client';
import {deterministicMessageId} from '../../../packages/gmail/src/mime';
import type {VerificationAdapter} from './types';
import {sha256Hex} from '../../../packages/shared/src/stableJson';

function addresses(value:unknown):string[]{return (Array.isArray(value)?value.join(','):String(value??'')).split(',').map(x=>x.trim().toLowerCase()).filter(Boolean).sort();}
export function verifyGmailContent(message:any,params:Record<string,unknown>,key:string|null){
  const headers=new Map<string,string>((message?.payload?.headers??[]).map((h:any)=>[String(h.name).toLowerCase(),String(h.value)]));
  const plain=(part:any,depth=0):string|undefined=>{
    if(depth>8)return;
    if(part?.mimeType==='text/plain'&&typeof part?.body?.data==='string')return Buffer.from(part.body.data,'base64url').toString('utf8');
    for(const child of part?.parts??[]){const text=plain(child,depth+1);if(text!==undefined)return text;}
  };
  const text=plain(message?.payload),normalized=(x:unknown)=>String(x??'').replace(/\r\n/g,'\n');
  if(text===undefined||!headers.has('to')||!headers.has('subject')||!key)return {result:'INCONCLUSIVE' as const,evidence:{reason:'GMAIL_CONTENT_NOT_OBSERVABLE',readback:true}};
  const match=Array.isArray(message.labelIds)&&message.labelIds.includes('SENT')&&
    headers.get('message-id')===deterministicMessageId(key)&&
    headers.get('x-sam-operation-key')===key&&
    sha256Hex(addresses(headers.get('to')))===sha256Hex(addresses(params.to))&&
    sha256Hex(addresses(headers.get('cc')))===sha256Hex(addresses(params.cc))&&
    sha256Hex(addresses(headers.get('bcc')))===sha256Hex(addresses(params.bcc))&&
    String(headers.get('reply-to')??'')===String(params.reply_to??'').replace(/[\r\n]+/g,' ').trim()&&
    headers.get('subject')===String(params.subject??'').replace(/[\r\n]+/g,' ').trim()&&
    normalized(text)===normalized(params.text);
  return {result:match?'VERIFIED' as const:'FAILED' as const,evidence:{reason:match?'CONTENT_MATCH':'CONTENT_MISMATCH',readback:true,contentMatch:match}};
}
export class GmailSentVerificationAdapter implements VerificationAdapter{
  readonly capabilityId='gmail_send';
  constructor(private readonly client:GmailApiClient){}
  async verify(input:Parameters<VerificationAdapter['verify']>[0]){
    let id=typeof input.execution.evidence.provider_message_id==='string'?input.execution.evidence.provider_message_id:undefined;
    const key=input.execution.operationKeyRef;
    if(!id&&key){const listed=await this.client.listByRfc822MessageId(deterministicMessageId(key));id=listed?.messages?.[0]?.id;}
    if(!id)return {result:'INCONCLUSIVE' as const,evidence:{reason:'MESSAGE_NOT_OBSERVABLE'},verifier:'gmail-independent-readback'};
    const message=await this.client.getMessageContent(id);
    const outcome=verifyGmailContent(message,input.execution.params,key);
    return {...outcome,evidence:{...outcome.evidence,provider_message_id:id,method:'gmail_content_readback'},verifier:'gmail-independent-readback'};
  }
}
