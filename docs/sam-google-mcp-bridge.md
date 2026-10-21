# SAM Google MCP: read-only OAuth integration

SAM uses its own OAuth authorization-code + PKCE client. The ChatGPT connector's
credentials are never copied or forwarded to SAM. Only seven explicitly allowed
Gmail/Drive read tools can register; email sends and Drive mutations are excluded.

## Rollout controls

- `SAM_GOOGLE_MCP_AUTH_ENABLED=true`: enable only owner-protected consent/status
  tools and HTTP routes. The existing business bundle remains unchanged.
- `SAM_GOOGLE_MCP_ENABLED=true`: switch the Google business bundle from legacy
  REST to the MCP adapter. Leave off until consent and authenticated discovery
  succeed. After consent, deploy/restart both SAM services to load saved schemas.
- Both require `SAM_GOOGLE_PUBLIC_ORIGIN=https://sam-mcp-cn7q.onrender.com`, a fixed
  `SAM_GOOGLE_OWNER_ID`, and `SAM_GOOGLE_TOKEN_ENCRYPTION_KEY`: a random 32-byte
  secret in canonical base64. Use the same key/owner/origin on sam-mcp and runtime.
  Never regenerate the key on a deploy. Dashboard secret values are currently the
  deployment source of truth. Do not put credentials into Git or messages.

All flags default off. Existing internal OAuth, host/origin checks and bearer
mode remain supported. Unauthenticated connection-test mode never enables real
Google consent routes. Existing Google REST credentials are not reused.

## Owner authorization

The owner-authenticated MCP tool `sam_google_authorize` returns a ten-minute
consent URL. `sam_google_connection_status` reports stored authorization and
read-tool discovery counts, never credentials or a claimed live-read success.

HTTP equivalents on the SAM MCP service:

- `POST /google/oauth/start`: existing owner bearer required; returns consent URL.
- `GET /google/status`: existing owner bearer required.
- `GET /google/oauth/client.json`: public CIMD document; secretless PKCE client.
- `GET /google/oauth/callback`: checks one-use state, exact issuer, owner, client
  and redirect. Provider errors, authorization codes and tokens are never echoed.
  A successful callback redirects to a clean URL before rendering a message.

CIMD discovery is advertised by the inspected upstream OAuth authorization server.
Its issuer is `https://sam-google-workspace-mcp.onrender.com/`. Its `/oauth2callback`
belongs to the upstream Google proxy, not to SAM's separate OAuth client.

## Storage and read verification

Migrations 00099 and 00100 add private OAuth state/token tables. AES-256-GCM
protects refresh tokens, cached access tokens and PKCE verifiers with random IVs
and bound contexts. The encryption key stays in service secrets. OAuth states
expire in ten minutes and are consumed atomically using DELETE RETURNING.

PostgreSQL transaction advisory locks serialize refreshes across SAM processes.
Refresh-token rotation and encrypted access-token caching commit atomically.
Revoked/expired grants fail closed with reauthorization required. A transport 401
invalidates cached access credentials and allows one fresh read-only retry.

After consent, discovery must find all seven allowlisted tools explicitly marked
read-only before schemas are saved. Business capabilities register from that
snapshot and recheck discovery before each call. They have GREEN authority,
sideEffect=false, schemas, specialist ownership and independent verifiers.
Verification makes a separate fresh MCP read. Changed response hashes produce
INCONCLUSIVE, never a false VERIFIED result.

The bridge checks HTTPS origin/path, JSON-RPC response IDs, protocol negotiation,
initialized notification, tool pagination and auth errors. It never follows
redirects carrying bearer credentials.

## Fixed upstream version and durability gate

Inspected upstream and current live Google MCP deployment:
`taylorwilsdon/google_workspace_mcp@484f64b5a43ddfed0d1e214f7e1038076d904c5b`.
Render auto-deploy is off. Keep this exact deployment during acceptance; do not
redeploy the Google service from a moving branch.

The Google MCP service currently uses Render's free plan; no persistent disk is
shown. The pinned upstream documents a default in-memory OAuth proxy store on
Linux (`.env.oauth21`). Render logs show the instance changing between initial
authorization and subsequent requests. This supports investigating lost proxy
state, but does not prove that every authorization error has the same cause.

SAM's PostgreSQL client-token store does NOT make the upstream OAuth proxy's
server-side grants durable. Before claiming restart reliability, configure a
supported persistent encrypted upstream store (disk or Valkey), then prove real
Google reads and token refresh after restarting that upstream service. No paid
plan upgrade, disk or Redis purchase is included in this change. Do not bypass
authentication or extend token lifetimes to conceal a persistence failure.

## Validation

Run `npm run test:sam-google`: protocol, HTTP/CIMD/owner/issuer checks, MCP SDK
transport, encryption, registration, independent readback and existing SAM OAuth.
The SQL test uses PostgreSQL embedded in PGlite WASM, a temporary local data
directory, and close/reopen validation. It checks encrypted persistence, atomic
state consumption, refresh rotation, cache reuse and rollback. It does not test
network/TLS or OS multi-process locking, and does not touch production data.

Live acceptance remains: owner consent, seven-tool discovery, Gmail/Drive reads,
independent verification, refresh and upstream restart, then ten varied read-only
goals on a fixed deployment. Bootstrap deployment is not full business readiness.
