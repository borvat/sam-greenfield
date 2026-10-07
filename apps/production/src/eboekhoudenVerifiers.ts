import type { EBoekhoudenSoapClient } from "../../../packages/eboekhouden/src/client";
import type { VerificationAdapter } from "./types";

function firstKey(value:any):string{
  if(!value||typeof value!=="object") return JSON.stringify(value);
  const preferred=["Factuurnummer","Mutatienr","MutatieNr","MutFactuur","Relcode"];
  for(const key of preferred){
    if(value[key]!==undefined) return `${key}:${String(value[key])}`;
  }
  return JSON.stringify(value);
}

function sameSample(a:any[],b:any[]):boolean{
  if(a.length!==b.length) return false;
  const ak=a.slice(0,10).map(firstKey);
  const bk=b.slice(0,10).map(firstKey);
  return JSON.stringify(ak)===JSON.stringify(bk);
}

export class EBoekhoudenInvoicesVerifier implements VerificationAdapter{
  readonly capabilityId="eboekhouden_get_invoices";
  constructor(private readonly client:EBoekhoudenSoapClient){}

  async verify(input:Parameters<VerificationAdapter["verify"]>[0]){
    const p=input.execution.params;
    const read=await this.client.getInvoices({
      invoiceNumber:p.invoice_number?String(p.invoice_number):undefined,
      relationCode:p.relation_code?String(p.relation_code):undefined,
      dateFrom:p.date_from?String(p.date_from):undefined,
      dateTo:p.date_to?String(p.date_to):undefined
    });
    const expected=Number(input.execution.evidence?.count??-1);
    const ok=expected<0||read.length>=expected;
    return {
      result:ok?"VERIFIED" as const:"FAILED" as const,
      evidence:{provider_count:read.length,execution_count:expected,method:"eboekhouden_getfacturen_readback"},
      verifier:"eboekhouden-independent-readback"
    };
  }
}

export class EBoekhoudenMutationsVerifier implements VerificationAdapter{
  readonly capabilityId="eboekhouden_get_mutations";
  constructor(private readonly client:EBoekhoudenSoapClient){}

  async verify(input:Parameters<VerificationAdapter["verify"]>[0]){
    const p=input.execution.params;
    const read=await this.client.getMutations({
      mutationNumber:p.mutation_number?Number(p.mutation_number):undefined,
      mutationNumberFrom:p.mutation_number_from?Number(p.mutation_number_from):undefined,
      mutationNumberTo:p.mutation_number_to?Number(p.mutation_number_to):undefined,
      invoiceNumber:p.invoice_number?String(p.invoice_number):undefined,
      dateFrom:p.date_from?String(p.date_from):undefined,
      dateTo:p.date_to?String(p.date_to):undefined
    });
    const expected=Number(input.execution.evidence?.count??-1);
    const ok=expected<0||read.length>=expected;
    return {
      result:ok?"VERIFIED" as const:"FAILED" as const,
      evidence:{provider_count:read.length,execution_count:expected,method:"eboekhouden_getmutaties_readback"},
      verifier:"eboekhouden-independent-readback"
    };
  }
}

export class EBoekhoudenOpenItemsVerifier implements VerificationAdapter{
  readonly capabilityId="eboekhouden_get_open_items";
  constructor(private readonly client:EBoekhoudenSoapClient){}

  async verify(input:Parameters<VerificationAdapter["verify"]>[0]){
    const kind=String(input.execution.params?.kind??"");
    if(kind!=="Debiteuren"&&kind!=="Crediteuren"){
      return {result:"INCONCLUSIVE" as const,evidence:{reason:"invalid_kind"},verifier:"eboekhouden-independent-readback"};
    }
    const read=await this.client.getOpenItems(kind);
    const expected=Number(input.execution.evidence?.count??-1);
    const ok=expected<0||read.length>=expected;
    return {
      result:ok?"VERIFIED" as const:"FAILED" as const,
      evidence:{provider_count:read.length,execution_count:expected,kind,method:"eboekhouden_getopenposten_readback"},
      verifier:"eboekhouden-independent-readback"
    };
  }
}
