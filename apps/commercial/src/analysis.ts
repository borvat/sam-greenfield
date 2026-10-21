import { businessDate } from '../../production/src/bolAnalysis';
import { AnalysisInput, COST_CATEGORIES, Evidence, Ref, integer, invariant, period, pointer, stableId, sum, text, sourceValue } from './model';

export const SOURCE_CAPABILITIES = ['bol_get_retailer_information','bol_get_order','bol_get_inventory','google_mcp_get_drive_file_content'] as const;
// No collector or provider client here: reuse independently verified SAM reads.
// Cost JSON must be supplied by an explicit trusted normalizer; no NLP extraction.
export function calculateAnalysis(input:AnalysisInput,evidence:Map<string,Evidence>,retailerId:string){
 const window=period(input.period);invariant(input.products.length>0&&input.products.length<=100,'PRODUCT_LIMIT');
 invariant(input.orders.length>0&&input.orders.length<=500,'ORDER_LIMIT');
 const used=new Map<string,Evidence>();
 const read=(ref:Ref,capabilities:readonly string[])=>{
  const e=evidence.get(ref.executionId);invariant(e&&capabilities.includes(e.capability),'SOURCE_CAPABILITY');
  used.set(e.id,e);return pointer(sourceValue(e),ref.path);
 };
 invariant(input.account.path==='','ACCOUNT_ROOT_REQUIRED');
 const account=read(input.account,['bol_get_retailer_information']);invariant(String(account.retailerId)===retailerId,'RETAILER_MISMATCH');
 const orderItems=new Map<string,any>();const seenOrders=new Set<string>();
 for(const ref of input.orders){
  invariant(ref.path==='','ORDER_ROOT_REQUIRED');const order=read(ref,['bol_get_order']);
  const orderId=text(order.orderId,'ORDER_ID');invariant(!seenOrders.has(orderId),'DUPLICATE_ORDER');seenOrders.add(orderId);
  invariant(evidence.get(ref.executionId)!.params?.orderId===orderId,'ORDER_PARAM_MISMATCH');
  invariant(typeof order.orderPlacedDateTime==='string'&&/(Z|[+-]\d{2}:\d{2})$/.test(order.orderPlacedDateTime)&&Number.isFinite(Date.parse(order.orderPlacedDateTime)),'ORDER_DATE');
  const placed=businessDate(new Date(order.orderPlacedDateTime));invariant(placed>=window.start&&placed<=window.end,'ORDER_OUTSIDE_PERIOD');
  invariant(Array.isArray(order.orderItems)&&order.orderItems.length<=500,'ORDER_ITEMS');
  for(const item of order.orderItems){
   const id=text(item.orderItemId,'ITEM_ID');invariant(!orderItems.has(id),'DUPLICATE_ORDER_ITEM');
   const ordered=integer(item.quantity,'QUANTITY'),cancelled=integer(item.quantityCancelled,'CANCELLED'),shipped=integer(item.quantityShipped,'SHIPPED');
   invariant(cancelled+shipped<=ordered,'QUANTITY_RECONCILIATION');
   const ean=text(item.product?.ean??item.ean,'EAN');
   orderItems.set(id,{id,ean,ordered,cancelled,shipped,ref});
  }
 }
 let inventory:any=null;
 if(input.inventory){invariant(input.inventory.path==='','INVENTORY_ROOT_REQUIRED');inventory=read(input.inventory,['bol_get_inventory']);invariant(Array.isArray(inventory.inventory),'INVENTORY_SHAPE');}
 const skus=new Set<string>(),eans=new Set<string>(),claimedItems=new Set<string>(),costKeys=new Set<string>();
 const rows:any[]=[];
 for(const product of input.products){
  const sku=text(product.sku,'SKU'),ean=text(product.ean,'EAN');invariant(!skus.has(sku)&&!eans.has(ean),'AMBIGUOUS_PRODUCT_MAPPING');skus.add(sku);eans.add(ean);
  const mapping=read(product.identity,['google_mcp_get_drive_file_content']);
  invariant(mapping.sku===sku&&mapping.ean===ean&&mapping.retailerId===retailerId,'PRODUCT_IDENTITY');
  const ledger=read(product.ledger,['google_mcp_get_drive_file_content']);
  invariant(ledger.schema==='sam.commercial.ledger.v1'&&ledger.sku===sku&&ledger.ean===ean&&ledger.retailerId===retailerId,'LEDGER_IDENTITY');
  invariant(ledger.currency==='EUR'&&ledger.costBasis==='NET_PLUS_NONRECOVERABLE_VAT'&&ledger.taxTreatment==='EXPLICIT_VAT_AMOUNTS','CURRENCY_OR_TAX_BASIS');
  invariant(ledger.period?.start===window.start&&ledger.period?.end===window.end,'LEDGER_PERIOD');
  invariant(Array.isArray(ledger.orderItemIds)&&ledger.orderItemIds.length>0&&new Set(ledger.orderItemIds).size===ledger.orderItemIds.length,'LEDGER_ITEM_IDS');
  const matched=ledger.orderItemIds.map((id:string)=>{
   const item=orderItems.get(id);invariant(item&&item.ean===ean&&!claimedItems.has(id),'LEDGER_ORDER_MAPPING');claimedItems.add(id);return item;
  });
  const shipped=sum(matched.map((r:any)=>r.shipped)),returned=integer(ledger.returnedUnits,'RETURNED');
  invariant(returned<=shipped,'RETURN_QUANTITY');
  const gross=integer(ledger.salesGrossCents,'SALES'),vat=integer(ledger.outputVatCents,'VAT'),refund=integer(ledger.refundGrossCents,'REFUND'),refundVat=integer(ledger.refundVatCents,'REFUND_VAT');
  invariant(vat<=gross&&refund<=gross&&refundVat<=refund&&refundVat<=vat&&gross-refund>=vat-refundVat,'REVENUE_RECONCILIATION');
  invariant(shipped>0||(gross===0&&refund===0&&vat===0&&refundVat===0),'UNSHIPPED_REVENUE');
  const netRevenueCents=sum([gross,-vat,-refund,refundVat]);
  invariant(Array.isArray(ledger.costs)&&ledger.costs.length<=1000,'COST_LIMIT');
  const costs=Object.fromEntries(COST_CATEGORIES.map(k=>[k,0]));
  const costEvidence:any[]=[];
  for(const cost of ledger.costs){
   const id=text(cost.id,'COST_ID');invariant(!costKeys.has(id),'DUPLICATE_COST');costKeys.add(id);
   invariant(COST_CATEGORIES.includes(cost.category),'COST_CATEGORY');
   const amount=integer(cost.amountCents,'COST_AMOUNT',true);
   costs[cost.category]=sum([costs[cost.category],amount]);
   costEvidence.push({id,category:cost.category,amountCents:amount,source:product.ledger});
  }
  const missing:string[]=[];
  for(const category of COST_CATEGORIES){
   const status=ledger.coverage?.[category];invariant(['COMPLETE','PARTIAL','UNKNOWN'].includes(status),'COST_COVERAGE');
   invariant(status!=='UNKNOWN'||!ledger.costs.some((r:any)=>r.category===category),'UNKNOWN_COST_HAS_LINES');
   if(status!=='COMPLETE')missing.push(category);
  }
  const knownCostCents=sum(Object.values(costs));
  const contributionCents=sum([netRevenueCents,-knownCostCents]);
  const refs=[product.identity,product.ledger,...matched.map((r:any)=>r.ref)];
  let stock:number|null=null;
  if(inventory){const stocks=inventory.inventory.filter((r:any)=>r.ean===ean);if(stocks.length){
   const ids=new Set<string>();stock=sum(stocks.map((r:any)=>{const id=text(r.bsku,'BSKU');invariant(!ids.has(id),'DUPLICATE_STOCK');ids.add(id);return integer(r.regularStock,'STOCK')}));
   refs.push(input.inventory!);
  }}
  const netUnits=shipped-returned;
  rows.push({sku,ean,currency:'EUR',shippedUnits:shipped,returnedUnits:returned,netUnits,
   netRevenueCents,knownCostCents,contributionCents,costs,costEvidence,missingCosts:missing,
   completeness:missing.length?'PARTIAL':'FULLY_COSTED_WITHIN_DECLARED_SCOPE',
   marginBps:netRevenueCents?Math.round(contributionCents/netRevenueCents*10000):null,
   unitContributionCents:netUnits?Math.round(contributionCents/netUnits):null,
   fbbStockAtRead:stock,daysCover:stock===null||netUnits===0?null:stock/(netUnits/window.days),
   evidence:refs,
   limitations:['Recognized ledger contribution, not audited company net profit or cash flow.','Order cohort and allocated ledger costs only; no claim of complete account pagination.','Tax amounts and zero-cost coverage are attributed source assertions; no tax rate is inferred.','FBB stock is a separate read-time snapshot; FBR/shared stock is not inferred.']});
 }
 // Do not quietly omit a shipped item for a selected product from its cost/revenue cohort.
 invariant([...orderItems.values()].filter(r=>eans.has(r.ean)&&r.shipped>0).every(r=>claimedItems.has(r.id)),'OMITTED_PRODUCT_ITEM');
 const hypotheses=rows.flatMap(row=>{
  const common={sku:row.sku,evidence:row.evidence,confidence:{kind:'EVIDENCE_COVERAGE_NOT_PROBABILITY',level:row.missingCosts.length?'LOW':'MEDIUM'},
   authority:'ANALYSIS_ONLY',limits:['Rule-generated hypothesis, not a validated commercial recommendation.','No causal effect, forecast calibration, market-price or supplier evidence is established.']};
  const proposals:any[]=[];
  if(row.missingCosts.length)proposals.push({...common,type:'COST_DATA_GAP',claim:'Collect and reconcile missing costs before treating margin as fully costed.',missing:row.missingCosts,observationPlan:'Read source invoices and match allocated costs to this cohort.'});
  if(row.contributionCents<0)proposals.push({...common,type:'MARGIN_REVIEW',claim:'Observed cohort contribution is negative after known costs; inspect cost and return drivers.',observationPlan:'Compare a future matched cohort after all available costs; do not alter price.'});
  if(row.daysCover!==null&&row.daysCover<7)proposals.push({...common,type:'AVAILABILITY_REVIEW',claim:'FBB snapshot covers less than seven days at this historical net-shipped rate.',observationPlan:'Read fresh stock, demand and margin before considering replenishment; no purchase.'});
  return proposals.map(p=>({...p,id:stableId({period:window,sku:p.sku,type:p.type,evidence:p.evidence})}));
 });
 const lineage=[...used.values()].map(e=>({executionId:e.id,capability:e.capability,readAt:e.readAt,responseHash:e.hash}));
 return {schema:'sam.commercial.analysis.v1',period:window,retailerId,products:rows,hypotheses,lineage,
  permissions:{providerWrites:false,experiments:'OBSERVATION_ONLY'},
  limitations:['Synthetic fixtures prove local contracts only; no live provider or model acceptance is implied.','Complete means the explicit cost taxonomy and source ledger, not all possible business expenses.']};
}
