# Secured executive MCP — remaining owner actions

This is preparation, not activation. Keep Setup on, executive/OAuth/model
approvals off, anonymous diagnostics off, and the existing deployment unchanged.
Do not republish or provision resources under this local preparation alone.

## Current external evidence

Production catalog inspection through Replit's read-only database API returned
`PRODUCTION_DATABASE_ERROR`: no managed production database exists for this app.
This is not proof about the separately created Neon pilot. Presence of managed
`DATABASE_URL` does not prove a usable production database or restricted login.

Production presence-only inspection found no `SAM_RELEASE_DATABASE_URL`,
`SAM_DB_APP_ROLE`, `SAM_MCP_OAUTH_CLIENT_ID`, `SAM_MCP_OAUTH_SUBJECT`,
`SAM_MCP_OAUTH_PUBLIC_JWKS` or `SAM_MCP_OAUTH_CLAIM_NAMESPACE` configuration.
No credential value was read, no production tables inspected, and no provisioning
or DDL attempted. Managed production schema changes must use Replit's supported
Publish flow after separate approval, never startup/build-time migration scripts.

## Next owner action: complete the EXISTING Auth0 client binding

In Auth0, use **Applications → Applications → SAM ChatGPT Connector**:
register the exact callback shown by ChatGPT's connection management page,
not a guessed URI. Use this existing client's ID and secret only in ChatGPT's
protected OAuth client fields if that UI offers predefined-client configuration.
If those fields are absent, stop: do not enable open DCR or bypass OAuth.
Public metadata alone does not prove which registration path that UI selected.
Never put the Auth0 client secret in SAM's worker or send it in chat.

Keep the existing API audience `https://sam-greenfield.replit.app/mcp`,
RS256 RFC9068 profile, PKCE S256, resource-parameter compatibility, issuer-response
support and delegated `sam:synthetic:read` / `sam:synthetic:submit` permissions.

The ready-to-paste **Post-Login Action** is
`scripts/release/auth0-post-login.cjs`; installing it requires owner approval.
Configure its Auth0 Action secrets (do not send values in chat):
`SAM_MCP_RESOURCE`, `SAM_MCP_CLIENT_ID`, `SAM_MCP_OWNER_SUB`, `SAM_MCP_ORG_ID`,
`SAM_MCP_ENTITY_ID`, `SAM_MCP_RUN_ID`, `SAM_MCP_RUN_EXPIRES_AT`.
Use a single registered client/owner, approved synthetic UUIDs and an expiry
within 24 hours. It does not grant scopes or change other APIs when configured.
Pin the same values in SAM's existing OAuth contract; namespace is the MCP
origin + `/sam`. Public JWKS is verification material, not a signing credential.

## Database gate: blocked, not solved by a configuration fallback

Before approval to create a managed production database, confirm its quote and
the supported way to obtain a separate non-admin application LOGIN without
owner-entered passwords. Available documentation proves managed credentials,
not a restricted application-role provisioning API. Compatibility is not proven.
Do not substitute the managed owner credential or SET ROLE to make launch pass.

Once separately authorized and available, require actual primary-endpoint evidence
of verified TLS, direct connections, restricted session/current role equality,
no unsafe memberships/table ownership, migrations/schema parity, forced tenant
RLS and negative tenant/missing-context tests. The existing admission checks remain
mandatory. No live goal test or release approval is justified by this preparation.

The local fix only allows development-domain *metadata* in executive admission
when Replit's exact platform deployment marker is present. All owner approval,
DB identity/TLS/RLS, capability and OAuth token validation gates remain intact.

Historical raw SAST findings documented in `MINIMAL-LAUNCH-BLOCKERS.md` have not
been rescanned or reclassified here. This preparation does not clear that
security-review gate or establish production readiness.
