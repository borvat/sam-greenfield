import assert from "node:assert/strict";
import {pool} from "../../packages/db/src/client";
import {startCommandCenterHttpServer} from "../../apps/command-center/src/http";

async function makeEntity(name:string){
 const org=await pool.query("INSERT INTO organizations(name) VALUES($1) RETURNING id",[name+" org"]);
 const le=await pool.query("INSERT INTO legal_entities(org_id,name) VALUES($1,$2) RETURNING id",[org.rows[0].id,name+" entity"]);
 return le.rows[0].id as string;
}
async function req(base:string,path:string,token?:string,init:RequestInit={}){
 const headers:any={...(init.headers||{})};if(token)headers.authorization="Bearer "+token;if(init.body)headers["content-type"]="application/json";
 const r=await fetch(base+path,{...init,headers});let body:any={};try{body=await r.json()}catch{}
 return {status:r.status,body};
}
async function main(){
 const entity=await makeEntity("P19");
 const other=await makeEntity("P19-other");
 const service=await startCommandCenterHttpServer({
  legalEntityId:entity,port:0,host:"127.0.0.1",bearerToken:"owner-secret",allowedHosts:"127.0.0.1"
 });
 const a=service.server.address();if(!a||typeof a==="string")throw new Error("address");
 const base=`http://127.0.0.1:${a.port}`;

 const live=await fetch(base+"/livez");assert.equal(live.status,200);
 const html=await fetch(base+"/");assert.equal(html.status,200);assert.ok((await html.text()).includes("SAM Executive Command Center"));
 assert.equal((await req(base,"/api/overview")).status,401);

 const created=await req(base,"/api/goals","owner-secret",{method:"POST",body:JSON.stringify({
  objective:"Run a verified finance reconciliation chain and show the result.",
  domain:"finance_reconciliation",
  priority:88,
  authority_ceiling:"YELLOW"
 })});
 assert.equal(created.status,201);
 assert.equal(created.body.data.state,"NEW");
 assert.equal(created.body.data.company_scope,entity);
 assert.equal(created.body.data.authority_ceiling,"YELLOW");
 const goalId=created.body.data.id;

 const audit=await pool.query("SELECT action,source,result FROM audit_log WHERE goal_id=$1",[goalId]);
 assert.equal(audit.rowCount,1);assert.equal(audit.rows[0].action,"OWNER_GOAL_CREATED");assert.equal(audit.rows[0].source,"command_center");

 await pool.query(`INSERT INTO goals(business_id,company_scope,domain,objective,state,priority,authority_ceiling)
 VALUES((SELECT next_business_id('goal',NULL)),$1,'other','hidden','NEW',99,'GREEN')`,[other]);

 const overview=await req(base,"/api/overview","owner-secret");assert.equal(overview.status,200);assert.equal(overview.body.data.active_goals,1);
 const goals=await req(base,"/api/goals","owner-secret");assert.equal(goals.status,200);assert.equal(goals.body.data.length,1);assert.equal(goals.body.data[0].id,goalId);

 const timeline=await req(base,`/api/goals/${goalId}/timeline`,"owner-secret");assert.equal(timeline.status,200);assert.equal(timeline.body.data.goal.id,goalId);
 const hidden=await pool.query("SELECT id FROM goals WHERE company_scope=$1",[other]);
 assert.equal((await req(base,`/api/goals/${hidden.rows[0].id}/timeline`,"owner-secret")).status,404);

 await pool.query(`INSERT INTO audit_log(actor,goal_id,action,entity_type,entity_id,after_ref,source,authority_class,result,timestamp)
 VALUES('test',$1,'FINANCE_OPERATIONAL_BRIEF','legal_entity',$2,$3::jsonb,'finance_loop','GREEN','CLEAN','2026-10-07T12:00:00Z')`,[goalId,entity,JSON.stringify({brief:{materialVariance:false,scope:"configured"}})]);
 await pool.query(`INSERT INTO audit_log(actor,goal_id,action,entity_type,entity_id,after_ref,source,authority_class,result,timestamp)
 VALUES('test',$1,'FINANCE_OPERATIONAL_BRIEF','legal_entity',$2,$3::jsonb,'finance_loop','GREEN','MATERIAL_VARIANCE','2026-10-07T13:00:00Z')`,[hidden.rows[0].id,other,JSON.stringify({brief:{materialVariance:true,scope:"other"}})]);
 const finance=await req(base,"/api/finance/latest","owner-secret");
 assert.equal(finance.status,200);
 assert.equal(finance.body.data.goal_id,goalId);
 assert.equal(finance.body.data.after_ref.brief.scope,"configured");

 const red=await req(base,"/api/goals","owner-secret",{method:"POST",body:JSON.stringify({
  objective:"Forbidden red goal",authority_ceiling:"RED"
 })});
 assert.equal(red.status,400);

 await service.close();
 console.log("PHASE19_COMMAND_CENTER PASS");
 await pool.end();
}
main().catch(async e=>{console.error(e);await pool.end();process.exit(1)});
