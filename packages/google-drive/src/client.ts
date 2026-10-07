import { createHash } from "node:crypto";
import type { AccessTokenProvider } from "../../google-auth/src/refreshToken";

export class GoogleDriveApiClient{
  constructor(private readonly options:{
    tokens:AccessTokenProvider;
    baseUrl?:string;
    fetchImpl?:typeof fetch;
  }){}

  private async request(path:string,init:RequestInit={}):Promise<any>{
    const token=await this.options.tokens.getAccessToken();
    const fetchImpl=this.options.fetchImpl??fetch;
    const response=await fetchImpl(
      `${(this.options.baseUrl??"https://www.googleapis.com/drive/v3").replace(/\/$/,"")}${path}`,
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
        `Google Drive API HTTP ${response.status}: ${String(body?.error?.message??body?.message??"unknown").slice(0,500)}`
      );
    }
    return body;
  }

  getFile(fileId:string):Promise<any>{
    return this.request(
      `/files/${encodeURIComponent(fileId)}?fields=id,name,mimeType,parents,trashed,modifiedTime,webViewLink`
    );
  }

  async search(input:{
    query?:string;
    parentId?:string;
    pageSize?:number;
  }):Promise<any>{
    const clauses=["trashed = false"];
    if(input.query?.trim()){
      const safe=input.query.trim().replace(/'/g,"\\'");
      clauses.push(`name contains '${safe}'`);
    }
    if(input.parentId?.trim()){
      const safe=input.parentId.trim().replace(/'/g,"\\'");
      clauses.push(`'${safe}' in parents`);
    }

    const url=new URL("http://local/files");
    url.searchParams.set("q",clauses.join(" and "));
    url.searchParams.set("pageSize",String(Math.max(1,Math.min(100,input.pageSize??50))));
    url.searchParams.set("fields","files(id,name,mimeType,parents,trashed,modifiedTime,webViewLink),nextPageToken");
    return this.request(`/files?${url.searchParams.toString()}`);
  }

  static operationMarker(operationKey:string):string{
    return createHash("sha256").update(operationKey).digest("hex");
  }

  createFolder(input:{name:string;parentId?:string;operationKey:string}):Promise<any>{
    const body:any={
      name:input.name,
      mimeType:"application/vnd.google-apps.folder",
      appProperties:{
        samOperationKey:GoogleDriveApiClient.operationMarker(input.operationKey)
      }
    };
    if(input.parentId?.trim()) body.parents=[input.parentId.trim()];
    return this.request(
      "/files?fields=id,name,mimeType,parents,webViewLink,appProperties",
      {
        method:"POST",
        body:JSON.stringify(body)
      }
    );
  }

  searchByOperationKey(operationKey:string):Promise<any>{
    const marker=GoogleDriveApiClient.operationMarker(operationKey).replace(/'/g,"\\'");
    const query=encodeURIComponent(
      `trashed = false and appProperties has { key='samOperationKey' and value='${marker}' }`
    );
    return this.request(
      `/files?pageSize=2&fields=files(id,name,mimeType,parents,trashed,webViewLink,appProperties)&q=${query}`
    );
  }
}
