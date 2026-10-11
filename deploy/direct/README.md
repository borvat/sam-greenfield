# Direct SAM MCP on a new Replit project

This branch runs SAM's own MCP server and native durable planner/worker in one
reserved VM process. ChatGPT connects to `https://YOUR_NEW_HOST/mcp`. There is no
relay application. This is a GREEN capability deployment: calculation, statistics
and configured read tools for Google Drive, bol and e-Boekhouden. It does **not**
claim production acceptance, all-company coverage, or enabled financial/email/
other write operations. Existing YELLOW/RED adapters are deliberately excluded.
`sam_capabilities` reports precisely the active catalog; unsupported tools fail
startup instead of being advertised as ready.

## 1. Import

Import GitHub branch `fix/direct-mcp-production` into a **new** Replit project.
The root `.replit` now builds `npm ci --include=dev && npm run typecheck` and runs
`npm run start:direct` in a reserved VM. The previous profile is retained in
`deploy/legacy/replit.toml`; this branch is not a drop-in update of the old project.
One TCP port (5000), one process, same database after restart. Preview health is
not the delivery criterion. `/livez` is liveness; `/readyz` checks admitted runtime
and current database connectivity. `/mcp` refuses anonymous access.

## 2. Explicit provisioning of the NEW production database

Obtain the new production database's **direct** administrative connection from
its owner interface. Do not rely on Replit's development-to-production schema
diff or give the app that administrative credential. The provider must allow
CREATE ROLE/schema and have `pgcrypto` installed. A managed provider restriction
is a deployment prerequisite to resolve with a supported database, not proof
that Replit cannot run SAM. Use PostgreSQL 16 or newer.

Copy `provision.example.json` to `provision.json`, replace public target/tenant
values, set truthful organization/entity names, the desired allowlist, daily
quotas and model catalog. Generate organization/entity UUIDs once and retain
them; use actual existing identities only if this new installation is explicitly
intended to represent them. The model registry format is:

```json
[{"providerId":"openai","models":["YOUR_ACTUAL_MODEL"],"privacyClasses":["PUBLIC","INTERNAL"],"costPer1kInput":0.001,"costPer1kOutput":0.002}]
```

The numbers above illustrate the format; replace them with the provider's actual
reviewed prices (per 1,000 tokens). Runtime model environment values must match.
Do not put URLs/passwords in the JSON or chat. In a private terminal run:

```sh
npm run direct:provision -- deploy/direct/provision.json
```

It prompts for the admin URL and a new random runtime password (32+ characters),
without echo, and sends them over a private file descriptor to a child with a
clean environment. Require `sslmode=verify-full` and exact expected host/database.
The provider's SQL/audit logging must be reviewed: PostgreSQL necessarily handles
the new role password when creating its LOGIN. Client output is scrubbed; this
cannot promise provider logs never capture it.

Provisioning is one transaction: ten original migrations, tenant and model/
verification catalogs, restricted LOGIN, grants, forced RLS on all 23 tables,
and an installation fingerprint. It then tests the actual runtime login over
verified TLS and a negative tenant read. Repeating the same manifest is safe;
existing mismatched schema/role/configuration is refused. A failed or timed-out
operation requires inspecting target state, because COMMIT may have succeeded.
This provisions a new empty application schema; it does **not** restore old
business records or backups. Never point it at the old application database.

## 3. Runtime configuration

Set these in the new project's runtime/deployment environment; the app starts
only when all prerequisites agree. No administrative URL/runtime-password
variable may be left in the app environment.

| Variable | Value |
| --- | --- |
| `SAM_RELEASE_DATABASE_URL` | Direct runtime role URL, password, new database, `sslmode=verify-full` |
| `SAM_RELEASE_ORG_ID`, `SAM_COMMAND_CENTER_LEGAL_ENTITY_ID` | The exact UUIDs provisioned above |
| `SAM_DIRECT_GOALS_PER_DAY`, `SAM_DIRECT_MODEL_CALLS_PER_DAY`, `SAM_DIRECT_PLAN_BUDGET_USD` | Same manifest limits |
| `SAM_RELEASE_CAPABILITIES` | Same explicit capability list |
| `SAM_MCP_OAUTH_RESOURCE` | Exact public `https://YOUR_NEW_HOST/mcp` |
| `SAM_MCP_OAUTH_ISSUER` | Auth0 issuer, exact trailing slash |
| `SAM_MCP_OAUTH_SUBJECT`, `SAM_MCP_OAUTH_CLIENT_ID` | Authorized owner `sub` and registered ChatGPT OAuth client |
| `SAM_MCP_OAUTH_PUBLIC_JWKS` | Reviewed public RSA signing keys, `kid`, `use:sig`, `alg:RS256`; no private key |
| `OPENAI_API_KEY`, `OPENAI_MODEL`, `OPENAI_COST_PER_1K_INPUT`, `OPENAI_COST_PER_1K_OUTPUT` | One configured provider matching the registry |
| `OPENAI_PRIVACY_CLASSES` | `PUBLIC,INTERNAL` (default) |

Alternative provider prefixes are ANTHROPIC, GOOGLE, DEEPSEEK and QWEN (QWEN also
requires its supported base URL). Keep production provider endpoints at their
trusted official locations; overrides are for explicit operator configuration,
never model arguments. JWKS is pinned: install reviewed replacement public keys
before an Auth0 key rotation and redeploy. There is no anonymous/bearer fallback.

Drive reads require `GOOGLE_OAUTH_CLIENT_ID`, `GOOGLE_OAUTH_CLIENT_SECRET`,
`GOOGLE_OAUTH_REFRESH_TOKEN` with the intended account's read permission. Bol
reads require `BOL_CLIENT_ID`, `BOL_CLIENT_SECRET`; e-Boekhouden reads require
`EBOEKHOUDEN_API_TOKEN`. Their credentials grant the account-level visibility of
that provider; do not enable them until that visibility is intended. An unset
connector cannot be advertised. Reads compare the complete returned result to a
fresh source request; changing data yields a failed verification. Paginated
reads return a bounded page and a continuation marker where the adapter provides
one, **not** a claim that every account record was read.

Daily model limits reserve and commit each outbound attempt before HTTP, including
errors/crashes; output is capped at 2,048 tokens. Daily goal limits include failed
goals. Plan-cost routing uses configured prices/estimates, not a guarantee of a
provider billing ceiling. Also set the provider account's own spend controls.
The worker uses the existing plan/queue/fencing/verifier system, with owner
acceptance required before COMPLETED. A failed plan or quota exhaustion blocks
rather than continuously buying retries. The runtime role cannot delete or
rewrite model reservations.

## 4. Auth0 and one ChatGPT connection

In Auth0 create/configure the API identifier to the exact MCP resource URL,
RS256 with the **RFC 9068 access-token profile** (`typ:at+jwt`, `client_id`), token
life at most 3,600 seconds, permissions `sam:read` and `sam:submit`. Register the
OAuth application for ChatGPT authorization-code flow and PKCE S256. Use the
callback URL displayed by the current ChatGPT connection setup; don't guess it.
Enable only this owner's intended API permissions/client grant.

Install `scripts/direct/auth0-post-login.cjs` in the Login flow with Action secrets
`SAM_MCP_RESOURCE`, `SAM_MCP_CLIENT_ID`, `SAM_MCP_OWNER_SUB`, `SAM_MCP_ORG_ID`,
`SAM_MCP_ENTITY_ID`. It binds owner/client/tenant claims and denies other owners
for this API. It does not grant permissions or build an authorization server.
Protected resource metadata is served at
`/.well-known/oauth-protected-resource/mcp`; Auth0 serves authorization metadata.

In ChatGPT's custom MCP/app connection interface use the new HTTPS `/mcp` URL,
OAuth and that registered client's credentials if requested. The OAuth client
secret belongs in ChatGPT's protected configuration, not SAM. Log in as the
configured owner. The four tools are `sam_capabilities`, `sam_submit_goal`,
`sam_get_goal_status`, `sam_get_goal_result`. Goal submissions carry a stable
UUID `request_id`, a natural-language objective and owner-supplied acceptance
contract. They enqueue work; they do not assert completion during submission.

```json
{"request_id":"GENERATE_A_STABLE_UUID","objective":"Find documents named Business in Drive",
 "acceptance_contract":{"version":1,"constraints":[{"capabilityId":"drive_search",
 "params":{"query":"Business"},"result":{"field":"files","exists":true}}]}}
```

`exists:true` only means the requested result field is present (it can be empty).
Use `equals` for a known scalar expected value; don't interpret an empty list as
proof a business objective succeeded. Model proposals are bounded and validated;
results include persisted execution/independent-verification/hash receipts.

## 5. Delivery evidence required

Before declaring this project ready: real public HTTPS deployment; unauthorized
MCP refusal; one ChatGPT OAuth login; capability catalog matching actual connected
accounts; a meaningful owner goal persisted and executed; independent result
verified against that account; VM restart with durable status/result and no
unnecessary model replay. Restore/import of old records, if wanted, is separate
and must be proved before claiming preservation.

Local validation performed: TypeScript; existing 124-check synthetic MCP protocol
suite; legacy build/Auth0 checks; direct profile/Auth0 checks; real disposable
PostgreSQL 18.4 over verified TLS with actual restricted SCRAM login and real
HTTP MCP, two-step goal interrupted by SIGKILL and recovered, independent SQL
verification, stored result tamper refusal, owner-contract failure, Drive adapter
plus fresh readback against a local HTTP fixture, changing-source failure and
persistent daily model/goal quota. The HTTP model, identity signer and Drive
source in that test are fixtures. No live business account, real Auth0 login,
ChatGPT connection or Replit production database has been accepted by these tests.
