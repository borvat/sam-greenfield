import assert from "node:assert/strict";
import test from "node:test";
import { proposePlan } from "../../apps/brain/src/planner";
const ids=["bol_list_orders","bol_get_inventory","bol_list_returns","bol_get_offer","bol_get_retailer_information","bol_sales_stock_report","gmail_list_messages","drive_search"];
const availableCapabilities=ids.map(capabilityId=>({capabilityId,sideEffect:false,parameters:{type:"object"}}));
async function plan(objective:string,chosen:string[]){
  let offered:string[]=[];
  const result=await proposePlan({goalId:"test",objective,context:{},dataClassification:"INTERNAL",maxCostUsd:0.1,availableCapabilities,gateway:{async invoke(task:any){offered=task.input.capabilities.map((c:any)=>c.capabilityId);return {result:{output:{steps:chosen.map(capabilityId=>({capabilityId,params:{}}))}}};}} as any});
  return {result,offered};
}
test("explicit narrow bol reads do not force unrelated orders and inventory",async()=>{
  for(const id of ["bol_get_inventory","bol_list_returns","bol_get_offer","bol_get_retailer_information"]){
    const {result,offered}=await plan(`read-only bol.com acceptance: use ${id} only. No order/stock changes.`,[id]);
    assert.deepEqual(offered,[id]);assert.equal(result.steps.length,1);
  }
});
test("explicit multi-specialist reads stay available together",async()=>{
  const {offered}=await plan("قراءة فقط: استخدم gmail_list_messages وdrive_search للتحقق من البيانات الوصفية",["gmail_list_messages","drive_search"]);
  assert.deepEqual(offered,["gmail_list_messages","drive_search"]);
});
test("natural-language identity reads are not assigned an arbitrary two-step minimum",async()=>{
  const {result}=await plan("read-only bol.com account identity",["bol_get_retailer_information"]);
  assert.equal(result.steps.length,1);
});
test("unavailable or mutating explicit tools never become executable",async()=>{
  await assert.rejects(plan("read-only bol.com use bol_cancel_order_item",["bol_cancel_order_item"]),/unavailable/);
});
