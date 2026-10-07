import assert from "node:assert/strict";
import { createServer } from "node:http";
import { pool } from "../../packages/db/src/client";
import { BolAccessTokenProvider } from "../../packages/bol/src/auth";
import { BolRetailerClient } from "../../packages/bol/src/client";
import { withBolFromEnv,BOL_VERIFICATION_CONTRACTS } from "../../apps/production/src/bolBundle";
import { validateProductionBundle } from "../../apps/production/src/bundle";
import { syncVerificationContracts } from "../../apps/production/src/verificationContracts";

async function mock(){
  const seen:any[]=[];
  let tokens=0;
  let forceOrders401=true;

  const server=createServer(async(req,res)=>{
    const chunks:Buffer[]=[];
    for await(const chunk of req) chunks.push(Buffer.from(chunk));
    const text=Buffer.concat(chunks).toString("utf8");
    seen.push({url:req.url,method:req.method,headers:req.headers,text});

    res.setHeader("content-type","application/json");

    if(req.url==="/token"){
      tokens+=1;
      const expected="Basic "+Buffer.from("client:secret","utf8").toString("base64");
      assert.equal(req.headers.authorization,expected);
      assert.equal(req.headers.accept,"application/json");
      assert.ok(String(req.headers["content-type"]??"").startsWith("application/x-www-form-urlencoded"));
      assert.ok(text.includes("grant_type=client_credentials"));
      res.end(JSON.stringify({
        access_token:`token-${tokens}`,
        token_type:"Bearer",
        expires_in:299
      }));
      return;
    }

    assert.equal(req.headers.accept,"application/vnd.retailer.v10+json");
    assert.equal(req.headers["user-agent"],"sam-executive/1.0");

    if(forceOrders401&&req.url?.startsWith("/retailer/orders?")){
      forceOrders401=false;
      assert.equal(req.headers.authorization,"Bearer token-1");
      res.statusCode=401;
      res.end(JSON.stringify({title:"expired"}));
      return;
    }

    assert.equal(req.headers.authorization,`Bearer token-${tokens}`);

    if(req.url?.startsWith("/retailer/orders?")){
      const u=new URL(`http://local${req.url}`);
      assert.equal(u.searchParams.get("page"),"1");
      assert.equal(u.searchParams.get("fulfilment-method"),"ALL");
      assert.equal(u.searchParams.get("status"),"ALL");
      assert.equal(u.searchParams.get("change-interval-minute"),"60");
      res.end(JSON.stringify({
        orders:[
          {orderId:"O-1",orderPlacedDateTime:"2026-10-07T08:00:00+02:00"},
          {orderId:"O-2",orderPlacedDateTime:"2026-10-07T08:05:00+02:00"}
        ]
      }));
      return;
    }

    if(req.url==="/retailer/orders/O-1"){
      res.end(JSON.stringify({
        orderId:"O-1",
        orderItems:[{orderItemId:"OI-1",ean:"8710000000001",quantity:2,unitPrice:15}]
      }));
      return;
    }

    if(req.url?.startsWith("/retailer/returns?")){
      const u=new URL(`http://local${req.url}`);
      assert.equal(u.searchParams.get("page"),"1");
      assert.equal(u.searchParams.get("handled"),"true");
      assert.equal(u.searchParams.get("fulfilment-method"),"FBR");
      res.end(JSON.stringify({
        returns:[{returnId:"R-1",returnItems:[{rmaId:"RM-1",orderId:"O-1",handled:true}]}]
      }));
      return;
    }

    if(req.url==="/retailer/returns/R-1"){
      res.end(JSON.stringify({
        returnId:"R-1",
        returnItems:[{rmaId:"RM-1",orderId:"O-1",handled:true}]
      }));
      return;
    }

    if(req.url==="/shared/process-status/P-1"){
      res.end(JSON.stringify({
        processStatusId:"P-1",
        entityId:"O-1",
        eventType:"CREATE_SHIPMENT",
        status:"SUCCESS"
      }));
      return;
    }

    res.statusCode=404;
    res.end(JSON.stringify({title:"not found"}));
  });

  await new Promise<void>((resolve)=>server.listen(0,"127.0.0.1",()=>resolve()));
  const address=server.address();
  if(!address||typeof address==="string") throw new Error("mock unavailable");
  return {
    server,
    seen,
    base:`http://127.0.0.1:${address.port}`,
    getTokens:()=>tokens
  };
}

async function main(){
  const m=await mock();
  const tokens=new BolAccessTokenProvider({
    clientId:"client",
    clientSecret:"secret",
    tokenUrl:`${m.base}/token`
  });
  const client=new BolRetailerClient({
    tokens,
    apiRoot:m.base
  });

  const orders=await client.listOrders({
    page:0,
    fulfilmentMethod:"ALL",
    status:"ALL",
    changeIntervalMinute:999
  });
  assert.equal(orders.orders.length,2);
  assert.equal(m.getTokens(),2);

  const order=await client.getOrder("O-1");
  assert.equal(order.orderId,"O-1");

  const returns=await client.listReturns({
    page:-5,
    handled:true,
    fulfilmentMethod:"FBR"
  });
  assert.equal(returns.returns[0].returnId,"R-1");

  const oneReturn=await client.getReturn("R-1");
  assert.equal(oneReturn.returnId,"R-1");

  const processStatus=await client.getProcessStatus("P-1");
  assert.equal(processStatus.status,"SUCCESS");
  assert.equal(m.getTokens(),2);

  const empty={capabilities:[],toolDefinitions:[],toolAdapters:[]};
  const noEnv=withBolFromEnv(empty,{} as NodeJS.ProcessEnv);
  assert.equal(noEnv.capabilities.length,0);

  let partialBlocked=false;
  try{
    withBolFromEnv(empty,{BOL_CLIENT_ID:"client"} as NodeJS.ProcessEnv);
  }catch(err){
    partialBlocked=err instanceof Error&&err.message.includes("BOL_CLIENT_ID");
  }
  assert.equal(partialBlocked,true);

  const configured=withBolFromEnv(empty,{
    BOL_CLIENT_ID:"client",
    BOL_CLIENT_SECRET:"secret",
    BOL_TOKEN_URL:`${m.base}/token`,
    BOL_API_ROOT:m.base
  } as NodeJS.ProcessEnv);

  const expected=[
    "bol_get_order",
    "bol_get_process_status",
    "bol_get_return",
    "bol_list_orders",
    "bol_list_returns"
  ];
  assert.deepEqual(configured.capabilities.map((x)=>x.capabilityId).sort(),expected);
  assert.ok(configured.capabilities.every((x)=>x.authorityClass==="GREEN"));
  assert.ok(configured.toolDefinitions.every((x)=>x.sideEffect===false));

  const validated=validateProductionBundle(configured);
  for(const id of expected){
    assert.ok(validated.verifiers.has(id));
  }

  await syncVerificationContracts(BOL_VERIFICATION_CONTRACTS);
  const contracts=await pool.query(
    "SELECT capability_id FROM verification_contracts WHERE capability_id LIKE 'bol_%' ORDER BY capability_id"
  );
  assert.equal(contracts.rowCount,5);

  const invocations=[
    ["bol_list_orders",{page:1,fulfilment_method:"ALL",status:"ALL",change_interval_minute:60}],
    ["bol_get_order",{order_id:"O-1"}],
    ["bol_list_returns",{page:1,handled:true,fulfilment_method:"FBR"}],
    ["bol_get_return",{return_id:"R-1"}],
    ["bol_get_process_status",{process_status_id:"P-1"}]
  ] as const;

  for(let i=0;i<invocations.length;i++){
    const [id,params]=invocations[i];
    const adapter=validated.tools.adapter(id);
    const read=await adapter.execute({
      capabilityId:id,
      params:{...params},
      idempotencyKey:`read-${i}`
    });
    assert.equal(read.evidence.readback,true);

    const verifier=validated.verifiers.get(id)!;
    const verified=await verifier.verify({
      execution:{
        id:`e-${i}`,
        capabilityId:id,
        params:{...params},
        evidence:read.evidence,
        operationKeyRef:null
      },
      contract:{
        id:`c-${i}`,
        method:"api_readback",
        requiredEvidenceFields:{},
        independentQueryTemplate:{}
      }
    });
    assert.equal(verified.result,"VERIFIED");
    assert.equal(verified.verifier,"bol-independent-readback");
  }

  assert.equal(m.getTokens(),2);

  await new Promise<void>((resolve,reject)=>m.server.close((err)=>err?reject(err):resolve()));
  console.log("PHASE15_BOL_READ PASS capabilities=5");
  await pool.end();
}

main().catch(async(err)=>{
  console.error(err);
  await pool.end();
  process.exit(1);
});
