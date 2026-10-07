import type { ToolAdapter,ToolExecutionRequest,ToolExecutionResult } from "../../../packages/tool-gateway/src/types";
import type { EBoekhoudenSoapClient } from "../../../packages/eboekhouden/src/client";

function requireLimit(value:unknown,defaultValue=100,max=500):number{
  if(value===undefined||value===null) return defaultValue;
  const n=Number(value);
  if(!Number.isInteger(n)||n<=0) throw new Error("limit must be a positive integer");
  return Math.min(n,max);
}

export class EBoekhoudenInvoicesAdapter implements ToolAdapter{
  readonly capabilityId="eboekhouden_get_invoices";
  constructor(private readonly client:EBoekhoudenSoapClient){}

  async execute(request:ToolExecutionRequest):Promise<ToolExecutionResult>{
    const limit=requireLimit(request.params.limit);
    const items=await this.client.getInvoices({
      invoiceNumber:request.params.invoice_number?String(request.params.invoice_number):undefined,
      relationCode:request.params.relation_code?String(request.params.relation_code):undefined,
      dateFrom:request.params.date_from?String(request.params.date_from):undefined,
      dateTo:request.params.date_to?String(request.params.date_to):undefined
    });
    const bounded=items.slice(0,limit);
    return {result:{items:bounded,count:bounded.length},evidence:{readback:true,count:bounded.length}};
  }
}

export class EBoekhoudenMutationsAdapter implements ToolAdapter{
  readonly capabilityId="eboekhouden_get_mutations";
  constructor(private readonly client:EBoekhoudenSoapClient){}

  async execute(request:ToolExecutionRequest):Promise<ToolExecutionResult>{
    const limit=requireLimit(request.params.limit);
    const items=await this.client.getMutations({
      mutationNumber:request.params.mutation_number?Number(request.params.mutation_number):undefined,
      mutationNumberFrom:request.params.mutation_number_from?Number(request.params.mutation_number_from):undefined,
      mutationNumberTo:request.params.mutation_number_to?Number(request.params.mutation_number_to):undefined,
      invoiceNumber:request.params.invoice_number?String(request.params.invoice_number):undefined,
      dateFrom:request.params.date_from?String(request.params.date_from):undefined,
      dateTo:request.params.date_to?String(request.params.date_to):undefined
    });
    const bounded=items.slice(0,limit);
    return {result:{items:bounded,count:bounded.length},evidence:{readback:true,count:bounded.length}};
  }
}

export class EBoekhoudenOpenItemsAdapter implements ToolAdapter{
  readonly capabilityId="eboekhouden_get_open_items";
  constructor(private readonly client:EBoekhoudenSoapClient){}

  async execute(request:ToolExecutionRequest):Promise<ToolExecutionResult>{
    const kind=String(request.params.kind??"");
    if(kind!=="Debiteuren"&&kind!=="Crediteuren"){
      throw new Error("kind must be Debiteuren or Crediteuren");
    }
    const limit=requireLimit(request.params.limit);
    const items=await this.client.getOpenItems(kind);
    const bounded=items.slice(0,limit);
    return {result:{items:bounded,count:bounded.length,kind},evidence:{readback:true,count:bounded.length,kind}};
  }
}
