import { sha256Hex } from "../../../packages/shared/src/stableJson";

export const ANALYSIS_ID="bol_sales_stock_report";
export const ANALYSIS_DESCRIPTION="Read-only commercial report: fully paginate orders changed from startDate through today, fetch order details, filter placement dates inclusively, aggregate ordered/cancelled/shipped units by EAN and fulfilment, paginate FBB inventory, read sold FBR offers, rank up to three replenishment candidates, and persist report with coverage evidence. Not net profit: returns, costs and fees are unavailable. Dates use Europe/Amsterdam.";
export const ANALYSIS_SCHEMA={type:"object",properties:{startDate:{type:"string",format:"date"},endDate:{type:"string",format:"date"}},required:["startDate","endDate"],additionalProperties:false};
type RecordValue=Record<string,any>;
export type AnalysisCall=(name:string,params:RecordValue,timeoutMs:number)=>Promise<RecordValue>;
const DAY=86400000;
function date(value:unknown):number{
  if(typeof value!=="string"||!/^\d{4}-\d{2}-\d{2}$/.test(value))throw new Error("Analysis dates must be YYYY-MM-DD");
  const n=Date.parse(`${value}T00:00:00Z`);
  if(!Number.isFinite(n)||new Date(n).toISOString().slice(0,10)!==value)throw new Error("Invalid analysis date");
  return n;
}
export function businessDate(value:Date):string{
  return new Intl.DateTimeFormat("en-CA",{timeZone:"Europe/Amsterdam",year:"numeric",month:"2-digit",day:"2-digit"}).format(value);
}
function number(value:unknown,label:string):number{
  if(typeof value!=="number"||!Number.isFinite(value)||value<0)throw new Error(`Invalid or missing ${label}`);
  return value;
}
function quantity(value:unknown,label:string):number{
  const n=number(value,label);if(!Number.isInteger(n))throw new Error(`Invalid ${label}`);return n;
}

// No customer names, addresses or email addresses leave this collector.
export async function buildBolAnalysis(params:RecordValue,source:AnalysisCall,now=new Date()){
  const start=date(params.startDate),end=date(params.endDate),today=date(businessDate(now));
  if(start>end||end>=today||today-start>31*DAY)throw new Error("Analysis requires a closed date range within the last 31 days");
  const deadline=Date.now()+240000;
  const reads:RecordValue[]=[];
  const call=async(name:string,args:RecordValue)=>{
    if(reads.length>=1500)throw new Error("Analysis API read limit reached; no partial report accepted");
    const remaining=deadline-Date.now();if(remaining<=0)throw new Error("Analysis deadline exceeded; no partial report accepted");
    const value=await source(name,args,Math.min(30000,remaining));
    if(Date.now()>deadline)throw new Error("Analysis deadline exceeded; no partial report accepted");
    reads.push({tool:name,params:args,sha256:sha256Hex(value)});
    return value;
  };
  async function pages(name:string,args:RecordValue,key:string,emptyText:string){
    const rows:RecordValue[]=[];const hashes=new Set<string>();
    for(let page=1;page<=100;page++){
      const result=await call(name,{...args,page});
      let batch=result[key];
      if(batch===undefined&&Array.isArray(result.content)&&result.content.length===1&&result.content[0]?.text===emptyText)batch=[];
      if(!Array.isArray(batch))throw new Error(`Malformed ${name} page ${page}`);
      reads[reads.length-1].count=batch.length;
      if(batch.length===0)return rows;
      const hash=sha256Hex(batch);if(hashes.has(hash))throw new Error(`Repeated ${name} page; coverage unproven`);
      hashes.add(hash);rows.push(...batch);
    }
    throw new Error(`${name} pagination limit reached; no partial report accepted`);
  }
  const retailer=await call("get_retailer_information",{});
  if(!retailer.retailerId)throw new Error("Retailer identity unavailable");
  const account={retailerId:String(retailer.retailerId),companyName:retailer.companyName??null,displayName:retailer.displayName??null};
  const orderIds=new Set<string>();
  // latest-change-date is an exact day, not a lower bound. Include changes after
  // the requested period through collection day, then filter by placement date.
  for(let day=start;day<=today;day+=DAY){
    const rows=await pages("list_orders",{latestChangeDate:new Date(day).toISOString().slice(0,10),status:"ALL",fulfilmentMethod:"ALL"},"orders","No orders found.");
    for(const row of rows){
      if(typeof row.orderId!=="string"||!row.orderId)throw new Error("Missing order ID");
      if(typeof row.orderPlacedDateTime==="string"&&/(Z|[+-]\d{2}:\d{2})$/.test(row.orderPlacedDateTime)&&Number.isFinite(Date.parse(row.orderPlacedDateTime))){
        const placed=date(businessDate(new Date(row.orderPlacedDateTime)));
        if(placed<start||placed>end)continue;
      }
      orderIds.add(row.orderId);
    }
  }
  const products=new Map<string,RecordValue>();const itemIds=new Set<string>();
  let includedOrders=0;
  for(const orderId of orderIds){
    const order=await call("get_order",{orderId});
    if(order.orderId!==orderId||!Array.isArray(order.orderItems))throw new Error("Order detail mismatch");
    if(typeof order.orderPlacedDateTime!=="string"||!/(Z|[+-]\d{2}:\d{2})$/.test(order.orderPlacedDateTime)||!Number.isFinite(Date.parse(order.orderPlacedDateTime)))throw new Error("Missing order placement timestamp");
    const placed=date(businessDate(new Date(order.orderPlacedDateTime)));
    if(placed<start||placed>end)continue;
    includedOrders++;
    for(const item of order.orderItems){
      if(typeof item.orderItemId!=="string"||itemIds.has(item.orderItemId))throw new Error("Missing or duplicate order item ID");
      itemIds.add(item.orderItemId);
      const ean=item.product?.ean??item.ean;
      const method=item.fulfilment?.method??item.fulfilmentMethod;
      if(typeof ean!=="string"||!ean||!["FBB","FBR"].includes(method))throw new Error("Missing EAN or fulfilment method");
      const ordered=quantity(item.quantity,"quantity"),cancelled=quantity(item.quantityCancelled,"quantityCancelled"),shipped=quantity(item.quantityShipped,"quantityShipped");
      if(cancelled+shipped>ordered)throw new Error("Inconsistent order quantities");
      const key=`${ean}:${method}`;
      const row=products.get(key)??{ean,fulfilment:method,title:item.product?.title??item.title??null,ordered:0,cancelled:0,shipped:0,netOrdered:0,offerIds:[]};
      row.ordered+=ordered;row.cancelled+=cancelled;row.shipped+=shipped;row.netOrdered+=ordered-cancelled;
      const offerId=item.offer?.offerId;
      if(typeof offerId==="string"&&!row.offerIds.includes(offerId))row.offerIds.push(offerId);
      products.set(key,row);
    }
  }
  const inventory=await pages("get_inventory",{},"inventory","No inventory items found.");
  const stocks=new Map<string,number>();const inventoryIds=new Set<string>();
  for(const row of inventory){
    if(typeof row.ean!=="string")throw new Error("Inventory missing EAN");
    const key=String(row.bsku??row.ean);if(inventoryIds.has(key))throw new Error("Duplicate inventory identity; coverage unproven");
    inventoryIds.add(key);
    stocks.set(row.ean,(stocks.get(row.ean)??0)+quantity(row.regularStock,"regularStock"));
  }
  const days=Math.round((end-start)/DAY)+1;
  for(const row of products.values()){
    row.stock=null;
    if(row.fulfilment==="FBB")row.stock=stocks.get(row.ean)??null;
    else if(row.offerIds.length){
      let stock=0;
      for(const offerId of row.offerIds){
        const offer=await call("get_offer",{offerId});
        if(offer.ean!==row.ean||offer.fulfilment?.method!=="FBR")throw new Error("FBR offer identity mismatch");
        stock+=quantity(offer.stock?.amount,"FBR stock amount");
      }
      // Different offers can share one physical stock pool. Never sum them.
      if(row.offerIds.length===1)row.stock=stock;
    }
    row.dailyNetOrdered=row.netOrdered/days;
    row.daysCover=row.stock===null||row.netOrdered===0?null:row.stock/row.dailyNetOrdered;
    row.recommendation=row.stock===null?"تحقق من المخزون قبل اتخاذ قرار":row.netOrdered===0?"لا توجد وتيرة طلب موجبة في الفترة":row.daysCover<7?"مرشح لإعادة التزويد؛ راجع المرتجعات والتكلفة أولاً":"المخزون يغطي سبعة أيام على الأقل وفق وتيرة الفترة";
  }
  const rows=[...products.values()].sort((a,b)=>b.netOrdered-a.netOrdered||a.ean.localeCompare(b.ean)||a.fulfilment.localeCompare(b.fulfilment));
  const candidates=rows.filter(row=>row.netOrdered>0&&row.stock!==null&&row.daysCover<7).sort((a,b)=>a.daysCover-b.daysCover||b.netOrdered-a.netOrdered).slice(0,3);
  const totals=rows.reduce((acc,row)=>({ordered:acc.ordered+row.ordered,cancelled:acc.cancelled+row.cancelled,shipped:acc.shipped+row.shipped,netOrdered:acc.netOrdered+row.netOrdered}),{ordered:0,cancelled:0,shipped:0,netOrdered:0});
  const limitations=["الكمية بعد الإلغاء ليست صافي المبيعات بعد المرتجعات؛ المرتجعات غير محسوبة.","لا يمكن حساب الربح الصافي أو التوصية بميزانية شراء دون تكاليف المنتجات والرسوم.","المخزون الحالي لقطة متغيرة: FBB من واجهة المخزون، وFBR للعروض المباعة المعروفة فقط؛ ليس كامل الكتالوج.","الطلبات مبنية على أحدث تغييرات الواجهة حتى يوم الجمع؛ لا توجد لقطة ذرية، وقد تغيّر القراءات المتزامنة النتائج."];
  const report={account,period:{startDate:params.startDate,endDate:params.endDate,timeZone:"Europe/Amsterdam",days},totals,includedOrders,orderItems:itemIds.size,products:rows,candidates,limitations,coverage:{changedThrough:businessDate(now),discoveredOrders:orderIds.size,inventoryItems:inventory.length,apiReads:reads.length,pagination:"every requested collection reached an empty terminal page"}};
  const markdown=[`تقرير الطلبات والمخزون: ${params.startDate} — ${params.endDate}`,`الطلبات: ${includedOrders}؛ الوحدات المطلوبة: ${totals.ordered}؛ الملغاة: ${totals.cancelled}؛ المشحونة: ${totals.shipped}؛ بعد الإلغاء: ${totals.netOrdered}.`,"مرشحو إعادة التزويد (حتى ثلاثة، تغطية أقل من 7 أيام):",...candidates.map(row=>`${row.ean} (${row.fulfilment}): ${row.netOrdered} وحدة بعد الإلغاء؛ مخزون ${row.stock}؛ تغطية ${row.daysCover.toFixed(1)} يوم. ${row.recommendation}`),...(candidates.length?[]:["لا توجد منتجات تستوفي الشروط ببيانات مخزون معلومة؛ لم يتم اختلاق ثلاثة مرشحين."]),...limitations].join("\n");
  return {result:{report,markdown},evidence:{report,reportHash:sha256Hex(report),reads,collectedAt:now.toISOString()}};
}

export async function verifyBolAnalysis(params:RecordValue,evidence:RecordValue,call:AnalysisCall){
  try{
    if(!evidence.report||sha256Hex(evidence.report)!==evidence.reportHash)throw new Error("Report hash mismatch");
    const fresh=await buildBolAnalysis(params,call);
    // Operational read counts and collection timestamps are not business facts.
    const comparable=({coverage,...report}:RecordValue)=>report;
    const same=sha256Hex(comparable(fresh.evidence.report))===sha256Hex(comparable(evidence.report));
    return {result:same?"VERIFIED" as const:"INCONCLUSIVE" as const,verifier:"bol-analysis-independent-full-readback",evidence:{method:"full independent reread and recomputation",matches:same,reason:same?"business figures reproduced":"source changed or report differs",reportHash:fresh.evidence.reportHash,reads:fresh.evidence.reads}};
  }catch(error){return {result:"INCONCLUSIVE" as const,verifier:"bol-analysis-independent-full-readback",evidence:{error:error instanceof Error?error.message:String(error)}};}
}
