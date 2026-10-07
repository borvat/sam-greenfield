import type { ToolAdapter,ToolExecutionRequest,ToolExecutionResult } from "../../../packages/tool-gateway/src/types";
import type { BolRetailerClient } from "../../../packages/bol/src/client";

abstract class BolReadAdapter implements ToolAdapter{
  abstract readonly capabilityId:string;
  constructor(protected readonly client:BolRetailerClient){}
  abstract execute(request:ToolExecutionRequest):Promise<ToolExecutionResult>;
  protected output(data:any):ToolExecutionResult{
    return {
      result:{data},
      evidence:{readback:true}
    };
  }
}

export class BolOrdersAdapter extends BolReadAdapter{
  readonly capabilityId="bol_list_orders";
  async execute(request:ToolExecutionRequest){
    return this.output(await this.client.listOrders({
      page:request.params.page,
      fulfilmentMethod:request.params.fulfilment_method,
      status:request.params.status,
      changeIntervalMinute:request.params.change_interval_minute,
      latestChangeDate:request.params.latest_change_date,
      vvbOnly:request.params.vvb_only
    }));
  }
}

export class BolReturnsAdapter extends BolReadAdapter{
  readonly capabilityId="bol_list_returns";
  async execute(request:ToolExecutionRequest){
    return this.output(await this.client.listReturns({
      page:request.params.page,
      handled:request.params.handled,
      fulfilmentMethod:request.params.fulfilment_method
    }));
  }
}

export class BolInvoicesAdapter extends BolReadAdapter{
  readonly capabilityId="bol_list_invoices";
  async execute(request:ToolExecutionRequest){
    return this.output(await this.client.listInvoices({
      periodStartDate:request.params.period_start_date,
      periodEndDate:request.params.period_end_date
    }));
  }
}

export class BolRetailerAdapter extends BolReadAdapter{
  readonly capabilityId="bol_get_retailer";
  async execute(){
    return this.output(await this.client.getCurrentRetailer());
  }
}
