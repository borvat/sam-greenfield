import assert from "node:assert/strict";
import test from "node:test";
import { ANALYSIS_ID,ANALYSIS_SCHEMA,businessDate,buildBolAnalysis,verifyBolAnalysis } from "../../apps/production/src/bolAnalysis";
import { proposePlan } from "../../apps/brain/src/planner";
import { validateToolParameters } from "../../packages/tool-gateway/src/validation";

const now=new Date("2026-10-20T12:00:00Z");
const params={startDate:"2026-10-13",endDate:"2026-10-19"};
function fixture(){
  const calls:Array<{name:string;params:any}>=[];
  const orders:Record<string,any>={
    a:{orderId:"a",orderPlacedDateTime:"2026-10-13T10:00:00+02:00",shipmentDetails:{firstName:"PRIVATE CUSTOMER"},orderItems:[{orderItemId:"i1",product:{ean:"111",title:"FBB"},fulfilment:{method:"FBB"},quantity:14,quantityCancelled:7,quantityShipped:7}]},
    b:{orderId:"b",orderPlacedDateTime:"2026-10-19T23:30:00+02:00",orderItems:[{orderItemId:"i2",product:{ean:"222",title:"FBR"},offer:{offerId:"offer-b"},fulfilment:{method:"FBR"},quantity:21,quantityCancelled:0,quantityShipped:21}]},
    c:{orderId:"c",orderPlacedDateTime:"2026-10-12T22:30:00Z",orderItems:[{orderItemId:"i3",product:{ean:"333"},fulfilment:{method:"FBB"},quantity:1,quantityCancelled:0,quantityShipped:0}]},
    old:{orderId:"old",orderPlacedDateTime:"2026-10-12T10:00:00Z",orderItems:[]}
  };
  const source=async(name:string,args:any)=>{
    calls.push({name,params:args});
    if(name==="get_retailer_information")return {retailerId:"test-account",displayName:"Test shop"};
    if(name==="list_orders"){
      if(args.latestChangeDate==="2026-10-13"&&args.page===1)return {orders:[orders.a]};
      if(args.latestChangeDate==="2026-10-13"&&args.page===2)return {orders:[orders.c]}; // short pages are not terminal
      if(args.latestChangeDate==="2026-10-20"&&args.page===1)return {orders:[orders.a,orders.b,orders.old]}; // changed after requested end, and duplicate
      return {content:[{type:"text",text:"No orders found."}]};
    }
    if(name==="get_order")return orders[args.orderId];
    if(name==="get_inventory")return args.page===1?{inventory:[{ean:"111",regularStock:2}]}:args.page===2?{inventory:[{ean:"333",regularStock:100}]}:{content:[{type:"text",text:"No inventory items found."}]};
    if(name==="get_offer")return {ean:"222",fulfilment:{method:"FBR"},stock:{amount:3}};
    throw new Error(`Unexpected tool ${name}`);
  };
  return {calls,orders,source};
}
test("all pages, exact change dates through today, placement timezone, dedup and cancellation arithmetic",async()=>{
  const f=fixture();const output=await buildBolAnalysis(params,f.source,now);const r=output.result.report;
  assert.deepEqual(r.totals,{ordered:36,cancelled:7,shipped:28,netOrdered:29});
  assert.equal(r.includedOrders,3);
  assert.deepEqual(r.candidates.map(r=>[r.ean,r.stock,r.daysCover]),[["222",3,1],["111",2,2]]);
  assert.equal(r.products.find(r=>r.ean==="333")?.daysCover,700);
  assert.equal(f.calls.filter(c=>c.name==="get_order").length,3);
  assert.equal(new Set(f.calls.filter(c=>c.name==="list_orders").map(c=>c.params.latestChangeDate)).size,8);
  assert.ok(f.calls.some(c=>c.name==="get_inventory"&&c.params.page===3));
  assert.ok(!JSON.stringify(output).includes("PRIVATE CUSTOMER"));
  assert.ok(!f.calls.some(c=>/export|update|cancel/.test(c.name)));
  assert.equal(businessDate(new Date("2026-10-12T22:30:00Z")),"2026-10-13");
});
test("failure, malformed/looping pages, missing quantity and invalid date cannot yield a partial report",async()=>{
  const f=fixture();
  await assert.rejects(buildBolAnalysis({...params,startDate:"2026-02-30"},f.source,now),/Invalid analysis date/);
  await assert.rejects(buildBolAnalysis({...params,endDate:"2026-10-20"},f.source,now),/closed date/);
  await assert.rejects(buildBolAnalysis(params,async(name,args)=>name==="list_orders"?{orders:[f.orders.a]}:f.source(name,args),now),/Repeated/);
  await assert.rejects(buildBolAnalysis(params,async(name,args)=>name==="get_inventory"?{}:f.source(name,args),now),/Malformed/);
  await assert.rejects(buildBolAnalysis(params,async(name,args)=>{if(name==="get_order")throw new Error("upstream 429");return f.source(name,args);},now),/upstream 429/);
  delete f.orders.a.orderItems[0].quantityCancelled;
  await assert.rejects(buildBolAnalysis(params,f.source,now),/quantityCancelled/);
});
test("missing stock stays unknown and cannot produce a replenishment candidate",async()=>{
  const f=fixture();
  const output=await buildBolAnalysis(params,async(name,args)=>name==="get_inventory"?{inventory:[]}:f.source(name,args),now);
  assert.equal(output.result.report.products.find(row=>row.ean==="111")?.stock,null);
  assert.ok(!output.result.report.candidates.some(row=>row.ean==="111"));
});
test("verification requires independent recomputation and detects source changes and tampering",async()=>{
  const f=fixture();
  // Use the actual current closed period for the independent verifier clock.
  const today=new Date(`${businessDate(new Date())}T00:00:00Z`);
  const end=new Date(today.getTime()-86400000).toISOString().slice(0,10);
  const start=new Date(today.getTime()-7*86400000).toISOString().slice(0,10);
  const input={startDate:start,endDate:end};
  const empty=async(name:string,args:any)=>name==="get_retailer_information"?{retailerId:"test"}:name==="get_inventory"?{inventory:[]}:{orders:[]};
  const output=await buildBolAnalysis(input,empty);
  let count=0;
  assert.equal((await verifyBolAnalysis(input,output.evidence,async(n,a)=>{count++;return empty(n,a);})).result,"VERIFIED");
  assert.ok(count>8);
  assert.equal((await verifyBolAnalysis(input,output.evidence,async(n,a)=>n==="get_retailer_information"?{retailerId:"changed"}:empty(n,a))).result,"INCONCLUSIVE");
  output.evidence.report.totals.ordered=999;
  assert.equal((await verifyBolAnalysis(input,output.evidence,empty)).result,"INCONCLUSIVE");
});
test("planner uses the executable report capability and concrete dates",async()=>{
  validateToolParameters(ANALYSIS_ID,params,ANALYSIS_SCHEMA);
  await assert.rejects(proposePlan({goalId:"test",objective:"read-only bol.com sales stock report",context:{},dataClassification:"INTERNAL",maxCostUsd:0.1,availableCapabilities:[{capabilityId:ANALYSIS_ID,sideEffect:false,parameters:ANALYSIS_SCHEMA}],gateway:{async invoke(){return {result:{output:{steps:[{capabilityId:ANALYSIS_ID,params:{startDate:"{{date}}",endDate:"2026-10-19"}}]}}};}} as any}),/Unresolved/);
  const plan=await proposePlan({goalId:"test",objective:"read-only bol.com sales stock report",context:{},dataClassification:"INTERNAL",maxCostUsd:0.1,availableCapabilities:[{capabilityId:ANALYSIS_ID,sideEffect:false,parameters:ANALYSIS_SCHEMA},{capabilityId:"bol_list_orders",sideEffect:false}],gateway:{async invoke(input:any){assert.equal(input.input.capabilities.length,1);return {result:{output:{steps:[{capabilityId:ANALYSIS_ID,params}]}}};}} as any});
  assert.equal(plan.steps.length,1);assert.equal(plan.steps[0].capabilityId,ANALYSIS_ID);
});
