import assert from "node:assert/strict";
import {createServer} from "node:http";
import {pool} from "../../packages/db/src/client";
import {BolRetailerClient} from "../../packages/bol/src/client";
import {EBoekhoudenClient} from "../../packages/eboekhouden/src/client";
import {runFinanceOperationalLoop} from "../../apps/finance/src/operationalLoop";
import {createFinanceOperationalTickFromEnv} from "../../apps/production/src/financeOperationalLoop";

async function makeLegalEntity(label:string){
  const org=await pool.query("INSERT INTO organizations(name) VALUES($1) RETURNING id",[label+" org"]);
  const le=await pool.query("INSERT INTO legal_entities(org_id,name) VALUES($1,$2) RETURNING id",[org.rows[0].id,label+" le"]);
  return le.rows[0].id as string;
}

async function mockBol(){
  let tokens=0;
  const server=createServer(async(req,res)=>{
    res.setHeader("content-type","application/json");
    if(req.url==="/token"){
      tokens++;
      res.end(JSON.stringify({access_token:"bt",expires_in:299}));
      return;
    }
    assert.equal(req.headers.authorization,"Bearer bt");
    const u=new URL(`http://local${req.url}`);
    if(u.pathname==="/retailer/orders"){
      const page=Number(u.searchParams.get("page"));
      res.end(JSON.stringify({orders:page===1?[{orderId:"O1"},{orderId:"O2"}]:[]}));
      return;
    }
    if(u.pathname==="/retailer/returns"){
      const page=Number(u.searchParams.get("page"));
      res.end(JSON.stringify({returns:page===1?[{returnId:"R1"}]:[]}));
      return;
    }
    if(u.pathname==="/retailer/invoices"){
      assert.equal(u.searchParams.get("period-start-date"),"2026-09-07");
      assert.equal(u.searchParams.get("period-end-date"),"2026-10-07");
      res.end(JSON.stringify({invoiceListItems:[
        {invoiceId:"INV-100",amount:100},
        {invoiceId:"INV-200",amount:50}
      ]}));
      return;
    }
    res.statusCode=404;
    res.end(JSON.stringify({title:"not found"}));
  });
  await new Promise<void>(r=>server.listen(0,"127.0.0.1",()=>r()));
  const a=server.address(); if(!a||typeof a==="string") throw new Error("bol mock");
  return {server,base:`http://127.0.0.1:${a.port}`,tokens:()=>tokens};
}

async function mockE(){
  let sessions=0;
  const server=createServer(async(req,res)=>{
    const chunks:Buffer[]=[];
    for await(const chunk of req) chunks.push(Buffer.from(chunk));
    const text=Buffer.concat(chunks).toString("utf8");
    res.setHeader("content-type","application/json");
    if(req.url==="/v1/session"){
      sessions++;
      const body=JSON.parse(text);
      assert.equal(body.accessToken,"api");
      res.end(JSON.stringify({token:"et",expiresIn:3600}));
      return;
    }
    assert.equal(req.headers.authorization,"et");
    const u=new URL(`http://local${req.url}`);
    if(u.pathname==="/v1/mutation"){
      assert.equal(u.searchParams.get("limit"),"100");
      assert.equal(u.searchParams.get("offset"),"0");
      res.end(JSON.stringify({items:[
        {id:"M1",invoiceNumber:"INV-100"},
        {id:"M2",invoiceNumber:"INV-300"}
      ]}));
      return;
    }
    if(u.pathname==="/v1/mutation/invoice/outstanding"){
      res.end(JSON.stringify({items:[
        {id:"A1",amount:42.5},
        {id:"A2",amount:"7.50"},
        {id:"A3"}
      ]}));
      return;
    }
    res.statusCode=404;
    res.end(JSON.stringify({message:"not found"}));
  });
  await new Promise<void>(r=>server.listen(0,"127.0.0.1",()=>r()));
  const a=server.address(); if(!a||typeof a==="string") throw new Error("e mock");
  return {server,base:`http://127.0.0.1:${a.port}`,sessions:()=>sessions};
}

async function main(){
  const b=await mockBol();
  const e=await mockE();
  const bol=new BolRetailerClient({clientId:"id",clientSecret:"secret",tokenUrl:`${b.base}/token`,baseUrl:`${b.base}/retailer`});
  const accounting=new EBoekhoudenClient({apiToken:"api",source:"SAM",baseUrl:e.base});
  const entity=await makeLegalEntity("P18");
  const now=new Date("2026-10-07T12:00:00Z");

  const first=await runFinanceOperationalLoop({
    bol,accounting,legalEntityId:entity,now,
    intervalMinutes:180,lookbackDays:30,materialVarianceCount:1,maxPages:2
  });
  assert.equal(first.status,"EXECUTED");
  assert.equal(first.brief?.marketplace.orders,2);
  assert.equal(first.brief?.marketplace.returns,1);
  assert.equal(first.brief?.marketplace.invoices,2);
  assert.equal(first.brief?.accounting.mutations,2);
  assert.equal(first.brief?.accounting.outstandingInvoices,3);
  assert.equal(first.brief?.accounting.outstandingKnownAmount,50);
  assert.equal(first.brief?.reconciliation.matched,1);
  assert.equal(first.brief?.reconciliation.bolOnly,1);
  assert.equal(first.brief?.reconciliation.accountingOnly,1);
  assert.equal(first.brief?.reconciliation.ambiguous,0);
  assert.equal(first.brief?.reconciliation.varianceCount,2);
  assert.equal(first.brief?.materialVariance,true);
  assert.ok(first.goalId);

  const goal=await pool.query(
    "SELECT state,domain,priority,authority_ceiling,completion_definition FROM goals WHERE id=$1",
    [first.goalId]
  );
  assert.equal(goal.rows[0].state,"NEW");
  assert.equal(goal.rows[0].domain,"finance_reconciliation");
  assert.equal(goal.rows[0].priority,90);
  assert.equal(goal.rows[0].authority_ceiling,"GREEN");
  assert.ok(String(goal.rows[0].completion_definition).startsWith("finance_variance:"));

  const audit=await pool.query(
    "SELECT action,result FROM audit_log WHERE entity_id=$1 AND action IN ('FINANCE_OPERATIONAL_BRIEF','FINANCE_VARIANCE_GOAL_CREATED') ORDER BY timestamp",
    [entity]
  );
  assert.equal(audit.rowCount,2);
  assert.deepEqual(audit.rows.map(r=>r.action).sort(),["FINANCE_OPERATIONAL_BRIEF","FINANCE_VARIANCE_GOAL_CREATED"].sort());

  const recent=await runFinanceOperationalLoop({
    bol,accounting,legalEntityId:entity,now:new Date("2026-10-07T13:00:00Z"),
    intervalMinutes:180,lookbackDays:30,materialVarianceCount:1,maxPages:2
  });
  assert.equal(recent.status,"SKIPPED_RECENT");

  const later=await runFinanceOperationalLoop({
    bol,accounting,legalEntityId:entity,now:new Date("2026-10-07T15:01:00Z"),
    intervalMinutes:180,lookbackDays:30,materialVarianceCount:1,maxPages:2
  });
  assert.equal(later.status,"EXECUTED");
  assert.equal(later.goalId,first.goalId);
  const goalsAfter=await pool.query("SELECT COUNT(*)::int AS count FROM goals WHERE company_scope=$1 AND domain='finance_reconciliation'",[entity]);
  assert.equal(Number(goalsAfter.rows[0].count),1);

  const cleanEntity=await makeLegalEntity("P18 clean");
  const clean=await runFinanceOperationalLoop({
    bol,accounting,legalEntityId:cleanEntity,now,
    intervalMinutes:180,lookbackDays:30,materialVarianceCount:99,maxPages:2
  });
  assert.equal(clean.status,"EXECUTED");
  assert.equal(clean.brief?.materialVariance,false);
  assert.equal(clean.goalId,null);

  const lockEntity=await makeLegalEntity("P18 lock");
  const pair=await Promise.all([
    runFinanceOperationalLoop({bol,accounting,legalEntityId:lockEntity,now,intervalMinutes:180,lookbackDays:30,materialVarianceCount:1,maxPages:2}),
    runFinanceOperationalLoop({bol,accounting,legalEntityId:lockEntity,now,intervalMinutes:180,lookbackDays:30,materialVarianceCount:1,maxPages:2})
  ]);
  assert.ok(pair.some(x=>x.status==="EXECUTED"));
  assert.ok(pair.some(x=>x.status==="SKIPPED_LOCKED"));

  assert.equal(createFinanceOperationalTickFromEnv({} as NodeJS.ProcessEnv),undefined);
  assert.equal(createFinanceOperationalTickFromEnv({
    SAM_FINANCE_LEGAL_ENTITY_ID:entity,
    BOL_CLIENT_ID:"id",
    BOL_CLIENT_SECRET:"secret"
  } as NodeJS.ProcessEnv),undefined);
  assert.equal(typeof createFinanceOperationalTickFromEnv({
    SAM_FINANCE_LEGAL_ENTITY_ID:entity,
    BOL_CLIENT_ID:"id",
    BOL_CLIENT_SECRET:"secret",
    BOL_TOKEN_URL:`${b.base}/token`,
    BOL_RETAILER_BASE_URL:`${b.base}/retailer`,
    EBOEKHOUDEN_API_TOKEN:"api",
    EBOEKHOUDEN_API_BASE_URL:e.base,
    EBOEKHOUDEN_SOURCE:"SAM"
  } as NodeJS.ProcessEnv),"function");

  assert.equal(b.tokens(),1);
  assert.equal(e.sessions(),1);

  await new Promise<void>((resolve,reject)=>b.server.close(err=>err?reject(err):resolve()));
  await new Promise<void>((resolve,reject)=>e.server.close(err=>err?reject(err):resolve()));
  console.log("PHASE18_OPERATIONAL_FINANCE_LOOP PASS");
  await pool.end();
}
main().catch(async e=>{console.error(e);await pool.end();process.exit(1);});
