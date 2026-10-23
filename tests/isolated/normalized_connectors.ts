import {test} from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {sha256Hex} from '../../packages/shared/src/stableJson';
import {GoogleDriveApiClient} from '../../packages/google-drive/src/client';
import {DriveSearchAdapter} from '../../apps/tools/src/driveAdapters';
import {DriveSearchVerifier} from '../../apps/production/src/driveVerifiers';
import {NORMALIZED_CONNECTOR_CONTRACTS} from '../../apps/production/src/normalizedConnectorContracts';
import {loadVerifiedSources} from '../../apps/brain/src/evidence/verifiedSources';
import {assessCollection,collectionReceipt} from '../../apps/brain/src/evidence/collectionReceipts';
import {replayTransform} from '../../apps/brain/src/evidence/transforms';
import {assessBoundObligation} from '../../apps/brain/src/evidence/fulfillment';
import {assessMonetaryEvidence} from '../../apps/brain/src/evidence/monetaryEvidence';
import {monetaryEvidenceLimitations} from '../../apps/production/src/reviewEvidence';
import {calendarPeriod,sameCalendarPeriod} from '../../apps/brain/src/evidence/period';
async function extract(result:any){
 const contract=NORMALIZED_CONNECTOR_CONTRACTS[0],goal=randomUUID(),tenant=randomUUID(),id=randomUUID();
 const body={queue_id:randomUUID(),goal_id:goal,plan_id:randomUUID(),plan_hash:'plan',capability_id:'bol_get_order',params:{order_id:'synthetic-order'},result,evidence:{readback:true},fencing_token:1,operation_key_ref:null};
 const row={...body,id,execution_hash:sha256Hex(body),verification_result:'VERIFIED',verification_id:randomUUID(),verified_hash:sha256Hex(body),verified_plan_hash:'plan'};
 const loaded=await loadVerifiedSources({query:async()=>({rows:[row]})},{goalId:goal,legalEntityId:tenant,sources:{s:id},plan:{version:1,source:'s',operations:[]}}, {'bol_get_order':contract.extraction});return loaded.sources.s;
}
test('bol v10 synthetic shape retains prices, VAT and provenance without inventing currency or coverage',async()=>{
 const data={data:{orderId:'synthetic-order',orderPlacedDateTime:'2026-10-22T23:30:00+02:00',orderItems:[{orderItemId:'item-X',quantity:2,quantityCancelled:0,quantityShipped:2,unitPrice:12.99,totalPrice:23.98,commission:1.99}]}};
 const d=await extract(data);assert.equal(d.rows[0].values.totalPrice,'23.98');assert.equal(d.columns.totalPrice.vat,'gross');assert.equal(d.columns.totalPrice.unit,'UNKNOWN');assert.equal(d.columns.commission.vat,'UNKNOWN');assert.equal(d.coverage,'unknown');assert.equal(d.timeZone,null);assert.equal(d.sourceContexts![0].period,undefined);assert.equal(d.rows[0].citations[0].sourceHash,sha256Hex(data));
 const repeated=await extract(data);
 const doubled=replayTransform({version:1,source:'a',operations:[{op:'union',right:'b'},{op:'group',keys:['orderId'],aggregates:[{as:'total',field:'quantity',fn:'sum'}]}]},{a:d,b:repeated}).dataset;
 assert.equal(doubled.rows[0].values.total,'4');
 const quantityObligation:any={id:'quantity',description:'Provided item',fields:['total'],scope:{kind:'enumerated',identities:['item-X']},units:'item',vat:'UNKNOWN',period:'UNKNOWN',timeZone:'UNKNOWN'};
 assert(assessBoundObligation(doubled,quantityObligation,['total']).gaps.includes('REQUESTED_IDENTITIES_AMBIGUOUS'),'two observations of one item cannot establish a doubled single-item quantity');
 assert.deepEqual(d.sourceContexts![0].rowIdentities,['item-X']);assert.equal(d.rows[0].values.orderPlacedDateTime,data.data.orderPlacedDateTime);
 for(const price of [0.001,1e30,NaN,Infinity,'12.99']){const bad=structuredClone(data);(bad.data.orderItems[0] as any).unitPrice=price;await assert.rejects(extract(bad),/DECIMAL_ENCODING_INVALID/);}
 const duplicate=structuredClone(data);duplicate.data.orderItems.push(structuredClone(duplicate.data.orderItems[0]));await assert.rejects(extract(duplicate),/DUPLICATE_RECORD_IDENTITY/);
 const absent=structuredClone(data);delete (absent.data.orderItems[0] as any).totalPrice;assert.equal((await extract(absent)).rows[0].values.totalPrice,null);
 const obligation:any={id:'amount',description:'Provided item',fields:['totalPrice'],scope:{kind:'enumerated',identities:['item-X']},units:'EUR',vat:'gross',period:'UNKNOWN',timeZone:'UNKNOWN'};
 assert(assessBoundObligation(d,obligation,['totalPrice']).gaps.includes('REQUESTED_UNIT_MISMATCH'));
});
test('Drive read and independent readback forward same cursor and retain incomplete-search evidence',async()=>{
 const paths:string[]=[];const client=new GoogleDriveApiClient({readOnlyRequest:async path=>{paths.push(path);return {files:[{id:'file-2',name:'synthetic'}],incompleteSearch:false};}});
 const params={query:'synthetic',page_token:'cursor-2',limit:2};const result=await new DriveSearchAdapter(client).execute({capabilityId:'drive_search',params,idempotencyKey:'fixture'});
 assert.equal(result.result.incomplete_search,false);assert.equal(result.result.next_page_token,null);
 const checked=await new DriveSearchVerifier(client).verify({execution:{params,result:result.result}} as any);assert.equal(checked.result,'VERIFIED');
 assert.equal(paths.length,2);assert.equal(paths[0],paths[1]);assert.equal(new URL('https://fixture.invalid'+paths[0]).searchParams.get('pageToken'),'cursor-2');assert(new URL('https://fixture.invalid'+paths[0]).searchParams.get('fields')!.includes('incompleteSearch'));
 const contract=NORMALIZED_CONNECTOR_CONTRACTS[1].extraction.collection!;
 const receipt=(id:string,cursor:string|null,next:string|null,incomplete:any,identity:string)=>collectionReceipt({id,execution_hash:id,capability_id:'drive_search',params:{query:'synthetic',...(cursor?{page_token:cursor}:{})},result:{next_page_token:next,incomplete_search:incomplete}},[{id:identity}],contract);
 const first=receipt('a',null,'cursor-2',false,'file-1'),last=receipt('b','cursor-2',null,false,'file-2');assert.equal(assessCollection([first,last]).complete,true);
 for(const flag of [true,null,undefined])assert.equal(assessCollection([first,receipt('b','cursor-2',null,flag,'file-2')]).complete,false);
 assert.equal(assessCollection([last]).complete,false);assert.equal(assessCollection([first,{...last,queryHash:'other'}]).complete,false);
});
test('one monetary assessment rejects missing units, VAT, period and scope; invoices never stand in for sales',()=>{
 const period={startDate:'2026-10-22',endDate:'2026-10-22'},request={currency:'EUR',period};
 const valid={amounts:['0.3'],currency:'EUR',vat:'net',period,coverageEstablished:true};assert.equal(assessMonetaryEvidence(valid,request).supported,true);
 for(const change of [{currency:'UNKNOWN'},{vat:undefined},{period:{startDate:'2026-09-01',endDate:'2026-09-30'}},{coverageEstablished:false},{amounts:[]}])assert.equal(assessMonetaryEvidence({...valid,...change},request).supported,false);
 const objective='Sales revenue in EUR and VAT for 2026-10-22',data={period,currency:'EUR',vat:'net',totals:{revenue:0.3},coverage:{complete:true}};
 assert.deepEqual(monetaryEvidenceLimitations(objective,[{capabilityId:'verified_sales',data}]),[]);
 assert(monetaryEvidenceLimitations(objective,[{capabilityId:'bol_list_invoices',data}]).length);
 assert(sameCalendarPeriod('2026-10-22',period));assert.equal(calendarPeriod('2026-02-30'),undefined);assert.equal(calendarPeriod('October 22'),undefined);
});
