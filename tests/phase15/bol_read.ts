import assert from "node:assert/strict";
import { createServer } from "node:http";
import { pool } from "../../packages/db/src/client";
import { BolRetailerClient } from "../../packages/bol/src/client";
import { withBolRetailerFromEnv,BOL_VERIFICATION_CONTRACTS } from "../../apps/production/src/bolBundle";
import { validateProductionBundle } from "../../apps/production/src/bundle";
import { syncVerificationContracts } from "../../apps/production/src/verificationContracts";

async function mock(){
  const seen:any[]=[];
  let tokens=0;
  let force401=true;
  let successfulOrderReads=0;

  const server=createServer(async(req,res)=>{
    const chunks:Buffer[]=[];
    for await(const chunk of req) chunks.push(Buffer.from(chunk));
    const text=Buffer.concat(chunks).toString("utf8");
    seen.push({url:req.url,method:req.method,headers:req.headers,text});
    res.setHeader("content-type","application/json");

    if(req.url==="/token"){
      tokens+=1;
      assert.equal(req.method,"POST");
      assert.equal(
        req.headers.authorization,
        "Basic "+Buffer.from("client:secret").toString("base64")
      );
      assert.equal(req.headers.accept,"application/json");
      assert.ok(text.includes("grant_type=client_credentials"));
      res.end(JSON.stringify({
        access_token:`access-${tokens}`,
        token_type:"Bearer",
        expires_in:299
      }));
      return;
    }

    assert.equal(req.headers.accept,"application/vnd.retailer.v10+json");

    if(force401&&req.url?.startsWith("/retailer/orders?")){
      force401=false;
      assert.equal(req.headers.authorization,"Bearer access-1");
      res.statusCode=401;
      res.end(JSON.stringify({title:"expired"}));
      return;
    }

    assert.equal(req.headers.authorization,`Bearer access-${tokens}`);

    if(req.url?.startsWith("/retailer/orders?")){
      successfulOrderReads+=1;
      const u=new URL(`http://local${req.url}`);
      assert.equal(
        u.searchParams.get("page"),
        successfulOrderReads===1?"200":"1"
      );
      assert.equal(u.searchParams.get("fulfilment-method"),"ALL");
      assert.equal(u.searchParams.get("status"),"OPEN");
      if(successfulOrderReads===1){
        assert.equal(u.searchParams.get("change-interval-minute"),"60");
      }
      res.end(JSON.stringify({orders:[{orderId:"o1"}]}));
      return;
    }

    if(req.url?.startsWith("/retailer/returns?")){
      res.end(JSON.stringify({returns:[{returnId:"r1"}]}));
      return;
    }

    if(req.url?.startsWith("/retailer/invoices")){
      res.end(JSON.stringify({invoiceListItems:[{invoiceId:"i1"}]}));
      return;
    }

    if(req.url==="/retailer/retailers/current"){
      res.end(JSON.stringify({retailerId:"1055479",companyName:"QNAN"}));
      return;
    }

    res.statusCode=404;
    res.end(JSON.stringify({title:"not found"}));
  });

  await new Promise<void>((resolve)=>server.listen(0,"127.0.0.1",()=>resolve()));
  const address=server.address();
  if(!address||typeof address==="string") throw new Error("mock unavailable");
  const base=`http://127.0.0.1:${address.port}`;
  return {server,seen,base,getTokens:()=>tokens};
}

async function main(){
  const m=await mock();
  const client=new BolRetailerClient({
    clientId:"client",
    clientSecret:"secret",
    tokenUrl:`${m.base}/token`,
    baseUrl:`${m.base}/retailer`
  });

  const orders=await client.listOrders({
    page:999,
    fulfilmentMethod:"ALL",
    status:"OPEN",
    changeIntervalMinute:999
  });
  assert.equal(orders.orders[0].orderId,"o1");
  assert.equal(m.getTokens(),2);

  const returns=await client.listReturns({page:1,handled:false,fulfilmentMethod:"FBR"});
  assert.equal(returns.returns[0].returnId,"r1");

  const invoices=await client.listInvoices({
    periodStartDate:"2026-09-01",
    periodEndDate:"2026-09-30"
  });
  assert.equal(invoices.invoiceListItems[0].invoiceId,"i1");

  const retailer=await client.getCurrentRetailer();
  assert.equal(retailer.retailerId,"1055479");
  assert.equal(m.getTokens(),2);

  const boundaryRange=await client.listInvoices({
    periodStartDate:"2026-09-01",
    periodEndDate:"2026-10-02"
  });
  assert.equal(boundaryRange.invoiceListItems[0].invoiceId,"i1");

  let badRange=false;
  try{
    await client.listInvoices({
      periodStartDate:"2026-09-01",
      periodEndDate:"2026-10-03"
    });
  }catch{
    badRange=true;
  }
  assert.equal(badRange,true);

  const baseBundle={capabilities:[],toolDefinitions:[],toolAdapters:[]};
  assert.equal(
    withBolRetailerFromEnv(baseBundle,{} as NodeJS.ProcessEnv).capabilities.length,
    0
  );

  const configured=withBolRetailerFromEnv(baseBundle,{
    BOL_CLIENT_ID:"client",
    BOL_CLIENT_SECRET:"secret",
    BOL_TOKEN_URL:`${m.base}/token`,
    BOL_RETAILER_BASE_URL:`${m.base}/retailer`
  } as NodeJS.ProcessEnv);

  const validated=validateProductionBundle(configured);
  for(const id of [
    "bol_list_orders",
    "bol_list_returns",
    "bol_list_invoices",
    "bol_get_retailer"
  ]){
    assert.equal(validated.catalog.get(id).authorityClass,"GREEN");
    assert.equal(validated.tools.definition(id).sideEffect,false);
    assert.ok(validated.verifiers.has(id));
  }

  await syncVerificationContracts(BOL_VERIFICATION_CONTRACTS);
  const expectedBolCapabilities=[
    "bol_list_orders",
    "bol_list_returns",
    "bol_list_invoices",
    "bol_get_retailer"
  ];
  const contracts=await pool.query(
    "SELECT capability_id FROM verification_contracts WHERE capability_id=ANY($1::text[]) ORDER BY capability_id",
    [expectedBolCapabilities]
  );
  assert.equal(contracts.rowCount,4);
  assert.deepEqual(
    contracts.rows.map((r)=>r.capability_id).sort(),
    [...expectedBolCapabilities].sort()
  );

  const adapter=validated.tools.adapter("bol_list_orders");
  const read=await adapter.execute({
    capabilityId:"bol_list_orders",
    params:{page:1,fulfilment_method:"ALL",status:"OPEN"},
    idempotencyKey:"read-only"
  });
  assert.equal((read.result as any).data.orders[0].orderId,"o1");

  const verificationInputs:any={
    bol_list_orders:{page:1,fulfilment_method:"ALL",status:"OPEN"},
    bol_list_returns:{page:1,handled:false,fulfilment_method:"FBR"},
    bol_list_invoices:{period_start_date:"2026-09-01",period_end_date:"2026-09-30"},
    bol_get_retailer:{}
  };
  for(const id of expectedBolCapabilities){
    const verifier=validated.verifiers.get(id)!;
    const verified=await verifier.verify({
      execution:{
        id:`e15-${id}`,
        capabilityId:id,
        params:verificationInputs[id],
        evidence:{readback:true},
        operationKeyRef:null
      },
      contract:{id:`c15-${id}`,method:"api_readback",requiredEvidenceFields:{},independentQueryTemplate:{}}
    });
    assert.equal(verified.result,"VERIFIED");
  }

  assert.equal(
    configured.capabilities.some((c)=>c.capabilityId.startsWith("bol_")&&c.authorityClass!=="GREEN"),
    false
  );
  assert.equal(
    configured.toolDefinitions.some((t)=>t.capabilityId.startsWith("bol_")&&t.sideEffect),
    false
  );

  await new Promise<void>((resolve,reject)=>m.server.close((err)=>err?reject(err):resolve()));
  console.log("PHASE15_BOL_READ PASS capabilities=4");
  await pool.end();
}

main().catch(async(err)=>{
  console.error(err);
  await pool.end();
  process.exit(1);
});
