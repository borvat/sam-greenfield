import type {JsonSchema} from "../../mcp/src/schema";
// Descriptions for the existing connected adapters, bounded before planning/execution.
const text={type:'string',minLength:1,maxLength:500};
const id={type:'string',minLength:1,maxLength:150};
const page={type:'integer',minimum:1,maximum:100};
const boolean={type:'boolean'};
const fulfilment={type:'string',enum:['FBR','FBB']};
const condition={type:'string',enum:['NEW','AS_NEW','GOOD','REASONABLE','MODERATE']};
const date={type:'string',minLength:10,maxLength:10};
const schemas:Record<string,{properties:Record<string,JsonSchema>;required?:string[]}>= {
 drive_search:{properties:{query:text,parent_id:id,limit:{type:'integer',minimum:1,maximum:100}}},
 drive_get_metadata:{properties:{file_id:id},required:['file_id']},
 bol_list_orders:{properties:{page,fulfilment_method:fulfilment,status:{type:'string',enum:['OPEN','ALL']},change_interval_minute:{type:'integer',minimum:1,maximum:60},latest_change_date:text,vvb_only:boolean}},
 bol_list_returns:{properties:{page,handled:boolean,fulfilment_method:fulfilment}},
 bol_list_invoices:{properties:{period_start_date:date,period_end_date:date},required:['period_start_date','period_end_date']},
 bol_get_retailer:{properties:{}},bol_get_order:{properties:{order_id:id},required:['order_id']},
 bol_list_shipments:{properties:{page,fulfilment_method:fulfilment}},
 bol_get_commission:{properties:{ean:id,unit_price:{type:'number',minimum:0.01,maximum:100000},condition},required:['ean','unit_price']},
 bol_get_competing_offers:{properties:{ean:id,page,country_code:{type:'string',enum:['NL','BE']},best_offer_only:boolean,condition},required:['ean']},
};
for(const name of ['eboekhouden_list_mutations','eboekhouden_outstanding_invoices','eboekhouden_list_ledgers','eboekhouden_list_relations'])
 schemas[name]={properties:{limit:{type:'integer',minimum:1,maximum:100},offset:{type:'integer',minimum:0,maximum:10000}}};
export function connectedParameters(id:string):JsonSchema|undefined{const schema=schemas[id];return schema?{type:'object',additionalProperties:false,required:schema.required??[],properties:schema.properties}:undefined;}
