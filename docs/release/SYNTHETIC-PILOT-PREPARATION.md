# Synthetic autonomous-planner release preparation

This is a local, mock-tested option, not approval or evidence of a live pilot.
The ordinary release stays model-disabled. Setup Mode, application LOGIN/TLS/RLS
admission, original plan authority/validation, independent verifier, leases,
receipts and kernel audit remain in place. No migration or resource is created.

## Scope

Opt in to `apps/production/src/syntheticPilotBundleModule.ts` only with both
`SAM_RELEASE_SYNTHETIC_PLANNER=1` and
`SAM_RELEASE_SYNTHETIC_PLANNER_APPROVED=1`, plus normal release approval.
The goal must belong to the pinned pilot organization/entity, have domain
`release_synthetic`, authority GREEN, and a structured numeric objective:

```json
{"synthetic":true,"operation":"sum","values":[5,-3,8]}
```

These are general bounded arithmetic objectives, not precomputed answers.
Operations: sum, mean, min, max, count; 1–16 safe integers of magnitude <=1e6.
Ordinary goal intake still supplies the owner's independent completion criterion.
Do not replace that criterion with one supplied by the model.

No fact/memory loader is called in this option. The prompt is constructed from
the validated numeric specification, public local capability descriptions and
a result contract. Entity/goal IDs, raw replan reasons, documents, connected
accounts and credentials are excluded. Local calculate/statistics are the only
tools; execution is checked again against the authorized goal specification.
MCP must remain disabled. The runtime has no OAuth or admin-secret inheritance.

## Bounded authorization and cost

Required non-secret run settings:
- `SAM_PILOT_RUN_ID`: owner-issued UUID, reused across restarts of this run.
- `SAM_PILOT_EXPIRES_AT`: future UTC timestamp, at most 24 hours away.
- `SAM_PILOT_MAX_REQUESTS`: 1–4, including errors and unknown outcomes.
- `SAM_PILOT_MAX_COST_USD`: positive, <=0.25.
- `SAM_PILOT_INPUT_USD_PER_1K`, `SAM_PILOT_OUTPUT_USD_PER_1K`: verified positive
  prices; zero, missing and nonfinite prices are refused.
- `SAM_PILOT_PRICE_REVIEWED_AT`: within seven days; this is operator attestation,
  not automatic proof of current provider prices or entitlement.

The worker alone receives the future deployment's `DEEPSEEK_API_KEY`; absence
refuses activation. No real key was read for local tests.
Each request uses the existing OpenAI-compatible DeepSeek adapter, disables
thinking, caps output at 512 tokens, pins the endpoint/model and has a 10s timeout.
There is no gateway/provider fallback or transport retry.
SAM's existing provider registry, privacy/model routing and recent-failure circuit
breaker still decide eligibility. Seeded provider prices must match the reviewed
run prices; a disabled provider is not overridden by pilot configuration.

Before contact, a separate transaction/advisory lock reserves the worst-case
request estimate in existing `model_calls`, under the run UUID. Input bytes
<=4096, conservative input-token allowance 5120; output <=512. Reservation:

`(5120 * input_price_per_1k + 512 * output_price_per_1k) / 1000`.

Successful calls retain the upper-bound reservation in `cost` and record actual
token counts plus estimated usage cost separately in `verification_result`.
**Do not label the reservation sum actual billed spend.** Failed/unknown calls
retain their reservation and attempt count. Restart does not reset the ledger.
Expiry/budget rejection does not stop Replit hosting charges.

The guarantee depends on correct current prices, provider adherence to output
limits, and production permission/RLS integrity of the ledger. Unknown usage is
not free. Real model availability, accounting, TLS/RLS, audit durability and
concurrency still require separately authorized live acceptance.

The ledger guard requires SELECT/INSERT and column-scoped UPDATE of `tokens`,
`success`, `verification_result`. DELETE/TRUNCATE and UPDATE of `task`/`cost`
must be denied, including inherited grants. Do not grant table-wide UPDATE on
`model_calls`. A separate approved database setup must supply these privileges;
this preparation does not grant them or change existing roles.

## Evidence and blockers

`tests/release/synthetic_pilot.ts` uses a mocked pg client and a local HTTP mock
provider. It exercises the real planner validation, existing adapter, numeric
executor and verifier code, but does NOT prove PostgreSQL persistence, RLS
enforcement, lease recovery or a completed live goal.
No roles, migrations, paid calls, external database connections or Publish.

Before live acceptance: verify restricted pilot LOGIN/principal RLS, required
ledger access and seed metadata, backup/restore, frozen source SHA, current
DeepSeek model/prices, a new bounded live-model authorization and a separate
Publish/VM decision. Historical raw SAST evidence had 40 Critical findings;
this preparation is not closure or a new full SAST scan.

## Local results — 2026-10-10

- TypeScript `--noEmit`: PASS.
- Synthetic pilot: PASS, 37 refusal cases, 7 loopback mock requests,
  zero fact/memory reads, zero real model calls/migrations/roles created.
- Release contracts: PASS, fixture-backed process supervision/proxy/stop,
  admission refusals, owner criteria and credential stripping.
- Provider auth: PASS, local 401/403/429/503 fixtures; no live authentication.
- Setup Mode: PASS, 16 configuration refusals and zero DB-tripwire contacts.
- Literal/config-history secret scan: 417 files, no token-like literals or
  historical config-key matches. Real secrets were deliberately not loaded;
  current-secret exact-value matching was therefore NOT evidence of absence.
- Existing SAST artifact: Replit callback, 40 Critical / 0 Medium,
  `2026-10-10T18:35:08.593Z`, raw scanner not clean. No new full scan performed.
- PostgreSQL persistence/RLS/concurrent reservations/process-crash durability:
  NOT LIVE TESTED. Mock database checks cannot establish these gates.
- Preview capture unavailable (services intentionally stopped); no UI changed.
