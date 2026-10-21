# SAM Google MCP read-only bridge — staged implementation

The existing ChatGPT connector `sam google` has its own OAuth 2.1 session. Those user-specific
access tokens are NOT available to SAM in Render and must never be copied from browser logs.

This PR adds an isolated MCP JSON-RPC client for the self-hosted
`https://sam-google-workspace-mcp.onrender.com/mcp` server, without enabling it in production.

Security properties:
- Hardcoded exact seven-tool allowlist, rejects writes and unverified read-only annotations.
- HTTPS-only transport, bearer token required and kept out of logs.
- Remote discovery on connection, explicit failure on unauthorized HTTP, pagination cap, 20s timeout.
- Remains disconnected from the production bundle until authentication and verification gates pass.

**Next mandatory prerequisites:**
1. Establish a separate OAuth 2.1 authorization-code + PKCE client identity for SAM and
   securely store its refresh/access token on Render (do not paste secrets into PR or chat).
2. Verify authenticated `initialize`, `tools/list`, and the exact seven tool schemas.
3. Build a per-tool credential-refresh provider and independent verification adapters;
   register the allowed subset into SAM's production capability bundle only after those tests.
4. Run isolated tests and 10 consecutive verified read-only goals on a fixed deployment.
5. Never forward ChatGPT's connector token into SAM or enable email sends/Drive mutations.

Test command: `node --import tsx --test tests/isolated/sam_google_mcp_bridge.ts`

## Authorization implementation status (not yet deployable)

The PKCE authorization builder, code redemption, and MCP refresh helper exist as
independent modules. They are **not** a deployed OAuth client. A working SAM
OAuth client still requires:
- its own HTTPS callback endpoint wired into SAM's HTTP router;
- a client identifier registered with the MCP authorization server (CIMD
  metadata document or supported dynamic registration);
- persistent, encrypted, user-bound PKCE verifier/state with a short expiry,
  atomic one-time consumption, and CSRF validation;
- encrypted storage of SAM-only refresh tokens, token rotation and expiry
  handling; never store secrets in GitHub, an audit trail, or user messages;
- an authenticated admin-only button/URL for starting authorization and a
  callback that does not echo the token or authorization code;
- authenticated initialize, tools/list and read-only tool calls from the
  SAM runtime, with independent business evidence and readback verification.

The manually configured Google OAuth redirect
`https://sam-google-workspace-mcp.onrender.com/oauth2callback` belongs to the
**Google Workspace MCP server**, not to SAM's separate MCP client. Do not
reuse it as the SAM client's callback and do not assume the ChatGPT connector's
`https://chatgpt.com/connector_platform_oauth_redirect` applies to SAM.

**Do not merge this PR or deploy its OAuth helpers as a working integration.**

## OAuth transaction state gate added
`samGoogleOauthState.ts` now provides one-time consume semantics, SHA-256 state
lookup, constant-time state comparison and a ten-minute expiry with isolated
tests. `MemoryOAuthTxnStore` is **test-only / single-process prototype** and
MUST NOT be used in SAM production because it does not persist across Render
instances or restarts. Production integration still requires an atomic,
persistent encrypted transaction store, an authenticated admin login, safe
callback route and encrypted token storage before enabling the bridge.

## Durable encrypted storage pilot (2026-10-21)
Added `samGoogleTokenCrypto.ts` (AES-256-GCM per-token random IV with bound context),
`samGoogleOauthPostgres.ts` (atomic consume via DELETE ... RETURNING, encrypted
OAuth verifier and refresh token), and pilot SQL migration
`packages/db/migrations/00099_sam_google_oauth.sql`.

These are **code artifacts, not a production migration**. Generate and
retain `SAM_GOOGLE_TOKEN_ENCRYPTION_KEY` securely through Render before wiring
anything; losing the key makes stored tokens unreadable. Do not reuse the
existing Google REST credentials. Access to the token table must be restricted
to the SAM server role; Postgres backups contain ciphertext.

Remaining blocker for real authorization: an authenticated operator UI/route,
a dedicated externally reachable HTTPS callback for SAM and client registration,
plus wiring the isolated bridge to the verified production bundle. Tests have
not been executed as part of this PR; GitHub-hosted runner failures must not
be misrepresented as passing. No changes are live on Render.
