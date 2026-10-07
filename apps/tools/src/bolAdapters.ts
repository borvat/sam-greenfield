import type { ToolAdapter,ToolExecutionRequest,ToolExecutionResult } from "../../../packages/tool-gateway/src/types";
import type { BolRetailerClient } from "../../../packages/bol/src/client";

abstract class BolReadAdapter implements ToolAdapter{
  abstract readonly capabilityId:string;
  constructor(protected readonly client:BolRetailerClient){}
  abstract execute(request:ToolExecutionRequest):Promise<ToolExecutionResult>;

  protected output(data:any,ids:string[]=[]):ToolExecutionResult{
    return {
      result:{data},
      evidence:{
        readback:true,
        sample_ids:ids.slice(0,25)
      }
    };
  }
}

export class BolListOrdersAdapter extends BolReadAdapter{
  readonly capabilityId="bol_list_orders";
  async execute(request:ToolExecutionRequest){
    const data=await this.client.listOrders({
      page:request.params.page,
      fulfilmentMethod:request.params.fulfilment_method,
      status:request.params.status,
      changeIntervalMinute:request.params.change_interval_minute
    });
    const ids=(data?.orders??[]).map((x:any)=>String(x?.orderId??"")).filter(Boolean);
    return this.output(data,ids);
  }
}

export class BolGetOrderAdapter extends BolReadAdapter{
  readonly capabilityId="bol_get_order";
  async execute(request:ToolExecutionRequest){
    const data=await this.client.getOrder(String(request.params.order_id??""));
    return this.output(data,[String(data?.orderId??request.params.order_id??"")].filter(Boolean));
  }
}

export class BolListReturnsAdapter extends BolReadAdapter{
  readonly capabilityId="bol_list_returns";
  async execute(request:ToolExecutionRequest){
    const data=await this.client.listReturns({
      page:request.params.page,
      handled:request.params.handled,
      fulfilmentMethod:request.params.fulfilment_method
    });
    const ids=(data?.returns??[]).map((x:any)=>String(x?.returnId??"")).filter(Boolean);
    return this.output(data,ids);
  }
}

export class BolGetReturnAdapter extends BolReadAdapter{
  readonly capabilityId="bol_get_return";
  async execute(request:ToolExecutionRequest){
    const data=await this.client.getReturn(String(request.params.return_id??""));
    return this.output(data,[String(data?.returnId??request.params.return_id??"")].filter(Boolean));
  }
}

export class BolGetProcessStatusAdapter extends BolReadAdapter{
  readonly capabilityId="bol_get_process_status";
  async execute(request:ToolExecutionRequest){
    const data=await this.client.getProcessStatus(String(request.params.process_status_id??""));
    return this.output(data,[String(data?.processStatusId??request.params.process_status_id??"")].filter(Boolean));
  }
}
