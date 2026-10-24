# Official Google Workspace MCP evaluation — SAM (2026-10-21)

## Verified official endpoints (Google documentation)
- Gmail: https://gmailmcp.googleapis.com/mcp/v1
- Drive: https://drivemcp.googleapis.com/mcp/v1
- Configure: https://developers.google.com/workspace/guides/configure-mcp-servers
- Preview access: https://developers.google.com/workspace/preview

Google Workspace MCP is in Developer Preview; do not assume the existing project's access is approved. An OAuth client used for MCP must be configured as an **AI-powered agent**. Google documentation describes a requirement effective November 2026. Existing REST OAuth tokens cannot be assumed compatible. Use a separate agentic OAuth client, offline access and least-privilege Google scopes. Do not copy secrets into repository or logs.

## Current SAM status
SAM's production tools use Gmail and Drive REST clients, not an MCP client. Their read-only workflows have verified successfully. Do NOT replace the running tools or their verification contracts before explicit authorization and a real MCP transport/OAuth handshake test.

## Safe pilot gates
1. Google Preview membership and Cloud project MCP APIs enabled.
2. Dedicated agentic OAuth client and separate consent; Google Drive and Gmail read scopes only.
3. Discover remote tools/list with Streamable HTTP and compare real tool names, schemas and annotations to the fail-closed local policy.
4. Enforce sideEffect=false / GREEN at both tool registry and execution gateway, even if the remote server exposes writes.
5. Implement independent readback verifiers for every selected capability; reject undeclared/unknown tools.
6. Isolated negative tests: OAuth 401/403, server 429/503, token expiry, timeout and bad tool schema, and deny all sending/deletion/upload.
7. Run 10 consecutive read-only production goals on fixed deployment; check goal timeline/evidence and recovery. Roll back on any unexpected write permission.
8. Only then consider replacing existing REST tools; until then retain old stable path.

## Repository pilot artifact
`apps/production/src/googleWorkspaceMcpPolicy.ts` contains a conservative, **illustrative** name/annotation allowlist, and `tests/isolated/google_workspace_mcp_policy.ts` tests it. The exact remote tool names and annotation availability must be checked from the live discovery result; the policy is deliberately not wired into SAM production. This is a research-and-safety spike, not a working Google Workspace MCP integration.
