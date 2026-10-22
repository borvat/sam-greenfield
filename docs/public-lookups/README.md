# Public lookup development candidate

## Isolation and base

This bounded addition is based on `codex/sam-phase8-verifier-fixes` at
`99672635c51b000a16c5c3d6c69c95768cc319f5` (Draft PR48), containing the reviewed
planner, tool registry, executor and authority contracts. Main was independently
read back on 2026-10-22 as `b55da2761e8fd1de3833be55f03d4fdd268cd0a3`.
No equivalent adapter or AGENTS.md was found. No existing runtime file, production
catalog, deployment configuration, branch or PR48 is changed. This PR targets
that existing candidate branch, not main. It does not certify the cumulative stack.

`packages/public-lookups/src/index.ts` exports typed schemas, descriptors and a
factory requiring an explicit trusted transport. Nothing imports it from a runtime
entrypoint. There is no default live fetch transport, environment activation flag,
background enrichment, credential, or customer/supplier record integration.

## Official documentation checked 2026-10-22

- https://frankfurter.dev/ and https://frankfurter.dev/llms.txt: v2, no key, daily
  blended rates and historical date queries; provider attribution via
  `expand=providers`. v1 deprecated but retained. Public service has abuse limits
  without a published numeric quota; caching is encouraged. Reference data is
  unsuitable for executable trading prices.
- https://www.vatcomply.com/api/vat-validation/ : `/vat?vat_number=…`, EU/XI,
  GB excluded; VIES failures can return 503 with Retry-After. Response supplies
  boolean validity and country/number, but no source observation date.
- https://www.vatcomply.com/ and https://www.vatcomply.com/rate-limiting/ : no key,
  2 requests/sec/IP.

Only those two API destinations and paths are constructed. Inputs cannot specify
URLs, providers or headers. GET only; redirects rejected; credentials omitted.
Country normalization allows GR -> EL. Supply the national VAT number, without a
country prefix; ASCII spaces/hyphens are removed. The documented generic 8–12
alphanumeric format is enforced; this is not a national-format/checksum validator.
Short national formats outside that documented envelope are unsupported, not
classified as invalid registrations. Currency syntax is validated locally;
unsupported provider currencies return unavailable. Same-currency queries are
rejected. Impossible/future/pre-1948 dates are rejected.

## Semantics and bounds

- Five-second total fetch/body deadline, abort, 16 KiB response limit, zero retries.
  One request/second/service per adapter set, fail-fast admission, no wait queue.
  429/503 defer admission by Retry-After (seconds or HTTP date), minimum five seconds.
  Failures never become negative VAT validations. Error bodies/URLs are not logged.
- Currency: one pair, latest or one requested date. Available results identify the
  returned source date, observation time, attribution, historical/daily reference
  kind, non-executable status and age. A prior business date is allowed but marked
  as not matching the requested day. More than seven calendar days old is explicitly
  stale (a conservative local heuristic, not a vendor freshness guarantee).
  Empty, malformed, mismatched, future-dated and failed responses are unavailable.
  One-hour, 100-entry in-memory cache of validated available currency results only;
  original observation time survives cache hits and freshness is recomputed.
- VAT: valid/invalid only from a validated boolean response matching the submitted
  country/number. All operational or schema failures yield unknown. Name/address
  and full identifier are omitted from output and evidence; no VAT cache. The
  provider supplies no source date: evidence explicitly uses null, with local
  observation time. VAT is not counterparty trust or tax-treatment authorization.
- Tool outputs are untrusted external data. No automatic ledger/tax/business action.

## Authority, privacy and activation blockers

Currency is GREEN/read-only; VAT is YELLOW/read-only. The existing executor checks
an exact-parameter, goal/tenant-scoped approval for YELLOW reads. Read approvals
are checked but not consumed by that existing path; expiry/revocation still apply.
Adapters themselves are trusted low-level components and must never be exposed
by bypassing that executor. No existing permission rule is loosened.

Separate activation approval and reviewed runtime composition are required. Scope
both capability and tool definitions to the intended legal entity. The current
bounded specialist profile admits only GREEN reads, so VAT is deliberately not
compatible with automatic specialist execution; do not downgrade it to enable it.
No tenant RLS change is proposed. Review the runtime's existing persistence of
plan parameters before using real VAT identifiers: this adapter avoids identifier
logs/results, but the current planner may persist input parameters. Review provider
privacy/retention and user consent before any real identifier transmission.

One adapter set is only sufficient for an isolated single process. Shared egress
across processes/replicas requires an approved shared limiter before activation;
other applications behind that IP also count toward the vendor limit. Cache is
process-local and nonpersistent. No distributed infrastructure or egress/security
settings have been provisioned. Network access to the exact two API hosts would
be needed; no extra domain or broad fetch permission is requested here.

## Reproducible verification

Install existing lockfile dependencies (no new dependencies):
`npm ci --ignore-scripts --no-audit --no-fund --cache /tmp/sam-npm-cache`

- `npm run typecheck`
- `node --import tsx tests/public-lookups/adapters.ts`
- `DATABASE_URL=postgres://fixture:fixture@127.0.0.1:1/unused NODE_ENV=test node --import tsx tests/public-lookups/integration.ts`

Adapter tests use synthetic VAT values only. Tests cover input rejection before
transport, exact destination/options, schema binding, missing/stale/history data,
cache bounds/expiry, 400/404/422/429/500/503, Retry-After, malformed/oversized bodies,
network exceptions and hung fetch/body deadlines. The deterministic integration
uses actual planner/catalog/registry/executor/authority code with a scripted model
and an in-memory SQL fixture. It demonstrates approval tenant binding, ceiling,
lease and schema rejection before transport. It does not test PostgreSQL RLS,
autonomous live reasoning or paid models. Full-stack/DB acceptance is not claimed.

A separate generic EUR/USD historical smoke GET to Frankfurter returned HTTP 403
in this environment. It was not retried or worked around; there is no successful
live smoke evidence. No live VAT request was attempted. Current official docs
were readable using web access; these are documentation evidence, not API success.
