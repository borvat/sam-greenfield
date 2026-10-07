import type { ToolAdapter,ToolExecutionRequest,ToolExecutionResult } from "../../../packages/tool-gateway/src/types";
import type { EBoekhoudenClient } from "../../../packages/eboekhouden/src/client";

function page(request:ToolExecutionRequest){
  return {
    limit:request.params.limit,
    offset:request.params.offset
  };
}

abstract class ReadAdapter implements ToolAdapter{
  abstract readonly capabilityId:string;
  constructor(protected readonly client:EBoekhoudenClient){}
  abstract execute(request:ToolExecutionRequest):Promise<ToolExecutionResult>;
  protected output(data:any):ToolExecutionResult{
    const items=Array.isArray(data)
      ? data
      : Array.isArray(data?.items)
        ? data.items
        : Array.isArray(data?.results)
          ? data.results
          : [];
    return {
      result:{data},
      evidence:{readback:true,result_count:items.length}
    };
  }
}

export class EBoekhoudenMutationsAdapter extends ReadAdapter{
  readonly capabilityId="eboekhouden_list_mutations";
  async execute(request:ToolExecutionRequest){
    return this.output(await this.client.listMutations(page(request)));
  }
}

export class EBoekhoudenOutstandingInvoicesAdapter extends ReadAdapter{
  readonly capabilityId="eboekhouden_outstanding_invoices";
  async execute(request:ToolExecutionRequest){
    return this.output(await this.client.getOutstandingInvoices(page(request)));
  }
}

export class EBoekhoudenLedgersAdapter extends ReadAdapter{
  readonly capabilityId="eboekhouden_list_ledgers";
  async execute(request:ToolExecutionRequest){
    return this.output(await this.client.listLedgers(page(request)));
  }
}

export class EBoekhoudenRelationsAdapter extends ReadAdapter{
  readonly capabilityId="eboekhouden_list_relations";
  async execute(request:ToolExecutionRequest){
    return this.output(await this.client.listRelations(page(request)));
  }
}
