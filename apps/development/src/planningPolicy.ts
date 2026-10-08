import { readFileSync, existsSync } from "node:fs";

export const LOCAL_MODEL_BLOCK = "LOCAL_DEVELOPMENT_MODELS_DISABLED";
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const sensitiveKey = /secret|token|password|credential|authorization|api.?key|private.?key|database.?url/i;
type Scalar = string | number | boolean | null;
interface ApprovedFact { id: string; domain: string; attribute: string; value: Scalar }
interface ApprovedGoal { id: string; objective: string }
interface PlanningPolicy {
  legalEntityId: string;
  approvedGoals: ApprovedGoal[];
  approvedFacts: ApprovedFact[];
}

export function localDevelopment(): boolean {
  return process.env.SAM_DEVELOPMENT_SAFE_MODE === "1";
}

export function denyDevelopment(code: string): never {
  // Never put submitted names, values, secrets, paths or DB error text into denials.
  throw new Error(`Local development denied: ${code}`);
}

function exactKeys(value: any, keys: string[]) {
  if (!value || typeof value !== "object" || Array.isArray(value) ||
      Object.keys(value).some(key => !keys.includes(key))) denyDevelopment("UNAPPROVED_FIELD");
}

export function assertSafeScalar(value: unknown): asserts value is Scalar {
  if (value === null || typeof value === "boolean") return;
  if (typeof value === "number" && Number.isFinite(value)) return;
  if (typeof value !== "string" || value.length > 2000) denyDevelopment("UNSAFE_VALUE");
  if (/Bearer\s|postgres(?:ql)?:\/\/|-----BEGIN |(?:sk-|ghp_)[A-Za-z0-9_-]{8,}|eyJ[A-Za-z0-9_-]+\./i.test(value)) {
    denyDevelopment("SECRET_VALUE");
  }
  const secrets = Object.entries(process.env)
    .filter(([key, secret]) => sensitiveKey.test(key) && secret)
    .map(([, secret]) => secret!);
  try {
    const password = new URL(process.env.DATABASE_URL || "").password;
    if (password) secrets.push(decodeURIComponent(password));
  } catch { /* A missing URL is not a reason to permit an otherwise unsafe value. */ }
  if (secrets.some(secret => value.includes(secret))) denyDevelopment("SECRET_VALUE");
}

export function developmentPlanningPolicy(): PlanningPolicy {
  const legalEntityId = process.env.SAM_DEV_LEGAL_ENTITY_ID || "";
  if (!uuid.test(legalEntityId)) denyDevelopment("MISSING_ENTITY_BINDING");
  const file = process.env.SAM_DEV_PLANNING_POLICY_FILE;
  if (!file || !existsSync(file)) return { legalEntityId, approvedGoals: [], approvedFacts: [] };
  let policy: any;
  try { policy = JSON.parse(readFileSync(file, "utf8")); }
  catch { denyDevelopment("INVALID_POLICY"); }
  exactKeys(policy, ["legalEntityId", "approvedGoals", "approvedFacts"]);
  if (policy.legalEntityId !== legalEntityId ||
      !Array.isArray(policy.approvedGoals) || !Array.isArray(policy.approvedFacts)) {
    denyDevelopment("INVALID_POLICY");
  }
  for (const goal of policy.approvedGoals) {
    exactKeys(goal, ["id", "objective"]);
    if (!uuid.test(goal.id) || typeof goal.objective !== "string") denyDevelopment("INVALID_POLICY");
    assertSafeScalar(goal.objective);
  }
  for (const fact of policy.approvedFacts) {
    exactKeys(fact, ["id", "domain", "attribute", "value"]);
    if (!uuid.test(fact.id) || fact.domain !== "development_probe" ||
        typeof fact.attribute !== "string" || !/^[a-z][a-z0-9_]{0,79}$/.test(fact.attribute) ||
        sensitiveKey.test(fact.attribute)) denyDevelopment("INVALID_POLICY");
    assertSafeScalar(fact.value);
  }
  return policy;
}

export async function authorizeDevelopmentGoal(client: any, goalId: string) {
  if (!localDevelopment()) return;
  const policy = developmentPlanningPolicy();
  const approved = policy.approvedGoals.find(goal => goal.id === goalId);
  if (!approved) denyDevelopment("GOAL_NOT_APPROVED");
  const result = await client.query(
    "SELECT objective,domain FROM goals WHERE id=$1 AND company_scope=$2",
    [goalId, policy.legalEntityId]
  );
  if (result.rowCount !== 1) denyDevelopment("ENTITY_SCOPE");
  if (result.rows[0].domain !== "development_probe" ||
      result.rows[0].objective !== approved.objective) denyDevelopment("GOAL_DATA_NOT_APPROVED");
  assertSafeScalar(result.rows[0].objective);
}

export async function assembleDevelopmentContext(client: any, entityType: string, entityId: string) {
  const policy = developmentPlanningPolicy();
  if (entityType !== "legal_entity" || entityId !== policy.legalEntityId) denyDevelopment("ENTITY_SCOPE");
  // Explicit record IDs AND entity/status constraints. No memory query at all.
  const result = await client.query(`SELECT id,entity_type,entity_id,domain,attribute,value
    FROM world_facts WHERE entity_type='legal_entity' AND entity_id=$1
    AND id=ANY($2::uuid[]) AND status='VERIFIED' AND superseded_at IS NULL
    ORDER BY id`, [entityId, policy.approvedFacts.map(fact => fact.id)]);
  for (const fact of result.rows) {
    const approved = policy.approvedFacts.find(item => item.id === fact.id)!;
    if (fact.domain !== approved.domain || fact.attribute !== approved.attribute ||
        JSON.stringify(fact.value) !== JSON.stringify(approved.value)) {
      denyDevelopment("FACT_DATA_NOT_APPROVED");
    }
    assertSafeScalar(fact.value);
  }
  if (result.rows.length !== policy.approvedFacts.length) denyDevelopment("FACT_SCOPE_OR_STATUS");
  return { entity: { type: entityType, id: entityId }, facts: result.rows, memory: [] };
}

export function sanitizeDevelopmentPlanningInput(input: {
  goalId: string; objective: string; context: any;
}) {
  const policy = developmentPlanningPolicy();
  const goal = policy.approvedGoals.find(item => item.id === input.goalId);
  if (!goal || goal.objective !== input.objective) denyDevelopment("GOAL_NOT_APPROVED");
  assertSafeScalar(input.objective);
  const context = input.context;
  exactKeys(context, ["entity", "entityType", "entityId", "facts", "memory", "assembled_at"]);
  if (context.entity) exactKeys(context.entity, ["type", "id"]);
  const entityId = context.entity?.id ?? context.entityId;
  const entityType = context.entity?.type ?? context.entityType;
  if (entityId !== policy.legalEntityId || entityType !== "legal_entity") denyDevelopment("ENTITY_SCOPE");
  if (!Array.isArray(context.memory) || context.memory.length) denyDevelopment("MEMORY_NOT_ALLOWED");
  if (!Array.isArray(context.facts)) denyDevelopment("UNAPPROVED_FIELD");
  const facts = context.facts.map((fact: any) => {
    exactKeys(fact, ["id", "entity_type", "entity_id", "domain", "attribute", "value"]);
    const approved = policy.approvedFacts.find(item => item.id === fact.id);
    if (!approved || fact.entity_type !== "legal_entity" || fact.entity_id !== policy.legalEntityId ||
        fact.domain !== approved.domain || fact.attribute !== approved.attribute ||
        JSON.stringify(fact.value) !== JSON.stringify(approved.value)) {
      denyDevelopment("FACT_DATA_NOT_APPROVED");
    }
    assertSafeScalar(fact.value);
    return { domain: fact.domain, attribute: fact.attribute, value: fact.value };
  });
  // Only this projection could be offered to a separately approved future adapter.
  // IDs, row metadata and memory never enter the proposed model input.
  return { objective: input.objective, context: { entity: "synthetic_development", facts, memory: [] } };
}
