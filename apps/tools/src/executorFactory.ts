import { validateToolParameters } from "../../../packages/tool-gateway/src/validation";
import { companyMayUse } from "../../../packages/tool-gateway/src/companyScope";
import { withTransaction } from "../../../packages/db/src/client";
import { consumeApproval } from "../../../packages/db/src/approvals";
import { sha256Hex } from "../../../packages/shared/src/stableJson";
import type { CapabilityExecutor,ClaimedWork } from "../../kernel/src/workerRuntime";
import {
  beginSideEffectAtomic,
  bindSideEffectToWorkAtomic,
  markSideEffectSentAtomic
} from "../../kernel/src/sideEffects";
import type { CapabilityCatalog } from "../../agents/src/capabilityCatalog";
import type { ToolRegistry } from "../../../packages/tool-gateway/src/registry";

async function legalEntityForWork(queueId:string):Promise<string|null>{
  return withTransaction(async(client)=>{
    const r=await client.query(
      `SELECT g.company_scope
         FROM work_queue w
         LEFT JOIN goals g ON g.id=w.goal_id
        WHERE w.id=$1`,
      [queueId]
    );
    if(r.rowCount!==1) throw new Error("Work item not found");
    return r.rows[0].company_scope ?? null;
  });
}

/** Scoped integrations require an actual active work lease and current persisted plan. */
export async function scopedWorkCompany(client:any,work:ClaimedWork,scopes:readonly string[]):Promise<string>{
  const r=await client.query(`SELECT g.company_scope,w.params,w.capability_id,w.goal_id,w.plan_id,w.fencing_token
    FROM work_queue w JOIN goals g ON g.id=w.goal_id
    WHERE w.id=$1 AND w.status='LEASED' AND w.lease_expiry>now()
      AND g.state='EXECUTING' AND w.plan_id=g.current_plan_id`,[work.queueId]);
  const row=r.rows[0];
  if(!row || row.capability_id!==work.capabilityId || row.goal_id!==work.goalId || row.plan_id!==work.planId ||
     String(row.fencing_token)!==String(work.fencingToken) || sha256Hex(row.params??{})!==sha256Hex(work.params??{}) ||
     !companyMayUse(scopes,row.company_scope)) throw new Error("MCP_SCOPED_WORK_DENIED");
  return row.company_scope;
}

export function createToolExecutors(input:{
  catalog:CapabilityCatalog;
  tools:ToolRegistry;
}):Record<string,CapabilityExecutor>{
  const executors:Record<string,CapabilityExecutor>={};

  for(const capabilityId of Object.keys(input.catalog.authorityPolicies())){
    const capability=input.catalog.get(capabilityId);
    const tool=input.tools.definition(capabilityId);

    if(tool.authorityClass!==capability.authorityClass){
      throw new Error(
        `Authority mismatch for ${capabilityId}: catalog=${capability.authorityClass} tool=${tool.authorityClass}`
      );
    }

    executors[capabilityId]=async(work:ClaimedWork)=>{
      if(work.capabilityId!==capabilityId)throw new Error("TOOL_WORK_CAPABILITY_MISMATCH");
      const scopedCompany=tool.companyScopes===undefined?undefined:
        await withTransaction(client=>scopedWorkCompany(client,work,tool.companyScopes!));
      const params=work.params ?? {};
      validateToolParameters(capabilityId,params,tool.inputSchema);
      const requestHash=sha256Hex(params);
      const operationKey=`tool:${work.queueId}:${capabilityId}:${requestHash}`;

      if(!tool.sideEffect){
        const result=await input.tools.adapter(capabilityId).execute({
          legalEntityId:scopedCompany,
          capabilityId,
          params,
          idempotencyKey:operationKey
        });
        return {
          result:result.result,
          evidence:{
            ...result.evidence,
            tool_capability:capabilityId,
            side_effect:false
          }
        };
      }

      const legalEntityId=await legalEntityForWork(work.queueId);
      const sideEffect=await beginSideEffectAtomic({
        operationKey,
        capabilityId,
        requestHash,
        goalId:work.goalId ?? null,
        legalEntityId,
        idempotencyKey:operationKey
      });

      if(!sideEffect.created){
        if(sideEffect.operation.request_hash!==requestHash){
          throw new Error("Operation key collision with different request hash");
        }
        if(sideEffect.operation.state==="CONFIRMED"){
          return {
            result:{
              deduplicated:true,
              provider_reference:sideEffect.operation.provider_reference ?? null
            },
            evidence:{
              operation_key:operationKey,
              side_effect:true,
              deduplicated:true,
              reconciliation_state:sideEffect.operation.reconciliation_state
            }
          };
        }
        throw new Error(
          `Side effect ${operationKey} is ${sideEffect.operation.state}; reconciliation required before retry`
        );
      }

      if(capability.authorityClass!=="GREEN"){
        await withTransaction((client)=>consumeApproval(client,{
          capabilityId,
          params,
          legalEntityId,
          authorityClass:capability.authorityClass
        }));
      }

      await bindSideEffectToWorkAtomic(work.queueId,operationKey);

      const result=await input.tools.adapter(capabilityId).execute({
        capabilityId,
        params,
        idempotencyKey:operationKey
      });

      if(!result.providerReference){
        throw new Error("Side-effect tool must return providerReference");
      }

      await markSideEffectSentAtomic(operationKey,result.providerReference);

      return {
        result:result.result,
        evidence:{
          ...result.evidence,
          provider_reference:result.providerReference,
          operation_key:operationKey,
          side_effect:true,
          idempotency_key:operationKey
        }
      };
    };
  }

  return executors;
}
