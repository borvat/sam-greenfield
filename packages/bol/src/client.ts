import type { BolAccessTokenProvider } from "./auth";

export type BolFulfilment="FBR"|"FBB"|"ALL";
export type BolOrderStatus="OPEN"|"SHIPPED"|"ALL";

function page(value:unknown):number{
  const n=Number(value??1);
  if(!Number.isInteger(n)||n<1) return 1;
  return n;
}

function changeInterval(value:unknown):number|undefined{
  if(value===undefined||value===null||value==="") return undefined;
  const n=Number(value);
  if(!Number.isFinite(n)) throw new Error("change_interval_minute must be numeric");
  return Math.max(1,Math.min(60,Math.trunc(n)));
}

function fulfilment(value:unknown,allowAll:boolean):BolFulfilment{
  const v=String(value??(allowAll?"ALL":"FBR"));
  const allowed=allowAll?["FBR","FBB","ALL"]:["FBR","FBB"];
  if(!allowed.includes(v)) throw new Error("Invalid fulfilment_method");
  return v as BolFulfilment;
}

function orderStatus(value:unknown):BolOrderStatus{
  const v=String(value??"OPEN");
  if(!["OPEN","SHIPPED","ALL"].includes(v)) throw new Error("Invalid order status");
  return v as BolOrderStatus;
}

export class BolRetailerClient{
  constructor(private readonly options:{
    tokens:BolAccessTokenProvider;
    apiRoot?:string;
    fetchImpl?:typeof fetch;
  }){}

  private async request(path:string,retry401=true):Promise<any>{
    const token=await this.options.tokens.getAccessToken();
    const response=await (this.options.fetchImpl??fetch)(
      `${(this.options.apiRoot??"https://api.bol.com").replace(/\/$/,"")}${path}`,
      {
        method:"GET",
        headers:{
          authorization:`Bearer ${token}`,
          accept:"application/vnd.retailer.v10+json",
          "user-agent":"sam-executive/1.0"
        }
      }
    );

    if(response.status===401 && retry401){
      this.options.tokens.invalidate();
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
  }={}):Promise<any>{
    const url=new URL("http://local/retailer/orders");
    url.searchParams.set("page",String(page(input.page)));
    url.searchParams.set("fulfilment-method",fulfilment(input.fulfilmentMethod,true));
    url.searchParams.set("status",orderStatus(input.status));
    const interval=changeInterval(input.changeIntervalMinute);
    if(interval!==undefined){
      url.searchParams.set("change-interval-minute",String(interval));
    }
    return this.request(`/retailer/orders?${url.searchParams.toString()}`);
  }

  getOrder(orderId:string):Promise<any>{
    if(!orderId.trim()) throw new Error("order_id is required");
    return this.request(`/retailer/orders/${encodeURIComponent(orderId.trim())}`);
  }

  listReturns(input:{
    page?:unknown;
    handled?:unknown;
    fulfilmentMethod?:unknown;
  }={}):Promise<any>{
    const url=new URL("http://local/retailer/returns");
    url.searchParams.set("page",String(page(input.page)));
    if(input.handled!==undefined&&input.handled!==null&&input.handled!==""){
      if(typeof input.handled!=="boolean") throw new Error("handled must be boolean");
      url.searchParams.set("handled",String(input.handled));
    }
    if(input.fulfilmentMethod!==undefined&&input.fulfilmentMethod!==null&&input.fulfilmentMethod!==""){
      url.searchParams.set("fulfilment-method",fulfilment(input.fulfilmentMethod,false));
    }
    return this.request(`/retailer/returns?${url.searchParams.toString()}`);
  }

  getReturn(returnId:string):Promise<any>{
    if(!returnId.trim()) throw new Error("return_id is required");
    return this.request(`/retailer/returns/${encodeURIComponent(returnId.trim())}`);
  }

  getProcessStatus(processStatusId:string):Promise<any>{
    if(!processStatusId.trim()) throw new Error("process_status_id is required");
    return this.request(`/shared/process-status/${encodeURIComponent(processStatusId.trim())}`);
  }
}
