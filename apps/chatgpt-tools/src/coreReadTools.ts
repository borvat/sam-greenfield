import { captureHealthSnapshot } from "../../supervisor/src/health";
import { loadActiveIncidents } from "../../supervisor/src/incidents";
import { withTransaction } from "../../../packages/db/src/client";
import { clampLimit,one,rows } from "./sql";
import type { RegisteredChatGPTTool } from "./types";

const objectSchema={type:"object",properties:{},additionalProperties:false};
const listSchema={
  type:"object",
  properties:{limit:{type:"integer",minimum:1,maximum:200}},
  additionalProperties:false
};

function readTool(
  name:string,
  description:string,
  handler:RegisteredChatGPTTool["handler"],
  inputSchema:Record<string,unknown>=listSchema
):RegisteredChatGPTTool{
  return {
    definition:{
      name,
      description,
      risk:"READ",
      availability:"READ_ONLY",
      inputSchema
    },
    handler
  };
}

export function createCoreReadTools():RegisteredChatGPTTool[]{
  return [
    readTool("sam_system_status","Get high-level SAM state counts.",async()=>{
      const data=await one(`SELECT
        (SELECT COUNT(*)::int FROM goals WHERE state NOT IN ('COMPLETED','CANCELLED','FAILED')) AS active_goals,
        (SELECT COUNT(*)::int FROM work_queue WHERE status IN ('QUEUED','HANDBACK','LEASED','EXECUTING')) AS active_work,
        (SELECT COUNT(*)::int FROM approvals WHERE status='PENDING') AS pending_approvals,
        (SELECT COUNT(*)::int FROM side_effect_operations WHERE reconciliation_state='NEEDS_RECONCILIATION') AS unresolved_side_effects,
        (SELECT COUNT(*)::int FROM model_providers WHERE health='DOWN') AS down_model_providers`);
      return {ok:true,data};
    },objectSchema),

    readTool("sam_runtime_health","Get deterministic runtime health snapshot.",async()=>{
      const data=await withTransaction((client)=>captureHealthSnapshot(client));
      return {ok:true,data};
    },objectSchema),

    readTool("sam_pending_owner_decisions","List WAITING_OWNER goals and pending approvals.",async(args)=>{
      const limit=clampLimit(args.limit);
      const data={
        goals:await rows(`SELECT id,business_id,domain,objective,state,priority,updated_at
          FROM goals WHERE state='WAITING_OWNER'
          ORDER BY priority DESC,updated_at ASC LIMIT $1`,[limit]),
        approvals:await rows(`SELECT id,goal_id,capability_id,authority_class,status,expiry_at,requested_by,created_at
          FROM approvals WHERE status='PENDING'
          ORDER BY created_at ASC LIMIT $1`,[limit])
      };
      return {ok:true,data};
    }),

    readTool("sam_queue_backlog","List queued/handback/leased/executing work.",async(args)=>{
      const limit=clampLimit(args.limit);
      return {ok:true,data:await rows(`SELECT id,goal_id,plan_id,capability_id,priority,due_at,queued_at,status,lease_owner,lease_expiry,attempt,worker_version,wake_reason
        FROM work_queue
        WHERE status IN ('QUEUED','HANDBACK','LEASED','EXECUTING')
        ORDER BY priority DESC,due_at ASC NULLS FIRST,queued_at ASC
        LIMIT $1`,[limit])};
    }),

    readTool("sam_unresolved_side_effects","List side effects requiring reconciliation.",async(args)=>{
      const limit=clampLimit(args.limit);
      return {ok:true,data:await rows(`SELECT id,operation_key,capability_id,goal_id,legal_entity_id,provider_reference,state,reconciliation_state,attempt,last_reconciled_at,created_at,updated_at
        FROM side_effect_operations
        WHERE reconciliation_state='NEEDS_RECONCILIATION'
        ORDER BY updated_at ASC LIMIT $1`,[limit])};
    }),

    readTool("sam_list_goals","List SAM goals.",async(args)=>{
      const limit=clampLimit(args.limit);
      return {ok:true,data:await rows(`SELECT id,business_id,owner_id,company_scope,domain,objective,state,priority,created_at,updated_at,next_wake_at,current_plan_id,authority_ceiling,parent_goal_id,replan_attempts,replan_reason
        FROM goals ORDER BY updated_at DESC LIMIT $1`,[limit])};
    }),

    readTool("sam_get_goal","Get one goal by id.",async(args)=>{
      const id=String(args.id??"");
      if(!id) return {ok:false,error:"id is required"};
      const data=await one(`SELECT * FROM goals WHERE id=$1`,[id]);
      return data?{ok:true,data}:{ok:false,error:"Goal not found"};
    },{
      type:"object",
      properties:{id:{type:"string"}},
      required:["id"],
      additionalProperties:false
    }),

    readTool("sam_get_goal_timeline","Get plans, work, executions and verifications for a goal.",async(args)=>{
      const goalId=String(args.goal_id??"");
      if(!goalId) return {ok:false,error:"goal_id is required"};
      const data={
        goal:await one("SELECT * FROM goals WHERE id=$1",[goalId]),
        plans:await rows("SELECT * FROM plans WHERE goal_id=$1 ORDER BY version",[goalId]),
        work:await rows("SELECT * FROM work_queue WHERE goal_id=$1 ORDER BY queued_at,id",[goalId]),
        executions:await rows("SELECT * FROM executions WHERE goal_id=$1 ORDER BY started_at,id",[goalId]),
        verifications:await rows(`SELECT v.* FROM verifications v
          JOIN executions e ON e.id=v.execution_id
          WHERE e.goal_id=$1 ORDER BY v.checked_at,v.id`,[goalId]),
        audit:await rows("SELECT * FROM audit_log WHERE goal_id=$1 ORDER BY timestamp,id",[goalId])
      };
      return {ok:true,data};
    },{
      type:"object",
      properties:{goal_id:{type:"string"}},
      required:["goal_id"],
      additionalProperties:false
    }),

    readTool("sam_list_plans","List persisted plans.",async(args)=>{
      const limit=clampLimit(args.limit);
      return {ok:true,data:await rows("SELECT * FROM plans ORDER BY created_at DESC LIMIT $1",[limit])};
    }),

    readTool("sam_list_work_queue","List work queue rows.",async(args)=>{
      const limit=clampLimit(args.limit);
      return {ok:true,data:await rows("SELECT * FROM work_queue ORDER BY queued_at DESC LIMIT $1",[limit])};
    }),

    readTool("sam_list_executions","List execution records.",async(args)=>{
      const limit=clampLimit(args.limit);
      return {ok:true,data:await rows("SELECT * FROM executions ORDER BY started_at DESC LIMIT $1",[limit])};
    }),

    readTool("sam_list_verifications","List independent verification records.",async(args)=>{
      const limit=clampLimit(args.limit);
      return {ok:true,data:await rows("SELECT * FROM verifications ORDER BY checked_at DESC LIMIT $1",[limit])};
    }),

    readTool("sam_list_verification_contracts","List verification contracts.",async(args)=>{
      const limit=clampLimit(args.limit);
      return {ok:true,data:await rows("SELECT * FROM verification_contracts ORDER BY capability_id LIMIT $1",[limit])};
    }),

    readTool("sam_list_approvals","List approvals.",async(args)=>{
      const limit=clampLimit(args.limit);
      return {ok:true,data:await rows("SELECT * FROM approvals ORDER BY created_at DESC LIMIT $1",[limit])};
    }),

    readTool("sam_list_policies","List policy envelopes.",async(args)=>{
      const limit=clampLimit(args.limit);
      return {ok:true,data:await rows("SELECT * FROM policy_envelopes ORDER BY created_at DESC LIMIT $1",[limit])};
    }),

    readTool("sam_list_audit","List append-only audit events.",async(args)=>{
      const limit=clampLimit(args.limit);
      return {ok:true,data:await rows("SELECT * FROM audit_log ORDER BY timestamp DESC LIMIT $1",[limit])};
    }),

    readTool("sam_list_open_incidents","List currently open supervisor incidents.",async()=>{
      const data=await withTransaction((client)=>loadActiveIncidents(client));
      return {ok:true,data};
    },objectSchema),

    readTool("sam_list_events","List event-fabric events.",async(args)=>{
      const limit=clampLimit(args.limit);
      return {ok:true,data:await rows("SELECT * FROM event_fabric_events ORDER BY event_seq DESC LIMIT $1",[limit])};
    }),

    readTool("sam_list_inbox","List inbox events.",async(args)=>{
      const limit=clampLimit(args.limit);
      return {ok:true,data:await rows("SELECT * FROM inbox_events ORDER BY created_at DESC LIMIT $1",[limit])};
    }),

    readTool("sam_list_outbox","List outbox events.",async(args)=>{
      const limit=clampLimit(args.limit);
      return {ok:true,data:await rows("SELECT * FROM outbox_events ORDER BY created_at DESC LIMIT $1",[limit])};
    }),

    readTool("sam_list_side_effects","List side-effect ledger records.",async(args)=>{
      const limit=clampLimit(args.limit);
      return {ok:true,data:await rows("SELECT * FROM side_effect_operations ORDER BY created_at DESC LIMIT $1",[limit])};
    }),

    readTool("sam_list_world_facts","List world facts.",async(args)=>{
      const limit=clampLimit(args.limit);
      return {ok:true,data:await rows("SELECT * FROM world_facts ORDER BY created_at DESC LIMIT $1",[limit])};
    }),

    readTool("sam_list_memory","List durable memory records.",async(args)=>{
      const limit=clampLimit(args.limit);
      return {ok:true,data:await rows("SELECT * FROM memory_records ORDER BY created_at DESC LIMIT $1",[limit])};
    }),

    readTool("sam_list_model_providers","List model providers and health.",async(args)=>{
      const limit=clampLimit(args.limit);
      return {ok:true,data:await rows("SELECT * FROM model_providers ORDER BY provider_id LIMIT $1",[limit])};
    }),

    readTool("sam_list_model_calls","List model-call audit records.",async(args)=>{
      const limit=clampLimit(args.limit);
      return {ok:true,data:await rows("SELECT * FROM model_calls ORDER BY created_at DESC LIMIT $1",[limit])};
    }),

    readTool("sam_list_legal_entities","List legal entities.",async(args)=>{
      const limit=clampLimit(args.limit);
      return {ok:true,data:await rows("SELECT * FROM legal_entities ORDER BY created_at DESC LIMIT $1",[limit])};
    }),

    readTool("sam_list_users","List SAM users.",async(args)=>{
      const limit=clampLimit(args.limit);
      return {ok:true,data:await rows("SELECT id,legal_entity_id,email,role,created_at FROM users ORDER BY created_at DESC LIMIT $1",[limit])};
    }),

    readTool("sam_list_financial_documents","List financial documents metadata and payload.",async(args)=>{
      const limit=clampLimit(args.limit);
      return {ok:true,data:await rows("SELECT * FROM financial_documents ORDER BY created_at DESC LIMIT $1",[limit])};
    })
  ];
}
