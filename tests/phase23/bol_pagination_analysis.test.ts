import assert from "node:assert/strict";
import test from "node:test";
import { readAllBolPages,selectOrdersByPlacedDate,summarizeBolInventory,summarizeBolOrders } from "../../apps/production/src/bolBundle";
import { goalAuthorityCeiling } from "../../apps/production/src/dispatcher";
import { detectBolDataGaps } from "../../apps/production/src/verifier";

test("readAllBolPages reads through the first empty terminal page",async()=>{
  const calls:number[]=[];
  const result=await readAllBolPages({
    collectionKey:"orders",
    readPage:async(page)=>{
      calls.push(page);
      return {orders:page===1?[{orderId:"a"}]:page===2?[{orderId:"b"}]:[]};
    }
  });
  assert.deepEqual(calls,[1,2,3]);
  assert.equal((result.orders as unknown[]).length,2);
  assert.deepEqual(result.pagination,{startPage:1,pagesFetched:3,allPagesComplete:true,termination:"empty_page"});
});

test("readAllBolPages marks a capped scan incomplete",async()=>{
  const result=await readAllBolPages({
    collectionKey:"inventory",
    maxPages:2,
    readPage:async(page)=>({inventory:[{ean:String(page)}]})
  });
  assert.equal((result.inventory as unknown[]).length,2);
  assert.equal((result.pagination as any).allPagesComplete,false);
  assert.equal((result.pagination as any).termination,"page_limit");
});

test("order analysis filters by placed date and aggregates quantities",()=>{
  const rows=[
    {orderId:"old",orderPlacedDateTime:"2026-09-01T10:00:00Z",orderItems:[{ean:"111",quantity:4}]},
    {orderId:"new",orderPlacedDateTime:"2026-10-10T10:00:00Z",orderItems:[{product:{ean:"222"},quantity:3,quantityShipped:2,quantityCancelled:1}]}
  ];
  const selected=selectOrdersByPlacedDate(rows,"2026-09-19");
  assert.equal(selected.length,1);
  assert.deepEqual(summarizeBolOrders(selected),{
    orders:1,items:1,unitsOrdered:3,unitsShipped:2,unitsCancelled:1,unitsAfterCancellations:2,
    byEan:{"222":{orders:1,items:1,unitsOrdered:3,unitsShipped:2,unitsCancelled:1}}
  });
});

test("inventory summary derives low stock from the complete inventory list",()=>{
  const result=summarizeBolInventory([
    {ean:"a",title:"Low",regularStock:2,gradedStock:1},
    {ean:"b",title:"Healthy",regularStock:25,gradedStock:0}
  ]);
  assert.equal(result.inventoryItems,2);
  assert.equal(result.lowStockItems,1);
  assert.equal(result.lowStockByEan[0].ean,"a");
});

test("goal-level gap detection catches empty orders despite recent returns",()=>{
  const gaps=detectBolDataGaps([
    {capability_id:"bol_list_orders",params:{latestChangeDate:"2026-09-19"},result:{tool:"list_orders",data:{orders:[],pagination:{allPagesComplete:true}}}},
    {capability_id:"bol_list_returns",params:{handled:true,fulfilmentMethod:"FBR"},result:{tool:"list_returns",data:{returns:[{registrationDateTime:"2026-10-18T10:00:00Z",returnItems:[{orderId:"C1"}]}]}}}
  ]);
  assert.deepEqual(gaps,["orders_empty_while_recent_returns_exist"]);
});

test("explicit read-only goals receive a GREEN authority ceiling",()=>{
  assert.equal(goalAuthorityCeiling("Analyze bol.com sales, read-only only"),"GREEN");
  assert.equal(goalAuthorityCeiling("Change the product price"),"RED");
});
