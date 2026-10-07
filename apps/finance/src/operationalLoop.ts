import {createHash} from "node:crypto";
import {withTransaction} from "../../../packages/db/src/client";
import type {BolRetailerClient} from "../../../packages/bol/src/client";
import type {EBoekhoudenClient} from "../../../packages/eboekhouden/src/client";
import {reconcileExactReferences,outstandingSnapshot} from "./reconciliation";

type Brief={
  period:{start:string;end:string};
  marketplace:{orders:number;returns:number;invoices:number};
  accounting:{mutations:number;outstandingInvoices:number;outstandingKnownAmount:number};
  reconciliation:{matched:number;bolOnly:number;accountingOnly:number;ambiguous:number;varianceCount:number};
  materialVariance:boolean;
  needsOwnerAttention:boolean;
};

function int(value:unknown,def:number,min:number,max:number):number{
  const n=Number(value??def);
  if(!Number.isFinite(n)) return def;
  return Math.max(min,Math.min(max,Math.trunc(n)));
}
function dateOnly(d:Date){return d.toISOString().slice(0,10);}
function fingerprint(brief:Brief):string{
  return createHash("sha256").update(JSON.stringify({
    period:brief.period,
    reconciliation:brief.reconciliation,
    outstanding:brief.accounting.outstandingKnownAmount
  })).digest("hex");
}
function array(body:any,keys:string[]):any[]{
  for(const key of keys) if(Array.isArray(body?.[key])) return body[key];
  return [];
}

async function bolPages(client:BolRetailerClient,maxPages:number){
  const orders:any[]=[]; const returns:any[]=[];
  for(let page=1;page<=maxPages;page++){
    const body=await client.listOrders({page,fulfilmentMethod:"ALL",status:"ALL"});
    const rows=array(body,["orders"]);
    orders.push(...rows);
    if(rows.length===0) break;
  }
  for(let page=1;page<=maxPages;page++){
    const body=await client.listReturns({page});
    const rows=array(body,["returns"]);
    returns.push(...rows);
    if(rows.length===0) break;
  }
  return {orders,returns};
}

async function accountingMutations(client:EBoekhoudenClient,maxPages:number){
  const rows:any[]=[];
  for(let page=0;page<maxPages;page++){
    const body=await client.listMutations({limit:100,offset:page*100});
    const items=array(body,["items","mutations"]);
    rows.push(...items);
    if(items.length<100) break;
  }
  return rows;
}

export async function runFinanceOperationalLoop(input:{
  bol:BolRetailerClient;
  accounting:EBoekhoudenClient;
  legalEntityId:string;
  now?:Date;
  intervalMinutes?:number;
  lookbackDays?:number;
  materialVarianceCount?:number;
  maxPages?:number;
}):Promise<{status:"DISABLED"|"SKIPPED_RECENT"|"EXECUTED";brief?:Brief;goalId?:string|null;fingerprint?:string}>{
  if(!input.legalEntityId) return {status:"DISABLED"};

  const now=input.now??new Date();
  const interval=int(input.intervalMinutes,180,1,1440);
  const lookback=int(input.lookbackDays,30,1,31);
  const threshold=int(input.materialVarianceCount,1,1,100000);
  const maxPages=int(input.maxPages,5,1,20);

  const recent=await withTransaction(async client=>{
    const r=await client.query(
      "SELECT 1 FROM audit_log WHERE action='FINANCE_OPERATIONAL_BRIEF' AND entity_type='legal_entity' AND entity_id=$1 AND timestamp > $2::timestamptz - ($3::text || ' minutes')::interval LIMIT 1",
      [input.legalEntityId,now.toISOString(),String(interval)]
    );
    return r.rowCount===1;
  });
  if(recent) return {status:"SKIPPED_RECENT"};

  const end=new Date(now);
  const start=new Date(now);
  start.setUTCDate(start.getUTCDate()-lookback);

  const [{orders,returns},bolInvoices,mutations,outstandingBody]=await Promise.all([
    bolPages(input.bol,maxPages),
    input.bol.listInvoices({periodStartDate:dateOnly(start),periodEndDate:dateOnly(end)}),
    accountingMutations(input.accounting,maxPages),
    input.accounting.getOutstandingInvoices({limit:100,offset:0})
  ]);

  const reconciliation=reconcileExactReferences(bolInvoices,{items:mutations});
  const outstanding=outstandingSnapshot(outstandingBody);
  const invoiceRows=array(bolInvoices,["invoiceListItems","items","invoices"]);
  const varianceCount=reconciliation.counts.bolOnly+reconciliation.counts.accountingOnly+reconciliation.counts.ambiguous;
  const materialVariance=varianceCount>=threshold;

  const brief:Brief={
    period:{start:dateOnly(start),end:dateOnly(end)},
    marketplace:{orders:orders.length,returns:returns.length,invoices:invoiceRows.length},
    accounting:{
      mutations:mutations.length,
      outstandingInvoices:outstanding.count,
      outstandingKnownAmount:outstanding.totalKnownAmount
    },
    reconciliation:{
      matched:reconciliation.counts.matched,
      bolOnly:reconciliation.counts.bolOnly,
      accountingOnly:reconciliation.counts.accountingOnly,
      ambiguous:reconciliation.counts.ambiguous,
      varianceCount
    },
    materialVariance,
    needsOwnerAttention:materialVariance
  };
  const fp=fingerprint(brief);

  const result=await withTransaction(async client=>{
    let goalId:string|null=null;
    if(materialVariance){
      const completion="finance_variance:"+fp;
      const existing=await client.query(
        "SELECT id FROM goals WHERE company_scope=$1 AND domain='finance_reconciliation' AND completion_definition=$2 AND state NOT IN ('COMPLETED','CANCELLED','FAILED') ORDER BY created_at DESC LIMIT 1",
        [input.legalEntityId,completion]
      );
      if(existing.rowCount===1){
        goalId=existing.rows[0].id;
      }else{
        const business=await client.query("SELECT next_business_id('goal',NULL) AS business_id");
        const objective="Resolve finance reconciliation variance: "+varianceCount+" unmatched/ambiguous references for "+brief.period.start+".."+brief.period.end;
        const inserted=await client.query(
          "INSERT INTO goals (business_id,company_scope,domain,objective,state,priority,authority_ceiling,completion_definition) VALUES($1,$2,'finance_reconciliation',$3,'NEW',90,'GREEN',$4) RETURNING id",
          [business.rows[0].business_id,input.legalEntityId,objective,completion]
        );
        goalId=inserted.rows[0].id;
        await client.query(
          "INSERT INTO audit_log(actor,goal_id,action,entity_type,entity_id,after_ref,source,authority_class,result) VALUES('finance-operational-loop',$1,'FINANCE_VARIANCE_GOAL_CREATED','legal_entity',$2,$3::jsonb,'finance_loop','GREEN','CREATED')",
          [goalId,input.legalEntityId,JSON.stringify({fingerprint:fp,brief})]
        );
      }
    }

    await client.query(
      "INSERT INTO audit_log(actor,goal_id,action,entity_type,entity_id,after_ref,source,authority_class,result) VALUES('finance-operational-loop',$1,'FINANCE_OPERATIONAL_BRIEF','legal_entity',$2,$3::jsonb,'finance_loop','GREEN',$4)",
      [goalId,input.legalEntityId,JSON.stringify({fingerprint:fp,brief}),materialVariance?"MATERIAL_VARIANCE":"CLEAN"]
    );
    return {goalId};
  });

  return {status:"EXECUTED",brief,goalId:result.goalId,fingerprint:fp};
}
