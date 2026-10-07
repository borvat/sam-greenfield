import type { ToolAdapter,ToolExecutionRequest,ToolExecutionResult } from "../../../packages/tool-gateway/src/types";
import type { BolRetailerApiClient } from "../../../packages/bol/src/client";

abstract class BolReadAdapter implements ToolAdapter{
  abstract readonly capabilityId:string;
  constructor(protected readonly client:BolRetailerApiClient){}
  abstract execute(request:ToolExecutionRequest):Promise<ToolExecutionResult>;
  protected out(result:any):ToolExecutionResult{
    return {result:{data:result},evidence:{readback:true,provider:"bol",api_version:"v10"}};
  }
}
export class BolListOrdersAdapter extends BolReadAdapter{
  readonly capabilityId="bol_list_orders";
  async execute(r:ToolExecutionRequest){return this.out(await this.client.listOrders({page:Number(r.params.page??1),fulfilmentMethod:String(r.params.fulfilment_method??"ALL"),status:String(r.params.status??"OPEN"),changeIntervalMinute:r.params.change_interval_minute===undefined?undefined:Number(r.params.change_interval_minute)}));}
}
export class BolGetOrderAdapter extends BolReadAdapter{
  readonly capabilityId="bol_get_order";
  async execute(r:ToolExecutionRequest){const id=String(r.params.order_id??"").trim();if(!id)throw new Error("bol_get_order requires order_id");return this.out(await this.client.getOrder(id));}
}
export class BolListReturnsAdapter extends BolReadAdapter{
  readonly capabilityId="bol_list_returns";
  async execute(r:ToolExecutionRequest){return this.out(await this.client.listReturns({page:Number(r.params.page??1),handled:r.params.handled===undefined?undefined:Boolean(r.params.handled)}));}
}
export class BolListShipmentsAdapter extends BolReadAdapter{
  readonly capabilityId="bol_list_shipments";
  async execute(r:ToolExecutionRequest){return this.out(await this.client.listShipments({page:Number(r.params.page??1),fulfilmentMethod:String(r.params.fulfilment_method??"ALL")}));}
}
export class BolGetOfferAdapter extends BolReadAdapter{
  readonly capabilityId="bol_get_offer";
  async execute(r:ToolExecutionRequest){const id=String(r.params.offer_id??"").trim();if(!id)throw new Error("bol_get_offer requires offer_id");return this.out(await this.client.getOffer(id));}
}
