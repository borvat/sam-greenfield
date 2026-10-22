# One integrated SAM release path

Existing ChatGPT OAuth MCP → authenticated synthetic intake → existing DeepSeek
planner → PostgreSQL plan/queue → existing worker → independent verifier/audit.
No app chat, business connectors, model call during preflight, or new agent.

## Supported local preparation

- Use `env.chatgpt-managed.example` as the configuration-name checklist, not as
  a deployable set of values. It deliberately keeps approval gates closed.
- Inherit platform-managed `DATABASE_URL`; do not add an empty independent URL.
  `SAM_RELEASE_DATABASE_URL` remains optional for an approved restricted LOGIN.
- Managed `sslmode=require` is upgraded to **verify-full in the actual pg URL**.
  Certificate chain/hostname failures remain fatal; no local Helium exception.
- Configure the authenticated restricted username, not owner + SET ROLE.
- Once actual secret access/database inspection is expressly authorized:
  `npm run release:check-db -- --approved-read-only`.
  This runs catalog SELECTs only, requires encrypted transport and the same
  nonowner/nonbypass/ACL/RLS admission as the worker, closes the pool and emits
  only safe status codes. It cannot grant permissions or authorize Publish.
  It needs only DB/tenant configuration, not OAuth configuration, a model key,
  or executive activation approval. TLS/role failures are not auto-repaired.
- `npm run start:release` remains the single-port supervised entrypoint.
  Synthetic composition exposes MCP only; DeepSeek stays in worker environment.

## Schema and credential boundary

For Replit-managed production PostgreSQL, **Publish's schema diff is the migration
path**. Preserve the original `packages/db/migrations` as schema source; review
the target schema, functions, RLS/policies and grants in the platform diff.
Never add migration DDL to build/startup or run the external-Neon migration
workflow against managed production. Do not copy development data, autonomous
development schemas or administrative credentials into the pilot.

Schema synchronization is not proof that custom roles/ACLs and passwords are
provisioned correctly. Original migrations alone also do not supply the complete
synthetic pilot's selective grants/policies/catalog seed used by PG acceptance.
Those must be present and independently checked before executive activation.
No automatic production role/policy/seed creation has been added.

Replit documents automatically managed production credentials, but does **not**
document a guarantee that the default LOGIN is nonowner/nonbypass or a managed
nonadmin-role password-bootstrap UI. Therefore automatic DATABASE_URL is not
treated as permission to run an owner account. No user-entered password is
requested; account compatibility remains unproven until the permitted managed
LOGIN passes actual admission. If it cannot, launch remains BLOCKED.

## Only remaining external gates

1. Owner approval for a priced isolated managed production DB/hosting resource,
   and proof of restricted authenticated LOGIN, verified TLS, exact ACL/RLS and
   synthetic-only schema/seed. None is provisioned by local preparation.
2. Auth0 issuer, pinned public JWKS/owner/client/claims, final HTTPS MCP resource
   and connector consent. Draft API/available hostname are not a working OAuth
   connection. No shared bearer or unauthenticated fallback.
3. Separate approval to use the existing worker-only key and one bounded model
   run; current template's $0.01 is an estimate ceiling, not a provider hard cap
   or hosting authorization. Publish still requires a separate decision.

References: https://docs.replit.com/features/data-and-storage/connection-details
and https://docs.replit.com/features/data-and-storage/development-and-production.
