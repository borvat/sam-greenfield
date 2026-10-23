import {googleReadEvidence} from '../../apps/production/src/samGoogleEvidence';
import assert from 'node:assert/strict';
import {pool} from '../../packages/db/src/client';
import {reviewFixture} from './reviewFixture';
import {persistPlanAndDelegateAtomic} from '../../apps/kernel/src/planning';
import {leaseWorkAtomic} from '../../apps/kernel/src/queue';
import {recordExecutionAndRequestVerificationAtomic} from '../../apps/kernel/src/execution';
import {recordIndependentVerificationAtomic} from '../../apps/kernel/src/verification';
import {deriveArtifact} from '../../apps/brain/src/evidence/artifacts';
import {REVIEWED_OUTPUT_CONTRACTS} from '../../apps/production/src/reviewedOutputContracts';
import {DriveSearchAdapter,DriveGetMetadataAdapter} from '../../apps/tools/src/driveAdapters';
import {BolOrderDetailAdapter} from '../../apps/tools/src/bolReadAdapters';
import {FinanceReconciliationPreviewAdapter} from '../../apps/tools/src/financeReadAdapters';
import {buildBolAnalysis} from '../../apps/production/src/bolAnalysis';
async function main(){
 const f=await reviewFixture();
 async function extract(capabilityId:string,result:any){
  const contract=REVIEWED_OUTPUT_CONTRACTS.find(c=>c.capabilityId===capabilityId)!;assert(contract);
  const id=await f.goal('Read supplied verified records','PLANNING');
  const plan=await persistPlanAndDelegateAtomic({goalId:id,steps:[{capabilityId,params:{}}]});
  const lease=await leaseWorkAtomic(plan.queueIds[0],'source-fixture',60);
  const ex=await recordExecutionAndRequestVerificationAtomic({queueId:plan.queueIds[0],fencingToken:lease.token,actor:'source-fixture',result,evidence:{readback:true}});
  const vc=(await pool.query(`INSERT INTO verification_contracts(capability_id,description,verification_method,required_evidence_fields,independent_query_template) VALUES($1,'Synthetic checked-in response','db_query','{"readback":"boolean"}','{}') ON CONFLICT(capability_id) DO UPDATE SET capability_id=EXCLUDED.capability_id RETURNING id`,[capabilityId])).rows[0].id;
  await recordIndependentVerificationAtomic({executionId:ex.executionId,verifier:'independent-fixture',contractId:vc,independentEvidence:{readback:true},result:'VERIFIED'});
  return deriveArtifact(pool,{goalId:id,legalEntityId:f.entity},{sources:{s:{executionId:ex.executionId,contractId:contract.id}},plan:{version:1,source:'s',operations:[]}},REVIEWED_OUTPUT_CONTRACTS);
 }
 for(const name of ['get_drive_file_download_url','get_gmail_message_content'] as const){
  const raw={content:[{type:'text',text:'Download URL: https://sam-google-workspace-mcp.onrender.com/attachments/11111111-1111-4111-8111-111111111111'}]};
  const checked=await googleReadEvidence(name,raw,async()=>({sha256:'a'.repeat(64),bytes:30000,mimeType:'text/plain',text:'omitted',truncated:true}));
  const derived=await extract('google_mcp_'+name,checked.result);
  assert.equal(derived.output.dataset.rows[0].values.sha256,'a'.repeat(64));assert.equal(derived.output.dataset.rows[0].values.bytes,'30000');
  assert(!Object.hasOwn(derived.output.dataset.columns,'text'));assert.equal(derived.output.dataset.coverage,'unknown');
  await assert.rejects(extract('google_mcp_'+name,{content:[{type:'text',text:'opaque response without download artifact'}]}),/EVIDENCE_RECORDS_INVALID/);
 }
 assert(!REVIEWED_OUTPUT_CONTRACTS.some(c=>c.capabilityId==='google_mcp_search_drive_files'),'opaque text search has no reviewed record schema');
 for(const token of [null,'next-page-X']){
  const adapter=new DriveSearchAdapter({search:async()=>({files:[{id:'file-'+String(token),name:'Supplier document',mimeType:'text/plain',modifiedTime:'2026-10-20T12:00:00Z'}],nextPageToken:token})} as any);
  const output=await adapter.execute({capabilityId:'drive_search',params:{limit:5},idempotencyKey:'fixture'});
  const a=await extract('drive_search',output.result);assert.equal(a.output.dataset.coverage,'unknown');assert.equal(a.output.dataset.rows[0].values.name,'Supplier document');assert(!Object.hasOwn(a.output.dataset.columns,'hash'));
 }
 const file=await new DriveGetMetadataAdapter({getFile:async()=>({id:'file-Z29',name:'Terms',mimeType:'text/plain'})} as any).execute({capabilityId:'drive_get_metadata',params:{file_id:'file-Z29'},idempotencyKey:'fixture'});
 const metadata=await extract('drive_get_metadata',file.result);assert.equal(metadata.output.dataset.rows[0].values.modifiedTime,null);assert.equal(metadata.output.dataset.sourceContexts?.[0].identity,'file-Z29');
 await assert.rejects(extract('drive_search',{files:[{name:'anonymous'}]}),/REQUIRED_FIELD_MISSING/);
 for(const cap of ['gmail_get_metadata','gmail_list_messages']){
  const a=await extract(cap,cap==='gmail_get_metadata'?{id:'message-91'}:{messages:[{id:'message-91'}],next_page_token:null});assert.equal(a.output.dataset.rows[0].values.id,'message-91');assert.equal(a.output.dataset.coverage,'unknown');
 }
 const order={orderId:'order-Z31',orderPlacedDateTime:'2026-10-13T10:00:00+02:00',orderItems:[{orderItemId:'item-Q82',product:{ean:'123'},fulfilment:{method:'FBB'},quantity:3,quantityCancelled:1,quantityShipped:2}]};
 const orderResult=await new BolOrderDetailAdapter({getOrder:async()=>order} as any).execute({capabilityId:'bol_get_order',params:{order_id:order.orderId},idempotencyKey:'fixture'});
 const quantities=await extract('bol_get_order',orderResult.result);assert.equal(quantities.output.dataset.rows[0].values.quantity,'3');assert.equal(quantities.output.dataset.timeZone,null);assert(!Object.hasOwn(quantities.output.dataset.columns,'price'));
 await assert.rejects(extract('bol_get_order',{data:{...order,orderItems:[{orderItemId:'i',quantity:1.5}]}}),/INTEGER_ENCODING_INVALID/);
 await assert.rejects(extract('bol_get_order',{data:{...order,orderItems:[{orderItemId:'i',quantity:Number.MAX_SAFE_INTEGER+1}]}}),/INTEGER_ENCODING_INVALID/);
 const analysis=await buildBolAnalysis({startDate:'2026-10-13',endDate:'2026-10-13'},async(name,args)=>{
  if(name==='get_retailer_information')return {retailerId:'retailer-X73'};
  if(name==='list_orders')return {orders:args.latestChangeDate==='2026-10-13'&&args.page===1?[order]:[]};
  if(name==='get_order')return order;
  if(name==='get_inventory')return {inventory:args.page===1?[{ean:'123',regularStock:5}]:[]};
  throw Error('Unexpected synthetic source');
 },new Date('2026-10-20T12:00:00Z'));
 const report=await extract('bol_sales_stock_report',analysis.result);
 assert.equal(report.output.dataset.rows[0].values.netOrdered,'2');assert.equal(report.output.dataset.rows[0].values.stock,'5');assert.equal(report.output.dataset.timeZone,'Europe/Amsterdam');
 assert.equal((report.output.dataset.sourceContexts?.[0].period as any).startDate,'2026-10-13');assert.equal(report.output.dataset.sourceContexts?.[0].identity,'retailer-X73');assert.equal(report.output.dataset.coverage,'unknown');assert(report.output.dataset.limitations.length>=5);
 const preview=await new FinanceReconciliationPreviewAdapter({listInvoices:async()=>({invoiceListItems:[{invoiceId:'INV-7'}]})} as any,{listMutations:async()=>({items:[{reference:'INV-7'}]})} as any).execute({capabilityId:'finance_reconciliation_preview',params:{},idempotencyKey:'fixture'});
 const matches=await extract('finance_reconciliation_preview',preview.result);assert.equal(matches.output.dataset.rows[0].values.reference,'INV-7');assert.equal(matches.output.dataset.coverage,'unknown');
 assert.equal(f.counters().sends,0);
 console.log('SOURCE_CONTRACTS PASS: checked-in adapters, identity/period retention, unknown coverage, exact safe-integer decoding, no monetary/content-hash invention; no external calls');
 await pool.end();
}
main().catch(async e=>{console.error(e);await pool.end();process.exitCode=1;});
