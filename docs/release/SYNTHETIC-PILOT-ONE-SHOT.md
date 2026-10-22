# Bounded development-PG / real DeepSeek acceptance

This is an opt-in acceptance harness extension, not a new agent, deployment
launcher, or general-purpose live-model switch for SAM's developer services.
The default PostgreSQL acceptance remains offline-model. Production transport,
identity, RLS, capability and approval gates are unchanged.

## Scope

- Only the pinned development cluster, hostname `helium`, database `heliumdb`.
- Original migrations in a uniquely created disposable schema and a genuine
  non-admin, non-bypass LOGIN; no privileges on existing schemas.
- Normal authenticated goal intake, existing planner, native worker, independent
  PostgreSQL verifier and persisted goal acceptance/audit.
- Public objective: sum `[13,-8,21,5]`. Owner criterion is independently 31.
  The outbound prompt has empty facts/memory, two local capability descriptions,
  and the original CandidatePlan contract. Exact-template validation occurs
  before network transmission. Internal entity/goal/run IDs are not transmitted.
- The real key is passed only to the planning child. It is not inherited by
  ACT/VERIFY/budget children or copied to reports. Ordinary developer services
  are neither reconfigured nor restarted.

## One request, no retries or fallback

The owner-approved mode is `--approved-live-once`. It additionally requires a
price review less than 15 minutes old in the ignored development evidence
directory and an unconsumed exclusive claim. This command is not permission to
bypass a platform/tool refusal; stop if normal execution is denied.

The original PostgreSQL advisory-lock ledger reserves one request before
transport. The acceptance transport then exclusively creates
`.local/sam-dev/synthetic-pilot-live-attempt.json` before fetch. Timeout, unknown
outcome, validation rejection and process crash all consume the attempt. That
claim survives fixture cleanup. Do not remove it to retry an approval.

Only the exact HTTPS chat-completions endpoint is permitted; redirect following
is disabled. There is no model-discovery, authentication-probe, or second
generation request. Model is `deepseek-flash`, thinking disabled, output 512
tokens, prompt 4096 UTF-8 bytes, conservative input reservation 5120 tokens.

## Fee boundary and truthful diagnostics

Reviewed official pricing source:
https://api-docs.deepseek.com/quick_start/pricing

Conservative peak/cache-miss USD per 1K: input 0.0003, output 0.0012.
Reservation is $0.0021504, below the owner's $0.01 estimated-model-fee ceiling.
Prices are not zero and ordinary mock prices are not reused.

This is not a provider-side guaranteed dollar hard cap or a total Replit bill.
Actual billed USD is unknown without billing evidence. Safe diagnostics retain
HTTP status, public model metadata, bounded token counts, hashes, timing and
separate native-validator ledger stages, never headers, provider error bodies,
prompt text, raw output or arbitrary errors.

An HTTP 200 response is not approval of its plan. Original provider usage,
candidate-plan, synthetic scope and capability checks may still reject it.
Such rejection must be reported without regeneration.

## Reproducible unpaid checks

`tests/release/oneShotTransport.test.ts` checks exact-prompt refusals, immutable
one-attempt semantics across re-instantiation/unknown outcomes, safe diagnostics,
redirect rejection and stale/zero pricing rejection using injected mock sends.

`tests/release/synthetic_pilot_postgres.ts --one-shot-offline` exercises the
same single-request ledger and numeric objective on real development PG using
only loopback HTTP, with restart/idempotency and tenant/privilege negatives.

The live result, if attempted, is written separately to
`.local/sam-dev/synthetic-pilot-live-acceptance.json`. Capture evidence before
dropping only test-created DB resources. Existing autonomy object identities
are checked unchanged. Production launcher TLS remains separately blocked on
the current development transport.
