# Closed Setup OAuth discovery

Setup can safely expose public resource metadata, not authenticated tools.
It imports no SAM/DB/provider code and makes no requests to the issuer.

Required **public** configuration:

- `SAM_MCP_OAUTH_RESOURCE=https://sam-greenfield.replit.app/mcp`.
  This origin was confirmed by Replit deployment metadata, not guessed.
- `SAM_MCP_OAUTH_ISSUER`: the exact `issuer` from the owner's actual Auth0
  `https://<Domain>/.well-known/openid-configuration`. Include its trailing slash.
  Never use SAM's origin as issuer or guess a tenant/region/custom domain.

With both configured, GET/HEAD on the root and `/mcp`-aware RFC9728 metadata
paths returns 200. `authorization_servers` points to Auth0, whose own
`/.well-known/oauth-authorization-server` (RFC8414) and
`/.well-known/openid-configuration` (OIDC) describe authorization/token/JWKS
endpoints. SAM does **not** impersonate an authorization server or proxy these.

`/mcp` always returns 401 with `WWW-Authenticate: Bearer resource_metadata=...`
in configured Setup, including requests carrying a token and `tools/list`.
No token is accepted, no tool handler instantiated, no executive started.
Missing issuer/resource returns 503 `OAUTH_DISCOVERY_NOT_CONFIGURED`, never
manufactured issuer metadata. `/readyz` remains 503. Business routes stay closed.

## Observed published failure before this correction

At 2026-10-11T02:45:47Z, both resource metadata routes, `/mcp`, and `/readyz`
returned 502 `The deployment could not be reached`. Replit reported a successful
build, but runtime logs showed `RELEASE_SETUP_PRODUCTION_CONTEXT_REQUIRED` and
a crash loop. The original compound check did not identify which runtime
environment condition failed. Public configuration readback is not proof of
the environment in the already-published snapshot.

The prepared launch explicitly pins `NODE_ENV=production`. Setup's original
development-domain/safe-mode/sandbox guards remain in place, now with distinct
safe failure codes. A later crash with one of those codes must be resolved in
the actual Publishing environment, not by disabling the guard.

## Owner publication and later activation are separate gates

1. Supply the real Auth0 issuer in production configuration.
2. Push this preparation, review the existing VM's hosting charges and settings,
   then explicitly approve/perform Republish. This agent did not publish.
3. Check the two metadata paths return 200, `/mcp` 401 with the path-aware
   challenge, and `/readyz` 503. Only then retry ChatGPT OAuth discovery.
4. Successful metadata discovery is **not** successful OAuth consent/tool use.
   Active SAM still needs the actual client ID/owner subject, namespaced tenant/
   entity/run claims, public RS256 JWKS, expiry/PKCE/callback settings and
   independent database least-privilege/RLS admission. Keep release/OAuth/planner
   approvals 0 until their separate gates pass.

The API audience stays exactly the resource URL. `sam:synthetic:read` and
`sam:synthetic:submit` must appear in the access token's `scope`; Auth0's
`permissions` array and OIDC scopes do not replace them. Claims are not scopes.
Use the real callback supplied by ChatGPT; no invented callback or client ID.
For actual consent, keep the Auth0 API's RS256 RFC9068 access-token profile,
enable its Resource Parameter Compatibility Profile and Include Issuer in
Authorization Responses settings, and require PKCE S256 in the authorization
code flow. Confirm these against actual issuer discovery; do not assume them
from an API permission grant. The owner/client-bound Post-Login Action must
issue the three synthetic identity claims under the resource-owned `/sam`
namespace before SAM can accept a token.

Sources: https://www.rfc-editor.org/rfc/rfc9728.html ;
https://auth0.com/docs/get-started/applications/configure-applications-with-oidc-discovery
