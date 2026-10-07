import { escapeXml,findFirst,normalizeList,parseSoap } from "./xml";

export interface EBoekhoudenCredentials{
  username:string;
  securityCode1:string;
  securityCode2:string;
  source?:string;
}

export interface InvoiceFilter{
  invoiceNumber?:string;
  relationCode?:string;
  dateFrom?:string;
  dateTo?:string;
}

export interface MutationFilter{
  mutationNumber?:number;
  mutationNumberFrom?:number;
  mutationNumberTo?:number;
  invoiceNumber?:string;
  dateFrom?:string;
  dateTo?:string;
}

function date(value:string|undefined):string{
  if(!value) return "";
  if(!/^\d{4}-\d{2}-\d{2}$/.test(value)){
    throw new Error("Date must be YYYY-MM-DD");
  }
  return value;
}

function soapEnvelope(body:string):string{
  return `<?xml version="1.0" encoding="utf-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:soap="http://www.e-boekhouden.nl/soap">
  <soapenv:Header/>
  <soapenv:Body>
    ${body}
  </soapenv:Body>
</soapenv:Envelope>`;
}

export class EBoekhoudenSoapClient{
  constructor(private readonly options:{
    credentials:EBoekhoudenCredentials;
    endpoint?:string;
    fetchImpl?:typeof fetch;
    timeoutMs?:number;
  }){}

  private async call(action:string,body:string):Promise<any>{
    const fetchImpl=this.options.fetchImpl??fetch;
    const controller=new AbortController();
    const timer=setTimeout(()=>controller.abort(),this.options.timeoutMs??60_000);
    try{
      const response=await fetchImpl(
        this.options.endpoint??"https://soap.e-boekhouden.nl/soap.asmx",
        {
          method:"POST",
          headers:{
            "content-type":"text/xml; charset=utf-8",
            SOAPAction:`http://www.e-boekhouden.nl/soap/${action}`
          },
          body:soapEnvelope(body),
          signal:controller.signal
        }
      );
      const text=await response.text();
      if(!response.ok){
        throw new Error(`e-Boekhouden HTTP ${response.status}: ${text.slice(0,500)}`);
      }
      const parsed=parseSoap(text);
      const fault=findFirst(parsed,"Fault");
      if(fault) throw new Error(`e-Boekhouden SOAP fault: ${JSON.stringify(fault).slice(0,500)}`);
      return parsed;
    }finally{
      clearTimeout(timer);
    }
  }

  async openSession():Promise<string>{
    const c=this.options.credentials;
    const parsed=await this.call("OpenSession",`
<soap:OpenSession>
  <soap:Username>${escapeXml(c.username)}</soap:Username>
  <soap:SecurityCode1>${escapeXml(c.securityCode1)}</soap:SecurityCode1>
  <soap:SecurityCode2>${escapeXml(c.securityCode2)}</soap:SecurityCode2>
  <soap:Source>${escapeXml(c.source??"SAM")}</soap:Source>
</soap:OpenSession>`);
    const session=String(findFirst(parsed,"SessionID")??"").trim();
    if(!session) throw new Error("e-Boekhouden OpenSession returned no SessionID");
    return session;
  }

  async closeSession(sessionId:string):Promise<void>{
    await this.call("CloseSession",`
<soap:CloseSession>
  <soap:SessionID>${escapeXml(sessionId)}</soap:SessionID>
</soap:CloseSession>`);
  }

  private async withSession<T>(fn:(sessionId:string)=>Promise<T>):Promise<T>{
    const sessionId=await this.openSession();
    try{
      return await fn(sessionId);
    }finally{
      await this.closeSession(sessionId);
    }
  }

  async getInvoices(filter:InvoiceFilter={}):Promise<any[]>{
    return this.withSession(async(sessionId)=>{
      const parsed=await this.call("GetFacturen",`
<soap:GetFacturen>
  <soap:SessionID>${escapeXml(sessionId)}</soap:SessionID>
  <soap:SecurityCode2>${escapeXml(this.options.credentials.securityCode2)}</soap:SecurityCode2>
  <soap:cFilter>
    <soap:Factuurnummer>${escapeXml(filter.invoiceNumber??"")}</soap:Factuurnummer>
    <soap:Relatiecode>${escapeXml(filter.relationCode??"")}</soap:Relatiecode>
    <soap:DatumVan>${date(filter.dateFrom)}</soap:DatumVan>
    <soap:DatumTm>${date(filter.dateTo)}</soap:DatumTm>
  </soap:cFilter>
</soap:GetFacturen>`);
      return normalizeList(findFirst(parsed,"cFactuur"));
    });
  }

  async getMutations(filter:MutationFilter={}):Promise<any[]>{
    return this.withSession(async(sessionId)=>{
      const parsed=await this.call("GetMutaties",`
<soap:GetMutaties>
  <soap:SessionID>${escapeXml(sessionId)}</soap:SessionID>
  <soap:SecurityCode2>${escapeXml(this.options.credentials.securityCode2)}</soap:SecurityCode2>
  <soap:cFilter>
    <soap:MutatieNr>${filter.mutationNumber??0}</soap:MutatieNr>
    <soap:MutatieNrVan>${filter.mutationNumberFrom??0}</soap:MutatieNrVan>
    <soap:MutatieNrTm>${filter.mutationNumberTo??0}</soap:MutatieNrTm>
    <soap:Factuurnummer>${escapeXml(filter.invoiceNumber??"")}</soap:Factuurnummer>
    <soap:DatumVan>${date(filter.dateFrom)}</soap:DatumVan>
    <soap:DatumTm>${date(filter.dateTo)}</soap:DatumTm>
  </soap:cFilter>
</soap:GetMutaties>`);
      return normalizeList(findFirst(parsed,"cMutatie"));
    });
  }

  async getOpenItems(kind:"Debiteuren"|"Crediteuren"):Promise<any[]>{
    return this.withSession(async(sessionId)=>{
      const parsed=await this.call("GetOpenPosten",`
<soap:GetOpenPosten>
  <soap:SessionID>${escapeXml(sessionId)}</soap:SessionID>
  <soap:SecurityCode2>${escapeXml(this.options.credentials.securityCode2)}</soap:SecurityCode2>
  <soap:OpSoort>${kind}</soap:OpSoort>
</soap:GetOpenPosten>`);
      const raw=findFirst(parsed,"cOpenPost");
      return normalizeList(raw);
    });
  }
}
