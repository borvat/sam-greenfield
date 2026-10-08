# Supplier Research Integration — Implementation Note (2026-10-08)

**Status: PARTIAL, NOT LIVE, NOT MERGED.** Owner authorized a safe architectural addition. This branch adds an isolated TypeScript contract scaffold and this note. It does not install/run ScrapeGraphAI, extract supplier pages, or change production.

## Architecture
Brain -> Executive Kernel -> Capability Catalog -> Tool Gateway -> isolated Supplier Research Adapter -> untrusted evidence -> independent verifier -> Verified Memory.

- No changes to Kernel, planner, authorization, memory semantics, or existing integrations.
- Proposed capability: `supplier.research.public_page` (GREEN only for bounded public read), owned by a supplier-research specialist.
- Production bundle registration is deferred until real adapter, independent verifier, and regression evidence exist.
- Preserve source URL, timestamp, page snapshot/hash, extraction/model version, and per-field evidence.
- Never treat extracted claims as VERIFIED; missing values remain UNKNOWN. Web page instructions cannot command tools.
- Prompts.chat Skills Registry is a separate future module requiring versioning, licensing review, tests, and explicit activation.
- Local models, if needed, must use the existing Model Gateway.

## Mandatory acceptance gates
1. Read-only pilot on at most five public 650W starter supplier pages, no emails, payments, or external writes.
2. Isolated scraper with strict egress allowlist, DNS and redirect SSRF defenses, request/page/byte limits, timeout, robots/site-terms review, prompt-injection tests.
3. Independent source verification before any promotion to trusted memory.
4. Capability authority/ownership and adapter/verifier consistency tests.
5. Existing PostgreSQL, Kernel, security, MCP, and memory regression tests.
6. Code review and live deployment evidence before merge.

## Files
- `packages/supplier-research/src/contracts.ts`: types and unverified claim normalization only.
- This note records the actual incomplete implementation state.

**No claim of successful scraping or production readiness is made.**
