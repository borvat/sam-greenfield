# Frozen ordinary SAM release and three-goal procedure

**Prepared only. Owner approval is pending. No setup, deployment, grant or live call is authorized by this document.**

Application: `bc95f24ca11ac104c575ab1aae3c6cf2b3f5ebc0`; authenticated evidence: `bfe4e240616bce36e510b2b65c034f586b5c5cdb`.
Use the same two existing Render service IDs already verified by the parent, and the existing `sam-trial-postgres` database. Match IDs against their current runtime/MCP start commands; do not provision the extra service advertised in the repository Blueprint or apply the Blueprint. Retain existing connection strings, tokens, tenant, model account and connector settings. No new signer, account, principal or host.

## 1. Record and pause

After the bundled approval arrives, record both existing deploy IDs/commit IDs and the names/current settings of variables changed below in the operator's protected record. Do not export secret values into chat or evidence. Preserve the old application release (`8ebbe5ab5caf53a870cd252441e6199a08b3b5af`, unless operator readback establishes a newer live release) for rollback.

Pause ordinary work and goal intake on these same services. Read current fixed tenant identity using the existing runtime connection:

```sql
SELECT current_user, current_schema(), current_org_id(), current_legal_entity_id();
```

Record the returned existing schema, organization and legal-entity UUIDs; do not guess them. Confirm no live leases, in-flight source operations or incompatible pending work. Preserve historical goals, plans, executions, reports and allowances. An unresolved operation means stop setup until reconciled, not clear its records.

## 2. Administrator setup — actual requirement

An existing database owner/administrator must run the repository's operator functions from the pinned checkout, using an already authorized admin connection kept in their controlled environment. `sam_runtime_app` is not that administrator; authenticated Render browser access alone does not prove a privileged SQL session. The executor needs schema CREATE, ownership/ALTER/TRIGGER authority over the affected objects (including the trigger on `executions`), REFERENCES on referenced tables and authority to grant the listed object rights. It does **not** need to create a role/database or grant SUPERUSER/BYPASSRLS to runtime. If that existing administrator session is unavailable, this is the precise setup blocker; do not escalate through runtime or extract credentials.

Invoke these existing functions, with the actual schema and fixed tenant IDs above:

```sh
# In the pinned checkout, only in the existing administrator-controlled shell.
# DATABASE_URL must already be that approved admin connection, never a copied
# or escalated runtime credential. Set the three SAM_SETUP_* values from the
# verified nonsecret tenant/schema readback above. Do not print DATABASE_URL.
node --import tsx --input-type=module <<'JS'
import pg from 'pg';
import {applySpecialistProfile,provisionSpecialistAccess}
  from './packages/db/src/specialistProfile.ts';
const schema=process.env.SAM_SETUP_SCHEMA;
const orgId=process.env.SAM_SETUP_ORG_ID,legalEntityId=process.env.SAM_SETUP_ENTITY_ID;
if(!schema||!orgId||!legalEntityId||!/^[a-z_][a-z0-9_]*$/.test(schema))
  throw Error('VERIFIED_SETUP_IDENTIFIERS_REQUIRED');
if(!process.env.DATABASE_URL)throw Error('EXISTING_ADMIN_CONNECTION_REQUIRED');
const pool=new pg.Pool({connectionString:process.env.DATABASE_URL});
const c=await pool.connect();
try {
  const who=(await c.query('SELECT current_user name')).rows[0].name;
  if(['sam_runtime_app','sam_mcp_app'].includes(who))throw Error('ADMINISTRATOR_REQUIRED');
  await c.query('SET search_path TO "'+schema+'",public');
  if(!(await c.query('SELECT 1 FROM legal_entities WHERE id=$1 AND org_id=$2',
      [legalEntityId,orgId])).rowCount)throw Error('VERIFIED_TENANT_MISMATCH');
  await applySpecialistProfile(c);
  await c.query('BEGIN');
  try {
    await provisionSpecialistAccess(c,{schema,role:'sam_runtime_app',orgId,legalEntityId});
    await c.query('COMMIT');
  } catch(e) {await c.query('ROLLBACK');throw e;}
} finally {c.release();await pool.end();}
JS
```

The first function installs **only 00106/00107** with their exact manifest receipts. The second grants SELECT on receipts; SELECT/INSERT on `specialist_budgets`, `specialist_sessions`, `specialist_delegations`, `specialist_learning`; UPDATE `(used,cancelled)` on budgets and `(state,used,updated_at)` on sessions, with its existing fixed-tenant RLS policies. No DELETE, base-role escalation, evaluation migration or coordinator guard replacement. MCP keeps its current rights.

This is the documented first-install procedure. If tables/policies already exist, inspect receipts and policy definitions rather than blindly repeating CREATE POLICY. Migration application and provisioning are separate committed steps; after any partial failure keep services paused and reconcile the exact completed step.

Add the following **new** verification rows using the existing administrator's SQL session. If a capability ID already exists, compare its exact method/evidence/template and stop on mismatch; do not overwrite a historical contract.

```sql
INSERT INTO verification_contracts
 (capability_id,description,verification_method,required_evidence_fields,
  independent_query_template,must_not_trust_execution_result)
VALUES
 ('derive_verified_evidence','Deterministic verified evidence replay','db_query',
  '{"replayed":"boolean"}','{"method":"verified-evidence-replay-v1"}',true),
 ('reason.research','Ordinary coordinator verified pointer replay','db_query',
  '{"grounded":"boolean"}','{"method":"ordinary-specialist-pointer-replay-v1"}',true),
 ('reason.records','Ordinary records specialist verified pointer replay','db_query',
  '{"grounded":"boolean"}','{"method":"ordinary-specialist-pointer-replay-v1"}',true)
ON CONFLICT (capability_id) DO NOTHING;
```

Prepare the matching price/capability update in that administrator session:

```sql
UPDATE model_providers SET
 cost_per_1k_input=0.0003, cost_per_1k_output=0.0012,
 capabilities=CASE WHEN capabilities @> '["specialist_reasoning"]'::jsonb
  THEN capabilities ELSE capabilities || '["specialist_reasoning"]'::jsonb END
WHERE provider_id='deepseek'
RETURNING provider_id,models,capabilities,privacy_class_allowed,health,
 cost_per_1k_input,cost_per_1k_output;
```

Require exactly one matching existing row and preserve its pre-change metadata for rollback. This is prepared SQL, not an executed change.

Retain the existing source verification contracts and integration/report permissions. Ordinary startup checks them rather than provisioning or bypassing them.

## 3. Exact nonsecret configuration and cost

Use [ordinary-three-goals.config.json](ordinary-three-goals.config.json) as `SAM_ORDINARY_AGENT_CONFIG` on runtime only. Both existing services use `SAM_ORDINARY_GENERAL_AGENT=1`; runtime additionally uses `SAM_SPECIALIST_INTELLIGENCE=ordinary`. Retain its ordinary `SAM_COMPOSITION_MODULE=apps/runtime/src/productionCompositionModule.ts`, existing read-only connector settings and existing integration admission. Do not select the evaluation composition or enable research/new integrations.

Before activation, compare every configured source capability ID against the existing `sam_capability_manifest`: AVAILABLE, GREEN, read-only, same existing tenant. These Google MCP IDs are checked-in allowlisted names, **not proof they are currently installed**. An absent capability is a preflight gap; do not invent a native alias or activate another integration. Verify that at least one applicable reviewed extraction contract is present. Keep opaque Google output and unknown currency/VAT/coverage unknown. The shared builder rejects declared nonzero-cost source tools; do not introduce paid source APIs.

Retain `deepseek` / `deepseek-flash` and the existing `https://api.deepseek.com/` connection; its reviewed wire limit is `max_tokens`. Runtime nonsecret prices:

```text
DEEPSEEK_COST_PER_1K_INPUT=0.0003
DEEPSEEK_COST_PER_1K_OUTPUT=0.0012
```

These use the official **peak cache-miss** USD 0.30/M input and USD 1.20/M output prices checked 2026-10-24, not the cheaper cache/off-peak rate: https://api-docs.deepseek.com/quick_start/pricing/ . Recheck before execution; a higher price requires recalculation inside the same approved ceiling, not permission to spend more. No provider search/fetch API is enabled.

Record the current nonsecret `model_providers` row; update only `deepseek` price metadata to the matching values and append `specialist_reasoning` to its existing capabilities if absent. Set runtime `DEEPSEEK_CAPABILITIES` to the exact same ordered list (normally `planning,specialist_reasoning`); preserve the existing models/privacy/health fields. Do not copy provider credentials to MCP. Its submission admission reads the registry.

Per root: 10 provider attempts, 20 decisions, 20 combined tools/readbacks, 12 delegations, 260,000 reserved tokens, USD 0.10, 300 seconds. Each model call reserves at most 24,000 input and 2,000 output tokens: USD 0.0096 at the stated peak rates. Across exactly three roots: at most 30 attempts, 780,000 reserved tokens and USD 0.288 model reservations, with USD 0.30 total root ceilings. Root review ceiling remains 40 seconds; planner 30 seconds and specialist 20 seconds remain tighter. Source calls remain bounded at 20 seconds. No refunds or budget resets after failure/restart.

The 2,000 output-token configuration is a conservative spending configuration, not the 4,000-output synthetic fixture configuration; it has not demonstrated live task success. An insufficient output/attempt allowance is a failure to record, not permission to enlarge it.

The frozen runtime has **per-goal**, not global-trial, accounting. Therefore enforce an exclusive three-submission window. No unrelated new goals, automatic replacement goals or blind retries. If exclusivity cannot be maintained, do not start this capped acceptance. Keep worker paused while each single submission outcome is reconciled; on uncertainty check newly created goals/audit receipts before retrying. Never create a fourth root to replace a failed one.

## 4. Release and three sequential goals

Deploy the pinned application to the same two services under the approved release action; do not merge or deploy another code version. Verify reported source/implementation identity, existing tenant identity, Node 22 patched version, startup admission and health before allowing a goal. Readiness alone is not acceptance. Record the exact final capability/config snapshot. Startup must fail closed for missing profiles, registration, prices or incompatible specialist limits.

Run these through authenticated `sam_submit_goal` with the verified existing legal-entity ID. Supply natural language only—no tool names or plans:

1. “For the connected retailer account, compare ordered, cancelled and shipped quantities for up to three orders placed on 21 October 2026 and up to three placed on 22 October 2026. Cite the order records, explain the selection and coverage, and separate supported facts from unknowns. State whether EUR amounts and VAT meanings are actually established; do not invent them.”
2. “From accessible supplier correspondence in the seven days ending 24 October 2026, choose one recent explicit delivery promise and compare it with the corresponding delivery evidence if available. Cite both, identify mismatched identities or dates, and say precisely what is missing. Read at most three messages or documents; send or change nothing.”
3. “Inventory up to three accessible PDF documents modified during the seven days ending 24 October 2026 and identify any byte-identical duplicates. Cite the files and explain coverage and hash evidence. Do not infer equal content from names and do not delete, move or change anything.”

For each goal: confirm exactly one NEW authenticated root while worker is paused; record its UUID and ordinal; close intake outside the controlled submission; resume the existing worker; wait for completion or bounded stop before admitting the next root. Observe via existing read-only status/database surfaces, not direct tool execution. Pause/resume downtime and cold starts are part of this same-service window; no five-minute hosted-startup promise is made. Historical waiting goals remain untouched.

Collect for only these three root families: bound obligations/plans, source and derived executions, latest independent receipts, reports/citations, specialist assignments, model usage and root allowance events. Verify one OPEN per root, immutable deadlines/policy hashes, every RESERVED delta within its pinned limits, aggregate reservations <= USD 0.30, no duplicate execution queue IDs and no unapproved side effects. Missing/contradictory evidence must remain incomplete. Nominal sufficient-evidence tasks must complete with supported citations; honest blockage alone does not prove general-agent success. Preserve failures and actual returned model version; do not infer autonomy from the synthetic result or assert money/VAT completion from unsupported raw fields.

## 5. Stop and safe rollback

After the three outcomes or any safety/admission failure, close intake and pause worker. Do not reset/reopen allowances or replay historical goals. On the reviewed candidate reconcile in-flight callbacks, leases and queued/delegated work for these new roots to supported completed/failed/cancelled outcomes; preserve uncertain reservations and evidence. If reconciliation cannot be established, keep worker paused—do not hand residual ordinary work to the old unbounded release.

Only then restore the recorded old release/nonsecret configuration and prior provider metadata, with ordinary flags off, and verify health/tenant binding before normal intake. Retain specialist schema, receipts, reports and ledgers; do not drop tables, remove guards or roll back historical data. Any reversal of added privileges requires a separately reviewed exact rollback action, not an improvised destructive downgrade.

Evidence limitation: the accepted expiry trace demonstrates **resumed-review deadline rejection**, not an isolated pre-wake expiry test. Actual hosted operation, real data semantics and live model quality remain untested until this approved procedure runs.
