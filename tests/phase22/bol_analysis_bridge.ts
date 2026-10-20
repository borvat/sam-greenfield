import assert from "node:assert/strict";
import { BolClient } from "../../vendor/bol-mcp-upstream/src/bol-client";
import { withBolRetailerFromEnv } from "../../apps/production/src/bolBundle";
import { validateProductionBundle } from "../../apps/production/src/bundle";
import { businessDate } from "../../apps/production/src/bolAnalysis";

async function main(){
  const proto=BolClient.prototype;
  const originals={getOrders:proto.getOrders,getInventory:proto.getInventory,getRetailerInformation:proto.getRetailerInformation};
  let reads=0;
  try{
    proto.getOrders=async()=>{reads++;return {orders:[]};};
    proto.getInventory=async()=>{reads++;return {inventory:[]};};
    proto.getRetailerInformation=async()=>{reads++;return {retailerId:"bridge-test"};};
    const bundle=validateProductionBundle(await withBolRetailerFromEnv({capabilities:[],toolDefinitions:[],toolAdapters:[]},{BOL_CLIENT_ID:"test",BOL_CLIENT_SECRET:"test"}));
    const today=Date.parse(`${businessDate(new Date())}T00:00:00Z`);
    const params={startDate:new Date(today-7*86400000).toISOString().slice(0,10),endDate:new Date(today-86400000).toISOString().slice(0,10)};
    const result=await bundle.tools.adapter("bol_sales_stock_report").execute({capabilityId:"bol_sales_stock_report",params,idempotencyKey:"test"});
    assert.equal((result.result as any).report.totals.ordered,0);
    assert.equal(reads,10); // identity + eight exact days + terminal inventory page
    const verified=await bundle.verifiers.get("bol_sales_stock_report")!.verify({execution:{id:"test",capabilityId:"bol_sales_stock_report",params,evidence:result.evidence,operationKeyRef:null},contract:{id:"test",method:"api_readback",requiredEvidenceFields:{},independentQueryTemplate:{}}});
    assert.equal(verified.result,"VERIFIED");assert.equal(reads,20);
    proto.getOrders=async()=>{throw new Error("disconnected");};
    await assert.rejects(bundle.tools.adapter("bol_sales_stock_report").execute({capabilityId:"bol_sales_stock_report",params,idempotencyKey:"test"}),/disconnected/);
    console.log("BOL_ANALYSIS_MCP_BRIDGE PASS empty pages, independent reads, upstream error propagation");
  }finally{Object.assign(proto,originals);}
}
main().catch(error=>{console.error(error);process.exitCode=1;});
