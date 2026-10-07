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

  searchThreads(input:{
    query?:string;
    maxResults?:unknown;
    pageToken?:string;
    labelIds?:string[];
    includeSpamTrash?:boolean;
  }={}):Promise<any>{
    const u=new URL("http://local/threads");
    const max=Math.max(1,Math.min(500,Number(input.maxResults??100)||100));
    u.searchParams.set("maxResults",String(max));
    if(input.query?.trim()){
      const q=input.query.trim();
      if(q.length>500) throw new Error("Gmail search query must be <=500 characters");
      u.searchParams.set("q",q);
    }
    if(input.pageToken?.trim()){
      u.searchParams.set("pageToken",input.pageToken.trim().slice(0,2000));
    }
    for(const label of (input.labelIds??[]).slice(0,50)){
      const value=String(label).trim();
      if(value) u.searchParams.append("labelIds",value);
    }
    u.searchParams.set("includeSpamTrash",String(input.includeSpamTrash===true));
    return this.request(`/threads?${u.searchParams.toString()}`);
  }

  getThread(id:string,format="full"):Promise<any>{
    const allowed=["full","metadata","minimal"];
    if(!allowed.includes(format)) throw new Error("Invalid Gmail thread format");
    return this.request(
      `/threads/${encodeURIComponent(id)}?format=${encodeURIComponent(format)}`
    );
  }

  getMessageWithFormat(id:string,format="full"):Promise<any>{
    const allowed=["full","metadata","minimal"];
    if(!allowed.includes(format)) throw new Error("Invalid Gmail message format");
    return this.request(
      `/messages/${encodeURIComponent(id)}?format=${encodeURIComponent(format)}`
    );
  }
}
