export interface AccessTokenProvider{
  getAccessToken():Promise<string>;
}

export class GoogleRefreshTokenProvider implements AccessTokenProvider{
  private cached:{token:string;expiresAt:number}|null=null;

  constructor(private readonly options:{
    clientId:string;
    clientSecret:string;
    refreshToken:string;
    tokenUrl?:string;
    fetchImpl?:typeof fetch;
  }){}

  async getAccessToken():Promise<string>{
    const now=Date.now();
    if(this.cached && this.cached.expiresAt-now>60_000) return this.cached.token;

    const fetchImpl=this.options.fetchImpl??fetch;
    const response=await fetchImpl(
      this.options.tokenUrl??"https://oauth2.googleapis.com/token",
      {
        method:"POST",
        headers:{"content-type":"application/x-www-form-urlencoded"},
        body:new URLSearchParams({
          client_id:this.options.clientId,
          client_secret:this.options.clientSecret,
          refresh_token:this.options.refreshToken,
          grant_type:"refresh_token"
        })
      }
    );

    const body:any=await response.json().catch(()=>({}));
    if(!response.ok || typeof body?.access_token!=="string"){
      throw new Error(
        `Google OAuth refresh failed: HTTP ${response.status} ${String(body?.error_description??body?.error??"unknown").slice(0,300)}`
      );
    }

    const expiresIn=Number(body?.expires_in??3600);
    this.cached={
      token:body.access_token,
      expiresAt:Date.now()+Math.max(60,expiresIn)*1000
    };
    return body.access_token;
  }
}
