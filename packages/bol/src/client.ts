export interface BolAccessTokenProvider{
  getAccessToken():Promise<string>;
}

export class BolClientCredentialsProvider implements BolAccessTokenProvider{
  private cached:{token:string;expiresAt:number}|null=null;

  constructor(private readonly options:{
    clientId:string;
    clientSecret:string;
    tokenUrl?:string;
    fetchImpl?:typeof fetch;
  }){}

  async getAccessToken():Promise<string>{
    const now=Date.now();
    if(this.cached&&this.cached.expiresAt>now+30_000) return this.cached.token;

    const fetchImpl=this.options.fetchImpl??fetch;
    const basic=Buffer.from(`${this.options.clientId}:${this.options.clientSecret}`).toString("base64");
    const response=await fetchImpl(
      this.options.tokenUrl??"https://login.bol.com/token",
      {
        method:"POST",
        headers:{
          authorization:`Basic ${basic}`,
          accept:"application/json",
          "content-type":"application/x-www-form-urlencoded"
        },
        body:"grant_type=client_credentials"
      }
    );
    const body:any=await response.json().catch(()=>({}));
    if(!response.ok||typeof body?.access_token!=="string"){
      throw new Error(`bol OAuth HTTP ${response.status}: ${String(body?.error_description??body?.error??"token unavailable").slice(0,500)}`);
    }
    const expiresIn=Math.max(60,Number(body.expires_in??299));
    this.cached={token:body.access_token,expiresAt:now+expiresIn*1000};
    return body.access_token;
  }
}

export class BolRetailerApiClient{
  constructor(private readonly options:{
    tokens:BolAccessTokenProvider;
    baseUrl?:string;
    fetchImpl?:typeof fetch;
  }){}

  private async get(path:string,params:Record<string,string|number|undefined>={}):Promise<any>{
    const token=await this.options.tokens.getAccessToken();
    const base=(this.options.baseUrl??"https://api.bol.com/retailer").replace(/\/$/,"");
    const url=new URL(`${base}${path}`);
    for(const [key,value] of Object.entries(params)){
      if(value!==undefined) url.searchParams.set(key,String(value));
    }
    const response=await (this.options.fetchImpl??fetch)(url,{
      headers:{
        authorization:`Bearer ${token}`,
        accept:"application/vnd.retailer.v10+json"
      }
    });
    const body:any=await response.json().catch(()=>({}));
    if(!response.ok){
      throw new Error(`bol Retailer API HTTP ${response.status}: ${String(body?.detail??body?.title??body?.message??"unknown").slice(0,500)}`);
    }
    return body;
  }

  listOrders(input:{page?:number;fulfilmentMethod?:string;status?:string;changeIntervalMinute?:number}={}){
    return this.get("/orders",{
      page:Math.max(1,Math.min(1000,input.page??1)),
      "fulfilment-method":input.fulfilmentMethod??"ALL",
      status:input.status??"OPEN",
      "change-interval-minute":input.changeIntervalMinute===undefined
        ? undefined
        : Math.max(1,Math.min(60,input.changeIntervalMinute))
    });
  }

  getOrder(orderId:string){
    return this.get(`/orders/${encodeURIComponent(orderId)}`);
  }

  listReturns(input:{page?:number;handled?:boolean}={}){
    return this.get("/returns",{
      page:Math.max(1,Math.min(1000,input.page??1)),
      handled:input.handled===undefined?undefined:String(input.handled)
    });
  }

  listShipments(input:{page?:number;fulfilmentMethod?:string}={}){
    return this.get("/shipments",{
      page:Math.max(1,Math.min(1000,input.page??1)),
      "fulfilment-method":input.fulfilmentMethod??"ALL"
    });
  }

  getOffer(offerId:string){
    return this.get(`/offers/${encodeURIComponent(offerId)}`);
  }
}
