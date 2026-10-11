# Concrete closed preparation — not Publish approval

The Agent applied the 17 public configuration values in
`env.closed-setup.example` to the production environment, and read them back.
No development/shared variables or real secrets were changed. The publishing
wizard's unsaved draft may differ: refresh/reopen Advanced Settings and check
the resulting deployment configuration before any separately approved Publish.

Reproduce the exact public profile without reading secrets:
`npm run release:prepare -- --print-env`.
Check its closed contract offline: `npm run release:prepare`.

The build command is `npm ci --include=dev && npm run typecheck`. Production
environment variables also affect build-time npm installation; plain `npm ci`
omits TypeScript and test/type dependencies when `NODE_ENV=production`. Keep
production mode and install build dependencies explicitly; do not weaken runtime
guards or move development tooling into application dependencies to mask this.

## What this will serve, only after an authorized deployment

Existing `start:release` enters Setup Mode first. `/` and `/livez` return 200;
`/readyz` returns 503. No database, worker, model, business route or goal intake
is imported. POSTs are refused. MCP is not available in Setup Mode.
The MCP/planner configuration selectors are staged, but their approvals remain
zero; Setup Mode and executive approval zero prevent their activation.

## OAuth wiring, without guessed values

The existing active MCP supports both
`/.well-known/oauth-protected-resource` and
`/.well-known/oauth-protected-resource/mcp`; its unauthenticated MCP challenge
points to resource metadata. Metadata advertises the pinned external issuer.
Setup does not advertise a fictitious authorization server or proxy Auth0.

The owner's candidate `https://sam-greenfield.replit.app/mcp` is NOT yet a
reserved/verified deployment URL. Do not save an immutable Auth0 API identifier
based solely on availability. Once the resource address is established:

1. Auth0 API: exact resource identifier, RS256, RFC 9068 profile; access-token
   lifetime <=3600 seconds; `sam:synthetic:read` and `sam:synthetic:submit`.
2. Auth0 tenant Settings → Advanced → Settings: enable Resource Parameter
   Compatibility Profile and Include Issuer in Authorization Responses.
   ChatGPT sends RFC8707 `resource`; legacy audience-only handling is insufficient.
3. Use actual tenant issuer, actual application Client ID, actual owner subject,
   and public RSA JWKS. Configure the reviewed namespace claims for org/entity/run.
   Callback comes from the actual ChatGPT connector flow, never a guessed URI.
   Authorization Code + PKCE must be supported; client secret, if required by the
   connector, is entered privately in its UI, not SAM's public config.

References:
https://auth0.com/ai/docs/mcp/guides/resource-param-compatibility-profile
https://auth0.com/docs/secure/tokens/access-tokens/access-token-profiles

## Clean managed production database

Copy development data stays OFF. Replit Publish's schema diff is the supported
managed production migration route, not build/startup DDL. Inspect that it creates
the intended isolated SAM schema/functions/policies, not just development tables
in a different namespace. Custom role/grant synchronization is not assumed.

A clean database has no synthetic org/entity/provider pricing/verification seed.
Skipping data copy does NOT make goal execution ready. Those rows and selective
RLS/grants require an authorized synthetic bootstrap before executive activation;
no automatic managed-production DDL, role/password creation or seed has been added.
The development login's permissions do not prove production login permissions.

After the real restricted runtime login and synthetic scope are configured and
secret use approved, run `npm run release:check-db -- --approved-read-only`.
It refuses owner/admin/BYPASSRLS, unsafe memberships/DDL and nonverified TLS.
Its PASS is DB catalog/transport admission, not seed or end-to-end acceptance.

## Remaining gates

There is no deployed URL or tested production account. Setup-only provisioning
can establish a URL/database only after separate cost/resource/Publish approval;
it is not a usable executive launch and may incur Reserved VM/database charges.
Do not set setup=0 or any approval=1 until DB, OAuth, synthetic seed, model budget
and secret-use gates are actually satisfied. No extra owner-entered DB password
is requested; managed restricted-login support remains unproven.
