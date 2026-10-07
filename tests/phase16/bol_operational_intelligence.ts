import assert from "node:assert/strict";
import {createServer} from "node:http";
import {BolRetailerClient} from "../../packages/bol/src/client";
import {withBolRetailerFromEnv,BOL_VERIFICATION_CONTRACTS} from "../../apps/production/src/bolBundle";
import {validateProductionBundle} from "../../apps/production/src/bundle";
import {syncVerificationContracts} from "../../apps/production/src/verificationContracts";
import {pool} from "../../packages/db/src/client";

async function main(){
 let tokenCalls=0; const calls:any[]=[];
 const server=createServer(async(req,res)=>{
  calls.push({url:req.url,headers:req.headers});res.setHeader("content-type","application/json");
  if(req.url==="/token"){tokenCalls++;res.end(JSON.stringify({access_token:"t",expires_in:299}));return;}
  assert.equal(req.headers.authorization,"Bearer t");
  assert.equal(req.headers.accept,"application/vnd.retailer.v10+json");
  const u=new URL(`http://x${req.url}`);
  if(u.pathname==="/retailer/orders/O-1"){res.end(JSON.stringify({orderId:"O-1",orderItems:[{orderItemId:"I-1"}]}));return;}
  if(u.pathname==="/retailer/shipments"){res.end(JSON.stringify({shipments:[{shipmentId:"S-1"}]}));return;}
  if(u.pathname==="/retailer/commission/8712345678901"){assert.equal(u.searchParams.get("unit-price"),"19.99");res.end(JSON.stringify({ean:"8712345678901",totalCost:3.25}));return;}
  if(u.pathname==="/retailer/products/8712345678901/offers"){assert.equal(u.searchParams.get("country-code"),"NL");res.end(JSON.stringify({offers:[{offerId:"C-1",price:18.95,bestOffer:true}]}));return;}
  if(u.pathname==="/retailer/orders"){res.end(JSON.stringify({orders:[]}));return;}
  if(u.pathname==="/retailer/returns"){res.end(JSON.stringify({returns:[]}));return;}
  if(u.pathname==="/retailer/invoices"){res.end(JSON.stringify({invoiceListItems:[]}));return;}
  if(u.pathname==="/retailer/retailers/current"){res.end(JSON.stringify({retailerId:"R"}));return;}
  res.statusCode=404;res.end(JSON.stringify({title:"not found"}));
 });
 await new Promise<void>(r=>server.listen(0,"127.0.0.1",()=>r()));
 const a=server.address();if(!a||typeof a==="string")throw new Error("mock");
 const base=`http://127.0.0.1:${a.port}`;
 const env={BOL_CLIENT_ID:"id",BOL_CLIENT_SECRET:"secret",BOL_TOKEN_URL:`${base}/token`,BOL_RETAILER_BASE_URL:`${base}/retailer`} as NodeJS.ProcessEnv;
 const bundle=withBolRetailerFromEnv({capabilities:[],toolDefinitions:[],toolAdapters:[]},env);
 const v=validateProductionBundle(bundle);
 const specs=[
  ["bol_get_order",{order_id:"O-1"}],
  ["bol_list_shipments",{page:1,fulfilment_method:"ALL"}],
  ["bol_get_commission",{ean:"8712345678901",unit_price:19.99,condition:"NEW"}],
  ["bol_get_competing_offers",{ean:"8712345678901",country_code:"NL",best_offer_only:true,condition:"NEW"}]
 ] as const;
 for(const [id,params] of specs){
  assert.equal(v.catalog.get(id).authorityClass,"GREEN");
  assert.equal(v.tools.definition(id).sideEffect,false);
  const ex=await v.tools.adapter(id).execute({capabilityId:id,params:{...params},idempotencyKey:`read-${id}`});
  assert.ok((ex.result as any).data);
  const vr=await v.verifiers.get(id)!.verify({execution:{id:`e-${id}`,capabilityId:id,params:{...params},evidence:ex.evidence,operationKeyRef:null},contract:{id:`c-${id}`,method:"api_readback",requiredEvidenceFields:{},independentQueryTemplate:{}}});
  assert.equal(vr.result,"VERIFIED");
 }
 await syncVerificationContracts(BOL_VERIFICATION_CONTRACTS);
 const ids=specs.map(x=>x[0]);
 const q=await pool.query("SELECT capability_id FROM verification_contracts WHERE capability_id=ANY($1::text[])",[ids]);
 assert.equal(q.rowCount,4);
 assert.equal(tokenCalls,1);
 assert.throws(()=>new BolRetailerClient({clientId:"x",clientSecret:"y"}).getCommission({ean:"bad",unitPrice:1}),/EAN/);
 assert.throws(()=>new BolRetailerClient({clientId:"x",clientSecret:"y"}).getCompetingOffers({ean:"8712345678901",countryCode:"DE"}),/Invalid value/);
 await new Promise<void>((resolve,reject)=>server.close(e=>e?reject(e):resolve()));
 console.log("PHASE16_BOL_INTELLIGENCE PASS capabilities=4");
 await pool.end();
}
main().catch(async e=>{console.error(e);await pool.end();process.exit(1);});
