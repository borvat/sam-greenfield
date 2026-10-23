import type {CapabilityOutputMetadata} from '../../agents/src/capabilityCatalog';
import type {ProductionBundle} from './types';
const rawNumber={type:'number',description:'Optional raw provider number; currency, VAT basis and exact decimal precision are not declared'};
const vatIncludedNumber={type:'number',description:'Retailer v10 customer price including VAT; currency and original decimal lexeme remain unestablished'};
/** Reviewed structural hints from checked-in adapter/types, not extraction authority. */
export function readOutputMetadata(capabilityId:string):CapabilityOutputMetadata|undefined{
 if(capabilityId==='bol_get_order')return {schemaStatus:'DECLARED',schema:{
  type:'object',additionalProperties:true,properties:{data:{type:'object',additionalProperties:true,properties:{
   orderId:{type:'string'},orderPlacedDateTime:{type:'string'},orderItems:{type:'array',items:{type:'object',additionalProperties:true,properties:{
    orderItemId:{type:'string'},quantity:{type:'number'},quantityShipped:{type:'number'},quantityCancelled:{type:'number'},
    unitPrice:vatIncludedNumber,totalPrice:vatIncludedNumber,offerPrice:rawNumber,commission:rawNumber,
    discounts:{type:'array',items:{type:'object',properties:{title:{type:'string'},amount:rawNumber},additionalProperties:true}}
   }}}
  }}}
 },
  units:{quantity:'item',quantityShipped:'item',quantityCancelled:'item',unitPrice:'UNKNOWN',totalPrice:'UNKNOWN',offerPrice:'UNKNOWN',commission:'UNKNOWN','discounts.amount':'UNKNOWN'},
  timeSemantics:'orderPlacedDateTime is raw provider text; timezone and requested-period coverage require evidence',coverageSemantics:'One order; optional fields and all-orders/page coverage remain unknown',limitations:['Partial structural schema from vendor OrderItem and the checked-in get_order wrapper, not a claim fields exist in a particular response','Structural hints do not activate extraction; reviewed v2 price contracts still retain currency UNKNOWN','OrderOrderItem unitPrice and totalPrice include VAT; commission VAT, currency, refunds and net revenue remain unestablished','No financial completion or aggregation is authorized by these hints']};
 if(capabilityId.startsWith('google_mcp_'))return {schemaStatus:'UNKNOWN',units:{},timeSemantics:'UNKNOWN',coverageSemantics:'UNKNOWN; cursor normalization does not establish complete coverage',limitations:['The checked-in MCP discovery contract exposes inputSchema, not a structured document/message output schema','MCP text and structuredContent strings do not establish stable record fields','Only separately listed runtime artifact extraction contracts declare byte hash/count/MIME; no document meaning is inferred']};
 return undefined;
}
export function withReadOutputMetadata(bundle:ProductionBundle):ProductionBundle{
 return {...bundle,capabilities:bundle.capabilities.map(c=>{const output=readOutputMetadata(c.capabilityId);return output?{...c,output}:c;})};
}
