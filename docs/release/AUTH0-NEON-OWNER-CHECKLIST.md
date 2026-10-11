# Auth0 Free + Neon synthetic pilot: owner checklist

**Prepared locally only. Do not execute provisioning under the compatibility
approval.** No account, role, credential, connection, migration, purchase or Publish
was created. Auth0 Free is the selected provider; no replacement authentication
server, new agent or chat UI is needed.

## Gate A — authorize the real provider setup separately

Approve Auth0 Free account/tenant/client/user/Action configuration and Neon pilot
role creation, including the temporary administrative privilege window below.
This is distinct from approving Publish, paid hosting or model calls.
Use the existing synthetic-only Neon pilot; do not connect corporate identities,
accounts or documents. Confirm the account remains Free and do not enable paid
features. Auth0's public plan lists Auth for MCP and Actions in Free; no paid
Organizations/RBAC/custom domain is needed for one pinned owner.

## Auth0 owner UI actions, after Gate A

1. Open Auth0's dashboard; create/select a Free tenant with its default domain.
   Create the single owner user under **User Management → Users**. Pin the actual
   subject, not an email substring; disable unwanted public signup where applicable.
2. **Applications → APIs → Create API:** use the platform-confirmed HTTPS MCP
   resource ending `/mcp` as identifier; select RS256. In **Access Token Settings →
   JSON Web Token (JWT) Profile**, select **RFC 9068**; save. Add API permissions
   `sam:synthetic:read` and `sam:synthetic:submit`. Do not use M2M credentials.
3. **Settings → Advanced:** enable/check **Resource Parameter Compatibility
   Profile** and **Include Issuer in Authorization Responses**. Verify discovery
   advertises PKCE S256. The resource server cannot prove PKCE from a JWT alone.
4. **Applications → Applications → Create Application:** register one appropriate
   web OAuth client for ChatGPT's authorization-code/PKCE flow. Set the exact
   callback shown by ChatGPT's MCP connection management page. No wildcard.
   OpenAI documents a stable callback for issuers meeting issuer-identification
   requirements, otherwise a callback-specific URL; do not guess which applies.
5. **Actions → Flows → Login:** add one reviewed Post-Login Action restricting
   issuance to this owner, client and API. It must set the flat access-token keys
   `<namespace>/org_id`, `<namespace>/legal_entity_id`, `<namespace>/pilot_run_id`
   to operator-approved synthetic UUIDs, never caller-supplied values. The pinned
   namespace is the confirmed MCP origin + `/sam`; Auth0's root `org_id` is not
   SAM's tenant. Do not copy a business profile, email, files or memory into claims.
6. Keep only public JWKS in `SAM_MCP_OAUTH_PUBLIC_JWKS`. Configure issuer, client,
   owner subject, resource and `SAM_MCP_OAUTH_CLAIM_NAMESPACE` in the reviewed
   deployment configuration. Keep personal values out of Git. Any OAuth client
   secret belongs in ChatGPT's protected OAuth settings, never chat or SQL history.

The validator still requires RS256 `at+jwt`, the exact issuer/client/owner/run and
short expiry. OIDC identity scopes do not grant SAM tool permissions. Refresh
support and actual consent must be verified later; this preparation proves neither.
Manual pinned-key rotation and stateless revocation limitations remain unchanged.

## Neon owner UI actions, after Gate A

1. Confirm **project sam-greenfield-pilot → Frankfurt → branch production →
   database neondb**. This branch name is not permission to touch another production
   service. Verify the existing `sam_pilot` schema/owner and public pgcrypto.
   If SAM tables already exist, review ownership/history before migrating.
2. **Postgres database → Roles → Add role:** create distinct NEW names such as
   `sam_pilot_migrate_login` and `sam_pilot_runtime_login`. Console generates
   passwords; do not enter them into SQL Editor. Leave the existing passwordless
   `sam_pilot_migrator` and `sam_pilot_app` roles intact.
3. **Immediately, before distributing credentials or connecting either role:**
   run one reviewed privilege-only owner SQL batch which initially closes the new
   logins, revokes `neon_superuser`, clears unsafe attributes/memberships and grants
   only the required pilot privileges. Do not alter `neon_superuser` itself.
   Do not rely on NOINHERIT alone: reachable SET ROLE privileges also count.
   If Neon denies revocation/restriction, stop; never substitute an owner URL.
4. Migration LOGIN needs CONNECT and USAGE/CREATE on `sam_pilot`, not database
   CREATE, CREATEROLE, BYPASSRLS or administrator membership. For an empty schema,
   it can own the objects it creates while the existing NOLOGIN schema owner stays
   unchanged; granting membership in that owner role is unnecessary.
   Runtime LOGIN must own no SAM tables, have no schema/database CREATE, global
   reader/writer memberships, TRUNCATE/TRIGGER or migration-owner membership.
   Use the exact table/column grant categories exercised in the existing isolated
   PG acceptance, not GRANT ALL. Model/audit receipt immutability must remain intact.
5. Owner SQL catalog checks must confirm flags, direct/transitive memberships,
   ACLs, schema access and tenant RLS before enabling the restricted logins.
   Do not globally revoke shared public-schema privileges or change other schemas.

**Residual risk:** Console-created roles initially receive `neon_superuser`
membership. This official native route has a temporary administrator window,
even though no credential is passed to a worker. Provider-side credential handling/
logging cannot be promised invisible. Do not reuse the blocked custom password
helper or paste passwords/SCRAM hashes into SQL.

## Gate B — authorize isolated migrations and first restricted connection

Only after Gate A checks: temporarily enable the restricted migration LOGIN,
run the EXISTING `packages/db/src/migrate.js` with its direct verify-full URL and
`sam_pilot,pg_catalog` search path injected into that one process. Do not overwrite
the managed development DATABASE_URL or give migration credentials to services.
Provision only synthetic tenant/catalog data with reviewed model prices.

`node packages/db/src/migrate.js --check-deterministic` is offline; a normal runner
invocation can APPLY even without `--apply`. Do not invoke it casually.
After migration, close the migration LOGIN, ensure its sessions have ended, and
keep runtime grants selective. Authorize a direct runtime-LOGIN **read-only**
admission/RLS probe before starting any worker. Owner metadata or SET ROLE alone
does not prove runtime authentication. Missing context/foreign entity must expose
no data; application identity must pass `assertReleaseDatabaseSafety`.

Store only the limited application's direct URL in `SAM_RELEASE_DATABASE_URL`
and its name in `SAM_DB_APP_ROLE`; preserve verified certificates and no pooler.
Do not use the original NOLOGIN role via an owner connection's SET ROLE disguise.

## Gate C — separate publication, cost and live-model authorization

Review remaining release/security/billing gates and the $10/24h target (not a
technical hard cap). No paid hosting, Publish or new model run is authorized here.
After approved publication supplies a real URL: ChatGPT custom MCP connection →
OAuth → configured client → Scan Tools. Expect exactly the three synthetic tools.
Never replace OAuth with a shared bearer token, API key or No Authentication.

Sources: [Auth0 MCP](https://auth0.com/ai/docs/mcp/get-started/authorization-for-your-mcp-server),
[JWT profile UI](https://auth0.com/docs/get-started/apis/configure-access-token-profile),
[claims](https://auth0.com/docs/secure/tokens/json-web-tokens/create-custom-claims),
[OpenAI OAuth](https://developers.openai.com/apps-sdk/build/auth),
[Neon roles](https://neon.com/docs/manage/roles).
