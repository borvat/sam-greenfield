# Phase 10 — MCP Transport Bridge for ChatGPT

## Objective
Expose SAM's broad Phase 8 ChatGPT tool surface through a real Model Context Protocol endpoint that ChatGPT can connect to, without bypassing SAM's kernel, authority, verification, or production wiring.

## Protocol
- MCP TypeScript SDK v2
- Streamable HTTP
- Modern 2026-07-28 era with legacy stateless compatibility through the official handler
- Fresh MCP server instance per request, as required by current SDK behavior

## Security invariants
- Production MCP requires an explicit bearer token.
- Production MCP requires an explicit allowed-host list.
- Optional origin allow-list is enforced when the request carries Origin.
- Secrets are never returned through tool responses.
- Unavailable SAM tools are not advertised through MCP.
- All advertised tools execute through the existing ChatGPTToolRegistry.
- MCP never calls an external provider directly.
- sam_execute remains kernel-backed through the Phase 9 production dispatcher.
- No arbitrary SQL or generic shell tool is exposed.

## Deployment
The MCP bridge runs as a separate process from the SAM worker:
- worker: port 8080
- MCP bridge: port 8081
- both share the same PostgreSQL state and trusted production bundle

This isolates transport failures from the executive worker and allows independent health/restart behavior.
