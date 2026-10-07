import type { AuthorityClass } from "../../../packages/shared/src/types";
import { sha256Hex } from "../../../packages/shared/src/stableJson";
import type { PlanStepInput } from "../../kernel/src/planning";

const RANK: Record<AuthorityClass, number> = {
  GREEN: 0,
  YELLOW: 1,
  RED: 2
};

export interface CapabilityAuthorityPolicy {
  [capabilityId: string]: AuthorityClass;
}

export interface AuthorityBlock {
  capabilityId: string;
  authorityClass: AuthorityClass | "UNKNOWN";
  reason:
    | "UNKNOWN_CAPABILITY_POLICY"
    | "ABOVE_GOAL_CEILING"
    | "APPROVAL_REQUIRED";
  paramsHash: string;
}

export async function evaluatePlanAuthority(
  client: any,
  input: {
    goalId: string;
    legalEntityId: string | null;
    steps: PlanStepInput[];
    capabilityPolicies: CapabilityAuthorityPolicy;
  }
): Promise<{ authorized: boolean; blocked: AuthorityBlock[] }> {
  const goal = await client.query(
    "SELECT authority_ceiling FROM goals WHERE id=$1",
    [input.goalId]
  );
  if (goal.rowCount !== 1) throw new Error("Goal not found");

  const ceiling = (goal.rows[0].authority_ceiling ?? "GREEN") as AuthorityClass;
  const blocked: AuthorityBlock[] = [];

  for (const step of input.steps) {
    const paramsHash = sha256Hex(step.params ?? {});
    const authorityClass = input.capabilityPolicies[step.capabilityId];

    if (!authorityClass) {
      blocked.push({
        capabilityId: step.capabilityId,
        authorityClass: "UNKNOWN",
        reason: "UNKNOWN_CAPABILITY_POLICY",
        paramsHash
      });
      continue;
    }

    if (RANK[authorityClass] > RANK[ceiling]) {
      blocked.push({
        capabilityId: step.capabilityId,
        authorityClass,
        reason: "ABOVE_GOAL_CEILING",
        paramsHash
      });
      continue;
    }

    if (authorityClass === "GREEN") continue;

    const approval = await client.query(
      `SELECT id
         FROM approvals
        WHERE capability_id=$1
          AND params_hash=$2
          AND legal_entity_id IS NOT DISTINCT FROM $3
          AND authority_class=$4
          AND status='APPROVED'
          AND expiry_at > now()
          AND used_count < max_uses
        ORDER BY created_at DESC
        LIMIT 1`,
      [step.capabilityId, paramsHash, input.legalEntityId, authorityClass]
    );

    if (approval.rowCount !== 1) {
      blocked.push({
        capabilityId: step.capabilityId,
        authorityClass,
        reason: "APPROVAL_REQUIRED",
        paramsHash
      });
    }
  }

  return { authorized: blocked.length === 0, blocked };
}
