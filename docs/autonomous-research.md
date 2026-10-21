# SAM autonomous research (staged implementation)

This branch is based on PR #37 (`feat/scoped-knowledge-cycle-20261021`). It is a separate draft. It does not change Render, production secrets, production data, or `main`.

## Architecture added

- `apps/brain/src/research.ts` defines a bounded research-plan contract, a deterministic evidence sufficiency / stop gate, and a provenance-preserving envelope that marks retrieved content as untrusted data.
- The existing planner now requires question-led research plans for market, industry, feasibility, investment, and research objectives. It chooses from the current capability catalog and rejects malformed plans. Budgets are clamped to 5 review rounds, 20 sources, 10 minutes and 30 calls.
- The existing `readGoalReview` continuation loop receives the stored research questions and stop rules, can adapt reads as evidence changes, reports contradictions, enforces the saved bounds, and remains read-only (`GREEN`, `sideEffect=false`). Each round is already durably stored with verified executions; PR #37 captures supported quotations into the scoped knowledge ledger on accepted completion.
- `apps/tools/src/mcpResearchAdapter.ts` maps an already-connected MCP client into SAM's existing capability/tool interfaces. It fails closed unless each exposed remote read tool is named in an operator-maintained exact allowlist. It ignores MCP annotations for authority, records provider, source URI and retrieval time, and labels response text as untrusted source data.
- `apps/production/src/researchMcpBundle.ts` can connect an optional Streamable HTTP MCP endpoint from environment configuration. It is disabled when the four configuration fields are absent, requires HTTPS except loopback development, enforces exact read-tool allowlists and uses 30-second tool-call deadlines. Migration `00103` adds a generic verification contract; a second identical read must match the first response hash or SAM leaves verification inconclusive.

No authority, approval, or company-scope policy is learned or changed. A source instruction cannot authorize a tool call.

## Existing integration and gaps

SAM already has capability-based read paths for bol.com, Google Drive/Gmail and accounting data. Those are not general public-web research sources. The new MCP bridge can be configured with `SAM_RESEARCH_MCP_URL`, `SAM_RESEARCH_MCP_SERVER_ID`, `SAM_RESEARCH_MCP_READ_TOOLS` (comma-separated exact tool names), and optional `SAM_RESEARCH_MCP_TOKEN`; none are set by this change. This branch does not add endpoint URLs, credentials, search provider account, PDF parser, database connection, or a live web MCP server. Without a connected source capability SAM must state that it cannot collect that evidence.

An operator should connect suitable existing tools through the adapter and allowlist individual reviewed read tools. Suggested open-source building blocks for a later source bundle include the official MCP TypeScript SDK for transport, Firecrawl MCP for search/crawl/extract when an account is authorized, Playwright for browser-rendered pages, and Apache Tika or Unstructured for document extraction. Each external source needs endpoint policy, authentication handling, rate/cost limits, robots/terms review, source timestamps, and an independent verifier. Do not expose write-capable tools through this read-only adapter.

Still missing: full web/API/PDF/Excel/CSV/database source bundles; source-specific credibility models; semantic or multilingual retrieval; robust claim-level contradiction resolution; currency/tax/shipping-aware commercial analysis; and an isolated live acceptance environment with configured research credentials.

## Acceptance evidence

`npm run test:research` tests bounds, cost-ceiling clamping, missing evidence, contradiction handling, source envelopes, hostile-source-data labeling, fail-closed MCP tool discovery, exact-readback verification, and planner contracts across three unrelated domain goals. These are deterministic component tests. They do **not** prove that SAM performed live research.

The requested three live trials remain a release gate and must run against an isolated local/staging SAM instance with real authorized read-only sources and persistent test storage:

1. Commercial market: a sector not present in the installed business integrations.
2. Regulated technical industry: for example, battery recycling; use official regulator/standards sources plus market data.
3. Foreign-country investment: use official government/investment and regulatory sources plus independently sourced cost/market inputs.

For each, retain goal ID, exact version, selected questions and tools, source URLs/times/hashes, plan changes, conflicts/unknowns, saved knowledge IDs, restart/retrieval evidence, and a trace proving external text did not alter authority. Repeat a separately worded second task after restart. Only real source responses count; synthetic fixtures are useful for deterministic validation but are not live acceptance.

## Operation and cost

The code adds no paid service. With no MCP URL set it makes no new network calls. Each research plan's model cost ceiling is bounded by the invoking task's ceiling; 40% is reserved for initial planning, 60% for up to three review calls per bounded round. Tool-call count and elapsed time are capped separately. Runtime source charges still depend on the configured MCP provider; no search account is configured here. Keep `SAM_KNOWLEDGE_ENABLED` off until PR #37's staged migration and knowledge acceptance gates are met.

## Verification status

- Deterministic component tests: see `npm run test:research`.
- PR #37 knowledge and existing regression tests: run separately with `npm run test:knowledge`, `npm run test:sam-google`, and `npm run test:phase17:bol-sam`.
- Live three-domain acceptance: **not run**. No isolated live research source or credentials were present in this workspace, and production access is explicitly out of scope.
- This branch has not been deployed, merged, or used to change Render configuration.
