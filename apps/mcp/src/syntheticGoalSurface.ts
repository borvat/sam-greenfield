import {createHash} from "node:crypto";
import {withTenantTransaction} from "../../../packages/db/src/client";
import {assertReleaseDatabaseSafety} from "../../../packages/db/src/releaseSafety";
import {createOwnerGoal} from "../../command-center/src/store";
import {numericObjective,assertPilotStep} from "../../production/src/syntheticPilotScope";
import {checkGoalAcceptance,encodeGoalAcceptance} from "../../kernel/src/goalAcceptance";
import {ChatGPTToolRegistry} from "../../chatgpt-tools/src/registry";
import type {RegisteredChatGPTTool} from "../../chatgpt-tools/src/types";
import {requirePrincipal,type SyntheticPrincipal} from "./oauthResource";

const uuid=/^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i;
const operations=["sum","min","max","count"];
function denied():never{throw new Error("MCP_SYNTHETIC_REQUEST_REFUSED");}
function exact(args:Record<string,unknown>,keys:string[]){
  if(!args||Array.isArray(args)||Object.keys(args).sort().join(",")!==[...keys].sort().join(","))denied();
}
function goalId(principal:SyntheticPrincipal,requestId:string){
  const bytes=createHash("sha256").update(principal.actor+":"+requestId.toLowerCase()).digest().subarray(0,16);
  bytes[6]=(bytes[6]&15)|80;bytes[8]=(bytes[8]&63)|128;
  const h=bytes.toString("hex");
  return `${h.slice(0,8)}-${h.slice(8,12)}-${h.slice(12,16)}-${h.slice(16,20)}-${h.slice(20)}`;
}
async function owned(client:any,id:string,principal:SyntheticPrincipal){
  if(!uuid.test(id))denied();
  const result=await client.query(`SELECT g.id,g.state,g.objective,g.completion_definition,g.domain,g.authority_ceiling,g.current_plan_id
    FROM goals g JOIN legal_entities l ON l.id=g.company_scope
    WHERE g.id=$1 AND g.company_scope=$2 AND l.org_id=$3
    AND g.domain='release_synthetic' AND g.authority_ceiling='GREEN'
    AND EXISTS(SELECT 1 FROM audit_log a WHERE a.goal_id=g.id AND a.source='chatgpt_mcp'
      AND a.action='OWNER_GOAL_CREATED' AND a.actor=$4)`,
    [id,principal.entityId,principal.orgId,principal.actor]);
  return result.rows[0];
}
function state(value:unknown){
  return ["NEW","PLANNING","PLANNED","EXECUTING","VERIFYING","WAITING_OWNER","WAITING_DEPENDENCY",
    "REPLANNING","COMPLETED","FAILED","CANCELLED","PAUSED"].includes(String(value))?String(value):"UNKNOWN";
}
export function createSyntheticGoalSurface(){
  const tool=(name:string,read:boolean,inputSchema:Record<string,unknown>,
    run:(args:Record<string,any>,principal:SyntheticPrincipal,client:any)=>Promise<unknown>):RegisteredChatGPTTool=>({
    definition:{name,description:"Bound synthetic numeric goals only. No company or connected-account access.",
      risk:read?"READ":"GREEN",availability:read?"READ_ONLY":"AVAILABLE",inputSchema},
    handler:async args=>{
      let principal:SyntheticPrincipal;
      try{principal=requirePrincipal(read?"sam:synthetic:read":"sam:synthetic:submit");}
      catch{return {ok:false,error:read?"MCP_SCOPE_REQUIRED_READ":"MCP_SCOPE_REQUIRED_SUBMIT"};}
      try{
        const data=await withTenantTransaction({orgId:principal.orgId,legalEntityId:principal.entityId},client=>run(args,principal,client));
        return {ok:true,data};
      }catch{return {ok:false,error:"MCP_SYNTHETIC_REQUEST_REFUSED"};}
    }
  });
  const readSchema={type:"object",properties:{goal_id:{type:"string"}},required:["goal_id"],additionalProperties:false};
  return new ChatGPTToolRegistry([
    tool("sam_submit_synthetic_goal",false,{type:"object",additionalProperties:false,
      properties:{request_id:{type:"string"},operation:{type:"string",enum:operations},
        values:{type:"array",items:{type:"number"}},expected_result:{type:"number"}},
      required:["request_id","operation","values","expected_result"]},async(args,principal,client)=>{
      exact(args,["request_id","operation","values","expected_result"]);
      if(typeof args.request_id!=="string"||!uuid.test(args.request_id)||!operations.includes(args.operation)||
        !Number.isFinite(args.expected_result)||Math.abs(args.expected_result)>16000000)denied();
      const objective=JSON.stringify({synthetic:true,operation:args.operation,values:args.values});
      numericObjective(objective);
      const acceptance={version:1,constraints:[{capabilityId:"local.calculate",
        params:{operation:args.operation},result:{field:"value",equals:args.expected_result}}]};
      const completion=encodeGoalAcceptance(acceptance),id=goalId(principal,args.request_id);
      // Serialize the actor/run quota as well as same-key replays across processes.
      await client.query("SELECT pg_advisory_xact_lock(hashtextextended($1,0))",[principal.actor]);
      const existing=await owned(client,id,principal);
      if(existing){
        if(existing.objective!==objective||existing.completion_definition!==completion)denied();
        return {goal_id:id,state:state(existing.state),replayed:true};
      }
      const count=await client.query(`SELECT count(*)::int n FROM audit_log
        WHERE actor=$1 AND source='chatgpt_mcp' AND action='OWNER_GOAL_CREATED'`,[principal.actor]);
      if(!Number.isSafeInteger(count.rows[0]?.n)||count.rows[0].n>=principal.maxGoals)denied();
      const goal=await createOwnerGoal(principal.entityId,{objective,domain:"release_synthetic",
        authorityCeiling:"GREEN",priority:50,acceptanceContract:acceptance},
        {client,goalId:id,actor:principal.actor});
      return {goal_id:goal.id,state:state(goal.state),replayed:false};
    }),
    tool("sam_get_goal_status",true,readSchema,async(args,principal,client)=>{
      exact(args,["goal_id"]);
      if(typeof args.goal_id!=="string")denied();
      const goal=await owned(client,args.goal_id,principal);
      if(!goal)denied();
      numericObjective(goal.objective);
      return {goal_id:goal.id,state:state(goal.state)};
    }),
    tool("sam_get_goal_result",true,readSchema,async(args,principal,client)=>{
      exact(args,["goal_id"]);
      if(typeof args.goal_id!=="string")denied();
      const goal=await owned(client,args.goal_id,principal);
      if(!goal)denied();
      const objective=numericObjective(goal.objective);
      if(!operations.includes(objective.operation))denied();
      if(goal.state!=="COMPLETED")return {goal_id:goal.id,state:state(goal.state),verified:false};
      if(typeof goal.current_plan_id!=="string"||!uuid.test(goal.current_plan_id))denied();
      const rows=await client.query(`SELECT e.id,e.capability_id,e.params,e.result,e.plan_hash,e.execution_hash,
        v.id verification_id,v.checked_at
        FROM executions e JOIN verifications v ON v.execution_id=e.id
        JOIN plans p ON p.id=e.plan_id AND p.goal_id=e.goal_id AND p.plan_hash=e.plan_hash
        WHERE e.goal_id=$1 AND e.plan_id=$2 AND e.finished_at IS NOT NULL
          AND v.result='VERIFIED' AND v.verifier<>e.actor
          AND v.plan_hash=e.plan_hash AND v.execution_hash=e.execution_hash
        ORDER BY v.checked_at DESC LIMIT 2`,[goal.id,goal.current_plan_id]);
      if(rows.rows.length!==1)denied();
      const execution=rows.rows[0];
      assertPilotStep(objective,execution.capability_id,execution.params);
      if(execution.capability_id!=="local.calculate"||execution.params?.operation!==objective.operation||
        JSON.stringify(execution.params?.values)!==JSON.stringify(objective.values)||
        !Number.isFinite(execution.result?.value)||
        !checkGoalAcceptance(goal.completion_definition,[execution]).passed||
        ![execution.plan_hash,execution.execution_hash].every(x=>/^[a-f0-9]{64}$/i.test(x)))denied();
      return {goal_id:goal.id,state:"COMPLETED",verified:true,value:execution.result.value,
        receipt:{verification_id:execution.verification_id,execution_id:execution.id,
          plan_hash:execution.plan_hash,execution_hash:execution.execution_hash}};
    })
  ],{redactedErrors:true});
}
export async function admitSyntheticMcpDatabase(){
  await assertReleaseDatabaseSafety({query:(text,values)=>withTenantTransaction({
    orgId:process.env.SAM_RELEASE_ORG_ID,legalEntityId:process.env.SAM_COMMAND_CENTER_LEGAL_ENTITY_ID},
    client=>client.query(text,values))});
}
