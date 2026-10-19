# ChatGPT -> SAM MCP (Render): authentication remediation

Status: DESIGN ONLY. No production auth or deployment changes in this branch.

## Verified on deploy/sam-free-trial-ready at b606925

- apps/mcp/src/main.ts requires SAM_MCP_BEARER_TOKEN in production.
- apps/mcp/src/http.ts checks a static Bearer token and exposes GET /livez and /mcp.
- No OAuth authorization-server discovery, dynamic client registration, authorization-code + PKCE flow, token issuance, or token validation is implemented in the MCP server.
- GOOGLE_OAUTH_* values in render.yaml authorize Google access, not ChatGPT-to-SAM.
- Render service being Live is not proof that ChatGPT can authenticate or call tools.
- ChatGPT custom connector setup rejected OAuth discovery for https://sam-mcp-cn7q.onrender.com/mcp.

## Required secure implementation (before production changes)

1. Decide on an OAuth 2.1-compatible authorization server (managed IdP or self-hosted) with a supported registration path for ChatGPT, authorization code + PKCE, and documented issuer/audience.
2. Implement MCP protected-resource metadata and discovery at the public HTTPS host, with an authorization-server metadata endpoint and the correct WWW-Authenticate challenge on unauthorized MCP requests.
3. Verify JWT signatures, issuer, audience, expiry and scopes (or use secure token introspection), fail closed; keep per-user authorization and owner approval gates.
4. Retain /livez without credentials and never expose tools unauthenticated.
5. Test negative cases: no token, malformed/expired/wrong-audience token, unregistered client, invalid origin/host; positive case: ChatGPT OAuth login -> tools/list -> read-only tool.
6. Deploy to a separate test service or explicitly approved change window, then verify actual Render logs and ChatGPT connection. Never place client secrets, refresh tokens or bearer tokens in GitHub or chat.

## Important unresolved issue

User GET /livez returned {"error":"not_found"} even though the b606925 source has GET /livez. Inspect request routing and confirm the public endpoint reaches the intended process before introducing OAuth. Do not bypass this discrepancy.

## Change controls

- Do not merge or modify existing PR #5.
- Do not disable SAM_MCP_BEARER_TOKEN or select unauthenticated access as a workaround.
- Do not change production environment variables or trigger deployment without explicit approval.
