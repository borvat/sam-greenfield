const ACCEPT="application/vnd.retailer.v10+json";

function int(value:unknown,def:number,min:number,max:number):number{
  const n=value===undefined||value===null?def:Number(value);
  if(!Number.isInteger(n)) throw new Error("Expected integer parameter");
  return Math.max(min,Math.min(max,n));
}

function enumValue<T extends string>(
  value:unknown,
  allowed:readonly T[],
  def:T
):T{
  if(value===undefined||value===null||value==="") return def;
  const s=String(value) as T;
  if(!allowed.includes(s)) throw new Error(`Invalid value: ${s}`);
  return s;
}

function isoDate(value:unknown):string|undefined{
  if(value===undefined||value===null||value==="") return undefined;
  const s=String(value);
  if(!/^\d{4}-\d{2}-\d{2}$/.test(s)) throw new Error("Date must be YYYY-MM-DD");
  return s;
}

export class BolRetailerClient{
  private token:{value:string;expiresAt:number}|null=null;

  constructor(private readonly options:{
    clientId:string;
    clientSecret:string;
    tokenUrl?:string;
    baseUrl?:string;
    fetchImpl?:typeof fetch;
  }){}

  private async accessToken(force=false):Promise<string>{
    const now=Date.now();
    if(!force&&this.token&&this.token.expiresAt-now>30_000) return this.token.value;

    const fetchImpl=this.options.fetchImpl??fetch;
    const basic=Buffer.from(
      `${this.options.clientId}:${this.options.clientSecret}`,
      "utf8"
    ).toString("base64");

    const response=await fetchImpl(
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
    if(!response.ok||typeof body?.access_token!=="string"){
      throw new Error(
        `bol OAuth HTTP ${response.status}: ${String(body?.error_description??body?.error??"unknown").slice(0,500)}`
      );
    }

    const expires=Number(body?.expires_in??299);
    this.token={
      value:body.access_token,
      expiresAt:Date.now()+Math.max(30,expires)*1000
    };
    return body.access_token;
  }

  private get baseUrl():string{
    return (this.options.baseUrl??"https://api.bol.com/retailer").replace(/\/$/,"");
  }

  private async request(path:string,retry401=true):Promise<any>{
    const token=await this.accessToken();
    const fetchImpl=this.options.fetchImpl??fetch;
    const response=await fetchImpl(`${this.baseUrl}${path}`,{
      headers:{
        authorization:`Bearer ${token}`,
        accept:ACCEPT
      }
    });

    if(response.status===401&&retry401){
      await this.accessToken(true);
      return this.request(path,false);
    }

    const body:any=await response.json().catch(()=>({}));
    if(!response.ok){
      throw new Error(
        `bol Retailer API HTTP ${response.status}: ${String(body?.detail??body?.title??body?.message??"unknown").slice(0,500)}`
      );
    }
    return body;
  }

  listOrders(input:{
    page?:unknown;
    fulfilmentMethod?:unknown;
    status?:unknown;
    changeIntervalMinute?:unknown;
    latestChangeDate?:unknown;
    vvbOnly?:unknown;
  }={}):Promise<any>{
    const u=new URL("http://local/orders");
    u.searchParams.set("page",String(int(input.page,1,1,200)));
    u.searchParams.set(
      "fulfilment-method",
      enumValue(input.fulfilmentMethod,["FBR","FBB","ALL"] as const,"ALL")
    );
    u.searchParams.set(
      "status",
      enumValue(input.status,["OPEN","SHIPPED","ALL"] as const,"OPEN")
    );
    if(input.changeIntervalMinute!==undefined){
      u.searchParams.set(
        "change-interval-minute",
        String(int(input.changeIntervalMinute,1,1,60))
      );
    }
    if(input.latestChangeDate){
      u.searchParams.set("latest-change-date",String(input.latestChangeDate));
    }
    if(input.vvbOnly!==undefined){
      u.searchParams.set("vvb-only",String(Boolean(input.vvbOnly)));
    }
    return this.request(`/orders?${u.searchParams.toString()}`);
  }

  listReturns(input:{
    page?:unknown;
    handled?:unknown;
    fulfilmentMethod?:unknown;
  }={}):Promise<any>{
    const u=new URL("http://local/returns");
    u.searchParams.set("page",String(int(input.page,1,1,200)));
    if(input.handled!==undefined){
      u.searchParams.set("handled",String(Boolean(input.handled)));
    }
    if(input.fulfilmentMethod){
      u.searchParams.set(
        "fulfilment-method",
        enumValue(input.fulfilmentMethod,["FBR","FBB"] as const,"FBR")
      );
    }
    return this.request(`/returns?${u.searchParams.toString()}`);
  }

  listInvoices(input:{
    periodStartDate?:unknown;
    periodEndDate?:unknown;
  }={}):Promise<any>{
    const start=isoDate(input.periodStartDate);
    const end=isoDate(input.periodEndDate);
    if(Boolean(start)!==Boolean(end)){
      throw new Error("Invoice period start and end must be provided together");
    }
    if(start&&end){
      const diff=(Date.parse(end)-Date.parse(start))/86_400_000;
      if(!Number.isFinite(diff)||diff<0||diff>31){
        throw new Error("Invoice period must be 0-31 days");
      }
    }

    const u=new URL("http://local/invoices");
    if(start&&end){
      u.searchParams.set("period-start-date",start);
      u.searchParams.set("period-end-date",end);
    }
    const q=u.searchParams.toString();
    return this.request(q?`/invoices?${q}`:"/invoices");
  }

  getCurrentRetailer():Promise<any>{
    return this.request("/retailers/current");
  }
}
