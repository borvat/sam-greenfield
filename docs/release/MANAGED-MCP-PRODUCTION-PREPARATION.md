# Managed MCP production preparation

## Actually completed (2026-10-11)

- Existing original migrations 00001–00010 were applied atomically to a **new,
  empty development `sam` schema in heliumdb**, through the development SQL API.
  Existing development service schemas were not modified.
- Result: 22 tables, all RLS-enabled; zero organizations, goals or catalog rows.
  The three static catalog rows installed by migration 00006 were removed only
  from this newly created schema so the source is data-free. No existing data
  was read/copied, no LOGIN/password/role/grant provisioning was performed.
- Reproducible source: `scripts/development/managed-schema-source.cjs`.
  This is an offline development-only SQL emitter, not a production migrator or
  deployment/startup hook. It refuses a database other than heliumdb, an existing
  `sam` schema, absent pgcrypto, nonempty tables and missing core RLS.
- Original policy definitions are preserved. There are **only three original
  policies**: RLS enabled is not proof of complete runtime permissions. Additional
  scoped runtime policies, selective grants and synthetic seed remain necessary.
- Production public configuration was prepared for the already verified host:
  resource `https://sam-greenfield.replit.app/mcp`,
  issuer `https://dev-izt2dymhavtig3p5.eu.auth0.com/`,
  claim namespace `https://sam-greenfield.replit.app/sam`,
  allowed host `sam-greenfield.replit.app`,
  allowed origin `https://sam-greenfield.replit.app`.
- Issuer discovery and two RSA/RS256 public signing keys were checked and pinned.
  Only public verification material was stored. PKCE S256 is advertised; this
  does not prove registered-client consent, callback or DCR authorization works.
  Key rotation requires reviewed refresh of the pinned public keys.
- Setup=1, release/OAuth/planner approvals=0 remain unchanged.

## Concrete unresolved publication boundary

Production SQL API reads `neondb`: `sam` absent, planned restricted LOGIN absent.
After development source preparation, `explainSchemaDiff()` returned success,
`hasDiff=false`, and no statements. This contradicts independently checked
catalog parity. It is **not** evidence that the schema has migrated.

The cause of this discrepancy is not proven: schema inclusion/source mapping or
replica visibility must be resolved using the managed Publishing/Database flow.
Do not infer unsupported custom schemas solely from this response. Do not silently
move SAM into public, copy development data, add startup/build DDL, or connect an
administrator credential to the worker to bypass it.

No production SQL mutations, Publish, models, Neon connections or purchases
occurred in this preparation.

## Restricted runtime account plan — not executed

Planned account name `sam_runtime` is a proposal, not an existing credential.
Its actual authenticated LOGIN must have NOINHERIT, NOSUPERUSER, NOCREATEDB,
NOCREATEROLE, NOREPLICATION, NOBYPASSRLS, no privileged reachable memberships,
no table ownership and no database/schema CREATE or table TRIGGER/TRUNCATE.
Schema owner/migration identity must be distinct. No owner LOGIN + SET ROLE.

Use the existing PG acceptance's permission matrix as the reviewed baseline:
- SELECT only: organizations, legal_entities, world_facts, model_providers,
  verification_contracts.
- SELECT/INSERT only: audit_log, verifications, model_calls; model_calls receives
  column UPDATE only for tokens, success, verification_result.
- SELECT/INSERT/UPDATE: goals, plans, work_queue, executions,
  business_id_sequences, outbox_events.
- Required sequence USAGE/SELECT only; no DELETE, business-table or account grants.

Every grant must also be constrained by permissive access **and restrictive**
synthetic tenant/entity/run policies, including related-row checks. Keep original
policies. Do not grant anything until a supported managed restricted credential
path is verified. Publishing schema does not provision custom LOGIN credentials.

Before activation: seed only the expressly approved synthetic identity, two local
verification contracts and reviewed model/cost catalog; prove missing-context,
foreign tenant/entity, wrong run and forbidden-field/tool rejection with the
actual restricted LOGIN. Existing acceptance mocks are not production proof.

`npm run release:check-db -- --approved-read-only` is available only after separate
real-credential-use authorization. It checks actual TLS and runtime admission,
not full policy semantics. `sslmode=verify-full`, direct connection, verified
hostname/certificate and `session_user=current_user` remain mandatory.

## Auth0 registered client — not activated

Still needed: actual registered application's Client ID, approved owner's Auth0
user subject and exact callback displayed by the ChatGPT connector, not a guessed
URL. Use only permissions `sam:synthetic:read` and `sam:synthetic:submit`.
The existing `scripts/release/auth0-post-login.cjs` Action binds that owner/client
to approved synthetic org/entity/run UUIDs and an expiry <=24h. Install/bind only
after those real settings are supplied and reviewed; do not invent identities,
grant scopes via the Action, or replace OAuth with a shared bearer.
Any client secret belongs in the provider/connector secure UI, never in chat,
Git, discovery or MCP runtime.

The next owner action can supply the existing Client ID and owner subject through
secure project settings; this alone does **not** clear the independent managed
schema/account blocker or authorize Publish. There is no truthful one-click
full executive launch from the currently verified state.

## Verification classification

- Development PostgreSQL: real schema preparation, zero business data, not a goal
  acceptance or restricted-LOGIN/TLS proof.
- Offline schema-source checks: PASS; wrong target/collision/emptiness guards
  encoded and the real emptiness guard rejected migration seed rows atomically
  before the corrected schema-only batch committed.
- Typecheck: PASS.
- Auth0 Action adversarial/owner/client unit tests: PASS, no provider calls.
- Closed preparation unsafe-config tests: PASS.
- OAuth public discovery/JWKS: actual public HTTPS checks, not user authentication.
- Production catalog and managed diff: read-only checks; parity BLOCKED.
