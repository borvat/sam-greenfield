export class BolAccessTokenProvider{
  private cached:{token:string;expiresAt:number}|null=null;

  constructor(private readonly options:{
    clientId:string;
    clientSecret:string;
    tokenUrl?:string;
    fetchImpl?:typeof fetch;
  }){}

  invalidate():void{
    this.cached=null;
  }

  async getAccessToken():Promise<string>{
    if(this.cached && this.cached.expiresAt-Date.now()>30_000){
      return this.cached.token;
    }

    const basic=Buffer.from(
      `${this.options.clientId}:${this.options.clientSecret}`,
      "utf8"
    ).toString("base64");

    const response=await (this.options.fetchImpl??fetch)(
      this.options.tokenUrl??"https://login.bol.com/token",
      {
        method:"POST",
        headers:{
          authorization:`Basic ${basic}`,
          accept:"application/json",
          "content-type":"application/x-www-form-urlencoded"
        },
        body:new URLSearchParams({grant_type:"client_credentials"})
      }
    );

    const body:any=await response.json().catch(()=>({}));
    if(!response.ok || typeof body?.access_token!=="string"){
      throw new Error(
        `bol OAuth HTTP ${response.status}: ${String(body?.error_description??body?.error??"unknown").slice(0,300)}`
      );
    }

    const expiresIn=Math.max(60,Number(body?.expires_in??299));
    this.cached={
      token:body.access_token,
      expiresAt:Date.now()+expiresIn*1000
    };
    return body.access_token;
  }
}
