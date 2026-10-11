import {createHash} from "node:crypto";
import {withTenantTransaction} from "../../../packages/db/src/client";
import {createOwnerGoal} from "../../command-center/src/store";
import {validateGoalAcceptance,encodeGoalAcceptance,checkGoalAcceptance} from "../../kernel/src/goalAcceptance";
import {ChatGPTToolRegistry} from "../../chatgpt-tools/src/registry";
import type {RegisteredChatGPTTool} from "../../chatgpt-tools/src/types";
import {requirePrincipal,type SyntheticPrincipal} from "../../mcp/src/oauthResource";
import {sha256Hex} from "../../../packages/shared/src/stableJson";
import type {ValidatedProductionBundle} from "../../production/src/bundle";

const uuid=/^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i;
function exact(args:Record<string,unknown>,keys:string[]){
  if(!args||Array.isArray(args)||Object.keys(args).sort().join(",")!==keys.sort().join(","))throw new Error("DIRECT_REQUEST_INVALID");
}
function idFor(actor:string,id:string){
  const b=createHash("sha256").update(actor+":"+id.toLowerCase()).digest().subarray(0,16);
  b[6]=(b[6]&15)|80;b[8]=(b[8]&63)|128;const h=b.toString("hex");
  return `${h.slice(0,8)}-${h.slice(8,12)}-${h.slice(12,16)}-${h.slice(16,20)}-${h.slice(20)}`;
}
async function owned(client:any,id:string,p:SyntheticPrincipal){
  if(!uuid.test(id))throw new Error("DIRECT_REQUEST_INVALID");
  return (await client.query(`SELECT g.* FROM goals g WHERE g.id=$1 AND g.company_scope=$2
    AND g.domain='executive' AND g.authority_ceiling='GREEN'
    AND EXISTS(SELECT 1 FROM audit_log a WHERE a.goal_id=g.id AND a.actor=$3
      AND a.source='chatgpt_mcp' AND a.action='OWNER_GOAL_CREATED')`,[id,p.entityId,p.actor])).rows[0];
}
export function createDirectGoalSurface(bundle:ValidatedProductionBundle,goalsPerDay:number){
  const capabilities=new Set(bundle.raw.capabilities.map(c=>c.capabilityId));
  const tool=(name:string,description:string,read:boolean,inputSchema:Record<string,unknown>,
    fn:(args:any,p:SyntheticPrincipal,client:any)=>Promise<unknown>):RegisteredChatGPTTool=>({
    definition:{name,description,risk:read?"READ":"GREEN",availability:read?"READ_ONLY":"AVAILABLE",inputSchema},
    handler:async args=>{
      let p:SyntheticPrincipal;
      try{p=requirePrincipal(read?"sam:read":"sam:submit");}
      catch{return {ok:false,error:read?"MCP_SCOPE_REQUIRED_READ":"MCP_SCOPE_REQUIRED_SUBMIT"};}
      try{return {ok:true,data:await withTenantTransaction({orgId:p.orgId,legalEntityId:p.entityId},client=>fn(args,p,client))};}
      catch(error){const code=error instanceof Error&&["DIRECT_DAILY_GOAL_LIMIT","DIRECT_REPLAY_CONFLICT","DIRECT_GOAL_NOT_FOUND"].includes(error.message)?error.message:"DIRECT_REQUEST_REFUSED";
        return {ok:false,error:code};}
    }
  });
  const readSchema={type:"object",properties:{goal_id:{type:"string"}},required:["goal_id"],additionalProperties:false};
  return new ChatGPTToolRegistry([
    tool("sam_capabilities","List the capabilities actually configured and independently verified by this SAM deployment. Check this before submitting a goal.",true,
      {type:"object",properties:{},additionalProperties:false},async args=>{exact(args,[]);return {capabilities:bundle.catalog.planningDescriptors(),authorityCeiling:"GREEN",goalContractRequired:true};}),
    tool("sam_submit_goal","Save an owner goal for SAM's planner and worker. Use a stable UUID request_id for retries. Include an acceptance_contract version 1: constraints [{capabilityId,params,result:{field,equals}}] or result:{field,exists:true} for a source read whose value is unknown. A receipt reports verification only after execution and independent readback.",false,
      {type:"object",properties:{request_id:{type:"string"},objective:{type:"string"},acceptance_contract:{type:"object"}},
        required:["request_id","objective","acceptance_contract"],additionalProperties:false},async(args,p,client)=>{
      exact(args,["request_id","objective","acceptance_contract"]);
      if(typeof args.request_id!=="string"||!uuid.test(args.request_id)||typeof args.objective!=="string"||
        !args.objective.trim()||Buffer.byteLength(args.objective)>4096||/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(args.objective))throw new Error("DIRECT_REQUEST_INVALID");
      const acceptance=validateGoalAcceptance(args.acceptance_contract);
      if(acceptance.constraints.some(c=>!capabilities.has(c.capabilityId)))throw new Error("DIRECT_CAPABILITY_NOT_CONFIGURED");
      const id=idFor(p.actor,args.request_id),objective=args.objective.trim(),completion=encodeGoalAcceptance(acceptance);
      await client.query("SELECT pg_advisory_xact_lock(hashtextextended($1,0))",["direct-intake:"+p.actor]);
      const prior=await owned(client,id,p);
      if(prior){
        if(prior.objective!==objective||prior.completion_definition!==completion)throw new Error("DIRECT_REPLAY_CONFLICT");
        return {goal_id:id,state:prior.state,replayed:true};
      }
      const count=(await client.query(`SELECT count(*)::int n FROM audit_log WHERE actor=$1 AND source='chatgpt_mcp'
        AND action='OWNER_GOAL_CREATED' AND timestamp>=date_trunc('day',now() AT TIME ZONE 'UTC') AT TIME ZONE 'UTC'`,[p.actor])).rows[0].n;
      if(count>=goalsPerDay)throw new Error("DIRECT_DAILY_GOAL_LIMIT");
      const goal=await createOwnerGoal(p.entityId,{objective,domain:"executive",authorityCeiling:"GREEN",acceptanceContract:acceptance},
        {client,goalId:id,actor:p.actor});
      return {goal_id:goal.id,state:goal.state,replayed:false};
    }),
    tool("sam_get_goal_status","Read this owner's saved goal, current plan and worker progress. BLOCKED and WAITING_OWNER are incomplete outcomes.",true,readSchema,
      async(args,p,client)=>{
        exact(args,["goal_id"]);const goal=await owned(client,args.goal_id,p);if(!goal)throw new Error("DIRECT_GOAL_NOT_FOUND");
        const steps=goal.current_plan_id?(await client.query(`SELECT capability_id,status,attempt FROM work_queue WHERE goal_id=$1 AND plan_id=$2 ORDER BY queued_at,id`,[goal.id,goal.current_plan_id])).rows:[];
        return {goal_id:goal.id,state:goal.state,steps,replan_attempts:goal.replan_attempts};
      }),
    tool("sam_get_goal_result","Return persisted results only for a completed goal with independent hash-bound verification receipts and the owner's acceptance contract satisfied.",true,readSchema,
      async(args,p,client)=>{
        exact(args,["goal_id"]);const goal=await owned(client,args.goal_id,p);if(!goal)throw new Error("DIRECT_GOAL_NOT_FOUND");
        if(goal.state!=="COMPLETED")return {goal_id:goal.id,state:goal.state,verified:false};
        const plan=(await client.query("SELECT * FROM plans WHERE id=$1 AND goal_id=$2",[goal.current_plan_id,goal.id])).rows[0];
        if(!plan||sha256Hex({goal_id:goal.id,version:plan.version,assumptions:plan.goal_assumptions,
          constraints:plan.constraints,dependencies:plan.dependencies,steps:plan.steps})!==plan.plan_hash)throw new Error("DIRECT_RECEIPT_INVALID");
        const rows=(await client.query(`SELECT e.*,v.id verification_id,v.verifier,v.checked_at,v.independent_evidence
          FROM executions e JOIN verifications v ON v.execution_id=e.id
          JOIN work_queue w ON w.id=e.queue_id AND w.status='EXECUTED' AND w.fencing_token=e.fencing_token
          WHERE e.goal_id=$1 AND e.plan_id=$2 AND e.status='EXECUTED' AND e.finished_at IS NOT NULL
          AND v.result='VERIFIED' AND v.verifier<>e.actor AND v.plan_hash=e.plan_hash AND v.execution_hash=e.execution_hash
          ORDER BY e.started_at,e.id`,[goal.id,plan.id])).rows;
        if(rows.length!==plan.steps.length||new Set(rows.map((e:any)=>e.queue_id)).size!==rows.length||
          !checkGoalAcceptance(goal.completion_definition,rows).passed)throw new Error("DIRECT_RECEIPT_INVALID");
        const proposed=plan.steps.map((s:any)=>sha256Hex({capability:s.capability_id,params:s.params??{}})).sort();
        const executed=rows.map((e:any)=>sha256Hex({capability:e.capability_id,params:e.params??{}})).sort();
        if(JSON.stringify(proposed)!==JSON.stringify(executed))throw new Error("DIRECT_RECEIPT_INVALID");
        for(const e of rows){
          if(e.plan_hash!==plan.plan_hash||!capabilities.has(e.capability_id)||sha256Hex({queue_id:e.queue_id,goal_id:e.goal_id,
            plan_id:e.plan_id,plan_hash:e.plan_hash,capability_id:e.capability_id,params:e.params??{},result:e.result,
            evidence:e.evidence,fencing_token:Number(e.fencing_token),operation_key_ref:e.operation_key_ref??null})!==e.execution_hash)
            throw new Error("DIRECT_RECEIPT_INVALID");
        }
        return {goal_id:goal.id,state:"COMPLETED",verified:true,results:rows.map((e:any)=>({capability_id:e.capability_id,result:e.result,
          receipt:{execution_id:e.id,verification_id:e.verification_id,verifier:e.verifier,checked_at:e.checked_at,
            plan_hash:e.plan_hash,execution_hash:e.execution_hash,independent_evidence:e.independent_evidence}}))};
      })
  ],{redactedErrors:true});
}
