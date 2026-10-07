import { withTransaction } from "../../../packages/db/src/client";
import { sha256Hex } from "../../../packages/shared/src/stableJson";
import { evaluatePlanAuthority } from "../../brain/src/authorityGuard";
import { persistPlanAndDelegateAtomic } from "../../kernel/src/planning";
import { transitionGoalAtomic } from "../../kernel/src/stateMachine";
import { reconcileOneSideEffectAtomic,reconcilePendingSideEffects } from "../../tools/src/reconciler";
import type { ProductionActionDispatcher,ProductionCapabilityDescriptor } from "../../chatgpt-tools/src/types";
import type { ValidatedProductionBundle } from "./bundle";

async function createGoal(input:{
  legalEntityId:string;
  objective:string;
  authorityCeiling:"GREEN"|"YELLOW"|"RED";
}):Promise<string>{
  return withTransaction(async(client)=>{
    const entity=await client.query(
      "SELECT id FROM legal_entities WHERE id=$1",
      [input.legalEntityId]
    );
    if(entity.rowCount!==1) throw new Error("Legal entity not found");

    // Goal business IDs are globally unique by schema. Use the canonical global
    // goal sequence (NULL scope), matching the Phase 0 RLS/security paths.
    const business=await client.query(
      "SELECT next_business_id('goal',NULL) AS business_id"
    );

    const inserted=await client.query(
      `INSERT INTO goals
       (business_id,company_scope,domain,objective,state,authority_ceiling)
       VALUES($1,$2,'chatgpt_direct',$3,'NEW',$4)
       RETURNING id`,
      [
        business.rows[0].business_id,
        input.legalEntityId,
        input.objective,
        input.authorityCeiling
      ]
    );
    return inserted.rows[0].id as string;
  });
}

async function ensureApprovalRequests(input:{
  goalId:string;
  legalEntityId:string;
  actor:string;
  blocked:{
    capabilityId:string;
    authorityClass:"GREEN"|"YELLOW"|"RED"|"UNKNOWN";
    reason:string;
    paramsHash:string;
  }[];
}):Promise<string[]>{
  return withTransaction(async(client)=>{
    const ids:string[]=[];
    for(const block of input.blocked){
      if(block.reason!=="APPROVAL_REQUIRED") continue;
      if(block.authorityClass==="GREEN"||block.authorityClass==="UNKNOWN") continue;

      const existing=await client.query(
        `SELECT id FROM approvals
          WHERE goal_id=$1
            AND capability_id=$2
            AND params_hash=$3
            AND legal_entity_id=$4
            AND authority_class=$5
            AND status='PENDING'
          ORDER BY created_at DESC
          LIMIT 1`,
        [
          input.goalId,
          block.capabilityId,
          block.paramsHash,
          input.legalEntityId,
          block.authorityClass
        ]
      );
      if(existing.rowCount===1){
        ids.push(existing.rows[0].id);
        continue;
      }

      const inserted=await client.query(
        `INSERT INTO approvals
         (goal_id,capability_id,params_hash,legal_entity_id,limits,expiry_at,
          max_uses,authority_class,requested_by,status)
         VALUES($1,$2,$3,$4,'{}'::jsonb,now()+interval '24 hours',1,$5,$6,'PENDING')
         RETURNING id`,
        [
          input.goalId,
          block.capabilityId,
          block.paramsHash,
          input.legalEntityId,
          block.authorityClass,
          input.actor
        ]
      );
      ids.push(inserted.rows[0].id);
    }
    return ids;
  });
}

export function createKernelProductionDispatcher(
  bundle:ValidatedProductionBundle
):ProductionActionDispatcher{
  return {
    manifest():ProductionCapabilityDescriptor[]{
      return bundle.raw.capabilities
        .map((capability)=>{
          const tool=bundle.tools.definition(capability.capabilityId);
          return {
            capabilityId:capability.capabilityId,
            authorityClass:capability.authorityClass,
            specialistAgentId:capability.specialistAgentId,
            specialistVersion:capability.specialistVersion,
            availability:"AVAILABLE" as const,
            sideEffect:tool.sideEffect
          };
        })
        .sort((a,b)=>a.capabilityId.localeCompare(b.capabilityId));
    },

    async execute(input){
      if(!input.legalEntityId) throw new Error("legalEntityId is required");
      const capability=bundle.catalog.get(input.capabilityId);
      bundle.tools.definition(input.capabilityId);

      const goalId=await createGoal({
        legalEntityId:input.legalEntityId,
        objective:input.objective?.trim() || `Execute capability ${input.capabilityId}`,
        authorityCeiling:capability.authorityClass
      });

      await transitionGoalAtomic(goalId,"NEW","MODELING","chatgpt_direct_observe");
      await transitionGoalAtomic(goalId,"MODELING","PLANNING","chatgpt_direct_plan");

      const authority=await withTransaction((client)=>evaluatePlanAuthority(client,{
        goalId,
        legalEntityId:input.legalEntityId!,
        steps:[{capabilityId:input.capabilityId,params:input.params}],
        capabilityPolicies:bundle.catalog.authorityPolicies()
      }));

      if(!authority.authorized){
        const approvalIds=await ensureApprovalRequests({
          goalId,
          legalEntityId:input.legalEntityId,
          actor:input.actor,
          blocked:authority.blocked as any
        });
        await transitionGoalAtomic(
          goalId,
          "PLANNING",
          "WAITING_OWNER",
          "chatgpt_direct_requires_authority",
          {blocked:authority.blocked,approval_ids:approvalIds}
        );
        return {
          status:"WAITING_OWNER",
          goalId,
          approvalIds,
          blocked:authority.blocked,
          paramsHash:sha256Hex(input.params)
        };
      }

      const persisted=await persistPlanAndDelegateAtomic({
        goalId,
        assumptions:{source:"chatgpt_direct",actor:input.actor},
        steps:[{capabilityId:input.capabilityId,params:input.params}]
      });

      return {
        status:"QUEUED",
        goalId,
        ...persisted
      };
    },

    async reconcile(input){
      if(input.operationKey){
        return {
          operationKey:input.operationKey,
          result:await reconcileOneSideEffectAtomic({
            tools:bundle.tools,
            operationKey:input.operationKey
          })
        };
      }
      return reconcilePendingSideEffects({
        tools:bundle.tools,
        limit:input.limit
      });
    }
  };
}
