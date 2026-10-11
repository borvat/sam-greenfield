# ChatGPT → existing SAM MCP: local preparation

## Decision and scope

ChatGPT is the conversation surface. Replit runs existing SAM; Neon is the
planned isolated pilot database; GitHub remains the source. No chat UI, new
agent, credential bootstrap or connector to business accounts is introduced.

**External launch remains BLOCKED.** A resource server is implemented, not a
new authorization server. No actual OAuth issuer, ChatGPT consent flow, Neon
LOGIN, deployment TLS or published connection was provisioned or proven here.

## Narrow interface

The synthetic OAuth surface lists exactly:

- `sam_submit_synthetic_goal`: `request_id` UUID, `operation`, `values`,
  `expected_result`. Operations: sum/min/max/count; 1–16 bounded integers.
  No arbitrary objective text, entity, domain, capability, model or budget input.
- `sam_get_goal_status`: `goal_id` UUID belonging to this bound owner/run.
- `sam_get_goal_result`: independently verified numeric output and receipt IDs/
  hashes only. Never executor/model output alone.

Submission uses original `createOwnerGoal`, with GREEN authority, fixed
`release_synthetic` domain and the owner's original acceptance contract.
Existing planner, model reservations, worker, verifier and audit remain in use.
Mean is intentionally not accepted by this narrow intake: it would introduce
ambiguous calculate/statistics capability criteria.

Tenant transactions set both RLS contexts. SQL also checks entity, organization
and creator/run provenance. Authenticated actors are pseudonymous hashes.
Idempotency survives process changes through deterministic goal IDs and durable
original intake audits. A transaction-level actor/run advisory lock serializes
quota checks and concurrent submissions. Conflicting replays fail; valid replays
still work at quota. New goals cannot exceed the approved model-request count.

Results require COMPLETED, the current persisted plan, a finished local execution,
matching plan/execution verification hashes, a different verifier actor,
parameters matching the original synthetic objective and original owner criteria.
Unexpected/missing/multiple matching receipts fail closed. No raw logs, model
responses, memory, user records, documents or connected-account data are returned.

## Authentication and remaining issuer requirements

SAM serves RFC 9728 protected-resource metadata at:

- `/.well-known/oauth-protected-resource/mcp`
- `/.well-known/oauth-protected-resource`

401 challenges point to metadata. Tool metadata advertises OAuth scopes and
scope failures return `mcp/www_authenticate`. Authentication accepts only signed
RS256 **access** JWTs (`typ=at+jwt`) using pinned public JWKS; no remote key fetch,
algorithm fallback, ID tokens, opaque tokens or shared static token fallback.

All of these must match the reviewed configuration: issuer, exact MCP audience,
subject, client_id, org_id, legal_entity_id, pilot_run_id. Only
`sam:synthetic:read` and `sam:synthetic:submit` scopes are accepted. JWT lifetime
is at most one hour, additionally limited by the pilot deadline.

Owner configuration needed, **only after choosing/reviewing a real issuer**:

| Setting | Meaning |
|---|---|
| `SAM_RELEASE_ENABLE_MCP=1` | Enable the existing supervised MCP child |
| `SAM_MCP_SYNTHETIC_TOOLS=1` | Select only the three narrow tools |
| `SAM_MCP_OAUTH_APPROVED=1` | Explicit issuer/configuration approval; currently unset |
| `SAM_MCP_OAUTH_RESOURCE` | Actual published HTTPS URL ending `/mcp`, not an invented URL |
| `SAM_MCP_OAUTH_ISSUER` | Trusted external authorization-server issuer |
| `SAM_MCP_OAUTH_SUBJECT` | One authorized owner's subject; keep personal values out of Git |
| `SAM_MCP_OAUTH_CLIENT_ID` | Exactly the reviewed ChatGPT OAuth client |
| `SAM_MCP_OAUTH_PUBLIC_JWKS` | Public RSA signing verification keys only; never private keys |

Existing pilot organization/entity/run/expiry, request/token/cost caps and price
review remain required. Only the worker child receives the DeepSeek key.
The launcher necessarily receives deployment configuration to construct child
environments; this is child isolation, not a host/container secret-isolation claim.

The external issuer must supply authorization-server discovery, authorization
code + PKCE S256, strict ChatGPT redirect registration, resource/audience handling,
the required access-token claims and appropriately reviewed consent/refresh
behavior. Register the client explicitly; do not enable unrestricted registration.
No issuer account or provider permission was created by this work.

Pinned-key rotation is manual and unknown keys fail closed. Individual token
revocation is **not** checked by introspection; a previously issued token remains
valid until its short expiry/pilot deadline unless deployment is stopped or
verification keys/approval are changed with restart. Review issuer/logging and
emergency revocation before public activation. Do not promise provider log secrecy.

## Public routing

In the approved synthetic MCP release, the one-port supervisor exposes MCP,
protected-resource metadata and existing health routes. Dashboard/business APIs
and `/_sam/status` return 404. The old command center can remain loopback-only
for existing internal dependencies. Synthetic release never exposes its dashboard,
even with MCP disabled; selecting the new tool mode without enabling MCP rejects
startup. Ordinary non-pilot/development behavior is preserved.

## Local evidence, 2026-10-11

- Typecheck PASS.
- `tests/release/mcp_synthetic.ts`: **82** local protocol/unit checks.
  Signed mock tokens, wrong issuer/audience/user/client/tenant/run, expired/future
  tokens, algorithms/key substitution, scope escalation, missing auth, broad
  tools, replay/conflict/quota, result gating, redaction, public routing and
  worker-only provider-key inheritance. Changing the access token to read-only
  on the same SDK client/session also refuses submission before database access.
- Existing release contracts PASS; synthetic planner regression PASS
  (37 refusal cases, local mock HTTP only); local real TLS negotiation PASS.
- Setup Mode PASS (16 refusals, zero database-tripwire/forbidden-module calls).
- Existing synthetic command-center regression PASS; no chat UI added.
- Existing real development-PG harness, MCP mode: **PASS kernel acceptance**.
  One persisted goal/plan/delegation/execution/verification/audit/verification
  receipt; concurrent same-key requests created one goal and intake audit.
  Real process killed after plan commit, new process completed goal, extra tick
  produced no duplicate action, MCP read independently verified numeric output.
  Nine existing RLS/negative groups passed; durable budget checks passed.
  Temporary role/schema cleaned; existing autonomy objects unchanged.

Report: `.local/sam-dev/mcp-synthetic-postgres-acceptance.json`, captured
2026-10-11T00:20:58.606Z. It records base HEAD ebbceda because changes were tested
before committing; the tested source files' SHA256 aggregate is
`5d0161bb74c53fc2f0df4f3542630ad47c909fbe0a394b9df1ab4d1d1e172712`
(sorted paths, each path+NUL+bytes+NUL; the 12 modified/new source/test files).

Reproduce locally:

    npm run typecheck
    DATABASE_URL=postgresql://unused@127.0.0.1/not_used npx tsx tests/release/mcp_synthetic.ts
    env -u REPLIT_DEV_DOMAIN npx tsx tests/release/synthetic_pilot.ts
    SAM_TEST_MCP_OFFLINE=1 npx tsx tests/release/synthetic_pilot_postgres.ts

The last command is guarded to the existing Replit development helium/heliumdb
target, uses original migrations in a dedicated temporary schema and restricted
test LOGIN, blocks non-loopback model traffic and cleans only its own resources.
Do not add a live-model flag: MCP test mode explicitly refuses live-provider mode.

**Not proven:** real ChatGPT login/refresh, Neon provisioning/TLS/permissions,
published runtime, ACT/VERIFY-midflight recovery. Model was mocked; actual model
provider calls and model fees were zero. Development PG's non-production TLS path
is explicitly not production-launcher proof. Prior raw Critical SAST findings
were not re-scanned or closed by these focused tests.

## Shortest remaining owner sequence

1. Review/authorize Neon pilot migration and non-admin LOGIN application identity,
   direct verify-full TLS URL, forced tenant RLS and exact grants. No admin/migrator
   credential to worker; no custom credential-tool workaround. No Neon action yet.
2. Select/authorize the OAuth issuer and register the ChatGPT client above.
   Configure the public keys, bound claims and private internal control secret,
   plus a fresh bounded model-run authorization. Do not reuse consumed test consent.
3. Review security/billing and separately approve publication. No publication or
   hosting purchase is authorized by local preparation.
4. After the platform supplies a real published URL: ChatGPT Apps → Create,
   OAuth configuration → Scan Tools. Expect exactly these three tools, then test
   one approved synthetic goal. Never connect the broad legacy tool surface.

References: https://modelcontextprotocol.io/specification/latest/basic/authorization
and https://developers.openai.com/apps-sdk/build/auth .
