export class EBoekhoudenClient{
  private session:{token:string;expiresAt:number}|null=null;

  constructor(private readonly options:{
    apiToken:string;
    source?:string;
    baseUrl?:string;
    fetchImpl?:typeof fetch;
  }){
    const source=(options.source??"SAM").trim();
    if(!/^[A-Za-z0-9_ ]{1,10}$/.test(source)){
      throw new Error("EBOEKHOUDEN_SOURCE must be 1-10 letters, digits, underscores, or spaces");
    }
  }

  private get baseUrl():string{
    return (this.options.baseUrl??"https://api.e-boekhouden.nl").replace(/\/$/,"");
  }

  private async startSession(force=false):Promise<string>{
    const now=Date.now();
    if(!force&&this.session&&this.session.expiresAt-now>60_000){
      return this.session.token;
    }

    const fetchImpl=this.options.fetchImpl??fetch;
    const response=await fetchImpl(`${this.baseUrl}/v1/session`,{
      method:"POST",
      headers:{"content-type":"application/json"},
      body:JSON.stringify({
        accessToken:this.options.apiToken,
        source:(this.options.source??"SAM").trim()
      })
    });
    const body:any=await response.json().catch(()=>({}));
    if(!response.ok||typeof body?.token!=="string"){
      throw new Error(
        `e-Boekhouden session HTTP ${response.status}: ${String(body?.message??body?.error??"unknown").slice(0,500)}`
      );
    }

    const expiresIn=Number(body?.expiresIn??body?.expires_in??3600);
    this.session={
      token:body.token,
      expiresAt:Date.now()+Math.max(60,expiresIn)*1000
    };
    return body.token;
  }

  private async request(path:string,retry401=true):Promise<any>{
    const token=await this.startSession();
    const fetchImpl=this.options.fetchImpl??fetch;
    const response=await fetchImpl(`${this.baseUrl}${path}`,{
      headers:{authorization:token}
    });

    if(response.status===401&&retry401){
      await this.startSession(true);
      return this.request(path,false);
    }

    const body:any=await response.json().catch(()=>({}));
    if(!response.ok){
      throw new Error(
        `e-Boekhouden API HTTP ${response.status}: ${String(body?.message??body?.error??"unknown").slice(0,500)}`
      );
    }
    return body;
  }

  private bounded(limit:unknown,offset:unknown){
    const l=Math.max(1,Math.min(100,Number(limit??50)||50));
    const o=Math.max(0,Number(offset??0)||0);
    return {limit:l,offset:o};
  }

  listMutations(input:{limit?:unknown;offset?:unknown}={}):Promise<any>{
    const page=this.bounded(input.limit,input.offset);
    return this.request(`/v1/mutation?limit=${page.limit}&offset=${page.offset}`);
  }

  getOutstandingInvoices(input:{limit?:unknown;offset?:unknown}={}):Promise<any>{
    const page=this.bounded(input.limit,input.offset);
    return this.request(`/v1/mutation/invoice/outstanding?limit=${page.limit}&offset=${page.offset}`);
  }

  listLedgers(input:{limit?:unknown;offset?:unknown}={}):Promise<any>{
    const page=this.bounded(input.limit,input.offset);
    return this.request(`/v1/ledger?limit=${page.limit}&offset=${page.offset}`);
  }

  listRelations(input:{limit?:unknown;offset?:unknown}={}):Promise<any>{
    const page=this.bounded(input.limit,input.offset);
    return this.request(`/v1/relation?limit=${page.limit}&offset=${page.offset}`);
  }
}
