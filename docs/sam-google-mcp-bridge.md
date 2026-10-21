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
