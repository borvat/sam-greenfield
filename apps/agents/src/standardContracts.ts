import type {CapabilityDefinition} from './capabilityCatalog';
const text={type:'string',minLength:1,maxLength:2000},page={type:'integer',minimum:1,maximum:1000};
const paging={limit:{type:'integer',minimum:1,maximum:100},offset:{type:'integer',minimum:0,maximum:1000000}};
const recipients={anyOf:[text,{type:'array',minItems:1,maxItems:50,items:text}]};
const fulfilment={type:'string',enum:['FBR','FBB','ALL']};
const entries:Record<string,{description:string;properties:Record<string,unknown>;required?:string[]}>= {
 drive_get_metadata:{description:'Read metadata for one Drive file. Use file_id (fileId is a legacy alias).',properties:{file_id:text,fileId:text}},
 drive_search:{description:'Read bounded Drive filename search results, optionally within a parent.',properties:{query:text,parent_id:text,page_token:text,limit:{type:'integer',minimum:1,maximum:100}}},
 drive_create_folder:{description:'Create one Drive folder after exact owner approval.',properties:{name:text,parent_id:text},required:['name']},
 gmail_send:{description:'Send a plain-text email after exact owner approval of recipients and content.',properties:{to:recipients,cc:recipients,bcc:recipients,subject:text,text:{type:'string',minLength:1,maxLength:100000},reply_to:text},required:['to','subject','text']},
 bol_list_orders:{description:'Read a bounded page of retailer orders.',properties:{page,fulfilment_method:fulfilment,status:{type:'string',enum:['OPEN','ALL']},change_interval_minute:{type:'integer',minimum:1,maximum:10080},latest_change_date:text,vvb_only:{type:'boolean'}}},
 bol_list_returns:{description:'Read a bounded page of retailer returns.',properties:{page,fulfilment_method:fulfilment,handled:{type:'boolean'}}},
 bol_list_invoices:{description:'Read retailer invoices within the requested date window.',properties:{period_start_date:text,period_end_date:text},required:['period_start_date','period_end_date']},
 bol_get_retailer:{description:'Read the currently authenticated retailer identity.',properties:{}},
 bol_get_order:{description:'Read details of one retailer order.',properties:{order_id:text},required:['order_id']},
 bol_list_shipments:{description:'Read a bounded shipment page.',properties:{page,fulfilment_method:fulfilment}},
 bol_get_commission:{description:'Read commission calculation for an EAN and unit price.',properties:{ean:text,unit_price:{type:'number',minimum:0.01,maximum:1000000},condition:text},required:['ean','unit_price']},
 bol_get_competing_offers:{description:'Read competing offers; no pricing or inventory changes.',properties:{ean:text,page,country_code:{type:'string',enum:['NL','BE']},best_offer_only:{type:'boolean'},condition:text},required:['ean']},
 finance_reconciliation_preview:{description:'Compare bol/accounting references without financial writes.',properties:{...paging,period_start_date:text,period_end_date:text},required:['period_start_date','period_end_date']},
 finance_outstanding_snapshot:{description:'Read a bounded outstanding-invoice snapshot.',properties:paging}
};
for(const id of ['eboekhouden_list_mutations','eboekhouden_outstanding_invoices','eboekhouden_list_ledgers','eboekhouden_list_relations'])
 entries[id]={description:'Read a bounded accounting page; no accounting mutations: '+id,properties:paging};
export function standardContract(item:CapabilityDefinition):CapabilityDefinition{
 const spec=entries[item.capabilityId];
 return spec?{...item,description:item.description??spec.description,parameters:item.parameters??{
   type:'object',additionalProperties:false,properties:spec.properties,required:spec.required??[],
   ...(item.capabilityId==='drive_get_metadata'?{anyOf:[{required:['file_id']},{required:['fileId']}]}:{})}}:item;
}
