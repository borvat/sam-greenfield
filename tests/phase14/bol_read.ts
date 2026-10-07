import assert from "node:assert/strict";
import {createServer} from "node:http";
import {BolClientCredentialsProvider,BolRetailerApiClient} from "../../packages/bol/src/client";
import {withBolFromEnv,BOL_VERIFICATION_CONTRACTS} from "../../apps/production/src/bolBundle";
import {validateProductionBundle} from "../../apps/production/src/bundle";
import {syncVerificationContracts} from "../../apps/production/src/verificationContracts";
import {pool} from "../../packages/db/src/client";

async function main(){
 let tokenCalls=0; const seen:any[]=[];
 const server=createServer(async(req,res)=>{
  seen.push({url:req.url,headers:req.headers,method:req.method});res.setHeader("content-type","application/json");
  if(req.url==="/token"){tokenCalls++;assert.ok(String(req.headers.authorization).startsWith("Basic "));res.end(JSON.stringify({access_token:"bol-token",expires_in:299}));return;}
  assert.equal(req.headers.authorization,"Bearer bol-token");assert.equal(req.headers.accept,"application/vnd.retailer.v10+json");
  const u=new URL(`http://x${req.url}`);
  if(u.pathname==="/retailer/orders"){res.end(JSON.stringify({orders:[{orderId:"O1"}]}));return;}
  if(u.pathname==="/retailer/orders/O1"){res.end(JSON.stringify({orderId:"O1",orderItems:[]}));return;}
  if(u.pathname==="/retailer/returns"){res.end(JSON.stringify({returns:[{returnId:"R1"}]}));return;}
  if(u.pathname==="/retailer/shipments"){res.end(JSON.stringify({shipments:[{shipmentId:"S1"}]}));return;}
  if(u.pathname==="/retailer/offers/F1"){res.end(JSON.stringify({offerId:"F1",ean:"8712345678901"}));return;}
  res.statusCode=404;res.end(JSON.stringify({title:"not found"}));
 });
 await new Promise<void>(r=>server.listen(0,"127.0.0.1",()=>r()));
 const a=server.address();if(!a||typeof a==="string")throw new Error("mock");
 const base=`http://127.0.0.1:${a.port}`;
 const tokens=new BolClientCredentialsProvider({clientId:"id",clientSecret:"secret",tokenUrl:`${base}/token`});
 const c=new BolRetailerApiClient({tokens,baseUrl:`${base}/retailer`});
 assert.equal((await c.listOrders({status:"OPEN",fulfilmentMethod:"ALL"})).orders[0].orderId,"O1");
 assert.equal((await c.getOrder("O1")).orderId,"O1");
 assert.equal((await c.listReturns({handled:false})).returns[0].returnId,"R1");
 assert.equal((await c.listShipments({fulfilmentMethod:"ALL"})).shipments[0].shipmentId,"S1");
 assert.equal((await c.getOffer("F1")).offerId,"F1");
 assert.equal(tokenCalls,1);

 const bundle=withBolFromEnv({capabilities:[],toolDefinitions:[],toolAdapters:[]},{BOL_CLIENT_ID:"id",BOL_CLIENT_SECRET:"secret",BOL_TOKEN_URL:`${base}/token`,BOL_RETAILER_BASE_URL:`${base}/retailer`} as NodeJS.ProcessEnv);
 const v=validateProductionBundle(bundle);
 for(const id of ["bol_list_orders","bol_get_order","bol_list_returns","bol_list_shipments","bol_get_offer"]){
  assert.equal(v.catalog.get(id).authorityClass,"GREEN");
  assert.equal(v.tools.definition(id).sideEffect,false);
  assert.ok(v.verifiers.get(id));
 }
 await syncVerificationContracts(BOL_VERIFICATION_CONTRACTS);
 const ids=["bol_list_orders","bol_get_order","bol_list_returns","bol_list_shipments","bol_get_offer"];
 const q=await pool.query("SELECT capability_id FROM verification_contracts WHERE capability_id=ANY($1::text[])",[ids]);
 assert.equal(q.rowCount,5);

 for(const [capabilityId,params] of [
   ["bol_list_orders",{status:"OPEN",fulfilment_method:"ALL"}],
   ["bol_get_order",{order_id:"O1"}],
   ["bol_list_returns",{handled:false}],
   ["bol_list_shipments",{fulfilment_method:"ALL"}],
   ["bol_get_offer",{offer_id:"F1"}]
 ] as const){
   const tool=v.tools.adapter(capabilityId);
   const ex=await tool.execute({capabilityId,params:{...params},idempotencyKey:`verify-${capabilityId}`});
   const check=await v.verifiers.get(capabilityId)!.verify({
     execution:{id:`e-${capabilityId}`,capabilityId,params:{...params},evidence:ex.evidence,operationKeyRef:null},
     contract:{id:`c-${capabilityId}`,method:capabilityId.startsWith("bol_list_")?"list_search":"api_readback",requiredEvidenceFields:{},independentQueryTemplate:{}}
   });
   assert.equal(check.result,"VERIFIED");
 }

 const adapter=v.tools.adapter("bol_get_order");
 const executed=await adapter.execute({capabilityId:"bol_get_order",params:{order_id:"O1"},idempotencyKey:"read"});
 assert.equal((executed.result as any).data.orderId,"O1");
 const verified=await v.verifiers.get("bol_get_order")!.verify({execution:{id:"e",capabilityId:"bol_get_order",params:{order_id:"O1"},evidence:executed.evidence,operationKeyRef:null},contract:{id:"c",method:"api_readback",requiredEvidenceFields:{},independentQueryTemplate:{}}});
 assert.equal(verified.result,"VERIFIED");
 assert.ok(seen.every(x=>x.url==="/token"||x.headers.accept==="application/vnd.retailer.v10+json"));
 await new Promise<void>((resolve,reject)=>server.close(e=>e?reject(e):resolve()));
 console.log("PHASE14_BOL_READ PASS capabilities=5");
 await pool.end();
}
main().catch(async e=>{console.error(e);await pool.end();process.exit(1);});
