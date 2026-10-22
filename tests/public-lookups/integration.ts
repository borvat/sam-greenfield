/** Deterministic planner + real executor/authority functions with an in-memory SQL fixture.
 * Does not certify PostgreSQL RLS or autonomous live reasoning. No model/DB/network calls. */
import assert from 'node:assert/strict';
import {capabilities,definitions,createDevelopmentLookups,ids} from '../../packages/public-lookups/src';
import {CapabilityCatalog} from '../../apps/agents/src/capabilityCatalog';
import {ToolRegistry} from '../../packages/tool-gateway/src/registry';
import {createToolExecutors} from '../../apps/tools/src/executorFactory';
import {proposePlan} from '../../apps/brain/src/planner';
import {pool} from '../../packages/db/src/client';
async function main(){
 const catalog=new CapabilityCatalog(capabilities);let calls=0;
 const adapters=createDevelopmentLookups({fetch:(async()=>{calls++;return new Response(JSON.stringify({valid:false,country_code:'DE',vat_number:'000000000'}),{headers:{'content-type':'application/json'}});}) as typeof fetch});
 const registry=new ToolRegistry(definitions,adapters),executors=createToolExecutors({catalog,tools:registry});
 const params={country:'DE',number:'000000000'};
 const work={queueId:'fixture-queue',fencingToken:1,goalId:'fixture-goal',planId:'fixture-plan',capabilityId:ids.vat,params};
 let tenant='tenant-A',approvedTenant='tenant-B',ceiling='YELLOW',lease=true;
 (pool as any).connect=async()=>({release(){},async query(sql:string,args:unknown[]=[]){
  if(['BEGIN','COMMIT','ROLLBACK'].includes(sql))return {rows:[],rowCount:0};
  if(sql.includes('FROM work_queue'))return {rows:lease?[{id:work.queueId,goal_id:work.goalId,plan_id:work.planId,capability_id:work.capabilityId,authority_ceiling:ceiling,company_scope:tenant}]:[]};
  if(sql.includes('SELECT authority_ceiling'))return {rows:[{authority_ceiling:ceiling}],rowCount:1};
  if(sql.includes('FROM approvals')){assert.equal(args[0],ids.vat);assert.equal(args[3],'YELLOW');assert.equal(args[4],work.goalId);return {rows:[],rowCount:args[2]===approvedTenant?1:0};}
  throw Error('UNEXPECTED_SQL');
 }});
 const gateway={invoke:async(task:any)=>{assert.deepEqual(task.input.capabilities,catalog.planningDescriptors());return {result:{output:{steps:[{capabilityId:ids.vat,params}]}}};}};
 const plan=await proposePlan({gateway:gateway as any,goalId:work.goalId,objective:'Explicit synthetic VAT check',context:{synthetic:true},dataClassification:'PUBLIC',maxCostUsd:0,availableCapabilities:catalog.planningDescriptors()});
 assert.equal(plan.steps[0].capabilityId,ids.vat);
 await assert.rejects(()=>executors[ids.vat](work as any),/AUTHORITY_DENIED/);assert.equal(calls,0); // foreign tenant approval
 approvedTenant=tenant;ceiling='GREEN';await assert.rejects(()=>executors[ids.vat](work as any),/AUTHORITY_DENIED/);assert.equal(calls,0);
 ceiling='YELLOW';lease=false;await assert.rejects(()=>executors[ids.vat](work as any),/LEASE_OR_GOAL_INVALID/);assert.equal(calls,0);
 lease=true;const out=await executors[ids.vat](work as any);assert.equal(out.result.status,'invalid');assert.equal(out.evidence.side_effect,false);assert.equal(calls,1);
 await assert.rejects(()=>executors[ids.vat]({...work,params:{...params,url:'https://evil'}} as any),/PARAMETER_UNKNOWN/);assert.equal(calls,1);
 assert.throws(()=>createToolExecutors({catalog,tools:new ToolRegistry(definitions.map(d=>({...d,authorityClass:'RED'})),adapters)}),/Authority mismatch/);
 assert.throws(()=>new ToolRegistry([],[]).adapter(ids.currency),/No tool adapter/);
 await pool.end();console.log('PASS deterministic planner/catalog/executor: tenant approval, ceiling, lease, schema, authority mismatch; no paid model or database calls');
}
main().catch(async e=>{console.error(e);await pool.end();process.exitCode=1;});
