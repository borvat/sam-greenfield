import type { AccessTokenProvider } from "../../google-auth/src/refreshToken";

export class GmailApiClient{
  constructor(private readonly options:{
    tokens:AccessTokenProvider;
    userId?:string;
    baseUrl?:string;
    fetchImpl?:typeof fetch;
  }){}

  private async request(path:string,init:RequestInit={}):Promise<any>{
    const token=await this.options.tokens.getAccessToken();
    const fetchImpl=this.options.fetchImpl??fetch;
    const response=await fetchImpl(
      `${(this.options.baseUrl??"https://gmail.googleapis.com/gmail/v1").replace(/\/$/,"")}/users/${encodeURIComponent(this.options.userId??"me")}${path}`,
      {
        ...init,
        headers:{
          authorization:`Bearer ${token}`,
          ...(init.body?{"content-type":"application/json"}:{}),
          ...(init.headers??{})
        }
      }
    );
    const body:any=await response.json().catch(()=>({}));
    if(!response.ok){
      throw new Error(
        `Gmail API HTTP ${response.status}: ${String(body?.error?.message??body?.message??"unknown").slice(0,500)}`
      );
    }
    return body;
  }

  sendRaw(raw:string):Promise<any>{
    return this.request("/messages/send",{
      method:"POST",
      body:JSON.stringify({raw})
    });
  }

  listMessages(input:{query?:string;limit:number}):Promise<any>{
    if(!Number.isInteger(input.limit)||input.limit<1||input.limit>20) throw new Error("Gmail read limit must be between 1 and 20");
    const params=new URLSearchParams({maxResults:String(input.limit)});
    if(input.query) params.set("q",input.query);
    return this.request(`/messages?${params}`);
  }

  getMessageMetadata(id:string):Promise<any>{
    if(!id.trim()) throw new Error("Gmail metadata requires message_id");
    const params=new URLSearchParams({format:"metadata"});
    for(const header of ["From","To","Subject","Date"]) params.append("metadataHeaders",header);
    return this.request(`/messages/${encodeURIComponent(id)}?${params}`);
  }

  async getMessage(id:string):Promise<any|null>{
    try{
      return await this.request(`/messages/${encodeURIComponent(id)}?format=minimal`);
    }catch(err){
      if(err instanceof Error&&err.message.includes("HTTP 404")) return null;
      throw err;
    }
  }

  listByRfc822MessageId(messageId:string):Promise<any>{
    const query=encodeURIComponent(`rfc822msgid:${messageId}`);
    return this.request(`/messages?maxResults=1&labelIds=SENT&q=${query}`);
  }
}
