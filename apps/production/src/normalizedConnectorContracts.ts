import {freezeOutputContracts} from '../../brain/src/evidence/contracts';
const unknown={coveragePath:[],timeZonePath:[],limitationsPath:[]};
const integer=(path:string[])=>({path,encoding:'safe-integer' as const});
const money=(path:string[])=>({path,encoding:'decimal-number' as const});
/** Opt-in versioned contracts. No registration, source activation or permissions.
 * These describe only the actual checked-in adapters, never opaque Google MCP. */
export const NORMALIZED_CONNECTOR_CONTRACTS=freezeOutputContracts([
 {id:'bol.order.fields.v2',capabilityId:'bol_get_order',description:'Retailer v10 OrderOrderItem: unit and total customer prices include VAT; currency remains unestablished. Canonical parsed numbers only, no arithmetic or implied revenue.',extraction:{version:'2',...unknown,rowsPath:['data','orderItems'],rowIdentityPath:['orderItemId'],identityPath:['data','orderId'],columns:{
  orderItemId:{kind:'text'},orderId:{kind:'text'},orderPlacedDateTime:{kind:'text'},quantity:{kind:'decimal',unit:'item',semantic:'quantity'},quantityCancelled:{kind:'decimal',unit:'item',semantic:'quantity'},quantityShipped:{kind:'decimal',unit:'item',semantic:'quantity'},
  unitPrice:{kind:'decimal',unit:'UNKNOWN',semantic:'monetary',vat:'gross',monetaryMeaning:'unit-price'},totalPrice:{kind:'decimal',unit:'UNKNOWN',semantic:'monetary',vat:'gross',monetaryMeaning:'customer-charge'},commission:{kind:'decimal',unit:'UNKNOWN',semantic:'monetary',vat:'UNKNOWN',monetaryMeaning:'commission'}},
  fields:{orderId:{path:['data','orderId'],from:'root'},orderPlacedDateTime:{path:['data','orderPlacedDateTime'],from:'root'},quantity:integer(['quantity']),quantityCancelled:integer(['quantityCancelled']),quantityShipped:integer(['quantityShipped']),unitPrice:money(['unitPrice']),totalPrice:money(['totalPrice']),commission:money(['commission'])},requiredFields:['orderItemId','orderId'],sourceLimitations:[
   'Official Retailer v10 OrderOrderItem declares unitPrice and totalPrice inclusive of VAT, not the tax rate or net amount',
   'Currency is not established by the reviewed order schema; country or VAT inclusion cannot establish EUR',
   'Order-detail visibility is bounded; one order cannot prove requested-period or all-order coverage',
   'Order placement time remains source text; no timezone, requested period, refund or net revenue is inferred',
   'Parsed numeric precision cannot recover original JSON lexemes; unsafe magnitudes, exponents and more than two fractional digits are rejected; optional missing values stay null'
  ]}},
 {id:'drive.search.collection.v2',capabilityId:'drive_search',description:'Existing Drive v3 search adapter: verified page identities and cursor chain with explicit incomplete-search guard, only for its exact query',extraction:{version:'2',...unknown,rowsPath:['files'],rowIdentityPath:['id'],columns:{id:{kind:'text'},name:{kind:'text'},mimeType:{kind:'text'},modifiedTime:{kind:'text'}},requiredFields:['id'],collection:{cursorParameter:'page_token',nextCursorPath:['next_page_token'],identityPath:['id'],requiredFalsePath:['incomplete_search']},sourceLimitations:[
  'Coverage applies only to the exact authorized query and connected verified pages; an absent incompleteSearch value does not establish complete search',
  'Drive pagination is not a transactional snapshot; concurrent changes can alter results',
  'Metadata names and timestamps are not document content identity, supplier promises or delivery facts',
  'This contract belongs to drive_search; it must not be rebound to google_mcp_* wrappers with opaque output schemas'
 ]}}
]);
